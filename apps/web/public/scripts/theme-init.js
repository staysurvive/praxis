(() => {
  try {
    const storedTheme = localStorage.getItem('praxis-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      document.documentElement.dataset.theme = storedTheme;
    }
  } catch {
    // Storage access can be blocked; the CSS/system preference remains usable.
  }

  document.documentElement.classList.add('js');
})();
