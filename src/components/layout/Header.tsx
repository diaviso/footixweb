import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { cn, getAvatarUrl } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
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
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
          >
            <Bell className="h-4 w-4 text-[#5E7A9A]" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C41E3A] dark:bg-[#E74C5E] ring-2 ring-white dark:ring-[#07090F]" />
          </Button>

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
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]"
          >
            <Bell className="h-4 w-4 text-[#5E7A9A]" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[#C41E3A] dark:bg-[#E74C5E]" />
          </Button>
          <div className="ml-1">
            <UserMenu />
          </div>
        </div>
      </header>
    </>
  );
}
