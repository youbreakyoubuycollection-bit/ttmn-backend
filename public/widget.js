(function () {
  if (window.TTMN_WIDGET_LOADED) return;
  window.TTMN_WIDGET_LOADED = true;

  // READ BUYER DATA
  const CLIENT_ID =
    document.currentScript.getAttribute("data-client");

  const LICENSE_KEY =
    document.currentScript.getAttribute("data-license");

  // CREATE CONTAINER
  const container = document.createElement("div");
  container.id = "ttmn-widget";
  document.body.appendChild(container);

  // LOAD WIDGET UI
  const iframe = document.createElement("iframe");
  iframe.src =
    `https://ttmn-backend.onrender.com/widget.html?client=${CLIENT_ID || "demo"}&license=${LICENSE_KEY || ""}`;

  iframe.style = `
    width: 350px;
    height: 500px;
    border: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
  `;

  container.appendChild(iframe);
})();
