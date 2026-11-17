import { audioCache } from './audio-cache.js?build=16c84b470c45';
import { defaultConnections, migrateConnectionPrefs } from './connection-settings.js?build=16c84b470c45';
import { nextTrackIndex, waveformLightFactor, initialLight, lightAt } from './playback-policy.js?build=16c84b470c45';
// wav2api player — the page. The Rust/WASM module owns fetch + Web Audio;
// everything below owns layout, state projection and the "拆开看看" reveal.

import init, {
  wav2api_version,
  wav2api_start,
  wav2api_set_cache_key,
  wav2api_pause,
  wav2api_resume,
  wav2api_stop,
  wav2api_seek,
  wav2api_set_volume,
  wav2api_set_speed,
  wav2api_set_chunk_limit,
  wav2api_set_session,
  wav2api_set_direction,
  wav2api_set_local_network_access,
  wav2api_set_ended_callback,
  wav2api_set_muted,
  wav2api_snapshot,
  wav2api_spectrum,
  wav2api_level,
  wav2api_waveform,
  wav2api_probe,
} from './pkg/wav2api_player.js?build=16c84b470c45';

const $ = (id) => document.getElementById(id);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const LS_KEY = 'wav2api.prefs.v3';
const AUDIO_EXT = /\.(mp3|flac|wav|m4a|aac|ogg)$/i;
const WAV2API_PROVIDER_ID = 'wav2api';
const WAV2API_MODEL_PREFIX = `${WAV2API_PROVIDER_ID}/`;
const MAX_ROWS = 400;
const PLATTER_DRAG_THRESHOLD_PX = 7;
const PLATTER_SPEED_UPDATE_MS = 80;
const PLATTER_DIRECTION_DEADBAND = 0.08;
const PLATTER_MAX_SPEED = 2;
const PLATTER_RETURN_TAU_MS = 180;
const PLATTER_RETURN_DURATION_MS = 650;
const PLATTER_STILL_TIMEOUT_MS = 180;
const PASSWORD_TYPE = ['pass', 'word'].join('');

const DEFAULTS = {
  playbackMode: 'loop',
  route: 'magpie',
  ...defaultConnections(location.origin),
  key: '',
  localNetworkAccess: false,
  rememberKey: false,
  volume: 0.85,
  muted: false,
  lastTrack: '',
};

const S = {
  prefs: { ...DEFAULTS },
  route: 'magpie',
  catalogBase: DEFAULTS.catalogBase,
  playBase: DEFAULTS.magpieBase,
  key: '',
  localNetworkAccess: false,
  localNetworkReady: false,
  rememberKey: false,
  volume: DEFAULTS.volume,
  muted: false,
  renderLimit: MAX_ROWS,

  cacheEntries: [],
  cacheIds: new Map(),
  cacheCaptureRefs: new Map(),
  cacheCaptureIds: new Set(),
  cacheReadFailed: false,
  offlineCatalog: false,
  cacheRefresh: 0,
  catalog: [],
  catalogById: new Map(),
  playable: [],
  playableById: new Map(),
  extra: [],
  modelsMeta: { total: 0, ours: 0, extra: 0 },
  catalogOk: true,

  filter: 'audio',
  query: '',
  completedSession: '',
  playbackMode: 'loop',
  smartGroups: [],
  current: null,
  currentKey: '',
  pendingOffset: 0,
  snapshot: null,
  lastState: 'idle',
  scrollToCurrent: false,
  motionOverride: false,
  seekDragging: false,
  platterGesture: null,
  lastBadgeKey: '',

  test: new Map(),
  testing: false,
  testStop: false,
  testRun: null,

  collapsed: new Set(),
  bufferHistory: [],
  coverCache: new Map(),
  coverFailed: new Set(),
  procCache: new Map(),
  peakHold: 0,
  needleColor: [235, 245, 255],
  needleStrength: .7,
  needleTrace: [],
  needleTraceAt: 0,
  needleMediaPosition: null,
  lastVisualRotation: null,
  wireSamples: [],

  revealOpen: false,
  revealTab: 'request',
  loading: false,
  connectionError: false,
  uiErrorMessage: '',
  uiErrorHttp: 0,
  cacheFailureOperation: '',
  cacheFailureMessage: '',
  cacheFailureType: '',
  cacheFailureReference: '',
  cacheFailureBytesWritten: 0,
  uiErrorRefreshCatalog: false,
  refreshSequence: 0,
  refreshController: null,
  lastChainAt: 0,
  lastStatsAt: 0,
  lastBufferAt: 0,
  lastVisualAt: 0,
  lastTitle: '',
  booted: false,
};

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const escAttr = esc;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function platterTurnSeconds() {
  const vinyl = $('vinyl');
  return vinyl ? Number(getComputedStyle(vinyl).getPropertyValue('--record-turn-seconds')) || 9 : 9;
}

function platterAngleForPosition(position) {
  return (Number(position) || 0) / platterTurnSeconds() * 360;
}

function unwrapAngleDelta(current, previous) {
  let delta = current - previous;
  if (delta > Math.PI) delta -= Math.PI * 2;
  else if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

function normalizeBase(input) {
  let s = String(input || '').trim().replace(/\/+$/, '');
  if (!s) s = DEFAULTS.catalogBase;
  if (s.endsWith('/chat/completions')) s = s.slice(0, -'/chat/completions'.length);
  if (!s.endsWith('/v1')) s += '/v1';
  return s;
}

function originOf(base) {
  try { return new URL(base, location.href).origin; } catch { return ''; }
}

function routeKey() {
  return S.route === 'magpie' ? S.key : '';
}

function routeName() {
  return S.route === 'magpie' ? 'Magpie' : '直连';
}

function routeBase(route) {
  return normalizeBase(route === 'magpie' ? S.prefs.magpieBase : S.prefs.directBase);
}

function basename(p) {
  return String(p || '').split(/[\\/]/).pop() || '';
}

function dirOf(p) {
  const parts = String(p || '').split('/').filter(Boolean);
  return parts.length > 1 ? parts.slice(0, -1).join(' / ') : '根目录';
}

function stripExt(s) {
  return String(s || '').replace(AUDIO_EXT, '');
}

function extOf(p) {
  const m = String(p || '').match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toUpperCase() : '';
}

function clean(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function splitDisplay(name) {
  const s = clean(name);
  const m = s.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  return m ? { artist: m[1].trim(), title: m[2].trim() } : { artist: '', title: s };
}

function norm(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function stripFirstSegment(id) {
  const i = String(id || '').indexOf('/');
  return i >= 0 ? id.slice(i + 1) : id;
}

function fmtTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '--:--';
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h
    ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-US');
}

function fmtBytes(n) {
  const v = Number(n || 0);
  if (v >= 1024 * 1024) return `${(v / 1024 / 1024).toFixed(2)} MB`;
  if (v >= 1024) return `${(v / 1024).toFixed(1)} KB`;
  return `${v} B`;
}

function fmtMs(n) {
  if (!Number.isFinite(n) || n <= 0) return '—';
  return n < 1 ? '<1ms' : `${Math.round(n)}ms`;
}

function fmtDb(rms) {
  if (!(rms > 0.00003)) return '-∞ dB';
  return `${(20 * Math.log10(rms)).toFixed(1)} dB`;
}

function toast(message, kind = '') {
  const host = $('toasts');
  if (!host) return;
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = message;
  host.appendChild(el);
  while (host.children.length > 3) host.firstElementChild?.remove();
  setTimeout(() => el.remove(), 3800);
}

function readSnapshot() {
  try {
    return JSON.parse(wav2api_snapshot());
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// preferences
// ---------------------------------------------------------------------------


// Cache state is a persistent source, independent of Web Audio's scheduled queue.
function cacheKeyFor(track) {
  if (!track || track.isGroup || track.isExtra) return '';
  return track.storedCacheKey || audioCache.keyFor(S.catalogBase, WAV2API_PROVIDER_ID, track.id, track.revision);
}

function cachedTrack(entry) {
  if (!S.cacheIds.has(entry.key)) S.cacheIds.set(entry.key, `local-cache-${S.cacheIds.size}`);
  return {
    id: entry.trackId, key: S.cacheIds.get(entry.key), playId: entry.trackId || 'local-cache',
    title: entry.title || '本机缓存曲目', display_name: entry.title || '本机缓存曲目',
    artist: entry.artist || '', path: entry.path || '', duration: entry.duration || 0,
    revision: entry.revision || '', ext: extOf(entry.path), cachedOnly: true,
    storedCacheKey: entry.key,
  };
}

function applyCachedFallback() {
  const locals = S.cacheEntries.filter(entry => entry.state === 'complete').map(cachedTrack);
  const remote = S.playable.filter(track => !track.cachedOnly);
  const known = new Set(remote.map(cacheKeyFor).filter(Boolean));
  S.playable = [...remote, ...locals.filter(track => !known.has(track.storedCacheKey))];
  S.playableById = new Map(S.playable.map(track => [track.key, track]));
  S.modelsMeta.ours = S.playable.length;
  S.modelsMeta.total = S.playable.length + S.extra.length;
  $('offlineCacheNote').hidden = false;
  $('offlineCacheNote').textContent = '远端列表未完整刷新。本机缓存快照可从“本机缓存”打开；元数据可能陈旧。';
}

function updateCacheSource(snap = S.snapshot) {
  const key = cacheKeyFor(S.current);
  const entry = S.cacheEntries.find(item => item.key === key);
  const reportedSource = snap?.state === 'idle' ? '' : snap?.cache_source;
  const cacheReference = key ? audioCache.referenceForKey(key) : '';
  const caching = !!cacheReference && (S.cacheCaptureRefs.get(cacheReference) || 0) > 0;
  const source = { checking: '正在检查来源', cache: `本机缓存 · 已读取 ${fmtBytes(snap?.cache_bytes)}`, network: '远端网络' }[reportedSource] || '来源待确认';
  const available = !key ? '此路线无稳定缓存版本' : S.cacheReadFailed ? '缓存状态未确认' : entry?.state === 'complete' ? '整首已缓存' : entry ? '部分缓存 · 尚不可离线完整播放' : '尚未完整缓存';
  const status = caching ? '远端网络 · 缓存中' : `${source} · ${available}`;
  $('cacheSource').textContent = `${status}${!audioCache.isEnabled() && !caching ? ' · 缓存已关闭' : ''}`;
}

async function refreshCache() {
  const sequence = ++S.cacheRefresh;
  try {
    const [entries, usage] = await Promise.all([audioCache.list(), audioCache.usage()]);
    if (sequence !== S.cacheRefresh) return;
    S.cacheReadFailed = false;
    S.cacheEntries = entries;
    $('cacheEnabled').checked = audioCache.isEnabled();
    $('cacheBtn').textContent = `本机缓存 · ${usage.completeCount} 首`;
    $('cacheUsage').textContent = `持久缓存 ${fmtBytes(usage.audioBytes)} / 上限 ${fmtBytes(usage.cacheLimitBytes)} · 完整 ${usage.completeCount} / 部分 ${usage.partialCount} · 站点用量 ${usage.browserUsageBytes == null ? '未知' : fmtBytes(usage.browserUsageBytes)} / 配额 ${usage.browserQuotaBytes == null ? '未知' : fmtBytes(usage.browserQuotaBytes)}`;
    const canRequestPersistence = typeof navigator.storage?.persist === 'function';
    $('persistCache').disabled = usage.persistent || !canRequestPersistence;
    $('persistCache').textContent = usage.persistent ? '已获持久存储' : '申请持久存储';
    $('persistCache').title = usage.persistent
      ? '浏览器已为此站点授予持久存储'
      : canRequestPersistence ? '' : '当前浏览器环境不支持持久存储申请';
    $('persistenceHelp').textContent = usage.persistent
      ? '浏览器已为此站点授予持久存储。'
      : canRequestPersistence
        ? '本机缓存仍可能被浏览器回收；可以申请持久存储。'
        : '当前浏览器环境不支持申请持久存储。缓存仍可使用，但浏览器可能回收已保存内容。';
    $('clearCache').disabled = !entries.length;
    // Preserve focus and scroll while advisory playback events refresh counts.
    const signature = JSON.stringify(entries.map(e => [e.key, e.state, e.byteLength]));
    if ($('cacheEntries')._signature !== signature) {
      const focused = document.activeElement;
      const index = focused?.dataset.cacheIndex;
      const action = focused?.dataset.cacheAction;
      $('cacheEntries').innerHTML = entries.length ? entries.map((entry, i) => `<li><div><b>${esc(entry.title || '本机缓存曲目')}</b><small>${esc(entry.artist || '未知作者')} · ${entry.state === 'complete' ? '完整 · 可离线播放' : '部分 · 不可离线完整播放'} · ${fmtBytes(entry.byteLength)}</small></div><div class="cache-row-actions">${entry.state === 'complete' ? `<button type="button" class="btn small" data-cache-index="${i}" data-cache-action="play">播放</button>` : ''}<button type="button" class="btn ghost small" data-cache-index="${i}" data-cache-action="delete" aria-label="删除 ${escAttr(entry.title || '缓存曲目')}">删除</button></div></li>`).join('') : '<li>尚无缓存。开启后完整播放一首即可保存。</li>';
      $('cacheEntries')._signature = signature;
      if (index != null) $('cacheEntries').querySelector(`[data-cache-index="${index}"][data-cache-action="${action}"]`)?.focus();
    }
    updateCacheSource();
  } catch (error) {
    S.cacheReadFailed = true;
    $('cacheUsage').textContent = '未能读取缓存清单或占用；远端播放仍可使用。';
    $('cacheEntries').textContent = '清单不可用；上次状态尚未确认。';
    $('cacheEntries')._signature = null;
    $('persistenceHelp').textContent = '未能确认浏览器的持久存储能力；缓存状态尚未确认。';
    cacheNotice('未能读取本机缓存清单；请检查浏览器站点存储设置。', error, 'read');
    updateCacheSource();
  }
}

function redactDiagnostic(value) {
  return String(value).replace(/https?:\/\/[^\s"'<>]+/gi, '[redacted]')
    .replace(/(?:Bearer\s+|(?:api[_-]?key|authorization|cookie|session(?:_id)?|token|cacheKey)\s*[:=]\s*)[^\s,;]+/gi, '[redacted]')
    .replace(/(?:[A-Za-z]:[\\/]|\/)[^\s"'<>]+/g, '[redacted]')
    .replace(/\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi, '[redacted]')
    .replace(/\b[\da-f]{8}-[\da-f-]{27,}\b/gi, '[redacted]')
    .replace(/[A-Za-z0-9+/=_-]{48,}/g, '[redacted]').slice(0, 1200);
}

function diagnosticText(action) {
  const snap = readSnapshot();
  // Allowlist structured fields; never copy raw requests, track IDs, sessions or PCM.
  return JSON.stringify({ build: window.wav2apiBoot?.build || 'unknown', time: new Date().toISOString(),
    browser: navigator.userAgent, action, route: S.current?.cachedOnly ? 'local-cache-snapshot' : S.route,
    state: snap?.state, http: action === 'playback' ? S.uiErrorHttp : snap?.http_status, retry: snap?.retry_attempt,
    cacheSource: snap?.cache_source, cacheEnabled: audioCache.isEnabled(),
    errorMessage: redactDiagnostic(action === 'playback' ? S.uiErrorMessage || snap?.error || '' : S.cacheFailureMessage || ''),
    errorOperation: action === 'cache' ? S.cacheFailureOperation || undefined : undefined,
    errorType: action === 'cache' ? S.cacheFailureType || undefined : undefined,
    cacheReference: action === 'cache' ? S.cacheFailureReference || undefined : undefined,
    cacheBytesWritten: action === 'cache' && S.cacheFailureBytesWritten ? S.cacheFailureBytesWritten : undefined,
    errorCategory: action === 'playback' ? 'playback-or-catalog-failed' : 'cache-operation-failed',
  }, null, 2);
}

async function copyDiagnostic(action) {
  const text = diagnosticText(action);
  try { await navigator.clipboard.writeText(text); toast('脱敏诊断已复制', 'ok'); }
  catch {
    $('diagnosticText').value = text;
    $('diagnosticText').hidden = false;
    if (!$('cacheDialog').open) $('cacheDialog').showModal();
    $('diagnosticText').focus(); $('diagnosticText').select();
  }
}

function clearCacheNotice() {
  $('cacheNotice').hidden = true;
  $('cacheNoticeText').textContent = '';
  $('diagnosticText').hidden = true;
  $('diagnosticText').value = '';
  S.cacheFailureOperation = '';
  S.cacheFailureMessage = '';
  S.cacheFailureType = '';
  S.cacheFailureReference = '';
  S.cacheFailureBytesWritten = 0;
}

function cacheNotice(message, error, operation = 'unknown', reference = '', bytesWritten = 0) {
  S.cacheFailureOperation = operation;
  S.cacheFailureMessage = redactDiagnostic(error?.message || message || '原因未确认');
  S.cacheFailureType = /^[A-Za-z]+Error$/.test(error?.name) ? error.name : undefined;
  S.cacheFailureReference = /^[A-Za-z0-9_-]{1,48}$/.test(reference) ? reference : '';
  S.cacheFailureBytesWritten = Math.max(0, Number(bytesWritten) || 0);
  const details = [S.cacheFailureType, error?.message && redactDiagnostic(error.message)].filter(Boolean).join('：');
  $('cacheNoticeText').textContent = details ? `${message} 原因：${details}` : message;
  $('cacheNotice').hidden = false;
}

function openCacheManager() {
  if (!$('cacheDialog').open) $('cacheDialog').showModal();
  void refreshCache();
}

function bindCacheUI() {
  $('cacheEnabled').checked = audioCache.isEnabled();
  $('cacheBtn').addEventListener('click', openCacheManager);
  $('manageCacheError').addEventListener('click', openCacheManager);
  $('manageCacheNotice').addEventListener('click', openCacheManager);
  $('cacheClose').addEventListener('click', () => $('cacheDialog').close());
  $('cacheDialog').addEventListener('click', event => { if (event.target === $('cacheDialog')) $('cacheDialog').close(); });
  $('cacheDialog').addEventListener('close', () => $('cacheBtn').focus());
  $('cacheEnabled').addEventListener('change', event => { audioCache.setEnabled(event.target.checked); });
  $('copyError').addEventListener('click', () => copyDiagnostic('playback'));
  $('copyCacheError').addEventListener('click', () => copyDiagnostic('cache'));
  $('dismissCacheNotice').addEventListener('click', clearCacheNotice);
  $('errorSettings').addEventListener('click', openSettings);
  const mutate = async (operation, fn) => {
    try { await fn(); await refreshCache();
      if (S.offlineCatalog) { applyCachedFallback(); renderCounts(); renderLibrary(); }
    } catch (error) {
      $('persistenceResult').textContent = `未能${operation}；请检查浏览器站点存储设置。`;
      cacheNotice(`未能${operation}；请检查浏览器站点存储设置。`, error, 'manage');
    }
  };
  $('clearCache').addEventListener('click', () => {
    if (confirm('清空本设备此站点的全部音频缓存？离线曲目将不可用；正在读取缓存的播放可能中断。')) void mutate('清空音频缓存', () => audioCache.clear());
  });
  $('persistCache').addEventListener('click', () => void mutate('申请持久存储', async () => {
    const accepted = await audioCache.requestPersistence();
    $('persistenceResult').textContent = accepted ? '浏览器已允许持久存储。' : '浏览器未授予持久存储；现有缓存仍可使用，但可能被回收。';
  }));
  $('cacheEntries').addEventListener('click', event => {
    const button = event.target.closest('[data-cache-action]');
    if (!button) return;
    const entry = S.cacheEntries[Number(button.dataset.cacheIndex)];
    if (!entry) return;
    if (button.dataset.cacheAction === 'play') {
      if (!audioCache.isEnabled()) { $('persistenceResult').textContent = '请先开启本机音频缓存，再播放缓存快照。'; return; }
      const track = cachedTrack(entry);
      if (!S.playableById.has(track.key)) { S.playable.push(track); S.playableById.set(track.key, track); }
      $('cacheDialog').close(); playTrack(track);
    } else void mutate('删除这首音频缓存', () => audioCache.deleteTrack(entry.key));
  });
  window.addEventListener('wav2api-cache-capture-start', event => {
    const detail = event.detail || {};
    if (!detail.captureId || !detail.cacheReference || S.cacheCaptureIds.has(detail.captureId)) return;
    S.cacheCaptureIds.add(detail.captureId);
    S.cacheCaptureRefs.set(detail.cacheReference, (S.cacheCaptureRefs.get(detail.cacheReference) || 0) + 1);
    clearCacheNotice();
    updateCacheSource();
  });
  window.addEventListener('wav2api-cache-capture-end', event => {
    const detail = event.detail || {};
    if (!S.cacheCaptureIds.delete(detail.captureId)) return;
    const remaining = Math.max(0, (S.cacheCaptureRefs.get(detail.cacheReference) || 0) - 1);
    if (remaining) S.cacheCaptureRefs.set(detail.cacheReference, remaining);
    else S.cacheCaptureRefs.delete(detail.cacheReference);
    if (detail.outcome === 'complete') clearCacheNotice();
    updateCacheSource();
    void refreshCache();
  });
  window.addEventListener('wav2api-cache-hit', () => { clearCacheNotice(); void refreshCache(); });
  window.addEventListener('wav2api-cache-complete', () => { clearCacheNotice(); void refreshCache(); });
  window.addEventListener('wav2api-cache-evicted', event => {
    const count = Math.max(0, Number(event.detail?.count) || 0);
    if (count) toast(`缓存空间不足，已淘汰最久未使用的 ${count} 首曲目。`, 'ok');
    void refreshCache();
  });
  for (const name of ['partial', 'state', 'updated']) window.addEventListener(`wav2api-cache-${name}`, () => void refreshCache());
  window.addEventListener('wav2api-cache-error', event => {
    const detail = event.detail || {};
    cacheNotice(
      detail.operation === 'read'
        ? '未能读取本地缓存，已改用远端音频；播放结果见播放状态。'
        : Number(detail.bytesWritten) > 0
          ? '本次未能保存整首缓存；部分音频已写入浏览器存储，远端播放不受影响。'
          : '本次缓存写入未完成；已保存的其他曲目不受影响，远端播放继续。',
      detail.error,
      detail.operation === 'read' ? 'read' : 'write',
      detail.cacheReference,
      detail.bytesWritten,
    );
    void refreshCache();
  });
}

function loadPrefs() {
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch { /* ignore */ }
  S.prefs = { ...DEFAULTS, ...migrateConnectionPrefs(stored, location.origin) };
  // The old preference expanded thousands of rows in one render. Pagination
  // replaces it; retain the remaining preferences and discard this key.
  delete S.prefs.showAll;
  S.route = S.prefs.route === 'direct' ? 'direct' : 'magpie';
  S.rememberKey = !!S.prefs.rememberKey;
  S.localNetworkAccess = !!S.prefs.localNetworkAccess;
  S.localNetworkReady = false;
  wav2api_set_local_network_access(S.localNetworkAccess);
  S.key = S.rememberKey ? clean(S.prefs.key) : '';
  if (!S.rememberKey) delete S.prefs.key;
  try { localStorage.setItem(LS_KEY, JSON.stringify(S.prefs)); } catch { /* optional persistence */ }
  S.catalogBase = normalizeBase(S.prefs.catalogBase || DEFAULTS.catalogBase);
  S.playBase = routeBase(S.route);
  S.volume = clamp(Number(S.prefs.volume ?? DEFAULTS.volume), 0, 1);
  S.muted = !!S.prefs.muted;
  S.playbackMode = ['loop', 'single', 'shuffle'].includes(S.prefs.playbackMode) ? S.prefs.playbackMode : 'loop';
  S.renderLimit = MAX_ROWS;
}

let saveTimer = 0;
function savePrefs() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    S.prefs.route = S.route;
    S.prefs.catalogBase = S.catalogBase;
    S.prefs.volume = S.volume;
    S.prefs.playbackMode = S.playbackMode;
    S.prefs.muted = S.muted;
    delete S.prefs.showAll;
    S.prefs.rememberKey = S.rememberKey;
    S.prefs.localNetworkAccess = S.localNetworkAccess;
    if (S.rememberKey) S.prefs.key = S.key;
    else delete S.prefs.key;
    try { localStorage.setItem(LS_KEY, JSON.stringify(S.prefs)); } catch { /* ignore */ }
  }, 120);
}

async function readDevKey() {
  try {
    const r = await fetch('/__gateway_key', { cache: 'no-store' });
    if (!r.ok) return '';
    return (await r.text()).trim();
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// models
// ---------------------------------------------------------------------------

async function fetchModels(base, key, { signal, localNetworkAccess = S.localNetworkAccess } = {}) {
  const url = `${normalizeBase(base)}/models`;
  const headers = {};
  if (key) headers.Authorization = `Bearer ${key}`;
  const ctrl = new AbortController();
  const cancel = () => ctrl.abort();
  if (signal?.aborted) cancel();
  else signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => ctrl.abort(), 10000);
  const t0 = performance.now();
  try {
    const init = { headers, signal: ctrl.signal, cache: 'no-store' };
    if (localNetworkAccess && originOf(base) !== location.origin) init.targetAddressSpace = 'local';
    const r = await fetch(url, init);
    const ms = Math.round(performance.now() - t0);
    if (!r.ok) {
      let text = '';
      try { text = (await r.text()).slice(0, 300); } catch { /* ignore */ }
      const htmlError = /^\s*(?:<!doctype\s+html|<html\b)/i.test(text);
      const missingSameOriginApi = r.status === 404 && originOf(base) === location.origin && htmlError;
      const short = r.status === 401 ? '需要网关密钥'
        : missingSameOriginApi ? '等待连接本地服务' : `HTTP ${r.status}`;
      return {
        ok: false, ms,
        error: {
          status: r.status,
          short,
          message: missingSameOriginApi
            ? `播放器已加载，尚未连接音频服务。请打开连接设置，填写 PC 的 HTTPS 内网地址并点击“测试连接”。\n${url}`
            : `${short} · ${url}${text && !htmlError ? `\n${text}` : ''}`,
        },
      };
    }
    const data = await r.json();
    return { ok: true, ms, data: Array.isArray(data?.data) ? data.data : [] };
  } catch (e) {
    const ms = Math.round(performance.now() - t0);
    return {
      ok: false, ms,
      error: {
        status: 0,
        short: signal?.aborted ? '已取消' : ctrl.signal.aborted ? '请求超时' : '网络连接失败',
        message: ctrl.signal.aborted
          ? `${signal?.aborted ? '已取消旧请求' : '读取曲库超过 10 秒'} · ${url}`
          : `请求 ${url} 失败：${e?.message || e}\n${localNetworkAccess
            ? '请确认服务端 HTTPS 证书有效、浏览器已允许此站点访问本地网络、服务地址可达，且服务端已允许当前网页来源。'
            : originOf(base) === location.origin
              ? '这是同源请求，请检查网页服务到音频服务或网关的转发连接。'
              : '这是跨域请求；直接访问 Magpie 需网页来源白名单和网关密钥。'}`,

      },
    };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

function applyCatalog(rows) {
  const list = [];
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row.id !== 'string' || seen.has(row.id)) continue;
    seen.add(row.id);
    const path = String(row.path || row.id);
    const display = String(row.display_name || row.id);
    const parsed = splitDisplay(display);
    list.push({
      id: row.id,
      revision: clean(row.revision),
      key: row.id,
      display_name: display,
      artist: clean(row.artist) || parsed.artist,
      title: clean(row.title) || parsed.title || stripExt(basename(path)),
      path,
      duration: Number.isFinite(Number(row.duration)) ? Number(row.duration) : 0,
      ext: extOf(path),
      playId: row.id,
    });
  }
  S.catalog = list;
  S.catalogById = new Map(list.map((t) => [t.id, t]));
}

function applyPlayable(rows) {
  S.smartGroups = rows.filter((row) => /^group\/zz-wav2api-/.test(row.id || '')).map((row) => ({
    id: row.id, key: row.id, playId: row.id, isGroup: true,
    title: row.display_name || row.id.replace('group/zz-wav2api-', ''),
    display_name: row.display_name || row.id, artist: 'Magpie 智能选择', path: '', duration: 0,
  }));
  const groupList = $('smartGroups');
  if (groupList) groupList.innerHTML = S.smartGroups.map((group) =>
    `<button type="button" class="chip" data-smart-group="${escAttr(group.id)}">${esc(group.title)}</button>`).join('');
  const playable = [];
  const extra = [];
  const seen = new Set();
  const catalogTracks = new Set();
  const byDisplay = new Map(S.catalog.map((t) => [norm(t.display_name), t]));

  for (const row of rows) {
    if (!row || typeof row.id !== 'string' || seen.has(row.id)) continue;
    seen.add(row.id);
    const id = row.id;
    const owned = row.owned_by === WAV2API_PROVIDER_ID;
    const stripped = stripFirstSegment(id);

    let cat = S.catalogById.get(id) || (stripped !== id ? S.catalogById.get(stripped) : null);
    if (!cat) {
      const display = clean(row.display_name) || id;
      cat = byDisplay.get(norm(display)) || null;
    }

    const isWav2ApiModel = owned || id.startsWith(WAV2API_MODEL_PREFIX);
    const ours = !!cat || isWav2ApiModel || AUDIO_EXT.test(id);
    if (!ours) {
      const display = String(row.display_name || id);
      const parsed = splitDisplay(display);
      extra.push({
        id,
        key: `x:${id}`,
        playId: id,
        display_name: display,
        artist: parsed.artist,
        title: parsed.title || id,
        path: String(row.path || id),
        duration: 0,
        ext: '',
        isExtra: true,
      });
      continue;
    }

    if (cat) {
      if (catalogTracks.has(cat.id)) continue;
      catalogTracks.add(cat.id);
      // Magpie can retain a flat or stale alias; the Provider's relative path is authoritative.
      const playId = S.route === 'magpie' && isWav2ApiModel
        ? `${WAV2API_MODEL_PREFIX}${cat.id}`
        : id;
      playable.push({ ...cat, key: cat.id, playId, available: true });
    } else {
      if (S.route === 'magpie' && S.catalogOk && isWav2ApiModel) continue;
      const path = String(row.path || stripped || id);
      const display = String(row.display_name || basename(path));
      const parsed = splitDisplay(display);
      playable.push({
        id: stripped || id,
        key: `m:${id}`,
        playId: id,
        display_name: display,
        artist: parsed.artist,
        title: parsed.title || stripExt(basename(path)),
        path,
        duration: 0,
        ext: extOf(path),
        available: true,
      });
    }
  }

  if (S.route === 'magpie' && S.catalogOk) {
    // The Provider catalog is the complete library; Magpie's key-filtered list may be smaller.
    for (const track of S.catalog) {
      if (catalogTracks.has(track.id)) continue;
      catalogTracks.add(track.id);
      playable.push({
        ...track,
        key: track.id,
        playId: `${WAV2API_MODEL_PREFIX}${track.id}`,
        available: true,
      });
    }
  }

  const order = new Map(S.catalog.map((t, i) => [t.id, i]));
  playable.sort((a, b) => {
    const ai = order.has(a.key) ? order.get(a.key) : 1e9;
    const bi = order.has(b.key) ? order.get(b.key) : 1e9;
    return ai - bi;
  });

  S.playable = playable;
  S.playableById = new Map(playable.map((t) => [t.key, t]));
  S.extra = extra;
  S.modelsMeta = {
    total: Math.max(rows.length, playable.length + extra.length),
    ours: playable.length,
    extra: extra.length,
  };
}

async function refreshAll({ initial = false } = {}) {
  S.refreshController?.abort();
  const controller = new AbortController();
  const sequence = ++S.refreshSequence;
  S.refreshController = controller;
  const catalogBase = S.catalogBase, playBase = S.playBase, key = routeKey();
  if (S.localNetworkAccess && !S.localNetworkReady) {
    S.loading = false;
    S.offlineCatalog = true;
    await refreshCache(); applyCachedFallback(); renderCounts(); renderLibrary();
    setConn('warn', '请在连接设置中测试并授权内网连接');
    return false;
  }
  S.loading = true;
  setConn('warn', initial ? '连接中…' : '刷新曲库…');
  const t0 = performance.now();
  try {
    const same = normalizeBase(playBase) === normalizeBase(catalogBase);
    const [cat, fetchedPlay] = await Promise.all([
      fetchModels(catalogBase, '', { signal: controller.signal }),
      same ? Promise.resolve(null) : fetchModels(playBase, key, { signal: controller.signal }),
    ]);
    if (sequence !== S.refreshSequence || controller.signal.aborted) return false;
    const play = same ? cat : fetchedPlay;
    S.connectionError = !play.ok;
    S.catalogOk = cat.ok;
    if (cat.ok) applyCatalog(cat.data);
    else applyCatalog([]);
    S.offlineCatalog = !cat.ok || !play.ok;
    $('offlineCacheNote').hidden = cat.ok && play.ok;
    if (play.ok) {
      applyPlayable(play.data);
      const ms = Math.round(performance.now() - t0);
      // The chip stays short enough to read at a glance; how many non-audio
      // models were filtered out belongs to the library footer, where the
      // filtering itself is being explained.
      setConn(
        S.playable.length ? 'ok' : 'warn',
        S.playable.length
          ? `${S.playable.length} 首 · ${routeName()} · ${ms}ms`
          : `${routeName()} 没有吐出 wav2api 曲目`,
      );
      if (!S.playable.length) {
        showError(
          `${routeName()} 的 /v1/models 里没有可识别的音频曲目。\n` +
          '若用 Magpie：检查播放器 Gateway Key 是否允许 wav2api/*，并确认曲库 Provider 端点可用。',
        );
      } else {
        clearError();
      }
    } else {
      S.playable = []; S.playableById.clear(); S.extra = [];
      setConn('err', play.error.short);
      if (cat.ok) {
        // The catalog is visible, but playback cannot be trusted on this route.
        applyPlayable([]);
      }
      showError(play.error.message, { status: play.error.status });
    }

    await refreshCache();
    if (sequence !== S.refreshSequence || controller.signal.aborted) return false;
    if (!cat.ok || !play.ok) applyCachedFallback();
    renderCounts();
    renderLibrary();
    updateRouteUI();
    updateCurrentUI();
    if (S.booted && cat.ok && play.ok) toast('曲库已刷新', 'ok');
    return true;
  } finally {
    if (sequence === S.refreshSequence) {
      S.loading = false;
      S.refreshController = null;
    }
  }
}

// ---------------------------------------------------------------------------
// library rendering
// ---------------------------------------------------------------------------

function visibleTracks() {
  let list;
  if (S.filter === 'passed') {
    list = S.playable.filter((t) => S.test.get(t.key)?.state === 'ok');
  } else if (S.filter === 'all') {
    list = [...S.playable, ...S.extra];
  } else {
    list = [...S.playable];
  }
  const q = S.query.trim().toLowerCase();
  if (q) {
    list = list.filter((t) => [t.title, t.artist, t.path, t.display_name]
      .some((v) => String(v || '').toLowerCase().includes(q)));
  }
  return list;
}

function groupedLibraryTracks(visible) {
  const groups = new Map();
  for (const track of visible) {
    const group = track.isExtra ? '__extra__' : dirOf(track.path);
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(track);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      if (a === '__extra__') return 1;
      if (b === '__extra__') return -1;
      return a.localeCompare(b, 'zh-Hans-CN');
    })
    .map(([group, items]) => {
      items.sort((a, b) => String(a.path).localeCompare(String(b.path), 'zh-Hans-CN', { numeric: true }));
      return {
        group,
        label: group === '__extra__' ? '其他模型 · 非音频协议' : group,
        items,
      };
    });
}

function testTitle(t) {
  const r = S.test.get(t.key);
  if (!r) return '未试音';
  if (r.state === 'testing') return '试音中…';
  if (r.state === 'ok') {
    return `可播放 · ${fmtMs(r.ms)} · ${r.rate ? `${(r.rate / 1000).toFixed(1)} kHz / ${r.channels} ch` : ''}`;
  }
  return `不可播放 · ${r.error || '未知错误'}`;
}

function renderLibrary() {
  const host = $('trackList');
  if (!host) return;
  const scrollTop = host.scrollTop;
  const visible = visibleTracks();
  const groups = groupedLibraryTracks(visible);

  let html = '';
  let shown = 0;
  let hasMore = false;

  for (const { group, label, items } of groups) {
    if (shown >= S.renderLimit) {
      hasMore = true;
      break;
    }
    const collapsed = S.collapsed.has(label);
    html += `<div class="group ${collapsed ? 'collapsed' : ''}">`;
    html += `<button type="button" class="group-head" data-group="${escAttr(label)}" aria-expanded="${!collapsed}">
      <svg class="icon chev"><use href="#i-chevron"/></svg>
      <svg class="icon"><use href="${group === '__extra__' ? '#i-cpu' : '#i-folder'}"/></svg>
      <span class="group-name">${esc(label)}</span>
      <span class="group-count">${items.length}</span>
    </button><ul class="group-list">`;

    for (const t of items) {
      if (shown >= S.renderLimit) {
        hasMore = true;
        break;
      }
      shown += 1;
      const test = S.test.get(t.key);
      // Extras are provably not ours, so they get their own hollow mark
      // rather than a ring that would read as "untested track".
      const state = t.isExtra ? 'text' : (test?.state || '');
      const stateTitle = t.isExtra ? '文本模型 · 不提供 audio.format' : testTitle(t);
      const isCur = S.currentKey === t.key;
      const dur = t.duration || test?.duration || 0;
      const title = t.title || t.display_name || t.id;
      const artist = t.artist || (t.isExtra ? (t.id.split('/')[0] || '非音频') : '');
      html += `<li class="track ${isCur ? 'is-current' : ''}" data-key="${escAttr(t.key)}">
        <button type="button" class="track-main" data-play="${escAttr(t.key)}" ${t.isExtra ? 'aria-disabled="true"' : ''} title="${escAttr(title)}">
          <span class="t-state" data-state="${escAttr(state)}" title="${escAttr(stateTitle)}"></span>
          <span class="t-title">${esc(title)}</span>
          <span class="t-artist">${esc(artist)}</span>
          <span class="t-dur">${t.isExtra ? '模型' : (dur ? fmtTime(dur) : '--:--')}</span>
        </button>
        <button type="button" class="t-test" data-test="${escAttr(t.key)}" ${t.isExtra ? 'disabled' : ''} aria-label="试音 ${escAttr(title)}" title="试音：发一次 probe 聊天补全">
          <svg class="icon"><use href="#i-flask"/></svg>
        </button>
      </li>`;
    }

    html += '</ul></div>';
    if (hasMore) break;
  }

  if (hasMore) {
    html += `<div class="list-more-note">为保持列表流畅，先显示 ${shown} 首；其余 ${visible.length - shown} 首仍可搜索。</div>`;
  }

  if (!visible.length) {
    if (!S.playable.length) {
      html = `<div class="empty"><b>没有可播放的曲目</b>检查顶部连接状态；经 Magpie 时先确认曲目已被暴露。</div>`;
    } else {
      html = `<div class="empty"><b>没有匹配的曲目</b>换个关键词，或把筛选切回「仅音频协议」。</div>`;
    }
  }

  host.innerHTML = html;
  host.scrollTop = scrollTop;
  const moreBtn = $('moreBtn');
  moreBtn.hidden = !hasMore;
  if (hasMore) {
    const nextBatch = Math.min(MAX_ROWS, visible.length - shown);
    moreBtn.textContent = visible.length - shown > MAX_ROWS
      ? `再显示 ${nextBatch} 首`
      : `显示剩余 ${nextBatch} 首`;
  }

  if (S.scrollToCurrent) {
    S.scrollToCurrent = false;
    const cur = host.querySelector('.track.is-current');
    // Scroll the list itself rather than calling scrollIntoView, which also
    // walks up and moves the page. offsetTop is relative to the nearest
    // positioned ancestor (.track is relative), so measure with rects.
    if (cur) {
      const hostTop = host.getBoundingClientRect().top;
      const top = cur.getBoundingClientRect().top - hostTop + host.scrollTop;
      const lowest = host.scrollTop + host.clientHeight - cur.offsetHeight - 4;
      if (top > lowest || top < host.scrollTop) {
        host.scrollTop = Math.max(0, top - host.clientHeight / 2);
      }
    }
  }
}

function findCurrentLibraryTrack() {
  const current = S.current;
  return S.playableById.get(S.currentKey)
    || S.playable.find((track) => (current?.path && track.path === current.path)
      || (current?.id && track.id === current.id)
      || (current?.display_name && norm(track.display_name) === norm(current.display_name)))
    || null;
}

function locateCurrentTrack() {
  const track = findCurrentLibraryTrack();
  if (!track) {
    toast('当前播放曲目尚未匹配到曲库条目。', 'err');
    return;
  }

  S.currentKey = track.key;
  S.filter = 'audio';
  S.query = track.path || track.id;
  S.renderLimit = MAX_ROWS;
  S.collapsed.delete(dirOf(track.path));
  $('search').value = S.query;
  $$('.chip').forEach((chip) => chip.classList.toggle('is-active', chip.dataset.filter === 'audio'));
  $('trackList').scrollTop = 0;
  S.scrollToCurrent = true;
  renderLibrary();
  renderCounts();
}

function motionPreferenceReduced() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches && !S.motionOverride;
}

function updateMotionOverrideUI() {
  const button = $('motionOverrideBtn');
  if (!button) return;
  const systemReducesMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overrideAvailable = systemReducesMotion && !S.motionOverride;
  button.hidden = !overrideAvailable;
  const note = $('motionNote');
  note.hidden = !overrideAvailable;
  note.textContent = '系统设置已减弱动画';
  button.textContent = '仍启用唱片动效';
  button.title = '仅为当前页面临时覆盖系统的减弱动效偏好';
}

function renderCounts() {
  const ours = S.playable.length;
  const passed = S.playable.filter((t) => S.test.get(t.key)?.state === 'ok').length;
  const tested = S.playable.filter((t) => S.test.has(t.key)).length;
  const all = ours + S.extra.length;
  const q = S.query.trim();
  const visible = visibleTracks();

  $('chipAudio').textContent = String(ours);
  $('chipPassed').textContent = String(passed);
  $('chipAll').textContent = String(all);
  $('libCount').textContent = S.filter === 'all' ? String(all) : String(ours);

  if (!S.testing) {
    const fail = Math.max(0, tested - passed);
    $('testStatus').textContent = tested
      ? `${tested}/${ours} · ✓${passed}${fail ? ` ✕${fail}` : ''}`
      : '未试音';
    $('testProgress').style.width = ours ? `${(tested / ours) * 100}%` : '0%';
    const allVisibleTested = visible.length > 0 && visible.every((t) => S.test.has(t.key));
    $('testAllText').textContent = allVisibleTested ? '重测全部' : '试音全部';
    $('testAllBtn').disabled = ours === 0;
  }

  const hidden = S.extra.length ? ` · 隐藏 ${S.extra.length} 个非音频模型` : '';
  const metaNote = S.offlineCatalog ? ' · 本机缓存快照的元数据可能陈旧' : '';
  const baseCount = S.filter === 'all' ? all : S.filter === 'passed' ? passed : ours;
  const shown = Math.min(visible.length, S.renderLimit);
  const hasMore = visible.length > shown;
  const rangeNote = hasMore
    ? q ? ` · 已显示 ${shown} 首，搜索覆盖当前筛选的全部结果` : ' · 可搜索未显示曲目'
    : '';
  $('libFoot').textContent = q
    ? `匹配 ${visible.length} 首${rangeNote}${hidden}${metaNote}`
    : `显示 ${shown} / ${baseCount}${rangeNote}${hidden}${metaNote}`;
}

// ---------------------------------------------------------------------------
// now playing projection
// ---------------------------------------------------------------------------

function setStateUI(state) {
  const map = {
    idle: { chip: 'STANDBY', live: 'STANDBY', cls: '' },
    connecting: { chip: 'HANDSHAKE', live: 'CONNECTING', cls: 'is-buffering' },
    retrying: { chip: '重连中', live: 'RETRYING', cls: 'is-buffering' },
    buffering: { chip: 'BUFFERING', live: 'BUFFERING', cls: 'is-buffering' },
    playing: { chip: 'PLAYING', live: 'LIVE', cls: 'is-playing' },
    paused: { chip: 'PAUSED', live: 'PAUSED', cls: 'is-paused' },
    ended: { chip: 'ENDED', live: 'ENDED', cls: '' },
    error: { chip: 'ERROR', live: 'ERROR', cls: 'is-error' },
  };
  const v = map[state] || map.idle;
  const deck = $('deck');
  deck.classList.remove('is-playing', 'is-paused', 'is-buffering', 'is-error');
  if (v.cls) deck.classList.add(v.cls);
  $('deckState').textContent = v.chip;
  const pill = $('livePill');
  pill.classList.remove('is-playing', 'is-paused', 'is-buffering', 'is-error');
  if (v.cls === 'is-playing') pill.classList.add('is-playing');
  else if (v.cls === 'is-paused') pill.classList.add('is-paused');
  else if (v.cls === 'is-buffering') pill.classList.add('is-buffering');
  else if (v.cls === 'is-error') pill.classList.add('is-error');
  $('liveText').textContent = v.live;

  const active = state === 'playing' || state === 'connecting' || state === 'buffering' || state === 'retrying';
  setPlayMode(active ? 'pause' : 'play');
  $('scopeState').textContent = {
    idle: 'NO SIGNAL',
    connecting: 'HANDSHAKE',
    retrying: '网络重连中',
    buffering: 'BUFFERING',
    playing: 'LIVE',
    paused: 'PAUSED',
    ended: 'ENDED',
    error: 'NO SIGNAL',
  }[state] || 'NO SIGNAL';
  $('deckHint').textContent = `WEB AUDIO · ${
    state === 'playing' ? '时钟运行中' : state === 'paused' ? '时钟暂停' : state === 'error' ? '时钟停止' : '等待时钟'
  }`;

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState =
        active ? 'playing' : state === 'paused' ? 'paused' : 'none';
    } catch { /* ignore */ }
  }
  updateTitle();
}

function setPlayMode(mode) {
  $('playBtn').dataset.mode = mode;
  $('playBtn').setAttribute('aria-label', mode === 'pause' ? '暂停' : '播放');
}

function updateTitle() {
  const name = S.current?.title || S.current?.display_name || '';
  const icon = S.snapshot?.state === 'playing' ? '▶ ' : '';
  const next = name ? `${icon}${name} · wav2api` : 'wav2api · 模型协议播放器';
  if (next !== S.lastTitle) {
    S.lastTitle = next;
    document.title = next;
  }
}

function renderPath(path) {
  const parts = String(path || '').split('/').filter(Boolean);
  if (!parts.length) return '—';
  return parts.map((p, i) => {
    const last = i === parts.length - 1;
    return `<span class="${last ? '' : 'dim'}">${esc(p)}</span>`;
  }).join('<span class="dim"> / </span>');
}

function renderBadges(track, snap) {
  if (!track) return;
  const ext = track.ext || extOf(track.path) || 'AUD';
  const modelId = track.playId || track.id || '';
  const rate = snap?.rate || 0;
  const channels = snap?.channels || 0;
  const key = `${ext}|${modelId}|${track.duration}|${rate}|${channels}`;
  if (key === S.lastBadgeKey) return;
  S.lastBadgeKey = key;

  const bits = [
    `<span class="badge hot">${esc(ext)}</span>`,
    `<span class="badge" title="模型 id：${escAttr(modelId)}">MODEL</span>`,
  ];
  if (rate) {
    bits.push(`<span class="badge cool">${(rate / 1000).toFixed(1)} kHz</span>`);
    bits.push(`<span class="badge">${channels} ch</span>`);
    bits.push('<span class="badge">16 bit</span>');
    bits.push('<span class="badge">s16le</span>');
  } else if (track.duration) {
    bits.push(`<span class="badge">${fmtTime(track.duration)}</span>`);
  }
  $('formatBadges').innerHTML = bits.join('');
  $('nowBadges').innerHTML = bits.join('');
}

function setImmediateTrackUI(track) {
  if (!track) {
    $('locateCurrentBtn').hidden = true;
    $('deckTitle').textContent = '未选择曲目';
    $('deckArtist').textContent = '从右侧曲库选一首，或按播放';
    $('nowTitle').textContent = '选一首，按下播放';
    $('nowArtist').textContent = '它看起来像播放器，背地里在请求聊天补全。';
    $('nowPath').innerHTML = '—';
    $('formatBadges').innerHTML = '<span class="badge">等待音频格式</span>';
    $('nowBadges').innerHTML = '';
    $('timeTotal').textContent = '--:--';
    return;
  }
  $('deckTitle').textContent = track.title || track.display_name;
  $('deckArtist').textContent = track.cachedOnly ? `${track.artist || '未知作者'} · 本机缓存快照（元数据可能陈旧）` : track.artist || '未知作者';
  $('nowTitle').textContent = track.title || track.display_name;
  $('nowArtist').textContent = track.artist || '未知作者';
  $('nowPath').innerHTML = renderPath(track.path);
  $('nowPath').title = track.path;
  $('locateCurrentBtn').hidden = !findCurrentLibraryTrack();
  renderBadges(track, S.snapshot);
  $('timeTotal').textContent = track.duration ? fmtTime(track.duration) : '--:--';
  loadCover(track);
  updateMediaSession(track);
  updateTitle();
}

function setSeekUI(pos, dur, buffered) {
  const total = dur > 0 ? dur : (S.current?.duration || 0);
  const p = total > 0 ? clamp(pos, 0, total) : Math.max(0, pos);
  const playedPct = total > 0 ? (p / total) * 100 : 0;
  const bufferSeconds = Math.max(0, buffered || 0) * (S.snapshot?.speed || 1);
  const reverse = Number(S.snapshot?.direction) < 0;
  const bufferStart = total > 0 ? clamp(reverse ? p - bufferSeconds : p, 0, total) : 0;
  const bufferEnd = total > 0 ? clamp(reverse ? p : p + bufferSeconds, 0, total) : 0;
  const bufferLeftPct = total > 0 ? (bufferStart / total) * 100 : 0;
  const bufferPct = total > 0 ? Math.max(0, ((bufferEnd - bufferStart) / total) * 100) : 0;

  $('seekPlayed').style.width = `${playedPct}%`;
  $('seekBuffer').style.left = `${bufferLeftPct}%`;
  $('seekBuffer').style.width = `${bufferPct}%`;
  $('seekThumb').style.left = `${playedPct}%`;
  $('timeNow').textContent = fmtTime(p);
  $('timeTotal').textContent = total > 0 ? fmtTime(total) : '--:--';
  $('bufferLabel').textContent = `缓冲 ${Math.max(0, buffered || 0).toFixed(1)}s`;

  const range = $('seekRange');
  range.max = String(total > 0 ? total : 1);
  if (!S.seekDragging) range.value = String(p);
  range.setAttribute('aria-valuetext', `${fmtTime(p)} / ${total > 0 ? fmtTime(total) : '未知'}`);
}

function updateCurrentUI() {
  if (S.current) {
    setImmediateTrackUI(S.current);
    setSeekUI(S.snapshot?.position || 0, S.snapshot?.duration || S.current.duration || 0, 0);
  } else {
    setImmediateTrackUI(null);
  }
}

function showError(message, { status = S.snapshot?.http_status } = {}) {
  const box = $('errorBox');
  if (!box) return;
  S.uiErrorMessage = redactDiagnostic(message || '原因未确认');
  $('errorText').textContent = `未能${S.connectionError ? '刷新远端曲库' : '完成当前播放'}：${S.uiErrorMessage}`;
  status = Number(status);
  S.uiErrorHttp = status;
  S.uiErrorRefreshCatalog = (status === 422 && /cannot decode|probe failed/i.test(String(message)))
    || (status === 404 && /unknown track|removed from the model list/i.test(String(message)));
  $('retryBtn').hidden = ([400, 401, 403, 404, 405, 413, 415, 422].includes(status)
    || /unsupported|not supported|invalid|forbidden|unauthorized|不支持|无效|权限/i.test(String(message)))
    && !S.uiErrorRefreshCatalog;
  $('retryBtn').textContent = S.uiErrorRefreshCatalog ? '刷新曲库' : '重试';
  box.hidden = false;
  $('deck').classList.add('is-error');
}

function clearError() {
  const box = $('errorBox');
  if (box) box.hidden = true;
  S.uiErrorMessage = '';
  S.uiErrorHttp = 0;
  S.uiErrorRefreshCatalog = false;
  $('retryBtn').textContent = '重试';
  $('deck').classList.remove('is-error');
}

// ---------------------------------------------------------------------------
// cover art
// ---------------------------------------------------------------------------

function coverUrl(track) {
  const origin = originOf(S.catalogBase);
  if (!origin || track.cachedOnly) return '';
  return `${origin}/cover?id=${encodeURIComponent(track.id)}`;
}

function setArt(src) {
  $('labelArt').style.backgroundImage = src ? `url("${src}")` : '';
  S.needleColor = [235, 245, 255];
  if (!src) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if ($('labelArt').style.backgroundImage !== `url("${src}")`) return;
    try {
      const sample = document.createElement('canvas');
      sample.width = sample.height = 16;
      const context = sample.getContext('2d');
      context.drawImage(img, 0, 0, 16, 16);
      const pixels = context.getImageData(0, 0, 16, 16).data;
      let best = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
        const bright = Math.max(...rgb);
        const saturation = bright - Math.min(...rgb);
        const score = saturation * (bright / 255);
        if (score > best && pixels[i + 3] > 128) {
          best = score;
          S.needleColor = rgb.map((value) => Math.round(100 + value / bright * 155));
        }
      }
    } catch { /* Cross-origin artwork retains the white light fallback. */ }
  };
  img.src = src;
}

function loadCover(track) {
  if (!track) return;
  const cached = S.coverCache.get(track.key);
  if (cached) { setArt(cached); return; }

  const fallback = proceduralCover(track);
  setArt(fallback);

  if (S.coverFailed.has(track.key)) return;
  const url = coverUrl(track);
  if (!url) return;
  const img = new Image();
  img.onload = () => {
    S.coverCache.set(track.key, url);
    if (S.currentKey === track.key) setArt(url);
    updateMediaSession(track, url);
  };
  img.onerror = () => {
    S.coverFailed.add(track.key);
  };
  img.src = url;
}

function hashString(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function rand() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function proceduralCover(track) {
  const key = `p:${track.key}`;
  if (S.procCache.has(key)) return S.procCache.get(key);
  const seed = hashString(`${track.artist}|${track.title}|${track.id}`);
  const rand = mulberry32(seed);
  const hue = seed % 360;
  const hue2 = (hue + 38 + Math.floor(rand() * 60)) % 360;

  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = `hsl(${hue} 26% 9%)`;
  ctx.fillRect(0, 0, 512, 512);

  const g1 = ctx.createRadialGradient(150 + rand() * 120, 120 + rand() * 100, 10, 256, 256, 340);
  g1.addColorStop(0, `hsla(${hue} 78% 58% / .55)`);
  g1.addColorStop(.55, `hsla(${hue2} 62% 38% / .18)`);
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, 512, 512);

  ctx.save();
  ctx.translate(256, 256);
  ctx.rotate((rand() - .5) * .9);
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.arc(0, 0, 60 + i * 34 + rand() * 10, rand() * Math.PI * 2, rand() * Math.PI * 2 + .8);
    ctx.strokeStyle = `hsla(${i % 2 ? hue : hue2} 70% 64% / ${.05 + rand() * .1})`;
    ctx.lineWidth = 1 + rand() * 2;
    ctx.stroke();
  }
  ctx.restore();

  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    const x1 = rand() * 512;
    const y1 = rand() * 512;
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(rand() * 512, rand() * 512, rand() * 512, rand() * 512, rand() * 512, rand() * 512);
    ctx.strokeStyle = `hsla(${hue2} 80% 70% / ${.035 + rand() * .05})`;
    ctx.lineWidth = .7 + rand();
    ctx.stroke();
  }

  for (let i = 0; i < 160; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${rand() * .045})`;
    ctx.fillRect(rand() * 512, rand() * 512, 1.2, 1.2);
  }

  const initial = (track.title || track.display_name || '?').trim().charAt(0) || '?';
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.font = '170px "Palatino Linotype", "Songti SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, 256, 262);

  const data = c.toDataURL('image/png');
  S.procCache.set(key, data);
  return data;
}

// ---------------------------------------------------------------------------
// transport
// ---------------------------------------------------------------------------

function playTrack(track, offset = 0, { preserveSession = false } = {}) {
  if (!track) return;
  if (track.isExtra) {
    toast('这是文本模型，不提供 audio.format。点「仅音频协议」看曲目。', 'err');
    return;
  }
  if (track.cachedOnly && !audioCache.isEnabled()) {
    cacheNotice('未能播放本机缓存快照：缓存已关闭。请在缓存管理中开启后播放。', null, 'play');
    openCacheManager();
    return;
  }
  if (!track.playId) {
    toast('这首没有可用的播放 id', 'err');
    return;
  }
  abandonPlatterGesture();
  clearCacheNotice();
  // One song is one gateway session; seek and pause/resume keep the engine's ID.
  let session = preserveSession ? readSnapshot()?.session_id : '';
  if (!session) {
    const sessionBytes = crypto.getRandomValues(new Uint8Array(16));
    session = `wav2api-${Array.from(sessionBytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  }
  S.connectionError = false;
  wav2api_set_session(session, S.route === 'magpie');
  S.current = track;
  S.currentKey = track.key;
  S.snapshot = null;
  S.lastVisualRotation = null;
  S.needleMediaPosition = null;
  S.needleTrace = [];
  S.lastBadgeKey = '';
  S.pendingOffset = offset;
  S.prefs.lastTrack = track.key;
  savePrefs();
  clearError();
  setImmediateTrackUI(track);
  setStateUI('connecting');
  setSeekUI(offset, track.duration || 0, 0);
  try {
    const cacheKey = cacheKeyFor(track);
    audioCache.rememberTrack(cacheKey, track);
    wav2api_set_cache_key(cacheKey);
    updateCacheSource();
    wav2api_start(
      S.playBase,
      routeKey(),
      track.playId,
      track.display_name || '',
      track.artist || '',
      track.title || '',
      track.path || track.id,
      offset,
    );
  } catch (e) {
    showError(String(e));
    setStateUI('error');
    return;
  }
  S.scrollToCurrent = true;
  renderLibrary();
  updateRouteUI();
}

function togglePlay() {
  const initial = readSnapshot();
  if (initial) S.snapshot = initial;
  if (S.platterGesture?.wasPlaying && !S.platterGesture.failed) {
    const active = ['playing', 'connecting', 'buffering', 'retrying'].includes(initial?.state);
    abandonPlatterGesture({ restoreRate: true });
    if (active) {
      wav2api_pause();
      setStateUI('paused');
    } else {
      setStateUI('connecting');
    }
    return;
  }
  abandonPlatterGesture({ commitSeek: true, restoreRate: true });
  const live = readSnapshot();
  if (live) S.snapshot = live;
  const state = live?.state || S.snapshot?.state || 'idle';
  if (state === 'playing' || state === 'connecting' || state === 'buffering' || state === 'retrying') {
    wav2api_pause();
    setStateUI('paused');
    return;
  }
  if (!S.current) {
    const first = visibleTracks().find((t) => !t.isExtra) || S.playable[0];
    if (first) playTrack(first, 0);
    else toast('曲库为空，先检查连接', 'err');
    return;
  }
  if (state === 'paused' || state === 'error') {
    wav2api_resume();
    setStateUI('connecting');
    return;
  }
  if (state === 'ended') {
    playTrack(S.current, 0);
    return;
  }
  playTrack(S.current, S.pendingOffset || 0);
}

function stopPlayback() {
  abandonPlatterGesture();
  wav2api_stop();
  S.pendingOffset = 0;
  clearError();
  setStateUI('idle');
  setSeekUI(0, S.current?.duration || 0, 0);
}

function seekTo(seconds) {
  abandonPlatterGesture({ restoreRate: true });
  const live = readSnapshot();
  if (live) S.snapshot = live;
  const dur = live?.duration || S.current?.duration || 0;
  const pos = dur > 0 ? clamp(Number(seconds) || 0, 0, dur) : Math.max(0, Number(seconds) || 0);
  S.pendingOffset = pos;
  wav2api_seek(pos);
  setSeekUI(pos, dur, 0);
  const st = S.snapshot?.state;
  if (st === 'idle' || st === 'ended') setStateUI('paused');
}

function stepTrack(delta) {
  if (S.current?.isGroup && delta > 0) { playTrack({ ...S.current, path: '' }, 0); return; }
  const list = visibleTracks().filter((t) => !t.isExtra);
  if (!list.length) return;
  let idx = list.findIndex((t) => t.key === S.currentKey);
  if (idx < 0) idx = delta > 0 ? -1 : 0;
  const next = list[nextTrackIndex(list.length, idx, delta, S.playbackMode)];
  playTrack(next, 0);
}

function toggleMute() {
  S.muted = !S.muted;
  wav2api_set_muted(S.muted);
  updateVolumeUI();
  savePrefs();
}

function updatePlatterReadout(gesture = S.platterGesture) {
  const output = $('speedValue');
  const vinyl = $('vinyl');
  const baseSpeed = clamp(Number($('speed').value) || 1, 0.5, 2);
  let label = `${baseSpeed.toFixed(2)}×`;
  if (gesture?.phase === 'returning') {
    label = `回速 ${gesture.baseSpeed.toFixed(2)}×`;
  } else if (gesture?.dragging && !gesture.wasPlaying) {
    label = '静音定位';
  } else if (gesture?.dragging && gesture.boundaryReached && gesture.direction < 0) {
    label = '缓存边界';
  } else if (gesture?.dragging && gesture.waitingForBuffer) {
    const requested = gesture.currentRate || 0;
    label = Math.abs(requested) < PLATTER_DIRECTION_DEADBAND
      ? '等待缓冲'
      : `待播 ${requested < 0 ? '−' : '+'}${Math.abs(requested).toFixed(2)}×`;
  } else if (gesture?.dragging) {
    const rate = gesture.currentRate || 0;
    label = Math.abs(rate) < PLATTER_DIRECTION_DEADBAND
      ? '停盘 0×'
      : `${rate < 0 ? '倒放 −' : '刮碟 +'}${Math.abs(rate).toFixed(2)}×`;
  }
  output.textContent = label;
  output.setAttribute('aria-label', `当前唱片控制状态：${label}`);
  vinyl.setAttribute('aria-label', `唱片控制区，${label}。${$('platterHelp').textContent}`);
}

function setBaseSpeed(value) {
  const speed = clamp(Number(value) || 1, 0.5, 2);
  $('speed').value = String(speed);
  if (S.platterGesture?.active) {
    S.platterGesture.baseSpeed = speed;
    if (!S.platterGesture.wasPlaying && S.platterGesture.phase !== 'returning') {
      try {
        wav2api_set_speed(speed);
        S.platterGesture.engineSpeed = speed;
      } catch (error) { toast(`调速失败：${error}`, 'err'); }
    }
    updatePlatterReadout();
    return;
  }
  try {
    wav2api_set_speed(speed);
    updatePlatterReadout(null);
  } catch (error) {
    toast(`调速失败：${error}`, 'err');
  }
}

function platterPointerAngle(event) {
  const stage = $('recordStage');
  const rect = stage.getBoundingClientRect();
  return Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2));
}

function applyPlatterRate(rate, gesture) {
  if (gesture.failed) return;
  const magnitude = Math.abs(rate);
  const nextDirection = rate < 0 ? -1 : 1;
  if (magnitude < PLATTER_DIRECTION_DEADBAND) {
    if (!gesture.pausedForScratch) wav2api_pause();
    gesture.pausedForScratch = true;
    gesture.speed = 0;
    gesture.currentRate = 0;
    gesture.lastEngineUpdate = performance.now();
    updatePlatterReadout(gesture);
    return;
  }
  if (gesture.boundaryReached && nextDirection < 0) {
    gesture.speed = 0;
    gesture.currentRate = 0;
    updatePlatterReadout(gesture);
    return;
  }

  const snapshot = readSnapshot() || S.snapshot;
  const needsResume = gesture.pausedForScratch
    || (snapshot?.state === 'paused' && snapshot.stream_done)
    || gesture.boundaryReached;
  const speed = clamp(magnitude, 0.1, PLATTER_MAX_SPEED);
  const directionChanged = nextDirection !== gesture.direction;
  try {
    if (directionChanged) {
      wav2api_set_direction(nextDirection);
      gesture.direction = nextDirection;
      gesture.boundaryReached = false;
    }
    if (needsResume) wav2api_resume();
    if (Math.abs(speed - gesture.engineSpeed) >= 0.035
      && (directionChanged || performance.now() - gesture.lastEngineUpdate >= PLATTER_SPEED_UPDATE_MS)) {
      wav2api_set_speed(speed);
      gesture.engineSpeed = speed;
      gesture.lastEngineUpdate = performance.now();
    } else if (directionChanged) {
      gesture.lastEngineUpdate = performance.now();
    }
    gesture.pausedForScratch = false;
    gesture.speed = speed;
    gesture.currentRate = nextDirection * speed;
    updatePlatterReadout(gesture);
  } catch (error) {
    gesture.failed = true;
    gesture.currentRate = 0;
    showError(`唱片控制失败：${error}`);
    updatePlatterReadout(gesture);
  }
}

function beginPlatterGesture(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  if (!S.current || $('settingsDialog').open || $('cacheDialog').open) return;
  if (S.platterGesture?.phase === 'returning') S.platterGesture = null;
  if (S.platterGesture) return;
  const snapshot = readSnapshot() || S.snapshot || {};
  const state = snapshot.state || 'idle';
  const wasPlaying = ['playing', 'connecting', 'buffering', 'retrying'].includes(state);
  const startPosition = Number(snapshot.position ?? S.pendingOffset) || 0;
  const direction = Number(snapshot.direction) < 0 ? -1 : 1;
  const speed = clamp(Number(snapshot.speed) || Number($('speed').value) || 1, 0.5, 2);
  const pointerAngle = platterPointerAngle(event);
  const startVisualAngle = S.lastVisualRotation ?? platterAngleForPosition(startPosition);
  S.platterGesture = {
    active: true,
    phase: 'pressed',
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    wasPlaying,
    dragging: false,
    startX: event.clientX,
    startY: event.clientY,
    startPointerAngle: pointerAngle,
    lastPointerAngle: pointerAngle,
    lastAt: Number(event.timeStamp) || performance.now(),
    accumulatedAngle: 0,
    startPosition,
    previewPosition: startPosition,
    startVisualAngle,
    visualAngle: startVisualAngle,
    visualOffset: 0,
    direction,
    speed,
    engineSpeed: speed,
    baseSpeed: clamp(Number($('speed').value) || 1, 0.5, 2),
    filteredSpeed: null,
    currentRate: direction * speed,
    lastEngineUpdate: 0,
    pausedForScratch: false,
    waitingForBuffer: false,
    boundaryReached: false,
    failed: false,
  };
  event.preventDefault();
  try { $('vinyl').setPointerCapture(event.pointerId); } catch { /* Capture can be unavailable in synthetic events. */ }
}

function movePlatterGesture(event) {
  const gesture = S.platterGesture;
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  event.preventDefault();
  const samples = event.getCoalescedEvents?.() || [event];
  for (const sample of samples) {
    const pointerAngle = platterPointerAngle(sample);
    const delta = unwrapAngleDelta(pointerAngle, gesture.lastPointerAngle);
    const at = Number(sample.timeStamp) || performance.now();
    const dt = clamp(at - gesture.lastAt, 4, 120) / 1000;
    gesture.accumulatedAngle += delta;
    gesture.lastPointerAngle = pointerAngle;
    gesture.lastAt = at;
    if (!gesture.dragging) {
      const distance = Math.hypot(sample.clientX - gesture.startX, sample.clientY - gesture.startY);
      if (distance < PLATTER_DRAG_THRESHOLD_PX) continue;
      gesture.dragging = true;
      gesture.phase = 'dragging';
      $('vinyl').classList.add('is-scratching');
      if (!gesture.wasPlaying) {
        S.seekDragging = true;
        $('seek').classList.add('is-dragging');
      }
    }

    gesture.visualAngle = gesture.startVisualAngle + gesture.accumulatedAngle * 180 / Math.PI;
    if (!gesture.wasPlaying) {
      const duration = Number(S.snapshot?.duration || S.current?.duration) || 0;
      const target = gesture.startPosition + gesture.accumulatedAngle / (Math.PI * 2) * platterTurnSeconds();
      gesture.previewPosition = duration > 0 ? clamp(target, 0, duration) : Math.max(0, target);
      setSeekUI(gesture.previewPosition, duration, 0);
    } else if (!gesture.failed) {
      const nominalAngularSpeed = Math.PI * 2 / platterTurnSeconds();
      const angularSpeed = delta / Math.max(dt, 0.004);
      const rawRate = angularSpeed / nominalAngularSpeed;
      if (Math.abs(rawRate) < PLATTER_DIRECTION_DEADBAND) {
        applyPlatterRate(0, gesture);
      } else {
        const rawMagnitude = Math.abs(rawRate);
        const filtered = gesture.filteredSpeed === null
          ? rawMagnitude
          : gesture.filteredSpeed + (rawMagnitude - gesture.filteredSpeed) * 0.42;
        gesture.filteredSpeed = filtered;
        applyPlatterRate(Math.sign(rawRate) * clamp(filtered, 0.1, PLATTER_MAX_SPEED), gesture);
      }
    }
  }
  if (gesture.dragging) {
    $('vinyl').style.transform = `rotate(${gesture.visualAngle}deg)`;
    if (gesture.wasPlaying) {
      clearTimeout(gesture.inactivityTimer);
      gesture.inactivityTimer = setTimeout(() => {
        if (S.platterGesture === gesture && gesture.dragging && !gesture.failed) {
          gesture.filteredSpeed = 0;
          applyPlatterRate(0, gesture);
        }
      }, PLATTER_STILL_TIMEOUT_MS);
    }
    updatePlatterReadout(gesture);
  }
}

function finishPlatterGesture({ commit = true, immediate = false } = {}) {
  const gesture = S.platterGesture;
  if (!gesture) return;
  const vinyl = $('vinyl');
  clearTimeout(gesture.inactivityTimer);
  const pointerId = gesture.pointerId;
  gesture.pointerId = null;
  if (pointerId !== null && vinyl.hasPointerCapture?.(pointerId)) {
    try { vinyl.releasePointerCapture(pointerId); } catch { /* Pointer may already be cancelled. */ }
  }
  vinyl.classList.remove('is-scratching');

  if (!gesture.dragging) {
    S.platterGesture = null;
    updatePlatterReadout(null);
    return;
  }

  if (!gesture.wasPlaying) {
    S.seekDragging = false;
    $('seek').classList.remove('is-dragging');
    S.platterGesture = null;
    const position = commit ? gesture.previewPosition : gesture.startPosition;
    if (commit) seekTo(position);
    else setSeekUI(position, S.snapshot?.duration || S.current?.duration || 0, 0);
    updatePlatterReadout(null);
    return;
  }

  if (gesture.failed) {
    S.platterGesture = null;
    updatePlatterReadout(null);
    return;
  }

  if (immediate) {
    applyPlatterRate(gesture.baseSpeed, gesture);
    S.platterGesture = null;
    updatePlatterReadout(null);
    return;
  }

  const snapshot = readSnapshot() || S.snapshot || {};
  const actualAngle = platterAngleForPosition(Number(snapshot.position) || gesture.startPosition);
  gesture.visualOffset = gesture.visualAngle - actualAngle;
  gesture.releaseRate = gesture.currentRate || 0;
  gesture.releaseAt = performance.now();
  gesture.phase = 'returning';
  gesture.speed = Math.abs(gesture.releaseRate);
  updatePlatterReadout(gesture);

  const returnFrame = (now) => {
    if (S.platterGesture !== gesture) return;
    const elapsed = now - gesture.releaseAt;
    const rate = gesture.baseSpeed
      + (gesture.releaseRate - gesture.baseSpeed) * Math.exp(-elapsed / PLATTER_RETURN_TAU_MS);
    applyPlatterRate(rate, gesture);
    updatePlatterReadout(gesture);
    if (elapsed >= PLATTER_RETURN_DURATION_MS) {
      applyPlatterRate(gesture.baseSpeed, gesture);
      S.platterGesture = null;
      updatePlatterReadout(null);
      return;
    }
    requestAnimationFrame(returnFrame);
  };
  requestAnimationFrame(returnFrame);
}

function abandonPlatterGesture({ commitSeek = false, restoreRate = false } = {}) {
  const gesture = S.platterGesture;
  if (!gesture) return;
  clearTimeout(gesture.inactivityTimer);
  if (gesture.pointerId !== null && $('vinyl').hasPointerCapture?.(gesture.pointerId)) {
    try { $('vinyl').releasePointerCapture(gesture.pointerId); } catch { /* Already cancelled. */ }
  }
  $('vinyl').classList.remove('is-scratching');
  $('platterTarget').classList.remove('is-visible');
  S.platterGesture = null;
  S.seekDragging = false;
  $('seek').classList.remove('is-dragging');
  if (!gesture.wasPlaying && gesture.dragging) {
    const position = commitSeek ? gesture.previewPosition : gesture.startPosition;
    if (commitSeek) seekTo(position);
    else setSeekUI(position, S.snapshot?.duration || S.current?.duration || 0, 0);
  }
  if (restoreRate && gesture.wasPlaying && !gesture.failed) {
    applyPlatterRate(gesture.baseSpeed, gesture);
  }
  updatePlatterReadout(null);
}

function updateVolumeUI() {
  $('volume').value = String(S.volume);
  const use = $('muteBtn').querySelector('use');
  if (use) use.setAttribute('href', S.muted || S.volume === 0 ? '#i-mute' : '#i-volume');
  $('muteBtn').setAttribute('aria-label', S.muted ? '取消静音' : '静音');
}

// ---------------------------------------------------------------------------
// probe / test-all
// ---------------------------------------------------------------------------

async function probeTrack(track) {
  if (track?.cachedOnly) { toast('本机缓存快照请直接播放；试音需要远端列表。'); return; }
  if (!track || track.isExtra) return null;
  if (S.test.get(track.key)?.state === 'testing') return null;
  S.test.set(track.key, { state: 'testing' });
  renderLibrary();
  renderCounts();

  let res;
  try {
    res = JSON.parse(await wav2api_probe(S.playBase, routeKey(), track.playId));
  } catch (e) {
    res = { ok: false, error: String(e) };
  }
  const state = res.ok ? 'ok' : 'fail';
  S.test.set(track.key, { state, ...res });
  if (res.ok && !track.duration && res.duration) track.duration = res.duration;
  renderLibrary();
  renderCounts();
  if (track.key === S.currentKey && res.ok && res.duration) {
    $('timeTotal').textContent = fmtTime(res.duration);
  }
  return state;
}

function updateTestUI() {
  const run = S.testRun;
  if (!S.testing || !run) return;
  const pct = run.total ? (run.done / run.total) * 100 : 0;
  $('testProgress').style.width = `${pct}%`;
  $('testStatus').textContent = `${run.done}/${run.total} · ✓${run.pass} ✕${run.fail}`;
  $('testAllText').textContent = '停止试音';
  $('testAllBtn').disabled = false;
}

async function startTestAll() {
  if (S.testing) {
    S.testStop = true;
    $('testAllText').textContent = '正在停止…';
    return;
  }
  const all = visibleTracks().filter((t) => !t.isExtra);
  if (!all.length) {
    toast('当前筛选没有可试音的曲目', 'err');
    return;
  }


  const passed = all.filter((t) => S.test.get(t.key)?.state === 'ok').length;
  const skipPassed = passed < all.length;
  if (!skipPassed) {
    for (const t of all) S.test.delete(t.key);
  }
  const queue = all.slice();
  S.testing = true;
  S.testStop = false;
  S.testRun = { total: queue.length, done: 0, pass: 0, fail: 0, skipPassed, started: performance.now() };
  updateTestUI();
  renderLibrary();
  renderCounts();

  const worker = async () => {
    while (!S.testStop) {
      const t = queue.shift();
      if (!t) return;
      if (skipPassed && S.test.get(t.key)?.state === 'ok') {
        S.testRun.done += 1;
        S.testRun.pass += 1;
        updateTestUI();
        continue;
      }
      const state = await probeTrack(t);
      S.testRun.done += 1;
      if (state === 'ok') S.testRun.pass += 1;
      else {
        S.testRun.fail += 1;
        const err = S.test.get(t.key)?.error || '';
        if (/HTTP 401|网关密钥/.test(err)) {
          S.testStop = true;
          toast('密钥不对，试音已停止', 'err');
        }
      }
      updateTestUI();
    }
  };

  await Promise.all([worker(), worker()]);
  const run = S.testRun;
  run.stopped = S.testStop;
  S.testing = false;
  S.testStop = false;
  updateTestUI();
  renderCounts();
  renderLibrary();
  const took = ((performance.now() - run.started) / 1000).toFixed(1);
  toast(
    `试音完成：${run.pass} 通过 / ${run.fail} 失败 · ${took}s${run.stopped ? ' · 已停止' : ''}`,
    run.fail ? 'err' : 'ok',
  );
}

// ---------------------------------------------------------------------------
// signal chain + reveal
// ---------------------------------------------------------------------------

function setNode(name, { value, state = '' }) {
  const el = document.querySelector(`.node[data-node="${name}"]`);
  if (!el) return;
  const v = el.querySelector('.node-value');
  if (v && value != null) v.textContent = value;
  el.classList.remove('is-active', 'is-ok', 'is-warn');
  if (state) el.classList.add(`is-${state}`);
}

function updateChain(snap) {
  if (!snap) return;
  const timestamp = performance.now();
  const received = Number(snap.wire_bytes) || 0;
  const lastWire = S.wireSamples.at(-1);
  if (lastWire && (received < lastWire.bytes || lastWire.request !== snap.request_body)) S.wireSamples = [];
  S.wireSamples.push({ time: timestamp, bytes: received, request: snap.request_body });
  while (S.wireSamples.length > 2 && S.wireSamples[1].time < timestamp - 1000) S.wireSamples.shift();
  const firstWire = S.wireSamples[0];
  const bps = (received - firstWire.bytes) * 8000 / Math.max(1, timestamp - firstWire.time);
  setNode('bandwidth', {
    value: bps >= 1e6 ? `${(bps / 1e6).toFixed(2)} Mbps` : `${Math.round(bps / 1000)} kbps`,
    state: bps > 0 ? 'active' : '',
  });
  const state = snap.state;
  const track = S.current;
  const playing = state === 'playing';
  const active = playing || state === 'buffering' || state === 'connecting';
  const err = state === 'error';

  setNode('file', {
    value: track ? (track.ext || 'FILE') : '—',
    state: track ? 'ok' : '',
  });
  const fileNode = document.querySelector('.node[data-node="file"]');
  if (fileNode) fileNode.title = track?.path || '曲目文件';

  setNode('decode', {
    value: snap.rate ? `${(snap.rate / 1000).toFixed(1)} kHz · ${snap.channels}ch` : (err ? '失败' : '等待'),
    state: err ? 'warn' : snap.rate ? (active ? 'active' : 'ok') : '',
  });
  // Node captions are 9.5 px in a ~146 px box; two short numbers fit, a full
  // byte count with its base64 size does not. The exact figures live in the
  // PCM tab, so the chain shows the readable summary.
  setNode('base64', {
    value: snap.last_chunk_bytes ? `${fmtNum(Math.round(snap.last_chunk_bytes * 4 / 3))} 字符` : '等待',
    state: snap.last_chunk_bytes ? (active ? 'active' : 'ok') : '',
  });
  const base64Node = document.querySelector('.node[data-node="base64"]');
  if (base64Node) {
    base64Node.title = snap.last_chunk_bytes
      ? `${fmtNum(snap.last_chunk_bytes)} B PCM → ${fmtNum(Math.round(snap.last_chunk_bytes * 4 / 3))} 个 base64 字符`
      : '等第一块音频';
  }
  setNode('sse', {
    value: `${fmtNum(snap.events)} 帧 · ${fmtNum(snap.chunks)} 块`,
    state: snap.events ? (active ? 'active' : 'ok') : '',
  });
  setNode('gateway', {
    value: `${snap.http_status || '—'} · ${fmtMs(snap.first_format_ms)}`,
    state: err && snap.http_status >= 400 ? 'warn' : snap.http_status === 200 ? 'ok' : active ? 'active' : '',
  });
  setNode('buffer', {
    value: `${(snap.buffered || 0).toFixed(1)}s`,
    state: snap.buffered > 0.05 ? (playing ? 'active' : 'ok') : '',
  });
  setNode('speaker', {
    value: playing ? `${(snap.rate / 1000).toFixed(1)}k · ${snap.channels}ch` : (state === 'paused' ? '暂停' : '静音'),
    state: err ? 'warn' : playing ? 'active' : '',
  });

  $('chain').classList.toggle('is-flow', playing || state === 'buffering');
  const origin = originOf(S.playBase).replace(/^https?:\/\//, '');
  $('signalRoute').textContent = `${S.route === 'magpie' ? '经 Magpie' : '直连 Provider'} · ${origin}`;
}

function updateStats(snap) {
  if (!snap) return;
  updateCacheSource(snap);
  $('statHttp').textContent = snap.http_status || '—';
  $('statHttp').style.color = snap.http_status >= 400 ? 'var(--red)' : snap.http_status ? 'var(--green)' : '';
  $('statFormat').textContent = snap.rate ? `${(snap.rate / 1000).toFixed(1)}k · ${snap.channels}ch` : '—';
  $('statChunks').textContent = fmtNum(snap.chunks);
  $('statBuffer').textContent = `${(snap.buffered || 0).toFixed(1)}s`;
  $('statRate').textContent = snap.rate
    ? `${Math.round(snap.rate * snap.channels * 16 / 1000)} kbps`
    : '—';
  if (S.current) renderBadges(S.current, snap);
}

function formatRequest(snap) {
  if (!snap || !snap.request_url) return '等待第一次播放…';
  let pretty = snap.request_body || '';
  try { pretty = JSON.stringify(JSON.parse(pretty), null, 2); } catch { /* keep raw */ }
  const auth = routeKey() ? 'Authorization: Bearer •••\n' : '';
  return `POST ${snap.request_url}\nContent-Type: application/json\n${auth}\n${pretty}`;
}

function updateReveal(snap) {
  if (!S.revealOpen || !snap) return;

  $('reqLine').textContent = `POST ${snap.request_url || '—'}`;
  $('rawRequest').textContent = formatRequest(snap);

  $('sseCount').textContent = `${fmtNum(snap.events)} events · ${fmtNum(snap.chunks)} chunks`;
  const log = Array.isArray(snap.log) ? snap.log.slice().reverse() : [];
  if (log.length) {
    $('frameList').innerHTML = log.map((e) => {
      const kind = e.kind === 'format' ? 'format' : 'chunk';
      const detail = kind === 'format'
        ? `${e.rate ? `${(e.rate / 1000).toFixed(1)}k` : ''}/${e.channels || '?'}ch`
        : `${fmtNum(e.bytes)} B`;
      const extra = kind === 'chunk' ? `${fmtNum(e.b64)} b64` : `${fmtTime(e.duration || 0)}`;
      return `<div class="frame"><span class="k">${Math.round(e.t)}ms</span><span class="k ${kind}">${kind}</span><span>${detail}</span><span class="sz">${extra}</span></div>`;
    }).join('');
  } else {
    $('frameList').innerHTML = '<p class="note">还没有帧。</p>';
  }
  let raw = snap.last_event || '—';
  try { raw = JSON.stringify(JSON.parse(raw), null, 2); } catch { /* truncated JSON stays raw */ }
  $('rawEvent').textContent = raw;

  $('pcmRate').textContent = snap.rate ? `${fmtNum(snap.rate)} Hz` : '—';
  $('pcmCh').textContent = snap.channels ? `${snap.channels} ch` : '—';
  $('pcmChunkBytes').textContent = snap.last_chunk_bytes ? `${fmtNum(snap.last_chunk_bytes)} B` : '—';
  $('pcmChunkDur').textContent = snap.rate && snap.channels && snap.last_chunk_bytes
    ? `${(snap.last_chunk_bytes / (snap.rate * snap.channels * 2)).toFixed(2)} s`
    : '—';
  $('pcmB64').textContent = snap.last_chunk_bytes ? fmtNum(Math.round(snap.last_chunk_bytes * 4 / 3)) : '—';
  $('pcmRateKbps').textContent = snap.rate
    ? `${Math.round(snap.rate * snap.channels * 16 / 1000)} kbps`
    : '—';
  $('pcmHex').textContent = hexFromB64(snap.last_chunk_b64);

  $('mEvents').textContent = fmtNum(snap.events);
  $('mChunks').textContent = fmtNum(snap.chunks);
  $('mB64').textContent = fmtNum(snap.b64_chars);
  $('mPcm').textContent = fmtBytes(snap.pcm_bytes);
  $('mFormat').textContent = fmtMs(snap.first_format_ms);
  $('mAudio').textContent = fmtMs(snap.first_audio_ms);
  $('mUnder').textContent = fmtNum(snap.underruns);
  $('mHttp').textContent = snap.http_status || '—';
  $('mBuffer').textContent = `${(snap.buffered || 0).toFixed(2)}s`;
  drawSpark();
}

function hexFromB64(b64) {
  if (!b64) return '—';
  let s = String(b64).slice(0, 48);
  while (s.length % 4) s += '=';
  try {
    const bin = atob(s);
    const bytes = Array.from(bin, (c) => c.charCodeAt(0)).slice(0, 24);
    const hex = bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');
    const samples = [];
    for (let i = 0; i + 1 < bytes.length; i += 2) {
      samples.push((bytes[i] | (bytes[i + 1] << 8)) << 16 >> 16);
    }
    return `hex  ${hex}\n\ns16  ${samples.join(', ')}`;
  } catch {
    return String(b64).slice(0, 48) + '…';
  }
}

function openReveal(tab) {
  S.revealOpen = true;
  $('reveal').hidden = false;
  $('revealBtn').setAttribute('aria-expanded', 'true');
  $('revealText').textContent = '收起';
  if (tab) setTab(tab);
  setTimeout(() => $('signal').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 30);
}

function closeReveal() {
  S.revealOpen = false;
  $('reveal').hidden = true;
  $('revealBtn').setAttribute('aria-expanded', 'false');
  $('revealText').textContent = '拆开看看';
}

function setTab(tab) {
  S.revealTab = tab;
  $$('.tab').forEach((b) => {
    const on = b.dataset.tab === tab;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', String(on));
  });
  $$('.tab-panel').forEach((p) => { p.hidden = p.dataset.panel !== tab; });
  if (tab === 'metrics') drawSpark();
}

// ---------------------------------------------------------------------------
// canvases
// ---------------------------------------------------------------------------

function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: canvas.clientWidth, h: canvas.clientHeight };
}

function clearRecordOverlay() {
  const canvas = $('ring');
  if (!canvas) return;
  const { ctx, w, h } = fitCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
}

// Light marks age on the record surface, travelling clockwise at the vinyl's
// 9-second media revolution period. Constant decay sets each mark's lifetime.
function drawNeedleTrace(state, position, rms, rotationDelta) {
  const canvas = $('ring');
  const vinyl = $('vinyl');
  const tip = $('needleContact');
  if (!canvas || !vinyl || !tip) return;
  const now = performance.now() / 1000;

  const angularSpeed = Math.PI * 2 / platterTurnSeconds();
  const reduced = motionPreferenceReduced();
  const rect = canvas.getBoundingClientRect();
  const contact = tip.getBoundingClientRect();
  const cx = canvas.clientWidth / 2;
  const cy = canvas.clientHeight / 2;
  const x = (contact.left + contact.width / 2 - rect.left) * canvas.clientWidth / rect.width;
  const y = (contact.top + contact.height / 2 - rect.top) * canvas.clientHeight / rect.height;
  const radius = Math.hypot(x - cx, y - cy);
  const angle = Math.atan2(y - cy, x - cx);
  // Large media jumps clear stale marks. Existing marks otherwise follow the
  // exact angle rendered on the platter, including direct manual movement.
  const dt = S.needleTraceAt ? Math.min(now - S.needleTraceAt, .1) : 0;
  const mediaDelta = S.needleMediaPosition === null ? 0 : position - S.needleMediaPosition;
  S.needleMediaPosition = position;
  if (Math.abs(mediaDelta) > 1) S.needleTrace = [];
  S.needleTraceAt = now;
  // Gently smooth the musical envelope, then multiply by volume exactly.
  // Each deposited mark has its own initial brightness and constant decay.
  const volume = Number(S.snapshot?.volume ?? S.volume);
  const muted = S.snapshot?.muted ?? S.muted;
  const gain = muted ? 0 : volume;
  const target = waveformLightFactor(rms, gain);
  const response = target > S.needleStrength ? .12 : .5;
  S.needleStrength += (target - S.needleStrength) * (1 - Math.exp(-dt / response));
  const gesture = S.platterGesture;
  const moveMarks = state === 'playing'
    || (gesture?.dragging && (!gesture.wasPlaying || !gesture.waitingForBuffer));
  for (const mark of S.needleTrace) {
    if (moveMarks) mark.angle += rotationDelta * Math.PI / 180;
  }
  S.needleTrace = S.needleTrace.filter((mark) => lightAt(mark.strength, now - mark.born) > 0);
  const label = $('label');
  const artworkRadius = label ? label.offsetWidth / 2 : 0;
  if (state === 'playing' && !reduced && radius > artworkRadius + 2 && radius < canvas.clientWidth / 2 - 2) {
    S.needleTrace.push({ born: now, angle, radiusRatio: radius / cx, strength: initialLight(volume, muted, S.needleStrength) });
  }
  if (reduced) { S.needleTrace = []; return; }
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.lineCap = 'round';
  const rate = gesture?.dragging || gesture?.phase === 'returning'
    ? gesture.currentRate
    : (Number(S.snapshot?.direction) < 0 ? -1 : 1) * (Number(S.snapshot?.speed) || 1);
  for (const mark of S.needleTrace) {
    const light = lightAt(mark.strength, now - mark.born);
    ctx.beginPath();
    ctx.arc(cx, cy, mark.radiusRatio * cx, mark.angle, mark.angle + Math.sign(rate || 1) * angularSpeed * Math.max(dt * Math.abs(rate || 1), .018));
    const [r, g, b] = S.needleColor;
    ctx.strokeStyle = `rgba(${r},${g},${b},${light * .85})`;
    ctx.lineWidth = .8 + light * 1.3;
    ctx.shadowColor = `rgba(${r},${g},${b},${light * .85})`;
    ctx.shadowBlur = 4 + mark.strength * 5;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = .65;
    ctx.strokeStyle = `rgba(255,255,255,${light * .9})`;
    ctx.stroke();
  }
  ctx.restore();
}

function drawScope(state) {
  const canvas = $('scope');
  if (!canvas) return;
  const { ctx, w, h } = fitCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  const pad = 2;
  const mid = h / 2;

  ctx.strokeStyle = 'rgba(255,255,255,.045)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(w - pad, y);
    ctx.stroke();
  }
  for (let i = 1; i < 8; i += 1) {
    const x = (w / 8) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,255,255,.09)';
  ctx.beginPath();
  ctx.moveTo(pad, mid);
  ctx.lineTo(w - pad, mid);
  ctx.stroke();

  let data = null;
  if (state === 'playing') {
    try { data = wav2api_waveform(128); } catch { data = null; }
  }
  // The frequency field sits behind the waveform and uses the same live analyser.
  if (state === 'playing') {
    let spectrum;
    try { spectrum = wav2api_spectrum(64); } catch { spectrum = null; }
    if (spectrum?.length) {
      const step = (w - pad * 2) / spectrum.length;
      const fill = ctx.createLinearGradient(0, 0, 0, h);
      fill.addColorStop(0, 'rgba(105,216,247,.23)');
      fill.addColorStop(.6, 'rgba(105,216,247,.12)');
      fill.addColorStop(1, 'rgba(105,216,247,.025)');
      ctx.fillStyle = fill;
      for (let i = 0; i < spectrum.length; i += 1) {
        const amplitude = clamp(Number(spectrum[i]) || 0, 0, 1) * h * .78;
        ctx.fillRect(pad + i * step, h - pad - amplitude, Math.max(1, step - 2), amplitude);
      }
    }
  }
  const n = data ? data.length : 128;
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(242,179,95,.9)');
  grad.addColorStop(.55, 'rgba(255,214,150,.95)');
  grad.addColorStop(1, 'rgba(105,216,247,.9)');
  ctx.beginPath();
  for (let i = 0; i < n; i += 1) {
    const v = data ? Number(data[i]) || 0 : 0;
    const x = pad + (i / (n - 1)) * (w - pad * 2);
    const y = mid - v * h * 0.37;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = data ? grad : 'rgba(255,255,255,.18)';
  ctx.lineWidth = 1.7;
  ctx.shadowBlur = data ? 9 : 0;
  ctx.shadowColor = 'rgba(242,179,95,.45)';
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawVisuals(snap) {
  S.lastVisualAt = performance.now();
  const state = snap?.state || 'idle';
  const position = Number(snap?.position) || 0;
  const vinyl = $('vinyl');
  const gesture = S.platterGesture;
  let angle = platterAngleForPosition(position);
  let showTarget = false;
  if (gesture?.dragging) {
    if (!gesture.wasPlaying || gesture.boundaryReached || gesture.waitingForBuffer) {
      showTarget = gesture.wasPlaying;
    } else {
      angle = gesture.visualAngle;
    }
    if (!gesture.wasPlaying) angle = gesture.visualAngle;
  } else if (gesture?.phase === 'returning') {
    const elapsed = performance.now() - gesture.releaseAt;
    const progress = clamp(elapsed / PLATTER_RETURN_DURATION_MS, 0, 1);
    angle += gesture.visualOffset * (1 - progress) ** 2;
  }
  const reduced = motionPreferenceReduced();
  const renderAngle = reduced && !gesture?.dragging ? 0 : angle;
  vinyl.style.transform = reduced && !gesture?.dragging ? '' : `rotate(${renderAngle}deg)`;
  const target = $('platterTarget');
  target.classList.toggle('is-visible', showTarget);
  if (showTarget) target.style.transform = `rotate(${gesture.visualAngle}deg)`;
  const rotationDelta = S.lastVisualRotation === null ? 0 : renderAngle - S.lastVisualRotation;
  S.lastVisualRotation = renderAngle;
  let rms = 0;
  let peak = 0;
  if (state === 'playing') {
    try {
      const lv = wav2api_level();
      rms = Number(lv[0]) || 0;
      peak = Number(lv[1]) || 0;
    } catch { /* ignore */ }
  }
  clearRecordOverlay();
  drawNeedleTrace(state, position, rms, rotationDelta);
  drawScope(state);

  S.peakHold = Math.max(peak, S.peakHold * 0.94);
  $('levelBar').style.width = `${clamp(rms * 3.2, 0, 1) * 100}%`;
  $('levelPeak').style.left = `${clamp(S.peakHold * 1.6, 0, 1) * 100}%`;
  $('levelVal').textContent = fmtDb(rms);
}

function drawSpark() {
  const canvas = $('bufferSpark');
  if (!canvas || canvas.offsetParent === null) return;
  const { ctx, w, h } = fitCanvas(canvas);
  ctx.clearRect(0, 0, w, h);
  const vals = S.bufferHistory.slice(-90);
  const max = Math.max(0.6, ...vals);
  const pad = 8;
  const x = (i) => pad + (i / Math.max(1, vals.length - 1)) * (w - pad * 2);
  const y = (v) => h - pad - (v / max) * (h - pad * 2);

  ctx.strokeStyle = 'rgba(255,125,140,.25)';
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  const th = y(0.2);
  ctx.moveTo(pad, th);
  ctx.lineTo(w - pad, th);
  ctx.stroke();
  ctx.setLineDash([]);

  if (vals.length < 2) {
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.font = '10px monospace';
    ctx.fillText('等待缓冲数据…', pad, h / 2);
    return;
  }

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(105,216,247,.28)');
  grad.addColorStop(1, 'rgba(105,216,247,0)');

  ctx.beginPath();
  ctx.moveTo(x(0), y(vals[0]));
  for (let i = 1; i < vals.length; i += 1) ctx.lineTo(x(i), y(vals[i]));
  ctx.lineTo(x(vals.length - 1), h - pad);
  ctx.lineTo(x(0), h - pad);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < vals.length; i += 1) {
    if (i === 0) ctx.moveTo(x(i), y(vals[i]));
    else ctx.lineTo(x(i), y(vals[i]));
  }
  ctx.strokeStyle = 'rgba(105,216,247,.85)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// snapshot loop
// ---------------------------------------------------------------------------

function scheduleNextTrack(snap) {
  if (snap?.state !== 'ended') return;
  const identity = snap.session_id || snap.model;
  if (S.completedSession === identity) return;
  S.completedSession = identity;
  const finished = S.current;
  queueMicrotask(() => {
    if (S.current !== finished || readSnapshot()?.state !== 'ended') return;
    if (S.playbackMode === 'single') {
      const resolved = finished?.isGroup ? S.playable.find((track) => track.path === snap.path) : finished;
      playTrack(resolved || finished, 0);
    } else if (finished?.isGroup) {
      playTrack({ ...finished, path: '' }, 0);
    } else {
      stepTrack(1);
    }
  });
}

function onSnapshot(snap, now) {
  if (snap.state !== S.lastState) {
    S.lastState = snap.state;
    setStateUI(snap.state);
    if (snap.state === 'error' && snap.error) showError(snap.error);
    if (snap.state === 'playing') clearError();
    if (snap.state === 'ended') scheduleNextTrack(snap);
  }

  // A fast failed manual retry may return to error between two UI polls.
  if (snap.state === 'error' && snap.error) showError(snap.error);
  if (snap.state === 'paused' && String(snap.error || '').startsWith('倒放已停在本机缓存边界')) {
    showError(snap.error, { status: 0 });
    $('retryBtn').textContent = '继续正放';
  }
  if (snap.state === 'retrying') {
    $('deckState').textContent = `重连 ${snap.retry_attempt}/5`;
    $('liveText').textContent = `${Math.ceil((snap.retry_in_ms || 0) / 1000)}s 后重试`;
  }
  if (S.platterGesture?.active && S.platterGesture.wasPlaying) {
    const gesture = S.platterGesture;
    gesture.waitingForBuffer = gesture.dragging
      && ['connecting', 'buffering', 'retrying'].includes(snap.state);
    if (Number(snap.direction) < 0 && snap.state === 'paused' && snap.stream_done) {
      if (!gesture.boundaryReached) toast('倒放已停在本机缓存边界，播放位置保持在这里。', 'ok');
      gesture.boundaryReached = true;
      gesture.speed = 0;
      gesture.currentRate = 0;
      gesture.waitingForBuffer = false;
    }
    if (snap.state === 'error') {
      gesture.failed = true;
      gesture.speed = 0;
      gesture.currentRate = 0;
      gesture.waitingForBuffer = false;
      try {
        wav2api_set_speed(gesture.baseSpeed);
        if (Number(snap.direction) < 0) wav2api_set_direction(1);
        gesture.engineSpeed = gesture.baseSpeed;
        gesture.direction = 1;
      } catch { /* Keep the error report visible if recovery also fails. */ }
    }
    updatePlatterReadout(gesture);
  }
  if (S.current?.isGroup && snap.chunks > 0 && snap.path && S.current.path !== snap.path) {
    Object.assign(S.current, { path: snap.path, title: snap.title, artist: snap.artist,
      display_name: snap.display_name, duration: snap.duration, ext: extOf(snap.path) });
    const currentTrack = S.playable.find((track) => track.path === snap.path);
    if (currentTrack) S.currentKey = currentTrack.key;
    S.lastBadgeKey = '';
    setImmediateTrackUI(S.current);
    updateMediaSession(S.current);
    renderLibrary();
  }
  if (snap.display_name && !S.current) {
    // The engine has a track even if the page lost its selection (reload).
    S.current = {
      id: snap.model, key: snap.model, playId: snap.model,
      display_name: snap.display_name, artist: snap.artist, title: snap.title,
      path: snap.path, duration: snap.duration, ext: extOf(snap.path),
    };
    S.currentKey = snap.model;
    setImmediateTrackUI(S.current);
  } else if (S.current && snap.title && !S.current.title) {
    S.current.title = snap.title;
  }

  const dur = snap.duration || S.current?.duration || 0;
  if (!S.seekDragging) {
    setSeekUI(snap.position || 0, dur, snap.buffered || 0);
  } else {
    $('timeTotal').textContent = dur ? fmtTime(dur) : '--:--';
  }

  if (now - S.lastChainAt > 150) {
    S.lastChainAt = now;
    updateChain(snap);
  }
  if (now - S.lastStatsAt > 200) {
    S.lastStatsAt = now;
    updateStats(snap);
    updateReveal(snap);
    if (now - S.lastBufferAt > 200) {
      S.lastBufferAt = now;
      S.bufferHistory.push(Number(snap.buffered) || 0);
      if (S.bufferHistory.length > 120) S.bufferHistory.shift();
    }
  }
}

function startLoops() {
  let last = 0;
  const frame = (ts) => {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    if (ts - last < 33) return;
    last = ts;
    try {
      const snap = readSnapshot();
      if (snap && Object.keys(snap).length) {
        S.snapshot = snap;
        onSnapshot(snap, ts);
        drawVisuals(snap);
      } else {
        drawVisuals(null);
      }
    } catch (e) {
      console.error('wav2api frame failed', e);
      window.wav2apiBoot?.fail(`界面更新失败：${e?.message || e}`);
    }
  };
  requestAnimationFrame(frame);

  // Keep playback lifecycle active in the background; only rendering is hidden.
  // Native onended handles completion even when this fallback timer is throttled.
  setInterval(() => {
    try {
      const snap = readSnapshot();
      if (snap && Object.keys(snap).length) {
        S.snapshot = snap;
        scheduleNextTrack(snap);
        if (!document.hidden) {
          onSnapshot(snap, performance.now());
          if (performance.now() - S.lastVisualAt > 250) drawVisuals(snap);
        }
      }
    } catch (e) {
      console.error('wav2api tick failed', e);
      window.wav2apiBoot?.fail(`状态更新失败：${e?.message || e}`);
    }
  }, 500);
}

// ---------------------------------------------------------------------------
// connection / settings
// ---------------------------------------------------------------------------

function setConn(kind, text) {
  const el = $('connBtn');
  if (!el) return;
  el.classList.remove('ok', 'warn', 'err');
  if (kind) el.classList.add(kind);
  $('connText').textContent = text;
  el.title = text;
}

function updateRouteUI() {
  const sw = document.querySelector('.route-switch');
  if (sw) sw.dataset.route = S.route;
  $$('.route-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.route === S.route));
  $$('#settingsRoute button').forEach((b) => b.classList.toggle('is-active', b.dataset.route === S.route));
  const origin = originOf(S.playBase).replace(/^https?:\/\//, '');
  $('signalRoute').textContent = `${S.route === 'magpie' ? '经 Magpie' : '直连 Provider'} · ${origin}`;
}

async function setRoute(route, { silent = false } = {}) {
  if (route !== 'direct' && route !== 'magpie') return;
  const prevState = S.snapshot?.state || 'idle';
  const wasPlaying = prevState === 'playing' || prevState === 'buffering' || prevState === 'connecting' || prevState === 'retrying';
  const pos = S.snapshot?.position || 0;

  abandonPlatterGesture();

  S.route = route;
  S.playBase = routeBase(route);
  savePrefs();
  updateRouteUI();
  if (!silent) setConn('warn', '切换路线…');

  if (wasPlaying || prevState === 'paused') {
    wav2api_stop();
    setStateUI('idle');
  }

  const applied = await refreshAll();
  if (!applied || S.route !== route) return;
  if (wasPlaying && S.current) {
    const match = S.playableById.get(S.current.key)
      || S.playable.find((t) => t.id === S.current.id || t.display_name === S.current.display_name);
    if (match) {
      playTrack(match, pos);
      if (!silent) toast(`已切到${routeName()}，从 ${fmtTime(pos)} 继续`, 'ok');
    } else if (!silent) {
      toast(`已切到${routeName()}，但曲库没有这首`, 'err');
    }
  } else if (!silent) {
    toast(`已切到${routeName()} · ${S.playable.length} 首`, 'ok');
  }
}

function openSettings() {
  $('playBase').value = S.playBase;
  $('catalogBase').value = S.catalogBase;
  $('keyInput').value = S.key;
  $('rememberKey').checked = S.rememberKey;
  $('localNetworkAccess').checked = S.localNetworkAccess;
  $('settingsStatus').textContent = '';
  $('settingsStatus').className = 'settings-status mono';
  $$('#settingsRoute button').forEach((b) => b.classList.toggle('is-active', b.dataset.route === S.route));
  const dialog = $('settingsDialog');
  if (!dialog.open) dialog.showModal();
}

function settingsMsg(text, kind = '') {
  const el = $('settingsStatus');
  el.textContent = text;
  el.className = `settings-status mono ${kind}`;
}

async function saveSettings() {
  const picked = document.querySelector('#settingsRoute button.is-active')?.dataset.route;
  const route = picked === 'direct' ? 'direct' : 'magpie';
  const base = normalizeBase($('playBase').value);
  const catalog = normalizeBase($('catalogBase').value);
  const key = $('keyInput').value.trim();
  const remember = $('rememberKey').checked;
  const localNetworkAccess = $('localNetworkAccess').checked;

  if (route === 'magpie' && !key) {
    settingsMsg('经 Magpie 需要网关密钥。可以点「读取本地开发密钥」。', 'err');
    return;
  }

  if (localNetworkAccess && !S.localNetworkReady) {
    settingsMsg('先点“测试连接”，并在浏览器询问时允许访问本地网络。', 'err');
    return;
  }

  abandonPlatterGesture();
  S.route = route;
  S.playBase = base;
  S.catalogBase = catalog;
  S.key = key;
  S.rememberKey = remember;
  S.localNetworkAccess = localNetworkAccess;
  wav2api_set_local_network_access(localNetworkAccess);
  if (route === 'magpie') S.prefs.magpieBase = base;
  else S.prefs.directBase = base;
  savePrefs();
  updateRouteUI();

  wav2api_stop();
  setStateUI('idle');
  $('settingsDialog').close();
  await refreshAll();
  toast('设置已保存', 'ok');
}

async function testConnection() {
  const base = normalizeBase($('playBase').value);
  const catalogBase = normalizeBase($('catalogBase').value);
  const key = document.querySelector('#settingsRoute button.is-active')?.dataset.route === 'magpie' ? $('keyInput').value.trim() : '';
  const localNetworkAccess = $('localNetworkAccess').checked;
  if (localNetworkAccess) {
    try {
      if ([base, catalogBase].some((endpoint) => new URL(endpoint).protocol !== 'https:')) {
        settingsMsg('本地网络端点需要填写 HTTPS 地址，并使用匹配的有效证书。', 'err');
        return;
      }
    } catch {
      settingsMsg('请检查播放端点和曲库端点的 URL 格式。', 'err');
      return;
    }
  }
  wav2api_set_local_network_access(localNetworkAccess);
  settingsMsg(localNetworkAccess
    ? '正在连接…若浏览器询问，请允许访问本地网络。'
    : '测试中…');
  const t0 = performance.now();
  // Start the first local request directly from this button gesture so the
  // browser can present its Local Network Access permission prompt.
  const play = await fetchModels(base, key, { localNetworkAccess });
  const cat = await fetchModels(catalogBase, '', { localNetworkAccess });
  const ms = Math.round(performance.now() - t0);
  if (localNetworkAccess && (play.ok || play.error.status > 0 || cat.ok || cat.error.status > 0)) {
    S.localNetworkReady = true;
  }
  if (!play.ok) {
    settingsMsg(`${play.error.short} · ${play.error.message}`, 'err');
    return;
  }
  const ours = play.data.filter((m) => m.owned_by === 'wav2api' || String(m.id).startsWith('wav2api/')).length;
  const catText = cat.ok ? `曲库 ${cat.data.length} 条` : `曲库失败：${cat.error.short}`;
  settingsMsg(`${play.data.length} 个模型 · ${ours} 个 wav2api · ${catText} · ${ms}ms`, 'ok');
}

// ---------------------------------------------------------------------------
// media session
// ---------------------------------------------------------------------------

function updateMediaSession(track, coverOverride) {
  if (!('mediaSession' in navigator) || !track) return;
  try {
    const fallback = coverOverride || S.coverCache.get(track.key) || proceduralCover(track);
    const artwork = fallback
      ? [{ src: fallback, sizes: '512x512', type: fallback.startsWith('data:') ? 'image/png' : 'image/jpeg' }]
      : [];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || track.display_name || track.id,
      artist: track.artist || 'wav2api',
      album: 'wav2api · model-protocol player',
      artwork,
    });
  } catch { /* ignore */ }
}

function setupMediaSession() {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.setActionHandler('play', () => {
      if (['idle', 'paused', 'ended', 'error'].includes(readSnapshot()?.state || 'idle')) togglePlay();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      if (['playing', 'connecting', 'buffering', 'retrying'].includes(readSnapshot()?.state)) {
        abandonPlatterGesture({ restoreRate: true });
        wav2api_pause();
        setStateUI('paused');
      }
    });
    navigator.mediaSession.setActionHandler('stop', () => stopPlayback());
    navigator.mediaSession.setActionHandler('previoustrack', () => stepTrack(-1));
    navigator.mediaSession.setActionHandler('nexttrack', () => stepTrack(1));
    navigator.mediaSession.setActionHandler('seekto', (d) => {
      if (typeof d.seekTime === 'number') seekTo(d.seekTime);
    });
    navigator.mediaSession.setActionHandler('seekbackward', (d) => {
      seekTo((S.snapshot?.position || 0) - (d.seekOffset || 10));
    });
    navigator.mediaSession.setActionHandler('seekforward', (d) => {
      seekTo((S.snapshot?.position || 0) + (d.seekOffset || 10));
    });
  } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// UI wiring
// ---------------------------------------------------------------------------

function bindPlatterUI() {
  const vinyl = $('vinyl');
  vinyl.addEventListener('pointerdown', beginPlatterGesture);
  vinyl.addEventListener('pointermove', movePlatterGesture);
  vinyl.addEventListener('pointerup', (event) => {
    if (S.platterGesture?.pointerId === event.pointerId) finishPlatterGesture({ commit: true });
  });
  vinyl.addEventListener('pointercancel', (event) => {
    if (S.platterGesture?.pointerId === event.pointerId) finishPlatterGesture({ commit: false, immediate: true });
  });
  vinyl.addEventListener('lostpointercapture', () => {
    if (S.platterGesture?.dragging && S.platterGesture.pointerId !== null) {
      finishPlatterGesture({ commit: false, immediate: true });
    }
  });
  vinyl.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const step = event.shiftKey ? 0.25 : 0.05;
    setBaseSpeed(Number($('speed').value) + (event.key === 'ArrowUp' ? step : -step));
  });
  window.addEventListener('blur', () => {
    if (S.platterGesture?.dragging) finishPlatterGesture({ commit: false, immediate: true });
    else if (S.platterGesture?.phase === 'returning') abandonPlatterGesture({ restoreRate: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (S.platterGesture?.dragging) finishPlatterGesture({ commit: false, immediate: true });
    else if (S.platterGesture?.phase === 'returning') abandonPlatterGesture({ restoreRate: true });
  });
  updatePlatterReadout(null);
}

function bindUI() {
  bindPlatterUI();
  bindCacheUI();
  $('playBtn').addEventListener('click', togglePlay);
  $('stopBtn').addEventListener('click', stopPlayback);
  const updateModeButtons = () => {
    $$('#playbackModes button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === S.playbackMode)));
  };
  $('playbackModes').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-mode]');
    if (!button) return;
    S.playbackMode = button.dataset.mode;
    updateModeButtons();
    savePrefs();
  });
  updateModeButtons();
  $('smartGroups').addEventListener('click', (event) => {
    const button = event.target.closest('[data-smart-group]');
    if (!button) return;
    const group = S.smartGroups.find((item) => item.id === button.dataset.smartGroup);
    if (group) playTrack({ ...group }, 0);
  });
  $('prevBtn').addEventListener('click', () => stepTrack(-1));
  $('nextBtn').addEventListener('click', () => stepTrack(1));
  $('muteBtn').addEventListener('click', toggleMute);
  $('retryBtn').addEventListener('click', async () => {
    if (S.connectionError || !S.current || S.uiErrorRefreshCatalog) {
      await refreshAll();
      if (S.playable.length) restoreSelection();
      return;
    }
    const live = readSnapshot();
    playTrack(S.current, live?.position || 0, { preserveSession: true });
  });

  const chunkOptions = [16 * 1024, 32 * 1024, 64 * 1024, 0, 128 * 1024, 256 * 1024, 512 * 1024, 1024 * 1024, 0xffffffff];
  $('chunkLimit').addEventListener('input', (event) => {
    const bytes = chunkOptions[Number(event.target.value)];
    wav2api_set_chunk_limit(bytes);
    $('chunkValue').textContent = bytes === 0xffffffff ? '自动' : bytes === 0 ? '默认' : `${bytes / 1024} KiB`;
    $('chunkValue').title = '下次播放或定位生效；默认约 500 ms，自动模式上限 1 MiB PCM';
  });
  $('speed').addEventListener('input', (event) => setBaseSpeed(event.target.value));
  $('speedReset').addEventListener('click', () => setBaseSpeed(1));
  $('volume').addEventListener('input', (e) => {
    S.volume = clamp(Number(e.target.value), 0, 1);
    S.muted = false;
    wav2api_set_volume(S.volume);
    wav2api_set_muted(false);
    updateVolumeUI();
    savePrefs();
  });

  const seek = $('seek');
  const range = $('seekRange');
  range.addEventListener('input', () => {
    S.seekDragging = true;
    seek.classList.add('is-dragging');
    const v = Number(range.value) || 0;
    const total = Number(range.max) || S.current?.duration || 0;
    $('timeNow').textContent = fmtTime(v);
    $('seekPlayed').style.width = `${total > 0 ? (v / total) * 100 : 0}%`;
    $('seekThumb').style.left = `${total > 0 ? (v / total) * 100 : 0}%`;
    $('seekTip').textContent = fmtTime(v);
    $('seekTip').style.left = `${total > 0 ? (v / total) * 100 : 0}%`;
  });
  range.addEventListener('change', () => {
    S.seekDragging = false;
    seek.classList.remove('is-dragging');
    seekTo(Number(range.value) || 0);
  });
  seek.addEventListener('pointermove', (e) => {
    const r = seek.getBoundingClientRect();
    const ratio = clamp((e.clientX - r.left) / Math.max(1, r.width), 0, 1);
    const total = Number(range.max) || 0;
    $('seekTip').style.left = `${ratio * 100}%`;
    $('seekTip').textContent = fmtTime(ratio * total);
  });
  seek.addEventListener('pointerleave', () => {
    if (!S.seekDragging) $('seekTip').style.opacity = '';
  });

  $('search').addEventListener('input', (e) => {
    S.query = e.target.value;
    S.renderLimit = MAX_ROWS;
    renderLibrary();
    renderCounts();
    $('trackList').scrollTop = 0;
  });

  $$('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      S.filter = chip.dataset.filter;
      S.renderLimit = MAX_ROWS;
      $$('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
      renderLibrary();
      renderCounts();
      $('trackList').scrollTop = 0;
    });
  });

  $('testAllBtn').addEventListener('click', startTestAll);
  $('refreshBtn').addEventListener('click', () => refreshAll());
  $('moreBtn').addEventListener('click', () => {
    S.renderLimit += MAX_ROWS;
    renderLibrary();
    renderCounts();
  });
  $('locateCurrentBtn').addEventListener('click', locateCurrentTrack);
  $('motionOverrideBtn').addEventListener('click', () => {
    S.motionOverride = !S.motionOverride;
    updateMotionOverrideUI();
  });
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', updateMotionOverrideUI);
  else motionQuery.addListener(updateMotionOverrideUI);
  updateMotionOverrideUI();

  $('trackList').addEventListener('click', (e) => {
    const group = e.target.closest('.group-head');
    if (group) {
      const name = group.dataset.group;
      if (S.collapsed.has(name)) S.collapsed.delete(name);
      else S.collapsed.add(name);
      renderLibrary();
      return;
    }
    const testBtn = e.target.closest('[data-test]');
    if (testBtn) {
      e.stopPropagation();
      const t = S.playableById.get(testBtn.dataset.test);
      if (t) probeTrack(t);
      return;
    }
    const playBtn = e.target.closest('[data-play]');
    if (playBtn) {
      const key = playBtn.dataset.play;
      const t = S.playableById.get(key)
        || S.extra.find((x) => x.key === key);
      if (t) playTrack(t, 0);
    }
  });

  $$('.route-btn').forEach((btn) => {
    btn.addEventListener('click', () => setRoute(btn.dataset.route));
  });

  $('settingsBtn').addEventListener('click', openSettings);
  $('connBtn').addEventListener('click', openSettings);
  $('settingsClose').addEventListener('click', () => $('settingsDialog').close());
  $('useLocalBridge').addEventListener('click', () => {
    try {
      const url = new URL($('localBridgeOrigin').value.trim());
      if (url.protocol !== 'https:' || url.href !== `${url.origin}/`) {
        settingsMsg('请输入不带路径、账号或参数的 HTTPS 主机地址。', 'err');
        return;
      }
      const origin = url.origin;
      $('playBase').value = `${origin}/gateway/v1`;
      $('catalogBase').value = `${origin}/catalog/v1`;
      $('localNetworkAccess').checked = true;
      $$('#settingsRoute button').forEach((button) => button.classList.toggle('is-active', button.dataset.route === 'magpie'));
      S.localNetworkReady = false;
      settingsMsg('端点已填好。输入 Magpie 密钥后点“测试连接”。');
    } catch {
      settingsMsg('请输入有效的 HTTPS 主机地址。', 'err');
    }
  });
  $$('#settingsRoute button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;
      $$('#settingsRoute button').forEach((b) => b.classList.toggle('is-active', b === btn));
      $('playBase').value = routeBase(route);
      S.localNetworkReady = false;
    });
  });
  for (const id of ['playBase', 'catalogBase', 'localNetworkAccess']) {
    $(id).addEventListener('input', () => { S.localNetworkReady = false; });
    $(id).addEventListener('change', () => { S.localNetworkReady = false; });
  }
  $('keyInput').type = PASSWORD_TYPE;
  $('saveSettings').addEventListener('click', saveSettings);
  $('testConn').addEventListener('click', testConnection);
  $('loadDevKey').hidden = !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  $('connectionForm').addEventListener('submit', (event) => { event.preventDefault(); saveSettings(); });
  $('useDefaultEndpoints').addEventListener('click', async () => {
    Object.assign(S.prefs, defaultConnections(location.origin));
    S.localNetworkAccess = false;
    S.localNetworkReady = false;
    $('localNetworkAccess').checked = false;
    wav2api_set_local_network_access(false);
    S.catalogBase = DEFAULTS.catalogBase;
    S.playBase = routeBase(S.route);
    $('playBase').value = S.playBase;
    $('catalogBase').value = S.catalogBase;
    savePrefs();
    await refreshAll();
    settingsMsg('已使用本站同源入口', 'ok');
  });
  $('loadDevKey').addEventListener('click', async () => {
    settingsMsg('读取中…');
    const key = await readDevKey();
    if (key) {
      $('keyInput').value = key;
      settingsMsg('已读取本地开发密钥（不会显示）', 'ok');
    } else {
      settingsMsg('没有读到：开发服务器未启用 --key-file，或页面不在本机', 'err');
    }
  });
  $('toggleKey').addEventListener('click', () => {
    const input = $('keyInput');
    const show = input.type === PASSWORD_TYPE;
    input.type = show ? 'text' : PASSWORD_TYPE;
    $('toggleKey').textContent = show ? '隐藏' : '显示';
  });

  $('revealBtn').addEventListener('click', () => {
    if (S.revealOpen) closeReveal();
    else openReveal('request');
  });
  $('revealClose').addEventListener('click', closeReveal);
  $$('.tab').forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.tab)));
  $$('.node').forEach((node) => {
    node.addEventListener('click', () => {
      const map = {
        file: 'request', decode: 'pcm', base64: 'pcm', sse: 'sse',
        gateway: 'request', buffer: 'metrics', speaker: 'metrics',
      };
      openReveal(map[node.dataset.node] || 'request');
    });
  });

  $('copyRequest').addEventListener('click', async () => {
    const text = formatRequest(S.snapshot);
    try {
      await navigator.clipboard.writeText(text);
      toast('请求已复制（不含密钥）', 'ok');
    } catch {
      toast('复制失败', 'err');
    }
  });

  $('settingsDialog').addEventListener('click', (e) => {
    if (e.target === $('settingsDialog')) $('settingsDialog').close();
  });

  document.addEventListener('keydown', (e) => {
    const t = e.target;
    const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (e.key === '/' && !typing) {
      e.preventDefault();
      $('search').focus();
      return;
    }
    if (e.key === 'Escape') {
      if ($('settingsDialog').open) $('settingsDialog').close();
      else if (S.revealOpen) closeReveal();
      else if (typing && t === $('search')) {
        $('search').value = '';
        S.query = '';
        renderLibrary();
        renderCounts();
      }
      return;
    }
    if (typing || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || $('cacheDialog').open || $('settingsDialog').open) return;
    const onControl = t && t.closest && t.closest('button, a, [role="button"]');
    if (e.code === 'Space') {
      if (onControl) return;
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      seekTo((S.snapshot?.position || 0) - 5);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      seekTo((S.snapshot?.position || 0) + 5);
    } else if (e.key.toLowerCase() === 'm') {
      toggleMute();
    } else if (e.key.toLowerCase() === 's') {
      stopPlayback();
    } else if (e.key.toLowerCase() === 'n') {
      stepTrack(1);
    } else if (e.key.toLowerCase() === 'p') {
      stepTrack(-1);
    }
  });
}

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------

function restoreSelection() {
  if (!S.playable.length) {
    setImmediateTrackUI(null);
    setStateUI('idle');
    return;
  }
  const wanted = S.prefs.lastTrack;
  let track = wanted
    ? S.playable.find((t) => t.key === wanted)
    : null;
  const fromPrefs = !!track;
  if (!track) {
    track = S.playable[0];
  }
  S.current = track;
  S.currentKey = track.key;
  S.snapshot = null;
  setImmediateTrackUI(track);
  setStateUI('idle');
  setSeekUI(0, track.duration || 0, 0);
  // Follow the row only when the visitor is returning to a track they chose
  // themselves. Picking the demo default is not a user action, and scrolling
  // to it would open the library thousands of pixels down with its folder
  // header gone.
  S.scrollToCurrent = fromPrefs;
  renderLibrary();
  updateTitle();
}

async function boot() {
  try {
    await init({ module_or_path: new URL('./pkg/wav2api_player_bg.wasm?build=16c84b470c45', import.meta.url) });
  } catch (e) {
    window.wav2apiBoot?.fail(`WASM 加载失败：${e?.message || e}`);
    return;
  }

  try {
    loadPrefs();
    bindUI();
    applyVolumeUI();
    updateVolumeUI();
    setupMediaSession();
    wav2api_set_ended_callback(() => {
      try {
        const snap = readSnapshot();
        if (snap) { S.snapshot = snap; scheduleNextTrack(snap); }
      } catch (error) { window.wav2apiBoot?.fail(`自动切歌失败：${error?.message || error}`); }
    });
    $('version').textContent = `v${wav2api_version()} · ${window.wav2apiBoot?.build || "unknown"}`;
    setConn('warn', '连接中…');
    updateRouteUI();
    setStateUI('idle');

    window.__wav2api = () => {
      const snap = readSnapshot();
      return snap
        ? { ...snap, page: { route: S.route, base: S.playBase, filter: S.filter, current: S.currentKey, tests: S.test.size } }
        : null;
    };
    window.wav2apiBoot?.ready();
    await refreshAll({ initial: true });
    S.booted = true;
    restoreSelection();
    startLoops();

    try { updateMediaSession(S.current); } catch { /* ignore */ }
    try {
      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      }
    } catch { /* ignore */ }
  } catch (e) {
    console.error('wav2api boot failed', e);
    window.wav2apiBoot?.fail(`页面启动失败：${e?.message || e}`);
    setConn('err', '启动失败');
    showError(`页面启动失败：\n${e?.stack || e}`);
    toast('页面启动失败，详见错误框', 'err');
  }
}

function applyVolumeUI() {
  try {
    wav2api_set_volume(S.volume);
    wav2api_set_muted(S.muted);
  } catch { /* ignore */ }
}

boot();
