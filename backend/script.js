const URL = 'http://127.0.0.1:8000/activos';

const formulario = document.getElementById('formulario');
const tabla = document.getElementById('tabla-activos');

function calcularValores() {
  const c = Math.min(3, parseInt(document.getElementById('q1').value) + parseInt(document.getElementById('q2').value));
  const i = Math.min(3, parseInt(document.getElementById('q3').value) + parseInt(document.getElementById('q4').value));
  const d = Math.min(3, parseInt(document.getElementById('q5').value) + parseInt(document.getElementById('q6').value));

  document.getElementById('confidencialidad').value = c;
  document.getElementById('integridad').value = i;
  document.getElementById('disponibilidad').value = d;

  return { c, i, d };
}

function getClasificacionClase(valor) {
  if (valor <= 1.5) return "clasificacion-baja";
  else if (valor <= 2.4) return "clasificacion-media";
  else return "clasificacion-alta";
}

async function cargarActivos() {
  const res = await fetch(URL);
  const data = await res.json();
  tabla.innerHTML = '';
  data.forEach(activo => {
    const clase = getClasificacionClase(activo.clasificacion);
    tabla.innerHTML += `
      <tr>
        <td>${activo.id}</td>
        <td>${activo.nombre}</td>
        <td>${activo.tipo}</td>
        <td>${activo.responsable}</td>
        <td>${activo.ubicacion}</td>
        <td>${activo.confidencialidad}</td>
        <td>${activo.integridad}</td>
        <td>${activo.disponibilidad}</td>
        <td class="${clase}">${activo.clasificacion.toFixed(2)}</td>
        <td>${new Date(activo.fecha_registro).toLocaleString()}</td>
      </tr>
    `;
  });
}

formulario.addEventListener('change', calcularValores);

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { c, i, d } = calcularValores();

  const activo = {
    id: parseInt(document.getElementById('id').value),
    nombre: document.getElementById('nombre').value,
    tipo: document.getElementById('tipo').value,
    responsable: document.getElementById('responsable').value,
    ubicacion: document.getElementById('ubicacion').value,
    confidencialidad: c,
    integridad: i,
    disponibilidad: d
  };

  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activo)
  });

  if (res.ok) {
    formulario.reset();
    cargarActivos();
  } else {
    const err = await res.json();
    alert("Error: " + err.detail);
  }
});

cargarActivos();
