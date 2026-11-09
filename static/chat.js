// chat.js – what happens in the browser

const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");
const cat = document.getElementById("cat");
const button = form.querySelector("button");
const lessonSelect = document.getElementById("lesson");

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
// 4. Ask William: send the lesson and the conversation, show his answer
async function askWilliam() {
  drawCat("think");
  button.disabled = true;

  let reply;
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson: Number(lessonSelect.value), messages: history }),
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
}

// 5. When you press Send
form.addEventListener("submit", async (event) => {
  event.preventDefault();          // stop the browser from reloading the page
  const text = input.value.trim();
  if (!text || button.disabled) return;

  input.value = "";
  addMessage("me", text);
  history.push({ role: "user", content: text });
  await askWilliam();
});


// 6. The lesson card: everything new in this lesson, built from the course file
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function showCard(lesson) {
  const card = el("section", "card");
  card.appendChild(el("h2", "", `Lesson ${lesson.id} · ${lesson.title_zh}`));
  card.appendChild(el("p", "subtitle", lesson.title_en));

  if (lesson.grammar.length) {
    const goals = lesson.grammar.map((g) => g.name).join(" · ");
    card.appendChild(el("p", "goals", "You'll learn: " + goals));
  }

  card.appendChild(el("h3", "", "New words"));
  const table = el("table", "words");
  for (const w of lesson.words.concat(lesson.proper_nouns)) {
    const row = el("tr");
    row.appendChild(el("td", "zh", w.zh));
    row.appendChild(el("td", "py", w.pinyin));
    row.appendChild(el("td", "en", w.en));
    table.appendChild(row);
  }
  card.appendChild(table);

  card.appendChild(el("h3", "", "Grammar"));
  for (const g of lesson.grammar) {
    const box = el("div", "grammar");
    box.appendChild(el("p", "g-name", g.name));
    box.appendChild(el("p", "g-pattern", g.pattern));
    const ex = g.examples[0];
    box.appendChild(el("p", "g-example", `${ex.zh}  ${ex.pinyin}  –  ${ex.en}`));
    card.appendChild(box);
  }

  chat.appendChild(card);
}

// 7. Lessons: fill the menu, start the chosen lesson
async function startLesson() {
  chat.innerHTML = "";             // clear the screen
  history.length = 0;              // forget the old conversation
  localStorage.setItem("lesson", lessonSelect.value);
  const response = await fetch(`/api/lessons/${lessonSelect.value}`);
  showCard(await response.json()); // the handout first...
  await askWilliam();              // ...then William opens the lesson
  chat.scrollTop = 0;              // start reading at the top of the card
}

lessonSelect.addEventListener("change", startLesson);
loadLessons();