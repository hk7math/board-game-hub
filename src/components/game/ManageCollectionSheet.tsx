import { useState } from 'react';
import { Package, Heart, Repeat, DollarSign, Trash2, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ManageCollectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  currentStatus: string;
  gameName: string;
  onRemoved?: () => void;
}

const statusOptions = [
  { value: 'owned', label: '擁有', icon: Package, color: 'text-primary', bgActive: 'bg-primary/10 border-primary' },
  { value: 'wishlist', label: '願望清單', icon: Heart, color: 'text-destructive', bgActive: 'bg-destructive/10 border-destructive' },
  { value: 'for-trade', label: '換物中', icon: Repeat, color: 'text-accent', bgActive: 'bg-accent/10 border-accent' },
  { value: 'for-sale', label: '出售中', icon: DollarSign, color: 'text-gold', bgActive: 'bg-gold/10 border-gold' },
];

export function ManageCollectionSheet({
  open,
  onOpenChange,
  collectionId,
  currentStatus,
  gameName,
  onRemoved,
}: ManageCollectionSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || !user) return;
    setUpdating(newStatus);
    try {
      const { error } = await supabase
        .from('user_collections')
        .update({ status: newStatus })
        .eq('id', collectionId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['user-collection', user.id] });
      toast.success(`已將狀態改為「${statusOptions.find(s => s.value === newStatus)?.label}」`);
      onOpenChange(false);
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('更新狀態失敗');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async () => {
    if (!user) return;
    setRemoving(true);
    try {
      const { error } = await supabase
        .from('user_collections')
        .delete()
        .eq('id', collectionId);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['user-collection', user.id] });
      toast.success(`已將「${gameName}」從收藏中移除`);
      onOpenChange(false);
      onRemoved?.();
    } catch (err) {
      console.error('Remove error:', err);
      toast.error('移除失敗');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>管理收藏</SheetTitle>
        </SheetHeader>

        <div className="space-y-2 mb-6">
          <p className="text-sm text-muted-foreground mb-3">變更收藏狀態</p>
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === currentStatus;
            return (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={updating !== null || removing}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border transition-colors',
                  isActive
                    ? option.bgActive
                    : 'border-border hover:bg-muted'
                )}
              >
                <Icon className={cn('w-5 h-5', option.color)} />
                <span className="font-medium flex-1 text-left">{option.label}</span>
                {isActive && <span className="text-xs text-muted-foreground">目前狀態</span>}
                {updating === option.value && <Loader2 className="w-4 h-4 animate-spin" />}
              </button>
            );
          })}
        </div>

        <Button
          variant="destructive"
          className="w-full h-12 rounded-xl"
          onClick={handleRemove}
          disabled={updating !== null || removing}
        >
          {removing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trash2 className="w-5 h-5 mr-2" />}
          從收藏中移除
        </Button>
      </SheetContent>
    </Sheet>
  );
}
