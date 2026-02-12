/**
 * DigitBox Component - แสดงตัวเลขแต่ละหลักพร้อม animation สุ่มแบบหมุน (Slot Machine Style)
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAudio } from '@/hooks/useAudio';

interface DigitBoxProps {
  /** ตัวเลขที่จะแสดง (0-9) */
  digit: number;
  /** กำลังสุ่มอยู่หรือไม่ */
  isAnimating: boolean;
  /** ความเร็วในการเปลี่ยนตัวเลข (ms) */
  speed?: number;
  /** ลำดับของหลัก (0-6) ใช้สำหรับ delay */
  index: number;
  /** สีของกล่อง */
  color?: 'blue' | 'gold' | 'purple';
  /** เรียกเมื่อมีการเปลี่ยนตัวเลข (สำหรับเล่นเสียง) */
  onDigitChange?: () => void;
}

export function DigitBox({
  digit,
  isAnimating,
  speed = 80,
  index,
  color = 'blue',
  onDigitChange,
}: DigitBoxProps) {
  const [displayDigit, setDisplayDigit] = useState(digit);
  const [isRolling, setIsRolling] = useState(false);
  const [offset, setOffset] = useState(0);
  const { playSpinSound } = useAudio();
  const lastSoundTime = useRef(0);

  const playSound = useCallback(() => {
    const now = Date.now();
    // Play sound every 100ms at most
    if (now - lastSoundTime.current > 100) {
      playSpinSound();
      lastSoundTime.current = now;
    }
  }, [playSpinSound]);

  useEffect(() => {
    if (!isAnimating) {
      setDisplayDigit(digit);
      setIsRolling(false);
      setOffset(0);
      return;
    }

    // เริ่ม animation หลังจาก delay ตามลำดับหลัก (จากด้านหลังไปด้านหน้า)
    const startDelay = (6 - index) * 200;
    let intervalId: ReturnType<typeof setInterval>;
    let frameId: number;

    const startTimeout = setTimeout(() => {
      setIsRolling(true);
      
      // อัพเดทตัวเลขแบบสุ่ม
      intervalId = setInterval(() => {
        setDisplayDigit(Math.floor(Math.random() * 10));
        playSound();
        onDigitChange?.();
      }, speed);

      // อนิเมชั่นการเคลื่อนไหวแบบต่อเนื่อง
      let startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        // สร้างการเคลื่อนไหงแบบ sine wave ที่เร็วขึ้นเรื่อยๆ
        const wave = Math.sin(elapsed * 0.02) * 8 * (1 + elapsed * 0.001);
        setOffset(wave);
        frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);

    }, startDelay);

    // หยุด animation และแสดงตัวเลขจริง
    const stopTimeout = setTimeout(() => {
      clearInterval(intervalId);
      cancelAnimationFrame(frameId);
      setIsRolling(false);
      setOffset(0);
      setDisplayDigit(digit);
    }, startDelay + 1500);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(stopTimeout);
      clearInterval(intervalId);
      cancelAnimationFrame(frameId);
    };
  }, [isAnimating, digit, index, speed, playSound, onDigitChange]);

  const colorClasses = {
    blue: 'bg-gradient-to-b from-blue-500 to-blue-700 border-blue-400',
    gold: 'bg-gradient-to-b from-amber-400 to-amber-600 border-amber-300',
    purple: 'bg-gradient-to-b from-purple-500 to-purple-700 border-purple-400',
  };

  return (
    <div
      className={`
        relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 lg:w-28 lg:h-36
        rounded-xl shadow-2xl overflow-hidden
        ${colorClasses[color]}
        border-2 sm:border-4
        transform transition-all duration-300
        ${isAnimating ? 'scale-105 sm:scale-110 shadow-2xl' : 'scale-100'}
      `}
    >
      {/* Container สำหรับตัวเลขแบบหมุน */}
      <div className="relative w-full h-full overflow-hidden">
        {/* ตัวเลขหลัก */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-transform duration-75
          `}
          style={{
            transform: `translateY(${offset}px)`,
          }}
        >
          <span
            className={`
              text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white font-mono
              transition-all duration-75
              ${isRolling ? 'blur-[1px] scale-105 sm:scale-110' : 'blur-0 scale-100'}
            `}
            style={{
              textShadow: isRolling 
                ? '0 0 30px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.5), 0 0 90px rgba(255,255,255,0.3)' 
                : '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            {displayDigit}
          </span>
        </div>

        {/* ตัวเลข ghost ด้านบน */}
        {isRolling && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `translateY(${offset - 96}px)` }}
          >
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white/40 font-mono blur-[2px]">
              {(displayDigit + 1) % 10}
            </span>
          </div>
        )}

        {/* ตัวเลข ghost ด้านล่าง */}
        {isRolling && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `translateY(${offset + 96}px)` }}
          >
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white/40 font-mono blur-[2px]">
              {(displayDigit + 9) % 10}
            </span>
          </div>
        )}
      </div>

      {/* Glow effect when animating */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse pointer-events-none" />
      )}

      {/* Motion blur lines */}
      {isRolling && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
          {/* แถบเส้นสำหรับ effect ความเร็ว */}
          <div className="absolute top-1/4 left-0 right-0 h-px bg-white/30 pointer-events-none" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-white/30 pointer-events-none" />
        </>
      )}

      {/* Shine effect */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl pointer-events-none" />
      
      {/* ขอบแสงตอนหมุน */}
      {isRolling && (
        <div className="absolute inset-0 rounded-xl ring-4 ring-white/50 animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
