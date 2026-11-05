export function getCleanUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return rawUrl.split('?')[0].split('#')[0];
  }
}

export function detectBrand(url) {
  const lower = url.toLowerCase();
  if (lower.includes('colgate')) return 'Colgate';
  if (lower.includes('hills')) return 'Hills';
  return 'allOtherBrands';
}

export function initPistolModule(container, sourceUrl) {
  const clean = getCleanUrl(sourceUrl);
  const detectedBrand = detectBrand(sourceUrl);
  const PISDESK_BASE = 'https://prod-pisdesk.colgate.com';

  container.innerHTML = `
    <div class="pistol-form">
      <div class="auth-bar">
        <span class="auth-status-text">¿Primera vez hoy o sesión expirada?</span>
        <button id="btn-login-pisdesk" class="auth-btn" title="Inicia la sesión IAP de Google/Colgate en segundo plano">
          🔑 Iniciar Sesión PISDesk
        </button>
      </div>

      <label class="field-label">Sitio Destino:</label>
      <input type="text" class="field-input readonly-field" readonly value="${PISDESK_BASE}" />

      <label class="field-label">URL Limpia (sin parámetros ni anclas):</label>
      <input type="text" class="field-input readonly-field" readonly value="${clean}" />

      <label class="field-label">Marca Detectada:</label>
      <input type="text" class="field-input readonly-field" readonly value="${detectedBrand}" />

      <div class="actions-group">
        <button id="btn-fire-pisdesk" class="action-btn">🚀 Inspeccionar en Visor</button>
      </div>

      <div id="pistol-log" class="log-console">Listo para cargar vista previa.</div>

      <!-- Visor Integrado -->
      <div id="frame-wrapper" class="frame-wrapper" style="display: none;">
        <div class="frame-header">
          <span class="frame-title">🖥️ Vista Previa PISDesk</span>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="btn-refresh-frame" class="mini-btn" title="Recargar vista">🔄</button>
            <span class="frame-badge">${detectedBrand}</span>
          </div>
        </div>
        <iframe id="pisdesk-inline-frame" name="pisdesk_inline_frame" class="inline-frame"></iframe>
      </div>
    </div>
  `;

  const btnFire = container.querySelector('#btn-fire-pisdesk');
  const btnLogin = container.querySelector('#btn-login-pisdesk');
  const btnRefresh = container.querySelector('#btn-refresh-frame');
  const logBox = container.querySelector('#pistol-log');
  const frameWrapper = container.querySelector('#frame-wrapper');
  const inlineFrame = container.querySelector('#pisdesk-inline-frame');

  // Función para abrir popup de login IAP
  btnLogin.addEventListener('click', () => {
    logBox.textContent = 'Abriendo inicio de sesión en PISDesk...';
    const authWin = window.open(PISDESK_BASE, 'PISDesk_Auth_Window', 'width=550,height=650');
    
    if (!authWin) {
      logBox.textContent = '⚠️ Permite popups en el navegador para autenticar.';
      return;
    }

    // Monitorear si el popup se cerró tras autenticar
    const checkClosed = setInterval(() => {
      if (authWin.closed) {
        clearInterval(checkClosed);
        logBox.textContent = '✅ Sesión lista. Ya puedes inspeccionar en el visor.';
      }
    }, 500);
  });

  const sendInspectionRequest = () => {
    btnFire.disabled = true;
    logBox.textContent = 'Enviando petición a PISDesk...';
    frameWrapper.style.display = 'block';

    let targetEndpoint = '/inspectOtherCPBrand/preview';
    if (detectedBrand === 'Colgate') targetEndpoint = '/inspectColgate/preview';
    if (detectedBrand === 'Hills') targetEndpoint = '/inspectHills/preview';

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${PISDESK_BASE}${targetEndpoint}`;
    form.enctype = 'multipart/form-data';
    form.target = 'pisdesk_inline_frame';

    const inputUrl = document.createElement('input');
    inputUrl.type = 'hidden';
    inputUrl.name = 'url';
    inputUrl.value = clean;
    form.appendChild(inputUrl);

    const inputBrand = document.createElement('input');
    inputBrand.type = 'hidden';
    inputBrand.name = 'cpBrand';
    inputBrand.value = detectedBrand;
    form.appendChild(inputBrand);

    document.body.appendChild(form);
    form.submit();
    form.remove();

    inlineFrame.onload = () => {
      btnFire.disabled = false;
      logBox.innerHTML = `
        <span>✅ Vista procesada. Si ves error de "empty token", pulsa <strong>🔑 Iniciar Sesión PISDesk</strong> arriba.</span>
      `;
    };
  };

  btnFire.addEventListener('click', sendInspectionRequest);
  btnRefresh.addEventListener('click', sendInspectionRequest);
}