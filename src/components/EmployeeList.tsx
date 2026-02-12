/**
 * EmployeeList Component - แสดงรายชื่อพนักงานที่นำเข้า พร้อมค้นหาและกรองแผนก
 */

'use client';

import { useState, useMemo } from 'react';
import { Search, Users, Building2, X, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import type { EmployeeData } from '@/types';

interface EmployeeListProps {
  employees: EmployeeData[];
}

export function EmployeeList({ employees }: EmployeeListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // ดึงรายการแผนกทั้งหมดที่ไม่ซ้ำกัน
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    employees.forEach(emp => {
      if (emp.department) {
        deptSet.add(emp.department);
      }
    });
    return Array.from(deptSet).sort();
  }, [employees]);

  // กรองรายชื่อตามคำค้นหาและแผนก
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = searchQuery === '' || 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || 
        emp.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchQuery, selectedDepartment]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('all');
  };

  if (employees.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">
            รายชื่อพนักงาน ({employees.length.toLocaleString('th-TH')} คน)
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-200">
            {isExpanded ? 'ซ่อนรายชื่อ' : 'ดูรายชื่อ'}
          </span>
          {isExpanded ? (
            <EyeOff className="w-5 h-5 text-blue-300" />
          ) : (
            <Eye className="w-5 h-5 text-blue-300" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหรือรหัสพนักงาน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <div className="relative sm:w-48">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-white/10 border border-white/20 rounded-lg text-white appearance-none focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 cursor-pointer"
              >
                <option value="all" className="bg-gray-800">ทุกแผนก</option>
                {departments.map(dept => (
                  <option key={dept} value={dept} className="bg-gray-800">
                    {dept}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300 pointer-events-none" />
            </div>
          </div>

          {/* Filter Status */}
          {(searchQuery || selectedDepartment !== 'all') && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">
                แสดง {filteredEmployees.length.toLocaleString('th-TH')} จาก {employees.length.toLocaleString('th-TH')} คน
              </span>
              <button
                onClick={clearFilters}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                ล้างตัวกรอง
              </button>
            </div>
          )}

          {/* Employee Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden">
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-white/10 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">ลำดับ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">รหัสพนักงาน</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">ชื่อ - นามสกุล</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-amber-300">แผนก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredEmployees.map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-blue-200">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-mono text-white">{emp.id}</td>
                      <td className="px-4 py-3 text-sm text-white">{emp.name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded text-xs">
                          {emp.department || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty State */}
            {filteredEmployees.length === 0 && (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto text-white/20 mb-3" />
                <p className="text-white/60">ไม่พบรายชื่อที่ตรงกับการค้นหา</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-amber-400 hover:text-amber-300 text-sm"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
