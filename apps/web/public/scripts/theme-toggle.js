(() => {
  const stateKey = '__praxisThemeToggle';
  const existingState = window[stateKey];

  if (existingState && typeof existingState.init === 'function') {
    existingState.init();
    return;
  }

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let transitionTimer;
  let transitionButton;

  function explicitTheme() {
    const theme = document.documentElement.dataset.theme;
    return theme === 'light' || theme === 'dark' ? theme : undefined;
  }

  function resolvedTheme() {
    return explicitTheme() ?? (systemTheme.matches ? 'dark' : 'light');
  }

  function restoreSavedTheme() {
    try {
      const savedTheme = localStorage.getItem('praxis-theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        document.documentElement.dataset.theme = savedTheme;
      }
    } catch {
      // Theme persistence is optional; the CSS/system preference remains the fallback.
    }
  }

  function syncThemeColor() {
    const themeColor = document.querySelector('[data-theme-color-override]');
    const themeColorFallbacks = document.querySelectorAll('[data-theme-color-fallback]');
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

  function currentButton() {
    const button = document.querySelector('[data-theme-toggle]');
    return button instanceof HTMLButtonElement ? button : undefined;
  }

  function updateButtonLabel(button = currentButton()) {
    if (!button) return;

    const nextLabel =
      resolvedTheme() === 'dark' ? button.dataset.lightLabel : button.dataset.darkLabel;

    if (nextLabel) {
      button.setAttribute('aria-label', nextLabel);
      button.title = nextLabel;
    }
  }

  function clearIconTransition() {
    window.clearTimeout(transitionTimer);
    if (transitionButton instanceof HTMLButtonElement) {
      delete transitionButton.dataset.themeTransition;
    }
    transitionButton = undefined;
  }

  function playIconTransition(button, nextTheme) {
    if (reducedMotion.matches || !finePointer.matches) return;

    clearIconTransition();
    transitionButton = button;
    button.dataset.themeTransition = `to-${nextTheme}`;
    transitionTimer = window.setTimeout(clearIconTransition, 300);
  }

  function handleThemeClick(event) {
    const target = event.target;
    const button = target instanceof Element ? target.closest('[data-theme-toggle]') : undefined;
    if (!(button instanceof HTMLButtonElement)) return;
    if (transitionButton === button && button.dataset.themeTransition) return;

    delete button.dataset.themeTransition;
    const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;

    try {
      localStorage.setItem('praxis-theme', next);
    } catch {
      // Theme persistence is optional; the CSS/system preference remains the fallback.
    }

    syncThemeColor();
    updateButtonLabel(button);
    playIconTransition(button, next);
  }

  function handleSystemThemeChange() {
    if (explicitTheme()) return;

    syncThemeColor();
    updateButtonLabel();
  }

  function teardownThemeToggle() {
    const button = currentButton();
    clearIconTransition();
    if (!button) return;

    delete button.dataset.themeTransition;
    delete button.dataset.themeToggleReady;
  }

  function initThemeToggle() {
    const button = currentButton();
    if (!button) return;

    delete button.dataset.themeTransition;
    restoreSavedTheme();
    syncThemeColor();
    updateButtonLabel(button);
    button.dataset.themeToggleReady = 'true';
  }

  window[stateKey] = { init: initThemeToggle };
  document.addEventListener('click', handleThemeClick);
  document.addEventListener('astro:before-swap', teardownThemeToggle);
  document.addEventListener('astro:page-load', initThemeToggle);
  systemTheme.addEventListener('change', handleSystemThemeChange);
  initThemeToggle();
})();
