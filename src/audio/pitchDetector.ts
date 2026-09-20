import { freqToMidi, midiToNoteName } from './harmonyEngine';

export interface PitchDetectionResult {
  frequency: number;
  midi: number;
  noteName: string;
  confidence: number;
  rms: number;
}

export class MicrophonePitchTracker {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private isListening: boolean = false;
  private animationFrameId: number | null = null;
  private buffer: Float32Array = new Float32Array(2048);
  private onPitchCallback: ((result: PitchDetectionResult | null) => void) | null = null;

  public async start(onPitch: (result: PitchDetectionResult | null) => void): Promise<boolean> {
    try {
      this.onPitchCallback = onPitch;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.sourceNode.connect(this.analyser);

      this.isListening = true;
      this.trackPitchLoop();
      return true;
    } catch (err) {
      console.error('Failed to access microphone:', err);
      this.stop();
      return false;
    }
  }

  public stop() {
    this.isListening = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    if (this.onPitchCallback) {
      this.onPitchCallback(null);
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  private trackPitchLoop = () => {
    if (!this.isListening || !this.analyser || !this.buffer || !this.audioCtx) return;

    this.analyser.getFloatTimeDomainData(this.buffer as any);

    // Calculate RMS volume level
    let sum = 0;
    for (let i = 0; i < this.buffer.length; i++) {
      sum += this.buffer[i] * this.buffer[i];
    }
    const rms = Math.sqrt(sum / this.buffer.length);

    // If signal is too quiet, skip (noise gate threshold)
    if (rms < 0.015) {
      if (this.onPitchCallback) {
        this.onPitchCallback(null);
      }
      this.animationFrameId = requestAnimationFrame(this.trackPitchLoop);
      return;
    }

    // Auto-correlation pitch detection algorithm
    const sampleRate = this.audioCtx.sampleRate;
    const detectedFreq = this.autoCorrelate(this.buffer, sampleRate);

    if (detectedFreq !== -1 && detectedFreq >= 65 && detectedFreq <= 900) {
      const midi = freqToMidi(detectedFreq);
      const noteName = midiToNoteName(midi);

      if (this.onPitchCallback) {
        this.onPitchCallback({
          frequency: Math.round(detectedFreq * 10) / 10,
          midi,
          noteName,
          confidence: Math.min(1.0, rms * 8),
          rms,
        });
      }
    } else {
      if (this.onPitchCallback) {
        this.onPitchCallback(null);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.trackPitchLoop);
  };

  /**
   * Fast normalized autocorrelation algorithm
   */
  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      sumOfSquares += buffer[i] * buffer[i];
    }

    const rootMeanSquare = Math.sqrt(sumOfSquares / SIZE);
    if (rootMeanSquare < 0.01) return -1; // Not enough signal

    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmed = buffer.slice(r1, r2);
    const c = new Float32Array(trimmed.length);

    for (let i = 0; i < trimmed.length; i++) {
      for (let j = 0; j < trimmed.length - i; j++) {
        c[i] = c[i] + trimmed[j] * trimmed[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < trimmed.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;

    // Parabolic interpolation for fine tuning
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  }
}

export const micPitchTracker = new MicrophonePitchTracker();
