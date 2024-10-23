document.addEventListener('DOMContentLoaded', function () {
    // Cache the sections and sidebar items we need
    const contentSections = document.querySelectorAll('.content-section');
    const sidebarItems = document.querySelectorAll('.sidebar li');
  
    // Specific form sections for editing
    const editUsernameSection = document.getElementById('edit-username');
    const editEmailSection = document.getElementById('edit-email');
    const editLocationSection = document.getElementById('edit-location');
    const editLanguagesSection = document.getElementById('edit-languages');
    const editGenderSection = document.getElementById('edit-gender');
    const editAgeSection = document.getElementById('edit-age');
  
    // Map from sections to their corresponding content edit sections
    const sectionMap = {
      'username-section': editUsernameSection,
      'email-section': editEmailSection,
      'location-section': editLocationSection,
      'languages-section': editLanguagesSection,
      'gender-section': editGenderSection,
      'age-section': editAgeSection,
    };
  
    // Function to hide all content sections
    function hideAllSections() {
      contentSections.forEach((section) => {
        section.classList.remove('active');
        section.classList.add('hidden');
      });
    }
  
    // Function to reset active class on sidebar
    function resetSidebarActive() {
      sidebarItems.forEach((item) => {
        item.classList.remove('active');
      });
    }
  
    // Add click event listeners for each sidebar item
    sidebarItems.forEach((item) => {
      item.addEventListener('click', function () {
        hideAllSections(); // Hide all content sections
        resetSidebarActive(); // Remove active class from all sidebar items
  
        // Set the clicked item as active
        item.classList.add('active');
  
        // Get the section ID from the data-section attribute
        const sectionId = item.getAttribute('data-section');
        const targetSection = document.getElementById(sectionId);
  
        // Show the correct section based on the data-section
        if (targetSection) {
          targetSection.classList.add('active');
          targetSection.classList.remove('hidden');
        }
      });
    });
  
    // Add click event listeners for specific sections to trigger the editing form
    Object.keys(sectionMap).forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.addEventListener('click', function () {
          hideAllSections(); // Hide all sections before showing edit form
          const targetEditSection = sectionMap[sectionId];
          if (targetEditSection) {
            targetEditSection.classList.add('active');
            targetEditSection.classList.remove('hidden');
          }
        });
      }
    });
  
    // Initial activation of the default section (Account Info)
    document.querySelector('.sidebar li[data-section="account-info"]').click();
  });
  