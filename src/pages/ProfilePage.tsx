import { motion } from 'framer-motion';
import { User, Settings, Bell, Package, Heart, Repeat, DollarSign, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/button';
import { mockCollection, mockRecords } from '@/data/mockData';

const menuItems = [
  { icon: Package, label: '我的收藏', path: '/collection', count: mockCollection.filter(c => c.status === 'owned').length },
  { icon: Heart, label: '願望清單', path: '/collection?tab=wishlist', count: mockCollection.filter(c => c.status === 'wishlist').length },
  { icon: Repeat, label: '換物清單', path: '/collection?tab=for-trade', count: mockCollection.filter(c => c.status === 'for-trade').length },
  { icon: DollarSign, label: '我的商品', path: '/my-listings', count: 0 },
];

const settingsItems = [
  { icon: Bell, label: '通知設定', path: '/settings/notifications' },
  { icon: Settings, label: '帳戶設定', path: '/settings/account' },
];

export default function ProfilePage() {
  const navigate = useNavigate();

  const totalPlays = mockRecords.length;
  const ownedGames = mockCollection.filter(c => c.status === 'owned').length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="我的" />

      <div className="px-4 py-4 space-y-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-card p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">桌遊愛好者</h2>
              <p className="text-sm text-muted-foreground">boardgamer@example.com</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              編輯
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{ownedGames}</p>
              <p className="text-xs text-muted-foreground">收藏遊戲</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{totalPlays}</p>
              <p className="text-xs text-muted-foreground">遊玩記錄</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gold">0</p>
              <p className="text-xs text-muted-foreground">交易次數</p>
            </div>
          </div>
        </motion.div>

        {/* Menu items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card overflow-hidden"
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                style={{
                  borderBottom: index < menuItems.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-secondary-foreground" />
                </div>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-card overflow-hidden"
        >
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                style={{
                  borderBottom: index < settingsItems.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-secondary-foreground" />
                </div>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            );
          })}
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5 mr-2" />
            登出
          </Button>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
