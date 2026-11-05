// Expresión regular para detectar carpetas tipo locale: 'en-us', 'en_us', 'fr_ca', 'es-pe', etc.
const LOCALE_FOLDER_REGEX = /^[a-z]{2}[-_][a-z]{2}$/i;

// Mapeo común de TLD a código de país
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

    // 1. Buscar en la ruta de la URL (ej: /en-us/ o /es-pe/)
    for (const part of pathParts) {
      if (LOCALE_FOLDER_REGEX.test(part)) {
        return part.replace('_', '-');
      }
    }

    // 2. Si no viene en la ruta, inferir del dominio (ej: sanex.co.uk -> en-gb / elmex.fr -> fr-fr)
    const hostParts = parsed.hostname.toLowerCase().split('.');
    const tld = hostParts[hostParts.length - 1];
    if (TLD_COUNTRY_MAP[tld]) {
      return TLD_COUNTRY_MAP[tld]; // Retorna el código de país (ej. 'gb', 'fr')
    }

    // 3. Fallback al atributo lang del HTML
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      return htmlLang.toLowerCase().replace('_', '-');
    }
  } catch {}
  return 'en-us';
}

export function extractDamFolderNames() {
  const folderNames = new Set();
  const resources = [];

  // 1. URLs en memoria de red
  if (window.performance && window.performance.getEntriesByType) {
    window.performance.getEntriesByType('resource').forEach(r => {
      if (r.name) resources.push(r.name);
    });
  }

  // 2. URLs en el DOM
  document.querySelectorAll('img[src], source[srcset], link[href], script[src]').forEach(el => {
    const src = el.src || el.href || el.getAttribute('srcset');
    if (src) {
      src.split(',').forEach(part => resources.push(part.trim().split(' ')[0]));
    }
  });

  // 3. Extraer subcarpetas bajo /content/dam/ o /dam/
  resources.forEach(url => {
    if (!url.includes('/dam/')) return;
    try {
      const parsed = new URL(url, window.location.origin);
      const match = parsed.pathname.match(/\/dam\/([^?#]+)/);
      if (match && match[1]) {
        const segments = match[1].split('/').filter(Boolean);
        // Excluir el último segmento si es el archivo (contiene punto ej: .jpg, .svg)
        const folders = segments.filter(seg => !seg.includes('.'));
        folders.forEach(f => folderNames.add(f.toLowerCase()));
      }
    } catch {}
  });

  return Array.from(folderNames);
}

export function validateFolderStructure(folders, expectedLocale) {
  const expectedNormalized = expectedLocale.toLowerCase().replace('_', '-');
  const expectedParts = expectedNormalized.split('-'); // [idioma, pais] o [pais]

  const localesFound = [];
  const globalOrNeutral = [];
  const invalidLocales = [];

  folders.forEach(folder => {
    const normalizedFolder = folder.replace('_', '-');

    if (LOCALE_FOLDER_REGEX.test(normalizedFolder)) {
      localesFound.push(folder);

      // Comprobar si coincide con el locale esperado o al menos con el país
      const folderParts = normalizedFolder.split('-');
      const isMatch = (normalizedFolder === expectedNormalized) ||
                      (expectedParts.length > 1 && folderParts[1] === expectedParts[1]) ||
                      (expectedParts.includes(folderParts[1]));

      if (!isMatch) {
        invalidLocales.push(folder);
      }
    } else {
      globalOrNeutral.push(folder);
    }
  });

  return {
    expected: expectedNormalized,
    localesFound,
    invalidLocales,
    globalOrNeutral
  };
}

export function initFoldersModule(container) {
  const currentLocale = detectPageLocale(window.location.href);

  container.innerHTML = `
    <div class="folders-module" style="font-size:12px;">
      <div style="margin-bottom:12px;">
        <label class="field-label">Locale / Región esperada de la página:</label>
        <input type="text" id="expected-locale-input" class="field-input" value="${currentLocale}" />
        <small style="color:#94a3b8; font-size:11px;">Carpetas globales (global, icons, homepage) se ignoran automáticamente.</small>
      </div>

      <button id="btn-scan-folders" class="action-btn">🔍 Validar Carpetas de content/dam</button>

      <div id="folders-result" style="margin-top:14px; display:none;">
        <div id="folder-status-banner" style="padding:10px; border-radius:6px; font-weight:600; margin-bottom:12px;"></div>

        <div style="background:#1e293b; border:1px solid #334155; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div style="color:#38bdf8; font-weight:600; margin-bottom:6px;">Carpetas Regionales Detectadas:</div>
          <div id="locales-detected-list" style="color:#cbd5e1; font-family:monospace;"></div>
        </div>

        <div style="background:#141f33; border:1px solid #1e293b; border-radius:6px; padding:10px;">
          <div style="color:#94a3b8; font-weight:600; margin-bottom:6px;">Carpetas Neutras/Globales Ignoradas:</div>
          <div id="neutral-detected-list" style="color:#64748b; font-size:11px; max-height:100px; overflow-y:auto; font-family:monospace;"></div>
        </div>
      </div>
    </div>
  `;

  const btnScan = container.querySelector('#btn-scan-folders');
  const inputLocale = container.querySelector('#expected-locale-input');
  const resultBox = container.querySelector('#folders-result');
  const statusBanner = container.querySelector('#folder-status-banner');
  const localesList = container.querySelector('#locales-detected-list');
  const neutralList = container.querySelector('#neutral-detected-list');

  btnScan.addEventListener('click', () => {
    btnScan.disabled = true;
    const folders = extractDamFolderNames();
    const targetLocale = inputLocale.value.trim();
    const report = validateFolderStructure(folders, targetLocale);

    resultBox.style.display = 'block';

    if (report.invalidLocales.length > 0) {
      statusBanner.style.background = '#450a0a';
      statusBanner.style.color = '#fca5a5';
      statusBanner.style.border = '1px solid #ef4444';
      statusBanner.innerHTML = `❌ Se encontraron carpetas de otras regiones:<br><span style="font-family:monospace;">${report.invalidLocales.join(', ')}</span>`;
    } else {
      statusBanner.style.background = '#064e3b';
      statusBanner.style.color = '#6ee7b7';
      statusBanner.style.border = '1px solid #10b981';
      statusBanner.textContent = '✅ Correcto: Ninguna carpeta pertenece a una región o idioma ajeno.';
    }

    localesList.innerHTML = report.localesFound.length > 0 
      ? report.localesFound.map(f => {
          const isBad = report.invalidLocales.includes(f);
          return `<span style="display:inline-block; margin-right:8px; padding:2px 6px; border-radius:4px; background:${isBad ? '#7f1d1d' : '#065f46'}; color:#fff;">${f}</span>`;
        }).join('')
      : '<em>No se detectaron carpetas con patrón regional (todo es global).</em>';

    neutralList.textContent = report.globalOrNeutral.join(', ') || 'Ninguna';
    btnScan.disabled = false;
  });
}