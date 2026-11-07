// chat.js – what happens in the browser

const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const cat = document.getElementById("cat");
const button = form.querySelector("button");

// 1. Draw William
const EYES = { normal: "o   o", happy: "^   ^", think: "-   o" };

function drawCat(mood) {
  cat.textContent = [
    "    /\\_____/\\",
    `   /  ${EYES[mood]}  \\`,
    "  ( ==  ^  == )",
    "   )         (     (",
    "  (           )     )",
    " ( (  )   (  ) )   /",
    "(__(__)___(__)__)_/",
  ].join("\n");
}

drawCat("normal");

// 2. Put a message on the screen
function addMessage(who, text) {
  const div = document.createElement("div");
  div.className = "msg " + who;   // "msg me" or "msg william"
  div.textContent = text;         // textContent, never innerHTML: typed text can't break the page
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// 3. The conversation so far. The model remembers nothing, so we send all of it every time.
const history = [];

// 4. When you press Send
form.addEventListener("submit", async (event) => {
  event.preventDefault();          // stop the browser from reloading the page
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  addMessage("me", text);
  history.push({ role: "user", content: text });

  drawCat("think");
  button.disabled = true;

  let reply;
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await response.json();
    reply = data.reply;
  } catch (error) {
    reply = "Miau... the server isn't answering. Is it running?";
  }

  history.push({ role: "assistant", content: reply });
  addMessage("william", reply);
  drawCat("happy");
  setTimeout(() => drawCat("normal"), 1500);
  button.disabled = false;
  input.focus();
});

// 5. William says hello first
addMessage("william", "你好 (nǐ hǎo)! I'm William. What would you like to learn today?");