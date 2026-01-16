import { Home, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const BottomNav = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const isHome = location.pathname === '/';
  const isCharts = location.pathname === '/charts';
  const isSettings = location.pathname === '/settings';

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    {
      icon: Home,
      label: t('common.home'),
      path: '/',
      active: isHome,
      showAvatar: false,
    },
    {
      icon: BarChart3,
      label: t('charts.title'),
      path: '/charts',
      active: isCharts,
      showAvatar: false,
    },
    {
      icon: null,
      label: t('settings.title'),
      path: '/settings',
      active: isSettings,
      showAvatar: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                  item.active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.showAvatar ? (
                  <Avatar className={cn('h-6 w-6', item.active && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}>
                    <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || t('settings.profile.name')} />
                    <AvatarFallback className="text-[10px]">{getInitials(user?.displayName)}</AvatarFallback>
                  </Avatar>
                ) : Icon ? (
                  <Icon className={cn('h-5 w-5', item.active && 'scale-110')} />
                ) : null}
                <span className={cn(
                  'text-xs font-medium',
                  item.active && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
