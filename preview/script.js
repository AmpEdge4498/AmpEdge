// ===== AmpEdge Preview — Interactive Script =====

document.addEventListener('DOMContentLoaded', () => {
  // ===== Section Navigation (Top Nav) =====
  const navTabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.section');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.section;

      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      sections.forEach(s => s.classList.remove('active-section'));
      document.getElementById(target)?.classList.add('active-section');

      // Smooth scroll to section
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ===== Screen Tab Switching =====
  function setupScreenTabs(tabContainerId, screenContainerId) {
    const tabContainer = document.getElementById(tabContainerId);
    const screenContainer = document.getElementById(screenContainerId);
    if (!tabContainer || !screenContainer) return;

    const tabs = tabContainer.querySelectorAll('.screen-tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetScreen = tab.dataset.screen;

        // Update tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update screens
        const screens = screenContainer.querySelectorAll('.screen-content');
        screens.forEach(s => {
          s.classList.remove('active');
          s.style.display = 'none';
        });

        const target = document.getElementById(targetScreen);
        if (target) {
          target.classList.add('active');
          target.style.display = 'block';
          target.scrollTop = 0; // Reset scroll position
        }
      });
    });
  }

  setupScreenTabs('customer-tabs', 'customer-screen');
  setupScreenTabs('technician-tabs', 'technician-screen');

  // ===== Admin Tab Switching =====
  const adminScreenTabs = document.querySelectorAll('#admin-tabs .screen-tab');
  const adminNavItems = document.querySelectorAll('.admin-nav-item:not(.logout)');

  function switchAdminScreen(screenId) {
    // Update screen tabs
    adminScreenTabs.forEach(t => t.classList.remove('active'));
    adminScreenTabs.forEach(t => {
      if (t.dataset.screen === screenId) t.classList.add('active');
    });

    // Update sidebar
    const sidebarLabels = ['Dashboard', 'Users', 'Bookings', 'Services', 'Marketplace', 'Coupons', 'BOM Mgmt', 'Settings'];
    const screenMap = {
      'a-dash': 0, 'a-users': 1, 'a-bookings': 2, 'a-services': 3, 'a-marketplace': 4
    };

    adminNavItems.forEach((item, i) => {
      item.classList.remove('active');
      if (i === screenMap[screenId]) item.classList.add('active');
    });

    // Update screens
    document.querySelectorAll('.admin-screen').forEach(s => {
      s.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }
  }

  adminScreenTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchAdminScreen(tab.dataset.screen);
    });
  });

  // Admin sidebar clicks
  adminNavItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const screenIds = ['a-dash', 'a-users', 'a-bookings', 'a-services', 'a-marketplace'];
      if (screenIds[idx]) {
        switchAdminScreen(screenIds[idx]);
      }
    });
  });

  // ===== Interactive Elements =====

  // Toggle switch
  const toggleSwitch = document.querySelector('.toggle-switch');
  if (toggleSwitch) {
    toggleSwitch.addEventListener('click', () => {
      toggleSwitch.classList.toggle('on');
      const label = toggleSwitch.parentElement.querySelector('strong');
      const sub = toggleSwitch.parentElement.querySelector('div[style]');
      if (toggleSwitch.classList.contains('on')) {
        if (label) label.textContent = '🟢 Available';
        if (sub) sub.textContent = 'Receiving new job requests';
      } else {
        if (label) label.textContent = '🔴 Offline';
        if (sub) sub.textContent = 'Not receiving requests';
      }
    });
  }

  // Category chips
  document.querySelectorAll('.cat-chips-scroll').forEach(container => {
    container.querySelectorAll('.cat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  });

  // Admin filters
  document.querySelectorAll('.admin-filter-row').forEach(container => {
    container.querySelectorAll('.admin-filter').forEach(filter => {
      filter.addEventListener('click', () => {
        container.querySelectorAll('.admin-filter').forEach(f => f.classList.remove('active'));
        filter.classList.add('active');
      });
    });
  });

  // Wishlist hearts
  document.querySelectorAll('.wish-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('hearted');
    });
  });

  // ADD buttons animation
  document.querySelectorAll('.add-btn, .add-btn-sm, .prod-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const original = btn.textContent;
      btn.textContent = '✓ Added';
      btn.style.background = '#dcfce7';
      btn.style.color = '#16a34a';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.color = '';
      }, 1500);
    });
  });

  // Tab bar items in phone
  document.querySelectorAll('.tab-bar').forEach(bar => {
    bar.querySelectorAll('.tab-item').forEach(item => {
      item.addEventListener('click', () => {
        bar.querySelectorAll('.tab-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  });

  // Technician tabs
  document.querySelectorAll('.tech-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tech-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Chart bar hover animation
  document.querySelectorAll('.chart-bar').forEach(bar => {
    bar.addEventListener('mouseenter', () => {
      bar.style.opacity = '0.8';
      bar.style.transform = 'scaleY(1.05)';
    });
    bar.addEventListener('mouseleave', () => {
      bar.style.opacity = '1';
      bar.style.transform = 'scaleY(1)';
    });
  });

  // Mobile nav - show section tabs on small screens
  const navLogo = document.querySelector('.nav-logo');
  if (navLogo && window.innerWidth < 768) {
    // Create mobile dropdown
    const mobileMenu = document.createElement('div');
    mobileMenu.style.cssText = 'display:none;position:fixed;top:60px;left:0;right:0;background:rgba(10,14,26,0.95);backdrop-filter:blur(20px);z-index:999;padding:12px;border-bottom:1px solid rgba(65,105,225,0.15);';
    
    navTabs.forEach(tab => {
      const clone = tab.cloneNode(true);
      clone.style.cssText = 'width:100%;justify-content:center;margin-bottom:4px;';
      clone.addEventListener('click', () => {
        const target = clone.dataset.section;
        navTabs.forEach(t => t.classList.remove('active'));
        // Find and activate the original tab
        document.querySelector(`.nav-tab[data-section="${target}"]`).classList.add('active');
        sections.forEach(s => s.classList.remove('active-section'));
        document.getElementById(target)?.classList.add('active-section');
        mobileMenu.style.display = 'none';
      });
      mobileMenu.appendChild(clone);
    });

    document.body.appendChild(mobileMenu);

    // Hamburger
    const hamburger = document.createElement('div');
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    hamburger.style.cssText = 'width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;color:#94a3b8;cursor:pointer;font-size:16px;';
    hamburger.addEventListener('click', () => {
      mobileMenu.style.display = mobileMenu.style.display === 'none' ? 'block' : 'none';
    });
    
    document.querySelector('.nav-inner').insertBefore(hamburger, document.querySelector('.nav-badge'));
  }

  // ===== Smooth entrance animations =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.phone-frame, .admin-container, .section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});
