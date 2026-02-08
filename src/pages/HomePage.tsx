import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ScanBarcode, Camera, ChevronRight, Dices, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { GameCard } from '@/components/game/GameCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockGames, mockCollection, mockRecords } from '@/data/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const recentGames = mockCollection.filter(c => c.status === 'owned').slice(0, 4);
  const recentRecords = mockRecords.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="桌遊記錄" />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 py-4 space-y-6"
      >
        {/* Search bar */}
        <motion.div variants={itemVariants} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜尋桌遊..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-12 rounded-xl bg-card shadow-card border-0"
          />
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/add?mode=scan')}
            className="h-auto py-4 flex flex-col gap-2 rounded-xl bg-card shadow-card border-0 hover:shadow-elevated transition-shadow"
          >
            <ScanBarcode className="w-6 h-6 text-primary" />
            <span className="text-xs font-medium">掃描條碼</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/add?mode=photo')}
            className="h-auto py-4 flex flex-col gap-2 rounded-xl bg-card shadow-card border-0 hover:shadow-elevated transition-shadow"
          >
            <Camera className="w-6 h-6 text-accent" />
            <span className="text-xs font-medium">拍照辨識</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/add?mode=search')}
            className="h-auto py-4 flex flex-col gap-2 rounded-xl bg-card shadow-card border-0 hover:shadow-elevated transition-shadow"
          >
            <Search className="w-6 h-6 text-wood-medium" />
            <span className="text-xs font-medium">搜尋新增</span>
          </Button>
        </motion.div>

        {/* Stats banner */}
        <motion.div
          variants={itemVariants}
          className="gradient-warm rounded-2xl p-4 shadow-elevated"
        >
          <div className="flex items-center justify-between text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Dices className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-80">我的收藏</p>
                <p className="text-2xl font-bold">{mockCollection.filter(c => c.status === 'owned').length} 款</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">總遊玩次數</p>
              <p className="text-2xl font-bold">{mockRecords.length} 次</p>
            </div>
          </div>
        </motion.div>

        {/* Recent plays */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              最近遊玩
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/records')}
              className="text-primary"
            >
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {recentRecords.map((record) => (
              <motion.div
                key={record.id}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {record.game.thumbnail ? (
                    <img
                      src={record.game.thumbnail}
                      alt={record.game.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dices className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{record.game.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {record.players.join('、')}
                  </p>
                </div>
                <div className="text-right">
                  {record.winner && (
                    <span className="text-xs font-medium text-primary">
                      🏆 {record.winner}
                    </span>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(record.playedAt).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* My collection */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              熱門收藏
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/collection')}
              className="text-primary"
            >
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {recentGames.map((item) => (
              <GameCard
                key={item.id}
                game={item.game}
                plays={item.plays}
                onClick={() => navigate(`/game/${item.gameId}`)}
              />
            ))}
          </div>
        </motion.section>
      </motion.main>

      <MobileNav />
    </div>
  );
}
