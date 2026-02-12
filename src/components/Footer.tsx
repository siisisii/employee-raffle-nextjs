/**
 * Footer Component - แสดงสถิติการจับรางวัลและข้อมูลเพิ่มเติม
 */

'use client';

import { Trophy, Download } from 'lucide-react';
import type { EmployeeId } from '@/types';
import { exportToCSV, exportToJSON, downloadFile } from '@/utils/employeeId';

interface FooterProps {
  employeeIds: EmployeeId[];
}

export function Footer({ employeeIds }: FooterProps) {
  const handleExportCSV = () => {
    const csv = exportToCSV(employeeIds);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(csv, `raffle-winners-${timestamp}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportJSON = () => {
    const json = exportToJSON(employeeIds);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadFile(json, `raffle-winners-${timestamp}.json`, 'application/json');
  };

  return (
    <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {employeeIds.length > 0 && (
          <div className="mb-6">
            {/* Export Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-green-600/30"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลด CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-blue-600/30"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลด JSON
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {/* สถิติรวม */}
          <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/10">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-blue-200">รางวัลทั้งหมด</p>
              <p className="text-xl font-bold text-white">{employeeIds.length}/10</p>
            </div>
          </div>

          {/* สถานะ */}
          <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl border border-white/10">
            <div className={`
              p-2 rounded-lg
              ${employeeIds.length === 10 ? 'bg-green-500/20' : 'bg-purple-500/20'}
            `}>
              <Trophy className={`
                w-5 h-5
                ${employeeIds.length === 10 ? 'text-green-400' : 'text-purple-400'}
              `} />
            </div>
            <div>
              <p className="text-sm text-blue-200">สถานะ</p>
              <p className={`
                text-sm font-bold
                ${employeeIds.length === 10 ? 'text-green-400' : 'text-purple-400'}
              `}>
                {employeeIds.length === 10 ? 'เสร็จสิ้น' : 'กำลังดำเนินการ'}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-blue-300">
            Employee ID Raffle • ระบบจับรางวัลพนักงาน
          </p>
        </div>
      </div>
    </footer>
  );
}
