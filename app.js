
import { pipeline, TextStreamer } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

const chat = document.getElementById("chat");
const question = document.getElementById("question");
const sendButton = document.getElementById("sendButton");
const status = document.getElementById("status");

let generator = null;
let history = [];
let busy = false;

function addMessage(name, text) {
  const item = document.createElement("p");
  item.textContent = name + ": " + text;
  chat.appendChild(item);
  chat.scrollTop = chat.scrollHeight;
  return item;
}

async function loadAI() {
  if (generator) return;

  status.textContent = "Tunggu bentar yak...";
  generator = await pipeline(
    "text-generation",
    "onnx-community/Qwen2.5-0.5B-Instruct",
    { dtype: "q4" }
  );
}

async function sendMessage() {
  const prompt = question.value.trim();

  if (!prompt || busy) return;

  busy = true;
  sendButton.disabled = true;
  question.value = "";

  addMessage("Kamu", prompt);
  const answer = addMessage("DEMAX.AI", "");

  try {
    await loadAI();

    status.textContent = "Bentar, mikir....";

    const messages = [
      {
        role: "system",
        content: "Kamu adalah DEMAX.AI, asisten AI yang cerdas, ramah, santai, dan menjawab dalam bahasa Indonesia."
      },
      ...history.slice(-8),
      { role: "user", content: prompt }
    ];

    const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (token) => {
        answer.textContent += token;
        chat.scrollTop = chat.scrollHeight;
      }
    });

    const result = await generator(messages, {
      max_new_tokens: 100,
      do_sample: false,
      streamer
    });

    const generated = result?.[0]?.generated_text;
    const reply = Array.isArray(generated)
      ? generated.at(-1)?.content
      : generated;

    if (!answer.textContent.trim() && reply) {
      answer.textContent = reply;
    }

    if (!answer.textContent.trim()) {
      answer.textContent = "Udah bener kok, tapi ga mau jawab... wlee.";
    }

    history.push(
      { role: "user", content: prompt },
      { role: "assistant", content: answer.textContent }
    );

    status.textContent = "Udah ready, gas coi..";

  } catch (error) {
    answer.textContent = "Gagal: " + (error?.message || String(error));
    status.textContent = "Ada yg salah deh., Cek pesan di atas.";
  } finally {
    busy = false;
    sendButton.disabled = false;
  }
}

sendButton.addEventListener("click", sendMessage);

question.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendMessage();
});

status.textContent = "Ready..,gas neh?!.";
