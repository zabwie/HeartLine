// Settings.js - Handles app settings and customization

document.addEventListener('DOMContentLoaded', () => {
  const saveSettingsBtn = document.getElementById('save-settings');
  const saveThemeBtn = document.getElementById('save-theme');
  
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }
  
  if (saveThemeBtn) {
    saveThemeBtn.addEventListener('click', saveThemeSettings);
  }
  
  // Load settings when settings section is shown
  const navSettingsBtn = document.getElementById('nav-settings');
  if (navSettingsBtn) {
    navSettingsBtn.addEventListener('click', () => {
      loadSettings();
      loadThemeSettings();
    });
  }
  
  // Add event listeners for color pickers and font selector
  const colorInputs = document.querySelectorAll('.color-picker');
  colorInputs.forEach(input => {
    input.addEventListener('input', updateThemePreview);
  });
  
  const fontSelector = document.getElementById('font-family');
  if (fontSelector) {
    fontSelector.addEventListener('change', updateThemePreview);
  }
  
  const borderRadiusInput = document.getElementById('border-radius');
  if (borderRadiusInput) {
    borderRadiusInput.addEventListener('input', updateThemePreview);
  }
});

// Load settings from database
async function loadSettings() {
  try {
    const settings = await window.api.getSettings();
    
    // Set notification settings
    const enableNotifications = document.getElementById('enable-notifications');
    if (enableNotifications) {
      enableNotifications.checked = settings.enableNotifications || false;
    }
    
    const reminderTime = document.getElementById('reminder-time');
    if (reminderTime) {
      reminderTime.value = settings.reminderTime || '20:00';
    }
    
    // Set security settings
    const appPasscode = document.getElementById('app-passcode');
    if (appPasscode) {
      appPasscode.value = settings.appPasscode || '';
    }
    
    // Load theme settings
    const themeSettings = await window.api.getThemeSettings();
    if (themeSettings) {
      // Find which preset matches the current theme
      let currentTheme = 'light'; // default
      for (const [key, preset] of Object.entries(window.themePresets)) {
        if (preset['primary-color'] === themeSettings['primary-color']) {
          currentTheme = key;
          break;
        }
      }
      
      // Set the dropdown value
      const themeSelect = document.getElementById('theme-select');
      if (themeSelect) {
        themeSelect.value = currentTheme;
      }
    }
    
  } catch (error) {
    console.error('Error loading settings:', error);
    showNotification('Failed to load settings. Please try again.', 'error');
  }
}

// Save settings to database
async function saveSettings() {
  try {
    const settings = {
      appPasscode: document.getElementById('app-passcode')?.value || '',
      lockLetters: document.getElementById('lock-letters')?.checked?.toString() || 'false',
      enableReminders: document.getElementById('enable-reminders')?.checked?.toString() || 'false',
      reminderTime: document.getElementById('reminder-time')?.value || '20:00',
      enableAI: document.getElementById('enable-ai')?.checked?.toString() || 'false',
      aiModel: document.getElementById('ai-model')?.value || 'default'
    };
    
    await window.api.saveSettings(settings);
    showNotification('Settings saved successfully!', 'success');
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Failed to save settings. Please try again.', 'error');
  }
}

// Load theme settings from database
// Add this to your loadThemeSettings function
async function loadThemeSettings() {
  try {
    const themeSettings = await window.api.getThemeSettings();
    
    // Update color pickers with theme values
    document.getElementById('primary-color').value = themeSettings['primary-color'] || '#7c9eb2';
    document.getElementById('secondary-color').value = themeSettings['secondary-color'] || '#f8f9fa';
    document.getElementById('accent-color').value = themeSettings['accent-color'] || '#e9ecef';
    document.getElementById('text-color').value = themeSettings['text-color'] || '#343a40';
    
    // Update spacing controls
    document.getElementById('container-spacing').value = parseInt(themeSettings['container-spacing']) || 25;
    document.getElementById('container-padding').value = parseInt(themeSettings['container-padding']) || 25;
    
    // Update other controls
    // ...
  } catch (error) {
    console.error('Error loading theme settings:', error);
  }
}

// Update the saveThemeSettings function
async function saveThemeSettings() {
  const themeSettings = {
    'primary-color': document.getElementById('primary-color').value,
    'secondary-color': document.getElementById('secondary-color').value,
    'accent-color': document.getElementById('accent-color').value,
    'text-color': document.getElementById('text-color').value,
    'font-family': document.getElementById('font-family').value,
    'border-radius': document.getElementById('border-radius').value + 'px',
    'container-spacing': document.getElementById('container-spacing').value + 'px',
    'container-padding': document.getElementById('container-padding').value + 'px'
  };
  
  // Save and apply theme
  // ...
}
// Update the saveThemeSettings function
async function saveThemeSettings() {
  const themeSettings = {
    'primary-color': document.getElementById('primary-color').value,
    'secondary-color': document.getElementById('secondary-color').value,
    'accent-color': document.getElementById('accent-color').value,
    'text-color': document.getElementById('text-color').value,
    'font-family': document.getElementById('font-family').value,
    'border-radius': document.getElementById('border-radius').value + 'px',
    'card-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)'
  };
  
  await window.api.saveThemeSettings(themeSettings);
  
  // Apply theme immediately
  applyTheme(themeSettings);
  
  showNotification('Theme settings saved successfully!', 'success');
  
}

// Apply theme to the entire app
function applyTheme(themeSettings) {
  const root = document.documentElement;
  
  // Set CSS variables on the root element
  root.style.setProperty('--primary-color', themeSettings['primary-color']);
  root.style.setProperty('--secondary-color', themeSettings['secondary-color']);
  root.style.setProperty('--light-accent', themeSettings['accent-color']);
  root.style.setProperty('--text-color', themeSettings['text-color']);
  root.style.setProperty('--border-radius', themeSettings['border-radius']);
  root.style.setProperty('--card-shadow', themeSettings['card-shadow']);
  
  // Apply background color directly to body
  document.body.style.backgroundColor = themeSettings['secondary-color'];
  
  // Apply font family to body
  document.body.style.fontFamily = themeSettings['font-family'];
  document.body.style.color = themeSettings['text-color'];
  
  // Update app container background if it exists
  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    appContainer.style.backgroundColor = themeSettings['secondary-color'];
  }
}

// Load and apply theme on startup
async function initTheme() {
  try {
    const themeSettings = await window.api.getThemeSettings();
    applyTheme(themeSettings);
  } catch (error) {
    console.error('Error initializing theme:', error);
  }
}

// Initialize theme on page load
initTheme();

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notification = document.getElementById('notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set message and type
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  // Show notification
  notification.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Add this function to your settings.js file
function updateThemePreview() {
  const primaryColor = document.getElementById('primary-color').value;
  const secondaryColor = document.getElementById('secondary-color').value;
  const accentColor = document.getElementById('accent-color').value;
  const textColor = document.getElementById('text-color').value;
  const fontFamily = document.getElementById('font-family').value;
  const borderRadius = document.getElementById('border-radius').value + 'px';
  
  const previewEl = document.getElementById('theme-preview');
  if (!previewEl) return;
  
  previewEl.style.setProperty('--preview-primary-color', primaryColor);
  previewEl.style.setProperty('--preview-secondary-color', secondaryColor);
  previewEl.style.setProperty('--preview-accent-color', accentColor);
  previewEl.style.setProperty('--preview-text-color', textColor);
  previewEl.style.fontFamily = fontFamily;
  previewEl.style.setProperty('--preview-border-radius', borderRadius);
  
  // Update preview card
  const previewCard = previewEl.querySelector('.preview-card');
  if (previewCard) {
    previewCard.style.backgroundColor = accentColor;
  }
}

// Make sure to expose this function to the window object
window.updateThemePreview = updateThemePreview;

// Add this function to handle letter deletion
async function deleteLetter(letterId) {
  try {
    if (confirm('Are you sure you want to delete this letter? This action cannot be undone.')) {
      await window.api.deleteLetter(letterId);
      showNotification('Letter deleted successfully', 'success');
      
      // Refresh the letters list
      loadLetters();
    }
  } catch (error) {
    console.error('Error deleting letter:', error);
    showNotification('Failed to delete letter. Please try again.', 'error');
  }
}

// Make the function available globally
window.deleteLetter = deleteLetter;