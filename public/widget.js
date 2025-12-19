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

  sendBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    try {
      console.log("SEND CLICKED, MESSAGE:", text);
      console.log("FETCHING /ttmn…");

      const res = await fetch("https://ttmn.ybybcollection.com/ttmn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      console.log("BOT RESPONSE:", data);

      // 🔥 THIS WAS MISSING
      addMessage(data.reply || "…", "bot");

    } catch (err) {
      addMessage("⚠️ Unable to reach assistant.", "bot");
      console.error(err);
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });
})();
