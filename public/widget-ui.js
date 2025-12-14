document.getElementById("ttmn-send").addEventListener("click", () => {
  const input = document.getElementById("ttmn-input");
  const responseBox = document.getElementById("ttmn-response");

  if (!input.value.trim()) {
    responseBox.innerText = "Please enter a message.";
    return;
  }

  responseBox.innerText =
    "TTMN is connected. API setup will be completed during onboarding.";
});
