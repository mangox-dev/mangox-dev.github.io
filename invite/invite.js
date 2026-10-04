/* MangoX friend-invite landing.
 *
 * Loaded by /invite/index.html (served for /invite/) and by /404.html (which
 * GitHub Pages serves, at the ORIGINAL URL, for /invite/<token> because no
 * file exists there). The page is rendered in place: there is no redirect, so
 * the address bar keeps https://www.mangox.app/invite/<token> across refresh,
 * copy and paste.
 *
 * URL CONTRACT (fixed; the future iOS Universal Link, Android App Link and the
 * in-app QR code all use this same URL):
 *
 *   https://www.mangox.app/invite/<token>
 *   <token> = referral_links.public_token = 24 characters of [A-Za-z0-9_-]
 *
 * WHAT THIS PAGE DOES WITH THE TOKEN
 *   Reads it from the path, checks its SHAPE, shows it back, lets the visitor
 *   copy it, and hands it to Google Play as the install referrer of the store
 *   link (see playStoreUrl). Nothing else. The token is opaque: it is not
 *   decoded, and who the inviter is cannot be derived from it here.
 *
 * WHAT THIS PAGE NEVER DOES
 *   No network request of any kind (the page's Content-Security-Policy forbids
 *   them), no analytics, no logging, no localStorage / sessionStorage / cookie
 *   for the token, no clipboard READ, no automatic claim, no redirect.
 *   A well-formed token is NOT a verified invite: only the server can say a
 *   link is real, active and usable, so this page never says so.
 *
 * SERVER VALIDATION SEAM
 *   classify() decides from the URL alone; render() only draws a state. When
 *   a validation endpoint is deployed, an async step between the two can map
 *   a well-formed token to further states (revoked / expired). Until then no
 *   such state exists here and none is simulated.
 */
(function (root) {
  "use strict";

  var TOKEN_PATTERN = /^[A-Za-z0-9_-]{24}$/;
  var INVITE_PATH_PREFIX = "/invite/";
  var CANONICAL_INVITE_URL_PREFIX = "https://www.mangox.app/invite/";

  // Store links: only URLs that are public today.
  var GOOGLE_PLAY_URL =
    "https://play.google.com/store/apps/details?id=app.mangox.android";
  // The iOS app has no public App Store page yet. Set this when it does.
  var APP_STORE_URL = null;

  // Play Install Referrer parameter the Android app reads (same name as
  // ReferralInviteContract.INSTALL_REFERRER_PARAM in the app).
  var INSTALL_REFERRER_PARAM = "mx_invite";

  /**
   * The Google Play link for this page.
   *
   * With a well-formed token the link carries referrer=mx_invite=<token>
   * (serialised as referrer=mx_invite%3D<token>), so an install that starts
   * here keeps the invite: Play hands that string to the app's Install
   * Referrer reader on first launch. Anything else - no token, a malformed
   * one - gets the plain store link. The destination and the package are
   * fixed; only the token ever varies.
   */
  function playStoreUrl(token) {
    if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) {
      return GOOGLE_PLAY_URL;
    }
    var url = new URL(GOOGLE_PLAY_URL);
    url.searchParams.set("referrer", INSTALL_REFERRER_PARAM + "=" + token);
    return url.toString();
  }

  /**
   * kind: "not_invite"  the path is not under /invite (plain 404)
   *       "no_token"    /invite or /invite/ with nothing after it
   *       "malformed"   something follows /invite/ but it is not a token
   *       "well_formed" a token-shaped value (NOT a verified invite)
   */
  function classify(pathname) {
    var path = typeof pathname === "string" ? pathname : "";
    if (path === "/invite" || path === "/invite/index.html") {
      return { kind: "no_token", token: null };
    }
    if (path.indexOf(INVITE_PATH_PREFIX) !== 0) {
      return { kind: "not_invite", token: null };
    }
    var rest = path.slice(INVITE_PATH_PREFIX.length);
    if (rest.charAt(rest.length - 1) === "/") {
      rest = rest.slice(0, -1);
    }
    if (rest === "") {
      return { kind: "no_token", token: null };
    }
    if (TOKEN_PATTERN.test(rest)) {
      return { kind: "well_formed", token: rest };
    }
    return { kind: "malformed", token: null };
  }

  var I18N = {
    en: {
      eyebrow: "Friend invite",
      wfTitle: "MangoX friend invite link",
      wfLead: "Please keep this invite link. When you connect an invite in MangoX, you can use this link or the invite code.",
      wfNote: "The invite is confirmed in the MangoX app. Nothing is registered by this page.",
      stepsTitle: "How to use it",
      step1: "Install MangoX on your phone.",
      step2: "Keep this link or the invite code until the invite is confirmed in the app.",
      getApp: "Get the app",
      play: "Get it on Google Play",
      appStoreSoon: "App Store — Coming soon",
      appStore: "Download on the App Store",
      keepTitle: "Keep your invite",
      linkLabel: "Invite link",
      codeLabel: "Invite code",
      copyLink: "Copy link",
      copyCode: "Copy code",
      copied: "Copied.",
      copyFailed: "Could not copy. Press and hold the text to copy it.",
      ntTitle: "An invite link is needed",
      ntLead: "This page opens from a friend's MangoX invite link. Ask your friend to send you their link.",
      mfTitle: "This invite link is not complete",
      mfLead: "Part of the link may have been lost when it was copied. Ask the person who sent it to share it again.",
      nfEyebrow: "Not found",
      nfTitle: "Page not found",
      nfLead: "The page you are looking for does not exist or has moved.",
      home: "Go to MangoX home →",
      adults: "Adults only · 18+",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      docTitleInvite: "MangoX — Friend invite",
      docTitleNotFound: "MangoX — Page not found"
    },
    ko: {
      eyebrow: "친구 초대",
      wfTitle: "MangoX 친구 초대 링크",
      wfLead: "이 초대 링크를 보관해 주세요. MangoX에서 초대 정보를 연결할 때 이 링크 또는 초대 코드를 사용할 수 있습니다.",
      wfNote: "초대 확인은 MangoX 앱에서 완료됩니다. 이 페이지에서 등록되는 것은 없습니다.",
      stepsTitle: "사용 방법",
      step1: "휴대폰에 MangoX를 설치합니다.",
      step2: "앱에서 초대가 확인될 때까지 이 링크나 초대 코드를 보관합니다.",
      getApp: "앱 받기",
      play: "Google Play에서 받기",
      appStoreSoon: "App Store — 준비 중",
      appStore: "App Store에서 받기",
      keepTitle: "초대 보관하기",
      linkLabel: "초대 링크",
      codeLabel: "초대 코드",
      copyLink: "링크 복사",
      copyCode: "코드 복사",
      copied: "복사했습니다.",
      copyFailed: "복사하지 못했습니다. 글자를 길게 눌러 복사해 주세요.",
      ntTitle: "초대 링크가 필요합니다",
      ntLead: "이 페이지는 친구가 보낸 MangoX 초대 링크로 열립니다. 친구에게 초대 링크를 보내 달라고 요청해 주세요.",
      mfTitle: "초대 링크가 완전하지 않습니다",
      mfLead: "링크를 복사하는 과정에서 일부가 빠졌을 수 있습니다. 보낸 분에게 다시 공유를 요청해 주세요.",
      nfEyebrow: "찾을 수 없음",
      nfTitle: "페이지를 찾을 수 없습니다",
      nfLead: "찾으시는 페이지가 없거나 이동되었습니다.",
      home: "MangoX 홈으로 →",
      adults: "성인 전용 · 18+",
      privacy: "개인정보 처리방침",
      terms: "이용약관",
      docTitleInvite: "MangoX — 친구 초대",
      docTitleNotFound: "MangoX — 페이지를 찾을 수 없습니다"
    },
    th: {
      eyebrow: "คำเชิญจากเพื่อน",
      wfTitle: "ลิงก์คำเชิญเพื่อน MangoX",
      wfLead: "กรุณาเก็บลิงก์คำเชิญนี้ไว้ เมื่อเชื่อมต่อคำเชิญใน MangoX คุณสามารถใช้ลิงก์นี้หรือรหัสคำเชิญได้",
      wfNote: "การยืนยันคำเชิญจะเสร็จสมบูรณ์ในแอป MangoX หน้านี้ไม่ได้ลงทะเบียนสิ่งใด",
      stepsTitle: "วิธีใช้",
      step1: "ติดตั้ง MangoX บนโทรศัพท์ของคุณ",
      step2: "เก็บลิงก์นี้หรือรหัสคำเชิญไว้จนกว่าคำเชิญจะได้รับการยืนยันในแอป",
      getApp: "รับแอป",
      play: "ดาวน์โหลดจาก Google Play",
      appStoreSoon: "App Store — เร็ว ๆ นี้",
      appStore: "ดาวน์โหลดจาก App Store",
      keepTitle: "เก็บคำเชิญของคุณ",
      linkLabel: "ลิงก์คำเชิญ",
      codeLabel: "รหัสคำเชิญ",
      copyLink: "คัดลอกลิงก์",
      copyCode: "คัดลอกรหัส",
      copied: "คัดลอกแล้ว",
      copyFailed: "คัดลอกไม่สำเร็จ กรุณากดค้างที่ข้อความเพื่อคัดลอก",
      ntTitle: "ต้องใช้ลิงก์คำเชิญ",
      ntLead: "หน้านี้เปิดจากลิงก์คำเชิญ MangoX ของเพื่อน กรุณาขอให้เพื่อนส่งลิงก์ให้คุณ",
      mfTitle: "ลิงก์คำเชิญนี้ไม่ครบถ้วน",
      mfLead: "บางส่วนของลิงก์อาจหายไประหว่างการคัดลอก กรุณาขอให้ผู้ส่งแชร์ลิงก์อีกครั้ง",
      nfEyebrow: "ไม่พบ",
      nfTitle: "ไม่พบหน้านี้",
      nfLead: "หน้าที่คุณค้นหาไม่มีอยู่หรือถูกย้ายแล้ว",
      home: "ไปที่หน้าแรก MangoX →",
      adults: "สำหรับผู้ใหญ่เท่านั้น · 18+",
      privacy: "นโยบายความเป็นส่วนตัว",
      terms: "ข้อกำหนดการให้บริการ",
      docTitleInvite: "MangoX — คำเชิญจากเพื่อน",
      docTitleNotFound: "MangoX — ไม่พบหน้านี้"
    },
    zh: {
      eyebrow: "好友邀请",
      wfTitle: "MangoX 好友邀请链接",
      wfLead: "请保存此邀请链接。在 MangoX 中关联邀请信息时，可以使用此链接或邀请码。",
      wfNote: "邀请确认将在 MangoX 应用内完成。本页面不会登记任何信息。",
      stepsTitle: "使用方法",
      step1: "在手机上安装 MangoX。",
      step2: "在应用内确认邀请之前，请保留此链接或邀请码。",
      getApp: "获取应用",
      play: "在 Google Play 获取",
      appStoreSoon: "App Store — 即将上线",
      appStore: "在 App Store 下载",
      keepTitle: "保存您的邀请",
      linkLabel: "邀请链接",
      codeLabel: "邀请码",
      copyLink: "复制链接",
      copyCode: "复制邀请码",
      copied: "已复制。",
      copyFailed: "复制失败。请长按文字进行复制。",
      ntTitle: "需要邀请链接",
      ntLead: "此页面需通过好友的 MangoX 邀请链接打开。请让好友把链接发送给您。",
      mfTitle: "此邀请链接不完整",
      mfLead: "复制时链接可能缺失了一部分。请让发送者重新分享。",
      nfEyebrow: "未找到",
      nfTitle: "未找到页面",
      nfLead: "您访问的页面不存在或已移动。",
      home: "前往 MangoX 首页 →",
      adults: "仅限成人 · 18+",
      privacy: "隐私政策",
      terms: "服务条款",
      docTitleInvite: "MangoX — 好友邀请",
      docTitleNotFound: "MangoX — 未找到页面"
    }
  };
  var LANG_HTML = { en: "en", ko: "ko", th: "th", zh: "zh-Hans" };
  var LANG_ORDER = ["en", "ko", "th", "zh"];
  // The site-wide language preference key (index.html). Language only.
  var LANG_KEY = "mangox_lang";

  function pickLang(saved, browserLang) {
    if (saved && I18N[saved]) return saved;
    var b = String(browserLang || "").toLowerCase().slice(0, 2);
    return I18N[b] ? b : "en";
  }

  // --------------------------------------------------------------------------
  // Everything below needs a browser. In any other environment (the offline
  // contract check) only the pure functions above are exposed.
  // --------------------------------------------------------------------------
  if (typeof document === "undefined") {
    root.MangoXInvite = {
      classify: classify,
      pickLang: pickLang,
      playStoreUrl: playStoreUrl,
      TOKEN_PATTERN: TOKEN_PATTERN,
      CANONICAL_INVITE_URL_PREFIX: CANONICAL_INVITE_URL_PREFIX,
      GOOGLE_PLAY_URL: GOOGLE_PLAY_URL,
      APP_STORE_URL: APP_STORE_URL,
      I18N: I18N
    };
    return;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    // textContent only: nothing from the URL is ever parsed as HTML.
    if (text != null) node.textContent = text;
    return node;
  }

  function copyText(text, input) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return legacyCopy(input); }
      );
    }
    return Promise.resolve(legacyCopy(input));
  }

  function legacyCopy(input) {
    try {
      input.focus();
      input.select();
      input.setSelectionRange(0, input.value.length);
      return document.execCommand("copy");
    } catch (e) {
      return false;
    }
  }

  function copyField(t, labelText, value, buttonText, status) {
    var field = el("div", "field");
    var id = "mx-" + labelText.replace(/[^a-z]/gi, "").toLowerCase();
    var label = el("label", null, labelText);
    label.setAttribute("for", id);
    var input = el("input");
    input.id = id;
    input.type = "text";
    input.readOnly = true;
    input.value = value;
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("spellcheck", "false");
    input.addEventListener("focus", function () { input.select(); });
    var button = el("button", "btn", buttonText);
    button.type = "button";
    button.addEventListener("click", function () {
      copyText(value, input).then(function (ok) {
        status.textContent = ok ? t.copied : t.copyFailed;
        if (ok) button.classList.add("done");
      });
    });
    field.appendChild(label);
    field.appendChild(input);
    field.appendChild(button);
    return field;
  }

  function storeButtons(t, token) {
    var box = el("div", "stores");
    var play = el("a", "store primary", t.play);
    play.href = playStoreUrl(token);
    play.rel = "noopener noreferrer";
    var apple;
    if (APP_STORE_URL) {
      apple = el("a", "store primary", t.appStore);
      apple.href = APP_STORE_URL;
      apple.rel = "noopener noreferrer";
    } else {
      apple = el("span", "store soon", t.appStoreSoon);
    }
    var isApple = /iPhone|iPad|iPod/.test(navigator.userAgent || "");
    box.appendChild(isApple ? apple : play);
    box.appendChild(isApple ? play : apple);
    return box;
  }

  function card(title) {
    var c = el("section", "card");
    c.appendChild(el("h2", null, title));
    return c;
  }

  function render(state, lang) {
    var t = I18N[lang];
    var app = document.getElementById("mx-app");
    while (app.firstChild) app.removeChild(app.firstChild);
    document.documentElement.setAttribute("lang", LANG_HTML[lang]);
    document.title = state.kind === "not_invite"
      ? t.docTitleNotFound
      : t.docTitleInvite;

    // header
    var top = el("header", "top");
    var topIn = el("div", "wrap top-in");
    var brand = el("a", "brand", "MangoX ");
    brand.href = "/";
    brand.appendChild(el("span", "by", "by NetAI"));
    var langBox = el("div", "lang");
    langBox.setAttribute("role", "group");
    langBox.setAttribute("aria-label", "Language");
    LANG_ORDER.forEach(function (code) {
      var b = el("button", code === lang ? "on" : null, code.toUpperCase());
      b.type = "button";
      b.addEventListener("click", function () {
        try { localStorage.setItem(LANG_KEY, code); } catch (e) { /* private mode */ }
        render(state, code);
      });
      langBox.appendChild(b);
    });
    topIn.appendChild(brand);
    topIn.appendChild(langBox);
    top.appendChild(topIn);

    // main
    var main = el("main");
    var wrap = el("div", "wrap");
    main.appendChild(wrap);

    if (state.kind === "not_invite") {
      wrap.appendChild(el("p", "eyebrow", t.nfEyebrow));
      wrap.appendChild(el("h1", null, t.nfTitle));
      wrap.appendChild(el("p", "lead", t.nfLead));
      var home = el("a", "home", t.home);
      home.href = "/";
      wrap.appendChild(home);
    } else {
      wrap.appendChild(el("p", "eyebrow", t.eyebrow));
      if (state.kind === "well_formed") {
        wrap.appendChild(el("h1", null, t.wfTitle));
        wrap.appendChild(el("p", "lead", t.wfLead));
        wrap.appendChild(el("p", "note", t.wfNote));

        var steps = card(t.stepsTitle);
        var list = el("ol", "steps");
        list.appendChild(el("li", null, t.step1));
        list.appendChild(el("li", null, t.step2));
        steps.appendChild(list);
        wrap.appendChild(steps);
      } else if (state.kind === "malformed") {
        wrap.appendChild(el("h1", null, t.mfTitle));
        wrap.appendChild(el("p", "lead", t.mfLead));
      } else {
        wrap.appendChild(el("h1", null, t.ntTitle));
        wrap.appendChild(el("p", "lead", t.ntLead));
      }

      var get = card(t.getApp);
      get.appendChild(storeButtons(t, state.token));
      wrap.appendChild(get);

      if (state.kind === "well_formed") {
        var keep = card(t.keepTitle);
        var status = el("p", "status");
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        keep.appendChild(copyField(
          t, t.linkLabel, CANONICAL_INVITE_URL_PREFIX + state.token,
          t.copyLink, status));
        keep.appendChild(copyField(
          t, t.codeLabel, state.token, t.copyCode, status));
        keep.appendChild(status);
        wrap.appendChild(keep);
      }

      wrap.appendChild(el("span", "chip", t.adults));
    }

    // footer
    var footer = el("footer");
    var foot = el("div", "wrap foot");
    foot.appendChild(el("span", null, "© 2026 NetAI · MangoX"));
    var links = el("span");
    var privacy = el("a", null, t.privacy);
    privacy.href = "/legal/privacy";
    var terms = el("a", null, t.terms);
    terms.href = "/legal/terms";
    links.appendChild(privacy);
    links.appendChild(document.createTextNode(" · "));
    links.appendChild(terms);
    foot.appendChild(links);
    footer.appendChild(foot);

    app.appendChild(top);
    app.appendChild(main);
    app.appendChild(footer);
    app.setAttribute("data-state", state.kind);
  }

  var saved = null;
  try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* private mode */ }
  render(classify(root.location.pathname), pickLang(saved, navigator.language));
})(typeof window !== "undefined" ? window : globalThis);
