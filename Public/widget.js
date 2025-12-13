(() => {
  // Prevent double-inject
  if (window.__TTMN_WIDGET_LOADED__) return;
  window.__TTMN_WIDGET_LOADED__ = true;

  const DEFAULTS = {
    apiBase: "https://ttmn-backend.onrender.com",
    title: "TTMN Buddy Bot",
    position: "right", // right | left
  };

  // Read config from script tag: <script data-ttmn-api="..." data-ttmn-title="...">
  const scriptTag = document.currentScript || [...document.scripts].slice(-1)[0];
  const apiBase = (scriptTag?.dataset?.ttmnApi || DEFAULTS.apiBase).replace(/\/$/, "");
  const title = scriptTag?.dataset?.ttmnTitle || DEFAULTS.title;
  const position = scriptTag?.dataset?.ttmnPosition || DEFAULTS.position;

  // Inject CSS
  const cssHref = `${apiBase}/widget.css`;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = cssHref;
  document.head.appendChild(link);

  // Build UI
  const root = document.createElement("div");
  root.className = `ttmn-root ttmn-${position}`;
  root.innerHTML = `
    <button class="ttmn-fab" aria-label="Open TTMN chat">💬</button>
    <div class="ttmn-panel" aria-hidden="true">
      <div class="ttmn-header">
        <div class="ttmn-title">${escapeHtml(title)}</div>
        <button class="ttmn-close" aria-label="Close">✕</button>
      </div>
      <div class="ttmn-body" id="ttmnBody"></div>
      <form class="ttmn-form" id="ttmnForm">
        <input class="ttmn-input" id="ttmnInput" placeholder="Type your message…" autocomplete="off" />
        <button class="ttmn-send" type="submit">Send</button>
      </form>
      <div class="ttmn-footnote">Powered by TTMN</div>
    </div>
  `;
  document.body.appendChild(root);

  const fab = root.querySelector(".ttmn-fab");
  const panel = root.querySelector(".ttmn-panel");
  const closeBtn = root.querySelector(".ttmn-close");
  const form = root.querySelector("#ttmnForm");
  const input = root.querySelector("#ttmnInput");
  const body = root.querySelector("#ttmnBody");

  let open = false;
  const toggle = (state) => {
    open = typeof state === "boolean" ? state : !open;
    panel.setAttribute("aria-hidden", String(!open));
    panel.classList.toggle("ttmn-open", open);
    if (open) setTimeout(() => input.focus(), 0);
  };

  fab.addEventListener("click", () => toggle(true));
  closeBtn.addEventListener("click", () => toggle(false));

  // First greeting
  addBubble("assistant", "Hey — I’m TTMN Buddy Bot. What do you need help saying today?");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = (input.value || "").trim();
    if (!text) return;

    addBubble("user", text);
    input.value = "";

    const thinkingId = addBubble("assistant", "…", true);

    try {
      const r = await fetch(`${apiBase}/ttmn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await r.json();
      const reply = data?.reply || "No response.";
      updateBubble(thinkingId, reply);
    } catch (err) {
      updateBubble(thinkingId, "Quick hiccup on my end. Try again in a moment.");
    }
  });

  function addBubble(role, text, isTemp = false) {
    const el = document.createElement("div");
    el.className = `ttmn-bubble ttmn-${role}`;
    el.textContent = text;
    if (isTemp) el.dataset.temp = "1";
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function updateBubble(bubbleEl, text) {
    bubbleEl.textContent = text;
    delete bubbleEl.dataset.temp;
    body.scrollTop = body.scrollHeight;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
