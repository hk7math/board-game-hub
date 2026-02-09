import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { BoardGame, UserCollection, GameRecord, GameListing } from '@/types/boardgame';
import type { Tables } from '@/integrations/supabase/types';

function toBoardGame(row: Tables<'board_games'>): BoardGame {
  return {
    id: row.id,
    bggId: row.bgg_id ?? undefined,
    name: row.name,
    thumbnail: row.thumbnail ?? undefined,
    image: row.image ?? undefined,
    yearPublished: row.year_published ?? undefined,
    minPlayers: row.min_players ?? undefined,
    maxPlayers: row.max_players ?? undefined,
    playingTime: row.playing_time ?? undefined,
    minAge: row.min_age ?? undefined,
    description: row.description ?? undefined,
    rating: row.rating ? Number(row.rating) : undefined,
    weight: row.weight ? Number(row.weight) : undefined,
    categories: row.categories ?? undefined,
    mechanics: row.mechanics ?? undefined,
  };
}

export function useUserCollection() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-collection', user?.id],
    queryFn: async (): Promise<UserCollection[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_collections')
        .select('*, board_games(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id: row.id,
        gameId: row.game_id,
        game: toBoardGame(row.board_games),
        status: row.status as UserCollection['status'],
        addedAt: new Date(row.added_at),
        plays: row.plays ?? undefined,
        notes: row.notes ?? undefined,
      }));
    },
    enabled: !!user,
  });
}

export function useGameRecords() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['game-records', user?.id],
    queryFn: async (): Promise<GameRecord[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('game_records')
        .select('*, board_games(*)')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id: row.id,
        gameId: row.game_id,
        game: toBoardGame(row.board_games),
        playedAt: new Date(row.played_at),
        players: row.players ?? [],
        winner: row.winner ?? undefined,
        notes: row.notes ?? undefined,
        score: row.scores as Record<string, number> | undefined,
        duration: row.duration ?? undefined,
      }));
    },
    enabled: !!user,
  });
}

export function useGameListings() {
  return useQuery({
    queryKey: ['game-listings'],
    queryFn: async (): Promise<GameListing[]> => {
      const { data, error } = await supabase
        .from('game_listings')
        .select('*, board_games(*), profiles!game_listings_seller_id_fkey(username)')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback without profile join if fkey doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('game_listings')
          .select('*, board_games(*)')
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;

        return (fallbackData ?? []).map((row: any) => ({
          id: row.id,
          gameId: row.game_id,
          game: toBoardGame(row.board_games),
          sellerId: row.seller_id,
          sellerName: '賣家',
          price: row.price,
          condition: row.condition as GameListing['condition'],
          description: row.description ?? undefined,
          location: row.location ?? undefined,
          createdAt: new Date(row.created_at),
          status: row.status as GameListing['status'],
        }));
      }

      return (data ?? []).map((row: any) => ({
        id: row.id,
        gameId: row.game_id,
        game: toBoardGame(row.board_games),
        sellerId: row.seller_id,
        sellerName: row.profiles?.username ?? '賣家',
        price: row.price,
        condition: row.condition as GameListing['condition'],
        description: row.description ?? undefined,
        location: row.location ?? undefined,
        createdAt: new Date(row.created_at),
        status: row.status as GameListing['status'],
      }));
    },
  });
}

export function useBoardGame(id: string | undefined) {
  return useQuery({
    queryKey: ['board-game', id],
    queryFn: async (): Promise<BoardGame | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('board_games')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return toBoardGame(data);
    },
    enabled: !!id,
  });
}
