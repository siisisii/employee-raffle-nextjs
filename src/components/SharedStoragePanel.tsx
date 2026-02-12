/**
 * SharedStoragePanel Component - ปุ่ม Export/Import ข้อมูลผ่านไฟล์ JSON
 * ใช้แทน QR Code ที่ถูกลบออกไป
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Download, Upload, FileJson, Check, AlertCircle } from 'lucide-react';
import { exportRaffleData, importRaffleData } from '@/utils/sharedStorage';
import type { EmployeeData, PrizeStatus } from '@/types';

interface SharedStoragePanelProps {
  employeePool: EmployeeData[];
  prizeStatus: PrizeStatus;
  onImport: (employees: EmployeeData[], prizeStatus?: PrizeStatus) => void;
}

export function SharedStoragePanel({ employeePool, prizeStatus, onImport }: SharedStoragePanelProps) {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export ข้อมูลทั้งหมด
  const handleExport = useCallback(() => {
    const data = {
      employeePool,
      prizeStatus,
      lastUpdated: Date.now()
    };
    exportRaffleData(data);
  }, [employeePool, prizeStatus]);

  // คลิกเลือกไฟล์
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Import ข้อมูลจากไฟล์
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importRaffleData(file);
      onImport(data.employeePool, data.prizeStatus);
      setImportStatus('success');
      setImportMessage(`นำเข้าสำเร็จ: ${data.employeePool.length} คน`);
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (error) {
      setImportStatus('error');
      setImportMessage(error instanceof Error ? error.message : 'นำเข้าไฟล์ล้มเหลว');
      setTimeout(() => setImportStatus('idle'), 5000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImport]);

  const hasData = employeePool.length > 0;

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FileJson className="w-5 h-5 text-amber-400" />
        สำรอง/นำเข้าข้อมูล
      </h3>

      <div className="flex flex-wrap gap-3 mb-4">
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={!hasData}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
            ${hasData 
              ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30' 
              : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
            }
          `}
          title={hasData ? 'Export ข้อมูลทั้งหมดเป็นไฟล์ JSON' : 'ยังไม่มีข้อมูลให้ Export'}
        >
          <Download className="w-4 h-4" />
          <span>Export ข้อมูล</span>
        </button>

        {/* Import Button */}
        <button
          onClick={handleImportClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
            bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
          title="Import ข้อมูลจากไฟล์ JSON"
        >
          <Upload className="w-4 h-4" />
          <span>Import ข้อมูล</span>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Status Message */}
      {importStatus !== 'idle' && (
        <div className={`
          flex items-center gap-2 p-3 rounded-xl text-sm
          ${importStatus === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-300' 
            : 'bg-red-500/10 border border-red-500/20 text-red-300'
          }
        `}>
          {importStatus === 'success' ? (
            <Check className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{importMessage}</span>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-blue-200 text-sm">
          <strong className="text-blue-300">💡 วิธีใช้งาน:</strong><br />
          • <strong>Export:</strong> บันทึกข้อมูลทั้งหมด (รายชื่อ + สถานะรางวัล) เป็นไฟล์ JSON<br />
          • <strong>Import:</strong> โหลดข้อมูลจากไฟล์ JSON ที่เคย Export ไว้
        </p>
      </div>
    </div>
  );
}
