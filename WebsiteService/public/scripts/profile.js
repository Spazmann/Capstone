document.querySelectorAll('.nav button').forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      document.querySelectorAll('.nav button').forEach(btn => btn.classList.remove('active'));
  
      // Add active class to the clicked button
      button.classList.add('active');
  
      // Optionally, store the clicked button in localStorage to persist across page reloads
      localStorage.setItem('activeNav', button.dataset.nav);
    });
  });
  
  // On page load, set the last active button (if it exists in localStorage)
  window.addEventListener('DOMContentLoaded', () => {
    const activeNav = localStorage.getItem('activeNav');
    if (activeNav) {
      const button = document.querySelector(`.nav button[data-nav="${activeNav}"]`);
      if (button) button.classList.add('active');
    }
  });
  