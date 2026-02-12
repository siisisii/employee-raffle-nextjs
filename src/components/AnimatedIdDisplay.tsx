/**
 * AnimatedIdDisplay Component - แสดงรหัสพนักงานพร้อม animation สุ่มทีละหลัก
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DigitBox } from './DigitBox';
import type { EmployeeId } from '@/types';
import { useAudio } from '@/hooks/useAudio';

interface AnimatedIdDisplayProps {
  /** รหัสพนักงาน 7 หลัก */
  employeeId: string;
  /** กำลังสุ่มอยู่หรือไม่ */
  isAnimating: boolean;
  /** ลำดับรางวัล */
  prizeNumber: number;
  /** ชื่อพนักงาน */
  name: string;
  /** แผนก */
  department: string;
  /** Callback เมื่อ animation เสร็จสิ้น */
  onAnimationComplete?: () => void;
}

export function AnimatedIdDisplay({
  employeeId,
  isAnimating,
  prizeNumber,
  name,
  department,
  onAnimationComplete,
}: AnimatedIdDisplayProps) {
  const digits = employeeId.split('').map(Number);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWinnerInfo, setShowWinnerInfo] = useState(false);
  const { playWinSound } = useAudio();

  useEffect(() => {
    if (isAnimating) {
      setShowConfetti(false);
      setShowWinnerInfo(false);
    } else {
      // แสดง confetti เมื่อ animation เสร็จ
      const timeout = setTimeout(() => {
        setShowConfetti(true);
        setShowWinnerInfo(true);
        playWinSound();
        onAnimationComplete?.();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isAnimating, onAnimationComplete, playWinSound]);

  return (
    <div className="relative">
      {/* Prize Number Badge */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
        <span className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold rounded-full shadow-lg text-lg">
          รางวัลที่ {prizeNumber}
        </span>
      </div>

      {/* Main Display Card */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 border-4 shadow-2xl">
        {/* Digit Boxes */}
        <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-8">
          {digits.map((digit, index) => (
            <DigitBox
              key={index}
              digit={digit}
              index={index}
              isAnimating={isAnimating}
              color="gold"
            />
          ))}
        </div>

        {/* Winner Info - Show after animation */}
        {showWinnerInfo && !isAnimating && (
          <div className="text-center animate-fade-in">
            <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border-2 border-white/50">
              <p className="text-gray-500 text-sm mb-1">รหัสพนักงาน</p>
              <p className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 font-mono tracking-wider">
                {employeeId}
              </p>
              <div className="border-t border-gray-200 my-3"></div>
              <p className="text-gray-500 text-sm mb-1">ชื่อ - นามสกุล</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {name || 'ไม่พบข้อมูล'}
              </p>
              <div className="border-t border-gray-200 my-3"></div>
              <p className="text-gray-500 text-sm mb-1">แผนก</p>
              <p className="text-xl md:text-2xl font-semibold text-gray-700">
                {department || 'ไม่ระบุ'}
              </p>
            </div>
          </div>
        )}

        {/* Confetti Effect */}
        {showConfetti && !isAnimating && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF9F43'][Math.floor(Math.random() * 6)],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
