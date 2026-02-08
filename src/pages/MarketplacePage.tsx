import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MobileNav } from '@/components/layout/MobileNav';
import { ListingCard } from '@/components/game/ListingCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockListings } from '@/data/mockData';

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

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const locations = [...new Set(mockListings.map((l) => l.location).filter(Boolean))];

  const filteredListings = mockListings.filter((listing) => {
    const matchesSearch = listing.game.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLocation =
      !selectedLocation || listing.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader
        title="二手市集"
        rightAction={
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Filter className="w-5 h-5" />
          </Button>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜尋遊戲..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-12 rounded-xl bg-card shadow-card border-0"
          />
        </div>

        {/* Location filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <Button
            variant={selectedLocation === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedLocation(null)}
            className="rounded-full flex-shrink-0"
          >
            <MapPin className="w-4 h-4 mr-1" />
            全部地區
          </Button>
          {locations.map((location) => (
            <Button
              key={location}
              variant={selectedLocation === location ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedLocation(location || null)}
              className="rounded-full flex-shrink-0"
            >
              {location}
            </Button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-muted-foreground">
            找到 {filteredListings.length} 件商品
          </span>
          <Button variant="ghost" size="sm" className="text-primary">
            最新上架
          </Button>
        </div>

        {/* Listings grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3"
        >
          {filteredListings.map((listing) => (
            <motion.div key={listing.id} variants={itemVariants}>
              <ListingCard
                listing={listing}
                onClick={() => navigate(`/listing/${listing.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>

        {filteredListings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">找不到符合條件的商品</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
