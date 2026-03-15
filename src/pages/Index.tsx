import { useState } from 'react';
import GameOverlay from '@/components/GameOverlay';

const games = [
  { id: 'tetris', name: 'Tetris', genre: 'Puzzle', emoji: '🧱', desc: 'Stack and clear lines' },
  { id: 'snake', name: 'Snake', genre: 'Arcade', emoji: '🐍', desc: 'Eat, grow, survive' },
  { id: 'pong', name: 'Pong', genre: 'Sports', emoji: '🏓', desc: 'Classic vs AI' },
  { id: 'breakout', name: 'Breakout', genre: 'Action', emoji: '💥', desc: 'Smash all bricks' },
  { id: 'space-invaders', name: 'Space Invaders', genre: 'Shooter', emoji: '👾', desc: 'Defend Earth' },
  { id: 'dino-runner', name: 'Dino Run', genre: 'Runner', emoji: '🐱', desc: 'Jump, run, survive!' },
];

const Index = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="pt-16 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          THE ARCADE<span className="text-primary">.</span>
        </h1>
        <p className="mt-3 text-muted-foreground text-sm font-mono">Select a game to play</p>
      </header>

      {/* Game Grid */}
      <main className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className="group relative bg-card rounded-2xl p-6 text-left transition-all duration-200 hover:translate-y-[-2px] hover:shadow-[0_8px_30px_-12px_hsl(142,71%,45%,0.25)] border-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-4xl block mb-3">{game.emoji}</span>
              <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {game.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{game.desc}</p>
              <span className="inline-block mt-3 text-[10px] font-mono uppercase tracking-widest text-primary/60 bg-primary/10 px-2 py-0.5 rounded">
                {game.genre}
              </span>
            </button>
          ))}
        </div>
      </main>

      {/* Game Overlay */}
      {activeGame && (
        <GameOverlay gameId={activeGame} onClose={() => setActiveGame(null)} />
      )}
    </div>
  );
};

export default Index;
