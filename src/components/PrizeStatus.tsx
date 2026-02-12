/**
 * PrizeStatus Component - แสดงสถานะรางวัลที่เหลือ
 */

'use client';

import { Trophy } from 'lucide-react';
import type { PrizeStatus as PrizeStatusType } from '@/types';

interface PrizeStatusProps {
  status: PrizeStatusType;
}

export function PrizeStatus({ status }: PrizeStatusProps) {
  return (
    <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
      {/* รวม */}
      <div className={`
        relative overflow-hidden rounded-2xl p-5 text-center
        ${status.totalRemaining > 0
          ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30'
          : 'bg-gray-700/50'
        }
        transition-all duration-300 border border-white/10
      `}>
        <div className="relative z-10">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-white/80" />
          <div className="text-3xl md:text-4xl font-bold text-white">
            {status.totalRemaining}
          </div>
          <div className="text-sm md:text-base text-white/80">รวม</div>
        </div>
        {status.totalRemaining > 0 && (
          <Trophy className="absolute -bottom-2 -right-2 w-20 h-20 text-white/10" />
        )}
      </div>
    </div>
  );
}
