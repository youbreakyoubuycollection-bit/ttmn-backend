document.addEventListener("DOMContentLoaded", () => {
  const messages = document.getElementById("ttmn-messages");
  const input = document.getElementById("ttmn-text");
  const sendBtn = document.getElementById("ttmn-send");

  function addMessage(text, sender = "user") {
    const msg = document.createElement("div");
    msg.className = sender === "user" ? "ttmn-user" : "ttmn-bot";
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    // Placeholder bot response (NO AI YET)
    setTimeout(() => {
      addMessage(
        "Thanks for your message! Talk To Me Nice is loading its magic ✨",
        "bot"
      );
    }, 600);
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendBtn.click();
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("ttmn-send");
  const input = document.getElementById("ttmn-text");
  const messages = document.getElementById("ttmn-messages");

  if (!sendBtn || !input || !messages) return;

  function addMessage(text, type = "user") {
    const div = document.createElement("div");
    div.className = type === "user" ? "ttmn-user" : "ttmn-bot";
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  sendBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    addMessage("Thinking…", "bot");

    try {
      const res = await fetch("/ttmn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();

      // Remove "Thinking…"
      messages.lastChild.remove();

      addMessage(data.reply || "No response yet.", "bot");
    } catch (err) {
      messages.lastChild.remove();
      addMessage(
        "I’m having trouble responding right now. Please try again shortly.",
        "bot"
      );
    }
  });
});
