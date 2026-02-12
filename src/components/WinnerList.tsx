/**
 * WinnerList Component - แสดงรายการผู้โชคดี
 */

'use client';

import { Trophy, Copy, Check, Trash2, Medal, User, Building2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import type { EmployeeId } from '@/types';

interface WinnerListProps {
  winners: EmployeeId[];
  onDelete?: (id: string) => void;
  onClearAll?: () => void;
}

export function WinnerList({ winners, onDelete, onClearAll }: WinnerListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  if (winners.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
        <Trophy className="w-16 h-16 mx-auto text-white/30 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          ยังไม่มีผู้โชคดี
        </h3>
        <p className="text-blue-200">
          รายการผู้ได้รับรางวัลจะแสดงที่นี่
        </p>
      </div>
    );
  }


  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h3 className="font-semibold text-white text-lg">
            รายการผู้โชคดี ({winners.length}/10)
          </h3>
        </div>
        {onClearAll && winners.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium border border-red-400/30"
          >
            <Trash2 className="w-4 h-4" />
            ล้างทั้งหมด
          </button>
        )}
      </div>

      {/* Winners List */}
      <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
        {winners.map((winner, index) => (
          <div
            key={winner.id}
            className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
          >
            {/* Prize Rank */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center font-bold text-base
              ${index < 3
                ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-500/30'
                : 'bg-white/10 text-white/70'
              }
            `}>
              {index < 3 ? (
                <Medal className="w-6 h-6" />
              ) : (
                winner.prizeNumber
              )}
            </div>

            {/* Employee Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-white font-mono tracking-wider">
                  {winner.id}
                </span>
              </div>
              {winner.name && (
                <div className="flex items-center gap-2 text-blue-200">
                  <User className="w-3 h-3" />
                  <span className="text-sm">{winner.name}</span>
                </div>
              )}
              {winner.department && (
                <div className="flex items-center gap-2 text-blue-300">
                  <Building2 className="w-3 h-3" />
                  <span className="text-xs">{winner.department}</span>
                </div>
              )}
              <p className="text-xs text-white/40 mt-1">
                {winner.createdAtDisplay}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(winner.id)}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${copiedId === winner.id
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                  }
                `}
              >
                {copiedId === winner.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">คัดลอก</span>
                  </>
                )}
              </button>

              {onDelete && (
                <button
                  onClick={() => onDelete(winner.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-400/30"
                  title="ลบรายการ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
