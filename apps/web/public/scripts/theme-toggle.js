(() => {
  const button = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const themeColor = document.querySelector('[data-theme-color-override]');
  const themeColorFallbacks = document.querySelectorAll('[data-theme-color-fallback]');
  let transitionTimer;

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

  function updateButtonLabel() {
    if (!(button instanceof HTMLButtonElement)) return;

    const nextLabel =
      resolvedTheme() === 'dark' ? button.dataset.lightLabel : button.dataset.darkLabel;

    if (nextLabel) {
      button.setAttribute('aria-label', nextLabel);
      button.title = nextLabel;
    }
  }

  function playIconTransition(nextTheme) {
    if (!(button instanceof HTMLButtonElement) || reducedMotion.matches || !finePointer.matches) {
      return;
    }

    button.dataset.themeTransition = `to-${nextTheme}`;
    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      delete button.dataset.themeTransition;
    }, 300);
  }

  if (button instanceof HTMLButtonElement) {
    button.addEventListener('click', () => {
      if (button.dataset.themeTransition) return;

      const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;

      try {
        localStorage.setItem('praxis-theme', next);
      } catch {
        // Theme persistence is optional; the CSS/system preference remains the fallback.
      }

      syncThemeColor();
      updateButtonLabel();
      playIconTransition(next);
    });
  }

  systemTheme.addEventListener('change', () => {
    if (explicitTheme()) return;

    syncThemeColor();
    updateButtonLabel();
  });

  syncThemeColor();
  updateButtonLabel();
  if (button instanceof HTMLButtonElement) button.dataset.themeToggleReady = 'true';
})();
