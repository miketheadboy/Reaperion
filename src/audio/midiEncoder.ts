import { MidiNoteEvent } from '../types';

function writeVarLen(value: number): number[] {
  let buffer = value & 0x7f;
  const bytes: number[] = [];
  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }
  return bytes;
}

interface RawMidiEvent {
  tick: number;
  type: 'on' | 'off';
  note: number;
  velocity: number;
}

/**
 * Builds a Standard MIDI File (SMF Format 0) from an array of MidiNoteEvents
 */
export function buildStandardMidi(
  events: MidiNoteEvent[],
  bpm: number = 78,
  trackName: string = 'Neural Songwriter Take'
): Uint8Array {
  const PPQ = 480;
  const rawEvents: RawMidiEvent[] = [];

  events.forEach((ev) => {
    const startTick = Math.round(ev.startBeat * PPQ);
    const durationTicks = Math.max(1, Math.round(ev.durationBeats * PPQ));
    const endTick = startTick + durationTicks;

    rawEvents.push({
      tick: startTick,
      type: 'on',
      note: ev.note,
      velocity: ev.velocity,
    });

    rawEvents.push({
      tick: endTick,
      type: 'off',
      note: ev.note,
      velocity: 0,
    });
  });

  // Sort events chronologically
  rawEvents.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    return a.type === 'off' ? -1 : 1;
  });

  const trackBytes: number[] = [];

  // Track Name Meta Event
  trackBytes.push(...writeVarLen(0));
  trackBytes.push(0xff, 0x03, trackName.length);
  for (let i = 0; i < trackName.length; i++) {
    trackBytes.push(trackName.charCodeAt(i));
  }

  // Set Tempo Meta Event (microseconds per quarter note)
  const usPerBeat = Math.round(60000000 / Math.max(30, bpm));
  trackBytes.push(...writeVarLen(0));
  trackBytes.push(
    0xff,
    0x51,
    0x03,
    (usPerBeat >> 16) & 0xff,
    (usPerBeat >> 8) & 0xff,
    usPerBeat & 0xff
  );

  let lastTick = 0;
  rawEvents.forEach((e) => {
    const delta = e.tick - lastTick;
    trackBytes.push(...writeVarLen(Math.max(0, delta)));
    if (e.type === 'on') {
      trackBytes.push(0x90, e.note, Math.min(127, Math.max(1, e.velocity)));
    } else {
      trackBytes.push(0x80, e.note, 0);
    }
    lastTick = e.tick;
  });

  // End of track meta event
  trackBytes.push(...writeVarLen(PPQ));
  trackBytes.push(0xff, 0x2f, 0x00);

  // File Header: MThd, length=6, format=0, nTracks=1, division=480
  const header = [
    0x4d, 0x54, 0x68, 0x64,
    0x00, 0x00, 0x00, 0x06,
    0x00, 0x00,
    0x00, 0x01,
    (PPQ >> 8) & 0xff, PPQ & 0xff
  ];

  // Track Header: MTrk, length
  const tLen = trackBytes.length;
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b,
    (tLen >> 24) & 0xff,
    (tLen >> 16) & 0xff,
    (tLen >> 8) & 0xff,
    tLen & 0xff
  ];

  return new Uint8Array([...header, ...trackHeader, ...trackBytes]);
}

/**
 * Creates a base64 Data URI for drag-and-drop
 */
export function createMidiDataUri(
  events: MidiNoteEvent[],
  bpm: number,
  trackName: string
): string {
  const bytes = buildStandardMidi(events, bpm, trackName);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/midi;base64,${btoa(binary)}`;
}

/**
 * Triggers standard browser download of .mid file
 */
export function downloadMidiFile(
  events: MidiNoteEvent[],
  bpm: number,
  filename: string = 'REAPER_Songwriter_Take.mid'
): void {
  const bytes = buildStandardMidi(events, bpm, filename.replace('.mid', ''));
  const blob = new Blob([bytes as any], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
