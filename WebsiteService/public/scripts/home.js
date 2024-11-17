document.addEventListener('DOMContentLoaded', () => {
  const userLikedPosts = window.userLikes || [];

  // Handle like button logic
  document.querySelectorAll('.like-button').forEach(button => {
    const postId = button.getAttribute('data-post-id');

    if (userLikedPosts.includes(postId)) {
      button.classList.add('liked');
    }

    button.addEventListener('click', async () => {
      button.disabled = true;

      const isLiked = button.classList.contains('liked');

      try {
        const response = await fetch(`/post/like/${postId}`, {
          method: isLiked ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to toggle like for post with ID: ${postId}`);
        }

        const result = await response.json();

        const likeCountElement = button.querySelector('.like-count');
        if (likeCountElement) {
          const currentLikes = parseInt(likeCountElement.textContent.trim()) || 0;
          likeCountElement.textContent = isLiked ? ` ${currentLikes - 1}` : ` ${currentLikes + 1}`;
        }

        button.classList.toggle('liked');
      } catch (error) {
        console.error("Error toggling like:", error);
      } finally {
        button.disabled = false;
      }
    });
  });

  // Handle repost dropdown visibility
  document.querySelectorAll('.repost-button').forEach(button => {
    button.addEventListener('click', () => {
      const dropdown = button.nextElementSibling;
      dropdown.classList.toggle('hidden');
    });
  });

  // Handle quote repost button (placeholder logic)
  document.querySelectorAll('.quote-button').forEach(button => {
    button.addEventListener('click', () => {
      alert('Quote repost clicked!'); // Placeholder for quote repost logic
    });
  });

  // Handle repost confirm button
  document.querySelectorAll('.repost-confirm-button').forEach(button => {
    button.addEventListener('click', async () => {
      const postId = button.getAttribute('data-post-id'); // Get postId directly from the confirm button
  
      if (!postId) {
        console.error("Repost confirm button is missing a valid data-post-id attribute.");
        console.log("Repost confirm button element:", button.outerHTML);
        return;
      }
  
      try {
        const response = await fetch(`/post/repost/${postId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: null }) // No content or media for the repost
        });
  
        if (!response.ok) {
          throw new Error(`Failed to repost post with ID: ${postId}`);
        }
  
        const result = await response.json();
        console.log("Repost successful:", result);
  
        // Optionally reload or update the page
        window.location.reload();
      } catch (error) {
        console.error("Error reposting:", error);
      }
    });
  });
  

  // Close dropdowns when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.repost-dropdown-container')) {
      document.querySelectorAll('.repost-dropdown').forEach(dropdown => {
        dropdown.classList.add('hidden');
      });
    }
  });
});
