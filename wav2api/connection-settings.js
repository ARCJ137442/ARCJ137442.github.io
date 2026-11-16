// Portable defaults and one-time migration of pre-proxy development settings.
export function defaultConnections(origin) {
  return { directBase: `${origin}/catalog/v1`, catalogBase: `${origin}/catalog/v1`, magpieBase: `${origin}/gateway/v1` };
}
export function migrateConnectionPrefs(stored, origin) {
  const prefs = { ...stored };
  if (prefs.connectionSchema !== 4) {
    const defaults = defaultConnections(origin);
    for (const field of ['directBase', 'catalogBase', 'magpieBase']) {
      const port = field === 'magpieBase' ? '3425' : '18765';
      try {
        const url = new URL(prefs[field]);
        if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
            && url.protocol === 'http:' && url.port === port && url.pathname.replace(/\/$/, '') === '/v1') {
          prefs[field] = defaults[field];
        }
      } catch { /* Missing fields use defaults; custom values remain editable. */ }
    }
    prefs.connectionSchema = 4;
  }
  return prefs;
}
