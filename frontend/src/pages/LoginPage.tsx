import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  UserCircle,
  Wrench,
  Loader2,
  Lock,
  Mail,
  ChevronRight,
  School,
  Sparkles,
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { UserRole } from '@/types';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [isAuthFlowOpen, setIsAuthFlowOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your credentials');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(email, password);
      toast.success('Welcome back to SmartCampus');
      // Role is available on the context user after login resolves
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const role = savedUser?.role;
      if (role === 'TECHNICIAN') {
        navigate('/tickets');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Authentication rejected. Verify credentials.');
      setIsLoggingIn(false);
    }
  };

  const startOAuthFlow = () => {
    setIsAuthFlowOpen(true);
  };

  const handleMockGoogleLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setIsLoggingIn(true);
    try {
      await googleLogin(role);
      toast.success(`Authenticated securely as ${role} (Google)`);
      if (role === 'TECHNICIAN') {
        navigate('/tickets');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error('OAuth handshake failed.');
      setIsLoggingIn(false);
    }
  };

  const roles: { role: UserRole; icon: React.ReactNode; label: string; desc: string }[] = [
    {
      role: 'USER',
      icon: <UserCircle className="h-4 w-4" />,
      label: 'Academic User',
      desc: 'Students, Faculty & Staff'
    },
    {
      role: 'TECHNICIAN',
      icon: <Wrench className="h-4 w-4" />,
      label: 'Campus Maintenance',
      desc: 'Technical & Service Access'
    },
    {
      role: 'ADMIN',
      icon: <ShieldCheck className="h-4 w-4" />,
      label: 'Operations Admin',
      desc: 'Core System Governance'
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="relative min-h-screen mesh-gradient flex items-center justify-center p-6 text-slate-900 overflow-hidden selection:bg-blue-600 selection:text-white">

      {/* Background Decorative Element */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-400/10 blur-[120px] rounded-full animate-pulse decoration-3000" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">

        {/* Left Aspect: Branding & Aesthetic Content */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-white/20 relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <School className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">SmartCampus<span className="text-blue-600">.hub</span></span>
          </motion.div>

          <div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="flex items-center gap-2 text-blue-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Next-Gen Operations</span>
              </motion.div>
              <motion.h1
                variants={itemVariants}
                className="text-6xl font-extrabold tracking-tighter leading-[0.9] text-slate-950"
              >
                Connected <br />
                University.
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-lg text-slate-600 font-medium leading-relaxed max-w-sm"
              >
                Manage campus bookings and maintenance requests in one simple, secure hub.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex items-center gap-4 py-4 px-6 bg-white/40 rounded-2xl border border-white/20 inline-flex shadow-sm"
            >
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Fingerprint className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Biometric Ready</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Identity Secured</p>
              </div>
            </motion.div>
          </div>

          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-4">
            <span>v4.2.0-stable</span>
            <span className="h-1 w-1 bg-slate-300 rounded-full" />
            <span>Encrypted Cloud Hub</span>
          </div>
        </div>

        {/* Right Aspect: Authentication Interface */}
        <div className="flex flex-col justify-center p-8 lg:p-16 bg-white">
          <AnimatePresence mode="wait">
            {!isAuthFlowOpen ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-sm mx-auto overflow-visible"
              >
                <div className="mb-10">
                  <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 mb-3">Sign in.</h2>
                  <p className="text-slate-500 font-medium">Use your institutional credentials to enter.</p>
                </div>

                <form onSubmit={handleManualLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@smartcampus.edu"
                        className="pl-10 h-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</Label>
                      <button type="button" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">Recovery</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-12 bg-slate-50/50 border-slate-100 focus:bg-white transition-all rounded-xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-black text-white hover:bg-slate-800 rounded-xl font-bold shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="flex items-center gap-2">Continue Dashboard <ArrowRight className="h-4 w-4" /></div>}
                  </Button>
                </form>

                <div className="relative my-10">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-slate-300">
                    <span className="bg-white px-4">Authorized OAuth Only</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={startOAuthFlow}
                  className="w-full h-12 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-3"
                  disabled={isLoggingIn}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Login with Workspace
                </Button>

                <div className="mt-8 text-center text-sm font-medium text-slate-500">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => navigate('/signup')}
                    className="text-blue-600 hover:text-blue-700 font-bold uppercase tracking-widest text-[11px] transition-colors"
                  >
                    Create Profile
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="oauth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm mx-auto bg-slate-50/50 p-1 rounded-3xl border border-slate-100 shadow-2xl overflow-hidden"
              >
                <div className="bg-white rounded-[1.4rem] overflow-hidden">
                  <div className="px-6 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-blue-600 flex items-center justify-center">
                        <Fingerprint className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Gateway Access</span>
                    </div>
                    <button
                      onClick={() => setIsAuthFlowOpen(false)}
                      className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180 text-slate-400" />
                    </button>
                  </div>

                  <CardContent className="p-8">
                    <div className="mb-8">
                      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Choose Profile</h3>
                      <p className="text-sm text-slate-500 font-medium">Verify your campus identity to proceed.</p>
                    </div>

                    <div className="grid gap-3">
                      {roles.map((roleObj) => (
                        <button
                          key={roleObj.role}
                          onClick={() => handleMockGoogleLogin(roleObj.role)}
                          disabled={isLoggingIn}
                          className={`group w-full flex items-center justify-between p-4 rounded-2xl border border-transparent bg-slate-50/80 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 ${selectedRole === roleObj.role && isLoggingIn ? 'opacity-50 pointer-events-none' : ''
                            }`}
                        >
                          <div className="flex items-center gap-4 text-left">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                              {selectedRole === roleObj.role && isLoggingIn ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                roleObj.icon
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{roleObj.label}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{roleObj.role}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-200 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                        </button>
                      ))}
                    </div>

                    <div className="mt-10 pt-6 border-t border-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center leading-relaxed">
                      Secure Handshake via<br />
                      <span className="text-slate-900">Campus Identity v2</span>
                    </div>
                  </CardContent>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-8 left-8 hidden lg:block">
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-1 w-8 bg-black/10 rounded-full" />)}
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">SmartCampus Infrastructure</span>
        </div>
      </div>
    </div>
  );
}
