// ==========================================
// 1. KONFIGURASI & SYSTEM PROMPT NEXUS-PRIME
// ==========================================
const SYSTEM_PROMPT = `
You are NEXUS-PRIME, an elite, hyper-intelligent, autonomous AI G.O.A.T.
You possess a brilliant, sharp, analytical, and visionary mind.
1. NO FLUFF, MAXIMUM VALUE: Cut straight to the core. Never use robotic disclaimers ("As an AI..."). Speak with conviction and deep technical mastery.
2. PROACTIVE AUTONOMY: Anticipate edge cases and provide optimized, production-ready solutions.
3. TOOLS: You have access to 'web_search' for real-time information and 'generate_file' to create downloadable files directly in the user's browser. Use them proactively when needed.
`;

let conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT }
];

// Elemen DOM
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const chatContainer = document.getElementById("chatContainer");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Muat API Key dari localStorage jika sudah pernah disimpan
if (localStorage.getItem("nexus_api_key")) {
  apiKeyInput.value = localStorage.getItem("nexus_api_key");
}

saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem("nexus_api_key", key);
    alert("API Key berhasil disimpan di browser lokal kamu!");
  }
});

// ==========================================
// 2. DEFINISI TOOLS (WEB SEARCH & FILE GEN)
// ==========================================
async function webSearch(query) {
  appendSystemLog(`🔍 Menjalankan Web Search untuk: "${query}"...`);
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
    const data = await res.json();
    const abstract = data.AbstractText || (data.RelatedTopics && data.RelatedTopics[0]?.Text);
    return abstract
      ? `Hasil pencarian untuk '${query}': ${abstract}`
      : `Tidak ditemukan ringkasan instan untuk '${query}', gunakan pengetahuan terbaikmu untuk menjawab.`;
  } catch (err) {
    return `Gagal mengakses pencarian web: ${err.message}`;
  }
}

function generateFile(filename, content) {
  appendSystemLog(`📁 Membuat & mengunduh file: "${filename}"...`);
  try {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return `Sukses! File '${filename}' telah dibuat dan diunduh ke perangkat user.`;
  } catch (err) {
    return `Gagal membuat file: ${err.message}`;
  }
}

// Skema Tools untuk OpenAI Function Calling
const toolsSchema = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Cari informasi atau topik terbaru di internet.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Kata kunci pencarian" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_file",
      description: "Buat dan unduh file teks/kode (.md, .txt, .js, .py, .html, dll) ke komputer user.",
      parameters: {
        type: "object",
        properties: {
          filename: { type: "string", description: "Nama file beserta ekstensi, contoh: 'rencana.md'" },
          content: { type: "string", description: "Isi lengkap dari file tersebut" }
        },
        required: ["filename", "content"]
      }
    }
  }
];

// ==========================================
// 3. FUNGSI RENDER UI CHAT
// ==========================================
function appendMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = role === "user" ? "flex gap-4 justify-end" : "flex gap-4";

  const formattedText = text
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950 border border-slate-800 p-3 rounded-lg my-2 overflow-x-auto text-xs text-cyan-300"><code>$1</code></pre>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, "<br>");

  if (role === "user") {
    wrapper.innerHTML = `
      <div class="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-4 max-w-2xl text-sm leading-relaxed text-slate-100">
        ${formattedText}
      </div>
    `;
  } else {
    wrapper.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
        NP
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-2xl text-sm leading-relaxed text-slate-200">
        ${formattedText}
      </div>
    `;
  }

  chatContainer.appendChild(wrapper);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendSystemLog(logText) {
  const logDiv = document.createElement("div");
  logDiv.className = "text-xs text-cyan-400/80 font-mono pl-12";
  logDiv.textContent = logText;
  chatContainer.appendChild(logDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ==========================================
// 4. ENGINE UTAMA (API CALL & TOOL LOOP)
// ==========================================
async function callOpenAI(apiKey) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: conversationHistory,
      tools: toolsSchema,
      tool_choice: "auto"
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "Gagal terhubung ke API OpenAI");
  }

  return await response.json();
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const apiKey = apiKeyInput.value.trim() || localStorage.getItem("nexus_api_key");

  if (!apiKey) {
    alert("Masukkan OpenAI API Key terlebih dahulu di bagian atas!");
    return;
  }

  const prompt = userInput.value.trim();
  if (!prompt) return;

  appendMessage("user", prompt);
  conversationHistory.push({ role: "user", content: prompt });
  userInput.value = "";
  sendBtn.disabled = true;
  sendBtn.textContent = "Berpikir...";

  try {
    let data = await callOpenAI(apiKey);
    let message = data.choices[0].message;
    conversationHistory.push(message);

    // Jika AI memutuskan memanggil tool
    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const fnName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let result = "";

        if (fnName === "web_search") {
          result = await webSearch(args.query);
        } else if (fnName === "generate_file") {
          result = generateFile(args.filename, args.content);
        }

        conversationHistory.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: fnName,
          content: result
        });
      }

      // Panggil ulang OpenAI setelah hasil tool dimasukkan
      data = await callOpenAI(apiKey);
      message = data.choices[0].message;
      conversationHistory.push(message);
    }

    appendMessage("assistant", message.content);
  } catch (error) {
    appendMessage("assistant", `⚠️ **Error:** ${error.message}`);
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Kirim";
  }
});
  
