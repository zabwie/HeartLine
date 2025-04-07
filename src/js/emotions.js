document.addEventListener('DOMContentLoaded', () => {
  const moodSlider = document.getElementById('mood-slider');
  const moodValue = document.getElementById('mood-value');
  const moodNotes = document.getElementById('mood-notes');
  const saveEmotionBtn = document.getElementById('save-emotion');
  const entriesList = document.getElementById('entries-list');
  
  // Add reflection button to the emotions section
  const emotionsSection = document.getElementById('emotions-section');
  if (emotionsSection) {
    const reflectionBtn = document.createElement('button');
    reflectionBtn.id = 'show-reflection';
    reflectionBtn.className = 'secondary-button';
    reflectionBtn.textContent = 'Show My Progress';
    reflectionBtn.addEventListener('click', showProgressReflection);
    
    // Insert after the save button
    const saveButton = document.getElementById('save-emotion');
    if (saveButton && saveButton.parentNode) {
      saveButton.parentNode.appendChild(reflectionBtn);
    }
  }
  
  // Update mood value display when slider changes
  moodSlider.addEventListener('input', () => {
    moodValue.textContent = moodSlider.value;
    updateMoodColor(moodSlider.value);
  });
  
  // Initialize mood color
  updateMoodColor(moodSlider.value);
  
  // Save emotion entry
  saveEmotionBtn.addEventListener('click', async () => {
    const rating = parseInt(moodSlider.value);
    const notes = moodNotes.value.trim();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      await window.api.saveEmotion({ date, rating, notes });
      
      // Clear form
      moodSlider.value = 5;
      moodValue.textContent = '5';
      moodNotes.value = '';
      updateMoodColor(5);
      
      // Refresh entries list
      loadEmotions();
      
      // Show success message
      showNotification('Entry saved successfully!', 'success');
      
      // Get AI reflection if enabled
      getAIReflection(rating, notes);
    } catch (error) {
      console.error('Error saving emotion:', error);
      showNotification('Failed to save entry. Please try again.', 'error');
    }
  });
});

// Load emotions from database and display them
async function loadEmotions() {
  try {
    const entriesContainer = document.getElementById('entries-list');
    if (!entriesContainer) return;
    
    entriesContainer.innerHTML = '<div class="loading">Loading entries...</div>';
    
    const emotions = await window.api.getEmotions();
    
    if (emotions.length === 0) {
      entriesContainer.innerHTML = '<div class="no-entries">No entries yet. Record your first emotion.</div>';
      return;
    }
    
    entriesContainer.innerHTML = '';
    
    emotions.forEach(emotion => {
      const entryEl = document.createElement('div');
      entryEl.className = 'entry-item';
      entryEl.dataset.id = emotion.id;
      
      // Create entry header with date and delete button
      const entryHeader = document.createElement('div');
      entryHeader.className = 'entry-header';
      
      const date = new Date(emotion.date);
      const formattedDate = date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const dateEl = document.createElement('div');
      dateEl.className = 'entry-date';
      dateEl.textContent = formattedDate;
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'entry-delete';
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.title = 'Delete entry';
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        deleteEmotion(emotion.id);
      };
      
      entryHeader.appendChild(dateEl);
      entryHeader.appendChild(deleteButton);
      
      // Create rating element
      const ratingEl = document.createElement('span');
      ratingEl.className = 'entry-rating';
      ratingEl.textContent = `${emotion.rating}/10`;
      ratingEl.style.backgroundColor = getRatingColor(emotion.rating);
      ratingEl.style.color = emotion.rating > 5 ? '#000' : '#fff';
      
      // Add rating to header
      entryHeader.appendChild(ratingEl);
      entryEl.appendChild(entryHeader);
      
      // Add notes if they exist
      if (emotion.notes) {
        const notesEl = document.createElement('div');
        notesEl.className = 'entry-notes';
        notesEl.textContent = emotion.notes;
        entryEl.appendChild(notesEl);
      }
      
      entriesContainer.appendChild(entryEl);
    });
    
  } catch (error) {
    console.error('Error loading emotions:', error);
    document.getElementById('entries-list').innerHTML = 
      '<div class="error">Failed to load entries. Please refresh the page.</div>';
  }
}

// Function to delete an emotion entry
async function deleteEmotion(emotionId) {
  try {
    if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      await window.api.deleteEmotion(emotionId);
      loadEmotions(); // Refresh the entries list
      
      // Also refresh the chart if it exists
      if (typeof updateMoodChart === 'function') {
        updateMoodChart();
      }
    }
  } catch (error) {
    console.error('Error deleting emotion:', error);
    alert('Failed to delete entry. Please try again.');
  }
}

// Update mood color based on rating
function updateMoodColor(rating) {
  const moodValue = document.getElementById('mood-value');
  
  // Remove all existing classes
  moodValue.classList.remove('mood-terrible', 'mood-bad', 'mood-neutral', 'mood-good', 'mood-great');
  
  // Add appropriate class based on rating
  if (rating <= 2) {
    moodValue.classList.add('mood-terrible');
  } else if (rating <= 4) {
    moodValue.classList.add('mood-bad');
  } else if (rating <= 6) {
    moodValue.classList.add('mood-neutral');
  } else if (rating <= 8) {
    moodValue.classList.add('mood-good');
  } else {
    moodValue.classList.add('mood-great');
  }
}

// Get rating class for styling
function getRatingClass(rating) {
  if (rating <= 2) return 'mood-terrible';
  if (rating <= 4) return 'mood-bad';
  if (rating <= 6) return 'mood-neutral';
  if (rating <= 8) return 'mood-good';
  return 'mood-great';
}

// Function to get color based on rating value
function getRatingColor(rating) {
  // Convert rating to a number to ensure proper comparison
  const numRating = Number(rating);
  
  if (numRating <= 3) {
    return '#ff4d4d'; // Red for low ratings
  } else if (numRating <= 5) {
    return '#ffa64d'; // Orange for below average
  } else if (numRating <= 7) {
    return '#ffff4d'; // Yellow for average
  } else if (numRating <= 9) {
    return '#4dff4d'; // Light green for good
  } else {
    return '#00cc00'; // Bright green for excellent
  }
}

// Format date for display
function formatDate(dateString) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}

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

// Update the getAIReflection function in emotions.js

// Get AI reflection on mood entry
async function getAIReflection(rating, notes) {
  try {
    // Check if AI is enabled in settings
    const settings = await window.api.getSettings();
    if (!settings.enableAI || settings.aiModel === 'none') {
      return;
    }
    
    // Only get reflection if notes are provided
    if (!notes || notes.trim() === '') {
      return;
    }
    
    // Use our AI helper to get a reflection
    let reflection = "AI reflections are not available.";
    
    if (window.aiHelper && window.aiHelper.isAvailable()) {
      reflection = await window.aiHelper.getReflection(notes, rating);
    }
    
    // Show reflection if on graph page
    const aiReflectionEl = document.getElementById('ai-reflection');
    if (aiReflectionEl) {
      aiReflectionEl.textContent = reflection || 'No reflection available.';
    }
    
  } catch (error) {
    console.error('Error getting AI reflection:', error);
  }
}

// Update mood graph with emotion data
function updateMoodGraph(emotions) {
  const moodChart = document.getElementById('mood-chart');
  if (!moodChart) return; // Not on graph page
  
  // Prepare data for chart
  const dates = emotions.map(e => e.date).reverse();
  const ratings = emotions.map(e => e.rating).reverse();
  
  // Get chart context
  const ctx = moodChart.getContext('2d');
  
  // Destroy existing chart if it exists
  if (window.moodChartInstance) {
    window.moodChartInstance.destroy();
  }
  
  // Create new chart
  window.moodChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Mood Rating',
        data: ratings,
        borderColor: '#7c9eb2',
        backgroundColor: 'rgba(124, 158, 178, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          min: 1,
          max: 10,
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Mood Rating'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              const emotion = emotions[emotions.length - 1 - index];
              let label = `Rating: ${emotion.rating}/10`;
              if (emotion.notes) {
                label += `\nNotes: ${emotion.notes.substring(0, 50)}${emotion.notes.length > 50 ? '...' : ''}`;
              }
              return label;
            }
          }
        }
      }
    }
  });
}

// Add CSS for mood colors and notifications
const style = document.createElement('style');
style.textContent = `
  .mood-terrible { color: #d9534f; }
  .mood-bad { color: #f0ad4e; }
  .mood-neutral { color: #5bc0de; }
  .mood-good { color: #5cb85c; }
  .mood-great { color: #428bca; }
  
  /* Add missing CSS variable */
  :root {
    --success-color: #5cb85c;
  }
  
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s, transform 0.3s;
    z-index: 1000;
  }
  
  .notification.show {
    opacity: 1;
    transform: translateY(0);
  }
  
  .notification.success {
    background-color: #5cb85c;
  }
  
  .notification.error {
    background-color: #d9534f;
  }
  
  .notification.info {
    background-color: #5bc0de;
  }
  
  .loading, .no-entries, .error {
    padding: 20px;
    text-align: center;
    color: #777;
  }
  
  .error {
    color: #d9534f;
  }
`;
document.head.appendChild(style);


// Show progress reflection modal
async function showProgressReflection() {
  try {
    // Get all emotions from database
    const emotions = await window.api.getEmotions();
    
    if (emotions.length < 2) {
      showNotification('You need at least two entries to see your progress.', 'info');
      return;
    }
    
    // Get oldest and newest entries
    const oldestEntry = emotions[emotions.length - 1];
    const newestEntry = emotions[0];
    
    // Calculate days between entries
    const oldestDate = new Date(oldestEntry.date);
    const newestDate = new Date(newestEntry.date);
    const daysDifference = Math.floor((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
    
    // Calculate average mood change
    const moodChange = newestEntry.rating - oldestEntry.rating;
    const moodChangeText = moodChange > 0 
      ? `improved by ${moodChange} points` 
      : moodChange < 0 
        ? `decreased by ${Math.abs(moodChange)} points` 
        : 'remained the same';
    
    // Create modal for reflection
    const modal = document.createElement('div');
    modal.className = 'reflection-modal';
    
    // Create modal content
    modal.innerHTML = `
      <div class="reflection-content">
        <h2>Your Healing Journey</h2>
        <p class="journey-summary">You've been tracking your healing for <strong>${daysDifference} days</strong>. Your mood has ${moodChangeText} since you started.</p>
        
        <div class="entries-comparison">
          <div class="entry-column old">
            <h3>Where You Started</h3>
            <div class="entry-date">${formatDate(oldestEntry.date)}</div>
            <div class="entry-rating ${getRatingClass(oldestEntry.rating)}">${oldestEntry.rating}/10</div>
            <div class="entry-notes">${oldestEntry.notes || 'No notes'}</div>
          </div>
          
          <div class="entry-column new">
            <h3>Where You Are Now</h3>
            <div class="entry-date">${formatDate(newestEntry.date)}</div>
            <div class="entry-rating ${getRatingClass(newestEntry.rating)}">${newestEntry.rating}/10</div>
            <div class="entry-notes">${newestEntry.notes || 'No notes'}</div>
          </div>
        </div>
        
        <div class="reflection-message">
          ${getReflectionMessage(daysDifference, moodChange)}
        </div>
        
        <button class="close-modal">Close</button>
      </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Add event listener to close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
  } catch (error) {
    console.error('Error showing reflection:', error);
    showNotification('Failed to load reflection. Please try again.', 'error');
  }
}

// Get reflection message based on progress
function getReflectionMessage(days, moodChange) {
  // Positive progress
  if (moodChange > 0) {
    if (moodChange >= 3) {
      return `<p>You've made <strong>significant progress</strong> in your healing journey. Look at how far you've come! The path isn't always straight, but you're moving forward.</p>`;
    } else {
      return `<p>You're making <strong>steady progress</strong> in your healing. Every step forward matters, no matter how small it might seem.</p>`;
    }
  } 
  // No change
  else if (moodChange === 0) {
    return `<p>Healing isn't always about feeling better right away. <strong>Consistency</strong> in tracking your emotions is a victory in itself. You're showing up for yourself.</p>`;
  } 
  // Negative change
  else {
    return `<p>Healing isn't linear, and it's completely normal to have ups and downs. <strong>Be gentle with yourself</strong> during this process. Each difficult day is teaching you something valuable.</p>`;
  }
}

// Add CSS for reflection modal
style.textContent += `
  .secondary-button {
    background-color: var(--light-accent);
    color: var(--dark-accent);
    border: 1px solid var(--primary-color);
    padding: 12px 25px;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 1rem;
    margin-left: 10px;
    transition: background-color 0.3s ease;
  }
  
  .secondary-button:hover {
    background-color: var(--primary-color);
    color: white;
  }
  
  .reflection-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .reflection-content {
    background-color: white;
    border-radius: var(--border-radius);
    padding: 30px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .journey-summary {
    margin: 20px 0;
    font-size: 1.1rem;
  }
  
  .entries-comparison {
    display: flex;
    gap: 20px;
    margin: 30px 0;
  }
  
  .entry-column {
    flex: 1;
    padding: 20px;
    border-radius: var(--border-radius);
  }
  
  .entry-column.old {
    background-color: #f8f9fa;
    border-left: 4px solid #6c757d;
  }
  
  .entry-column.new {
    background-color: var(--light-accent);
    border-left: 4px solid var(--primary-color);
  }
  
  .reflection-message {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: var(--border-radius);
    margin: 20px 0;
    font-size: 1.1rem;
    border-left: 4px solid var(--success-color);
  }
  
  .close-modal {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 12px 25px;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 1rem;
    display: block;
    margin: 20px auto 0;
  }
  
  @media (max-width: 768px) {
    .entries-comparison {
      flex-direction: column;
    }
  }
`;