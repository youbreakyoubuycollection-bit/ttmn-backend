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
