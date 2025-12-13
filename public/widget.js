const container = document.getElementById("ttmn-widget");

container.innerHTML = `
  <div class="ttmn-box">
    <h3>Talk To Me Nice</h3>
    <textarea id="ttmn-input" placeholder="Type your message..."></textarea>
    <button id="ttmn-send">Send</button>
    <div id="ttmn-response"></div>
  </div>
`;

document.getElementById("ttmn-send").addEventListener("click", async () => {
  const input = document.getElementById("ttmn-input");
  const responseBox = document.getElementById("ttmn-response");

  const message = input.value.trim();
  if (!message) return;

  responseBox.innerHTML = "Thinking…";

  try {
    const res = await fetch(`${window.TTMN_API_BASE}/ttmn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    responseBox.innerText = data.reply || "No response.";
  } catch (err) {
    responseBox.innerText = "Connection error.";
  }
});
