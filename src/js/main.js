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
    const displayMs = 2000;
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

  const calloutStage = document.querySelector('[data-callout-scroll]');
  const calloutTrack = calloutStage && calloutStage.querySelector('[data-callout-track]');
  const calloutCarousel = calloutStage && calloutStage.querySelector('[data-callout-carousel]');
  const calloutTools = calloutStage && calloutStage.querySelector('[data-callout-tools]');

  if (calloutStage && calloutTrack && calloutCarousel) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sellSection = calloutStage.closest('.explore-story-sell');
    let carouselScrollDistance = 0;
    let toolRevealDistance = 0;
    let toolRevealStart = 0;
    let totalScrollDistance = 0;
    let scrollStart = 0;
    let ticking = false;

    function easeOutQuad(value) {
      return 1 - (1 - value) * (1 - value);
    }

    function getHeaderOffset() {
      const siteTop = document.querySelector('.site-top');
      return siteTop ? siteTop.offsetHeight : 72;
    }

    function syncHeaderOffset() {
      const headerOffset = getHeaderOffset();
      document.documentElement.style.setProperty('--explore-header-offset', `${headerOffset}px`);
      return headerOffset;
    }

    function getScrollStart() {
      const anchor = sellSection || calloutStage;
      const headerOffset = syncHeaderOffset();
      return anchor.getBoundingClientRect().top + window.scrollY - headerOffset;
    }

    function useStaticCarousel() {
      return reducedMotion;
    }

    function resetTransforms() {
      calloutTrack.style.transform = '';
      if (calloutTools) {
        calloutTools.style.transform = '';
        calloutTools.style.opacity = '';
      }
    }

    function setStaticMode(isStatic) {
      calloutStage.classList.toggle('is-static', isStatic);
      if (isStatic) {
        calloutStage.style.height = '';
        resetTransforms();
      }
    }

    function measure() {
      if (useStaticCarousel()) {
        setStaticMode(true);
        return;
      }

      setStaticMode(false);
      scrollStart = getScrollStart();
      const trackWidth = calloutTrack.scrollWidth;
      const viewportWidth = calloutCarousel.clientWidth;
      carouselScrollDistance = Math.max(0, trackWidth - viewportWidth);
      toolRevealDistance = calloutTools
        ? Math.max(140, calloutTools.offsetHeight + 56)
        : 0;
      toolRevealStart = carouselScrollDistance > 0
        ? carouselScrollDistance * 0.3
        : 0;
      totalScrollDistance = Math.max(
        carouselScrollDistance,
        toolRevealStart + toolRevealDistance
      );

      if (totalScrollDistance <= 0) {
        calloutStage.style.height = '';
        resetTransforms();
        return;
      }

      const pin = calloutStage.querySelector('.explore-sell-scroll-pin');
      const pinHeight = pin ? pin.offsetHeight : window.innerHeight;
      calloutStage.style.height = `${pinHeight + totalScrollDistance}px`;
      update();
    }

    function update() {
      if (useStaticCarousel() || totalScrollDistance <= 0) {
        return;
      }

      const scrolled = Math.max(0, window.scrollY - scrollStart);
      const carouselProgress = carouselScrollDistance > 0
        ? Math.min(1, scrolled / carouselScrollDistance)
        : 1;
      calloutTrack.style.transform = `translate3d(${-carouselProgress * carouselScrollDistance}px, 0, 0)`;

      if (!calloutTools || toolRevealDistance <= 0) {
        return;
      }

      if (scrolled < toolRevealStart) {
        calloutTools.style.transform = 'translateY(115%)';
        calloutTools.style.opacity = '0';
        return;
      }

      const toolProgress = Math.min(1, (scrolled - toolRevealStart) / toolRevealDistance);
      const eased = easeOutQuad(toolProgress);
      calloutTools.style.transform = `translateY(${(1 - eased) * 115}%)`;
      calloutTools.style.opacity = String(Math.min(1, eased * 1.2));
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

    if (useStaticCarousel()) {
      setStaticMode(true);
    } else {
      measure();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', measure, { passive: true });
    }
  }

  const manageStage = document.querySelector('[data-manage-scroll]');
  const manageRows = manageStage && manageStage.querySelectorAll('[data-manage-feature-row]');

  if (manageStage && manageRows.length) {
    const manageReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const manageSection = manageStage.closest('.explore-story-manage');
    let manageRowRevealDistance = 0;
    let manageHoldDistance = 0;
    let manageTotalScrollDistance = 0;
    let manageScrollStart = 0;
    let manageTicking = false;

    function easeOutQuadManage(value) {
      return 1 - (1 - value) * (1 - value);
    }

    function getManageHeaderOffset() {
      const siteTop = document.querySelector('.site-top');
      return siteTop ? siteTop.offsetHeight : 72;
    }

    function useStaticManage() {
      return manageReducedMotion || window.matchMedia('(max-width: 1020px)').matches;
    }

    function getManageScrollStart() {
      const anchor = manageSection || manageStage;
      const headerOffset = getManageHeaderOffset();
      document.documentElement.style.setProperty('--explore-header-offset', `${headerOffset}px`);
      return anchor.getBoundingClientRect().top + window.scrollY - headerOffset;
    }

    function resetManageRows() {
      manageRows.forEach(function (row) {
        row.style.transform = '';
        row.style.opacity = '';
      });
    }

    function setManageStaticMode(isStatic) {
      manageStage.classList.toggle('is-static', isStatic);
      if (isStatic) {
        manageStage.style.height = '';
        resetManageRows();
      }
    }

    function measureManage() {
      if (useStaticManage()) {
        setManageStaticMode(true);
        return;
      }

      setManageStaticMode(false);
      manageScrollStart = getManageScrollStart();
      const firstRow = manageRows[0];
      const pin = manageStage.querySelector('.explore-manage-scroll-pin');
      const pinHeight = pin ? pin.offsetHeight : window.innerHeight;
      manageRowRevealDistance = firstRow
        ? Math.max(220, firstRow.offsetHeight + 100)
        : 220;
      manageHoldDistance = Math.max(320, pinHeight * 0.42);
      manageTotalScrollDistance = (manageRowRevealDistance * manageRows.length) + manageHoldDistance;

      if (manageTotalScrollDistance <= 0) {
        manageStage.style.height = '';
        resetManageRows();
        return;
      }

      manageStage.style.height = `${pinHeight + manageTotalScrollDistance}px`;
      updateManage();
    }

    function updateManage() {
      if (useStaticManage() || manageTotalScrollDistance <= 0) {
        return;
      }

      const scrolled = Math.max(0, window.scrollY - manageScrollStart);
      manageRows.forEach(function (row, index) {
        const rowStart = index * manageRowRevealDistance;
        const progress = Math.min(
          1,
          Math.max(0, (scrolled - rowStart) / manageRowRevealDistance)
        );
        const eased = easeOutQuadManage(progress);
        row.style.transform = `translateY(${(1 - eased) * 110}%)`;
        row.style.opacity = String(Math.min(1, eased * 1.15));
      });
    }

    function onManageScroll() {
      if (!manageTicking) {
        window.requestAnimationFrame(function () {
          updateManage();
          manageTicking = false;
        });
        manageTicking = true;
      }
    }

    if (useStaticManage()) {
      setManageStaticMode(true);
    } else {
      measureManage();
      window.addEventListener('scroll', onManageScroll, { passive: true });
      window.addEventListener('resize', measureManage, { passive: true });
    }
  }

  const integrationsStage = document.querySelector('[data-integrations-scroll]');
  const integrationSlots = integrationsStage
    && integrationsStage.querySelectorAll('[data-integration-slot]');
  const integrationLines = integrationsStage
    && integrationsStage.querySelectorAll('[data-integration-line]');

  if (integrationsStage && integrationSlots.length) {
    const integrationsReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const integrationsSection = integrationsStage.closest('.explore-story-integrations');
    let integrationRevealDistance = 0;
    let integrationHoldDistance = 0;
    let integrationTotalScrollDistance = 0;
    let integrationScrollStart = 0;
    let integrationTicking = false;

    function easeOutQuadIntegrations(value) {
      return 1 - (1 - value) * (1 - value);
    }

    function getIntegrationsHeaderOffset() {
      const siteTop = document.querySelector('.site-top');
      return siteTop ? siteTop.offsetHeight : 72;
    }

    function useStaticIntegrations() {
      return integrationsReducedMotion || window.matchMedia('(max-width: 1020px)').matches;
    }

    function getIntegrationsScrollStart() {
      const anchor = integrationsSection || integrationsStage;
      const headerOffset = getIntegrationsHeaderOffset();
      document.documentElement.style.setProperty('--explore-header-offset', `${headerOffset}px`);
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
      });
    }

    function setIntegrationsStaticMode(isStatic) {
      integrationsStage.classList.toggle('is-static', isStatic);
      if (isStatic) {
        integrationsStage.style.height = '';
        resetIntegrationTransforms();
      }
    }

    function getIntegrationLineEndpoints(hub, logo, orbitX, orbitY, cardEl) {
      const hubRect = hub.getBoundingClientRect();
      if (!hubRect.width || !hubRect.height) {
        return null;
      }

      const centerX = hubRect.left + (hubRect.width / 2);
      const centerY = hubRect.top + (hubRect.height / 2);
      const targetX = hubRect.left + ((orbitX / 100) * hubRect.width);
      const targetY = hubRect.top + ((orbitY / 100) * hubRect.height);
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
      const innerPx = logoRadius + 28;

      let cardRadius = 0;
      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        cardRadius = Math.max(cardRect.width, cardRect.height) / 2;
      }
      const outerPx = cardRadius + 32;

      if (fullDist <= innerPx + outerPx) {
        return null;
      }

      const availablePx = fullDist - innerPx - outerPx;
      const linePx = Math.min(availablePx * 0.42, 72);
      const lineMidPx = innerPx + (availablePx / 2);

      const startX = centerX + (ux * (lineMidPx - (linePx / 2)));
      const startY = centerY + (uy * (lineMidPx - (linePx / 2)));
      const endX = centerX + (ux * (lineMidPx + (linePx / 2)));
      const endY = centerY + (uy * (lineMidPx + (linePx / 2)));

      const toViewBox = function (px, py) {
        return {
          x: ((px - hubRect.left) / hubRect.width) * 100,
          y: ((py - hubRect.top) / hubRect.height) * 100,
        };
      };

      const start = toViewBox(startX, startY);
      const end = toViewBox(endX, endY);

      return {
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
      };
    }

    function measureIntegrationLines() {
      const hub = integrationsStage.querySelector('[data-integrations-hub]');
      const logo = integrationsStage.querySelector('.explore-integrations-logo');
      if (!hub || !logo) {
        return;
      }

      integrationLines.forEach(function (line, index) {
        const orbitX = parseFloat(line.dataset.orbitX);
        const orbitY = parseFloat(line.dataset.orbitY);
        const slot = integrationSlots[index];
        const card = slot && slot.querySelector('[data-integration-card]');
        const endpoints = getIntegrationLineEndpoints(hub, logo, orbitX, orbitY, card);

        if (!endpoints) {
          line.setAttribute('x1', '50');
          line.setAttribute('y1', '50');
          line.setAttribute('x2', '50');
          line.setAttribute('y2', '50');
          line.style.opacity = '0';
          return;
        }

        line.setAttribute('x1', String(endpoints.x1));
        line.setAttribute('y1', String(endpoints.y1));
        line.setAttribute('x2', String(endpoints.x2));
        line.setAttribute('y2', String(endpoints.y2));
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
        const x = 50 + ((orbitX - 50) * eased);
        const y = 50 + ((orbitY - 50) * eased);
        slot.style.left = `${x}%`;
        slot.style.top = `${y}%`;
        slot.style.opacity = String(eased);
        slot.style.transform = `translate(-50%, -50%) scale(${0.9 + (0.1 * eased)})`;

        const line = integrationLines[index];
        if (line) {
          line.style.opacity = String(eased);
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

    if (useStaticIntegrations()) {
      setIntegrationsStaticMode(true);
    } else {
      measureIntegrations();
      window.addEventListener('scroll', onIntegrationsScroll, { passive: true });
      window.addEventListener('resize', measureIntegrations, { passive: true });
    }
  }
})();
