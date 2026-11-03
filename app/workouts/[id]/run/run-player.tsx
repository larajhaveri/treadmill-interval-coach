"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { buildCues, buildTimeline, fmtNum, mmss, segmentIndexAt, type RunConfig } from "@/lib/run-plan";

type Props = { config: RunConfig; workoutId: string };

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

// How the phone treats our spoken cues next to other audio (like Spotify).
// transient: the cue is heard clearly, and music may pause (this is what my prototype used).
// ambient: music keeps playing, but on some iPhones the cue is quiet or silent.
type AudioMode = "transient" | "ambient";

// The run screen: big timer, the speed to set, what's next, and spoken cues on a schedule.
export default function RunPlayer({ config, workoutId }: Props) {
  const tl = useMemo(() => buildTimeline(config), [config]);
  const cues = useMemo(() => buildCues(tl, config), [tl, config]);

  const [elapsed, setElapsed] = useState(0); // milliseconds into the run
  const [running, setRunning] = useState(false);
  const [lastCue, setLastCue] = useState("");
  const [wakeLock, setWakeLock] = useState<"on" | "off" | "unavailable">("off");
  const [audioMode, setAudioMode] = useState<AudioMode>("transient");
  const [audioStatus, setAudioStatus] = useState("");
  const [voiceStatus, setVoiceStatus] = useState(""); // what the speech engine did last

  // Values the timer needs but the screen does not, so they live in refs.
  const baseRef = useRef(0); // ms already run before the latest start
  const startedAtRef = useRef(0); // when the latest start happened (Date.now)
  const nextCueRef = useRef(0); // index of the next cue to speak
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakeRef = useRef<WakeLockSentinel | null>(null);

  const total = tl.total;
  const segIndex = segmentIndexAt(tl, elapsed / 1000);
  const seg = tl.segs[segIndex];
  const next = tl.segs[segIndex + 1];
  const done = elapsed >= total * 1000;
  const started = elapsed > 0 || running;
  const secondsLeft = Math.max(0, Math.ceil(seg.end - elapsed / 1000));

  function speak(text: string) {
    setLastCue(text);
    if (!("speechSynthesis" in window)) {
      setVoiceStatus("This browser has no speech engine.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    // Some phones need an English voice picked by name before they will speak.
    const voices = speechSynthesis.getVoices();
    const english = voices.find((voice) => /^en/i.test(voice.lang));
    if (english) utterance.voice = english;
    utterance.onstart = () => setVoiceStatus(`Speaking now (${voices.length} voices on this phone).`);
    utterance.onend = () => setVoiceStatus(`Finished speaking (${voices.length} voices on this phone).`);
    utterance.onerror = (event) => setVoiceStatus(`Speech error: ${event.error}.`);
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      setTimeout(() => speechSynthesis.speak(utterance), 80);
    } else {
      speechSynthesis.speak(utterance);
    }
  }

  // A short beep, to tell "no sound at all" apart from "no voice".
  function testTone() {
    try {
      const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = 0.3;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.6);
      setVoiceStatus("Played a beep. Did you hear it?");
    } catch {
      setVoiceStatus("This browser could not play a beep.");
    }
  }

  function stopSpeech() {
    try {
      speechSynthesis.cancel();
    } catch {
      // no speech on this device
    }
  }

  async function acquireWake() {
    if (!("wakeLock" in navigator)) {
      setWakeLock("unavailable");
      return;
    }
    try {
      const lock = await navigator.wakeLock.request("screen");
      wakeRef.current = lock;
      lock.addEventListener("release", () => {
        wakeRef.current = null;
        setWakeLock("off");
      });
      setWakeLock("on");
    } catch {
      setWakeLock("off");
    }
  }

  function releaseWake() {
    wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
    setWakeLock((current) => (current === "unavailable" ? current : "off"));
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  function finish() {
    stopTimer();
    baseRef.current = total * 1000;
    setElapsed(total * 1000);
    setRunning(false);
    releaseWake();
  }

  // Runs five times a second: speaks any cue that is due, then updates the screen.
  function tick() {
    const e = baseRef.current + (Date.now() - startedAtRef.current);
    while (nextCueRef.current < cues.length && cues[nextCueRef.current].t * 1000 <= e) {
      const cue = cues[nextCueRef.current];
      // A cue that is already more than 4 seconds old (after a jump or a long pause) is skipped.
      if (e - cue.t * 1000 < 4000) speak(cue.text);
      nextCueRef.current += 1;
    }
    if (e >= total * 1000) {
      finish();
      return;
    }
    setElapsed(e);
  }

  function reset() {
    stopTimer();
    stopSpeech();
    releaseWake();
    baseRef.current = 0;
    nextCueRef.current = 0;
    setElapsed(0);
    setRunning(false);
    setLastCue("");
  }

  function start() {
    if (running) return;
    if (elapsed >= total * 1000) reset();
    // Ask the phone how to treat our sound. This is an attempt: not every browser supports it.
    try {
      const nav = navigator as AudioSessionNavigator;
      if (nav.audioSession) {
        nav.audioSession.type = audioMode;
        setAudioStatus(`The phone reports audio mode: ${nav.audioSession.type}.`);
      } else {
        setAudioStatus("This browser cannot set an audio mode, so it uses its own default.");
      }
    } catch {
      setAudioStatus("The audio mode could not be set.");
    }
    startedAtRef.current = Date.now();
    setRunning(true);
    void acquireWake();
    timerRef.current = setInterval(tick, 200);
    tick(); // inside the tap, so the phone allows the first spoken cue
  }

  function pause() {
    baseRef.current += Date.now() - startedAtRef.current;
    stopTimer();
    stopSpeech();
    setRunning(false);
    releaseWake();
  }

  function jumpTo(seconds: number) {
    baseRef.current = seconds * 1000;
    startedAtRef.current = Date.now();
    const k = cues.findIndex((cue) => cue.t >= seconds);
    nextCueRef.current = k < 0 ? cues.length : k;
    stopSpeech();
    setElapsed(seconds * 1000);
    if (running) tick();
  }

  function skip() {
    jumpTo(next ? next.start : total);
  }

  function back() {
    const now = elapsed / 1000;
    const previous = tl.segs[segIndex - 1];
    jumpTo(now - seg.start > 3 || !previous ? seg.start : previous.start);
  }

  // Clean up if the runner leaves the page mid-run.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try {
        speechSynthesis.cancel();
      } catch {
        // no speech on this device
      }
      wakeRef.current?.release().catch(() => {});
    };
  }, []);

  // The phone drops the screen lock when the page is hidden; take it again when the runner comes back.
  useEffect(() => {
    if (!running) return;
    function onVisible() {
      if (document.visibilityState === "visible" && !wakeRef.current) void acquireWake();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [running]);

  const kindClass = done ? "player-done" : seg.kind === "rep" ? "player-rep" : seg.kind === "walk" ? "player-walk" : "player-easy";

  return (
    <>
      <section className={`player ${kindClass}`} aria-label="Run player">
        <p className="player-label">{done ? "Done" : started ? seg.label : "Ready"}</p>
        <p className="player-time" aria-label={`${secondsLeft} seconds left in this segment`}>
          {mmss(started ? secondsLeft : seg.dur)}
        </p>
        <p className="player-speed">
          {done ? "Workout complete" : `Speed ${fmtNum(seg.speed)} km/h${seg.dist ? ` · ${seg.dist} m` : ""}`}
        </p>
        {!done && (
          <p className="player-next">
            {next ? `Next: ${next.label} at ${fmtNum(next.speed)} km/h` : "Next: finish"}
          </p>
        )}
        <div className="player-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(total, Math.round(elapsed / 1000))} aria-label="Workout progress">
          <span style={{ width: `${Math.min(100, (elapsed / (total * 1000)) * 100)}%` }} />
        </div>
        <p className="player-cue" aria-live="polite">
          {lastCue || "Tap Start. Cues are spoken, so turn your sound on."}
        </p>
      </section>

      <section className="card stack">
        <div className="row">
          {running ? (
            <button type="button" className="btn btn-red" onClick={pause}>
              Pause
            </button>
          ) : (
            <button type="button" className="btn btn-red" onClick={start}>
              {done ? "Run again" : started ? "Resume" : "Start"}
            </button>
          )}
          <button type="button" className="btn btn-plain" onClick={back} disabled={!started || done}>
            Back
          </button>
          <button type="button" className="btn btn-plain" onClick={skip} disabled={!started || done}>
            Skip
          </button>
          <button type="button" className="btn btn-plain" onClick={reset} disabled={!started}>
            Reset
          </button>
        </div>
        <label className="field">
          When a cue speaks
          <select value={audioMode} onChange={(event) => setAudioMode(event.target.value as AudioMode)} disabled={running}>
            <option value="transient">Cue first: I hear every cue (music may pause)</option>
            <option value="ambient">Keep music playing (cues may be quiet)</option>
          </select>
        </label>
        {audioStatus && <p className="muted">{audioStatus}</p>}
        <div className="row">
          <button type="button" className="btn btn-plain" onClick={() => speak("Rep 3 of 5 in 20 seconds. Set speed to 10 point 2.")}>
            Test voice
          </button>
          <button type="button" className="btn btn-plain" onClick={testTone}>
            Test beep
          </button>
        </div>
        {voiceStatus && (
          <p className="muted" aria-live="polite">
            {voiceStatus}
          </p>
        )}
        {done && (
          <Link href={`/workouts/${workoutId}/log`} className="btn btn-red">
            Log this session
          </Link>
        )}
        <p className="muted">
          Screen stays awake: {wakeLock === "on" ? "yes" : wakeLock === "unavailable" ? "not supported on this device" : "not yet"}.
          No sound? Switch off the silent switch on the side of your iPhone (no orange showing) and turn the volume up.
          Cues play over your music; a web page cannot make the music quieter while a cue speaks.
        </p>
        <details>
          <summary>See the whole timeline</summary>
          <ol className="timeline">
            {tl.segs.map((s) => (
              <li key={s.start}>
                <strong>{mmss(s.start)}</strong> {s.label} · {mmss(s.dur)} at {fmtNum(s.speed)} km/h
                {s.dist ? ` · ${s.dist} m` : ""}
              </li>
            ))}
          </ol>
        </details>
      </section>
    </>
  );
}
