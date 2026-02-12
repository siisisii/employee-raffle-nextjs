/**
 * ImportPanel Component - Slide-out panel สำหรับนำเข้าข้อมูลพนักงาน
 */

'use client';

import { useCallback, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { ImportSection } from './ImportSection';
import { EmployeeList } from './EmployeeList';
import { SharedStoragePanel } from './SharedStoragePanel';
import { useRaffleData } from '@/hooks/useRaffleData';
import type { EmployeeData, PrizeStatus } from '@/types';

interface ImportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportPanel({ isOpen, onClose }: ImportPanelProps) {
  const { data: syncData, updateData, isLoading } = useRaffleData();
  const employeePool: EmployeeData[] = (syncData?.employeePool as EmployeeData[]) || [];

  // ฟังก์ชันนำเข้ารายชื่อพนักงาน
  const handleImportEmployees = useCallback(async (employees: EmployeeData[]) => {
    await updateData({ employeePool: employees });
  }, [updateData]);

  // ฟังก์ชันนำเข้าข้อมูลจาก Shared Storage (พร้อม prizeStatus)
  const handleImportFromShared = useCallback(async (employees: EmployeeData[], prizeStatus?: PrizeStatus) => {
    if (prizeStatus) {
      await updateData({ employeePool: employees, prizeStatus });
    } else {
      await updateData({ employeePool: employees });
    }
  }, [updateData]);

  // ปิด panel เมื่อกด ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // ป้องกันการ scroll เมื่อ panel เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-2xl z-50
          bg-gradient-to-b from-slate-900 to-slate-800
          shadow-2xl border-l border-white/10
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">จัดการข้อมูลพนักงาน</h2>
            {employeePool.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-sm text-white/80">
                <Users className="w-4 h-4" />
                <span>{employeePool.length.toLocaleString('th-TH')} คน</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="ปิด"
          >
            <X className="w-6 h-6 text-white/80" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <span>กำลังโหลด...</span>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Shared Storage Panel - Export/Import JSON */}
              <SharedStoragePanel
                employeePool={employeePool}
                prizeStatus={syncData?.prizeStatus}
                onImport={handleImportFromShared}
              />

              {/* Import Section */}
              <section className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <ImportSection
                  onImport={handleImportEmployees}
                  employeeCount={employeePool.length}
                />
              </section>

              {/* Employee List */}
              {employeePool.length > 0 && (
                <section className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                  <EmployeeList employees={employeePool} />
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </>
  );
}
