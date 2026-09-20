import { MidiNoteEvent } from '../types';
import { midiToFreq } from './harmonyEngine';

export class AcousticInstrumentSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private driveNode: WaveShaperNode | null = null;
  private isPlaying: boolean = false;
  private scheduledTimeouts: number[] = [];

  public init() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtxClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.driveNode = this.ctx.createWaveShaper();
    this.driveNode.curve = this.makeDriveCurve(12) as any;
    this.driveNode.oversample = '2x';

    this.masterGain.connect(this.driveNode);
    this.driveNode.connect(this.ctx.destination);
  }

  private makeDriveCurve(k: number): Float32Array {
    const n = 44100;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public async resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Triggers a single acoustic guitar pluck note using string physics & body resonance
   */
  public triggerPluck(
    midiNote: number,
    velocity: number = 90,
    durationSec: number = 1.2,
    soundMode: 'acoustic_guitar' | 'electric_clean' | 'beach_boys_vocal' | 'warm_keys' = 'acoustic_guitar',
    fuzzAmount: number = 0
  ) {
    this.resume();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const freq = midiToFreq(midiNote);
    const gainVal = (velocity / 127) * 0.45;

    if (soundMode === 'beach_boys_vocal') {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      const f1 = this.ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(340, now);
      f1.Q.setValueAtTime(5, now);

      const f2 = this.ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.setValueAtTime(950, now);
      f2.Q.setValueAtTime(6, now);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(gainVal * 0.4, now + 0.08);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(f1);
      osc.connect(f2);
      f1.connect(noteGain);
      f2.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + durationSec + 0.1);
      return;
    }

    const osc = this.ctx.createOscillator();
    osc.type = soundMode === 'warm_keys' ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    const cutoff = soundMode === 'electric_clean' ? 4200 : Math.min(8000, freq * 3.5 + 800);
    bodyFilter.frequency.setValueAtTime(cutoff, now);
    bodyFilter.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 1.5), now + 0.4);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(gainVal, now);
    const decay = soundMode === 'warm_keys' ? durationSec * 0.9 : Math.min(durationSec, 2.5);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    if (fuzzAmount > 20) {
      const fuzzShaper = this.ctx.createWaveShaper();
      fuzzShaper.curve = this.makeDriveCurve(fuzzAmount) as any;
      osc.connect(bodyFilter);
      bodyFilter.connect(fuzzShaper);
      fuzzShaper.connect(noteGain);
    } else {
      osc.connect(bodyFilter);
      bodyFilter.connect(noteGain);
    }

    noteGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + decay + 0.05);
  }

  /**
   * Plays the complete MIDI events sequence with progress callback
   */
  public playSequence(
    events: MidiNoteEvent[],
    bpm: number,
    soundMode: 'acoustic_guitar' | 'electric_clean' | 'beach_boys_vocal' | 'warm_keys',
    fuzzAmount: number,
    onProgress: (currentBeat: number) => void,
    onFinish: () => void
  ) {
    this.stopSequence();
    this.resume();
    if (!this.ctx || events.length === 0) return;

    this.isPlaying = true;
    const secPerBeat = 60 / Math.max(30, bpm);
    const totalBeats = Math.max(...events.map((e) => e.startBeat + e.durationBeats));
    const startTime = performance.now();

    events.forEach((ev) => {
      const delayMs = ev.startBeat * secPerBeat * 1000;
      const tId = window.setTimeout(() => {
        if (!this.isPlaying) return;
        const durSec = ev.durationBeats * secPerBeat;
        this.triggerPluck(ev.note, ev.velocity, durSec, soundMode, fuzzAmount);
      }, delayMs);
      this.scheduledTimeouts.push(tId);
    });

    const intervalId = window.setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(intervalId);
        return;
      }
      const elapsedSec = (performance.now() - startTime) / 1000;
      const currentBeat = elapsedSec / secPerBeat;
      onProgress(currentBeat);

      if (currentBeat >= totalBeats + 0.5) {
        clearInterval(intervalId);
        this.stopSequence();
        onFinish();
      }
    }, 25);
    this.scheduledTimeouts.push(intervalId as any);
  }

  public stopSequence() {
    this.isPlaying = false;
    this.scheduledTimeouts.forEach((t) => clearTimeout(t));
    this.scheduledTimeouts = [];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const acousticSynth = new AcousticInstrumentSynth();
