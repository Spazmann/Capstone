document.addEventListener('DOMContentLoaded', function () {
    const contentSections = document.querySelectorAll('.content-section');
    const sidebarItems = document.querySelectorAll('.sidebar li');
  
    const editUsernameSection = document.getElementById('edit-username');
    const editEmailSection = document.getElementById('edit-email');
    const editLocationSection = document.getElementById('edit-location');
    const editLanguagesSection = document.getElementById('edit-languages');
    const editGenderSection = document.getElementById('edit-gender');
    const editAgeSection = document.getElementById('edit-age');
  
    const sectionMap = {
      'username-section': editUsernameSection,
      'email-section': editEmailSection,
      'location-section': editLocationSection,
      'languages-section': editLanguagesSection,
      'gender-section': editGenderSection,
      'age-section': editAgeSection,
    };
  
    function hideAllSections() {
      contentSections.forEach((section) => {
        section.classList.remove('active');
        section.classList.add('hidden');
      });
    }
  
    function resetSidebarActive() {
      sidebarItems.forEach((item) => {
        item.classList.remove('active');
      });
    }
  
    sidebarItems.forEach((item) => {
      item.addEventListener('click', function () {
        hideAllSections();
        resetSidebarActive();
  
        item.classList.add('active');
  
        const sectionId = item.getAttribute('data-section');
        const targetSection = document.getElementById(sectionId);
  
        if (targetSection) {
          targetSection.classList.add('active');
          targetSection.classList.remove('hidden');
        }
      });
    });
  
    Object.keys(sectionMap).forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.addEventListener('click', function () {
          hideAllSections();
          const targetEditSection = sectionMap[sectionId];
          if (targetEditSection) {
            targetEditSection.classList.add('active');
            targetEditSection.classList.remove('hidden');
          }
        });
      }
    });
  
    document.querySelector('.sidebar li[data-section="account-info"]').click();
  });
  