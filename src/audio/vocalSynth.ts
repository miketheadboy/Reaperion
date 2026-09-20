import { TapeAcoustics, VocalVoiceState, VoiceId, VowelType } from '../types';
import { midiToFreq } from './harmonyEngine';

// Standard human vocal formant frequencies (Hz) for male/tenor choir
const FORMANT_FREQS: Record<VowelType, [number, number, number]> = {
  ooh: [320, 850, 2250],
  aah: [720, 1150, 2450],
  ee:  [270, 2250, 3000],
  doo: [350, 1100, 2350],
  wah: [420, 1200, 2400],
  mm:  [250, 600, 1900],
};

// Formant bandwidths (Q factors)
const FORMANT_Q: [number, number, number] = [4.5, 6.0, 7.0];
// Formant relative gains (dB)
const FORMANT_GAINS: [number, number, number] = [0, -6, -14];

interface ActiveVoiceNode {
  voiceId: VoiceId;
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  noise?: AudioBufferSourceNode;
  vibratoLfo: OscillatorNode;
  vibratoGain: GainNode;
  filters: BiquadFilterNode[];
  gainNode: GainNode;
  pannerNode: StereoPannerNode;
}

export class BeachBoysVocalSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private saturatorNode: WaveShaperNode | null = null;
  private wowFlutterLfo: OscillatorNode | null = null;
  private wowFlutterGain: GainNode | null = null;
  private delayNode1: DelayNode | null = null;
  private delayNode2: DelayNode | null = null;
  private reverbFeedback1: GainNode | null = null;
  private reverbFeedback2: GainNode | null = null;
  private reverbMixGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  private activeVoiceNodes: Map<VoiceId, ActiveVoiceNode> = new Map();
  private voiceSettings: Map<VoiceId, VocalVoiceState> = new Map();
  private acoustics: TapeAcoustics = {
    wowFlutter: 25,
    tapeWarmth: 40,
    chamberReverb: 45,
    stereoWidth: 60,
    masterVolume: 80,
  };

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.masterGain) {
      const ctx = this.ctx;

      // Master output
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.acoustics.masterVolume / 100, ctx.currentTime);

      // Tape Saturation / Warmth waveshaper
      this.saturatorNode = ctx.createWaveShaper();
      this.saturatorNode.curve = this.makeDistortionCurve(this.acoustics.tapeWarmth) as any;
      this.saturatorNode.oversample = '2x';

      // Master Tape Wow & Flutter LFO
      this.wowFlutterLfo = ctx.createOscillator();
      this.wowFlutterLfo.type = 'sine';
      this.wowFlutterLfo.frequency.setValueAtTime(0.7, ctx.currentTime);

      this.wowFlutterGain = ctx.createGain();
      this.wowFlutterGain.gain.setValueAtTime((this.acoustics.wowFlutter / 100) * 0.002, ctx.currentTime);
      this.wowFlutterLfo.connect(this.wowFlutterGain);
      this.wowFlutterLfo.start();

      // Western Recorders Chamber #2 (Delay/Reverb network)
      this.dryGain = ctx.createGain();
      this.dryGain.gain.setValueAtTime(1.0, ctx.currentTime);

      this.reverbMixGain = ctx.createGain();
      this.reverbMixGain.gain.setValueAtTime((this.acoustics.chamberReverb / 100) * 0.7, ctx.currentTime);

      // Dual delay cross-feedback for warm 1960s chamber reverberation
      this.delayNode1 = ctx.createDelay();
      this.delayNode1.delayTime.setValueAtTime(0.082, ctx.currentTime); // 82ms slap

      this.delayNode2 = ctx.createDelay();
      this.delayNode2.delayTime.setValueAtTime(0.145, ctx.currentTime); // 145ms chamber reflection

      this.reverbFeedback1 = ctx.createGain();
      this.reverbFeedback1.gain.setValueAtTime(0.42, ctx.currentTime);

      this.reverbFeedback2 = ctx.createGain();
      this.reverbFeedback2.gain.setValueAtTime(0.38, ctx.currentTime);

      // Connect Chamber Reverb loop
      const filter1 = ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(3200, ctx.currentTime); // vintage tape high-end cutoff

      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'highpass';
      filter2.frequency.setValueAtTime(200, ctx.currentTime);

      this.delayNode1.connect(filter1);
      filter1.connect(this.reverbFeedback1);
      this.reverbFeedback1.connect(this.delayNode2);

      this.delayNode2.connect(filter2);
      filter2.connect(this.reverbFeedback2);
      this.reverbFeedback2.connect(this.delayNode1);

      // Output mixer
      this.dryGain.connect(this.saturatorNode);
      this.delayNode1.connect(this.reverbMixGain);
      this.delayNode2.connect(this.reverbMixGain);
      this.reverbMixGain.connect(this.saturatorNode);

      this.saturatorNode.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);
    }
  }

  // Generate soft-clip analog curve
  private makeDistortionCurve(amount: number): Float32Array {
    const k = Math.max(0, amount) * 0.5;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public updateVoiceConfig(voices: VocalVoiceState[], acoustics?: TapeAcoustics) {
    for (const v of voices) {
      this.voiceSettings.set(v.id, v);

      const active = this.activeVoiceNodes.get(v.id);
      if (active && this.ctx) {
        const isMuted = v.mute || (voices.some(other => other.solo) && !v.solo);
        const targetGain = isMuted ? 0 : v.volume;
        active.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);

        // Adjust pan based on stereo width setting
        const effectivePan = v.pan * (this.acoustics.stereoWidth / 100);
        active.pannerNode.pan.setTargetAtTime(effectivePan, this.ctx.currentTime, 0.05);
      }
    }

    if (acoustics) {
      this.acoustics = { ...acoustics };
      if (this.ctx && this.masterGain && this.reverbMixGain && this.saturatorNode) {
        this.masterGain.gain.setTargetAtTime(this.acoustics.masterVolume / 100, this.ctx.currentTime, 0.05);
        this.reverbMixGain.gain.setTargetAtTime((this.acoustics.chamberReverb / 100) * 0.7, this.ctx.currentTime, 0.05);
        this.saturatorNode.curve = this.makeDistortionCurve(this.acoustics.tapeWarmth) as any;
        if (this.wowFlutterGain) {
          this.wowFlutterGain.gain.setTargetAtTime((this.acoustics.wowFlutter / 100) * 0.002, this.ctx.currentTime, 0.05);
        }
      }
    }
  }

  /**
   * Synthesizes and plays a single vocal voice
   */
  public playVoice(
    voiceId: VoiceId,
    midiPitch: number,
    vowelOverride?: VowelType,
    durationSec?: number
  ) {
    this.initAudio();
    if (!this.ctx || !this.dryGain || !this.delayNode1) return;

    // Stop existing note for this voice
    this.stopVoice(voiceId);

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const voice = this.voiceSettings.get(voiceId);
    if (!voice) return;

    const baseFreq = midiToFreq(midiPitch);
    const vowel = vowelOverride || voice.vowel || 'ooh';

    // Check mute / solo state
    const anySolo = Array.from(this.voiceSettings.values()).some(v => v.solo);
    const isSilenced = voice.mute || (anySolo && !voice.solo);
    const targetVolume = isSilenced ? 0 : voice.volume;

    // Primary Vocal Cords Oscillator: Rich Sawtooth + Warm Pulse
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(baseFreq, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq, now);
    // Subtle detune for chorusing thickness
    const detuneCents = voice.detuneCents + (Math.random() * 4 - 2);
    osc1.detune.setValueAtTime(detuneCents, now);
    osc2.detune.setValueAtTime(-detuneCents, now);

    // Natural Human Vibrato LFO with progressive onset (mimics human singer breath)
    const vibratoLfo = ctx.createOscillator();
    vibratoLfo.type = 'sine';
    // Brian had a faster shimmering vibrato, Mike Love had a slower chest vibrato
    const vibratoRate = voiceId === 'falsetto' ? 5.8 : voiceId === 'bass' ? 4.8 : 5.3;
    vibratoLfo.frequency.setValueAtTime(vibratoRate + (Math.random() * 0.2 - 0.1), now);

    const vibratoGain = ctx.createGain();
    vibratoGain.gain.setValueAtTime(0, now);
    // Vibrato delay onset (160ms)
    vibratoGain.gain.setValueAtTime(0, now + 0.16);
    vibratoGain.gain.linearRampToValueAtTime(baseFreq * 0.015, now + 0.45); // ~25 cents vibrato depth

    vibratoLfo.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);
    vibratoGain.connect(osc2.frequency);
    vibratoLfo.start(now);

    // Human Vocal Tract Formant Filter Bank (Parallel Bandpass Filters for F1, F2, F3)
    const formants = FORMANT_FREQS[vowel] || FORMANT_FREQS.ooh;
    const formantMixer = ctx.createGain();
    formantMixer.gain.setValueAtTime(1.0, now);

    const filters: BiquadFilterNode[] = [];

    formants.forEach((freq, idx) => {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(FORMANT_Q[idx], now);

      const formantGain = ctx.createGain();
      const gainLinear = Math.pow(10, FORMANT_GAINS[idx] / 20);
      formantGain.gain.setValueAtTime(gainLinear, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(formantGain);
      formantGain.connect(formantMixer);

      filters.push(filter);

      // If vowel is 'wah', animate F1 from 320 to 750
      if (vowel === 'wah' && idx === 0) {
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.exponentialRampToValueAtTime(750, now + 0.35);
      }
    });

    // Voice Envelope & Volume Gain
    const voiceGain = ctx.createGain();
    // Soft organic vocal attack (40ms)
    voiceGain.gain.setValueAtTime(0, now);
    const attackTime = vowel === 'doo' ? 0.015 : 0.045; // Plosive 'doo' has fast attack
    voiceGain.gain.linearRampToValueAtTime(targetVolume * 0.45, now + attackTime);

    // Stereo Panner
    const panner = ctx.createStereoPanner();
    const effectivePan = voice.pan * (this.acoustics.stereoWidth / 100);
    panner.pan.setValueAtTime(effectivePan, now);

    // Connect voice into Master Dry and Chamber Reverb
    formantMixer.connect(voiceGain);
    voiceGain.connect(panner);
    panner.connect(this.dryGain);
    panner.connect(this.delayNode1);

    // Start oscillators
    osc1.start(now);
    osc2.start(now);

    const activeNode: ActiveVoiceNode = {
      voiceId,
      osc1,
      osc2,
      vibratoLfo,
      vibratoGain,
      filters,
      gainNode: voiceGain,
      pannerNode: panner,
    };

    this.activeVoiceNodes.set(voiceId, activeNode);

    // Auto-release if duration is specified
    if (durationSec && durationSec > 0) {
      const releaseTime = now + durationSec;
      voiceGain.gain.setValueAtTime(targetVolume * 0.45, releaseTime);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime + 0.18);

      setTimeout(() => {
        if (this.activeVoiceNodes.get(voiceId) === activeNode) {
          this.stopVoice(voiceId);
        }
      }, (durationSec + 0.2) * 1000);
    }
  }

  /**
   * Plays all 5 Beach Boys voices simultaneously for a chord
   */
  public playBeachBoysChord(
    notes: { falsetto: number; tenor1: number; lead: number; baritone: number; bass: number },
    vowelOverride?: VowelType,
    durationSec?: number
  ) {
    this.playVoice('falsetto', notes.falsetto, vowelOverride, durationSec);
    this.playVoice('tenor1', notes.tenor1, vowelOverride, durationSec);
    this.playVoice('lead', notes.lead, vowelOverride, durationSec);
    this.playVoice('baritone', notes.baritone, vowelOverride, durationSec);
    this.playVoice('bass', notes.bass, vowelOverride, durationSec);
  }

  /**
   * Plays an acoustic guitar strum across an array of MIDI pitches
   * with authentic string-to-string strum delay, body resonance, and wood decay.
   */
  public playAcousticGuitarStrum(
    pitches: number[],
    durationSec: number = 2.4,
    direction: 'down' | 'up' = 'down'
  ) {
    this.initAudio();
    if (!this.ctx || !this.masterGain) return;

    const ctx = this.ctx;
    const masterGain = this.masterGain;
    const sortedPitches = direction === 'down' ? [...pitches] : [...pitches].reverse();
    const strumSpeedSec = 0.022; // 22ms flam between strings

    sortedPitches.forEach((pitch, stringIdx) => {
      const freq = midiToFreq(pitch);
      const startTime = ctx.currentTime + stringIdx * strumSpeedSec;

      // Dual oscillator plucked string model (fundamental + bright harmonic)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      // Wooden body filter (lowpass with warm acoustic slope)
      const bodyFilter = ctx.createBiquadFilter();
      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(Math.min(4200, freq * 4.5), startTime);
      bodyFilter.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.2), startTime + durationSec);
      bodyFilter.Q.setValueAtTime(2.2, startTime);

      // Plucked string envelope
      const stringGain = ctx.createGain();
      stringGain.gain.setValueAtTime(0.0001, startTime);
      stringGain.gain.linearRampToValueAtTime(0.24, startTime + 0.004); // Fast pick attack
      stringGain.gain.exponentialRampToValueAtTime(0.06, startTime + 0.15); // Initial transient decay
      stringGain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec); // Ring out

      // Subtle stereo spread based on string position (low E left, high E right)
      const panner = ctx.createStereoPanner();
      const panValue = ((stringIdx / Math.max(1, sortedPitches.length - 1)) - 0.5) * 0.45;
      panner.pan.setValueAtTime(panValue, startTime);

      // Connect nodes
      osc1.connect(bodyFilter);
      osc2.connect(bodyFilter);
      bodyFilter.connect(stringGain);
      stringGain.connect(panner);
      panner.connect(masterGain);

      // Trigger
      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + durationSec + 0.1);
      osc2.stop(startTime + durationSec + 0.1);
    });
  }

  /**
   * Plays a single plucked guitar string or note
   */
  public playPluckedNote(pitch: number, durationSec: number = 1.6) {
    this.playAcousticGuitarStrum([pitch], durationSec, 'down');
  }

  /**
   * Smoothly releases a specific voice
   */
  public stopVoice(voiceId: VoiceId) {
    const active = this.activeVoiceNodes.get(voiceId);
    if (!active || !this.ctx) return;

    const now = this.ctx.currentTime;
    try {
      active.gainNode.gain.cancelScheduledValues(now);
      active.gainNode.gain.setValueAtTime(active.gainNode.gain.value, now);
      active.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      setTimeout(() => {
        try {
          active.osc1.stop();
          active.osc2.stop();
          active.vibratoLfo.stop();
          active.osc1.disconnect();
          active.osc2.disconnect();
          active.vibratoLfo.disconnect();
          active.gainNode.disconnect();
          active.pannerNode.disconnect();
        } catch {
          // Already cleaned up
        }
      }, 150);
    } catch {
      // Ignore
    }

    this.activeVoiceNodes.delete(voiceId);
  }

  /**
   * Stops all voices immediately with gentle fadeout
   */
  public stopAll() {
    for (const voiceId of Array.from(this.activeVoiceNodes.keys())) {
      this.stopVoice(voiceId);
    }
  }

  public getContextState(): string {
    return this.ctx ? this.ctx.state : 'uninitialized';
  }
}

// Global Singleton Instance
export const vocalSynth = new BeachBoysVocalSynth();
