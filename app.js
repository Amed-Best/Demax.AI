
import {
  pipeline,
  TextStreamer
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

const question = document.getElementById("question");
const chat = document.getElementById("chat");
const status = document.getElementById("status");
const sendButton = document.getElementById("sendButton");

const SYSTEM_PROMPT = `
Kamu adalah DEMAX.AI dengan karakter GOD MODE.

KARAKTER:
- Gaul, pintar, santai, dan menyenangkan.
- Bisa serius ketika dibutuhkan.
- Gunakan bahasa Indonesia yang natural.
- Punya humor secukupnya.

ATURAN:
- Jawab dengan jelas dan akurat.
- Jangan mengarang fakta.
- Akui jika tidak tahu.
- Berikan penjelasan yang mudah dipahami.
- Pahami konteks percakapan sebelumnya.

Namamu DEMAX.AI.
`;

let generatorPromise = null;
let history = [];

try {
  history = JSON.parse(
    localStorage.getItem("demax_history") || "[]"
  );
} catch {
  history = [];
}

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = "message " + type;
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
  return message;
}

function saveHistory() {
  try {
    localStorage.setItem(
      "demax_history",
      JSON.stringify(history.slice(-12))
    );
  } catch (error) {
    console.warn("Riwayat ny ga kesimpan, wkwk.", error);
  }
}

async function loadAI() {
  if (!generatorPromise) {
    generatorPromise = pipeline(
      "text-generation",
      "onnx-community/Qwen2.5-0.5B-Instruct",
      { dtype: "q4" }
    );
  }

  return generatorPromise;
}

async function sendMessage() {
  const text = question.value.trim();

  if (!text || sendButton.disabled) return;

  addMessage(text, "user");
  question.value = "";
  sendButton.disabled = true;

  const answer = addMessage("", "ai");

  try {
    status.textContent = "si paling jago lagi otw neh..";

    const generator = await loadAI();

    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      ...history.slice(-6),
      {
        role: "user",
        content: text
      }
    ];

    status.textContent = "Bentar, mikir....";

    const streamer = new TextStreamer(
      generator.tokenizer,
      {
        skip_prompt: true,
        skip_special_tokens: true,

        callback_function: (token) => {
          answer.textContent += token;
          chat.scrollTop = chat.scrollHeight;
        }
      }
    );

    const result = await generator(messages, {
      max_new_tokens: 80,
      do_sample: false,
      streamer
    });

    const generated = result[0].generated_text;
    const last = Array.isArray(generated)
      ? generated[generated.length - 1]
      : null;

    if (!answer.textContent.trim()) {
      answer.textContent =
        last?.content || "Ga mau jawaab.., wle..";
    }

    history.push(
      { role: "user", content: text },
      { role: "assistant", content: answer.textContent }
    );

    history = history.slice(-12);
    saveHistory();

    status.textContent = "neeh, god modenya elu. wkwk..";

  } catch (error) {
    console.error("error cok..:", error);

    answer.textContent =
      "Mesin AI mengalami kendala. Coba muat ulang halaman.";

    status.textContent = "bentar, ad yg salah nih..";
    generatorPromise = null;

  } finally {
    sendButton.disabled = false;
  }
}

sendButton.addEventListener("click", sendMessage);

question.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
  
