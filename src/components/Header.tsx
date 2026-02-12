/**
 * Header Component - แสดงชื่อโปรแกรมจับรางวัล
 */

'use client';

import { Trophy, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl border-b border-blue-700/50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-6">
          <div className="relative">
            <div className="p-4 bg-white/10 rounded-2xl animate-pulse backdrop-blur-sm border border-white/20">
              <Trophy className="w-12 h-12 text-amber-400" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-bounce" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              NEW YEAR PARTY
            </h1>
            <p className="text-blue-200 mt-2 text-lg">
              Reward
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
