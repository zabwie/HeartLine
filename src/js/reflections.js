// Reflections.js - Handles AI reflections and motivation

document.addEventListener('DOMContentLoaded', () => {
  // Initialize reflection elements
  const aiReflectionEl = document.getElementById('ai-reflection');
  
  if (aiReflectionEl) {
    aiReflectionEl.textContent = 'AI reflections will appear here after you log your emotions.';
  }
  
  // Set up week/month/all time view buttons for graph
  const weekViewBtn = document.getElementById('week-view');
  const monthViewBtn = document.getElementById('month-view');
  const allViewBtn = document.getElementById('all-view');
  
  if (weekViewBtn && monthViewBtn && allViewBtn) {
    weekViewBtn.addEventListener('click', () => updateGraphTimeRange('week'));
    monthViewBtn.addEventListener('click', () => updateGraphTimeRange('month'));
    allViewBtn.addEventListener('click', () => updateGraphTimeRange('all'));
  }
});

// Update graph based on selected time range
async function updateGraphTimeRange(range) {
  try {
    // Update active button
    document.getElementById('week-view').classList.remove('active');
    document.getElementById('month-view').classList.remove('active');
    document.getElementById('all-view').classList.remove('active');
    document.getElementById(`${range}-view`).classList.add('active');
    
    // Calculate date range
    let startDate = null;
    const endDate = new Date().toISOString().split('T')[0]; // Today
    
    if (range === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
    } else if (range === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
    }
    
    // Get emotions for the selected time range
    const timeRange = startDate ? { startDate, endDate } : null;
    const emotions = await window.api.getEmotions(timeRange);
    
    // Update graph
    updateMoodGraph(emotions);
    
  } catch (error) {
    console.error('Error updating graph time range:', error);
  }
}