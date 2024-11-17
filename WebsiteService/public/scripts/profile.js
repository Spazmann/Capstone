document.addEventListener('DOMContentLoaded', () => {
  const userLikedPosts = window.userLikes || [];
  const feedContainer = document.getElementById('feedContainer');

  loadFeedContent('posts');

  document.querySelectorAll('.nav button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const nav = button.dataset.nav;
      loadFeedContent(nav);
    });
  });

  async function loadFeedContent(type) {
    feedContainer.innerHTML = `<p>Loading ${type}...</p>`;

    const baseUrl = `/post/user/${userId}/`;
    let endpoint;

    switch (type) {
      case 'posts':
        endpoint = `posts`;
        break;
      case 'replies':
        endpoint = `replies`;
        break;
      case 'media':
        endpoint = `media`;
        break;
      default:
        endpoint = `posts`;
    }

    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);

      const data = await response.json();
      renderFeed(data, feedContainer);
    } catch (error) {
      console.error(error);
      feedContainer.innerHTML = `<p>Failed to load ${type}.</p>`;
    }
  }

  async function renderFeed(data, container) {
    container.innerHTML = '';
  
    if (data.length === 0) {
      container.innerHTML = `<p>No content found.</p>`;
      return;
    }
  
    for (const post of data) {
      const userData = await fetchUserData(post.UserId);
      const profileImage = userData ? `https://capstonemedia.s3.amazonaws.com/${userData.Profile.profileImage}` : '/path/to/placeholder-image.jpg';
      const name = userData ? userData.Profile.name : 'Unknown User';
      const username = userData ? userData.Username : 'unknown';
  
      const postElement = document.createElement('div');
      postElement.classList.add('post-container');
  
      const repostContent = post.Repost
        ? `
          <div class="repost-container">
            <article class="post">
              <a href="/profile/${post.Repost.Username}" class="post-header">
                <img class="profile-image" src="https://capstonemedia.s3.amazonaws.com/${post.Repost.Profile.profileImage}" alt="Profile Image">
                <div class="user-info">
                  <h3 class="username">${post.Repost.Profile.name}</h3>
                  <span class="username-handle">@${post.Repost.Username}</span>
                  <span class="created-at">${new Date(post.Repost.CreatedAt).toLocaleString()}</span>
                </div>
              </a>
              <a class="post-content" href="/post/${post.Repost.Id}">
                <p>${post.Repost.Content}</p>
                ${
                  post.Repost.Media
                    ? `<div class="post-media"><img src="https://capstonemedia.s3.amazonaws.com/${post.Repost.Media}" alt="Post Image"></div>`
                    : ''
                }
              </a>
            </article>
          </div>
        `
        : '';
  
      postElement.innerHTML = `
        <article class="post">
          <a href="/profile/${username}" class="post-header">
            <img class="profile-image" src="${profileImage}" alt="Profile Image">
            <div class="user-info">
              <h3 class="username">${name}</h3>
              <span class="username-handle">@${username}</span>
              <span class="created-at">${new Date(post.CreatedAt).toLocaleString()}</span>
            </div>
          </a>
          <a class="post-content" href="/post/${post.Id}">
            <p>${post.Content}</p>
            ${
              post.Media
                ? `<div class="post-media"><img src="https://capstonemedia.s3.amazonaws.com/${post.Media}" alt="Post Image"></div>`
                : ''
            }
          </a>
          ${repostContent}
          <div class="post-actions">
            <button class="like-button ${userLikedPosts.includes(post.Id) ? 'liked' : ''}" data-post-id="${post.Id}">
              <i class="fas fa-heart"></i>
              <span class="like-count">${post.Likes}</span>
            </button>
            <button class="comment-button">
              <i class="fas fa-comment"></i>
              <span>${post.CommentCount}</span>
            </button>
            <div class="repost-dropdown-container">
              <button class="repost-button" data-post-id="${post.Id}">
                <i class="fas fa-retweet"></i>
                <span>${post.RepostCount}</span>
              </button>
              <div class="repost-dropdown hidden">
                <button class="quote-button" data-post-id="${post.Id}">Quote</button>
                <button class="repost-confirm-button" data-post-id="${post.Id}">Repost</button>
              </div>
            </div>
            <button class="bookmark-button" data-post-id="${post.Id}">
              <i class="fas fa-bookmark"></i>
              <span class="bookmark-count">${post.BookmarkCount}</span>
            </button>
          </div>
        </article>
      `;
  
      container.appendChild(postElement);
    }
  
    initializeLikeButtons();
  }
  

  async function fetchUserData(userId) {
    try {
      const response = await fetch(`/post/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function initializeLikeButtons() {
    document.querySelectorAll('.like-button').forEach(button => {
      const postId = button.getAttribute('data-post-id');

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
          const currentLikes = parseInt(likeCountElement.textContent.trim()) || 0;
          likeCountElement.textContent = isLiked ? ` ${currentLikes - 1}` : ` ${currentLikes + 1}`;
          button.classList.toggle('liked');
        } catch (error) {
          console.error("Error toggling like:", error);
        } finally {
          button.disabled = false;
        }
      });
    });
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
