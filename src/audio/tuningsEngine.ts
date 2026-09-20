import { GuitarTuning, TuningString } from '../types';
import { NOTE_NAMES, midiToNoteName } from './harmonyEngine';

export interface GuitarVoicingCalculation {
  chordName: string;
  tuningId: string;
  capoFret: number;
  frets: (number | 'x')[]; // Strings 6 down to 1 (Low to High)
  notes: number[];         // Resulting MIDI pitches
  noteNames: string[];     // Note names (e.g. ["D3", "A3", "D4", "F#4"])
  intervalLabels: string[];// ["Root", "5th", "Root", "3rd"]
  difficulty: 'Easy Open' | 'Moderate' | 'Barre' | 'Drone Stretch';
  description: string;
}

export const GUITAR_TUNING_PRESETS: GuitarTuning[] = [
  {
    id: 'standard',
    name: 'Standard (E A D G B E)',
    artistHint: 'Traditional, Beatles, Radiohead, Beach Boys',
    strings: [
      { stringNumber: 6, noteName: 'E2', midiNumber: 40 },
      { stringNumber: 5, noteName: 'A2', midiNumber: 45 },
      { stringNumber: 4, noteName: 'D3', midiNumber: 50 },
      { stringNumber: 3, noteName: 'G3', midiNumber: 55 },
      { stringNumber: 2, noteName: 'B3', midiNumber: 59 },
      { stringNumber: 1, noteName: 'E4', midiNumber: 64 },
    ],
  },
  {
    id: 'dadgad',
    name: 'DADGAD (Celtic / Drone)',
    artistHint: 'Big Thief (Adrianne Lenker), Jimmy Page, Bert Jansch',
    strings: [
      { stringNumber: 6, noteName: 'D2', midiNumber: 38 },
      { stringNumber: 5, noteName: 'A2', midiNumber: 45 },
      { stringNumber: 4, noteName: 'D3', midiNumber: 50 },
      { stringNumber: 3, noteName: 'G3', midiNumber: 55 },
      { stringNumber: 2, noteName: 'A3', midiNumber: 57 },
      { stringNumber: 1, noteName: 'D4', midiNumber: 62 },
    ],
  },
  {
    id: 'open_d',
    name: 'Open D (D A D F# A D)',
    artistHint: 'Bob Dylan (Blood on the Tracks), Joni Mitchell, Elmore James',
    strings: [
      { stringNumber: 6, noteName: 'D2', midiNumber: 38 },
      { stringNumber: 5, noteName: 'A2', midiNumber: 45 },
      { stringNumber: 4, noteName: 'D3', midiNumber: 50 },
      { stringNumber: 3, noteName: 'F#3', midiNumber: 54 },
      { stringNumber: 2, noteName: 'A3', midiNumber: 57 },
      { stringNumber: 1, noteName: 'D4', midiNumber: 62 },
    ],
  },
  {
    id: 'open_g',
    name: 'Open G (D G D G B D)',
    artistHint: 'Keith Richards (Rolling Stones), Joni Mitchell, Muddy Waters',
    strings: [
      { stringNumber: 6, noteName: 'D2', midiNumber: 38 },
      { stringNumber: 5, noteName: 'G2', midiNumber: 43 },
      { stringNumber: 4, noteName: 'D3', midiNumber: 50 },
      { stringNumber: 3, noteName: 'G3', midiNumber: 55 },
      { stringNumber: 2, noteName: 'B3', midiNumber: 59 },
      { stringNumber: 1, noteName: 'D4', midiNumber: 62 },
    ],
  },
  {
    id: 'drop_d',
    name: 'Drop D (D A D G B E)',
    artistHint: 'Radiohead, Neil Young, Foo Fighters, Soundgarden',
    strings: [
      { stringNumber: 6, noteName: 'D2', midiNumber: 38 },
      { stringNumber: 5, noteName: 'A2', midiNumber: 45 },
      { stringNumber: 4, noteName: 'D3', midiNumber: 50 },
      { stringNumber: 3, noteName: 'G3', midiNumber: 55 },
      { stringNumber: 2, noteName: 'B3', midiNumber: 59 },
      { stringNumber: 1, noteName: 'E4', midiNumber: 64 },
    ],
  },
  {
    id: 'nick_drake',
    name: 'Pink Moon (C G C F C E)',
    artistHint: 'Nick Drake ("Pink Moon", "Place to Be"), fragile folk resonance',
    strings: [
      { stringNumber: 6, noteName: 'C2', midiNumber: 36 },
      { stringNumber: 5, noteName: 'G2', midiNumber: 43 },
      { stringNumber: 4, noteName: 'C3', midiNumber: 48 },
      { stringNumber: 3, noteName: 'F3', midiNumber: 53 },
      { stringNumber: 2, noteName: 'C4', midiNumber: 60 },
      { stringNumber: 1, noteName: 'E4', midiNumber: 64 },
    ],
  },
  {
    id: 'elliott_smith',
    name: 'D Standard / 1 Step Down (D G C F A D)',
    artistHint: 'Elliott Smith (Either/Or, XO), Nirvana, heavy low tension',
    strings: [
      { stringNumber: 6, noteName: 'D2', midiNumber: 38 },
      { stringNumber: 5, noteName: 'G2', midiNumber: 43 },
      { stringNumber: 4, noteName: 'C3', midiNumber: 48 },
      { stringNumber: 3, noteName: 'F3', midiNumber: 53 },
      { stringNumber: 2, noteName: 'A3', midiNumber: 57 },
      { stringNumber: 1, noteName: 'D4', midiNumber: 62 },
    ],
  },
  {
    id: 'joni_mitchell',
    name: 'Both Sides Now (E B E G# B E)',
    artistHint: 'Joni Mitchell, Open E bright shimmer',
    strings: [
      { stringNumber: 6, noteName: 'E2', midiNumber: 40 },
      { stringNumber: 5, noteName: 'B2', midiNumber: 47 },
      { stringNumber: 4, noteName: 'E3', midiNumber: 52 },
      { stringNumber: 3, noteName: 'G#3', midiNumber: 56 },
      { stringNumber: 2, noteName: 'B3', midiNumber: 59 },
      { stringNumber: 1, noteName: 'E4', midiNumber: 64 },
    ],
  },
  {
    id: 'sonic_youth',
    name: 'Silver Rocket (C G D G C D)',
    artistHint: 'Sonic Youth (Thurston Moore / Lee Ranaldo), post-rock chime',
    strings: [
      { stringNumber: 6, noteName: 'C2', midiNumber: 36 },
      { stringNumber: 5, noteName: 'G2', midiNumber: 43 },
      { stringNumber: 4, noteName: 'D3', midiNumber: 50 },
      { stringNumber: 3, noteName: 'G3', midiNumber: 55 },
      { stringNumber: 2, noteName: 'C4', midiNumber: 60 },
      { stringNumber: 1, noteName: 'D4', midiNumber: 62 },
    ],
  },
  {
    id: 'nashville',
    name: 'Nashville High-Strung (E4 A4 D4 G4 B3 E4)',
    artistHint: 'Pink Floyd ("Comfortably Numb" 12-string chime), The Rolling Stones',
    strings: [
      { stringNumber: 6, noteName: 'E4', midiNumber: 64 },
      { stringNumber: 5, noteName: 'A4', midiNumber: 69 },
      { stringNumber: 4, noteName: 'D4', midiNumber: 74 },
      { stringNumber: 3, noteName: 'G4', midiNumber: 79 },
      { stringNumber: 2, noteName: 'B3', midiNumber: 59 },
      { stringNumber: 1, noteName: 'E4', midiNumber: 64 },
    ],
  },
];

/**
 * Standard pitch definitions for building custom 6-string tunings
 */
export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function buildCustomTuning(pitches: number[], name: string = 'Custom Tuning'): GuitarTuning {
  return {
    id: 'custom_' + Date.now(),
    name,
    artistHint: 'Custom User Configured Tuning',
    strings: pitches.map((p, idx) => ({
      stringNumber: 6 - idx,
      noteName: midiToNoteName(p),
      midiNumber: p,
    })),
  };
}

/**
 * Parses chord root note name and returns chromatic index (0-11)
 */
export function getRootChromaticIndex(chordName: string): number {
  const match = chordName.match(/^([A-G][#b]?)/);
  if (!match) return 0;
  let root = match[1];
  if (root === 'Db') root = 'C#';
  if (root === 'Eb') root = 'D#';
  if (root === 'Gb') root = 'F#';
  if (root === 'Ab') root = 'G#';
  if (root === 'Bb') root = 'A#';
  const idx = NOTE_NAMES.indexOf(root);
  return idx >= 0 ? idx : 0;
}

/**
 * Generates an authentic playable guitar fret voicing for a chord in a given tuning + capo.
 */
export function calculateGuitarVoicing(
  chordName: string,
  tuning: GuitarTuning,
  capoFret: number = 0
): GuitarVoicingCalculation {
  const rootIdx = getRootChromaticIndex(chordName);
  const isMinor = chordName.includes('m') && !chordName.includes('maj');
  const is7th = chordName.includes('7');
  const isMaj7 = chordName.includes('maj7') || chordName.includes('M7');
  const isSlash = chordName.includes('/');

  // Target pitch classes (mod 12)
  const rootClass = rootIdx;
  const thirdClass = (rootIdx + (isMinor ? 3 : 4)) % 12;
  const fifthClass = (rootIdx + 7) % 12;
  const seventhClass = isMaj7 ? (rootIdx + 11) % 12 : is7th ? (rootIdx + 10) % 12 : null;

  const targetPitchClasses = [rootClass, thirdClass, fifthClass];
  if (seventhClass !== null) targetPitchClasses.push(seventhClass);

  // Parse slash bass note if present
  let slashBassClass: number | null = null;
  if (isSlash) {
    const slashParts = chordName.split('/');
    if (slashParts.length > 1) {
      slashBassClass = getRootChromaticIndex(slashParts[1].trim());
    }
  }

  // Base string open pitches with capo applied
  const openPitches = tuning.strings.map((s) => s.midiNumber + capoFret);

  // Specialized voicing library for iconic tunings
  if (tuning.id === 'dadgad') {
    // DADGAD characteristic ringing open-string drone fingerings
    if (chordName.startsWith('D')) {
      const frets: (number | 'x')[] = isMinor ? [0, 0, 0, 3, 0, 0] : [0, 0, 0, 2, 0, 0];
      return createVoicingCalc(chordName, tuning.id, capoFret, frets, openPitches, 'Easy Open', 'Lush Adrianne Lenker / Celtic ringing open D drone');
    }
    if (chordName.startsWith('G')) {
      const frets: (number | 'x')[] = [5, 2, 0, 0, 0, 0];
      return createVoicingCalc(chordName, tuning.id, capoFret, frets, openPitches, 'Easy Open', 'Big Thief modal G drone with open ringing A & D strings');
    }
    if (chordName.startsWith('A')) {
      const frets: (number | 'x')[] = ['x', 0, 2, 2, 0, 0];
      return createVoicingCalc(chordName, tuning.id, capoFret, frets, openPitches, 'Easy Open', 'Suspended A drone with high octave unison chime');
    }
    if (chordName.startsWith('B') || chordName.startsWith('Bm')) {
      const frets: (number | 'x')[] = ['x', 2, 4, 4, 0, 0];
      return createVoicingCalc(chordName, tuning.id, capoFret, frets, openPitches, 'Moderate', 'Intimate Bm7 drone voicing with chiming top notes');
    }
  }

  if (tuning.id === 'open_d') {
    // Open D: 000000 is D major
    if (chordName.startsWith('D')) {
      const frets: (number | 'x')[] = isMinor ? [0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0];
      return createVoicingCalc(chordName, tuning.id, capoFret, frets, openPitches, 'Easy Open', 'Pure Bob Dylan Blood on the Tracks resonant open strum');
    }
    if (chordName.startsWith('G')) {
      const frets: (number | 'x')[] = [5, 5, 5, 5, 5, 5];
      return createVoicingCalc(chordName, tuning.id, capoFret, frets, openPitches, 'Barre', 'Folk IV chord barred at 5th fret across all strings');
    }
    if (chordName.startsWith('A')) {
      const frets: (number | 'x')[] = [7, 7, 7, 7, 7, 7];
      return createVoicingCalc(chordName, tuning.id, capoFret, frets, openPitches, 'Barre', 'Dominant V chord barred at 7th fret');
    }
  }

  if (tuning.id === 'drop_d') {
    if (chordName.startsWith('D')) {
      const frets: (number | 'x')[] = isMinor ? [0, 0, 0, 2, 3, 1] : [0, 0, 0, 2, 3, 2];
      return createVoicingCalc(chordName, tuning.id, capoFret, frets, openPitches, 'Easy Open', 'Deep low D power bass with sweet open ring');
    }
    if (chordName.startsWith('G')) {
      const frets: (number | 'x')[] = [5, 2, 0, 0, 3, 3];
      return createVoicingCalc(chordName, tuning.id, capoFret, frets, openPitches, 'Moderate', 'Drop D G chord holding 5th fret on the low D string');
    }
  }

  // General Algorithmic Fret Finder for any tuning + chord
  const chosenFrets: (number | 'x')[] = [];

  for (let strIdx = 0; strIdx < 6; strIdx++) {
    const stringBaseMidi = openPitches[strIdx];

    // Priority for 6th/5th string: bass note
    if (strIdx === 0 && slashBassClass !== null) {
      // Find fret matching slash bass
      let foundFret: number | 'x' = 'x';
      for (let f = 0; f <= 5; f++) {
        if ((stringBaseMidi + f) % 12 === slashBassClass) {
          foundFret = f;
          break;
        }
      }
      chosenFrets.push(foundFret);
      continue;
    }

    // Check open string first (fret 0)
    const openClass = stringBaseMidi % 12;
    if (targetPitchClasses.includes(openClass)) {
      chosenFrets.push(0);
      continue;
    }

    // Search frets 1 to 4 for close low-position chords
    let bestFret: number | 'x' = 'x';
    for (let f = 1; f <= 4; f++) {
      const pc = (stringBaseMidi + f) % 12;
      if (targetPitchClasses.includes(pc)) {
        bestFret = f;
        break;
      }
    }

    // If no low fret found, check fret 5
    if (bestFret === 'x') {
      const pc5 = (stringBaseMidi + 5) % 12;
      if (targetPitchClasses.includes(pc5)) {
        bestFret = 5;
      }
    }

    chosenFrets.push(bestFret);
  }

  // Ensure at least 3 strings are sounding
  const soundingCount = chosenFrets.filter((f) => f !== 'x').length;
  if (soundingCount < 3) {
    // Fallback sensible acoustic bar chord
    chosenFrets[0] = 0;
    chosenFrets[1] = 2;
    chosenFrets[2] = 2;
    chosenFrets[3] = isMinor ? 0 : 1;
    chosenFrets[4] = 0;
    chosenFrets[5] = 0;
  }

  return createVoicingCalc(
    chordName,
    tuning.id,
    capoFret,
    chosenFrets,
    openPitches,
    'Easy Open',
    `Custom voiced ${chordName} adapted for ${tuning.name}`
  );
}

function createVoicingCalc(
  chordName: string,
  tuningId: string,
  capoFret: number,
  frets: (number | 'x')[],
  openPitches: number[],
  difficulty: 'Easy Open' | 'Moderate' | 'Barre' | 'Drone Stretch',
  description: string
): GuitarVoicingCalculation {
  const rootIdx = getRootChromaticIndex(chordName);
  const notes: number[] = [];
  const noteNames: string[] = [];
  const intervalLabels: string[] = [];

  frets.forEach((fret, stringIdx) => {
    if (fret === 'x') {
      noteNames.push('Muted');
      intervalLabels.push('—');
    } else {
      const midi = openPitches[stringIdx] + fret;
      notes.push(midi);
      const name = midiToNoteName(midi);
      noteNames.push(name);

      const semitonesFromRoot = ((midi % 12) - rootIdx + 12) % 12;
      let label = 'Other';
      if (semitonesFromRoot === 0) label = 'Root';
      else if (semitonesFromRoot === 3) label = 'b3';
      else if (semitonesFromRoot === 4) label = '3rd';
      else if (semitonesFromRoot === 7) label = '5th';
      else if (semitonesFromRoot === 10) label = 'b7';
      else if (semitonesFromRoot === 11) label = 'maj7';
      else if (semitonesFromRoot === 2) label = '9th';
      else if (semitonesFromRoot === 5) label = '4th';
      else if (semitonesFromRoot === 9) label = '6th';
      intervalLabels.push(label);
    }
  });

  return {
    chordName,
    tuningId,
    capoFret,
    frets,
    notes,
    noteNames,
    intervalLabels,
    difficulty,
    description,
  };
}
