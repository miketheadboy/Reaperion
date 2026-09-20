import React, { useState, useMemo } from 'react';
import { GuitarTuning } from '../types';
import {
  GUITAR_TUNING_PRESETS,
  CHROMATIC_NOTES,
  calculateGuitarVoicing,
  buildCustomTuning,
} from '../audio/tuningsEngine';
import { vocalSynth } from '../audio/vocalSynth';
import { midiToNoteName } from '../audio/harmonyEngine';
import { Sliders, Volume2, Sparkles, Music, HelpCircle, Check } from 'lucide-react';

interface CustomTuningsTabProps {
  selectedChordName?: string;
  onApplyTuningToArrangement?: (tuning: GuitarTuning, capo: number) => void;
}

export const CustomTuningsTab: React.FC<CustomTuningsTabProps> = ({
  selectedChordName = 'Dmaj7',
  onApplyTuningToArrangement,
}) => {
  const [selectedTuningId, setSelectedTuningId] = useState<string>('dadgad');
  const [capoFret, setCapoFret] = useState<number>(0);
  const [chordToVoice, setChordToVoice] = useState<string>(selectedChordName || 'D');
  const [customPitches, setCustomPitches] = useState<number[]>([38, 45, 50, 55, 57, 62]); // DADGAD default
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [strumDirection, setStrumDirection] = useState<'down' | 'up'>('down');
  const [activePluckedString, setActivePluckedString] = useState<number | null>(null);

  // Active tuning
  const activeTuning: GuitarTuning = useMemo(() => {
    if (isCustomMode) {
      return buildCustomTuning(customPitches, 'Custom User Tuning');
    }
    const preset = GUITAR_TUNING_PRESETS.find((t) => t.id === selectedTuningId);
    return preset || GUITAR_TUNING_PRESETS[0];
  }, [selectedTuningId, isCustomMode, customPitches]);

  // Calculated guitar voicing for current chord and tuning + capo
  const voicing = useMemo(() => {
    return calculateGuitarVoicing(chordToVoice, activeTuning, capoFret);
  }, [chordToVoice, activeTuning, capoFret]);

  const handleStrum = () => {
    if (voicing.notes.length > 0) {
      vocalSynth.playAcousticGuitarStrum(voicing.notes, 2.4, strumDirection);
    }
  };

  const handlePluckString = (stringIndex: number) => {
    setActivePluckedString(stringIndex);
    const fret = voicing.frets[stringIndex];
    if (fret !== 'x') {
      const openPitch = activeTuning.strings[stringIndex].midiNumber + capoFret;
      const pitch = openPitch + fret;
      vocalSynth.playPluckedNote(pitch, 1.8);
    }
    setTimeout(() => setActivePluckedString(null), 300);
  };

  const handleSelectPreset = (tuningId: string) => {
    setSelectedTuningId(tuningId);
    setIsCustomMode(false);
  };

  const handleCustomStringPitchChange = (stringIndex: number, delta: number) => {
    setCustomPitches((prev) => {
      const next = [...prev];
      next[stringIndex] = Math.max(28, Math.min(80, next[stringIndex] + delta));
      return next;
    });
  };

  const quickChords = ['D', 'Dmaj7', 'G', 'Gmaj7', 'A', 'Asus4', 'Bm', 'Em7', 'F#m', 'C'];

  return (
    <div id="custom-tunings-lab" className="space-y-6">
      {/* Top Banner: Tuning Header & Capo Selector */}
      <div className="bg-[#181614] border border-stone-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Acoustic & Alternate Fretboard Studio
              </span>
              <h2 className="font-serif-vintage text-2xl font-bold text-amber-100">
                Custom Tunings & Voicing Lab
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Explore DADGAD (Big Thief), Open D (Dylan), Open G (Keith Richards), Pink Moon (Nick Drake) with interactive fretboard fingering, capo transposition, and authentic acoustic strums.
            </p>
          </div>

          {/* Quick Audio Strum Trigger */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#100f0d] border border-stone-700 rounded-lg p-1 text-xs font-mono">
              <button
                id="strum-down-btn"
                onClick={() => {
                  setStrumDirection('down');
                  handleStrum();
                }}
                className={`px-2.5 py-1 rounded transition ${
                  strumDirection === 'down' ? 'bg-amber-500 text-black font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                Downstroke ↓
              </button>
              <button
                id="strum-up-btn"
                onClick={() => {
                  setStrumDirection('up');
                  handleStrum();
                }}
                className={`px-2.5 py-1 rounded transition ${
                  strumDirection === 'up' ? 'bg-amber-500 text-black font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                Upstroke ↑
              </button>
            </div>

            <button
              id="strum-chord-btn"
              onClick={handleStrum}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg transition"
            >
              <Volume2 className="w-4 h-4" />
              <span>Strum {chordToVoice}</span>
            </button>
          </div>
        </div>

        {/* Tuning Selector Chips & Capo Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Preset Buttons */}
          <div className="lg:col-span-8 space-y-2">
            <span className="text-[11px] font-mono uppercase text-stone-400 font-semibold block">
              Historic & Alternate Tunings
            </span>
            <div className="flex flex-wrap gap-2">
              {GUITAR_TUNING_PRESETS.map((t) => {
                const isSelected = !isCustomMode && selectedTuningId === t.id;
                return (
                  <button
                    key={t.id}
                    id={`tuning-preset-${t.id}`}
                    onClick={() => handleSelectPreset(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border text-left ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                        : 'bg-[#12110f] border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-800/50'
                    }`}
                  >
                    <div>{t.name}</div>
                    <div className="text-[10px] text-stone-500">{t.artistHint}</div>
                  </button>
                );
              })}

              <button
                id="custom-tuning-toggle"
                onClick={() => setIsCustomMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                  isCustomMode
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#12110f] border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div>⚙️ Custom Tuner</div>
                <div className="text-[10px] text-stone-500">Pick all 6 strings</div>
              </button>
            </div>
          </div>

          {/* Capo Control & Chord Audition */}
          <div className="lg:col-span-4 bg-[#12110f] border border-stone-800 rounded-xl p-3 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-400">Capo Position:</span>
                <span className="font-bold text-amber-300">
                  {capoFret === 0 ? 'No Capo (Open)' : `Fret ${capoFret} (+${capoFret} semitones)`}
                </span>
              </div>
              <input
                id="capo-slider"
                type="range"
                min="0"
                max="9"
                value={capoFret}
                onChange={(e) => setCapoFret(parseInt(e.target.value, 10))}
                className="w-full mt-2 accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-stone-600 mt-1">
                <span>0</span>
                <span>3</span>
                <span>5</span>
                <span>7</span>
                <span>9</span>
              </div>
            </div>

            {/* Chord to Voicing Quick Selector */}
            <div>
              <span className="text-[11px] font-mono uppercase text-stone-400 font-semibold block mb-1.5">
                Audition Chord on Fretboard:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickChords.map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChordToVoice(ch)}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition ${
                      chordToVoice === ch
                        ? 'bg-amber-500 text-black font-bold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Custom 6-String Tuner Drawer (If Custom Mode is Active) */}
        {isCustomMode && (
          <div className="bg-[#12110f] border border-amber-500/40 rounded-xl p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-300 font-bold">
                Custom String Pitch Tuner (String 6 Low to String 1 High)
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                Click ▲ or ▼ to tune individual strings chromatically
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {customPitches.map((pitch, idx) => (
                <div
                  key={idx}
                  className="bg-[#181614] border border-stone-800 rounded-lg p-2 text-center font-mono space-y-1"
                >
                  <span className="text-[10px] text-stone-500">String {6 - idx}</span>
                  <div className="text-sm font-bold text-amber-300">{midiToNoteName(pitch)}</div>
                  <div className="flex justify-center gap-1 mt-1">
                    <button
                      onClick={() => handleCustomStringPitchChange(idx, -1)}
                      className="px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 rounded text-xs text-stone-300"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => handleCustomStringPitchChange(idx, 1)}
                      className="px-1.5 py-0.5 bg-stone-800 hover:bg-stone-700 rounded text-xs text-stone-300"
                    >
                      ▲
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Interactive Fretboard Visualizer */}
      <div className="bg-[#181614] border border-stone-800 rounded-xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400">
                Voicing: {voicing.chordName}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                {voicing.difficulty}
              </span>
              {capoFret > 0 && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Capo {capoFret}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1">{voicing.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-stone-400">Tablature:</span>
            <div className="flex items-center gap-1.5 bg-[#100f0d] border border-stone-800 px-3 py-1 rounded-md font-bold text-amber-300">
              {voicing.frets.map((f, idx) => (
                <span key={idx}>{f === 'x' ? 'X' : f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Fretboard Graphic Stage */}
        <div className="relative overflow-x-auto pb-4 pt-2">
          {/* Fretboard Wood Neck */}
          <div className="min-w-[760px] bg-gradient-to-b from-[#2a221b] via-[#1c1712] to-[#251e18] border-2 border-[#3d3228] rounded-xl p-4 shadow-inner relative select-none">
            {/* Capo Bar Graphic Overlay */}
            {capoFret > 0 && (
              <div
                className="absolute top-0 bottom-0 w-4 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-sm shadow-2xl z-20 pointer-events-none flex items-center justify-center"
                style={{ left: `${capoFret * 6.8}%` }}
              >
                <span className="text-[9px] font-black text-black font-mono rotate-90 whitespace-nowrap">
                  CAPO
                </span>
              </div>
            )}

            {/* Strings & Frets Grid */}
            <div className="space-y-4">
              {/* Headstock Nut Open/Mute Markers */}
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 px-6 border-b border-stone-800 pb-1">
                <span className="w-16">String</span>
                <span className="w-12 text-center">Nut/Open</span>
                {Array.from({ length: 12 }).map((_, fIdx) => (
                  <span
                    key={fIdx}
                    className={`flex-1 text-center text-[11px] ${
                      [3, 5, 7, 9].includes(fIdx + 1)
                        ? 'text-amber-400 font-bold'
                        : fIdx + 1 === 12
                        ? 'text-amber-300 font-black'
                        : 'text-stone-500'
                    }`}
                  >
                    Fret {fIdx + 1}
                  </span>
                ))}
              </div>

              {/* 6 Guitar Strings (from String 6 Low at top to String 1 High at bottom) */}
              {activeTuning.strings.map((str, stringIdx) => {
                const fret = voicing.frets[stringIdx];
                const isOpen = fret === 0;
                const isMuted = fret === 'x';
                const fingerFret = typeof fret === 'number' ? fret : -1;
                const isPlucked = activePluckedString === stringIdx;

                return (
                  <div
                    key={str.stringNumber}
                    className={`flex items-center justify-between relative py-1 transition ${
                      isPlucked ? 'bg-amber-500/15 rounded' : ''
                    }`}
                  >
                    {/* String Name & Click to Pluck */}
                    <button
                      onClick={() => handlePluckString(stringIdx)}
                      className="w-16 text-left flex items-center gap-1.5 hover:text-amber-300 transition group"
                      title="Click to pluck string"
                    >
                      <span className="text-[10px] text-stone-500 font-mono">
                        {str.stringNumber}:
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-200 group-hover:text-amber-300">
                        {str.noteName}
                      </span>
                    </button>

                    {/* Open / Mute Indicator Badge */}
                    <div className="w-12 flex justify-center">
                      <button
                        onClick={() => handlePluckString(stringIdx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold transition border ${
                          isOpen
                            ? 'bg-amber-500 text-black border-amber-400 shadow-md scale-105'
                            : isMuted
                            ? 'bg-stone-900 text-rose-500 border-rose-900/50'
                            : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                        }`}
                      >
                        {isOpen ? 'O' : isMuted ? '✕' : '•'}
                      </button>
                    </div>

                    {/* Horizontal Guitar String Wire (thicker for low strings) */}
                    <div
                      className="absolute left-28 right-4 h-[2px] bg-stone-500/70 z-0 pointer-events-none"
                      style={{
                        height: `${Math.max(1, 4 - stringIdx * 0.5)}px`,
                        backgroundColor: stringIdx < 3 ? '#92400e' : '#cbd5e1',
                      }}
                    />

                    {/* Frets 1 through 12 */}
                    {Array.from({ length: 12 }).map((_, fIdx) => {
                      const currentFretNumber = fIdx + 1;
                      const hasFinger = fingerFret === currentFretNumber;

                      return (
                        <div
                          key={fIdx}
                          onClick={() => {
                            const pitch = str.midiNumber + capoFret + currentFretNumber;
                            vocalSynth.playPluckedNote(pitch, 1.8);
                          }}
                          className="flex-1 h-8 flex items-center justify-center relative cursor-pointer group z-10"
                        >
                          {/* Fret wire vertical line */}
                          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-amber-700/60 group-hover:bg-amber-400 transition" />

                          {/* Inlay Dots on Frets 3, 5, 7, 9, 12 */}
                          {stringIdx === 2 && [3, 5, 7, 9].includes(currentFretNumber) && (
                            <div className="absolute w-2 h-2 rounded-full bg-stone-400/30 pointer-events-none" />
                          )}
                          {stringIdx === 2 && currentFretNumber === 12 && (
                            <div className="absolute flex gap-2 pointer-events-none">
                              <div className="w-2 h-2 rounded-full bg-amber-300/40" />
                              <div className="w-2 h-2 rounded-full bg-amber-300/40" />
                            </div>
                          )}

                          {/* Finger Placement Circle */}
                          {hasFinger && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 font-bold font-mono text-[11px] flex flex-col items-center justify-center shadow-lg border border-amber-300 animate-scale-up">
                              <span>{voicing.noteNames[stringIdx]?.slice(0, 2)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Voicing Interval Breakdown & Audio Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-stone-800/80 pt-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-stone-400 uppercase">Voicing Intervals:</span>
            <div className="flex flex-wrap gap-1">
              {voicing.intervalLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-[11px] font-mono text-amber-300"
                >
                  Str {6 - idx}: {lbl}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono text-stone-400 uppercase">Sounding Notes:</span>
            <p className="text-xs font-mono text-stone-300">
              {voicing.noteNames.filter((n) => n !== 'Muted').join(' — ')}
            </p>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleStrum}
              className="w-full md:w-auto px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition shadow"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Audition Acoustic Resonance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
