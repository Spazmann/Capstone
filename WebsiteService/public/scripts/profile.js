document.querySelectorAll('.nav button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav button').forEach(btn => btn.classList.remove('active'));
  
      button.classList.add('active');
  
      localStorage.setItem('activeNav', button.dataset.nav);
    });
  });
  
  window.addEventListener('DOMContentLoaded', () => {
    const activeNav = localStorage.getItem('activeNav');
    if (activeNav) {
      const button = document.querySelector(`.nav button[data-nav="${activeNav}"]`);
      if (button) button.classList.add('active');
    }
  });
  