const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { db, setupIpcHandlers } = require('./src/js/database');

// Ensure the db directory exists
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets', 'icons', 'heartline.png')
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  
  // Set up IPC handlers for database operations
  setupIpcHandlers();
  
  // Set up IPC handlers for AI operations
  ipcMain.handle('get-reflection', async (event, text, rating) => {
    // This is a pass-through to the renderer's AI helper
    return true;
  });
  
  ipcMain.handle('get-motivation', async () => {
    // This is a pass-through to the renderer's AI helper
    return true;
  });

  // Add this IPC handler for letter deletion
  ipcMain.handle('delete-letter', async (event, letterId) => {
    try {
      await db.run('DELETE FROM letters WHERE id = ?', letterId);
      return true;
    } catch (error) {
      console.error('Error deleting letter:', error);
      throw error;
    }
  });
  
  // Emotion deletion
  ipcMain.handle('delete-emotion', async (event, id) => {
    try {
      await db.run('DELETE FROM emotions WHERE id = ?', id);
      return true;
    } catch (error) {
      console.error('Error deleting emotion:', error);
      throw error;
    }
  });
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});