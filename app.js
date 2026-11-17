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

  /* ---------- Dialog (the greeting card) ---------- */
  function openDialog(n) {
    var d = C.days[n - 1];
    var story = (d.body || []).map(function (p) {
      if (typeof p === "string") return "<p>" + esc(p) + "</p>";
      if (p && p.list) return "<ul>" + p.list.map(function (li) {
        return "<li>" + (li.b ? "<b>" + esc(li.b) + "</b> " : "") + esc(li.t || "") + "</li>";
      }).join("") + "</ul>";
      return "";
    }).join("");
    var campaign = d.campaign && C.campaign && C.campaign.note
      ? '<aside class="campaign"><span class="campaign-tag">Capital Campaign Update</span><p>' + esc(C.campaign.note) + "</p></aside>" : "";
    var btns = "";
    if (d.link && d.link !== "#") {
      btns += '<a class="btn btn-ghost-dark" href="' + attr(d.link) + '" target="_blank" rel="noopener">' + esc(d.linkLabel || "Learn more") + "</a>";
    }
    if (d.donateUrl !== false) {
      btns += d.donateUrl && d.donateUrl !== "#"
        ? '<a class="btn btn-give" href="' + attr(d.donateUrl) + '" target="_blank" rel="noopener">' + esc(d.donateLabel || "Give to " + d.title) + "</a>"
        : '<span class="btn btn-disabled">Donation link coming soon</span>';
    }
    $("dlgBody").innerHTML =
      '<div class="card" id="card">' +
        '<div class="cover" id="cover" role="button" tabindex="0" aria-label="Open your Day ' + n + ' card">' +
          '<div class="snowrow" aria-hidden="true">❄ ❅ ❄ ❅ ❄</div>' +
          '<p class="c-eyebrow">Made possible by the<br>generosity of our community</p>' +
          '<div class="wreath"><span class="bow" aria-hidden="true">🎀</span><span class="c-day">Day</span><span class="c-num">' + n + '</span><span class="c-of">of ' + COUNT + "</span></div>" +
          '<p class="c-verse">' + (d.verse ? "&ldquo;" + esc(d.verse) + "&rdquo;" : "Merry Christmas") + "</p>" +
          '<p class="c-date">' + dateLabel(n) + '</p>' +
          '<span class="tap">Tap to open your card</span>' +
        "</div>" +
        '<article class="inside">' +
          '<p class="orn" aria-hidden="true">✦ ❄ ✦</p>' +
          '<p class="eyebrow">Day ' + n + " of " + COUNT + " · " + dateLabel(n) + "</p>" +
          (d.verse ? '<p class="verse">&ldquo;' + esc(d.verse) + "&rdquo;</p>" : "") +
          '<h2 id="dlgTitle">' + (d.icon ? '<span aria-hidden="true">' + d.icon + "</span> " : "") + esc(d.title) + "</h2>" +
          (d.headline ? "<h3>" + esc(d.headline) + "</h3>" : "") +
          gallery(d) + '<div class="story">' + story + "</div>" + campaign +
          (btns ? '<div class="actions">' + btns + "</div>" : "") +
          '<p class="sign">With gratitude,<br><span>The ' + esc(C.orgName) + "</span></p>" +
          '<section class="reply"><h3>Write back to us</h3>' +
          '<p class="small">Share your experience with ' + esc(d.title) + " and add your name to enter the raffle.</p>" +
          '<div id="formSlot"></div></section>' +
        "</article>" +
      "</div>";
    mountForm(n);
    var cover = $("cover");
    cover.addEventListener("click", openCard);
    cover.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCard(); } });
    var dlg = $("dlg");
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    cover.focus({ preventScroll: true });
  }

  function openCard() {
    var card = $("card");
    if (!card || card.classList.contains("open") || card.classList.contains("opening")) return;
    var done = function () { card.classList.remove("opening"); card.classList.add("open"); $("dlg").scrollTop = 0; };
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) done();
    else { card.classList.add("opening"); setTimeout(done, 700); }
  }

  function gallery(d) {
    var ph = d.photos || [];
    if (!ph.length) return "";
    return '<div class="gallery">' + ph.map(function (p) {
      var o = typeof p === "string" ? { src: p } : p;
      return '<figure><img loading="lazy" src="' + attr(o.src) + '" alt="' + esc(o.alt || o.caption || d.title) + '">' +
        (o.caption ? "<figcaption>" + esc(o.caption) + "</figcaption>" : "") + "</figure>";
    }).join("") + "</div>";
  }

  function music() {
    var m = C.music || {}, btn = $("musicBtn"), au = $("bgm");
    if (!m.src) return;
    au.src = m.src; au.volume = m.volume || 0.35; btn.hidden = false;
    btn.addEventListener("click", function () {
      if (au.paused) {
        var pr = au.play();
        if (pr && pr.catch) pr.catch(function () { toast("Couldn't play the music on this device."); });
        btn.setAttribute("aria-pressed", "true"); btn.textContent = "🔊 Music on";
      } else {
        au.pause(); btn.setAttribute("aria-pressed", "false"); btn.textContent = "🎵 Music off";
      }
    });
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
  function attr(s) { return /^\s*(javascript|data|vbscript):/i.test(s) ? "#" : esc(s); }
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
  render(); tick(); snow(); music();
  setInterval(function () {
    tick();
    var k = todayKey();
    if (k !== lastKey) { lastKey = k; render(); }   // flips at midnight MT without a reload
  }, 1000);
})();
