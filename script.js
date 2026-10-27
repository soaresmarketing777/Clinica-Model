/* ============================================= */
/* CONFIGURAÇÕES                                 */
/* ============================================= */
const CONFIG = {
  whatsapp: '5511999998888',
  whatsappMessage: 'Olá! Vim pelo site da Clínica Model e gostaria de agendar uma avaliação.',
  businessName: 'Clínica Model',
  email: 'jorge123@gmail.com'
};

/* ============================================= */
/* DARK MODE                                     */
/* ============================================= */
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Inicialização
const savedTheme = localStorage.getItem('theme') || 
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ============================================= */
/* HEADER SCROLL                                 */
/* ============================================= */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* ============================================= */
/* MENU MOBILE                                   */
/* ============================================= */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger?.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  });
});

/* ============================================= */
/* INTERSECTION OBSERVER (REVEAL)                */
/* ============================================= */
const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

revealElements.forEach(el => observer.observe(el));

/* ============================================= */
/* BANNER COOKIES LGPD                           */
/* ============================================= */
const cookieBanner = document.getElementById('cookieBanner');
const cookieAccept = document.getElementById('cookieAccept');
const cookieReject = document.getElementById('cookieReject');

function checkCookieConsent() {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) {
    cookieBanner?.classList.add('show');
  }
}

function setCookieConsent(type) {
  localStorage.setItem('cookieConsent', type);
  localStorage.setItem('cookieDate', new Date().toISOString());
  cookieBanner?.classList.remove('show');
  trackEvent('cookie_consent', { value: type });
  if (type === 'accepted') {
    loadMarketingScripts();
  }
}

cookieAccept?.addEventListener('click', () => setCookieConsent('accepted'));
cookieReject?.addEventListener('click', () => setCookieConsent('rejected'));

checkCookieConsent();

function loadMarketingScripts() {
  // GA4
  const gaScript = document.createElement('script');
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
  gaScript.async = true;
  document.head.appendChild(gaScript);
  
  const gaConfig = document.createElement('script');
  gaConfig.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `;
  document.head.appendChild(gaConfig);

  // Meta Pixel
  const fbScript = document.createElement('script');
  fbScript.textContent = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1234567890');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(fbScript);
}

if (localStorage.getItem('cookieConsent') === 'accepted') {
  loadMarketingScripts();
}

/* ============================================= */
/* TRACK EVENT (Respeita consentimento)          */
/* ============================================= */
function trackEvent(eventName, params = {}) {
  const consent = localStorage.getItem('cookieConsent');
  if (consent !== 'accepted') return;
  
  // GA4
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
  
  // Meta Pixel
  if (typeof fbq === 'function') {
    fbq('trackCustom', eventName, params);
  }
  
  console.log('[Track]', eventName, params);
}

/* ============================================= */
/* UTM TRACKING                                  */
/* ============================================= */
function captureUTMs() {
  const urlParams = new URLSearchParams(window.location.search);
  const utms = {};
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  
  utmKeys.forEach(key => {
    const value = urlParams.get(key);
    if (value) utms[key] = value;
  });
  
  if (Object.keys(utms).length > 0) {
    localStorage.setItem('utms', JSON.stringify(utms));
  }
}

captureUTMs();

function getWhatsappMessage() {
  const utms = JSON.parse(localStorage.getItem('utms') || '{}');
  let baseMessage = CONFIG.whatsappMessage;
  
  if (utms.utm_source) {
    baseMessage = `Olá! Vim pelo ${utms.utm_source}${utms.utm_medium ? ' (' + utms.utm_medium + ')' : ''} e gostaria de agendar uma avaliação na Clínica Model.`;
  }
  
  return encodeURIComponent(baseMessage);
}

function getWhatsappLink() {
  return `https://wa.me/${CONFIG.whatsapp}?text=${getWhatsappMessage()}`;
}

// Aplicar links WhatsApp dinamicamente
function applyWhatsappLinks() {
  document.querySelectorAll('.whatsapp-link, #whatsappFloat').forEach(el => {
    el.setAttribute('href', getWhatsappLink());
  });
}

applyWhatsappLinks();

/* ============================================= */
/* WHATSAPP CLICK TRACKING                       */
/* ============================================= */
document.querySelectorAll('.whatsapp-link, #whatsappFloat').forEach(el => {
  el.addEventListener('click', () => {
    const utms = JSON.parse(localStorage.getItem('utms') || '{}');
    trackEvent('whatsapp_click', {
      source: utms.utm_source || 'direct',
      medium: utms.utm_medium || 'organic',
      campaign: utms.utm_campaign || 'none',
      page: window.location.pathname
    });
  });
});

/* ============================================= */
/* FORMULÁRIO INTELIGENTE                        */
/* ============================================= */
const contactForm = document.getElementById('contactForm');
const successModal = document.getElementById('successModal');
const modalClose = document.getElementById('modalClose');

// Salvar rascunho no localStorage
function saveDraft() {
  if (!contactForm) return;
  const data = {
    name: contactForm.name.value,
    email: contactForm.email.value,
    phone: contactForm.phone.value,
    service: contactForm.service.value,
    message: contactForm.message.value
  };
  localStorage.setItem('formDraft', JSON.stringify(data));
}

function loadDraft() {
  if (!contactForm) return;
  const draft = JSON.parse(localStorage.getItem('formDraft') || '{}');
  Object.keys(draft).forEach(key => {
    if (contactForm[key]) contactForm[key].value = draft[key];
  });
}

loadDraft();

['name', 'email', 'phone', 'service', 'message'].forEach(field => {
  contactForm?.[field]?.addEventListener('input', saveDraft);
});

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (!contactForm.lgpd.checked) {
    alert('Por favor, aceite a Política de Privacidade para continuar.');
    return;
  }
  
  const data = {
    name: contactForm.name.value,
    email: contactForm.email.value,
    phone: contactForm.phone.value,
    service: contactForm.service.value,
    message: contactForm.message.value
  };
  
  // Disparar evento de conversão
  trackEvent('form_submit', {
    service: data.service,
    value: 1
  });
  
  // Abrir modal de sucesso
  successModal?.classList.add('show');
  
  // Limpar rascunho
  localStorage.removeItem('formDraft');
  
  // Aplicar link do WhatsApp com dados
  const waMessage = encodeURIComponent(
    `Olá! Meu nome é ${data.name}.\n` +
    `Email: ${data.email}\n` +
    `Telefone: ${data.phone}\n` +
    `Interesse: ${data.service}\n` +
    `Mensagem: ${data.message}`
  );
  
  successModal.querySelectorAll('.whatsapp-link').forEach(el => {
    el.setAttribute('href', `https://wa.me/${CONFIG.whatsapp}?text=${waMessage}`);
  });
  
  contactForm.reset();
});

modalClose?.addEventListener('click', () => {
  successModal?.classList.remove('show');
});

successModal?.querySelector('.modal-backdrop')?.addEventListener('click', () => {
  successModal?.classList.remove('show');
});

/* ============================================= */
/* STICKY BAR MOBILE (apenas mobile)             */
/* ============================================= */
function createStickyBarMobile() {
  if (window.innerWidth > 768) return;
  if (document.querySelector('.sticky-bar-mobile')) return;
  
  const bar = document.createElement('div');
  bar.className = 'sticky-bar-mobile';
  bar.innerHTML = `
    <a href="tel:+${CONFIG.whatsapp}" class="btn-call">📞 Ligar</a>
    <a href="${getWhatsappLink()}" class="btn-wa whatsapp-link">💬 WhatsApp</a>
  `;
  document.body.appendChild(bar);
}

createStickyBarMobile();

/* ============================================= */
// Máscara simples de telefone
const phoneInput = document.getElementById('phone');
phoneInput?.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '').slice(0, 11);
  if (value.length > 6) {
    value = `(${value.slice(0,2)}) ${value.slice(2,7)}-${value.slice(7)}`;
  } else if (value.length > 2) {
    value = `(${value.slice(0,2)}) ${value.slice(2)}`;
  } else if (value.length > 0) {
    value = `(${value}`;
  }
  e.target.value = value;
});

/* ============================================= */
// Track de page view ao carregar
trackEvent('page_view', { page: window.location.pathname });

console.log(`%c🚀 ${CONFIG.businessName} - Site Carregado`, 'color: #C9A961; font-weight: bold; font-size: 14px;');