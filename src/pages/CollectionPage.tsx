import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, Heart, Repeat, DollarSign, Filter } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { GameCard } from '@/components/game/GameCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUserCollection } from '@/hooks/useGameData';
import { cn } from '@/lib/utils';

const statusConfig = {
  owned: { label: '擁有', icon: Package, color: 'text-primary' },
  wishlist: { label: '願望', icon: Heart, color: 'text-destructive' },
  'for-trade': { label: '換物', icon: Repeat, color: 'text-accent' },
  'for-sale': { label: '出售', icon: DollarSign, color: 'text-gold' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export default function CollectionPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('owned');
  const { data: collection = [], isLoading } = useUserCollection();

  const filteredCollection = collection.filter(
    (item) => item.status === activeTab
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="我的收藏"
        rightAction={
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Filter className="w-5 h-5" />
          </Button>
        }
      />

      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full h-auto p-1 bg-muted rounded-xl grid grid-cols-4">
            {Object.entries(statusConfig).map(([key, config]) => {
              const Icon = config.icon;
              const count = collection.filter((c) => c.status === key).length;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className={cn(
                    'flex flex-col gap-1 py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-card',
                    'text-muted-foreground data-[state=active]:text-foreground'
                  )}
                >
                  <Icon className={cn('w-4 h-4', activeTab === key && config.color)} />
                  <span className="text-xs font-medium">{config.label}</span>
                  <span className="text-[10px] text-muted-foreground">{count}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="aspect-square rounded-2xl" />
                ))}
              </div>
            ) : filteredCollection.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  {(() => {
                    const Icon = statusConfig[activeTab as keyof typeof statusConfig]?.icon || Package;
                    return <Icon className="w-8 h-8 text-muted-foreground" />;
                  })()}
                </div>
                <p className="text-muted-foreground">
                  還沒有{statusConfig[activeTab as keyof typeof statusConfig]?.label}的遊戲
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/add')}
                >
                  新增遊戲
                </Button>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-3"
              >
                {filteredCollection.map((item) => (
                  <motion.div key={item.id} variants={itemVariants}>
                    <GameCard
                      game={item.game}
                      plays={item.plays}
                      onClick={() => navigate(`/game/${item.gameId}`)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileNav />
    </div>
  );
}
