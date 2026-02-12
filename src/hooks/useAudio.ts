/**
 * Custom hook for playing audio
 */

import { useRef, useCallback } from 'react';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSpinSound = useCallback(() => {
    // Create oscillator for spin sound effect
    if (typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a clicking/ticking sound
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, []);

  const playWinSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Play a victory chord
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C major chord
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.05);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.05);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + index * 0.05 + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.05 + 1.5);
        
        oscillator.start(audioContext.currentTime + index * 0.05);
        oscillator.stop(audioContext.currentTime + index * 0.05 + 1.5);
      });
    } catch (error) {
      console.error('Error playing win sound:', error);
    }
  }, []);

  return { playSpinSound, playWinSound };
}
