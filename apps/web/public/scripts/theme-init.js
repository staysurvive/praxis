(() => {
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const themeColor = document.querySelector('[data-theme-color-override]');
  const themeColorFallbacks = document.querySelectorAll('[data-theme-color-fallback]');

  function explicitTheme() {
    const theme = root.dataset.theme;
    return theme === 'light' || theme === 'dark' ? theme : undefined;
  }

  function resolvedTheme() {
    return explicitTheme() ?? (systemTheme.matches ? 'dark' : 'light');
  }

  function syncThemeColor() {
    if (!(themeColor instanceof HTMLMetaElement)) return;

    const color =
      resolvedTheme() === 'dark'
        ? themeColor.dataset.themeColorDark
        : themeColor.dataset.themeColorLight;

    if (color) themeColor.content = color;

    for (const fallback of themeColorFallbacks) {
      if (fallback instanceof HTMLMetaElement) fallback.media = 'not all';
    }
    themeColor.media = 'all';
  }

  try {
    const storedTheme = localStorage.getItem('praxis-theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      root.dataset.theme = storedTheme;
    }
  } catch {
    // Storage access can be blocked; the CSS/system preference remains usable.
  }

  syncThemeColor();
  root.classList.add('js');
})();
