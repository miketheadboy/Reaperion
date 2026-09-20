import { ChordVoicing, GrooveMatrixConfig, GuitarTuning, MidiNoteEvent, TempoMapMarker } from '../types';
import { midiToNoteName } from './harmonyEngine';

/**
 * Algorithmic Sequence, Travis Picking, & Humanized MIDI Generator
 * Calculates micro-timing (offset_beats), varied velocities, and humanized jitter
 * for artists like Elliott Smith, Big Thief, J Dilla, Dylan, and Radiohead.
 */
export function generateMidiSequence(
  chords: ChordVoicing[],
  groove: GrooveMatrixConfig,
  bpm: number,
  tuning: GuitarTuning,
  capoFret: number = 0
): MidiNoteEvent[] {
  const events: MidiNoteEvent[] = [];
  const secPerBeat = 60 / Math.max(30, bpm);

  // Convert milliseconds into beats
  const msToBeats = (ms: number) => ms / 1000 / secPerBeat;

  let currentAbsoluteBeat = 0;

  chords.forEach((chord, chordIdx) => {
    const beats = chord.beats;

    // Apply Capo transposition
    const chordNotes = chord.midiNotes.map((n) => Math.min(127, Math.max(12, n + capoFret)));
    const bassNote = chord.bassNote ? Math.min(127, Math.max(12, chord.bassNote + capoFret)) : chordNotes[0];
    const upperNotes = chordNotes.filter((n) => n !== bassNote);

    // Number of steps per beat
    const subdivisionsPerBeat = groove.polyrhythmDivisor === 3 ? 3 : 4; // triplet or 16th grid
    const totalSteps = Math.floor(beats * subdivisionsPerBeat);
    const stepDurationBeats = 1 / subdivisionsPerBeat;

    for (let step = 0; step < totalSteps; step++) {
      const beatInChord = step * stepDurationBeats;
      const isDownbeat = step === 0;
      const beatNumberInBar = Math.floor(beatInChord) % 4;
      const isBackbeat = beatNumberInBar === 1 || beatNumberInBar === 3; // beats 2 & 4

      // Base timing
      let startBeat = currentAbsoluteBeat + beatInChord;

      // 1. Backbeat Lag (J Dilla / D'Angelo drunk groove)
      if (isBackbeat) {
        startBeat += msToBeats(groove.backbeatLagMs);
      }

      // 2. Looseness / Organic Jitter (unquantized human drift)
      const loosenessAmount = (groove.looseness / 100) * 0.08; // up to ~0.08 beats (~30-50ms)
      const randomJitter = (Math.random() - 0.5) * loosenessAmount;
      startBeat += randomJitter;

      startBeat = Math.max(0, startBeat);

      // Determine notes to pick
      let notesToPlay: number[] = [];
      let isDouble = false;

      if (groove.strumDirection === 'travis') {
        const isQuarterBeat = step % subdivisionsPerBeat === 0;
        if (isQuarterBeat) {
          const alternateStep = Math.floor(step / subdivisionsPerBeat);
          if (alternateStep % 2 === 0) {
            notesToPlay.push(bassNote);
          } else {
            const secondBass = upperNotes.length > 0 ? upperNotes[0] : bassNote + 7;
            notesToPlay.push(secondBass);
          }
        } else {
          const noteIndex = step % Math.max(1, upperNotes.length);
          const pickedNote = upperNotes[noteIndex] || bassNote + 12;
          notesToPlay.push(pickedNote);

          // Big Thief double-stop probability
          if (Math.random() * 100 < groove.doubleStopProb && upperNotes.length > 1) {
            const extraIndex = (noteIndex + 1) % upperNotes.length;
            notesToPlay.push(upperNotes[extraIndex]);
            isDouble = true;
          }
        }
      } else if (groove.strumDirection === 'down' || groove.artistDna === 'microphones' || groove.artistDna === 'neutral_milk_hotel') {
        if (step % 2 === 0) {
          notesToPlay = [...chordNotes];
        } else if (Math.random() * 100 < 60) {
          notesToPlay = upperNotes.slice(0, 3);
        }
      } else if (groove.strumDirection === 'up') {
        const noteIdx = step % Math.max(1, chordNotes.length);
        notesToPlay.push(chordNotes[noteIdx]);
      } else if (groove.strumDirection === 'random') {
        const count = Math.random() < 0.3 ? 2 : 1;
        for (let c = 0; c < count; c++) {
          const randNote = chordNotes[Math.floor(Math.random() * chordNotes.length)];
          if (!notesToPlay.includes(randNote)) notesToPlay.push(randNote);
        }
      } else {
        const noteIdx = step % chordNotes.length;
        notesToPlay.push(chordNotes[noteIdx]);
      }

      if (notesToPlay.length === 0) continue;

      const strumOffsetBeats = msToBeats(groove.strumSpeedMs);

      let baseVelocity = isDownbeat ? 108 : isBackbeat ? 95 : 82;
      if (groove.fuzzDrive > 50) baseVelocity += Math.round((groove.fuzzDrive - 50) * 0.3);

      const velJitter = Math.round((Math.random() - 0.5) * groove.velocityJitter * 1.5);
      const velocity = Math.min(127, Math.max(25, baseVelocity + velJitter));

      const durationBeats = isDownbeat ? stepDurationBeats * 2.8 : stepDurationBeats * 1.8;

      notesToPlay.forEach((midi, noteIdx) => {
        const flamOffset = noteIdx * strumOffsetBeats;
        events.push({
          id: `ev-${chordIdx}-${step}-${noteIdx}`,
          note: midi,
          noteName: midiToNoteName(midi),
          startBeat: parseFloat((startBeat + flamOffset).toFixed(4)),
          durationBeats: parseFloat(durationBeats.toFixed(4)),
          velocity: Math.min(127, Math.max(1, velocity - noteIdx * 4)),
          chordName: chord.name,
          isDoubleStop: isDouble,
        });
      });
    }

    currentAbsoluteBeat += beats;
  });

  events.sort((a, b) => a.startBeat - b.startBeat);
  return events;
}

/**
 * Generates project-level tempo map markers to sync REAPER grid with free-time acoustic take
 */
export function generateTempoMapFromTransients(
  transients: number[],
  sampleRate: number = 44100
): { markers: TempoMapMarker[]; averageBpm: number } {
  if (transients.length < 2) {
    return {
      averageBpm: 80,
      markers: [
        { markerIndex: 1, barNumber: 1, timeSec: 0, beatPosition: 0, bpm: 80, timeSignature: '4/4', isDownbeat: true },
      ],
    };
  }

  const markers: TempoMapMarker[] = [];
  const deltas: number[] = [];

  for (let i = 1; i < transients.length; i++) {
    const dt = transients[i] - transients[i - 1];
    if (dt > 0.25 && dt < 2.5) {
      deltas.push(dt);
    }
  }

  const avgDelta = deltas.length > 0 ? deltas.reduce((a, b) => a + b, 0) / deltas.length : 0.75;
  const averageBpm = Math.round(Math.min(220, Math.max(40, 60 / avgDelta)));

  transients.forEach((tSec, idx) => {
    let instBpm = averageBpm;
    if (idx < transients.length - 1) {
      const dt = transients[idx + 1] - tSec;
      if (dt > 0.2 && dt < 2.0) {
        instBpm = Math.round(60 / dt);
      }
    }

    markers.push({
      markerIndex: idx + 1,
      barNumber: idx + 1,
      timeSec: parseFloat(tSec.toFixed(4)),
      beatPosition: idx * 4,
      bpm: instBpm,
      timeSignature: '4/4',
      isDownbeat: true,
    });
  });

  return { markers, averageBpm };
}
