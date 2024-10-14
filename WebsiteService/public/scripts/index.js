document.addEventListener('DOMContentLoaded', () => {
    // Get elements after DOM is ready
    const overlay = document.getElementById('overlay');
    const passwordOverlay = document.getElementById('passwordOverlay');
    const createAccountButton = document.querySelector('.create-account');
    const userForm = document.getElementById('userForm');
    const closeButtons = document.querySelectorAll('.close-button');
  
    // Open the user details modal when "Create Account" button is clicked
    if (createAccountButton) {
      createAccountButton.addEventListener('click', () => {
        overlay.classList.add('visible');
        passwordOverlay.classList.remove('visible');
      });
    }
  
    // Close modals when close buttons are clicked
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        overlay.classList.remove('visible');
        passwordOverlay.classList.remove('visible');
      });
    });
  
    // Handle user form submission without page reload
    if (userForm) {
      userForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the page from refreshing
  
        // Example validation logic (add your own as needed)
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
  
        if (!username || !email) {
          alert('Please fill in all fields.');
          return;
        }
  
        // If validation passes, switch to password setup modal
        overlay.classList.remove('visible');
        passwordOverlay.classList.add('visible');
      });
    }

    const yearSelect = document.getElementById('year'); // Get the year select element
    const currentYear = new Date().getFullYear(); // Get the current year
  
    // Populate the "Year" select with options from 1904 to the current year
    for (let year = currentYear; year >= 1904; year--) {
      const option = document.createElement('option'); // Create new option element
      option.value = year; // Set the value to the current year in the loop
      option.textContent = year; // Display the year as text inside the option
      yearSelect.appendChild(option); // Add the option to the select
    }
  });
  