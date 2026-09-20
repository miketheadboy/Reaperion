import { BeachBoysChord, ChordVoicing, SongPreset } from '../types';

export interface DylanStructuralPreset {
  id: string;
  title: string;
  album: string;
  year: number;
  key: string;
  tempo: number;
  timeSignature: string;
  structureExplanation: string;
  weirdQuirk: string;
  chords: BeachBoysChord[];
}

export const BOB_DYLAN_WEIRDO_PRESETS: DylanStructuralPreset[] = [
  {
    id: 'tangled_up_in_blue',
    title: 'Tangled Up in Blue (13-Bar Asymmetric Verse)',
    album: 'Blood on the Tracks',
    year: 1975,
    key: 'A Major (Open D Capo 2)',
    tempo: 98,
    timeSignature: '4/4 with 2/4 lyrical pivot',
    structureExplanation: 'A masterclass in asymmetric songwriting: an odd 13-measure verse rather than the traditional 12 or 16 bars. Dylan inserts a sudden 2-beat half-measure (2/4) right before the title hook to compress lyrical delivery.',
    weirdQuirk: '2/4 lyrical pivot measure inserted at bar 9 to allow Bob to hit "Tangled up in blue" without waiting for a full 4 beats.',
    chords: [
      {
        id: 'tub_1',
        name: 'A',
        numeral: 'I',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Early one mornin\' the sun was shinin\'...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Rolling acoustic folk downstroke with open 5th string ring',
      },
      {
        id: 'tub_2',
        name: 'G',
        numeral: 'bVII (Modal)',
        root: 'G',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'I was layin\' in bed...',
        vowel: 'aah',
        notes: { falsetto: 67, tenor1: 62, lead: 59, baritone: 55, bass: 43 },
        voicingDescription: 'Mixolydian flat-seven folk movement with woody strum',
      },
      {
        id: 'tub_3',
        name: 'D',
        numeral: 'IV',
        root: 'D',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Wonderin\' if she\'d changed at all...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 66, lead: 62, baritone: 57, bass: 50 },
        voicingDescription: 'Bright folk D with open 1st string hammer-on',
      },
      {
        id: 'tub_4',
        name: 'A',
        numeral: 'I',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'If her hair was still red...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Return to home tonic',
      },
      {
        id: 'tub_5',
        name: 'A',
        numeral: 'I',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Her folks, they said our lives together...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Second phrase acceleration',
      },
      {
        id: 'tub_6',
        name: 'G',
        numeral: 'bVII',
        root: 'G',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Sure was gonna be rough...',
        vowel: 'aah',
        notes: { falsetto: 67, tenor1: 62, lead: 59, baritone: 55, bass: 43 },
        voicingDescription: 'Descending folk bass motion',
      },
      {
        id: 'tub_7',
        name: 'D',
        numeral: 'IV',
        root: 'D',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'They never did like Mama\'s homemade dress...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 66, lead: 62, baritone: 57, bass: 50 },
        voicingDescription: 'Subdominant lift',
      },
      {
        id: 'tub_8',
        name: 'A',
        numeral: 'I',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Papa\'s bankbook wasn\'t big enough...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Tension build towards the lyrical break',
      },
      {
        id: 'tub_9',
        name: 'E (2/4 Lyrical Breath)',
        numeral: 'V (2/4 Cut)',
        root: 'E',
        quality: 'Dominant',
        inversion: 'Root',
        durationBeats: 2, // WEIRDO 2/4 INSERT!
        lyricsSnippet: '[Deep breath]...',
        vowel: 'ooh',
        notes: { falsetto: 71, tenor1: 68, lead: 64, baritone: 59, bass: 40 },
        voicingDescription: '⚡ DYLAN WEIRDO QUIRK: Truncated 2-beat measure to rush into chorus!',
      },
      {
        id: 'tub_10',
        name: 'F#m',
        numeral: 'vi',
        root: 'F#',
        quality: 'Minor',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'And I was standin\' on the side of the road...',
        vowel: 'aah',
        notes: { falsetto: 73, tenor1: 69, lead: 66, baritone: 61, bass: 42 },
        voicingDescription: 'Sudden minor emotional plunge',
      },
      {
        id: 'tub_11',
        name: 'A',
        numeral: 'I',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Rain fallin\' on my shoes...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Returning acoustic stride',
      },
      {
        id: 'tub_12',
        name: 'G',
        numeral: 'bVII',
        root: 'G',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Headin\' out for the East Coast...',
        vowel: 'aah',
        notes: { falsetto: 67, tenor1: 62, lead: 59, baritone: 55, bass: 43 },
        voicingDescription: 'Modal approach to the title',
      },
      {
        id: 'tub_13',
        name: 'D (6/4 Harmonica Hold)',
        numeral: 'IV (Harmonica Vamp)',
        root: 'D',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 6, // WEIRDO 6/4 HOLD!
        lyricsSnippet: 'Lord knows I\'ve paid some dues... Tangled up in blue!',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 66, lead: 62, baritone: 57, bass: 50 },
        voicingDescription: '⚡ DYLAN WEIRDO QUIRK: Extended 6-beat held bar for screaming G harmonica vamp!',
      },
    ],
  },
  {
    id: 'desolation_row',
    title: 'Desolation Row (11-Bar Epic Ballad)',
    album: 'Highway 61 Revisited',
    year: 1965,
    key: 'E Major',
    tempo: 104,
    timeSignature: '4/4 with 3/4 turnarounds',
    structureExplanation: 'An idiosyncratic 11-bar structure where Bob holds the narrative in suspended animation. The guitar picking rushes into 3-beat measures whenever Bob needs to fit poetic names (Cinderella, Romeo, Einstein) into the meter.',
    weirdQuirk: 'Odd 11-bar phrase cycles with Charlie McCoy\'s nylon-string flamenco flourishes on the odd-numbered measures.',
    chords: [
      {
        id: 'dr_1',
        name: 'E',
        numeral: 'I',
        root: 'E',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'They\'re selling postcards of the hanging...',
        vowel: 'aah',
        notes: { falsetto: 68, tenor1: 64, lead: 59, baritone: 52, bass: 40 },
        voicingDescription: 'Hypnotic steady folk bass thump',
      },
      {
        id: 'dr_2',
        name: 'A',
        numeral: 'IV',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'They\'re painting the passports brown...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Acoustic sweep with open top E string',
      },
      {
        id: 'dr_3',
        name: 'E',
        numeral: 'I',
        root: 'E',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'The beauty parlor is filled with sailors...',
        vowel: 'aah',
        notes: { falsetto: 68, tenor1: 64, lead: 59, baritone: 52, bass: 40 },
        voicingDescription: 'Rhythmic chug',
      },
      {
        id: 'dr_4',
        name: 'A',
        numeral: 'IV',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'The circus is in town...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Warm acoustic chime',
      },
      {
        id: 'dr_5',
        name: 'B',
        numeral: 'V',
        root: 'B',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Here comes the blind commissioner...',
        vowel: 'aah',
        notes: { falsetto: 71, tenor1: 66, lead: 63, baritone: 59, bass: 47 },
        voicingDescription: 'Dominant tension building narrative urgency',
      },
      {
        id: 'dr_6',
        name: 'A',
        numeral: 'IV',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'They\'ve got him in a trance...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Subdominant cadence',
      },
      {
        id: 'dr_7',
        name: 'E (3/4 Hiccup)',
        numeral: 'I (3/4 Truncated)',
        root: 'E',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 3, // WEIRDO 3/4 HICCUP!
        lyricsSnippet: 'One hand is tied to the tightrope walker...',
        vowel: 'aah',
        notes: { falsetto: 68, tenor1: 64, lead: 59, baritone: 52, bass: 40 },
        voicingDescription: '⚡ DYLAN WEIRDO QUIRK: 3-beat bar because the line rushes ahead!',
      },
      {
        id: 'dr_8',
        name: 'A',
        numeral: 'IV',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'The other is in his pants...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Quick turnaround',
      },
      {
        id: 'dr_9',
        name: 'B',
        numeral: 'V',
        root: 'B',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'And the riot squad they\'re restless...',
        vowel: 'aah',
        notes: { falsetto: 71, tenor1: 66, lead: 63, baritone: 59, bass: 47 },
        voicingDescription: 'Vamp dominant',
      },
      {
        id: 'dr_10',
        name: 'A',
        numeral: 'IV',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'They need somewhere to go...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Final descent',
      },
      {
        id: 'dr_11',
        name: 'E (5/4 Harmonica Cadence)',
        numeral: 'I (5/4 Lyrical Hold)',
        root: 'E',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 5, // WEIRDO 5/4 HOLD!
        lyricsSnippet: 'As Lady and I look out tonight on Desolation Row...',
        vowel: 'aah',
        notes: { falsetto: 68, tenor1: 64, lead: 59, baritone: 52, bass: 40 },
        voicingDescription: '⚡ DYLAN WEIRDO QUIRK: Extended 5-beat resolution allowing guitar flourish to breathe.',
      },
    ],
  },
  {
    id: 'visions_of_johanna',
    title: 'Visions of Johanna (Rubato Folk Strum)',
    album: 'Blonde on Blonde',
    year: 1966,
    key: 'A Major',
    tempo: 96,
    timeSignature: '4/4 with elastic holds',
    structureExplanation: 'Dylan\'s famous "mercury sound": the band holds back waiting for Bob\'s acoustic guitar cue. Verses stretch and contract elastically with 6-beat and 2-beat holds based on Bob\'s vocal phrasing.',
    weirdQuirk: 'Unpredictable measure lengths with rubato harmonica pauses between the lines.',
    chords: [
      {
        id: 'voj_1',
        name: 'A',
        numeral: 'I',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'Ain\'t it just like the night to play tricks when you\'re tryin\' to be so quiet...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: 'Soft atmospheric acoustic strum',
      },
      {
        id: 'voj_2',
        name: 'D/A',
        numeral: 'IV/I (Pedal)',
        root: 'D',
        quality: 'Major',
        inversion: '2nd Inversion',
        durationBeats: 4,
        lyricsSnippet: 'We sit here stranded, though we\'re all doin\' our best to deny it...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 66, lead: 62, baritone: 57, bass: 45 },
        voicingDescription: 'Inverted folk pedal tone',
      },
      {
        id: 'voj_3',
        name: 'A (6/4 Breath Hold)',
        numeral: 'I (6/4 Suspended)',
        root: 'A',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 6, // 6/4 SUSPENDED HOLD!
        lyricsSnippet: 'And Louise holds a handful of rain, temptin\' you to defy it...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 64, lead: 61, baritone: 57, bass: 45 },
        voicingDescription: '⚡ DYLAN WEIRDO QUIRK: 6-beat held bar while the organ whispers',
      },
      {
        id: 'voj_4',
        name: 'E (2/4 Cut)',
        numeral: 'V (2/4 Truncated)',
        root: 'E',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 2, // 2/4 CUT!
        lyricsSnippet: 'Lights flicker...',
        vowel: 'ooh',
        notes: { falsetto: 71, tenor1: 68, lead: 64, baritone: 59, bass: 40 },
        voicingDescription: '⚡ DYLAN WEIRDO QUIRK: 2-beat snap into the climax',
      },
      {
        id: 'voj_5',
        name: 'F#m',
        numeral: 'vi',
        root: 'F#',
        quality: 'Minor',
        inversion: 'Root',
        durationBeats: 4,
        lyricsSnippet: 'From the opposite loft...',
        vowel: 'aah',
        notes: { falsetto: 73, tenor1: 69, lead: 66, baritone: 61, bass: 42 },
        voicingDescription: 'Emotional shadow',
      },
      {
        id: 'voj_6',
        name: 'D',
        numeral: 'IV',
        root: 'D',
        quality: 'Major',
        inversion: 'Root',
        durationBeats: 6,
        lyricsSnippet: 'These visions of Johanna, they have conquered my mind...',
        vowel: 'aah',
        notes: { falsetto: 69, tenor1: 66, lead: 62, baritone: 57, bass: 50 },
        voicingDescription: 'Expansive 6-beat closing cadence',
      },
    ],
  },
];

/**
 * Transforms any standard chord progression into a "Dylan Weirdo Structure"
 * by introducing authentic lyrical 2/4 breath bars, 6/4 harmonica holds,
 * or asymmetric turnaround insertions.
 */
export function dylanizeProgression(chords: BeachBoysChord[]): BeachBoysChord[] {
  if (chords.length === 0) return chords;

  const result: BeachBoysChord[] = [];

  chords.forEach((chord, idx) => {
    // Clone chord
    const modified = { ...chord, notes: { ...chord.notes } };

    // At the midpoint of the progression, insert a 2/4 lyrical breath bar
    if (idx === Math.floor(chords.length / 2)) {
      modified.durationBeats = 2;
      modified.name = `${chord.name} (2/4 Lyrical Breath)`;
      modified.lyricsSnippet = chord.lyricsSnippet ? `[Dylan Breath] ${chord.lyricsSnippet}` : '[Quick Dylan 2-beat pivot]';
      modified.voicingDescription = '⚡ DYLAN WEIRDO: Truncated 2/4 measure to rush the lyric into the next line';
    }
    // At the final cadence chord, expand to 6/4 for a harmonica hold
    else if (idx === chords.length - 1) {
      modified.durationBeats = 6;
      modified.name = `${chord.name} (6/4 Harmonica Hold)`;
      modified.lyricsSnippet = chord.lyricsSnippet ? `${chord.lyricsSnippet} [Harmonica vamp]` : '[6-beat Harmonica Solowork]';
      modified.voicingDescription = '⚡ DYLAN WEIRDO: Extended 6/4 held bar for acoustic strum and screaming harmonica turnaround';
    }
    // Occasionally insert a 3/4 hiccup if there are more than 5 chords
    else if (chords.length > 5 && idx === 1) {
      modified.durationBeats = 3;
      modified.name = `${chord.name} (3/4 Hiccup)`;
      modified.voicingDescription = '⚡ DYLAN WEIRDO: 3/4 waltz step cut to compress poetic narrative';
    }

    result.push(modified);
  });

  return result;
}
