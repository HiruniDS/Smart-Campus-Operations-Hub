import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-950/30 text-red-500 border border-red-900/50 mb-6">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Access Restricted</h1>
      <p className="max-w-md text-center text-zinc-500 mb-8 leading-relaxed">
        Your current role does not have permission to access this module. 
        Please contact the Campus IT department if you believe this is an error.
      </p>
      <Button 
        onClick={() => navigate('/dashboard')}
        className="bg-white text-black hover:bg-zinc-200"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Return to Dashboard
      </Button>
    </div>
  );
}
