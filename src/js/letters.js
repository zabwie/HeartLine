// Letters.js - Handles unsent letters functionality

document.addEventListener('DOMContentLoaded', () => {
  const saveLetterBtn = document.getElementById('save-letter');
  
  if (saveLetterBtn) {
    saveLetterBtn.addEventListener('click', saveLetter);
  }
});

// Save letter to database
async function saveLetter() {
  try {
    const recipient = document.getElementById('letter-recipient').value.trim();
    const content = document.getElementById('letter-content').value.trim();
    const isEncrypted = document.getElementById('encrypt-letter').checked;
    
    if (!content) {
      showNotification('Please write something in your letter.', 'info');
      return;
    }
    
    await window.api.saveLetter({ recipient, content, isEncrypted });
    
    // Clear form
    document.getElementById('letter-recipient').value = '';
    document.getElementById('letter-content').value = '';
    document.getElementById('encrypt-letter').checked = false;
    
    // Refresh letters list
    loadLetters();
    
    // Show success message
    showNotification('Letter saved successfully!', 'success');
    
  } catch (error) {
    console.error('Error saving letter:', error);
    showNotification('Failed to save letter. Please try again.', 'error');
  }
}

// Load letters from database
async function loadLetters() {
  try {
    const lettersContainer = document.getElementById('saved-letters');
    if (!lettersContainer) return;
    
    lettersContainer.innerHTML = '<div class="loading">Loading letters...</div>';
    
    const letters = await window.api.getLetters();
    
    if (letters.length === 0) {
      lettersContainer.innerHTML = '<div class="no-letters">No letters yet. Write your first unsent letter.</div>';
      return;
    }
    
    lettersContainer.innerHTML = '';
    
    // Get settings to check if letters should be locked by default
    const settings = await window.api.getSettings();
    const lockByDefault = settings.lockLetters === 'true';
    
    letters.forEach(letter => {
      const letterEl = document.createElement('div');
      letterEl.className = 'letter-card';
      letterEl.dataset.id = letter.id;
      
      const date = new Date(letter.created_at);
      const formattedDate = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const isLocked = lockByDefault || letter.is_encrypted === 1;
      
      // Create letter header with recipient and delete button
      const letterHeader = document.createElement('div');
      letterHeader.className = 'letter-header';
      
      const recipientEl = document.createElement('div');
      recipientEl.className = 'letter-recipient';
      recipientEl.textContent = letter.recipient || 'Unsent Letter';
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'letter-delete';
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.title = 'Delete letter';
      deleteButton.onclick = (e) => {
        e.stopPropagation();
        deleteLetter(letter.id);
      };
      
      letterHeader.appendChild(recipientEl);
      letterHeader.appendChild(deleteButton);
      
      letterEl.appendChild(letterHeader);
      
      // Add date
      const dateEl = document.createElement('div');
      dateEl.className = 'letter-date';
      dateEl.textContent = formattedDate;
      letterEl.appendChild(dateEl);
      
      // Add content
      const contentEl = document.createElement('div');
      contentEl.className = `letter-content ${isLocked ? 'letter-locked' : ''}`;
      contentEl.textContent = letter.content;
      letterEl.appendChild(contentEl);
      
      // Add unlock button if needed
      if (isLocked) {
        const unlockButton = document.createElement('button');
        unlockButton.className = 'letter-unlock';
        unlockButton.textContent = 'Unlock';
        unlockButton.addEventListener('click', (e) => {
          e.target.previousElementSibling.classList.remove('letter-locked');
          e.target.remove();
        });
        letterEl.appendChild(unlockButton);
      }
      
      lettersContainer.appendChild(letterEl);
    });
    
  } catch (error) {
    console.error('Error loading letters:', error);
    document.getElementById('saved-letters').innerHTML = 
      '<div class="error">Failed to load letters. Please refresh the page.</div>';
  }
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

// Function to create a letter card
function createLetterCard(letter) {
  const letterCard = document.createElement('div');
  letterCard.className = 'letter-card';
  letterCard.dataset.id = letter.id;
  
  // Create letter header with recipient and delete button
  const letterHeader = document.createElement('div');
  letterHeader.className = 'letter-header';
  
  const recipientEl = document.createElement('div');
  recipientEl.className = 'letter-recipient';
  recipientEl.textContent = `To: ${letter.recipient}`;
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'letter-delete';
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
  deleteButton.title = 'Delete letter';
  deleteButton.onclick = (e) => {
    e.stopPropagation();
    deleteLetter(letter.id);
  };
  
  letterHeader.appendChild(recipientEl);
  letterHeader.appendChild(deleteButton);
  letterCard.appendChild(letterHeader);
  
  // Add date
  const dateEl = document.createElement('div');
  dateEl.className = 'letter-date';
  dateEl.textContent = new Date(letter.date).toLocaleDateString();
  letterCard.appendChild(dateEl);
  
  // Add content
  const contentEl = document.createElement('div');
  contentEl.className = 'letter-content';
  contentEl.textContent = letter.content;
  letterCard.appendChild(contentEl);
  
  return letterCard;
}

// Function to delete a letter
async function deleteLetter(letterId) {
  try {
    if (confirm('Are you sure you want to delete this letter? This action cannot be undone.')) {
      await window.api.deleteLetter(letterId);
      loadLetters(); // Refresh the letters list
    }
  } catch (error) {
    console.error('Error deleting letter:', error);
    alert('Failed to delete letter. Please try again.');
  }
}