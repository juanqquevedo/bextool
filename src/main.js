import cssContent from './styles.css?inline';
import { initPistolModule } from './modules/pistol.js';
import { initFoldersModule } from './modules/assets.js';

(function main() {
  const HOST_ID = '__qa_command_center_host__';
  const existingHost = document.getElementById(HOST_ID);

  // Toggle: si ya está abierto, lo cierra al hacer clic en el bookmarklet
  if (existingHost) {
    existingHost.remove();
    return;
  }

  // 1. Host en Shadow DOM para aislar estilos
  const host = document.createElement('div');
  host.id = HOST_ID;
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // 2. Estilos encapsulados
  const style = document.createElement('style');
  style.textContent = cssContent;
  shadow.appendChild(style);

  // 3. Estructura base con pestañas
  const container = document.createElement('div');
  container.className = 'tool-window';
  container.innerHTML = `
    <div class="tool-header">
      <div class="tool-title">⚡ BEX Tool</div>
      <button class="tool-close-btn" id="btn-close-widget" title="Cerrar panel">✕</button>
    </div>
    <div class="tool-tabs">
      <button class="tab-btn active" data-tab="pistol">Pistol</button>
      <button class="tab-btn" data-tab="modulo2">Assets Folders</button>
    </div>
    <div class="tool-body">
      <div class="tab-content active" id="view-pistol"></div>
      <div class="tab-content" id="view-modulo2"></div>
    </div>
  `;
  shadow.appendChild(container);

  // Evento de cierre (✕)
  shadow.getElementById('btn-close-widget').addEventListener('click', () => {
    host.remove();
  });

  // Manejador de navegación por pestañas
  const tabButtons = shadow.querySelectorAll('.tab-btn');
  const tabContents = shadow.querySelectorAll('.tab-content');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetView = shadow.getElementById(`view-${btn.dataset.tab}`);
      if (targetView) targetView.classList.add('active');
    });
  });

  const sourceUrl = window.location.href;

  // Inicializar Módulo 1 (Pistol)
  const pistolContainer = shadow.getElementById('view-pistol');
  initPistolModule(pistolContainer, sourceUrl);

  // Inicializar Módulo 2 (Verificador de Carpetas en content/dam)
  const foldersContainer = shadow.getElementById('view-modulo2');
  initFoldersModule(foldersContainer);
})();