/**
 * useRaffleData Hook - ผสมผสาน Firebase + localStorage
 * ใช้ Firebase เป็นหลัก แต่ fallback ไป localStorage เมื่อ Firebase ไม่พร้อมใช้งาน
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, get, off } from 'firebase/database';
import type { EmployeeData, EmployeeId, PrizeStatus } from '@/types';
import { INITIAL_PRIZE_STATUS } from '@/utils/employeeId';

interface RaffleData {
  employeePool: EmployeeData[];
  prizeStatus: PrizeStatus;
  lastUpdated: number;
}

const RAFFLE_DATA_KEY = 'raffleData';
const LOCAL_STORAGE_KEY = 'raffleFallbackData';

// ตรวจสอบว่าเป็น demo config หรือไม่
const isDemoConfig = () => {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-api-key' ||
         !process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
};

// บันทึกลง localStorage
const saveToLocalStorage = (data: RaffleData) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

// โหลดจาก localStorage
const loadFromLocalStorage = (): RaffleData | null => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as RaffleData;
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return null;
};

export function useRaffleData() {
  const [data, setDataState] = useState<RaffleData>({
    employeePool: [],
    prizeStatus: INITIAL_PRIZE_STATUS,
    lastUpdated: Date.now(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // ถ้าเป็น demo config ให้ใช้ localStorage ทันที
      if (isDemoConfig()) {
        const localData = loadFromLocalStorage();
        if (localData) {
          setDataState(localData);
        }
        setIsUsingLocalStorage(true);
        setIsLoading(false);
        return;
      }

      // พยายามโหลดจาก Firebase
      try {
        const dataRef = ref(database, RAFFLE_DATA_KEY);
        
        // ใช้ get ก่อนเพื่อโหลดข้อมูลครั้งแรก
        const snapshot = await get(dataRef);
        const firebaseData = snapshot.val() as RaffleData | null;
        
        if (firebaseData) {
          setDataState(firebaseData);
          // ซิงค์ไป localStorage ด้วย
          saveToLocalStorage(firebaseData);
        } else {
          // ถ้าไม่มีข้อมูลใน Firebase ให้ลองโหลดจาก localStorage
          const localData = loadFromLocalStorage();
          if (localData) {
            setDataState(localData);
            // อัปโหลดขึ้น Firebase
            await set(dataRef, localData);
          }
        }

        // ตั้งค่า real-time listener
        const unsubscribe = onValue(
          dataRef,
          (snapshot) => {
            const value = snapshot.val() as RaffleData | null;
            if (value) {
              setDataState(value);
              // ซิงค์ไป localStorage ด้วย
              saveToLocalStorage(value);
            }
          },
          (err) => {
            console.warn('Firebase listener error, falling back to localStorage:', err);
            setIsUsingLocalStorage(true);
            const localData = loadFromLocalStorage();
            if (localData) {
              setDataState(localData);
            }
          }
        );

        unsubscribeRef.current = () => off(dataRef, 'value', unsubscribe);
      } catch (err) {
        console.warn('Firebase connection failed, using localStorage:', err);
        setIsUsingLocalStorage(true);
        const localData = loadFromLocalStorage();
        if (localData) {
          setDataState(localData);
        }
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // อัปเดตข้อมูล
  const updateData = useCallback(async (newData: Partial<RaffleData>) => {
    const updatedData = {
      ...data,
      ...newData,
      lastUpdated: Date.now(),
    };

    // อัปเดต state ทันที (optimistic update)
    setDataState(updatedData);

    // บันทึกลง localStorage เสมอ
    saveToLocalStorage(updatedData);

    // ถ้าไม่ใช่ demo config และ Firebase พร้อมใช้งาน ให้บันทึกลง Firebase
    if (!isDemoConfig() && !isUsingLocalStorage) {
      try {
        const dataRef = ref(database, RAFFLE_DATA_KEY);
        await set(dataRef, updatedData);
      } catch (err) {
        console.warn('Failed to update Firebase, using localStorage only:', err);
        setIsUsingLocalStorage(true);
      }
    }
  }, [data, isUsingLocalStorage]);

  return { 
    data, 
    updateData, 
    isLoading, 
    error,
    isUsingLocalStorage 
  };
}
