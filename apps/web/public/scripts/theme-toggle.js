const button = document.querySelector('[data-theme-toggle]');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function resolvedTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return systemTheme.matches ? 'dark' : 'light';
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
  document.documentElement.dataset.theme = next;

  try {
    localStorage.setItem('praxis-theme', next);
  } catch {
    // Theme persistence is optional; the CSS/system preference remains the fallback.
  }

  updateButtonLabel();
});

systemTheme.addEventListener('change', updateButtonLabel);
updateButtonLabel();
