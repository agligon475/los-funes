/**
 * ============================================================================
 * SUITE TRUCO FUNES — BACKEND GOOGLE APPS SCRIPT (Código.gs)
 * ============================================================================
 * 
 * Este script conecta la WebApp / PWA de Los Funes con la planilla de Google Sheets.
 * Soporta lectura (doGet) y escritura (doPost) con CORS habilitado y manejo de errores.
 */

// Si no pasas ID de planilla, se conecta automáticamente a la hoja activa donde está el script
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * ----------------------------------------------------------------------------
 * 1. LECTURA (doGet)
 * URL: https://script.google.com/macros/s/.../exec?sheet=Jugadores
 * ----------------------------------------------------------------------------
 */
function doGet(e) {
  try {
    // Si ejecutas la función manualmente desde el botón "Ejecutar" del editor de Apps Script,
    // el objeto 'e' viene como undefined. Proporcionamos un valor por defecto para pruebas:
    if (!e || !e.parameter) {
      e = { parameter: { sheet: 'Jugadores' } };
    }

    var sheetName = e.parameter.sheet || 'Jugadores';
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return jsonResponse({
        error: true,
        message: 'La hoja "' + sheetName + '" no existe en el Spreadsheet.'
      });
    }

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse([]);
    }

    var headers = data[0].map(function(h) {
      return String(h).trim().toLowerCase();
    });

    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // Saltear filas completamente vacías
      var isEmpty = row.every(function(cell) { return cell === '' || cell === null; });
      if (isEmpty) continue;

      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        var val = row[j];

        // Normalización booleana para campos como 'presente'
        if (key === 'presente') {
          val = (val === true || String(val).toLowerCase() === 'true' || String(val) === '1');
        }
        obj[key] = val;
      }
      rows.push(obj);
    }

    return jsonResponse(rows);

  } catch (err) {
    return jsonResponse({
      error: true,
      message: err.toString()
    });
  }
}

/**
 * ----------------------------------------------------------------------------
 * 2. ESCRITURA (doPost)
 * Recibe JSON con Content-Type: text/plain para evitar preflight CORS.
 * ----------------------------------------------------------------------------
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ error: true, message: 'No se recibieron datos en el cuerpo POST.' });
    }

    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var sheetName = body.sheet || 'Jugadores';
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return jsonResponse({ error: true, message: 'Hoja "' + sheetName + '" no encontrada.' });
    }

    // ACCIÓN: Alternar presencia de un jugador
    if (action === 'toggle_presente') {
      var idBuscado = String(body.id);
      var nuevoEstado = Boolean(body.presente);
      var values = sheet.getDataRange().getValues();
      var headers = values[0].map(function(h) { return String(h).trim().toLowerCase(); });
      
      var colId = headers.indexOf('id');
      if (colId === -1) colId = headers.indexOf('id_jugador');
      var colPresente = headers.indexOf('presente');

      if (colId === -1 || colPresente === -1) {
        return jsonResponse({ error: true, message: 'Columnas "id" o "presente" no encontradas.' });
      }

      for (var r = 1; r < values.length; r++) {
        if (String(values[r][colId]) === idBuscado) {
          sheet.getRange(r + 1, colPresente + 1).setValue(nuevoEstado);
          return jsonResponse({ success: true, id: idBuscado, presente: nuevoEstado });
        }
      }

      return jsonResponse({ error: true, message: 'Jugador no encontrado con ID: ' + idBuscado });
    }

    // ACCIÓN: Agregar fila (add_row) para Jugadores, Partidos, Equipos, etc.
    if (action === 'add_row') {
      var rowData = body.data;
      var sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(function(h) {
        return String(h).trim().toLowerCase();
      });

      var newRow = [];
      for (var h = 0; h < sheetHeaders.length; h++) {
        var headerKey = sheetHeaders[h];
        newRow.push(rowData[headerKey] !== undefined ? rowData[headerKey] : '');
      }

      sheet.appendRow(newRow);
      return jsonResponse({ success: true, message: 'Fila agregada con éxito.', data: rowData });
    }

    // ACCIÓN: Eliminar fila (delete_row) por ID (SuperAdmin)
    if (action === 'delete_row') {
      var idToDelete = String(body.id);
      var allData = sheet.getDataRange().getValues();
      var hdrs = allData[0].map(function(h) { return String(h).trim().toLowerCase(); });

      var idIdx = hdrs.indexOf('id');
      if (idIdx === -1) idIdx = hdrs.indexOf('id_jugador');
      if (idIdx === -1) idIdx = hdrs.indexOf('id_partido');
      if (idIdx === -1) idIdx = hdrs.indexOf('id_equipo');

      if (idIdx === -1) {
        return jsonResponse({ error: true, message: 'No se encontró columna identificadora de ID.' });
      }

      for (var rowIdx = 1; rowIdx < allData.length; rowIdx++) {
        if (String(allData[rowIdx][idIdx]) === idToDelete) {
          sheet.deleteRow(rowIdx + 1);
          return jsonResponse({ success: true, message: 'Fila eliminada.', id: idToDelete });
        }
      }

      return jsonResponse({ error: true, message: 'ID no encontrado para eliminar.' });
    }

    return jsonResponse({ error: true, message: 'Acción no reconocida: ' + action });

  } catch (err) {
    return jsonResponse({
      error: true,
      message: err.toString()
    });
  }
}

/**
 * ----------------------------------------------------------------------------
 * HELPER: Respuesta JSON con cabeceras CORS
 * ----------------------------------------------------------------------------
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ----------------------------------------------------------------------------
 * FUNCIÓN DE PRUEBA: Para probar en el botón "Ejecutar" del editor sin errores
 * ----------------------------------------------------------------------------
 */
function testEjecutarEnConsola() {
  var resultado = doGet({ parameter: { sheet: 'Jugadores' } });
  Logger.log(resultado.getContent());
}
