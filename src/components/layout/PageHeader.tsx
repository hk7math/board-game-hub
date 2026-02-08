import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

export function PageHeader({ title, showBack = false, rightAction }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2 min-w-[48px]">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
        </div>
        <h1 className="font-bold text-lg text-foreground">{title}</h1>
        <div className="flex items-center gap-2 min-w-[48px] justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
