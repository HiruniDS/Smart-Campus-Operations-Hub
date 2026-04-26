import React from 'react';
import { motion } from 'motion/react';
import { 
  Megaphone, 
  Send, 
  History, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function NoticesPage() {
  const { user } = useAuth();
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [notices, setNotices] = React.useState<Notice[]>([]);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchNotices = async () => {
    try {
      const response = await api.get('/notices');
      setNotices(response.data);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotices();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Please fill in both title and content');
      return;
    }

    setIsPublishing(true);
    try {
      await api.post('/notices', {
        title,
        content,
        adminId: user?.id
      });
      toast.success('Notice broadcasted to all students!');
      setTitle('');
      setContent('');
      fetchNotices();
    } catch (error) {
      toast.error('Failed to publish notice');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-blue-600">
          <Megaphone className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">Communication Hub</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">System Notices</h1>
        <p className="text-slate-500 font-medium max-w-2xl">
          Broadcast official announcements and alerts to the entire student community. 
          Notices published here will appear instantly in their activity stream.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Create Notice Form */}
        <Card className="lg:col-span-3 rounded-[2rem] border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-8">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-black text-white flex items-center justify-center">
                <Send className="h-4 w-4" />
              </div>
              Draft New Notice
            </CardTitle>
            <CardDescription className="font-medium text-slate-400">
              Your message will be sent to all active users with the STUDENT role.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handlePublish} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notice Title</Label>
                <Input 
                  id="title"
                  placeholder="e.g. Scheduled Network Maintenance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 bg-slate-50/50 border-slate-100 focus:bg-white rounded-xl font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message Body</Label>
                <textarea 
                  id="content"
                  rows={4}
                  placeholder="Describe the announcement in detail..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 bg-slate-50/50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all rounded-2xl font-medium text-slate-600 resize-none"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isPublishing}
                className="w-full h-14 bg-black text-white hover:bg-slate-800 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 transition-all hover:-translate-y-1"
              >
                {isPublishing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-2 uppercase tracking-widest">
                    Broadcast Notice <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History / Recent Notices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" />
              Recent Broadcasts
            </h3>
            {notices.length > 0 && (
               <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                 {notices.length} Published
               </span>
            )}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />
              ))
            ) : notices.length === 0 ? (
              <div className="p-12 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                <Megaphone className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No history yet</p>
              </div>
            ) : (
              notices.map((notice) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={notice.id}
                  className="p-5 bg-white rounded-3xl border border-slate-100 hover:border-slate-200 transition-all shadow-sm group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Clock className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{notice.title}</h4>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2">{notice.content}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon helper since ArrowRight was missing in imports
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
