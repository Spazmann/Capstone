// Get elements
const overlay = document.getElementById('overlay');
const createAccountButton = document.querySelector('.create-account');
const closeButton = document.querySelector('.close-button');

// Open the modal when "Create account" is clicked
createAccountButton.addEventListener('click', () => {
  overlay.classList.add('visible');
});

// Close the modal when the close button is clicked
closeButton.addEventListener('click', () => {
  overlay.classList.remove('visible');
});
