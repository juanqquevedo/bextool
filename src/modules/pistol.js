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
      <div class="auth-bar" style="display:flex; justify-content:space-between; align-items:center; background:#141f33; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; margin-bottom:12px;">
        <span style="font-size:11px; color:#94a3b8;">¿Sesión IAP inactiva o expirada?</span>
        <button id="btn-login-pisdesk" type="button" style="background:#0284c7; color:#fff; border:none; border-radius:4px; padding:5px 10px; font-size:11px; font-weight:600; cursor:pointer;">
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

      <div id="frame-wrapper" class="frame-wrapper" style="display: none; margin-top:14px; border-top:1px solid #334155; padding-top:12px;">
        <div class="frame-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:600; font-size:11px; color:#38bdf8;">🖥️ Vista Previa PISDesk</span>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="btn-refresh-frame" type="button" style="background:#1e293b; border:1px solid #334155; color:#94a3b8; border-radius:4px; padding:2px 8px; font-size:11px; cursor:pointer;" title="Recargar vista">🔄</button>
            <span class="frame-badge" style="font-size:10px; background:#1e293b; border:1px solid #334155; padding:2px 6px; border-radius:4px; color:#94a3b8;">${detectedBrand}</span>
          </div>
        </div>
        <iframe id="pisdesk-inline-frame" name="pisdesk_inline_frame" class="inline-frame" style="width:100%; height:420px; background:#fff; border:1px solid #334155; border-radius:6px; box-sizing:border-box;"></iframe>
      </div>
    </div>
  `;

  const btnFire = container.querySelector('#btn-fire-pisdesk');
  const btnLogin = container.querySelector('#btn-login-pisdesk');
  const btnRefresh = container.querySelector('#btn-refresh-frame');
  const logBox = container.querySelector('#pistol-log');
  const frameWrapper = container.querySelector('#frame-wrapper');
  const inlineFrame = container.querySelector('#pisdesk-inline-frame');

  // Abre la ventana de login corporativo
  btnLogin.addEventListener('click', () => {
    logBox.textContent = 'Abriendo ventana de autenticación PISDesk...';
    const authWin = window.open(PISDESK_BASE, 'PISDesk_Auth_Window', 'width=600,height=700');
    
    if (!authWin) {
      logBox.textContent = '⚠️ Permite popups en tu navegador para autenticar.';
      return;
    }

    const checkInterval = setInterval(() => {
      if (authWin.closed) {
        clearInterval(checkInterval);
        logBox.textContent = '✅ Ventana cerrada. Haz clic en "🚀 Inspeccionar en Visor" o "🔄".';
      }
    }, 500);
  });

  const sendInspection = () => {
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
      logBox.innerHTML = '<span>✅ Petición procesada en el visor.</span>';
    };
  };

  btnFire.addEventListener('click', sendInspection);
  btnRefresh.addEventListener('click', sendInspection);
}