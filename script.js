/**
 * ProjectX Hub — script.js
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  SETUP INSTRUCTIONS (READ CAREFULLY)
 *  ─────────────────────────────────────
 *
 *  STEP 1 — Create your Google Sheet:
 *    a. Go to https://sheets.google.com and create a new sheet.
 *    b. On Row 1, add these headers exactly:
 *       Timestamp | Full Name | Email | Phone | Skills | Experience | Why Join | Portfolio
 *
 *  STEP 2 — Deploy Apps Script (receives form submissions):
 *    a. In your Sheet, click Extensions → Apps Script.
 *    b. Delete all code and paste the SUBMIT SCRIPT below.
 *    c. Click Deploy → New deployment → Web App.
 *       - Execute as: Me
 *       - Who has access: Anyone
 *    d. Copy the Web App URL and paste it into GOOGLE_SHEET_SUBMIT_URL below.
 *
 *  STEP 3 — Deploy Apps Script (for admin dashboard read):
 *    a. In the SAME Apps Script project, add a second function (READ SCRIPT below).
 *    b. Redeploy (or create a new deployment) and copy that URL into
 *       GOOGLE_SHEET_READ_URL below.
 *    c. Alternatively, you can use the SAME deployment URL for both — just
 *       differentiate by sending action=submit vs action=read in the payload.
 *
 *  ──────────────────────────────────────────────────────────────────────
 *  GOOGLE APPS SCRIPT CODE — paste into your Apps Script editor:
 *  ──────────────────────────────────────────────────────────────────────
 *
 *  function doPost(e) {
 *    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *    const data  = JSON.parse(e.postData.contents);
 *    sheet.appendRow([
 *      new Date().toLocaleString(),
 *      data.fullName,
 *      data.email,
 *      data.phone,
 *      data.skills,
 *      data.experience,
 *      data.whyJoin,
 *      data.portfolio || ""
 *    ]);
 *    return ContentService
 *      .createTextOutput(JSON.stringify({ result: "success" }))
 *      .setMimeType(ContentService.MimeType.JSON);
 *  }
 *
 *  function doGet(e) {
 *    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *    const rows  = sheet.getDataRange().getValues();
 *    // Skip header row (row 0)
 *    const data  = rows.slice(1).map(r => ({
 *      timestamp:  r[0],
 *      fullName:   r[1],
 *      email:      r[2],
 *      phone:      r[3],
 *      skills:     r[4],
 *      experience: r[5],
 *      whyJoin:    r[6],
 *      portfolio:  r[7]
 *    }));
 *    return ContentService
 *      .createTextOutput(JSON.stringify(data))
 *      .setMimeType(ContentService.MimeType.JSON);
 *  }
 *
 *  ──────────────────────────────────────────────────────────────────────
 */

// ============================================================
//  ↓↓  REPLACE THESE TWO URLS WITH YOUR APPS SCRIPT URLS  ↓↓
// ============================================================

const GOOGLE_SHEET_SUBMIT_URL = "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
const GOOGLE_SHEET_READ_URL   = "YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"; // same URL works for GET

// ============================================================


/* ─── NAV: scroll state + hamburger ─── */
const nav       = document.getElementById("nav");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

hamburger.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => mobileMenu.classList.remove("open"));
});


/* ─── SCROLL REVEAL ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));


/* ─── FORM VALIDATION ─── */
const form       = document.getElementById("applyForm");
const submitBtn  = document.getElementById("submitBtn");
const btnLoader  = document.getElementById("btnLoader");
const btnText    = submitBtn.querySelector(".btn-text");

const rules = {
  fullName:   { required: true, minLength: 2, label: "Full name" },
  email:      { required: true, email: true,  label: "Email" },
  phone:      { required: true, phone: true,  label: "Phone number" },
  experience: { required: true, label: "Experience level" },
  skills:     { required: true, minLength: 3, label: "Skills" },
  whyJoin:    { required: true, minLength: 20, label: "Your motivation" },
};

function validate(name, value) {
  const r = rules[name];
  if (!r) return "";
  if (r.required && !value.trim()) return `${r.label} is required.`;
  if (r.minLength && value.trim().length < r.minLength) return `${r.label} must be at least ${r.minLength} characters.`;
  if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email.";
  if (r.phone && !/^[\d\s\+\-\(\)]{7,20}$/.test(value)) return "Please enter a valid phone number.";
  return "";
}

function setFieldState(name, errorMsg) {
  const field = document.getElementById(name);
  const errEl = document.getElementById("err-" + name);
  if (!field || !errEl) return;
  if (errorMsg) {
    field.classList.add("invalid");
    errEl.textContent = errorMsg;
  } else {
    field.classList.remove("invalid");
    errEl.textContent = "";
  }
}

// Live validation
Object.keys(rules).forEach(name => {
  const field = document.getElementById(name);
  if (!field) return;
  field.addEventListener("blur", () => {
    setFieldState(name, validate(name, field.value));
  });
  field.addEventListener("input", () => {
    if (field.classList.contains("invalid")) {
      setFieldState(name, validate(name, field.value));
    }
  });
});

function getFormData() {
  return {
    fullName:   document.getElementById("fullName").value.trim(),
    email:      document.getElementById("email").value.trim(),
    phone:      document.getElementById("phone").value.trim(),
    experience: document.getElementById("experience").value,
    skills:     document.getElementById("skills").value.trim(),
    whyJoin:    document.getElementById("whyJoin").value.trim(),
    portfolio:  document.getElementById("portfolio").value.trim(),
  };
}

function validateAll(data) {
  let valid = true;
  Object.keys(rules).forEach(name => {
    const err = validate(name, data[name] || "");
    setFieldState(name, err);
    if (err) valid = false;
  });
  return valid;
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnLoader.classList.toggle("active", loading);
  btnText.textContent = loading ? "Submitting…" : "Submit Application";
}

function showSuccess() {
  const overlay = document.getElementById("successOverlay");
  overlay.hidden = false;
  overlay.focus?.();
}

// ============================================================
//  ↓↓  APNI EMAIL YAHAN DAALO  ↓↓
// ============================================================
const YOUR_EMAIL = "princeverma50055@gmail.com";
// ============================================================

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = getFormData();
  if (!validateAll(data)) return;

  const subject = encodeURIComponent("New Application: " + data.fullName + " — ProjectX Hub");

  const body = encodeURIComponent(
`New application received on ProjectX Hub!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full Name    : ${data.fullName}
Email        : ${data.email}
Phone        : ${data.phone}
Experience   : ${data.experience}
Skills       : ${data.skills}
Portfolio    : ${data.portfolio || "Not provided"}

Why Join ProjectX Hub:
${data.whyJoin}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  );

  window.location.href = `mailto:${YOUR_EMAIL}?subject=${subject}&body=${body}`;

  // Success message thodi der baad dikhao
  setTimeout(() => {
    form.reset();
    showSuccess();
  }, 500);
});


/* ─── ADMIN DASHBOARD ─── */
let allApplications = [];

async function loadApplications() {
  const empty  = document.getElementById("adminEmpty");
  const table  = document.getElementById("adminTable");
  const count  = document.getElementById("adminCount");

  if (!GOOGLE_SHEET_READ_URL || GOOGLE_SHEET_READ_URL.startsWith("YOUR_")) {
    empty.innerHTML = `
      <p>⚠️ <strong>Google Sheets not configured.</strong><br>
      Set <code>GOOGLE_SHEET_READ_URL</code> in <code>script.js</code> to load real data.</p>
      <p style="margin-top:12px;color:var(--text3);font-size:0.85rem;">Showing demo data for preview.</p>
    `;
    allApplications = getDemoData();
    renderTable(allApplications);
    count.textContent = `${allApplications.length} applications`;
    return;
  }

  empty.innerHTML = `<p style="color:var(--text3)">Loading applications…</p>`;
  table.hidden = true;

  try {
    const res  = await fetch(GOOGLE_SHEET_READ_URL);
    const json = await res.json();
    allApplications = json;
    renderTable(allApplications);
    count.textContent = `${allApplications.length} applications`;
    empty.innerHTML = "";
  } catch (err) {
    empty.innerHTML = `<p style="color:#EF4444">Failed to load data. Check your Apps Script URL and CORS settings.</p>`;
    console.error(err);
  }
}

function renderTable(data) {
  const table = document.getElementById("adminTable");
  const tbody = document.getElementById("adminTbody");
  const empty = document.getElementById("adminEmpty");

  if (!data.length) {
    table.hidden = true;
    empty.innerHTML = "<p>No applications found.</p>";
    return;
  }

  tbody.innerHTML = data.map((row, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="trunc" title="${esc(String(row.timestamp))}">${esc(String(row.timestamp))}</td>
      <td><strong>${esc(row.fullName)}</strong></td>
      <td class="trunc"><a href="mailto:${esc(row.email)}">${esc(row.email)}</a></td>
      <td class="trunc">${esc(row.phone)}</td>
      <td class="trunc" title="${esc(row.skills)}">${esc(row.skills)}</td>
      <td>${esc(row.experience)}</td>
      <td class="trunc" title="${esc(row.whyJoin)}">${esc(row.whyJoin)}</td>
      <td>${row.portfolio ? `<a href="${esc(row.portfolio)}" target="_blank" rel="noopener">View</a>` : "—"}</td>
    </tr>
  `).join("");

  table.hidden = false;
  document.getElementById("adminEmpty").innerHTML = "";
}

function filterApplications() {
  const q = document.getElementById("adminSearch").value.toLowerCase();
  const filtered = allApplications.filter(row =>
    (row.fullName || "").toLowerCase().includes(q) ||
    (row.email    || "").toLowerCase().includes(q) ||
    (row.skills   || "").toLowerCase().includes(q)
  );
  renderTable(filtered);
  document.getElementById("adminCount").textContent =
    `${filtered.length} of ${allApplications.length} applications`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getDemoData() {
  return [
    {
      timestamp: "6/10/2025, 9:02 AM",
      fullName: "Ayesha Raza",
      email: "ayesha@example.com",
      phone: "+92 300 1234567",
      skills: "SEO, Google Ads, Content Strategy",
      experience: "Advanced (4–6 years)",
      whyJoin: "I want to apply my digital marketing skills to real growth projects that leverage AI and data-driven strategy.",
      portfolio: "https://ayesha.dev"
    },
    {
      timestamp: "6/10/2025, 11:45 AM",
      fullName: "Marcus Webb",
      email: "marcus@example.com",
      phone: "+1 555 987 6543",
      skills: "Python, Data Analysis, EDA, Predictive Modeling",
      experience: "Expert (7+ years)",
      whyJoin: "ProjectX Hub's focus on AI-first thinking aligns perfectly with my background in ML and analytics engineering.",
      portfolio: ""
    },
    {
      timestamp: "6/10/2025, 2:30 PM",
      fullName: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 98765 43210",
      skills: "Video Editing, Motion Graphics, Branding",
      experience: "Intermediate (2–3 years)",
      whyJoin: "I've been freelancing in content creation for 2 years and want to grow within a structured high-output team.",
      portfolio: "https://priyafolio.com"
    },
  ];
}

// Auto-load admin data when the admin section comes into view
const adminObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadApplications();
    adminObserver.disconnect();
  }
}, { threshold: 0.2 });

const adminSection = document.getElementById("admin");
if (adminSection) adminObserver.observe(adminSection);
