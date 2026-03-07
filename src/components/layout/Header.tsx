import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  Menu,
  Star,
  Swords,
  TrendingDown,
  Check,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { cn, getAvatarUrl } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { notificationService, type AppNotification } from '@/services/notification.service';
import { duelService } from '@/services/duel.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const navigate = useNavigate();
  const { isDark, toggleTheme, sidebarCollapsed, setMobileSidebarOpen } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [joiningDuel, setJoiningDuel] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchUnread();
    pollRef.current = setInterval(fetchUnread, 15000);
    return () => clearInterval(pollRef.current);
  }, [fetchUnread]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openNotifications = async () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen) {
      setLoadingNotifs(true);
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch {}
      setLoadingNotifs(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const handleAcceptDuel = async (notif: AppNotification) => {
    if (!notif.data?.code) return;
    setJoiningDuel(notif.id);
    try {
      await duelService.join(notif.data.code);
      await handleMarkRead(notif.id);
      setNotifOpen(false);
      navigate('/duels');
    } catch {}
    setJoiningDuel(null);
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-xl p-0 hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
        >
          <Avatar className="h-8 w-8 ring-2 ring-[#DCE6F0] dark:ring-[#1B2B40] hover:ring-[#C41E3A]/40 dark:hover:ring-[#E74C5E]/40 transition-all">
            <AvatarImage
              src={getAvatarUrl((user as any)?.avatar, user?.id)}
              alt={user?.firstName}
            />
            <AvatarFallback className="bg-[#C41E3A] dark:bg-[#E74C5E] text-white dark:text-white font-bold text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 p-2 bg-white dark:bg-[#0D1525] border-[#DCE6F0] dark:border-[#1B2B40] shadow-xl rounded-2xl"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal p-3 bg-[#EFF3F7] dark:bg-[#111B2E] rounded-xl mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-[#C41E3A]/20 dark:ring-[#E74C5E]/20">
              <AvatarImage src={getAvatarUrl((user as any)?.avatar, user?.id)} />
              <AvatarFallback className="bg-[#C41E3A] dark:bg-[#E74C5E] text-white dark:text-white font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-none text-[#0A1628] dark:text-[#E2E8F5] truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs leading-none text-[#5E7A9A] mt-1 truncate">{user?.email}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Star className="h-3 w-3 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-xs font-bold text-[#D4AF37]">{user?.stars || 0} étoiles</span>
                <span className={cn(
                  'ml-1 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold',
                  user?.role === 'ADMIN'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'bg-[#C41E3A]/10 dark:bg-[#E74C5E]/10 text-[#C41E3A] dark:text-[#E74C5E]'
                )}>
                  {user?.role === 'ADMIN' ? 'ADMIN' : 'JOUEUR'}
                </span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="rounded-xl cursor-pointer py-2.5 px-3 text-[#0A1628] dark:text-[#E2E8F5] hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
        >
          <User className="mr-3 h-4 w-4 text-[#5E7A9A]" />
          <span className="font-medium">Mon profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate('/settings')}
          className="rounded-xl cursor-pointer py-2.5 px-3 text-[#0A1628] dark:text-[#E2E8F5] hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
        >
          <Settings className="mr-3 h-4 w-4 text-[#5E7A9A]" />
          <span className="font-medium">Paramètres</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2 bg-[#DCE6F0] dark:bg-[#1B2B40]" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-xl cursor-pointer py-2.5 px-3 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="font-medium">Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Desktop Header */}
      <motion.header
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed top-0 right-0 z-30 h-16',
          'bg-white/95 dark:bg-[#07090F]/95 backdrop-blur-xl',
          'border-b border-[#DCE6F0] dark:border-[#1B2B40]',
          'items-center justify-between px-6',
          'hidden lg:flex'
        )}
        style={{ width: `calc(100% - ${sidebarCollapsed ? 72 : 260}px)` }}
      >
        {/* Search */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <motion.div
            animate={{ width: searchFocused ? '100%' : '280px' }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
            <Input
              placeholder="Rechercher un quiz, un thème..."
              className={cn(
                'pl-9 h-9 bg-[#EFF3F7] dark:bg-[#111B2E] border-[#DCE6F0] dark:border-[#1B2B40] rounded-xl text-sm',
                'focus:bg-white dark:focus:bg-[#0D1525] focus:ring-2 focus:ring-[#C41E3A]/20 dark:focus:ring-[#E74C5E]/20 focus:border-[#C41E3A]/40 dark:focus:border-[#E74C5E]/40',
                'placeholder:text-[#5E7A9A] transition-all'
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Stars display */}
          {user && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 dark:bg-[#E5C158]/10 border border-[#D4AF37]/20 dark:border-[#E5C158]/20 mr-2">
              <Star className="h-3.5 w-3.5 text-[#D4AF37] dark:text-[#E5C158] fill-current" />
              <span className="text-xs font-bold text-[#D4AF37] dark:text-[#E5C158]">
                {user.stars || 0}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
          >
            <motion.div
              key={isDark ? 'moon' : 'sun'}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? (
                <Moon className="h-4 w-4 text-[#5E7A9A]" />
              ) : (
                <Sun className="h-4 w-4 text-[#D4AF37]" />
              )}
            </motion.div>
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={openNotifications}
              className="relative h-9 w-9 rounded-xl hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
            >
              <Bell className="h-4 w-4 text-[#5E7A9A]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-[#C41E3A] dark:bg-[#E74C5E] text-white text-[10px] font-bold ring-2 ring-white dark:ring-[#07090F]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-96 max-h-[480px] bg-white dark:bg-[#0D1525] border border-[#DCE6F0] dark:border-[#1B2B40] rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#DCE6F0] dark:border-[#1B2B40]">
                    <h3 className="text-sm font-bold text-[#0A1628] dark:text-[#E2E8F5]">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-[#C41E3A] dark:text-[#E74C5E] font-semibold hover:underline flex items-center gap-1">
                        <CheckCheck className="h-3 w-3" /> Tout lire
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto max-h-[420px]">
                    {loadingNotifs ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-5 w-5 animate-spin text-[#5E7A9A]" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-10 text-sm text-[#5E7A9A]">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            'px-4 py-3 border-b border-[#DCE6F0]/50 dark:border-[#1B2B40]/50 hover:bg-[#EFF3F7]/50 dark:hover:bg-[#111B2E]/50 transition-colors',
                            !notif.isRead && 'bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0',
                              notif.type === 'DUEL_INVITE' ? 'bg-blue-100 dark:bg-blue-900/30' : notif.type === 'RANK_DROP' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-[#EFF3F7] dark:bg-[#111B2E]'
                            )}>
                              {notif.type === 'DUEL_INVITE' ? (
                                <Swords className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              ) : notif.type === 'RANK_DROP' ? (
                                <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              ) : (
                                <Bell className="h-4 w-4 text-[#5E7A9A]" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-[#0A1628] dark:text-[#E2E8F5] truncate">{notif.title}</p>
                                {!notif.isRead && (
                                  <button onClick={() => handleMarkRead(notif.id)} title="Marquer comme lu">
                                    <Check className="h-3.5 w-3.5 text-[#5E7A9A] hover:text-[#C41E3A]" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-[#5E7A9A] mt-0.5 line-clamp-2">{notif.message}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[10px] text-[#5E7A9A]/70">{formatTimeAgo(notif.createdAt)}</span>
                                {notif.type === 'DUEL_INVITE' && notif.data?.code && (
                                  <button
                                    onClick={() => handleAcceptDuel(notif)}
                                    disabled={joiningDuel === notif.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C41E3A] dark:bg-[#E74C5E] text-white text-[10px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                                  >
                                    {joiningDuel === notif.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Swords className="h-3 w-3" />}
                                    Accepter
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="ml-1">
            <UserMenu />
          </div>
        </div>
      </motion.header>

      {/* Mobile Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-30 h-16',
          'bg-white/95 dark:bg-[#07090F]/95 backdrop-blur-xl',
          'border-b border-[#DCE6F0] dark:border-[#1B2B40]',
          'flex items-center justify-between px-4',
          'lg:hidden'
        )}
      >
        {/* Hamburger + Logo */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
            className="h-9 w-9 rounded-xl hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
          >
            <Menu className="h-5 w-5 text-[#5E7A9A]" />
          </Button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Footix" className="h-7 w-7 rounded-lg" />
            <span className="text-base font-black tracking-tight text-[#0A1628] dark:text-[#E2E8F5]">
              Foot<span className="text-[#C41E3A] dark:text-[#E74C5E]">ix</span>
            </span>
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1">
          {/* Stars */}
          {user && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 mr-1">
              <Star className="h-3 w-3 text-[#D4AF37] fill-current" />
              <span className="text-xs font-bold text-[#D4AF37]">{user.stars || 0}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
          >
            {isDark ? (
              <Moon className="h-4 w-4 text-[#5E7A9A]" />
            ) : (
              <Sun className="h-4 w-4 text-[#D4AF37]" />
            )}
          </Button>
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={openNotifications}
              className="relative h-9 w-9 rounded-xl hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
            >
              <Bell className="h-4 w-4 text-[#5E7A9A]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 px-0.5 flex items-center justify-center rounded-full bg-[#C41E3A] dark:bg-[#E74C5E] text-white text-[9px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
          <div className="ml-1">
            <UserMenu />
          </div>
        </div>
      </header>
    </>
  );
}
