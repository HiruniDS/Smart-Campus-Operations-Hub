import React from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CalendarDays,
  Building2,
  Ticket,
  Users,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Search,
  Command,
  HelpCircle,
  User as UserIcon,
  ChevronDown,
  Megaphone
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationPanel from './NotificationPanel';
import api from '@/lib/api';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const response = await api.get(`/notifications/${user.id}/unread-count`);
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  React.useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds for unread count
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Overview',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['USER', 'ADMIN', 'TECHNICIAN']
    },
    {
      label: 'Facilities',
      icon: Building2,
      path: '/dashboard/facilities',
      roles: ['USER', 'ADMIN', 'TECHNICIAN']
    },
    {
      label: 'Facility Bookings',
      icon: CalendarDays,
      path: '/bookings',
      roles: ['USER', 'ADMIN']
    },
    {
      label: 'Maintenance Tickets',
      icon: Ticket,
      path: '/tickets',
      roles: ['TECHNICIAN', 'ADMIN', 'USER']
    },
    {
      label: 'System Notices',
      icon: Megaphone,
      path: '/dashboard/notices',
      roles: ['ADMIN']
    },
    {
      label: 'User Management',
      icon: Users,
      path: '/dashboard/users',
      roles: ['ADMIN']
    },
  ];

  const filteredMenu = menuItems.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const NavLinks = ({ className = "" }: { className?: string }) => (
    <nav className={`flex items-center gap-1 ${className}`}>
      {filteredMenu.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${isActive
                ? 'bg-slate-100 text-black'
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const AdminLinks = ({ className = "" }: { className?: string }) => {
    if (user?.role !== 'ADMIN') return null;

    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
          <Settings className="h-4 w-4 text-slate-400" />
          Settings
        </button>
        <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          Support
        </button>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
          <LogOut className="h-4 w-4 text-red-500" />
          Logout
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Top Navigation Bar */}
      <header className="h-20 border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-6">

          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-xl shadow-black/10 transition-transform hover:scale-105">
                <Command className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tighter text-slate-900 leading-none hidden sm:block">SmartCampus<span className="text-blue-600">.</span></span>
            </Link>

            {/* Desktop Main Nav */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <NavLinks />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Admin Nav */}
            <div className="hidden xl:flex items-center gap-4 mr-4">
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <AdminLinks />
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-slate-50 rounded-full px-4 py-2 border border-slate-200 w-64 focus-within:w-80 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="bg-transparent border-none text-xs text-slate-900 focus:ring-0 ml-2 w-full placeholder:text-slate-400 font-bold uppercase tracking-wider"
              />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationsOpen(true)}
              className="text-slate-500 hover:text-slate-900 relative rounded-full hover:bg-slate-50"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white border-2 border-white animate-in zoom-in">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            <NotificationPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  role="button"
                  className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 cursor-pointer outline-none"
                >
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">{user?.name?.charAt(0) ?? 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-none mb-1">{user?.name}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter opacity-70">{user?.role}</p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-400 hidden lg:block" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl border-slate-200 shadow-2xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900">{user?.email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer focus:bg-slate-50">
                  <UserIcon className="mr-3 h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl py-2 cursor-pointer focus:bg-slate-50">
                  <Settings className="mr-3 h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-500 rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto p-6 bg-white border-b border-slate-200 rounded-b-3xl">
                <div className="space-y-8 pt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Navigation</p>
                    <div className="grid grid-cols-1 gap-2">
                      {filteredMenu.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-4 p-4 text-sm font-bold text-slate-900 bg-slate-50 rounded-2xl"
                        >
                          <item.icon className="h-5 w-5 text-blue-600" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Administration</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                          <Settings className="h-6 w-6 text-slate-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Settings</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                          <HelpCircle className="h-6 w-6 text-slate-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Support</span>
                        </button>
                        <button onClick={handleLogout} className="flex flex-col items-center gap-3 p-4 bg-red-50 rounded-2xl border border-transparent hover:border-red-200 transition-all col-span-2">
                          <LogOut className="h-6 w-6 text-red-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <div className="p-6 lg:p-12 max-w-[1600px] mx-auto">
          {/* Breadcrumbs or Context */}
          <div className="mb-8 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <span>Operations</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900">
              {location.pathname.split('/').pop() || 'Overview'}
            </span>
          </div>

          <Outlet />
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="py-6 border-t border-slate-200 mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-1 w-8 bg-slate-200 rounded-full" />)}
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">SmartCampus Infrastructure v4.2</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
            <span>Server: AP-SOUTH-1</span>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
          </div>
        </div>
      </footer>
    </div>
  );
}
