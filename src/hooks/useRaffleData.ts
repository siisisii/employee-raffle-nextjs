import useSWR from 'swr';
import { useCallback } from 'react';
import type { EmployeeData, PrizeStatus } from '@/types';
import { INITIAL_PRIZE_STATUS } from '@/utils/employeeId';

interface RaffleData {
  employeePool: EmployeeData[];
  prizeStatus: PrizeStatus;
  lastUpdated: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRaffleData() {
  const { data, error, mutate, isLoading } = useSWR<RaffleData>('/api/sync', fetcher, {
    refreshInterval: 2000, // Poll every 2 seconds
    fallbackData: {
      employeePool: [],
      prizeStatus: INITIAL_PRIZE_STATUS,
      lastUpdated: Date.now(),
    },
  });

  const updateData = useCallback(async (newData: Partial<RaffleData>) => {
    try {
      // Optimistic update
      await mutate(async (currentData) => {
        const updated = { 
            ...currentData, 
            ...newData, 
            // 如果 currentData 是 undefined，使用缺省值
            employeePool: currentData?.employeePool || [],
            prizeStatus: currentData?.prizeStatus || INITIAL_PRIZE_STATUS,
            lastUpdated: Date.now() 
        } as RaffleData;
        
        // Send actual update to server
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newData),
        });
        
        return updated;
      }, { revalidate: false });
      
      // Trigger revalidation to ensure server sync
      mutate();
    } catch (err) {
      console.error("Failed to update data:", err);
      // Revert or handle error
      mutate(); 
    }
  }, [mutate]);

  return {
    data: data || { employeePool: [], prizeStatus: INITIAL_PRIZE_STATUS, lastUpdated: 0 },
    updateData,
    isLoading: isLoading && !data,
    error,
    isUsingLocalStorage: false, // Legacy flag, keeping for compatibility
  };
}
