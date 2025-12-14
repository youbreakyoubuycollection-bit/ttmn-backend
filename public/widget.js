(function () {
  if (window.TTMN_WIDGET_LOADED) return;
  window.TTMN_WIDGET_LOADED = true;

  const container = document.createElement("div");
  container.id = "ttmn-widget";
  document.body.appendChild(container);

  const iframe = document.createElement("iframe");
  iframe.src = "https://ttmn-backend.onrender.com";
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
