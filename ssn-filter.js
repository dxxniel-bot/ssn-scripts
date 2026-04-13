// ================================================================
//  Social Stream Ninja - Beep en palabras
//  Intercepta processData y censura palabras antes del TTS
//  En el chat visible aparece [🔇], en el TTS suena beep nativo
// ================================================================

(function () {

  const BLOCKED_WORDS = [
    "joto","gay","pene","pito","vagina","culo","sexo",
    "maricon","puto","mierda","puta","sexito","coito"
  ];

  const wordRegex = new RegExp(
    "\\b(" + BLOCKED_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")\\b",
    "gi"
  );

  // Activa el sistema de beep nativo de SSN
  function activateBeep() {
    if (typeof TTS !== "undefined") {
      TTS.beepwords = BLOCKED_WORDS;
      console.log("[SSN-Beep] TTS.beepwords activado con", BLOCKED_WORDS.length, "palabras");
    } else {
      setTimeout(activateBeep, 500);
    }
  }

  // Override de processData para censurar texto visible en el dock
  function hookProcessData() {
    if (typeof processData === "undefined") {
      setTimeout(hookProcessData, 500);
      return;
    }

    const _original = processData;

    window.processData = function (data, reloaded) {
      try {
        if (data && data.chatmessage) {
          wordRegex.lastIndex = 0;
          if (wordRegex.test(data.chatmessage)) {
            wordRegex.lastIndex = 0;
            data.chatmessage = data.chatmessage.replace(wordRegex, "[🔇]");
          }
        }
        if (data && data.contents && data.contents.chatmessage) {
          wordRegex.lastIndex = 0;
          if (wordRegex.test(data.contents.chatmessage)) {
            wordRegex.lastIndex = 0;
            data.contents.chatmessage = data.contents.chatmessage.replace(wordRegex, "[🔇]");
          }
        }
      } catch(e) {}
      wordRegex.lastIndex = 0;
      return _original(data, reloaded);
    };

    console.log("[SSN-Beep] processData hookeado correctamente");
  }

  activateBeep();
  hookProcessData();

  console.log("[SSN-Beep] Script cargado |", BLOCKED_WORDS.length, "palabras configuradas");

})();
