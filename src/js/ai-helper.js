// AI Helper for Heartline app
// Handles communication with Ollama for AI-powered reflections and motivation

let ollamaAvailable = false;
const OLLAMA_URL = 'http://localhost:11434';
const MODEL_NAME = 'mistral';

// Initialize Ollama connection
async function initOllama() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      ollamaAvailable = data.models.some(model => model.name === MODEL_NAME);
      
      if (!ollamaAvailable) {
        console.log(`Mistral model not found. Attempting to pull ${MODEL_NAME}...`);
        await pullMistralModel();
      } else {
        console.log('Mistral model is available');
      }
    } else {
      console.error('Ollama server not responding. Is it running?');
      showOllamaError();
    }
  } catch (error) {
    console.error('Failed to connect to Ollama:', error);
    showOllamaError();
  }
}

// Pull Mistral model if not available
async function pullMistralModel() {
  try {
    showNotification('Downloading Mistral model. This may take a few minutes...', 'info', 10000);
    
    const response = await fetch(`${OLLAMA_URL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: MODEL_NAME })
    });
    
    if (response.ok) {
      ollamaAvailable = true;
      showNotification('Mistral model downloaded successfully!', 'success');
    } else {
      console.error('Failed to pull Mistral model');
      showOllamaError();
    }
  } catch (error) {
    console.error('Error pulling Mistral model:', error);
    showOllamaError();
  }
}

// Get AI reflection on emotional entry
async function getReflection(text, rating) {
  if (!ollamaAvailable) {
    return "AI reflections are not available. Please check if Ollama is running.";
  }
  
  try {
    const prompt = `
    You are a compassionate AI assistant helping someone process their emotions.
    
    The person has shared the following about how they're feeling (rated ${rating}/10, where 10 is excellent):
    
    "${text}"
    
    Please provide a thoughtful, empathetic response that:
    1. Acknowledges their feelings without judgment
    2. Offers gentle perspective or reframing if appropriate
    3. Provides encouragement or a small actionable suggestion
    4. Keeps the response under 150 words and conversational
    
    Your response:`;
    
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.response.trim();
    } else {
      console.error('Failed to get AI reflection');
      return "I couldn't generate a reflection at this time. Please try again later.";
    }
  } catch (error) {
    console.error('Error getting AI reflection:', error);
    return "I couldn't connect to the AI service. Please check if Ollama is running.";
  }
}

// Get daily affirmation or motivation
async function getDailyAffirmation() {
  if (!ollamaAvailable) {
    return "AI affirmations are not available. Please check if Ollama is running.";
  }
  
  try {
    const prompt = `
    Generate a single, powerful affirmation or motivational quote for someone healing from heartbreak.
    The affirmation should be:
    1. Positive and empowering
    2. Focused on growth, self-worth, or healing
    3. Brief (under 30 words)
    4. Not cliché
    
    Just provide the affirmation itself with no additional text.`;
    
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        stream: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.response.trim();
    } else {
      console.error('Failed to get daily affirmation');
      return "Your healing journey is valid. Each day brings new strength, even when you can't see it yet.";
    }
  } catch (error) {
    console.error('Error getting daily affirmation:', error);
    return "Your healing journey is valid. Each day brings new strength, even when you can't see it yet.";
  }
}

// Show Ollama error notification
function showOllamaError() {
  showNotification(
    'Could not connect to Ollama. Please make sure it\'s installed and running.',
    'error',
    8000
  );
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
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
  
  // Hide after specified duration
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

// Export functions
window.aiHelper = {
  initOllama,
  getReflection,
  getDailyAffirmation,
  isAvailable: () => ollamaAvailable
};