// Centralized API Service for Suite Truco Funes (Google Apps Script Backend)

export const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxTIaI-9GGDUeUmrkuuewpkGnambQGn66wsAl-fGbnIe9iVKR3Fqb08Nsj8eAhtPxyR/exec';

export function getApiUrl() {
  try {
    const custom = localStorage.getItem('funes_custom_api_url');
    return (custom && custom.trim()) ? custom.trim() : DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

export function setCustomApiUrl(url) {
  try {
    if (url && url.trim()) {
      localStorage.setItem('funes_custom_api_url', url.trim());
    } else {
      localStorage.removeItem('funes_custom_api_url');
    }
  } catch (e) {
    console.warn(e);
  }
}

// Initial seed data: limpio por defecto
export const DEFAULT_JUGADORES = [];
export const DEFAULT_EQUIPOS = [];
export const DEFAULT_PARTIDOS = [];

// Helper to get local cache
const getCache = (key, fallback) => {
  try {
    const item = localStorage.getItem(`funes_${key}`);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed)) return fallback;

    // Purga de registros demo anteriores
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
      telefono: row.telefono || row.Telefono || '',
      equipo: row.equipo || row.Equipo || '',
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
      fase: row.fase || 'Fase Regular',
      anotador: row.anotador || '',
      fiscalizador: row.fiscalizador || ''
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
 * Test de diagnóstico en vivo con Google Apps Script
 */
export async function testApiConnection() {
  const currentUrl = getApiUrl();
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(`${currentUrl}?sheet=Jugadores`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - start;
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    if (contentType.includes('text/html') || text.includes('accounts.google.com') || text.includes('<!doctype')) {
      return {
        status: 'login_required',
        duration,
        message: 'Google Apps Script solicita inicio de sesión. La implementación debe configurarse con "Quién tiene acceso: Cualquiera".',
        url: currentUrl
      };
    }

    if (res.ok) {
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        return {
          status: 'invalid_json',
          duration,
          message: 'La URL respondió pero no devolvió JSON válido.',
          raw: text.slice(0, 200)
        };
      }

      return {
        status: 'online',
        duration,
        message: '¡Conexión exitosa en tiempo real con Google Sheets!',
        count: Array.isArray(parsed) ? parsed.length : 0,
        url: currentUrl
      };
    }

    return {
      status: 'error',
      duration,
      message: `Error HTTP ${res.status}: ${res.statusText}`,
      url: currentUrl
    };
  } catch (e) {
    return {
      status: 'cors_blocked',
      duration: Date.now() - start,
      message: `Bloqueado por CORS o sin conexión: ${e.message}. Típico de cuando Apps Script redirige al login de Google.`,
      url: currentUrl
    };
  }
}

/**
 * Lectura GET desde Google Apps Script con fallback y cache inteligente
 */
export async function getSheet(sheetName) {
  const currentUrl = getApiUrl();
  const cacheKey = sheetName.toLowerCase();
  const defaultFallback = 
    sheetName === 'Jugadores' ? DEFAULT_JUGADORES :
    sheetName === 'Equipos' ? DEFAULT_EQUIPOS :
    sheetName === 'Partidos' ? DEFAULT_PARTIDOS : [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const res = await fetch(`${currentUrl}?sheet=${sheetName}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('text/html')) {
      return { data: getCache(cacheKey, defaultFallback), fromCache: true, authRestricted: true };
    }

    const json = await res.json();
    const cleanData = normalizeSheetData(sheetName, json);
    
    setCache(cacheKey, cleanData);
    return { data: cleanData, fromCache: false, authRestricted: false };
  } catch (error) {
    return { data: getCache(cacheKey, defaultFallback), fromCache: true, error: error.message };
  }
}

/**
 * Escritura POST a Google Apps Script
 */
export async function postApi(payload) {
  const currentUrl = getApiUrl();

  try {
    const response = await fetch(currentUrl, {
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
 */
export async function toggleJugadorPresente(id, presente) {
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
 */
export async function savePartido(partidoData) {
  const cachedPartidos = getCache('partidos', DEFAULT_PARTIDOS);
  const newPartidos = [partidoData, ...cachedPartidos];
  setCache('partidos', newPartidos);

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
    equipo: jugador.equipo || '',
    presente: jugador.presente ?? true,
    fecha_inscripcion: jugador.fecha_inscripcion || new Date().toLocaleDateString('es-AR'),
    partidos_jugados: 0,
    partidos_ganados: 0,
    torneos_ganados: 0
  };
  const updated = [...cached, newPlayer];
  setCache('jugadores', updated);

  if (newPlayer.equipo) {
    const cachedEquipos = getCache('equipos', DEFAULT_EQUIPOS);
    const eq = cachedEquipos.find(e => e.nombre.toLowerCase() === newPlayer.equipo.toLowerCase());
    if (eq) {
      const currentMembers = eq.integrantes ? eq.integrantes.split(' / ').map(m => m.trim()) : [];
      if (!currentMembers.includes(newPlayer.nombre)) {
        eq.integrantes = [...currentMembers, newPlayer.nombre].slice(0, 3).join(' / ');
        setCache('equipos', cachedEquipos);
      }
    }
  }

  const payload = {
    action: 'add_row',
    sheet: 'Jugadores',
    data: newPlayer
  };

  const res = await postApi(payload);
  return { success: res.success, player: newPlayer, list: updated };
}

/**
 * Eliminar jugador (Superadmin)
 */
export async function deleteJugador(id) {
  const cached = getCache('jugadores', DEFAULT_JUGADORES);
  const updated = cached.filter(j => j.id !== id);
  setCache('jugadores', updated);

  const payload = {
    action: 'delete_row',
    sheet: 'Jugadores',
    id
  };

  const res = await postApi(payload);
  return { success: res.success, list: updated };
}

/**
 * Eliminar partido (Superadmin)
 */
export async function deletePartido(idPartido) {
  const cached = getCache('partidos', DEFAULT_PARTIDOS);
  const updated = cached.filter(p => p.id_partido !== idPartido);
  setCache('partidos', updated);

  const payload = {
    action: 'delete_row',
    sheet: 'Partidos',
    id: idPartido
  };

  const res = await postApi(payload);
  return { success: res.success, list: updated };
}

/**
 * Actualizar equipo
 */
export async function updateEquipo(equipoId, updatedFields) {
  const cached = getCache('equipos', DEFAULT_EQUIPOS);
  const updated = cached.map(eq => eq.id === equipoId ? { ...eq, ...updatedFields } : eq);
  setCache('equipos', updated);
  return { success: true, list: updated };
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
