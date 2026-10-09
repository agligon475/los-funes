import React from 'react';

/**
 * Representa un grupo de hasta 5 porotos/fósforos estilo Truco Argentino
 * 1: Línea izquierda
 * 2: Línea superior
 * 3: Línea derecha
 * 4: Línea inferior
 * 5: Diagonal que cruza el cuadrado
 */
export function MatchstickBox({ count }) {
  const c = Math.min(Math.max(count, 0), 5);

  return (
    <div className="relative w-8 h-8 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-center justify-center p-1">
      {/* 1: Izquierda */}
      {c >= 1 && (
        <span className="absolute left-1.5 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
      )}
      {/* 2: Arriba */}
      {c >= 2 && (
        <span className="absolute left-1.5 right-1.5 top-1.5 h-1 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
      )}
      {/* 3: Derecha */}
      {c >= 3 && (
        <span className="absolute right-1.5 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
      )}
      {/* 4: Abajo */}
      {c >= 4 && (
        <span className="absolute left-1.5 right-1.5 bottom-1.5 h-1 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
      )}
      {/* 5: Diagonal */}
      {c >= 5 && (
        <span className="absolute inset-1.5 flex items-center justify-center pointer-events-none">
          <span className="w-[125%] h-1 bg-amber-300 rounded-full rotate-45 transform shadow-[0_0_6px_rgba(252,211,77,0.8)]" />
        </span>
      )}

      {/* Si count es 0, mostrar punto tenue */}
      {c === 0 && (
        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
      )}
    </div>
  );
}

/**
 * Renderiza la grilla completa de fósforos según el puntaje
 * @param {number} score Puntos totales
 * @param {number} maxScore 15 o 30
 */
export default function PorotosVisualizer({ score, maxScore }) {
  // Si es a 30, dividimos en malas (hasta 15) y buenas (de 16 a 30)
  if (maxScore === 30) {
    const malasScore = Math.min(score, 15);
    const buenasScore = Math.max(0, score - 15);

    return (
      <div className="space-y-2 w-full">
        {/* Malas */}
        <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
            <span>Malas</span>
            <span className="text-amber-400 font-mono">{malasScore}/15</span>
          </div>
          <div className="flex justify-around items-center">
            <MatchstickBox count={malasScore} />
            <MatchstickBox count={malasScore - 5} />
            <MatchstickBox count={malasScore - 10} />
          </div>
        </div>

        {/* Buenas */}
        <div className={`rounded-xl p-2 border transition-colors ${
          score > 15
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-slate-950/40 border-slate-800/60 opacity-60'
        }`}>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
            <span className={score > 15 ? 'text-amber-400 font-black' : ''}>Buenas</span>
            <span className="text-amber-400 font-mono">{buenasScore}/15</span>
          </div>
          <div className="flex justify-around items-center">
            <MatchstickBox count={buenasScore} />
            <MatchstickBox count={buenasScore - 5} />
            <MatchstickBox count={buenasScore - 10} />
          </div>
        </div>
      </div>
    );
  }

  // Si es a 15 tantos
  return (
    <div className="w-full bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
        <span>Tantos</span>
        <span className="text-amber-400 font-mono">{score}/15</span>
      </div>
      <div className="flex justify-around items-center">
        <MatchstickBox count={score} />
        <MatchstickBox count={score - 5} />
        <MatchstickBox count={score - 10} />
      </div>
    </div>
  );
}
