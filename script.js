(() => {
  const intro = document.querySelector('#intro');
  const video = document.querySelector('#introVideo');
  const loadBar = document.querySelector('#loadBar');
  const loadNumber = document.querySelector('#loadNumber');
  const loadLabel = document.querySelector('#loadLabel');
  const header = document.querySelector('.site-header');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introDone = false;

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    if (!intro || !video) return;
    intro.classList.add('is-done');
    document.body.classList.remove('is-loading');
    header.classList.add('is-visible');
    video.pause();
    setTimeout(() => intro.remove(), 1000);
  }

  if (video) {
  document.querySelector('#skipIntro').addEventListener('click', finishIntro);
  video.addEventListener('timeupdate', () => {
    if (!video.duration || !Number.isFinite(video.duration)) return;
    const percent = Math.min(100, Math.round(video.currentTime / video.duration * 100));
    loadBar.style.width = `${percent}%`;
    loadNumber.textContent = `${String(percent).padStart(2, '0')}%`;
    if (percent > 8) loadLabel.textContent = 'ACCESSING FIELD ARCHIVE';
  });
  video.addEventListener('ended', finishIntro);
  video.addEventListener('error', () => {
    loadLabel.textContent = 'ARCHIVE READY';
    loadBar.style.width = '100%';
    loadNumber.textContent = '100%';
    setTimeout(finishIntro, 900);
  });
  video.play().catch(() => {
    loadLabel.textContent = 'ARCHIVE READY';
    loadBar.style.width = '100%';
    loadNumber.textContent = '100%';
    setTimeout(finishIntro, reducedMotion ? 0 : 1800);
  });
  if (reducedMotion) setTimeout(finishIntro, 1200);

  const soundToggle = document.querySelector('#soundToggle');
  soundToggle.addEventListener('click', () => {
    video.muted = !video.muted;
    soundToggle.innerHTML = `SOUND <span>${video.muted ? 'OFF' : 'ON'}</span>`;
    soundToggle.setAttribute('aria-label', `Turn intro sound ${video.muted ? 'on' : 'off'}`);
    if (!video.paused) video.play().catch(() => {});
  });
  }

  const menuToggle = document.querySelector('#menuToggle');
  const mainNav = document.querySelector('#mainNav');
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    mainNav.classList.toggle('is-open', open);
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    mainNav.classList.remove('is-open');
  }));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

  const progress = document.querySelector('.scroll-progress i');
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
      scrollTick = false;
    });
  }, { passive: true });

  const filters = document.querySelectorAll('.filter');
  const galleryCards = [...document.querySelectorAll('.gallery-card')];
  filters.forEach(filter => filter.addEventListener('click', () => {
    filters.forEach(item => item.classList.toggle('is-active', item === filter));
    const value = filter.dataset.filter;
    galleryCards.forEach(card => {
      const visible = value === 'all' || card.dataset.category === value;
      card.classList.toggle('is-hidden', !visible);
      card.setAttribute('aria-hidden', String(!visible));
      card.tabIndex = visible ? 0 : -1;
    });
  }));

  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightboxImage');
  const lightboxCaption = document.querySelector('#lightboxCaption');
  const lightboxCount = document.querySelector('#lightboxCount');
  let activeGallery = galleryCards;
  let activeImage = 0;
  function visibleGallery() { return galleryCards.filter(card => !card.classList.contains('is-hidden')); }
  function showImage(index) {
    activeGallery = visibleGallery();
    activeImage = (index + activeGallery.length) % activeGallery.length;
    const card = activeGallery[activeImage];
    lightboxImage.src = card.dataset.image;
    lightboxImage.alt = card.querySelector('img').alt;
    lightboxCaption.textContent = card.dataset.caption;
    lightboxCount.textContent = `${String(activeImage + 1).padStart(2, '0')} / ${String(activeGallery.length).padStart(2, '0')}`;
  }
  if (lightbox) galleryCards.forEach(card => card.addEventListener('click', () => {
    activeGallery = visibleGallery();
    showImage(activeGallery.indexOf(card));
    lightbox.showModal();
  }));
  if (lightbox) document.querySelector('#lightboxClose').addEventListener('click', () => lightbox.close());
  if (lightbox) {
  document.querySelector('#lightboxPrev').addEventListener('click', () => showImage(activeImage - 1));
  document.querySelector('#lightboxNext').addEventListener('click', () => showImage(activeImage + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  document.addEventListener('keydown', event => {
    if (!lightbox.open) return;
    if (event.key === 'ArrowRight') showImage(activeImage + 1);
    if (event.key === 'ArrowLeft') showImage(activeImage - 1);
  });
  }

  if (matchMedia('(pointer: fine)').matches && !reducedMotion) {
    const hero = document.querySelector('.hero');
    const background = document.querySelector('.hero__image');
    if (hero && background) {
    hero.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      background.style.transform = `scale(1.045) translate(${x * -10}px, ${y * -8}px)`;
    });
    hero.addEventListener('pointerleave', () => { background.style.transform = ''; });
    }
  }

  const dossier = document.querySelector('#dossier');
  if (dossier) {
    const tabs = [...dossier.querySelectorAll('.dossier-tab')];
    const page = dossier.querySelector('#dossier-page');
    const title = dossier.querySelector('#dossierTitle');
    const index = dossier.querySelector('#dossierIndex');
    const content = dossier.querySelector('#dossierContent');
    const selectTab = tab => {
      tabs.forEach((item, i) => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
        if (selected) page.setAttribute('aria-labelledby', item.id);
      });
      dossier.classList.add('is-open');
      content.classList.remove('is-turning');
      void content.offsetWidth;
      content.classList.add('is-turning');
      title.textContent = tab.dataset.title;
      index.textContent = `${String(tabs.indexOf(tab) + 1).padStart(2, '0')} / 07`;
      content.querySelector('.paper-empty > .mono').textContent = `CHAPTER FILE / ${String(tabs.indexOf(tab) + 1).padStart(3, '0')}`;
      content.querySelector('p').textContent = tab.dataset.copy || `History notes for ${tab.dataset.title} will be added here.`;
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const step = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1;
        const next = tabs[(i + step + tabs.length) % tabs.length];
        next.focus();
        selectTab(next);
      });
    });
  }

})();
