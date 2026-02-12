/**
 * useFirebaseSync Hook - สำหรับ sync ข้อมูลแบบ real-time ผ่าน Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import type { EmployeeData, EmployeeId, PrizeStatus } from '@/types';

interface SyncData {
  employeePool: EmployeeData[];
  prizeStatus: PrizeStatus;
  lastUpdated: number;
}

const RAFFLE_DATA_KEY = 'raffleData';

export function useFirebaseSync<T>(key: string, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // โหลดข้อมูลจาก Firebase real-time
  useEffect(() => {
    const dataRef = ref(database, `${RAFFLE_DATA_KEY}/${key}`);
    
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const value = snapshot.val();
        if (value !== null) {
          setData(value as T);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Firebase sync error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [key]);

  // บันทึกข้อมูลไปยัง Firebase
  const updateData = useCallback(async (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function 
        ? newValue(data) 
        : newValue;
      
      const dataRef = ref(database, `${RAFFLE_DATA_KEY}/${key}`);
      await set(dataRef, valueToStore);
      // ไม่ต้อง setData ที่นี่ เพราะ onValue จะอัปเดตให้อัตโนมัติ
    } catch (err) {
      console.error('Failed to update Firebase:', err);
      throw err;
    }
  }, [key, data]);

  return { data, setData: updateData, isLoading, error };
}

// Hook สำหรับ sync ข้อมูลทั้งหมด
export function useRaffleSync() {
  const [data, setData] = useState<SyncData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const dataRef = ref(database, RAFFLE_DATA_KEY);
    
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        const value = snapshot.val();
        if (value) {
          setData(value as SyncData);
        } else {
          // ถ้ายังไม่มีข้อมูล ให้สร้าง initial data
          setData({
            employeePool: [],
            prizeStatus: {
              totalRemaining: 10,
              winners: []
            },
            lastUpdated: Date.now()
          });
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Firebase sync error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateData = useCallback(async (newData: Partial<SyncData>) => {
    try {
      const dataRef = ref(database, RAFFLE_DATA_KEY);
      const currentSnapshot = await get(dataRef);
      const currentData = currentSnapshot.val() as SyncData || {
        employeePool: [],
        prizeStatus: { totalRemaining: 10, winners: [] },
        lastUpdated: Date.now()
      };
      
      await set(dataRef, {
        ...currentData,
        ...newData,
        lastUpdated: Date.now()
      });
    } catch (err) {
      console.error('Failed to update Firebase:', err);
      throw err;
    }
  }, []);

  return { data, updateData, isLoading, error };
}
