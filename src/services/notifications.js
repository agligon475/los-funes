// Service for Web Notifications and Audio Alerts for Suite Truco Funes

/**
 * Sintetiza un silbato / chicharra de partido con Web Audio API (cero dependencias externas)
 */
export function playMatchCallSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Silbato trino árbitro: Dos tonos rápidos oscilantes
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    // Frecuencias estilo silbato de árbitro de fútbol/truco
    osc1.frequency.setValueAtTime(2400, now);
    osc1.frequency.exponentialRampToValueAtTime(2600, now + 0.1);
    osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.2);
    osc1.frequency.exponentialRampToValueAtTime(2700, now + 0.35);

    osc2.frequency.setValueAtTime(1200, now);
    osc2.frequency.exponentialRampToValueAtTime(1300, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
    osc2.frequency.exponentialRampToValueAtTime(1350, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  } catch (e) {
    console.warn('AudioContext playback error', e);
  }
}

/**
 * Solicita permiso de notificaciones nativas en el celular
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return Notification.permission;
}

/**
 * Dispara una alerta de partido: Sonido + Vibración + Notificación de sistema
 */
export function triggerTurnNotification(match, role = 'jugador') {
  // 1. Sonido
  playMatchCallSound();

  // 2. Vibración del teléfono
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([300, 150, 300, 150, 400]);
    } catch (e) {
      // ignore
    }
  }

  // 3. Notificación nativa si tiene permiso
  if ('Notification' in window && Notification.permission === 'granted') {
    const title = '🃏 ¡ATENCIÓN! Te toca jugar en la Mesa';
    let body = `Terminó el partido anterior. Cancha libre para: ${match.teamA?.name} vs ${match.teamB?.name}`;
    if (role === 'anotador') {
      body += `\n✍️ ¡Te toca ANOTAR los tantos!`;
    } else if (role === 'fiscalizador') {
      body += `\n⚖️ ¡Te toca FISCALIZAR el partido!`;
    }

    try {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        tag: 'match-call',
        vibrate: [300, 150, 300]
      });
    } catch (e) {
      console.warn('Notification display failed', e);
    }
  }
}
