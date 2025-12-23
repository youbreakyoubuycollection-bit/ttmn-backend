(async function () {
  const sendBtn = document.getElementById("ttmn-send");
  const input = document.getElementById("ttmn-text");
  const messages = document.getElementById("ttmn-messages");

  if (!sendBtn || !input || !messages) {
    console.error("TTMN widget elements missing");
    return;
  }

  function addMessage(text, type = "user") {
    const div = document.createElement("div");
    div.className = type === "user" ? "ttmn-user" : "ttmn-bot";
    div.innerText = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    try {
      const res = await fetch("https://ttmn.ybybcollection.com/ttmn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      addMessage(data.reply || "…", "bot");

    } catch (err) {
      console.error(err);
      addMessage("⚠️ Unable to reach assistant.", "bot");
    }
  }

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
