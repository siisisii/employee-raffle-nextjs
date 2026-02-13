import { NextResponse } from 'next/server';
import { 
  getAllEmployees, 
  saveEmployees, 
  getPrizeStatus, 
  updatePrizeStatus 
} from '@/lib/db';
import { EmployeeData, PrizeStatus } from '@/types';

export async function GET() {
  try {
    const employeePool = getAllEmployees();
    const prizeStatus = getPrizeStatus();
    
    return NextResponse.json({
      employeePool,
      prizeStatus,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeePool, prizeStatus } = body;

    if (employeePool) {
      // Validate employeePool if needed
      saveEmployees(employeePool as EmployeeData[]);
    }

    if (prizeStatus) {
      updatePrizeStatus(prizeStatus as PrizeStatus);
    }

    return NextResponse.json({ success: true, lastUpdated: Date.now() });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
