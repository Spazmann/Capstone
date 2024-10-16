document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  const passwordOverlay = document.getElementById('passwordOverlay');
  const createAccountButton = document.querySelector('.create-account');
  const userForm = document.getElementById('userForm');
  const closeButtons = document.querySelectorAll('.close-button');

  let savedUsername = '';
  let savedEmail = '';

  // Open user details modal
  createAccountButton.addEventListener('click', () => {
      overlay.classList.add('visible');
      passwordOverlay.classList.remove('visible');
  });

  // Close modals on close button click
  closeButtons.forEach(button => {
      button.addEventListener('click', () => {
          overlay.classList.remove('visible');
          passwordOverlay.classList.remove('visible');
      });
  });

  // Handle user form submission
  userForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent page reload

      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;

      if (!username || !email) {
          alert('Please fill in all fields.');
          return;
      }

      try {
          const response = await fetch('/api/checkuseremail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, email }),
          });

          const result = await response.json();

          if (response.ok) {
              // Save username and email for later use
              savedUsername = username;
              savedEmail = email;

              // Switch to password setup modal
              overlay.classList.remove('visible');
              passwordOverlay.classList.add('visible');
          } else {
              alert(result.message); // Show error message
          }
      } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while checking the username and email.');
      }
  });

  // Populate the "Year" select dropdown
  const yearSelect = document.getElementById('year');
  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= 1904; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
  }
});
