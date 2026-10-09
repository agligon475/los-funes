# ♠ Suite Truco Funes — PWA Mobile-First

Aplicación web progresiva (PWA) mobile-first diseñada para gestionar juntadas y torneos de Truco argentino del grupo **Los Funes**.

---

## 🚀 Características Principales

1. **📋 Funes Presentes:**
   - Lista interactiva de jugadores con checkbox táctil.
   - Sincronización optimista con Google Sheets (`toggle_presente`).
   - Contador de quórum en tiempo real.
   - Modales para agregar nuevos jugadores y equipos.
   - Filtros y buscador rápido por nombre o apodo.

2. **🃏 Anotador de Truco Argentino:**
   - Selector de partida rápida a 15 tantos o a 30 tantos.
   - Columnas divididas en "Nosotros" y "Ellos".
   - Tanteador grande táctil con accesos directos: `+1`, `+2 (Envido)`, `+3 (Truco)` y `-1`.
   - Visualizador gráfico de fósforos/porotos tradicionales (grupos de 5 en cuadrante + diagonal).
   - División de **"Malas"** y **"Buenas"** para partidas a 30.
   - Detección automática de ganador, celebración con confeti y botón para guardar el partido en Google Sheets.
   - Historial de puntos con opción de Deshacer (Undo).

3. **🏆 Torneos y Sorteo:**
   - Modalidades: 1v1 (Mano a Mano), 2v2 (Parejas) y 3v3 (Tríos / Pica Pica).
   - Botón **Armar Torneo (Shuffle)** que toma únicamente a los jugadores con `presente: true`.
   - Generación de llaves/fixture de eliminación directa con nombres temáticos.
   - Botón **"Jugar Cruce en Anotador"** para precargar los equipos directamente en el tablero de juego.
   - Proclamación de campeón.

4. **📊 Historial y Rankings:**
   - Podio con medallas (🥇🥈🥉) para los mejores jugadores de Funes.
   - Tabla general: Partidos Jugados (PJ), Ganados (PG), Efectividad (%) y Torneos Ganados (🏆).
   - Tabla de posiciones de equipos y duplas.
   - Registro cronológico de todos los partidos disputados con fecha y marcador.

---

## 📡 Integración Backend (Google Apps Script)

- **URL de la API:** `https://script.google.com/macros/s/AKfycbwhtX9qjmAiaQu5tNCAuRojkpO1bWoDKY0Q_tRw1LyeDBPv8exIyWUf_y-uL1UbBNxm/exec`
- **Lectura:** `GET ?sheet=Jugadores|Equipos|Torneos|Partidos|Ranking`
- **Escritura:** `POST` con encabezado `'Content-Type': 'text/plain;charset=utf-8'` (para evitar preflight CORS en Apps Script).
- **Modo Offline & Cache:** La app incluye almacenamiento local `localStorage` de respaldo para garantizar funcionamiento ininterrumpido en las juntadas sin depender de caídas de conectividad.

---

## 🛠️ Tecnologías

- **React 19**
- **Vite**
- **Tailwind CSS**
- **Lucide Icons**
- **Canvas Confetti**
- **PWA Mobile-First**

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Generar bundle de producción
npm run build
```
