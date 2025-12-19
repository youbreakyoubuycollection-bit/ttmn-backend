(function () {
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

  sendBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    try {
      const res = await fetch("/ttmn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      addMessage(data.reply || "…", "bot");

    } catch (err) {
      addMessage("⚠️ Unable to reach assistant.", "bot");
      console.error(err);
    }
  });

  // Optional: Enter key support
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });
})();
