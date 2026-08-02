(() => {
  const button = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const themeColor = document.querySelector('meta[name="theme-color"]');

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
  }

  function updateButtonLabel() {
    if (!(button instanceof HTMLButtonElement)) return;

    const nextLabel =
      resolvedTheme() === 'dark' ? button.dataset.lightLabel : button.dataset.darkLabel;

    if (nextLabel) {
      button.setAttribute('aria-label', nextLabel);
      button.title = nextLabel;
    }
  }

  button?.addEventListener('click', () => {
    const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;

    try {
      localStorage.setItem('praxis-theme', next);
    } catch {
      // Theme persistence is optional; the CSS/system preference remains the fallback.
    }

    syncThemeColor();
    updateButtonLabel();
  });

  systemTheme.addEventListener('change', () => {
    if (explicitTheme()) return;

    syncThemeColor();
    updateButtonLabel();
  });

  syncThemeColor();
  updateButtonLabel();
})();
