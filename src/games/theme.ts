// Shared theme colors for canvas-based games
// Reads from the DOM whether we're in "airy" (light) mode

export function getTheme() {
  const isAiry = document.documentElement.classList.contains('theme-airy');

  return isAiry
    ? {
        bg: '#f5f7fa',
        bgSub: '#e8ecf1',
        grid: '#d0d5dd',
        gridFaint: '#e2e6ec',
        primary: '#7c3aed',
        primarySoft: 'rgba(124,58,237,0.07)',
        primaryMid: 'rgba(124,58,237,0.18)',
        text: '#1e293b',
        textMuted: '#64748b',
        textFaint: 'rgba(30,41,59,0.4)',
        overlay: 'rgba(255,255,255,0.88)',
        ball: '#1e293b',
        hud: '#7c3aed',
        gridThick: 'rgba(30,41,59,0.5)',
        gridThin: 'rgba(30,41,59,0.12)',
        cloud: '#c7d2fe',
        ground: '#94a3b8',
        groundDot: '#94a3b8',
      }
    : {
        bg: '#09090b',
        bgSub: '#111',
        grid: '#222',
        gridFaint: '#1a1a1a',
        primary: '#22c55e',
        primarySoft: 'rgba(34,197,94,0.07)',
        primaryMid: 'rgba(34,197,94,0.18)',
        text: '#fff',
        textMuted: '#aaa',
        textFaint: 'rgba(255,255,255,0.4)',
        overlay: 'rgba(9,9,11,0.85)',
        ball: '#fff',
        hud: '#22c55e',
        gridThick: 'rgba(255,255,255,0.5)',
        gridThin: 'rgba(255,255,255,0.12)',
        cloud: '#1a1a2e',
        ground: '#333',
        groundDot: '#333',
      };
}
