// Coping.js - Handles coping tools functionality

document.addEventListener('DOMContentLoaded', () => {
  // Set up breathing exercise
  const startBreathingBtn = document.getElementById('start-breathing');
  if (startBreathingBtn) {
    startBreathingBtn.addEventListener('click', startBreathingExercise);
  }
  
  // Set up ground me button
  const groundMeBtn = document.getElementById('ground-me');
  if (groundMeBtn) {
    groundMeBtn.addEventListener('click', showGroundingTip);
  }
  
  // Set up clear safe space button
  const clearSafeSpaceBtn = document.getElementById('clear-safe-space');
  if (clearSafeSpaceBtn) {
    clearSafeSpaceBtn.addEventListener('click', () => {
      document.getElementById('safe-space').value = '';
    });
  }
  
  // Load daily affirmation
  loadDailyAffirmation();
});

// Start breathing exercise
function startBreathingExercise() {
  const breathingCircle = document.getElementById('breathing-circle');
  const startBtn = document.getElementById('start-breathing');
  
  if (!breathingCircle) return;
  
  // Disable button during exercise
  startBtn.disabled = true;
  
  const circleText = breathingCircle.querySelector('.circle-text');
  let count = 0;
  const totalCycles = 3;
  
  // Start breathing cycle
  breathingCycle();
  
  function breathingCycle() {
    // Inhale
    circleText.textContent = 'Inhale';
    breathingCircle.style.transform = 'scale(1.5)';
    breathingCircle.style.backgroundColor = 'var(--light-accent)';
    
    setTimeout(() => {
      // Hold
      circleText.textContent = 'Hold';
      
      setTimeout(() => {
        // Exhale
        circleText.textContent = 'Exhale';
        breathingCircle.style.transform = 'scale(1)';
        breathingCircle.style.backgroundColor = 'var(--secondary-color)';
        
        setTimeout(() => {
          count++;
          if (count < totalCycles) {
            breathingCycle();
          } else {
            // Reset
            circleText.textContent = 'Done';
            setTimeout(() => {
              circleText.textContent = 'Start';
              startBtn.disabled = false;
            }, 2000);
          }
        }, 4000); // Exhale for 4 seconds
      }, 2000); // Hold for 2 seconds
    }, 4000); // Inhale for 4 seconds
  }
}

// Show grounding tip
function showGroundingTip() {
  const groundingTip = document.getElementById('grounding-tip');
  if (!groundingTip) return;
  
  const tips = [
    "Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
    "Place your hands in water. Focus on the temperature and how it feels on your fingertips, palms, and the back of your hands.",
    "Hold a piece of ice. What does it feel like? How does the sensation change as the ice melts?",
    "Savor a food or drink. Focus on the taste, texture, and smell of each bite or sip.",
    "Take 10 deep breaths. Focus your attention on each breath.",
    "Gently place your feet on the ground. Feel the texture of the ground beneath your feet.",
    "Look around and name one thing you can see in each color of the rainbow.",
    "Listen for the furthest sound you can hear, then the closest one.",
    "Focus on the weight of your body in the chair or against the floor.",
    "Describe an everyday activity in detail. For example, how do you make coffee or brush your teeth?"
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  groundingTip.textContent = randomTip;
}

// Load daily affirmation
async function loadDailyAffirmation() {
  const affirmationEl = document.getElementById('daily-affirmation');
  if (!affirmationEl) return;
  
  try {
    // Check if AI is enabled in settings
    const settings = await window.api.getSettings();
    if (!settings.enableAI || settings.aiModel === 'none') {
      affirmationEl.textContent = "Your journey matters. Each step forward is progress, no matter how small.";
      return;
    }
    
    // Get affirmation from cache or generate new one
    let affirmation = localStorage.getItem('dailyAffirmation');
    const lastUpdated = localStorage.getItem('affirmationDate');
    const today = new Date().toISOString().split('T')[0];
    
    // If no affirmation or it's from a previous day, get a new one
    if (!affirmation || lastUpdated !== today) {
      if (window.aiHelper && window.aiHelper.isAvailable()) {
        affirmation = await window.aiHelper.getDailyAffirmation();
        
        // Cache the affirmation
        localStorage.setItem('dailyAffirmation', affirmation);
        localStorage.setItem('affirmationDate', today);
      } else {
        affirmation = "Your healing journey is valid. Each day brings new strength, even when you can't see it yet.";
      }
    }
    
    affirmationEl.textContent = affirmation;
    
    // Add event listener for new affirmation button
    const newAffirmationBtn = document.getElementById('new-affirmation');
    if (newAffirmationBtn) {
      newAffirmationBtn.addEventListener('click', async () => {
        if (window.aiHelper && window.aiHelper.isAvailable()) {
          affirmationEl.textContent = "Generating new affirmation...";
          const newAffirmation = await window.aiHelper.getDailyAffirmation();
          affirmationEl.textContent = newAffirmation;
          
          // Update cache
          localStorage.setItem('dailyAffirmation', newAffirmation);
          localStorage.setItem('affirmationDate', today);
        }
      });
    }
    
  } catch (error) {
    console.error('Error loading daily affirmation:', error);
    affirmationEl.textContent = "Your strength grows with each passing day, even when the path feels difficult.";
  }
}

// Initialize breathing exercise
function initBreathingExercise() {
  const breathingCircle = document.getElementById('breathing-circle');
  if (breathingCircle) {
    breathingCircle.querySelector('.circle-text').textContent = 'Start';
  }
}