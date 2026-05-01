import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  UserCircle,
  Wrench,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  School,
  ChevronLeft
} from 'lucide-react';
import { UserRole } from '@/types';
import { toast } from 'sonner';

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsRegistering(true);
    try {
      await register(name, email, password, selectedRole);
      toast.success('Account created successfully!');
      if (selectedRole === 'TECHNICIAN') {
        navigate('/tickets');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      setIsRegistering(false);
    }
  };

  const roles: { role: UserRole; icon: React.ReactNode; label: string }[] = [
    { role: 'USER', icon: <UserCircle className="h-4 w-4" />, label: 'User' },
    { role: 'TECHNICIAN', icon: <Wrench className="h-4 w-4" />, label: 'Technician' },
    { role: 'ADMIN', icon: <ShieldCheck className="h-4 w-4" />, label: 'Admin' },
  ];

  return (
    <div className="relative min-h-screen mesh-gradient flex items-center justify-center p-6 text-slate-900 overflow-hidden font-sans">

      <div className="w-full max-w-lg bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="flex flex-col p-8 lg:p-12 bg-white">

          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Back to Login</span>
          </button>

          <div className="mb-10 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center shadow-xl shadow-black/10">
                <School className="h-7 w-7 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 mb-2">Create Profile.</h2>
            <p className="text-slate-500 font-medium">Join the SmartCampus ecosystem.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</Label>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 h-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="email"
                  placeholder="j.doe@smartcampus.edu"
                  className="pl-10 h-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Access Role</Label>
              <div className="flex flex-col sm:flex-row gap-3">
                {roles.map((r) => {
                  const isSelected = selectedRole === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setSelectedRole(r.role)}
                      aria-pressed={isSelected}
                      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all !shadow-none ${isSelected
                        ? '!bg-blue-50 !border-blue-300 !text-blue-700 ring-2 ring-blue-200'
                        : '!bg-white !border-slate-200 !text-slate-500 hover:!border-slate-300 hover:!bg-slate-50'
                        }`}
                    >
                      {r.icon}
                      <span className="text-[10px] font-bold uppercase tracking-tight">{r.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] font-semibold text-blue-700">
                Selected role: {selectedRole}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-black text-white hover:bg-slate-800 rounded-xl font-bold shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5"
              disabled={isRegistering}
            >
              {isRegistering ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="flex items-center gap-2">Initialize Account <ArrowRight className="h-4 w-4" /></div>}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium">
            By registering, you agree to our <span className="text-blue-600 cursor-pointer">Terms of Service</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
