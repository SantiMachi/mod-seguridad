const resultados = []; // Para hoja extra del Excel
let datosOriginales = []; // Guardar datos originales

const percent = {
  confidencialidad: {1: 10, 2: 20, 3: 40},
  integridad: {1: 10, 2: 20, 3: 30},
  disponibilidad: {1: 10, 2: 20, 3: 30},
  privacidad: {1: 0, 2: 5, 3: 10}
};

let filaActual = null;
let camposActuales = null;

function preguntarClasificacion(campos, fila) {
  filaActual = fila;
  camposActuales = campos;

  document.getElementById("indexActivo").value = campos[0];
  document.getElementById("nombreActivo").textContent = `Activo: ${campos[1]}`;
  document.getElementById("modalClasificacion").style.display = "flex";
}


function procesarCSV() {
  const archivo = document.getElementById("csvFile").files[0];
  if (!archivo) {
    alert("Por favor, selecciona un archivo CSV.");
    return;
  }

  const lector = new FileReader();
  lector.onload = function (e) {
    const texto = e.target.result;
    const lineas = texto.split("\n").filter(linea => linea.trim() !== "");
    const cuerpoTabla = document.querySelector("#tablaActivos tbody");
    cuerpoTabla.innerHTML = "";

    datosOriginales = []; // Reset

    for (let i = 1; i < lineas.length; i++) {
      const campos = lineas[i].split(";").map(c => c.trim());
      if (campos.length < 9) continue;
      datosOriginales.push([...campos]);

      const fila = document.createElement("tr");
      campos.forEach(valor => {
        const td = document.createElement("td");
        td.textContent = valor;
        fila.appendChild(td);
      });

      const tdClasificar = document.createElement("td");
      const boton = document.createElement("button");
      boton.textContent = "Clasificar";
      boton.onclick = () => preguntarClasificacion(campos, fila);
      tdClasificar.appendChild(boton);
      fila.appendChild(tdClasificar);

      cuerpoTabla.appendChild(fila);
    }
  };
  lector.readAsText(archivo);
}

function descargarExcel() {
  if (datosOriginales.length === 0) {
    alert("Primero debes procesar un archivo y clasificar los activos.");
    return;
  }

  const cuerpoTabla = document.querySelector("#tablaActivos tbody");
    const hoja1 = [
    ["ID", "Nombre", "Tipo", "Descripción", "Propietario", "Autorizador", "Comentarios", "Estado", "Clasificación"]
    ];

    for (const fila of cuerpoTabla.rows) {
    const filaDatos = [];
    // Lee las primeras 9 celdas (excluye el botón)
    for (let i = 0; i < 9; i++) {
        filaDatos.push(fila.cells[i].textContent);
    }
    hoja1.push(filaDatos);
    }


  const hoja2 = [
    ["ID", "Confidencialidad", "Integridad", "Disponibilidad", "Privacidad", "Total", "Clasificación"],
    ...resultados.map(r => [
      r.ID, r.Confidencialidad, r.Integridad, r.Disponibilidad, r.Privacidad, r.Total, r.Clasificación
    ])
  ];

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(hoja1);
  const ws2 = XLSX.utils.aoa_to_sheet(hoja2);

  XLSX.utils.book_append_sheet(wb, ws1, "Activos Clasificados");
  XLSX.utils.book_append_sheet(wb, ws2, "Detalles Clasificación");

  XLSX.writeFile(wb, "activos_clasificados.xlsx");
}

function cerrarModal() {
  document.getElementById("modalClasificacion").style.display = "none";
}

document.getElementById("formClasificacion").addEventListener("submit", function (e) {
  e.preventDefault();

  const c1 = parseInt(document.getElementById("confidencialidad1").value);
  const c2 = parseInt(document.getElementById("confidencialidad2").value);
  const i1 = parseInt(document.getElementById("integridad1").value);
  const i2 = parseInt(document.getElementById("integridad2").value);
  const d1 = parseInt(document.getElementById("disponibilidad1").value);
  const d2 = parseInt(document.getElementById("disponibilidad2").value);
  const p = parseInt(document.getElementById("privacidad").value);

  const c = Math.round((c1 + c2) / 2);
  const i = Math.round((i1 + i2) / 2);
  const d = Math.round((d1 + d2) / 2);

  const suma = percent.confidencialidad[c] + percent.integridad[i] + percent.disponibilidad[d] + percent.privacidad[p];

  let clasificacion;
  if (suma >= 90) clasificacion = "Crítico o Confidencial";
  else if (suma >= 60) clasificacion = "Uso Interno o Privado";
  else clasificacion = "Público o de Uso General";

  // Actualiza valores en la tabla de datos
  camposActuales[7] = "Clasificado"; // Estado
  camposActuales[8] = clasificacion; // Clasificación

  resultados.push({
    ID: camposActuales[0],
    Confidencialidad: `${percent.confidencialidad[c]}%`,
    Integridad: `${percent.integridad[i]}%`,
    Disponibilidad: `${percent.disponibilidad[d]}%`,
    Privacidad: `${percent.privacidad[p]}%`,
    Total: `${suma}%`,
    Clasificación: clasificacion
  });

  filaActual.cells[7].textContent = "Clasificado";
  filaActual.cells[8].textContent = clasificacion;

  cerrarModal();
});


