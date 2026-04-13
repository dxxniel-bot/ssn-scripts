// ================================================================
//  Social Stream Ninja - Beep nativo en palabras
// ================================================================

(function () {

  const BLOCKED_WORDS = [
    "joto","gay","pene","pito","vagina","culo","sexo",
    "maricon","puto","mierda","puta","sexito","coito"
  ];

  function activateBeep() {
    if (typeof TTS !== "undefined" && TTS.beepwords !== undefined) {
      TTS.beepwords = BLOCKED_WORDS;
      console.log("[SSN-Beep] Activo con", BLOCKED_WORDS.length, "palabras");
    } else {
      setTimeout(activateBeep, 500);
    }
  }

  activateBeep();

})();
