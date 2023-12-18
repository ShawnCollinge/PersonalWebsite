  // Function to set a cookie
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }

  // Function to get a cookie
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('dark-mode-toggle');
    const currentMode = getCookie('darkMode');

    // Apply dark mode based on cookie
    if (currentMode === 'enabled') {
      document.body.classList.add('dark-mode');
    }

    toggle.addEventListener('click', function(event) {
      event.preventDefault();
      document.body.classList.toggle('dark-mode');

      // Update cookie based on current state
      var mode = document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled';
      setCookie('darkMode', mode, 7); // Save for 7 days, adjust as needed
    });
  });