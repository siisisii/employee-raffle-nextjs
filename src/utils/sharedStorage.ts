/**
 * Shared Storage Utility - สำหรับ Export/Import ข้อมูลผ่านไฟล์ JSON
 * ใช้แทน QR Code ที่ถูกลบออกไป
 */

import type { EmployeeData, PrizeStatus } from '@/types';

interface RaffleData {
  employeePool: EmployeeData[];
  prizeStatus: PrizeStatus;
  lastUpdated: number;
}

/**
 * Export ข้อมูลทั้งหมดเป็นไฟล์ JSON
 */
export function exportRaffleData(data: RaffleData): void {
  const exportData = {
    ...data,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `raffle-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Import ข้อมูลจากไฟล์ JSON
 */
export function importRaffleData(file: File): Promise<RaffleData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        // Validate data structure
        if (!parsed.employeePool || !Array.isArray(parsed.employeePool)) {
          throw new Error('Invalid data format: employeePool is missing or invalid');
        }
        
        if (!parsed.prizeStatus) {
          throw new Error('Invalid data format: prizeStatus is missing');
        }
        
        const data: RaffleData = {
          employeePool: parsed.employeePool,
          prizeStatus: parsed.prizeStatus,
          lastUpdated: parsed.lastUpdated || Date.now()
        };
        
        resolve(data);
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to parse file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Export เฉพาะรายชื่อพนักงาน (สำหรับ backup รายชื่ออย่างเดียว)
 */
export function exportEmployeeList(employees: EmployeeData[]): void {
  const exportData = {
    employees,
    exportedAt: new Date().toISOString(),
    count: employees.length
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `employee-list-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
