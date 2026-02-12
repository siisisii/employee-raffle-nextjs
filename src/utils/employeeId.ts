/**
 * Utility functions for Employee ID Raffle
 */

import type { EmployeeId, PrizeStatus, EmployeeData } from '@/types';

/**
 * สถานะรางวัลเริ่มต้น
 */
export const INITIAL_PRIZE_STATUS: PrizeStatus = {
  totalRemaining: 10,
  winners: [],
};

/**
 * สร้างรหัสพนักงานสุ่ม 7 หลัก ทีละหลัก
 * @returns รหัสพนักงาน 7 หลักในรูปแบบ string
 */
export function generateRandomEmployeeId(): string {
  // สร้างตัวเลขสุ่มระหว่าง 1000000 - 9999999
  const min = 1000000;
  const max = 9999999;
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNum.toString();
}

/**
 * สร้าง array ของตัวเลขสำหรับ animation (สุ่มแต่ละหลัก)
 * @returns array ของตัวเลข 7 หลัก
 */
export function generateRandomDigits(): number[] {
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
}

/**
 * ตรวจสอบว่ารหัสพนักงานซ้ำหรือไม่
 * @param existingIds รายการรหัสพนักงานที่มีอยู่
 * @param newId รหัสพนักงานใหม่ที่ต้องการตรวจสอบ
 * @returns true ถ้ารหัสซ้ำ, false ถ้าไม่ซ้ำ
 */
export function checkDuplicate(existingIds: EmployeeId[], newId: string): boolean {
  return existingIds.some(emp => emp.id === newId);
}


/**
 * สร้าง EmployeeId object พร้อมข้อมูลวันที่
 * @param id รหัสพนักงาน
 * @param name ชื่อพนักงาน
 * @param department แผนก
 * @param prizeNumber ลำดับรางวัล
 * @returns EmployeeId object
 */
export function createEmployeeId(
  id: string,
  name: string,
  department: string,
  prizeNumber: number
): EmployeeId {
  const now = new Date();

  // ฟอร์แมตวันที่แบบไทย
  const thaiDate = now.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return {
    id,
    name,
    department,
    createdAt: now.toISOString(),
    createdAtDisplay: thaiDate,
    prizeNumber,
  };
}

/**
 * สร้างรหัสพนักงานที่ไม่ซ้ำกับที่มีอยู่
 * @param existingIds รายการรหัสพนักงานที่มีอยู่
 * @param employeePool รายชื่อพนักงานทั้งหมด
 * @param prizeNumber ลำดับรางวัล
 * @returns EmployeeId object ที่ไม่ซ้ำ หรือ null ถ้าไม่พบ
 */
export function generateUniqueEmployeeId(
  existingIds: EmployeeId[],
  employeePool: EmployeeData[],
  prizeNumber: number
): EmployeeId | null {
  // กรองรายชื่อที่ยังไม่ถูกสุ่ม
  const availableEmployees = employeePool.filter(emp =>
    !existingIds.some(winner => winner.id === emp.id)
  );

  if (availableEmployees.length === 0) {
    return null;
  }

  // สุ่มจากรายชื่อที่เหลือ
  const randomIndex = Math.floor(Math.random() * availableEmployees.length);
  const selectedEmployee = availableEmployees[randomIndex];

  return createEmployeeId(
    selectedEmployee.id,
    selectedEmployee.name,
    selectedEmployee.department,
    prizeNumber
  );
}

/**
 * อัปเดตสถานะรางวัลหลังจากสุ่ม
 * @param status สถานะรางวัลปัจจุบัน
 * @param winner ผู้โชคดีที่ได้รับรางวัล
 * @returns สถานะรางวัลที่อัปเดตแล้ว
 */
export function updatePrizeStatus(status: PrizeStatus, winner: EmployeeId): PrizeStatus {
  const newStatus = { ...status };

  newStatus.totalRemaining = Math.max(0, newStatus.totalRemaining - 1);
  newStatus.winners = [...newStatus.winners, winner];

  return newStatus;
}

/**
 * รีเซ็ตสถานะรางวัล
 * @returns สถานะรางวัลเริ่มต้น
 */
export function resetPrizeStatus(): PrizeStatus {
  return { ...INITIAL_PRIZE_STATUS };
}

/**
 * แปลงข้อมูล EmployeeId เป็น CSV format
 * @param employeeIds รายการ EmployeeId
 * @returns CSV string
 */
export function exportToCSV(employeeIds: EmployeeId[]): string {
  const headers = ['ลำดับ', 'รหัสพนักงาน', 'ชื่อ', 'แผนก', 'วันที่สร้าง'];
  const rows = employeeIds.map(emp => [
    emp.prizeNumber.toString(),
    emp.id,
    emp.name,
    emp.department,
    emp.createdAtDisplay,
  ]);

  // Add BOM for Excel to recognize Thai characters
  const BOM = '\uFEFF';
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return BOM + csvContent;
}

/**
 * แปลงข้อมูล EmployeeId เป็น JSON format
 * @param employeeIds รายการ EmployeeId
 * @returns JSON string
 */
export function exportToJSON(employeeIds: EmployeeId[]): string {
  return JSON.stringify(employeeIds, null, 2);
}

/**
 * ดาวน์โหลดไฟล์
 * @param content เนื้อหาไฟล์
 * @param filename ชื่อไฟล์
 * @param mimeType MIME type ของไฟล์
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV/TXT data to EmployeeData array
 * @param content เนื้อหาไฟล์
 * @returns EmployeeData array
 */
export function parseEmployeeData(content: string): EmployeeData[] {
  const lines = content.trim().split('\n');
  const employees: EmployeeData[] = [];
  
  // Skip header if exists - check for common header patterns
  const firstLine = lines[0].toLowerCase();
  const startIndex = firstLine.includes('id') ||
                     firstLine.includes('รหัส') ||
                     firstLine.includes('employee') ||
                     firstLine.includes('name') ||
                     firstLine.includes('ชื่อ') ||
                     firstLine.includes('department') ||
                     firstLine.includes('แผนก') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Try comma separator first, then tab
    let parts: string[];
    if (line.includes(',')) {
      parts = line.split(',').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else {
      // Space separated
      parts = line.split(/\s+/).map(p => p.trim());
    }
    
    if (parts.length >= 2) {
      const id = parts[0];
      const name = parts[1] || '';
      // Support both "department" and "org_department" column names
      const department = parts[2] || parts[3] || '';
      
      if (id && name) {
        employees.push({ id, name, department });
      }
    }
  }
  
  return employees;
}
