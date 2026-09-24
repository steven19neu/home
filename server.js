require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const PAGES_FILE = path.join(__dirname, "data", "pages.json");
const RESERVED_SLUGS = new Set(["admin", "style.css", "admin.css"]);

const app = express();

// ---------- Cấu hình cơ bản ----------
const PORT = process.env.PORT || 3000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "";
const TRUST_PROXY_HTTPS = process.env.TRUST_PROXY_HTTPS === "true";

if (!ADMIN_PASSWORD_HASH) {
  console.warn(
    "\n[CẢNH BÁO] Chưa cấu hình ADMIN_PASSWORD_HASH trong .env — trang /admin sẽ không đăng nhập được.\n" +
    'Chạy: npm run hash-password -- "mat-khau-cua-ban" rồi dán hash vào .env\n'
  );
}
if (!SESSION_SECRET || SESSION_SECRET.length < 16) {
  console.warn("\n[CẢNH BÁO] SESSION_SECRET quá ngắn hoặc chưa đặt — hãy đặt một chuỗi ngẫu nhiên dài trong .env\n");
}

if (TRUST_PROXY_HTTPS) app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: SESSION_SECRET || "insecure-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: TRUST_PROXY_HTTPS,
      maxAge: 1000 * 60 * 60 * 8, // 8 giờ
    },
  })
);

// ---------- Chặn brute-force đăng nhập rất đơn giản (theo IP, lưu trong RAM) ----------
const loginAttempts = new Map(); // ip -> { count, firstAttemptAt }
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip) {
  const rec = loginAttempts.get(ip);
  if (!rec) return false;
  if (Date.now() - rec.firstAttemptAt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}
function registerFailedAttempt(ip) {
  const rec = loginAttempts.get(ip);
  if (!rec || Date.now() - rec.firstAttemptAt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttemptAt: Date.now() });
  } else {
    rec.count += 1;
  }
}
function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

// ---------- Đọc / ghi dữ liệu trang ----------
function loadPages() {
  const raw = fs.readFileSync(PAGES_FILE, "utf8");
  return JSON.parse(raw);
}
function savePages(pages) {
  fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), "utf8");
}

// ---------- Template layout (thay thế chuỗi, không dùng thư viện ngoài) ----------
function render(templateName, replacements) {
  const filePath = path.join(__dirname, "views", templateName);
  let html = fs.readFileSync(filePath, "utf8");
  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(`{{${key}}}`).join(value);
  }
  return html;
}

function buildNav(pages, activeSlug) {
  return pages
    .filter((p) => p.showInNav)
    .sort((a, b) => a.order - b.order)
    .map((p) => {
      const href = p.slug === "home" ? "/" : `/${p.slug}`;
      const cls = p.slug === activeSlug ? ' style="color:#1b3a4b;font-weight:600;"' : "";
      return `<a href="${href}"${cls}>${escapeHtml(p.title)}</a>`;
    })
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPublicPage(page, pages) {
  return render("layout.html", {
    TITLE: escapeHtml(page.title),
    NAV: buildNav(pages, page.slug),
    CONTENT: page.content,
    YEAR: String(new Date().getFullYear()),
  });
}

// ---------- Middleware yêu cầu đăng nhập ----------
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect("/admin/login");
}

// ================= ROUTES CÔNG KHAI =================

app.get("/", (req, res) => {
  const pages = loadPages();
  const home = pages.find((p) => p.slug === "home");
  if (!home) return res.status(404).send("Chưa có trang chủ.");
  res.send(renderPublicPage(home, pages));
});

app.get("/:slug", (req, res, next) => {
  const { slug } = req.params;
  if (RESERVED_SLUGS.has(slug)) return next();
  const pages = loadPages();
  const page = pages.find((p) => p.slug === slug);
  if (!page) return res.status(404).send("Không tìm thấy trang.");
  res.send(renderPublicPage(page, pages));
});

// ================= ROUTES ADMIN =================

app.get("/admin/login", (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect("/admin");
  res.send(render("admin-login.html", { ERROR: "" }));
});

app.post("/admin/login", async (req, res) => {
  const ip = req.ip;
  if (isRateLimited(ip)) {
    return res
      .status(429)
      .send(render("admin-login.html", { ERROR: '<div class="error-box">Bạn đã thử sai quá nhiều lần. Vui lòng thử lại sau ít phút.</div>' }));
  }

  const { username, password } = req.body;

  const usernameOk = typeof username === "string" && username === ADMIN_USERNAME;
  const passwordOk =
    ADMIN_PASSWORD_HASH && typeof password === "string" && (await bcrypt.compare(password, ADMIN_PASSWORD_HASH).catch(() => false));

  if (!usernameOk || !passwordOk) {
    registerFailedAttempt(ip);
    return res
      .status(401)
      .send(render("admin-login.html", { ERROR: '<div class="error-box">Sai tên đăng nhập hoặc mật khẩu.</div>' }));
  }

  clearAttempts(ip);
  req.session.regenerate((err) => {
    if (err) return res.status(500).send("Lỗi máy chủ, vui lòng thử lại.");
    req.session.isAdmin = true;
    res.redirect("/admin");
  });
});

app.post("/admin/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

app.get("/admin", requireAuth, (req, res) => {
  const pages = loadPages().sort((a, b) => a.order - b.order);
  const rows = pages
    .map(
      (p) => `<tr>
        <td>${escapeHtml(p.title)}</td>
        <td><code>/${p.slug === "home" ? "" : p.slug}</code></td>
        <td><a class="btn-ghost" href="/admin/edit/${encodeURIComponent(p.slug)}">Sửa</a></td>
      </tr>`
    )
    .join("");
  res.send(render("admin-dashboard.html", { ROWS: rows }));
});

app.get("/admin/edit/:slug", requireAuth, (req, res) => {
  const pages = loadPages();
  const page = pages.find((p) => p.slug === req.params.slug);
  if (!page) return res.status(404).send("Không tìm thấy trang.");
  res.send(
    render("admin-edit.html", {
      PAGE_TITLE: escapeHtml(page.title),
      SLUG: page.slug,
      TITLE_VALUE: escapeHtml(page.title),
      CONTENT_VALUE: escapeHtml(page.content),
      SAVED: "",
    })
  );
});

app.post("/admin/edit/:slug", requireAuth, (req, res) => {
  const pages = loadPages();
  const page = pages.find((p) => p.slug === req.params.slug);
  if (!page) return res.status(404).send("Không tìm thấy trang.");

  const { title, content } = req.body;
  page.title = (title || "").trim() || page.title;
  page.content = content || "";
  savePages(pages);

  res.send(
    render("admin-edit.html", {
      PAGE_TITLE: escapeHtml(page.title),
      SLUG: page.slug,
      TITLE_VALUE: escapeHtml(page.title),
      CONTENT_VALUE: escapeHtml(page.content),
      SAVED: '<div class="saved-box">Đã lưu thay đổi.</div>',
    })
  );
});

app.listen(PORT, () => {
  console.log(`Đang chạy tại http://localhost:${PORT}`);
});
