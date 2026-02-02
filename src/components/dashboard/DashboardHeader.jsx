import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function DashboardHeader() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // not logged in
      }
    };
    fetchUser();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div 
      className="relative bg-cover bg-center h-52" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2834&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-slate-800/30" />
      <div className="relative max-w-7xl mx-auto px-6 md:px-8 h-full flex flex-col justify-center">
        <h1 className="text-4xl font-bold text-white mb-2 shadow-lg">{getGreeting()}, {user ? user.full_name.split(' ')[0] : 'Admin'}!</h1>
        <p className="text-amber-200 max-w-2xl text-lg shadow-lg">Here's a summary of your platform's activity today.</p>
      </div>
    </div>
  );
}