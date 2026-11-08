/* ==========================================================================
    Template Name: Sovix - Social Network & Community HTML Template
    Author: Themiverse
    Support: techsupport@themiverse.com
    Description: Sovix - Social Network & Community HTML Template
    Version: 1.0
   --------------------------------------------------------------------------
   MODULES
   01. Helpers
   02. Session data (me, people, reactions, audiences)
   03. Icons
   04. Theme
   05. Topbar & search shortcut
   06. Stories rail
   07. Toasts (with undo)
   08. Modal helpers
   09. Post store & enhancement
   10. Reactions — hover flyout, picking, tally
   11. Reaction list modal
   12. Post overflow menu (edit, hide, snooze, report, delete…)
   13. Comment threads (like, reply, edit, delete, sort, load more)
   14. Polls
   15. Follow buttons
   16. Create / edit post modal (media, poll, event, tags, audience)
   17. Share, report & confirm modals
   18. Lightbox
   19. Feed filter & display settings
   20. Feed pagination, jump pill, tooltips
   21. Action router
   ========================================================================== */

(function () {
  "use strict";

  /* 01. Helpers ------------------------------------------------------------ */

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;
  var seq = 0;

  function uid(prefix) { seq += 1; return (prefix || "sx") + "-" + seq; }

  /** Squashes newlines and runs of spaces out of markup text so a heading that
      spans lines reads as one line when it is reused as a caption. */
  function collapse(text) {
    return String(text || "").split(/\s+/).filter(Boolean).join(" ");
  }

  /** Format 1240 as "1.2K" so counts never break a layout. */
  function compact(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
    return String(n);
  }

  function plural(n, one, many) { return compact(n) + " " + (n === 1 ? one : (many || one + "s")); }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /** Turn #tags and @handles in plain text into real links. */
  function linkify(text) {
    return escapeHtml(text)
      .replace(/(^|\s)#([a-z0-9_]{2,30})/gi, '$1<a class="sx-hashtag" href="tag.html">#$2</a>')
      .replace(/(^|\s)@([a-z0-9_.]{2,30})/gi, '$1<a class="sx-name" href="profile.html">@$2</a>')
      .replace(/\n/g, "<br>");
  }

  /** Build one element from an HTML string. */
  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = String(html).trim();
    return t.content.firstElementChild;
  }

  function icon(name, cls) {
    return '<i data-lucide="' + name + '" class="' + (cls || "ic-18") + '"></i>';
  }

  /** Deterministic 0–1 noise so demo numbers stay stable between renders. */
  function hash(str) {
    var h = 2166136261, i;
    for (i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  function pick(list, seed, count) {
    var out = [], used = {}, i = 0, k;
    while (out.length < Math.min(count, list.length) && i < count * 6) {
      k = (hash(seed + ":" + i) % list.length);
      if (!used[k]) { used[k] = 1; out.push(list[k]); }
      i += 1;
    }
    return out;
  }


  /* 02. Session data ------------------------------------------------------- */

  var ME = {
    name: "Ravi Menon",
    handle: "@ravimenon",
    avatar: "assets/img/avatar/avatar-9.png"
  };

  var PEOPLE = [
    { name: "Nadia Hart", handle: "@nadiahart", avatar: "assets/img/avatar/avatar-6.png", role: "Type & lettering" },
    { name: "Dev Iyer", handle: "@deviyer", avatar: "assets/img/avatar/avatar-2.png", role: "Systems design" },
    { name: "Mira Shah", handle: "@mirashah", avatar: "assets/img/avatar/avatar-5.png", role: "Design ops" },
    { name: "Leo Fontaine", handle: "@leofontaine", avatar: "assets/img/avatar/avatar-4.png", role: "Hardware" },
    { name: "June Park", handle: "@junepark", avatar: "assets/img/avatar/avatar-3.png", role: "Brand" },
    { name: "Tomas Oyelaran", handle: "@tomaso", avatar: "assets/img/avatar/avatar-8.png", role: "Research" },
    { name: "Ana Costa", handle: "@anacosta", avatar: "assets/img/avatar/avatar-1.png", role: "Engineering" },
    { name: "Ravi Menon", handle: "@ravimenon", avatar: "assets/img/avatar/avatar-9.png", role: "Product" }
  ];

  /* Six reactions. Order is the order they appear in the flyout. */
  var REACTIONS = [
    { id: "like", label: "Like", past: "Liked", icon: "thumbs-up", weight: 0.56 },
    { id: "love", label: "Love", past: "Loved", icon: "heart", weight: 0.18 },
    { id: "celebrate", label: "Celebrate", past: "Celebrated", icon: "party-popper", weight: 0.10 },
    { id: "insight", label: "Insight", past: "Marked as insight", icon: "lightbulb", weight: 0.08 },
    { id: "laugh", label: "Haha", past: "Laughed", icon: "laugh", weight: 0.05 },
    { id: "sad", label: "Sad", past: "Sad", icon: "frown", weight: 0.03 }
  ];

  function reactionById(id) {
    for (var i = 0; i < REACTIONS.length; i += 1) if (REACTIONS[i].id === id) return REACTIONS[i];
    return REACTIONS[0];
  }

  var AUDIENCES = [
    { id: "public", label: "Public", icon: "globe", desc: "Anyone on or off Sovix" },
    { id: "followers", label: "Followers", icon: "users", desc: "People who follow you" },
    { id: "circle", label: "Close circle", icon: "user-check", desc: "The 24 people in your circle" },
    { id: "private", label: "Only me", icon: "lock", desc: "Nobody else can see this" }
  ];

  function audienceById(id) {
    for (var i = 0; i < AUDIENCES.length; i += 1) if (AUDIENCES[i].id === id) return AUDIENCES[i];
    return AUDIENCES[0];
  }

  var REPORT_REASONS = [
    { id: "spam", label: "Spam", desc: "Repetitive posting or misleading links" },
    { id: "harassment", label: "Harassment or bullying", desc: "Targets a person or group" },
    { id: "false", label: "False information", desc: "Claims that can be checked and are wrong" },
    { id: "hate", label: "Hate speech", desc: "Attacks a protected characteristic" },
    { id: "ip", label: "Uses my work without credit", desc: "Copyright or attribution problem" },
    { id: "other", label: "Something else", desc: "Tell the review team what happened" }
  ];

  /* Extra comments the "View more comments" control reveals. */
  var COMMENT_POOL = [
    "Tried this on a 4K panel and the spacing still reads. Nice work.",
    "Do you have the source file somewhere? Would love to poke at the curve.",
    "We landed on the same answer last quarter, from the opposite direction.",
    "This is the part most teams skip and then wonder why the thing feels loud.",
    "Bookmarking. Our review is Thursday and this settles an argument.",
    "Counterpoint: at small sizes the contrast matters more than the density."
  ];


  /* 03. Icons -------------------------------------------------------------- */

  function refreshIcons() {
    if (typeof window.lucide === "undefined") return;
    window.lucide.createIcons();
  }

  /** Swap the icon inside a host element, keeping everything else in place. */
  function setIcon(host, name, cls) {
    if (!host) return;
    var old = host.querySelector("svg, i[data-lucide]");
    var next = document.createElement("i");
    next.setAttribute("data-lucide", name);
    next.className = cls || "ic-18";
    if (old) host.replaceChild(next, old);
    else host.insertBefore(next, host.firstChild);
    refreshIcons();
  }


  /* 04. Theme -------------------------------------------------------------- */

  var THEME_KEY = "sovix-theme";

  var Theme = {
    current: "light",

    stored: function () {
      try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
    },

    remember: function (mode) {
      try {
        if (mode) localStorage.setItem(THEME_KEY, mode);
        else localStorage.removeItem(THEME_KEY);
      } catch (e) { /* storage unavailable — the theme still applies for now */ }
    },

    apply: function (mode) {
      this.current = mode;
      document.documentElement.setAttribute("data-sx-theme", mode);
      $$("[data-sx-theme-toggle]").forEach(function (btn) {
        btn.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
        btn.setAttribute("aria-label", mode === "dark" ? "Switch to light theme" : "Switch to dark theme");
      });
    },

    /** mode: "light" | "dark" — there is no third, system-following state. */
    set: function (mode) {
      this.remember(mode);
      this.apply(mode);
      syncThemeControls();
    },

    init: function () {
      var self = this;
      var saved = this.stored();

      /* No stored choice means light — not the OS setting. */
      this.apply(saved === "dark" || saved === "light" ? saved : "light");

      $$("[data-sx-theme-toggle]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          self.set(self.current === "dark" ? "light" : "dark");
        });
      });

      syncThemeControls();
    }
  };

  /** Keeps the Theme select in settings showing what is actually in force,
      including on pages where that select does not exist. */
  function syncThemeControls() {
    var select = $("[data-sx-theme-select]");
    if (!select) return;
    var want = Theme.stored() === "dark" ? "dark" : "light";
    $$("option", select).forEach(function (o) { o.selected = o.value === want; });
  }


  /* 05. Topbar & search shortcut ------------------------------------------- */

  function initTopbar() {
    var bar = $("[data-sx-topbar]");
    if (!bar) return;
    var onScroll = function () { bar.classList.toggle("is-stuck", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initSearchShortcut() {
    var input = $("[data-sx-search]");
    if (!input) return;

    document.addEventListener("keydown", function (e) {
      var typing = /^(input|textarea|select)$/i.test(document.activeElement.tagName) ||
                   document.activeElement.isContentEditable;
      if (e.key === "/" && !typing) { e.preventDefault(); openSearch(true); input.focus(); }
      if (e.key === "Escape" && document.activeElement === input) input.blur();
    });
  }

  function openSearch(open) {
    var panel = $("[data-sx-search-panel]");
    var toggle = $("[data-sx-search-toggle]");
    if (!panel || !toggle) return;
    panel.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function initSearchToggle() {
    var toggle = $("[data-sx-search-toggle]");
    var panel = $("[data-sx-search-panel]");
    if (!toggle || !panel) return;

    var input = $("[data-sx-search]", panel);

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !panel.classList.contains("is-open");
      openSearch(open);
      if (open && input) input.focus();
    });

    document.addEventListener("click", function (e) {
      if (!panel.classList.contains("is-open")) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      openSearch(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel.classList.contains("is-open")) {
        openSearch(false);
        toggle.focus();
      }
    });

    var wide = window.matchMedia("(min-width: 992px)");
    var onWide = function (m) { if (m.matches) openSearch(false); };
    if (wide.addEventListener) wide.addEventListener("change", onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }


  /* 06. Stories rail ------------------------------------------------------- */

  function initStories() {
    var rail = $("[data-sx-stories]");
    if (!rail) return;

    var track = $("[data-sx-stories-track]", rail);
    var prev = $('[data-sx-stories-nav="prev"]', rail);
    var next = $('[data-sx-stories-nav="next"]', rail);
    if (!track) return;

    var sync = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.hidden = track.scrollLeft <= 2;
      if (next) next.hidden = track.scrollLeft >= max;
    };

    var page = function (dir) {
      track.scrollBy({
        left: dir * Math.max(track.clientWidth * 0.7, 160),
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    };

    if (prev) prev.addEventListener("click", function () { page(-1); });
    if (next) next.addEventListener("click", function () { page(1); });

    track.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }


  /* 07. Toasts ------------------------------------------------------------- */

  /**
   * toast("Post hidden", "eye-off", { action: "Undo", onAction: fn })
   */
  function toast(message, iconName, opts) {
    var wrap = $("[data-sx-toasts]");
    if (!wrap) return null;
    opts = opts || {};

    var node = el(
      '<div class="sx-toast">' + icon(iconName || "circle-check", "ic-18") +
      '<span class="sx-toast__msg"></span>' +
      (opts.action ? '<button class="sx-toast__action" type="button">' + escapeHtml(opts.action) + "</button>" : "") +
      "</div>"
    );

    $(".sx-toast__msg", node).textContent = message;
    wrap.appendChild(node);
    refreshIcons();

    var close = function () {
      node.classList.add("is-leaving");
      window.setTimeout(function () { node.remove(); }, 240);
    };

    var timer = window.setTimeout(close, opts.action ? 6000 : 2600);
    var action = $(".sx-toast__action", node);

    if (action) {
      action.addEventListener("click", function () {
        window.clearTimeout(timer);
        close();
        if (typeof opts.onAction === "function") opts.onAction();
      });
    }

    return node;
  }


  /* 08. Modal helpers ------------------------------------------------------ */

  function modal(id) {
    var node = document.getElementById(id);
    if (!node || !window.bootstrap) return null;
    return window.bootstrap.Modal.getOrCreateInstance(node);
  }

  function openModal(id) { var m = modal(id); if (m) m.show(); return m; }
  function closeModal(id) { var m = modal(id); if (m) m.hide(); }

  function closeDropdowns() {
    if (!window.bootstrap) return;
    $$(".dropdown-menu.show").forEach(function (menu) {
      var toggle = menu.parentNode && $('[data-bs-toggle="dropdown"]', menu.parentNode);
      if (toggle) window.bootstrap.Dropdown.getOrCreateInstance(toggle).hide();
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)["catch"](function () { /* clipboard blocked */ });
      return;
    }
    var field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "readonly");
    field.className = "sx-sr-only";
    document.body.appendChild(field);
    field.select();
    try { document.execCommand("copy"); } catch (err) { /* nothing to do */ }
    field.remove();
  }

  function postUrl(state) { return "https://sovix.app/p/" + state.id; }


  /* 09. Post store & enhancement ------------------------------------------- */

  var Posts = Object.create(null);

  function stateOf(node) {
    var article = node && node.closest("[data-sx-post]");
    return article ? Posts[article.getAttribute("data-sx-post-id")] : null;
  }

  /** Split a headline count into per-reaction counts that add back up. */
  function splitCounts(total, seed) {
    var counts = {}, used = 0, i, share, r;
    for (i = 1; i < REACTIONS.length; i += 1) {
      r = REACTIONS[i];
      share = Math.floor(total * r.weight * (0.75 + (hash(seed + r.id) % 50) / 100));
      counts[r.id] = share;
      used += share;
    }
    counts.like = Math.max(total - used, 0);
    return counts;
  }

  function totalReactions(state) {
    var sum = 0;
    REACTIONS.forEach(function (r) { sum += state.counts[r.id] || 0; });
    return sum;
  }

  function enhancePost(article) {
    if (!article || article.dataset.sxEnhanced === "1") return null;
    article.dataset.sxEnhanced = "1";

    var id = article.getAttribute("data-sx-post-id") || uid("post");
    article.setAttribute("data-sx-post-id", id);

    var likeBtn = $('[data-sx-react="like"]', article);
    var countEl = likeBtn && $("[data-sx-count]", likeBtn);
    var total = countEl ? (parseInt(countEl.getAttribute("data-sx-count"), 10) || 0) : 0;
    var headName = $(".sx-post__head .sx-name", article);
    var headImg = $(".sx-post__head img", article);

    var state = {
      id: id,
      el: article,
      author: article.getAttribute("data-sx-author") || (headName ? headName.textContent.trim() : "Someone"),
      handle: article.getAttribute("data-sx-handle") || "@sovix",
      avatar: headImg ? headImg.getAttribute("src") : ME.avatar,
      own: article.hasAttribute("data-sx-own"),
      following: article.getAttribute("data-sx-following") !== "0",
      audience: article.getAttribute("data-sx-audience") || "public",
      saved: !!$(".sx-pulse__btn--save.is-on", article),
      notify: false,
      commentsOn: true,
      pinned: false,
      edited: false,
      mine: null,
      counts: splitCounts(total, id),
      comments: parseInt(article.getAttribute("data-sx-comments"), 10) || 0,
      shares: parseInt(article.getAttribute("data-sx-shares"), 10) || 0,
      extraComments: 0
    };

    Posts[id] = state;

    if (likeBtn && likeBtn.classList.contains("is-on")) state.mine = "like";

    buildFlyout(state);
    paintReactionButton(state);
    buildPostMenu(state);
    syncTally(state);
    upgradeComments(state);
    upgradeMedia(state);
    wirePolls(article);
    wireFollow(article);
    refreshIcons();

    return state;
  }

  function enhanceAll(scope) {
    $$("[data-sx-post]", scope || document).forEach(enhancePost);
  }


  /* 10. Reactions ---------------------------------------------------------- */

  function buildFlyout(state) {
    var pulse = $(".sx-pulse", state.el);
    var likeBtn = $('[data-sx-react="like"]', state.el);
    if (!pulse || !likeBtn || $(".sx-react-flyout", pulse)) return;

    var html = '<div class="sx-react-flyout" role="menu" aria-label="Choose a reaction">';
    REACTIONS.forEach(function (r) {
      html += '<button class="sx-react sx-react--' + r.id + '" type="button" role="menuitem" ' +
              'data-sx-pick="' + r.id + '" aria-label="' + r.label + '">' +
              icon(r.icon, "ic-20") +
              '<span class="sx-react__name">' + r.label + "</span>" +
              "</button>";
    });
    html += "</div>";

    var flyout = el(html);
    pulse.appendChild(flyout);

    var openTimer = null, closeTimer = null, longPress = null, suppressClick = false;

    var open = function () {
      window.clearTimeout(closeTimer);
      flyout.classList.add("is-open");
      likeBtn.setAttribute("aria-expanded", "true");
      markPicked(state, flyout);
    };

    var close = function () {
      window.clearTimeout(openTimer);
      flyout.classList.remove("is-open");
      likeBtn.setAttribute("aria-expanded", "false");
    };

    var delayedOpen = function () {
      window.clearTimeout(closeTimer);
      openTimer = window.setTimeout(open, 320);
    };

    var delayedClose = function () {
      window.clearTimeout(openTimer);
      closeTimer = window.setTimeout(close, 280);
    };

    likeBtn.setAttribute("aria-haspopup", "true");
    likeBtn.setAttribute("aria-expanded", "false");

    if (!isTouch) {
      likeBtn.addEventListener("mouseenter", delayedOpen);
      likeBtn.addEventListener("mouseleave", delayedClose);
      flyout.addEventListener("mouseenter", function () { window.clearTimeout(closeTimer); });
      flyout.addEventListener("mouseleave", delayedClose);
      likeBtn.addEventListener("focus", function () { window.clearTimeout(closeTimer); });
    }

    /* Touch: press and hold on the reaction button opens the picker. */
    likeBtn.addEventListener("touchstart", function () {
      longPress = window.setTimeout(function () { suppressClick = true; open(); }, 420);
    }, { passive: true });

    likeBtn.addEventListener("touchend", function () { window.clearTimeout(longPress); });
    likeBtn.addEventListener("touchmove", function () { window.clearTimeout(longPress); }, { passive: true });

    /* Keyboard: ArrowUp opens the picker and moves into it. */
    likeBtn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        open();
        var first = $(".sx-react", flyout);
        if (first) first.focus();
      }
    });

    flyout.addEventListener("keydown", function (e) {
      var items = $$(".sx-react", flyout);
      var here = items.indexOf(document.activeElement);
      if (e.key === "Escape") { e.preventDefault(); close(); likeBtn.focus(); }
      if (e.key === "ArrowRight" && here > -1) { e.preventDefault(); items[(here + 1) % items.length].focus(); }
      if (e.key === "ArrowLeft" && here > -1) { e.preventDefault(); items[(here - 1 + items.length) % items.length].focus(); }
    });

    flyout.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-sx-pick]");
      if (!btn) return;
      setReaction(state, btn.getAttribute("data-sx-pick"));
      close();
      likeBtn.focus();
    });

    likeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (suppressClick) { suppressClick = false; return; }
      close();
      setReaction(state, state.mine ? null : "like");
    });

    document.addEventListener("click", function (e) {
      if (!pulse.contains(e.target)) close();
    });
  }

  function markPicked(state, flyout) {
    $$(".sx-react", flyout).forEach(function (b) {
      b.classList.toggle("is-picked", b.getAttribute("data-sx-pick") === state.mine);
    });
  }

  /** Apply a reaction (or null to clear) and repaint everything that shows it. */
  function setReaction(state, id) {
    var previous = state.mine;
    if (previous === id) id = null;

    if (previous) state.counts[previous] = Math.max((state.counts[previous] || 0) - 1, 0);
    if (id) state.counts[id] = (state.counts[id] || 0) + 1;

    state.mine = id;
    paintReactionButton(state);
    syncTally(state);

    var flyout = $(".sx-react-flyout", state.el);
    if (flyout) markPicked(state, flyout);
  }

  function paintReactionButton(state) {
    var btn = $('[data-sx-react="like"]', state.el);
    if (!btn) return;

    var r = state.mine ? reactionById(state.mine) : null;
    var countEl = $("[data-sx-count]", btn);
    var total = totalReactions(state);

    REACTIONS.forEach(function (item) { btn.classList.remove("is-react-" + item.id); });
    btn.classList.toggle("is-react", !!r);
    btn.classList.toggle("is-on", !!r);
    if (r) btn.classList.add("is-react-" + r.id);
    btn.setAttribute("aria-pressed", r ? "true" : "false");
    btn.setAttribute("aria-label", r ? r.label + " — press to remove your reaction" : "React to this post");

    setIcon(btn, r ? r.icon : "thumbs-up", "ic-18");

    if (countEl) {
      countEl.setAttribute("data-sx-count", String(total));
      countEl.textContent = compact(total);
    }

    if (r && !prefersReducedMotion) {
      btn.classList.add("is-bumped");
      window.setTimeout(function () { btn.classList.remove("is-bumped"); }, 360);
    }
  }

  /** Rebuild the summary row above the pulse bar. */
  function syncTally(state) {
    var article = state.el;
    var tally = $(".sx-post__tally", article);
    var total = totalReactions(state);

    if (!tally) {
      tally = el('<div class="sx-post__tally"></div>');
      var pulse = $(".sx-pulse", article);
      if (!pulse) return;
      pulse.parentNode.insertBefore(tally, pulse);
    }

    var top = REACTIONS.filter(function (r) { return (state.counts[r.id] || 0) > 0; })
      .sort(function (a, b) { return state.counts[b.id] - state.counts[a.id]; })
      .slice(0, 3);

    var pips = top.map(function (r) {
      return '<span class="sx-tally__pip sx-tally__pip--' + r.id + '">' + icon(r.icon, "ic-14") + "</span>";
    }).join("");

    var label = compact(total);
    if (state.mine) {
      label = total > 1 ? "You and " + compact(total - 1) + " others" : "You";
    }

    tally.innerHTML =
      (total > 0
        ? '<button class="sx-tally__btn" type="button" data-sx-action="reactors" ' +
          'aria-label="See who reacted to this post">' +
          '<span class="sx-tally__icons">' + pips + "</span>" +
          "<span>" + label + "</span></button>"
        : '<span class="sx-meta">Be the first to react</span>') +
      '<span class="sx-tally__spacer">' +
        '<button class="sx-tally__btn" type="button" data-sx-action="comments">' +
          plural(state.comments, "comment") + "</button>" +
        '<span class="sx-sep">·</span>' +
        '<button class="sx-tally__btn" type="button" data-sx-action="share">' +
          plural(state.shares, "repost") + "</button>" +
      "</span>";

    refreshIcons();
  }


  /* 11. Reaction list modal ------------------------------------------------ */

  var Reactors = {
    state: null,
    filter: "all",

    open: function (state) {
      this.state = state;
      this.filter = "all";
      var sub = $("[data-sx-reactor-sub]");
      if (sub) sub.textContent = "on " + (state.own ? "your post" : state.author + "'s post");
      var search = $("[data-sx-reactor-search]");
      if (search) search.value = "";
      this.renderTabs();
      this.renderList();
      openModal("sxReactors");
    },

    renderTabs: function () {
      var wrap = $("[data-sx-reactor-tabs]");
      var state = this.state;
      if (!wrap || !state) return;

      var html = '<button class="sx-reactor-tab is-active" type="button" data-sx-reactor-filter="all">All' +
                 '<span class="sx-tnum">' + compact(totalReactions(state)) + "</span></button>";

      REACTIONS.forEach(function (r) {
        var n = state.counts[r.id] || 0;
        if (!n) return;
        html += '<button class="sx-reactor-tab" type="button" data-sx-reactor-filter="' + r.id + '">' +
                '<span class="sx-tally__pip sx-tally__pip--' + r.id + '">' + icon(r.icon, "ic-14") + "</span>" +
                '<span class="sx-tnum">' + compact(n) + "</span></button>";
      });

      wrap.innerHTML = html;
      refreshIcons();
    },

    renderList: function (query) {
      var list = $("[data-sx-reactor-list]");
      var state = this.state;
      if (!list || !state) return;

      var filter = this.filter;
      var total = filter === "all" ? totalReactions(state) : (state.counts[filter] || 0);
      var rows = [];

      if (state.mine && (filter === "all" || filter === state.mine)) {
        rows.push({ person: ME, reaction: state.mine, me: true });
      }

      var pool = filter === "all" ? REACTIONS.filter(function (r) { return (state.counts[r.id] || 0) > 0; })
                                  : [reactionById(filter)];

      pool.forEach(function (r) {
        var n = Math.min(state.counts[r.id] || 0, filter === "all" ? 4 : 10);
        pick(PEOPLE, state.id + r.id, n).forEach(function (person) {
          if (person.handle === ME.handle) return;
          rows.push({ person: person, reaction: r.id, me: false });
        });
      });

      if (query) {
        var q = query.toLowerCase();
        rows = rows.filter(function (row) {
          return row.person.name.toLowerCase().indexOf(q) > -1 ||
                 row.person.handle.toLowerCase().indexOf(q) > -1;
        });
      }

      if (!rows.length) {
        list.innerHTML = '<p class="sx-empty">Nobody here matches that name.</p>';
        return;
      }

      var rest = total - rows.length;

      list.innerHTML = rows.map(function (row) {
        var r = reactionById(row.reaction);
        return '<div class="sx-reactor">' +
          '<span class="sx-avatar sx-avatar--sm sx-react--' + r.id + '">' +
            '<img src="' + row.person.avatar + '" alt="' + escapeHtml(row.person.name) + '" width="34" height="34">' +
            '<span class="sx-reactor__badge">' + icon(r.icon, "ic-12") + "</span>" +
          "</span>" +
          '<span class="sx-reactor__ident">' +
            '<a class="sx-name" href="profile.html">' + escapeHtml(row.person.name) + "</a>" +
            '<span class="sx-meta">' + escapeHtml(row.me ? "You · " + r.label : row.person.role) + "</span>" +
          "</span>" +
          (row.me ? '<a class="btn btn-quiet btn-sm" href="profile.html">View profile</a>'
                  : '<button class="btn btn-soft btn-sm" type="button" data-sx-follow="' + escapeHtml(row.person.name) +
                    '" aria-pressed="false">Follow</button>') +
          "</div>";
      }).join("") +
      (rest > 0 ? '<p class="sx-meta text-center mt-2 mb-0">and ' + compact(rest) + " more</p>" : "");

      wireFollow(list);
      refreshIcons();
    },

    init: function () {
      var tabs = $("[data-sx-reactor-tabs]");
      var search = $("[data-sx-reactor-search]");
      var self = this;

      if (tabs) {
        tabs.addEventListener("click", function (e) {
          var btn = e.target.closest("[data-sx-reactor-filter]");
          if (!btn) return;
          $$(".sx-reactor-tab", tabs).forEach(function (t) { t.classList.remove("is-active"); });
          btn.classList.add("is-active");
          self.filter = btn.getAttribute("data-sx-reactor-filter");
          self.renderList(search ? search.value.trim() : "");
        });
      }

      if (search) {
        search.addEventListener("input", function () { self.renderList(search.value.trim()); });
      }
    }
  };


  /* 12. Post overflow menu ------------------------------------------------- */

  function menuItem(action, iconName, label, desc, danger) {
    return '<button class="sx-menu__item' + (danger ? " sx-menu__item--danger" : "") + '" type="button" ' +
      'data-sx-action="' + action + '">' + icon(iconName, "ic-18") +
      '<span><span class="sx-menu__label">' + escapeHtml(label) + "</span>" +
      (desc ? '<span class="sx-menu__desc">' + escapeHtml(desc) + "</span>" : "") +
      "</span></button>";
  }

  function menuHtml(state) {
    var out = "";

    if (state.own) {
      out += menuItem("edit", "pencil", "Edit post", "Change the text, media or audience");
      out += menuItem("audience", "globe", "Change audience", "Currently " + audienceById(state.audience).label.toLowerCase());
      out += menuItem("pin", "pin", state.pinned ? "Unpin from profile" : "Pin to profile",
        state.pinned ? "Stop showing this at the top" : "Show this at the top of your profile");
      out += menuItem("comments-off", state.commentsOn ? "message-square" : "message-square",
        state.commentsOn ? "Turn off commenting" : "Turn on commenting",
        state.commentsOn ? "Nobody can add new comments" : "Let people comment again");
      out += '<span class="sx-menu__sep"></span>';
      out += menuItem("save", "bookmark", state.saved ? "Remove from saved" : "Save post", "Keep this in your collection");
      out += menuItem("copy-link", "link", "Copy link", postUrl(state).replace("https:///", ""));
      out += '<span class="sx-menu__sep"></span>';
      out += menuItem("delete", "trash-2", "Delete post", "This cannot be undone after you leave", true);
      return out;
    }

    out += menuItem("save", "bookmark", state.saved ? "Remove from saved" : "Save post", "Keep this in your collection");
    out += menuItem("copy-link", "link", "Copy link", postUrl(state).replace("https:///", ""));
    out += menuItem("share", "send", "Share to…", "Repost, message or send outside Sovix");
    out += '<span class="sx-menu__sep"></span>';
    out += menuItem("notify", state.notify ? "bell-off" : "bell",
      state.notify ? "Turn off notifications" : "Turn on notifications",
      state.notify ? "Stop alerts about this post" : "Get alerts about new comments");
    out += menuItem("hide", "eye-off", "Hide post", "See fewer posts like this");
    out += menuItem("snooze", "clock", "Snooze " + state.author + " for 30 days", "Temporarily stop seeing their posts");
    out += menuItem("follow", state.following ? "user-minus" : "user-plus",
      (state.following ? "Unfollow " : "Follow ") + state.author,
      state.following ? "Stop seeing their posts in your feed" : "See their posts in your feed");
    out += '<span class="sx-menu__sep"></span>';
    out += menuItem("report", "flag", "Report post", "Send this to the review team", true);
    return out;
  }

  function buildPostMenu(state) {
    var actions = $(".sx-post__actions", state.el);
    if (!actions) {
      var head = $(".sx-post__head", state.el);
      if (!head) return;
      actions = el('<div class="sx-post__actions"></div>');
      head.appendChild(actions);
    }

    var old = $("button.sx-iconbtn", actions);
    if (old && !old.closest(".dropdown")) old.remove();
    if ($(".dropdown", actions)) return;

    var wrap = el(
      '<div class="dropdown">' +
        '<button class="sx-iconbtn sx-iconbtn--plain sx-iconbtn--sm" type="button" data-bs-toggle="dropdown" ' +
          'data-bs-offset="0,6" aria-expanded="false" aria-label="More options for this post">' +
          icon("more-horizontal", "ic-18") +
        "</button>" +
        '<div class="dropdown-menu dropdown-menu-end sx-menu" data-sx-post-menu></div>' +
      "</div>"
    );

    $("[data-sx-post-menu]", wrap).innerHTML = menuHtml(state);
    actions.appendChild(wrap);
    refreshIcons();
  }

  function repaintMenu(state) {
    var menu = $("[data-sx-post-menu]", state.el);
    if (!menu) return;
    menu.innerHTML = menuHtml(state);
    refreshIcons();
  }

  /** Swap a post for a placeholder card that offers a way back. */
  function replaceWithPlaceholder(state, title, desc, iconName) {
    var article = state.el;
    var parent = article.parentNode;
    var anchor = document.createComment("sx-post-slot");
    parent.insertBefore(anchor, article);

    var card = el(
      '<div class="sx-panel sx-post-gone">' +
        '<span class="sx-post-gone__icon">' + icon(iconName || "eye-off", "ic-20") + "</span>" +
        "<div><p class=\"sx-post-gone__title\">" + escapeHtml(title) + "</p>" +
        '<p class="sx-post-gone__desc">' + escapeHtml(desc) + "</p></div>" +
        '<button class="btn btn-quiet btn-sm" type="button">Undo</button>' +
      "</div>"
    );

    article.remove();
    parent.insertBefore(card, anchor);
    refreshIcons();

    $("button", card).addEventListener("click", function () {
      parent.insertBefore(article, anchor);
      card.remove();
      anchor.remove();
      refreshIcons();
    });

    return card;
  }

  function hidePost(state, title, desc, iconName) {
    var card = replaceWithPlaceholder(state, title, desc, iconName);
    toast(title, iconName || "eye-off", {
      action: "Undo",
      onAction: function () { var b = $("button", card); if (b) b.click(); }
    });
  }

  function snoozeAuthor(state) {
    var others = $$("[data-sx-post]").filter(function (a) {
      var s = Posts[a.getAttribute("data-sx-post-id")];
      return s && s !== state && s.author === state.author;
    });

    others.forEach(function (a) { a.classList.add("is-filtered"); });
    var card = replaceWithPlaceholder(state, state.author + " is snoozed for 30 days",
      "You will not see their posts until the snooze ends.", "clock");

    $("button", card).addEventListener("click", function () {
      others.forEach(function (a) { a.classList.remove("is-filtered"); });
    });

    toast(state.author + " snoozed for 30 days", "clock", {
      action: "Undo",
      onAction: function () { var b = $("button", card); if (b) b.click(); }
    });
  }

  function deletePost(state) {
    Confirm.open({
      title: "Delete this post?",
      body: "It leaves your profile and your followers' feeds straight away. You can undo this for a few seconds.",
      confirm: "Delete post",
      danger: true,
      onConfirm: function () {
        var article = state.el;
        article.classList.add("is-leaving");
        window.setTimeout(function () {
          hidePost(state, "Post deleted", "It is no longer visible to anyone.", "trash-2");
        }, prefersReducedMotion ? 0 : 180);
      }
    });
  }


  /* 13. Comment threads ---------------------------------------------------- */

  function commentHtml(c) {
    var own = c.own;
    return '<li class="sx-comment" data-sx-comment data-sx-comment-id="' + c.id + '" ' +
      'data-sx-likes="' + c.likes + '" data-sx-age="' + c.age + '"' + (own ? " data-sx-comment-own" : "") + ">" +
      '<span class="sx-avatar sx-avatar--sm">' +
        '<img src="' + c.avatar + '" alt="' + escapeHtml(c.name) + '" width="34" height="34">' +
      "</span>" +
      '<div class="sx-comment__main">' +
        '<div class="sx-comment__bubble">' +
          '<a class="sx-name" href="profile.html">' + escapeHtml(c.name) + "</a>" +
          '<p class="sx-comment__text">' + (c.replyTo ? '<span class="sx-comment__replyto">' + escapeHtml(c.replyTo) + "</span> " : "") +
            linkify(c.text) + "</p>" +
          '<span class="sx-comment__pill"' + (c.likes ? "" : " hidden") + '>' +
            '<span class="sx-tally__pip sx-tally__pip--like">' + icon("thumbs-up", "ic-12") + "</span>" +
            '<span data-sx-c-count>' + compact(c.likes) + "</span></span>" +
        "</div>" +
        '<div class="sx-comment__tools">' +
          '<button type="button" data-sx-action="comment-like"' + (c.liked ? ' class="is-on"' : "") + '>' +
            (c.liked ? "Liked" : "Like") + "</button>" +
          '<button type="button" data-sx-action="comment-reply">Reply</button>' +
          "<span>" + escapeHtml(c.time) + "</span>" +
          '<span class="sx-comment__edited" hidden>· Edited</span>' +
        "</div>" +
        '<ul class="sx-comment__replies sx-list-plain" data-sx-replies></ul>' +
      "</div>" +
      '<div class="dropdown sx-comment__menu">' +
        '<button class="sx-iconbtn sx-iconbtn--plain sx-iconbtn--sm" type="button" data-bs-toggle="dropdown" ' +
          'aria-expanded="false" aria-label="Comment options">' + icon("more-horizontal", "ic-16") + "</button>" +
        '<div class="dropdown-menu dropdown-menu-end sx-menu">' +
          (own
            ? menuItem("comment-edit", "pencil", "Edit comment", "") +
              menuItem("comment-copy", "copy", "Copy text", "") +
              menuItem("comment-delete", "trash-2", "Delete comment", "", true)
            : menuItem("comment-copy", "copy", "Copy text", "") +
              menuItem("comment-reply", "corner-down-right", "Reply", "") +
              menuItem("comment-report", "flag", "Report comment", "", true)) +
        "</div>" +
      "</div>" +
    "</li>";
  }

  /** Rewrite the hand-written comments in the markup into live ones. */
  function upgradeComments(state) {
    var thread = $("[data-sx-comments]", state.el);

    /* Most cards in the markup carry no thread at all, or an empty one, while
       their tally still claims dozens of comments. That reads as broken the
       moment a thread is on screen — and in the photo viewer, where the panel
       is mostly comments, it left a blank column. Build what is missing so
       every post has a real thread to open. */
    if (!thread) {
      thread = el(
        '<div class="sx-comments" data-sx-comments hidden>' +
          '<ul class="sx-list-plain" data-sx-comment-list></ul>' +
          '<form class="sx-reply" data-sx-reply>' +
            '<span class="sx-avatar sx-avatar--sm"><img src="' + ME.avatar + '" alt="" width="34" height="34"></span>' +
            '<label class="sx-sr-only" for="' + state.id + '-reply">Write a comment</label>' +
            '<input class="sx-reply__field" id="' + state.id + '-reply" type="text" ' +
              'placeholder="Write a comment" data-sx-reply-field>' +
            '<button class="btn btn-soft" type="submit">Reply</button>' +
          "</form>" +
        "</div>"
      );
      state.el.appendChild(thread);
      wireReplyForms(thread);
    }

    var list = $("[data-sx-comment-list]", thread);
    if (!list) return;

    seedComments(state, list);

    $$("li.sx-comment", list).forEach(function (li) {
      if (li.hasAttribute("data-sx-comment")) return;

      var name = ($(".sx-name", li) || {}).textContent || "Someone";
      var text = ($(".sx-comment__text", li) || {}).textContent || "";
      var img = $("img", li);
      var tools = $$(".sx-comment__tools button", li);
      var stamp = $(".sx-comment__tools span", li);
      var likes = 0;

      tools.forEach(function (b) {
        var m = b.textContent.match(/(\d+)/);
        if (/like/i.test(b.textContent) && m) likes = parseInt(m[1], 10);
      });

      li.replaceWith(el(commentHtml({
        id: uid("c"),
        name: name.trim(),
        avatar: img ? img.getAttribute("src") : ME.avatar,
        text: text.trim(),
        time: stamp ? stamp.textContent.trim() : "just now",
        likes: likes,
        liked: false,
        own: name.trim() === ME.name,
        age: 30
      })));
    });

    /* Sort bar and "view more" live above the list. */
    if (!$(".sx-comments__bar", thread)) {
      var bar = el(
        '<div class="sx-comments__bar">' +
          '<div class="dropdown">' +
            '<button class="sx-sortbtn" type="button" data-bs-toggle="dropdown" aria-expanded="false">' +
              '<span data-sx-sort-label>Most relevant</span>' + icon("chevron-down", "ic-14") + "</button>" +
            '<div class="dropdown-menu sx-menu">' +
              menuItem("sort-relevant", "sparkles", "Most relevant", "Comments with the most reactions first") +
              menuItem("sort-newest", "clock", "Newest first", "The latest comments first") +
              menuItem("sort-oldest", "history", "Oldest first", "Follow the thread from the top") +
            "</div>" +
          "</div>" +
          '<button class="sx-comments__more ms-auto" type="button" data-sx-action="more-comments">' +
            "View more comments</button>" +
        "</div>"
      );
      thread.insertBefore(bar, thread.firstChild);
    }

    refreshIcons();
  }

  /** Fill an empty thread with a couple of comments, drawn from the same pool
      and the same picker "View more comments" uses, so a seeded thread and a
      loaded one are indistinguishable. Seeded from the post id, so a given
      post shows the same two comments on every visit. The author is skipped —
      nobody opens with a reply to themselves. */
  function seedComments(state, list) {
    if ($$("li.sx-comment, [data-sx-comment]", list).length) return;
    if (!state.comments) return;

    var others = PEOPLE.filter(function (p) { return p.name !== state.author; });
    var people = pick(others, state.id + "seed", 2);

    /* Offsetting by i off one base, rather than hashing each person, is what
       stops the two of them drawing the same line out of a six-line pool. */
    var base = hash(state.id + "seedtext");

    people.forEach(function (person, i) {
      var text = COMMENT_POOL[(base + i) % COMMENT_POOL.length];
      list.appendChild(el(commentHtml({
        id: uid("c"),
        name: person.name,
        avatar: person.avatar,
        text: text,
        time: (hash(state.id + person.name) % 50 + 8) + "m",
        likes: hash(state.id + text) % 40,
        liked: false,
        own: false,
        age: 60 + i
      })));
    });
  }

  function addComment(state, text, replyList, replyTo) {
    var thread = $("[data-sx-comments]", state.el);
    if (!thread) return;

    var node = el(commentHtml({
      id: uid("c"),
      name: ME.name,
      avatar: ME.avatar,
      text: text,
      time: "Just now",
      likes: 0,
      liked: false,
      own: true,
      age: 0,
      replyTo: replyTo ? "@" + replyTo.replace(/\s+/g, "").toLowerCase() : ""
    }));

    (replyList || $("[data-sx-comment-list]", thread)).appendChild(node);
    state.comments += 1;
    syncTally(state);
    refreshIcons();
    return node;
  }

  function loadMoreComments(state, button) {
    var thread = $("[data-sx-comments]", state.el);
    var list = thread && $("[data-sx-comment-list]", thread);
    if (!list) return;

    var start = state.extraComments;
    var batch = pick(PEOPLE, state.id + "more" + start, 2);

    batch.forEach(function (person, i) {
      var text = COMMENT_POOL[(start + i) % COMMENT_POOL.length];
      list.insertBefore(el(commentHtml({
        id: uid("c"),
        name: person.name,
        avatar: person.avatar,
        text: text,
        time: (start + i + 2) + "h",
        likes: (hash(state.id + text) % 40),
        liked: false,
        own: false,
        age: 120 + start
      })), list.firstChild);
    });

    state.extraComments += batch.length;
    refreshIcons();

    if (state.extraComments >= 4 && button) {
      button.hidden = true;
    }
  }

  function sortComments(thread, mode, label) {
    var list = $("[data-sx-comment-list]", thread);
    if (!list) return;

    var items = $$("[data-sx-comment]", list);
    items.sort(function (a, b) {
      var la = parseInt(a.getAttribute("data-sx-likes"), 10) || 0;
      var lb = parseInt(b.getAttribute("data-sx-likes"), 10) || 0;
      var aa = parseInt(a.getAttribute("data-sx-age"), 10) || 0;
      var ab = parseInt(b.getAttribute("data-sx-age"), 10) || 0;
      if (mode === "newest") return aa - ab;
      if (mode === "oldest") return ab - aa;
      return lb - la;
    });

    items.forEach(function (li) { list.appendChild(li); });
    var labelEl = $("[data-sx-sort-label]", thread);
    if (labelEl) labelEl.textContent = label;
  }

  function openThread(state, focus) {
    var thread = $("[data-sx-comments]", state.el);
    if (!thread) return;
    thread.hidden = false;
    $$("[data-sx-comments-toggle]", state.el).forEach(function (b) {
      b.setAttribute("aria-expanded", "true");
    });
    if (focus) {
      var field = $("[data-sx-reply-field]", thread);
      if (field) field.focus();
    }
  }

  function wireReplyForms(scope) {
    $$("[data-sx-reply]", scope || document).forEach(function (form) {
      if (form.dataset.sxBound === "1") return;
      form.dataset.sxBound = "1";

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var field = $("[data-sx-reply-field]", form);
        var state = stateOf(form);
        if (!field || !field.value.trim() || !state) return;

        var replyList = form.closest("[data-sx-comment]") ? $("[data-sx-replies]", form.closest("[data-sx-comment]")) : null;
        var replyTo = form.getAttribute("data-sx-reply-to") || "";
        var node = addComment(state, field.value.trim(), replyList, replyTo);

        field.value = "";
        if (form.hasAttribute("data-sx-reply-inline")) form.remove();
        if (node) node.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion ? "auto" : "smooth" });
      });
    });
  }


  /* 14. Polls -------------------------------------------------------------- */

  function wirePolls(scope) {
    $$("[data-sx-poll]", scope || document).forEach(function (poll) {
      if (poll.dataset.sxBound === "1") return;
      poll.dataset.sxBound = "1";

      var options = $$("[data-sx-poll-option]", poll);
      var tally = $("[data-sx-poll-tally]", poll.parentNode);

      options.forEach(function (option) {
        option.addEventListener("click", function () {
          if (poll.classList.contains("is-voted")) return;
          poll.classList.add("is-voted");
          option.classList.add("is-picked");

          options.forEach(function (o) {
            var pct = o.getAttribute("data-sx-poll-pct") || "0";
            var fill = $(".sx-poll__fill", o);
            var label = $("[data-sx-poll-pct-label]", o);
            if (fill) fill.style.setProperty("--sx-fill", pct + "%");
            if (label) label.textContent = pct + "%";
            o.setAttribute("aria-pressed", o === option ? "true" : "false");
          });

          if (tally) {
            var votes = (parseInt(tally.getAttribute("data-sx-poll-tally"), 10) || 0) + 1;
            tally.setAttribute("data-sx-poll-tally", String(votes));
            tally.textContent = compact(votes) + " votes · closes in 2 days";
          }

          toast("Vote counted", "circle-check");
        });
      });
    });
  }


  /* 15. Follow buttons ----------------------------------------------------- */

  function wireFollow(scope) {
    $$("[data-sx-follow]", scope || document).forEach(function (btn) {
      if (btn.dataset.sxBound === "1") return;
      btn.dataset.sxBound = "1";

      btn.addEventListener("click", function () {
        var following = btn.getAttribute("aria-pressed") === "true";
        var name = btn.getAttribute("data-sx-follow") || "this person";

        btn.setAttribute("aria-pressed", following ? "false" : "true");
        btn.classList.toggle("btn-brand", following);
        btn.classList.toggle("btn-quiet", !following);
        btn.textContent = following ? "Follow" : "Following";

        if (!following) toast("You now follow " + name, "user-check");
      });
    });
  }


  /* 16. Create / edit post modal ------------------------------------------- */

  var CP = {
    mode: "create",
    post: null,
    media: [],
    poll: null,
    event: null,
    quote: null,
    tags: [],
    audience: "public",
    limit: 480,

    node: function () { return document.getElementById("sxCompose"); },

    open: function (opts) {
      opts = opts || {};
      var root = this.node();
      if (!root) return;

      this.mode = opts.mode || "create";
      this.post = opts.post || null;
      this.media = [];
      this.poll = null;
      this.event = null;
      this.quote = opts.quote || null;
      this.tags = [];
      this.audience = opts.post ? opts.post.audience : "public";

      var field = $("[data-sx-cp-field]", root);
      var title = $("[data-sx-cp-title]", root);
      var submit = $("[data-sx-cp-submit]", root);

      if (this.mode === "edit" && this.post) {
        var textEl = $(".sx-post__text", this.post.el);
        field.value = textEl ? textEl.textContent.trim() : "";
        this.media = readMedia(this.post.el);
        if (title) title.textContent = "Edit post";
        if (submit) submit.textContent = "Save changes";
      } else {
        field.value = opts.text || "";
        if (title) title.textContent = this.quote ? "Repost with a note" : "Create post";
        if (submit) submit.textContent = "Post";
      }

      this.showPane("compose");
      this.renderAudience();
      this.renderMedia();
      this.renderTags();
      this.renderPoll();
      $("[data-sx-cp-event]", root).hidden = true;
      this.grow();
      this.meter();

      openModal("sxCompose");
      window.setTimeout(function () { field.focus(); }, 260);
    },

    showPane: function (name) {
      var root = this.node();
      $$("[data-sx-cp-pane]", root).forEach(function (pane) {
        pane.hidden = pane.getAttribute("data-sx-cp-pane") !== name;
      });
      var back = $("[data-sx-cp-back]", root);
      var footer = $(".modal-footer", root);
      if (back) back.hidden = name === "compose";
      if (footer) footer.hidden = name !== "compose";
    },

    grow: function () {
      var field = $("[data-sx-cp-field]", this.node());
      if (!field) return;
      /* The rule lives in CSS; JS only supplies the measured value. */
      field.style.setProperty("--sx-cp-h", "auto");
      field.style.setProperty("--sx-cp-h", Math.max(field.scrollHeight, 112) + "px");
    },

    meter: function () {
      var root = this.node();
      var field = $("[data-sx-cp-field]", root);
      var count = $("[data-sx-cp-count]", root);
      var submit = $("[data-sx-cp-submit]", root);
      var left = this.limit - field.value.length;

      if (count) {
        count.textContent = String(left);
        count.classList.toggle("is-warn", left <= 60 && left >= 0);
        count.classList.toggle("is-over", left < 0);
      }

      var hasBody = field.value.trim() !== "" || this.media.length > 0 || this.poll || this.event;
      if (submit) submit.disabled = !hasBody || left < 0;
    },

    renderAudience: function () {
      var root = this.node();
      var a = audienceById(this.audience);
      var btn = $("[data-sx-cp-audience]", root);
      if (btn) {
        setIcon(btn, a.icon, "ic-14");
        $("[data-sx-cp-audience-label]", btn).textContent = a.label;
      }
      var list = $("[data-sx-cp-audience-list]", root);
      if (list) list.innerHTML = audienceOptionsHtml(this.audience);
      refreshIcons();
    },

    addFiles: function (files) {
      var self = this;
      Array.prototype.slice.call(files).forEach(function (file) {
        if (!/^(image|video)\//.test(file.type)) {
          toast("Only images and video can be attached", "circle-alert");
          return;
        }
        if (file.size > 25 * 1024 * 1024) {
          toast(file.name + " is over the 25 MB limit", "circle-alert");
          return;
        }
        self.media.push({
          url: URL.createObjectURL(file),
          type: /^video\//.test(file.type) ? "video" : "image",
          name: file.name
        });
      });
      this.renderMedia();
      this.meter();
    },

    renderMedia: function () {
      var root = this.node();
      var zone = $("[data-sx-cp-drop]", root);
      var grid = $("[data-sx-cp-grid]", root);
      var empty = $("[data-sx-cp-empty]", root);
      if (!zone || !grid) return;

      grid.innerHTML = this.media.map(function (m, i) {
        return '<div class="sx-thumb">' +
          (m.type === "video"
            ? '<video src="' + m.url + '" muted playsinline preload="metadata"></video>' +
              '<span class="sx-thumb__drop">' + icon("film", "ic-14") + escapeHtml(m.name.slice(0, 18)) + "</span>"
            : '<img src="' + m.url + '" alt="' + escapeHtml(m.name) + '">') +
          '<button class="sx-thumb__x" type="button" data-sx-cp-remove="' + i + '" ' +
          'aria-label="Remove ' + escapeHtml(m.name) + '">' + icon("x", "ic-16") + "</button>" +
        "</div>";
      }).join("");

      if (this.media.length) {
        grid.insertAdjacentHTML("beforeend",
          '<button class="sx-drop__add" type="button" data-sx-cp-browse aria-label="Add more media">' +
          icon("plus", "ic-22") + "</button>");
      }

      if (empty) empty.hidden = this.media.length > 0;
      zone.hidden = this.media.length === 0 && !zone.hasAttribute("data-sx-cp-forced");
      refreshIcons();
    },

    showDropzone: function () {
      var zone = $("[data-sx-cp-drop]", this.node());
      if (!zone) return;
      zone.setAttribute("data-sx-cp-forced", "1");
      zone.hidden = false;
      var empty = $("[data-sx-cp-empty]", zone);
      if (empty) empty.hidden = this.media.length > 0;
    },

    renderPoll: function () {
      var root = this.node();
      var box = $("[data-sx-cp-poll]", root);
      if (!box) return;

      box.hidden = !this.poll;
      if (!this.poll) return;

      var rows = $("[data-sx-poll-rows]", box);
      rows.innerHTML = this.poll.options.map(function (value, i) {
        return '<div class="sx-builder__row">' +
          '<input class="form-control" type="text" value="' + escapeHtml(value) + '" ' +
          'data-sx-poll-input="' + i + '" placeholder="Option ' + (i + 1) + '" maxlength="60">' +
          (i > 1 ? '<button class="sx-iconbtn sx-iconbtn--sm" type="button" data-sx-poll-remove="' + i +
            '" aria-label="Remove option ' + (i + 1) + '">' + icon("x", "ic-16") + "</button>" : "") +
        "</div>";
      }).join("");

      var add = $("[data-sx-poll-add]", box);
      if (add) add.hidden = this.poll.options.length >= 4;
      refreshIcons();
    },

    renderTags: function () {
      var wrap = $("[data-sx-cp-tags]", this.node());
      if (!wrap) return;
      wrap.innerHTML = this.tags.map(function (name, i) {
        return '<span class="sx-tagchip">' + escapeHtml(name) +
          '<button type="button" data-sx-cp-untag="' + i + '" aria-label="Remove ' + escapeHtml(name) + '">' +
          icon("x", "ic-14") + "</button></span>";
      }).join("");
      refreshIcons();
    },

    collect: function () {
      var root = this.node();
      var field = $("[data-sx-cp-field]", root);

      if (this.poll) {
        this.poll.options = $$("[data-sx-poll-input]", root).map(function (i) { return i.value.trim(); })
          .filter(function (v) { return v !== ""; });
        this.poll.days = ($("[data-sx-poll-days]", root) || {}).value || "3";
      }

      var evBox = $("[data-sx-cp-event]", root);
      if (evBox && !evBox.hidden) {
        this.event = {
          title: ($("[data-sx-event-title]", root) || {}).value || "",
          date: ($("[data-sx-event-date]", root) || {}).value || "",
          place: ($("[data-sx-event-place]", root) || {}).value || ""
        };
        if (!this.event.title) this.event = null;
      }

      return field.value.trim();
    },

    submit: function () {
      var text = this.collect();
      if (this.poll && this.poll.options.length < 2) {
        toast("A poll needs at least two options", "circle-alert");
        return;
      }

      if (this.mode === "edit" && this.post) {
        applyEdit(this.post, text, this.audience, this.media);
        closeModal("sxCompose");
        toast("Changes saved", "circle-check");
        return;
      }

      var feed = $("[data-sx-feed]");
      if (!feed) return;

      var article = el(newPostHtml({
        text: text,
        audience: this.audience,
        media: this.media,
        poll: this.poll,
        event: this.event,
        quote: this.quote,
        tags: this.tags
      }));

      feed.insertBefore(article, feed.firstChild);
      enhancePost(article);
      wireReplyForms(article);
      closeModal("sxCompose");
      refreshIcons();

      article.scrollIntoView({ block: "center", behavior: prefersReducedMotion ? "auto" : "smooth" });
      toast("Post published", "circle-check", {
        action: "View",
        onAction: function () { article.scrollIntoView({ block: "center" }); }
      });
    },

    init: function () {
      var root = this.node();
      if (!root) return;
      var self = this;

      var field = $("[data-sx-cp-field]", root);
      var file = $("[data-sx-cp-file]", root);
      var zone = $("[data-sx-cp-drop]", root);
      var form = $("[data-sx-cp-form]", root);

      field.addEventListener("input", function () { self.grow(); self.meter(); });

      form.addEventListener("submit", function (e) { e.preventDefault(); self.submit(); });

      if (file) {
        file.addEventListener("change", function () {
          self.addFiles(file.files);
          file.value = "";
        });
      }

      if (zone) {
        ["dragenter", "dragover"].forEach(function (type) {
          zone.addEventListener(type, function (e) {
            e.preventDefault();
            zone.classList.add("is-over");
          });
        });
        ["dragleave", "drop"].forEach(function (type) {
          zone.addEventListener(type, function (e) {
            e.preventDefault();
            zone.classList.remove("is-over");
          });
        });
        zone.addEventListener("drop", function (e) {
          if (e.dataTransfer && e.dataTransfer.files.length) self.addFiles(e.dataTransfer.files);
        });
      }

      /* People picker for tagging */
      var people = $("[data-sx-cp-people]", root);
      if (people) {
        people.innerHTML = PEOPLE.filter(function (p) { return p.handle !== ME.handle; })
          .map(function (p) {
            return '<button class="sx-menu__item" type="button" data-sx-cp-tag="' + escapeHtml(p.name) + '">' +
              '<img class="sx-avatar sx-avatar--xs" src="' + p.avatar + '" alt="" width="28" height="28">' +
              '<span><span class="sx-menu__label">' + escapeHtml(p.name) + "</span>" +
              '<span class="sx-menu__desc">' + escapeHtml(p.handle) + "</span></span></button>";
          }).join("");
      }

      root.addEventListener("click", function (e) {
        var t = e.target;
        var browse = t.closest("[data-sx-cp-browse]");
        var remove = t.closest("[data-sx-cp-remove]");
        var untag = t.closest("[data-sx-cp-untag]");
        var tag = t.closest("[data-sx-cp-tag]");
        var pollRemove = t.closest("[data-sx-poll-remove]");
        var pollAdd = t.closest("[data-sx-poll-add]");
        var audiencePick = t.closest("[data-sx-audience-pick]");

        if (browse && file) { file.click(); return; }

        if (remove) {
          self.media.splice(parseInt(remove.getAttribute("data-sx-cp-remove"), 10), 1);
          self.renderMedia();
          self.meter();
          return;
        }

        if (untag) {
          self.tags.splice(parseInt(untag.getAttribute("data-sx-cp-untag"), 10), 1);
          self.renderTags();
          return;
        }

        if (tag) {
          var name = tag.getAttribute("data-sx-cp-tag");
          if (self.tags.indexOf(name) === -1) self.tags.push(name);
          self.renderTags();
          return;
        }

        if (pollRemove) {
          self.collect();
          self.poll.options.splice(parseInt(pollRemove.getAttribute("data-sx-poll-remove"), 10), 1);
          self.renderPoll();
          return;
        }

        if (pollAdd) {
          self.collect();
          if (self.poll.options.length < 4) self.poll.options.push("");
          self.renderPoll();
          return;
        }

        if (audiencePick) {
          self.audience = audiencePick.getAttribute("data-sx-audience-pick");
          self.renderAudience();
          self.showPane("compose");
          return;
        }
      });

      root.addEventListener("hidden.bs.modal", function () {
        if (zone) zone.removeAttribute("data-sx-cp-forced");
      });
    }
  };

  function audienceOptionsHtml(current) {
    return AUDIENCES.map(function (a) {
      return '<button class="sx-option' + (a.id === current ? " is-picked" : "") + '" type="button" ' +
        'data-sx-audience-pick="' + a.id + '">' +
        '<span class="sx-option__icon">' + icon(a.icon, "ic-18") + "</span>" +
        "<span>" + a.label + '<span class="sx-option__desc">' + a.desc + "</span></span>" +
        '<span class="sx-option__mark">' + icon("check", "ic-18") + "</span>" +
      "</button>";
    }).join("");
  }

  /** Read the media already attached to a post so editing keeps it. */
  function readMedia(article) {
    return $$(".sx-media-cell > img, .sx-media-cell > video, .sx-post__media > img", article).map(function (node) {
      return {
        url: node.getAttribute("src"),
        type: node.tagName.toLowerCase() === "video" ? "video" : "image",
        name: node.getAttribute("alt") || "Attachment"
      };
    });
  }

  function mediaGridHtml(items) {
    if (!items.length) return "";
    var shown = items.slice(0, 4);

    return '<div class="sx-media-grid sx-media-grid--' + shown.length + '">' +
      shown.map(function (m, i) {
        var extra = (i === 3 && items.length > 4)
          ? '<span class="sx-media-cell__more">+' + (items.length - 3) + "</span>" : "";
        var body = m.type === "video"
          ? '<video src="' + m.url + '" muted playsinline preload="metadata"></video>' +
            '<span class="sx-media-cell__play">' + icon("play", "ic-24") + "</span>"
          : '<img src="' + m.url + '" alt="' + escapeHtml(m.name) + '" loading="lazy">';
        return '<button class="sx-media-cell" type="button" data-sx-action="lightbox" data-sx-index="' + i + '">' +
          body + extra + "</button>";
      }).join("") +
    "</div>";
  }

  function pollHtml(poll) {
    if (!poll || poll.options.length < 2) return "";
    var share = Math.floor(100 / poll.options.length);

    return '<div class="sx-poll" data-sx-poll>' +
      poll.options.map(function (label, i) {
        var pct = i === 0 ? 100 - share * (poll.options.length - 1) : share;
        return '<button class="sx-poll__option" type="button" data-sx-poll-option data-sx-poll-pct="' + pct + '" ' +
          'aria-pressed="false"><span class="sx-poll__fill"></span>' +
          '<span class="sx-poll__label">' + escapeHtml(label) + "</span>" +
          '<span class="sx-poll__pct sx-tnum" data-sx-poll-pct-label>Vote</span>' +
        "</button>";
      }).join("") +
    "</div>" +
    '<p class="sx-meta mt-2 mb-0" data-sx-poll-tally="0">0 votes · closes in ' + escapeHtml(poll.days) + " days</p>";
  }

  function eventHtml(ev) {
    if (!ev) return "";
    return '<blockquote class="sx-post__quote">' +
      '<div class="sx-cluster sx-cluster--tight mb-2">' + icon("calendar", "ic-16") +
      '<span class="sx-strong">' + escapeHtml(ev.title) + "</span></div>" +
      '<p class="sx-meta mb-0">' + escapeHtml([ev.date, ev.place].filter(Boolean).join(" · ") || "Details to follow") + "</p>" +
    "</blockquote>";
  }

  function quoteHtml(q) {
    if (!q) return "";
    return '<blockquote class="sx-post__quote">' +
      '<div class="sx-cluster sx-cluster--tight mb-2">' +
        '<span class="sx-avatar sx-avatar--xs"><img src="' + q.avatar + '" alt="" width="28" height="28"></span>' +
        '<a class="sx-name" href="profile.html">' + escapeHtml(q.author) + "</a>" +
        '<span class="sx-meta">' + escapeHtml(q.handle) + "</span>" +
      "</div>" +
      '<p class="sx-post__text mb-0">' + escapeHtml(q.text) + "</p>" +
    "</blockquote>";
  }

  function newPostHtml(data) {
    var a = audienceById(data.audience);
    var id = uid("own");
    var withPeople = data.tags.length
      ? ' <span class="sx-meta">— with ' + escapeHtml(data.tags.slice(0, 2).join(", ")) +
        (data.tags.length > 2 ? " and " + (data.tags.length - 2) + " others" : "") + "</span>"
      : "";

    return '<article class="sx-panel sx-post" data-sx-post data-sx-post-id="' + id + '" data-sx-own ' +
      'data-sx-author="' + escapeHtml(ME.name) + '" data-sx-handle="' + ME.handle + '" ' +
      'data-sx-audience="' + data.audience + '" data-sx-following="1" data-sx-mins="0" data-sx-score="0" ' +
      'data-sx-comments="0" data-sx-shares="0">' +
      '<header class="sx-post__head">' +
        '<a class="sx-avatar" href="profile.html">' +
          '<img src="' + ME.avatar + '" alt="' + escapeHtml(ME.name) + '" width="42" height="42">' +
          '<span class="sx-avatar__presence sx-avatar__presence--online"></span>' +
        "</a>" +
        '<div class="sx-post__ident">' +
          '<div class="sx-post__byline">' +
            '<a class="sx-name" href="profile.html">' + escapeHtml(ME.name) + "</a>" +
            icon("badge-check", "ic-16 sx-verified") +
            '<span class="sx-meta">' + ME.handle + "</span>" + withPeople +
          "</div>" +
          '<div class="sx-post__submeta" data-sx-submeta>' +
            "<span>Just now</span><span class=\"sx-sep\">·</span>" +
            icon(a.icon, "ic-14") + "<span>" + a.label + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="sx-post__actions"></div>' +
      "</header>" +
      (data.text ? '<div class="sx-post__body"><p class="sx-post__text">' + linkify(data.text) + "</p>" +
        pollHtml(data.poll) + "</div>" : (data.poll ? '<div class="sx-post__body">' + pollHtml(data.poll) + "</div>" : "")) +
      quoteHtml(data.quote) +
      eventHtml(data.event) +
      mediaGridHtml(data.media) +
      '<div class="sx-pulse">' +
        '<button class="sx-pulse__btn" type="button" data-sx-react="like" aria-pressed="false">' +
          icon("thumbs-up", "ic-18") + '<span class="sx-pulse__count" data-sx-count="0">0</span></button>' +
        '<button class="sx-pulse__btn" type="button" data-sx-react="comment" aria-expanded="false" data-sx-comments-toggle>' +
          icon("message-circle", "ic-18") + "<span>Comment</span></button>" +
        '<button class="sx-pulse__btn" type="button" data-sx-react="share">' +
          icon("repeat-2", "ic-18") + "<span>Repost</span></button>" +
        '<button class="sx-pulse__btn sx-pulse__btn--save" type="button" data-sx-react="save" aria-pressed="false">' +
          icon("bookmark", "ic-18") + "<span>Save</span></button>" +
      "</div>" +
      '<div class="sx-comments" data-sx-comments hidden>' +
        '<ul class="sx-list-plain" data-sx-comment-list></ul>' +
        '<form class="sx-reply" data-sx-reply>' +
          '<span class="sx-avatar sx-avatar--sm"><img src="' + ME.avatar + '" alt="" width="34" height="34"></span>' +
          '<label class="sx-sr-only" for="' + id + '-reply">Write a comment</label>' +
          '<input class="sx-reply__field" id="' + id + '-reply" type="text" placeholder="Be the first to comment" data-sx-reply-field>' +
          '<button class="btn btn-soft" type="submit">Reply</button>' +
        "</form>" +
      "</div>" +
    "</article>";
  }

  function updateSubmeta(state) {
    var meta = $(".sx-post__submeta", state.el);
    if (!meta) return;
    var a = audienceById(state.audience);
    var when = state.when || (($("span", meta) || {}).textContent || "Just now");
    state.when = when;

    meta.innerHTML = "<span>" + escapeHtml(when) + '</span><span class="sx-sep">·</span>' +
      icon(a.icon, "ic-14") + "<span>" + a.label + "</span>" +
      (state.edited ? '<span class="sx-sep">·</span><span class="sx-post__edited">Edited</span>' : "");
    refreshIcons();
  }

  function applyEdit(state, text, audience, media) {
    var body = $(".sx-post__body", state.el);
    var textEl = $(".sx-post__text", state.el);

    if (textEl) textEl.innerHTML = linkify(text);
    else if (body) body.insertAdjacentHTML("afterbegin", '<p class="sx-post__text">' + linkify(text) + "</p>");

    var oldMedia = $(".sx-media-grid", state.el) || $(".sx-post__media", state.el);
    var markup = mediaGridHtml(media);

    if (oldMedia && markup) {
      oldMedia.replaceWith(el(markup));
    } else if (oldMedia) {
      oldMedia.remove();
    } else if (markup) {
      var tally = $(".sx-post__tally", state.el);
      var pulse = $(".sx-pulse", state.el);
      var before = tally || pulse;
      if (before) before.parentNode.insertBefore(el(markup), before);
    }

    state.audience = audience;
    state.edited = true;
    updateSubmeta(state);
    repaintMenu(state);
    refreshIcons();
  }


  /* 17. Share, report & confirm modals ------------------------------------- */

  var Share = {
    state: null,

    open: function (state) {
      this.state = state;
      var url = postUrl(state);
      var input = $("[data-sx-share-url]");
      if (input) input.value = url;

      var sub = $("[data-sx-share-sub]");
      if (sub) sub.textContent = state.own ? "Your post" : state.author + "'s post";

      var list = $("[data-sx-share-people]");
      if (list) {
        list.innerHTML = pick(PEOPLE, state.id + "share", 4).map(function (p) {
          return '<div class="sx-reactor">' +
            '<span class="sx-avatar sx-avatar--sm"><img src="' + p.avatar + '" alt="" width="34" height="34"></span>' +
            '<span class="sx-reactor__ident"><span class="sx-name">' + escapeHtml(p.name) + "</span>" +
            '<span class="sx-meta">' + escapeHtml(p.handle) + "</span></span>" +
            '<button class="btn btn-soft btn-sm" type="button" data-sx-send="' + escapeHtml(p.name) + '">Send</button>' +
          "</div>";
        }).join("");
      }

      openModal("sxShare");
    },

    init: function () {
      var root = document.getElementById("sxShare");
      if (!root) return;
      var self = this;

      root.addEventListener("click", function (e) {
        var choice = e.target.closest("[data-sx-share]");
        var send = e.target.closest("[data-sx-send]");
        var state = self.state;
        if (!state) return;

        if (send) {
          send.textContent = "Sent";
          send.disabled = true;
          toast("Sent to " + send.getAttribute("data-sx-send"), "send");
          return;
        }

        if (!choice) return;
        var kind = choice.getAttribute("data-sx-share");

        if (kind === "copy") {
          copyText(postUrl(state));
          toast("Link copied", "link");
        } else if (kind === "repost") {
          state.shares += 1;
          syncTally(state);
          toast("Reposted to your followers", "repeat-2", {
            action: "Undo",
            onAction: function () { state.shares -= 1; syncTally(state); }
          });
        } else if (kind === "quote") {
          var textEl = $(".sx-post__text", state.el);
          closeModal("sxShare");
          CP.open({
            mode: "create",
            quote: {
              author: state.author,
              handle: state.handle,
              avatar: state.avatar,
              text: textEl ? textEl.textContent.trim().slice(0, 220) : ""
            }
          });
          return;
        } else if (kind === "message") {
          toast("Pick someone below to send it to", "message-circle");
          return;
        } else if (kind === "embed") {
          copyText('<iframe src="' + postUrl(state) + '/embed" width="560" height="420"></iframe>');
          toast("Embed code copied", "copy");
        } else if (kind === "email") {
          window.location.href = "mailto:?subject=" + encodeURIComponent("A post on Sovix") +
            "&body=" + encodeURIComponent(postUrl(state));
          return;
        } else if (kind === "space") {
          toast("Shared to Type & Lettering", "hash");
        } else {
          toast("Shared", "circle-check");
        }

        closeModal("sxShare");
      });
    }
  };

  var Report = {
    state: null,
    target: "post",
    reason: null,

    open: function (state, target) {
      this.state = state;
      this.target = target || "post";
      this.reason = null;

      var list = $("[data-sx-report-list]");
      if (list) {
        list.innerHTML = REPORT_REASONS.map(function (r) {
          return '<button class="sx-option" type="button" data-sx-reason="' + r.id + '">' +
            '<span class="sx-option__icon">' + icon("flag", "ic-18") + "</span>" +
            "<span>" + r.label + '<span class="sx-option__desc">' + r.desc + "</span></span>" +
            '<span class="sx-option__mark">' + icon("check", "ic-18") + "</span></button>";
        }).join("");
      }

      var sub = $("[data-sx-report-sub]");
      if (sub) sub.textContent = this.target === "comment" ? "Reporting a comment" : "Reporting a post by " + state.author;

      var submit = $("[data-sx-report-submit]");
      if (submit) submit.disabled = true;

      openModal("sxReport");
      refreshIcons();
    },

    init: function () {
      var root = document.getElementById("sxReport");
      if (!root) return;
      var self = this;

      root.addEventListener("click", function (e) {
        var choice = e.target.closest("[data-sx-reason]");
        if (choice) {
          $$("[data-sx-reason]", root).forEach(function (b) { b.classList.remove("is-picked"); });
          choice.classList.add("is-picked");
          self.reason = choice.getAttribute("data-sx-reason");
          var submit = $("[data-sx-report-submit]", root);
          if (submit) submit.disabled = false;
          return;
        }

        if (e.target.closest("[data-sx-report-submit]")) {
          closeModal("sxReport");
          var state = self.state;
          if (self.target === "comment") {
            toast("Report sent. Thank you.", "flag");
            return;
          }
          toast("Report sent. Thank you.", "flag", {
            action: "Hide post",
            onAction: function () {
              hidePost(state, "Post hidden", "You will see fewer posts like this.", "eye-off");
            }
          });
        }
      });
    }
  };

  var Confirm = {
    handler: null,

    open: function (opts) {
      var root = document.getElementById("sxConfirm");
      if (!root) return;

      $("[data-sx-confirm-title]", root).textContent = opts.title;
      $("[data-sx-confirm-body]", root).textContent = opts.body;

      var btn = $("[data-sx-confirm-go]", root);
      btn.textContent = opts.confirm || "Confirm";
      btn.classList.toggle("btn-danger", !!opts.danger);
      btn.classList.toggle("btn-brand", !opts.danger);

      this.handler = opts.onConfirm || null;
      openModal("sxConfirm");
    },

    init: function () {
      var root = document.getElementById("sxConfirm");
      if (!root) return;
      var self = this;

      $("[data-sx-confirm-go]", root).addEventListener("click", function () {
        closeModal("sxConfirm");
        var fn = self.handler;
        self.handler = null;
        if (fn) window.setTimeout(fn, 160);
      });
    }
  };


  /* 18. Lightbox ----------------------------------------------------------- */

  var Lightbox = {
    items: [],
    index: 0,

    open: function (state, index) {
      var nodes = $$(".sx-media-cell > img, .sx-media-cell > video, .sx-post__media > img", state.el);
      if (!nodes.length) return;

      this.items = nodes.map(function (n) {
        return {
          url: n.getAttribute("src"),
          type: n.tagName.toLowerCase() === "video" ? "video" : "image",
          alt: n.getAttribute("alt") || ""
        };
      });

      this.index = Math.min(Math.max(index || 0, 0), this.items.length - 1);
      this.state = state;
      this.render();
      this.lend();
      openModal("sxLightbox");
    },


    /** Covers and profile pictures are not posts, so they get their own way in:
        one image, no gallery. The alt text still travels with it for screen
        readers, even though nothing is printed under the image. */
    openOne: function (url, alt, author) {
      this.items = [{ url: url, type: "image", alt: alt || "" }];
      this.index = 0;
      this.state = { author: author || "", el: null };
      this.render();
      this.lend();          /* el is null, so this just hides the panel */
      openModal("sxLightbox");
    },

    /* ---- Side panel -------------------------------------------------------
       Facebook's photo view puts the post beside the picture, and everything
       in it still works. Rather than clone the card — which would leave two
       copies of every count to keep in step — the real nodes are lifted out of
       the article and put back when the viewer closes. Same elements, so the
       delegated router, the reaction flyout and the comment forms carry on
       working with nothing rebound, and a like made here is already made on
       the card behind. */
    PANEL_PARTS: [".sx-post__head", ".sx-post__body", ".sx-post__tally", ".sx-pulse", ".sx-comments"],

    lend: function () {
      var side = $("[data-sx-lightbox-side]");
      var article = this.state && this.state.el;
      this.borrowed = [];

      if (!side) return;
      if (!article) { side.hidden = true; return; }

      /* Comments are the point of the panel, so open the thread properly —
         through the same helper the Comment button uses, so aria-expanded and
         the toggle stay honest and the button still works once it is over
         here. Done before the move, while the nodes are still in the card. */
      openThread(this.state, false);

      var self = this;
      this.PANEL_PARTS.forEach(function (sel) {
        var node = $(sel, article);
        if (!node) return;
        /* A marker holds the slot so each piece goes back where it came from,
           in order, however the card is built. */
        var mark = document.createComment("sx-lightbox-slot");
        node.parentNode.insertBefore(mark, node);
        self.borrowed.push({ node: node, mark: mark });
        side.appendChild(node);
      });

      side.hidden = !this.borrowed.length;
      if (!side.hidden) side.scrollTop = 0;
      refreshIcons();
    },

    restore: function () {
      var side = $("[data-sx-lightbox-side]");
      (this.borrowed || []).forEach(function (b) {
        if (b.mark.parentNode) b.mark.parentNode.replaceChild(b.node, b.mark);
        else if (b.node.parentNode) b.node.parentNode.removeChild(b.node);
      });
      this.borrowed = [];
      if (side) { side.hidden = true; side.innerHTML = ""; }
    },
    render: function () {
      var root = document.getElementById("sxLightbox");
      if (!root) return;

      var item = this.items[this.index];
      var stage = $("[data-sx-lightbox-stage]", root);

      stage.innerHTML = item.type === "video"
        ? '<video src="' + item.url + '" controls autoplay playsinline></video>'
        : '<img src="' + item.url + '" alt="' + escapeHtml(item.alt) + '">';

      /* The viewer shows the image and nothing else. If a caption bar is added
         back to the markup, these fill it; without it they simply do nothing. */
      var author = $("[data-sx-lightbox-author]", root);
      var alt = $("[data-sx-lightbox-alt]", root);
      var count = $("[data-sx-lightbox-count]", root);
      if (author) author.textContent = this.state.author;
      if (alt) alt.textContent = item.alt || "";
      if (count) count.textContent = (this.index + 1) + " of " + this.items.length;

      $$("[data-sx-lightbox-nav]", root).forEach(function (b) { b.hidden = this.items.length < 2; }, this);
    },

    step: function (dir) {
      this.index = (this.index + dir + this.items.length) % this.items.length;
      this.render();
    },

    init: function () {
      var root = document.getElementById("sxLightbox");
      if (!root) return;
      var self = this;

      root.addEventListener("click", function (e) {
        var nav = e.target.closest("[data-sx-lightbox-nav]");
        if (nav) {
          self.step(nav.getAttribute("data-sx-lightbox-nav") === "next" ? 1 : -1);
          return;
        }

        /* The viewer is fullscreen, so there is no backdrop behind it to click.
           The dark space around the picture stands in for one — clicking the
           media pane itself, but not the picture or the arrows, closes. */
        var stage = e.target.closest("[data-sx-lightbox-stage]");
        var pane = e.target.closest(".sx-lightbox__media");
        if (pane && (!stage || e.target === stage)) closeModal("sxLightbox");
      });

      document.addEventListener("keydown", function (e) {
        if (!root.classList.contains("show")) return;
        /* The panel holds a comment field. Arrow keys belong to whoever is
           typing, not to the gallery. */
        var el = document.activeElement;
        if (el && (/^(input|textarea|select)$/i.test(el.tagName) || el.isContentEditable)) return;
        if (e.key === "ArrowRight") self.step(1);
        if (e.key === "ArrowLeft") self.step(-1);
      });

      root.addEventListener("hidden.bs.modal", function () {
        /* Hand the post back to its card before the stage is cleared, or the
           header, pulse bar and comments would be dropped with it. */
        self.restore();
        $("[data-sx-lightbox-stage]", root).innerHTML = "";
      });
    }
  };

  function upgradeMedia(state) {
    $$(".sx-post__media", state.el).forEach(function (node, i) {
      node.setAttribute("data-sx-action", "lightbox");
      node.setAttribute("data-sx-index", String(i));
    });
  }


  /* 19. Feed filter & display settings ------------------------------------- */

  function initFeedFilter() {
    var bar = $("[data-sx-feedbar]");
    var feed = $("[data-sx-feed]");
    if (!bar || !feed) return;

    var apply = function (mode) {
      var posts = $$("[data-sx-post]", feed);

      posts.forEach(function (a) {
        var following = a.getAttribute("data-sx-following") !== "0";
        a.classList.toggle("is-filtered", mode === "following" && !following);
      });

      if (mode === "top") {
        posts.slice().sort(function (a, b) {
          return (parseInt(b.getAttribute("data-sx-score"), 10) || 0) -
                 (parseInt(a.getAttribute("data-sx-score"), 10) || 0);
        }).forEach(function (a) { feed.appendChild(a); });
      } else {
        posts.slice().sort(function (a, b) {
          return (parseInt(a.getAttribute("data-sx-mins"), 10) || 0) -
                 (parseInt(b.getAttribute("data-sx-mins"), 10) || 0);
        }).forEach(function (a) { feed.appendChild(a); });
      }
    };

    $$("[data-sx-feed-sort]", bar).forEach(function (tab) {
      tab.addEventListener("click", function () {
        $$("[data-sx-feed-sort]", bar).forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        apply(tab.getAttribute("data-sx-feed-sort"));
      });
    });

    $$("[data-sx-setting]", bar).forEach(function (input) {
      input.addEventListener("change", function () {
        var key = input.getAttribute("data-sx-setting");
        if (key === "compact") feed.classList.toggle("is-compact", input.checked);
        if (key === "large") feed.classList.toggle("is-large", input.checked);
        if (key === "reposts") {
          $$('[data-sx-kind="repost"]', feed).forEach(function (a) {
            a.classList.toggle("is-filtered", !input.checked);
          });
        }
      });
    });
  }


  /* 20. Pagination, jump pill, tooltips ------------------------------------ */

  var LATER_POSTS = [
    {
      author: "Ana Costa", handle: "@anacosta", avatar: "assets/img/avatar/avatar-1.png",
      when: "4h", mins: 240, score: 612, comments: 48, shares: 12, likes: 612,
      text: "Three releases, one week. The trick was cutting the review queue to a single owner per change — nothing else changed.",
      media: [{ url: "assets/img/post/post_1.png", type: "image", name: "Stack of shipped release cards" }]
    },
    {
      author: "June Park", handle: "@junepark", avatar: "assets/img/avatar/avatar-3.png",
      when: "6h", mins: 360, score: 1893, comments: 132, shares: 57, likes: 1893,
      text: "Redrew the arcs in our identity system so they hold at 16px. Small sizes are where a mark earns its keep.",
      media: [{ url: "assets/img/post/post_3.png", type: "image", name: "Layered arcs in amber and indigo" }]
    }
  ];

  function olderPostHtml(p) {
    var id = uid("old");
    return '<article class="sx-panel sx-post" data-sx-post data-sx-post-id="' + id + '" ' +
      'data-sx-author="' + escapeHtml(p.author) + '" data-sx-handle="' + p.handle + '" data-sx-audience="public" ' +
      'data-sx-following="1" data-sx-mins="' + p.mins + '" data-sx-score="' + p.score + '" ' +
      'data-sx-comments="' + p.comments + '" data-sx-shares="' + p.shares + '">' +
      '<header class="sx-post__head">' +
        '<a class="sx-avatar" href="profile.html"><img src="' + p.avatar + '" alt="' + escapeHtml(p.author) +
          '" width="42" height="42"></a>' +
        '<div class="sx-post__ident"><div class="sx-post__byline">' +
          '<a class="sx-name" href="profile.html">' + escapeHtml(p.author) + "</a>" +
          '<span class="sx-meta">' + p.handle + "</span></div>" +
          '<div class="sx-post__submeta"><span>' + p.when + '</span><span class="sx-sep">·</span>' +
          icon("globe", "ic-14") + "<span>Public</span></div></div>" +
        '<div class="sx-post__actions"></div>' +
      "</header>" +
      '<div class="sx-post__body"><p class="sx-post__text">' + linkify(p.text) + "</p></div>" +
      mediaGridHtml(p.media) +
      '<div class="sx-pulse">' +
        '<button class="sx-pulse__btn" type="button" data-sx-react="like" aria-pressed="false">' +
          icon("thumbs-up", "ic-18") + '<span class="sx-pulse__count" data-sx-count="' + p.likes + '">' +
          compact(p.likes) + "</span></button>" +
        '<button class="sx-pulse__btn" type="button" data-sx-react="comment" aria-expanded="false" data-sx-comments-toggle>' +
          icon("message-circle", "ic-18") + "<span>Comment</span></button>" +
        '<button class="sx-pulse__btn" type="button" data-sx-react="share">' +
          icon("repeat-2", "ic-18") + "<span>Repost</span></button>" +
        '<button class="sx-pulse__btn sx-pulse__btn--save" type="button" data-sx-react="save" aria-pressed="false">' +
          icon("bookmark", "ic-18") + "<span>Save</span></button>" +
      "</div>" +
      '<div class="sx-comments" data-sx-comments hidden>' +
        '<ul class="sx-list-plain" data-sx-comment-list></ul>' +
        '<form class="sx-reply" data-sx-reply>' +
          '<span class="sx-avatar sx-avatar--sm"><img src="' + ME.avatar + '" alt="" width="34" height="34"></span>' +
          '<label class="sx-sr-only" for="' + id + '-reply">Write a comment</label>' +
          '<input class="sx-reply__field" id="' + id + '-reply" type="text" placeholder="Write a comment" data-sx-reply-field>' +
          '<button class="btn btn-soft" type="submit">Reply</button>' +
        "</form>" +
      "</div>" +
    "</article>";
  }

  function initPagination() {
    var btn = $("[data-sx-load-more]");
    var feed = $("[data-sx-feed]");
    var skeleton = $("[data-sx-feed-skeleton]");
    if (!btn || !feed) return;

    var served = 0;

    btn.addEventListener("click", function () {
      if (served >= LATER_POSTS.length) return;

      btn.disabled = true;
      btn.textContent = "Loading…";
      if (skeleton) skeleton.hidden = false;

      window.setTimeout(function () {
        if (skeleton) skeleton.hidden = true;

        var article = el(olderPostHtml(LATER_POSTS[served]));
        served += 1;
        feed.appendChild(article);
        enhancePost(article);
        wireReplyForms(article);

        if (served >= LATER_POSTS.length) {
          btn.textContent = "You are all caught up";
          btn.disabled = true;
        } else {
          btn.disabled = false;
          btn.textContent = "Show older posts";
        }
      }, prefersReducedMotion ? 120 : 700);
    });
  }

  function initJumpPill() {
    var pill = $("[data-sx-jump]");
    if (!pill) return;

    var onScroll = function () { pill.classList.toggle("is-shown", window.scrollY > 700); };

    pill.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      pill.classList.remove("is-shown");
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initTooltips() {
    if (!window.bootstrap || !window.bootstrap.Tooltip) return;
    $$('[data-bs-toggle="tooltip"]').forEach(function (elm) {
      new window.bootstrap.Tooltip(elm, { delay: { show: 350, hide: 60 }, trigger: "hover focus" });
    });
  }


  /* 21. Action router ------------------------------------------------------ */

  function toggleThread(state) {
    var thread = $("[data-sx-comments]", state.el);
    if (!thread) return;

    if (!state.commentsOn) {
      toast("Commenting is off for this post", "message-square");
      return;
    }

    thread.hidden = !thread.hidden;
    $$("[data-sx-comments-toggle]", state.el).forEach(function (b) {
      b.setAttribute("aria-expanded", thread.hidden ? "false" : "true");
    });

    if (!thread.hidden) {
      var field = $("[data-sx-reply-field]", thread);
      if (field) field.focus();
    }
  }

  function toggleSave(state) {
    state.saved = !state.saved;

    var btn = $(".sx-pulse__btn--save", state.el);
    if (btn) {
      btn.classList.toggle("is-on", state.saved);
      btn.setAttribute("aria-pressed", state.saved ? "true" : "false");
      var label = $("span:not(.sx-pulse__count)", btn);
      if (label) label.textContent = state.saved ? "Saved" : "Save";
    }

    repaintMenu(state);
    toast(state.saved ? "Saved to your collection" : "Removed from saved", "bookmark", {
      action: state.saved ? "Undo" : null,
      onAction: function () { toggleSave(state); }
    });
  }

  function openAudienceModal(state) {
    var list = $("[data-sx-audience-list]");
    if (!list) return;
    list.innerHTML = audienceOptionsHtml(state.audience);
    Audience.state = state;
    openModal("sxAudience");
    refreshIcons();
  }

  var Audience = {
    state: null,

    init: function () {
      var root = document.getElementById("sxAudience");
      if (!root) return;
      var self = this;

      root.addEventListener("click", function (e) {
        var choice = e.target.closest("[data-sx-audience-pick]");
        if (!choice || !self.state) return;

        self.state.audience = choice.getAttribute("data-sx-audience-pick");
        self.state.el.setAttribute("data-sx-audience", self.state.audience);
        updateSubmeta(self.state);
        repaintMenu(self.state);
        closeModal("sxAudience");
        toast("Audience set to " + audienceById(self.state.audience).label, "globe");
      });
    }
  };

  /* Comment-level actions ---------------------------------------------------*/

  function commentActions(action, li, state) {
    var bubble = $(".sx-comment__bubble", li);
    var textEl = $(".sx-comment__text", li);
    var main = $(".sx-comment__main", li);

    if (action === "comment-like") {
      var btn = $('[data-sx-action="comment-like"]', li);
      var pill = $(".sx-comment__pill", li);
      var countEl = $("[data-sx-c-count]", li);
      var likes = parseInt(li.getAttribute("data-sx-likes"), 10) || 0;
      var on = btn.classList.toggle("is-on");

      likes = Math.max(likes + (on ? 1 : -1), 0);
      li.setAttribute("data-sx-likes", String(likes));
      btn.textContent = on ? "Liked" : "Like";
      if (countEl) countEl.textContent = compact(likes);
      if (pill) pill.hidden = likes === 0;
      return;
    }

    if (action === "comment-reply") {
      closeDropdowns();
      var replies = $("[data-sx-replies]", li);
      var name = ($(".sx-name", li) || {}).textContent || "";
      if ($("[data-sx-reply-inline]", li)) {
        $("[data-sx-reply-field]", $("[data-sx-reply-inline]", li)).focus();
        return;
      }

      var form = el(
        '<form class="sx-reply mt-2" data-sx-reply data-sx-reply-inline data-sx-reply-to="' + escapeHtml(name) + '">' +
          '<span class="sx-avatar sx-avatar--sm"><img src="' + ME.avatar + '" alt="" width="34" height="34"></span>' +
          '<label class="sx-sr-only" for="' + li.getAttribute("data-sx-comment-id") + '-r">Reply to ' + escapeHtml(name) + "</label>" +
          '<input class="sx-reply__field" id="' + li.getAttribute("data-sx-comment-id") + '-r" type="text" ' +
            'placeholder="Reply to ' + escapeHtml(name) + '" data-sx-reply-field>' +
          '<button class="btn btn-soft" type="submit">Reply</button>' +
        "</form>"
      );

      main.insertBefore(form, replies.nextSibling);
      wireReplyForms(li);
      $("[data-sx-reply-field]", form).focus();
      return;
    }

    if (action === "comment-copy") {
      copyText(textEl ? textEl.textContent.trim() : "");
      toast("Comment copied", "copy");
      return;
    }

    if (action === "comment-report") {
      Report.open(state, "comment");
      return;
    }

    if (action === "comment-edit") {
      if (li.classList.contains("is-editing")) return;
      li.classList.add("is-editing");

      var editor = el(
        '<form class="sx-comment__edit" data-sx-comment-edit>' +
          '<input class="form-control" type="text" value="' + escapeHtml(textEl.textContent.trim()) + '" ' +
            'aria-label="Edit your comment">' +
          '<button class="btn btn-brand btn-sm" type="submit">Save</button>' +
          '<button class="btn btn-quiet btn-sm" type="button" data-sx-cancel-edit>Cancel</button>' +
        "</form>"
      );

      main.insertBefore(editor, main.firstChild);
      $("input", editor).focus();

      editor.addEventListener("submit", function (e) {
        e.preventDefault();
        var value = $("input", editor).value.trim();
        if (value) {
          textEl.innerHTML = linkify(value);
          var mark = $(".sx-comment__edited", li);
          if (mark) mark.hidden = false;
        }
        li.classList.remove("is-editing");
        editor.remove();
      });

      $("[data-sx-cancel-edit]", editor).addEventListener("click", function () {
        li.classList.remove("is-editing");
        editor.remove();
      });
      return;
    }

    if (action === "comment-delete") {
      var parent = li.parentNode;
      var next = li.nextSibling;
      li.remove();
      state.comments = Math.max(state.comments - 1, 0);
      syncTally(state);

      toast("Comment deleted", "trash-2", {
        action: "Undo",
        onAction: function () {
          parent.insertBefore(li, next);
          state.comments += 1;
          syncTally(state);
          refreshIcons();
        }
      });
    }
  }

  function initRouter() {
    document.addEventListener("click", function (e) {
      var target = e.target;

      /* Pulse bar: save, comment and repost. The like button owns its own
         handler because it also drives the reaction flyout. */
      var pulse = target.closest("[data-sx-react]");
      if (pulse) {
        var kind = pulse.getAttribute("data-sx-react");
        var pulseState = stateOf(pulse);
        if (pulseState && kind !== "like") {
          e.preventDefault();
          if (kind === "save") toggleSave(pulseState);
          if (kind === "comment") toggleThread(pulseState);
          if (kind === "share") Share.open(pulseState);
          return;
        }
      }

      var trigger = target.closest("[data-sx-action]");
      if (!trigger) return;

      var action = trigger.getAttribute("data-sx-action");
      var arg = trigger.getAttribute("data-sx-arg");
      var state = stateOf(trigger);
      var li = target.closest("[data-sx-comment]");

      /* Composer entry points work without a post in scope. */
      if (action === "open-composer") {
        e.preventDefault();
        CP.open({ mode: "create" });
        var file = $("[data-sx-cp-file]");
        if (file) file.setAttribute("accept", arg === "video" ? "video/*" : "image/*,video/*");
        if (arg === "photo" || arg === "video") CP.showDropzone();
        if (arg === "poll") { CP.poll = { options: ["", ""], days: "3" }; CP.renderPoll(); }
        if (arg === "event") { $("[data-sx-cp-event]").hidden = false; }
        return;
      }

      if (action === "cp-pane") { e.preventDefault(); CP.showPane(arg); return; }

      if (action === "cp-tool") {
        e.preventDefault();
        if (arg === "media") { CP.showDropzone(); var input = $("[data-sx-cp-file]"); if (input) input.click(); }
        if (arg === "poll") { CP.poll = CP.poll || { options: ["", ""], days: "3" }; CP.renderPoll(); CP.meter(); }
        if (arg === "event") { var box = $("[data-sx-cp-event]"); box.hidden = !box.hidden; CP.meter(); }
        return;
      }

      if (action === "cp-poll-close") { e.preventDefault(); CP.poll = null; CP.renderPoll(); CP.meter(); return; }
      if (action === "cp-event-close") { e.preventDefault(); $("[data-sx-cp-event]").hidden = true; CP.event = null; CP.meter(); return; }

      /* Page-level controls: cards, invitations, events, spaces. */
      if (action === "dismiss") {
        e.preventDefault();
        var card = trigger.closest("[data-sx-dismissable]");
        if (!card) return;
        var parent = card.parentNode;
        var next = card.nextSibling;
        card.remove();
        toast(trigger.getAttribute("data-sx-arg") || "Removed from your suggestions", "circle-check", {
          action: "Undo",
          onAction: function () { parent.insertBefore(card, next); refreshIcons(); }
        });
        return;
      }

      if (action === "rsvp" || action === "join" || action === "toggle-btn") {
        e.preventDefault();
        var on = trigger.getAttribute("aria-pressed") === "true";
        var onLabel = trigger.getAttribute("data-sx-on") || "Going";
        var offLabel = trigger.getAttribute("data-sx-off") || "RSVP";
        trigger.setAttribute("aria-pressed", on ? "false" : "true");
        trigger.classList.toggle("btn-brand", on);
        trigger.classList.toggle("btn-soft", !on);
        trigger.textContent = on ? offLabel : onLabel;
        toast(on ? offLabel + " — removed" : onLabel + " — saved to your calendar", "calendar");
        return;
      }

      if (action === "invite-accept" || action === "invite-ignore") {
        e.preventDefault();
        var row = trigger.closest("[data-sx-dismissable]") || trigger.closest(".sx-invite");
        var who = trigger.getAttribute("data-sx-arg") || "them";
        if (row) row.remove();
        toast(action === "invite-accept" ? "You and " + who + " are now connected" : "Invitation ignored",
          action === "invite-accept" ? "user-check" : "circle-x");
        return;
      }

      if (!state) return;

      /* Comment actions */
      if (action.indexOf("comment-") === 0 && li) {
        e.preventDefault();
        closeDropdowns();
        commentActions(action, li, state);
        return;
      }

      if (action.indexOf("sort-") === 0) {
        e.preventDefault();
        var thread = target.closest("[data-sx-comments]");
        var mode = action.replace("sort-", "");
        var labels = { relevant: "Most relevant", newest: "Newest first", oldest: "Oldest first" };
        sortComments(thread, mode, labels[mode]);
        closeDropdowns();
        return;
      }

      if (action === "more-comments") {
        e.preventDefault();
        loadMoreComments(state, trigger);
        return;
      }

      e.preventDefault();
      closeDropdowns();

      switch (action) {
        case "reactors":
          Reactors.open(state);
          break;

        case "comments":
          toggleThread(state);
          break;

        case "share":
          Share.open(state);
          break;

        case "lightbox":
          Lightbox.open(state, parseInt(trigger.getAttribute("data-sx-index"), 10) || 0);
          break;

        case "edit":
          CP.open({ mode: "edit", post: state });
          break;

        case "audience":
          openAudienceModal(state);
          break;

        case "pin":
          state.pinned = !state.pinned;
          repaintMenu(state);
          toast(state.pinned ? "Pinned to your profile" : "Unpinned from your profile", "pin");
          break;

        case "comments-off":
          state.commentsOn = !state.commentsOn;
          var thread2 = $("[data-sx-comments]", state.el);
          if (thread2) thread2.hidden = true;
          $$("[data-sx-comments-toggle]", state.el).forEach(function (b) {
            b.disabled = !state.commentsOn;
          });
          repaintMenu(state);
          toast(state.commentsOn ? "Commenting is back on" : "Commenting is off", "message-square");
          break;

        case "save":
          toggleSave(state);
          break;

        case "copy-link":
          copyText(postUrl(state));
          toast("Link copied", "link");
          break;

        case "notify":
          state.notify = !state.notify;
          repaintMenu(state);
          toast(state.notify ? "You will get alerts about this post" : "Alerts turned off", state.notify ? "bell" : "bell-off");
          break;

        case "hide":
          hidePost(state, "Post hidden", "You will see fewer posts like this.", "eye-off");
          break;

        case "snooze":
          snoozeAuthor(state);
          break;

        case "follow":
          state.following = !state.following;
          state.el.setAttribute("data-sx-following", state.following ? "1" : "0");
          repaintMenu(state);
          toast(state.following ? "You now follow " + state.author : "Unfollowed " + state.author,
            state.following ? "user-check" : "user-minus", {
              action: "Undo",
              onAction: function () {
                state.following = !state.following;
                state.el.setAttribute("data-sx-following", state.following ? "1" : "0");
                repaintMenu(state);
              }
            });
          break;

        case "report":
          Report.open(state, "post");
          break;

        case "delete":
          deletePost(state);
          break;

        default:
          break;
      }
    });
  }



  /* 22. Tabs (profile, explore, network, search, saved) -------------------- */

  function initTabs() {
    $$("[data-sx-tabs]").forEach(function (strip) {
      if (strip.dataset.sxBound === "1") return;
      strip.dataset.sxBound = "1";

      var host = strip.closest("[data-sx-tabhost]") || document;

      strip.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-sx-tab]");
        if (!btn) return;

        var key = btn.getAttribute("data-sx-tab");

        $$("[data-sx-tab]", strip).forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });

        $$("[data-sx-tabpanel]", host).forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-sx-tabpanel") !== key;
        });
      });
    });
  }


  /* 23. Messages ----------------------------------------------------------- */

  var THREADS = {
    "t-nadia": {
      name: "Nadia Hart", avatar: "assets/img/avatar/avatar-6.png", status: "Active now",
      lines: [
        { day: "Today" },
        { me: false, text: "Sent you the density chart — the one from the wallpaper post.", time: "09:12" },
        { me: true, text: "Got it. The falloff past the third ring is the part I keep staring at.", time: "09:15" },
        { me: false, text: "Same. I think it reads calm because the spacing grows faster than the dots do.", time: "09:16" },
        { me: true, text: "Want to run it past the studio on Thursday?", time: "09:20" },
        { me: false, text: "Yes. I will bring the printed sheets so we can argue over something physical.", time: "09:21" }
      ]
    },
    "t-dev": {
      name: "Dev Iyer", avatar: "assets/img/avatar/avatar-2.png", status: "Active 20m ago",
      lines: [
        { day: "Yesterday" },
        { me: false, text: "The motion spec is merged. Reduced-motion path included.", time: "16:40" },
        { me: true, text: "Nice. Did the spring values survive review?", time: "16:44" },
        { me: false, text: "Two of three. The overshoot on the sheet was making people seasick.", time: "16:45" }
      ]
    },
    "t-studio": {
      name: "Studio critique", avatar: "assets/img/avatar/avatar-1.png", status: "6 members · 2 typing",
      lines: [
        { day: "Today" },
        { me: false, text: "Ana: Thursday slots are open. Bring one screen each, not a deck.", time: "08:02" },
        { me: false, text: "June: I will take the 7pm slot if nobody has claimed it.", time: "08:11" },
        { me: true, text: "Claiming 7:30. Working on the onboarding survey rewrite.", time: "08:15" }
      ]
    },
    "t-mira": {
      name: "Mira Shah", avatar: "assets/img/avatar/avatar-5.png", status: "Active 2h ago",
      lines: [
        { day: "Monday" },
        { me: false, text: "Renaming the components cut our support tickets by a third. Writing it up.", time: "11:30" },
        { me: true, text: "Send the draft when it is ready — happy to read it cold.", time: "11:52" }
      ]
    }
  };

  var REPLIES = [
    "Makes sense — give me a minute to look.",
    "Agreed. Let us do that.",
    "Sending it over now.",
    "Good catch. I will fix it before the review."
  ];

  function bubbleHtml(line) {
    if (line.day) return '<span class="sx-msg__day">' + escapeHtml(line.day) + "</span>";
    return '<div class="sx-bubble' + (line.me ? " sx-bubble--me" : "") + '">' +
      escapeHtml(line.text) +
      '<span class="sx-bubble__time">' + escapeHtml(line.time) + "</span></div>";
  }

  function initMessages() {
    var root = $("[data-sx-messages]");
    if (!root) return;

    var body = $("[data-sx-msg-body]", root);
    var form = $("[data-sx-msg-form]", root);
    var field = form && $("input", form);
    var current = null;

    var scrollDown = function () { body.scrollTop = body.scrollHeight; };

    var load = function (id) {
      var thread = THREADS[id];
      if (!thread) return;
      current = id;

      body.innerHTML = thread.lines.map(bubbleHtml).join("");
      $("[data-sx-msg-name]", root).textContent = thread.name;
      $("[data-sx-msg-status]", root).textContent = thread.status;
      $("[data-sx-msg-avatar]", root).setAttribute("src", thread.avatar);

      $$("[data-sx-thread]", root).forEach(function (b) {
        var on = b.getAttribute("data-sx-thread") === id;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-current", on ? "true" : "false");
        if (on) {
          b.classList.remove("is-unread");
          var pip = $(".sx-thread-link__pip", b);
          if (pip) pip.remove();
        }
      });

      scrollDown();
    };

    $$("[data-sx-thread]", root).forEach(function (btn) {
      btn.addEventListener("click", function () { load(btn.getAttribute("data-sx-thread")); });
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var text = field.value.trim();
        if (!text || !current) return;

        var now = new Date();
        var stamp = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");

        THREADS[current].lines.push({ me: true, text: text, time: stamp });
        body.insertAdjacentHTML("beforeend", bubbleHtml({ me: true, text: text, time: stamp }));
        field.value = "";
        scrollDown();

        var typing = el('<p class="sx-msg__typing"><span></span><span></span><span></span> ' +
          escapeHtml(THREADS[current].name.split(" ")[0]) + " is typing</p>");
        body.appendChild(typing);
        scrollDown();

        var replyingTo = current;
        window.setTimeout(function () {
          typing.remove();
          if (replyingTo !== current) return;
          var reply = { me: false, text: REPLIES[hash(text) % REPLIES.length], time: stamp };
          THREADS[replyingTo].lines.push(reply);
          body.insertAdjacentHTML("beforeend", bubbleHtml(reply));
          scrollDown();
        }, prefersReducedMotion ? 400 : 1600);
      });
    }

    var search = $("[data-sx-msg-search]", root);
    if (search) {
      search.addEventListener("input", function () {
        var q = search.value.trim().toLowerCase();
        $$("[data-sx-thread]", root).forEach(function (b) {
          b.hidden = q !== "" && b.textContent.toLowerCase().indexOf(q) === -1;
        });
      });
    }

    var first = $("[data-sx-thread]", root);
    if (first) load(first.getAttribute("data-sx-thread"));
  }


  /* 24. Settings ----------------------------------------------------------- */

  function initSettings() {
    var root = $("[data-sx-settings]");
    if (!root) return;

    $$("[data-sx-settings-nav]", root).forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var key = link.getAttribute("data-sx-settings-nav");

        $$("[data-sx-settings-nav]", root).forEach(function (l) {
          l.classList.toggle("is-active", l === link);
          l.setAttribute("aria-current", l === link ? "page" : "false");
        });

        $$("[data-sx-settings-panel]", root).forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-sx-settings-panel") !== key;
        });

        var heading = $("[data-sx-settings-panel]:not([hidden]) h2", root);
        if (heading) heading.focus();
      });
    });

    $$("[data-sx-pref]", root).forEach(function (input) {
      input.addEventListener("change", function () {
        var label = input.getAttribute("data-sx-pref");
        var on = input.type === "checkbox" ? input.checked : true;
        toast(label + (input.type === "checkbox" ? (on ? " turned on" : " turned off") : " updated"), "circle-check");
      });
    });

    /* The Theme select is a real preference, not a demo one: it drives the
       same stored value as the topbar toggle. */
    var themeSelect = $("[data-sx-theme-select]", root);
    if (themeSelect) {
      themeSelect.addEventListener("change", function () {
        Theme.set(themeSelect.value);
        toast("Theme set to " + themeSelect.options[themeSelect.selectedIndex].text.toLowerCase(),
              themeSelect.value === "dark" ? "moon" : (themeSelect.value === "light" ? "sun" : "monitor"));
      });
    }

    $$("[data-sx-settings-form]", root).forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        toast("Changes saved", "circle-check");
      });
    });
  }


  /* 25. Notifications ------------------------------------------------------ */

  function initNotifications() {
    var root = $("[data-sx-notes]");
    if (!root) return;

    var badge = $("[data-sx-note-count]");

    var recount = function () {
      var n = $$(".sx-note.is-unread", root).length;
      if (badge) {
        badge.textContent = String(n);
        badge.hidden = n === 0;
      }
    };

    root.addEventListener("click", function (e) {
      var note = e.target.closest(".sx-note");
      if (note) { note.classList.remove("is-unread"); recount(); }
    });

    var all = $("[data-sx-mark-all]");
    if (all) {
      all.addEventListener("click", function () {
        $$(".sx-note.is-unread", root).forEach(function (n) { n.classList.remove("is-unread"); });
        recount();
        toast("All notifications marked as read", "check");
      });
    }

    recount();
  }


  /* 26. Auth forms --------------------------------------------------------- */

  function fieldError(input, message) {
    input.classList.add("is-invalid");
    var slot = input.parentNode.querySelector(".invalid-feedback") ||
               input.closest(".sx-field").querySelector(".invalid-feedback");
    if (slot) slot.textContent = message;
  }

  function initAuth() {
    $$("[data-sx-pass-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = $("input", btn.parentNode);
        if (!input) return;
        var shown = input.getAttribute("type") === "text";
        input.setAttribute("type", shown ? "password" : "text");
        btn.setAttribute("aria-label", shown ? "Show password" : "Hide password");
        setIcon(btn, shown ? "eye" : "eye-off", "ic-18");
      });
    });

    $$("[data-sx-strength]").forEach(function (input) {
      var meter = $("[data-sx-strength-meter]", input.closest(".sx-field"));
      if (!meter) return;

      input.addEventListener("input", function () {
        var v = input.value;
        var score = 0;
        if (v.length >= 8) score += 1;
        if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score += 1;
        if (/\d/.test(v)) score += 1;
        if (/[^A-Za-z0-9]/.test(v)) score += 1;

        meter.className = "sx-strength is-" + score;
        var label = $("[data-sx-strength-label]", input.closest(".sx-field"));
        if (label) {
          label.textContent = ["Too short", "Weak", "Fair", "Good", "Strong"][score] || "";
        }
      });
    });

    $$("[data-sx-auth-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true;

        $$("input[required]", form).forEach(function (input) {
          input.classList.remove("is-invalid");

          if (!input.value.trim()) {
            fieldError(input, "This field cannot be empty.");
            ok = false;
            return;
          }
          if (input.type === "email" && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(input.value)) {
            fieldError(input, "Use the format name@example.com.");
            ok = false;
            return;
          }
          if (input.type === "password" && input.value.length < 8) {
            fieldError(input, "Use at least eight characters.");
            ok = false;
          }
          if (input.type === "checkbox" && !input.checked) {
            fieldError(input, "Please accept to continue.");
            ok = false;
          }
        });

        if (!ok) {
          var first = $(".is-invalid", form);
          if (first) first.focus();
          return;
        }

        var btn = $('button[type="submit"]', form);
        if (btn) { btn.disabled = true; btn.textContent = form.getAttribute("data-sx-auth-busy") || "Working…"; }
        window.setTimeout(function () {
          window.location.href = form.getAttribute("data-sx-auth-next") || "index.html";
        }, 700);
      });
    });
  }


  /* 26c. Back to top ------------------------------------------------------- */

  /** Appears once there is enough scrolled past to be worth a shortcut. The
      scroll handler is rAF-throttled so it does no layout work per event. */
  function initBackToTop() {
    var btn = $("[data-sx-totop]");
    if (!btn) return;

    var SHOW_AFTER = 600;
    var ticking = false;
    var foot = $(".sx-foot");

    function paint() {
      ticking = false;

      /* Stand down once the footer is on screen, or a fixed button parks itself
         on top of the footer links. */
      var overFoot = false;
      if (foot) overFoot = foot.getBoundingClientRect().top < window.innerHeight - 8;

      btn.classList.toggle("is-on", window.scrollY > SHOW_AFTER && !overFoot);
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(paint);
    }, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      /* Send focus somewhere sensible, or a keyboard user is left on a button
         that has just faded out from under them. */
      var skip = $(".sx-skip-link") || $("#main");
      if (skip) {
        skip.setAttribute("tabindex", "-1");
        skip.focus({ preventScroll: true });
      }
    });

    paint();
  }

  /** Wires one <input type=file> to a preview. Returns a reset function so the
      caller can put the picker back the way it started. Nothing is uploaded —
      the preview is a local object URL. */
  function bindImagePick(input, opts) {
    if (!input) return function () {};

    var url = null;
    var MAX = 8 * 1024 * 1024;

    function release() { if (url) { URL.revokeObjectURL(url); url = null; } }

    function reset() {
      release();
      input.value = "";
      if (opts.onClear) opts.onClear();
    }

    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;

      if (!/^image\//.test(file.type)) { toast("That needs to be an image", "triangle-alert"); input.value = ""; return; }
      if (file.size > MAX) { toast("Images have to be under 8 MB", "triangle-alert"); input.value = ""; return; }

      release();
      url = URL.createObjectURL(file);
      if (opts.onPick) opts.onPick(url, file);
    });

    if (opts.clearBtn) opts.clearBtn.addEventListener("click", reset);
    window.addEventListener("beforeunload", release);
    return reset;
  }

  /* 26h. Cover and picture viewer ------------------------------------------- */

  /** Opens the full-size image for anything marked data-sx-viewimage. Delegated,
      so it covers heroes that other code swaps in later. */
  function initImageViewer() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-sx-viewimage]");
      if (!btn) return;

      var img = btn.tagName === "IMG" ? btn : $("img", btn);
      if (!img) return;

      var src = img.getAttribute("src");
      if (!src) return;

      var isCover = btn.hasAttribute("data-sx-viewimage-cover");
      var alt = img.getAttribute("alt") || "";

      /* The cover img is decorative and carries no alt, so name it from the page. */
      var heading = $(".sx-hero__name, .sx-hero h1, h1");
      var who = heading ? collapse(heading.textContent) : "";

      Lightbox.openOne(src, isCover ? "Cover photo" : (alt || "Profile picture"), who);
    });
  }

  /* 26i. Post types — slider, video, audio, long text ----------------------- */

  /** Image slider. The track is a scroll-snap row, so touch swiping is native and
      the buttons only have to nudge the scroll position. */
  function initSliders() {
    $$("[data-sx-slider]").forEach(function (slider) {
      var track = $("[data-sx-slider-track]", slider);
      if (!track) return;

      var slides = $$(".sx-slider__slide", track);
      if (slides.length < 2) return;

      var count = $("[data-sx-slider-count]", slider);
      var prev = $("[data-sx-slider-nav='prev']", slider);
      var next = $("[data-sx-slider-nav='next']", slider);

      /* Dots live outside the slider so they sit under the image, not over it. */
      var dotWrap = slider.parentElement ? $("[data-sx-slider-dots]", slider.parentElement) : null;
      var dots = [];
      if (dotWrap) {
        slides.forEach(function (s, i) {
          var d = el('<button class="sx-slider__dot" type="button" tabindex="-1" aria-label="Go to image ' + (i + 1) + '"></button>');
          d.addEventListener("click", function () { go(i); });
          dotWrap.appendChild(d);
          dots.push(d);
        });
      }

      var index = 0;

      function paint() {
        if (count) count.textContent = (index + 1) + " / " + slides.length;
        dots.forEach(function (d, i) { d.classList.toggle("is-on", i === index); });
        if (prev) prev.disabled = index === 0;
        if (next) next.disabled = index === slides.length - 1;
      }

      function go(i) {
        index = Math.min(Math.max(i, 0), slides.length - 1);
        track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior: prefersReducedMotion ? "auto" : "smooth" });
        paint();
      }

      if (prev) prev.addEventListener("click", function () { go(index - 1); });
      if (next) next.addEventListener("click", function () { go(index + 1); });

      /* Keep the counter honest when someone swipes instead of clicking. */
      var ticking = false;
      track.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
          ticking = false;
          var nearest = 0, best = Infinity;
          slides.forEach(function (s, i) {
            var d = Math.abs(s.offsetLeft - track.offsetLeft - track.scrollLeft);
            if (d < best) { best = d; nearest = i; }
          });
          if (nearest !== index) { index = nearest; paint(); }
        });
      }, { passive: true });

      paint();
    });
  }

  /** Video post. The clip replaces the poster in place and starts playing — a
      feed video should never send you to another screen to watch it.

      The poster lives in a <button> so the keyboard can reach it, but a <video
      controls> cannot live inside one: nested interactive content is invalid and
      the button swallows clicks meant for the scrubber. So the button is swapped
      for a plain wrapper while it plays, and swapped back if the file is missing. */
  function initEmbeds() {
    $$("[data-sx-embed]").forEach(function (btn) { wireEmbed(btn); });
  }

  function wireEmbed(btn) {
    btn.addEventListener("click", function () {
      var src = (btn.getAttribute("data-sx-embed-src") || "").trim();

      if (!src) {
        toast("No clip attached yet — add one and set data-sx-embed-src", "film");
        return;
      }

      var img = $("img", btn);
      var poster = img ? img.getAttribute("src") : "";

      var stage = el('<div class="sx-embed is-playing"></div>');
      var media;

      if (/\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(src)) {
        media = el("<video controls autoplay playsinline preload='metadata'></video>");
        if (poster) media.setAttribute("poster", poster);
        media.setAttribute("src", src);

        media.addEventListener("error", function () {
          stage.parentNode.replaceChild(btn, stage);
          refreshIcons();
          toast("That clip would not load", "triangle-alert");
        });
      } else {
        media = el("<iframe title='Video' allow='autoplay; fullscreen' allowfullscreen></iframe>");
        media.setAttribute("src", src);
      }

      stage.appendChild(media);
      btn.parentNode.replaceChild(stage, btn);

      if (media.play) {
        var playing = media.play();
        /* Autoplay with sound is blocked in most browsers; retry muted so it still
           starts, which is what a feed video is expected to do. */
        if (playing && playing.catch) {
          playing.catch(function () { media.muted = true; media.play().catch(function () {}); });
        }
      }
    });
  }

  /** Audio post. A real file drives a real <audio>; without one the bars still
      move so the component can be seen working. */
  function initAudio() {
    $$("[data-sx-audio]").forEach(function (box) {
      var toggle = $("[data-sx-audio-toggle]", box);
      var wave = $("[data-sx-audio-wave]", box);
      var time = $("[data-sx-audio-time]", box);
      if (!toggle || !wave) return;

      /* The bar heights are a repeating pattern in the stylesheet, so the shape
         is CSS and this only has to create them. */
      var BARS = 44;
      var bars = [];
      for (var i = 0; i < BARS; i++) {
        var bar = el('<span class="sx-audio__bar"></span>');
        wave.appendChild(bar);
        bars.push(bar);
      }

      var src = box.getAttribute("data-sx-audio-src");
      var audio = src ? new Audio(src) : null;
      var total = 128;                      // 2:08, matching the label
      var at = 0;
      var timer = null;

      function clock(s) {
        var m = Math.floor(s / 60);
        var r = Math.floor(s % 60);
        return m + ":" + (r < 10 ? "0" : "") + r;
      }

      function paint() {
        var done = Math.round((at / total) * BARS);
        bars.forEach(function (b, i) { b.classList.toggle("is-played", i < done); });
        if (time) time.textContent = clock(Math.max(total - at, 0));
      }

      function stop() {
        window.clearInterval(timer);
        timer = null;
        setIcon(toggle, "play", "ic-20");
        toggle.setAttribute("aria-label", "Play the voice note");
      }

      toggle.addEventListener("click", function () {
        if (timer) {
          if (audio) audio.pause();
          stop();
          return;
        }

        if (audio) { audio.play(); total = audio.duration || total; }
        setIcon(toggle, "pause", "ic-20");
        toggle.setAttribute("aria-label", "Pause the voice note");

        timer = window.setInterval(function () {
          at = audio ? audio.currentTime : at + 1;
          if (at >= total) { at = 0; stop(); paint(); return; }
          paint();
        }, 1000);
      });

      paint();
    });
  }

  /** Long posts clamp to four lines, but only when there is genuinely more to
      read — otherwise the button would lie. */
  function initClamp() {
    $$("[data-sx-clamp]").forEach(function (text) {
      var btn = text.parentElement ? $("[data-sx-more]", text.parentElement) : null;
      if (!btn) return;

      if (text.scrollHeight <= text.clientHeight + 2) return;   // it all fits
      btn.hidden = false;

      btn.addEventListener("click", function () {
        var open = text.classList.toggle("is-open");
        btn.textContent = open ? "Show less" : "Show more";
      });
    });
  }

  /* 26g. Group settings ----------------------------------------------------- */

  /** Cover and picture behave like the create-group pickers, and the two
      destructive actions go through the shared confirm. */
  function initGroupSettings() {
    var form = $("[data-sx-groupid]");
    if (!form) return;

    var coverImg = $("[data-sx-gs-coverpreview]", form);
    var coverName = $("[data-sx-gs-covername]", form);
    var coverClear = $("[data-sx-gs-coverclear]", form);
    var coverWas = coverImg ? coverImg.getAttribute("src") : "";
    var coverHint = coverName ? coverName.textContent : "";

    bindImagePick($("[data-sx-gs-coverfile]", form), {
      clearBtn: coverClear,
      onPick: function (url, file) {
        coverImg.setAttribute("src", url);
        if (coverName) coverName.textContent = file.name;
        if (coverClear) coverClear.hidden = false;
      },
      onClear: function () {
        coverImg.setAttribute("src", coverWas);
        if (coverName) coverName.textContent = coverHint;
        if (coverClear) coverClear.hidden = true;
      }
    });

    var avatarImg = $("[data-sx-gs-avatarpreview]", form);
    var avatarName = $("[data-sx-gs-avatarname]", form);
    var avatarClear = $("[data-sx-gs-avatarclear]", form);
    var avatarWas = avatarImg ? avatarImg.getAttribute("src") : "";
    var avatarHint = avatarName ? avatarName.textContent : "";

    bindImagePick($("[data-sx-gs-avatarfile]", form), {
      clearBtn: avatarClear,
      onPick: function (url, file) {
        avatarImg.setAttribute("src", url);
        if (avatarName) avatarName.textContent = file.name;
        if (avatarClear) avatarClear.hidden = false;
      },
      onClear: function () {
        avatarImg.setAttribute("src", avatarWas);
        if (avatarName) avatarName.textContent = avatarHint;
        if (avatarClear) avatarClear.hidden = true;
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("#gs-name", form);
      toast((name && name.value.trim() ? name.value.trim() : "The group") + " was updated", "circle-check");
    });

    pickOption($("[data-sx-gs-privacy]"), "data-sx-gsprivacy", function () {});

    var close = $("[data-sx-gs-close]");
    if (close) close.addEventListener("click", function () {
      Confirm.open({
        title: "Close the group?",
        body: "Nobody will be able to post. Every thread stays readable for members, and you can " +
              "reopen it whenever you like.",
        confirm: "Close it",
        onConfirm: function () { toast("The group is closed — members can still read it", "lock"); }
      });
    });

    var del = $("[data-sx-gs-delete]");
    if (del) del.addEventListener("click", function () {
      Confirm.open({
        title: "Delete this group?",
        body: "Every post, comment and file goes with it. Members are told once. This cannot be undone.",
        confirm: "Delete for everyone",
        onConfirm: function () { toast("The group was deleted", "trash-2"); }
      });
    });
  }

  /* 26d. Add to your story ------------------------------------------------- */

  var STORY_MAX_BYTES = 30 * 1024 * 1024;

  function prettyBytes(n) {
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return Math.round(n / 1024) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }

  /** Upload form behind the "Add yours" tile. The preview is a local object URL,
      so nothing leaves the browser — swap the submit for your own upload. */
  function initAddStory() {
    var form = $("[data-sx-addstory]");
    if (!form) return;

    var kind = "media";
    var file = null;
    var objectUrl = null;

    var drop = $("[data-sx-story-drop]", form);
    var input = $("[data-sx-story-file]", form);
    var dropName = $("[data-sx-story-dropname]", form);
    var preview = $("[data-sx-story-preview]", form);
    var thumb = $("[data-sx-story-thumb]", form);
    var fileMeta = $("[data-sx-story-filemeta]", form);
    var words = $("[data-sx-story-words]", form);
    var left = $("[data-sx-story-left]", form);

    function releaseUrl() {
      if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
    }

    function clearFile() {
      releaseUrl();
      file = null;
      input.value = "";
      if (preview) preview.hidden = true;
      if (thumb) thumb.removeAttribute("src");
      if (dropName) dropName.textContent = "Choose a photo or video";
      if (drop) drop.hidden = false;
    }

    function accept(picked) {
      if (!picked) return;

      if (picked.size > STORY_MAX_BYTES) {
        toast("That file is " + prettyBytes(picked.size) + " — the limit is 30 MB", "triangle-alert");
        return;
      }
      if (!/^(image|video)\//.test(picked.type)) {
        toast("Stories take an image or a video", "triangle-alert");
        return;
      }

      releaseUrl();
      file = picked;
      objectUrl = URL.createObjectURL(picked);

      if (fileMeta) fileMeta.textContent = picked.name + " · " + prettyBytes(picked.size);

      /* A video has no still to show in an <img>, so the drop zone keeps the
         filename instead of rendering a broken preview. */
      if (/^image\//.test(picked.type) && thumb) {
        thumb.setAttribute("src", objectUrl);
        if (preview) preview.hidden = false;
        if (drop) drop.hidden = true;
      } else {
        if (preview) preview.hidden = false;
        if (thumb) thumb.removeAttribute("src");
        if (dropName) dropName.textContent = picked.name;
      }
    }

    if (input) {
      input.addEventListener("change", function () { accept(input.files && input.files[0]); });
    }

    if (drop) {
      ["dragenter", "dragover"].forEach(function (n) {
        drop.addEventListener(n, function (e) { e.preventDefault(); drop.classList.add("is-over"); });
      });
      ["dragleave", "drop"].forEach(function (n) {
        drop.addEventListener(n, function () { drop.classList.remove("is-over"); });
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        accept(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
      });
    }

    var clear = $("[data-sx-story-clear]", form);
    if (clear) clear.addEventListener("click", clearFile);

    if (words && left) {
      var max = parseInt(words.getAttribute("maxlength"), 10) || 140;
      words.addEventListener("input", function () {
        words.classList.remove("is-invalid");
        left.textContent = String(max - words.value.length);
      });
    }

    pickOption($("[data-sx-story-kind]", form), "data-sx-kind", function (value) {
      kind = value;
      $$("[data-sx-story-pane]", form).forEach(function (pane) {
        pane.hidden = pane.getAttribute("data-sx-story-pane") !== value;
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (kind === "media" && !file) {
        toast("Pick a photo or a video first", "image");
        if (input) input.focus();
        return;
      }
      if (kind === "text" && !words.value.trim()) {
        words.classList.add("is-invalid");
        words.focus();
        return;
      }

      var who = $("[data-sx-story-who]", form);
      var audience = who && who.options[who.selectedIndex] ? who.options[who.selectedIndex].text.toLowerCase() : "your followers";

      closeModalOf(form);

      clearFile();
      form.reset();
      kind = "media";
      $$("[data-sx-kind]", form).forEach(function (o, i) { o.classList.toggle("is-picked", i === 0); });
      $$("[data-sx-story-pane]", form).forEach(function (pane) {
        pane.hidden = pane.getAttribute("data-sx-story-pane") !== "media";
      });
      if (left) left.textContent = "140";

      /* Mark your own tile as having something in it. */
      var mine = $(".sx-story--add");
      if (mine) mine.classList.add("is-on");

      toast("Your story is up — visible to " + audience + " for 24 hours", "circle-check", {
        action: "View it",
        onAction: function () { window.location.href = "story.html"; }
      });
    });

    window.addEventListener("beforeunload", releaseUrl);
  }

  /* 26e. Header notification menu ------------------------------------------ */

  /** Clearing the unread state also clears the badge, so the header does not
      keep claiming there are eight unread after you have just read them. */
  function initNoteMenu() {
    var list = $("[data-sx-notemenu-list]");
    if (!list) return;

    var readAll = $("[data-sx-note-readall]");
    if (!readAll) return;

    readAll.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();            // keep the dropdown open

      var unread = $$(".sx-noteitem.is-unread", list);
      if (!unread.length) { toast("Nothing unread", "check"); return; }

      unread.forEach(function (n) { n.classList.remove("is-unread"); });

      $$("[data-sx-note-count]").forEach(function (dot) {
        dot.textContent = "0";
        dot.hidden = true;
      });

      toast(plural(unread.length, "notification") + " marked read", "check");
    });
  }

  /* 26f. Contact form ------------------------------------------------------- */

  function initContact() {
    var form = $("[data-sx-contact]");
    if (!form) return;

    var name = $("[data-sx-contact-name]", form);
    var email = $("[data-sx-contact-email]", form);
    var message = $("[data-sx-contact-message]", form);
    var left = $("[data-sx-contact-left]", form);
    var max = parseInt(message.getAttribute("maxlength"), 10) || 1200;

    [name, email, message].forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("is-invalid"); });
    });

    /* A checkbox reports "change", never "input", so it needs its own line or
       the red stays on after you tick it. */
    form.addEventListener("change", function (e) {
      if (e.target.type === "checkbox") e.target.classList.remove("is-invalid");
    });

    message.addEventListener("input", function () {
      if (left) left.textContent = String(max - message.value.length);
    });

    var consent = $("[name='consent']", form);
    var status = function (sel) { return $(sel, form); };

    function show(sel, text) {
      var box = status(sel);
      if (!box) return;
      if (text !== undefined) box.textContent = text;
      box.classList.add("d-block");
    }

    function hide(sel) {
      var box = status(sel);
      if (box) box.classList.remove("d-block");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var bad = [];
      if (!name.value.trim()) bad.push(name);
      /* A bare "is there an @" check is all the client can honestly do; the
         handler validates properly with filter_var. */
      if (!email.value.trim() || email.value.indexOf("@") < 1) bad.push(email);
      if (!message.value.trim()) bad.push(message);
      if (consent && !consent.checked) bad.push(consent);

      bad.forEach(function (f) { f.classList.add("is-invalid"); });
      if (bad.length) { bad[0].focus(); return; }

      hide(".error-message");
      hide(".sent-message");

      var action = form.getAttribute("action");
      var submit = $("button[type='submit']", form);

      /* No action means no handler to post to — say so rather than pretending
         the message went somewhere. */
      if (!action) {
        show(".error-message", "This form has no action set, so there is nowhere to send it yet.");
        return;
      }

      show(".loading");
      if (submit) submit.disabled = true;

      function done() {
        hide(".loading");
        if (submit) submit.disabled = false;
      }

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { "X-Requested-With": "XMLHttpRequest" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status + " " + res.statusText);
          return res.text();
        })
        .then(function (body) {
          done();
          if (body.trim() !== "OK") throw new Error(body.trim() || "The message was not sent.");

          form.reset();
          if (left) left.textContent = String(max);
          show(".sent-message");
          toast("Thanks — your message is on its way.", "circle-check");
        })
        ["catch"](function (err) {
          done();
          show(".error-message", err.message || String(err));
        });
    });
  }

  /* 26b. Story data -------------------------------------------------------- */

  /** Every story in the rail points at the same page, so the person is carried
      in ?u= and the viewer is built from this table before it starts. Swap the
      table for a fetch and nothing below has to change. */
  var STORY_PEOPLE = {
    nadia: {
      name: "Nadia Hart", first: "Nadia", avatar: "avatar-6", ago: "28m ago",
      slides: [
        { img: "3", alt: "A desk lamp lighting sheets of work on a studio table", cap: "06:40. Started before the inbox did." },
        { img: "5", alt: "Two thick curves drawn across baseline guides", cap: "Second pass. Spacing on a curve, dot size flat." },
        { img: "2", alt: "Sunrise over hills with a steaming mug in the foreground", cap: "Arcs redrawn so they hold at 16px." }
      ]
    },
    leo: {
      name: "Leo Fontaine", first: "Leo", avatar: "avatar-4", ago: "1h ago",
      slides: [
        { img: "6", alt: "A board and hand tools laid out on a workbench", cap: "Enclosure number four. This one closes properly." },
        { img: "9", alt: "Mist settling into a green valley at dusk under a pink sky", cap: "Walked out while the resin cured." }
      ]
    },
    mira: {
      name: "Mira Shah", first: "Mira", avatar: "avatar-5", ago: "2h ago",
      slides: [
        { img: "1", alt: "Tall buildings lit up against a violet night sky", cap: "Twelve skylines done. This is the one that sells." },
        { img: "10", alt: "A wide waterfall spilling into turquoise water below a forest", cap: "Reference hunting, two hours north." }
      ]
    },
    tomas: {
      name: "Tomas Oyelaran", first: "Tomas", avatar: "avatar-8", ago: "5h ago",
      slides: [
        { img: "8", alt: "A photographer holding a camera on a rainy street lit by traffic lights", cap: "Rain, and everyone else went home." },
        { img: "4", alt: "A path winding between green hills under a wide sky", cap: "Sunday. No camera, then obviously a camera." }
      ]
    },
    june: {
      name: "June Park", first: "June", avatar: "avatar-3", ago: "3h ago",
      slides: [
        { img: "12", alt: "A watercolour painting of an elephant among palm trees", cap: "Wet on wet, one sitting, no pencil." },
        { img: "2", alt: "Sunrise over hills with a steaming mug in the foreground", cap: "Painted before the light moved." }
      ]
    },
    ana: {
      name: "Ana Costa", first: "Ana", avatar: "avatar-1", ago: "8h ago",
      slides: [
        { img: "11", alt: "An illustrated cartoon bird wearing a cap and a backpack", cap: "Mascot pass three. He has a rucksack now." }
      ]
    },
    dev: {
      name: "Dev Iyer", first: "Dev", avatar: "avatar-2", ago: "40m ago",
      slides: [
        { img: "5", alt: "Two thick curves drawn across baseline guides", cap: "The overshoot was making people seasick." },
        { img: "3", alt: "A desk lamp lighting sheets of work on a studio table", cap: "Two of three fixed. Third one fights back." }
      ]
    }
  };

  /** Builds the viewer for whoever ?u= names. Runs before initStoryViewer,
      which snapshots the bars and slides it finds. */
  function initStoryPage() {
    var root = $("[data-sx-viewer]");
    if (!root) return;

    var id = "";
    try {
      id = new URLSearchParams(window.location.search).get("u") || "";
    } catch (e) { id = ""; }

    var person = STORY_PEOPLE[id.toLowerCase()];
    if (!person) return;                 // unknown or missing: the markup stands

    var frame = $(".sx-viewer__frame", root);
    if (!frame) return;

    var heading = $("h1", root);
    if (heading) heading.textContent = "Story by " + person.name;
    document.title = "Story — " + person.name + " · Sovix";

    var bars = $(".sx-viewer__bars", root);
    if (bars) {
      bars.innerHTML = person.slides.map(function () {
        return '<span class="sx-viewer__bar" data-sx-viewer-bar><span class="sx-viewer__fill"></span></span>';
      }).join("");
    }

    var head = $(".sx-viewer__head", root);
    if (head) {
      var headImg = $("img", head);
      if (headImg) headImg.setAttribute("src", "assets/img/avatar/" + person.avatar + ".svg");
      var strong = $(".sx-strong", head);
      if (strong) strong.textContent = person.name;
      var ago = $(".sx-meta", head);
      if (ago) ago.textContent = person.ago;
    }

    $$("[data-sx-viewer-slide]", root).forEach(function (s) { s.remove(); });

    var anchor = $("[data-sx-viewer-nav]", frame);
    person.slides.forEach(function (s, i) {
      var slide = el(
        "<div data-sx-viewer-slide" + (i === 0 ? "" : " hidden") + ">" +
          '<img src="assets/img/story/' + s.img + '.png" alt="' + escapeHtml(s.alt) + '" width="900" height="1600">' +
          '<p class="sx-viewer__caption">' + escapeHtml(s.cap) + "</p>" +
        "</div>"
      );
      frame.insertBefore(slide, anchor);
    });

    var reply = $("#story-reply", root);
    if (reply) reply.placeholder = "Reply to " + person.first;
    var replyLabel = $('label[for="story-reply"]', root);
    if (replyLabel) replyLabel.textContent = "Reply to " + person.first;
  }

  /* 27. Story viewer ------------------------------------------------------- */

  function initStoryViewer() {
    var root = $("[data-sx-viewer]");
    if (!root) return;

    var bars = $$("[data-sx-viewer-bar]", root);
    var slides = $$("[data-sx-viewer-slide]", root);
    var index = 0;
    var timer = null;

    var show = function (i) {
      index = (i + slides.length) % slides.length;

      slides.forEach(function (s, n) { s.hidden = n !== index; });
      bars.forEach(function (b, n) {
        b.classList.toggle("is-done", n < index);
        b.classList.toggle("is-live", n === index);
      });

      window.clearTimeout(timer);
      if (!prefersReducedMotion) timer = window.setTimeout(function () { show(index + 1); }, 5000);
    };

    root.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-sx-viewer-nav]");
      if (nav) show(index + (nav.getAttribute("data-sx-viewer-nav") === "next" ? 1 : -1));
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") show(index + 1);
      if (e.key === "ArrowLeft") show(index - 1);
    });

    show(0);
  }


  /* 28. Share bars, job cards & moderation queue --------------------------- */

  /** Fill widths ride a custom property so the rule itself stays in CSS. */
  function initBars() {
    var bars = $$("[data-sx-bar]");
    if (!bars.length) return;

    var paint = function () {
      bars.forEach(function (bar) {
        var pct = parseFloat(bar.getAttribute("data-sx-bar")) || 0;
        var fill = $(".sx-barrow__fill", bar) || bar;
        fill.style.setProperty("--sx-fill", Math.max(0, Math.min(pct, 100)) + "%");
      });
    };

    if (prefersReducedMotion) paint();
    else window.setTimeout(paint, 60);
  }

  function initJobs() {
    $$("[data-sx-job-save]").forEach(function (btn) {
      if (btn.dataset.sxBound === "1") return;
      btn.dataset.sxBound = "1";

      btn.addEventListener("click", function () {
        var saved = btn.getAttribute("aria-pressed") === "true";
        var title = btn.getAttribute("data-sx-job-save") || "this role";

        btn.setAttribute("aria-pressed", saved ? "false" : "true");
        btn.classList.toggle("is-on", !saved);
        setIcon(btn, saved ? "bookmark" : "bookmark-check", "ic-18");
        btn.setAttribute("aria-label", (saved ? "Save " : "Remove ") + title);

        toast(saved ? "Removed from saved jobs" : "Saved — " + title, "bookmark", {
          action: "Undo",
          onAction: function () { btn.click(); }
        });
      });
    });

    $$("[data-sx-apply]").forEach(function (btn) {
      if (btn.dataset.sxBound === "1") return;
      btn.dataset.sxBound = "1";

      btn.addEventListener("click", function () {
        Confirm.open({
          title: "Send your application?",
          body: "Sovix sends your profile, your three most recent posts and the note you wrote. You can " +
                "withdraw it any time before the team replies.",
          confirm: "Send application",
          onConfirm: function () {
            btn.disabled = true;
            btn.textContent = "Applied";
            toast("Application sent — the team replies within a week", "circle-check");
          }
        });
      });
    });
  }

  function initQueue() {
    var queue = $("[data-sx-queue]");
    if (!queue) return;

    var counter = $("[data-sx-queue-count]");

    var recount = function () {
      if (counter) counter.textContent = String($$(".sx-queue", queue).length);
    };

    queue.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-sx-review]");
      if (!btn) return;

      var row = btn.closest(".sx-queue");
      var parent = row.parentNode;
      var next = row.nextSibling;
      var verdict = btn.getAttribute("data-sx-review");

      row.remove();
      recount();

      toast(verdict === "keep" ? "Left up — the reporter was told why" : "Removed and the author was notified",
        verdict === "keep" ? "circle-check" : "circle-x", {
          action: "Undo",
          onAction: function () { parent.insertBefore(row, next); recount(); refreshIcons(); }
        });
    });

    recount();
  }


  /* 29. Group chat --------------------------------------------------------- */

  function initGroupChat() {
    var root = $("[data-sx-group]");
    if (!root) return;

    var body = $("[data-sx-group-body]", root);
    var form = $("[data-sx-group-form]", root);
    var field = form && $("input", form);
    if (!body || !form) return;

    var typing = $(".sx-msg__typing", body);
    body.scrollTop = body.scrollHeight;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = field.value.trim();
      if (!text) return;

      var now = new Date();
      var stamp = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      var marked = escapeHtml(text).replace(/@([a-z0-9_.]{2,30})/gi,
        '<span class="sx-bubble__mention">@$1</span>');

      var bubble = el('<div class="sx-bubble sx-bubble--me">' + marked +
        '<span class="sx-bubble__time">' + stamp + "</span></div>");

      if (typing) body.insertBefore(bubble, typing);
      else body.appendChild(bubble);

      field.value = "";
      body.scrollTop = body.scrollHeight;

      var mention = text.match(/@([a-z0-9_.]{2,30})/i);
      if (mention) toast("Tagged " + mention[0] + " — they get a notification", "at-sign");

      window.setTimeout(function () {
        var reply = el('<div class="sx-bubble__stack">' +
          '<span class="sx-avatar sx-avatar--sm"><img src="' + av("Ana Costa") + '" alt="Ana Costa" width="34" height="34"></span>' +
          '<div class="sx-bubble"><span class="sx-bubble__who">Ana Costa</span>' +
          escapeHtml(REPLIES[hash(text) % REPLIES.length]) +
          '<span class="sx-bubble__time">' + stamp + "</span></div></div>");
        if (typing) body.insertBefore(reply, typing);
        else body.appendChild(reply);
        body.scrollTop = body.scrollHeight;
      }, prefersReducedMotion ? 400 : 1500);
    });
  }

  function av(name) {
    var found = null;
    PEOPLE.forEach(function (p) { if (p.name === name) found = p.avatar; });
    return found || ME.avatar;
  }


  /* 30. Assistant ---------------------------------------------------------- */

  /* Canned answers. A real build would stream these from an API; the shape of
     the reply (short answer, a draft to lift, a caveat) is what matters here. */
  var AI_ANSWERS = [
    {
      match: /alt text|describe|accessib/i,
      lead: "Here is alt text for the three images on that post. Keep them under about 125 characters so screen readers do not truncate them.",
      draft: "1. A dot field fading across deep indigo, spacing widening from left to right.\n" +
             "2. The same field on a dark background, dots eight per cent smaller.\n" +
             "3. Printed comparison sheets marked up in pencil.",
      bullets: ["Describe what matters for the point you are making, not every object.",
                "Skip \u201cimage of\u201d \u2014 screen readers already announce it.",
                "If the image carries no meaning, use an empty alt instead."]
    },
    {
      match: /shorter|cut|trim|tighten|concise/i,
      lead: "Cut to about half. The second sentence was doing the work, so I led with it.",
      draft: "Density, not colour, is what made the wallpaper feel calm. Spacing grows on a curve while dot size stays flat \u2014 full breakdown in #quietinterfaces.",
      bullets: ["Removed the wind-up and the restatement at the end.",
                "Kept the hashtag so it still lands in the tag feed."]
    },
    {
      match: /hashtag|tag/i,
      lead: "Three tags that are actually active in your circle this week, rather than the biggest ones overall.",
      draft: "#quietinterfaces \u00b7 #typecrit \u00b7 #shipweekly",
      bullets: ["#quietinterfaces \u2014 312 posts today, 48 people you follow.",
                "#typecrit \u2014 smaller but the comments are better.",
                "#shipweekly \u2014 use it only if you are posting something you shipped."]
    },
    {
      match: /summar|catch me up|thread|recap/i,
      lead: "Here is the thread in four lines. Two people disagree about the fix, not the diagnosis.",
      bullets: ["Nadia: the spacing curve, not the palette, makes the field read calm.",
                "Dev: the same result came from the opposite direction on their team.",
                "June: it holds on dark backgrounds if dot size drops about eight per cent.",
                "Open question: whether it survives below 320px. Nobody has tested it."]
    },
    {
      match: /reply|respond|answer|comment/i,
      lead: "A reply that answers the question and leaves the door open, in your usual register.",
      draft: "It holds on dark backgrounds \u2014 we dropped the dot size by roughly eight per cent and left the spacing alone. Bringing the printed comparison on Thursday if you want to mark it up.",
      bullets: ["Answers the specific question first.", "Offers something concrete rather than a promise to follow up."]
    },
    {
      match: /post|draft|write/i,
      lead: "A draft in your voice \u2014 short sentences, a number early, no wind-up.",
      draft: "Cut our onboarding survey from twelve questions to four. Completion went from 31% to 78%, and the answers finally tell us something. Writing up what we removed and why.",
      bullets: ["Leads with the change and the number.",
                "Ends on what comes next so people have a reason to follow.",
                "Add an image of the four questions and it will do better in the feed."]
    }
  ];

  var AI_FALLBACK = {
    lead: "Here is how I would approach that, based on what you have posted before.",
    bullets: ["Start from the smallest version that is still true \u2014 you can always add.",
              "Say the number early if you have one; it is what people quote back.",
              "Ask me to shorten it, add alt text or suggest tags once you have a draft."]
  };

  var AI_CHATS = {
    "c-density": { title: "Alt text for the density post", when: "2m" },
    "c-survey": { title: "Shorter draft, survey results", when: "1h" },
    "c-thread": { title: "Summarise the Thursday thread", when: "Yesterday" },
    "c-tags": { title: "Which tags are worth using", when: "Mon" }
  };

  function aiAnswer(prompt) {
    for (var i = 0; i < AI_ANSWERS.length; i += 1) {
      if (AI_ANSWERS[i].match.test(prompt)) return AI_ANSWERS[i];
    }
    return AI_FALLBACK;
  }

  function turnHtml(who, body, isAi) {
    return '<div class="sx-turn' + (isAi ? " sx-turn--ai" : " sx-turn--me") + '">' +
      (isAi
        ? '<span class="sx-turn__mark sx-avatar--sm">' + icon("sparkles", "ic-18") + "</span>"
        : '<span class="sx-avatar sx-avatar--sm"><img src="' + ME.avatar + '" alt="" width="34" height="34"></span>') +
      '<div class="sx-turn__body">' +
        '<span class="sx-turn__who">' + escapeHtml(who) + "</span>" +
        '<div data-sx-turn-content>' + body + "</div>" +
        (isAi
          ? '<div class="sx-turn__actions">' +
              '<button class="sx-iconbtn sx-iconbtn--sm" type="button" data-sx-ai="copy" aria-label="Copy this answer">' +
                icon("copy", "ic-16") + "</button>" +
              '<button class="sx-iconbtn sx-iconbtn--sm" type="button" data-sx-ai="redo" aria-label="Try again">' +
                icon("rotate-ccw", "ic-16") + "</button>" +
              '<button class="sx-iconbtn sx-iconbtn--sm" type="button" data-sx-ai="up" aria-pressed="false" aria-label="Helpful">' +
                icon("thumbs-up", "ic-16") + "</button>" +
              '<button class="sx-iconbtn sx-iconbtn--sm" type="button" data-sx-ai="down" aria-pressed="false" aria-label="Not helpful">' +
                icon("thumbs-down", "ic-16") + "</button>" +
              '<button class="sx-iconbtn sx-iconbtn--sm" type="button" data-sx-ai="use" aria-label="Use this in a post">' +
                icon("square-pen", "ic-16") + "</button>" +
            "</div>"
          : "") +
      "</div></div>";
  }

  function answerHtml(a) {
    return "<p>" + escapeHtml(a.lead) + "</p>" +
      (a.draft ? '<p class="sx-turn__draft">' + escapeHtml(a.draft).replace(/\n/g, "<br>") + "</p>" : "") +
      (a.bullets ? "<ul>" + a.bullets.map(function (b) {
        return "<li>" + escapeHtml(b) + "</li>";
      }).join("") + "</ul>" : "");
  }

  function initAssistant() {
    var root = $("[data-sx-ai]");
    if (!root) return;

    var stream = $("[data-sx-ai-stream]", root);
    var inner = $("[data-sx-ai-inner]", root);
    var empty = $("[data-sx-ai-empty]", root);
    var form = $("[data-sx-ai-form]", root);
    var field = $("[data-sx-ai-field]", root);
    var send = $("[data-sx-ai-send]", root);
    var stop = $("[data-sx-ai-stop]", root);
    var timer = null;
    var busy = false;

    var scrollDown = function () { stream.scrollTop = stream.scrollHeight; };

    var grow = function () {
      field.style.setProperty("--sx-prompt-h", "auto");
      field.style.setProperty("--sx-prompt-h", Math.min(field.scrollHeight, 192) + "px");
    };

    var setBusy = function (on) {
      busy = on;
      if (send) send.hidden = on;
      if (stop) stop.hidden = !on;
    };

    /** Reveal the answer a few words at a time, the way a stream arrives. */
    var type = function (node, html, done) {
      if (prefersReducedMotion) { node.innerHTML = html; done(); return; }

      var words = html.split(" ");
      var at = 0;
      setBusy(true);

      timer = window.setInterval(function () {
        at += 3;
        node.innerHTML = words.slice(0, at).join(" ") + '<span class="sx-caret"></span>';
        scrollDown();
        if (at >= words.length) {
          window.clearInterval(timer);
          timer = null;
          node.innerHTML = html;
          setBusy(false);
          done();
        }
      }, 42);
    };

    var ask = function (prompt) {
      if (busy || !prompt) return;
      if (empty) empty.hidden = true;

      inner.insertAdjacentHTML("beforeend", turnHtml(ME.name, "<p>" + linkify(prompt) + "</p>", false));
      inner.insertAdjacentHTML("beforeend", turnHtml("Sovix assistant", "", true));

      var turns = $$(".sx-turn--ai", inner);
      var target = $("[data-sx-turn-content]", turns[turns.length - 1]);
      target.setAttribute("data-sx-prompt", prompt);

      refreshIcons();
      scrollDown();

      window.setTimeout(function () {
        type(target, answerHtml(aiAnswer(prompt)), function () { refreshIcons(); scrollDown(); });
      }, prefersReducedMotion ? 0 : 320);
    };

    field.addEventListener("input", grow);

    field.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = field.value.trim();
      if (!text) return;
      field.value = "";
      grow();
      ask(text);
    });

    if (stop) {
      stop.addEventListener("click", function () {
        if (!timer) return;
        window.clearInterval(timer);
        timer = null;
        var caret = $(".sx-caret", inner);
        if (caret) caret.remove();
        setBusy(false);
        toast("Stopped generating", "circle-x");
      });
    }

    root.addEventListener("click", function (e) {
      var starter = e.target.closest("[data-sx-ai-starter]");
      if (starter) { ask(starter.getAttribute("data-sx-ai-starter")); return; }

      var chip = e.target.closest("[data-sx-ai-suggest]");
      if (chip) { ask(chip.getAttribute("data-sx-ai-suggest")); return; }

      var fresh = e.target.closest("[data-sx-ai-new]");
      if (fresh) {
        inner.innerHTML = "";
        if (empty) empty.hidden = false;
        $$("[data-sx-ai-chat]", root).forEach(function (b) { b.classList.remove("is-active"); });
        field.focus();
        return;
      }

      var chat = e.target.closest("[data-sx-ai-chat]");
      if (chat) {
        $$("[data-sx-ai-chat]", root).forEach(function (b) { b.classList.toggle("is-active", b === chat); });
        inner.innerHTML = "";
        if (empty) empty.hidden = true;
        var meta = AI_CHATS[chat.getAttribute("data-sx-ai-chat")];
        ask(meta ? meta.title : chat.textContent.trim());
        return;
      }

      var act = e.target.closest("[data-sx-ai]");
      if (!act) return;

      var turn = act.closest(".sx-turn");
      var content = $("[data-sx-turn-content]", turn);
      var kind = act.getAttribute("data-sx-ai");

      if (kind === "copy") { copyText(content.textContent.trim()); toast("Answer copied", "copy"); }

      if (kind === "redo") {
        var prompt = content.getAttribute("data-sx-prompt") || "";
        content.innerHTML = "";
        type(content, answerHtml(aiAnswer(prompt)), function () { refreshIcons(); });
      }

      if (kind === "up" || kind === "down") {
        var on = act.getAttribute("aria-pressed") === "true";
        $$("[data-sx-ai='up'], [data-sx-ai='down']", turn).forEach(function (b) {
          b.setAttribute("aria-pressed", "false");
          b.classList.remove("is-on");
        });
        if (!on) { act.setAttribute("aria-pressed", "true"); act.classList.add("is-on"); }
        toast(on ? "Feedback removed" : "Thanks — that helps us tune it", "circle-check");
      }

      if (kind === "use") {
        var draft = $(".sx-turn__draft", turn);
        closeDropdowns();
        CP.open({ mode: "create", text: (draft || content).textContent.trim() });
      }
    });

    grow();
  }


  /* 31. AI tools ----------------------------------------------------------- */

  var TOOL_OUTPUT = {
    draft: { lead: "Draft from your last three posts, in your usual register.",
             draft: "Cut our onboarding survey from twelve questions to four. Completion went from 31% to 78%, and the answers finally tell us something." },
    alt: { lead: "Alt text for the images on your latest post.",
           draft: "A dot field fading across deep indigo, spacing widening from left to right." },
    reply: { lead: "A reply to Dev's comment that answers the question directly.",
             draft: "It holds on dark backgrounds \u2014 dot size down about eight per cent, spacing untouched." },
    summary: { lead: "The Thursday thread in four lines.",
               bullets: ["Nadia: spacing curve, not palette.", "Dev: same finding, opposite route.",
                         "June: holds on dark at \u22128% dot size.", "Untested below 320px."] },
    tags: { lead: "Tags that are active in your circle right now.", draft: "#quietinterfaces \u00b7 #typecrit \u00b7 #shipweekly" },
    tone: { lead: "Same point, warmer, without losing the number.",
            draft: "We were nervous about cutting eight questions. Completion went 31% to 78%, so it was the right call." }
  };

  function initAiTools() {
    var grid = $("[data-sx-tools]");
    if (!grid) return;

    grid.addEventListener("click", function (e) {
      var run = e.target.closest("[data-sx-tool]");
      if (run) {
        var card = run.closest(".sx-toolcard");
        var out = $("[data-sx-tool-out]", card);
        var body = $(".sx-tool-out__body", out);
        var data = TOOL_OUTPUT[run.getAttribute("data-sx-tool")] || AI_FALLBACK;

        run.disabled = true;
        run.textContent = "Working\u2026";
        body.innerHTML = "";
        out.hidden = false;

        window.setTimeout(function () {
          body.innerHTML = answerHtml(data);
          run.disabled = false;
          run.textContent = "Run again";
          refreshIcons();
        }, prefersReducedMotion ? 100 : 750);
        return;
      }

      var copy = e.target.closest("[data-sx-tool-copy]");
      if (copy) {
        copyText($(".sx-tool-out__body", copy.closest(".sx-toolcard")).textContent.trim());
        toast("Copied", "copy");
        return;
      }

      var use = e.target.closest("[data-sx-tool-use]");
      if (use) {
        var text = $(".sx-turn__draft", use.closest(".sx-toolcard"));
        CP.open({ mode: "create", text: text ? text.textContent.trim() : "" });
      }
    });
  }

  /* Boot -------------------------------------------------------------------- */


  /* 31b. Jobs — post a role, and apply ------------------------------------- */

  /** Picks one option in an .sx-optionlist and reports the chosen value. */
  function pickOption(list, attr, onPick) {
    if (!list) return;
    list.addEventListener("click", function (e) {
      var opt = e.target.closest("[" + attr + "]");
      if (!opt) return;
      $$("[" + attr + "]", list).forEach(function (o) {
        o.classList.toggle("is-picked", o === opt);
      });
      onPick(opt.getAttribute(attr));
    });
  }

  function closeModalOf(node) {
    var modal = node.closest(".modal");
    var instance = modal && window.bootstrap && bootstrap.Modal.getInstance(modal);
    if (instance) instance.hide();
  }

  /** Post a role. Title, team and the description are what make a card usable,
      so those three are the only blocking fields. */
  function initPostRole() {
    var form = $("[data-sx-newjob]");
    if (!form) return;

    var route = "profile";
    var linkWrap = $("[data-sx-newjob-linkwrap]", form);

    pickOption($("[data-sx-newjob-route]", form), "data-sx-route", function (value) {
      route = value;
      if (linkWrap) linkWrap.hidden = value !== "link";
    });

    var required = [
      $("[data-sx-newjob-title]", form),
      $("[data-sx-newjob-team]", form),
      $("[data-sx-newjob-about]", form)
    ];

    required.forEach(function (field) {
      field.addEventListener("input", function () { field.classList.remove("is-invalid"); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var missing = required.filter(function (f) { return !f.value.trim(); });
      missing.forEach(function (f) { f.classList.add("is-invalid"); });
      if (missing.length) { missing[0].focus(); return; }

      var title = required[0].value.trim();
      var team = required[1].value.trim();

      closeModalOf(form);
      form.reset();
      if (linkWrap) linkWrap.hidden = true;
      $$("[data-sx-route]", form).forEach(function (o, i) { o.classList.toggle("is-picked", i === 0); });
      route = "profile";

      toast(
        title + " at " + team + " is live" + (route === "link" ? " — applicants go to your link" : ""),
        "briefcase",
        { action: "See it", onAction: function () { window.location.href = "job.html"; } }
      );
    });
  }

  /** Apply to a role. The note is the part a hiring team actually reads, so it
      is the one field that blocks sending. */
  function initApplyForm() {
    var form = $("[data-sx-applyform]");
    if (!form) return;

    var note = $("[data-sx-apply-note]", form);
    var left = $("[data-sx-apply-left]", form);
    var max = parseInt(note.getAttribute("maxlength"), 10) || 600;

    note.addEventListener("input", function () {
      note.classList.remove("is-invalid");
      if (left) left.textContent = String(max - note.value.length);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!note.value.trim()) {
        note.classList.add("is-invalid");
        note.focus();
        return;
      }

      closeModalOf(form);

      var btn = $("[data-sx-apply-open]");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Applied";
      }

      form.reset();
      if (left) left.textContent = String(max);

      toast("Application sent — the team replies within a week", "circle-check");
    });
  }

  /* 31c. Events — create, edit, duplicate, cancel --------------------------- */

  var MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  /** One form serves create and edit; editing carries the card it came from so
      the same submit can patch that card in place instead of appending a new one. */
  function initEventForm() {
    var form = $("[data-sx-eventform]");
    if (!form) return;

    var editing = null;
    var format = "online";

    var heading = $("[data-sx-ef-heading]", form);
    var sub = $("[data-sx-ef-sub]", form);
    var submit = $("[data-sx-ef-submit]", form);
    var title = $("[data-sx-ef-title]", form);
    var date = $("[data-sx-ef-date]", form);
    var time = $("[data-sx-ef-time]", form);
    var where = $("[data-sx-ef-where]", form);
    var whereLabel = $("[data-sx-ef-wherelabel]", form);
    var about = $("[data-sx-ef-about]", form);

    function setFormat(value) {
      format = value;
      $$("[data-sx-format]", form).forEach(function (o) {
        o.classList.toggle("is-picked", o.getAttribute("data-sx-format") === value);
      });
      if (whereLabel) whereLabel.textContent = value === "online" ? "Joining link" : "Address";
      if (where) where.placeholder = value === "online"
        ? "https://meet.example.com/critique"
        : "West Loop, Chicago";
    }

    pickOption($("[data-sx-ef-format]", form), "data-sx-format", setFormat);

    [title, date].forEach(function (f) {
      f.addEventListener("input", function () { f.classList.remove("is-invalid"); });
    });

    function reset() {
      editing = null;
      form.reset();
      setFormat("online");
      title.classList.remove("is-invalid");
      date.classList.remove("is-invalid");
      if (heading) heading.textContent = "Create event";
      if (sub) sub.textContent = "People who follow your spaces see this in their feed.";
      if (submit) submit.textContent = "Create event";
    }

    $$("[data-sx-event-new]").forEach(function (btn) {
      btn.addEventListener("click", reset);
    });

    /* Edit: read the card back into the form. */
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-sx-event-edit]");
      if (!trigger) return;

      var card = trigger.closest("[data-sx-event-card]");
      if (!card) return;

      editing = card;
      title.value = ($(".sx-event__title", card).textContent || "").trim();
      var body = $(".sx-event__ident .sx-meta", card);
      about.value = body ? body.textContent.trim() : "";
      setFormat(card.getAttribute("data-sx-format") || "online");

      if (heading) heading.textContent = "Edit event";
      if (sub) sub.textContent = "Everyone who has RSVPed is told what changed.";
      if (submit) submit.textContent = "Save changes";

      var modal = document.getElementById("sxEventForm");
      if (window.bootstrap) bootstrap.Modal.getOrCreateInstance(modal).show();
    });

    /* Duplicate: same details, nothing scheduled yet. */
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-sx-event-copy]");
      if (!trigger) return;

      var card = trigger.closest("[data-sx-event-card]");
      if (!card) return;

      reset();
      title.value = ($(".sx-event__title", card).textContent || "").trim() + " (copy)";

      var modal = document.getElementById("sxEventForm");
      if (window.bootstrap) bootstrap.Modal.getOrCreateInstance(modal).show();
    });

    /* Cancel: destructive, so it goes through the shared confirm. */
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-sx-event-delete]");
      if (!trigger) return;

      var card = trigger.closest("[data-sx-event-card]");
      if (!card) return;

      var name = ($(".sx-event__title", card).textContent || "this event").trim();

      Confirm.open({
        title: "Cancel " + name + "?",
        body: "Everyone who said they were going is told, and the event stops showing in feeds. " +
              "This cannot be undone.",
        confirm: "Cancel event",
        onConfirm: function () {
          card.remove();
          toast(name + " was cancelled", "calendar-x");
        }
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var bad = [];
      if (!title.value.trim()) bad.push(title);
      if (!date.value) bad.push(date);
      bad.forEach(function (f) { f.classList.add("is-invalid"); });
      if (bad.length) { bad[0].focus(); return; }

      var name = title.value.trim();
      var when = new Date(date.value + "T00:00:00");
      var wasEditing = editing;

      if (wasEditing) {
        $(".sx-event__title", wasEditing).textContent = name;
        var body = $(".sx-event__ident .sx-meta", wasEditing);
        if (body && about.value.trim()) body.textContent = about.value.trim();
        wasEditing.setAttribute("data-sx-format", format);
        $(".sx-event__month", wasEditing).textContent = MONTHS[when.getMonth()];
        $(".sx-event__day", wasEditing).textContent = String(when.getDate()).padStart(2, "0");
      }

      closeModalOf(form);
      reset();

      toast(
        wasEditing ? name + " was updated — everyone going has been told" : name + " is on the calendar",
        wasEditing ? "calendar-check" : "calendar-plus"
      );
    });

    setFormat("online");
  }

  /* 31d. To do ------------------------------------------------------------- */

  /** Checklist tied to the groups you are in. Ticking a task moves it visually
      but leaves it in place, so the list never jumps under the pointer. */
  function initTodo() {
    var page = $("[data-sx-todo-add]");
    if (!page) return;

    var field = $("[data-sx-todo-field]");
    var when = $("[data-sx-todo-when]");
    var doneOut = $("[data-sx-todo-done]");
    var allOut = $("[data-sx-todo-all]");
    var seq = 100;

    function recount() {
      var items = $$("[data-sx-todo-item]");
      var done = items.filter(function (li) { return li.classList.contains("is-done"); });
      if (doneOut) doneOut.textContent = String(done.length);
      if (allOut) allOut.textContent = String(items.length);

      $$("[data-sx-tab-btn-count]").forEach(function (n) { n.textContent = String(items.length - done.length); });

      /* A section with nothing left in it should not sit there as an empty header. */
      $$("[data-sx-todo-group]").forEach(function (section) {
        var list = $("[data-sx-todo-list]", section);
        section.hidden = !list || $$("[data-sx-todo-item]", list).length === 0;
      });
    }

    document.addEventListener("change", function (e) {
      var box = e.target.closest("[data-sx-todo-check]");
      if (!box) return;
      var item = box.closest("[data-sx-todo-item]");
      if (item) item.classList.toggle("is-done", box.checked);
      recount();
    });

    document.addEventListener("click", function (e) {
      var kill = e.target.closest("[data-sx-todo-remove]");
      if (!kill) return;
      var item = kill.closest("[data-sx-todo-item]");
      if (!item) return;
      var name = ($(".sx-todo__title", item).textContent || "Task").trim();
      item.remove();
      recount();
      toast(name + " removed", "check");
    });

    page.addEventListener("submit", function (e) {
      e.preventDefault();

      var text = (field.value || "").trim();
      if (!text) { field.classList.add("is-invalid"); field.focus(); return; }
      field.classList.remove("is-invalid");

      var bucket = when.value;
      var list = $("[data-sx-todo-list='" + bucket + "']");
      if (!list) return;

      seq++;
      var id = "t-" + seq;
      list.appendChild(el(
        '<li class="sx-todo" data-sx-todo-item>' +
          '<input class="form-check-input" type="checkbox" id="' + id + '" data-sx-todo-check>' +
          '<label class="sx-todo__body" for="' + id + '">' +
            '<span class="sx-todo__title">' + escapeHtml(text) + "</span>" +
          "</label>" +
          '<button class="sx-iconbtn sx-iconbtn--sm sx-iconbtn--plain" type="button" data-sx-todo-remove aria-label="Remove task">' +
            icon("x", "ic-16") +
          "</button>" +
        "</li>"
      ));

      field.value = "";
      recount();
      field.focus();
    });

    field.addEventListener("input", function () { field.classList.remove("is-invalid"); });

    recount();
  }

  /* 31e. Calendar ---------------------------------------------------------- */

  var CAL_MONTHS = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

  /* The template is dated so the demo month has something in it. In a real app
     this is just new Date(). */
  var CAL_TODAY = new Date(2026, 8, 9);

  /** What is on, keyed YYYY-M-D with a calendar month, so 9 is September. The
      lookup adds one to the Date month rather than making whoever edits this
      table think in zero-based months. */
  var CAL_ON = {
    "2026-8-12": [{ k: "event", t: "Summer open studio" }],
    "2026-8-27": [{ k: "birthday", t: "Dev Iyer" }],
    "2026-9-4":  [{ k: "event", t: "Critique night" }],
    "2026-9-7":  [{ k: "birthday", t: "Mira Shah" }],
    "2026-9-9":  [{ k: "session", t: "Small Runs Club" }, { k: "event", t: "Office hours" }],
    "2026-9-11": [{ k: "event", t: "Soft tooling" }],
    "2026-9-15": [{ k: "session", t: "Thursday Critique" }],
    "2026-9-18": [{ k: "birthday", t: "Leo Fontaine" }],
    "2026-9-22": [{ k: "event", t: "Type crit" }],
    "2026-9-24": [{ k: "session", t: "Design Ops call" }],
    "2026-9-29": [{ k: "event", t: "Portfolio night" }],
    "2026-10-2":  [{ k: "session", t: "Small Runs Club" }],
    "2026-10-6":  [{ k: "event", t: "October critique" }],
    "2026-10-14": [{ k: "birthday", t: "Ana Costa" }],
    "2026-10-20": [{ k: "session", t: "Thursday Critique" }]
  };

  var CAL_KIND = { event: "Event", session: "Group session", birthday: "Birthday" };

  function initCalendar() {
    var grid = $("[data-sx-cal-grid]");
    if (!grid) return;

    var monthOut = $("[data-sx-cal-month]");
    var view = new Date(CAL_TODAY.getFullYear(), CAL_TODAY.getMonth(), 1);

    function sameDay(a, b) {
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function render() {
      var year = view.getFullYear();
      var month = view.getMonth();

      if (monthOut) monthOut.textContent = CAL_MONTHS[month] + " " + year;

      var lead = (new Date(year, month, 1).getDay() + 6) % 7;   // weeks start Monday
      var days = new Date(year, month + 1, 0).getDate();
      var prevDays = new Date(year, month, 0).getDate();

      var html = "";

      for (var i = lead; i > 0; i--) {
        html += '<div class="sx-cal__day is-muted"><span class="sx-cal__num">' + (prevDays - i + 1) + "</span></div>";
      }

      for (var d = 1; d <= days; d++) {
        var on = CAL_ON[year + "-" + (month + 1) + "-" + d] || [];
        var isToday = sameDay(new Date(year, month, d), CAL_TODAY);

        var chips = on.map(function (e) {
          return '<span class="sx-cal__chip sx-cal__chip--' + e.k + '">' + escapeHtml(e.t) + "</span>";
        }).join("");

        /* Screen readers get the day and what is on it in one go, rather than a
           bare number followed by loose chip text. */
        var label = d + " " + CAL_MONTHS[month] +
          (on.length ? ", " + on.map(function (e) { return CAL_KIND[e.k] + ": " + e.t; }).join(", ") : "");

        html += '<div class="sx-cal__day' + (isToday ? " is-today" : "") + '"' +
          (isToday ? ' aria-current="date"' : "") + ' role="group" aria-label="' + escapeHtml(label) + '">' +
          '<span class="sx-cal__num">' + d + "</span>" +
          (chips ? '<span class="sx-cal__chips">' + chips + "</span>" : "") +
          "</div>";
      }

      var trail = 1;
      while ((lead + days + trail - 1) % 7 !== 0) {
        html += '<div class="sx-cal__day is-muted"><span class="sx-cal__num">' + trail + "</span></div>";
        trail++;
      }

      grid.innerHTML = html;
    }

    document.addEventListener("click", function (e) {
      var step = e.target.closest("[data-sx-cal-step]");
      if (step) {
        view.setMonth(view.getMonth() + (parseInt(step.getAttribute("data-sx-cal-step"), 10) || 0));
        render();
        return;
      }

      if (e.target.closest("[data-sx-cal-today]")) {
        view = new Date(CAL_TODAY.getFullYear(), CAL_TODAY.getMonth(), 1);
        render();
      }
    });

    render();
  }

  /* 32c. Product — write a review ------------------------------------------ */

  var RATE_WORDS = { 1: "Not for me", 2: "Some use", 3: "Fine", 4: "Good", 5: "Excellent" };

  /** The form is closed until asked for, so the reviews stay readable. */
  function initReviewForm() {
    var form = $("[data-sx-reviewform]");
    if (!form) return;

    var open = $("[data-sx-review-open]");
    var cancel = $("[data-sx-review-cancel]", form);
    var body = $("[data-sx-review-body]", form);
    var say = $("[data-sx-rate-say]", form);
    var error = $("[data-sx-rate-error]", form);
    var list = $("[data-sx-review-list]");

    function rating() {
      var picked = $("[data-sx-rate-input]:checked", form);
      return picked ? parseInt(picked.value, 10) : 0;
    }

    function show(on) {
      form.hidden = !on;
      if (open) open.hidden = on;
      if (on) {
        var first = $("[data-sx-rate-input]", form);
        if (first) first.focus();
      }
    }

    if (open) open.addEventListener("click", function () { show(true); });
    if (cancel) cancel.addEventListener("click", function () {
      form.reset();
      if (say) say.textContent = "Pick a rating";
      if (error) error.hidden = true;
      body.classList.remove("is-invalid");
      show(false);
      if (open) open.focus();
    });

    form.addEventListener("change", function (e) {
      if (!e.target.closest("[data-sx-rate-input]")) return;
      var n = rating();
      if (say) say.textContent = n ? n + " — " + RATE_WORDS[n] : "Pick a rating";
      if (error) error.hidden = true;
    });

    body.addEventListener("input", function () { body.classList.remove("is-invalid"); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var stars = rating();
      var text = body.value.trim();

      if (!stars) {
        if (error) error.hidden = false;
        var first = $("[data-sx-rate-input]", form);
        if (first) first.focus();
        return;
      }
      if (!text) {
        body.classList.add("is-invalid");
        body.focus();
        return;
      }

      var starRow = "";
      for (var i = 0; i < stars; i++) starRow += icon("star", "ic-14");

      if (list) {
        var review = el(
          '<div class="sx-review">' +
            '<span class="sx-avatar sx-avatar--sm">' +
              '<img src="assets/img/avatar/avatar-9.png" alt="Ravi Menon" width="34" height="34">' +
            "</span>" +
            '<div class="sx-review__body">' +
              '<div class="sx-review__head">' +
                '<a class="sx-name" href="profile.html">Ravi Menon</a>' +
                '<span class="sx-stars">' + starRow +
                  '<span class="sx-stars__count">' + stars + " (verified buyer)</span></span>" +
                '<span class="sx-meta">Just now</span>' +
              "</div>" +
              "<p>" + escapeHtml(text) + "</p>" +
            "</div>" +
          "</div>"
        );
        list.insertBefore(review, list.firstChild);
        if (window.lucide) lucide.createIcons({ nameAttr: "data-lucide" });
      }

      form.reset();
      if (say) say.textContent = "Pick a rating";
      if (error) error.hidden = true;
      show(false);

      toast("Thanks — your review is live", "circle-check");
    });
  }

  /* 32b. Create a group ---------------------------------------------------- */

  /** Two step wizard. Step 1 has the only required field, so Next validates it
      rather than letting someone reach step 2 with an unnamed group. */
  function initNewGroup() {
    var form = $("[data-sx-newgroup]");
    if (!form) return;

    var step = 1;
    var privacy = "public";

    var sub = $("[data-sx-newgroup-sub]", form);
    var back = $("[data-sx-newgroup-back]", form);
    var next = $("[data-sx-newgroup-next]", form);
    var submit = $("[data-sx-newgroup-submit]", form);
    var nameField = $("[data-sx-newgroup-name]", form);

    var SUBS = {
      1: "Step 1 of 2 · What the group is",
      2: "Step 2 of 2 · Who can join and post"
    };

    function paint() {
      $$("[data-sx-newgroup-pane]", form).forEach(function (pane) {
        pane.hidden = pane.getAttribute("data-sx-newgroup-pane") !== String(step);
      });

      $$(".sx-wizard__step", form).forEach(function (li, i) {
        li.classList.toggle("is-on", i < step);
      });

      if (sub) sub.textContent = SUBS[step];
      back.hidden = step === 1;
      next.hidden = step === 2;
      submit.hidden = step !== 2;
    }

    next.addEventListener("click", function () {
      if (!nameField.value.trim()) {
        nameField.classList.add("is-invalid");
        nameField.focus();
        return;
      }
      nameField.classList.remove("is-invalid");
      step = 2;
      paint();
    });

    back.addEventListener("click", function () {
      step = 1;
      paint();
    });

    nameField.addEventListener("input", function () {
      nameField.classList.remove("is-invalid");
    });

    /* Cover: a picked file becomes a fifth swatch and selects itself. */
    var ownOpt = $("[data-sx-ng-coverown]", form);
    var ownRadio = $("[data-sx-ng-coverown-radio]", form);
    var coverImg = $("[data-sx-ng-coverpreview]", form);
    var coverName = $("[data-sx-ng-covername]", form);
    var coverClear = $("[data-sx-ng-coverclear]", form);
    var coverHint = coverName ? coverName.textContent : "";

    var resetCover = bindImagePick($("[data-sx-ng-coverfile]", form), {
      clearBtn: coverClear,
      onPick: function (url, file) {
        coverImg.setAttribute("src", url);
        ownOpt.hidden = false;
        ownRadio.checked = true;
        if (coverName) coverName.textContent = file.name;
        if (coverClear) coverClear.hidden = false;
      },
      onClear: function () {
        coverImg.removeAttribute("src");
        ownOpt.hidden = true;
        var first = $("[name='ng-cover']", form);
        if (first) first.checked = true;
        if (coverName) coverName.textContent = coverHint;
        if (coverClear) coverClear.hidden = true;
      }
    });

    /* Group picture. */
    var avatarImg = $("[data-sx-ng-avatarpreview]", form);
    var avatarName = $("[data-sx-ng-avatarname]", form);
    var avatarClear = $("[data-sx-ng-avatarclear]", form);
    var avatarSrc = avatarImg ? avatarImg.getAttribute("src") : "";
    var avatarHint = avatarName ? avatarName.textContent : "";

    var resetAvatar = bindImagePick($("[data-sx-ng-avatarfile]", form), {
      clearBtn: avatarClear,
      onPick: function (url, file) {
        avatarImg.setAttribute("src", url);
        if (avatarName) avatarName.textContent = file.name;
        if (avatarClear) avatarClear.hidden = false;
      },
      onClear: function () {
        avatarImg.setAttribute("src", avatarSrc);
        if (avatarName) avatarName.textContent = avatarHint;
        if (avatarClear) avatarClear.hidden = true;
      }
    });

    var list = $("[data-sx-newgroup-privacy]", form);
    if (list) {
      list.addEventListener("click", function (e) {
        var opt = e.target.closest("[data-sx-privacy]");
        if (!opt) return;
        privacy = opt.getAttribute("data-sx-privacy");
        $$("[data-sx-privacy]", list).forEach(function (o) {
          o.classList.toggle("is-picked", o === opt);
        });
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = nameField.value.trim();
      var chosen = privacy;   // read before the reset below clears it
      var invited = ($("[data-sx-newgroup-invite]", form).value || "")
        .split(",").map(function (s) { return s.trim(); }).filter(Boolean);

      var modal = form.closest(".modal");
      var instance = window.bootstrap && bootstrap.Modal.getInstance(modal);
      if (instance) instance.hide();

      form.reset();
      resetCover();
      resetAvatar();
      step = 1;
      privacy = "public";
      $$("[data-sx-privacy]", form).forEach(function (o, i) {
        o.classList.toggle("is-picked", i === 0);
      });
      paint();

      toast(
        name + " is live as a " + chosen + " group" +
          (invited.length ? " · " + plural(invited.length, "invite") + " sent" : ""),
        "users",
        { action: "Open it", onAction: function () { window.location.href = "group.html"; } }
      );
    });

    paint();
  }

  /* 32. Store — cart, product and checkout --------------------------------- */

  var CART_KEY_ORDER = ["subtotal", "discount", "tax", "total"];

  function money(n) {
    return "$" + n.toFixed(2);
  }

  /** Cart state lives in memory for the session — swap for your own backend. */
  var Cart = {
    lines: [],
    promo: null,

    owns: false,

    read: function () {
      this.lines = $$("[data-sx-line]").map(function (row) {
        return {
          el: row,
          price: parseFloat(row.getAttribute("data-sx-price")) || 0,
          qty: parseInt(row.getAttribute("data-sx-line-qty"), 10) || 1
        };
      });
    },

    count: function () {
      var n = 0;
      this.lines.forEach(function (l) { n += l.qty; });
      return n;
    },

    totals: function () {
      var subtotal = 0;
      this.lines.forEach(function (l) { subtotal += l.price * l.qty; });
      var discount = this.promo ? subtotal * this.promo.rate : 0;
      var tax = (subtotal - discount) * 0.2;
      return { subtotal: subtotal, discount: discount, tax: tax, total: subtotal - discount + tax };
    },

    paint: function () {
      var t = this.totals();

      CART_KEY_ORDER.forEach(function (key) {
        $$("[data-sx-total='" + key + "']").forEach(function (node) {
          node.textContent = (key === "discount" && t.discount > 0 ? "−" : "") + money(t[key]);
        });
      });

      var discountRow = $("[data-sx-discount-row]");
      if (discountRow) discountRow.hidden = !this.promo;

      var label = $("[data-sx-promo-label]");
      if (label && this.promo) label.textContent = this.promo.code;

      /* Only a page that owns the cart lines may rewrite the badge — elsewhere
         the number in the markup stands. */
      if (this.owns) {
        $$("[data-sx-cart-count]").forEach(function (node) {
          var n = Cart.count();
          node.textContent = String(n);
          node.hidden = n === 0;
        });
      }

      $$("[data-sx-cart-items]").forEach(function (node) {
        node.textContent = plural(Cart.count(), "item");
      });

      var empty = $("[data-sx-cart-empty]");
      if (empty) empty.hidden = this.lines.length > 0;
      var body = $("[data-sx-cart-body]");
      if (body) body.hidden = this.lines.length === 0;
    },

    init: function () {
      var page = $("[data-sx-cart]");
      this.owns = this.lines.length > 0 || !!page;
      this.read();
      this.owns = this.lines.length > 0;
      this.paint();
      if (!page) return;
      var self = this;

      page.addEventListener("click", function (e) {
        var step = e.target.closest("button[data-sx-qty]");
        var drop = e.target.closest("[data-sx-remove-line]");
        var promo = e.target.closest("[data-sx-promo-go]");

        if (step) {
          var row = step.closest("[data-sx-line]");
          var qty = parseInt(row.getAttribute("data-sx-line-qty"), 10) || 1;
          qty = Math.max(1, Math.min(qty + (step.getAttribute("data-sx-qty") === "up" ? 1 : -1), 9));
          row.setAttribute("data-sx-line-qty", String(qty));
          $("[data-sx-qty-num]", row).textContent = String(qty);
          $("[data-sx-line-total]", row).textContent =
            money((parseFloat(row.getAttribute("data-sx-price")) || 0) * qty);
          self.read();
          self.paint();
          return;
        }

        if (drop) {
          var line = drop.closest("[data-sx-line]");
          var parent = line.parentNode;
          var next = line.nextSibling;
          line.remove();
          self.read();
          self.paint();
          toast("Removed from your cart", "circle-check", {
            action: "Undo",
            onAction: function () {
              parent.insertBefore(line, next);
              self.read();
              self.paint();
              refreshIcons();
            }
          });
          return;
        }

        if (promo) {
          var field = $("[data-sx-promo]", page);
          var code = (field.value || "").trim().toUpperCase();
          if (!code) return;
          if (code === "SOVIX10") {
            self.promo = { code: code, rate: 0.1 };
            self.paint();
            toast("SOVIX10 applied — 10% off", "circle-check");
          } else {
            self.promo = null;
            self.paint();
            toast("That code is not valid", "circle-alert");
          }
          field.value = "";
        }
      });

      page.addEventListener("change", function (e) {
        var pick = e.target.closest("[data-sx-line-licence]");
        if (!pick) return;
        var row = pick.closest("[data-sx-line]");
        var price = parseFloat(pick.value) || 0;
        row.setAttribute("data-sx-price", String(price));
        var qty = parseInt(row.getAttribute("data-sx-line-qty"), 10) || 1;
        $("[data-sx-line-total]", row).textContent = money(price * qty);
        self.read();
        self.paint();
        toast("Licence updated", "circle-check");
      });
    }
  };

  /** Product page: gallery, licence picker, add to cart. */
  function initProduct() {
    var page = $("[data-sx-product]");
    if (!page) return;

    var stage = $("[data-sx-pdp-stage]", page);
    var priceOut = $("[data-sx-pdp-price]", page);

    page.addEventListener("click", function (e) {
      var thumb = e.target.closest("[data-sx-pdp-thumb]");
      if (thumb) {
        var img = $("img", thumb);
        stage.setAttribute("src", img.getAttribute("src"));
        stage.setAttribute("alt", img.getAttribute("alt"));
        $$("[data-sx-pdp-thumb]", page).forEach(function (t) { t.classList.toggle("is-active", t === thumb); });
        return;
      }

      var lic = e.target.closest("[data-sx-licence]");
      if (lic) {
        $$("[data-sx-licence]", page).forEach(function (o) {
          o.classList.toggle("is-picked", o === lic);
          o.setAttribute("aria-pressed", o === lic ? "true" : "false");
        });
        if (priceOut) priceOut.textContent = money(parseFloat(lic.getAttribute("data-sx-licence")) || 0);
        return;
      }
    });
  }

  /** Header mini cart: mirrors what the badge counts so the dropdown is never a
      stale list. Price and artwork are read off the card that was clicked. */
  function paintMiniCart() {
    $$("[data-sx-minicart-list]").forEach(function (list) {
      var lines = $$("[data-sx-minicart-line]", list);
      var sum = 0;
      lines.forEach(function (l) { sum += parseFloat(l.getAttribute("data-sx-minicart-price")) || 0; });

      var wrap = list.closest(".sx-minicart");
      if (!wrap) return;

      var empty = $("[data-sx-minicart-empty]", wrap);
      if (empty) empty.hidden = lines.length > 0;
      list.hidden = lines.length === 0;

      var total = $("[data-sx-minicart-total]", wrap);
      if (total) total.textContent = money(sum);
    });
  }

  function addToMiniCart(btn, name) {
    var card = btn.closest(".sx-product, .sx-panel") || document;
    var priceEl = $(".sx-price", card);
    var price = priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, "")) || 0 : 0;
    var art = $("img", card);
    var src = art ? art.getAttribute("src") : "assets/img/post/post_21.png";

    $$("[data-sx-minicart-list]").forEach(function (list) {
      list.appendChild(el(
        '<li class="sx-minicart__row" data-sx-minicart-line data-sx-minicart-price="' + price + '">' +
          '<img src="' + escapeHtml(src) + '" alt="" width="44" height="33">' +
          '<span class="sx-minicart__ident">' +
            '<span class="sx-minicart__title">' + escapeHtml(name) + '</span>' +
            '<span class="sx-meta">Personal licence</span>' +
          '</span>' +
          '<span class="sx-minicart__price">' + money(price) + '</span>' +
        '</li>'
      ));
    });

    paintMiniCart();
  }

  /** Add to cart works from the grid and the product page alike. */
  function initAddToCart() {
    paintMiniCart();

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-sx-add]");
      if (!btn) return;
      e.preventDefault();

      var name = btn.getAttribute("data-sx-add") || "That item";
      var bumped = false;

      $$("[data-sx-cart-count]").forEach(function (node) {
        node.textContent = String((parseInt(node.textContent, 10) || 0) + 1);
        node.hidden = false;
        bumped = true;
      });

      addToMiniCart(btn, name);

      btn.classList.add("is-on");
      setIcon(btn, "check", "ic-16");

      toast(name + " added to your cart", "shopping-bag", {
        action: "View cart",
        onAction: function () { window.location.href = "cart.html"; }
      });

      if (!bumped) return;
    });
  }

  /** Checkout: payment method, validation, and the hand-off to the receipt. */
  function initCheckout() {
    var page = $("[data-sx-checkout]");
    if (!page) return;

    page.addEventListener("click", function (e) {
      var pay = e.target.closest("[data-sx-pay]");
      if (!pay) return;

      $$("[data-sx-pay]", page).forEach(function (o) {
        o.classList.toggle("is-picked", o === pay);
        o.setAttribute("aria-pressed", o === pay ? "true" : "false");
      });

      var kind = pay.getAttribute("data-sx-pay");
      $$("[data-sx-payfields]", page).forEach(function (block) {
        block.hidden = block.getAttribute("data-sx-payfields") !== kind;
      });
    });

    var form = $("[data-sx-checkout-form]", page);
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;

      $$("input[required], select[required]", form).forEach(function (input) {
        if (input.closest("[hidden]")) return;
        input.classList.remove("is-invalid");
        if (!input.value.trim()) { fieldError(input, "This field cannot be empty."); ok = false; return; }
        if (input.type === "email" && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(input.value)) {
          fieldError(input, "Use the format name@example.com.");
          ok = false;
        }
      });

      if (!ok) {
        var first = $(".is-invalid", form);
        if (first) first.focus();
        toast("Check the highlighted fields", "circle-alert");
        return;
      }

      var btn = $('button[type="submit"]', form);
      if (btn) { btn.disabled = true; btn.textContent = "Placing order…"; }
      window.setTimeout(function () { window.location.href = "order-confirmation.html"; }, 800);
    });
  }

  /** Download buttons on the receipt and library pages. */
  function initDownloads() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-sx-download]");
      if (!btn) return;
      e.preventDefault();

      var label = btn.getAttribute("data-sx-download") || "your files";
      btn.disabled = true;
      var was = btn.textContent;
      btn.textContent = "Preparing…";

      window.setTimeout(function () {
        btn.disabled = false;
        btn.textContent = was;
        toast("Download started — " + label, "download");
      }, prefersReducedMotion ? 150 : 650);
    });
  }


  /* 33. AI creations & studio ---------------------------------------------- */

  /* Paths are relative to assets/img/ and are built by hand below, so they are
     not caught by a search for the full path — keep them in step with the
     files on disk. */
  var STUDIO_ART = {
    image: ["art-bloom.png", "art-flow.html", "art-rings.html", "art-shards.html",
            "art-wave.html", "art-terrain.html", "post/post_10.html", "post/post_17.png"],
    video: ["art-wave.png", "art-flow.html", "art-rings.html", "art-terrain.png"],
    text: []
  };

  var STUDIO_TEXT = [
    "Density, not colour, is what makes a screen feel calm — the spacing curve does the work people credit to the palette.",
    "Four questions beat twelve. Completion went 31% to 78% and the answers finally tell us something.",
    "If one element moves, the whole screen is loud. Design the still version first.",
    "Name things for what they do. Six fewer words in the docs, one fewer meeting a week."
  ];

  function initCreations() {
    document.addEventListener("click", function (e) {
      var copy = e.target.closest("[data-sx-copy-prompt]");
      if (copy) {
        e.preventDefault();
        copyText(copy.getAttribute("data-sx-copy-prompt") || copy.textContent.trim());
        toast("Prompt copied", "copy");
        return;
      }

      var remix = e.target.closest("[data-sx-remix]");
      if (remix) {
        e.preventDefault();
        var prompt = remix.getAttribute("data-sx-remix") || "";
        var field = $("[data-sx-studio-field]");
        if (field) {
          field.value = prompt;
          field.focus();
          field.scrollIntoView({ block: "center", behavior: prefersReducedMotion ? "auto" : "smooth" });
          toast("Prompt loaded — change it and generate", "wand-sparkles");
        } else {
          window.location.href = "create.html";
        }
      }
    });
  }

  function initStudio() {
    var studio = $("[data-sx-studio]");
    if (!studio) return;

    var field = $("[data-sx-studio-field]", studio);
    var results = $("[data-sx-results]", studio);
    var publish = $("[data-sx-publish]", studio);
    var kind = "image";
    var picked = null;

    var setPublish = function () {
      if (publish) publish.disabled = !picked;
    };

    studio.addEventListener("click", function (e) {
      var type = e.target.closest("[data-sx-studio-type]");
      if (type) {
        kind = type.getAttribute("data-sx-studio-type");
        $$("[data-sx-studio-type]", studio).forEach(function (b) {
          b.classList.toggle("is-on", b === type);
          b.setAttribute("aria-pressed", b === type ? "true" : "false");
        });
        results.innerHTML = "";
        picked = null;
        setPublish();
        return;
      }

      var pick = e.target.closest("[data-sx-result]");
      if (pick) {
        $$("[data-sx-result]", results).forEach(function (r) { r.classList.toggle("is-picked", r === pick); });
        picked = pick;
        setPublish();
        return;
      }

      if (e.target.closest("[data-sx-generate]")) {
        var prompt = (field.value || "").trim();
        if (!prompt) { field.focus(); toast("Describe what you want first", "circle-alert"); return; }

        var count = parseInt(($("[data-sx-studio-count]", studio) || {}).value, 10) || 4;
        var go = e.target.closest("[data-sx-generate]");
        picked = null;
        setPublish();

        go.disabled = true;
        go.textContent = "Generating…";
        results.innerHTML = new Array(count + 1).join('<div class="sx-skel"></div>');

        window.setTimeout(function () {
          if (kind === "text") {
            results.innerHTML = STUDIO_TEXT.slice(0, count).map(function (t, i) {
              return '<button class="sx-starter" type="button" data-sx-result data-sx-text="' +
                escapeHtml(t) + '">Draft ' + (i + 1) + "<span>" + escapeHtml(t) + "</span></button>";
            }).join("");
          } else {
            var art = STUDIO_ART[kind];
            results.innerHTML = art.slice(0, count).map(function (src, i) {
              return '<button class="sx-result" type="button" data-sx-result aria-label="Result ' + (i + 1) + '">' +
                '<img src="assets/img/' + src + '" alt="Generated result ' + (i + 1) + '">' +
                '<span class="sx-result__tick">' + icon("check", "ic-16") + "</span></button>";
            }).join("");
          }

          go.disabled = false;
          go.textContent = "Generate";
          refreshIcons();
          toast(count + " results — pick one to publish", "sparkles");
        }, prefersReducedMotion ? 200 : 1100);
      }
    });

    if (publish) {
      publish.addEventListener("click", function () {
        if (!picked) return;
        var prompt = (field.value || "").trim();
        var text = picked.getAttribute("data-sx-text");
        CP.open({
          mode: "create",
          text: (text ? text + "\n\n" : "") + "Made with the Sovix assistant. Prompt: " + prompt
        });
        toast("Posts from the studio are labelled as AI-made automatically", "sparkles");
      });
    }

    setPublish();
  }



  var booted = false;

  function boot() {
    /* Guarded: binding twice would double every handler. */
    if (booted) return;
    booted = true;

    refreshIcons();
    Theme.init();
    initTopbar();
    initSearchShortcut();
    initSearchToggle();
    initStories();

    enhanceAll();
    wireReplyForms();
    wireFollow();

    Reactors.init();
    CP.init();
    Share.init();
    Report.init();
    Confirm.init();
    Audience.init();
    Lightbox.init();

    initTabs();
    initBars();
    initJobs();
    initQueue();
    initMessages();
    initGroupChat();
    initAssistant();
    initAiTools();
    Cart.init();
    initProduct();
    initAddToCart();
    initNewGroup();
    initReviewForm();
    initPostRole();
    initApplyForm();
    initEventForm();
    initTodo();
    initCalendar();
    initCheckout();
    initDownloads();
    initCreations();
    initStudio();
    initSettings();
    initNotifications();
    initAuth();
    initBackToTop();
    initNoteMenu();
    initContact();
    initGroupSettings();
    initImageViewer();
    initSliders();
    initEmbeds();
    initAudio();
    initClamp();
    initStoryPage();
    initAddStory();
    initStoryViewer();
    initFeedFilter();
    initPagination();
    initJumpPill();
    initTooltips();
    initRouter();

    document.body.classList.add("is-ready");
  }

  /* Works whether the script is loaded in the head, deferred, or injected
     after the document has already parsed. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
}());
