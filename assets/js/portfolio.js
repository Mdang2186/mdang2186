/* =====================================================================
   Portfolio_DoCongMinh – site scripts
   Location: assets/js/portfolio.js
   Purpose:
   - Toggle mobile menu
   - Scrollspy highlight for nav items
   - Animated counters (.stat-number[data-target])
   - Horizontal progress bars (.progress-fill[data-percent])
   - Radial progress (SVG circle.progress[data-percent])
   - Reveal on scroll (.section-fade -> .visible)
   - Cursor glow effect (.cursor-glow, .cursor-dot)
   ===================================================================== */

(function () {
  'use strict';

  // Tiny helpers
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else fn();
  }

  onReady(() => {
    // ---------------- Mobile menu ----------------
    const menuBtn     = $('#menuBtn');
    const mobileMenu  = $('#mobileMenu');
    const closeMenu   = $('#closeMenu');

    const openMenu = () => {
      if (!mobileMenu) return;
      mobileMenu.classList.add('active');
      menuBtn?.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    const hideMenu = () => {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('active');
      menuBtn?.classList.remove('active');
      document.body.style.overflow = '';
    };

    menuBtn?.addEventListener('click', openMenu);
    closeMenu?.addEventListener('click', hideMenu);
    $$('.mobile-nav-link').forEach(a => a.addEventListener('click', hideMenu));

    // Close mobile menu on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideMenu();
    });

    // --------------- Smooth scroll for anchor links ---------------
    $$('.nav-link[href^="#"], .mobile-nav-link[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80; // offset for fixed header
        window.scrollTo({ top, behavior: 'smooth' });
        // ensure correct active state
        setActive(id.replace('#',''));
      });
    });

    // ---------------- Scrollspy ----------------
    const sectionIds = ['hero', 'about', 'skills', 'projects', 'testimonials', 'contact', 'stats'];
    const sections = sectionIds
      .map(id => ({ id, el: document.getElementById(id) }))
      .filter(s => !!s.el);

    const navLinks = $$('.nav-link');
    function setActive(id) {
      navLinks.forEach(a => {
        const href = a.getAttribute('href') || '';
        a.classList.toggle('active', href === `#${id}`);
      });
    }
    function onScroll() {
      const currentY = window.scrollY + 120;
      let current = sections[0]?.id;
      for (const s of sections) {
        if (s.el.offsetTop <= currentY) current = s.id;
      }
      if (current) setActive(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---------------- Animated counters ----------------
    $$('.stat-number[data-target]').forEach(el => {
      const target = Number(el.getAttribute('data-target'));
      if (!Number.isFinite(target)) return;
      const duration = 1200;
      const startVal = 0;
      const start = performance.now();
      function step(now) {
        const p = Math.min(1, (now - start) / duration);
        const val = Math.floor(startVal + (target - startVal) * p);
        el.textContent = val.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    // ---------------- Linear progress bars ----------------
    $$('.progress-fill[data-percent]').forEach(bar => {
      const percent = Number(bar.getAttribute('data-percent'));
      if (!Number.isFinite(percent)) return;
      // give layout a moment
      setTimeout(() => { bar.style.width = `${Math.max(0, Math.min(100, percent))}%`; }, 100);
    });

    // ---------------- Radial progress (SVG) ----------------
    $$('.radial-progress circle.progress[data-percent]').forEach(circle => {
      const percent = Number(circle.getAttribute('data-percent'));
      const r = Number(circle.getAttribute('r')) || 45;
      const C = 2 * Math.PI * r;
      circle.style.strokeDasharray = `${C}`;
      circle.style.strokeDashoffset = `${C}`;
      setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(0.25, 1, 0.5, 1)';
        circle.style.strokeDashoffset = String(C * (1 - Math.max(0, Math.min(1, percent / 100))));
      }, 120);
    });

    // ---------------- Reveal on scroll ----------------
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) e.target.classList.add('visible');
      }
    }, { threshold: 0.12 });
    $$('.section-fade').forEach(el => observer.observe(el));

    // ---------------- Cursor glow ----------------
    const glow = $('.cursor-glow');
    const dot  = $('.cursor-dot');
    if (glow && dot) {
      window.addEventListener('mousemove', (e) => {
        const x = e.clientX, y = e.clientY;
        glow.style.transform = `translate(${x - 15}px, ${y - 15}px)`;
        dot.style.transform  = `translate(${x - 4}px, ${y - 4}px)`;
      }, { passive: true });
      // emphasize on interactive elements
      $$('a, button, [role="button"], .btn-primary, .btn-outline').forEach(el => {
        el.addEventListener('mouseenter', () => glow.classList.add('hovering'));
        el.addEventListener('mouseleave', () => glow.classList.remove('hovering'));
      });
    }
  });
})(); 
(function () {
  const PDF_URL = 'assets/cv/DoCongMinh.pdf';

  const btnOpen   = document.getElementById('viewCvBtn');
  const modal     = document.getElementById('cvModal');
  const btnClose  = document.getElementById('cvClose');
  const iframe    = document.getElementById('cvIframe');
  const fallback  = document.getElementById('cvFallback');

  function openModal(){
    // nạp PDF vào iframe (ẩn toolbar để gọn gàng)
    iframe.src = PDF_URL + '#toolbar=0&navpanes=0&scrollbar=1';
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    // focus để hỗ trợ bàn phím
    btnClose.focus({preventScroll:true});
  }
  function closeModal(){
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    // giải phóng tài nguyên (tránh tiếp tục render PDF khi đóng)
    iframe.src = 'about:blank';
  }

  // Mở/đóng
  btnOpen?.addEventListener('click', openModal);
  btnClose?.addEventListener('click', closeModal);
  // Click overlay: nếu click ra ngoài panel thì đóng
  modal?.addEventListener('click', (e)=>{
    const panel = e.currentTarget.querySelector('.glass-effect');
    if (!panel.contains(e.target)) closeModal();
  });
  // ESC để đóng
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !modal.classList.contains('hidden')) closeModal(); });

  // Fallback nếu iframe không render được PDF (một số mobile)
  iframe?.addEventListener('error', ()=> {
    fallback.classList.remove('hidden');
  });
})(); 
