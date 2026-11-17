/*!
 * web-alarm-timer – tiny browser alarm clock + countdown timer
 * No libraries. Uses Web Audio for the beep and the Screen Wake Lock API
 * (where supported) so the screen does not sleep while an alarm is set.
 * MIT License · Live demo: https://alarmsclock.live/
 */
(function (global) {
  'use strict';

  let audioCtx = null;
  let wakeLock = null;

  /** Play a short repeating beep. Returns a stop() function. */
  function beep({ frequency = 880, duration = 0.25, gap = 0.25, repeat = 20 } = {}) {
    audioCtx = audioCtx || new (global.AudioContext || global.webkitAudioContext)();
    const start = audioCtx.currentTime;
    const nodes = [];
    for (let i = 0; i < repeat; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = frequency;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(audioCtx.destination);
      const t = start + i * (duration + gap);
      osc.start(t);
      osc.stop(t + duration);
      nodes.push(osc);
    }
    return () => nodes.forEach(n => { try { n.stop(); } catch (e) {} });
  }

  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
      if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { /* not supported or not allowed – ignore */ }
  }

  /**
   * Countdown timer.
   * const t = Countdown(25 * 60, { onTick: s => ..., onDone: () => ... }); t.start();
   */
  function Countdown(seconds, { onTick = () => {}, onDone = () => {} } = {}) {
    let endAt = 0, left = seconds, id = null, stopSound = null;
    const tick = () => {
      left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      onTick(left);
      if (left === 0) { clearInterval(id); id = null; keepAwake(false); stopSound = beep(); onDone(); }
    };
    return {
      start() { if (id) return; endAt = Date.now() + left * 1000; id = setInterval(tick, 250); keepAwake(true); tick(); },
      pause() { clearInterval(id); id = null; keepAwake(false); },
      reset(s = seconds) { this.pause(); left = s; onTick(left); if (stopSound) stopSound(); },
      stopSound() { if (stopSound) stopSound(); },
      get remaining() { return left; }
    };
  }

  /**
   * Alarm at a clock time ("06:30" = 6:30 AM, "18:45" = 6:45 PM).
   * If the time has already passed today, it rings tomorrow.
   */
  function Alarm(hhmm, { onRing = () => {}, snoozeMinutes = 5 } = {}) {
    let id = null, stopSound = null;
    const next = () => {
      const [h, m] = hhmm.split(':').map(Number);
      const d = new Date(); d.setHours(h, m, 0, 0);
      if (d <= new Date()) d.setDate(d.getDate() + 1);
      return d;
    };
    let ringAt = next();
    const check = () => { if (Date.now() >= ringAt) { clearInterval(id); id = null; stopSound = beep({ repeat: 60 }); onRing(); } };
    return {
      set() { ringAt = next(); id = setInterval(check, 500); keepAwake(true); return ringAt; },
      snooze() { if (stopSound) stopSound(); ringAt = new Date(Date.now() + snoozeMinutes * 60000); id = setInterval(check, 500); return ringAt; },
      stop() { clearInterval(id); id = null; if (stopSound) stopSound(); keepAwake(false); },
      get ringsAt() { return ringAt; }
    };
  }

  /** Format seconds as H:MM:SS or M:SS */
  function format(s) {
    const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(sec).padStart(2, '0');
  }

  global.WebAlarmTimer = { Countdown, Alarm, beep, format };
})(typeof window !== 'undefined' ? window : this);
