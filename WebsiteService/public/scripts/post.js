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
  
  