import { BeachBoysChord, HarmonyStyle, SongPreset, VoiceId } from '../types';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = ((midi % 12) + 12) % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function freqToMidi(freq: number): number {
  return Math.round(69 + 12 * Math.log2(freq / 440));
}

// Brian Wilson's classic voice assignments & natural vocal ranges
export const VOICE_DEFAULTS = [
  {
    id: 'falsetto' as VoiceId,
    name: 'Brian',
    singer: 'Brian Wilson',
    role: 'Lead Falsetto (High Air)',
    color: '#f59e0b', // Amber
    range: [60, 84] as [number, number], // C4 - C6
    volume: 0.85,
    pan: 0.15,
    mute: false,
    solo: false,
    detuneCents: 4,
    vowel: 'ooh' as const,
    currentMidi: null,
  },
  {
    id: 'tenor1' as VoiceId,
    name: 'Carl',
    singer: 'Carl Wilson',
    role: '1st Tenor (Silky Top)',
    color: '#38bdf8', // Sky Blue
    range: [55, 77] as [number, number], // G3 - F5
    volume: 0.8,
    pan: -0.3,
    mute: false,
    solo: false,
    detuneCents: -3,
    vowel: 'ooh' as const,
    currentMidi: null,
  },
  {
    id: 'lead' as VoiceId,
    name: 'Al / Brian',
    singer: 'Al Jardine / Brian',
    role: '2nd Tenor / Lead Core',
    color: '#10b981', // Emerald
    range: [50, 74] as [number, number], // D3 - D5
    volume: 0.85,
    pan: 0.0,
    mute: false,
    solo: false,
    detuneCents: 2,
    vowel: 'aah' as const,
    currentMidi: null,
  },
  {
    id: 'baritone' as VoiceId,
    name: 'Dennis / Bruce',
    singer: 'Dennis Wilson / Bruce',
    role: 'Baritone (Inner Warmth)',
    color: '#a855f7', // Purple
    range: [45, 69] as [number, number], // A2 - A4
    volume: 0.75,
    pan: 0.35,
    mute: false,
    solo: false,
    detuneCents: -5,
    vowel: 'ooh' as const,
    currentMidi: null,
  },
  {
    id: 'bass' as VoiceId,
    name: 'Mike',
    singer: 'Mike Love',
    role: 'Bass Vocal (Punchy Root)',
    color: '#f43f5e', // Rose
    range: [38, 62] as [number, number], // D2 - D4
    volume: 0.9,
    pan: -0.1,
    mute: false,
    solo: false,
    detuneCents: 0,
    vowel: 'doo' as const,
    currentMidi: null,
  },
];

/**
 * Calculates a 5-part Beach Boys vocal stack from a single melody note
 */
export function harmonizeMelodyNote(
  melodyMidi: number,
  style: HarmonyStyle = 'pet_sounds',
  keyRootMidi: number = 60 // C4 default
): { falsetto: number; tenor1: number; lead: number; baritone: number; bass: number } {
  // Clamp input to sensible range
  const clampedMelody = Math.min(84, Math.max(48, melodyMidi));

  switch (style) {
    case 'pet_sounds': {
      // Pet Sounds / God Only Knows: Lead sings melody, Brian's falsetto floats 4th or 6th above,
      // Carl takes the sweet major 3rd or 2nd below falsetto, Baritone adds color 7th/9th,
      // Bass takes an inverted root or 5th.
      const falsetto = Math.min(84, clampedMelody >= 69 ? clampedMelody + 4 : clampedMelody + 7);
      const lead = clampedMelody;
      const tenor1 = lead > 60 ? lead - 3 : lead + 4;
      const baritone = Math.max(45, lead - 7);
      const bass = Math.max(38, lead - 19); // Octave and a fifth below
      return { falsetto, tenor1, lead, baritone, bass };
    }

    case 'four_freshmen': {
      // Four Freshmen close harmony: dense cluster, stacked 9th, tight major 2nd intervals
      const lead = clampedMelody;
      const falsetto = lead + 3; // close minor/major 3rd above
      const tenor1 = lead - 2;   // whole tone friction
      const baritone = lead - 5; // 4th down
      const bass = Math.max(40, lead - 12); // octave down anchor
      return { falsetto, tenor1, lead, baritone, bass };
    }

    case 'surfer_girl': {
      // 1963 Doo-Wop Ballad: Warm sweet 6ths and pure major triads
      const lead = clampedMelody;
      const falsetto = lead + 7; // Soaring 5th above
      const tenor1 = lead + 4;   // Major 3rd above
      const baritone = lead - 5; // 4th below
      const bass = Math.max(38, lead - 17); // Low root
      return { falsetto, tenor1, lead, baritone, bass };
    }

    case 'good_vibrations': {
      // Pocket symphony: Octave falsetto soaring, counterpoint mid-voices, punchy bass
      const lead = clampedMelody;
      const falsetto = Math.min(84, lead + 12); // High soaring octave
      const tenor1 = lead + 3;
      const baritone = lead - 4;
      const bass = Math.max(36, lead - 12);
      return { falsetto, tenor1, lead, baritone, bass };
    }

    case 'california_girls': {
      // Sunshine pop: Bright open 4ths and 5ths, major triad stack
      const lead = clampedMelody;
      const falsetto = lead + 9; // Major 6th above
      const tenor1 = lead + 5;   // Perfect 4th above
      const baritone = lead - 3; // Minor 3rd below
      const bass = Math.max(38, lead - 14);
      return { falsetto, tenor1, lead, baritone, bass };
    }

    case 'smile_poly':
    default: {
      // Smile / Heroes & Villains: modal, unexpected semitones and rich minor 7ths
      const lead = clampedMelody;
      const falsetto = Math.min(84, lead + 8); // Minor 6th above
      const tenor1 = lead + 2;   // major 2nd
      const baritone = lead - 6; // tritone or flat 5th
      const bass = Math.max(38, lead - 16);
      return { falsetto, tenor1, lead, baritone, bass };
    }
  }
}

/**
 * Iconic Song Presets directly transcribed with Brian Wilson's authentic 5-part vocal scores
 */
export const BEACH_BOYS_PRESETS: SongPreset[] = [
  {
    id: 'god_only_knows',
    title: 'God Only Knows (Intro & Tag)',
    album: 'Pet Sounds',
    year: 1966,
    key: 'E Major / A Major',
    tempo: 78,
    harmonyStyle: 'pet_sounds',
    description: 'The pinnacle of pop harmony. Features Brian\'s famous inverted bass lines (A/E, F#m6/E) that never quite land on the root, leaving the listener in eternal, floating yearning.',
    funFact: 'Paul McCartney famously called this the greatest pop song ever written. Brian layered his own falsetto with Carl and Bruce Johnston in Western Recorders Studio 3.',
    chords: [
      {
        id: 'gok_1',
        name: 'A/E',
        numeral: 'IV/V (Inversion)',
        root: 'A',
        quality: 'Major',
        inversion: '2nd Inversion (Bass on E)',
        durationBeats: 4,
        lyricsSnippet: 'I may not always...',
        vowel: 'aah',
        notes: { falsetto: 73, tenor1: 69, lead: 64, baritone: 57, bass: 40 }, // C#5, A4, E4, A3, E2
        voicingDescription: 'Floating 2nd inversion with E pedal bass and soaring C#5 falsetto',
      },
      {
        id: 'gok_2',
        name: 'F#m6/E',
        numeral: 'ii6/V',
        root: 'F#',
        quality: 'Minor 6th',
        inversion: 'Bass on E',
        durationBeats: 4,
        lyricsSnippet: '...love you',
        vowel: 'ooh',
        notes: { falsetto: 74, tenor1: 69, lead: 66, baritone: 61, bass: 40 }, // D5, A4, F#4, C#4, E2
        voicingDescription: 'Heartbreaking bittersweet minor 6th tension with held low E',
      },
      {
        id: 'gok_3',
        name: 'Emaj7',
        numeral: 'Imaj7',
        root: 'E',
        quality: 'Major 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'But as long as there are...',
        vowel: 'aah',
        notes: { falsetto: 75, tenor1: 71, lead: 68, baritone: 64, bass: 40 }, // D#5, B4, G#4, E4, E2
        voicingDescription: 'Lush maj7 resolution with shimmering D#5 on top',
      },
      {
        id: 'gok_4',
        name: 'C#m7',
        numeral: 'vi7',
        root: 'C#',
        quality: 'Minor 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: '...stars above you',
        vowel: 'ooh',
        notes: { falsetto: 76, tenor1: 71, lead: 68, baritone: 64, bass: 49 }, // E5, B4, G#4, E4, C#3
        voicingDescription: 'Warm minor 7th with open resonant body',
      },
      {
        id: 'gok_5',
        name: 'F#m7/B',
        numeral: 'ii7/V (V11)',
        root: 'F#',
        quality: 'Minor 7th',
        inversion: 'Bass on B',
        durationBeats: 4,
        lyricsSnippet: 'You never need to...',
        vowel: 'doo',
        notes: { falsetto: 73, tenor1: 69, lead: 66, baritone: 61, bass: 47 }, // C#5, A4, F#4, C#4, B2
        voicingDescription: 'Soulful suspended 11th dominant sound pointing home',
      },
      {
        id: 'gok_6',
        name: 'E',
        numeral: 'I',
        root: 'E',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: '...doubt it',
        vowel: 'aah',
        notes: { falsetto: 76, tenor1: 71, lead: 64, baritone: 59, bass: 40 }, // E5, B4, E4, B3, E2
        voicingDescription: 'Pure bright triumphant major chord',
      },
      {
        id: 'gok_7',
        name: 'A/B (B9sus4)',
        numeral: 'V9sus4',
        root: 'B',
        quality: 'Suspended 9th',
        inversion: 'Slash chord',
        durationBeats: 4,
        lyricsSnippet: 'God only knows what I\'d be...',
        vowel: 'ooh',
        notes: { falsetto: 73, tenor1: 69, lead: 64, baritone: 59, bass: 47 }, // C#5, A4, E4, B3, B2
        voicingDescription: 'Signature Brian Wilson gospel/jazz slash cadence',
      },
      {
        id: 'gok_8',
        name: 'E (Vocal Tag)',
        numeral: 'I (Round)',
        root: 'E',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: '...without you (Ahhhh...)',
        vowel: 'aah',
        notes: { falsetto: 76, tenor1: 71, lead: 68, baritone: 64, bass: 40 }, // E5, B4, G#4, E4, E2
        voicingDescription: 'Infinite three-part vocal round echoing into eternity',
      },
    ],
  },
  {
    id: 'wouldnt_it_be_nice',
    title: 'Wouldn\'t It Be Nice',
    album: 'Pet Sounds',
    year: 1966,
    key: 'F Major / D Major',
    tempo: 124,
    harmonyStyle: 'pet_sounds',
    description: 'Youthful optimism framed by sophisticated modulations. 5 voices sing tight rapid-fire "Doo-doo-doo" pulses supporting soaring top harmonies.',
    funFact: 'Brian spent months perfecting the vocal balance on this track alone, driving the other band members crazy with dozens of vocal takes.',
    chords: [
      {
        id: 'wibn_1',
        name: 'F',
        numeral: 'I',
        root: 'F',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Wouldn\'t it be nice if we were older...',
        vowel: 'doo',
        notes: { falsetto: 77, tenor1: 72, lead: 69, baritone: 65, bass: 41 }, // F5, C5, A4, F4, F2
        voicingDescription: 'Punchy staccato doo-wop vocal block',
      },
      {
        id: 'wibn_2',
        name: 'Bb/F',
        numeral: 'IV (Pedal)',
        root: 'Bb',
        quality: 'Major',
        inversion: '2nd Inversion',
        durationBeats: 4,
        lyricsSnippet: 'Then we wouldn\'t have to wait so long...',
        vowel: 'doo',
        notes: { falsetto: 77, tenor1: 74, lead: 70, baritone: 65, bass: 41 }, // F5, D5, Bb4, F4, F2
        voicingDescription: 'Rocking gospel pedal tone movement',
      },
      {
        id: 'wibn_3',
        name: 'Gm7',
        numeral: 'ii7',
        root: 'G',
        quality: 'Minor 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'And wouldn\'t it be nice to live together...',
        vowel: 'aah',
        notes: { falsetto: 74, tenor1: 70, lead: 67, baritone: 62, bass: 43 }, // D5, Bb4, G4, D4, G2
        voicingDescription: 'Warm minor lift leading to dominant',
      },
      {
        id: 'wibn_4',
        name: 'C7',
        numeral: 'V7',
        root: 'C',
        quality: 'Dominant 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'In the kind of world where we belong...',
        vowel: 'wah',
        notes: { falsetto: 76, tenor1: 72, lead: 67, baritone: 64, bass: 48 }, // E5, C5, G4, E4, C3
        voicingDescription: 'Classic driving 60s dominant brass-like vocal swell',
      },
      {
        id: 'wibn_5',
        name: 'Am7',
        numeral: 'iii7',
        root: 'A',
        quality: 'Minor 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'You know it\'s gonna make it that much better...',
        vowel: 'ooh',
        notes: { falsetto: 76, tenor1: 72, lead: 69, baritone: 64, bass: 45 }, // E5, C5, A4, E4, A2
        voicingDescription: 'Melancholic inner bridge movement',
      },
      {
        id: 'wibn_6',
        name: 'Dm7',
        numeral: 'vi7',
        root: 'D',
        quality: 'Minor 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'When we can say goodnight and stay together...',
        vowel: 'aah',
        notes: { falsetto: 77, tenor1: 74, lead: 69, baritone: 65, bass: 50 }, // F5, D5, A4, F4, D3
        voicingDescription: 'Lush 4-voice close cluster over D bass',
      },
    ],
  },
  {
    id: 'surfer_girl',
    title: 'Surfer Girl (Doo-Wop Masterpiece)',
    album: 'Surfer Girl',
    year: 1963,
    key: 'D Major',
    tempo: 64,
    harmonyStyle: 'surfer_girl',
    description: 'The first song Brian ever produced. Classic 6/8 doo-wop slow dance with four-freshmen stacked major 6ths, pure falsetto vibrato, and deep Mike Love bass anchor.',
    funFact: 'Brian composed the melody in his head while driving his 1957 Ford down to the beach in Hawthorne, California when he was only 19 years old.',
    chords: [
      {
        id: 'sg_1',
        name: 'Dmaj7',
        numeral: 'Imaj7',
        root: 'D',
        quality: 'Major 7th',
        inversion: 'Root',
        durationBeats: 6,
        lyricsSnippet: 'Little surfer, little one...',
        vowel: 'ooh',
        notes: { falsetto: 73, tenor1: 69, lead: 66, baritone: 62, bass: 38 }, // C#5, A4, F#4, D4, D2
        voicingDescription: 'High floating C#5 over lush D major triad',
      },
      {
        id: 'sg_2',
        name: 'Bm',
        numeral: 'vi',
        root: 'B',
        quality: 'Minor',
        inversion: 'Root',
        durationBeats: 6,
        lyricsSnippet: 'Made my heart come all undone...',
        vowel: 'ooh',
        notes: { falsetto: 74, tenor1: 71, lead: 66, baritone: 59, bass: 47 }, // D5, B4, F#4, B3, B2
        voicingDescription: 'Classic bittersweet minor relative change',
      },
      {
        id: 'sg_3',
        name: 'Em7',
        numeral: 'ii7',
        root: 'E',
        quality: 'Minor 7th',
        inversion: 'Root',
        durationBeats: 6,
        lyricsSnippet: 'Do you love me, do you surfer girl...',
        vowel: 'aah',
        notes: { falsetto: 74, tenor1: 71, lead: 67, baritone: 64, bass: 40 }, // D5, B4, G4, E4, E2
        voicingDescription: 'Sweet romantic ii7 with high 7th chime',
      },
      {
        id: 'sg_4',
        name: 'A7',
        numeral: 'V7',
        root: 'A',
        quality: 'Dominant 7th',
        inversion: 'Root',
        durationBeats: 6,
        lyricsSnippet: '(Surfer girl, my little surfer girl...)',
        vowel: 'doo',
        notes: { falsetto: 73, tenor1: 69, lead: 67, baritone: 61, bass: 45 }, // C#5, A4, G4, C#4, A2
        voicingDescription: 'Warm resolving dominant pulling straight back to D',
      },
    ],
  },
  {
    id: 'in_my_room',
    title: 'In My Room',
    album: 'Surfer Girl',
    year: 1963,
    key: 'C Major',
    tempo: 68,
    harmonyStyle: 'four_freshmen',
    description: 'An intimate sanctuary. Intricate barbershop voicings with chromatic passing notes, quiet vulnerability, and sublime blend.',
    funFact: 'Gary Usher and Brian wrote this in Brian\'s bedroom. It became an anthem for solitary teens around the world.',
    chords: [
      {
        id: 'imr_1',
        name: 'C',
        numeral: 'I',
        root: 'C',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'There\'s a world where I can go...',
        vowel: 'ooh',
        notes: { falsetto: 72, tenor1: 67, lead: 64, baritone: 60, bass: 36 }, // C5, G4, E4, C4, C2
        voicingDescription: 'Warm, protected sanctuary chord',
      },
      {
        id: 'imr_2',
        name: 'Am',
        numeral: 'vi',
        root: 'A',
        quality: 'Minor',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'And tell my secrets to...',
        vowel: 'ooh',
        notes: { falsetto: 72, tenor1: 69, lead: 64, baritone: 60, bass: 45 }, // C5, A4, E4, C4, A2
        voicingDescription: 'Gentle minor transition',
      },
      {
        id: 'imr_3',
        name: 'Dm7',
        numeral: 'ii7',
        root: 'D',
        quality: 'Minor 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'In my room...',
        vowel: 'aah',
        notes: { falsetto: 72, tenor1: 69, lead: 65, baritone: 62, bass: 38 }, // C5, A4, F4, D4, D2
        voicingDescription: 'Deep wistful minor 7th with open resonant fourth',
      },
      {
        id: 'imr_4',
        name: 'G7',
        numeral: 'V7',
        root: 'G',
        quality: 'Dominant 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'In my room...',
        vowel: 'ooh',
        notes: { falsetto: 71, tenor1: 67, lead: 65, baritone: 59, bass: 43 }, // B4, G4, F4, B3, G2
        voicingDescription: 'Tender resolving cadence',
      },
    ],
  },
  {
    id: 'warmth_of_the_sun',
    title: 'The Warmth of the Sun',
    album: 'Shut Down Volume 2',
    year: 1964,
    key: 'C Major / A Minor',
    tempo: 62,
    harmonyStyle: 'four_freshmen',
    description: 'Written the day JFK was assassinated. Uses haunting diminished 7th passing chords and weeping falsetto lines.',
    funFact: 'Brian and Mike Love began writing this song on November 22, 1963, capturing the grief and desire for warmth after tragic news.',
    chords: [
      {
        id: 'wots_1',
        name: 'C',
        numeral: 'I',
        root: 'C',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'What good is the dawn...',
        vowel: 'ooh',
        notes: { falsetto: 72, tenor1: 67, lead: 64, baritone: 60, bass: 36 }, // C5, G4, E4, C4, C2
        voicingDescription: 'Stark pure opening',
      },
      {
        id: 'wots_2',
        name: 'Am',
        numeral: 'vi',
        root: 'A',
        quality: 'Minor',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'That grows into day...',
        vowel: 'ooh',
        notes: { falsetto: 72, tenor1: 69, lead: 64, baritone: 60, bass: 45 }, // C5, A4, E4, C4, A2
        voicingDescription: 'Gentle melancholic step',
      },
      {
        id: 'wots_3',
        name: 'Ebdim7',
        numeral: 'biiiodim7',
        root: 'Eb',
        quality: 'Diminished 7th',
        inversion: 'Passing Diminished',
        durationBeats: 4,
        lyricsSnippet: 'The warmth of the sun...',
        vowel: 'aah',
        notes: { falsetto: 75, tenor1: 69, lead: 66, baritone: 63, bass: 39 }, // Eb5, A4, F#4, Eb4, Eb2
        voicingDescription: 'Unforgettable, aching chromatic passing tension',
      },
      {
        id: 'wots_4',
        name: 'Dm7',
        numeral: 'ii7',
        root: 'D',
        quality: 'Minor 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Won\'t lay, won\'t lay its light...',
        vowel: 'ooh',
        notes: { falsetto: 74, tenor1: 69, lead: 65, baritone: 62, bass: 38 }, // D5, A4, F4, D4, D2
        voicingDescription: 'Smooth stepwise resolution from the diminished chord',
      },
    ],
  },
  {
    id: 'good_vibrations',
    title: 'Good Vibrations (Pocket Symphony)',
    album: 'Smiley Smile',
    year: 1966,
    key: 'Eb Minor / F# Major',
    tempo: 135,
    harmonyStyle: 'good_vibrations',
    description: 'The definitive multi-movement pocket symphony. Descending minor modal steps in the verse, explosive layered "Ahhh" falsetto choral breaks, and rhythmic bass vocal riffs.',
    funFact: 'Cost an unprecedented $50,000 to record in 1966 across 4 legendary studios (Western, Gold Star, Sunset Sound, CBS).',
    chords: [
      {
        id: 'gv_1',
        name: 'Ebm',
        numeral: 'i',
        root: 'Eb',
        quality: 'Minor',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'I, I love the colorful clothes she wears...',
        vowel: 'ooh',
        notes: { falsetto: 75, tenor1: 70, lead: 66, baritone: 63, bass: 39 }, // Eb5, Bb4, Gb4, Eb4, Eb2
        voicingDescription: 'Dark, mysterious modal minor verse bed',
      },
      {
        id: 'gv_2',
        name: 'Db',
        numeral: 'bVII',
        root: 'Db',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'And the way the sunlight plays upon her hair...',
        vowel: 'ooh',
        notes: { falsetto: 73, tenor1: 68, lead: 65, baritone: 61, bass: 37 }, // Db5, Ab4, F4, Db4, Db2
        voicingDescription: 'Step-down Aeolian chord progression',
      },
      {
        id: 'gv_3',
        name: 'Cb (B)',
        numeral: 'bVI',
        root: 'Cb',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'I hear the sound of a gentle word...',
        vowel: 'aah',
        notes: { falsetto: 71, tenor1: 66, lead: 63, baritone: 59, bass: 35 }, // B4, F#4, D#4, B3, B1
        voicingDescription: 'Hypnotic continuing descent',
      },
      {
        id: 'gv_4',
        name: 'Bb7',
        numeral: 'V7',
        root: 'Bb',
        quality: 'Dominant 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'On the wind that lifts her perfume through the air...',
        vowel: 'wah',
        notes: { falsetto: 74, tenor1: 70, lead: 68, baritone: 62, bass: 46 }, // D5, Bb4, Ab4, D4, Bb2
        voicingDescription: 'Exotic harmonic minor turnaround pulling back into the loop',
      },
      {
        id: 'gv_5',
        name: 'Gb (Vocal Chorus)',
        numeral: 'III (Relative Major)',
        root: 'Gb',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'I\'m pickin\' up good vibrations! (Gotta keep those...)',
        vowel: 'aah',
        notes: { falsetto: 78, tenor1: 73, lead: 70, baritone: 66, bass: 42 }, // Gb5, Db5, Bb4, Gb4, Gb2
        voicingDescription: 'Explosive high-energy falsetto breakthrough in radiant major',
      },
      {
        id: 'gv_6',
        name: 'Ab7',
        numeral: 'IV7',
        root: 'Ab',
        quality: 'Dominant 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'She\'s giving me the excitations...',
        vowel: 'aah',
        notes: { falsetto: 80, tenor1: 75, lead: 72, baritone: 68, bass: 44 }, // Ab5, Eb5, C5, Ab4, Ab2
        voicingDescription: 'Triumphant skyward modulation',
      },
    ],
  },
  {
    id: 'heroes_and_villains',
    title: 'Heroes and Villains (Smile Suite)',
    album: 'Smile (1967/2011)',
    year: 1967,
    key: 'Bb Major',
    tempo: 92,
    harmonyStyle: 'smile_poly',
    description: 'The psychedelic western operetta. Intricate interlocking barbershop cadences with sudden barbershop pauses and dramatic theatrical modulations.',
    funFact: 'Recorded during Brian\'s legendary sandbox-piano period, featuring Van Dyke Parks\' poetic lyrics.',
    chords: [
      {
        id: 'hav_1',
        name: 'Bb',
        numeral: 'I',
        root: 'Bb',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'I\'ve been in this town so long...',
        vowel: 'aah',
        notes: { falsetto: 74, tenor1: 70, lead: 65, baritone: 62, bass: 46 }, // D5, Bb4, F4, D4, Bb2
        voicingDescription: 'Bold theatrical cowboy choral declaration',
      },
      {
        id: 'hav_2',
        name: 'Eb/Bb',
        numeral: 'IV',
        root: 'Eb',
        quality: 'Major',
        inversion: '2nd Inversion',
        durationBeats: 4,
        lyricsSnippet: 'That back in the city I\'ve been taken for lost and gone...',
        vowel: 'ooh',
        notes: { falsetto: 75, tenor1: 70, lead: 67, baritone: 63, bass: 46 }, // Eb5, Bb4, G4, Eb4, Bb2
        voicingDescription: 'Sustained barbershop pedal point',
      },
      {
        id: 'hav_3',
        name: 'F7',
        numeral: 'V7',
        root: 'F',
        quality: 'Dominant 7th',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'And unknown for a long, long time...',
        vowel: 'wah',
        notes: { falsetto: 77, tenor1: 72, lead: 69, baritone: 63, bass: 41 }, // F5, C5, A4, Eb4, F2
        voicingDescription: 'Dramatic vaudeville dominant call',
      },
      {
        id: 'hav_4',
        name: 'Gm',
        numeral: 'vi',
        root: 'G',
        quality: 'Minor',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Heroes and villains! (Dum-dum-dum-doo-wah...)',
        vowel: 'doo',
        notes: { falsetto: 74, tenor1: 70, lead: 67, baritone: 62, bass: 43 }, // D5, Bb4, G4, D4, G2
        voicingDescription: 'Staccato western barbershop bounce',
      },
    ],
  },
];
