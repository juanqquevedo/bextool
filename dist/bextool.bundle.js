(function(){function e(e){try{let t=new URL(e);return`${t.origin}${t.pathname}`}catch{return e.split(`?`)[0].split(`#`)[0]}}function t(e){let t=e.toLowerCase();return t.includes(`colgate`)?`Colgate`:t.includes(`hills`)?`Hills`:`allOtherBrands`}function n(n,r){let i=e(r),a=t(r),o=`https://prod-pisdesk.colgate.com`;n.innerHTML=`
    <div class="pistol-form">
      <!-- Barra de autenticación IAP -->
      <div class="auth-bar" style="display:flex; justify-content:space-between; align-items:center; background:#141f33; border:1px solid #1e293b; border-radius:6px; padding:8px 10px; margin-bottom:12px;">
        <span style="font-size:11px; color:#94a3b8;">¿Sesión IAP inactiva o expirada?</span>
        <button id="btn-login-pisdesk" type="button" style="background:#0284c7; color:#fff; border:none; border-radius:4px; padding:5px 10px; font-size:11px; font-weight:600; cursor:pointer;">
          🔑 Iniciar Sesión PISDesk
        </button>
      </div>

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
      <div id="frame-wrapper" class="frame-wrapper" style="display: none; margin-top:14px; border-top:1px solid #334155; padding-top:12px;">
        <div class="frame-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-weight:600; font-size:11px; color:#38bdf8;">🖥️ Vista Previa PISDesk</span>
          <div style="display:flex; gap:6px; align-items:center;">
            <button id="btn-refresh-frame" type="button" style="background:#1e293b; border:1px solid #334155; color:#94a3b8; border-radius:4px; padding:2px 8px; font-size:11px; cursor:pointer;" title="Recargar vista">🔄</button>
            <span class="frame-badge" style="font-size:10px; background:#1e293b; border:1px solid #334155; padding:2px 6px; border-radius:4px; color:#94a3b8;">${a}</span>
          </div>
        </div>
        <iframe id="pisdesk-inline-frame" name="pisdesk_inline_frame" class="inline-frame" style="width:100%; height:420px; background:#fff; border:1px solid #334155; border-radius:6px; box-sizing:border-box;"></iframe>
      </div>
    </div>
  `;let s=n.querySelector(`#btn-fire-pisdesk`),c=n.querySelector(`#btn-login-pisdesk`),l=n.querySelector(`#btn-refresh-frame`),u=n.querySelector(`#pistol-log`),d=n.querySelector(`#frame-wrapper`),f=n.querySelector(`#pisdesk-inline-frame`);c.addEventListener(`click`,()=>{u.textContent=`Iniciando autenticación en segundo plano...`;let e=window.open(o,`PISDesk_Auth_Window`,`width=500,height=550,menubar=no,toolbar=no,location=no,status=no`);if(!e){u.textContent=`⚠️ Habilita las ventanas emergentes (popups) en tu navegador para continuar.`;return}let t=3,n=setInterval(()=>{u.textContent=`Autenticando sesión... cerrando en ${t}s`,t--,t<0&&(clearInterval(n),e.closed||e.close(),u.textContent=`✅ Sesión IAP renovada. Ya puedes pulsar "🚀 Inspeccionar en Visor".`)},1e3)});let p=()=>{s.disabled=!0,u.textContent=`Enviando petición a PISDesk...`,d.style.display=`block`;let e=`/inspectOtherCPBrand/preview`;a===`Colgate`&&(e=`/inspectColgate/preview`),a===`Hills`&&(e=`/inspectHills/preview`);let t=document.createElement(`form`);t.method=`POST`,t.action=`${o}${e}`,t.enctype=`multipart/form-data`,t.target=`pisdesk_inline_frame`;let n=document.createElement(`input`);n.type=`hidden`,n.name=`url`,n.value=i,t.appendChild(n);let r=document.createElement(`input`);r.type=`hidden`,r.name=`cpBrand`,r.value=a,t.appendChild(r),document.body.appendChild(t),t.submit(),t.remove(),f.onload=()=>{s.disabled=!1,u.innerHTML=`<span>✅ Vista procesada en el visor.</span>`}};s.addEventListener(`click`,p),l.addEventListener(`click`,p)}var r=/^[a-z]{2}[-_][a-z]{2}$/i,i={uk:`gb`,pe:`pe`,fr:`fr`,mx:`mx`,br:`br`,co:`co`,cl:`cl`,de:`de`,it:`it`,es:`es`};function a(e){try{let t=new URL(e),n=t.pathname.toLowerCase().split(`/`).filter(Boolean);for(let e of n)if(r.test(e))return e.replace(`_`,`-`);let a=t.hostname.toLowerCase().split(`.`),o=a[a.length-1];if(i[o])return i[o];let s=document.documentElement.lang;if(s)return s.toLowerCase().replace(`_`,`-`)}catch{}return`en-us`}function o(){let e=new Set,t=[];return window.performance&&window.performance.getEntriesByType&&window.performance.getEntriesByType(`resource`).forEach(e=>{e.name&&t.push(e.name)}),document.querySelectorAll(`img[src], source[srcset], link[href], script[src]`).forEach(e=>{let n=e.src||e.href||e.getAttribute(`srcset`);n&&n.split(`,`).forEach(e=>t.push(e.trim().split(` `)[0]))}),t.forEach(t=>{if(t.includes(`/dam/`))try{let n=new URL(t,window.location.origin).pathname.match(/\/dam\/([^?#]+)/);n&&n[1]&&n[1].split(`/`).filter(Boolean).filter(e=>!e.includes(`.`)).forEach(t=>e.add(t.toLowerCase()))}catch{}}),Array.from(e)}function s(e,t){let n=t.toLowerCase().replace(`_`,`-`),i=n.split(`-`),a=[],o=[],s=[];return e.forEach(e=>{let t=e.replace(`_`,`-`);if(r.test(t)){a.push(e);let r=t.split(`-`);t===n||i.length>1&&r[1]===i[1]||i.includes(r[1])||s.push(e)}else o.push(e)}),{expected:n,localesFound:a,invalidLocales:s,globalOrNeutral:o}}function c(e){e.innerHTML=`
    <div class="folders-module" style="font-size:12px;">
      <div style="margin-bottom:12px;">
        <label class="field-label">Locale / Región esperada de la página:</label>
        <input type="text" id="expected-locale-input" class="field-input" value="${a(window.location.href)}" />
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
  `;let t=e.querySelector(`#btn-scan-folders`),n=e.querySelector(`#expected-locale-input`),r=e.querySelector(`#folders-result`),i=e.querySelector(`#folder-status-banner`),c=e.querySelector(`#locales-detected-list`),l=e.querySelector(`#neutral-detected-list`);t.addEventListener(`click`,()=>{t.disabled=!0;let e=s(o(),n.value.trim());r.style.display=`block`,e.invalidLocales.length>0?(i.style.background=`#450a0a`,i.style.color=`#fca5a5`,i.style.border=`1px solid #ef4444`,i.innerHTML=`❌ Se encontraron carpetas de otras regiones:<br><span style="font-family:monospace;">${e.invalidLocales.join(`, `)}</span>`):(i.style.background=`#064e3b`,i.style.color=`#6ee7b7`,i.style.border=`1px solid #10b981`,i.textContent=`✅ Correcto: Ninguna carpeta pertenece a una región o idioma ajeno.`),c.innerHTML=e.localesFound.length>0?e.localesFound.map(t=>`<span style="display:inline-block; margin-right:8px; padding:2px 6px; border-radius:4px; background:${e.invalidLocales.includes(t)?`#7f1d1d`:`#065f46`}; color:#fff;">${t}</span>`).join(``):`<em>No se detectaron carpetas con patrón regional (todo es global).</em>`,l.textContent=e.globalOrNeutral.join(`, `)||`Ninguna`,t.disabled=!1})}(function(){let e=`__qa_command_center_host__`,t=document.getElementById(e);if(t){t.remove();return}let r=document.createElement(`div`);r.id=e,document.body.appendChild(r);let i=r.attachShadow({mode:`open`}),a=document.createElement(`style`);a.textContent=`:host{all:initial;z-index:2147483647}.tool-window{color:#f1f5f9;z-index:2147483647;background:#0f172a;border:1px solid #334155;border-radius:10px;flex-direction:column;width:540px;max-height:calc(100vh - 40px);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:13px;display:flex;position:fixed;top:20px;right:20px;overflow:hidden;box-shadow:0 20px 30px -10px #000000b3,0 0 15px #0006}.tool-header{-webkit-user-select:none;user-select:none;background:#1e293b;border-bottom:1px solid #334155;justify-content:space-between;align-items:center;padding:12px 16px;display:flex}.tool-title{color:#38bdf8;font-size:13px;font-weight:700}.tool-close-btn{color:#94a3b8;cursor:pointer;background:0 0;border:none;padding:0 4px;font-size:16px;line-height:1}.tool-close-btn:hover{color:#ef4444}.tool-tabs{background:#1e293b;border-bottom:1px solid #334155;display:flex}.tab-btn{color:#94a3b8;cursor:pointer;background:0 0;border:none;border-bottom:2px solid #0000;flex:1;padding:9px 0;font-size:12px;font-weight:600;transition:all .2s}.tab-btn:hover{color:#f8fafc}.tab-btn.active{color:#38bdf8;background:#0f172a;border-bottom-color:#38bdf8}.tool-body{max-height:calc(100vh - 120px);padding:16px;overflow-y:auto}.tab-content{display:none}.tab-content.active{display:block}.field-label{color:#94a3b8;margin-top:10px;margin-bottom:4px;font-size:11px;font-weight:600;display:block}.field-label:first-child{margin-top:0}.field-input{box-sizing:border-box;color:#fff;background:#1e293b;border:1px solid #334155;border-radius:6px;width:100%;padding:7px 10px;font-size:12px}.readonly-field{cursor:default;color:#94a3b8!important;background:#141f33!important;border-color:#1e293b!important}.actions-group{margin-top:14px}.action-btn{color:#fff;cursor:pointer;background:#0284c7;border:none;border-radius:6px;width:100%;padding:9px;font-weight:600;transition:background .2s}.action-btn:hover{background:#0369a1}.action-btn:disabled{cursor:not-allowed;background:#475569}.log-console{color:#34d399;word-break:break-all;background:#020617;border:1px solid #1e293b;border-radius:6px;min-height:24px;margin-top:10px;padding:8px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}.frame-wrapper{border-top:1px solid #334155;margin-top:14px;padding-top:12px}.frame-header{justify-content:space-between;align-items:center;margin-bottom:8px;display:flex}.frame-title{color:#38bdf8;font-size:11px;font-weight:600}.frame-badge{color:#94a3b8;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:2px 6px;font-size:10px}.inline-frame{box-sizing:border-box;background:#fff;border:1px solid #334155;border-radius:6px;width:100%;height:420px}.placeholder-text{color:#64748b;text-align:center;padding:40px 0}.auth-bar{background:#141f33;border:1px solid #1e293b;border-radius:6px;justify-content:space-between;align-items:center;margin-bottom:12px;padding:8px 10px;display:flex}.auth-status-text{color:#94a3b8;font-size:11px}.auth-btn{color:#f8fafc;cursor:pointer;white-space:nowrap;background:#334155;border:1px solid #475569;border-radius:4px;padding:4px 8px;font-size:11px;font-weight:600;transition:all .2s}.auth-btn:hover{color:#fff;background:#0284c7;border-color:#38bdf8}.mini-btn{color:#94a3b8;cursor:pointer;background:0 0;border:1px solid #334155;border-radius:4px;padding:2px 6px;font-size:11px}.mini-btn:hover{color:#38bdf8;background:#1e293b}`,i.appendChild(a);let o=document.createElement(`div`);o.className=`tool-window`,o.innerHTML=`
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
  `,i.appendChild(o),i.getElementById(`btn-close-widget`).addEventListener(`click`,()=>{r.remove()});let s=i.querySelectorAll(`.tab-btn`),l=i.querySelectorAll(`.tab-content`);s.forEach(e=>{e.addEventListener(`click`,()=>{s.forEach(e=>e.classList.remove(`active`)),l.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=i.getElementById(`view-${e.dataset.tab}`);t&&t.classList.add(`active`)})});let u=window.location.href;n(i.getElementById(`view-pistol`),u),c(i.getElementById(`view-modulo2`))})()})();