const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { ipcMain } = require('electron');
const fs = require('fs');

// Initialize database
const db = new sqlite3.Database(path.join(__dirname, '../../db/heartline.db'));

// Set up database tables
db.serialize(() => {
  // Create emotions table
  db.run(`
    CREATE TABLE IF NOT EXISTS emotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      rating INTEGER,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create letters table
  db.run(`
    CREATE TABLE IF NOT EXISTS letters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipient TEXT,
      content TEXT,
      is_encrypted INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
  
  // Create theme_settings table for customization
  db.run(`
    CREATE TABLE IF NOT EXISTS theme_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
  
  // Insert default theme settings if they don't exist
  db.get("SELECT COUNT(*) as count FROM theme_settings", (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    
    if (row.count === 0) {
      const defaultTheme = {
        'primary-color': '#7c9eb2',
        'secondary-color': '#f8f9fa',
        'accent-color': '#e9ecef',
        'text-color': '#343a40',
        'font-family': 'Roboto, sans-serif',
        'border-radius': '8px',
        'card-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)'
      };
      
      Object.entries(defaultTheme).forEach(([key, value]) => {
        db.run("INSERT INTO theme_settings (key, value) VALUES (?, ?)", [key, value]);
      });
    }
  });
});

// Set up IPC handlers for database operations
function setupIpcHandlers() {
  // Emotions handlers
  ipcMain.handle('get-emotions', async (event, timeRange) => {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM emotions ORDER BY date DESC";
      let params = [];
      
      if (timeRange && timeRange.startDate && timeRange.endDate) {
        query = "SELECT * FROM emotions WHERE date BETWEEN ? AND ? ORDER BY date DESC";
        params = [timeRange.startDate, timeRange.endDate];
      }
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });
  
  ipcMain.handle('save-emotion', async (event, emotion) => {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO emotions (date, rating, notes) VALUES (?, ?, ?)",
        [emotion.date, emotion.rating, emotion.notes],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  });
  
  // Letters handlers
  ipcMain.handle('get-letters', async () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM letters ORDER BY created_at DESC", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });
  
  ipcMain.handle('save-letter', async (event, letter) => {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO letters (recipient, content, is_encrypted) VALUES (?, ?, ?)",
        [letter.recipient, letter.content, letter.isEncrypted ? 1 : 0],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    });
  });
  
  // Settings handlers
  ipcMain.handle('get-settings', async () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT key, value FROM settings", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const settings = {};
          rows.forEach(row => {
            settings[row.key] = row.value;
          });
          resolve(settings);
        }
      });
    });
  });
  
  ipcMain.handle('save-settings', async (event, settings) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
      
      try {
        db.serialize(() => {
          db.run("BEGIN TRANSACTION");
          
          Object.entries(settings).forEach(([key, value]) => {
            stmt.run(key, value);
          });
          
          db.run("COMMIT", (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          });
        });
      } catch (error) {
        db.run("ROLLBACK");
        reject(error);
      } finally {
        stmt.finalize();
      }
    });
  });
  
  // Theme settings handlers
  ipcMain.handle('get-theme-settings', async () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT key, value FROM theme_settings", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const themeSettings = {};
          rows.forEach(row => {
            themeSettings[row.key] = row.value;
          });
          resolve(themeSettings);
        }
      });
    });
  });
  
  ipcMain.handle('save-theme-settings', async (event, themeSettings) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare("INSERT OR REPLACE INTO theme_settings (key, value) VALUES (?, ?)");
      
      try {
        db.serialize(() => {
          db.run("BEGIN TRANSACTION");
          
          Object.entries(themeSettings).forEach(([key, value]) => {
            stmt.run(key, value);
          });
          
          db.run("COMMIT", (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          });
        });
      } catch (error) {
        db.run("ROLLBACK");
        reject(error);
      } finally {
        stmt.finalize();
      }
    });
  });
}

module.exports = { db, setupIpcHandlers };