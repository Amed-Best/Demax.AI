
import { pipeline, env } from
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

env.allowLocalModels = false;

const question = document.getElementById("question");
const chat = document.getElementById("chat");
const status = document.getElementById("status");
const sendButton = document.getElementById("sendButton");

let generatorPromise = null;

function addMessage(text, type) {
  const message = document.createElement("div");
  message.className = "message " + type;
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
  return message;
}

async function sendMessage() {
  const text = question.value.trim();

  if (!text || sendButton.disabled) return;

  addMessage(text, "user");
  question.value = "";
  sendButton.disabled = true;
  status.textContent = "Memuat AI lokal...";

  const answer = addMessage("Sedang berpikir...", "ai");

  try {
    if (!generatorPromise) {
      generatorPromise = pipeline(
        "text-generation",
        "onnx-community/Qwen2.5-0.5B-Instruct",
        { dtype: "q4" }
      );
    }

    const generator = await generatorPromise;

    status.textContent = "DEMAX.AI sedang menjawab...";

    const result = await generator(
      [
        {
          role: "system",
          content: "Kamu adalah DEMAX.AI, asisten AI yang membantu dan menjawab dalam bahasa Indonesia."
        },
        {
          role: "user",
          content: text
        }
      ],
      {
        max_new_tokens: 120
      }
    );

    const output = result[0].generated_text;
    const lastMessage = output[output.length - 1];

    answer.textContent =
      lastMessage.content || "Maaf, belum ada jawaban.";

    status.textContent = "DEMAX.AI siap digunakan.";

  } catch (error) {
    console.error(error);
    answer.textContent =
      "Gagal memuat AI. Periksa koneksi internet atau kemampuan perangkat.";
    status.textContent = "Terjadi kesalahan.";
    generatorPromise = null;

  } finally {
    sendButton.disabled = false;
  }
}

sendButton.addEventListener("click", sendMessage);

question.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendMessage();
});
      
