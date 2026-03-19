import { useState } from "react";
import GameOverlay from "@/components/GameOverlay";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";

const games = [
{ id: "tetris", name: "Tetris", genre: "Puzzle", emoji: "🧱", desc: "Stack and clear lines" },
{ id: "snake", name: "Snake", genre: "Arcade", emoji: "🐍", desc: "Eat, grow, survive" },
{ id: "pong", name: "Pong", genre: "Sports", emoji: "🏓", desc: "Classic vs AI" },
{ id: "breakout", name: "Breakout", genre: "Action", emoji: "💥", desc: "Smash all bricks" },
{ id: "space-invaders", name: "Space Invaders", genre: "Shooter", emoji: "👾", desc: "Defend Earth" },
{ id: "dino-runner", name: "Dino Run", genre: "Runner", emoji: "🟢", desc: "Jump, run, survive!" },
{ id: "sudoku", name: "Sudoku", genre: "Puzzle", emoji: "🔢", desc: "Fill the 9×9 grid" }];


const Index = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-500">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-card border border-border text-foreground hover:text-primary transition-all duration-300 hover:scale-110 shadow-lg"
        aria-label="Toggle theme">
        
        {theme === "arcade" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <header className="pt-16 pb-10 text-center">
        <h1
          className="text-4xl md:text-5xl font-bold tracking-tight text-foreground transition-colors duration-500"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}>
          
          THE ARCADE<span className="text-primary transition-colors duration-500">.</span>
        </h1>
        <p className="mt-3 text-muted-foreground text-sm font-mono transition-colors duration-500">Select a game to play v4

        </p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full">
          {games.map((game) =>
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className="group relative bg-card rounded-2xl p-6 text-center transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.25)] border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring">
            
              <span className="text-4xl block mb-3 transition-transform duration-200 group-hover:animate-wiggle">
                {game.emoji}
              </span>
              <h2
              className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors"
              style={{ fontFamily: '"JetBrains Mono", monospace' }}>
              
                {game.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">{game.desc}</p>
              <span className="inline-block mt-3 text-[10px] font-mono uppercase tracking-widest text-primary/60 bg-primary/10 px-2 py-0.5 rounded">
                {game.genre}
              </span>
            </button>
          )}
        </div>
      </main>

      {activeGame && <GameOverlay gameId={activeGame} onClose={() => setActiveGame(null)} />}
    </div>);

};

export default Index;