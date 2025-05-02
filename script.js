document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('depreciacionForm');
    const resultadoContainer = document.getElementById('resultadoContainer');
    const resumenActivo = document.getElementById('resumenActivo');
    const tablaDepreciacion = document.querySelector('#tablaDepreciacion tbody');
    const estadoActivoSelect = document.getElementById('estadoActivo');
    const depreciacionAnteriorContainer = document.createElement('div');

    // Configuración del contenedor para depreciación anterior
    depreciacionAnteriorContainer.className = 'col-md-6 mt-3';
    depreciacionAnteriorContainer.innerHTML = `
        <label for="depreciacionAnterior" class="form-label">
            <i class="fas fa-history me-2"></i>Depreciación de Años Anteriores
        </label>
        <div class="input-group">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control" id="depreciacionAnterior" min="0" step="0.01" value="0">
        </div>
    `;
    depreciacionAnteriorContainer.style.display = 'none';
    estadoActivoSelect.closest('.col-md-6').after(depreciacionAnteriorContainer);

    // Mostrar/ocultar campo de depreciación anterior según estado del activo
    estadoActivoSelect.addEventListener('change', function () {
        if (this.value === 'usado') {
            depreciacionAnteriorContainer.style.display = 'block';
        } else {
            depreciacionAnteriorContainer.style.display = 'none';
            document.getElementById('depreciacionAnterior').value = 0;
        }
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        calcularDepreciacion();
    });

    // Función principal para calcular la depreciación
    function calcularDepreciacion() {
        const fechaCompra = document.getElementById('fechaCompra').value;
        const creditoFiscal = document.getElementById('creditoFiscal').value;
        const descripcionActivo = document.getElementById('descripcionActivo').value;
        const montoCompra = parseFloat(document.getElementById('montoCompra').value);
        const aniosDepreciacion = parseInt(document.getElementById('aniosDepreciacion').value);
        const estadoActivo = document.getElementById('estadoActivo').value;
        const depreciacionAnterior = parseFloat(document.getElementById('depreciacionAnterior').value) || 0;

        // Validación de campos
        if (!fechaCompra || !creditoFiscal || !descripcionActivo || isNaN(montoCompra) || isNaN(aniosDepreciacion)) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor complete todos los campos correctamente',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        const fechaAdquisicion = new Date(fechaCompra);
        const diaAdquisicion = fechaAdquisicion.getDate();
        const mesAdquisicion = fechaAdquisicion.getMonth();
        const añoAdquisicion = fechaAdquisicion.getFullYear();

        const valorAdquisicion = parseFloat(montoCompra.toFixed(2));
        const cuotaAnual = parseFloat((valorAdquisicion / aniosDepreciacion).toFixed(2));
        const cuotaMensual = parseFloat((cuotaAnual / 12).toFixed(2));
        const cuotaDiaria = parseFloat((cuotaMensual / 30).toFixed(2));

        mostrarResumen(fechaCompra, creditoFiscal, descripcionActivo, montoCompra, aniosDepreciacion, estadoActivo, depreciacionAnterior);
        generarTablaDepreciacion(fechaAdquisicion, diaAdquisicion, mesAdquisicion, añoAdquisicion, creditoFiscal, descripcionActivo, valorAdquisicion, aniosDepreciacion, cuotaAnual, cuotaMensual, cuotaDiaria, depreciacionAnterior, estadoActivo);

        resultadoContainer.style.display = 'block';
        window.scrollTo({ top: resultadoContainer.offsetTop, behavior: 'smooth' });
    }

// Función para mostrar el resumen del activo
function mostrarResumen(fechaCompra, creditoFiscal, descripcion, monto, años, estado, depreciacionAnterior) {
    const fechaFormateada = new Date(fechaCompra).toLocaleDateString('es-ES');
    const montoFormateado = `$${monto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Obtener el valor de "Contribuyente" del formulario
    const contribuyente = document.getElementById('nombreContribuyente').value;

    resumenActivo.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Fecha de Compra:</strong> ${fechaFormateada}</p>
                <p><strong>Descripción:</strong> ${descripcion}</p>
                <p><strong>Estado:</strong> ${estado === 'nuevo' ? 'Nuevo' : 'Usado'}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Crédito Fiscal:</strong> ${creditoFiscal}</p>
                <p><strong>Valor de Adquisición:</strong> ${montoFormateado}</p>
                <p><strong>Años de Depreciación:</strong> ${años}</p>
                ${estado === 'usado' ? `<p><strong>Depreciación Anterior:</strong> $${depreciacionAnterior.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>` : ''}
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-md-12">
                <p><strong>Contribuyente:</strong> ${contribuyente}</p>
            </div>
        </div>
        <div class="alert alert-info mt-3">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Depreciación Anual:</strong> $${(monto / años).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span class="ms-3">
                <strong>Depreciación Mensual:</strong> $${(monto / años / 12).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
        </div>
    `;
}





function generarTablaDepreciacion(fechaAdquisicion, diaAdquisicion, mesAdquisicion, añoAdquisicion, creditoFiscal, descripcion, valorAdquisicion, años, cuotaAnual, cuotaMensual, cuotaDiaria, depreciacionAnterior, estadoActivo) {
    tablaDepreciacion.innerHTML = '';
    let depreciacionAcumulada = parseFloat(depreciacionAnterior.toFixed(2));
    let depreciacionAcumuladaAnterior = parseFloat(depreciacionAnterior.toFixed(2));
    let valorAdquisicionFixed = parseFloat(valorAdquisicion.toFixed(2));
    let cuotaMensualFixed = parseFloat(cuotaMensual.toFixed(2));
    let cuotaDiariaFixed = parseFloat(cuotaDiaria.toFixed(2));

    const totalMeses = años * 13;
    const fechaInicio = new Date(añoAdquisicion, mesAdquisicion, diaAdquisicion);
    let fecha = new Date(fechaInicio);
    let añoActual = fecha.getFullYear();
    let depreciacionPresenteEjercicio = 0;
    let mesesDelAnio = Array(12).fill(null);
    let cuotasAplicadas = 0;

    while (cuotasAplicadas < totalMeses && depreciacionAcumulada < valorAdquisicionFixed) {
        let valorMes = 0;
        const mesIndex = fecha.getMonth();

        if (cuotasAplicadas === 0) {
            // Primer mes - cálculo proporcional
            const diasRestantes = 30 - diaAdquisicion + 1;
            valorMes = parseFloat((cuotaDiariaFixed * diasRestantes).toFixed(2));
            
            // Asegurar que no exceda el valor total
            if (depreciacionAcumulada + valorMes > valorAdquisicionFixed) {
                valorMes = valorAdquisicionFixed - depreciacionAcumulada;
            }
        } else {
            // Meses subsiguientes
            const depreciacionRestante = valorAdquisicionFixed - depreciacionAcumulada;
            
            if (depreciacionRestante <= cuotaMensualFixed) {
                valorMes = parseFloat(depreciacionRestante.toFixed(2));
            } else {
                valorMes = cuotaMensualFixed;
            }
        }

        depreciacionPresenteEjercicio += valorMes;
        depreciacionAcumulada += valorMes;
        mesesDelAnio[mesIndex] = valorMes;
        cuotasAplicadas++;

        const siguienteMes = new Date(fecha);
        siguienteMes.setMonth(fecha.getMonth() + 1);
        const nuevoAnio = siguienteMes.getFullYear();
        const cambioDeAño = nuevoAnio !== añoActual;

        if (cambioDeAño || cuotasAplicadas === totalMeses || depreciacionAcumulada >= valorAdquisicionFixed) {
            const fila = document.createElement('tr');
            let valorActual = parseFloat((valorAdquisicionFixed - depreciacionAcumulada).toFixed(2));
            if (valorActual < 0) valorActual = 0;

            fila.innerHTML = `
                <td>${añoActual}</td>
                <td>${fechaInicio.toLocaleDateString('es-ES')}</td>
                <td>${descripcion}</td>
                <td>${creditoFiscal}</td>
                <td>$${valorAdquisicionFixed.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                <td>$${depreciacionAcumuladaAnterior.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                <td>$${cuotaMensualFixed.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                ${mesesDelAnio.map(m => `<td>${m !== null ? `$${m.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : ''}</td>`).join('')}
                <td>$${depreciacionPresenteEjercicio.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                <td>$${depreciacionAcumulada.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                <td>$${valorActual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
            `;
            tablaDepreciacion.appendChild(fila);

            // Actualiza para el siguiente año
            depreciacionAcumuladaAnterior = depreciacionAcumulada;
            mesesDelAnio = Array(12).fill(null);
            depreciacionPresenteEjercicio = 0;
            añoActual = nuevoAnio;
        }

        fecha = siguienteMes;
    }
}





    // Función para exportar a Excel
    window.exportToExcel = function () {
        Swal.fire({
            title: '¿Está seguro?',
            text: 'Se va a exportar la tabla a un archivo Excel',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, exportar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                try {
                    const workbook = XLSX.utils.table_to_book(document.getElementById('tablaDepreciacion'), { sheet: "Depreciación" });
                    XLSX.writeFile(workbook, 'depreciacion.xlsx');
                } catch (e) {
                    Swal.fire("Error", "No se pudo exportar a Excel", "error");
                }
            }
        });
    }

    window.exportToPDF = function () {
        Swal.fire({
            title: '¿Está seguro?',
            text: 'Se va a exportar el resumen y la tabla a un archivo PDF',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, exportar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF({
                        orientation: 'landscape',
                        unit: 'pt',
                        format: 'a4'
                    });
    
                    // Obtener el nombre del contribuyente
                    const contribuyente = document.getElementById('nombreContribuyente').value;
    
                    // Agregar el título del contribuyente en el PDF
                    doc.setFontSize(18);
                    doc.text(`Contribuyente: ${contribuyente}`, 20, 40);  // Título con el nombre del contribuyente
    
                    // Captura del Resumen del Activo
                    const resumen = document.getElementById('resumenActivo');
                    const canvasResumen = await html2canvas(resumen, { scale: 2 });
                    const imgResumen = canvasResumen.toDataURL('image/png');
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const resumenWidth = pageWidth - 40;
                    const resumenHeight = (canvasResumen.height * resumenWidth) / canvasResumen.width;
                    doc.addImage(imgResumen, 'PNG', 20, 60, resumenWidth, resumenHeight);
    
                    // Espacio después del resumen
                    let yPosition = 60 + resumenHeight;
    
                    // Captura de la tabla
                    const tabla = document.getElementById('tablaDepreciacion');
                    const canvasTabla = await html2canvas(tabla, { scale: 2 });
                    const imgTabla = canvasTabla.toDataURL('image/png');
                    const tablaWidth = pageWidth - 40;
                    const tablaHeight = (canvasTabla.height * tablaWidth) / canvasTabla.width;
    
                    // Si la tabla no cabe en la misma página, crear nueva
                    if (yPosition + tablaHeight > doc.internal.pageSize.getHeight()) {
                        doc.addPage();
                        yPosition = 20;
                    }
    
                    doc.addImage(imgTabla, 'PNG', 20, yPosition, tablaWidth, tablaHeight);
    
                    // Guardar PDF
                    doc.save('depreciacion.pdf');
    
                } catch (e) {
                    console.error(e);
                    Swal.fire("Error", "No se pudo exportar a PDF", "error");
                }
            }
        });
    };
    document.getElementById('btnLimpiar').addEventListener('click', function() {
        location.reload(); // Recarga la página
    });
});
