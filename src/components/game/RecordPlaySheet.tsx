import { useState } from 'react';
import { Plus, X, Loader2, Trophy } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RecordPlaySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  gameName: string;
}

export function RecordPlaySheet({
  open,
  onOpenChange,
  gameId,
  gameName,
}: RecordPlaySheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [players, setPlayers] = useState<string[]>(['']);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const addPlayer = () => {
    if (players.length >= 10) return;
    setPlayers([...players, '']);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 1) return;
    const next = players.filter((_, i) => i !== index);
    setPlayers(next);
    // Adjust scores
    const newScores: Record<number, string> = {};
    next.forEach((_, i) => {
      const oldIdx = i >= index ? i + 1 : i;
      if (scores[oldIdx] !== undefined) newScores[i] = scores[oldIdx];
      else if (scores[i] !== undefined && i < index) newScores[i] = scores[i];
    });
    setScores(newScores);
    // Adjust winner
    if (winnerIndex === index) setWinnerIndex(null);
    else if (winnerIndex !== null && winnerIndex > index) setWinnerIndex(winnerIndex - 1);
  };

  const updatePlayer = (index: number, value: string) => {
    const next = [...players];
    next[index] = value;
    setPlayers(next);
  };

  const handleSave = async () => {
    if (!user) return;

    const validPlayers = players.map(p => p.trim()).filter(Boolean);
    if (validPlayers.length === 0) {
      toast.error('請至少輸入一位玩家');
      return;
    }

    setSaving(true);
    try {
      const scoreObj: Record<string, number> = {};
      validPlayers.forEach((name, i) => {
        const originalIdx = players.findIndex((p, pi) => p.trim() === name && pi >= 0);
        const s = scores[originalIdx];
        if (s && !isNaN(Number(s))) {
          scoreObj[name] = Number(s);
        }
      });

      const winner = winnerIndex !== null && players[winnerIndex]?.trim()
        ? players[winnerIndex].trim()
        : null;

      const { error } = await supabase.from('game_records').insert({
        user_id: user.id,
        game_id: gameId,
        players: validPlayers,
        scores: Object.keys(scoreObj).length > 0 ? scoreObj : null,
        winner,
        duration: duration ? parseInt(duration) : null,
        notes: notes.trim() || null,
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['game-records', user.id] });
      toast.success('遊玩記錄已儲存！');
      // Reset form
      setPlayers(['']);
      setScores({});
      setWinnerIndex(null);
      setDuration('');
      setNotes('');
      onOpenChange(false);
    } catch (err) {
      console.error('Save record error:', err);
      toast.error('儲存記錄失敗');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>記錄遊玩 — {gameName}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Players */}
          <div>
            <label className="text-sm font-medium mb-2 block">玩家</label>
            <div className="space-y-2">
              {players.map((player, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setWinnerIndex(winnerIndex === i ? null : i)}
                    className={cn(
                      'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                      winnerIndex === i
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                    title="設為贏家"
                  >
                    <Trophy className="w-4 h-4" />
                  </button>
                  <Input
                    placeholder={`玩家 ${i + 1}`}
                    value={player}
                    onChange={(e) => updatePlayer(i, e.target.value)}
                    className="flex-1 h-10 rounded-lg"
                    maxLength={50}
                  />
                  <Input
                    placeholder="分數"
                    type="number"
                    value={scores[i] ?? ''}
                    onChange={(e) => setScores({ ...scores, [i]: e.target.value })}
                    className="w-20 h-10 rounded-lg"
                  />
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(i)}
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {players.length < 10 && (
              <Button variant="ghost" size="sm" onClick={addPlayer} className="mt-2">
                <Plus className="w-4 h-4 mr-1" /> 新增玩家
              </Button>
            )}
            {winnerIndex !== null && players[winnerIndex]?.trim() && (
              <p className="text-xs text-primary mt-1">🏆 贏家：{players[winnerIndex].trim()}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium mb-2 block">遊玩時間（分鐘）</label>
            <Input
              type="number"
              placeholder="例如：60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="h-10 rounded-lg"
              min={1}
              max={9999}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">備註</label>
            <Textarea
              placeholder="記錄這次遊玩的心得..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-lg resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Save */}
          <Button
            className="w-full h-12 rounded-xl gradient-warm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            儲存記錄
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
