/* =====================================================
   SHATURSH HEALTHCARE CENTRE — MAIN JAVASCRIPT
   ===================================================== */

"use strict";

/* ---------- SUPABASE INIT ---------- */
let supabase = null;
function initSupabase() {
  if (CONFIG.supabase.url !== "YOUR_SUPABASE_URL" && typeof window.supabase !== "undefined") {
    supabase = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
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

  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("hide");
      setTimeout(() => preloader.remove(), 700);
    }, 2400);
  });
}

/* ---------- CURSOR GLOW ---------- */
function initCursorGlow() {
  const cursor = document.querySelector(".cursor-glow");
  if (!cursor || window.innerWidth < 768) return;
  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });
}

/* ---------- NAVBAR ---------- */
function initNavbar() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.querySelector(".nav-hamburger");
  const navLinks = document.querySelector(".nav-links");
  const links = document.querySelectorAll(".nav-links a[href^='#']");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
    updateActiveLink();
  });

  hamburger?.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  navLinks?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      hamburger?.classList.remove("open");
      navLinks.classList.remove("open");
    });
  });

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
  const sections = document.querySelectorAll("section[id], div[id='home']");
  let current = "";
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute("id");
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

/* ---------- AOS ---------- */
function initAOS() {
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 700, once: true, offset: 80, easing: "ease-out-cubic" });
  }
}

/* ---------- SWIPER (REVIEWS) ---------- */
function initSwiper() {
  if (typeof Swiper === "undefined") return;
  new Swiper(".reviews-swiper", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
    breakpoints: {
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}

/* ---------- TREATMENT TABS ---------- */
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      tabBtns.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${target}`)?.classList.add("active");
    });
  });
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

/* ---------- OFFER POPUP ---------- */
function initOfferPopup() {
  if (!CONFIG.offer.enabled) return;
  const popup = document.getElementById("offer-popup");
  if (!popup) return;

  setTimeout(() => popup.classList.add("show"), CONFIG.offer.delay);

  popup.querySelector(".offer-close")?.addEventListener("click", () => {
    popup.classList.remove("show");
  });

  popup.querySelector(".offer-claim-btn")?.addEventListener("click", () => {
    const name = popup.querySelector("#offer-name")?.value.trim();
    const phone = popup.querySelector("#offer-phone")?.value.trim();
    if (!name || !phone) { showToast("Please fill in your name and phone.", "error"); return; }
    const msg = encodeURIComponent(`Hi! I'd like to claim my free first consultation.\nName: ${name}\nPhone: ${phone}`);
    window.open(`https://wa.me/${CONFIG.clinic.whatsapp}?text=${msg}`, "_blank");
    popup.classList.remove("show");
    showToast("Great! Opening WhatsApp to confirm your free consultation.", "success");
  });
}

/* ---------- CONTACT FORM ---------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector(".form-submit");
    const successEl = form.querySelector(".form-success");
    const errorEl = form.querySelector(".form-error");
    const spinner = btn.querySelector(".loading-spinner");
    const btnText = btn.querySelector(".btn-text");

    successEl.classList.remove("show");
    errorEl.classList.remove("show");

    btn.disabled = true;
    if (spinner) spinner.style.display = "inline-block";
    if (btnText) btnText.textContent = "Sending...";

    const data = {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email?.value.trim() || "",
      service: form.service.value,
      date: form.date?.value || "",
      message: form.message.value.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        const { error } = await supabase.from("contacts").insert([data]);
        if (error) throw error;
      }

      if (CONFIG.emailjs.serviceId !== "YOUR_SERVICE_ID" && typeof emailjs !== "undefined") {
        await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, data, CONFIG.emailjs.publicKey);
      }

      successEl.classList.add("show");
      form.reset();
      triggerConfetti();
      showToast("Appointment request sent! We'll contact you shortly.", "success");
    } catch (err) {
      console.error(err);
      errorEl.classList.add("show");
      showToast("Something went wrong. Please try calling us directly.", "error");
    } finally {
      btn.disabled = false;
      if (spinner) spinner.style.display = "none";
      if (btnText) btnText.textContent = "Send Request";
    }
  });
}

/* ---------- REVIEW FORM ---------- */
function initReviewForm() {
  const form = document.getElementById("review-form");
  if (!form) return;

  let rating = 0;
  const stars = form.querySelectorAll(".star-rating input");
  stars.forEach((star) => {
    star.addEventListener("change", () => { rating = parseInt(star.value); });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (rating === 0) { showToast("Please select a star rating.", "error"); return; }

    const btn = form.querySelector(".form-submit");
    btn.disabled = true;

    const data = {
      name: form.reviewer_name.value.trim(),
      rating,
      text: form.review_text.value.trim(),
      service: form.reviewer_service?.value || "",
      created_at: new Date().toISOString(),
      approved: false,
    };

    try {
      if (supabase) {
        const { error } = await supabase.from("reviews").insert([data]);
        if (error) throw error;
      }
      showToast("Thank you for your review! It will appear after approval.", "success");
      form.reset();
      rating = 0;
    } catch (err) {
      console.error(err);
      showToast("Could not submit review. Please try again.", "error");
    } finally {
      btn.disabled = false;
    }
  });
}

/* ---------- LOAD REVIEWS ---------- */
async function loadReviews() {
  if (!supabase) return;
  try {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(12);

    if (!reviews || !reviews.length) return;

    const wrapper = document.querySelector(".reviews-swiper .swiper-wrapper");
    if (!wrapper) return;

    wrapper.innerHTML = reviews.map((r) => `
      <div class="swiper-slide">
        <div class="review-card">
          <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
          <p class="review-text">${escapeHtml(r.text)}</p>
          <div class="review-author">
            <div class="review-author-avatar">${r.name.charAt(0).toUpperCase()}</div>
            <div>
              <div class="review-author-name">${escapeHtml(r.name)}</div>
              <div class="review-author-meta">${r.service ? escapeHtml(r.service) : "Patient"}</div>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Could not load reviews:", err);
  }
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
  toast.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;

  requestAnimationFrame(() => {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4000);
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
  if (CONFIG.social.youtube !== "#")
    document.querySelectorAll("[data-social='youtube']").forEach((el) => (el.href = CONFIG.social.youtube));
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

/* ---------- INIT ALL ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initSupabase();
  initPreloader();
  initCursorGlow();
  initNavbar();
  initAOS();
  initParticles();
  initStatsCounter();
  initTabs();
  initBackToTop();
  initOfferPopup();
  initContactForm();
  initReviewForm();
  initMarquee();
  populateConfig();
  loadReviews().then(initSwiper);
  // Next-level features
  initScrollProgress();
  initDarkMode();
  initTypewriter();
  initWaterRipple();
  initTiltCards();
  initMagneticButtons();
  initSymptomFinder();
  initFAQ();
  initQuickBook();
  initRingStats();
  initParallax();
});

/* =====================================================
   NEXT-LEVEL FEATURES
   ===================================================== */

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
  const saved = localStorage.getItem("shatursh-theme");
  if (saved === "dark") document.body.setAttribute("data-theme", "dark");
  toggle.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    document.body.setAttribute("data-theme", isDark ? "light" : "dark");
    localStorage.setItem("shatursh-theme", isDark ? "light" : "dark");
  });
}

/* ---------- TYPEWRITER ---------- */
function initTypewriter() {
  const el = document.querySelector(".hero-typewriter");
  if (!el) return;
  const words = ["Natural Healing", "Pain Relief", "Holistic Wellness", "Drug-Free Therapy", "True Recovery", "Lasting Health"];
  let wi = 0, ci = 0, deleting = false;
  function type() {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    if (!deleting && ci > word.length) {
      deleting = true; setTimeout(type, 1800); return;
    }
    if (deleting && ci < 0) {
      deleting = false; wi = (wi + 1) % words.length; ci = 0;
    }
    setTimeout(type, deleting ? 55 : 105);
  }
  setTimeout(type, 800);
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
  document.querySelectorAll(".service-card, .why-card, .process-step .process-step-num").forEach((card) => {
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
    icon: "fa-joint", label: "Joint Pain",
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
  document.querySelectorAll(".faq-question").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((i) => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

/* ---------- QUICK BOOK WIDGET ---------- */
function initQuickBook() {
  const widget = document.getElementById("quick-book-widget");
  const tab = document.querySelector(".quick-book-tab");
  const closeBtn = document.querySelector(".quick-book-close");
  const submitBtn = document.querySelector(".quick-book-submit");
  if (!widget) return;

  // Show widget after scrolling past hero
  let widgetClosed = false;
  window.addEventListener("scroll", () => {
    if (widgetClosed) return;
    const hero = document.getElementById("home");
    if (hero && window.scrollY > hero.offsetHeight * 0.8) {
      setTimeout(() => { if (!widgetClosed) widget.classList.add("show"); }, 800);
    }
  }, { passive: true, once: true });

  tab?.addEventListener("click", () => widget.classList.toggle("show"));
  closeBtn?.addEventListener("click", () => {
    widget.classList.remove("show"); widgetClosed = true;
  });

  submitBtn?.addEventListener("click", () => {
    const name = document.getElementById("qb-name")?.value.trim();
    const phone = document.getElementById("qb-phone")?.value.trim();
    const service = document.getElementById("qb-service")?.value;
    if (!name || !phone) { showToast("Please enter your name and phone.", "error"); return; }
    const msg = encodeURIComponent(`Hi! I'd like to book an appointment.\nName: ${name}\nPhone: ${phone}\nTreatment: ${service || "General Consultation"}`);
    window.open(`https://wa.me/${CONFIG.clinic.whatsapp}?text=${msg}`, "_blank");
    widget.classList.remove("show");
    widgetClosed = true;
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

/* ---------- PARALLAX ON HERO ---------- */
function initParallax() {
  const heroContent = document.querySelector(".hero-content");
  const heroImg = document.querySelector(".hero-image-wrap");
  if (!heroContent) return;
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.12}px)`;
      if (heroImg) heroImg.style.transform = `translateY(${scrolled * 0.06}px)`;
    }
  }, { passive: true });
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
