const LOCALE_FOLDER_REGEX = /^[a-z]{2}[-_][a-z]{2}$/i;

const TLD_COUNTRY_MAP = {
  'uk': 'gb',
  'pe': 'pe',
  'fr': 'fr',
  'mx': 'mx',
  'br': 'br',
  'co': 'co',
  'cl': 'cl',
  'de': 'de',
  'it': 'it',
  'es': 'es'
};

export function detectPageLocale(url) {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.toLowerCase().split('/').filter(Boolean);

    for (const part of pathParts) {
      if (LOCALE_FOLDER_REGEX.test(part)) {
        return part.replace('_', '-');
      }
    }

    const hostParts = parsed.hostname.toLowerCase().split('.');
    const tld = hostParts[hostParts.length - 1];
    if (TLD_COUNTRY_MAP[tld]) {
      return TLD_COUNTRY_MAP[tld];
    }

    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      return htmlLang.toLowerCase().replace('_', '-');
    }
  } catch {}
  return 'en-us';
}

// Extrae tanto las carpetas como la ruta completa de cada recurso en /dam/
export function extractDamResources() {
  const urls = new Set();

  // 1. Recursos en memoria de red
  if (window.performance && window.performance.getEntriesByType) {
    window.performance.getEntriesByType('resource').forEach(r => {
      if (r.name && r.name.includes('/dam/')) {
        urls.add(r.name);
      }
    });
  }

  // 2. Recursos en elementos del DOM
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
  const invalidEntries = []; // Guarda { folder, pathname, fullUrl }

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
          // Evitar duplicados exactos de la misma ruta y carpeta
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

        <!-- Lista detallada de rutas infractoras -->
        <div id="invalid-paths-box" style="display:none; background:#1e1b24; border:1px solid #ef4444; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div style="color:#f87171; font-weight:600; margin-bottom:8px;">🚨 Rutas exactas con región incorrecta:</div>
          <div id="invalid-paths-list" style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;"></div>
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

  btnScan.addEventListener('click', () => {
    btnScan.disabled = true;
    const resources = extractDamResources();
    const targetLocale = inputLocale.value.trim();
    const report = validateFolderStructure(resources, targetLocale);

    resultBox.style.display = 'block';

    if (report.invalidEntries.length > 0) {
      statusBanner.style.background = '#450a0a';
      statusBanner.style.color = '#fca5a5';
      statusBanner.style.border = '1px solid #ef4444';
      statusBanner.textContent = `❌ Se encontraron ${report.invalidEntries.length} recurso(s) en carpetas de otra región.`;

      invalidPathsBox.style.display = 'block';
      invalidPathsList.innerHTML = report.invalidEntries.map(entry => {
        // Resaltar en rojo la carpeta infractora dentro de la ruta completa
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
    }

    const invalidFolderNames = new Set(report.invalidEntries.map(e => e.folder));

    localesList.innerHTML = report.localesFound.length > 0
      ? report.localesFound.map(f => {
          const isBad = invalidFolderNames.has(f);
          return `<span style="display:inline-block; margin:2px 6px 2px 0; padding:2px 6px; border-radius:4px; background:${isBad ? '#7f1d1d' : '#065f46'}; color:#fff;">${f}</span>`;
        }).join('')
      : '<em>No se detectaron carpetas con patrón regional (todo es global).</em>';

    neutralList.textContent = report.globalOrNeutral.join(', ') || 'Ninguna';
    btnScan.disabled = false;
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}