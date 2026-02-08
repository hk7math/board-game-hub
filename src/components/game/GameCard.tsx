import { motion } from 'framer-motion';
import { Users, Clock, Star, Dices } from 'lucide-react';
import { BoardGame } from '@/types/boardgame';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: BoardGame;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'horizontal';
  badge?: string;
  badgeVariant?: 'primary' | 'accent' | 'muted';
  plays?: number;
}

export function GameCard({
  game,
  onClick,
  variant = 'default',
  badge,
  badgeVariant = 'primary',
  plays,
}: GameCardProps) {
  const badgeColors = {
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-accent-foreground',
    muted: 'bg-muted text-muted-foreground',
  };

  if (variant === 'compact') {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card cursor-pointer"
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {game.thumbnail ? (
            <img
              src={game.thumbnail}
              alt={game.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dices className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{game.name}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {game.minPlayers && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {game.minPlayers}-{game.maxPlayers}
              </span>
            )}
            {game.playingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {game.playingTime}分
              </span>
            )}
          </div>
        </div>
        {plays !== undefined && (
          <div className="text-xs font-medium text-primary">{plays}次</div>
        )}
      </motion.div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex gap-4 p-4 bg-card rounded-2xl shadow-card cursor-pointer"
      >
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {game.thumbnail ? (
            <img
              src={game.thumbnail}
              alt={game.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Dices className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground line-clamp-2">{game.name}</h3>
            {badge && (
              <span className={cn('text-xs px-2 py-1 rounded-full font-medium flex-shrink-0', badgeColors[badgeVariant])}>
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            {game.minPlayers && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {game.minPlayers}-{game.maxPlayers}人
              </span>
            )}
            {game.playingTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {game.playingTime}分
              </span>
            )}
            {game.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-gold text-gold" />
                {game.rating.toFixed(1)}
              </span>
            )}
          </div>
          {game.categories && (
            <div className="flex flex-wrap gap-1 mt-2">
              {game.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Default card
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative bg-card rounded-2xl shadow-card overflow-hidden cursor-pointer"
    >
      {badge && (
        <div className={cn('absolute top-3 left-3 z-10 text-xs px-2 py-1 rounded-full font-medium', badgeColors[badgeVariant])}>
          {badge}
        </div>
      )}
      <div className="aspect-square bg-muted">
        {game.thumbnail ? (
          <img
            src={game.thumbnail}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dices className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm text-foreground line-clamp-2">{game.name}</h3>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          {game.minPlayers && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {game.minPlayers}-{game.maxPlayers}
            </span>
          )}
          {game.playingTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {game.playingTime}分
            </span>
          )}
        </div>
        {plays !== undefined && (
          <div className="mt-2 text-xs font-medium text-primary">
            遊玩 {plays} 次
          </div>
        )}
      </div>
    </motion.div>
  );
}
