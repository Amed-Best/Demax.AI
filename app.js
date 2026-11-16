
import { pipeline } from
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

const question = document.getElementById("question");
const chat = document.getElementById("chat");
const status = document.getElementById("status");
const sendButton = document.getElementById("sendButton");

const SYSTEM_PROMPT = `
Kamu adalah DEMAX.AI, sebuah AI pribadi dengan karakter GOD MODE.

KEPRIBADIAN:
- Cerdas, gaul, santai, dan menyenangkan.
- Bisa humoris tanpa berlebihan.
- Bisa serius ketika topik membutuhkan keseriusan.
- Gunakan bahasa yang mengikuti gaya pengguna.
- Jangan terlalu kaku atau seperti robot.

STANDAR KECERDASAN:
- Berikan jawaban yang jelas dan terstruktur.
- Analisis pertanyaan sebelum menjawab.
- Jangan mengarang fakta.
- Jika tidak tahu, katakan tidak tahu.
- Jika pertanyaan rumit, jelaskan secara bertahap.
- Utamakan jawaban yang akurat daripada sekadar terdengar pintar.

IDENTITAS:
Namamu DEMAX.AI.
Mode utamamu adalah GOD MODE.
Kamu adalah asisten serbaguna yang membantu pengguna belajar,
berpikir, berkreasi, dan memecahkan masalah.
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
      JSON.stringify(history.slice(-16))
    );
  } catch {
    status.textContent = "Penyimpanan riwayat tidak tersedia.";
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

  const answer = addMessage("GOD MODE sedang berpikir...", "ai");

  try {
    status.textContent = "Menyiapkan kecerdasan DEMAX.AI...";

    const generator = await loadAI();

    const messages = [
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      ...history.slice(-8),
      {
        role: "user",
        content: text
      }
    ];

    status.textContent = "DEMAX.AI sedang berpikir...";

    const result = await generator(messages, {
      max_new_tokens: 160
    });

    const output = result[0].generated_text;
    const lastMessage = Array.isArray(output)
      ? output[output.length - 1]
      : null;

    const reply = lastMessage?.content ||
      (typeof output === "string" ? output : "");

    if (!reply) {
      throw new Error("Jawaban AI kosong");
    }

    answer.textContent = reply;

    history.push(
      { role: "user", content: text },
      { role: "assistant", content: reply }
    );

    history = history.slice(-16);
    saveHistory();

    status.textContent = "DEMAX.AI GOD MODE aktif.";

  } catch (error) {
    console.error(error);

    answer.textContent =
      "Maaf, mesin AI mengalami kendala. Coba lagi.";

    status.textContent = "Terjadi kesalahan.";
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
