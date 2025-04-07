const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Emotions
    getEmotions: (timeRange) => ipcRenderer.invoke('get-emotions', timeRange),
    saveEmotion: (emotion) => ipcRenderer.invoke('save-emotion', emotion),
    deleteEmotion: (id) => ipcRenderer.invoke('delete-emotion', id),
    
    // Letters
    getLetters: () => ipcRenderer.invoke('get-letters'),
    saveLetter: (letter) => ipcRenderer.invoke('save-letter', letter),
    deleteLetter: (letterId) => ipcRenderer.invoke('delete-letter', letterId),
    
    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    
    // Theme settings
    getThemeSettings: () => ipcRenderer.invoke('get-theme-settings'),
    saveThemeSettings: (themeSettings) => ipcRenderer.invoke('save-theme-settings', themeSettings),
    
    // AI
    getReflection: (text, rating) => ipcRenderer.invoke('get-reflection', text, rating),
    getMotivation: () => ipcRenderer.invoke('get-motivation')
  }
);