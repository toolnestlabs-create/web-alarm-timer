# web-alarm-timer

A tiny, dependency-free **browser alarm clock and countdown timer** in plain JavaScript (about 100 lines).

- Countdown timer that stays accurate when the tab is in the background (uses timestamps, not tick counting)
- Alarm for a clock time (`"06:30"`), with snooze; rings tomorrow if the time has passed
- Beep generated with the **Web Audio API** – no sound files
- Uses the **Screen Wake Lock API** where supported, so the screen does not sleep while an alarm is set

Live, full-featured version (sounds, snooze, preset alarms and timers): **[Alarm Clock – alarmsclock.live](https://alarmsclock.live/)**

## Usage

```html
<script src="alarm-timer.js"></script>
<script>
  const { Countdown, Alarm, format } = WebAlarmTimer;

  // 25-minute timer
  const timer = Countdown(25 * 60, {
    onTick: s => console.log(format(s)),
    onDone: () => console.log('Time is up')
  });
  timer.start();

  // Alarm at 6:30 AM with 5-minute snooze
  const alarm = Alarm('06:30', { onRing: () => console.log('Wake up!'), snoozeMinutes: 5 });
  alarm.set();
</script>
```

Open `index.html` for a working demo.

## API

| Function | What it does |
|---|---|
| `Countdown(seconds, {onTick, onDone})` | Returns `{start, pause, reset, stopSound, remaining}` |
| `Alarm("HH:MM", {onRing, snoozeMinutes})` | Returns `{set, snooze, stop, ringsAt}` |
| `beep({frequency, duration, gap, repeat})` | Plays a beep pattern, returns `stop()` |
| `format(seconds)` | `"1:05:09"` or `"4:59"` |

## Browser notes

Browser alarms only ring while the tab is open and the device is awake. Browsers block sound until the user has clicked the page once, so start timers from a button.

Ready-made pages built on the same idea: [1 minute timer](https://alarmsclock.live/1-minute-timer/) · [set alarm for 6 AM](https://alarmsclock.live/set-alarm-for-6-am/) · [world clock](https://alarmsclock.live/world-clock/) · [time in London](https://alarmsclock.live/time-in-london/)

## License

MIT
