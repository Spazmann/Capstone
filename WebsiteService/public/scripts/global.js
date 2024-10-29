document.addEventListener('DOMContentLoaded', () => {
  const profile = document.querySelector('.profile');
  const postButton = document.getElementById('postButton');
  const postModal = document.getElementById('postModal');
  const closeButton = document.querySelector('.close-button');
  const imageInput = document.getElementById('imageInput');
  const modalContent = document.querySelector('.modal-content');
  const submitPostButton = document.getElementById('submitPost');
  const textArea = modalContent.querySelector('textarea');

  postModal.style.display = 'none';

  profile.addEventListener('click', () => {
    profile.classList.toggle('active');
  });

  document.addEventListener('click', (event) => {
    if (!profile.contains(event.target)) {
      profile.classList.remove('active');
    }
  });

  postButton.addEventListener('click', () => {
    postModal.style.display = 'flex';
  });

  const closeModal = () => {
    postModal.style.display = 'none';
  };

  closeButton.addEventListener('click', closeModal);
  window.addEventListener('click', (event) => {
    if (event.target === postModal) closeModal();
  });

  const removePreviewImage = () => {
    const existingPreview = modalContent.querySelector('.preview-image');
    if (existingPreview) existingPreview.remove();
  };

  imageInput.addEventListener('change', (event) => {
    removePreviewImage();
    
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const imgPreview = document.createElement('img');
      imgPreview.src = imageUrl;
      imgPreview.classList.add('preview-image');
      modalContent.appendChild(imgPreview);
    }
  });

  submitPostButton.addEventListener('click', async () => {
    const content = textArea.value;
    const file = imageInput.files[0];

    const formData = new FormData();
    formData.append('content', content);
    if (file) {
      formData.append('image', file);
    }

    try {
      const response = await fetch('/post', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Post submitted successfully!');
        closeModal();
        textArea.value = '';
        imageInput.value = ''; 
        removePreviewImage();
      } else {
        alert('Failed to submit post.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the post.');
    }
  });
});
