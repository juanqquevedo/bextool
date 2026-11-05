(function(){function e(e){try{let t=new URL(e);return`${t.origin}${t.pathname}`}catch{return e.split(`?`)[0].split(`#`)[0]}}function t(e){let t=e.toLowerCase();return t.includes(`colgate`)?`Colgate`:t.includes(`hills`)?`Hills`:`allOtherBrands`}function n(n,r){let i=e(r),a=t(r),o=`https://prod-pisdesk.colgate.com`;n.innerHTML=`
    <div class="pistol-form">
      <label class="field-label">Sitio Destino:</label>
      <input type="text" class="field-input readonly-field" readonly value="${o}" />

      <label class="field-label">URL Limpia (sin parámetros ni anclas):</label>
      <input type="text" class="field-input readonly-field" readonly value="${i}" />

      <label class="field-label">Marca Detectada:</label>
      <input type="text" class="field-input readonly-field" readonly value="${a}" />

      <div class="actions-group">
        <button id="btn-fire-pisdesk" class="action-btn">🚀 Inspeccionar en Visor</button>
      </div>

      <div id="pistol-log" class="log-console">Listo para cargar vista previa.</div>

      <!-- Visor Integrado -->
      <div id="frame-wrapper" class="frame-wrapper" style="display: none;">
        <div class="frame-header">
          <span class="frame-title">🖥️ Vista Previa PISDesk</span>
          <span class="frame-badge">${a}</span>
        </div>
        <iframe id="pisdesk-inline-frame" name="pisdesk_inline_frame" class="inline-frame"></iframe>
      </div>
    </div>
  `;let s=n.querySelector(`#btn-fire-pisdesk`),c=n.querySelector(`#pistol-log`),l=n.querySelector(`#frame-wrapper`),u=n.querySelector(`#pisdesk-inline-frame`);s.addEventListener(`click`,()=>{s.disabled=!0,c.textContent=`Enviando petición a PISDesk...`,l.style.display=`block`;let e=`/inspectOtherCPBrand/preview`;a===`Colgate`&&(e=`/inspectColgate/preview`),a===`Hills`&&(e=`/inspectHills/preview`);let t=document.createElement(`form`);t.method=`POST`,t.action=`${o}${e}`,t.enctype=`multipart/form-data`,t.target=`pisdesk_inline_frame`;let n=document.createElement(`input`);n.type=`hidden`,n.name=`url`,n.value=i,t.appendChild(n);let r=document.createElement(`input`);r.type=`hidden`,r.name=`cpBrand`,r.value=a,t.appendChild(r),document.body.appendChild(t),t.submit(),t.remove(),u.onload=()=>{s.disabled=!1,c.textContent=`✅ Vista previa cargada con éxito en el visor.`}})}(function(){let e=`__qa_command_center_host__`,t=document.getElementById(e);if(t){t.remove();return}let r=document.createElement(`div`);r.id=e,document.body.appendChild(r);let i=r.attachShadow({mode:`open`}),a=document.createElement(`style`);a.textContent=`:host{all:initial;z-index:2147483647}.tool-window{color:#f1f5f9;z-index:2147483647;background:#0f172a;border:1px solid #334155;border-radius:10px;flex-direction:column;width:540px;max-height:calc(100vh - 40px);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:13px;display:flex;position:fixed;top:20px;right:20px;overflow:hidden;box-shadow:0 20px 30px -10px #000000b3,0 0 15px #0006}.tool-header{-webkit-user-select:none;user-select:none;background:#1e293b;border-bottom:1px solid #334155;justify-content:space-between;align-items:center;padding:12px 16px;display:flex}.tool-title{color:#38bdf8;font-size:13px;font-weight:700}.tool-close-btn{color:#94a3b8;cursor:pointer;background:0 0;border:none;padding:0 4px;font-size:16px;line-height:1}.tool-close-btn:hover{color:#ef4444}.tool-tabs{background:#1e293b;border-bottom:1px solid #334155;display:flex}.tab-btn{color:#94a3b8;cursor:pointer;background:0 0;border:none;border-bottom:2px solid #0000;flex:1;padding:9px 0;font-size:12px;font-weight:600;transition:all .2s}.tab-btn:hover{color:#f8fafc}.tab-btn.active{color:#38bdf8;background:#0f172a;border-bottom-color:#38bdf8}.tool-body{max-height:calc(100vh - 120px);padding:16px;overflow-y:auto}.tab-content{display:none}.tab-content.active{display:block}.field-label{color:#94a3b8;margin-top:10px;margin-bottom:4px;font-size:11px;font-weight:600;display:block}.field-label:first-child{margin-top:0}.field-input{box-sizing:border-box;color:#fff;background:#1e293b;border:1px solid #334155;border-radius:6px;width:100%;padding:7px 10px;font-size:12px}.readonly-field{cursor:default;color:#94a3b8!important;background:#141f33!important;border-color:#1e293b!important}.actions-group{margin-top:14px}.action-btn{color:#fff;cursor:pointer;background:#0284c7;border:none;border-radius:6px;width:100%;padding:9px;font-weight:600;transition:background .2s}.action-btn:hover{background:#0369a1}.action-btn:disabled{cursor:not-allowed;background:#475569}.log-console{color:#34d399;word-break:break-all;background:#020617;border:1px solid #1e293b;border-radius:6px;min-height:24px;margin-top:10px;padding:8px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}.frame-wrapper{border-top:1px solid #334155;margin-top:14px;padding-top:12px}.frame-header{justify-content:space-between;align-items:center;margin-bottom:8px;display:flex}.frame-title{color:#38bdf8;font-size:11px;font-weight:600}.frame-badge{color:#94a3b8;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:2px 6px;font-size:10px}.inline-frame{box-sizing:border-box;background:#fff;border:1px solid #334155;border-radius:6px;width:100%;height:420px}.placeholder-text{color:#64748b;text-align:center;padding:40px 0}`,i.appendChild(a);let o=document.createElement(`div`);o.className=`tool-window`,o.innerHTML=`
    <div class="tool-header">
      <div class="tool-title">⚡ BEX Tool</div>
      <button class="tool-close-btn" id="btn-close-widget" title="Cerrar panel">✕</button>
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
  `,i.appendChild(o),i.getElementById(`btn-close-widget`).addEventListener(`click`,()=>{r.remove()});let s=i.querySelectorAll(`.tab-btn`),c=i.querySelectorAll(`.tab-content`);s.forEach(e=>{e.addEventListener(`click`,()=>{s.forEach(e=>e.classList.remove(`active`)),c.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=i.getElementById(`view-${e.dataset.tab}`);t&&t.classList.add(`active`)})});let l=window.location.href;n(i.getElementById(`view-pistol`),l)})()})();