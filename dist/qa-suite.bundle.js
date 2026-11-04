(function(){function e(e){try{let t=new URL(e);return`${t.origin}${t.pathname}`}catch{return e.split(`?`)[0].split(`#`)[0]}}function t(e){let t=e.toLowerCase();return t.includes(`colgate`)?`Colgate`:t.includes(`hills`)?`Hills`:`allOtherBrands`}function n(n,r){let i=e(r),a=t(r),o=`https://prod-pisdesk.colgate.com`;n.innerHTML=`
    <div class="pistol-form">
      <label class="field-label">Sitio Destino (Fijo):</label>
      <input type="text" class="field-input readonly-field" readonly value="${o}" />

      <label class="field-label">URL Limpia detectada:</label>
      <input type="text" class="field-input readonly-field" readonly value="${i}" />

      <label class="field-label">Marca Detectada:</label>
      <input type="text" class="field-input readonly-field" readonly value="${a}" />

      <div class="actions-group">
        <button id="btn-fire-pisdesk" class="action-btn">🚀 Disparar en PISDesk (1 Solo Clic)</button>
      </div>
      
      <div id="pistol-log" class="log-console">Listo para disparar.</div>
    </div>
  `;let s=n.querySelector(`#btn-fire-pisdesk`),c=n.querySelector(`#pistol-log`);s.addEventListener(`click`,async()=>{c.textContent=`Configurando marca y abriendo inspección...`;let e=`/inspectOtherCPBrand/preview`;a===`Colgate`&&(e=`/inspectColgate/preview`),a===`Hills`&&(e=`/inspectHills/preview`);let t=`PISDesk_Target_Tab`,n=document.createElement(`iframe`);n.name=`pisdesk_session_frame`,n.style.display=`none`,document.body.appendChild(n);let r=document.createElement(`form`);r.method=`POST`,r.action=`${o}/selectCPBrand`,r.target=`pisdesk_session_frame`;let s=document.createElement(`input`);s.type=`hidden`,s.name=`cpBrand`,s.value=a,r.appendChild(s),document.body.appendChild(r),r.submit(),setTimeout(()=>{c.textContent=`Enviando URL a inspeccionar...`;let a=document.createElement(`form`);a.method=`POST`,a.action=`${o}${e}`,a.target=t;let s=document.createElement(`input`);s.type=`hidden`,s.name=`url`,s.value=i,a.appendChild(s),document.body.appendChild(a),window.open(``,t),a.submit(),r.remove(),a.remove(),n.remove(),c.textContent=`✅ Pestaña de inspección cargada con éxito.`},400)})}(async function(){if(window.location.hostname.includes(`prod-pisdesk.colgate.com`)){let e=window.location.hash;if(e.includes(`auto=`))try{let t=decodeURIComponent(e.split(`auto=`)[1]),n=JSON.parse(t);history.replaceState(null,``,window.location.pathname),await runPisdeskSequence(document,n.brand,n.cleanUrl,console.log)}catch(e){console.error(`Error procesando auto-ejecución:`,e)}return}let e=window.location.href,t=window.open(``,`QA_TOOL_WINDOW`,`width=460,height=520,top=100,left=100,resizable=yes`);if(!t){alert(`Permite ventanas emergentes para abrir la herramienta.`);return}let r=t.document;r.open(),r.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>QA Tool Suite</title>
      <style>*{box-sizing:border-box;margin:0;padding:0}body{color:#f1f5f9;background:#0f172a;height:100vh;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:13px;overflow:hidden}.tool-window{flex-direction:column;height:100vh;display:flex}.tool-header{background:#1e293b;border-bottom:1px solid #334155;padding:12px 16px}.tool-title{color:#38bdf8;font-size:14px;font-weight:700}.tool-tabs{background:#1e293b;border-bottom:1px solid #334155;display:flex}.tab-btn{color:#94a3b8;cursor:pointer;background:0 0;border:none;border-bottom:2px solid #0000;flex:1;padding:10px 0;font-size:12px;font-weight:600;transition:all .2s}.tab-btn:hover{color:#f8fafc}.tab-btn.active{color:#38bdf8;background:#0f172a;border-bottom-color:#38bdf8}.tool-body{flex:1;padding:16px;overflow-y:auto}.tab-content{display:none}.tab-content.active{display:block}.field-label{color:#94a3b8;margin-top:12px;margin-bottom:5px;font-size:11px;font-weight:600;display:block}.field-label:first-child{margin-top:0}.field-input{color:#fff;background:#1e293b;border:1px solid #334155;border-radius:6px;width:100%;padding:8px 10px;font-size:12px}.field-input[readonly]{color:#64748b;cursor:not-allowed;background:#141f33;border-color:#1e293b}.field-input:focus:not([readonly]){border-color:#38bdf8;outline:none}.actions-group{margin-top:18px}.action-btn{color:#fff;cursor:pointer;background:#0284c7;border:none;border-radius:6px;width:100%;padding:10px;font-weight:600;transition:background .2s}.action-btn:hover{background:#0369a1}.log-console{color:#34d399;word-break:break-all;background:#020617;border:1px solid #1e293b;border-radius:6px;min-height:48px;margin-top:14px;padding:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.4}.placeholder-text{color:#64748b;text-align:center;padding:40px 0}.readonly-field{cursor:default;-webkit-user-select:all;user-select:all;color:#94a3b8!important;background:#1e293b!important;border-color:#334155!important}</style>
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
  `),r.close();let i=r.querySelectorAll(`.tab-btn`),a=r.querySelectorAll(`.tab-content`);i.forEach(e=>{e.addEventListener(`click`,()=>{i.forEach(e=>e.classList.remove(`active`)),a.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=r.getElementById(`view-${e.dataset.tab}`);t&&t.classList.add(`active`)})}),n(r.getElementById(`view-pistol`),e)})()})();