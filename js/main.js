/* =====================================================
   SHATURSH HEALTHCARE CENTRE — MAIN JAVASCRIPT
   ===================================================== */

"use strict";

/* ---------- SUPABASE INIT ---------- */
let sb = null;
function initSupabase() {
  if (CONFIG.supabase.url !== "YOUR_SUPABASE_URL" && typeof window.supabase !== "undefined") {
    sb = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
  }
}

/* ---------- PRELOADER ---------- */
function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  // Generate bubbles
  const bubblesContainer = preloader.querySelector(".preloader-bubbles");
  if (bubblesContainer) {
    for (let i = 0; i < 12; i++) {
      const b = document.createElement("div");
      b.className = "bubble";
      const size = Math.random() * 60 + 20;
      b.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        animation-duration:${Math.random() * 6 + 4}s;
        animation-delay:${Math.random() * 4}s;
      `;
      bubblesContainer.appendChild(b);
    }
  }

  function hidePreloader() {
    if (preloader.classList.contains("hide")) return;
    preloader.classList.add("hide");
    setTimeout(() => { if (preloader.parentNode) preloader.remove(); }, 800);
  }

  // Hide after 1.5s — fast path, doesn't wait for images or CDN
  setTimeout(hidePreloader, 1500);

  // Also catch window.load if it fires earlier
  window.addEventListener("load", () => setTimeout(hidePreloader, 300));
}

/* ---------- CURSOR GLOW ---------- */
function initCursorGlow() {
  const cursor = document.querySelector(".cursor-glow");
  if (!cursor || window.innerWidth < 768) return;
  document.addEventListener("mousemove", (e) => {
    cursor.classList.add("on");
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  }, { passive: true });
}

/* ---------- NAVBAR ---------- */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.querySelector(".nav-hamburger");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links a[href^='#']");

  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
    updateActiveLink();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    hamburger?.classList.toggle("open", open);
    navLinks?.classList.toggle("open", open);
    hamburger?.setAttribute("aria-expanded", String(open));
    hamburger?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  hamburger?.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  navLinks?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Smooth scroll
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
}

function updateActiveLink() {
  const links = document.querySelectorAll(".nav-links a[href^='#']");
  const sections = document.querySelectorAll("section[id]");
  let current = "";
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.getAttribute("id");
  });
  links.forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
  });
}

/* ---------- STATS COUNTER ---------- */
function initStatsCounter() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const duration = 2000;
      let start = null;

      function step(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target + suffix;
      }
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach((c) => observer.observe(c));
}

/* ---------- PARTICLES.JS ---------- */
function initParticles() {
  if (typeof particlesJS === "undefined") return;
  particlesJS("particles-js", {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 900 } },
      color: { value: ["#48cae4", "#90e0ef", "#caf0f8", "#ffffff"] },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1 } },
      size: { value: 5, random: true },
      line_linked: { enable: true, distance: 140, color: "#90e0ef", opacity: 0.3, width: 1 },
      move: { enable: true, speed: 1.8, direction: "none", random: true, out_mode: "out" },
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" } },
      modes: { grab: { distance: 180, line_linked: { opacity: 0.6 } }, push: { particles_nb: 3 } },
    },
    retina_detect: true,
  });
}

/* ---------- SCROLL REVEAL (native, no library) ---------- */
function initAOS() {
  const els = [...document.querySelectorAll("[data-aos]")];
  if (!els.length) return;

  // Step 1: Only hide elements that are BELOW the visible viewport
  // Elements already in view (like near-top sections) stay visible
  els.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight + 50) {
      el.classList.add("sr-hidden");
    }
  });

  // Step 2: When element scrolls into view, remove sr-hidden → CSS transition plays
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.aosDelay || 0);
          setTimeout(() => el.classList.remove("sr-hidden"), delay);
          obs.unobserve(el);
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    els.filter((el) => el.classList.contains("sr-hidden")).forEach((el) => obs.observe(el));
  } else {
    // No IntersectionObserver → show everything
    els.forEach((el) => el.classList.remove("sr-hidden"));
  }

  // Absolute failsafe: after 4s everything is visible regardless
  setTimeout(() => {
    document.querySelectorAll(".sr-hidden").forEach((el) => el.classList.remove("sr-hidden"));
  }, 4000);
}

/* ---------- SWIPER (REVIEWS) ---------- */
function initSwiper() {
  if (typeof Swiper === "undefined") return;
  new Swiper(".reviews-swiper", {
    slidesPerView: 1,
    spaceBetween: 24,
    rewind: true,
    autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true },
    pagination: { el: ".swiper-pagination", clickable: true },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}

/* ==========================================================
   GLOBAL TAB SWITCHER — called by inline onclick on buttons
   ========================================================== */
window.switchTab = function (btn) {
  const key = btn && btn.dataset && btn.dataset.tab;
  if (!key) return;

  /* update button active states */
  document.querySelectorAll(".tab-btn").forEach((b) =>
    b.classList.toggle("active", b === btn)
  );

  /* show/hide panels — clear inline styles so CSS classes take full control */
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.removeAttribute("style");
    panel.classList.toggle("active", panel.id === "tab-" + key);
  });
};

/* ---------- TREATMENT TABS ---------- */
function initTabs() {
  /* Activate the first tab button — CSS handles panel visibility via .tab-panel.active */
  const firstBtn = document.querySelector(".tab-btn[data-tab='acupuncture']");
  if (firstBtn) window.switchTab(firstBtn);
}

/* ---------- BACK TO TOP ---------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* ---------- OFFER POPUP + COUPON CODE ---------- */
function initOfferPopup() {
  if (!CONFIG.offer.enabled) return;
  const popup = document.getElementById("offer-popup");
  if (!popup) return;

  // Show at most once per browser session, and never again once dismissed or claimed
  let seen = false;
  try { seen = sessionStorage.getItem("shatursh-offer") === "1"; } catch (_) {}
  const markSeen = () => { try { sessionStorage.setItem("shatursh-offer", "1"); } catch (_) {} };
  if (!seen) setTimeout(() => popup.classList.add("show"), CONFIG.offer.delay);

  popup.querySelector(".offer-close")?.addEventListener("click", (e) => {
    e.stopPropagation();
    popup.classList.remove("show", "expanded");
    markSeen();
  });
  // On phones the popup is a compact strip; tapping the header expands the form
  popup.querySelector(".offer-popup-header")?.addEventListener("click", () => popup.classList.toggle("expanded"));

  popup.querySelector(".offer-claim-btn")?.addEventListener("click", () => {
    const name  = popup.querySelector("#offer-name")?.value.trim();
    const phone = popup.querySelector("#offer-phone")?.value.trim();
    if (!name || !phone) {
      showToast("Please fill in your name and phone number.", "error");
      return;
    }

    markSeen();
    // Generate a unique coupon code
    const code = "SHC-FREE-" + Math.floor(1000 + Math.random() * 9000);

    // Show coupon in popup
    const body = popup.querySelector(".offer-popup-body");
    if (body) {
      body.innerHTML = `
        <div style="text-align:center;padding:8px 0">
          <p style="font-size:0.9rem;color:var(--text-light);margin-bottom:16px">
            Your free consultation coupon code:
          </p>
          <div style="background:var(--pale-blue);border:2px dashed var(--teal);
               border-radius:12px;padding:16px 24px;margin-bottom:16px">
            <span style="font-size:1.5rem;font-weight:800;color:var(--ocean-blue);
                  letter-spacing:3px">${code}</span>
          </div>
          <p style="font-size:0.8rem;color:var(--text-light);margin-bottom:20px">
            Show this code when you arrive at the clinic<br>or mention it on WhatsApp.
          </p>
          <button onclick="navigator.clipboard&&navigator.clipboard.writeText('${code}').then(()=>window.showToast&&showToast('Coupon code copied!','success'))"
            style="background:var(--pale-blue);border:none;border-radius:8px;
                   padding:8px 20px;color:var(--ocean-blue);font-weight:700;
                   cursor:pointer;margin-bottom:12px;font-size:0.85rem">
            <i class="fas fa-copy"></i> Copy Code
          </button>
        </div>`;
    }

    // Open WhatsApp with coupon
    const msg = encodeURIComponent(
      `Hi Dr. Nithin! I'd like to claim my FREE first consultation.\nName: ${name}\nPhone: ${phone}\nCoupon Code: ${code}`
    );
    window.open(`https://wa.me/${CONFIG.clinic.whatsapp}?text=${msg}`, "_blank");
    showToast("Coupon generated! Opening WhatsApp to confirm.", "success");
  });
}

/* ---------- CONTACT FORM ---------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  /* Prevent ANY native form submission */
  form.onsubmit = (e) => { e && e.preventDefault(); return false; };

  const btn       = form.querySelector(".form-submit");
  const successEl = form.querySelector(".form-success");
  const errorEl   = form.querySelector(".form-error");
  if (!btn) return;

  const val = (n) => ((form.elements[n] || {}).value || "").trim();
  const dateInput = form.elements["date"];
  if (dateInput) dateInput.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const flag = (n, bad) => { const el = form.elements[n]; if (el) el.classList.toggle("invalid", bad); return bad; };
  form.addEventListener("input", (e) => e.target.classList?.remove("invalid"));

  let busy = false;
  async function handleSubmit() {
    if (busy) return;
    const name = val("name"), phone = val("phone"), email = val("email");
    const service = val("service"), date = val("date");
    const branch = val("branch"), slot = val("slot");
    const message = [val("message"), branch && `Branch: ${branch}`, slot && `Preferred time: ${slot}`].filter(Boolean).join("\n");

    if (flag("name", !name)) { showToast("Please enter your name.", "error"); return; }
    const digits = phone.replace(/\D/g, "");
    if (flag("phone", digits.length < 10 || digits.length > 13)) { showToast("Please enter a valid phone number.", "error"); return; }
    if (flag("email", !!email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) { showToast("Please enter a valid email address.", "error"); return; }
    if (flag("service", !service)) { showToast("Please select a treatment.", "error"); return; }
    if (flag("date", !!date && dateInput && dateInput.min && date < dateInput.min)) { showToast("Please choose today or a future date.", "error"); return; }

    const spinner = btn.querySelector(".loading-spinner");
    const btnText = btn.querySelector(".btn-text");
    busy = true;
    successEl?.classList.remove("show");
    errorEl?.classList.remove("show");
    btn.disabled = true;
    if (spinner) spinner.style.display = "inline-block";
    if (btnText) btnText.textContent = "Sending...";

    const created_at = new Date().toISOString();
    /* Row stored in Supabase — only real table columns */
    const row = { name, phone, email, service, message, date: date || null, created_at };
    /* Extra template params for the EmailJS notification */
    /* WhatsApp-ready number (country code + 10 digits) and a readable IST timestamp for the email template */
    let waNum = phone.replace(/\D/g, "");
    if (waNum.length === 11 && waNum.startsWith("0")) waNum = waNum.slice(1);
    if (waNum.length === 10) waNum = "91" + waNum;
    const submitted_at = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";
    const mail = { ...row, email: email || "Not provided", date: date || "Not specified", message: message || "No message", phone_digits: waNum, submitted_at, to_email: CONFIG.clinic.email, cc_email: CONFIG.clinic.ccEmail, from_name: name, reply_to: email || CONFIG.clinic.email, clinic_name: CONFIG.clinic.name };

    let delivered = false;
    try {
      if (sb) {
        const { error } = await sb.from("contacts").insert([row]);
        if (error) console.warn("Supabase save:", error.message); else delivered = true;
      }
    } catch (e) { console.warn("Supabase:", e); }

    try {
      if (CONFIG.emailjs.serviceId !== "YOUR_SERVICE_ID" && typeof emailjs !== "undefined") {
        await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, mail);
        delivered = true;
        // CC handled in code: send the same email to the CC address (skipped if it is the same as the main recipient)
        const cc = CONFIG.clinic.ccEmail;
        if (cc && cc.toLowerCase() !== String(mail.to_email).toLowerCase()) {
          emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, { ...mail, to_email: cc })
            .catch((e) => console.warn("EmailJS cc:", e));
        }
      }
    } catch (e) { console.warn("EmailJS:", e); }

    if (delivered) {
      successEl?.classList.add("show");
      form.reset();
      try { triggerConfetti(); } catch (_) {}
      showToast("Appointment request received! We'll call you within 24 hours.", "success");
    } else {
      /* Nothing reached the clinic — be honest and hand the patient a WhatsApp fallback */
      const wa = `https://wa.me/${CONFIG.clinic.whatsapp}?text=` + encodeURIComponent(
        `Hi Dr. Nithin! I'd like to book an appointment.\nName: ${name}\nPhone: ${phone}\nTreatment: ${service}` +
        (date ? `\nPreferred date: ${date}` : "") + (message ? `\nNotes: ${message}` : ""));
      if (errorEl) {
        errorEl.innerHTML = `<i class="fas fa-circle-exclamation"></i> We couldn't send your request online. Please <a href="${wa}" target="_blank" rel="noopener">send it on WhatsApp</a> or call us directly.`;
        errorEl.classList.add("show");
      }
      showToast("Could not send your request. Please use WhatsApp or call us.", "error");
    }

    busy = false;
    btn.disabled = false;
    if (spinner) spinner.style.display = "none";
    if (btnText) btnText.textContent = "Send Appointment Request";
  }

  btn.onclick = handleSubmit;
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") { e.preventDefault(); handleSubmit(); }
  });
}

/* ---------- REVIEW FORM ---------- */
function initReviewForm() {
  const form = document.getElementById("review-form");
  if (!form) return;

  /* Prevent native submit */
  form.onsubmit = (e) => { e && e.preventDefault(); return false; };

  let rating = 0;
  form.querySelectorAll(".star-rating input").forEach((star) => {
    star.addEventListener("change", () => { rating = parseInt(star.value); });
  });

  const btn = form.querySelector(".form-submit");
  if (!btn) return;

  async function handleReview() {
    if (rating === 0) { showToast("Please select a star rating.", "error"); return; }

    const name = (form.elements["reviewer_name"] || {}).value?.trim() || "";
    const text = (form.elements["review_text"]   || {}).value?.trim() || "";
    if (!name) { showToast("Please enter your name.", "error"); return; }
    if (!text) { showToast("Please write your review.", "error"); return; }

    btn.disabled = true;

    const data = {
      name,
      rating,
      text,
      service: (form.elements["reviewer_service"] || {}).value || "",
      created_at: new Date().toISOString(),
      approved: false,
    };

    try {
      if (!sb) throw new Error("Reviews database is not connected");
      const { error } = await sb.from("reviews").insert([data]);
      if (error) throw error;
      showToast("Thank you for your review! It will appear after approval.", "success");
      form.reset();
      rating = 0;
    } catch (err) {
      console.error("Review form error:", err);
      showToast("Sorry, we couldn't submit your review right now. Please try again later.", "error");
    } finally {
      btn.disabled = false;
    }
  }

  btn.onclick = handleReview;
}

/* ---------- LOAD REVIEWS ---------- */
async function loadReviews() {
  if (!sb) return;
  try {
    const { data: reviews } = await sb
      .from("reviews")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (!reviews || !reviews.length) return;

    const wrapper = document.querySelector(".reviews-swiper .swiper-wrapper");
    if (!wrapper) return;

    wrapper.innerHTML = reviews.map((r) => {
      const stars = Math.max(0, Math.min(5, Math.round(Number(r.rating) || 0)));
      const name = String(r.name || "Patient");
      return `
      <div class="swiper-slide">
        <div class="review-card">
          <div class="review-stars">${"★".repeat(stars)}${"☆".repeat(5 - stars)}</div>
          <p class="review-text">${escapeHtml(r.text || "")}</p>
          <div class="review-author">
            <div class="review-author-avatar">${escapeHtml(name.charAt(0).toUpperCase())}</div>
            <div>
              <div class="review-author-name">${escapeHtml(name)}</div>
              <div class="review-author-meta">${r.service ? escapeHtml(r.service) : "Patient"}</div>
            </div>
          </div>
        </div>
      </div>`;
    }).join("");

    /* live stats from real approved reviews */
    const rated = reviews.map((r) => Number(r.rating)).filter((n) => n >= 1 && n <= 5);
    if (rated.length) {
      const avg = rated.reduce((a, b) => a + b, 0) / rated.length;
      const avgEl = document.getElementById("stat-avg-rating");
      if (avgEl) avgEl.textContent = "★ " + avg.toFixed(1);
      const cnt = document.getElementById("stat-review-count");
      const wrap = document.getElementById("stat-review-count-wrap");
      if (cnt && wrap) { cnt.textContent = reviews.length + (reviews.length === 12 ? "+" : ""); wrap.hidden = false; }
    }
  } catch (err) {
    console.error("Could not load reviews:", err);
  }
}

/* ---------- SEO: LOCAL BUSINESS STRUCTURED DATA (built from config.js) ---------- */
function injectStructuredData() {
  const c = CONFIG.clinic;
  const data = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: c.name,
    description: c.description,
    image: c.doctor.imageUrl,
    logo: c.logoUrl,
    telephone: c.phone,
    email: c.email,
    address: { "@type": "PostalAddress", addressRegion: "Tamil Nadu", addressCountry: "IN", streetAddress: c.address },
    medicalSpecialty: "Acupuncture",
    founder: { "@type": "Person", name: c.doctor.name, jobTitle: c.doctor.title },
    sameAs: Object.values(CONFIG.social).filter((u) => u && u !== "#"),
  };
  const tag = document.createElement("script");
  tag.type = "application/ld+json";
  tag.textContent = JSON.stringify(data);
  document.head.appendChild(tag);
}

/* ---------- TOAST NOTIFICATION ---------- */
function showToast(message, type = "success") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.innerHTML = `<i class="fas ${icon}"></i><span></span>`;
  toast.querySelector("span").textContent = message;

  clearTimeout(showToast._t);
  requestAnimationFrame(() => {
    toast.classList.add("show");
    showToast._t = setTimeout(() => toast.classList.remove("show"), 4500);
  });
}

/* ---------- MARQUEE DUPLICATE ---------- */
function initMarquee() {
  const track = document.querySelector(".marquee-track");
  if (!track) return;
  const original = track.innerHTML;
  track.innerHTML = original + original;
}

/* ---------- POPULATE CONFIG VALUES ---------- */
function populateConfig() {
  // Phone links
  document.querySelectorAll("[data-phone]").forEach((el) => {
    el.href = `tel:${CONFIG.clinic.phone.replace(/\s/g, "")}`;
    if (el.querySelector(".config-phone-text")) {
      el.querySelector(".config-phone-text").textContent = CONFIG.clinic.phone;
    }
  });
  // WhatsApp links
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    const msg = encodeURIComponent(CONFIG.clinic.whatsappMessage);
    el.href = `https://wa.me/${CONFIG.clinic.whatsapp}?text=${msg}`;
  });
  // Email links
  document.querySelectorAll("[data-email]").forEach((el) => {
    el.href = `mailto:${CONFIG.clinic.email}`;
    if (el.querySelector(".config-email-text")) {
      el.querySelector(".config-email-text").textContent = CONFIG.clinic.email;
    }
  });
  // Text content
  document.querySelectorAll("[data-config]").forEach((el) => {
    const path = el.dataset.config.split(".");
    let val = CONFIG;
    path.forEach((k) => { val = val?.[k]; });
    if (val !== undefined) el.textContent = val;
  });
  // Social links
  if (CONFIG.social.instagram !== "#")
    document.querySelectorAll("[data-social='instagram']").forEach((el) => (el.href = CONFIG.social.instagram));
  if (CONFIG.social.facebook !== "#")
    document.querySelectorAll("[data-social='facebook']").forEach((el) => (el.href = CONFIG.social.facebook));
  // YouTube removed — no YouTube social links in HTML
  // Offer popup
  const offerTitle = document.getElementById("offer-title");
  const offerDesc = document.getElementById("offer-desc");
  if (offerTitle) offerTitle.textContent = CONFIG.offer.title;
  if (offerDesc) offerDesc.textContent = CONFIG.offer.description;
}

/* ---------- HELPER: ESCAPE HTML ---------- */
function escapeHtml(str) {
  const el = document.createElement("div");
  el.textContent = str;
  return el.innerHTML;
}

/* ---------- INIT ALL (each wrapped in try-catch so one bug never blocks another) ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const safe = (label, fn) => { try { fn(); } catch (e) { console.warn(`[${label}]`, e); } };

  // EmailJS initialization (v4 API)
  safe("emailjs-init", () => {
    if (typeof emailjs !== "undefined" && CONFIG.emailjs.publicKey !== "YOUR_PUBLIC_KEY") {
      emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
    }
  });

  safe("config",        populateConfig);    // CRITICAL — run FIRST so WhatsApp/phone links are set immediately
  safe("supabase",      initSupabase);
  safe("preloader",     initPreloader);
  safe("cursor",        initCursorGlow);
  safe("navbar",        initNavbar);
  safe("scrollReveal",  initAOS);
  safe("particles",     initParticles);
  safe("stats",         initStatsCounter);
  safe("tabs",          initTabs);
  safe("backToTop",     initBackToTop);
  safe("offerPopup",    initOfferPopup);
  safe("contactForm",   initContactForm);   // CRITICAL — must never be blocked
  safe("reviewForm",    initReviewForm);    // CRITICAL
  safe("marquee",       initMarquee);
  safe("lazyIframes",   initLazyIframes);
  safe("specModal",     initSpecModal);
  safe("scrollProgress",initScrollProgress);
  safe("darkMode",      initDarkMode);
  safe("waterRipple",   initWaterRipple);
  safe("tiltCards",     initTiltCards);
  safe("magnet",        initMagneticButtons);
  safe("symptomFinder", initSymptomFinder);
  safe("faq",           initFAQ);
  safe("quickBook",     initQuickBook);
  safe("ringStats",     initRingStats);
  safe("schema",        injectStructuredData);
  loadReviews().then(initSwiper).catch(()=>{});
});

/* =====================================================
   NEXT-LEVEL FEATURES
   ===================================================== */

/* ---------- LAZY IFRAME LOADER ---------- */
function initLazyIframes() {
  const iframes = document.querySelectorAll("iframe[data-src]");
  if (!iframes.length) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.src = el.dataset.src;
          obs.unobserve(el);
        }
      });
    },
    { threshold: 0.1 }
  );
  iframes.forEach((el) => obs.observe(el));
}

/* ---------- SCROLL PROGRESS BAR ---------- */
function initScrollProgress() {
  const bar = document.querySelector(".scroll-progress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100).toFixed(2) + "%";
  }, { passive: true });
}

/* ---------- DARK MODE ---------- */
function initDarkMode() {
  const toggle = document.querySelector(".dark-mode-toggle");
  if (!toggle) return;

  function applyTheme(dark) {
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.setAttribute("data-theme", "dark");
      toggle.title = "Switch to Light Mode";
      toggle.setAttribute("aria-label", "Switch to Light Mode");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.body.removeAttribute("data-theme");
      toggle.title = "Switch to Dark Mode";
      toggle.setAttribute("aria-label", "Switch to Dark Mode");
    }
    localStorage.setItem("shatursh-theme", dark ? "dark" : "light");
  }

  // Apply saved preference on load
  applyTheme(localStorage.getItem("shatursh-theme") === "dark");

  toggle.addEventListener("click", () => {
    applyTheme(document.body.getAttribute("data-theme") !== "dark");
  });
}

/* ---------- WATER RIPPLE ON CLICK ---------- */
function initWaterRipple() {
  const hero = document.querySelector(".hero");
  if (!hero) return;
  hero.addEventListener("click", (e) => {
    const rect = hero.getBoundingClientRect();
    const ripple = document.createElement("div");
    ripple.className = "water-click-ripple";
    ripple.style.left = (e.clientX - rect.left) + "px";
    ripple.style.top = (e.clientY - rect.top + window.scrollY) + "px";
    hero.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1100);
  });
}

/* ---------- 3D TILT CARDS ---------- */
function initTiltCards() {
  if (!window.matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll(".service-card, .why-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.transition = "transform 0.5s ease";
      setTimeout(() => (card.style.transition = ""), 500);
    });
    card.addEventListener("mouseenter", () => {
      card.style.transition = "transform 0.15s ease";
    });
  });
}

/* ---------- MAGNETIC BUTTONS ---------- */
function initMagneticButtons() {
  if (!window.matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll(".btn-primary, .btn-green, .btn-white").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
      btn.style.transform = `translate(${x}px, ${y}px) translateY(-3px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
}

/* ---------- SPECIALIZATION POPUP ---------- */
const SPEC_DATA = {
  acupuncture: {
    icon: "fa-circle-nodes",
    title: "Acupuncture Therapy",
    points: [
      "Ultra-fine sterile needles stimulate precise energy points on the body to activate natural healing",
      "Effective for chronic pain, migraines, sciatica, frozen shoulder, arthritis and stress relief",
      "Balances the body's vital energy (Qi) flow for lasting pain-free wellness — zero side effects",
    ],
  },
  acupressure: {
    icon: "fa-hand-back-fist",
    title: "Acupressure",
    points: [
      "Firm finger pressure on the same meridian points as acupuncture — completely needle-free",
      "Relieves headaches, neck tension, fatigue, nausea and digestive discomfort gently",
      "Safe for all ages including children and elderly — a perfect first step into natural healing",
    ],
  },
  varma: {
    icon: "fa-hands",
    title: "Varma Therapy",
    points: [
      "Ancient South Indian healing system applying pressure to 108 vital nerve junctions (Varma points)",
      "Powerfully restores nerve function, treats paralysis, musculoskeletal disorders and joint pain",
      "Balances the body's pranic energy — one of the most potent traditional healing methods available",
    ],
  },
  cupping: {
    icon: "fa-circle-half-stroke",
    title: "Cupping & Hijama Therapy",
    points: [
      "Specially designed cups create controlled suction that lifts tissue and draws out toxins naturally",
      "Boosts blood circulation, deeply relaxes muscles and accelerates sports injury recovery",
      "Hijama (wet cupping) detoxifies the blood, reduces inflammation and relieves chronic pain",
    ],
  },
  chiro: {
    icon: "fa-bone",
    title: "Chiropractic Therapy",
    points: [
      "Precise hands-on adjustments correct misalignments in the spine, neck and joints",
      "Instantly relieves lower back pain, herniated discs, sciatica and nerve compression",
      "Improves posture, restores full mobility and prevents long-term spinal degeneration",
    ],
  },
  reflexology: {
    icon: "fa-shoe-prints",
    title: "Reflexology",
    points: [
      "Specific pressure on reflex zones of the feet and hands that mirror every organ in the body",
      "Promotes deep relaxation, reduces stress hormones and improves lymphatic circulation",
      "Supports kidney, liver, digestive and hormonal health through non-invasive foot therapy",
    ],
  },
  sujok: {
    icon: "fa-hand-sparkles",
    title: "Sujok Therapy",
    points: [
      "Hands and feet are micro-maps of the entire human body — treatment applied at these mini points",
      "Tiny stimulators, seeds or mini-needles on hand/foot reflex points give rapid pain relief",
      "Highly effective for joint pain, organ disorders, headaches and emotional imbalances",
    ],
  },
  auricular: {
    icon: "fa-ear-listen",
    title: "Auricular Therapy",
    points: [
      "The outer ear contains a complete map of the body — over 200 identified acupuncture points",
      "Micro-needles or ear seeds stimulate points linked to organs, nerves and brain areas",
      "Used effectively for pain management, stress, addiction recovery, weight and sleep disorders",
    ],
  },
  flower: {
    icon: "fa-leaf",
    title: "Flower Medicine",
    points: [
      "Dilute flower essences work on the emotional and energetic level to restore inner balance",
      "Addresses anxiety, grief, fear, low confidence, anger and emotional trauma gently",
      "Completely natural, non-toxic and safe for all ages — no known contraindications",
    ],
  },
  leech: {
    icon: "fa-worm",
    title: "Leech Therapy (Hirudotherapy)",
    points: [
      "Medicinal leeches secrete hirudin — a powerful natural anticoagulant and anti-inflammatory",
      "Improves micro-circulation, relieves varicose veins, joint inflammation and diabetic wounds",
      "WHO-recognised therapy used successfully for pain, skin conditions and post-surgical healing",
    ],
  },
  pain: {
    icon: "fa-heart-pulse",
    title: "Holistic Pain Management",
    points: [
      "Multi-therapy protocol combining acupuncture, cupping and Varma to target the root of pain",
      "Addresses chronic conditions like fibromyalgia, neuropathy, arthritis and post-surgical pain",
      "Long-lasting relief without drugs, injections or surgery — completely personalised per patient",
    ],
  },
  sports: {
    icon: "fa-person-running",
    title: "Sports Rehabilitation",
    points: [
      "Structured recovery programs for sprains, muscle tears, tendon injuries and sports fractures",
      "Combines acupuncture, cupping and manual therapy to accelerate tissue repair and mobility",
      "Restores peak athletic performance and builds injury prevention strategies for the future",
    ],
  },
  wellness: {
    icon: "fa-shield-heart",
    title: "Wellness & Preventive Care",
    points: [
      "Proactive health maintenance — detox, immune system boost and energy restoration programs",
      "Personalised lifestyle, diet and therapy plans to keep you healthy before illness strikes",
      "Regular sessions improve sleep quality, mental clarity, digestion and overall vitality",
    ],
  },
  /* ─── Trainer programmes ─── */
  sports_tape: {
    icon: "fa-bandage",
    title: "Sports Taping Techniques",
    points: [
      "Kinesio and athletic taping methods to support injured muscles, joints and tendons during recovery",
      "Teaches correct tape application to stabilise structures, reduce pain and prevent re-injury",
      "Used alongside acupuncture and manual therapy in sports rehabilitation programmes",
    ],
  },
  chiro_train: {
    icon: "fa-bone",
    title: "Chiropractic Therapy Training",
    points: [
      "Hands-on teaching of safe spinal adjustment, mobilisation and soft-tissue techniques",
      "Covers patient assessment, contraindications, red flags and evidence-based treatment protocols",
      "Practical training programme for practitioners seeking to add chiropractic skills to their practice",
    ],
  },
  varma_train: {
    icon: "fa-hands",
    title: "Varma Therapy Training",
    points: [
      "Comprehensive transfer of knowledge of all 108 vital Varma points and their therapeutic applications",
      "Students learn safe stimulation methods for pain relief, nerve conditions and musculoskeletal disorders",
      "Covers both clinical therapy use and traditional emergency revival (Thodu Varmam) techniques",
    ],
  },
  acu_train: {
    icon: "fa-circle-nodes",
    title: "Acupuncture Training",
    points: [
      "Full foundation programme covering meridian theory, point selection and needle placement",
      "Students learn sterile technique, patient assessment, treatment planning and safety protocols",
      "Prepares students for professional practice and formal acupuncture certification",
    ],
  },
};

function initSpecModal() {
  const overlay = document.getElementById("spec-modal");
  if (!overlay) return;

  const modalIcon  = document.getElementById("spec-modal-icon");
  const modalTitle = document.getElementById("spec-modal-title");
  const modalPts   = document.getElementById("spec-modal-points");
  const modalBtn   = document.getElementById("spec-modal-btn");
  const closeBtn   = overlay.querySelector(".spec-modal-close");

  function openModal(key) {
    const d = SPEC_DATA[key];
    if (!d) return;

    modalIcon.className = `fas ${d.icon}`;
    modalTitle.textContent = d.title;
    modalPts.innerHTML = d.points.map((p) => `<li>${p}</li>`).join("");

    // Badge — trainer programmes get a different colour
    const badge = overlay.querySelector(".spec-modal-badge");
    const isTrainer = ["sports_tape","chiro_train","varma_train","acu_train"].includes(key);
    if (badge) {
      badge.textContent = isTrainer ? "Dr. Nithin R — Trainer Programme" : "Dr. Nithin R — Specialization";
      badge.style.background = isTrainer ? "#fef3c7" : "";
      badge.style.color      = isTrainer ? "#92400e" : "";
    }

    // CTA label changes for trainer programmes
    if (modalBtn) {
      modalBtn.innerHTML = isTrainer
        ? `<i class="fab fa-whatsapp"></i> Enquire About Training`
        : `<i class="fas fa-calendar-check"></i> Book This Treatment`;
    }

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Open on spec-card click
  document.querySelectorAll("[data-spec]").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.spec));
  });

  // Close on X button
  closeBtn?.addEventListener("click", closeModal);

  // Close on overlay background click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Close modal when Contact link inside modal is clicked
  modalBtn?.addEventListener("click", closeModal);
}

/* ---------- SYMPTOM FINDER ---------- */
const SYMPTOM_MAP = {
  "neck-back": {
    icon: "fa-person-rays", label: "Neck & Back Pain",
    desc: "Targeted relief for cervical and lumbar pain through acupuncture needling, spinal adjustments, and Varma pressure therapy — restoring flexibility and reducing nerve compression.",
    treatments: [{ name: "Acupuncture Therapy", icon: "fa-circle-nodes" }, { name: "Chiropractic Care", icon: "fa-bone" }, { name: "Varma Therapy", icon: "fa-hands" }],
  },
  "migraine": {
    icon: "fa-head-side-virus", label: "Migraine / Headache",
    desc: "Proven acupuncture protocols reduce migraine frequency and severity by regulating blood flow, releasing muscle tension in the neck, and calming the nervous system.",
    treatments: [{ name: "Acupuncture Therapy", icon: "fa-circle-nodes" }, { name: "Reflexology", icon: "fa-shoe-prints" }, { name: "Cupping Therapy", icon: "fa-circle-half-stroke" }],
  },
  "sciatica": {
    icon: "fa-person-walking", label: "Sciatica",
    desc: "Precise acupuncture points and manual therapy techniques decompress the sciatic nerve, relieving radiating leg pain and restoring comfortable walking and movement.",
    treatments: [{ name: "Acupuncture Therapy", icon: "fa-circle-nodes" }, { name: "Chiropractic Care", icon: "fa-bone" }, { name: "Varma Therapy", icon: "fa-hands" }],
  },
  "frozen-shoulder": {
    icon: "fa-person-skiing", label: "Frozen Shoulder",
    desc: "Multi-therapy approach combining acupuncture, cupping, and manual mobilization to break adhesions, reduce inflammation, and restore full shoulder range of motion.",
    treatments: [{ name: "Acupuncture Therapy", icon: "fa-circle-nodes" }, { name: "Cupping Therapy", icon: "fa-circle-half-stroke" }, { name: "Chiropractic Care", icon: "fa-bone" }],
  },
  "arthritis": {
    icon: "fa-hand-dots", label: "Arthritis",
    desc: "Natural, drug-free management of arthritic joints using acupuncture, Varma therapy, and reflexology to reduce inflammation, ease stiffness, and improve daily function.",
    treatments: [{ name: "Acupuncture Therapy", icon: "fa-circle-nodes" }, { name: "Varma Therapy", icon: "fa-hands" }, { name: "Reflexology", icon: "fa-shoe-prints" }],
  },
  "stress": {
    icon: "fa-brain", label: "Stress & Anxiety",
    desc: "Calming acupuncture sessions and reflexology treatments activate the parasympathetic nervous system, lower cortisol levels, and restore emotional and mental balance.",
    treatments: [{ name: "Acupuncture Therapy", icon: "fa-circle-nodes" }, { name: "Reflexology", icon: "fa-shoe-prints" }, { name: "Cupping Therapy", icon: "fa-circle-half-stroke" }],
  },
  "sports": {
    icon: "fa-person-running", label: "Sports Injury",
    desc: "Comprehensive sports rehabilitation integrating multiple natural therapies to accelerate tissue repair, restore strength, and return you to peak performance safely.",
    treatments: [{ name: "Sports Rehabilitation", icon: "fa-person-running" }, { name: "Cupping Therapy", icon: "fa-circle-half-stroke" }, { name: "Acupuncture Therapy", icon: "fa-circle-nodes" }],
  },
  "posture": {
    icon: "fa-person-chalkboard", label: "Poor Posture",
    desc: "Chiropractic realignment combined with therapeutic exercises and Varma therapy corrects postural deviations, relieves chronic tension, and prevents long-term damage.",
    treatments: [{ name: "Chiropractic Care", icon: "fa-bone" }, { name: "Varma Therapy", icon: "fa-hands" }, { name: "Occupational Therapy", icon: "fa-briefcase-medical" }],
  },
  "joint": {
    icon: "fa-bone", label: "Joint Pain",
    desc: "Multi-modal natural therapy addressing joint inflammation, cartilage health, and surrounding muscle tension for lasting pain relief and improved mobility.",
    treatments: [{ name: "Acupuncture Therapy", icon: "fa-circle-nodes" }, { name: "Chiropractic Care", icon: "fa-bone" }, { name: "Cupping Therapy", icon: "fa-circle-half-stroke" }],
  },
  "fatigue": {
    icon: "fa-battery-quarter", label: "Chronic Fatigue",
    desc: "Energy-restoring treatments through Varma therapy and acupuncture balance the body's vital energy, improving sleep quality, mental clarity, and physical vitality.",
    treatments: [{ name: "Varma Therapy", icon: "fa-hands" }, { name: "Acupuncture Therapy", icon: "fa-circle-nodes" }, { name: "Reflexology", icon: "fa-shoe-prints" }],
  },
  "muscle": {
    icon: "fa-dumbbell", label: "Muscle Tension",
    desc: "Deep-tissue cupping and therapeutic massage release chronic muscle knots, improve circulation, and restore the natural elasticity and comfort of overworked muscles.",
    treatments: [{ name: "Cupping Therapy", icon: "fa-circle-half-stroke" }, { name: "Sports Rehabilitation", icon: "fa-person-running" }, { name: "Acupuncture Therapy", icon: "fa-circle-nodes" }],
  },
  "nerve": {
    icon: "fa-bolt", label: "Nerve Pain",
    desc: "Precise Varma therapy and acupuncture stimulate damaged nerve pathways, reduce neuropathic pain signals, and promote nerve regeneration for lasting relief.",
    treatments: [{ name: "Varma Therapy", icon: "fa-hands" }, { name: "Acupuncture Therapy", icon: "fa-circle-nodes" }, { name: "Occupational Therapy", icon: "fa-briefcase-medical" }],
  },
};

function initSymptomFinder() {
  const cards = document.querySelectorAll(".symptom-card");
  const resultBox = document.getElementById("symptom-result");
  if (!cards.length || !resultBox) return;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      const key = card.dataset.symptom;
      const data = SYMPTOM_MAP[key];
      if (!data) return;
      const waMsg = encodeURIComponent(`Hi! I'm experiencing ${data.label} and would like to book a consultation at Shatursh Healthcare Centre.`);
      resultBox.innerHTML = `
        <div class="symptom-result-header">
          <div class="symptom-result-icon"><i class="fas ${data.icon}"></i></div>
          <div>
            <div class="symptom-result-title">Recommended for: ${data.label}</div>
          </div>
        </div>
        <p class="symptom-result-desc">${data.desc}</p>
        <div class="symptom-result-treatments">
          ${data.treatments.map(t => `<span class="symptom-treatment-tag"><i class="fas ${t.icon}"></i>${t.name}</span>`).join("")}
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a href="#contact" class="btn btn-primary" style="font-size:0.85rem;padding:11px 22px">
            <i class="fas fa-calendar-check"></i> Book Appointment
          </a>
          <a href="https://wa.me/${CONFIG.clinic.whatsapp}?text=${waMsg}" target="_blank" class="btn btn-green" style="font-size:0.85rem;padding:11px 22px">
            <i class="fab fa-whatsapp"></i> Ask on WhatsApp
          </a>
        </div>`;
      resultBox.classList.add("show");
      resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
}

/* ---------- FAQ ACCORDION ---------- */
function initFAQ() {
  const setOpen = (item, open) => {
    item.classList.toggle("open", open);
    item.querySelector(".faq-question")?.setAttribute("aria-expanded", String(open));
  };
  document.querySelectorAll(".faq-question").forEach((q) => {
    q.setAttribute("role", "button");
    q.setAttribute("tabindex", "0");
    q.setAttribute("aria-expanded", "false");
    const toggle = () => {
      const item = q.closest(".faq-item");
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((i) => setOpen(i, false));
      if (!wasOpen) setOpen(item, true);
    };
    q.addEventListener("click", toggle);
    q.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  });
}

/* ---------- QUICK BOOK WIDGET ---------- */
function initQuickBook() {
  const widget = document.getElementById("quick-book-widget");
  const tab = document.querySelector(".quick-book-tab");
  const closeBtn = document.querySelector(".quick-book-close");
  const submitBtn = document.querySelector(".quick-book-submit");
  if (!widget) return;

  // Reveal the side tab once the visitor scrolls past the hero (the panel only opens on click)
  const hero = document.getElementById("home");
  window.addEventListener("scroll", () => {
    if (hero) widget.classList.toggle("ready", window.scrollY > hero.offsetHeight * 0.8);
  }, { passive: true });

  tab?.addEventListener("click", () => widget.classList.toggle("show"));
  closeBtn?.addEventListener("click", () => widget.classList.remove("show"));

  submitBtn?.addEventListener("click", () => {
    const name = document.getElementById("qb-name")?.value.trim();
    const phone = document.getElementById("qb-phone")?.value.trim();
    const service = document.getElementById("qb-service")?.value;
    if (!name || !phone) { showToast("Please enter your name and phone.", "error"); return; }
    const msg = encodeURIComponent(`Hi! I'd like to book an appointment.\nName: ${name}\nPhone: ${phone}\nTreatment: ${service || "General Consultation"}`);
    window.open(`https://wa.me/${CONFIG.clinic.whatsapp}?text=${msg}`, "_blank", "noopener");
    widget.classList.remove("show");
    showToast("Opening WhatsApp to confirm your booking!", "success");
  });
}

/* ---------- RING STATS ---------- */
function initRingStats() {
  const rings = document.querySelectorAll(".ring-fill");
  if (!rings.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const ring = entry.target;
      const pct = parseFloat(ring.dataset.pct) / 100;
      const circumference = 314;
      ring.style.strokeDashoffset = circumference * (1 - pct);
      observer.unobserve(ring);
    });
  }, { threshold: 0.5 });
  rings.forEach((r) => observer.observe(r));
}

/* ---------- CONFETTI ---------- */
function triggerConfetti() {
  const canvas = document.getElementById("confetti-canvas") || (() => {
    const c = document.createElement("canvas");
    c.id = "confetti-canvas";
    document.body.appendChild(c);
    return c;
  })();
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#00b4d8", "#48cae4", "#0077b6", "#90e0ef", "#caf0f8", "#ffffff", "#023e8a"];
  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: -12,
    r: Math.random() * 7 + 3,
    d: Math.random() * 80 + 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * 10 - 10,
    tiltAngle: 0,
    tiltInc: Math.random() * 0.07 + 0.04,
    vx: (Math.random() - 0.5) * 2,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.tilt * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2);
      ctx.restore();
      p.tiltAngle += p.tiltInc;
      p.y += (Math.cos(frame / 10 + p.d) + 2.5 + p.r / 4) * 0.9;
      p.x += p.vx + Math.sin(frame / 20) * 0.3;
      p.tilt = Math.sin(p.tiltAngle - frame / 3) * 15;
    });
    frame++;
    if (frame < 220) requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  requestAnimationFrame(draw);
}
