document.addEventListener('DOMContentLoaded', function() {
    const profile = document.querySelector('.profile');
  
    profile.addEventListener('click', function() {
      profile.classList.toggle('active');
    });
  
    document.addEventListener('click', function(event) {
      if (!profile.contains(event.target)) {
        profile.classList.remove('active');
      }
    });
  });
  