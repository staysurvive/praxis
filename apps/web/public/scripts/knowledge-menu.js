(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const menus = document.querySelectorAll('[data-knowledge-menu]');

  for (const menu of menus) {
    if (!(menu instanceof HTMLDetailsElement)) continue;

    const menuContainer = menu.closest('[data-knowledge-menu-container]');
    if (!(menuContainer instanceof HTMLElement)) continue;

    const trigger = menu.querySelector('[data-knowledge-menu-trigger]');
    if (!(trigger instanceof HTMLElement)) continue;

    let openedByHover = false;

    const closeMenu = ({ restoreFocus = false } = {}) => {
      const shouldRestoreFocus = restoreFocus && menu.contains(document.activeElement);

      menu.open = false;
      openedByHover = false;

      if (shouldRestoreFocus) {
        requestAnimationFrame(() => trigger.focus());
      }
    };

    menuContainer.addEventListener('mouseenter', () => {
      if (!finePointer.matches || menu.open) return;

      menu.open = true;
      openedByHover = true;
    });

    menuContainer.addEventListener('mouseleave', () => {
      if (finePointer.matches && !menuContainer.matches(':focus-within')) closeMenu();
    });

    trigger.addEventListener('click', (event) => {
      if (!finePointer.matches || event.detail <= 0) {
        openedByHover = false;
        return;
      }

      if (menu.open && openedByHover) event.preventDefault();
      openedByHover = false;
    });

    menuContainer.addEventListener('focusout', (event) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && menuContainer.contains(nextTarget)) return;
      if (!menuContainer.matches(':hover')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.open) return;

      event.preventDefault();
      closeMenu({ restoreFocus: menu.contains(document.activeElement) });
    });

    document.addEventListener('pointerdown', (event) => {
      const target = event.target;
      if (!(target instanceof Node) || menuContainer.contains(target)) return;

      const focusableTarget =
        target instanceof Element &&
        target.closest(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
        );

      closeMenu({ restoreFocus: !focusableTarget });
    });
  }
})();
