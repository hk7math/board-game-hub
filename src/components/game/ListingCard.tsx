import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { GameListing } from '@/types/boardgame';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dices } from 'lucide-react';

interface ListingCardProps {
  listing: GameListing;
  onClick?: () => void;
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  new: { label: '全新', color: 'bg-teal-fresh text-accent-foreground' },
  'like-new': { label: '近全新', color: 'bg-accent text-accent-foreground' },
  good: { label: '良好', color: 'bg-secondary text-secondary-foreground' },
  fair: { label: '普通', color: 'bg-muted text-muted-foreground' },
  poor: { label: '堪用', color: 'bg-muted text-muted-foreground' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  available: { label: '可購買', color: 'bg-teal-fresh' },
  reserved: { label: '已預訂', color: 'bg-gold' },
  sold: { label: '已售出', color: 'bg-muted-foreground' },
};

export function ListingCard({ listing, onClick }: ListingCardProps) {
  const condition = conditionLabels[listing.condition];
  const status = statusLabels[listing.status];

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative bg-card rounded-2xl shadow-card overflow-hidden cursor-pointer"
    >
      {/* Status indicator */}
      {listing.status !== 'available' && (
        <div className="absolute inset-0 bg-foreground/50 z-10 flex items-center justify-center">
          <span className={cn('px-4 py-2 rounded-full font-bold text-background', status.color)}>
            {status.label}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {listing.game.thumbnail ? (
          <img
            src={listing.game.thumbnail}
            alt={listing.game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dices className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className={cn('absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium', condition.color)}>
          {condition.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-sm text-foreground line-clamp-1">{listing.game.name}</h3>
        
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ${listing.price.toLocaleString()}
          </span>
          {listing.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {listing.location}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{listing.sellerName}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(listing.createdAt, { addSuffix: true, locale: zhTW })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
