const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const querystring = require("querystring");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "submissions.json");
const SECRET = process.env.APP_SECRET || "dev-secret-change-me";
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
};


function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const adminSalt = crypto.randomBytes(12).toString("hex");
    const adminPassword = "admin123";
    const adminHash = hashPassword(adminPassword, adminSalt);
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(
        {
          users: [],
          admins: [{ login: "admin", salt: adminSalt, passwordHash: adminHash }],
        },
        null,
        2
      ),
      "utf8"
    );
  }
}

function readDb() {
  ensureDb();
  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    if (!Array.isArray(db.users)) db.users = [];
    if (!Array.isArray(db.admins)) db.admins = [];
    if (db.admins.length === 0) {
      const adminSalt = crypto.randomBytes(12).toString("hex");
      db.admins.push({
        login: "admin",
        salt: adminSalt,
        passwordHash: hashPassword("admin123", adminSalt),
      });
      writeDb(db);
    }
    return db;
  } catch {
    return { users: [], admins: [] };
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function sign(payload) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

function makeSessionToken(userId) {
  const payload = `${userId}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

function parseSessionToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  if (sign(payload) !== parts[2]) return null;
  return { userId: parts[0] };
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
}

function randomLogin() {
  return `user_${crypto.randomBytes(4).toString("hex")}`;
}

function randomPassword() {
  return crypto.randomBytes(9).toString("base64url");
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  const cookies = {};
  raw.split(";").forEach((entry) => {
    const i = entry.indexOf("=");
    if (i > 0) {
      cookies[entry.slice(0, i).trim()] = decodeURIComponent(entry.slice(i + 1).trim());
    }
  });
  return cookies;
}

function appendCookie(res, name, value, attrs = []) {
  const base = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax`;
  const full = [base, ...attrs].join("; ");
  const existing = res.getHeader("Set-Cookie");
  const all = Array.isArray(existing) ? existing.concat(full) : existing ? [existing, full] : [full];
  res.setHeader("Set-Cookie", all);
}

function redirect(res, location) {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.end();
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseBody(req, rawBody) {
  const type = req.headers["content-type"] || "";
  if (type.includes("application/json")) {
    try {
      return JSON.parse(rawBody || "{}");
    } catch {
      return {};
    }
  }
  return querystring.parse(rawBody || "");
}

function parseBasicAuth(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) return null;
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
  const idx = decoded.indexOf(":");
  if (idx < 0) return null;
  return { login: decoded.slice(0, idx), password: decoded.slice(idx + 1) };
}

function validateForm(input) {
  const data = {
    name: String(input.name || "").trim(),
    phone: String(input.phone || "").trim(),
    email: String(input.email || "").trim(),
    comment: String(input.comment || "").trim(),
    agreed: ["1", "on", "true", "yes"].includes(String(input.agreed || "").toLowerCase()) || input.agreed === true,
  };

  const errors = {};
  if (!data.name) errors.name = "Поле обязательно.";
  else if (!/^[A-Za-zА-Яа-яЁё\s\-]{2,60}$/u.test(data.name))
    errors.name = "Допустимы буквы, пробел и дефис (2-60 символов).";

  if (!data.phone) errors.phone = "Поле обязательно.";
  else if (!/^\+?[0-9\s\-()]{7,20}$/.test(data.phone))
    errors.phone = "Допустимы цифры, пробел, +, -, круглые скобки (7-20 символов).";

  if (!data.email) errors.email = "Поле обязательно.";
  else if (!/^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,20}$/.test(data.email))
    errors.email = "Email содержит недопустимые символы.";

  if (data.comment && !/^[A-Za-zА-Яа-яЁё0-9\s.,!?@#$%&*()_+\-:;"'\/\\\n\r]{0,500}$/u.test(data.comment))
    errors.comment = "Комментарий: буквы, цифры, пробелы и знаки пунктуации, до 500 символов.";

  if (!data.agreed) errors.agreed = "Необходимо согласие на обработку персональных данных.";
  return { data, errors };
}

function loadFlash(cookies) {
  const parse = (name) => {
    try {
      return cookies[name] ? JSON.parse(Buffer.from(cookies[name], "base64url").toString("utf8")) : {};
    } catch {
      return {};
    }
  };
  return { errors: parse("flash_errors"), values: parse("flash_values"), success: parse("flash_success") };
}

function storeFlash(res, key, obj) {
  appendCookie(res, key, Buffer.from(JSON.stringify(obj), "utf8").toString("base64url"));
}

function clearFlash(res) {
  ["flash_errors", "flash_values", "flash_success"].forEach((name) => appendCookie(res, name, "", ["Max-Age=0"]));
}

function withSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data:; media-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; script-src 'self';");
}

function serveStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.end(data);
  });
}

function injectIntoIndex(html, view) {
  // В практиках 6-8 отправка и валидация должны идти через backend без JS-перехвата submit.
  // Исходный script.js содержит preventDefault для формы, поэтому отключаем его на серверной выдаче.
  let out = html.replace('<script src="script.js"></script>', "");
  const csrf = crypto.randomBytes(20).toString("hex");
  appendCookie(view.res, "csrf_token", csrf);

  const fromCookie = (key, fallback = "") => view.values[key] ?? view.defaults[key] ?? fallback;
  const hasError = (key) => (view.errors[key] ? " style=\"border:2px solid #d33;\"" : "");
  const msg = (key) => (view.errors[key] ? `<div style="color:#d33;font-size:13px;margin:4px 0">${escapeHtml(view.errors[key])}</div>` : "");

  out = out.replace(
    /<form class="webform__form">/,
    `<form class="webform__form" method="post" action="/submit"><input type="hidden" name="csrf_token" value="${csrf}">`
  );

  out = out.replace(
    '<input type="text" class="webform__input" placeholder="Ваше имя">',
    `${msg("name")}<input type="text" name="name" class="webform__input" placeholder="Ваше имя" value="${escapeHtml(fromCookie("name"))}"${hasError("name")}>`
  );
  out = out.replace(
    '<input type="tel" class="webform__input" placeholder="Телефон">',
    `${msg("phone")}<input type="tel" name="phone" class="webform__input" placeholder="Телефон" value="${escapeHtml(fromCookie("phone"))}"${hasError("phone")}>`
  );
  out = out.replace(
    '<input type="email" class="webform__input" placeholder="E-mail">',
    `${msg("email")}<input type="email" name="email" class="webform__input" placeholder="E-mail" value="${escapeHtml(fromCookie("email"))}"${hasError("email")}>`
  );
  out = out.replace(
    '<textarea class="webform__textarea" placeholder="Ваш комментарий"></textarea>',
    `${msg("comment")}<textarea name="comment" class="webform__textarea" placeholder="Ваш комментарий"${hasError("comment")}>${escapeHtml(
      fromCookie("comment")
    )}</textarea>`
  );

  const checked = fromCookie("agreed", "1") ? " checked" : "";
  out = out.replace('<input type="checkbox" checked>', `<input type="checkbox" name="agreed" value="1"${checked}${hasError("agreed")}>${msg("agreed")}`);

  const authPanel = view.user
    ? `<div style="margin:8px 0;padding:8px;border:1px solid #ccc;color:#fff">
         Авторизован как <b>${escapeHtml(view.user.login)}</b>. Изменения перезапишут ваши данные.
         <a href="/logout" style="color:#fff;text-decoration:underline;margin-left:8px">Выйти</a>
       </div>`
    : `<div style="margin:8px 0;padding:8px;border:1px solid #ccc;color:#fff">
         Уже есть логин? <a href="/login" style="color:#fff;text-decoration:underline">Войти для редактирования</a>
       </div>`;

  out = out.replace('<button type="submit" class="btn btn--primary btn--large">Оставить заявку!</button>', `${authPanel}<button type="submit" class="btn btn--primary btn--large">Оставить заявку!</button>`);

  const success = view.success.message
    ? `<div style="background:#e8ffe8;color:#222;padding:12px;margin:8px 0;border-left:4px solid #2f9d2f">
         ${escapeHtml(view.success.message)}
         ${view.success.login ? `<br>Логин: <b>${escapeHtml(view.success.login)}</b><br>Пароль: <b>${escapeHtml(view.success.password)}</b>` : ""}
       </div>`
    : "";
  out = out.replace("<form class=\"webform__form\"", `${success}<form class="webform__form"`);
  return out;
}

function currentUser(req, db) {
  const cookies = parseCookies(req);
  const token = parseSessionToken(cookies.session_token || "");
  if (!token) return null;
  return db.users.find((u) => u.id === token.userId) || null;
}

function renderLoginPage(res, error = "") {
  const csrf = crypto.randomBytes(20).toString("hex");
  appendCookie(res, "csrf_token", csrf);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
  <html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вход | Drupal-coder</title>
    <link rel="stylesheet" href="/styles.css">
    <style>
      body { background: #2f3440; color: #fff; margin: 0; }
      .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .auth-card { width: 100%; max-width: 560px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 28px; backdrop-filter: blur(4px); }
      .auth-title { margin: 0 0 8px; font-size: 34px; }
      .auth-subtitle { margin: 0 0 20px; color: rgba(255,255,255,0.85); }
      .auth-label { display: block; margin: 10px 0 6px; color: #fff; }
      .auth-input { width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.35); background: rgba(0,0,0,0.15); color: #fff; }
      .auth-input:focus { outline: none; border-color: #f14d34; }
      .auth-error { margin: 0 0 16px; padding: 10px 12px; border-left: 4px solid #d33; background: rgba(211,51,51,0.2); }
      .auth-actions { display: flex; gap: 12px; align-items: center; margin-top: 18px; flex-wrap: wrap; }
      .auth-link { color: #fff; text-decoration: underline; }
    </style>
  </head>
  <body>
    <section class="auth-page">
      <div class="auth-card">
        <h1 class="auth-title">Вход в профиль</h1>
        <p class="auth-subtitle">Авторизуйтесь, чтобы редактировать ранее отправленные данные формы.</p>
        ${error ? `<p class="auth-error">${escapeHtml(error)}</p>` : ""}
        <form method="post" action="/login">
          <input type="hidden" name="csrf_token" value="${csrf}">
          <label class="auth-label" for="login">Логин</label>
          <input class="auth-input" id="login" name="login" required>
          <label class="auth-label" for="password">Пароль</label>
          <input class="auth-input" id="password" name="password" type="password" required>
          <div class="auth-actions">
            <button class="btn btn--primary" type="submit">Войти</button>
            <a class="auth-link" href="/">На главную</a>
          </div>
        </form>
      </div>
    </section>
  </body>
  </html>`);
}

function handleAdmin(req, res, db, url, parsedBody) {
  const auth = parseBasicAuth(req);
  if (!auth) {
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="Admin Area"');
    res.end("Authentication required");
    return true;
  }
  const admin = db.admins.find((a) => a.login === auth.login);
  if (!admin || hashPassword(auth.password, admin.salt) !== admin.passwordHash) {
    res.statusCode = 403;
    res.end("Forbidden");
    return true;
  }

  if (req.method === "POST" && url.pathname === "/admin/delete") {
    db.users = db.users.filter((u) => u.id !== String(parsedBody.id || ""));
    writeDb(db);
    redirect(res, "/admin");
    return true;
  }

  if (req.method === "POST" && url.pathname === "/admin/edit") {
    const user = db.users.find((u) => u.id === String(parsedBody.id || ""));
    if (user) {
      const { data, errors } = validateForm(parsedBody);
      if (!Object.keys(errors).length) {
        user.form = data;
        user.updatedAt = new Date().toISOString();
        writeDb(db);
      }
    }
    redirect(res, "/admin");
    return true;
  }

  if (req.method !== "GET" || url.pathname !== "/admin") return false;

  const rows = db.users
    .map(
      (u) => `<tr>
      <td>${escapeHtml(u.login)}</td>
      <td>${escapeHtml(u.form.name)}</td>
      <td>${escapeHtml(u.form.phone)}</td>
      <td>${escapeHtml(u.form.email)}</td>
      <td>
        <form method="post" action="/admin/delete" style="display:inline">
          <input type="hidden" name="id" value="${escapeHtml(u.id)}">
          <button type="submit">Удалить</button>
        </form>
      </td>
    </tr>
    <tr><td colspan="6">
      <form method="post" action="/admin/edit" class="admin-edit-form">
        <input type="hidden" name="id" value="${escapeHtml(u.id)}">
        <input class="admin-input" name="name" value="${escapeHtml(u.form.name)}">
        <input class="admin-input" name="phone" value="${escapeHtml(u.form.phone)}">
        <input class="admin-input" name="email" value="${escapeHtml(u.form.email)}">
        <input class="admin-input" name="comment" value="${escapeHtml(u.form.comment)}">
        <label><input name="agreed" type="checkbox" value="1" ${u.form.agreed ? "checked" : ""}> agreed</label>
        <button class="btn btn--primary" type="submit">Сохранить</button>
      </form>
    </td></tr>`
    )
    .join("");

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html>
  <html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Админка | Drupal-coder</title>
    <link rel="stylesheet" href="/styles.css">
    <style>
      body { background: #2f3440; color: #fff; margin: 0; }
      .admin-wrap { max-width: 1200px; margin: 0 auto; padding: 28px 18px 40px; }
      .admin-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 22px; margin-bottom: 20px; }
      .admin-title { margin: 0 0 10px; font-size: 34px; }
      .admin-table-wrap { overflow-x: auto; }
      .admin-table { width: 100%; border-collapse: collapse; min-width: 900px; }
      .admin-table th, .admin-table td { border: 1px solid rgba(255,255,255,0.2); padding: 10px; text-align: left; vertical-align: top; }
      .admin-table th { background: rgba(241,77,52,0.2); }
      .admin-edit-form { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
      .admin-input, .admin-edit-form select { background: rgba(0,0,0,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.35); border-radius: 6px; padding: 8px; }
      .admin-list { margin: 0; padding-left: 18px; }
      .admin-link { color: #fff; text-decoration: underline; }
    </style>
  </head>
  <body>
    <main class="admin-wrap">
      <section class="admin-card">
        <h1 class="admin-title">Панель администратора</h1>
        <p>Просмотр, редактирование и удаление пользовательских данных.</p>
        <p><a class="admin-link" href="/">На главную</a></p>
      </section>
      <section class="admin-card">
        <h2>Статистика</h2>
        <ul class="admin-list"><li>Всего пользователей: ${db.users.length}</li></ul>
      </section>
      <section class="admin-card admin-table-wrap">
        <table class="admin-table">
          <tr><th>Логин</th><th>Имя</th><th>Телефон</th><th>Email</th><th>Действия</th></tr>
          ${rows}
        </table>
      </section>
    </main>
  </body>
  </html>`);
  return true;
}

const server = http.createServer(async (req, res) => {
  withSecurityHeaders(res);
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url || "/", `http://${host}`);
  const db = readDb();
  const cookies = parseCookies(req);
  const body = ["POST", "PUT", "PATCH"].includes(req.method) ? parseBody(req, await collectBody(req)) : {};

  if (url.pathname.startsWith("/admin")) {
    if (handleAdmin(req, res, db, url, body)) return;
  }

  if (req.method === "GET" && url.pathname === "/login") {
    renderLoginPage(res);
    return;
  }

  if (req.method === "POST" && url.pathname === "/login") {
    if (!cookies.csrf_token || cookies.csrf_token !== body.csrf_token) {
      renderLoginPage(res, "CSRF token invalid");
      return;
    }
    const user = db.users.find((u) => u.login === String(body.login || ""));
    if (!user || hashPassword(String(body.password || ""), user.salt) !== user.passwordHash) {
      renderLoginPage(res, "Неверный логин или пароль");
      return;
    }
    appendCookie(res, "session_token", makeSessionToken(user.id));
    redirect(res, "/");
    return;
  }

  if (req.method === "GET" && url.pathname === "/logout") {
    appendCookie(res, "session_token", "", ["Max-Age=0"]);
    redirect(res, "/");
    return;
  }

  if (req.method === "POST" && url.pathname === "/submit") {
    if (!cookies.csrf_token || cookies.csrf_token !== body.csrf_token) {
      storeFlash(res, "flash_errors", { global: "Ошибка безопасности (CSRF)." });
      storeFlash(res, "flash_values", body);
      redirect(res, "/");
      return;
    }

    const { data, errors } = validateForm(body);
    if (Object.keys(errors).length) {
      storeFlash(res, "flash_errors", errors);
      storeFlash(res, "flash_values", data);
      redirect(res, "/");
      return;
    }

    const user = currentUser(req, db);
    if (user) {
      user.form = data;
      user.updatedAt = new Date().toISOString();
      writeDb(db);
      storeFlash(res, "flash_success", { message: "Данные обновлены." });
    } else {
      const id = crypto.randomUUID();
      const login = randomLogin();
      const password = randomPassword();
      const salt = crypto.randomBytes(12).toString("hex");
      const passwordHash = hashPassword(password, salt);
      db.users.push({
        id,
        login,
        salt,
        passwordHash,
        form: data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      writeDb(db);
      storeFlash(res, "flash_success", {
        message: "Форма успешно сохранена. Сохраните логин и пароль, они показываются один раз.",
        login,
        password,
      });
      appendCookie(res, "session_token", makeSessionToken(id));
    }

    ["name", "phone", "email", "comment", "agreed"].forEach((k) => {
      const attrs = [`Max-Age=${ONE_YEAR_SECONDS}`];
      appendCookie(res, `form_${k}`, data[k], attrs);
    });
    redirect(res, "/");
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    const filePath = path.join(ROOT, "index.html");
    fs.readFile(filePath, "utf8", (err, html) => {
      if (err) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }
      const flash = loadFlash(cookies);
      const defaults = {
        name: cookies.form_name || "",
        phone: cookies.form_phone || "",
        email: cookies.form_email || "",
        comment: cookies.form_comment || "",
        agreed: cookies.form_agreed || "1",
      };
      clearFlash(res);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(
        injectIntoIndex(html, {
          errors: flash.errors,
          values: flash.values,
          success: flash.success,
          defaults,
          user: currentUser(req, db),
          res,
        })
      );
    });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/profile/")) {
    const id = url.pathname.split("/").pop();
    const user = db.users.find((u) => u.id === id);
    if (!user) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!doctype html>
    <html lang="ru">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Профиль | Drupal-coder</title>
      <link rel="stylesheet" href="/styles.css">
      <style>
        body { background: #2f3440; color: #fff; margin: 0; }
        .profile-wrap { max-width: 900px; margin: 0 auto; padding: 28px 18px 40px; }
        .profile-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 22px; }
        .profile-pre { background: rgba(0,0,0,0.2); border-radius: 8px; padding: 14px; white-space: pre-wrap; }
        .profile-link { color: #fff; text-decoration: underline; }
      </style>
    </head>
    <body>
      <main class="profile-wrap">
        <section class="profile-card">
          <h1>Профиль пользователя</h1>
          <p>Логин: <b>${escapeHtml(user.login)}</b></p>
          <h2>Данные формы</h2>
          <pre class="profile-pre">${escapeHtml(JSON.stringify(user.form, null, 2))}</pre>
          <a class="profile-link" href="/">На главную</a>
        </section>
      </main>
    </body>
    </html>`);
    return;
  }

  const safePath = url.pathname;
  const filePath = path.normalize(path.join(ROOT, safePath));
  if (!filePath.startsWith(ROOT)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  if (req.method === "GET") {
    serveStatic(res, filePath);
    return;
  }

  res.statusCode = 405;
  res.end("Method Not Allowed");
});

server.listen(PORT, () => {
  ensureDb();
  console.log(`Server running at http://localhost:${PORT}`);
  console.log("Admin login: admin / admin123");
});
