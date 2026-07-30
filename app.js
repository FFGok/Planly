function playChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const now = context.currentTime;

    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();

    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(1.0, now + 0.03);
    master.gain.setValueAtTime(1.0, now + 2.2);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

    master.connect(compressor);
    compressor.connect(context.destination);

    /*
      PlanlyTime Modern Chime V2

      C5 → E5 → G5 → B5
      followed by a brighter second pulse.
    */

    const notes = [
      { frequency: 523.25, start: 0.00, duration: 0.75, volume: 0.34 },
      { frequency: 659.25, start: 0.16, duration: 0.85, volume: 0.31 },
      { frequency: 783.99, start: 0.32, duration: 0.95, volume: 0.28 },
      { frequency: 987.77, start: 0.50, duration: 1.05, volume: 0.24 },

      { frequency: 659.25, start: 1.15, duration: 0.75, volume: 0.30 },
      { frequency: 783.99, start: 1.30, duration: 0.85, volume: 0.27 },
      { frequency: 1046.50, start: 1.47, duration: 1.00, volume: 0.23 }
    ];

    notes.forEach((note) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";

      oscillator.frequency.setValueAtTime(
        note.frequency,
        now +
