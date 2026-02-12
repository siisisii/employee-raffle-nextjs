/**
 * Type definitions for Employee ID Raffle
 */

export interface EmployeeData {
  /** รหัสพนักงาน */
  id: string;
  /** ชื่อพนักงาน */
  name: string;
  /** แผนก */
  department: string;
}

export interface EmployeeId {
  /** รหัสพนักงาน 7 หลัก */
  id: string;
  /** ชื่อพนักงาน */
  name: string;
  /** แผนก */
  department: string;
  /** วันที่สร้าง (ISO string) */
  createdAt: string;
  /** วันที่สร้างแบบแสดงผล (ไทย) */
  createdAtDisplay: string;
  /** ลำดับรางวัล */
  prizeNumber: number;
}

export interface PrizeStatus {
  /** จำนวนรางวัลทั้งหมดที่เหลือ */
  totalRemaining: number;
  /** รายการรางวัลที่ออกแล้ว */
  winners: EmployeeId[];
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
