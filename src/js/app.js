// Add this to your app.js file

document.addEventListener('DOMContentLoaded', async () => {
  // Navigation handling
  const navButtons = document.querySelectorAll('nav button');
  const sections = document.querySelectorAll('main section');
  
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and sections
      navButtons.forEach(btn => btn.classList.remove('active'));
      sections.forEach(section => section.classList.remove('active-section'));
      sections.forEach(section => section.classList.add('hidden-section'));
      
      // Add active class to clicked button and corresponding section
      button.classList.add('active');
      const sectionId = button.id.replace('nav-', '') + '-section';
      document.getElementById(sectionId).classList.add('active-section');
      document.getElementById(sectionId).classList.remove('hidden-section');
    });
  });
  
  // Check for app passcode on startup
  checkPasscode();
  
  // Initialize Ollama for AI features
  if (window.aiHelper) {
    window.aiHelper.initOllama();
  }
  
  // Load initial data
  loadEmotions();
  loadLetters();
  loadSettings();
  
  // Load and apply theme settings
  try {
    const themeSettings = await window.api.getThemeSettings();
    if (themeSettings) {
      applyTheme(themeSettings);
    }
  } catch (error) {
    console.error('Error loading theme settings:', error);
  }
  
  // Initialize coping tools
  initBreathingExercise();
  loadDailyAffirmation();
});

// Check if app passcode is set and prompt for it
async function checkPasscode() {
  try {
    const settings = await window.api.getSettings();
    if (settings.appPasscode) {
      const passcode = prompt('Enter your passcode to unlock Heartline:');
      if (passcode !== settings.appPasscode) {
        alert('Incorrect passcode. The app will now close.');
        window.close();
      }
    }
  } catch (error) {
    console.error('Error checking passcode:', error);
  }
}

// Theme presets
const themePresets = {
  light: {
    name: 'Light Mode',
    'primary-color': '#5b8fa8',
    'secondary-color': '#f8f9fa',
    'accent-color': '#e2eef3',
    'text-color': '#2c3e50',
    'background-color': '#ffffff',
    'font-family': 'Roboto, sans-serif',
    'border-radius': '8px',
    'card-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  dark: {
    name: 'Dark Mode',
    'primary-color': '#8a65d1',
    'secondary-color': '#1a1d21',
    'accent-color': '#2d3748',
    'text-color': '#e2e8f0',
    'background-color': '#2d3436',
    'font-family': 'Roboto, sans-serif',
    'border-radius': '8px',
    'card-shadow': '0 4px 8px rgba(0, 0, 0, 0.4)'
  },
  eerie: {
    name: 'Eerie Mode',
    'primary-color': '#9b1b30',
    'secondary-color': '#0f1e3d',
    'accent-color': '#2c3154',
    'text-color': '#d8c5e9',
    'background-color': '#1c2541',
    'font-family': 'Montserrat, sans-serif',
    'border-radius': '2px',
    'card-shadow': '0 5px 10px rgba(0, 0, 0, 0.7)'
  },
  ominous: {
    name: 'Ominous',
    'primary-color': '#c70039',
    'secondary-color': '#0a0a0a',
    'accent-color': '#1e1e1e',
    'text-color': '#ffffff',
    'background-color': '#141414',
    'font-family': 'Montserrat, sans-serif',
    'border-radius': '0px',
    'card-shadow': '0 5px 15px rgba(199, 0, 57, 0.3)'
  },
  scifi: {
    name: 'Sci-Fi',
    'primary-color': '#00b8d4',
    'secondary-color': '#121212',
    'accent-color': '#1c313a',
    'text-color': '#84ffff',
    'background-color': '#0a1a1f',
    'font-family': 'Roboto, sans-serif',
    'border-radius': '4px',
    'card-shadow': '0 0 20px rgba(0, 184, 212, 0.4)'
  },
  cyberpunk: {
    name: 'Cyberpunk',
    'primary-color': '#f0027f',
    'secondary-color': '#120458',
    'accent-color': '#1a0b2e',
    'text-color': '#00f9ff',
    'background-color': '#0d0221',
    'font-family': 'Montserrat, sans-serif',
    'border-radius': '0px',
    'card-shadow': '0 0 25px rgba(240, 2, 127, 0.5)'
  },
  aesthetic: {
    name: 'Aesthetic',
    'primary-color': '#ff9aa2',
    'secondary-color': '#ffdac1',
    'accent-color': '#e2f0cb',
    'text-color': '#5e6472',
    'background-color': '#fff8e7',
    'font-family': 'Nunito, sans-serif',
    'border-radius': '12px',
    'card-shadow': '0 4px 10px rgba(94, 100, 114, 0.1)'
  },
  kawaii: {
    name: 'Kawaii',
    'primary-color': '#ff85a2',
    'secondary-color': '#ffeeff',
    'accent-color': '#ffc2e2',
    'text-color': '#7d6b7d',
    'background-color': '#fff6f6',
    'font-family': 'Nunito, sans-serif',
    'border-radius': '20px',
    'card-shadow': '0 6px 12px rgba(255, 133, 162, 0.2)'
  },
  nature: {
    name: 'Nature',
    'primary-color': '#3a7d44',
    'secondary-color': '#f4f9f4',
    'accent-color': '#d8e8d8',
    'text-color': '#2f3e46',
    'background-color': '#f8f9f4',
    'font-family': 'Open Sans, sans-serif',
    'border-radius': '6px',
    'card-shadow': '0 3px 5px rgba(0, 0, 0, 0.1)'
  },
  ocean: {
    name: 'Ocean',
    'primary-color': '#1a73e8',
    'secondary-color': '#f0f8ff',
    'accent-color': '#cce4ff',
    'text-color': '#0d47a1',
    'background-color': '#f5f9ff',
    'font-family': 'Source Sans Pro, sans-serif',
    'border-radius': '10px',
    'card-shadow': '0 3px 7px rgba(26, 115, 232, 0.15)'
  },
  minimalist: {
    name: 'Minimalist',
    'primary-color': '#2c2c2c',
    'secondary-color': '#ffffff',
    'accent-color': '#f5f5f5',
    'text-color': '#333333',
    'background-color': '#fafafa',
    'font-family': 'Lato, sans-serif',
    'border-radius': '0px',
    'card-shadow': '0 1px 2px rgba(0, 0, 0, 0.05)'
  }
};

// Function to handle theme selection from dropdown
function handleThemeSelection(event) {
  const selectedTheme = event.target.value;
  applyThemePreset(selectedTheme);
}

// Function to apply a theme preset
function applyThemePreset(presetName) {
  const preset = themePresets[presetName];
  if (preset) {
    // Remove all theme classes
    document.body.classList.remove('dark-theme', 'eerie-theme', 'ominous-theme', 'scifi-theme', 
                                  'cyberpunk-theme', 'aesthetic-theme', 'kawaii-theme', 
                                  'nature-theme', 'ocean-theme', 'minimalist-theme');
    
    // Add the specific theme class
    if (presetName !== 'light') {
      document.body.classList.add(`${presetName}-theme`);
    }
    
    applyTheme(preset);
    // Save the theme to database
    window.api.saveThemeSettings(preset).catch(error => {
      console.error('Error saving theme preset:', error);
    });
  }
}

// Import the applyTheme function from settings.js if it's not already available
function applyTheme(themeSettings) {
  const root = document.documentElement;
  
  // Set all the CSS variables
  // Set all the CSS variables
  root.style.setProperty('--primary-color', themeSettings['primary-color']);
  root.style.setProperty('--secondary-color', themeSettings['secondary-color']);
  root.style.setProperty('--light-accent', themeSettings['accent-color']);
  root.style.setProperty('--text-color', themeSettings['text-color']);
  root.style.setProperty('--border-radius', themeSettings['border-radius']);
  root.style.setProperty('--card-shadow', themeSettings['card-shadow']);
  
  // Add container spacing variable
  root.style.setProperty('--container-spacing', themeSettings['container-spacing'] || '20px');
  root.style.setProperty('--container-padding', themeSettings['container-padding'] || '25px');
  
  // Set background-color variable based on secondary-color
  const bgColor = themeSettings['background-color'] || 
                 (themeSettings['secondary-color'] === '#ffffff' ? '#f8f9fa' : 
                  themeSettings['secondary-color']);
  root.style.setProperty('--background-color', bgColor);
  
  // Calculate and set derived colors
  const primaryColor = themeSettings['primary-color'];
  const darkerPrimary = adjustColorBrightness(primaryColor, -20);
  root.style.setProperty('--dark-accent', darkerPrimary);
  
  // Apply styles directly to elements for better compatibility
  document.body.style.backgroundColor = themeSettings['secondary-color'];
  document.body.style.color = themeSettings['text-color'];
  document.body.style.fontFamily = themeSettings['font-family'];
  
  // Update container backgrounds
  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    appContainer.style.backgroundColor = themeSettings['secondary-color'];
  }
  
  // Update all section backgrounds
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.backgroundColor = themeSettings['background-color'];
    section.style.boxShadow = themeSettings['card-shadow'];
    section.style.borderRadius = themeSettings['border-radius'];
    section.style.padding = themeSettings['container-padding'] || '25px';
    section.style.marginBottom = themeSettings['container-spacing'] || '25px';
  });
  
  // Update all cards and tool cards
  const cards = document.querySelectorAll('.entry-item, .letter-card, .tool-card, .preview-card');
  cards.forEach(card => {
    card.style.backgroundColor = themeSettings['background-color'];
    card.style.borderRadius = themeSettings['border-radius'];
    card.style.boxShadow = themeSettings['card-shadow'];
    card.style.margin = (parseInt(themeSettings['container-spacing']) / 2 || 10) + 'px 0';
    card.style.padding = (parseInt(themeSettings['container-padding']) * 0.8 || 20) + 'px';
  });
  
  // Update all buttons
  const buttons = document.querySelectorAll('button:not(.preset-button)');
  buttons.forEach(button => {
    if (button.classList.contains('primary-button') || button.classList.contains('tool-button')) {
      button.style.backgroundColor = themeSettings['primary-color'];
      button.style.color = '#ffffff';
    }
    button.style.borderRadius = themeSettings['border-radius'];
  });
  
  // Update form elements
  const formElements = document.querySelectorAll('input, textarea, select');
  formElements.forEach(element => {
    element.style.backgroundColor = adjustColorBrightness(themeSettings['background-color'], 10);
    element.style.color = themeSettings['text-color'];
    element.style.borderRadius = themeSettings['border-radius'];
    element.style.borderColor = themeSettings['accent-color'];
  });
  
  // Update specific elements for each theme
  updateSpecificElementsForTheme(themeSettings);
}

// Helper function to update specific elements based on the theme
function updateSpecificElementsForTheme(themeSettings) {
  // Get theme name from the preset
  let themeName = '';
  for (const [key, preset] of Object.entries(themePresets)) {
    if (preset['primary-color'] === themeSettings['primary-color']) {
      themeName = key;
      break;
    }
  }
  
  // Apply specific styles based on theme
  switch(themeName) {
    case 'dark':
      // Adjust chart colors for dark mode
      if (window.moodChart) {
        window.moodChart.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.1)';
        window.moodChart.options.scales.x.grid.color = 'rgba(255, 255, 255, 0.1)';
        window.moodChart.update();
      }
      break;
      
    case 'ominous':
      // Add ominous effects
      document.querySelectorAll('.tool-card, .letter-card, section').forEach(card => {
        card.style.transition = 'all 0.5s ease, transform 0.3s ease, box-shadow 0.5s ease';
        card.style.boxShadow = '0 5px 15px rgba(199, 0, 57, 0.3)';
        
        card.addEventListener('mouseover', () => {
          card.style.boxShadow = '0 8px 20px rgba(199, 0, 57, 0.5)';
          card.style.transform = 'translateY(-3px)';
        });
        
        card.addEventListener('mouseout', () => {
          card.style.boxShadow = '0 5px 15px rgba(199, 0, 57, 0.3)';
          card.style.transform = 'translateY(0)';
        });
      });
      
      // Add subtle text glow to headings
      document.querySelectorAll('h1, h2, h3').forEach(heading => {
        heading.style.textShadow = '0 0 8px rgba(199, 0, 57, 0.5)';
        heading.style.letterSpacing = '1px';
      });
      
      // Add border effect to buttons
      document.querySelectorAll('button').forEach(button => {
        button.style.border = '1px solid rgba(199, 0, 57, 0.3)';
        button.style.transition = 'all 0.3s ease';
        
        button.addEventListener('mouseover', () => {
          button.style.borderColor = 'rgba(199, 0, 57, 0.8)';
        });
        
        button.addEventListener('mouseout', () => {
          button.style.borderColor = 'rgba(199, 0, 57, 0.3)';
        });
      });
      
      // Add vignette effect to the app container
      const appContainer = document.querySelector('.app-container');
      if (appContainer) {
        appContainer.style.boxShadow = 'inset 0 0 100px rgba(0, 0, 0, 0.8)';
      }
      
      break;
      
    case 'eerie':
      // Add subtle animation for eerie mode
      document.querySelectorAll('.tool-card, .letter-card').forEach(card => {
        card.style.transition = 'all 0.5s ease, transform 0.3s ease';
        card.addEventListener('mouseover', () => {
          card.style.transform = 'translateY(-5px) rotate(0.5deg)';
        });
        card.addEventListener('mouseout', () => {
          card.style.transform = 'translateY(0) rotate(0)';
        });
      });
      break;
      
    case 'pastel':
      // Add softer shadows for pastel mode
      document.querySelectorAll('.tool-card, .letter-card').forEach(card => {
        card.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.05)';
      });
      break;
      
    case 'minimalist':
      // Remove shadows for minimalist mode
      document.querySelectorAll('.tool-card, .letter-card').forEach(card => {
        card.style.boxShadow = 'none';
        card.style.borderBottom = '1px solid ' + themeSettings['accent-color'];
      });
      break;
      
    default:
      // Reset any specific styles
      if (window.moodChart) {
        window.moodChart.options.scales.y.grid.color = 'rgba(0, 0, 0, 0.1)';
        window.moodChart.options.scales.x.grid.color = 'rgba(0, 0, 0, 0.1)';
        window.moodChart.update();
      }
  }
}

// Helper function to adjust color brightness
function adjustColorBrightness(color, percent) {
  // Check if color is undefined or not a string
  if (!color || typeof color !== 'string') {
    console.warn('Invalid color provided to adjustColorBrightness:', color);
    return '#000000'; // Return a default color
  }

  // Handle different color formats
  let r, g, b;
  
  if (color.startsWith('#')) {
    // Handle hex format
    const hex = color.substring(1);
    
    // Handle shorthand hex (#fff)
    if (hex.length === 3) {
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else {
      // Handle full hex (#ffffff)
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  } else if (color.startsWith('rgb')) {
    // Handle rgb/rgba format
    const rgbValues = color.match(/\d+/g);
    if (rgbValues && rgbValues.length >= 3) {
      r = parseInt(rgbValues[0]);
      g = parseInt(rgbValues[1]);
      b = parseInt(rgbValues[2]);
    } else {
      return '#000000'; // Return default if format is invalid
    }
  } else {
    // Unknown format
    return '#000000';
  }
  
  // Adjust brightness
  r = Math.max(0, Math.min(255, r + (percent * 255 / 100)));
  g = Math.max(0, Math.min(255, g + (percent * 255 / 100)));
  b = Math.max(0, Math.min(255, b + (percent * 255 / 100)));
  
  // Convert back to hex
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

// Remove the duplicate applyTheme function and keep only this one
function applyTheme(themeSettings) {
  if (!themeSettings) {
    console.warn('No theme settings provided to applyTheme');
    return;
  }
  
  const root = document.documentElement;
  
  // Set CSS variables on the root element with fallbacks
  root.style.setProperty('--primary-color', themeSettings['primary-color'] || '#5b8fa8');
  root.style.setProperty('--secondary-color', themeSettings['secondary-color'] || '#f8f9fa');
  root.style.setProperty('--light-accent', themeSettings['accent-color'] || '#e2eef3');
  root.style.setProperty('--text-color', themeSettings['text-color'] || '#2c3e50');
  root.style.setProperty('--border-radius', themeSettings['border-radius'] || '8px');
  root.style.setProperty('--card-shadow', themeSettings['card-shadow'] || '0 4px 6px rgba(0, 0, 0, 0.1)');
  
  // Add container spacing and padding variables
  root.style.setProperty('--container-spacing', themeSettings['container-spacing'] || '20px');
  root.style.setProperty('--container-padding', themeSettings['container-padding'] || '25px');
  
  // Set background-color variable based on secondary-color
  const bgColor = themeSettings['background-color'] || 
                 (themeSettings['secondary-color'] === '#ffffff' ? '#f8f9fa' : 
                  themeSettings['secondary-color']);
  root.style.setProperty('--background-color', bgColor);
  
  // Calculate and set derived colors with safety checks
  const primaryColor = themeSettings['primary-color'];
  if (primaryColor) {
    const darkerPrimary = adjustColorBrightness(primaryColor, -20);
    root.style.setProperty('--dark-accent', darkerPrimary);
  } else {
    root.style.setProperty('--dark-accent', '#4a7d96'); // Fallback dark accent
  }
  
  // Apply styles directly to elements for better compatibility
  document.body.style.backgroundColor = themeSettings['secondary-color'];
  document.body.style.color = themeSettings['text-color'];
  document.body.style.fontFamily = themeSettings['font-family'];
  
  // Update container backgrounds
  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    appContainer.style.backgroundColor = themeSettings['secondary-color'];
  }
  
  // Update all section backgrounds
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.backgroundColor = themeSettings['background-color'] || '#ffffff';
    section.style.boxShadow = themeSettings['card-shadow'] || '0 4px 6px rgba(0, 0, 0, 0.1)';
    section.style.borderRadius = themeSettings['border-radius'] || '8px';
    section.style.padding = themeSettings['container-padding'] || '25px';
    section.style.marginBottom = themeSettings['container-spacing'] || '20px';
  });
  
  // Update all cards and tool cards
  const cards = document.querySelectorAll('.entry-item, .letter-card, .tool-card, .preview-card');
  cards.forEach(card => {
    card.style.backgroundColor = themeSettings['background-color'] || '#ffffff';
    card.style.borderRadius = themeSettings['border-radius'] || '8px';
    card.style.boxShadow = themeSettings['card-shadow'] || '0 4px 6px rgba(0, 0, 0, 0.1)';
    card.style.margin = (parseInt(themeSettings['container-spacing']) / 2 || 10) + 'px 0';
    card.style.padding = (parseInt(themeSettings['container-padding']) * 0.8 || 20) + 'px';
  });
  
  // Update all buttons
  const buttons = document.querySelectorAll('button:not(.preset-button)');
  buttons.forEach(button => {
    if (button.classList.contains('primary-button') || button.classList.contains('tool-button')) {
      button.style.backgroundColor = themeSettings['primary-color'] || '#5b8fa8';
      button.style.color = '#ffffff';
    }
    button.style.borderRadius = themeSettings['border-radius'] || '8px';
  });
  
  // Update form elements
  const formElements = document.querySelectorAll('input, textarea, select');
  formElements.forEach(element => {
    element.style.backgroundColor = adjustColorBrightness(themeSettings['background-color'] || '#ffffff', 10);
    element.style.color = themeSettings['text-color'] || '#2c3e50';
    element.style.borderRadius = themeSettings['border-radius'] || '8px';
    element.style.borderColor = themeSettings['accent-color'] || '#e2eef3';
  });
  
  // Update specific elements for each theme
  updateSpecificElementsForTheme(themeSettings);
}

// Update theme controls to match the selected preset
function updateThemeControls(themeSettings) {
  const primaryColorInput = document.getElementById('primary-color');
  const secondaryColorInput = document.getElementById('secondary-color');
  const accentColorInput = document.getElementById('accent-color');
  const textColorInput = document.getElementById('text-color');
  const fontFamilySelect = document.getElementById('font-family');
  const borderRadiusInput = document.getElementById('border-radius');
  
  if (primaryColorInput) primaryColorInput.value = themeSettings['primary-color'];
  if (secondaryColorInput) secondaryColorInput.value = themeSettings['secondary-color'];
  if (accentColorInput) accentColorInput.value = themeSettings['accent-color'];
  if (textColorInput) textColorInput.value = themeSettings['text-color'];
  if (fontFamilySelect) fontFamilySelect.value = themeSettings['font-family'];
  if (borderRadiusInput) borderRadiusInput.value = parseInt(themeSettings['border-radius']) || 8;
  
  // Update preview if it exists
  const updatePreviewFn = window.updateThemePreview;
  if (typeof updatePreviewFn === 'function') {
    updatePreviewFn();
  }
}

// Expose functions to window for use in other scripts
window.applyThemePreset = applyThemePreset;
window.themePresets = themePresets;