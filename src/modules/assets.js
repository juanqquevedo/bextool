import { ENV } from '../config/env.js';
import { getParentIssueDetails, createLinkedBug } from '../services/jiraService.js';

const LOCALE_FOLDER_REGEX = /^[a-z]{2}[-_][a-z]{2}$/i;

// Configuración exclusiva de este módulo
const ASSETS_BUG_CUSTOM_FIELDS = {
  customfield_13292: { id: '16803' }, // Asset Storage: DAM Folder Structure
  customfield_13293: { id: '16844' }, // Recomendation
  customfield_14327: { id: '17881' }, // Low
};

// Mapa condicional: Team (nombre exacto o ID) -> Opción de customfield_14394
const TEAM_TO_CF14394_MAP = {
  // 'Nombre exacto del Team': { id: '12345' },
  'BEX - LATAM Web': { id: '18102'},
  'BEX EUROPE Web': { id: '18096'},
  'BEX NA + Others WEB': { id: '18098'},
  'BEX Hills team': { id: '18101'},
};

const TLD_LOCALE_MAP = {
  'uk': 'en-gb',
  'pe': 'es-pe',
  'fr': 'fr-fr',
  'mx': 'es-mx',
  'br': 'pt-br',
  'co': 'es-co',
  'cl': 'es-cl',
  'de': 'de-de',
  'it': 'it-it',
  'es': 'es-es',
  'ar': 'es-ar'
};

function resolveCustomField14394(teamName, teamId) {
  if (!teamName && !teamId) return undefined;

  const normalizedName = (teamName || '').toLowerCase().trim();
  for (const [key, optionValue] of Object.entries(TEAM_TO_CF14394_MAP)) {
    if (key.toLowerCase().trim() === normalizedName || key === teamId) {
      return optionValue;
    }
  }

  console.warn(`[BEX Tool] Sin mapeo en customfield_14394 para el Team: "${teamName}" (${teamId})`);
  return undefined;
}

function addBusinessDays(businessDaysToAdd) {
  const date = new Date();
  let added = 0;

  while (added < businessDaysToAdd) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function detectPageLocale(url) {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.toLowerCase().split('/').filter(Boolean);

    for (const part of pathParts) {
      if (LOCALE_FOLDER_REGEX.test(part)) {
        return part.replace('_', '-');
      }
    }

    const htmlLang = document.documentElement.lang;
    if (htmlLang && LOCALE_FOLDER_REGEX.test(htmlLang.trim())) {
      return htmlLang.trim().toLowerCase().replace('_', '-');
    }

    const hostParts = parsed.hostname.toLowerCase().split('.');
    const tld = hostParts[hostParts.length - 1];
    if (TLD_LOCALE_MAP[tld]) {
      return TLD_LOCALE_MAP[tld];
    }
  } catch {}
  return 'en-us';
}

function formatLanguageCountry(locale) {
  const normalized = (locale || '').trim().replace('_', '-');
  const parts = normalized.split('-');
  if (parts.length === 2) {
    const [lang, country] = parts;
    return `${lang.toUpperCase()}-${country.toUpperCase()}`;
  }
  return normalized.toUpperCase();
}

function inferBrandFromUrl(url) {
  const lower = (url || '').toLowerCase();
  if (lower.includes('hillspet') || lower.includes('hills')) return "Hill's";
  if (lower.includes('colgate')) return 'Colgate';
  if (lower.includes('elmex')) return 'Elmex';
  if (lower.includes('meridol')) return 'Meridol';
  if (lower.includes('sanex')) return 'Sanex';
  if (lower.includes('palmolive')) return 'Palmolive';
  return 'Unknown Brand';
}

export function extractDamResources() {
  const urls = new Set();

  if (window.performance && window.performance.getEntriesByType) {
    window.performance.getEntriesByType('resource').forEach(r => {
      if (r.name && r.name.includes('/dam/')) {
        urls.add(r.name);
      }
    });
  }

  document.querySelectorAll('img[src], source[srcset], link[href], script[src]').forEach(el => {
    const src = el.src || el.href || el.getAttribute('srcset');
    if (src && src.includes('/dam/')) {
      src.split(',').forEach(part => {
        const cleanPart = part.trim().split(' ')[0];
        if (cleanPart.includes('/dam/')) {
          urls.add(cleanPart);
        }
      });
    }
  });

  const parsedResources = [];

  urls.forEach(rawUrl => {
    try {
      const parsed = new URL(rawUrl, window.location.origin);
      const match = parsed.pathname.match(/\/dam\/([^?#]+)/);
      if (match && match[1]) {
        const segments = match[1].split('/').filter(Boolean);
        const folders = segments.filter(seg => !seg.includes('.')).map(f => f.toLowerCase());

        parsedResources.push({
          fullUrl: parsed.href,
          pathname: parsed.pathname,
          folders
        });
      }
    } catch {}
  });

  return parsedResources;
}

export function validateFolderStructure(resources, expectedLocale) {
  const expectedNormalized = expectedLocale.toLowerCase().replace('_', '-');
  const expectedParts = expectedNormalized.split('-');

  const localesFound = new Set();
  const globalOrNeutral = new Set();
  const invalidEntries = [];

  resources.forEach(res => {
    res.folders.forEach(folder => {
      const normalizedFolder = folder.replace('_', '-');

      if (LOCALE_FOLDER_REGEX.test(normalizedFolder)) {
        localesFound.add(folder);

        const folderParts = normalizedFolder.split('-');
        const isMatch = (normalizedFolder === expectedNormalized) ||
                        (expectedParts.length > 1 && folderParts[1] === expectedParts[1]) ||
                        (expectedParts.includes(folderParts[1]));

        if (!isMatch) {
          const alreadyLogged = invalidEntries.some(
            e => e.pathname === res.pathname && e.folder === folder
          );
          if (!alreadyLogged) {
            invalidEntries.push({
              folder,
              pathname: res.pathname,
              fullUrl: res.fullUrl
            });
          }
        }
      } else {
        globalOrNeutral.add(folder);
      }
    });
  });

  return {
    expected: expectedNormalized,
    localesFound: Array.from(localesFound),
    invalidEntries,
    globalOrNeutral: Array.from(globalOrNeutral)
  };
}

export function initFoldersModule(container) {
  if (window.location.hostname === ENV.JIRA_DOMAIN) {
    renderJiraReceiverMode(container);
    return;
  }

  renderStoreAuditMode(container);
}

// =========================================================================
// MODO 1: ESCÁNER EN LA TIENDA
// =========================================================================
function renderStoreAuditMode(container) {
  const currentLocale = detectPageLocale(window.location.href);

  container.innerHTML = `
    <div class="folders-module" style="font-size:12px;">
      <div style="margin-bottom:12px;">
        <label class="field-label">Locale / Región esperada de la página:</label>
        <input type="text" id="expected-locale-input" class="field-input" value="${currentLocale}" />
        <small style="color:#94a3b8; font-size:11px;">Carpetas globales (global, icons, homepage) se aprueban automáticamente.</small>
      </div>

      <button id="btn-scan-folders" class="action-btn">🔍 Validar Carpetas de content/dam</button>

      <div id="folders-result" style="margin-top:14px; display:none;">
        <div id="folder-status-banner" style="padding:10px; border-radius:6px; font-weight:600; margin-bottom:12px;"></div>

        <div id="invalid-paths-box" style="display:none; background:#1e1b24; border:1px solid #ef4444; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div style="color:#f87171; font-weight:600; margin-bottom:8px;">🚨 Rutas exactas con región incorrecta:</div>
          <div id="invalid-paths-list" style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;"></div>
        </div>

        <div id="jira-bug-box" style="display:none; background:#0f172a; border:1px solid #38bdf8; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div style="color:#38bdf8; font-weight:600; margin-bottom:6px;">🐞 Reportar Bug en Jira (${ENV.JIRA_DOMAIN})</div>
          <label class="field-label">Ticket Principal (Parent Key):</label>
          <input type="text" id="parent-issue-key" class="field-input" placeholder="Ej: BEX-47635" style="margin-bottom:8px;" />
          
          <button id="btn-send-to-jira" type="button" class="action-btn" style="background:#0284c7; width:100%;">
            ↗ Abrir en Jira y Crear Bug Linked
          </button>
          <div id="jira-bridge-hint" style="margin-top:6px; font-size:10px; color:#94a3b8;">
            Se abrirá Jira en una nueva pestaña. Al cargar, pulsa el marcador <strong>BEX Tool</strong> allí para crear el ticket automáticamente.
          </div>
        </div>

        <div style="background:#1e293b; border:1px solid #334155; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div style="color:#38bdf8; font-weight:600; margin-bottom:6px;">Carpetas Regionales Detectadas:</div>
          <div id="locales-detected-list" style="color:#cbd5e1; font-family:monospace;"></div>
        </div>

        <div style="background:#141f33; border:1px solid #1e293b; border-radius:6px; padding:10px;">
          <div style="color:#94a3b8; font-weight:600; margin-bottom:6px;">Carpetas Neutras/Globales Ignoradas:</div>
          <div id="neutral-detected-list" style="color:#64748b; font-size:11px; max-height:90px; overflow-y:auto; font-family:monospace;"></div>
        </div>
      </div>
    </div>
  `;

  const btnScan = container.querySelector('#btn-scan-folders');
  const inputLocale = container.querySelector('#expected-locale-input');
  const resultBox = container.querySelector('#folders-result');
  const statusBanner = container.querySelector('#folder-status-banner');
  const invalidPathsBox = container.querySelector('#invalid-paths-box');
  const invalidPathsList = container.querySelector('#invalid-paths-list');
  const localesList = container.querySelector('#locales-detected-list');
  const neutralList = container.querySelector('#neutral-detected-list');
  const jiraBugBox = container.querySelector('#jira-bug-box');
  const btnSendToJira = container.querySelector('#btn-send-to-jira');

  let lastReport = null;

  btnScan.addEventListener('click', () => {
    btnScan.disabled = true;
    const resources = extractDamResources();
    const targetLocale = inputLocale.value.trim();
    lastReport = validateFolderStructure(resources, targetLocale);

    resultBox.style.display = 'block';

    if (lastReport.invalidEntries.length > 0) {
      statusBanner.style.background = '#450a0a';
      statusBanner.style.color = '#fca5a5';
      statusBanner.style.border = '1px solid #ef4444';
      statusBanner.textContent = `❌ Se encontraron ${lastReport.invalidEntries.length} recurso(s) en carpetas de otra región.`;

      invalidPathsBox.style.display = 'block';
      jiraBugBox.style.display = 'block';

      invalidPathsList.innerHTML = lastReport.invalidEntries.map(entry => {
        const highlightedPath = escapeHtml(entry.pathname).replace(
          new RegExp(`(${entry.folder})`, 'gi'),
          '<span style="background:#991b1b; color:#fff; padding:1px 4px; border-radius:3px; font-weight:700;">$1</span>'
        );

        return `
          <div style="background:#0f172a; border:1px solid #334155; border-radius:4px; padding:6px 8px; font-family:monospace; font-size:11px; word-break:break-all; color:#e2e8f0;">
            <div style="margin-bottom:4px;">${highlightedPath}</div>
            <a href="${entry.fullUrl}" target="_blank" style="color:#38bdf8; text-decoration:none; font-size:10px;">↗ Abrir asset en nueva pestaña</a>
          </div>
        `;
      }).join('');
    } else {
      statusBanner.style.background = '#064e3b';
      statusBanner.style.color = '#6ee7b7';
      statusBanner.style.border = '1px solid #10b981';
      statusBanner.textContent = '✅ Correcto: Ninguna carpeta pertenece a una región o idioma ajeno.';
      invalidPathsBox.style.display = 'none';
      invalidPathsList.innerHTML = '';
      jiraBugBox.style.display = 'none';
    }

    const invalidFolderNames = new Set(lastReport.invalidEntries.map(e => e.folder));

    localesList.innerHTML = lastReport.localesFound.length > 0
      ? lastReport.localesFound.map(f => {
          const isBad = invalidFolderNames.has(f);
          return `<span style="display:inline-block; margin:2px 6px 2px 0; padding:2px 6px; border-radius:4px; background:${isBad ? '#7f1d1d' : '#065f46'}; color:#fff;">${f}</span>`;
        }).join('')
      : '<em>No se detectaron carpetas con patrón regional (todo es global).</em>';

    neutralList.textContent = lastReport.globalOrNeutral.join(', ') || 'Ninguna';
    btnScan.disabled = false;
  });

  btnSendToJira.addEventListener('click', () => {
    const parentKey = container.querySelector('#parent-issue-key').value.trim().toUpperCase();
    if (!parentKey) {
      alert('Ingresa el ID del ticket principal (ej. BEX-47635).');
      return;
    }

    const payload = {
      parentKey,
      locale: inputLocale.value.trim(),
      auditedUrl: window.location.href,
      invalidPaths: lastReport.invalidEntries.map(e => e.pathname),
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
    window.open(`https://${ENV.JIRA_DOMAIN}/browse/${parentKey}#bextool_bug=${encoded}`, '_blank');
  });
}

// =========================================================================
// MODO 2: RECEPTOR EN JIRA (Same-Origin, sin CORS ni API Tokens)
// =========================================================================
function renderJiraReceiverMode(container) {
  const hash = window.location.hash;
  let pendingData = null;

  if (hash.startsWith('#bextool_bug=')) {
    try {
      const rawJson = decodeURIComponent(hash.replace('#bextool_bug=', ''));
      pendingData = JSON.parse(rawJson);
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {}
  }

  if (!pendingData) {
    const urlMatch = window.location.pathname.match(/\/browse\/([A-Z]+-\d+)/i);
    const detectedKey = urlMatch ? urlMatch[1].toUpperCase() : '';

    container.innerHTML = `
      <div style="font-size:12px; background:#141f33; border:1px solid #334155; border-radius:6px; padding:12px;">
        <div style="color:#38bdf8; font-weight:600; margin-bottom:6px;">🟢 Modo Jira Activo</div>
        <p style="color:#cbd5e1; margin:0 0 8px 0;">
          No hay un reporte de auditoría DAM pendiente en esta URL.
        </p>
        <p style="color:#94a3b8; font-size:11px; margin:0;">
          1. Ve a una tienda (ej. hillspet.cl) y ejecuta la validación en <strong>Assets Folders</strong>.<br>
          2. Pulsa <strong>"↗ Abrir en Jira y Crear Bug Linked"</strong>.<br>
          3. Cuando abra esta pestaña, vuelve a pulsar el marcador <strong>BEX Tool</strong>.
        </p>
        ${detectedKey ? `<div style="margin-top:10px; font-size:11px; color:#6ee7b7;">Ticket actual detectado: <strong>${detectedKey}</strong></div>` : ''}
      </div>
    `;
    return;
  }

  const pathsPreview = pendingData.invalidPaths.map(p => `• ${p}`).join('\n');

  container.innerHTML = `
    <div style="font-size:12px;">
      <div style="background:#064e3b; border:1px solid #10b981; color:#a7f3d0; padding:8px 10px; border-radius:6px; margin-bottom:10px; font-size:11px;">
        ✅ Datos recibidos desde <strong>${escapeHtml(pendingData.auditedUrl)}</strong>
      </div>

      <label class="field-label">Ticket Principal (Parent):</label>
      <input type="text" id="jira-parent-key" class="field-input readonly-field" readonly value="${escapeHtml(pendingData.parentKey)}" />

      <label class="field-label">Rutas infractoras a reportar (${pendingData.invalidPaths.length}):</label>
      <textarea readonly class="field-input" style="height:90px; font-family:monospace; font-size:10px; resize:none;">${escapeHtml(pathsPreview)}</textarea>

      <button id="btn-confirm-create-bug" class="action-btn" style="background:#dc2626; width:100%; margin-top:8px;">
        🚀 Confirmar y Crear Bug Linked
      </button>

      <div id="jira-exec-log" class="log-console" style="margin-top:8px;">Listo para crear ticket en Jira.</div>
    </div>
  `;

  const btnConfirm = container.querySelector('#btn-confirm-create-bug');
  const logBox = container.querySelector('#jira-exec-log');

  btnConfirm.addEventListener('click', async () => {
    btnConfirm.disabled = true;
    const parentKey = container.querySelector('#jira-parent-key').value.trim();

    try {
      logBox.textContent = `⏳ Leyendo campos de ${parentKey}...`;
      const parentDetails = await getParentIssueDetails(parentKey);

      const brand = parentDetails.brand || inferBrandFromUrl(pendingData.auditedUrl);
      const langCountry = formatLanguageCountry(pendingData.locale);
      const bugSummary = `Asset Storage: DAM Folder Structure | Non local asset (Reco) ${brand} ${langCountry}:`;
      const calculatedDueDate = addBusinessDays(5);

      const descriptionText =
        `Assets were detected under /content/dam/ whose regional folder does not match the expected page locale (${pendingData.locale}).\n\n` +
        `Audited URL: ${pendingData.auditedUrl}\n\n` +
        `Detected asset paths:\n${pendingData.invalidPaths.map(p => `- ${p}`).join('\n')}`;

      const cf14394Value = resolveCustomField14394(parentDetails.teamName, parentDetails.teamId);

      const bugCustomFields = {
        ...ASSETS_BUG_CUSTOM_FIELDS,
        ...(parentDetails.teamId && { customfield_10001: parentDetails.teamId }),
        ...(cf14394Value && { customfield_14394: cf14394Value }),
      };

      logBox.textContent = '⏳ Creando Bug y vinculando al ticket principal...';
      const createdBug = await createLinkedBug({
        parentDetails,
        bugSummary,
        descriptionText,
        linkType: ENV.JIRA_DEFAULT_LINK_TYPE,
        customFields: bugCustomFields,
        labels: [],
        dueDate: calculatedDueDate,
        assigneeAccountId: parentDetails.assigneeAccountId,
      });

      logBox.innerHTML = `✅ Bug creado y vinculado: <a href="/browse/${createdBug.key}" target="_blank" style="color:#38bdf8; font-weight:700;">${createdBug.key}</a>`;
    } catch (err) {
      logBox.textContent = `❌ ${err.message}`;
      btnConfirm.disabled = false;
    }
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}