import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Clock, Star, Calendar, Plus, Dices, 
  Package, Heart, Repeat, DollarSign, ArrowLeft,
  ExternalLink, BookOpen
} from 'lucide-react';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoardGame, useUserCollection, useGameRecords } from '@/hooks/useGameData';
import { cn } from '@/lib/utils';

export default function GameDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: game, isLoading: gameLoading } = useBoardGame(id);
  const { data: collection = [] } = useUserCollection();
  const { data: records = [] } = useGameRecords();

  const collectionItem = collection.find((c) => c.gameId === id);
  const gameRecords = records.filter((r) => r.gameId === id);

  if (gameLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Skeleton className="h-64 w-full" />
        <div className="px-4 -mt-8 relative z-10 space-y-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <MobileNav />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground">遊戲不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>返回</Button>
      </div>
    );
  }

  const statusConfig = {
    owned: { label: '已擁有', icon: Package, color: 'bg-primary text-primary-foreground' },
    wishlist: { label: '願望清單', icon: Heart, color: 'bg-destructive text-destructive-foreground' },
    'for-trade': { label: '換物中', icon: Repeat, color: 'bg-accent text-accent-foreground' },
    'for-sale': { label: '出售中', icon: DollarSign, color: 'bg-gold text-foreground' },
  };

  const currentStatus = collectionItem?.status
    ? statusConfig[collectionItem.status as keyof typeof statusConfig]
    : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero image */}
      <div className="relative h-64 bg-muted">
        {game.image || game.thumbnail ? (
          <img
            src={game.image || game.thumbnail}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dices className="w-20 h-20 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {currentStatus && (
          <div className={cn('absolute top-4 right-4 px-3 py-1.5 rounded-full font-medium text-sm flex items-center gap-1.5', currentStatus.color)}>
            <currentStatus.icon className="w-4 h-4" />
            {currentStatus.label}
          </div>
        )}
      </div>

      <div className="px-4 -mt-8 relative z-10 space-y-6">
        {/* Title card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-elevated p-4"
        >
          <h1 className="text-xl font-bold">{game.name}</h1>
          {game.yearPublished && (
            <p className="text-sm text-muted-foreground mt-1">
              {game.yearPublished} 年發行
            </p>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm">
            {game.minPlayers && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{game.minPlayers}-{game.maxPlayers} 人</span>
              </div>
            )}
            {game.playingTime && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{game.playingTime} 分鐘</span>
              </div>
            )}
            {game.rating && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-gold text-gold" />
                <span className="font-medium">{Number(game.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {game.categories && game.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {game.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 bg-secondary rounded-full text-sm text-secondary-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-3"
        >
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={() => {}}
          >
            <Plus className="w-5 h-5 mr-2" />
            記錄遊玩
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl gradient-warm"
            onClick={() => {}}
          >
            {collectionItem ? '管理收藏' : '加入收藏'}
          </Button>
        </motion.div>

        {/* Description */}
        {game.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-card p-4"
          >
            <h2 className="font-bold mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              遊戲簡介
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {game.description}
            </p>
          </motion.div>
        )}

        {/* Play records */}
        {gameRecords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl shadow-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" />
                遊玩記錄
              </h2>
              <span className="text-sm text-muted-foreground">
                共 {gameRecords.length} 次
              </span>
            </div>
            <div className="space-y-3">
              {gameRecords.slice(0, 3).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {record.players.join('、')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.playedAt).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                  {record.winner && (
                    <span className="text-sm font-medium text-primary">
                      🏆 {record.winner}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* BGG link */}
        {game.bggId && (
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            href={`https://boardgamegeek.com/boardgame/${game.bggId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 bg-card rounded-2xl shadow-card text-primary hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="font-medium">在 BoardGameGeek 查看</span>
          </motion.a>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
