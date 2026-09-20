import React, { useState, useEffect, useCallback } from 'react';
import { HarmonyStyle, VocalVoiceState, VowelType } from '../types';
import { harmonizeMelodyNote, midiToNoteName } from '../audio/harmonyEngine';
import { vocalSynth } from '../audio/vocalSynth';
import { Music, Volume2, Sparkles } from 'lucide-react';

interface HarmonyKeyboardProps {
  voices: VocalVoiceState[];
  selectedStyle: HarmonyStyle;
  onStyleChange: (style: HarmonyStyle) => void;
  globalVowel: VowelType;
  onGlobalVowelChange: (vowel: VowelType) => void;
}

// 3 octaves of piano keys (C3=48 to C6=84)
const START_MIDI = 48; // C3
const END_MIDI = 84;   // C6

const BLACK_KEYS_MOD = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

const HARMONY_STYLES: { id: HarmonyStyle; label: string; desc: string }[] = [
  {
    id: 'pet_sounds',
    label: 'Pet Sounds (1966)',
    desc: 'Lush inverted chords, floating bass on 3rd/5th, sweet maj7 / m7 suspensions',
  },
  {
    id: 'four_freshmen',
    label: 'Four Freshmen Jazz Clusters',
    desc: 'Ultra-close barbershop jazz clusters, stacked 9ths and major 2nd rubs',
  },
  {
    id: 'surfer_girl',
    label: 'Surfer Girl Doo-Wop (1963)',
    desc: 'Sweet slow-dance triads with major 6ths and soaring falsetto 5th above',
  },
  {
    id: 'good_vibrations',
    label: 'Good Vibrations Symphony',
    desc: 'High octave falsetto float + punchy Mike Love bass anchor',
  },
  {
    id: 'california_girls',
    label: 'Sunshine Pop',
    desc: 'Bright stacked 3rds & open 5ths for upbeat summertime anthems',
  },
  {
    id: 'smile_poly',
    label: 'Smile Polyphonic',
    desc: 'Intricate counterpoint with modal shifts and unexpected semitones',
  },
];

export const HarmonyKeyboard: React.FC<HarmonyKeyboardProps> = ({
  voices,
  selectedStyle,
  onStyleChange,
  globalVowel,
  onGlobalVowelChange,
}) => {
  const [activeMelodyMidi, setActiveMelodyMidi] = useState<number | null>(null);
  const [activeStack, setActiveStack] = useState<{
    falsetto: number;
    tenor1: number;
    lead: number;
    baritone: number;
    bass: number;
  } | null>(null);

  const triggerHarmony = useCallback(
    (midi: number) => {
      setActiveMelodyMidi(midi);
      const stack = harmonizeMelodyNote(midi, selectedStyle);
      setActiveStack(stack);

      // Play 5 voices
      vocalSynth.playBeachBoysChord(stack, globalVowel);
    },
    [selectedStyle, globalVowel]
  );

  const releaseHarmony = useCallback(() => {
    setActiveMelodyMidi(null);
    setActiveStack(null);
    vocalSynth.stopAll();
  }, []);

  // Keyboard shortcut listener (white keys: A S D F G H J K L ; ' / black keys: W E T Y U O P)
  useEffect(() => {
    const keyMap: Record<string, number> = {
      a: 60, // C4
      w: 61, // C#4
      s: 62, // D4
      e: 63, // D#4
      d: 64, // E4
      f: 65, // F4
      t: 66, // F#4
      g: 67, // G4
      y: 68, // G#4
      h: 69, // A4
      u: 70, // A#4
      j: 71, // B4
      k: 72, // C5
      o: 73, // C#5
      l: 74, // D5
      p: 75, // D#5
      ';': 76, // E5
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const midi = keyMap[e.key.toLowerCase()];
      if (midi) {
        e.preventDefault();
        triggerHarmony(midi);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const midi = keyMap[e.key.toLowerCase()];
      if (midi && activeMelodyMidi === midi) {
        releaseHarmony();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerHarmony, releaseHarmony, activeMelodyMidi]);

  // Generate all keys
  const keys: { midi: number; isBlack: boolean; name: string }[] = [];
  for (let m = START_MIDI; m <= END_MIDI; m++) {
    const isBlack = BLACK_KEYS_MOD.includes(m % 12);
    keys.push({ midi: m, isBlack, name: midiToNoteName(m) });
  }

  // Helper to determine if a key is being sung by one of the 5 Beach Boys
  const getVoiceForMidi = (midi: number) => {
    if (!activeStack) return null;
    if (activeStack.falsetto === midi) return { name: 'Brian', role: 'Falsetto', color: '#f59e0b' };
    if (activeStack.tenor1 === midi) return { name: 'Carl', role: '1st Tenor', color: '#38bdf8' };
    if (activeStack.lead === midi) return { name: 'Al/Lead', role: 'Lead', color: '#10b981' };
    if (activeStack.baritone === midi) return { name: 'Dennis', role: 'Baritone', color: '#a855f7' };
    if (activeStack.bass === midi) return { name: 'Mike', role: 'Bass', color: '#f43f5e' };
    return null;
  };

  return (
    <div id="harmony-keyboard-panel" className="bg-[#181614] border border-stone-800 rounded-xl p-5 shadow-2xl space-y-5">
      {/* Header with Style Selection */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif-vintage text-xl font-bold text-amber-100">
              Interactive 5-Part Vocal Harmony Keyboard
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Play any melody note to instantly stack the 5 Beach Boys voices in real-time. Use your mouse or computer keys (A–K).
          </p>
        </div>

        {/* Controls: Harmony Style & Vowel */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] font-mono-studio uppercase text-stone-400 block mb-1">
              Harmonic Style
            </label>
            <select
              id="keyboard-style-select"
              value={selectedStyle}
              onChange={(e) => onStyleChange(e.target.value as HarmonyStyle)}
              className="bg-[#100f0d] text-amber-300 font-mono text-xs rounded border border-stone-700 px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {HARMONY_STYLES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono-studio uppercase text-stone-400 block mb-1">
              Choir Vowel
            </label>
            <select
              id="keyboard-vowel-select"
              value={globalVowel}
              onChange={(e) => onGlobalVowelChange(e.target.value as VowelType)}
              className="bg-[#100f0d] text-stone-200 font-mono text-xs rounded border border-stone-700 px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ooh">Ooh /uː/ (Pet Sounds)</option>
              <option value="aah">Aah /ɑː/ (Soaring Choir)</option>
              <option value="doo">Doo /duː/ (Doo-Wop)</option>
              <option value="wah">Wah /wɑː/ (Vocal Horns)</option>
              <option value="ee">Eee /iː/ (Bright)</option>
              <option value="mm">Mm /m/ (Hum)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Harmony Stack Readout Banner */}
      <div className="bg-[#100f0d] border border-stone-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-stone-400 uppercase tracking-wider">Active Vocal Chord:</span>
          {activeStack ? (
            <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Melody: {midiToNoteName(activeMelodyMidi!)} | 5-Voice Stack Active
            </span>
          ) : (
            <span className="text-xs text-stone-400 italic">Click or hold any piano key below...</span>
          )}
        </div>

        {/* 5-Voice Legend Pill Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Brian: {activeStack ? midiToNoteName(activeStack.falsetto) : '—'}
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Carl: {activeStack ? midiToNoteName(activeStack.tenor1) : '—'}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Al/Lead: {activeStack ? midiToNoteName(activeStack.lead) : '—'}
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Dennis: {activeStack ? midiToNoteName(activeStack.baritone) : '—'}
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Mike: {activeStack ? midiToNoteName(activeStack.bass) : '—'}
          </span>
        </div>
      </div>

      {/* Interactive Piano Roll Key Bed */}
      <div className="overflow-x-auto pb-2 select-none">
        <div className="relative flex min-w-[760px] h-48 bg-[#0a0a09] p-2 rounded-lg border border-stone-800 shadow-inner">
          {/* Render White Keys First */}
          {keys
            .filter((k) => !k.isBlack)
            .map((k) => {
              const singer = getVoiceForMidi(k.midi);
              const isMelody = activeMelodyMidi === k.midi;

              return (
                <button
                  key={k.midi}
                  id={`key-${k.midi}`}
                  onMouseDown={() => triggerHarmony(k.midi)}
                  onMouseUp={releaseHarmony}
                  onMouseLeave={() => {
                    if (activeMelodyMidi === k.midi) releaseHarmony();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    triggerHarmony(k.midi);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    releaseHarmony();
                  }}
                  className={`flex-1 h-full rounded-b-md border border-stone-400/40 relative flex flex-col justify-end items-center pb-2 transition-colors cursor-pointer shadow-md ${
                    singer
                      ? 'shadow-lg'
                      : 'bg-gradient-to-b from-stone-100 to-stone-200 hover:from-amber-50 hover:to-amber-100'
                  }`}
                  style={{
                    backgroundColor: singer ? `${singer.color}40` : undefined,
                    borderColor: singer ? singer.color : undefined,
                  }}
                >
                  {singer && (
                    <span
                      className="absolute top-2 text-[9px] font-mono font-bold px-1 rounded shadow"
                      style={{ backgroundColor: singer.color, color: '#000' }}
                    >
                      {singer.name}
                    </span>
                  )}
                  {isMelody && (
                    <span className="absolute top-7 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                  <span
                    className={`text-[10px] font-mono font-semibold ${
                      singer ? 'text-amber-200 font-bold' : 'text-stone-700'
                    }`}
                  >
                    {k.name}
                  </span>
                </button>
              );
            })}

          {/* Render Black Keys Absolutely */}
          {keys.map((k) => {
            if (!k.isBlack) return null;
            const singer = getVoiceForMidi(k.midi);
            const isMelody = activeMelodyMidi === k.midi;

            // Calculate position based on white key index
            const whiteKeysBefore = keys.filter((item) => !item.isBlack && item.midi < k.midi).length;
            const totalWhiteKeys = keys.filter((item) => !item.isBlack).length;
            const leftPercent = (whiteKeysBefore / totalWhiteKeys) * 100 - 1.25;

            return (
              <button
                key={k.midi}
                id={`black-key-${k.midi}`}
                onMouseDown={() => triggerHarmony(k.midi)}
                onMouseUp={releaseHarmony}
                onMouseLeave={() => {
                  if (activeMelodyMidi === k.midi) releaseHarmony();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  triggerHarmony(k.midi);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  releaseHarmony();
                }}
                className={`absolute top-2 h-28 w-[2.6%] z-10 rounded-b border transition-all cursor-pointer flex flex-col justify-end items-center pb-1.5 shadow-2xl ${
                  singer
                    ? 'border-amber-400'
                    : 'bg-stone-900 border-stone-800 hover:bg-stone-800'
                }`}
                style={{
                  left: `${leftPercent}%`,
                  backgroundColor: singer ? singer.color : '#151412',
                }}
              >
                {singer && (
                  <span className="text-[8px] font-mono font-bold text-black bg-white/90 px-0.5 rounded mb-1">
                    {singer.name}
                  </span>
                )}
                {isMelody && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mb-1" />}
                <span className="text-[8px] font-mono text-stone-400">{k.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
        <span>💡 Tip: Press <kbd className="px-1.5 py-0.5 bg-stone-800 rounded font-mono text-stone-200">A</kbd> through <kbd className="px-1.5 py-0.5 bg-stone-800 rounded font-mono text-stone-200">K</kbd> on your keyboard for middle octave melodies.</span>
        <span className="font-mono text-amber-500/80">Style: {HARMONY_STYLES.find(s => s.id === selectedStyle)?.label}</span>
      </div>
    </div>
  );
};
