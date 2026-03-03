import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useThemeStore } from '@/store/theme';
import { useEffect } from 'react';

export function DashboardLayout() {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useThemeStore();

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#07090F] text-[#0A1628] dark:text-[#E2E8F5]">
      <Sidebar />
      <Header />

      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop main content — animated with sidebar width */}
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-16 min-h-screen hidden lg:block"
      >
        <div className="p-6 max-w-7xl">
          <Outlet />
        </div>
      </motion.main>

      {/* Mobile main content — full width, extra bottom padding for bottom nav */}
      <main className="pt-16 pb-20 min-h-screen lg:hidden">
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
