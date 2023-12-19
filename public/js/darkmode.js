document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('dark-mode-toggle');
  const icon = document.getElementById('dark-mode-icon');
  let currentMode = getCookie('darkMode');

  // Function to switch background classes
  function switchBackgroundClasses() {
    document.querySelectorAll('.bg-light, .bg-custom-dark').forEach(el => {
      el.classList.toggle('bg-light');
      el.classList.toggle('bg-custom-dark');
    });
  }

  // Function to switch the icon
  function updateIcon() {
    if (document.body.classList.contains('dark-mode')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  }

  // Set dark mode as the default if no cookie is set
  if (!currentMode) {
    setCookie('darkMode', 'enabled', 7);
    currentMode = 'enabled';
  }

  // Apply dark mode based on cookie or default
  if (currentMode === 'enabled') {
    document.body.classList.add('dark-mode');
    switchBackgroundClasses();
    updateIcon();
  }

  toggle.addEventListener('click', function(event) {
    event.preventDefault();
    document.body.classList.toggle('dark-mode');
    switchBackgroundClasses();
    updateIcon();

    // Update cookie based on current state
    var mode = document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled';
    setCookie('darkMode', mode, 7);
  });
});
