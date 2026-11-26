const STORAGE_KEY = 'bextool_jira_credentials';

export function getJiraConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { domain: '', email: '', apiToken: '' };
  } catch {
    return { domain: '', email: '', apiToken: '' };
  }
}

export function saveJiraConfig({ domain, email, apiToken }) {
  // Limpiar protocolo o slashes finales (ej: "colgate.atlassian.net")
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '').trim();
  const payload = {
    domain: cleanDomain,
    email: email.trim(),
    apiToken: apiToken.trim(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function hasValidJiraConfig() {
  const cfg = getJiraConfig();
  return Boolean(cfg.domain && cfg.email && cfg.apiToken);
}