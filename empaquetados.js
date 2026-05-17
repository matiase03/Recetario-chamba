// ================================================================
// EMPAQUETADOS
// ================================================================

const DIAS_EMP = ['Martes', 'Jueves', 'Viernes', 'Sábado'];

const PRODUCTOS_EMP = [
  'Lactal',
  'Viena',
  'Hamburguesa',
  'Panera',
  'Panera Orégano',
  'Pepas',
  'Crackers',
  'Grisines Tradicionales',
  'Grisines Queso',
];

const EMP_KEY = 'empaquetados';

// Credenciales para carga (mismo hash que el editor)
const EMP_USER = 'matiase03';
const EMP_PASS = '15462Asd';

// ── Obtener/guardar datos ─────────────────────────────────────
function getEmpaquetados() {
  try {
    const raw = localStorage.getItem(EMP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveEmpaquetados(data) {
  localStorage.setItem(EMP_KEY, JSON.stringify(data));
  // Sincronizar con Supabase
  if (typeof supaSync === 'function') supaSync(EMP_KEY, data);
}

function getValor(data, producto, dia) {
  return (data[producto] && data[producto][dia] !== undefined)
    ? data[producto][dia]
    : '';
}

// ── VISTA: Empaquetados ───────────────────────────────────────
function renderEmpaquetados() {
  const el = document.getElementById('tab-empaquetados');
  if (!el) return;

  const data = getEmpaquetados();

  // Verificar si hay algún dato cargado
  const hayDatos = PRODUCTOS_EMP.some(p =>
    DIAS_EMP.some(d => getValor(data, p, d) !== '')
  );

  const filasHTML = PRODUCTOS_EMP.map(prod => {
    const celdas = DIAS_EMP.map(dia => {
      const val = getValor(data, prod, dia);
      return `<td class="emp-celda${val === '' ? ' emp-vacia' : ''}">${val !== '' ? val : '—'}</td>`;
    }).join('');
    return `<tr><td class="emp-prod">${prod}</td>${celdas}</tr>`;
  }).join('');

  el.innerHTML = `
    <div style="padding-top:1.5rem">
      <div class="inicio-card">
        <div class="inicio-card-title">📦 Empaquetados de la semana</div>
        ${!hayDatos ? `
          <div style="text-align:center;padding:2rem;color:var(--text-light);font-style:italic;font-size:0.9rem">
            Aún no hay datos cargados.<br>Usá la sección "Carga" para ingresar las cantidades.
          </div>
        ` : `
          <div style="overflow-x:auto;margin-top:0.5rem">
            <table class="emp-tabla">
              <thead>
                <tr>
                  <th class="emp-th-prod">Producto</th>
                  ${DIAS_EMP.map(d => `<th class="emp-th-dia">${d}</th>`).join('')}
                </tr>
              </thead>
              <tbody>${filasHTML}</tbody>
            </table>
          </div>
        `}
      </div>
    </div>`;
}

// ── CARGA: Login y formulario ─────────────────────────────────
let _empLogueado = false;

function renderCargaEmp() {
  const el = document.getElementById('tab-carga-emp');
  if (!el) return;

  if (!_empLogueado) {
    el.innerHTML = `
      <div style="padding-top:1.5rem">
        <div class="admin-login">
          <h2>📝 Carga de empaquetados</h2>
          <input type="text" id="emp-user" placeholder="Usuario" autocomplete="off">
          <input type="password" id="emp-pass" placeholder="Contraseña">
          <button class="admin-login-btn" onclick="empLogin()">Entrar</button>
          <div class="admin-error" id="emp-error">Usuario o contraseña incorrectos</div>
        </div>
      </div>`;
    return;
  }

  _renderFormularioCarga(el);
}

function empLogin() {
  const user = document.getElementById('emp-user').value.trim();
  const pass = document.getElementById('emp-pass').value;
  if (user === EMP_USER && pass === EMP_PASS) {
    _empLogueado = true;
    renderCargaEmp();
  } else {
    document.getElementById('emp-error').style.display = 'block';
  }
}

function empLogout() {
  _empLogueado = false;
  renderCargaEmp();
}

function _renderFormularioCarga(el) {
  const data = getEmpaquetados();

  const filasHTML = PRODUCTOS_EMP.map(prod => {
    const celdas = DIAS_EMP.map(dia => {
      const val = getValor(data, prod, dia);
      const idInput = `emp-${prod.replace(/\s+/g,'-')}-${dia}`;
      return `<td style="padding:0.3rem 0.4rem">
        <input type="number" id="${idInput}" min="0" value="${val}"
          placeholder="—"
          style="width:56px;text-align:center;padding:0.4rem 0.3rem;border:1px solid var(--arena);border-radius:8px;font-size:0.9rem;background:var(--crema);color:var(--text);font-family:'Playfair Display',serif;font-weight:700"
          oninput="empGuardarCelda('${prod}','${dia}',this.value)">
      </td>`;
    }).join('');
    return `<tr>
      <td style="padding:0.5rem 0.6rem;font-size:0.88rem;font-weight:500;color:var(--text);white-space:nowrap">${prod}</td>
      ${celdas}
    </tr>`;
  }).join('');

  el.innerHTML = `
    <div style="padding-top:1.5rem">
      <div class="inicio-card">
        <div class="inicio-card-title" style="display:flex;justify-content:space-between;align-items:center">
          <span>📝 Cargar empaquetados</span>
          <button class="admin-logout-btn" style="margin:0;padding:0.3rem 0.8rem;font-size:0.75rem" onclick="empLogout()">← Salir</button>
        </div>
        <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:0.8rem">
          Los cambios se guardan automáticamente al escribir.
        </div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="text-align:left;padding:0.4rem 0.6rem;font-size:0.75rem;color:var(--text-light);font-weight:600;text-transform:uppercase;letter-spacing:0.8px">Producto</th>
                ${DIAS_EMP.map(d => `<th style="text-align:center;padding:0.4rem 0.3rem;font-size:0.75rem;color:var(--text-light);font-weight:600;text-transform:uppercase;letter-spacing:0.8px">${d}</th>`).join('')}
              </tr>
            </thead>
            <tbody>${filasHTML}</tbody>
          </table>
        </div>

        <div style="margin-top:1rem;display:flex;gap:0.6rem;flex-wrap:wrap">
          <button class="admin-save-btn" style="flex:1" onclick="empLimpiarTodo()">🗑 Limpiar todo</button>
        </div>
      </div>

      <div class="inicio-card" style="margin-top:0.8rem">
        <div class="inicio-card-title">⚡ Carga rápida por día</div>
        <div style="font-size:0.8rem;color:var(--text-light);margin-bottom:0.8rem">Limpiá todos los valores de un día de una vez.</div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          ${DIAS_EMP.map(d => `
            <button class="reset-btn" style="flex:1;min-width:80px" onclick="empLimpiarDia('${d}')">
              Limpiar ${d}
            </button>`).join('')}
        </div>
      </div>
    </div>`;
}

// Guarda una celda individual en tiempo real
function empGuardarCelda(producto, dia, valor) {
  const data = getEmpaquetados();
  if (!data[producto]) data[producto] = {};
  const num = parseInt(valor);
  data[producto][dia] = isNaN(num) || valor === '' ? '' : num;
  saveEmpaquetados(data);
  _showEmpToast();
}

function empLimpiarTodo() {
  if (!confirm('¿Limpiar todos los empaquetados?')) return;
  saveEmpaquetados({});
  renderCargaEmp();
  _showEmpToast('🗑 Limpiado');
}

function empLimpiarDia(dia) {
  if (!confirm(`¿Limpiar todos los valores del ${dia}?`)) return;
  const data = getEmpaquetados();
  PRODUCTOS_EMP.forEach(p => {
    if (data[p]) data[p][dia] = '';
  });
  saveEmpaquetados(data);
  renderCargaEmp();
  _showEmpToast(`🗑 ${dia} limpiado`);
}

function _showEmpToast(msg = '✓ Guardado') {
  const t = document.getElementById('saved-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}
