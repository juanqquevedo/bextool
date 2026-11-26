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
  `;let s=n.querySelector(`#btn-fire-pisdesk`),c=n.querySelector(`#btn-login-pisdesk`),l=n.querySelector(`#btn-refresh-frame`),u=n.querySelector(`#pistol-log`),d=n.querySelector(`#frame-wrapper`),f=n.querySelector(`#pisdesk-inline-frame`);function p(e){if(e.origin!==o)return;let t=e.data;t&&t.type===`INPUT_VALUE`&&(u.innerHTML+=`<br><span style="color: #38bdf8;">[Visor Data Received]: ${t.label}: ${t.value}</span>`)}c.addEventListener(`click`,()=>{u.textContent=`Iniciando autenticación en segundo plano...`;let e=window.open(o,`PISDesk_Auth_Window`,`width=500,height=550,menubar=no,toolbar=no,location=no,status=no`);if(!e){u.textContent=`⚠️ Habilita las ventanas emergentes (popups) en tu navegador para continuar.`;return}let t=3,n=setInterval(()=>{u.textContent=`Autenticando sesión... cerrando en ${t}s`,t--,t<0&&(clearInterval(n),e.closed||e.close(),u.textContent=`✅ Sesión IAP renovada. Ya puedes pulsar "🚀 Inspeccionar en Visor".`)},1e3)});let m=()=>{s.disabled=!0,u.textContent=`Enviando petición a PISDesk...`,d.style.display=`block`;let e=`/inspectOtherCPBrand/preview`;a===`Colgate`&&(e=`/inspectColgate/preview`),a===`Hills`&&(e=`/inspectHills/preview`);let t=document.createElement(`form`);t.method=`POST`,t.action=`${o}${e}`,t.enctype=`multipart/form-data`,t.target=`pisdesk_inline_frame`;let n=document.createElement(`input`);n.type=`hidden`,n.name=`url`,n.value=i,t.appendChild(n);let r=document.createElement(`input`);r.type=`hidden`,r.name=`cpBrand`,r.value=a,t.appendChild(r),document.body.appendChild(t),t.submit(),t.remove(),f.onload=()=>{s.disabled=!1,u.innerHTML=`<span style="color: #38bdf8;">✅ Vista procesada en el visor.</span>`,f.contentWindow.addEventListener(`message`,p)}};s.addEventListener(`click`,m),l.addEventListener(`click`,m)}var r={JIRA_DOMAIN:`cp9.atlassian.net`,JIRA_DEFAULT_LINK_TYPE:`Belongs`};function i(){if(window.location.hostname!==r.JIRA_DOMAIN)throw Error(`La API de Jira solo puede ejecutarse desde ${r.JIRA_DOMAIN}.`);return`https://${r.JIRA_DOMAIN}/rest/api/3`}function a(){return{Accept:`application/json`,"Content-Type":`application/json`,"X-Atlassian-Token":`no-check`}}function o(e){if(!e)return``;if(typeof e==`string`||typeof e==`number`)return String(e).trim();if(Array.isArray(e))return e.map(e=>o(e)).filter(Boolean).join(`, `);if(typeof e==`object`){let t=e.value||e.name||e.label||``,n=e.child?o(e.child):``;return n?`${t} - ${n}`:String(t).trim()}return``}function s(e){return e?Array.isArray(e)&&e.length>0?e[0]?.accountId||null:e.accountId||null:null}function c(e){return e?typeof e==`string`?{id:e,name:e}:typeof e==`object`?{id:e.id||void 0,name:(e.name||e.title||e.value||``).trim()}:null:null}async function l(e){let t=e.trim().toUpperCase(),n=await fetch(`${i()}/issue/${t}`,{method:`GET`,headers:a(),credentials:`include`});if(!n.ok){let e=await n.text();throw Error(`Error al leer ${t} (${n.status}): ${e}`)}let r=await n.json(),l=r.fields,u=o(l.customfield_11770);u||console.warn(`[BEX Tool] customfield_11770 vacío o con estructura inesperada:`,l.customfield_11770);let d=c(l.customfield_10001);return{key:r.key,projectKey:l.project?.key,summary:l.summary||``,brand:u,teamId:d?.id,teamName:d?.name||``,assigneeAccountId:s(l.customfield_11777),components:(l.components||[]).map(e=>({name:e.name})),priority:l.priority?{name:l.priority.name}:void 0}}async function u({parentDetails:e,bugSummary:t,descriptionText:n,linkType:o=r.JIRA_DEFAULT_LINK_TYPE,customFields:s={},labels:c=[],dueDate:l=void 0,assigneeAccountId:u=void 0}){let d={type:`doc`,version:1,content:[{type:`paragraph`,content:[{type:`text`,text:n}]}]},f={fields:{project:{key:e.projectKey},issuetype:{name:`Bug`},summary:t,description:d,components:e.components,...e.priority&&{priority:e.priority},...c.length>0&&{labels:c},...l&&{duedate:l},...u&&{assignee:{accountId:u}},...s}},p=await fetch(`${i()}/issue`,{method:`POST`,headers:a(),credentials:`include`,body:JSON.stringify(f)});if(!p.ok){let e=await p.json().catch(()=>({}));throw Error(`No se pudo crear el Bug (${p.status}): ${JSON.stringify(e)}`)}let m=await p.json(),h=await fetch(`${i()}/issueLink`,{method:`POST`,headers:a(),credentials:`include`,body:JSON.stringify({type:{name:o},inwardIssue:{key:m.key},outwardIssue:{key:e.key}})});if(!h.ok){let e=await h.text();throw Error(`Bug creado (${m.key}), pero falló el vínculo: ${e}`)}return m}var d=/^[a-z]{2}[-_][a-z]{2}$/i,f={customfield_13292:{id:`16803`},customfield_13293:{id:`16844`},customfield_14327:{id:`17881`}},p={"BEX - LATAM Web":{id:`18102`},"BEX EUROPE Web":{id:`18096`},"BEX NA + Others WEB":{id:`18098`},"BEX Hills team":{id:`18101`}},m={uk:`en-gb`,pe:`es-pe`,fr:`fr-fr`,mx:`es-mx`,br:`pt-br`,co:`es-co`,cl:`es-cl`,de:`de-de`,it:`it-it`,es:`es-es`,ar:`es-ar`};function h(e,t){if(!e&&!t)return;let n=(e||``).toLowerCase().trim();for(let[e,r]of Object.entries(p))if(e.toLowerCase().trim()===n||e===t)return r;console.warn(`[BEX Tool] Sin mapeo en customfield_14394 para el Team: "${e}" (${t})`)}function g(e){let t=new Date,n=0;for(;n<e;){t.setDate(t.getDate()+1);let e=t.getDay();e!==0&&e!==6&&n++}return`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`}function _(e){try{let t=new URL(e),n=t.pathname.toLowerCase().split(`/`).filter(Boolean);for(let e of n)if(d.test(e))return e.replace(`_`,`-`);let r=document.documentElement.lang;if(r&&d.test(r.trim()))return r.trim().toLowerCase().replace(`_`,`-`);let i=t.hostname.toLowerCase().split(`.`),a=i[i.length-1];if(m[a])return m[a]}catch{}return`en-us`}function v(e){let t=(e||``).trim().replace(`_`,`-`),n=t.split(`-`);if(n.length===2){let[e,t]=n;return`${e.toUpperCase()}-${t.toUpperCase()}`}return t.toUpperCase()}function y(e){let t=(e||``).toLowerCase();return t.includes(`hillspet`)||t.includes(`hills`)?`Hill's`:t.includes(`colgate`)?`Colgate`:t.includes(`elmex`)?`Elmex`:t.includes(`meridol`)?`Meridol`:t.includes(`sanex`)?`Sanex`:t.includes(`palmolive`)?`Palmolive`:`Unknown Brand`}function b(){let e=new Set;window.performance&&window.performance.getEntriesByType&&window.performance.getEntriesByType(`resource`).forEach(t=>{t.name&&t.name.includes(`/dam/`)&&e.add(t.name)}),document.querySelectorAll(`img[src], source[srcset], link[href], script[src]`).forEach(t=>{let n=t.src||t.href||t.getAttribute(`srcset`);n&&n.includes(`/dam/`)&&n.split(`,`).forEach(t=>{let n=t.trim().split(` `)[0];n.includes(`/dam/`)&&e.add(n)})});let t=[];return e.forEach(e=>{try{let n=new URL(e,window.location.origin),r=n.pathname.match(/\/dam\/([^?#]+)/);if(r&&r[1]){let e=r[1].split(`/`).filter(Boolean).filter(e=>!e.includes(`.`)).map(e=>e.toLowerCase());t.push({fullUrl:n.href,pathname:n.pathname,folders:e})}}catch{}}),t}function x(e,t){let n=t.toLowerCase().replace(`_`,`-`),r=n.split(`-`),i=new Set,a=new Set,o=[];return e.forEach(e=>{e.folders.forEach(t=>{let s=t.replace(`_`,`-`);if(d.test(s)){i.add(t);let a=s.split(`-`);s===n||r.length>1&&a[1]===r[1]||r.includes(a[1])||o.some(n=>n.pathname===e.pathname&&n.folder===t)||o.push({folder:t,pathname:e.pathname,fullUrl:e.fullUrl})}else a.add(t)})}),{expected:n,localesFound:Array.from(i),invalidEntries:o,globalOrNeutral:Array.from(a)}}function S(e){window.location.hostname===r.JIRA_DOMAIN?w(e):C(e)}function C(e){e.innerHTML=`
    <div class="folders-module" style="font-size:12px;">
      <div style="margin-bottom:12px;">
        <label class="field-label">Locale / Región esperada de la página:</label>
        <input type="text" id="expected-locale-input" class="field-input" value="${_(window.location.href)}" />
        <small style="color:#94a3b8; font-size:11px;">Carpetas globales (global, icons, homepage) se aprueban automáticamente.</small>
      </div>

      <button id="btn-scan-folders" class="action-btn">🔍 Validar Carpetas de content/dam</button>

      <div id="folders-result" style="margin-top:14px; display:none;">
        <div id="folder-status-banner" style="padding:10px; border-radius:6px; font-weight:600; margin-bottom:12px;"></div>

        <div id="invalid-paths-box" style="display:none; background:#1e1b24; border:1px solid #ef4444; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div style="color:#f87171; font-weight:600; margin-bottom:8px;">🚨 Rutas exactas con región incorrecta:</div>
          <div id="invalid-paths-list" style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;"></div>
        </div>

        <div id="jira-bug-box" style="display:none; background:#0f172a; border:1px solid #38bdf8; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div style="color:#38bdf8; font-weight:600; margin-bottom:6px;">🐞 Reportar Bug en Jira (${r.JIRA_DOMAIN})</div>
          <label class="field-label">Ticket Principal (Parent Key):</label>
          <input type="text" id="parent-issue-key" class="field-input" placeholder="Ej: BEX-47635" style="margin-bottom:8px;" />
          
          <button id="btn-send-to-jira" type="button" class="action-btn" style="background:#0284c7; width:100%;">
            ↗ Abrir en Jira y Crear Bug Linked
          </button>
          <div id="jira-bridge-hint" style="margin-top:6px; font-size:10px; color:#94a3b8;">
            Se abrirá Jira en una nueva pestaña. Al cargar, pulsa el marcador <strong>BEX Tool</strong> allí para crear el ticket automáticamente.
          </div>
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
  `;let t=e.querySelector(`#btn-scan-folders`),n=e.querySelector(`#expected-locale-input`),i=e.querySelector(`#folders-result`),a=e.querySelector(`#folder-status-banner`),o=e.querySelector(`#invalid-paths-box`),s=e.querySelector(`#invalid-paths-list`),c=e.querySelector(`#locales-detected-list`),l=e.querySelector(`#neutral-detected-list`),u=e.querySelector(`#jira-bug-box`),d=e.querySelector(`#btn-send-to-jira`),f=null;t.addEventListener(`click`,()=>{t.disabled=!0,f=x(b(),n.value.trim()),i.style.display=`block`,f.invalidEntries.length>0?(a.style.background=`#450a0a`,a.style.color=`#fca5a5`,a.style.border=`1px solid #ef4444`,a.textContent=`❌ Se encontraron ${f.invalidEntries.length} recurso(s) en carpetas de otra región.`,o.style.display=`block`,u.style.display=`block`,s.innerHTML=f.invalidEntries.map(e=>`
          <div style="background:#0f172a; border:1px solid #334155; border-radius:4px; padding:6px 8px; font-family:monospace; font-size:11px; word-break:break-all; color:#e2e8f0;">
            <div style="margin-bottom:4px;">${T(e.pathname).replace(RegExp(`(${e.folder})`,`gi`),`<span style="background:#991b1b; color:#fff; padding:1px 4px; border-radius:3px; font-weight:700;">$1</span>`)}</div>
            <a href="${e.fullUrl}" target="_blank" style="color:#38bdf8; text-decoration:none; font-size:10px;">↗ Abrir asset en nueva pestaña</a>
          </div>
        `).join(``)):(a.style.background=`#064e3b`,a.style.color=`#6ee7b7`,a.style.border=`1px solid #10b981`,a.textContent=`✅ Correcto: Ninguna carpeta pertenece a una región o idioma ajeno.`,o.style.display=`none`,s.innerHTML=``,u.style.display=`none`);let e=new Set(f.invalidEntries.map(e=>e.folder));c.innerHTML=f.localesFound.length>0?f.localesFound.map(t=>`<span style="display:inline-block; margin:2px 6px 2px 0; padding:2px 6px; border-radius:4px; background:${e.has(t)?`#7f1d1d`:`#065f46`}; color:#fff;">${t}</span>`).join(``):`<em>No se detectaron carpetas con patrón regional (todo es global).</em>`,l.textContent=f.globalOrNeutral.join(`, `)||`Ninguna`,t.disabled=!1}),d.addEventListener(`click`,()=>{let t=e.querySelector(`#parent-issue-key`).value.trim().toUpperCase();if(!t){alert(`Ingresa el ID del ticket principal (ej. BEX-47635).`);return}let i={parentKey:t,locale:n.value.trim(),auditedUrl:window.location.href,invalidPaths:f.invalidEntries.map(e=>e.pathname)},a=encodeURIComponent(JSON.stringify(i));window.open(`https://${r.JIRA_DOMAIN}/browse/${t}#bextool_bug=${a}`,`_blank`)})}function w(e){let t=window.location.hash,n=null;if(t.startsWith(`#bextool_bug=`))try{let e=decodeURIComponent(t.replace(`#bextool_bug=`,``));n=JSON.parse(e),history.replaceState(null,``,window.location.pathname+window.location.search)}catch{}if(!n){let t=window.location.pathname.match(/\/browse\/([A-Z]+-\d+)/i),n=t?t[1].toUpperCase():``;e.innerHTML=`
      <div style="font-size:12px; background:#141f33; border:1px solid #334155; border-radius:6px; padding:12px;">
        <div style="color:#38bdf8; font-weight:600; margin-bottom:6px;">🟢 Modo Jira Activo</div>
        <p style="color:#cbd5e1; margin:0 0 8px 0;">
          No hay un reporte de auditoría DAM pendiente en esta URL.
        </p>
        <p style="color:#94a3b8; font-size:11px; margin:0;">
          1. Ve a una tienda (ej. hillspet.cl) y ejecuta la validación en <strong>Assets Folders</strong>.<br>
          2. Pulsa <strong>"↗ Abrir en Jira y Crear Bug Linked"</strong>.<br>
          3. Cuando abra esta pestaña, vuelve a pulsar el marcador <strong>BEX Tool</strong>.
        </p>
        ${n?`<div style="margin-top:10px; font-size:11px; color:#6ee7b7;">Ticket actual detectado: <strong>${n}</strong></div>`:``}
      </div>
    `;return}let i=n.invalidPaths.map(e=>`• ${e}`).join(`
`);e.innerHTML=`
    <div style="font-size:12px;">
      <div style="background:#064e3b; border:1px solid #10b981; color:#a7f3d0; padding:8px 10px; border-radius:6px; margin-bottom:10px; font-size:11px;">
        ✅ Datos recibidos desde <strong>${T(n.auditedUrl)}</strong>
      </div>

      <label class="field-label">Ticket Principal (Parent):</label>
      <input type="text" id="jira-parent-key" class="field-input readonly-field" readonly value="${T(n.parentKey)}" />

      <label class="field-label">Rutas infractoras a reportar (${n.invalidPaths.length}):</label>
      <textarea readonly class="field-input" style="height:90px; font-family:monospace; font-size:10px; resize:none;">${T(i)}</textarea>

      <button id="btn-confirm-create-bug" class="action-btn" style="background:#dc2626; width:100%; margin-top:8px;">
        🚀 Confirmar y Crear Bug Linked
      </button>

      <div id="jira-exec-log" class="log-console" style="margin-top:8px;">Listo para crear ticket en Jira.</div>
    </div>
  `;let a=e.querySelector(`#btn-confirm-create-bug`),o=e.querySelector(`#jira-exec-log`);a.addEventListener(`click`,async()=>{a.disabled=!0;let t=e.querySelector(`#jira-parent-key`).value.trim();try{o.textContent=`⏳ Leyendo campos de ${t}...`;let e=await l(t),i=`Asset Storage: DAM Folder Structure | Non local asset (Reco) ${e.brand||y(n.auditedUrl)} ${v(n.locale)}:`,a=g(5),s=`Assets were detected under /content/dam/ whose regional folder does not match the expected page locale (${n.locale}).\n\nAudited URL: ${n.auditedUrl}\n\nDetected asset paths:\n${n.invalidPaths.map(e=>`- ${e}`).join(`
`)}`,c=h(e.teamName,e.teamId),d={...f,...e.teamId&&{customfield_10001:e.teamId},...c&&{customfield_14394:c}};o.textContent=`⏳ Creando Bug y vinculando al ticket principal...`;let p=await u({parentDetails:e,bugSummary:i,descriptionText:s,linkType:r.JIRA_DEFAULT_LINK_TYPE,customFields:d,labels:[],dueDate:a,assigneeAccountId:e.assigneeAccountId});o.innerHTML=`✅ Bug creado y vinculado: <a href="/browse/${p.key}" target="_blank" style="color:#38bdf8; font-weight:700;">${p.key}</a>`}catch(e){o.textContent=`❌ ${e.message}`,a.disabled=!1}})}function T(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}(function(){let e=`__qa_command_center_host__`,t=document.getElementById(e);if(t){t.remove();return}let r=document.createElement(`div`);r.id=e,document.body.appendChild(r);let i=r.attachShadow({mode:`open`}),a=document.createElement(`style`);a.textContent=`:host{all:initial;z-index:2147483647}.tool-window{color:#f1f5f9;z-index:2147483647;background:#0f172a;border:1px solid #334155;border-radius:10px;flex-direction:column;width:540px;max-height:calc(100vh - 40px);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:13px;display:flex;position:fixed;top:20px;right:20px;overflow:hidden;box-shadow:0 20px 30px -10px #000000b3,0 0 15px #0006}.tool-header{-webkit-user-select:none;user-select:none;background:#1e293b;border-bottom:1px solid #334155;justify-content:space-between;align-items:center;padding:12px 16px;display:flex}.tool-title{color:#38bdf8;font-size:13px;font-weight:700}.tool-close-btn{color:#94a3b8;cursor:pointer;background:0 0;border:none;padding:0 4px;font-size:16px;line-height:1}.tool-close-btn:hover{color:#ef4444}.tool-tabs{background:#1e293b;border-bottom:1px solid #334155;display:flex}.tab-btn{color:#94a3b8;cursor:pointer;background:0 0;border:none;border-bottom:2px solid #0000;flex:1;padding:9px 0;font-size:12px;font-weight:600;transition:all .2s}.tab-btn:hover{color:#f8fafc}.tab-btn.active{color:#38bdf8;background:#0f172a;border-bottom-color:#38bdf8}.tool-body{max-height:calc(100vh - 120px);padding:16px;overflow-y:auto}.tab-content{display:none}.tab-content.active{display:block}.field-label{color:#94a3b8;margin-top:10px;margin-bottom:4px;font-size:11px;font-weight:600;display:block}.field-label:first-child{margin-top:0}.field-input{box-sizing:border-box;color:#fff;background:#1e293b;border:1px solid #334155;border-radius:6px;width:100%;padding:7px 10px;font-size:12px}.readonly-field{cursor:default;color:#94a3b8!important;background:#141f33!important;border-color:#1e293b!important}.actions-group{margin-top:14px}.action-btn{color:#fff;cursor:pointer;background:#0284c7;border:none;border-radius:6px;width:100%;padding:9px;font-weight:600;transition:background .2s}.action-btn:hover{background:#0369a1}.action-btn:disabled{cursor:not-allowed;background:#475569}.log-console{color:#34d399;word-break:break-all;background:#020617;border:1px solid #1e293b;border-radius:6px;min-height:24px;margin-top:10px;padding:8px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}.frame-wrapper{border-top:1px solid #334155;margin-top:14px;padding-top:12px}.frame-header{justify-content:space-between;align-items:center;margin-bottom:8px;display:flex}.frame-title{color:#38bdf8;font-size:11px;font-weight:600}.frame-badge{color:#94a3b8;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:2px 6px;font-size:10px}.inline-frame{box-sizing:border-box;background:#fff;border:1px solid #334155;border-radius:6px;width:100%;height:420px}.placeholder-text{color:#64748b;text-align:center;padding:40px 0}.auth-bar{background:#141f33;border:1px solid #1e293b;border-radius:6px;justify-content:space-between;align-items:center;margin-bottom:12px;padding:8px 10px;display:flex}.auth-status-text{color:#94a3b8;font-size:11px}.auth-btn{color:#f8fafc;cursor:pointer;white-space:nowrap;background:#334155;border:1px solid #475569;border-radius:4px;padding:4px 8px;font-size:11px;font-weight:600;transition:all .2s}.auth-btn:hover{color:#fff;background:#0284c7;border-color:#38bdf8}.mini-btn{color:#94a3b8;cursor:pointer;background:0 0;border:1px solid #334155;border-radius:4px;padding:2px 6px;font-size:11px}.mini-btn:hover{color:#38bdf8;background:#1e293b}`,i.appendChild(a);let o=document.createElement(`div`);o.className=`tool-window`,o.innerHTML=`
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
  `,i.appendChild(o),i.getElementById(`btn-close-widget`).addEventListener(`click`,()=>{r.remove()});let s=i.querySelectorAll(`.tab-btn`),c=i.querySelectorAll(`.tab-content`);s.forEach(e=>{e.addEventListener(`click`,()=>{s.forEach(e=>e.classList.remove(`active`)),c.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=i.getElementById(`view-${e.dataset.tab}`);t&&t.classList.add(`active`)})});let l=window.location.href,u=window.location.hash.startsWith(`#bextool_bug=`);n(i.getElementById(`view-pistol`),l),S(i.getElementById(`view-modulo2`)),(u||window.location.hostname.includes(`atlassian.net`))&&i.querySelector(`[data-tab="modulo2"]`)?.click()})()})();