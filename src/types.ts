// Beach Boys Harmonizer Type Definitions

export type VoiceId = 'falsetto' | 'tenor1' | 'lead' | 'baritone' | 'bass';

export type VowelType = 'ooh' | 'aah' | 'doo' | 'wah' | 'ee' | 'mm';

export type HarmonyStyle =
  | 'pet_sounds'
  | 'four_freshmen'
  | 'surfer_girl'
  | 'good_vibrations'
  | 'california_girls'
  | 'smile_poly';

export interface VocalVoiceState {
  id: VoiceId;
  name: string;
  singer: string;
  role: string;
  range: [number, number]; // [minMidi, maxMidi]
  volume: number;          // 0.0 - 1.0
  pan: number;             // -1.0 (hard left) to 1.0 (hard right)
  mute: boolean;
  solo: boolean;
  detuneCents: number;     // -25 to +25 cents for vocal richness
  vowel: VowelType;
  color: string;
}

export interface TapeAcoustics {
  wowFlutter: number;     // 0 - 100%
  tapeWarmth: number;     // 0 - 100%
  chamberReverb: number;  // 0 - 100% Western Recorders Echo Chamber #2
  stereoWidth: number;    // 0 (1966 Mono) to 100% (Modern Wide Stereo)
  masterVolume: number;   // 0 - 100%
}

export interface BeachBoysChord {
  id: string;
  name: string;
  numeral: string;
  root: string;
  quality: string;
  inversion: string;
  durationBeats: number;
  lyricsSnippet?: string;
  vowel: VowelType;
  notes: {
    falsetto: number; // MIDI pitch
    tenor1: number;
    lead: number;
    baritone: number;
    bass: number;
  };
  voicingDescription?: string;
}

export interface SongPreset {
  id: string;
  title: string;
  album: string;
  year: number;
  key: string;
  tempo: number;
  harmonyStyle: HarmonyStyle;
  description: string;
  funFact: string;
  chords: BeachBoysChord[];
}

export interface ExtendedSongPreset extends SongPreset {
  artistDna?: string;
  tuning?: string;
  timeSignature?: string;
  category?: string;
  tempoMapPoints?: number;
  features?: string[];
}

// Backwards compatibility types for auxiliary modules
export type VoiceMember = 'brian' | 'carl' | 'al' | 'dennis' | 'mike';

export interface HarmNote {
  midi: number;
  freq: number;
  noteName: string;
  intervalName: string;
  role: string;
  isMelody?: boolean;
}

export interface VocalChordStack {
  id: string;
  chordName: string;
  numeral: string;
  measureLength: number;
  lyricSyllable: string;
  vowel: VowelType;
  notes: Record<VoiceMember, HarmNote>;
  voicingNotes: string;
  romanNumeral?: string;
  inversionLabel?: string;
}

// ==========================================
// REAPER Neural Songwriter Studio Master Types
// ==========================================

export type ArtistDnaId =
  | 'elliott_smith'
  | 'bob_dylan'
  | 'j_dilla'
  | 'big_thief'
  | 'radiohead'
  | 'beach_boys'
  | 'microphones'
  | 'neutral_milk_hotel'
  | 'godspeed'
  | 'custom';

export interface GrooveMatrixConfig {
  artistDna: ArtistDnaId;
  looseness: number;         // 0 (laser grid) to 100% (drunk push/pull)
  backbeatLagMs: number;     // -15ms to +45ms delay on beats 2 & 4 (J Dilla / D'Angelo swing)
  meterChaos: number;        // 0 to 100% (Low: 2/4, 3/4, 6/4 Dylan holds; Med: 5/4, 7/4; High: 3/8, 5/8, 7/8; Extreme: 1-beat & 9-beat drones)
  doubleStopProb: number;    // 0 to 100% (Big Thief dual string pluck probability)
  polyrhythmDivisor: number; // 3, 4, 5, 7 (Radiohead phasing arpeggiation)
  strumSpeedMs: number;      // 5ms to 50ms flam between chord strings
  strumDirection: 'travis' | 'down' | 'up' | 'alternate' | 'random';
  velocityJitter: number;    // 0 to 45 MIDI velocity fluctuation
  fuzzDrive: number;         // 0 to 100% (The Microphones / NMH acoustic body drive)
}

export interface TuningString {
  stringNumber: number; // 1 to 6 or 7
  noteName: string;
  midiNumber: number;
}

export interface GuitarTuning {
  id: string;
  name: string;
  artistHint: string;
  strings: TuningString[];
}

export interface ChordVoicing {
  id: string;
  name: string;
  numeral: string;
  beats: number;             // e.g. 4 for 4/4, 6 for Dylan lyric hold, 3.5 for 7/8 cut
  absoluteBeatStart: number; // Timeline position in beats
  midiNotes: number[];       // MIDI pitch values
  bassNote?: number;         // Lowest root/inversion bass note
  inversion: number;         // 0 = Root, 1 = 1st, 2 = 2nd, 3 = 3rd
  extension: string;         // 'none' | 'add9' | 'sus2' | 'sus4' | 'maj7' | 'm11' | 'slash'
  voicingDescription?: string;
}

export interface MidiNoteEvent {
  id: string;
  note: number;              // MIDI pitch 0-127
  noteName: string;          // e.g. "D3", "F#3"
  startBeat: number;         // Absolute beat float with micro-timing
  durationBeats: number;     // Length in beats float
  velocity: number;          // 1-127
  chordName?: string;
  isDoubleStop?: boolean;
}

export interface TempoMapMarker {
  markerIndex: number;
  barNumber: number;
  timeSec: number;
  beatPosition: number;
  bpm: number;
  timeSignature: string;
  isDownbeat: boolean;
}

export interface SongwritingSession {
  id: string;
  name: string;
  tempo: number;
  timeSignature: string;
  tuning: GuitarTuning;
  capoFret: number;
  chords: ChordVoicing[];
  grooveMatrix: GrooveMatrixConfig;
  notes: MidiNoteEvent[];
  tempoMap: TempoMapMarker[];
  soundMode: 'acoustic_guitar' | 'electric_clean' | 'beach_boys_vocal' | 'warm_keys';
}

export interface ArtistDnaPreset {
  id: ArtistDnaId;
  name: string;
  tagline: string;
  description: string;
  tempo: number;
  recommendedTuning: string;
  groove: GrooveMatrixConfig;
  defaultChords: ChordVoicing[];
}

export interface VocalVoiceConfig {
  id: string;
  name: string;
  role: 'falsetto_lead' | 'tenor' | 'high_baritone' | 'baritone' | 'bass';
  midiNote: number;
  vowel: 'ooh' | 'aah' | 'doo' | 'bah' | 'ee';
  volume: number;
  pan: number;
  vibratoDepth: number;
  vibratoSpeed: number;
  mute: boolean;
  solo: boolean;
}

export interface BeachBoysHarmonizerPreset {
  id: string;
  name: string;
  year: number;
  album: string;
  key: string;
  tempo: number;
  description: string;
  chords: {
    name: string;
    numeral: string;
    beats: number;
    midiNotes: number[];
    bassNote: number;
  }[];
}

export interface VocalPartTrack {
  trackName: string;
  voiceId: string;
  notes: MidiNoteEvent[];
}

