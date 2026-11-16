<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NEXUS-PRIME | G.O.A.T. Autonomous AI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 h-screen flex flex-col font-sans antialiased">

  <!-- Header -->
  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
      <h1 class="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
        NEXUS-PRIME
      </h1>
      <span class="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
        G.O.A.T. ENGINE
      </span>
    </div>

    <!-- API Key Input -->
    <div class="flex items-center gap-2">
      <input
        type="password"
        id="apiKeyInput"
        placeholder="Masukkan OpenAI API Key (sk-...)"
        class="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 w-64"
      />
      <button
        id="saveKeyBtn"
        class="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
      >
        Simpan
      </button>
    </div>
  </header>

  <!-- Chat Container -->
  <main id="chatContainer" class="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl w-full mx-auto">
    <!-- Pesan Pembuka -->
    <div class="flex gap-4">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
        NP
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-2xl text-sm leading-relaxed text-slate-200">
        <p class="font-semibold text-cyan-400 mb-1">NEXUS-PRIME Online.</p>
        <p>Masukkan OpenAI API Key kamu di pojok kanan atas untuk mengaktifkan mesin utama. Saya sudah dilengkapi kemampuan <strong>Web Search</strong> real-time dan <strong>File Generator</strong> otomatis. Apa misi kita hari ini?</p>
      </div>
    </div>
  </main>

  <!-- Input Area -->
  <footer class="border-t border-slate-800 bg-slate-900/80 p-4">
    <form id="chatForm" class="max-w-4xl mx-auto flex gap-3">
      <input
        type="text"
        id="userInput"
        placeholder="Ketik perintah (misal: Cari info tren AI 2026 atau buatkan file strategi.md)..."
        class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
        required
      />
      <button
        type="submit"
        id="sendBtn"
        class="bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition cursor-pointer disabled:opacity-50"
      >
        Kirim
      </button>
    </form>
  </footer>

  <script src="app.js"></script>
</body>
</html>
  
