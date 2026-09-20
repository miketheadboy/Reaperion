import { BeachBoysChord, SongPreset } from '../types';
import { midiToNoteName } from './harmonyEngine';

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

interface NoteEvent {
  tick: number;
  type: 'on' | 'off';
  note: number;
  velocity: number;
}

/**
 * Builds a 5-track Standard MIDI File (SMF Format 1)
 * Tracks:
 * 0: Tempo / Conductor
 * 1: Brian (Falsetto)
 * 2: Carl (1st Tenor)
 * 3: Al (Lead / 2nd Tenor)
 * 4: Dennis/Bruce (Baritone)
 * 5: Mike Love (Bass)
 */
export function buildMultiTrackBeachBoysMidi(
  chords: BeachBoysChord[],
  bpm: number = 78,
  songTitle: string = 'Beach Boys Vocal Arrangement'
): Uint8Array {
  const PPQ = 480;

  const voiceKeys = ['falsetto', 'tenor1', 'lead', 'baritone', 'bass'] as const;
  const voiceNames = [
    'Brian (Falsetto)',
    'Carl (1st Tenor)',
    'Al / Brian (Lead)',
    'Dennis (Baritone)',
    'Mike Love (Bass)',
  ];

  // Track 0: Conductor Track (Tempo)
  const conductorBytes: number[] = [];
  conductorBytes.push(...writeVarLen(0));
  conductorBytes.push(0xff, 0x03, songTitle.length);
  for (let i = 0; i < songTitle.length; i++) {
    conductorBytes.push(songTitle.charCodeAt(i));
  }

  // Set Tempo Meta Event (microseconds per quarter note)
  const mpqn = Math.round(60000000 / Math.max(20, bpm));
  conductorBytes.push(...writeVarLen(0));
  conductorBytes.push(0xff, 0x51, 0x03);
  conductorBytes.push((mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff);

  // End of Track 0
  conductorBytes.push(...writeVarLen(0));
  conductorBytes.push(0xff, 0x2f, 0x00);

  // Build the 5 voice tracks
  const trackByteArrays: number[][] = [];

  voiceKeys.forEach((key, voiceIndex) => {
    const tBytes: number[] = [];
    const tName = voiceNames[voiceIndex];

    // Track Name
    tBytes.push(...writeVarLen(0));
    tBytes.push(0xff, 0x03, tName.length);
    for (let i = 0; i < tName.length; i++) {
      tBytes.push(tName.charCodeAt(i));
    }

    // Program Change: Ooh/Aah Choral Choir (General MIDI 52 = Choir Aahs, 53 = Voice Oohs)
    tBytes.push(...writeVarLen(0));
    tBytes.push(0xc0 | voiceIndex, 53); // Voice Oohs on respective MIDI channel

    // Generate note events
    const rawEvents: NoteEvent[] = [];
    let currentBeat = 0;

    for (const chord of chords) {
      const pitch = chord.notes[key];
      const startTick = Math.round(currentBeat * PPQ);
      const durationTicks = Math.round(chord.durationBeats * PPQ) - 10; // slight gap
      const endTick = startTick + durationTicks;

      rawEvents.push({
        tick: startTick,
        type: 'on',
        note: Math.min(127, Math.max(0, pitch)),
        velocity: voiceIndex === 0 ? 100 : voiceIndex === 4 ? 108 : 95,
      });

      rawEvents.push({
        tick: endTick,
        type: 'off',
        note: Math.min(127, Math.max(0, pitch)),
        velocity: 0,
      });

      currentBeat += chord.durationBeats;
    }

    // Sort events
    rawEvents.sort((a, b) => {
      if (a.tick !== b.tick) return a.tick - b.tick;
      if (a.type === 'off' && a.type !== b.type) return -1;
      return 1;
    });

    let prevTick = 0;
    for (const ev of rawEvents) {
      const delta = Math.max(0, ev.tick - prevTick);
      prevTick = ev.tick;

      tBytes.push(...writeVarLen(delta));
      if (ev.type === 'on') {
        tBytes.push(0x90 | voiceIndex, ev.note, ev.velocity);
      } else {
        tBytes.push(0x80 | voiceIndex, ev.note, 0);
      }
    }

    // End of track
    tBytes.push(...writeVarLen(0));
    tBytes.push(0xff, 0x2f, 0x00);

    trackByteArrays.push(tBytes);
  });

  // Assemble full SMF Format 1 (multi-track)
  const numTracks = 1 + trackByteArrays.length; // Conductor + 5 voices = 6 tracks
  const header = [
    0x4d, 0x54, 0x68, 0x64, // MThd
    0x00, 0x00, 0x00, 0x06, // Length
    0x00, 0x01,             // Format 1
    (numTracks >> 8) & 0xff, numTracks & 0xff,
    (PPQ >> 8) & 0xff, PPQ & 0xff,
  ];

  // Helper to make MTrk chunk
  function makeTrackChunk(bytes: number[]): number[] {
    const len = bytes.length;
    return [
      0x4d, 0x54, 0x72, 0x6b, // MTrk
      (len >> 24) & 0xff,
      (len >> 16) & 0xff,
      (len >> 8) & 0xff,
      len & 0xff,
      ...bytes,
    ];
  }

  const allChunks: number[] = [...header, ...makeTrackChunk(conductorBytes)];
  for (const tb of trackByteArrays) {
    allChunks.push(...makeTrackChunk(tb));
  }

  return new Uint8Array(allChunks);
}

/**
 * Generates a native REAPER ReaScript (Python) that directly creates 5 separate vocal tracks
 * with vintage color-coding, track naming, and injects the MIDI note takes directly!
 */
export function generateReaperReaScript(preset: SongPreset): string {
  const chordsJson = JSON.stringify(preset.chords, null, 2);

  return `# ==============================================================================
# REAPER ReaScript: Beach Boys 5-Part Vocal Harmonizer Bridge
# Song: ${preset.title} (${preset.album}, ${preset.year})
# Harmonic Style: ${preset.harmonyStyle} | Key: ${preset.key} | Tempo: ${preset.tempo} BPM
# ==============================================================================
# Instructions:
# 1. In REAPER, go to Actions -> Show action list -> New action -> Load ReaScript.
# 2. Select this .py file and run it.
# 3. REAPER will automatically create 5 colored tracks:
#    - Brian (Falsetto) [Gold]
#    - Carl (1st Tenor) [Sky Blue]
#    - Al / Brian (Lead) [Emerald]
#    - Dennis (Baritone) [Purple]
#    - Mike Love (Bass) [Rose]
#    and insert all MIDI vocal takes onto your timeline at the edit cursor!
# ==============================================================================

import json
import reaper_python as R

CHORD_DATA = ${chordsJson}
BPM = ${preset.tempo}

VOICE_CONFIGS = [
    {"key": "falsetto", "name": "Brian (Falsetto)", "color": R.ColorToNative(245, 158, 11)|0x1000000},
    {"key": "tenor1",   "name": "Carl (1st Tenor)",   "color": R.ColorToNative(56, 189, 248)|0x1000000},
    {"key": "lead",     "name": "Al / Brian (Lead)",  "color": R.ColorToNative(16, 185, 129)|0x1000000},
    {"key": "baritone", "name": "Dennis (Baritone)",  "color": R.ColorToNative(168, 85, 247)|0x1000000},
    {"key": "bass",     "name": "Mike Love (Bass)",   "color": R.ColorToNative(244, 63, 94)|0x1000000},
]

def main():
    R.Undo_BeginBlock()
    cursor_pos = R.GetCursorPosition()
    
    # Calculate seconds per beat
    sec_per_beat = 60.0 / BPM
    total_beats = sum(c.get("durationBeats", 4) for c in CHORD_DATA)
    total_duration_sec = total_beats * sec_per_beat
    
    # Create master Beach Boys Vocal Folder
    folder_idx = R.CountTracks(0)
    R.InsertTrackAtIndex(folder_idx, True)
    folder_track = R.GetTrack(0, folder_idx)
    R.GetSetMediaTrackInfo_String(folder_track, "P_NAME", "Beach Boys Vocal Choir [Folder]", True)
    R.SetMediaTrackInfo_Value(folder_track, "I_FOLDERDEPTH", 1) # Start folder
    R.SetMediaTrackInfo_Value(folder_track, "I_CUSTOMCOLOR", R.ColorToNative(251, 191, 36)|0x1000000)
    
    for i, v in enumerate(VOICE_CONFIGS):
        track_idx = R.CountTracks(0)
        R.InsertTrackAtIndex(track_idx, True)
        track = R.GetTrack(0, track_idx)
        
        # Name and color track
        R.GetSetMediaTrackInfo_String(track, "P_NAME", v["name"], True)
        R.SetMediaTrackInfo_Value(track, "I_CUSTOMCOLOR", v["color"])
        if i == len(VOICE_CONFIGS) - 1:
            R.SetMediaTrackInfo_Value(track, "I_FOLDERDEPTH", -1) # Close folder
            
        # Create MIDI Item
        item = R.CreateNewMIDIItemInProj(track, cursor_pos, cursor_pos + total_duration_sec, False)
        take = R.GetActiveTake(item)
        
        # Plot notes
        current_beat = 0.0
        for chord in CHORD_DATA:
            beats = float(chord.get("durationBeats", 4))
            pitch = int(chord["notes"][v["key"]])
            
            start_ppq = R.MIDI_GetPPQPosFromProjQN(take, (cursor_pos / sec_per_beat) + current_beat)
            end_ppq   = R.MIDI_GetPPQPosFromProjQN(take, (cursor_pos / sec_per_beat) + current_beat + beats - 0.1)
            
            vel = 100 if v["key"] == "falsetto" else 110 if v["key"] == "bass" else 95
            R.MIDI_InsertNote(take, False, False, int(start_ppq), int(end_ppq), 0, pitch, vel, False)
            current_beat += beats
            
        R.MIDI_Sort(take)

    R.UpdateArrange()
    R.Undo_EndBlock("Inject Beach Boys 5-Part Vocal Arrangement", -1)
    R.ShowMessageBox("Successfully created 5 Beach Boys vocal tracks with MIDI takes in REAPER!", "Beach Boys Harmonizer", 0)

if __name__ == "__main__":
    main()
`;
}

/**
 * Lead sheet representation
 */
export function generateLeadSheetText(preset: SongPreset): string {
  let output = `========================================================================
BEACH BOYS VOCAL HARMONY LEAD SHEET
Song: ${preset.title} (${preset.album}, ${preset.year})
Harmonic Style: ${preset.harmonyStyle.toUpperCase()}
Key: ${preset.key} | Tempo: ${preset.tempo} BPM
========================================================================

VOICE ARRANGEMENT BREAKDOWN:
- Brian (Falsetto): Highest floating voice, adds sweet 9ths, 7ths, and falsetto swells
- Carl (1st Tenor): Sweet upper middle harmonic layer
- Al Jardine / Brian (Lead): Central melodic anchor
- Dennis / Bruce (Baritone): Inner voice providing close 2nd/3rd intervals
- Mike Love (Bass): Punchy bottom bass vocal (roots and pedal tones)

CHORD PROGRESSION & VOICING DETAILS:
`;

  preset.chords.forEach((c: BeachBoysChord, idx: number) => {
    output += `\n[Bar ${idx + 1}] ${c.name} (${c.numeral}) - ${c.inversion}\n`;
    if (c.lyricsSnippet) output += `  Lyrics: "${c.lyricsSnippet}"\n`;
    output += `  Vowel: /${c.vowel.toUpperCase()}/ | Duration: ${c.durationBeats} beats\n`;
    output += `  Notes:\n`;
    output += `    Brian (Falsetto): ${midiToNoteName(c.notes.falsetto)} (MIDI ${c.notes.falsetto})\n`;
    output += `    Carl (1st Tenor): ${midiToNoteName(c.notes.tenor1)} (MIDI ${c.notes.tenor1})\n`;
    output += `    Al (Lead):        ${midiToNoteName(c.notes.lead)} (MIDI ${c.notes.lead})\n`;
    output += `    Dennis (Baritone): ${midiToNoteName(c.notes.baritone)} (MIDI ${c.notes.baritone})\n`;
    output += `    Mike (Bass):      ${midiToNoteName(c.notes.bass)} (MIDI ${c.notes.bass})\n`;
    if (c.voicingDescription) {
      output += `  Voicing Notes: ${c.voicingDescription}\n`;
    }
  });

  output += `\n========================================================================\n`;
  output += `Arranged with REAPER Beach Boys Harmonizer Studio Engine\n`;
  return output;
}
