(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      const open = siteNav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('is-open');
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
  }

  const tabList = document.querySelector('.tab-list');
  if (tabList) {
    const tabs = tabList.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t, i) {
          t.setAttribute('aria-selected', i === index ? 'true' : 'false');
        });
        panels.forEach(function (p, i) {
          p.setAttribute('aria-hidden', i === index ? 'false' : 'true');
        });
      });
    });
  }

  document.querySelectorAll('[data-tab-carousel]').forEach(function (carousel) {
    const slides = carousel.querySelectorAll('.tab-screenshot');
    const nav = carousel.querySelector('.tab-screenshot-nav');
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    if (slides.length < 2 || !nav || !prevBtn || !nextBtn) {
      return;
    }

    nav.hidden = false;
    let index = 0;

    function showSlide(nextIndex) {
      slides[index].hidden = true;
      slides[index].classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].hidden = false;
      slides[index].classList.add('is-active');
    }

    prevBtn.addEventListener('click', function () {
      showSlide(index - 1);
    });
    nextBtn.addEventListener('click', function () {
      showSlide(index + 1);
    });
  });

  const pricingToggle = document.querySelector('.pricing-toggle');
  if (pricingToggle) {
    const yearlyBtn = pricingToggle.querySelector('[data-period="yearly"]');
    const monthlyBtn = pricingToggle.querySelector('[data-period="monthly"]');
    const yearlyPrices = document.querySelectorAll('[data-price-yearly]');
    const monthlyPrices = document.querySelectorAll('[data-price-monthly]');
    function setPeriod(period) {
      const isYearly = period === 'yearly';
      yearlyBtn.classList.toggle('active', isYearly);
      monthlyBtn.classList.toggle('active', !isYearly);
      yearlyPrices.forEach(function (el) { el.hidden = !isYearly; });
      monthlyPrices.forEach(function (el) { el.hidden = isYearly; });
    }
    yearlyBtn.addEventListener('click', function () { setPeriod('yearly'); });
    monthlyBtn.addEventListener('click', function () { setPeriod('monthly'); });
    setPeriod('yearly');
  }

  const heroRotate = document.querySelector('[data-hero-rotate]');
  if (heroRotate) {
    const words = heroRotate.querySelectorAll('.explore-hero-rotate-word');
    const displayMs = 1400;
    const fadeMs = 180;
    let index = 0;

    if (words.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      function cycle() {
        window.setTimeout(function () {
          const current = words[index];
          current.classList.remove('is-active');
          current.classList.add('is-exiting');

          window.setTimeout(function () {
            current.classList.remove('is-exiting');
            index = (index + 1) % words.length;
            const next = words[index];
            void next.offsetWidth;
            next.classList.add('is-active');
            cycle();
          }, fadeMs);
        }, displayMs);
      }

      cycle();
    }
  }

  function syncExploreHeaderOffset() {
    const siteTop = document.querySelector('.site-top');
    const offset = siteTop
      ? Math.round(siteTop.getBoundingClientRect().bottom)
      : 72;
    document.documentElement.style.setProperty('--explore-header-offset', `${offset}px`);
    return offset;
  }

  const calloutStage = document.querySelector('[data-callout-scroll]');
  const calloutTrack = calloutStage && calloutStage.querySelector('[data-callout-track]');
  const calloutCarousel = calloutStage && calloutStage.querySelector('[data-callout-carousel]');
  const calloutTools = calloutStage && calloutStage.querySelector('[data-callout-tools]');
  const calloutProgress = calloutStage && calloutStage.querySelector('[data-callout-progress]');
  const calloutProgressWrap = calloutStage && calloutStage.querySelector('[data-callout-progress-wrap]');
  const calloutControls = calloutStage && calloutStage.querySelector('[data-callout-controls]');
  const calloutPrev = calloutStage && calloutStage.querySelector('[data-callout-prev]');
  const calloutNext = calloutStage && calloutStage.querySelector('[data-callout-next]');
  const calloutStatus = calloutStage && calloutStage.querySelector('[data-callout-status]');
  const calloutCards = calloutTrack
    ? Array.from(calloutTrack.querySelectorAll('.explore-sell-story-card'))
    : [];

  if (calloutStage && calloutTrack && calloutCarousel) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sellSection = calloutStage.closest('.explore-story-sell');
    let carouselScrollDistance = 0;
    let carouselEdgeInset = 0;
    let carouselHoldDistance = 0;
    let toolRevealDistance = 0;
    let toolRevealStart = 0;
    let totalScrollDistance = 0;
    let scrollStart = 0;
    let ticking = false;
    let calloutResizeTimer = null;
    let calloutScrollBound = false;

    function bindCalloutScroll() {
      if (!calloutScrollBound) {
        window.addEventListener('scroll', onScroll, { passive: true });
        calloutScrollBound = true;
      }
    }

    function unbindCalloutScroll() {
      if (calloutScrollBound) {
        window.removeEventListener('scroll', onScroll);
        calloutScrollBound = false;
      }
    }

    function syncCalloutMode() {
      if (useStaticCarousel()) {
        unbindCalloutScroll();
        setStaticMode(true);
        setupCalloutMobileCarousel();
        return;
      }

      setStaticMode(false);
      measure();
      bindCalloutScroll();
    }

    function easeOutQuad(value) {
      return 1 - (1 - value) * (1 - value);
    }

    function getScrollStart() {
      const headerOffset = syncExploreHeaderOffset();
      const anchor = sellSection || calloutStage;
      return anchor.getBoundingClientRect().top + window.scrollY - headerOffset;
    }

    function useStaticCarousel() {
      return reducedMotion || window.matchMedia('(max-width: 1020px)').matches;
    }

    function resetTransforms() {
      calloutTrack.style.transform = '';
      if (calloutTools) {
        calloutTools.style.transform = '';
        calloutTools.style.opacity = '';
        calloutTools.style.pointerEvents = '';
      }
      if (calloutProgress) {
        calloutProgress.style.width = '0%';
      }
      if (calloutProgressWrap) {
        calloutProgressWrap.setAttribute('aria-valuenow', '0');
      }
    }

    function setStaticMode(isStatic) {
      calloutStage.classList.toggle('is-static', isStatic);
      if (isStatic) {
        calloutStage.style.height = '';
        resetTransforms();
        if (calloutControls) {
          calloutControls.hidden = !useStaticCarousel();
        }
        updateCalloutCarouselState();
      } else if (calloutControls) {
        calloutControls.hidden = true;
      }
    }

    function getCalloutCardStep() {
      if (!calloutCards.length) {
        return 0;
      }

      const gap = parseFloat(getComputedStyle(calloutTrack).gap) || 0;
      return calloutCards[0].offsetWidth + gap;
    }

    function getCalloutActiveIndex() {
      if (!calloutCarousel || !calloutCards.length) {
        return 0;
      }

      const viewportRect = calloutCarousel.getBoundingClientRect();
      let activeIndex = 0;
      let bestIntersection = -1;

      calloutCards.forEach(function (card, index) {
        const rect = card.getBoundingClientRect();
        const intersection = Math.min(rect.right, viewportRect.right)
          - Math.max(rect.left, viewportRect.left);
        if (intersection > bestIntersection) {
          bestIntersection = intersection;
          activeIndex = index;
        }
      });

      return activeIndex;
    }

    function updateCalloutCarouselState() {
      if (!useStaticCarousel() || !calloutCarousel) {
        return;
      }

      const activeIndex = getCalloutActiveIndex();
      const total = calloutCards.length;
      const maxScroll = calloutCarousel.scrollWidth - calloutCarousel.clientWidth;
      const atStart = calloutCarousel.scrollLeft <= 1;
      const atEnd = calloutCarousel.scrollLeft >= maxScroll - 1;

      if (calloutStatus && total) {
        calloutStatus.textContent = `${activeIndex + 1} / ${total}`;
      }

      if (calloutPrev) {
        calloutPrev.disabled = atStart;
      }

      if (calloutNext) {
        calloutNext.disabled = atEnd;
      }
    }

    function scrollCalloutCarousel(direction) {
      if (!calloutCarousel || !useStaticCarousel()) {
        return;
      }

      const step = getCalloutCardStep();
      if (!step) {
        return;
      }

      calloutCarousel.scrollBy({
        left: direction * step,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    }

    function setupCalloutMobileCarousel() {
      if (!useStaticCarousel()) {
        if (calloutControls) {
          calloutControls.hidden = true;
        }
        return;
      }

      if (calloutControls) {
        calloutControls.hidden = false;
      }

      updateCalloutCarouselState();
    }

    function updateStoryCardWidth() {
      const viewportWidth = calloutCarousel.clientWidth;
      const gap = parseFloat(getComputedStyle(calloutTrack).gap) || 16;
      const cardWidth = Math.max(200, (viewportWidth - (gap * 3)) / 4.15);
      calloutCarousel.style.setProperty('--sell-story-card-width', `${cardWidth}px`);
    }

    function updateProgress(carouselProgress) {
      const progressPercent = Math.round(carouselProgress * 100);
      if (calloutProgress) {
        calloutProgress.style.width = `${progressPercent}%`;
      }
      if (calloutProgressWrap) {
        calloutProgressWrap.setAttribute('aria-valuenow', String(progressPercent));
      }
    }

    function measure() {
      if (useStaticCarousel()) {
        setStaticMode(true);
        setupCalloutMobileCarousel();
        return;
      }

      setStaticMode(false);
      scrollStart = getScrollStart();
      updateStoryCardWidth();
      const trackWidth = calloutTrack.scrollWidth;
      const viewportWidth = calloutCarousel.clientWidth;
      carouselEdgeInset = Math.round(viewportWidth * 0.028);
      carouselScrollDistance = Math.max(0, trackWidth - viewportWidth);
      toolRevealDistance = calloutTools
        ? Math.max(120, calloutTools.offsetHeight + 48)
        : 0;

      const pin = calloutStage.querySelector('.explore-sell-scroll-pin');
      const pinHeight = pin ? pin.offsetHeight : window.innerHeight;
      carouselHoldDistance = Math.max(120, pinHeight * 0.1);
      toolRevealStart = carouselHoldDistance + (carouselScrollDistance * 0.5);
      totalScrollDistance = carouselHoldDistance + carouselScrollDistance + toolRevealDistance;

      if (totalScrollDistance <= 0) {
        calloutStage.style.height = '';
        resetTransforms();
        return;
      }

      calloutStage.style.height = `${pinHeight + totalScrollDistance}px`;
      update();
    }

    function update() {
      if (useStaticCarousel() || totalScrollDistance <= 0) {
        return;
      }

      const scrolled = Math.max(0, window.scrollY - scrollStart);
      const carouselScrolled = Math.max(0, scrolled - carouselHoldDistance);
      const carouselProgress = carouselScrollDistance > 0
        ? Math.min(1, carouselScrolled / carouselScrollDistance)
        : 1;
      const carouselTravel = carouselScrollDistance + (carouselEdgeInset * 2);
      const carouselOffset = carouselEdgeInset - (carouselProgress * carouselTravel);
      calloutTrack.style.transform = `translate3d(${carouselOffset}px, 0, 0)`;
      updateProgress(carouselProgress);

      if (!calloutTools || toolRevealDistance <= 0) {
        return;
      }

      if (scrolled < toolRevealStart) {
        calloutTools.style.opacity = '0';
        calloutTools.style.pointerEvents = 'none';
        return;
      }

      const toolProgress = Math.min(1, (scrolled - toolRevealStart) / toolRevealDistance);
      const eased = easeOutQuad(toolProgress);
      calloutTools.style.opacity = String(Math.min(1, eased * 1.15));
      calloutTools.style.pointerEvents = eased > 0.2 ? '' : 'none';
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }

    syncCalloutMode();

    window.addEventListener('load', function () {
      syncCalloutMode();
    });

    if (calloutPrev) {
      calloutPrev.addEventListener('click', function () {
        scrollCalloutCarousel(-1);
      });
    }

    if (calloutNext) {
      calloutNext.addEventListener('click', function () {
        scrollCalloutCarousel(1);
      });
    }

    if (calloutCarousel) {
      calloutCarousel.addEventListener('scroll', function () {
        window.requestAnimationFrame(updateCalloutCarouselState);
      }, { passive: true });

      calloutCarousel.addEventListener('keydown', function (event) {
        if (!useStaticCarousel()) {
          return;
        }

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollCalloutCarousel(-1);
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollCalloutCarousel(1);
        }
      });
    }

    window.addEventListener('resize', function () {
      window.clearTimeout(calloutResizeTimer);
      calloutResizeTimer = window.setTimeout(syncCalloutMode, 150);
    }, { passive: true });
  }

  const manageShowcase = document.querySelector('[data-manage-showcase]');
  if (manageShowcase) {
    const showcaseCarousel = manageShowcase.querySelector('[data-manage-showcase-carousel]');
    const showcaseTrack = manageShowcase.querySelector('[data-manage-showcase-track]');
    const showcaseTabs = Array.from(manageShowcase.querySelectorAll('[data-manage-showcase-tab]'));
    const showcaseSlides = showcaseTrack
      ? Array.from(showcaseTrack.querySelectorAll('[data-manage-showcase-slide]'))
      : [];
    const showcaseReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const showcaseMobileQuery = window.matchMedia('(max-width: 768px)');
    let showcaseScrollTimer = null;

    function isManageShowcaseActive() {
      return showcaseMobileQuery.matches;
    }

    function getShowcaseActiveIndex() {
      if (!showcaseCarousel || !showcaseSlides.length) {
        return 0;
      }

      const viewportRect = showcaseCarousel.getBoundingClientRect();
      let activeIndex = 0;
      let bestIntersection = -1;

      showcaseSlides.forEach(function (slide, index) {
        const rect = slide.getBoundingClientRect();
        const intersection = Math.min(rect.right, viewportRect.right)
          - Math.max(rect.left, viewportRect.left);
        if (intersection > bestIntersection) {
          bestIntersection = intersection;
          activeIndex = index;
        }
      });

      return activeIndex;
    }

    function setShowcaseActiveIndex(index, options) {
      const opts = options || {};
      const safeIndex = Math.max(0, Math.min(index, showcaseSlides.length - 1));

      showcaseTabs.forEach(function (tab, tabIndex) {
        const selected = tabIndex === safeIndex;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
      });

      showcaseSlides.forEach(function (slide, slideIndex) {
        slide.setAttribute('aria-hidden', slideIndex === safeIndex ? 'false' : 'true');
      });

      if (opts.focusTab && showcaseTabs[safeIndex]) {
        showcaseTabs[safeIndex].focus();
      }
    }

    function scrollShowcaseToIndex(index) {
      if (!showcaseCarousel || !showcaseSlides[index]) {
        return;
      }

      const slide = showcaseSlides[index];
      const carouselRect = showcaseCarousel.getBoundingClientRect();
      const slideRect = slide.getBoundingClientRect();
      const delta = slideRect.left - carouselRect.left;
      const target = showcaseCarousel.scrollLeft
        + delta
        - ((showcaseCarousel.clientWidth - slide.offsetWidth) / 2);

      showcaseCarousel.scrollTo({
        left: Math.max(0, target),
        behavior: showcaseReducedMotion ? 'auto' : 'smooth',
      });
    }

    function syncShowcaseFromScroll() {
      if (!isManageShowcaseActive()) {
        return;
      }

      setShowcaseActiveIndex(getShowcaseActiveIndex());
    }

    showcaseTabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        scrollShowcaseToIndex(index);
        setShowcaseActiveIndex(index);
      });

      tab.addEventListener('keydown', function (event) {
        let nextIndex = index;

        if (event.key === 'ArrowLeft') {
          nextIndex = (index - 1 + showcaseTabs.length) % showcaseTabs.length;
        } else if (event.key === 'ArrowRight') {
          nextIndex = (index + 1) % showcaseTabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = showcaseTabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        scrollShowcaseToIndex(nextIndex);
        setShowcaseActiveIndex(nextIndex, { focusTab: true });
      });
    });

    if (showcaseCarousel) {
      showcaseCarousel.addEventListener('scroll', function () {
        if (!isManageShowcaseActive()) {
          return;
        }

        window.clearTimeout(showcaseScrollTimer);
        showcaseScrollTimer = window.setTimeout(syncShowcaseFromScroll, 60);
      }, { passive: true });

      showcaseCarousel.addEventListener('keydown', function (event) {
        if (!isManageShowcaseActive()) {
          return;
        }

        const activeIndex = getShowcaseActiveIndex();
        let nextIndex = activeIndex;

        if (event.key === 'ArrowLeft') {
          nextIndex = Math.max(0, activeIndex - 1);
        } else if (event.key === 'ArrowRight') {
          nextIndex = Math.min(showcaseSlides.length - 1, activeIndex + 1);
        } else {
          return;
        }

        if (nextIndex === activeIndex) {
          return;
        }

        event.preventDefault();
        scrollShowcaseToIndex(nextIndex);
        setShowcaseActiveIndex(nextIndex);
      });
    }

    function initManageShowcase() {
      if (!isManageShowcaseActive()) {
        return;
      }

      setShowcaseActiveIndex(getShowcaseActiveIndex());
    }

    initManageShowcase();

    if (typeof showcaseMobileQuery.addEventListener === 'function') {
      showcaseMobileQuery.addEventListener('change', initManageShowcase);
    } else if (typeof showcaseMobileQuery.addListener === 'function') {
      showcaseMobileQuery.addListener(initManageShowcase);
    }
  }

  const sellMedia = document.querySelector('[data-sell-media]');
  const sellVideo = document.querySelector('[data-sell-video]');
  const sellVideoStart = document.querySelector('[data-sell-video-start]');

  if (sellMedia && sellVideo) {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
      sellVideo.removeAttribute('autoplay');
      sellVideo.querySelectorAll('source').forEach(function (source) {
        source.remove();
      });
      sellVideo.removeAttribute('src');
      try {
        sellVideo.load();
      } catch (error) {
        // Ignore load errors when clearing media for reduced motion.
      }
    } else {
      let videoRevealed = false;
      let videoFailed = false;
      let playRequested = false;
      let bottomInView = false;
      let canPlay = false;

      function failSellVideo() {
        if (videoFailed) {
          return;
        }
        videoFailed = true;
        sellMedia.classList.remove('is-video-ready');
        sellMedia.classList.add('is-video-fallback');
        try {
          sellVideo.pause();
        } catch (error) {
          // Ignore pause errors on unsupported media.
        }
      }

      function revealSellVideo() {
        if (videoFailed || videoRevealed) {
          return;
        }
        videoRevealed = true;
        sellMedia.classList.add('is-video-ready');

        // Paint the first frame while paused so the montage is not left showing.
        try {
          if (sellVideo.paused && sellVideo.currentTime === 0) {
            sellVideo.currentTime = 0.001;
          }
        } catch (error) {
          // Ignore seek errors on browsers that block early seeks.
        }
      }

      function tryPlaySellVideo() {
        if (videoFailed || playRequested || !bottomInView || !canPlay) {
          return;
        }

        playRequested = true;
        sellVideo.muted = true;
        sellVideo.defaultMuted = true;
        sellVideo.playsInline = true;

        const playAttempt = sellVideo.play();
        if (playAttempt && typeof playAttempt.then === 'function') {
          playAttempt.catch(function () {
            playRequested = false;
            failSellVideo();
          });
        } else if (sellVideo.paused) {
          playRequested = false;
        }
      }

      function markCanPlay() {
        canPlay = true;
        revealSellVideo();
        tryPlaySellVideo();
      }

      function markBottomInView() {
        bottomInView = true;
        tryPlaySellVideo();
      }

      sellVideo.addEventListener('error', failSellVideo);
      sellVideo.addEventListener('canplay', markCanPlay);

      if (sellVideo.readyState >= 2) {
        markCanPlay();
      }

      if ('IntersectionObserver' in window && sellVideoStart) {
        const sellVideoObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting || videoFailed) {
                return;
              }
              sellVideoObserver.disconnect();
              markBottomInView();
            });
          },
          { root: null, rootMargin: '0px', threshold: 0 },
        );
        sellVideoObserver.observe(sellVideoStart);
      } else {
        markBottomInView();
      }
    }
  }

  const montageLightbox = document.querySelector('[data-montage-lightbox]');
  const montageOpeners = document.querySelectorAll('[data-montage-open]');

  if (montageLightbox && montageOpeners.length) {
    const montageLightboxImage = montageLightbox.querySelector('[data-montage-lightbox-image]');
    const montageLightboxClose = montageLightbox.querySelector('[data-montage-lightbox-close]');
    let montageLightboxTrigger = null;

    function openMontageLightbox(opener) {
      const shot = opener.querySelector('img');
      if (!shot || !montageLightboxImage) {
        return;
      }

      montageLightboxTrigger = opener;
      montageLightboxImage.src = shot.currentSrc || shot.src;
      montageLightboxImage.alt = shot.alt;
      montageLightbox.showModal();
    }

    function closeMontageLightbox() {
      montageLightbox.close();
    }

    montageOpeners.forEach(function (opener) {
      opener.addEventListener('click', function () {
        openMontageLightbox(opener);
      });
    });

    if (montageLightboxClose) {
      montageLightboxClose.addEventListener('click', closeMontageLightbox);
    }

    montageLightbox.addEventListener('click', function (event) {
      const bounds = montageLightbox.getBoundingClientRect();
      const clickedBackdrop = event.clientX < bounds.left
        || event.clientX > bounds.right
        || event.clientY < bounds.top
        || event.clientY > bounds.bottom;

      if (clickedBackdrop) {
        closeMontageLightbox();
      }
    });

    montageLightbox.addEventListener('close', function () {
      if (montageLightboxTrigger) {
        montageLightboxTrigger.focus();
        montageLightboxTrigger = null;
      }

      if (montageLightboxImage) {
        montageLightboxImage.removeAttribute('src');
        montageLightboxImage.alt = '';
      }
    });
  }

  const integrationsStage = document.querySelector('[data-integrations-scroll]');
  const integrationSlots = integrationsStage
    && integrationsStage.querySelectorAll('[data-integration-slot]');
  const integrationLineNodes = integrationsStage
    && integrationsStage.querySelectorAll('[data-integration-line]');
  const integrationLines = integrationLineNodes
    ? Array.from(integrationLineNodes).sort(function (lineA, lineB) {
      return parseInt(lineA.dataset.integrationIndex, 10) - parseInt(lineB.dataset.integrationIndex, 10);
    })
    : [];

  if (integrationsStage && integrationSlots.length) {
    const integrationsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const integrationsSection = integrationsStage.closest('.explore-story-integrations');
    let integrationRevealDistance = 0;
    let integrationHoldDistance = 0;
    let integrationTotalScrollDistance = 0;
    let integrationScrollStart = 0;
    let integrationTicking = false;
    let integrationsScrollBound = false;
    let integrationsResizeTimer = null;

    function bindIntegrationsScroll() {
      if (!integrationsScrollBound) {
        window.addEventListener('scroll', onIntegrationsScroll, { passive: true });
        integrationsScrollBound = true;
      }
    }

    function unbindIntegrationsScroll() {
      if (integrationsScrollBound) {
        window.removeEventListener('scroll', onIntegrationsScroll);
        integrationsScrollBound = false;
      }
    }

    function syncIntegrationsMode() {
      if (useMobileIntegrationsLayout()) {
        unbindIntegrationsScroll();
        setIntegrationsStaticMode(false);
        integrationsStage.style.height = '';
        resetIntegrationTransforms();
        return;
      }

      if (useStaticIntegrations()) {
        unbindIntegrationsScroll();
        setIntegrationsStaticMode(true);
        return;
      }

      setIntegrationsStaticMode(false);
      measureIntegrations();
      bindIntegrationsScroll();
    }

    function easeOutQuadIntegrations(value) {
      return 1 - (1 - value) * (1 - value);
    }

    function useMobileIntegrationsLayout() {
      return window.matchMedia('(max-width: 767px)').matches;
    }

    function useStaticIntegrations() {
      if (useMobileIntegrationsLayout()) {
        return false;
      }

      return integrationsReducedMotion || window.matchMedia('(max-width: 1020px)').matches;
    }

    function getIntegrationsScrollStart() {
      const headerOffset = syncExploreHeaderOffset();
      const anchor = integrationsSection || integrationsStage;
      return anchor.getBoundingClientRect().top + window.scrollY - headerOffset;
    }

    function resetIntegrationTransforms() {
      integrationSlots.forEach(function (slot) {
        slot.style.left = '';
        slot.style.top = '';
        slot.style.opacity = '';
        slot.style.transform = '';
      });
      integrationLines.forEach(function (line) {
        line.style.opacity = '';
        line.style.removeProperty('--line-art-reveal');
      });
    }

    function setIntegrationsStaticMode(isStatic) {
      integrationsStage.classList.toggle('is-static', isStatic);
      if (isStatic) {
        integrationsStage.style.height = '';
        resetIntegrationTransforms();
      }
    }

    function rayAxisAlignedBoxEntry(originX, originY, dirX, dirY, rect) {
      const planes = [
        { axis: 'x', edge: rect.left, dir: dirX },
        { axis: 'x', edge: rect.right, dir: dirX },
        { axis: 'y', edge: rect.top, dir: dirY },
        { axis: 'y', edge: rect.bottom, dir: dirY },
      ];
      let nearest = null;

      planes.forEach(function (plane) {
        if (Math.abs(plane.dir) < 1e-6) {
          return;
        }

        const origin = plane.axis === 'x' ? originX : originY;
        const distance = (plane.edge - origin) / plane.dir;
        if (distance <= 0) {
          return;
        }

        const hitX = originX + (dirX * distance);
        const hitY = originY + (dirY * distance);
        const onBox = hitX >= rect.left - 0.5
          && hitX <= rect.right + 0.5
          && hitY >= rect.top - 0.5
          && hitY <= rect.bottom + 0.5;

        if (onBox && (nearest === null || distance < nearest)) {
          nearest = distance;
        }
      });

      return nearest;
    }

    function integrationPointToViewBox(hubRect, px, py) {
      return {
        x: ((px - hubRect.left) / hubRect.width) * 100,
        y: ((py - hubRect.top) / hubRect.height) * 100,
      };
    }

    function formatIntegrationPoint(hubRect, point) {
      const viewPoint = integrationPointToViewBox(hubRect, point.x, point.y);
      return `${viewPoint.x.toFixed(2)} ${viewPoint.y.toFixed(2)}`;
    }

    function sampleDoodlePoints(startPx, endPx, lineStyle, index) {
      const dx = endPx.x - startPx.x;
      const dy = endPx.y - startPx.y;
      const len = Math.hypot(dx, dy);

      if (len < 16) {
        return null;
      }

      const ux = dx / len;
      const uy = dy / len;
      const nx = -uy;
      const ny = ux;
      const sign = index % 2 === 0 ? 1 : -1;
      const waveAmp = len * 0.08 * sign;
      const loopRadius = Math.min(len * 0.15, 26);
      const loopCenter = 0.46 + ((index % 3) * 0.04);
      const points = [];

      function waveOffset(t) {
        return Math.sin(t * Math.PI * 1.45 + (index * 0.35)) * waveAmp;
      }

      function addPoint(t, extraNormal, extraTangent) {
        const normalOffset = waveOffset(t) + (extraNormal || 0);
        const tangentOffset = extraTangent || 0;
        points.push({
          x: startPx.x + (dx * t) + (nx * normalOffset) + (ux * tangentOffset),
          y: startPx.y + (dy * t) + (ny * normalOffset) + (uy * tangentOffset),
        });
      }

      if (lineStyle === 'loop') {
        const approachEnd = loopCenter - 0.11;
        const departStart = loopCenter + 0.11;
        const loopAnchor = {
          x: startPx.x + (dx * loopCenter),
          y: startPx.y + (dy * loopCenter),
        };

        for (let i = 0; i <= 18; i += 1) {
          addPoint((approachEnd * i) / 18, 0, 0);
        }

        for (let i = 0; i <= 40; i += 1) {
          const angle = ((i / 40) * Math.PI * 2) - (Math.PI / 2);
          points.push({
            x: loopAnchor.x + (nx * Math.sin(angle) * loopRadius * sign) + (ux * Math.cos(angle) * loopRadius * 0.18),
            y: loopAnchor.y + (ny * Math.sin(angle) * loopRadius * sign) + (uy * Math.cos(angle) * loopRadius * 0.18),
          });
        }

        for (let i = 0; i <= 18; i += 1) {
          const t = departStart + (((1 - departStart) * i) / 18);
          addPoint(t, 0, 0);
        }

        return points;
      }

      const steps = lineStyle === 'wave' ? 44 : 36;
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        let normalOffset = waveOffset(t);

        if (lineStyle === 'wave') {
          normalOffset = Math.sin(t * Math.PI * 2.1) * waveAmp * 1.05;
        } else {
          normalOffset += Math.sin(t * Math.PI * 2.8) * waveAmp * 0.4;
        }

        points.push({
          x: startPx.x + (dx * t) + (nx * normalOffset),
          y: startPx.y + (dy * t) + (ny * normalOffset),
        });
      }

      return points;
    }

    function pointsToSketchPath(hubRect, points) {
      if (!points || points.length < 2) {
        return null;
      }

      let path = `M ${formatIntegrationPoint(hubRect, points[0])}`;

      for (let i = 1; i < points.length - 1; i += 1) {
        const midPoint = {
          x: (points[i].x + points[i + 1].x) / 2,
          y: (points[i].y + points[i + 1].y) / 2,
        };
        path += ` Q ${formatIntegrationPoint(hubRect, points[i])} ${formatIntegrationPoint(hubRect, midPoint)}`;
      }

      path += ` T ${formatIntegrationPoint(hubRect, points[points.length - 1])}`;
      return path;
    }

    const INTEGRATION_LOGO_ARROW_GAP = 6;
    const INTEGRATION_CARD_ARROW_GAP = 14;
    const INTEGRATION_ORBIT_OUTSET = 1.045;

    function getIntegrationOrbitCoords(orbitX, orbitY, progress) {
      const targetX = 50 + ((orbitX - 50) * INTEGRATION_ORBIT_OUTSET);
      const targetY = 50 + ((orbitY - 50) * INTEGRATION_ORBIT_OUTSET);
      const eased = Math.min(1, Math.max(0, progress));

      return {
        x: 50 + ((targetX - 50) * eased),
        y: 50 + ((targetY - 50) * eased),
      };
    }

    function buildIntegrationConnectorPath(hubRect, startPx, endPx, lineStyle, index) {
      const points = sampleDoodlePoints(startPx, endPx, lineStyle, index);
      return pointsToSketchPath(hubRect, points);
    }

    function getIntegrationConnectorSpan(hub, logo, orbitX, orbitY, cardEl) {
      const hubRect = hub.getBoundingClientRect();
      if (!hubRect.width || !hubRect.height) {
        return null;
      }

      const centerX = hubRect.left + (hubRect.width / 2);
      const centerY = hubRect.top + (hubRect.height / 2);
      let targetX = hubRect.left + ((orbitX / 100) * hubRect.width);
      let targetY = hubRect.top + ((orbitY / 100) * hubRect.height);

      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        targetX = cardRect.left + (cardRect.width / 2);
        targetY = cardRect.top + (cardRect.height / 2);
      }

      const dx = targetX - centerX;
      const dy = targetY - centerY;
      const fullDist = Math.hypot(dx, dy);

      if (fullDist <= 0) {
        return null;
      }

      const ux = dx / fullDist;
      const uy = dy / fullDist;
      const logoRect = logo.getBoundingClientRect();
      const logoRadius = Math.max(logoRect.width, logoRect.height) / 2;
      const innerPx = logoRadius + INTEGRATION_LOGO_ARROW_GAP;
      const edgeGap = INTEGRATION_CARD_ARROW_GAP;

      let cardEntryPx = fullDist;
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        const rayEntry = rayAxisAlignedBoxEntry(centerX, centerY, ux, uy, cardRect);

        if (rayEntry !== null) {
          cardEntryPx = rayEntry - edgeGap;
        } else {
          const hw = cardRect.width / 2;
          const hh = cardRect.height / 2;
          cardEntryPx = fullDist - ((hw * Math.abs(ux)) + (hh * Math.abs(uy))) - edgeGap;
        }
      }

      const availablePx = cardEntryPx - innerPx;
      if (availablePx < 16) {
        return null;
      }

      return {
        hubRect: hubRect,
        startPx: {
          x: centerX + (ux * innerPx),
          y: centerY + (uy * innerPx),
        },
        endPx: {
          x: centerX + (ux * (cardEntryPx - 4)),
          y: centerY + (uy * (cardEntryPx - 4)),
        },
      };
    }

    function getIntegrationLineArtNativeLength(imageEl) {
      const from = imageEl.dataset.lineArtFrom || 'tl';
      const to = imageEl.dataset.lineArtTo || 'br';
      const artWidth = parseFloat(imageEl.dataset.lineArtWidth) || 1;
      const artHeight = parseFloat(imageEl.dataset.lineArtHeight) || 1;
      const points = {
        tl: { x: -artWidth / 2, y: -artHeight / 2 },
        tr: { x: artWidth / 2, y: -artHeight / 2 },
        bl: { x: -artWidth / 2, y: artHeight / 2 },
        br: { x: artWidth / 2, y: artHeight / 2 },
      };
      const start = points[from];
      const end = points[to];

      if (!start || !end) {
        return artWidth;
      }

      return Math.hypot(end.x - start.x, end.y - start.y);
    }

    function getIntegrationLineArtNativeAngle(imageEl) {
      const from = imageEl.dataset.lineArtFrom || 'tl';
      const to = imageEl.dataset.lineArtTo || 'br';
      const width = parseFloat(imageEl.dataset.lineArtWidth) || 1;
      const height = parseFloat(imageEl.dataset.lineArtHeight) || 1;
      const points = {
        tl: { x: -width / 2, y: -height / 2 },
        tr: { x: width / 2, y: -height / 2 },
        bl: { x: -width / 2, y: height / 2 },
        br: { x: width / 2, y: height / 2 },
      };
      const start = points[from];
      const end = points[to];

      if (!start || !end) {
        return Math.atan2(1, 1);
      }

      return Math.atan2(end.y - start.y, end.x - start.x);
    }

    function getIntegrationLineArtTransformOrigin(from) {
      const origins = {
        tl: '0% 0%',
        tr: '100% 0%',
        bl: '0% 100%',
        br: '100% 100%',
      };

      return origins[from] || '50% 50%';
    }

    function getIntegrationArrowRevealScale(cardProgress) {
      const revealStart = 0.9;

      if (cardProgress <= revealStart) {
        return 0;
      }

      const arrowProgress = Math.min(1, (cardProgress - revealStart) / (1 - revealStart));
      return easeOutQuadIntegrations(arrowProgress);
    }

    function applyIntegrationLineReveal(line, cardProgress) {
      const revealScale = getIntegrationArrowRevealScale(cardProgress);
      line.style.setProperty('--line-art-reveal', String(revealScale));
      line.style.opacity = revealScale > 0 ? '1' : '0';
    }

    function getIntegrationLineArtOriginOffset(from, width, height) {
      const offsets = {
        tl: { x: 0, y: 0 },
        tr: { x: width, y: 0 },
        bl: { x: 0, y: height },
        br: { x: width, y: height },
      };

      return offsets[from] || { x: width / 2, y: height / 2 };
    }

    function positionIntegrationLineArt(hubRect, startPx, endPx, imageEl) {
      const dx = endPx.x - startPx.x;
      const dy = endPx.y - startPx.y;
      const spanLength = Math.hypot(dx, dy);

      if (spanLength < 8) {
        imageEl.style.width = '0';
        imageEl.style.height = '0';
        return;
      }

      const angle = Math.atan2(dy, dx);
      const nativeAngle = getIntegrationLineArtNativeAngle(imageEl);
      const rotateDeg = ((angle - nativeAngle) * 180) / Math.PI;
      const artWidth = parseFloat(imageEl.dataset.lineArtWidth) || 1;
      const artHeight = parseFloat(imageEl.dataset.lineArtHeight) || 1;
      const nativeLength = getIntegrationLineArtNativeLength(imageEl);
      const arrowLengthPx = parseFloat(imageEl.dataset.lineArtSize) || spanLength;
      const widthScale = artWidth / artHeight < 0.3 ? 1.22 : 1;
      const width = arrowLengthPx * (artWidth / nativeLength) * widthScale;
      const height = width * (artHeight / artWidth);
      const from = imageEl.dataset.lineArtFrom || 'tl';
      const originOffset = getIntegrationLineArtOriginOffset(from, width, height);
      const offsetX = parseFloat(imageEl.dataset.lineArtOffsetX) || 0;
      const offsetY = parseFloat(imageEl.dataset.lineArtOffsetY) || 0;

      imageEl.style.left = `${startPx.x - hubRect.left - originOffset.x + offsetX}px`;
      imageEl.style.top = `${startPx.y - hubRect.top - originOffset.y + offsetY}px`;
      imageEl.style.width = `${width}px`;
      imageEl.style.height = `${height}px`;
      imageEl.style.transformOrigin = getIntegrationLineArtTransformOrigin(from);
      imageEl.style.transform = `rotate(${rotateDeg}deg) scale(var(--line-art-reveal, 0))`;
    }

    function measureIntegrationLines() {
      const hub = integrationsStage.querySelector('[data-integrations-hub]');
      const logo = integrationsStage.querySelector('.explore-integrations-logo');
      if (!hub || !logo) {
        return;
      }

      integrationSlots.forEach(function (slot) {
        const orbitX = parseFloat(slot.dataset.orbitX);
        const orbitY = parseFloat(slot.dataset.orbitY);
        const coords = getIntegrationOrbitCoords(orbitX, orbitY, 1);
        slot.style.left = `${coords.x}%`;
        slot.style.top = `${coords.y}%`;
        slot.style.transform = 'translate(-50%, -50%)';
      });

      integrationLines.forEach(function (line, index) {
        const orbitX = parseFloat(line.dataset.orbitX);
        const orbitY = parseFloat(line.dataset.orbitY);
        const lineStyle = line.dataset.lineStyle || 'curve';
        const slot = integrationSlots[index];
        const card = slot && slot.querySelector('[data-integration-card]');
        const span = getIntegrationConnectorSpan(hub, logo, orbitX, orbitY, card);

        if (!span) {
          if (line.dataset.lineArt) {
            line.style.width = '0';
            line.style.height = '0';
          } else {
            line.setAttribute('d', 'M 50 50 L 50 50');
          }
          line.style.opacity = '0';
          line.style.removeProperty('--line-art-reveal');
          return;
        }

        if (line.dataset.lineArt) {
          positionIntegrationLineArt(span.hubRect, span.startPx, span.endPx, line);
          line.style.opacity = '0';
          line.style.setProperty('--line-art-reveal', '0');
          return;
        }

        const endpoints = buildIntegrationConnectorPath(
          span.hubRect,
          span.startPx,
          span.endPx,
          lineStyle,
          index
        );

        if (!endpoints) {
          line.setAttribute('d', 'M 50 50 L 50 50');
          line.style.opacity = '0';
          return;
        }

        line.setAttribute('d', endpoints);
        line.style.opacity = '0';
      });
    }

    function measureIntegrations() {
      if (useStaticIntegrations()) {
        setIntegrationsStaticMode(true);
        return;
      }

      setIntegrationsStaticMode(false);
      integrationScrollStart = getIntegrationsScrollStart();
      measureIntegrationLines();
      const pin = integrationsStage.querySelector('.explore-integrations-scroll-pin');
      const pinHeight = pin ? pin.offsetHeight : window.innerHeight;
      integrationRevealDistance = Math.max(200, pinHeight * 0.14);
      integrationHoldDistance = Math.max(280, pinHeight * 0.34);
      integrationTotalScrollDistance = (integrationRevealDistance * integrationSlots.length)
        + integrationHoldDistance;

      if (integrationTotalScrollDistance <= 0) {
        integrationsStage.style.height = '';
        resetIntegrationTransforms();
        return;
      }

      integrationsStage.style.height = `${pinHeight + integrationTotalScrollDistance}px`;
      updateIntegrations();
    }

    function updateIntegrations() {
      if (useStaticIntegrations() || integrationTotalScrollDistance <= 0) {
        return;
      }

      const scrolled = Math.max(0, window.scrollY - integrationScrollStart);
      integrationSlots.forEach(function (slot, index) {
        const orbitX = parseFloat(slot.dataset.orbitX);
        const orbitY = parseFloat(slot.dataset.orbitY);
        const slotStart = index * integrationRevealDistance;
        const progress = Math.min(
          1,
          Math.max(0, (scrolled - slotStart) / integrationRevealDistance)
        );
        const eased = easeOutQuadIntegrations(progress);
        const coords = getIntegrationOrbitCoords(orbitX, orbitY, eased);
        slot.style.left = `${coords.x}%`;
        slot.style.top = `${coords.y}%`;
        slot.style.opacity = String(eased);
        slot.style.transform = `translate(-50%, -50%) scale(${0.9 + (0.1 * eased)})`;

        const line = integrationLines[index];
        if (line) {
          applyIntegrationLineReveal(line, eased);
        }
      });
    }

    function onIntegrationsScroll() {
      if (!integrationTicking) {
        window.requestAnimationFrame(function () {
          updateIntegrations();
          integrationTicking = false;
        });
        integrationTicking = true;
      }
    }

    syncIntegrationsMode();

    window.addEventListener('load', function () {
      syncIntegrationsMode();
    });

    window.addEventListener('resize', function () {
      window.clearTimeout(integrationsResizeTimer);
      integrationsResizeTimer = window.setTimeout(syncIntegrationsMode, 150);
    }, { passive: true });
  }

  const industrySection = document.querySelector('[data-industry-cards]');
  const industryCards = industrySection
    && industrySection.querySelectorAll('[data-industry-card]');
  const industryBlock = industrySection
    && industrySection.closest('.explore-industries-section');
  const industryTitle = industryBlock
    && industryBlock.querySelector('.section-title');

  if (industrySection && industryCards && industryCards.length) {
    const industryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function groupIndustryCardsByRow(cards) {
      const rowTolerance = 28;
      const rows = [];

      cards.forEach(function (card) {
        const top = card.getBoundingClientRect().top;
        let row = rows.find(function (existingRow) {
          return Math.abs(existingRow.top - top) <= rowTolerance;
        });

        if (!row) {
          row = { top: top, cards: [] };
          rows.push(row);
        }

        row.cards.push(card);
        row.top = Math.min(row.top, top);
      });

      return rows.sort(function (rowA, rowB) {
        return rowA.top - rowB.top;
      });
    }

    function revealIndustryRow(row) {
      row.cards.forEach(function (card) {
        card.style.setProperty('--industry-reveal-delay', '0ms');
        card.classList.add('is-visible');
      });
    }

    let industryRowObservers = [];
    let industryResizeTimer = null;

    function disconnectIndustryRowObservers() {
      industryRowObservers.forEach(function (observer) {
        observer.disconnect();
      });
      industryRowObservers = [];
    }

    function setupIndustryRowObservers() {
      disconnectIndustryRowObservers();

      const rows = groupIndustryCardsByRow(Array.from(industryCards));

      rows.forEach(function (row, rowIndex) {
        const alreadyVisible = row.cards.every(function (card) {
          return card.classList.contains('is-visible');
        });

        if (alreadyVisible) {
          return;
        }

        let trigger;
        let observerOptions;

        if (rowIndex === 0 && industryTitle) {
          trigger = industryTitle;
          observerOptions = {
            threshold: 0,
            rootMargin: '0px 0px 0px 0px',
          };
        } else {
          trigger = row.cards.reduce(function (best, card) {
            const top = card.getBoundingClientRect().top;
            if (!best || top < best.top) {
              return { element: card, top: top };
            }

            return best;
          }, null).element;
          observerOptions = {
            threshold: 0,
            rootMargin: '0px 0px 12% 0px',
          };
        }

        const rowObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              return;
            }

            revealIndustryRow(row);
            rowObserver.unobserve(entry.target);
          });
        }, observerOptions);

        rowObserver.observe(trigger);
        industryRowObservers.push(rowObserver);
      });
    }

    if (industryReducedMotion) {
      Array.from(industryCards).forEach(function (card) {
        card.classList.add('is-visible');
      });
    } else {
      setupIndustryRowObservers();
      window.addEventListener('resize', function () {
        window.clearTimeout(industryResizeTimer);
        industryResizeTimer = window.setTimeout(setupIndustryRowObservers, 150);
      }, { passive: true });
    }
  }

  const proofCarousel = document.querySelector('[data-proof-carousel]');
  if (proofCarousel) {
    const proofViewport = proofCarousel.querySelector('[data-proof-viewport]');
    const proofTrack = proofCarousel.querySelector('[data-proof-track]');
    const proofPrev = proofCarousel.querySelector('[data-proof-prev]');
    const proofNext = proofCarousel.querySelector('[data-proof-next]');
    const proofStatus = proofCarousel.querySelector('[data-proof-status]');
    const proofCards = proofTrack ? Array.from(proofTrack.querySelectorAll('[data-proof-card]')) : [];
    const proofModal = document.querySelector('[data-proof-modal]');
    const proofModalClose = proofModal && proofModal.querySelector('[data-proof-modal-close]');
    const proofModalLogo = proofModal && proofModal.querySelector('[data-proof-modal-logo]');
    const proofModalBusiness = proofModal && proofModal.querySelector('[data-proof-modal-business]');
    const proofModalQuote = proofModal && proofModal.querySelector('[data-proof-modal-quote]');
    const proofModalName = proofModal && proofModal.querySelector('[data-proof-modal-name]');
    const proofModalRole = proofModal && proofModal.querySelector('[data-proof-modal-role]');
    const proofModalWebsite = proofModal && proofModal.querySelector('[data-proof-modal-website]');
    let proofReadTrigger = null;
    let proofResizeTimer = null;

    function getProofCardStep() {
      if (!proofTrack || !proofCards.length) {
        return 0;
      }

      const gap = parseFloat(window.getComputedStyle(proofTrack).gap) || 0;
      return proofCards[0].offsetWidth + gap;
    }

    function getProofVisibleRange() {
      if (!proofViewport || !proofCards.length) {
        return { first: 1, last: 1, total: proofCards.length };
      }

      const viewportRect = proofViewport.getBoundingClientRect();
      let first = null;
      let last = null;

      proofCards.forEach(function (card, index) {
        const rect = card.getBoundingClientRect();
        const intersection = Math.min(rect.right, viewportRect.right)
          - Math.max(rect.left, viewportRect.left);
        if (intersection > rect.width * 0.45) {
          if (first === null) {
            first = index;
          }
          last = index;
        }
      });

      if (first === null) {
        first = 0;
        last = 0;
      }

      return {
        first: first + 1,
        last: last + 1,
        total: proofCards.length,
      };
    }

    function updateProofCarouselState() {
      if (!proofViewport || !proofStatus) {
        return;
      }

      const range = getProofVisibleRange();
      const maxScroll = proofViewport.scrollWidth - proofViewport.clientWidth;
      const atStart = proofViewport.scrollLeft <= 1;
      const atEnd = proofViewport.scrollLeft >= maxScroll - 1;

      if (range.first === range.last) {
        proofStatus.textContent = `${range.first} of ${range.total}`;
      } else {
        proofStatus.textContent = `${range.first}\u2013${range.last} of ${range.total}`;
      }

      if (proofPrev) {
        proofPrev.disabled = atStart;
      }

      if (proofNext) {
        proofNext.disabled = atEnd;
      }
    }

    function scrollProofCarousel(direction) {
      if (!proofViewport) {
        return;
      }

      const step = getProofCardStep();
      if (!step) {
        return;
      }

      proofViewport.scrollBy({
        left: direction * step,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }

    function isProofExcerptTruncated(excerpt) {
      if (!excerpt || !excerpt.parentNode) {
        return false;
      }

      const clone = excerpt.cloneNode(true);
      clone.style.cssText = [
        'position:absolute',
        'visibility:hidden',
        'pointer-events:none',
        'left:-9999px',
        'top:0',
        'width:' + excerpt.getBoundingClientRect().width + 'px',
        'display:block',
        'overflow:visible',
        '-webkit-line-clamp:unset',
        'line-clamp:unset',
        '-webkit-box-orient:unset',
        'min-height:0',
      ].join(';');
      excerpt.parentNode.appendChild(clone);
      const truncated = clone.scrollHeight > excerpt.clientHeight + 1;
      clone.remove();
      return truncated;
    }

    function updateProofReadMoreButtons() {
      proofCards.forEach(function (card) {
        const excerpt = card.querySelector('[data-proof-excerpt]');
        const button = card.querySelector('[data-proof-read]');
        if (!excerpt || !button) {
          return;
        }

        button.hidden = !(
          card.classList.contains('explore-industry-proof-card')
          || isProofExcerptTruncated(excerpt)
        );
      });
    }

    function scheduleProofReadMoreUpdate() {
      window.requestAnimationFrame(updateProofReadMoreButtons);
    }

    function openProofModal(card) {
      if (!proofModal || !card) {
        return;
      }

      proofReadTrigger = card.querySelector('[data-proof-read]') || card;

      if (proofModalBusiness) {
        proofModalBusiness.textContent = card.dataset.proofBusiness || '';
      }

      if (proofModalQuote) {
        const fullText = card.querySelector('[data-proof-full]');
        proofModalQuote.textContent = fullText ? fullText.textContent : '';
      }

      if (proofModalName) {
        proofModalName.textContent = card.dataset.proofName || '';
      }

      if (proofModalRole) {
        proofModalRole.textContent = card.dataset.proofRole || '';
      }

      if (proofModalLogo) {
        if (card.dataset.proofLogo) {
          proofModalLogo.src = card.dataset.proofLogo;
          proofModalLogo.alt = card.dataset.proofLogoAlt || '';
          proofModalLogo.hidden = false;
        } else {
          proofModalLogo.removeAttribute('src');
          proofModalLogo.alt = '';
          proofModalLogo.hidden = true;
        }
      }

      if (proofModalWebsite) {
        if (card.dataset.proofWebsite) {
          proofModalWebsite.href = card.dataset.proofWebsite;
          proofModalWebsite.hidden = false;
        } else {
          proofModalWebsite.href = '#';
          proofModalWebsite.hidden = true;
        }
      }

      proofModal.showModal();
    }

    function closeProofModal() {
      if (proofModal) {
        proofModal.close();
      }
    }

    if (proofPrev) {
      proofPrev.addEventListener('click', function () {
        scrollProofCarousel(-1);
      });
    }

    if (proofNext) {
      proofNext.addEventListener('click', function () {
        scrollProofCarousel(1);
      });
    }

    if (proofViewport) {
      proofViewport.addEventListener('scroll', function () {
        window.requestAnimationFrame(updateProofCarouselState);
      }, { passive: true });

      proofViewport.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollProofCarousel(-1);
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollProofCarousel(1);
        }
      });
    }

    proofCards.forEach(function (card) {
      const readButton = card.querySelector('[data-proof-read]');
      if (readButton) {
        readButton.addEventListener('click', function () {
          openProofModal(card);
        });
      }
    });

    if (proofModalClose) {
      proofModalClose.addEventListener('click', closeProofModal);
    }

    if (proofModal) {
      proofModal.addEventListener('click', function (event) {
        const bounds = proofModal.getBoundingClientRect();
        const clickedBackdrop = event.clientX < bounds.left
          || event.clientX > bounds.right
          || event.clientY < bounds.top
          || event.clientY > bounds.bottom;

        if (clickedBackdrop) {
          closeProofModal();
        }
      });

      proofModal.addEventListener('close', function () {
        if (proofReadTrigger) {
          proofReadTrigger.focus();
          proofReadTrigger = null;
        }
      });
    }

    window.addEventListener('resize', function () {
      window.clearTimeout(proofResizeTimer);
      proofResizeTimer = window.setTimeout(function () {
        scheduleProofReadMoreUpdate();
        updateProofCarouselState();
      }, 150);
    }, { passive: true });

    if (window.ResizeObserver) {
      const proofReadObserver = new ResizeObserver(scheduleProofReadMoreUpdate);
      proofCards.forEach(function (card) {
        proofReadObserver.observe(card);
      });
    }

    proofCards.forEach(function (card) {
      card.querySelectorAll('img').forEach(function (img) {
        if (!img.complete) {
          img.addEventListener('load', scheduleProofReadMoreUpdate, { once: true });
        }
      });
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleProofReadMoreUpdate);
    }

    scheduleProofReadMoreUpdate();
    updateProofCarouselState();
  }

  document.querySelectorAll('[data-industry-manage-tabs]').forEach(function (tabList) {
    const tabs = tabList.querySelectorAll('[data-industry-manage-tab]');
    const panels = tabList.parentElement.querySelectorAll('[data-industry-manage-panel]');

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (item, itemIndex) {
          const selected = itemIndex === index;
          item.setAttribute('aria-selected', selected ? 'true' : 'false');
          item.tabIndex = selected ? 0 : -1;
        });

        panels.forEach(function (panel, panelIndex) {
          const active = panelIndex === index;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
        });
      });
    });
  });

  document.querySelectorAll('[data-industry-quote-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      const card = button.closest('[data-proof-card]');
      if (!card) {
        return;
      }

      const quoteBlock = card.querySelector('.explore-industry-proof-quote');
      const hiddenParagraphs = card.querySelectorAll('[data-industry-quote-rest]');
      if (!hiddenParagraphs.length) {
        return;
      }

      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const nextExpanded = !isExpanded;

      hiddenParagraphs.forEach(function (paragraph) {
        paragraph.hidden = !nextExpanded;
      });

      if (quoteBlock) {
        quoteBlock.classList.toggle('is-expanded', nextExpanded);
      }

      button.setAttribute('aria-expanded', nextExpanded ? 'true' : 'false');
      button.textContent = nextExpanded ? 'Show less' : 'Read full review';
    });
  });

})();
