(() => {
  const root = document.querySelector('[data-knowledge-docs]');
  if (!(root instanceof HTMLElement) || root.dataset.knowledgeDocsBound === 'true') return;

  const input = root.querySelector('[data-knowledge-filter-input]');
  const status = root.querySelector('[data-knowledge-filter-status]');
  const narrowViewport = window.matchMedia('(max-width: 63.99rem)');
  const filterItems = Array.from(root.querySelectorAll('[data-knowledge-filter-item]')).filter(
    (item) => item instanceof HTMLLIElement,
  );

  if (narrowViewport.matches) {
    for (const disclosure of root.querySelectorAll('details[open]')) {
      disclosure.removeAttribute('open');
    }
  }

  const normalize = (value) => value.normalize('NFKC').trim().toLocaleLowerCase('zh-CN');

  const updateFilter = () => {
    if (!(input instanceof HTMLInputElement)) return;

    const terms = normalize(input.value).split(/\s+/u).filter(Boolean);
    let visibleCount = 0;

    for (const item of filterItems) {
      const searchableText = normalize(item.dataset.knowledgeFilterText ?? '');
      const isVisible = terms.every((term) => searchableText.includes(term));
      item.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    }

    if (status instanceof HTMLElement) {
      status.textContent =
        visibleCount === 0
          ? (root.dataset.filterEmptyResult ?? '')
          : `${root.dataset.filterResultPrefix ?? ''} ${visibleCount} ${root.dataset.filterResultSuffix ?? ''}`.trim();
    }
  };

  if (input instanceof HTMLInputElement) {
    input.addEventListener('input', updateFilter);

    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        input.focus();
        input.select();
        return;
      }

      if (event.key === 'Escape' && (document.activeElement === input || input.value)) {
        event.preventDefault();
        input.value = '';
        updateFilter();
        input.blur();
      }
    });
  }

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

  if (headings.length > 0) {
    setActiveHeading(headings[0].id);

    for (const link of tocLinks) {
      link.addEventListener('click', () => {
        const id = link.dataset.knowledgeTocLink;
        if (id) setActiveHeading(id);
      });
    }

    if ('IntersectionObserver' in window) {
      const visibleHeadings = new Set();
      const header = document.querySelector('.site-header');
      const headerOffset =
        header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
      const observer = new IntersectionObserver(
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
})();
