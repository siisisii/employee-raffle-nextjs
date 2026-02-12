/**
 * ImportSection Component - นำเข้ารายชื่อพนักงานจากไฟล์
 */

'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, FileText, Users, Check, AlertCircle, Loader2 } from 'lucide-react';
import type { EmployeeData } from '@/types';
import { parseEmployeeData } from '@/utils/employeeId';
import * as XLSX from 'xlsx';

interface ImportSectionProps {
  onImport: (employees: EmployeeData[]) => void;
  employeeCount: number;
}

export function ImportSection({ onImport, employeeCount }: ImportSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      let employees: EmployeeData[] = [];

      if (extension === 'csv' || extension === 'txt') {
        const content = await file.text();
        employees = parseEmployeeData(content);
      } else if (extension === 'xlsx' || extension === 'xls') {
        // Use ArrayBuffer for proper Excel binary handling
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Use header: 1 to get raw data, then map to EmployeeData
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as (string | number)[][];
        
        // Find column indices
        const headers = data[0]?.map(h => String(h).toLowerCase().trim()) || [];
        const idIndex = headers.findIndex(h =>
          h.includes('id') || h.includes('employee') || h.includes('รหัส')
        );
        const nameIndex = headers.findIndex(h =>
          h.includes('name') || h.includes('ชื่อ')
        );
        const deptIndex = headers.findIndex(h =>
          h.includes('department') || h.includes('org_department') || h.includes('แผนก')
        );
        
        // Default to column 0, 1, 2 if headers not found
        const idCol = idIndex >= 0 ? idIndex : 0;
        const nameCol = nameIndex >= 0 ? nameIndex : 1;
        const deptCol = deptIndex >= 0 ? deptIndex : 2;
        
        // Process data rows (skip header)
        const startRow = headers.length > 0 ? 1 : 0;
        
        for (let i = startRow; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;
          
          const id = String(row[idCol] || '').trim();
          const name = String(row[nameCol] || '').trim();
          const department = String(row[deptCol] || '').trim();
          
          if (id && name) {
            employees.push({ id, name, department });
          }
          
          // Yield control every 1000 rows for large datasets to prevent UI blocking
          if (i % 1000 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        }
      } else {
        throw new Error('รองรับเฉพาะไฟล์ .xlsx, .csv, .txt เท่านั้น');
      }

      if (employees.length === 0) {
        throw new Error('ไม่พบข้อมูลพนักงานในไฟล์');
      }

      onImport(employees);
      setImportStatus({
        type: 'success',
        message: `นำเข้าสำเร็จ: ${employees.length.toLocaleString('th-TH')} รายชื่อ`
      });

      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการนำเข้า'
      });
      setTimeout(() => setImportStatus(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [onImport]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${isLoading
            ? 'border-blue-400 bg-blue-400/10 cursor-wait'
            : isDragging
              ? 'border-amber-400 bg-amber-400/10 scale-105'
              : 'border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50'
          }
        `}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          onChange={handleFileInput}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
        />
        
        <div className="space-y-3">
          <div className="flex justify-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
              <FileSpreadsheet className="w-8 h-8 text-green-400" />
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div>
            <p className="text-white font-medium text-lg">
              {isLoading
                ? 'กำลังนำเข้าข้อมูล...'
                : isDragging
                  ? 'ปล่อยไฟล์ที่นี่'
                  : 'ลากไฟล์มาวางที่นี่ หรือคลิกเลือก'}
            </p>
            <p className="text-blue-200 text-sm mt-1">
              {isLoading ? 'กรุณารอสักครู่' : 'รองรับไฟล์ .xlsx, .csv, .txt'}
            </p>
          </div>

          <div className="flex justify-center gap-2 text-xs text-blue-300">
            <span className="px-2 py-1 bg-white/10 rounded">รหัส,ชื่อ,แผนก</span>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>กำลังประมวลผลไฟล์...</span>
        </div>
      )}

      {/* Status Message */}
      {importStatus && (
        <div className={`
          flex items-center gap-2 px-4 py-3 rounded-xl
          ${importStatus.type === 'success'
            ? 'bg-green-500/20 border border-green-500/30 text-green-300'
            : 'bg-red-500/20 border border-red-500/30 text-red-300'
          }
        `}>
          {importStatus.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Employee Count */}
      {employeeCount > 0 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 rounded-xl border border-white/20">
          <Users className="w-5 h-5 text-amber-400" />
          <span className="text-white">
            มีรายชื่อพนักงานในระบบ: <strong>{employeeCount}</strong> คน
          </span>
        </div>
      )}
    </div>
  );
}
