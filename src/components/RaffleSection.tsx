/**
 * RaffleSection Component - ส่วนหลักของการจับรางวัล
 */

'use client';

import { useState, useCallback } from 'react';
import { Sparkles, RotateCcw, Trophy } from 'lucide-react';
import { AnimatedIdDisplay } from './AnimatedIdDisplay';
import type { EmployeeId, PrizeStatus as PrizeStatusType } from '@/types';

interface RaffleSectionProps {
  latestWinner: EmployeeId | null;
  prizeStatus: PrizeStatusType;
  isGenerating: boolean;
  onGenerate: () => void;
  onReset: () => void;
}

export function RaffleSection({
  latestWinner,
  prizeStatus,
  isGenerating,
  onGenerate,
  onReset,
}: RaffleSectionProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const handleAnimationComplete = useCallback(() => {
    if (prizeStatus.totalRemaining === 0) {
      setShowCompleted(true);
    }
  }, [prizeStatus.totalRemaining]);

  const isComplete = prizeStatus.totalRemaining === 0;

  return (
    <section className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-6 md:p-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/30 mb-4">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          จับรางวัลพนักงาน
        </h2>
        <p className="text-blue-200 text-lg">
          สุ่มรหัสพนักงาน 7 หลัก จำนวน 10 รางวัล
        </p>
      </div>

      {/* Latest Winner Display */}
      {(latestWinner || isGenerating) && (
        <div className="mb-8 animate-fade-in">
          <AnimatedIdDisplay
            employeeId={latestWinner?.id || '0000000'}
            prizeNumber={latestWinner?.prizeNumber || (prizeStatus.winners.length + 1)}
            name={latestWinner?.name || ''}
            department={latestWinner?.department || ''}
            isAnimating={isGenerating}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {!isComplete ? (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`
              flex items-center justify-center gap-3 px-10 py-5 rounded-xl font-bold text-xl
              transition-all duration-300 transform
              ${isGenerating
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/30 active:scale-95'
              }
            `}
          >
            <Sparkles className={`w-7 h-7 ${isGenerating ? 'animate-pulse' : ''}`} />
            {isGenerating ? 'กำลังสุ่ม...' : `สุ่มรางวัลที่ ${prizeStatus.winners.length + 1}`}
            <Sparkles className="w-6 h-6" />
          </button>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-green-500/20 text-green-300 rounded-xl font-bold text-xl border border-green-500/30">
              <Trophy className="w-7 h-7" />
              จับรางวัลครบแล้ว!
            </div>
          </div>
        )}

        {prizeStatus.winners.length > 0 && (
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-8 py-5 rounded-xl font-medium text-white/80 hover:bg-white/10 transition-colors border border-white/20"
          >
            <RotateCcw className="w-5 h-5" />
            เริ่มใหม่
          </button>
        )}
      </div>

      {/* Completion Message */}
      {showCompleted && isComplete && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl text-center animate-fade-in">
          <Trophy className="w-12 h-12 mx-auto text-green-400 mb-3" />
          <p className="text-green-300 font-medium text-xl">
            ยินดีด้วย! การจับรางวัลเสร็จสมบูรณ์แล้ว
          </p>
          <p className="text-green-400/70 text-base mt-2">
            สามารถดาวน์โหลดรายชื่อผู้โชคดีได้จากปุ่มด้านล่าง
          </p>
        </div>
      )}
    </section>
  );
}
