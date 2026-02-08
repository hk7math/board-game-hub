import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ScanBarcode, Camera, Search, X, Loader2, Dices } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { GameCard } from '@/components/game/GameCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockGames } from '@/data/mockData';
import { cn } from '@/lib/utils';

type AddMode = 'scan' | 'photo' | 'search';

const modeConfig = {
  scan: { icon: ScanBarcode, label: '掃描條碼', color: 'bg-primary' },
  photo: { icon: Camera, label: '拍照辨識', color: 'bg-accent' },
  search: { icon: Search, label: '搜尋新增', color: 'bg-wood-medium' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function AddGamePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as AddMode) || null;

  const [mode, setMode] = useState<AddMode | null>(initialMode);
  const [showScanner, setShowScanner] = useState(initialMode === 'scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(mockGames);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const handleModeSelect = (selectedMode: AddMode) => {
    setMode(selectedMode);
    if (selectedMode === 'scan') {
      setShowScanner(true);
    }
  };

  const handleBarcodeDetected = (code: string) => {
    setScannedCode(code);
    setShowScanner(false);
    // In a real app, we would search BGG API with this barcode
    console.log('Barcode detected:', code);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      const results = mockGames.filter((game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results.length > 0 ? results : mockGames);
      setIsSearching(false);
    }, 500);
  };

  const handleAddGame = (gameId: string) => {
    // In a real app, this would add to collection
    navigate(`/game/${gameId}?added=true`);
  };

  // Show scanner fullscreen
  if (showScanner) {
    return (
      <BarcodeScanner
        onDetected={handleBarcodeDetected}
        onClose={() => {
          setShowScanner(false);
          setMode(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="新增遊戲" showBack />

      <div className="px-4 py-4 space-y-6">
        {/* Mode selection */}
        {!mode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground text-center">
              選擇新增遊戲的方式
            </p>
            <div className="space-y-3">
              {Object.entries(modeConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleModeSelect(key as AddMode)}
                    className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl shadow-card"
                  >
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.color)}>
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold">{config.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {key === 'scan' && '掃描盒上條碼快速新增'}
                        {key === 'photo' && '拍攝遊戲封面辨識'}
                        {key === 'search' && '搜尋 BoardGameGeek 資料庫'}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Scan result */}
        {scannedCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-card rounded-2xl shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">掃描結果</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowScanner(true)}
              >
                重新掃描
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              條碼：{scannedCode}
            </p>
            <p className="text-sm text-muted-foreground">
              正在搜尋相關遊戲...
            </p>
            {/* Show matched games */}
            <div className="mt-4 space-y-3">
              {mockGames.slice(0, 3).map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  variant="horizontal"
                  onClick={() => handleAddGame(game.id)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Search mode */}
        {mode === 'search' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="輸入遊戲名稱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 pr-4 h-12 rounded-xl bg-card shadow-card border-0"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="h-12 px-6 rounded-xl gradient-warm"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  '搜尋'
                )}
              </Button>
            </div>

            {/* Search results */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {searchResults.map((game) => (
                <motion.div key={game.id} variants={itemVariants}>
                  <GameCard
                    game={game}
                    variant="horizontal"
                    onClick={() => handleAddGame(game.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Photo mode placeholder */}
        {mode === 'photo' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Camera className="w-12 h-12 text-accent" />
            </div>
            <h3 className="font-bold text-lg mb-2">拍照辨識</h3>
            <p className="text-muted-foreground mb-6">
              此功能開發中，敬請期待！
            </p>
            <Button variant="outline" onClick={() => setMode(null)}>
              選擇其他方式
            </Button>
          </motion.div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
