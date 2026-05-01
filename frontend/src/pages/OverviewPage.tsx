import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MapPin,
  Users,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  Plus,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';

export default function OverviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Resources', value: '142', change: '+12%', icon: Building2 },
    { label: 'Active Bookings', value: '48', change: '89% capacity', icon: Clock },
    { label: 'Open Incidents', value: '12', change: '-2 this week', icon: AlertCircle },
    { label: 'System Uptime', value: '99.9%', change: 'All systems go', icon: Activity },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'booked', target: 'Lab 402', time: '12m ago', status: 'confirmed' },
    { id: 2, user: 'Sarah Smith', action: 'reported', target: 'AC Fault - Floor 2', time: '45m ago', status: 'pending' },
    { id: 3, user: 'System', action: 'optimized', target: 'Energy usage - Zone B', time: '2h ago', status: 'success' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge className="bg-blue-50 text-blue-600 border-blue-100 mb-4 hover:bg-blue-50">Operational Insight</Badge>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] ?? 'User'}
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Here's what's happening across the campus today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-black text-white hover:bg-slate-800 font-bold h-11 px-6 shadow-sm" onClick={() => navigate('/bookings/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
          {user?.role === 'ADMIN' && (
            <Button variant="outline" className="h-11 px-6 font-bold text-slate-900 border-slate-200">
              System Settings
            </Button>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Feed - Large Bento */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="p-8 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-extrabold tracking-tight">Recent Activity</CardTitle>
              <CardDescription className="text-slate-500 font-medium font-sans">Live updates from the operations hub</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-100">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-sm ${activity.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                        activity.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {activity.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {activity.user} <span className="font-medium text-slate-500">{activity.action}</span> {activity.target}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-[10px] font-bold border-slate-200">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Info - Small Bento Stack */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="border-slate-200 shadow-sm bg-black text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Smart Controls</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Optimize energy and resource usage with a single click across all campus zones.
              </p>
              <Button className="w-full bg-white text-black hover:bg-slate-200 font-bold">
                Run Optimizer
              </Button>
            </CardContent>
          </Card>

          {/* Role-Based Alert for Admin/Technician */}
          {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-red-100 bg-red-50/50 shadow-sm">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4 text-red-600">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="text-xs font-extrabold uppercase tracking-[0.2em]">Security Alert</span>
                  </div>
                  <h3 className="text-lg font-bold text-red-950 mb-2">Infrastructure Alert</h3>
                  <p className="text-red-800/70 text-sm leading-relaxed mb-6 font-medium">
                    Server room 4 overheated. Technician dispatch required immediately.
                  </p>
                  <Button variant="ghost" className="w-full text-red-600 hover:bg-red-100 hover:text-red-700 font-bold border border-red-200">
                    Acknowledge
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Productivity Tip */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Did you know?</p>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">
                    Scheduling maintenance during off-peak hours reduces disruption by <span className="text-blue-600 font-bold">45%</span>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
