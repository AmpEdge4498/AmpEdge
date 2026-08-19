// ===== AmpEdge Preview — Interactive Script =====

let previewUser = {
  isLoggedIn: true,
  name: 'Rahul Sharma',
  phone: '+91 91236 67258',
  email: 'rahul@example.com',
  role: 'CUSTOMER'
};

let previewAuthRole = 'CUSTOMER';
let previewAuthMode = 'signin';

function openPreviewAuthModal() {
  if (previewUser.isLoggedIn) {
    openPreviewAccountModal();
  } else {
    const modal = document.getElementById('previewAuthModal');
    if (modal) modal.style.display = 'flex';
  }
}

function closePreviewAuthModal() {
  const modal = document.getElementById('previewAuthModal');
  if (modal) modal.style.display = 'none';
}

function openPreviewAccountModal() {
  const modal = document.getElementById('previewAccountModal');
  if (modal) modal.style.display = 'flex';
}

function closePreviewAccountModal() {
  const modal = document.getElementById('previewAccountModal');
  if (modal) modal.style.display = 'none';
}

function selectPreviewRole(role) {
  previewAuthRole = role;
  const custBtn = document.getElementById('roleCustBtn');
  const partnerBtn = document.getElementById('rolePartnerBtn');
  if (role === 'CUSTOMER') {
    custBtn.style.background = '#4169E1';
    custBtn.style.color = '#fff';
    partnerBtn.style.background = 'transparent';
    partnerBtn.style.color = '#64748b';
  } else {
    partnerBtn.style.background = '#4169E1';
    partnerBtn.style.color = '#fff';
    custBtn.style.background = 'transparent';
    custBtn.style.color = '#64748b';
  }
}

function switchPreviewAuthTab(mode) {
  previewAuthMode = mode;
  const tabIn = document.getElementById('tabSignIn');
  const tabUp = document.getElementById('tabSignUp');
  const title = document.getElementById('authModalTitle');

  if (mode === 'signin') {
    tabIn.style.borderBottom = '2px solid #4169E1';
    tabIn.style.color = '#4169E1';
    tabIn.style.fontWeight = '800';
    tabUp.style.borderBottom = 'none';
    tabUp.style.color = '#64748b';
    tabUp.style.fontWeight = '700';
    if (title) title.textContent = 'Sign In to AMPEdge';
  } else {
    tabUp.style.borderBottom = '2px solid #4169E1';
    tabUp.style.color = '#4169E1';
    tabUp.style.fontWeight = '800';
    tabIn.style.borderBottom = 'none';
    tabIn.style.color = '#64748b';
    tabIn.style.fontWeight = '700';
    if (title) title.textContent = 'Create an Account';
  }
}

function handlePreviewGoogleAuth() {
  previewUser.isLoggedIn = true;
  previewUser.name = 'Rahul Sharma (Google)';
  previewUser.role = previewAuthRole;
  closePreviewAuthModal();
  alert(`Welcome, ${previewUser.name}! Successfully signed in via Google Auth.`);
  updateAuthHeader();
}

function handlePreviewPhoneAuth() {
  const phone = document.getElementById('previewPhoneInput')?.value;
  if (!phone || phone.length < 10) {
    alert('Please enter a valid 10-digit mobile number.');
    return;
  }
  previewUser.isLoggedIn = true;
  previewUser.phone = `+91 ${phone}`;
  previewUser.name = 'Verified User';
  previewUser.role = previewAuthRole;
  closePreviewAuthModal();
  alert(`OTP Verified! Welcome to AMPEdge, ${previewUser.phone}.`);
  updateAuthHeader();
}

function handlePreviewLogout() {
  previewUser.isLoggedIn = false;
  closePreviewAccountModal();
  alert('You have been logged out.');
  updateAuthHeader();
}

function updateAuthHeader() {
  const text = document.getElementById('navAuthUserText');
  if (text) {
    text.textContent = previewUser.isLoggedIn ? (previewUser.name.split(' ')[0] || 'Account') : 'Sign In';
  }
}

// Global Helper to switch customer tabs from any button
function switchCustomerTab(screenId) {
  const customerTabs = document.querySelectorAll('#customer-tabs .screen-tab');
  const screens = document.querySelectorAll('#customer-screen .screen-content');

  customerTabs.forEach(t => {
    t.classList.toggle('active', t.dataset.screen === screenId);
  });

  screens.forEach(s => {
    if (s.id === screenId) {
      s.classList.add('active');
      s.style.display = 'block';
      s.scrollTop = 0;
    } else {
      s.classList.remove('active');
      s.style.display = 'none';
    }
  });
}

// Global AI Chat Helper
function sendPreviewAiMsg() {
  const input = document.getElementById('previewAiInput');
  if (!input || !input.value.trim()) return;

  const userText = input.value.trim();
  const body = document.querySelector('#c-ai .ai-body');

  if (body) {
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-msg user';
    userMsg.innerHTML = `<div class="ai-bubble user-bubble">${userText}</div>`;
    body.appendChild(userMsg);
    input.value = '';

    // Smart Bot response
    setTimeout(() => {
      let reply = "I'm here to help! You can book verified electrical services, explore rooftop solar setups (save up to 90% bills), or buy genuine products from Havells, Polycab and Legrand.";
      const lower = userText.toLowerCase();

      if (lower.includes('solar') || lower.includes('sun') || lower.includes('roof')) {
        reply = "Our Solar Rooftop Survey is ₹299! Our certified solar engineer visits your site, checks shadow angles & sizing, and helps with DISCOM net-metering & subsidies. Complete installations start at ₹12,999 with 25-year panel warranty. ☀️";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
        reply = "Our service rates start from ₹199 with 100% transparent pricing and no hidden costs. Prime members get an extra 10% to 20% off on all labor & store hardware! 💰";
      } else if (lower.includes('warranty') || lower.includes('guarantee')) {
        reply = "We offer a 90-day service warranty on all electrical jobs. If any issue arises within 90 days, we'll send an engineer to resolve it free of charge! 🛡️";
      } else if (lower.includes('plan') || lower.includes('prime') || lower.includes('membership') || lower.includes('subscription')) {
        reply = "AmpEdge Prime plans start at ₹199/yr (Base) and ₹499/yr (Modular Plus with 10% off + Free Safety Audit). Our VIP Gold plan (₹999/yr) includes 20% off and 24/7 priority emergency response! 👑";
      } else if (lower.includes('emergency') || lower.includes('urgent') || lower.includes('night')) {
        reply = "For emergency power cuts, short circuits, or sparking, we provide 24/7 emergency technician dispatch with average arrival in under 30 minutes! 🚨";
      }

      const botMsg = document.createElement('div');
      botMsg.className = 'ai-msg bot';
      botMsg.innerHTML = `<div class="ai-bubble bot-bubble">${reply}</div>`;
      body.appendChild(botMsg);
      body.scrollTop = body.scrollHeight;
    }, 600);

    body.scrollTop = body.scrollHeight;
  }
}

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

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const screens = screenContainer.querySelectorAll('.screen-content');
        screens.forEach(s => {
          s.classList.remove('active');
          s.style.display = 'none';
        });

        const target = document.getElementById(targetScreen);
        if (target) {
          target.classList.add('active');
          target.style.display = 'block';
          target.scrollTop = 0;
        }
      });
    });
  }

  setupScreenTabs('customer-tabs', 'customer-screen');
  setupScreenTabs('technician-tabs', 'technician-screen');

  // ===== Property Select Buttons =====
  document.querySelectorAll('.prop-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.parentElement.querySelectorAll('.prop-select-btn').forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = '#e2e8f0';
        b.style.background = '#fff';
        const title = b.querySelector('div:last-child');
        if (title) title.style.color = '#334155';
      });
      btn.classList.add('active');
      btn.style.borderColor = '#4169E1';
      btn.style.background = 'rgba(65,105,225,0.06)';
      const title = btn.querySelector('div:last-child');
      if (title) title.style.color = '#4169E1';
    });
  });

  // ===== Admin Tab Switching =====
  const adminScreenTabs = document.querySelectorAll('#admin-tabs .screen-tab');
  const adminNavItems = document.querySelectorAll('.admin-nav-item:not(.logout)');

  function switchAdminScreen(screenId) {
    adminScreenTabs.forEach(t => t.classList.remove('active'));
    adminScreenTabs.forEach(t => {
      if (t.dataset.screen === screenId) t.classList.add('active');
    });

    const screenMap = {
      'a-dash': 0, 'a-users': 1, 'a-bookings': 2, 'a-services': 3, 'a-marketplace': 4
    };

    adminNavItems.forEach((item, i) => {
      item.classList.remove('active');
      if (i === screenMap[screenId]) item.classList.add('active');
    });

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

  adminNavItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const screenIds = ['a-dash', 'a-users', 'a-bookings', 'a-services', 'a-marketplace'];
      if (screenIds[idx]) {
        switchAdminScreen(screenIds[idx]);
      }
    });
  });

  // Toggle switch in tech
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

  // Wishlist hearts
  document.querySelectorAll('.wish-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('hearted');
      const icon = btn.querySelector('i');
      if (btn.classList.contains('hearted')) {
        icon.style.color = '#ef4444';
      } else {
        icon.style.color = '#94a3b8';
      }
    });
  });
});
