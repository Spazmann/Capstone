document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  const passwordOverlay = document.getElementById('passwordOverlay');
  const loginOverlay = document.getElementById('loginOverlay');
  const createAccountButton = document.querySelector('.create-account');
  const loginLink = document.querySelector('.login-link');
  const userForm = document.getElementById('userForm');
  const closeButtons = document.querySelectorAll('.close-button');

  let savedUsername = '';
  let savedEmail = '';
  let savedBirthDate = '';

  createAccountButton.addEventListener('click', () => {
      overlay.classList.add('visible');
      passwordOverlay.classList.remove('visible');
  });

  loginLink.addEventListener('click', (e) => {
    e.preventDefault(); 
    loginOverlay.classList.add('visible');
    overlay.classList.remove('visible');
    passwordOverlay.classList.remove('visible');
  });

  closeButtons.forEach(button => {
      button.addEventListener('click', () => {
          overlay.classList.remove('visible');
          passwordOverlay.classList.remove('visible');
          loginOverlay.classList.remove('visible');
      });
  });

  userForm.addEventListener('submit', async (e) => {
      e.preventDefault(); 

      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const month = document.getElementById('month').value;
      const day = document.getElementById('day').value;
      const year = document.getElementById('year').value;

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
              savedUsername = username;
              savedEmail = email;
              savedBirthDate = `${year}-${month}-${day}`;

              overlay.classList.remove('visible');
              passwordOverlay.classList.add('visible');
          } else {
              alert(result.message); 
          }
      } catch (error) {
          console.error('Error:', error);
          alert('An error occurred while checking the username and email.');
      }
  });

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const userData = {
      username: savedUsername,
      password: password,
      email: savedEmail,
      birthDate: savedBirthDate
    };

    try {
      const response = await fetch('/createAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        alert('Account created successfully!');
        window.location.href = '/home'; 
      } else {
        const result = await response.text();
        alert(`Failed to create user: ${result}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while creating the user.');
    }
  });

  const yearSelect = document.getElementById('year');
  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= 1904; year--) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
  }
});
