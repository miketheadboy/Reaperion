import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  MoveRight,
  Music2,
  Guitar,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Volume2,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ChordVoicing, GuitarTuning, SongwritingSession } from '../types';
import { TUNINGS } from '../data/songCatalog';
import { acousticSynth } from '../audio/acousticSynth';
import { createMidiDataUri } from '../audio/midiEncoder';

interface ChordTrackStudioProps {
  session: SongwritingSession;
  onUpdateSession: (updated: Partial<SongwritingSession>) => void;
  currentPlayheadBeat: number;
  isPlaying: boolean;
}

const COMMON_CHORD_TEMPLATES = [
  { name: 'C', numeral: 'I', beats: 4, midiNotes: [48, 52, 55, 60, 64], bassNote: 48, inversion: 0, extension: 'none' },
  { name: 'Dm7', numeral: 'ii7', beats: 4, midiNotes: [50, 53, 57, 60, 65], bassNote: 50, inversion: 0, extension: 'none' },
  { name: 'Em7', numeral: 'iii7', beats: 4, midiNotes: [52, 55, 59, 62, 64], bassNote: 52, inversion: 0, extension: 'none' },
  { name: 'Fmaj7', numeral: 'IVmaj7', beats: 4, midiNotes: [53, 57, 60, 64, 69], bassNote: 53, inversion: 0, extension: 'maj7' },
  { name: 'G7', numeral: 'V7', beats: 4, midiNotes: [55, 59, 62, 65, 67], bassNote: 55, inversion: 0, extension: 'none' },
  { name: 'Am9', numeral: 'vi9', beats: 4, midiNotes: [45, 52, 55, 59, 60], bassNote: 45, inversion: 0, extension: 'add9' },
  { name: 'Dadd9', numeral: 'Iadd9', beats: 4, midiNotes: [50, 57, 62, 64, 69], bassNote: 50, inversion: 0, extension: 'add9' },
  { name: 'G/B', numeral: 'IV/3', beats: 4, midiNotes: [47, 50, 55, 59, 62], bassNote: 47, inversion: 1, extension: 'slash' },
  { name: 'A/E', numeral: 'I/5', beats: 4, midiNotes: [52, 57, 61, 64, 69], bassNote: 52, inversion: 2, extension: 'slash' },
  { name: 'F#m11', numeral: 'iii11', beats: 4, midiNotes: [54, 57, 61, 64, 66], bassNote: 54, inversion: 0, extension: 'm11' },
  { name: 'Asus4', numeral: 'Vsus4', beats: 4, midiNotes: [45, 52, 57, 62, 64], bassNote: 45, inversion: 0, extension: 'sus4' },
  { name: 'Fdim7', numeral: 'bVI°7', beats: 4, midiNotes: [53, 56, 59, 62, 65], bassNote: 53, inversion: 0, extension: 'none' },
];

export const ChordTrackStudio: React.FC<ChordTrackStudioProps> = ({
  session,
  onUpdateSession,
  currentPlayheadBeat,
  isPlaying,
}) => {
  const [selectedChordId, setSelectedChordId] = useState<string>(session.chords[0]?.id || '');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const selectedChord = session.chords.find((c) => c.id === selectedChordId) || session.chords[0];

  const handleUpdateChord = (id: string, updates: Partial<ChordVoicing>) => {
    const newChords = session.chords.map((c) => (c.id === id ? { ...c, ...updates } : c));
    // Recalculate absolute beat start positions
    let currentBeat = 0;
    const syncedChords = newChords.map((c) => {
      const updated = { ...c, absoluteBeatStart: currentBeat };
      currentBeat += c.beats;
      return updated;
    });
    onUpdateSession({ chords: syncedChords });
  };

  const handleAddChord = (template = COMMON_CHORD_TEMPLATES[0]) => {
    const totalBeats = session.chords.reduce((acc, c) => acc + c.beats, 0);
    const newChord: ChordVoicing = {
      ...template,
      id: `chord-${Date.now()}`,
      absoluteBeatStart: totalBeats,
    };
    onUpdateSession({ chords: [...session.chords, newChord] });
    setSelectedChordId(newChord.id);
  };

  const handleDeleteChord = (id: string) => {
    if (session.chords.length <= 1) return;
    const remaining = session.chords.filter((c) => c.id !== id);
    let currentBeat = 0;
    const syncedChords = remaining.map((c) => {
      const updated = { ...c, absoluteBeatStart: currentBeat };
      currentBeat += c.beats;
      return updated;
    });
    onUpdateSession({ chords: syncedChords });
    setSelectedChordId(syncedChords[0].id);
  };

  const handleAuditionChord = (chord: ChordVoicing) => {
    chord.midiNotes.forEach((note, idx) => {
      setTimeout(() => {
        acousticSynth.triggerPluck(
          note + session.capoFret,
          100 - idx * 4,
          1.8,
          session.soundMode,
          session.grooveMatrix.fuzzDrive
        );
      }, idx * (session.grooveMatrix.strumSpeedMs || 15));
    });
  };

  const midiDataUri = createMidiDataUri(session.notes, session.tempo, `${session.name}_REAPER_Track`);
  const totalSessionBeats = session.chords.reduce((acc, c) => acc + c.beats, 0);

  return (
    <div className="space-y-6">
      {/* Studio One Style Header Control Bar */}
      <div className="bg-[#181a22] border border-stone-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        {/* Tuning & Capo Settings */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Guitar Tuning */}
          <div className="flex items-center gap-2">
            <Guitar className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-stone-400">Tuning:</span>
            <select
              id="tuning-select"
              value={session.tuning.id}
              onChange={(e) => {
                const found = TUNINGS.find((t) => t.id === e.target.value);
                if (found) onUpdateSession({ tuning: found });
              }}
              className="bg-[#121318] text-amber-200 border border-stone-700 text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
            >
              {TUNINGS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Capo Fret */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-400">Capo:</span>
            <select
              id="capo-select"
              value={session.capoFret}
              onChange={(e) => onUpdateSession({ capoFret: parseInt(e.target.value, 10) })}
              className="bg-[#121318] text-amber-200 border border-stone-700 text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value={0}>No Capo (Open)</option>
              <option value={1}>1st Fret (Ab/Fm)</option>
              <option value={2}>2nd Fret (A/F#m)</option>
              <option value={3}>3rd Fret (Bb/Gm)</option>
              <option value={4}>4th Fret (B/G#m)</option>
              <option value={5}>5th Fret (C/Am)</option>
              <option value={7}>7th Fret (D/Bm)</option>
            </select>
          </div>

          {/* Sound Mode / Instrument */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-400">Sound:</span>
            <select
              id="sound-mode-select"
              value={session.soundMode}
              onChange={(e) => onUpdateSession({ soundMode: e.target.value as any })}
              className="bg-[#121318] text-stone-200 border border-stone-700 text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
            >
              <option value="acoustic_guitar">Acoustic Guitar (Warm Wood)</option>
              <option value="electric_clean">Clean Electric (Strat Chime)</option>
              <option value="beach_boys_vocal">Beach Boys Vocal Stack</option>
              <option value="warm_keys">Rhodes / Warm Keys</option>
            </select>
          </div>
        </div>

        {/* REAPER Direct Drag Chip */}
        <div className="flex items-center gap-2">
          <div
            id="reaper-drag-chip"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('DownloadURL', `audio/midi:${session.name}.mid:${midiDataUri}`);
              e.dataTransfer.setData('text/plain', `${session.name}.mid`);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-mono font-black rounded-lg cursor-grab active:cursor-grabbing border border-amber-300/40 shadow flex items-center gap-2 transition"
            title="Drag this chip directly onto any REAPER track or folder to import MIDI!"
          >
            <MoveRight className="w-3.5 h-3.5" />
            <span>DRAG TO REAPER</span>
          </div>
        </div>
      </div>

      {/* Studio One Horizontal Chord Track Timeline */}
      <div className="bg-[#14151b] border border-stone-800 rounded-xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-mono font-bold text-stone-300 uppercase tracking-wider">
              Studio One Chord Track Timeline
            </h2>
            <span className="text-[10px] text-stone-500 font-mono">
              Total: {totalSessionBeats} Beats • {session.tempo} BPM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="add-chord-btn"
              onClick={() => handleAddChord()}
              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded text-xs font-mono font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" />
              <span>Add Block</span>
            </button>
          </div>
        </div>

        {/* Visual Timeline Blocks */}
        <div className="relative overflow-x-auto pb-4 pt-1">
          {/* Moving Playhead Marker */}
          {isPlaying && totalSessionBeats > 0 && (
            <div
              className="absolute top-0 bottom-4 w-0.5 bg-rose-500 z-20 shadow-[0_0_8px_rgba(244,63,94,0.9)] pointer-events-none transition-all"
              style={{
                left: `${Math.min(100, (currentPlayheadBeat / totalSessionBeats) * 100)}%`,
              }}
            >
              <div className="w-2.5 h-2.5 bg-rose-500 rotate-45 -ml-1 -mt-1 shadow" />
            </div>
          )}

          <div className="flex gap-2 min-w-[700px]">
            {session.chords.map((chord, idx) => {
              const isSelected = chord.id === selectedChord?.id;
              const widthPct = Math.max(12, (chord.beats / Math.max(16, totalSessionBeats)) * 100);

              return (
                <div
                  key={chord.id}
                  id={`chord-block-${idx}`}
                  onClick={() => setSelectedChordId(chord.id)}
                  style={{ flex: `${chord.beats} 0 0%` }}
                  className={`group relative rounded-lg p-3 transition border cursor-pointer select-none flex flex-col justify-between h-28 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/10'
                      : 'bg-[#1a1c24] border-stone-800 hover:border-stone-700 hover:bg-[#20232e]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-400 font-semibold">
                      Bar {idx + 1}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-700">
                      {chord.beats} Beats
                    </span>
                  </div>

                  <div>
                    <div className="text-lg font-bold font-mono text-amber-200 group-hover:text-amber-100 flex items-center gap-1.5">
                      {chord.name}
                    </div>
                    <div className="text-xs font-mono text-amber-400/80">
                      {chord.numeral}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                    <span>{chord.extension !== 'none' ? chord.extension : 'root'}</span>
                    <button
                      id={`audition-chord-${idx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAuditionChord(chord);
                      }}
                      className="p-1 hover:text-amber-300 transition"
                      title="Audition chord"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Chord Inspector & Voicing Controls */}
      {selectedChord && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#161820] border border-stone-800 rounded-xl p-4 shadow-lg">
          {/* Chord Name, Numeral & Beat Length */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-stone-300 uppercase">
                Chord Inspector
              </h3>
              <button
                id="delete-chord-btn"
                onClick={() => handleDeleteChord(selectedChord.id)}
                disabled={session.chords.length <= 1}
                className="text-stone-500 hover:text-rose-400 text-xs font-mono flex items-center gap-1 disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-stone-400 block mb-1">
                  Chord Name
                </label>
                <input
                  id="chord-name-input"
                  type="text"
                  value={selectedChord.name}
                  onChange={(e) => handleUpdateChord(selectedChord.id, { name: e.target.value })}
                  className="w-full bg-[#101116] border border-stone-700 rounded px-2.5 py-1.5 text-xs font-mono font-bold text-amber-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-stone-400 block mb-1">
                  Roman Numeral
                </label>
                <input
                  id="chord-numeral-input"
                  type="text"
                  value={selectedChord.numeral}
                  onChange={(e) => handleUpdateChord(selectedChord.id, { numeral: e.target.value })}
                  className="w-full bg-[#101116] border border-stone-700 rounded px-2.5 py-1.5 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-stone-400 block mb-1 flex items-center justify-between">
                <span>Duration (Beats)</span>
                <span className="text-amber-400 font-bold">{selectedChord.beats} Beats</span>
              </label>
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5, 6, 7, 9].map((b) => (
                  <button
                    key={b}
                    id={`beat-len-btn-${b}`}
                    onClick={() => handleUpdateChord(selectedChord.id, { beats: b })}
                    className={`flex-1 py-1 rounded text-xs font-mono font-bold transition border ${
                      selectedChord.beats === b
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-[#1a1c24] text-stone-300 border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <span className="text-[9px] font-mono text-stone-500 mt-1 block">
                (Tip: 5 for Radiohead 5/4, 6 for Dylan poem holds, 9 for Godspeed drone)
              </span>
            </div>
          </div>

          {/* Inversion & Extension */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-stone-300 uppercase">
              Inversion & Extension
            </h3>

            <div>
              <label className="text-[10px] font-mono text-stone-400 block mb-1">
                Bass Inversion
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Root', val: 0 },
                  { label: '1st (3rd)', val: 1 },
                  { label: '2nd (5th)', val: 2 },
                  { label: '3rd (7th)', val: 3 },
                ].map((inv) => (
                  <button
                    key={inv.val}
                    id={`inversion-btn-${inv.val}`}
                    onClick={() => handleUpdateChord(selectedChord.id, { inversion: inv.val })}
                    className={`py-1.5 px-2 rounded text-[11px] font-mono font-semibold transition border text-center ${
                      selectedChord.inversion === inv.val
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-[#121318] text-stone-400 border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    {inv.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-stone-400 block mb-1">
                Color Extension
              </label>
              <select
                id="chord-extension-select"
                value={selectedChord.extension}
                onChange={(e) => handleUpdateChord(selectedChord.id, { extension: e.target.value })}
                className="w-full bg-[#121318] text-stone-200 border border-stone-700 text-xs font-mono font-semibold px-2.5 py-1.5 rounded focus:outline-none focus:border-amber-500"
              >
                <option value="none">Triad / Standard (None)</option>
                <option value="add9">add9 (Elliott Smith / Folk ring)</option>
                <option value="sus2">sus2 (Open breath)</option>
                <option value="sus4">sus4 (Unresolved tension)</option>
                <option value="maj7">maj7 (Lush indie lift)</option>
                <option value="m11">m11 (Neo-Soul / D'Angelo / Radiohead)</option>
                <option value="slash">Slash Bass (Pet Sounds pedal)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                id="audition-selected-chord-btn"
                onClick={() => handleAuditionChord(selectedChord)}
                className="w-full py-1.5 bg-[#20232e] hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audition Voicing</span>
              </button>
            </div>
          </div>

          {/* Quick Diatonic Palette */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-stone-300 uppercase flex items-center justify-between">
              <span>Quick Diatonic Palette</span>
              <span className="text-[10px] text-stone-500 font-normal">Click to replace</span>
            </h3>

            <div className="grid grid-cols-3 gap-1.5">
              {COMMON_CHORD_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  id={`palette-chord-${idx}`}
                  onClick={() => handleUpdateChord(selectedChord.id, { ...tmpl })}
                  className="p-1.5 rounded bg-[#101116] hover:bg-amber-500/20 border border-stone-800 hover:border-amber-500/40 text-left transition group"
                >
                  <div className="text-xs font-mono font-bold text-stone-200 group-hover:text-amber-200">
                    {tmpl.name}
                  </div>
                  <div className="text-[9px] font-mono text-stone-500 group-hover:text-amber-400/80">
                    {tmpl.numeral}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
