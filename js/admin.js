/* =====================================================
   SHATURSH HEALTHCARE CENTRE — ADMIN DASHBOARD JS
   ===================================================== */

"use strict";

let supabaseAdmin = null;
let allContacts = [];
let allReviews = [];
let activeSection = "contacts";

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  document.getElementById("login-form")?.addEventListener("submit", handleLogin);
  document.getElementById("logout-btn")?.addEventListener("click", logout);
});

/* ---------- AUTH ---------- */
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem("shatursh_admin");
  if (isLoggedIn === "true") showDashboard();
  else showLogin();
}

function handleLogin(e) {
  e.preventDefault();
  const pass = document.getElementById("admin-password").value;
  const err = document.getElementById("login-error");
  if (pass === CONFIG.admin.password) {
    sessionStorage.setItem("shatursh_admin", "true");
    err.style.display = "none";
    showDashboard();
  } else {
    err.style.display = "block";
    const input = document.getElementById("admin-password");
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 500);
  }
}

function logout() {
  sessionStorage.removeItem("shatursh_admin");
  showLogin();
}

function showLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";
}

function showDashboard() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("dashboard").style.display = "flex";
  initAdmin();
}

/* ---------- ADMIN INIT ---------- */
function initAdmin() {
  initSupabaseAdmin();
  initNavButtons();
  loadStats();
  loadContacts();
  loadReviews();
}

function initSupabaseAdmin() {
  if (CONFIG.supabase.url !== "YOUR_SUPABASE_URL" && typeof window.supabase !== "undefined") {
    supabaseAdmin = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
  }
}

/* ---------- NAV BUTTONS ---------- */
function initNavButtons() {
  document.querySelectorAll(".dash-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      showSection(section);
      document.querySelectorAll(".dash-nav-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
  document.getElementById("search-contacts")?.addEventListener("input", (e) => {
    filterContacts(e.target.value);
  });
  document.getElementById("search-reviews")?.addEventListener("input", (e) => {
    filterReviews(e.target.value);
  });
  document.getElementById("export-contacts")?.addEventListener("click", exportContacts);
  document.getElementById("export-reviews")?.addEventListener("click", exportReviews);
  document.getElementById("approve-all-btn")?.addEventListener("click", approveAllReviews);
}

function showSection(name) {
  activeSection = name;
  document.querySelectorAll(".dash-section").forEach((s) => (s.style.display = "none"));
  const target = document.getElementById(`section-${name}`);
  if (target) target.style.display = "block";
}

/* ---------- LOAD STATS ---------- */
async function loadStats() {
  if (!supabaseAdmin) {
    renderStats({ totalContacts: 0, newThisWeek: 0, totalReviews: 0, avgRating: 0 });
    return;
  }
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [{ count: totalContacts }, { count: newThisWeek }, { count: totalReviews }, { data: ratingsData }] =
      await Promise.all([
        supabaseAdmin.from("contacts").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("contacts").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("reviews").select("rating").eq("approved", true),
      ]);

    const avg =
      ratingsData && ratingsData.length
        ? (ratingsData.reduce((a, r) => a + r.rating, 0) / ratingsData.length).toFixed(1)
        : "—";

    renderStats({ totalContacts: totalContacts || 0, newThisWeek: newThisWeek || 0, totalReviews: totalReviews || 0, avgRating: avg });
  } catch (err) {
    console.error(err);
  }
}

function renderStats({ totalContacts, newThisWeek, totalReviews, avgRating }) {
  setText("stat-total-contacts", totalContacts);
  setText("stat-new-week", newThisWeek);
  setText("stat-total-reviews", totalReviews);
  setText("stat-avg-rating", avgRating);
}

/* ---------- LOAD CONTACTS ---------- */
async function loadContacts() {
  showTableLoading("contacts-tbody", 6);
  if (!supabaseAdmin) {
    renderContacts([]);
    return;
  }
  try {
    const { data } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });
    allContacts = data || [];
    renderContacts(allContacts);
  } catch (err) {
    console.error(err);
    renderContacts([]);
  }
}

function renderContacts(contacts) {
  const tbody = document.getElementById("contacts-tbody");
  if (!tbody) return;
  if (!contacts.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#999;">No contacts yet</td></tr>`;
    return;
  }
  tbody.innerHTML = contacts.map((c) => `
    <tr>
      <td>${escHtml(c.name || "")}</td>
      <td>${escHtml(c.phone || "")}</td>
      <td>${escHtml(c.email || "")}</td>
      <td>${escHtml(c.service || "")}</td>
      <td>${c.date ? escHtml(c.date) : "—"}</td>
      <td>${formatDate(c.created_at)}</td>
      <td>
        <button class="admin-btn danger" onclick="deleteContact('${c.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

function filterContacts(query) {
  const q = query.toLowerCase();
  renderContacts(
    allContacts.filter((c) =>
      [c.name, c.phone, c.email, c.service].some((f) => f && f.toLowerCase().includes(q))
    )
  );
}

window.deleteContact = async function (id) {
  if (!confirm("Delete this contact?")) return;
  try {
    if (supabaseAdmin) await supabaseAdmin.from("contacts").delete().eq("id", id);
    allContacts = allContacts.filter((c) => c.id !== id);
    renderContacts(allContacts);
    loadStats();
    showAdminToast("Contact deleted.");
  } catch (err) {
    showAdminToast("Could not delete.", "error");
  }
};

/* ---------- LOAD REVIEWS ---------- */
async function loadReviews() {
  showTableLoading("reviews-tbody", 6);
  if (!supabaseAdmin) {
    renderReviews([]);
    return;
  }
  try {
    const { data } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    allReviews = data || [];
    renderReviews(allReviews);
  } catch (err) {
    console.error(err);
    renderReviews([]);
  }
}

function renderReviews(reviews) {
  const tbody = document.getElementById("reviews-tbody");
  if (!tbody) return;
  if (!reviews.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#999;">No reviews yet</td></tr>`;
    return;
  }
  tbody.innerHTML = reviews.map((r) => `
    <tr>
      <td>${escHtml(r.name || "")}</td>
      <td>${"★".repeat(r.rating || 0)}</td>
      <td style="max-width:240px;white-space:normal">${escHtml(r.text || "")}</td>
      <td>${escHtml(r.service || "—")}</td>
      <td>
        <span class="status-badge ${r.approved ? "approved" : "pending"}">
          ${r.approved ? "Approved" : "Pending"}
        </span>
      </td>
      <td>
        ${!r.approved ? `<button class="admin-btn success" onclick="approveReview('${r.id}')"><i class="fas fa-check"></i></button>` : ""}
        <button class="admin-btn danger" onclick="deleteReview('${r.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

function filterReviews(query) {
  const q = query.toLowerCase();
  renderReviews(
    allReviews.filter((r) =>
      [r.name, r.text, r.service].some((f) => f && f.toLowerCase().includes(q))
    )
  );
}

window.approveReview = async function (id) {
  try {
    if (supabaseAdmin) await supabaseAdmin.from("reviews").update({ approved: true }).eq("id", id);
    const r = allReviews.find((r) => r.id === id);
    if (r) r.approved = true;
    renderReviews(allReviews);
    loadStats();
    showAdminToast("Review approved!");
  } catch (err) {
    showAdminToast("Could not approve.", "error");
  }
};

window.deleteReview = async function (id) {
  if (!confirm("Delete this review?")) return;
  try {
    if (supabaseAdmin) await supabaseAdmin.from("reviews").delete().eq("id", id);
    allReviews = allReviews.filter((r) => r.id !== id);
    renderReviews(allReviews);
    loadStats();
    showAdminToast("Review deleted.");
  } catch (err) {
    showAdminToast("Could not delete.", "error");
  }
};

async function approveAllReviews() {
  const pending = allReviews.filter((r) => !r.approved);
  if (!pending.length) { showAdminToast("No pending reviews.", "info"); return; }
  try {
    if (supabaseAdmin) {
      await supabaseAdmin.from("reviews").update({ approved: true }).eq("approved", false);
    }
    allReviews.forEach((r) => (r.approved = true));
    renderReviews(allReviews);
    loadStats();
    showAdminToast(`${pending.length} reviews approved!`);
  } catch (err) {
    showAdminToast("Could not approve all.", "error");
  }
}

/* ---------- EXPORT ---------- */
function exportContacts() {
  if (typeof XLSX === "undefined") { alert("SheetJS not loaded. Add the CDN link."); return; }
  const rows = allContacts.map((c) => ({
    Name: c.name, Phone: c.phone, Email: c.email,
    Service: c.service, Date: c.date, Received: formatDate(c.created_at), Message: c.message,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contacts");
  XLSX.writeFile(wb, "shatursh_contacts.xlsx");
}

function exportReviews() {
  if (typeof XLSX === "undefined") { alert("SheetJS not loaded. Add the CDN link."); return; }
  const rows = allReviews.map((r) => ({
    Name: r.name, Rating: r.rating, Review: r.text,
    Service: r.service, Status: r.approved ? "Approved" : "Pending", Date: formatDate(r.created_at),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reviews");
  XLSX.writeFile(wb, "shatursh_reviews.xlsx");
}

/* ---------- HELPERS ---------- */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function showTableLoading(tbodyId, cols) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = Array(3).fill(`
    <tr>${Array(cols).fill('<td><div class="skeleton"></div></td>').join("")}</tr>
  `).join("");
}

function showAdminToast(message, type = "success") {
  let toast = document.getElementById("admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `admin-toast ${type}`;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}
