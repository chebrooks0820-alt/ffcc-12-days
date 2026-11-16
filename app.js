(function () {
  "use strict";
  var C = window.FFCC_CONFIG;
  var params = new URLSearchParams(location.search);
  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var COUNT = C.days.length;
  var FIRST = C.lastDay - (COUNT - 1);
  var MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var COLORS = ["#a4262c", "#1f5c3f", "#b8892b", "#25406b"];
  var STORE = "ffcc12days-opened-" + C.year;

  /* ---------- Time (always Mountain Time) ---------- */
  var fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: C.timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  });
  function mt() {
    var o = {};
    fmt.formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }
  function previewKey() {
    var p = params.get("preview");
    return C.allowPreview && p && /^\d{4}-\d{2}-\d{2}$/.test(p) ? p : null;
  }
  function todayKey() {
    var pv = previewKey();
    if (pv) return pv;
    var o = mt();
    return o.year + "-" + o.month + "-" + o.day;
  }
  function dayKey(n) { return C.year + "-12-" + pad(FIRST + n - 1); }
  function daysBetween(a, b) {
    var pa = a.split("-").map(Number), pb = b.split("-").map(Number);
    return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 864e5);
  }
  function msToMidnight() {
    var o = mt();
    return ((23 - o.hour) * 3600 + (59 - o.minute) * 60 + (60 - o.second)) * 1000;
  }
  function isUnlocked(n) { return todayKey() >= dayKey(n); }
  function dateLabel(n) { return "Dec " + (FIRST + n - 1); }

  /* ---------- Storage (visual "already opened" only) ---------- */
  function getOpened() { try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch (e) { return []; } }
  function markOpened(n) {
    var a = getOpened();
    if (a.indexOf(n) < 0) { a.push(n); try { localStorage.setItem(STORE, JSON.stringify(a)); } catch (e) {} }
  }

  /* ---------- Grid ---------- */
  function render() {
    var grid = $("grid"), opened = getOpened(), today = todayKey();
    grid.innerHTML = "";
    C.days.forEach(function (d, i) {
      var n = i + 1, unlocked = isUnlocked(n), isToday = today === dayKey(n);
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gift" + (unlocked ? " unlocked" : " locked") + (isToday ? " today" : "") + (opened.indexOf(n) >= 0 ? " opened" : "");
      b.style.setProperty("--c", COLORS[i % COLORS.length]);
      b.setAttribute("aria-label", unlocked
        ? "Day " + n + ", " + d.title + (isToday ? ", today's gift" : "")
        : "Day " + n + ", locked, opens " + dateLabel(n) + " at 12 AM Mountain Time");
      b.innerHTML =
        '<span class="box"><span class="lid"></span><span class="base"></span>' +
        '<span class="num">' + n + '</span>' +
        '<span class="face">' + (unlocked ? d.icon : "🔒") + '</span></span>' +
        '<span class="cap">' + (unlocked ? esc(d.title) : "Opens " + dateLabel(n)) + '</span>' +
        (isToday ? '<span class="tag">Today</span>' : "");
      b.addEventListener("click", function () { onGift(n, b); });
      li.appendChild(b);
      grid.appendChild(li);
    });
  }

  function onGift(n, el) {
    if (!isUnlocked(n)) {
      el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake");
      toast("Day " + n + " opens " + dateLabel(n) + " at 12:00 AM Mountain Time.");
      return;
    }
    markOpened(n);
    el.classList.add("opened");
    openDialog(n);
  }

  /* ---------- Dialog ---------- */
  function openDialog(n) {
    var d = C.days[n - 1], body = $("dlgBody");
    var paras = (d.body || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    var link = d.link && d.link !== "#"
      ? '<a class="btn" href="' + attr(d.link) + '" target="_blank" rel="noopener">' + esc(d.linkLabel || "Learn more") + "</a>"
      : '<span class="btn btn-disabled">' + esc(d.linkLabel || "Learn more") + " (link coming soon)</span>";
    var hasGive = d.donateUrl && d.donateUrl !== "#";
    var give = hasGive
      ? '<a class="btn btn-give" href="' + attr(d.donateUrl) + '" target="_blank" rel="noopener">Give to ' + esc(d.title) + "</a>"
      : '<span class="btn btn-disabled">Donation link coming soon</span>';
    body.innerHTML =
      '<div class="dlg-icon" aria-hidden="true">' + d.icon + "</div>" +
      '<p class="eyebrow">Day ' + n + " of " + COUNT + " · " + dateLabel(n) + "</p>" +
      '<h2 id="dlgTitle">' + esc(d.title) + "</h2>" +
      '<h3>' + esc(d.headline || "") + "</h3>" + paras +
      '<div class="actions">' + link + give + "</div>" +
      '<hr><h3>Share your story &amp; enter the raffle</h3>' +
      '<p class="small">Tell us about your experience with ' + esc(d.title) + ". Add your name to enter the raffle.</p>" +
      '<div id="formSlot"></div>';
    mountForm(n);
    var dlg = $("dlg");
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
  }

  function mountForm(n) {
    var slot = $("formSlot"), cg = C.cognito || {};
    if (!cg.embedUrl) {
      slot.innerHTML = '<div class="form-placeholder">Cognito form will appear here.<br><small>Paste the embed URL in config.js</small></div>';
      return;
    }
    var url = cg.embedUrl;
    if (cg.prefillField) {
      var o = {}; o[cg.prefillField] = String(n);
      url += (url.indexOf("?") < 0 ? "?" : "&") + "entry=" + encodeURIComponent(JSON.stringify(o));
    }
    var f = document.createElement("iframe");
    f.src = url; f.title = "Share your story and enter the raffle";
    f.style.cssText = "border:0;width:100%;height:" + (cg.height || 720) + "px";
    f.setAttribute("loading", "lazy");
    slot.appendChild(f);
  }

  /* ---------- Countdown ---------- */
  function tick() {
    var el = $("countdown"), today = todayKey(), first = dayKey(1), last = dayKey(COUNT), ms, label;
    if (today < first) {
      ms = msToMidnight() + (daysBetween(today, first) - 1) * 864e5;
      label = "Gift 1 opens in";
    } else if (today < last) {
      ms = msToMidnight();
      label = "Next gift opens in";
    } else {
      el.innerHTML = today === last
        ? "<strong>All 12 gifts are open!</strong> Thank you for celebrating with us."
        : "<strong>Thank you for a wonderful 12 days.</strong> All gifts remain open to revisit.";
      return;
    }
    var s = Math.floor(ms / 1000), dd = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60;
    el.innerHTML = '<span class="cd-label">' + label + "</span>" +
      '<span class="cd-time">' + (dd ? "<b>" + dd + "</b>d " : "") + "<b>" + pad(hh) + "</b>h <b>" + pad(mm) + "</b>m <b>" + pad(ss) + "</b>s</span>";
    if (previewKey()) el.innerHTML += '<span class="preview">Preview mode: ' + previewKey() + "</span>";
  }

  /* ---------- Utilities ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function attr(s) { return /^(https?:|mailto:|\/|\.|#)/i.test(s) ? esc(s) : "#"; }
  var tt;
  function toast(m) { var t = $("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove("show"); }, 2800); }

  function snow() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var box = document.querySelector(".snow");
    for (var i = 0; i < 28; i++) {
      var s = document.createElement("i");
      s.style.left = Math.random() * 100 + "%";
      s.style.animationDuration = 9 + Math.random() * 12 + "s";
      s.style.animationDelay = -Math.random() * 20 + "s";
      s.style.opacity = 0.3 + Math.random() * 0.5;
      s.style.fontSize = 8 + Math.random() * 10 + "px";
      s.textContent = "❄";
      box.appendChild(s);
    }
  }

  /* ---------- Init ---------- */
  $("orgLine").textContent = C.orgName + " · " + C.orgLocation;
  $("footOrg").textContent = C.orgName + " · " + C.orgLocation;
  $("raffleNote").textContent = C.raffleNote || "";
  $("donateBtn").href = C.donateUrl || "#";
  $("dlgClose").addEventListener("click", function () { $("dlg").close(); });
  $("dlg").addEventListener("click", function (e) { if (e.target === this) this.close(); });

  var lastKey = todayKey();
  render(); tick(); snow();
  setInterval(function () {
    tick();
    var k = todayKey();
    if (k !== lastKey) { lastKey = k; render(); }   // flips at midnight MT without a reload
  }, 1000);
})();
