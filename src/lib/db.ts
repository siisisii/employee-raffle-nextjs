import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs-extra';
import { EmployeeData, EmployeeId, PrizeStatus } from '@/types';
import { INITIAL_PRIZE_STATUS } from '@/utils/employeeId';

const DB_NAME = 'raffle.db';
const DB_PATH = path.join(process.cwd(), DB_NAME);

let db: Database.Database | null = null;

export function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDB();
  }
  return db;
}

function initDB() {
  if (!db) return;

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS winners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      prize_number INTEGER,
      created_at TEXT,
      created_at_display TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Initialize settings if not exists
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const existingStatus = stmt.get('prize_status');

  if (!existingStatus) {
    const insert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    insert.run('prize_status', JSON.stringify(INITIAL_PRIZE_STATUS));
  }
}

// Data Access Object (DAO) methods

export function getAllEmployees(): EmployeeData[] {
  const db = getDB();
  return db.prepare('SELECT * FROM employees').all() as EmployeeData[];
}

export function saveEmployees(employees: EmployeeData[]) {
  const db = getDB();
  const insert = db.prepare('INSERT OR REPLACE INTO employees (id, name, department) VALUES (@id, @name, @department)');
  const insertMany = db.transaction((emps: EmployeeData[]) => {
    for (const emp of emps) insert.run(emp);
  });
  insertMany(employees);
}

export function getPrizeStatus(): PrizeStatus {
  const db = getDB();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('prize_status') as { value: string };
  if (row) {
    return JSON.parse(row.value);
  }
  return INITIAL_PRIZE_STATUS;
}

export function updatePrizeStatus(status: PrizeStatus) {
  const db = getDB();
  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(JSON.stringify(status), 'prize_status');
  
  // Sync winners to winners table for easier querying if needed, but for now we store full state in settings
  // or we can split it. To follow the current structure where PrizeStatus contains winners array:
  // We just save the JSON blob is easiest for migration match.
}

export function getAllWinners(): EmployeeId[] {
    const status = getPrizeStatus();
    return status.winners;
}

export function addWinner(winner: EmployeeId) {
    const status = getPrizeStatus();
    status.winners.push(winner);
    status.totalRemaining = Math.max(0, status.totalRemaining - 1);
    updatePrizeStatus(status);
}

export function resetWinners() {
    const status = getPrizeStatus();
    status.winners = [];
    status.totalRemaining = INITIAL_PRIZE_STATUS.totalRemaining; // Or keep current remaining? Usually reset means full reset.
    // Let's check INITIAL_PRIZE_STATUS in utils.
    // It is just { totalRemaining: 10, winners: [] }
    updatePrizeStatus(INITIAL_PRIZE_STATUS);
}
