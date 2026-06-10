const STORAGE_KEY = 'certificacion_v2';

const hoy = new Date();
const fmt  = d => d.toISOString().split('T')[0];
const hace = (d) => { const x = new Date(hoy); x.setDate(x.getDate() - d); return fmt(x); };
const en   = (d) => { const x = new Date(hoy); x.setDate(x.getDate() + d); return fmt(x); };

const DATA_INICIAL = [
  { id:1,  asistente:'Ana García',       carrera:'Ingeniería de Sistemas', email:'ana@mail.com',    telefono:'3001234567', evento:'Excel Avanzado',        modalidad:'presencial', obligatorio:'si', fechaInicio: hace(30), fechaFin: hace(5),  diasPresente:8,  diasTotales:10, req:80 },
  { id:2,  asistente:'Carlos Mendoza',   carrera:'Administración',         email:'carlos@mail.com', telefono:'3109876543', evento:'Excel Avanzado',        modalidad:'presencial', obligatorio:'si', fechaInicio: hace(30), fechaFin: hace(5),  diasPresente:5,  diasTotales:10, req:80 },
  { id:3,  asistente:'Lucía Torres',     carrera:'Contaduría',             email:'lucia@mail.com',  telefono:'3205551234', evento:'Excel Avanzado',        modalidad:'virtual',    obligatorio:'no', fechaInicio: hace(30), fechaFin: hace(5),  diasPresente:9,  diasTotales:10, req:80 },
  { id:4,  asistente:'Pedro Ramírez',    carrera:'Ingeniería Industrial',  email:'pedro@mail.com',  telefono:'3001112222', evento:'Python para Datos',     modalidad:'virtual',    obligatorio:'si', fechaInicio: hace(10), fechaFin: en(10),   diasPresente:6,  diasTotales:10, req:75 },
  { id:5,  asistente:'Sofía Herrera',    carrera:'Estadística',            email:'sofia@mail.com',  telefono:'3153334444', evento:'Python para Datos',     modalidad:'virtual',    obligatorio:'si', fechaInicio: hace(10), fechaFin: en(10),   diasPresente:8,  diasTotales:10, req:75 },
  { id:6,  asistente:'Miguel Ruiz',      carrera:'Matemáticas',            email:'miguel@mail.com', telefono:'3175556666', evento:'Python para Datos',     modalidad:'presencial', obligatorio:'no', fechaInicio: hace(10), fechaFin: en(10),   diasPresente:9,  diasTotales:10, req:75 },
  { id:7,  asistente:'Valentina Cruz',   carrera:'Psicología',             email:'vale@mail.com',   telefono:'3207778888', evento:'Liderazgo Empresarial', modalidad:'presencial', obligatorio:'si', fechaInicio: en(15),   fechaFin: en(25),   diasPresente:0,  diasTotales:8,  req:85 },
  { id:8,  asistente:'Andrés Morales',   carrera:'Administración',         email:'andres@mail.com', telefono:'3119990000', evento:'Liderazgo Empresarial', modalidad:'presencial', obligatorio:'si', fechaInicio: en(15),   fechaFin: en(25),   diasPresente:0,  diasTotales:8,  req:85 },
  { id:9,  asistente:'Camila Jiménez',   carrera:'Comunicación Social',    email:'cami@mail.com',   telefono:'3001231231', evento:'Liderazgo Empresarial', modalidad:'virtual',    obligatorio:'no', fechaInicio: en(15),   fechaFin: en(25),   diasPresente:0,  diasTotales:8,  req:85 },
  { id:10, asistente:'Felipe Ortega',    carrera:'Salud Ocupacional',      email:'felipe@mail.com', telefono:'3164564567', evento:'Seguridad Industrial',  modalidad:'presencial', obligatorio:'si', fechaInicio: hace(60), fechaFin: hace(30), diasPresente:20, diasTotales:20, req:90 },
  { id:11, asistente:'Daniela Vargas',   carrera:'Ingeniería Ambiental',   email:'dani@mail.com',   telefono:'3207897890', telefono:'3207897890', evento:'Seguridad Industrial',  modalidad:'presencial', obligatorio:'si', fechaInicio: hace(60), fechaFin: hace(30), diasPresente:17, diasTotales:20, req:90 },
  { id:12, asistente:'Natalia Ríos',     carrera:'Marketing',              email:'nata@mail.com',   telefono:'3001230000', evento:'Marketing Digital',     modalidad:'virtual',    obligatorio:'no', fechaInicio: hace(5),  fechaFin: en(5),    diasPresente:4,  diasTotales:7,  req:70 },
  { id:13, asistente:'Ricardo Peña',     carrera:'Diseño Gráfico',         email:'rico@mail.com',   telefono:'3154567890', evento:'Marketing Digital',     modalidad:'virtual',    obligatorio:'no', fechaInicio: hace(5),  fechaFin: en(5),    diasPresente:5,  diasTotales:7,  req:70 },
];

function calcular(raw) {
  const inicio = raw.fechaInicio ? new Date(raw.fechaInicio + 'T00:00:00') : null;
  const fin    = raw.fechaFin    ? new Date(raw.fechaFin    + 'T00:00:00') : null;
  const ahora  = new Date(); ahora.setHours(0,0,0,0);

  let estadoEvento = 'proximo';
  if (inicio && fin) {
    if (ahora < inicio)    estadoEvento = 'proximo';
    else if (ahora > fin)  estadoEvento = 'finalizado';
    else                   estadoEvento = 'en_curso';
  }

  const pct      = raw.diasTotales > 0 ? parseFloat((raw.diasPresente / raw.diasTotales * 100).toFixed(2)) : 0;
  const aprobado = raw.obligatorio === 'no' ? true : pct >= raw.req;

  return { ...raw, pct, aprobado, estadoEvento };
}

function cargarDatos() {
  try { const g = localStorage.getItem(STORAGE_KEY); return g ? JSON.parse(g) : [...DATA_INICIAL]; }
  catch { return [...DATA_INICIAL]; }
}
function guardarDatos() { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }

let DB     = cargarDatos().map(calcular);
let nextId = DB.length ? Math.max(...DB.map(d => d.id)) + 1 : 1;

let sortCol        = 'pct';
let sortDir        = -1;
let tabActual      = 'todos';
let pendingDeleteId = null;

function cambiarTab(el, tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  tabActual = tab;
  render();
}

function getFiltered() {
  const q         = document.getElementById('search').value.toLowerCase();
  const ev        = document.getElementById('filterEvento').value;
  const estado    = document.getElementById('filterEstado').value;
  const modalidad = document.getElementById('filterModalidad').value;

  return DB.filter(r => {
    if (tabActual !== 'todos' && r.estadoEvento !== tabActual) return false;
    if (q && !r.asistente.toLowerCase().includes(q) && !r.evento.toLowerCase().includes(q)) return false;
    if (ev && r.evento !== ev) return false;
    if (estado === 'APROBADO'  && !r.aprobado) return false;
    if (estado === 'REPROBADO' &&  r.aprobado) return false;
    if (modalidad && r.modalidad !== modalidad) return false;
    return true;
  });
}

function sortBy(col) {
  if (sortCol === col) sortDir *= -1; else { sortCol = col; sortDir = -1; }
  render();
}
function getSorted(rows) {
  const keyMap = { asistente:'asistente', evento:'evento', modalidad:'modalidad',
    obligatorio:'obligatorio', dias:'diasPresente', pct:'pct', req:'req',
    estado:'aprobado', estadoEvento:'estadoEvento' };
  const k = keyMap[sortCol];
  return [...rows].sort((a, b) => {
    if (typeof a[k] === 'string') return a[k].localeCompare(b[k]) * sortDir;
    return (a[k] - b[k]) * sortDir;
  });
}

function renderStats(rows) {
  const aprobados   = rows.filter(r => r.aprobado).length;
  const promPct     = rows.length ? (rows.reduce((s,r)=>s+r.pct,0)/rows.length) : 0;
  const enCurso     = new Set(rows.filter(r=>r.estadoEvento==='en_curso').map(r=>r.evento)).size;
  const proximo    = new Set(rows.filter(r=>r.estadoEvento==='proximo').map(r=>r.evento)).size;
  const eventos     = new Set(rows.map(r=>r.evento)).size;

  document.getElementById('stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Inscripciones</div><div class="stat-value">${rows.length}</div><div class="stat-sub">${eventos} evento${eventos!==1?'s':''}</div></div>
    <div class="stat-card"><div class="stat-label">Aprobados</div><div class="stat-value" style="color:var(--green)">${aprobados}</div><div class="stat-sub">${rows.length?Math.round(aprobados/rows.length*100):0}% del total</div></div>
    <div class="stat-card"><div class="stat-label">Reprobados</div><div class="stat-value" style="color:var(--red)">${rows.length-aprobados}</div><div class="stat-sub">en vista actual</div></div>
    <div class="stat-card"><div class="stat-label">Asistencia prom.</div><div class="stat-value">${promPct.toFixed(1)}%</div><div class="stat-sub">en vista actual</div></div>
    <div class="stat-card"><div class="stat-label">En curso / Próximo</div><div class="stat-value">${enCurso} / ${proximo}</div><div class="stat-sub">eventos activos</div></div>
  `;
}

function badgeEstadoEvento(e) {
  const map = {
    proximo:    ['badge-proximo',    '▴Próximamente'],
    en_curso:   ['badge-en-curso',   '▶En curso'],
    finalizado: ['badge-finalizado', '✓Finalizado'],
    proximo:  ['badge-finalizado', '—Próximo'],
  };
  const [cls, txt] = map[e] || map.proximo
  ;
  return `<span class="badge ${cls}">${txt}</span>`;
}

function renderSortArrows() {
  ['asistente','evento','modalidad','obligatorio','dias','pct','req','estado','estadoEvento'].forEach(c => {
    const el = document.getElementById('s-'+c);
    if (el) el.textContent = sortCol===c ? (sortDir===1?'↑':'↓') : '';
  });
}

function renderRows(rows) {
  const tbody = document.getElementById('tbody');
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty">No hay registros que coincidan con los filtros.</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map(r => {
    const barColor  = r.aprobado ? 'var(--green)' : 'var(--red)';
    const barWidth  = Math.min(100, r.pct).toFixed(1);
    const badgeCert = r.estadoEvento === '▴proximo'
      ? `<span class="badge badge-proximo">Pendiente</span>`
      : `<span class="badge ${r.aprobado?'badge-aprobado':'badge-reprobado'}">${r.aprobado?'✓ Aprobado':'✗ Reprobado'}</span>`;
    const pillMod   = `<span class="pill-modalidad pill-${r.modalidad}">${r.modalidad==='presencial'?'':''} ${r.modalidad.charAt(0).toUpperCase()+r.modalidad.slice(1)}</span>`;
    const pillObl   = `<span class="pill-oblig pill-${r.obligatorio}">${r.obligatorio==='si'?'Sí':'No'}</span>`;

    return `<tr>
      <td><span style="font-weight:600">${r.asistente}</span>${r.carrera?`<br><span style="font-size:11px;color:var(--text-muted)">${r.carrera}</span>`:''}</td>
      <td>${r.evento}${r.fechaInicio?`<br><span style="font-size:11px;color:var(--text-muted)">${r.fechaInicio} → ${r.fechaFin}</span>`:''}</td>
      <td>${pillMod}</td>
      <td class="center">${pillObl}</td>
      <td class="center">${r.diasPresente}/${r.diasTotales}</td>
      <td>
        <div class="bar-wrap">
          <div class="bar-bg"><div class="bar-fill" style="width:${barWidth}%;background:${barColor}"></div></div>
          <span class="pct-text" style="color:${barColor}">${r.pct.toFixed(1)}%</span>
        </div>
      </td>
      <td class="center">${badgeEstadoEvento(r.estadoEvento)}</td>
      <td>${badgeCert}</td>
      <td><div class="actions-cell">
        <button class="btn-info"   onclick="abrirDetalle(${r.id})">👁</button>
<button class="btn-cert"   onclick="generarCertificado(${r.id})" ${r.estadoEvento !== 'finalizado' ? 'disabled title="Solo disponible para eventos finalizados"' : 'title="Descargar certificado PDF"'}>❀</button>
        <button class="btn-edit"   onclick="abrirModalEditar(${r.id})">✏</button>
        <button class="btn-delete" onclick="abrirConfirm(${r.id})">🗑</button>
      </div></td>
    </tr>`;
  }).join('');
}

function render() {
  const filtered = getFiltered();
  const sorted   = getSorted(filtered);
  renderStats(sorted);
  renderSortArrows();
  renderRows(sorted);
  actualizarSelectEventos();
}

function actualizarSelectEventos() {
  const eventos = [...new Set(DB.map(d => d.evento))].sort();

  const filterSel = document.getElementById('filterEvento');
  const val = filterSel.value;
  filterSel.innerHTML = '<option value="">Todos los eventos</option>';
  eventos.forEach(ev => { const o=document.createElement('option'); o.value=ev; o.textContent=ev; if(ev===val) o.selected=true; filterSel.appendChild(o); });

  const modalSel = document.getElementById('inputEvento');
  if (modalSel) {
    const valM = modalSel.value;
    modalSel.innerHTML = '<option value="">— Evento existente —</option>';
    eventos.forEach(ev => { const o=document.createElement('option'); o.value=ev; o.textContent=ev; if(ev===valM) o.selected=true; modalSel.appendChild(o); });
  }
}

function selToggle(groupId, btn) {
  const group = document.getElementById(groupId);
  group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const hidden = groupId === 'modalidadGroup' ? 'inputModalidad' : 'inputObligatorio';
  document.getElementById(hidden).value = btn.dataset.val;

  // Comportamiento automatizado si se cambia el estado de obligatoriedad
  if (groupId === 'obligatorioGroup') {
    const inputReq = document.getElementById('inputReq');
    if (btn.dataset.val === 'no') {
      inputReq.value = '0'; // Forzar a 0% si no es obligatorio
    } else if (inputReq.value === '0' || !inputReq.value) {
      inputReq.value = '80'; // Restablecer un valor sugerido por defecto si regresa a "Sí"
    }
    calcularPreview(); // Actualizar el recuadro de previsualización del modal
  }
}

function abrirModal() {
  limpiarModal();
  document.getElementById('modalTitulo').textContent = 'Nueva inscripción';
  document.getElementById('editId').value = '';
  actualizarSelectEventos();
  document.getElementById('modalOverlay').classList.add('active');
  setTimeout(() => document.getElementById('inputAsistente').focus(), 100);
}

function abrirModalEditar(id) {
  const r = DB.find(d => d.id === id);
  if (!r) return;
  limpiarModal();
  actualizarSelectEventos();

  document.getElementById('modalTitulo').textContent = 'Editar inscripción';
  document.getElementById('editId').value   = id;
  document.getElementById('inputAsistente').value  = r.asistente;
  document.getElementById('inputCarrera').value    = r.carrera    || '';
  document.getElementById('inputEmail').value      = r.email      || '';
  document.getElementById('inputTelefono').value   = r.telefono   || '';
  document.getElementById('inputEvento').value     = r.evento;
  document.getElementById('inputFechaInicio').value = r.fechaInicio || '';
  document.getElementById('inputFechaFin').value   = r.fechaFin   || '';
  document.getElementById('inputPresente').value   = r.diasPresente;
  document.getElementById('inputTotales').value    = r.diasTotales;
  document.getElementById('inputReq').value        = r.req;

  document.getElementById('inputModalidad').value = r.modalidad;
  document.getElementById('modalidadGroup').querySelectorAll('.toggle-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.val === r.modalidad);
  });
  // Toggle obligatorio
  document.getElementById('inputObligatorio').value = r.obligatorio;
  document.getElementById('obligatorioGroup').querySelectorAll('.toggle-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.val === r.obligatorio);
  });

  actualizarEstadoEvento();
  calcularPreview();
  document.getElementById('modalOverlay').classList.add('active');
}

function cerrarModal() { document.getElementById('modalOverlay').classList.remove('active'); }
function cerrarModalClick(e) { if (e.target === document.getElementById('modalOverlay')) cerrarModal(); }

function limpiarModal() {
  ['inputAsistente','inputCarrera','inputEmail','inputTelefono',
   'inputEventoNuevo','inputFechaInicio','inputFechaFin',
   'inputPresente','inputTotales','inputReq'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error'); }
  });
  document.getElementById('inputEvento').value = '';
  ['errAsistente','errEmail','errEvento','errFechaInicio','errFechaFin','errPresente','errTotales','errReq'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '';
  });

  document.getElementById('inputModalidad').value  = 'presencial';
  document.getElementById('inputObligatorio').value = 'si';
  document.getElementById('modalidadGroup').querySelectorAll('.toggle-btn').forEach((b,i) => b.classList.toggle('active', i===0));
  document.getElementById('obligatorioGroup').querySelectorAll('.toggle-btn').forEach((b,i) => b.classList.toggle('active', i===0));

  document.getElementById('previewBox').style.display = 'none';
  document.getElementById('estadoEventoPreview').textContent = '—';
  document.getElementById('estadoEventoPreview').style.color = '';
}

function onEventoSelect() {
  const v = document.getElementById('inputEvento').value;
  if (v) {
    document.getElementById('inputEventoNuevo').value = '';
   
    const existente = DB.find(d => d.evento === v);
    if (existente) {
      if (!document.getElementById('inputFechaInicio').value) document.getElementById('inputFechaInicio').value = existente.fechaInicio || '';
      if (!document.getElementById('inputFechaFin').value)   document.getElementById('inputFechaFin').value   = existente.fechaFin   || '';
      if (!document.getElementById('inputReq').value)        document.getElementById('inputReq').value        = existente.req;
      actualizarEstadoEvento();
    }
  }
}
function onEventoInput() {
  if (document.getElementById('inputEventoNuevo').value.trim())
    document.getElementById('inputEvento').value = '';
}

function actualizarEstadoEvento() {
  const inicio = document.getElementById('inputFechaInicio').value;
  const fin    = document.getElementById('inputFechaFin').value;
  const el     = document.getElementById('estadoEventoPreview');
  if (!inicio || !fin) { el.textContent = '—Próximo'; el.style.color = ''; return; }

  const ahora = new Date(); ahora.setHours(0,0,0,0);
  const i = new Date(inicio + 'T00:00:00');
  const f = new Date(fin    + 'T00:00:00');
  let txt, color;
  if (ahora < i)      { txt = '▴Próximo'; color = 'var(--blue)'; }
  else if (ahora > f) { txt = '✓ Finalizado';    color = 'var(--text-muted)'; }
  else                { txt = '▶ En curso';       color = 'var(--green)'; }
  el.textContent = txt; el.style.color = color;
}

function calcularPreview() {
  const p = parseInt(document.getElementById('inputPresente').value);
  const t = parseInt(document.getElementById('inputTotales').value);
  const r = parseInt(document.getElementById('inputReq').value);
  const box = document.getElementById('previewBox');
  if (isNaN(p)||isNaN(t)||isNaN(r)||t<=0) { box.style.display='none'; return; }
  const pct = p/t*100;
  const ok  = pct >= r;
  box.style.display = 'flex';
  document.getElementById('prevPct').textContent = pct.toFixed(1)+'%';
  document.getElementById('prevPct').style.color = ok ? 'var(--green)' : 'var(--red)';
  document.getElementById('prevEstado').textContent = ok ? '✓ Aprobado' : '✗ Reprobado';
  document.getElementById('prevEstado').style.color = ok ? 'var(--green)' : 'var(--red)';
}

function validar() {
  let ok = true;
  const se = (inputId, errId, msg) => {
    const el = document.getElementById(inputId);
    if (el) el.classList.toggle('error', !!msg);
    const err = document.getElementById(errId);
    if (err) err.textContent = msg || '';
    if (msg) ok = false;
  };

  const asistente = document.getElementById('inputAsistente').value.trim();
  se('inputAsistente','errAsistente', asistente ? '' : 'El nombre es obligatorio.');

  const email = document.getElementById('inputEmail').value.trim();
  const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  se('inputEmail','errEmail', emailOk ? '' : 'Correo inválido.');

  const eventoSel  = document.getElementById('inputEvento').value;
  const eventoNuevo = document.getElementById('inputEventoNuevo').value.trim();
  const evento = eventoSel || eventoNuevo;
  if (!evento) {
    document.getElementById('inputEvento').classList.add('error');
    document.getElementById('inputEventoNuevo').classList.add('error');
    document.getElementById('errEvento').textContent = 'Selecciona o escribe un evento.';
    ok = false;
  } else {
    document.getElementById('inputEvento').classList.remove('error');
    document.getElementById('inputEventoNuevo').classList.remove('error');
    document.getElementById('errEvento').textContent = '';
  }

  const inicio = document.getElementById('inputFechaInicio').value;
  const fin    = document.getElementById('inputFechaFin').value;
  se('inputFechaInicio','errFechaInicio', inicio ? '' : 'Fecha requerida.');
  se('inputFechaFin',   'errFechaFin',   fin    ? '' : 'Fecha requerida.');
  if (inicio && fin && fin < inicio) {
    se('inputFechaFin','errFechaFin','La fecha de fin debe ser posterior al inicio.');
  }

  const p = parseInt(document.getElementById('inputPresente').value);
  const t = parseInt(document.getElementById('inputTotales').value);
  se('inputPresente','errPresente', isNaN(p)||p<0 ? 'Número inválido.' : '');
  se('inputTotales', 'errTotales',  isNaN(t)||t<1 ? 'Mínimo 1.'       : p>t ? 'No puede superar los días totales.' : '');

  const req = parseInt(document.getElementById('inputReq').value);
  const esObligatorio = document.getElementById('inputObligatorio').value === 'si';
  
  if (!esObligatorio) {
    // Si no es obligatorio, permitimos desde 0 hasta 100
    se('inputReq','errReq', isNaN(req)||req<0||req>100 ? 'Entre 0 y 100.' : '');
  } else {
    // Si es obligatorio, mantiene la regla estricta original
    se('inputReq','errReq', isNaN(req)||req<1||req>100 ? 'Entre 1 y 100.' : '');
  }

  return ok;
}

function guardarRegistro() {
  if (!validar()) return;

  const editId     = document.getElementById('editId').value;
  const asistente  = document.getElementById('inputAsistente').value.trim();
  const carrera    = document.getElementById('inputCarrera').value.trim();
  const email      = document.getElementById('inputEmail').value.trim();
  const telefono   = document.getElementById('inputTelefono').value.trim();
  const evento     = document.getElementById('inputEvento').value || document.getElementById('inputEventoNuevo').value.trim();
  const modalidad  = document.getElementById('inputModalidad').value;
  const obligatorio = document.getElementById('inputObligatorio').value;
  const fechaInicio = document.getElementById('inputFechaInicio').value;
  const fechaFin    = document.getElementById('inputFechaFin').value;
  const diasPresente = parseInt(document.getElementById('inputPresente').value);
  const diasTotales  = parseInt(document.getElementById('inputTotales').value);
  const req          = parseInt(document.getElementById('inputReq').value);

  const raw = { asistente, carrera, email, telefono, evento, modalidad, obligatorio, fechaInicio, fechaFin, diasPresente, diasTotales, req };

  if (editId) {
    const idx = DB.findIndex(d => d.id === parseInt(editId));
    if (idx !== -1) { DB[idx] = calcular({ ...DB[idx], ...raw }); mostrarToast('Registro actualizado. ✓'); }
  } else {
    DB.push(calcular({ id: nextId++, ...raw }));
    mostrarToast('Inscripción agregada. ✓');
  }

  guardarDatos();
  cerrarModal();
  render();
}

function abrirDetalle(id) {
  const r = DB.find(d => d.id === id);
  if (!r) return;

  const campo = (label, val) => `
    <div class="detalle-item">
      <div class="detalle-label">${label}</div>
      <div class="detalle-val ${!val?'muted':''}">${val || '—'}</div>
    </div>`;

  document.getElementById('detalleBody').innerHTML = `
    <div class="detalle-grid">
      ${campo('Nombre', r.asistente)}
      ${campo('Carrera / Programa', r.carrera)}
      <div class="detalle-sep"></div>
      ${campo('Correo electrónico', r.email ? `<a href="mailto:${r.email}" style="color:var(--purple-main)">${r.email}</a>` : '')}
      ${campo('Teléfono / WhatsApp', r.telefono ? `<a href="tel:${r.telefono}" style="color:var(--purple-main)">${r.telefono}</a>` : '')}
      <div class="detalle-sep"></div>
      ${campo('Evento', r.evento)}
      ${campo('Modalidad', r.modalidad.charAt(0).toUpperCase()+r.modalidad.slice(1))}
      ${campo('Asistencia obligatoria', r.obligatorio === 'si' ? 'Sí' : 'No')}
      ${campo('Fechas', r.fechaInicio && r.fechaFin ? `${r.fechaInicio} → ${r.fechaFin}` : '')}
      <div class="detalle-sep"></div>
      ${campo('Días presentes / Totales', `${r.diasPresente} / ${r.diasTotales}`)}
      ${campo('Porcentaje obtenido', r.pct.toFixed(1)+'%')}
      ${campo('% mínimo requerido', r.req+'%')}
      ${campo('Estado de certificación', r.estadoEvento==='▴proximo' ? 'Pendiente (evento no iniciado)' : r.aprobado ? '✓ Aprobado' : '✗ Reprobado')}
    </div>`;

  document.getElementById('detalleOverlay').classList.add('active');
}
function cerrarDetalle() { document.getElementById('detalleOverlay').classList.remove('active'); }
function cerrarDetalleClick(e) { if (e.target === document.getElementById('detalleOverlay')) cerrarDetalle(); }

function abrirConfirm(id) {
  const r = DB.find(d => d.id === id);
  if (!r) return;
  pendingDeleteId = id;
  document.getElementById('confirmNombre').textContent = `${r.asistente} en "${r.evento}"`;
  document.getElementById('confirmOverlay').classList.add('active');
}
function cerrarConfirm() { pendingDeleteId = null; document.getElementById('confirmOverlay').classList.remove('active'); }
function cerrarConfirmClick(e) { if (e.target === document.getElementById('confirmOverlay')) cerrarConfirm(); }
function confirmarEliminar() {
  if (pendingDeleteId === null) return;
  DB = DB.filter(d => d.id !== pendingDeleteId);
  guardarDatos(); cerrarConfirm(); render();
  mostrarToast('Registro eliminado. ✓');
}

let toastTimer = null;
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { cerrarModal(); cerrarConfirm(); cerrarDetalle(); }
});

function generarCertificado(id) {
  const r = DB.find(d => d.id === id);
  // 1. Ahora solo frena la descarga si el registro no existe
  if (!r) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const W = 297, H = 210;

  doc.setFillColor(74, 63, 107);        
  doc.rect(0, 0, W, H, 'F');

  doc.setFillColor(108, 96, 130);    
  doc.rect(0, H - 45, W, 45, 'F');

  doc.setFillColor(179, 157, 219);     
  doc.rect(0, 0, W, 6, 'F');

  doc.setFillColor(179, 157, 219);
  doc.rect(0, H - 6, W, 6, 'F');

  doc.setFillColor(179, 157, 219);
  doc.rect(0, 0, 6, H, 'F');
  doc.rect(W - 6, 0, 6, H, 'F');

  doc.setFontSize(36);
  doc.text('Flower Events', W / 2, 38, { align: 'center' });

  doc.setTextColor(217, 207, 240);     
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('CERTIFICA QUE', W / 2, 50, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(r.asistente.toUpperCase(), W / 2, 68, { align: 'center' });

  doc.setDrawColor(179, 157, 219);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 80, 72, W / 2 + 80, 72);

  if (r.carrera) {
    doc.setTextColor(217, 207, 240);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text(r.carrera, W / 2, 80, { align: 'center' });
  }

  doc.setTextColor(217, 207, 240);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const modalidadTxt = r.modalidad === 'virtual' ? 'modalidad virtual' : 'modalidad presencial';
  doc.text(`ha completado satisfactoriamente el evento en ${modalidadTxt}:`, W / 2, 95, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(19);
  doc.setFont('helvetica', 'bold');
  doc.text(`"${r.evento}"`, W / 2, 108, { align: 'center' });

  if (r.fechaInicio && r.fechaFin) {
    doc.setTextColor(217, 207, 240);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Del ${r.fechaInicio} al ${r.fechaFin}`, W / 2, 117, { align: 'center' });
  }

  doc.setTextColor(217, 207, 240);
  doc.setFontSize(10);
  doc.text(
    `Asistencia: ${r.diasPresente} de ${r.diasTotales} días (${r.pct.toFixed(1)}%)  ·  Mínimo requerido: ${r.req}%`,
    W / 2, 128, { align: 'center' }
  );

  if (r.aprobado) {
    doc.setDrawColor(76, 175, 130); 
    doc.setLineWidth(1.5);
    doc.roundedRect(W / 2 - 24, 133, 48, 12, 3, 3, 'S');
    doc.setTextColor(76, 175, 130);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('•APROBADO', W / 2, 141, { align: 'center' });
  } else {
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(1.5);
    doc.roundedRect(W / 2 - 28, 133, 56, 12, 3, 3, 'S');
    doc.setTextColor(33, 150, 243);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('•PARTICIPANTE', W / 2, 141, { align: 'center' });
  }

  const hoy = new Date().toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' });
  doc.setTextColor(179, 157, 219);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Emitido el ${hoy}`, W / 2, H - 18, { align: 'center' });

  const nombreArchivo = `Certificado_${r.asistente.replace(/\s+/g,'_')}_${r.evento.replace(/\s+/g,'_')}.pdf`;
  doc.save(nombreArchivo);

  mostrarToast('Certificado descargado.');
}

actualizarSelectEventos();
render();