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
      <label class="field-label">Sitio Destino (Fijo):</label>
      <input type="text" class="field-input readonly-field" readonly value="${PISDESK_BASE}" />

      <label class="field-label">URL Limpia detectada:</label>
      <input type="text" class="field-input readonly-field" readonly value="${clean}" />

      <label class="field-label">Marca Detectada:</label>
      <input type="text" class="field-input readonly-field" readonly value="${detectedBrand}" />

      <div class="actions-group">
        <button id="btn-fire-pisdesk" class="action-btn">🚀 Disparar en PISDesk (1 Solo Clic)</button>
      </div>
      
      <div id="pistol-log" class="log-console">Listo para disparar.</div>
    </div>
  `;

  const btnFire = container.querySelector('#btn-fire-pisdesk');
  const logBox = container.querySelector('#pistol-log');

  btnFire.addEventListener('click', async () => {
    logBox.textContent = 'Configurando marca y abriendo inspección...';

    // 1. Determinar el endpoint final según la marca
    let targetFormaction = '/inspectOtherCPBrand/preview';
    if (detectedBrand === 'Colgate') targetFormaction = '/inspectColgate/preview';
    if (detectedBrand === 'Hills') targetFormaction = '/inspectHills/preview';

    // 2. Establecer una ventana objetivo con un nombre único
    const targetWindowName = 'PISDesk_Target_Tab';

    // 3. Crear el formulario 1: Selección de marca (se envía a un iframe invisible para fijar la sesión/cookie)
    const hiddenIframe = document.createElement('iframe');
    hiddenIframe.name = 'pisdesk_session_frame';
    hiddenIframe.style.display = 'none';
    document.body.appendChild(hiddenIframe);

    const formBrand = document.createElement('form');
    formBrand.method = 'POST';
    formBrand.action = `${PISDESK_BASE}/selectCPBrand`;
    formBrand.target = 'pisdesk_session_frame'; // Se ejecuta en el iframe oculto

    const inputBrand = document.createElement('input');
    inputBrand.type = 'hidden';
    inputBrand.name = 'cpBrand';
    inputBrand.value = detectedBrand;
    formBrand.appendChild(inputBrand);
    document.body.appendChild(formBrand);

    // Enviar el seteo de marca en segundo plano
    formBrand.submit();

    // 4. Pequeña pausa (350ms) para que el servidor de PISDesk reciba y asigne la cookie de sesión
    setTimeout(() => {
      logBox.textContent = 'Enviando URL a inspeccionar...';

      // 5. Crear el formulario 2: Inspección final (se abre en la pestaña visible)
      const formInspect = document.createElement('form');
      formInspect.method = 'POST';
      formInspect.action = `${PISDESK_BASE}${targetFormaction}`;
      formInspect.target = targetWindowName; // Abre o reutiliza la pestaña nueva

      const inputUrl = document.createElement('input');
      inputUrl.type = 'hidden';
      inputUrl.name = 'url';
      inputUrl.value = clean;
      formInspect.appendChild(inputUrl);

      document.body.appendChild(formInspect);

      // Abre la ventana y envía el POST final con la URL
      window.open('', targetWindowName);
      formInspect.submit();

      // Limpieza de elementos temporales
      formBrand.remove();
      formInspect.remove();
      hiddenIframe.remove();

      logBox.textContent = '✅ Pestaña de inspección cargada con éxito.';
    }, 400);
  });
}