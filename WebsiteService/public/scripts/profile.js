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

    const editProfileButton = document.querySelector('.edit-profile');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeModalButton = editProfileModal.querySelector('.close-button');
  
    const profileImageInput = document.getElementById('profileImage');
    const bannerImageInput = document.getElementById('bannerImage');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const bannerImagePreview = document.getElementById('bannerImagePreview');
  
    editProfileButton.addEventListener('click', () => {
      editProfileModal.style.display = 'block';
    });
  
    closeModalButton.addEventListener('click', () => {
      editProfileModal.style.display = 'none';
    });
  
    window.addEventListener('click', (event) => {
      if (event.target === editProfileModal) {
        editProfileModal.style.display = 'none';
      }
    });
  
    profileImageInput.addEventListener('change', () => {
      const file = profileImageInput.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        profileImagePreview.src = imageUrl;
      }
    });
  
    bannerImageInput.addEventListener('change', () => {
      const file = bannerImageInput.files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        bannerImagePreview.src = imageUrl;
      }
    });
  
    document.getElementById('editProfileForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const name = document.getElementById('profileName').value;
      const profileImage = profileImageInput.files[0];
      const bannerImage = bannerImageInput.files[0];
  
      const formData = new FormData();
      formData.append('name', name);
      if (profileImage) formData.append('profileImage', profileImage);
      if (bannerImage) formData.append('bannerImage', bannerImage);
  
      const response = await fetch('/settings/editProfile', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        alert('Profile updated successfully!');
        editProfileModal.style.display = 'none';
        location.reload();
      } else {
        alert('Failed to update profile.');
      }
    });
  });
  