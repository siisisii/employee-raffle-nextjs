const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'raffle.db');
const db = new Database(dbPath);

const command = process.argv[2];

if (command === 'view') {
  console.log('--- Employees (Top 10) ---');
  const employees = db.prepare('SELECT * FROM employees LIMIT 10').all();
  console.table(employees);
  const employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  console.log(`Total Employees: ${employeeCount}`);

  console.log('\n--- Winners ---');
  const statusRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('prize_status');
  if (statusRow) {
    const status = JSON.parse(statusRow.value);
    console.table(status.winners);
    console.log(`Remaining Prizes: ${status.totalRemaining}`);
  } else {
    console.log('No prize status found.');
  }

} else if (command === 'clear') {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Are you sure you want to DELETE ALL DATA? (yes/no): ', (answer) => {
    if (answer === 'yes') {
      db.prepare('DELETE FROM employees').run();
      // Reset settings
      const initialStatus = {
        totalRemaining: 10,
        winners: []
      };
      db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(JSON.stringify(initialStatus), 'prize_status');
      
      console.log('All data cleared successfully.');
    } else {
      console.log('Operation cancelled.');
    }
    readline.close();
  });

} else {
  console.log('Usage:');
  console.log('  node scripts/db_manager.js view   # View current data');
  console.log('  node scripts/db_manager.js clear  # Delete all data');
}
