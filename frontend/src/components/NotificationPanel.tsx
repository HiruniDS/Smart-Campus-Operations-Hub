import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'WARNING' | 'INFO';
  read: boolean;
  createdAt: string;
}

export default function NotificationPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/notifications/${user.id}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, user?.id]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await api.post(`/notifications/${user.id}/read-all`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'WARNING': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[99]"
          />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-20 right-8 w-96 bg-white rounded-3xl border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden z-[100] flex flex-col max-h-[600px]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight text-slate-900 leading-none">Activity Stream</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Real-time updates</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={fetchNotifications}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-slate-900 rounded-lg"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-900 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <Bell className="h-6 w-6 text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No new alerts</p>
                  <p className="text-xs text-slate-300 mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id}
                    className={`group flex gap-4 p-4 rounded-2xl transition-all cursor-pointer border ${
                      n.read 
                        ? 'bg-white border-transparent grayscale-[0.5] opacity-60' 
                        : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-bold ${n.read ? 'text-slate-500' : 'text-slate-900'}`}>{n.title}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0 ml-2">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <Button 
                onClick={handleMarkAllRead}
                disabled={notifications.length === 0 || notifications.every(n => n.read)}
                className="w-full text-[11px] font-bold uppercase tracking-[0.1em] h-10 bg-black text-white rounded-xl hover:bg-slate-900 transition-all disabled:opacity-50"
              >
                Mark all as read
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
