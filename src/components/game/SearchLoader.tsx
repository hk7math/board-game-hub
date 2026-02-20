import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { getRandomGames, CachedGame } from '@/data/top100Games';

interface SearchLoaderProps {
  count?: number;
}

export function SearchLoader({ count = 6 }: SearchLoaderProps) {
  const [games, setGames] = useState<CachedGame[]>(() => getRandomGames(count));

  // Rotate games every 2.5s for visual interest
  useEffect(() => {
    const interval = setInterval(() => {
      setGames(getRandomGames(count));
    }, 2500);
    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center animate-pulse">
        🎲 搜尋中，先來看看這些熱門桌遊…
      </p>
      <AnimatePresence mode="popLayout">
        {games.map((game) => (
          <motion.div
            key={game.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3 p-3 bg-card rounded-2xl shadow-card"
          >
            {/* Avatar placeholder */}
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold text-primary-foreground"
              style={{
                background: `hsl(${(game.name.charCodeAt(0) * 37) % 360}, 40%, 55%)`,
              }}
            >
              {game.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="font-bold text-sm truncate">{game.name}</p>
              <p className="text-xs text-muted-foreground">
                {game.year && `${game.year} 年`}
                {game.players && ` · ${game.players} 人`}
                {game.time && ` · ${game.time} 分鐘`}
              </p>
            </div>
            <div className="self-center flex-shrink-0">
              <Skeleton className="h-8 w-12 rounded-lg" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
