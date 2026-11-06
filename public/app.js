const chatForm = document.querySelector("#chatForm");
const messageInput = document.querySelector("#messageInput");
const messagesEl = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const sendButton = document.querySelector("#sendButton");
const newChatButton = document.querySelector("#newChat");
const clearChatButton = document.querySelector("#clearChat");

let messages = [];
try {
  const saved = JSON.parse(localStorage.getItem("ns-ai-chat") || "[]");
  if (Array.isArray(saved)) {
    messages = saved.filter(m =>
      m && ["user", "assistant"].includes(m.role) &&
      typeof m.content === "string"
    ).slice(-12);
  }
} catch {
  messages = [];
}

function saveChat() {
  // Keep only a small recent conversation in this browser.
  localStorage.setItem("ns-ai-chat", JSON.stringify(messages.slice(-12)));
}

function showWelcome() {
  welcome.hidden = messages.length > 0;
}

function addMessage(role, content, extraClass = "") {
  const row = document.createElement("article");
  row.className = `message ${role} ${extraClass}`.trim();

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "You" : "✦";

  const body = document.createElement("div");
  body.className = "message-body";

  const name = document.createElement("span");
  name.className = "message-name";
  name.textContent = role === "user" ? "You" : "NS AI";

  const text = document.createElement("div");
  // textContent prevents model output from being interpreted as HTML.
  text.textContent = content;

  body.append(name, text);
  row.append(avatar, body);
  messagesEl.append(row);
  row.scrollIntoView({ block: "end", behavior: "smooth" });
  return row;
}

function render() {
  messagesEl.replaceChildren();
  showWelcome();
  for (const message of messages) addMessage(message.role, message.content);
}

async function sendMessage(rawText) {
  const content = rawText.trim();
  if (!content || sendButton.disabled) return;

  messages.push({ role: "user", content });
  messages = messages.slice(-12);
  saveChat();
  showWelcome();
  addMessage("user", content);

  messageInput.value = "";
  messageInput.style.height = "auto";
  sendButton.disabled = true;
  sendButton.textContent = "…";
  const thinking = addMessage("assistant", "NS AI is thinking…");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The request failed.");

    thinking.remove();
    messages.push({ role: "assistant", content: data.reply });
    messages = messages.slice(-12);
    saveChat();
    addMessage("assistant", data.reply);
  } catch (error) {
    thinking.remove();
    addMessage("assistant", error.message || "Something went wrong.", "error");
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "↑";
    messageInput.focus();
  }
}

chatForm.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(messageInput.value);
});

messageInput.addEventListener("input", () => {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 150)}px`;
});

messageInput.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

function clearConversation() {
  messages = [];
  saveChat();
  render();
  messageInput.focus();
}

newChatButton.addEventListener("click", clearConversation);
clearChatButton.addEventListener("click", clearConversation);

document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt || ""));
});

render();
