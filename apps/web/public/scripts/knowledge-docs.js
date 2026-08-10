(() => {
  const stateKey = '__praxisKnowledgeDocs';
  const existingState = window[stateKey];

  if (existingState && typeof existingState.init === 'function') {
    existingState.init();
    return;
  }

  let cleanupCurrentPage = () => {};

  const normalize = (value) => value.normalize('NFKC').trim().toLocaleLowerCase('zh-CN');

  const initKnowledgeDocs = () => {
    cleanupCurrentPage();

    const root = document.querySelector('[data-knowledge-docs]');
    if (!(root instanceof HTMLElement)) {
      cleanupCurrentPage = () => {};
      return;
    }

    const navigationPath = root.dataset.knowledgeNavigationPath;
    const locationUrl = new URL(window.location.href);
    if (
      navigationPath &&
      locationUrl.pathname === '/knowledge' &&
      (locationUrl.searchParams.has('section') || locationUrl.searchParams.has('item')) &&
      `${locationUrl.pathname}${locationUrl.search}` !== navigationPath
    ) {
      window.history.replaceState(window.history.state, '', `${navigationPath}${locationUrl.hash}`);
    }

    const inputs = Array.from(root.querySelectorAll('[data-knowledge-filter-input]')).filter(
      (input) => input instanceof HTMLInputElement,
    );
    const statuses = Array.from(root.querySelectorAll('[data-knowledge-filter-status]')).filter(
      (status) => status instanceof HTMLElement,
    );
    const emptyMessages = Array.from(
      root.querySelectorAll('[data-knowledge-filter-empty-message]'),
    ).filter((message) => message instanceof HTMLElement);
    const filterItems = Array.from(root.querySelectorAll('[data-knowledge-filter-item]')).filter(
      (item) => item instanceof HTMLElement,
    );
    const narrowViewport = window.matchMedia('(max-width: 63.99rem)');
    const cleanupCallbacks = [];

    if (narrowViewport.matches && root.dataset.knowledgeDocsBound !== 'true') {
      for (const disclosure of root.querySelectorAll('details[open]')) {
        disclosure.removeAttribute('open');
      }
    }

    const updateFilter = (value) => {
      const terms = normalize(value).split(/\s+/u).filter(Boolean);
      const visibleKeys = new Set();

      for (const input of inputs) {
        if (input.value !== value) input.value = value;
      }

      for (const [index, item] of filterItems.entries()) {
        const searchableText = normalize(item.dataset.knowledgeFilterText ?? '');
        const isVisible = terms.every((term) => searchableText.includes(term));
        item.hidden = !isVisible;
        if (isVisible) {
          visibleKeys.add(item.dataset.knowledgeFilterKey ?? `item:${index}`);
        }
      }

      const visibleCount = visibleKeys.size;
      const statusText =
        visibleCount === 0
          ? (root.dataset.filterEmptyResult ?? '')
          : `${root.dataset.filterResultPrefix ?? ''} ${visibleCount} ${root.dataset.filterResultSuffix ?? ''}`.trim();

      for (const status of statuses) status.textContent = statusText;
      for (const message of emptyMessages) message.hidden = visibleCount !== 0;
    };

    for (const input of inputs) {
      const handleInput = () => updateFilter(input.value);
      input.addEventListener('input', handleInput);
      cleanupCallbacks.push(() => input.removeEventListener('input', handleInput));
    }

    const getFocusableInput = () =>
      inputs.find((input) => input.getClientRects().length > 0 && !input.disabled) ?? inputs[0];

    const handleKeydown = (event) => {
      const input = getFocusableInput();
      if (!(input instanceof HTMLInputElement)) return;

      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        input.focus();
        input.select();
        return;
      }

      if (event.key === 'Escape' && (inputs.includes(document.activeElement) || input.value)) {
        event.preventDefault();
        updateFilter('');
        input.blur();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    cleanupCallbacks.push(() => document.removeEventListener('keydown', handleKeydown));

    const tocLinks = Array.from(root.querySelectorAll('[data-knowledge-toc-link]')).filter(
      (link) => link instanceof HTMLAnchorElement,
    );
    const linksById = new Map(
      tocLinks.flatMap((link) => {
        const id = link.dataset.knowledgeTocLink;
        return id ? [[id, link]] : [];
      }),
    );
    const headings = Array.from(linksById.keys()).flatMap((id) => {
      const heading = document.getElementById(id);
      return heading instanceof HTMLElement ? [heading] : [];
    });

    const setActiveHeading = (id) => {
      for (const [candidateId, link] of linksById) {
        const isActive = candidateId === id;
        link.toggleAttribute('data-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    };

    let observer;
    if (headings.length > 0) {
      setActiveHeading(headings[0].id);

      for (const link of tocLinks) {
        const handleClick = () => {
          const id = link.dataset.knowledgeTocLink;
          if (id) setActiveHeading(id);
        };
        link.addEventListener('click', handleClick);
        cleanupCallbacks.push(() => link.removeEventListener('click', handleClick));
      }

      if ('IntersectionObserver' in window) {
        const visibleHeadings = new Set();
        const header = document.querySelector('.site-header');
        const headerOffset =
          header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) visibleHeadings.add(entry.target.id);
              else visibleHeadings.delete(entry.target.id);
            }

            const visibleHeading = headings.find((heading) => visibleHeadings.has(heading.id));
            if (visibleHeading) {
              setActiveHeading(visibleHeading.id);
              return;
            }

            const passedHeadings = headings.filter(
              (heading) => heading.getBoundingClientRect().top <= headerOffset + 32,
            );
            const lastPassedHeading = passedHeadings[passedHeadings.length - 1];
            if (lastPassedHeading) setActiveHeading(lastPassedHeading.id);
          },
          {
            rootMargin: `-${Math.ceil(headerOffset + 24)}px 0px -65% 0px`,
            threshold: [0, 1],
          },
        );

        for (const heading of headings) observer.observe(heading);
      }
    }

    root.dataset.knowledgeDocsBound = 'true';
    root.dataset.knowledgeDocsReady = 'true';

    cleanupCurrentPage = () => {
      observer?.disconnect();
      for (const cleanup of cleanupCallbacks) cleanup();
    };
  };

  window[stateKey] = { init: initKnowledgeDocs };
  document.addEventListener('astro:page-load', initKnowledgeDocs);
  initKnowledgeDocs();
})();
