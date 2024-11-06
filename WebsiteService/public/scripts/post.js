function showImagePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('image-preview');
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = function(e) {
        preview.src = e.target.result;
        preview.hidden = false;
      };
  
      reader.readAsDataURL(file);
    } else {
      preview.hidden = true;
      preview.src = "";
    }
  }
  
  document.querySelector('.reply-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const postId = this.action.split('/').pop();
  
    try {
      const response = await fetch(`/reply/${postId}`, {
        method: 'POST',
        body: formData
      });
  
      if (response.ok) {
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error("Error submitting reply:", errorText);
        alert("There was an error submitting your reply. Please try again.");
      }
    } catch (error) {
      console.error("Error in reply submission:", error);
      alert("An error occurred. Please try again.");
    }
  });
  
  