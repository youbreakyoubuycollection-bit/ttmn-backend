(function () {
  if (window.TTMN_WIDGET_LOADED) return;
  window.TTMN_WIDGET_LOADED = true;

  const script = document.currentScript;

  const CLIENT_ID = script?.getAttribute("data-client") || "demo";
  const LICENSE_KEY = script?.getAttribute("data-license") || "";

  // container
  const container = document.createElement("div");
  container.id = "ttmn-widget";
  document.body.appendChild(container);

  // iframe into your hosted widget.html
  const iframe = document.createElement("iframe");
  iframe.src = `https://ttmn.ybybcollection.com/widget.html?client=${encodeURIComponent(
    CLIENT_ID
  )}&license=${encodeURIComponent(LICENSE_KEY)}`;

  iframe.style.cssText = `
    width: 350px;
    height: 500px;
    border: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    background: transparent;
  `;

  container.appendChild(iframe);
})();
