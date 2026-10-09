// Centralized API Service for Suite Truco Funes (Google Apps Script Backend)

export const API_URL = 'https://script.google.com/macros/s/AKfycbxTIaI-9GGDUeUmrkuuewpkGnambQGn66wsAl-fGbnIe9iVKR3Fqb08Nsj8eAhtPxyR/exec';

// Initial seed data: limpio por defecto (los datos provienen de Google Sheets o inscripciones reales)
export const DEFAULT_JUGADORES = [];
export const DEFAULT_EQUIPOS = [];
export const DEFAULT_PARTIDOS = [];

// Helper to get local cache (auto-purgando datos demo antiguos si existieran)
const getCache = (key, fallback) => {
  try {
    const item = localStorage.getItem(`funes_${key}`);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed)) return fallback;

    // Purga automática de registros demo anteriores
    if (key === 'jugadores') {
      const cleaned = parsed.filter(j => !['JUG-01', 'JUG-02', 'JUG-03', 'JUG-04', 'JUG-05', 'JUG-06', 'JUG-07', 'JUG-08', 'JUG-09', 'JUG-10'].includes(j.id));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(`funes_${key}`, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    if (key === 'equipos') {
      const cleaned = parsed.filter(eq => !['EQ-01', 'EQ-02', 'EQ-03', 'EQ-04'].includes(eq.id));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(`funes_${key}`, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    if (key === 'partidos') {
      const cleaned = parsed.filter(p => !['P-101', 'P-102', 'P-103'].includes(p.id_partido));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(`funes_${key}`, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return parsed;
  } catch (e) {
    return fallback;
  }
};

const setCache = (key, data) => {
  try {
    localStorage.setItem(`funes_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
};

/**
 * Normaliza nombres de campos de hojas de cálculo de Google
 */
function normalizeSheetData(sheetName, rawArray) {
  if (!Array.isArray(rawArray)) return [];
  
  if (sheetName === 'Jugadores') {
    return rawArray.map((row, index) => ({
      id: row.id || row.ID || row.id_jugador || `JUG-${index + 1}`,
      nombre: row.nombre || row.Nombre || row.name || 'Sin Nombre',
      alias: row.alias || row.Alias || '',
      presente: row.presente === true || row.presente === 'true' || row.presente === 'TRUE' || row.asistio === true || row.asistio === 'TRUE',
      partidos_jugados: Number(row.partidos_jugados || row.pj || row.PJ || 0),
      partidos_ganados: Number(row.partidos_ganados || row.pg || row.PG || 0),
      torneos_ganados: Number(row.torneos_ganados || row.torneos || row.TG || 0),
    }));
  }

  if (sheetName === 'Partidos') {
    return rawArray.map((row, index) => ({
      id_partido: row.id_partido || row.id || `P-${index + 1}`,
      id_torneo: row.id_torneo || 'Amistoso',
      fecha: row.fecha || new Date().toLocaleDateString('es-AR'),
      equipo_nosotros: row.equipo_nosotros || row.nosotros || 'Nosotros',
      equipo_ellos: row.equipo_ellos || row.ellos || 'Ellos',
      puntos_nosotros: Number(row.puntos_nosotros || 0),
      puntos_ellos: Number(row.puntos_ellos || 0),
      ganador: row.ganador || (Number(row.puntos_nosotros) > Number(row.puntos_ellos) ? row.equipo_nosotros : row.equipo_ellos),
      fase: row.fase || 'Fase Regular'
    }));
  }

  if (sheetName === 'Equipos') {
    return rawArray.map((row, index) => ({
      id: row.id || `EQ-${index + 1}`,
      nombre: row.nombre || `Equipo ${index + 1}`,
      integrantes: row.integrantes || '',
      pj: Number(row.pj || row.partidos_jugados || 0),
      pg: Number(row.pg || row.partidos_ganados || 0),
      torneos: Number(row.torneos || row.torneos_ganados || 0)
    }));
  }

  return rawArray;
}

/**
 * Lectura GET desde Google Apps Script con fallback y cache inteligente
 */
export async function getSheet(sheetName) {
  const cacheKey = sheetName.toLowerCase();
  const defaultFallback = 
    sheetName === 'Jugadores' ? DEFAULT_JUGADORES :
    sheetName === 'Equipos' ? DEFAULT_EQUIPOS :
    sheetName === 'Partidos' ? DEFAULT_PARTIDOS : [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(`${API_URL}?sheet=${sheetName}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Si Apps Script devuelve una redirección HTML (ej: requiere login de Google)
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('text/html')) {
      console.warn(`[API] Google Apps Script devolvió status ${res.status} o HTML en ${sheetName}. Usando cache local.`);
      return { data: getCache(cacheKey, defaultFallback), fromCache: true, authRestricted: true };
    }

    const json = await res.json();
    const cleanData = normalizeSheetData(sheetName, json);
    
    // Guardar en cache exitoso
    setCache(cacheKey, cleanData);
    return { data: cleanData, fromCache: false, authRestricted: false };
  } catch (error) {
    console.warn(`[API] Error al consultar hoja ${sheetName}:`, error.message);
    return { data: getCache(cacheKey, defaultFallback), fromCache: true, error: error.message };
  }
}

/**
 * Escritura POST a Google Apps Script
 * NOTA CRUCIAL: Debe enviarse con Content-Type: 'text/plain;charset=utf-8' para no disparar preflight CORS
 */
export async function postApi(payload) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text, success: response.ok };
    }

    return { success: true, response: data };
  } catch (error) {
    console.error('[API] Error en llamada POST:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Alternar presencia de jugador
 * { action: 'toggle_presente', sheet: 'Jugadores', id: 'ID_JUGADOR', presente: true/false }
 */
export async function toggleJugadorPresente(id, presente) {
  // Guardado optimista en cache
  const cached = getCache('jugadores', DEFAULT_JUGADORES);
  const updated = cached.map(j => j.id === id ? { ...j, presente } : j);
  setCache('jugadores', updated);

  const payload = {
    action: 'toggle_presente',
    sheet: 'Jugadores',
    id,
    presente
  };

  const res = await postApi(payload);
  return { success: res.success, updatedList: updated };
}

/**
 * Guardar resultado de partido
 * { action: 'add_row', sheet: 'Partidos', data: { id_partido, id_torneo, fecha, equipo_nosotros, equipo_ellos, puntos_nosotros, puntos_ellos, ganador, fase } }
 */
export async function savePartido(partidoData) {
  const cachedPartidos = getCache('partidos', DEFAULT_PARTIDOS);
  const newPartidos = [partidoData, ...cachedPartidos];
  setCache('partidos', newPartidos);

  // Actualizar estadísticas de jugadores en cache
  const cachedJugadores = getCache('jugadores', DEFAULT_JUGADORES);
  const updatedJugadores = cachedJugadores.map(jugador => {
    const enNosotros = partidoData.equipo_nosotros.toLowerCase().includes(jugador.nombre.toLowerCase());
    const enEllos = partidoData.equipo_ellos.toLowerCase().includes(jugador.nombre.toLowerCase());
    
    if (enNosotros || enEllos) {
      const gano = (enNosotros && partidoData.ganador === partidoData.equipo_nosotros) ||
                   (enEllos && partidoData.ganador === partidoData.equipo_ellos);
      return {
        ...jugador,
        partidos_jugados: (jugador.partidos_jugados || 0) + 1,
        partidos_ganados: gano ? (jugador.partidos_ganados || 0) + 1 : (jugador.partidos_ganados || 0)
      };
    }
    return jugador;
  });
  setCache('jugadores', updatedJugadores);

  const payload = {
    action: 'add_row',
    sheet: 'Partidos',
    data: partidoData
  };

  const res = await postApi(payload);
  return { success: res.success, newPartidos };
}

/**
 * Agregar nuevo jugador / Inscripción desde formulario
 */
export async function addJugador(jugador) {
  const cached = getCache('jugadores', DEFAULT_JUGADORES);
  const newPlayer = {
    id: jugador.id || `JUG-${Date.now().toString().slice(-4)}`,
    nombre: jugador.nombre,
    alias: jugador.alias || '',
    telefono: jugador.telefono || '',
    pareja_sugerida: jugador.pareja_sugerida || jugador.pareja || '',
    presente: jugador.presente ?? true,
    fecha_inscripcion: jugador.fecha_inscripcion || new Date().toLocaleDateString('es-AR'),
    partidos_jugados: 0,
    partidos_ganados: 0,
    torneos_ganados: 0
  };
  const updated = [...cached, newPlayer];
  setCache('jugadores', updated);

  const payload = {
    action: 'add_row',
    sheet: 'Jugadores',
    data: newPlayer
  };

  const res = await postApi(payload);
  return { success: res.success, player: newPlayer, list: updated };
}

/**
 * Agregar nuevo equipo
 */
export async function addEquipo(equipo) {
  const cached = getCache('equipos', DEFAULT_EQUIPOS);
  const newTeam = {
    id: equipo.id || `EQ-${Date.now().toString().slice(-4)}`,
    nombre: equipo.nombre,
    integrantes: equipo.integrantes || '',
    pj: 0,
    pg: 0,
    torneos: 0
  };
  const updated = [...cached, newTeam];
  setCache('equipos', updated);

  const payload = {
    action: 'add_row',
    sheet: 'Equipos',
    data: newTeam
  };

  const res = await postApi(payload);
  return { success: res.success, team: newTeam, list: updated };
}
