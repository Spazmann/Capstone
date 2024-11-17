document.addEventListener('DOMContentLoaded', () => {
  const userLikedPosts = window.userLikes || [];

  document.querySelectorAll('.like-button').forEach(button => {
    const postId = button.getAttribute('data-post-id');

    if (userLikedPosts.includes(postId)) {
      button.classList.add('liked');
    }

    button.addEventListener('click', async (event) => {
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

  // Add functionality for repost dropdown
  document.querySelectorAll('.repost-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const dropdown = button.nextElementSibling;
      dropdown.classList.toggle('hidden');
    });
  });

  document.querySelectorAll('.quote-button').forEach(button => {
    button.addEventListener('click', () => {
      // Add logic for quote reposting
      alert('Quote repost clicked!');
    });
  });

  document.querySelectorAll('.repost-confirm-button').forEach(button => {
    button.addEventListener('click', () => {
      // Add logic for reposting
      alert('Repost confirmed!');
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
