import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ScanBarcode, Camera, Search, Loader2, Star } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { SearchLoader } from '@/components/game/SearchLoader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type AddMode = 'scan' | 'photo' | 'search';

interface BggGame {
  bggId: number;
  name: string;
  yearPublished?: number;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  minAge?: number;
  description?: string;
  thumbnail?: string;
  image?: string;
  rating?: number;
  weight?: number;
  categories?: string[];
  mechanics?: string[];
}

const modeConfig = {
  scan: { icon: ScanBarcode, label: '掃描條碼', color: 'bg-primary' },
  photo: { icon: Camera, label: '拍照辨識', color: 'bg-accent' },
  search: { icon: Search, label: '搜尋新增', color: 'bg-wood-medium' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function AddGamePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as AddMode) || null;

  const [mode, setMode] = useState<AddMode | null>(initialMode);
  const [showScanner, setShowScanner] = useState(initialMode === 'scan');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BggGame[]>([]);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedBggIds, setAddedBggIds] = useState<Set<number>>(new Set());

  const handleModeSelect = (selectedMode: AddMode) => {
    setMode(selectedMode);
    if (selectedMode === 'scan') setShowScanner(true);
  };

  const handleBarcodeDetected = (code: string) => {
    setScannedCode(code);
    setShowScanner(false);
    console.log('Barcode detected:', code);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('bgg-search', {
        body: { query: searchQuery },
      });

      if (error) throw error;
      if (data?.success && data.data) {
        setSearchResults(data.data);
        if (data.data.length === 0) {
          toast.info('找不到相關桌遊，請嘗試其他關鍵字');
        } else {
          // Check which games are already in user's collection
          const bggIds = data.data.map((g: BggGame) => g.bggId).filter(Boolean);
          const { data: existing } = await supabase
            .from('board_games')
            .select('bgg_id, user_collections!inner(user_id)')
            .in('bgg_id', bggIds)
            .eq('user_collections.user_id', user?.id ?? '');
          if (existing) {
            setAddedBggIds(new Set(existing.map((g: any) => g.bgg_id)));
          }
        }
      } else {
        toast.error(data?.error || '搜尋失敗');
      }
    } catch (err) {
      console.error('Search error:', err);
      toast.error('搜尋時發生錯誤');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddGame = async (game: BggGame) => {
    if (!user) {
      toast.error('請先登入');
      return;
    }

    setAddingId(game.bggId);

    try {
      // Check if game already exists in DB
      const { data: existing } = await supabase
        .from('board_games')
        .select('id')
        .eq('bgg_id', game.bggId)
        .maybeSingle();

      let gameId: string;

      if (existing) {
        gameId = existing.id;
      } else {
        // Insert new game
        const { data: inserted, error: insertErr } = await supabase
          .from('board_games')
          .insert({
            bgg_id: game.bggId,
            name: game.name,
            year_published: game.yearPublished,
            min_players: game.minPlayers,
            max_players: game.maxPlayers,
            playing_time: game.playingTime,
            min_age: game.minAge,
            description: game.description,
            thumbnail: game.thumbnail,
            image: game.image,
            rating: game.rating,
            weight: game.weight,
            categories: game.categories,
            mechanics: game.mechanics,
          })
          .select('id')
          .single();

        if (insertErr) throw insertErr;
        gameId = inserted.id;
      }

      // Check if already in collection
      const { data: existingCollection } = await supabase
        .from('user_collections')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .maybeSingle();

      if (existingCollection) {
        toast.info('這個遊戲已在你的收藏中');
        return;
      }

      // Add to collection
      const { error: colErr } = await supabase
        .from('user_collections')
        .insert({
          user_id: user.id,
          game_id: gameId,
          status: 'owned',
        });

      if (colErr) throw colErr;

      toast.success(`已將「${game.name}」加入收藏！`);
      setAddedBggIds(prev => new Set(prev).add(game.bggId));
    } catch (err) {
      console.error('Add game error:', err);
      toast.error('新增遊戲時發生錯誤');
    } finally {
      setAddingId(null);
    }
  };

  if (showScanner) {
    return (
      <BarcodeScanner
        onDetected={handleBarcodeDetected}
        onClose={() => { setShowScanner(false); setMode(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="新增遊戲" showBack />

      <div className="px-4 py-4 space-y-6">
        {/* Mode selection */}
        {!mode && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="text-muted-foreground text-center">選擇新增遊戲的方式</p>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-card rounded-2xl shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">掃描結果</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowScanner(true)}>重新掃描</Button>
            </div>
            <p className="text-sm text-muted-foreground">條碼：{scannedCode}</p>
            <p className="text-sm text-muted-foreground mt-2">此功能開發中，請改用搜尋方式新增遊戲。</p>
          </motion.div>
        )}

        {/* Search mode */}
        {mode === 'search' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="輸入遊戲英文名稱..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 pr-4 h-12 rounded-xl bg-card shadow-card border-0"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching} className="h-12 px-6 rounded-xl gradient-warm">
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : '搜尋'}
              </Button>
            </div>

            {/* Loading state with random top games */}
            {isSearching && <SearchLoader />}

            {/* Search results */}
            {!isSearching && searchResults.length > 0 && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                {searchResults.map((game) => (
                  <motion.div key={game.bggId} variants={itemVariants}>
                    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                      {/* Game image banner */}
                      {(game.image || game.thumbnail) ? (
                        <div className="relative w-full h-36 bg-muted">
                          <img
                            src={game.image || game.thumbnail}
                            alt={game.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-2 left-3 right-16">
                            <h4 className="font-bold text-sm text-white truncate">{game.name}</h4>
                            <p className="text-xs text-white/80">
                              {game.yearPublished && `${game.yearPublished} 年`}
                              {game.minPlayers && game.maxPlayers && ` · ${game.minPlayers}-${game.maxPlayers} 人`}
                              {game.playingTime && ` · ${game.playingTime} 分鐘`}
                            </p>
                          </div>
                          {game.rating && (
                            <div className="absolute top-2 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-gold text-gold" /> {game.rating.toFixed(1)}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant={addedBggIds.has(game.bggId) ? 'secondary' : 'default'}
                            onClick={() => handleAddGame(game)}
                            disabled={addingId === game.bggId || addedBggIds.has(game.bggId)}
                            className="absolute bottom-2 right-3"
                          >
                            {addingId === game.bggId ? <Loader2 className="w-4 h-4 animate-spin" /> : addedBggIds.has(game.bggId) ? '已收藏' : '加入'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-3 p-3">
                          <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold text-primary-foreground"
                            style={{ background: `hsl(${(game.bggId * 37) % 360}, 45%, 55%)` }}
                          >
                            {game.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{game.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {game.yearPublished && `${game.yearPublished} 年`}
                              {game.minPlayers && game.maxPlayers && ` · ${game.minPlayers}-${game.maxPlayers} 人`}
                              {game.playingTime && ` · ${game.playingTime} 分鐘`}
                            </p>
                            {game.rating && (
                              <p className="text-xs text-muted-foreground">⭐ {game.rating.toFixed(1)}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={addedBggIds.has(game.bggId) ? 'secondary' : 'default'}
                            onClick={() => handleAddGame(game)}
                            disabled={addingId === game.bggId || addedBggIds.has(game.bggId)}
                            className="self-center flex-shrink-0"
                          >
                            {addingId === game.bggId ? <Loader2 className="w-4 h-4 animate-spin" /> : addedBggIds.has(game.bggId) ? '已收藏' : '加入'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!isSearching && searchResults.length === 0 && !scannedCode && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground font-medium">🔥 熱門桌遊推薦</p>
                {[
                  { name: 'Catan', desc: '經典資源交易與拓荒遊戲' },
                  { name: 'Ticket to Ride', desc: '收集車票、建造鐵路路線' },
                  { name: 'Pandemic', desc: '合作拯救世界的防疫策略遊戲' },
                  { name: 'Azul', desc: '美麗的瓷磚拼貼策略遊戲' },
                  { name: 'Splendor', desc: '收集寶石、發展商業帝國' },
                  { name: 'Codenames', desc: '雙人對決的文字聯想派對遊戲' },
                  { name: '7 Wonders', desc: '建造古代文明奇蹟的卡牌遊戲' },
                  { name: 'Wingspan', desc: '收集鳥類、建立棲息地的引擎構築遊戲' },
                ].map((suggestion) => (
                  <button
                    key={suggestion.name}
                    onClick={() => { setSearchQuery(suggestion.name); }}
                    className="w-full flex items-center gap-3 p-3 bg-card rounded-xl shadow-card text-left hover:bg-accent/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Search className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{suggestion.name}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Photo mode placeholder */}
        {mode === 'photo' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Camera className="w-12 h-12 text-accent" />
            </div>
            <h3 className="font-bold text-lg mb-2">拍照辨識</h3>
            <p className="text-muted-foreground mb-6">此功能開發中，敬請期待！</p>
            <Button variant="outline" onClick={() => setMode(null)}>選擇其他方式</Button>
          </motion.div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
