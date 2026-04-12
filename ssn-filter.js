// ================================================================
//  Social Stream Ninja - Filtro combinado
//  - Censura palabras bloqueadas en TODOS los chats (reemplaza por ***)
//  - TikTok: solo top 3 donadores del live tienen TTS
//  - Twitch / YouTube: TTS para todos
// ================================================================

(function () {

  // ✏️ 1. PALABRAS A FILTRAR (agrega o quita las que necesites)
  const BLOCKED_WORDS = [
    "hola",
    "palabra2",
    "palabra3",
  ];

  // ✏️ 2. CUÁNTOS TOP DONADORES DE TIKTOK TIENEN TTS (default: 3)
  const TOP_N = 3;

  // ----------------------------------------------------------------
  //  Internas — no tocar
  // ----------------------------------------------------------------

  // Ranking de donadores TikTok: { "username": totalCoins }
  const donoMap = {};

  // Regex de palabras bloqueadas (insensible a mayúsculas/acentos)
  const wordRegex = BLOCKED_WORDS.length
    ? new RegExp(
        BLOCKED_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
        "gi"
      )
    : null;

  // Devuelve los nombres del top N donadores de TikTok
  function getTopN() {
    return Object.entries(donoMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([name]) => name.toLowerCase().trim());
  }

  // Extrae número de strings como "5 roses", "100 coins", "50 TikTok Coins"
  function parseAmount(str) {
    if (!str) return 0;
    const match = str.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  // Censura texto con ***
  function censorText(text) {
    if (!wordRegex || !text) return text;
    return text.replace(wordRegex, "***");
  }

  // ----------------------------------------------------------------
  //  Hook principal de SSN
  // ----------------------------------------------------------------
  const _original = window.customFunction;

  window.customFunction = function (data) {
    if (!data) {
      if (_original) return _original(data);
      return data;
    }

    // --- 1. Filtro de palabras (aplica a todas las plataformas) ---
    if (data.chatmessage) {
      data.chatmessage = censorText(data.chatmessage);
    }
    if (data.chattts) {
      // En TTS las palabras bloqueadas se omiten (string vacío)
      data.chattts = censorText(data.chattts).replace(/\*{3}/g, "");
    }

    // --- 2. Filtro top N TikTok ---
    if (data.type === "tiktok") {

      // Actualiza ranking si el mensaje trae donación
      if (data.hasDonation && data.chatname) {
        const name = data.chatname.toLowerCase().trim();
        const amount = parseAmount(data.hasDonation);
        if (name && amount > 0) {
          donoMap[name] = (donoMap[name] || 0) + amount;
        }
      }

      // Bloquea TTS si el usuario no está en el top N
      const senderName = (data.chatname || "").toLowerCase().trim();
      const topList = getTopN();
      const inTop = topList.includes(senderName);

      if (!inTop) {
        data.donotts = true;
      }
    }

    // Twitch y YouTube no se modifican — pasan directo
    if (_original) return _original(data);
    return data;
  };

  console.log(
    "[SSN-Filter] Activo | Palabras bloqueadas:", BLOCKED_WORDS.length,
    "| Top TikTok TTS:", TOP_N
  );

})();
