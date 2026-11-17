const DB_NAME = 'wav2api-audio-cache';
const DB_VERSION = 2;
const ENABLED_KEY = 'wav2api.audio-cache.enabled.v1';
const CACHE_SCHEMA = 2;
const ENTRIES = 'entries';
const SEGMENTS = 'segments';
const PCM = 'pcm';
const MAX_CACHE_BYTES = 512 * 1024 * 1024;
const FALLBACK_CACHE_BYTES = 128 * 1024 * 1024;
const CACHE_QUOTA_FRACTION = 0.2;
const CAPTURE_LEASE_MS = 5 * 60 * 1000;
const CACHE_TOUCH_INTERVAL_MS = 30 * 1000;

const now = () => Date.now();

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

function transactionResult(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'));
  });
}

function errorInfo(error) {
  return {
    name: String(error?.name || 'Error').slice(0, 80),
    message: String(error?.message || error || '未知错误')
      .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [redacted]')
      .replace(/https?:\/\/[^\s"']+/gi, '[remote endpoint]')
      .slice(0, 500),
  };
}

function emitCacheEvent(name, detail) {
  try { window.dispatchEvent(new CustomEvent(name, { detail })); } catch { /* Cache events are advisory. */ }
}

function cacheReference(key) {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `cache-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function mergeCoverage(ranges, start, end) {
  const sorted = [...(ranges || []), [start, end]].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  return merged;
}

function hasFullCoverage(entry) {
  const total = Number(entry?.totalFrames) || 0;
  const coverage = entry?.coverage || [];
  return total > 0 && coverage.length > 0 && coverage[0][0] <= 0 && coverage[0][1] >= total;
}

function hasLiveCapture(entry, at = now()) {
  return !!entry?.captureId && Number(entry.captureLeaseUntil) > at;
}

function deleteTrackRecords(transaction, key) {
  transaction.objectStore(ENTRIES).delete(key);
  const segments = transaction.objectStore(SEGMENTS);
  const pcm = transaction.objectStore(PCM);
  const request = segments.index('byCache').openCursor(IDBKeyRange.only(key));
  request.onsuccess = () => {
    const cursor = request.result;
    if (!cursor) return;
    pcm.delete(cursor.value.id);
    cursor.delete();
    cursor.continue();
  };
}

function reverseCoverage(entry, offset) {
  const rate = Number(entry?.sampleRate) || 0;
  const totalFrames = Number(entry?.totalFrames) || 0;
  if (!rate || !totalFrames) return null;
  const frame = Math.min(totalFrames, Math.max(0, Math.round((Number(offset) || 0) * rate)));
  return (entry.coverage || []).find(([start, end]) => frame > start && frame <= end) || null;
}

function reverseUnavailable(message) {
  return new Response(JSON.stringify({error:{type:'invalid_request_error',message,status:422}}), {
    status: 422,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Wav2api-Cache-Source': 'cache',
    },
  });
}

function makeId() {
  try {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes) {
  let binary = '';
  const step = 0x8000;
  for (let start = 0; start < bytes.length; start += step) {
    binary += String.fromCharCode(...bytes.subarray(start, Math.min(bytes.length, start + step)));
  }
  return btoa(binary);
}

async function compressPcm(bytes) {
  if (typeof CompressionStream !== 'function') {
    throw new Error('此浏览器不支持压缩本机音频缓存；远端播放仍可继续');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompressPcm(bytes, codec) {
  if (codec !== 'gzip') return bytes;
  if (typeof DecompressionStream !== 'function') {
    throw new Error('此浏览器不支持解压本机音频缓存');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function sseEvent(value) {
  return new TextEncoder().encode(`data:${JSON.stringify(value)}\n\n`);
}

function sourceHeader(response, source) {
  if (!response?.body || response.type === 'opaque') return response;
  const headers = new Headers(response.headers);
  headers.set('X-Wav2api-Cache-Source', source);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function requestCommand(init) {
  try {
    const request = JSON.parse(String(init?.body || '{}'));
    const messages = request.messages || [];
    const content = messages[messages.length - 1]?.content;
    return typeof content === 'string' ? JSON.parse(content) : {};
  } catch {
    return {};
  }
}

class IndexedDbAudioCacheBackend {
  constructor() {
    this.dbPromise = null;
  }

  open() {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        reject(new Error('此浏览器不支持 IndexedDB'));
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = request.result;
        const previousVersion = event.oldVersion;
        if (!db.objectStoreNames.contains(ENTRIES)) {
          const entries = db.createObjectStore(ENTRIES, { keyPath: 'key' });
          entries.createIndex('byLastUsed', 'lastUsedAt');
          entries.createIndex('byState', 'state');
        }
        if (!db.objectStoreNames.contains(SEGMENTS)) {
          const segments = db.createObjectStore(SEGMENTS, { keyPath: 'id' });
          segments.createIndex('byCache', 'cacheKey');
          segments.createIndex('byCacheStart', ['cacheKey', 'startFrame', 'sequence']);
        }
        if (!db.objectStoreNames.contains(PCM)) db.createObjectStore(PCM, { keyPath: 'id' });
        if (previousVersion > 0 && previousVersion < DB_VERSION) {
          // Version 1 persisted uncompressed PCM. Drop this derived cache so it
          // cannot keep consuming disk after compressed storage is introduced.
          for (const name of [ENTRIES, SEGMENTS, PCM]) {
            if (db.objectStoreNames.contains(name)) request.transaction.objectStore(name).clear();
          }
        }
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      };
      request.onerror = () => reject(request.error || new Error('无法打开本地音频缓存'));
      request.onblocked = () => reject(new Error('本地音频缓存正被另一个页面占用'));
    }).catch((error) => {
      this.dbPromise = null;
      throw error;
    });
    return this.dbPromise;
  }

  async getEntry(key) {
    const db = await this.open();
    const tx = db.transaction(ENTRIES, 'readonly');
    const done = transactionResult(tx);
    const entry = await requestResult(tx.objectStore(ENTRIES).get(key));
    await done;
    return entry || null;
  }

  async beginCapture(key, metadata) {
    const db = await this.open();
    const tx = db.transaction(ENTRIES, 'readwrite');
    const done = transactionResult(tx);
    const store = tx.objectStore(ENTRIES);
    const request = store.get(key);
    let captureId = null;
    request.onsuccess = () => {
      const existing = request.result;
      if (existing?.state === 'complete' || hasLiveCapture(existing)) return;
      captureId = makeId();
      const entry = existing || {
        key,
        schema: CACHE_SCHEMA,
        coverage: [],
        byteLength: 0,
        segmentCount: 0,
        createdAt: now(),
      };
      Object.assign(entry, metadata);
      entry.state = 'partial';
      entry.updatedAt = now();
      entry.lastUsedAt = now();
      entry.captureId = captureId;
      entry.captureLeaseUntil = now() + CAPTURE_LEASE_MS;
      store.put(entry);
    };
    await done;
    return captureId;
  }

  async appendSegment(key, captureId, sequence, startFrame, frameCount, compressedBytes, limitBytes, activeKeys) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([ENTRIES, SEGMENTS, PCM], 'readwrite');
      const entryStore = tx.objectStore(ENTRIES);
      let failure = null;
      let storedBytes = 0;
      let evictedKeys = [];

      tx.oncomplete = () => {
        if (failure) reject(failure);
        else resolve({ storedBytes, evictedKeys });
      };
      tx.onabort = () => reject(failure || tx.error || new Error('IndexedDB transaction aborted'));

      const request = entryStore.getAll();
      request.onsuccess = () => {
        const entries = request.result || [];
        const entry = entries.find((candidate) => candidate.key === key);
        if (!entry || entry.captureId !== captureId || entry.state === 'complete') {
          failure = new Error('本次缓存写入已结束；远端播放继续。');
          return;
        }

        const at = now();
        const additionalBytes = compressedBytes.byteLength;
        let projectedBytes = entries.reduce((sum, item) => sum + (Number(item.byteLength) || 0), 0) + additionalBytes;
        const candidates = entries
          .filter((item) => item.key !== key && !activeKeys.has(item.key) && !hasLiveCapture(item, at))
          .sort((a, b) => (a.lastUsedAt || a.updatedAt || 0) - (b.lastUsedAt || b.updatedAt || 0));
        const victims = [];
        for (const candidate of candidates) {
          if (projectedBytes <= limitBytes) break;
          victims.push(candidate);
          projectedBytes -= Number(candidate.byteLength) || 0;
        }
        if (projectedBytes > limitBytes) {
          failure = new Error(`本机缓存达到上限 ${Math.round(limitBytes / 1024 / 1024)} MiB；已保留现有曲目，本曲后续部分不会继续缓存`);
          return;
        }

        for (const victim of victims) {
          deleteTrackRecords(tx, victim.key);
          evictedKeys.push(cacheReference(victim.key));
        }

        const id = `${key}|${captureId}|${sequence}`;
        const payload = compressedBytes.buffer.slice(
          compressedBytes.byteOffset,
          compressedBytes.byteOffset + compressedBytes.byteLength,
        );
        tx.objectStore(SEGMENTS).put({ id, cacheKey: key, startFrame, frameCount, sequence });
        tx.objectStore(PCM).put({ id, bytes: payload, codec: 'gzip' });
        entry.segmentCount = (entry.segmentCount || 0) + 1;
        entry.byteLength = (entry.byteLength || 0) + additionalBytes;
        entry.coverage = mergeCoverage(entry.coverage, startFrame, startFrame + frameCount);
        entry.updatedAt = at;
        entry.lastUsedAt = at;
        entry.captureLeaseUntil = at + CAPTURE_LEASE_MS;
        entryStore.put(entry);
        storedBytes = additionalBytes;
      };
    });
  }

  async finishCapture(key, captureId, completeStream, format) {
    const db = await this.open();
    const tx = db.transaction(ENTRIES, 'readwrite');
    const done = transactionResult(tx);
    const store = tx.objectStore(ENTRIES);
    const request = store.get(key);
    let complete = false;
    request.onsuccess = () => {
      const entry = request.result;
      if (!entry || entry.captureId !== captureId) return;
      Object.assign(entry, format || {});
      entry.totalFrames = Math.round((Number(entry.duration) || 0) * (Number(entry.sampleRate) || 0));
      complete = completeStream && hasFullCoverage(entry);
      entry.state = complete ? 'complete' : 'partial';
      entry.updatedAt = now();
      if (complete) {
        entry.cachedAt = now();
        entry.lastUsedAt = now();
      }
      delete entry.captureId;
      delete entry.captureLeaseUntil;
      store.put(entry);
    };
    await done;
    return complete;
  }

  async listSegments(key) {
    const db = await this.open();
    const tx = db.transaction(SEGMENTS, 'readonly');
    const done = transactionResult(tx);
    const range = IDBKeyRange.bound(
      [key, 0, 0],
      [key, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    );
    const list = await requestResult(tx.objectStore(SEGMENTS).index('byCacheStart').getAll(range));
    await done;
    return list || [];
  }

  async readPcm(id) {
    const db = await this.open();
    const tx = db.transaction(PCM, 'readonly');
    const done = transactionResult(tx);
    const item = await requestResult(tx.objectStore(PCM).get(id));
    await done;
    if (!item?.bytes) return null;
    if (item.codec !== 'gzip') throw new Error(`不支持的持久缓存编码：${String(item.codec || '未知')}`);
    return decompressPcm(new Uint8Array(item.bytes), item.codec);
  }

  async touch(key) {
    const db = await this.open();
    const tx = db.transaction(ENTRIES, 'readwrite');
    const done = transactionResult(tx);
    const store = tx.objectStore(ENTRIES);
    const request = store.get(key);
    request.onsuccess = () => {
      if (!request.result) return;
      request.result.lastUsedAt = now();
      store.put(request.result);
    };
    await done;
  }

  async list() {
    const db = await this.open();
    const tx = db.transaction(ENTRIES, 'readonly');
    const done = transactionResult(tx);
    const entries = await requestResult(tx.objectStore(ENTRIES).getAll());
    await done;
    return (entries || []).sort((a, b) => (b.lastUsedAt || b.updatedAt || 0) - (a.lastUsedAt || a.updatedAt || 0));
  }

  async deleteTrack(key) {
    const db = await this.open();
    const tx = db.transaction([ENTRIES, SEGMENTS, PCM], 'readwrite');
    const done = transactionResult(tx);
    deleteTrackRecords(tx, key);
    await done;
  }

  async pruneToLimit(limitBytes, activeKeys) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([ENTRIES, SEGMENTS, PCM], 'readwrite');
      const entryStore = tx.objectStore(ENTRIES);
      let evictedKeys = [];

      tx.oncomplete = () => resolve(evictedKeys);
      tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));

      const request = entryStore.getAll();
      request.onsuccess = () => {
        const entries = request.result || [];
        let usedBytes = entries.reduce((sum, entry) => sum + (Number(entry.byteLength) || 0), 0);
        const at = now();
        const candidates = entries
          .filter((entry) => !activeKeys.has(entry.key) && !hasLiveCapture(entry, at))
          .sort((a, b) => (a.lastUsedAt || a.updatedAt || 0) - (b.lastUsedAt || b.updatedAt || 0));
        for (const candidate of candidates) {
          if (usedBytes <= limitBytes) break;
          deleteTrackRecords(tx, candidate.key);
          usedBytes -= Number(candidate.byteLength) || 0;
          evictedKeys.push(cacheReference(candidate.key));
        }
      };
    });
  }

  async clear() {
    const db = await this.open();
    const tx = db.transaction([ENTRIES, SEGMENTS, PCM], 'readwrite');
    const done = transactionResult(tx);
    tx.objectStore(ENTRIES).clear();
    tx.objectStore(SEGMENTS).clear();
    tx.objectStore(PCM).clear();
    await done;
  }

  async usage() {
    const entries = await this.list();
    const audioBytes = entries.reduce((sum, entry) => sum + (Number(entry.byteLength) || 0), 0);
    let estimate = null;
    try { estimate = await navigator.storage?.estimate?.(); } catch { /* Quota estimates are optional. */ }
    let persistent = false;
    try { persistent = await navigator.storage?.persisted?.() || false; } catch { /* Optional. */ }
    return {
      audioBytes,
      cacheLimitBytes: await this.limitBytes(),
      entryCount: entries.length,
      completeCount: entries.filter((entry) => entry.state === 'complete').length,
      partialCount: entries.filter((entry) => entry.state !== 'complete').length,
      browserUsageBytes: Number(estimate?.usage) || null,
      browserQuotaBytes: Number(estimate?.quota) || null,
      persistent,
    };
  }

  async limitBytes() {
    try {
      const estimate = await navigator.storage?.estimate?.();
      const quota = Number(estimate?.quota) || 0;
      if (quota > 0) return Math.min(MAX_CACHE_BYTES, Math.floor(quota * CACHE_QUOTA_FRACTION));
    } catch { /* Use the conservative fallback if estimates are unavailable. */ }
    return FALLBACK_CACHE_BYTES;
  }
}

class AudioCacheService {
  constructor(backend = new IndexedDbAudioCacheBackend()) {
    this.backend = backend;
    this.activeKeys = new Map();
    this.writeQueue = Promise.resolve();
    this.trackMetadata = new Map();
    this.enabled = this.readEnabledPreference();
  }

  readEnabledPreference() {
    try {
      const value = localStorage.getItem(ENABLED_KEY);
      return value === null ? true : value === 'true';
    } catch { return true; }
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
    try { localStorage.setItem(ENABLED_KEY, String(this.enabled)); } catch { /* IndexedDB remains independently usable. */ }
    emitCacheEvent('wav2api-cache-state', { enabled: this.enabled });
    return this.enabled;
  }

  isEnabled() { return this.enabled; }

  markActive(key) {
    this.activeKeys.set(key, (this.activeKeys.get(key) || 0) + 1);
  }

  releaseActive(key) {
    const remaining = (this.activeKeys.get(key) || 1) - 1;
    if (remaining > 0) this.activeKeys.set(key, remaining);
    else this.activeKeys.delete(key);
  }

  async limitBytes() { return this.backend.limitBytes(); }

  async pruneToLimit() {
    const prune = async () => {
      const limit = await this.limitBytes();
      const evicted = await this.backend.pruneToLimit(limit, this.activeKeys);
      if (evicted.length) {
        emitCacheEvent('wav2api-cache-updated', { action: 'evict', count: evicted.length });
        emitCacheEvent('wav2api-cache-evicted', { count: evicted.length, cacheReferences: evicted });
      }
    };
    const result = this.writeQueue.then(prune, prune);
    this.writeQueue = result.catch(() => {});
    return result;
  }

  async appendSegment(key, captureId, sequence, startFrame, frameCount, bytes) {
    const write = async () => {
      const compressed = await compressPcm(bytes);
      const result = await this.backend.appendSegment(
        key,
        captureId,
        sequence,
        startFrame,
        frameCount,
        compressed,
        await this.limitBytes(),
        this.activeKeys,
      );
      if (result.evictedKeys.length) {
        emitCacheEvent('wav2api-cache-updated', { action: 'evict', count: result.evictedKeys.length });
        emitCacheEvent('wav2api-cache-evicted', { count: result.evictedKeys.length, cacheReferences: result.evictedKeys });
      }
      return result.storedBytes;
    };
    const result = this.writeQueue.then(write, write);
    this.writeQueue = result.catch(() => {});
    return result;
  }

  keyFor(catalogBase, providerId, trackId, revision) {
    if (!trackId || !revision) return '';
    let source;
    try {
      const url = new URL(catalogBase, location.href);
      url.username = '';
      url[['pass', 'word'].join('')] = '';
      url.search = '';
      url.hash = '';
      source = `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
    } catch { return ''; }
    return `wav2api:${CACHE_SCHEMA}:${encodeURIComponent(source)}:${encodeURIComponent(providerId || 'wav2api')}:${encodeURIComponent(trackId)}:${encodeURIComponent(revision)}:s16le`;
  }

  referenceForKey(key) { return key ? cacheReference(key) : ''; }

  async reverseBoundary(key, offset) {
    if (!this.enabled || !key) return null;
    const entry = await this.backend.getEntry(key);
    const coverage = reverseCoverage(entry, offset);
    if (!coverage) return null;
    return {start: coverage[0] / entry.sampleRate, end: coverage[1] / entry.sampleRate};
  }

  rememberTrack(key, track) {
    if (!key || !track) return;
    this.trackMetadata.set(key, {
      trackId: track.id || '',
      title: track.title || track.display_name || '',
      artist: track.artist || '',
      path: track.path || '',
      providerId: track.owned_by || 'wav2api',
      revision: track.revision || '',
      duration: Number(track.duration) || 0,
    });
  }

  async fetch(url, init, cacheKey) {
    const command = requestCommand(init);
    if (Number(command.direction) < 0) {
      if (!this.enabled || !cacheKey || command.probe) {
        return reverseUnavailable('倒放需要启用本机缓存，并位于已缓存范围内。');
      }
      try {
        const entry = await this.backend.getEntry(cacheKey);
        const coverage = reverseCoverage(entry, command.offset);
        if (!entry || !coverage) return reverseUnavailable('当前位置之前没有连续的本机缓存音频，播放位置保持不变。');
        const segments = await this.backend.listSegments(cacheKey);
        if (!segments.length) return reverseUnavailable('本机缓存分块不可用，播放位置保持不变。');
        await this.backend.touch(cacheKey);
        emitCacheEvent('wav2api-cache-hit', {cacheReference:cacheReference(cacheKey),direction:'reverse'});
        this.markActive(cacheKey);
        try {
          const response = createReverseCachedSseResponse(
            entry,
            segments,
            command,
            this.backend,
            error => this.emitError('read', error, cacheKey),
            () => this.releaseActive(cacheKey),
            cacheKey,
          );
          if (response.status !== 200) this.releaseActive(cacheKey);
          return response;
        } catch (error) {
          this.releaseActive(cacheKey);
          throw error;
        }
      } catch (error) {
        this.emitError('read', error, cacheKey);
        return reverseUnavailable('读取倒放缓存失败，播放位置保持不变。');
      }
    }
    if (!this.enabled || !cacheKey || command.probe) {
      return sourceHeader(await fetch(url, init), 'network');
    }

    let entry = null;
    try { entry = await this.backend.getEntry(cacheKey); }
    catch (error) {
      this.emitError('read', error, cacheKey);
    }
    if (entry?.state === 'complete' && hasFullCoverage(entry)) {
      try {
        await this.backend.touch(cacheKey);
        emitCacheEvent('wav2api-cache-hit', { cacheReference: cacheReference(cacheKey) });
        return await this.cachedResponse(cacheKey, entry, command);
      } catch (error) {
        this.emitError('read', error, cacheKey);
        try { await this.backend.deleteTrack(cacheKey); } catch { /* The network fallback remains available. */ }
      }
    }

    const response = await fetch(url, init);
    if (!response.ok || !response.body || typeof response.body.tee !== 'function') {
      return sourceHeader(response, 'network');
    }
    if (Number(command.offset) > 0 && !entry) return sourceHeader(response, 'network');
    const [playStream, cacheStream] = response.body.tee();
    const metadata = this.trackMetadata.get(cacheKey) || {};
    void this.captureStream(cacheStream, cacheKey, metadata, command).catch((error) => {
      this.emitError('write', error, cacheKey);
    });
    return sourceHeader(new Response(playStream, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    }), 'network');
  }

  emitError(operation, error, cacheKey, details = {}) {
    emitCacheEvent('wav2api-cache-error', {
      operation,
      action: operation === 'read' ? 'fallback-network' : 'continue-playback',
      message: operation === 'read'
        ? '本地缓存读取未完成；播放器将改用远端音频。'
        : '本地缓存写入未完成；本次播放继续使用远端音频。',
      cacheReference: cacheReference(cacheKey),
      bytesWritten: Number(details.bytesWritten) || 0,
      error: errorInfo(error),
    });
  }

  async captureStream(stream, cacheKey, trackMetadata, command) {
    const reader = stream.getReader();
    this.markActive(cacheKey);
    const decoder = new TextDecoder();
    let pending = '';
    let entry = null;
    let captureId = null;
    let sequence = 0;
    let frameCursor = 0;
    let sampleRate = 0;
    let channels = 0;
    let bytesWritten = 0;
    let captureOutcome = 'partial';
    let formatSeen = false;
    let chunkSeen = false;
    let streamComplete = false;
    const offset = Math.max(0, Number(command.offset) || 0);

    const consumeEvent = async (eventText) => {
      const data = eventText.split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n');
      if (!data) return;
      if (data === '[DONE]') {
        streamComplete = true;
        return;
      }
      let event;
      try { event = JSON.parse(data); } catch { return; }
      if (event.type === 'audio.format') {
        sampleRate = Number(event.rate) || 0;
        channels = Number(event.channels) || 0;
        const duration = Number(event.duration) || Number(trackMetadata.duration) || 0;
        if (!sampleRate || !channels || duration <= 0 || event.encoding && event.encoding !== 's16le') return;
        const cacheLimit = await this.limitBytes();
        const estimatedPcmBytes = duration * sampleRate * channels * 2;
        if (estimatedPcmBytes > cacheLimit) {
          captureOutcome = 'skipped-limit';
          this.emitError(
            'write',
            new Error(`曲目解码后的 PCM 预计超过本机缓存上限 ${Math.round(cacheLimit / 1024 / 1024)} MiB，已跳过持久化缓存`),
            cacheKey,
          );
          try { await reader.cancel(); } catch { /* Only the cache branch is cancelled. */ }
          return;
        }
        formatSeen = true;
        const meta = {
          ...trackMetadata,
          title: event.title || trackMetadata.title || event.display_name || '',
          artist: event.artist || trackMetadata.artist || '',
          path: event.path || trackMetadata.path || '',
          displayName: event.display_name || trackMetadata.title || '',
          duration,
          sampleRate,
          channels,
          encoding: event.encoding || 's16le',
          totalFrames: Math.round(duration * sampleRate),
        };
        captureId = await this.backend.beginCapture(cacheKey, meta);
        entry = meta;
        frameCursor = Math.round(offset * sampleRate);
        if (captureId) {
          emitCacheEvent('wav2api-cache-capture-start', {
            cacheReference: cacheReference(cacheKey),
            captureId,
          });
        }
      }
      const b64 = event.choices?.[0]?.delta?.content;
      if (typeof b64 !== 'string' || !formatSeen || !captureId) return;
      const bytes = base64ToBytes(b64);
      const frameBytes = channels * 2;
      const frameCount = Math.floor(bytes.byteLength / frameBytes);
      if (!frameCount) return;
      const aligned = bytes.subarray(0, frameCount * frameBytes);
      bytesWritten += await this.appendSegment(cacheKey, captureId, sequence, frameCursor, frameCount, aligned);
      sequence += 1;
      frameCursor += frameCount;
      chunkSeen = true;
    };

    try {
      while (true) {
        const result = await reader.read();
        if (result.done) break;
        pending += decoder.decode(result.value, { stream: true });
        let separator;
        while ((separator = /\r?\n\r?\n/.exec(pending))) {
          const eventText = pending.slice(0, separator.index);
          pending = pending.slice(separator.index + separator[0].length);
          await consumeEvent(eventText);
          if (streamComplete) break;
        }
        if (streamComplete) break;
      }
      pending += decoder.decode();
      if (!streamComplete && pending.trim()) await consumeEvent(pending);
      if (captureId) {
        const complete = await this.backend.finishCapture(
          cacheKey,
          captureId,
          streamComplete && formatSeen && chunkSeen,
          entry,
        );
        captureOutcome = complete ? 'complete' : 'partial';
        if (complete) emitCacheEvent('wav2api-cache-complete', { cacheReference: cacheReference(cacheKey) });
        else emitCacheEvent('wav2api-cache-partial', { cacheReference: cacheReference(cacheKey) });
      }
    } catch (error) {
      captureOutcome = 'error';
      try { await reader.cancel(error); } catch { /* The network branch can continue playing. */ }
      if (captureId) {
        try { await this.backend.finishCapture(cacheKey, captureId, false, entry); } catch { /* Keep playback independent. */ }
      }
      this.emitError('write', error, cacheKey, { bytesWritten });
    } finally {
      this.releaseActive(cacheKey);
      if (captureId) {
        emitCacheEvent('wav2api-cache-capture-end', {
          cacheReference: cacheReference(cacheKey),
          captureId,
          outcome: captureOutcome,
          bytesWritten,
        });
      }
      try { reader.releaseLock(); } catch { /* Stream may have been cancelled. */ }
    }
  }

  async cachedResponse(cacheKey, entry, command) {
    const segments = await this.backend.listSegments(cacheKey);
    if (!segments.length) throw new Error('完整缓存没有音频分块');
    this.markActive(cacheKey);
    try {
      return createCachedSseResponse(
        entry,
        segments,
        command,
        this.backend,
        (error) => this.emitError('read', error, cacheKey),
        () => this.releaseActive(cacheKey),
        cacheKey,
      );
    } catch (error) {
      this.releaseActive(cacheKey);
      throw error;
    }
  }

  async getEntry(cacheKey) { return this.backend.getEntry(cacheKey); }
  async hasTrack(cacheKey) { return (await this.backend.getEntry(cacheKey))?.state === 'complete'; }
  async list() { return this.backend.list(); }
  async usage() {
    await this.pruneToLimit();
    return this.backend.usage();
  }

  async deleteTrack(cacheKey) {
    await this.backend.deleteTrack(cacheKey);
    emitCacheEvent('wav2api-cache-updated', { action: 'delete' });
  }

  async clear() {
    await this.backend.clear();
    emitCacheEvent('wav2api-cache-updated', { action: 'clear' });
  }

  async requestPersistence() {
    if (!navigator.storage?.persist) return false;
    return navigator.storage.persist();
  }
}

function createCachedSseResponse(entry, segments, command, backend, onReadError, onClose, cacheKey) {
  const encoder = new TextEncoder();
  const rate = Number(entry.sampleRate) || 0;
  const channels = Number(entry.channels) || 0;
  const frameBytes = channels * 2;
  const duration = Number(entry.duration) || 0;
  const startFrame = Math.min(entry.totalFrames, Math.max(0, Math.round((Number(command.offset) || 0) * rate)));
  const chunkSetting = command.chunk_bytes;
  const maxBytes = Number.isFinite(Number(chunkSetting)) && Number(chunkSetting) > 0
    ? Math.max(frameBytes, Math.floor(Number(chunkSetting) / frameBytes) * frameBytes)
    : Infinity;
  const trackSegments = segments.slice().sort((a, b) => a.startFrame - b.startFrame || a.sequence - b.sequence);
  let segmentIndex = 0;
  let nextFrame = startFrame;
  let currentBytes = null;
  let currentOffset = 0;
  let formatSent = false;
  let doneSent = false;
  let closed = false;
  let lastTouchedAt = now();

  const release = () => {
    if (closed) return;
    closed = true;
    onClose?.();
  };

  const enqueue = (controller, value) => controller.enqueue(sseEvent(value));
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        if (!formatSent) {
          formatSent = true;
          enqueue(controller, {
            type: 'audio.format',
            rate,
            channels,
            bits: 16,
            encoding: entry.encoding || 's16le',
            duration,
            display_name: entry.displayName || entry.title || entry.trackId || '',
            title: entry.title || '',
            artist: entry.artist || '',
            path: entry.path || '',
            cached: true,
          });
          return;
        }

        if (!currentBytes) {
          while (segmentIndex < trackSegments.length) {
            const segment = trackSegments[segmentIndex++];
            const endFrame = segment.startFrame + segment.frameCount;
            if (endFrame <= nextFrame) continue;
            if (segment.startFrame > nextFrame) throw new Error('缓存分段不连续');
            const bytes = await backend.readPcm(segment.id);
            if (!bytes) throw new Error('缓存分段缺失');
            if (now() - lastTouchedAt >= CACHE_TOUCH_INTERVAL_MS) {
              try {
                await backend.touch(cacheKey);
                lastTouchedAt = now();
              } catch { /* Playback does not depend on LRU bookkeeping. */ }
            }
            const skipFrames = Math.max(0, nextFrame - segment.startFrame);
            currentBytes = bytes.subarray(skipFrames * frameBytes);
            currentOffset = 0;
            break;
          }
        }

        const remainingFrames = Math.max(0, entry.totalFrames - nextFrame);
        if (currentBytes && currentOffset < currentBytes.length && remainingFrames > 0) {
          const alignedMax = Number.isFinite(maxBytes) ? maxBytes : currentBytes.length;
          const end = Math.min(
            currentBytes.length,
            currentOffset + Math.max(frameBytes, alignedMax),
            currentOffset + remainingFrames * frameBytes,
          );
          const payload = bytesToBase64(currentBytes.subarray(currentOffset, end));
          const frames = (end - currentOffset) / frameBytes;
          currentOffset = end;
          nextFrame += frames;
          if (currentOffset >= currentBytes.length) currentBytes = null;
          enqueue(controller, {
            id: 'wav2api-local-cache',
            object: 'chat.completion.chunk',
            choices: [{ index: 0, delta: { content: payload }, finish_reason: null }],
          });
          return;
        }

        if (!doneSent) {
          doneSent = true;
          enqueue(controller, {
            id: 'wav2api-local-cache',
            object: 'chat.completion.chunk',
            choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
          });
          controller.enqueue(encoder.encode('data:[DONE]\n\n'));
          controller.close();
          release();
        }
      } catch (error) {
        onReadError?.(error);
        void backend.deleteTrack(entry.key).catch(() => {});
        controller.error(error);
        release();
      }
    },
    cancel() { release(); },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      'X-Wav2api-Cache-Source': 'cache',
    },
  });
}

function reversePcmFrames(bytes, frameBytes) {
  const frameCount = Math.floor(bytes.byteLength / frameBytes);
  const reversed = new Uint8Array(frameCount * frameBytes);
  for (let frame = 0; frame < frameCount; frame += 1) {
    const sourceStart = (frameCount - 1 - frame) * frameBytes;
    reversed.set(bytes.subarray(sourceStart, sourceStart + frameBytes), frame * frameBytes);
  }
  return reversed;
}

function createReverseCachedSseResponse(entry, segments, command, backend, onReadError, onClose, cacheKey) {
  const encoder = new TextEncoder();
  const rate = Number(entry.sampleRate) || 0;
  const channels = Number(entry.channels) || 0;
  const frameBytes = channels * 2;
  const startFrame = Math.min(entry.totalFrames, Math.max(0, Math.round((Number(command.offset) || 0) * rate)));
  const coverage = reverseCoverage(entry, command.offset);
  if (!rate || !frameBytes || !coverage || startFrame <= coverage[0]) {
    return reverseUnavailable('当前位置之前没有连续的本机缓存音频，播放位置保持不变。');
  }
  const lowerFrame = coverage[0];
  const chunkSetting = command.chunk_bytes;
  const maxBytes = Number.isFinite(Number(chunkSetting)) && Number(chunkSetting) > 0
    ? Math.max(frameBytes, Math.floor(Number(chunkSetting) / frameBytes) * frameBytes)
    : Infinity;
  const trackSegments = segments.slice()
    .sort((a, b) => b.startFrame - a.startFrame || b.sequence - a.sequence);
  let segmentIndex = 0;
  let nextFrame = startFrame;
  let currentBytes = null;
  let currentOffset = 0;
  let formatSent = false;
  let doneSent = false;
  let closed = false;
  let lastTouchedAt = now();

  const release = () => {
    if (closed) return;
    closed = true;
    onClose?.();
  };

  const enqueue = (controller, value) => controller.enqueue(sseEvent(value));
  const stream = new ReadableStream({
    async pull(controller) {
      try {
        if (!formatSent) {
          formatSent = true;
          enqueue(controller, {
            type: 'audio.format',
            rate,
            channels,
            bits: 16,
            encoding: entry.encoding || 's16le',
            duration: Number(entry.duration) || 0,
            offset: startFrame / rate,
            direction: -1,
            reverse_boundary: lowerFrame / rate,
            display_name: entry.displayName || entry.title || entry.trackId || '',
            title: entry.title || '',
            artist: entry.artist || '',
            path: entry.path || '',
            cached: true,
          });
          return;
        }

        if (!currentBytes && nextFrame > lowerFrame) {
          while (segmentIndex < trackSegments.length) {
            const segment = trackSegments[segmentIndex++];
            const segmentEnd = segment.startFrame + segment.frameCount;
            if (segment.startFrame >= nextFrame || segmentEnd <= lowerFrame) continue;
            if (segmentEnd < nextFrame) continue;
            const bytes = await backend.readPcm(segment.id);
            if (!bytes) throw new Error('倒放缓存分段缺失');
            if (now() - lastTouchedAt >= CACHE_TOUCH_INTERVAL_MS) {
              try {
                await backend.touch(cacheKey);
                lastTouchedAt = now();
              } catch { /* Playback does not depend on LRU bookkeeping. */ }
            }
            const endFrame = Math.min(nextFrame, segmentEnd);
            const segmentStart = Math.max(lowerFrame, segment.startFrame);
            if (endFrame <= segmentStart) continue;
            const from = (segmentStart - segment.startFrame) * frameBytes;
            const to = (endFrame - segment.startFrame) * frameBytes;
            currentBytes = reversePcmFrames(bytes.subarray(from, to), frameBytes);
            currentOffset = 0;
            break;
          }
          if (!currentBytes) throw new Error('倒放缓存区间不连续');
        }

        const remainingFrames = Math.max(0, nextFrame - lowerFrame);
        if (currentBytes && currentOffset < currentBytes.length && remainingFrames > 0) {
          const alignedMax = Number.isFinite(maxBytes) ? maxBytes : currentBytes.length;
          const end = Math.min(
            currentBytes.length,
            currentOffset + Math.max(frameBytes, alignedMax),
            currentOffset + remainingFrames * frameBytes,
          );
          const payload = bytesToBase64(currentBytes.subarray(currentOffset, end));
          const frames = (end - currentOffset) / frameBytes;
          currentOffset = end;
          nextFrame -= frames;
          if (currentOffset >= currentBytes.length) currentBytes = null;
          enqueue(controller, {
            id: 'wav2api-local-reverse-cache',
            object: 'chat.completion.chunk',
            choices: [{ index: 0, delta: { content: payload }, finish_reason: null }],
          });
          return;
        }

        if (!doneSent) {
          doneSent = true;
          enqueue(controller, {
            id: 'wav2api-local-reverse-cache',
            object: 'chat.completion.chunk',
            choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
          });
          controller.enqueue(encoder.encode('data:[DONE]\n\n'));
          controller.close();
          release();
        }
      } catch (error) {
        onReadError?.(error);
        controller.error(error);
        release();
      }
    },
    cancel() { release(); },
  });
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      'X-Wav2api-Cache-Source': 'cache',
    },
  });
}

const audioCache = new AudioCacheService();
if (typeof window !== 'undefined') {
  window.wav2apiAudioCache = audioCache;
  window.wav2apiCacheFetch = (url, init, cacheKey) => audioCache.fetch(url, init, cacheKey);
}

export { AudioCacheService, IndexedDbAudioCacheBackend, audioCache, CACHE_SCHEMA };
