const status = document.getElementById("status");
const question = document.getElementById("question");

async function sendMessage() {
  const text = question.value.trim();

  if (!text) {
    status.textContent = "Tulis pertanyaan terlebih dahulu.";
    return;
  }

  status.textContent = "DEMAX.AI sedang menyiapkan mesin AI lokal...";

  try {
    const { pipeline, env } = await import(
      "https://cdn.jsdelivr.net/npm/@xenova/transformers"
    );

    env.allowLocalModels = false;

    const generator = await pipeline(
      "text-generation",
      "Xenova/distilgpt2"
    );

    status.textContent = "Pertanyaan: " + text;

    const result = await generator(text, {
      max_new_tokens: 60
    });

    status.textContent = result[0].generated_text;
  } catch (error) {
    status.textContent = "Gagal menjalankan AI. Periksa koneksi internet dan coba lagi.";
    console.error(error);
  }
}
