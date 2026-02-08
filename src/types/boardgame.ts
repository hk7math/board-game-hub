export interface BoardGame {
  id: string;
  bggId?: number;
  name: string;
  thumbnail?: string;
  image?: string;
  yearPublished?: number;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  minPlayTime?: number;
  maxPlayTime?: number;
  minAge?: number;
  description?: string;
  rating?: number;
  weight?: number;
  categories?: string[];
  mechanics?: string[];
  designers?: string[];
  publishers?: string[];
}

export interface GameRecord {
  id: string;
  gameId: string;
  game: BoardGame;
  playedAt: Date;
  players: string[];
  winner?: string;
  notes?: string;
  score?: Record<string, number>;
  duration?: number;
}

export interface GameListing {
  id: string;
  gameId: string;
  game: BoardGame;
  sellerId: string;
  sellerName: string;
  price: number;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  description?: string;
  photos?: string[];
  location?: string;
  createdAt: Date;
  status: 'available' | 'reserved' | 'sold';
}

export interface UserCollection {
  id: string;
  gameId: string;
  game: BoardGame;
  status: 'owned' | 'wishlist' | 'for-trade' | 'for-sale';
  addedAt: Date;
  notes?: string;
  plays?: number;
}
