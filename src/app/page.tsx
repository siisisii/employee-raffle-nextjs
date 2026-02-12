/**
 * Main Page - หน้าหลักของแอปพลิเคชันจับรางวัลพนักงาน
 * ใช้ Firebase Realtime Database สำหรับ sync ข้อมูลแบบ real-time
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/Header';
import { RaffleSection } from '@/components/RaffleSection';
import { WinnerList } from '@/components/WinnerList';
import { Footer } from '@/components/Footer';
import { PrizeStatus } from '@/components/PrizeStatus';
import { ImportPanel } from '@/components/ImportPanel';
import { useRaffleData } from '@/hooks/useRaffleData';
import {
  INITIAL_PRIZE_STATUS,
  generateUniqueEmployeeId,
  updatePrizeStatus,
  resetPrizeStatus,
} from '@/utils/employeeId';
import type { EmployeeId, PrizeStatus as PrizeStatusType, EmployeeData } from '@/types';
import { Users, Settings, Loader2 } from 'lucide-react';

export default function Home() {
  // ใช้ Firebase สำหรับ sync ข้อมูลแบบ real-time (fallback ไป localStorage ได้)
  const { data: syncData, updateData, isLoading } = useRaffleData();

  // State สำหรับผู้โชคดีล่าสุด
  const [latestWinner, setLatestWinner] = useState<EmployeeId | null>(null);

  // State สำหรับสถานะกำลังสุ่ม
  const [isGenerating, setIsGenerating] = useState(false);

  // State สำหรับเปิด/ปิด Import Panel
  const [isImportPanelOpen, setIsImportPanelOpen] = useState(false);

  // ดึงข้อมูลจาก Firebase
  const prizeStatus: PrizeStatusType = syncData?.prizeStatus || INITIAL_PRIZE_STATUS;
  const employeePool: EmployeeData[] = (syncData?.employeePool as EmployeeData[]) || [];

  // ฟังก์ชันสุ่มรางวัล
  const handleGenerate = useCallback(async () => {
    if (prizeStatus.totalRemaining <= 0) {
      alert('รางวัลหมดแล้ว!');
      return;
    }

    if (employeePool.length === 0) {
      // ถ้ายังไม่มีข้อมูลพนักงาน ให้เปิด panel นำเข้าข้อมูล
      setIsImportPanelOpen(true);
      return;
    }

    setIsGenerating(true);

    const prizeNumber = prizeStatus.winners.length + 1;

    // จำลองการสุ่มด้วย delay เพื่อ animation
    setTimeout(async () => {
      try {
        const newWinner = generateUniqueEmployeeId(
          prizeStatus.winners,
          employeePool,
          prizeNumber
        );

        if (newWinner) {
          setLatestWinner(newWinner);
          const updatedStatus = updatePrizeStatus(prizeStatus, newWinner);
          await updateData({ prizeStatus: updatedStatus });
        } else {
          alert('ไม่พบพนักงานที่สามารถสุ่มได้');
        }
      } catch (error) {
        console.error('Failed to generate employee ID:', error);
        alert('ไม่สามารถสร้างรหัสพนักงานได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsGenerating(false);
      }
    }, 2500); // รอให้ animation เสร็จ
  }, [prizeStatus, employeePool, updateData]);

  // ฟังก์ชันลบรายการเดี่ยว
  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('ต้องการลบรายการนี้หรือไม่?')) return;

    const newWinners = prizeStatus.winners.filter(w => w.id !== id);
    const updatedStatus = {
      ...prizeStatus,
      totalRemaining: prizeStatus.totalRemaining + 1,
      winners: newWinners.map((w, i) => ({ ...w, prizeNumber: i + 1 })),
    };

    await updateData({ prizeStatus: updatedStatus });

    if (latestWinner?.id === id) {
      setLatestWinner(null);
    }
  }, [prizeStatus, updateData, latestWinner]);

  // ฟังก์ชันรีเซ็ตทั้งหมด
  const handleReset = useCallback(async () => {
    if (!window.confirm('ต้องการเริ่มจับรางวัลใหม่หรือไม่? ข้อมูลเดิมจะถูกลบ')) {
      return;
    }

    await updateData({ prizeStatus: resetPrizeStatus() });
    setLatestWinner(null);
  }, [updateData]);

  const hasEmployees = employeePool.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xl">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-end gap-4">
          {hasEmployees ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80">
              <Users className="w-5 h-5" />
              <span>{employeePool.length.toLocaleString('th-TH')} คน</span>
            </div>
          ) : null}
          <button
            onClick={() => setIsImportPanelOpen(true)}
            className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors border border-white/20"
            title="ตั้งค่าข้อมูลพนักงาน"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Prize Status */}
        <div className="mb-8">
          <PrizeStatus status={prizeStatus} />
        </div>

        <RaffleSection
          latestWinner={latestWinner}
          prizeStatus={prizeStatus}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onReset={handleReset}
        />

        <WinnerList
          winners={prizeStatus.winners}
          onDelete={handleDelete}
          onClearAll={handleReset}
        />
      </main>

      <Footer employeeIds={prizeStatus.winners} />

      {/* Import Panel */}
      <ImportPanel 
        isOpen={isImportPanelOpen} 
        onClose={() => setIsImportPanelOpen(false)} 
      />
    </div>
  );
}
