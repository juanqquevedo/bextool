import cssContent from './styles.css?inline';
import { initPistolModule } from './modules/pistol.js';

(async function main() {
  const isPisdesk = window.location.hostname.includes('prod-pisdesk.colgate.com');

  // SI YA ESTAMOS EN PISDESK:
  if (isPisdesk) {
    const hash = window.location.hash;
    if (hash.includes('auto=')) {
      try {
        const raw = decodeURIComponent(hash.split('auto=')[1]);
        const task = JSON.parse(raw);
        
        // Limpiar el hash de la URL para que quede limpia
        history.replaceState(null, '', window.location.pathname);

        // Ejecutar toda la secuencia sin esperas manuales
        await runPisdeskSequence(document, task.brand, task.cleanUrl, console.log);
      } catch (err) {
        console.error('Error procesando auto-ejecución:', err);
      }
    }
    return;
  }

  // SI ESTAMOS EN LA TIENDA ORIGEN:
  const sourceUrl = window.location.href;
  const popup = window.open('', 'QA_TOOL_WINDOW', 'width=460,height=520,top=100,left=100,resizable=yes');

  if (!popup) {
    alert('Permite ventanas emergentes para abrir la herramienta.');
    return;
  }

  const doc = popup.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>QA Tool Suite</title>
      <style>${cssContent}</style>
    </head>
    <body>
      <div class="tool-window">
        <div class="tool-header">
          <div class="tool-title">⚡ QA Command Center</div>
        </div>
        <div class="tool-tabs">
          <button class="tab-btn active" data-tab="pistol">Pistol</button>
          <button class="tab-btn" data-tab="modulo2">Módulo 2</button>
        </div>
        <div class="tool-body">
          <div class="tab-content active" id="view-pistol"></div>
          <div class="tab-content" id="view-modulo2">
            <p class="placeholder-text">Próximamente...</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  doc.close();

  // Tab switching
  const tabButtons = doc.querySelectorAll('.tab-btn');
  const tabContents = doc.querySelectorAll('.tab-content');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetView = doc.getElementById(`view-${btn.dataset.tab}`);
      if (targetView) targetView.classList.add('active');
    });
  });

  const pistolContainer = doc.getElementById('view-pistol');
  initPistolModule(pistolContainer, sourceUrl);
})();