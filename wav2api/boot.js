// Runs before the module graph; diagnostics remain available after import failures.
(() => {
  const build = document.querySelector('meta[name="wav2api-build"]')?.content || 'unknown';
  const errors = [];
  let ready = false;
  let dialog;
  let message;
  let reportBox;
  let reportDetails;
  const safeURL = (value) => {
    try {
      const url = new URL(value, location.href);
      const version = url.searchParams.get('build');
      url.username = url.password = url.hash = url.search = '';
      if (version) url.searchParams.set('build', version);
      return url.href;
    } catch { return String(value); }
  };
  const redact = (value) => String(value)
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [redacted]')
    .replace(/([?&](?:key|token|api_key|secret)=)[^\s&#"']+/gi, '$1[redacted]')
    .replace(/\b(?:sk-|ghp_|gho_)[A-Za-z0-9_-]{12,}/g, '[redacted]');
  const report = () => {
    let player;
    try {
      const snapshot = window.__wav2api?.();
      if (snapshot) player = {
        state: snapshot.state, position: snapshot.position, buffered: snapshot.buffered,
        speed: snapshot.speed, retryAttempt: snapshot.retry_attempt, retryInMs: snapshot.retry_in_ms,
        reconnects: snapshot.reconnects, httpStatus: snapshot.http_status, chunks: snapshot.chunks,
        wireBytes: snapshot.wire_bytes, session: snapshot.session_id, route: snapshot.page?.route,
        endpoint: safeURL(snapshot.page?.base || ''),
      };
    } catch { /* The module may not have started. */ }
    return redact(JSON.stringify({
      application: 'wav2api', build, capturedAt: new Date().toISOString(),
      page: safeURL(location.href), ready, secureContext: window.isSecureContext,
      userAgent: navigator.userAgent, online: navigator.onLine,
      viewport: { width: innerWidth, height: innerHeight, pixelRatio: devicePixelRatio },
      serviceWorker: navigator.serviceWorker?.controller?.scriptURL
        ? safeURL(navigator.serviceWorker.controller.scriptURL) : null,
      errors, player,
      assets: performance.getEntriesByType('resource')
        .filter((entry) => /\/(app\.(?:js|css)|boot\.js|playback-policy\.js|connection-settings\.js|sw\.js|pkg\/)/.test(new URL(entry.name).pathname))
        .map((entry) => ({ url: safeURL(entry.name), durationMs: Math.round(entry.duration),
          transferredBytes: entry.transferSize, status: entry.responseStatus })),
    }, null, 2));
  };
  const recover = async (button) => {
    button.disabled = true;
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => key.startsWith('wav2api-')).map((key) => caches.delete(key)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.filter((item) => {
          const worker = item.active || item.waiting || item.installing;
          return worker && new URL(worker.scriptURL).pathname === new URL('./sw.js', location.href).pathname;
        }).map((item) => item.unregister()));
      }
    } catch { /* Versioned URLs can recover even where cache APIs are unavailable. */ }
    location.replace(`${location.pathname}?reload=${Date.now()}`);
  };
  const fail = (reason, context = {}) => {
    errors.push({ at: new Date().toISOString(), message: redact(reason), ...context });
    if (errors.length > 20) errors.shift();
    clearTimeout(timer);
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => show(), { once: true });
    } else show();
  };
  const show = () => {
    if (dialog) {
      reportBox.value = report();
      if (!dialog.open) dialog.showModal();
      return;
    }
    dialog = document.createElement('dialog');
    dialog.className = 'settings-dialog startup-error';
    dialog.setAttribute('aria-labelledby', 'startupErrorTitle');
    const title = document.createElement('h2');
    title.id = 'startupErrorTitle';
    title.textContent = '播放器加载遇到问题';
    message = document.createElement('p');
    message.textContent = errors[0]?.message.slice(0, 1800) || '未知错误';
    const hint = document.createElement('p');
    hint.textContent = '可先复制诊断信息，再清理播放器缓存并重载；也可关闭提示检查连接设置。';
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = '复制诊断信息';
    const copyStatus = document.createElement('p');
    copyStatus.setAttribute('role', 'status');
    reportDetails = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = '查看诊断信息';
    reportBox = document.createElement('textarea');
    reportBox.readOnly = true;
    reportBox.setAttribute('aria-label', '可复制的错误诊断信息');
    reportBox.value = report();
    reportDetails.append(summary, reportBox);
    copy.onclick = async () => {
      reportBox.value = report();
      try {
        if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
        await navigator.clipboard.writeText(reportBox.value);
        copyStatus.textContent = '诊断信息已复制';
      } catch {
        // EasyTier HTTP may lack Clipboard API. Keep the manual selection fallback visible.
        reportDetails.open = true;
        reportBox.focus();
        reportBox.select();
        reportBox.setSelectionRange(0, reportBox.value.length);
        let copied = false;
        try { copied = document.execCommand('copy'); } catch { /* Manual selection remains. */ }
        copyStatus.textContent = copied ? '诊断信息已复制' : '已选中诊断信息，请长按或使用系统复制';
      }
    };
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = '清理缓存并重载';
    retry.onclick = () => recover(retry);
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '关闭提示';
    close.onclick = () => dialog.close();
    dialog.append(title, message, hint, copy, retry, close, copyStatus, reportDetails);
    document.body.append(dialog);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else window.alert(`${title.textContent}\n${message.textContent}\n${report()}`);
  };
  const timer = setTimeout(() => { if (!ready) fail('加载超过 20 秒，请检查网络或重新加载。'); }, 20000);
  window.wav2apiBoot = { build, fail, ready: () => { ready = true; clearTimeout(timer); } };
  window.addEventListener('error', (event) => {
    if (event.target instanceof HTMLScriptElement) fail(`脚本加载失败：${safeURL(event.target.src)}`);
    else if (event.error || event.message) fail(`页面运行出错：${event.message || event.error}`, {
      file: safeURL(event.filename || ''), line: event.lineno, column: event.colno,
      stack: redact(event.error?.stack || ''),
    });
  }, true);
  window.addEventListener('unhandledrejection', (event) => fail(`未处理的页面错误：${event.reason?.message || event.reason}`, {
    stack: redact(event.reason?.stack || ''),
  }));
})();
