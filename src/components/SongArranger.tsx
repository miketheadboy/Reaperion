import React, { useState, useEffect, useRef } from 'react';
import { BeachBoysChord, ExtendedSongPreset, SongPreset, VocalVoiceState, VowelType } from '../types';
import { midiToNoteName } from '../audio/harmonyEngine';
import { ALL_SONGWRITER_PRESETS } from '../audio/artistDnaPresets';
import { buildMultiTrackBeachBoysMidi } from '../audio/reaperExport';
import { vocalSynth } from '../audio/vocalSynth';
import { VoicingVariationsDeck } from './VoicingVariationsDeck';
import { DylanWeirdoModal } from './DylanWeirdoModal';
import {
  Play,
  Square,
  Repeat,
  Music,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  Volume2,
  Sparkles,
  Download,
  Copy,
  Layers,
  Wand2,
  Guitar,
  Mic,
} from 'lucide-react';

interface SongArrangerProps {
  currentPreset: SongPreset;
  onPresetChange: (preset: SongPreset) => void;
  voices: VocalVoiceState[];
  onOpenReaperExport: () => void;
  onOpenAiArranger: () => void;
  onOpenTuningsTab?: () => void;
  onOpenTempoMapTab?: () => void;
}

export const SongArranger: React.FC<SongArrangerProps> = ({
  currentPreset,
  onPresetChange,
  voices,
  onOpenReaperExport,
  onOpenAiArranger,
  onOpenTuningsTab,
  onOpenTempoMapTab,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(true);
  const [tempo, setTempo] = useState(currentPreset.tempo || 78);
  const [transposeSemitones, setTransposeSemitones] = useState(0);
  const [soundMode, setSoundMode] = useState<'vocal' | 'guitar'>('vocal');

  // Drag and Drop chord reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Active variation chord inspector
  const [variationChordIndex, setVariationChordIndex] = useState<number | null>(null);

  // Dylan Weirdo Modal state
  const [isDylanModalOpen, setIsDylanModalOpen] = useState(false);

  // Artist DNA filter
  const [selectedDnaFilter, setSelectedDnaFilter] = useState<string>('all');

  const playbackTimerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    setTempo(currentPreset.tempo);
    setTransposeSemitones(0);
    stopPlayback();
  }, [currentPreset.id]);

  const stopPlayback = () => {
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    vocalSynth.stopAll();
    setIsPlaying(false);
    setActiveChordIndex(null);
  };

  const playSequence = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsPlaying(true);
    let index = 0;

    const playNext = () => {
      if (!currentPreset.chords || currentPreset.chords.length === 0) {
        stopPlayback();
        return;
      }

      if (index >= currentPreset.chords.length) {
        if (isLooping) {
          index = 0;
        } else {
          stopPlayback();
          return;
        }
      }

      const chord = currentPreset.chords[index];
      setActiveChordIndex(index);

      const transposedNotes = {
        falsetto: chord.notes.falsetto + transposeSemitones,
        tenor1: chord.notes.tenor1 + transposeSemitones,
        lead: chord.notes.lead + transposeSemitones,
        baritone: chord.notes.baritone + transposeSemitones,
        bass: chord.notes.bass + transposeSemitones,
      };

      const durationSec = (chord.durationBeats * 60) / tempo;

      if (soundMode === 'guitar') {
        const guitarPitches = [
          transposedNotes.bass,
          transposedNotes.baritone,
          transposedNotes.lead,
          transposedNotes.tenor1,
          transposedNotes.falsetto,
        ];
        vocalSynth.playAcousticGuitarStrum(guitarPitches, durationSec * 0.95);
      } else {
        vocalSynth.playBeachBoysChord(transposedNotes, chord.vowel, durationSec);
      }

      index++;
      playbackTimerRef.current = setTimeout(playNext, durationSec * 1000);
    };

    playNext();
  };

  const playSingleChord = (chord: BeachBoysChord, index: number) => {
    setActiveChordIndex(index);
    const transposedNotes = {
      falsetto: chord.notes.falsetto + transposeSemitones,
      tenor1: chord.notes.tenor1 + transposeSemitones,
      lead: chord.notes.lead + transposeSemitones,
      baritone: chord.notes.baritone + transposeSemitones,
      bass: chord.notes.bass + transposeSemitones,
    };
    const durationSec = Math.max(1.8, (chord.durationBeats * 60) / tempo);

    if (soundMode === 'guitar') {
      const guitarPitches = [
        transposedNotes.bass,
        transposedNotes.baritone,
        transposedNotes.lead,
        transposedNotes.tenor1,
        transposedNotes.falsetto,
      ];
      vocalSynth.playAcousticGuitarStrum(guitarPitches, durationSec);
    } else {
      vocalSynth.playBeachBoysChord(transposedNotes, chord.vowel, durationSec);
    }

    setTimeout(() => {
      if (activeChordIndex === index) {
        setActiveChordIndex(null);
      }
    }, durationSec * 1000);
  };

  const handleTranspose = (delta: number) => {
    setTransposeSemitones((prev) => prev + delta);
  };

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedChords = [...currentPreset.chords];
    const [movedChord] = updatedChords.splice(draggedIndex, 1);
    updatedChords.splice(targetIndex, 0, movedChord);

    onPresetChange({
      ...currentPreset,
      chords: updatedChords,
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // MIDI Drag to DAW handler
  const handleMidiDragStart = (e: React.DragEvent) => {
    const midiBytes = buildMultiTrackBeachBoysMidi(currentPreset.chords, tempo, currentPreset.title);
    const blob = new Blob([midiBytes.buffer as ArrayBuffer], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const filename = `${currentPreset.id}_5Voice.mid`;

    // DownloadURL for direct DAW drag
    e.dataTransfer.setData('DownloadURL', `audio/midi:${filename}:${url}`);
    e.dataTransfer.setData('text/plain', filename);
  };

  const handleAddChord = () => {
    const lastChord = currentPreset.chords[currentPreset.chords.length - 1];
    const newChord: BeachBoysChord = {
      id: 'chord_' + Date.now(),
      name: lastChord ? `${lastChord.name} (Copy)` : 'Emaj7',
      numeral: lastChord?.numeral || 'I',
      root: lastChord?.root || 'E',
      quality: lastChord?.quality || 'Major',
      inversion: 'Root',
      durationBeats: 4,
      lyricsSnippet: 'New progression bar...',
      vowel: 'aah',
      notes: lastChord ? { ...lastChord.notes } : { falsetto: 75, tenor1: 71, lead: 68, baritone: 64, bass: 40 },
      voicingDescription: 'Custom progression chord',
    };

    onPresetChange({
      ...currentPreset,
      chords: [...currentPreset.chords, newChord],
    });
  };

  const handleDeleteChord = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (currentPreset.chords.length <= 1) return;
    const updated = currentPreset.chords.filter((_, idx) => idx !== index);
    onPresetChange({ ...currentPreset, chords: updated });
  };

  const handleDuplicateChord = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const source = currentPreset.chords[index];
    const dup: BeachBoysChord = {
      ...source,
      id: 'chord_' + Date.now(),
      name: `${source.name} (Rep)`,
      notes: { ...source.notes },
    };
    const updated = [...currentPreset.chords];
    updated.splice(index + 1, 0, dup);
    onPresetChange({ ...currentPreset, chords: updated });
  };

  const handleUpdateDuration = (index: number, beats: number) => {
    const updated = [...currentPreset.chords];
    updated[index] = { ...updated[index], durationBeats: beats };
    onPresetChange({ ...currentPreset, chords: updated });
  };

  const handleApplyVariation = (updatedChord: BeachBoysChord) => {
    if (variationChordIndex === null) return;
    const updated = [...currentPreset.chords];
    updated[variationChordIndex] = updatedChord;
    onPresetChange({ ...currentPreset, chords: updated });
    setVariationChordIndex(null);
  };

  const filteredPresets = ALL_SONGWRITER_PRESETS.filter((p) => {
    if (selectedDnaFilter === 'all') return true;
    return (p as any).artistDna === selectedDnaFilter;
  });

  return (
    <div id="song-arranger-panel" className="space-y-6">
      {/* Preset Selector Banner */}
      <div className="bg-[#181614] border border-stone-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                REAPER Songwriter Studio
              </span>
              <h2 className="font-serif-vintage text-2xl font-bold text-amber-100">
                {currentPreset.title}
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Album: <strong className="text-stone-300">{currentPreset.album}</strong> ({currentPreset.year}) • Key: <strong className="text-amber-300">{currentPreset.key}</strong>
            </p>
          </div>

          {/* Preset Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Artist DNA Preset Dropdown */}
            <select
              id="song-preset-select"
              value={currentPreset.id}
              onChange={(e) => {
                const found = ALL_SONGWRITER_PRESETS.find((p) => p.id === e.target.value);
                if (found) onPresetChange(found);
              }}
              className="bg-[#100f0d] text-amber-300 font-mono text-xs rounded-lg border border-stone-700 px-3 py-2 focus:outline-none focus:border-amber-500 shadow"
            >
              {ALL_SONGWRITER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <button
              id="open-dylan-weirdo-btn"
              onClick={() => setIsDylanModalOpen(true)}
              className="px-3 py-2 bg-[#221c15] hover:bg-[#2e261e] text-amber-400 border border-amber-500/40 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
              title="Open Bob Dylan Structure Weirdo Engine"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Dylan Weirdo Engine</span>
            </button>

            <button
              id="open-ai-arranger-btn"
              onClick={onOpenAiArranger}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-mono font-medium border border-stone-700 flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Brian Wilson AI</span>
            </button>

            <button
              id="open-reaper-export-btn"
              onClick={onOpenReaperExport}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Export to REAPER</span>
            </button>
          </div>
        </div>

        {/* Artist DNA Quick Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono uppercase text-stone-500 font-bold">Artist DNA:</span>
          {[
            { id: 'all', label: 'All Presets' },
            { id: 'beach_boys', label: 'Beach Boys' },
            { id: 'bob_dylan', label: 'Bob Dylan (Weirdo Meter)' },
            { id: 'radiohead', label: 'Radiohead' },
            { id: 'big_thief', label: 'Big Thief (DADGAD)' },
            { id: 'dangelo', label: "D'Angelo (Neo-Soul)" },
            { id: 'microphones', label: 'The Microphones' },
            { id: 'neutral_milk_hotel', label: 'Neutral Milk Hotel' },
            { id: 'godspeed', label: 'Godspeed You!' },
          ].map((dna) => {
            const isSel = selectedDnaFilter === dna.id;
            return (
              <button
                key={dna.id}
                onClick={() => {
                  setSelectedDnaFilter(dna.id);
                  const firstMatch = ALL_SONGWRITER_PRESETS.find(
                    (p) => dna.id === 'all' || (p as any).artistDna === dna.id
                  );
                  if (firstMatch) onPresetChange(firstMatch);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition border ${
                  isSel
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                    : 'bg-[#12110f] text-stone-400 border-stone-800 hover:text-stone-200'
                }`}
              >
                {dna.label}
              </button>
            );
          })}
        </div>

        {/* Historic & Vocal Arrangement Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-300 bg-[#12110f] p-3.5 rounded-lg border border-stone-800/80">
          <div className="md:col-span-2">
            <span className="font-bold text-amber-400 font-mono block mb-1">Harmonic Architecture:</span>
            <p className="leading-relaxed text-stone-400">{currentPreset.description}</p>
          </div>
          <div>
            <span className="font-bold text-sky-400 font-mono block mb-1">Studio & Session Notes:</span>
            <p className="leading-relaxed text-stone-400 italic">"{currentPreset.funFact}"</p>
          </div>
        </div>

        {/* Master Transport, Drag-to-DAW & Sound Engine Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-stone-800">
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="play-progression-btn"
              onClick={playSequence}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition shadow ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4" />
                  <span>Stop Playback</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Progression</span>
                </>
              )}
            </button>

            <button
              id="loop-toggle-btn"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-lg border text-xs font-mono transition ${
                isLooping
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
              title={isLooping ? 'Looping enabled' : 'Play once'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Sound Mode Toggle: Vocal Stack vs Acoustic Guitar */}
            <div className="flex items-center bg-[#100f0d] border border-stone-700 rounded-lg p-1 text-xs font-mono">
              <button
                id="sound-mode-vocal"
                onClick={() => setSoundMode('vocal')}
                className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
                  soundMode === 'vocal' ? 'bg-amber-500 text-black font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>5-Voice Choir</span>
              </button>
              <button
                id="sound-mode-guitar"
                onClick={() => setSoundMode('guitar')}
                className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 ${
                  soundMode === 'guitar' ? 'bg-amber-500 text-black font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Guitar className="w-3.5 h-3.5" />
                <span>Acoustic Strum</span>
              </button>
            </div>

            {/* Tempo Slider */}
            <div className="flex items-center gap-2 bg-[#12110f] px-3 py-1.5 rounded-lg border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Tempo:</span>
              <input
                id="tempo-slider"
                type="range"
                min="40"
                max="180"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-20 cursor-pointer accent-amber-500"
              />
              <span className="text-xs font-mono font-bold text-amber-400 w-10 text-right">
                {tempo} <span className="text-[9px] text-stone-400">BPM</span>
              </span>
            </div>
          </div>

          {/* Transposition & Draggable MIDI Out to DAW */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Draggable MIDI Tile to REAPER */}
            <div
              id="drag-midi-tile"
              draggable
              onDragStart={handleMidiDragStart}
              className="bg-[#12110f] hover:bg-[#1a1714] border border-amber-500/40 rounded-lg px-3 py-1.5 cursor-grab active:cursor-grabbing flex items-center gap-2 transition group shadow"
              title="Drag this tile directly onto a REAPER track lane or desktop folder!"
            >
              <GripVertical className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
              <div className="text-left font-mono">
                <span className="text-[9px] uppercase text-amber-400 font-bold block">Drag .MID to REAPER</span>
                <span className="text-[11px] text-stone-300 font-semibold">{currentPreset.chords.length} Chords Track</span>
              </div>
            </div>

            {/* Vocal Transposition */}
            <div className="flex items-center gap-2 bg-[#12110f] px-3 py-1.5 rounded-lg border border-stone-800">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Transpose:</span>
              <button
                id="transpose-down-btn"
                onClick={() => handleTranspose(-1)}
                className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 rounded text-xs font-mono text-stone-200"
              >
                -1
              </button>
              <span className="text-xs font-mono font-bold text-amber-300 w-10 text-center">
                {transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones} st
              </span>
              <button
                id="transpose-up-btn"
                onClick={() => handleTranspose(1)}
                className="px-2 py-0.5 bg-stone-800 hover:bg-stone-700 rounded text-xs font-mono text-stone-200"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chords Sequence Timeline with Drag-and-Drop Reordering */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif-vintage text-lg font-bold text-amber-100 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>Progression Timeline ({currentPreset.chords.length} Chords)</span>
            </h3>
            <p className="text-xs text-stone-400 font-mono">
              Drag by the handle ⠿ to reorder • Click card to audition • Toggle beats for Bob Dylan 2/4 & 6/4 odd bars
            </p>
          </div>

          <button
            id="add-chord-btn"
            onClick={handleAddChord}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Chord</span>
          </button>
        </div>

        {/* Voicing Variations Deck Inspector (If open) */}
        {variationChordIndex !== null && currentPreset.chords[variationChordIndex] && (
          <VoicingVariationsDeck
            chord={currentPreset.chords[variationChordIndex]}
            onApplyVariation={handleApplyVariation}
            onClose={() => setVariationChordIndex(null)}
          />
        )}

        {/* Responsive Grid of Draggable Chord Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {currentPreset.chords.map((chord: BeachBoysChord, index: number) => {
            const isActive = activeChordIndex === index;
            const isDragged = draggedIndex === index;
            const isOver = dragOverIndex === index;
            const fPitch = chord.notes.falsetto + transposeSemitones;
            const tPitch = chord.notes.tenor1 + transposeSemitones;
            const lPitch = chord.notes.lead + transposeSemitones;
            const bPitch = chord.notes.baritone + transposeSemitones;
            const bsPitch = chord.notes.bass + transposeSemitones;
            const isOddBar = chord.durationBeats !== 4;

            return (
              <div
                key={chord.id}
                id={`chord-card-${chord.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => playSingleChord(chord, index)}
                className={`bg-[#181614] border rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 relative group ${
                  isActive
                    ? 'border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02] bg-[#221f1a]'
                    : isOver
                    ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-950/20'
                    : isOddBar
                    ? 'border-amber-500/50 hover:border-amber-400 bg-[#1c1914]'
                    : 'border-stone-800 hover:border-stone-700 shadow hover:bg-[#1c1a17]'
                } ${isDragged ? 'opacity-40' : ''}`}
              >
                {/* Drag Grip Handle on Top Left */}
                <div className="flex items-center justify-between">
                  <div
                    className="cursor-grab active:cursor-grabbing text-stone-500 hover:text-amber-400 flex items-center gap-1"
                    title="Drag to reorder chord"
                  >
                    <GripVertical className="w-4 h-4" />
                    <span className="text-[10px] font-mono text-stone-500">#{index + 1}</span>
                  </div>

                  {/* Beats Selector: 2/4, 3/4, 4/4, 5/4, 6/4 */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1"
                  >
                    <select
                      value={chord.durationBeats}
                      onChange={(e) => handleUpdateDuration(index, parseFloat(e.target.value))}
                      className={`text-[10px] font-mono rounded px-1.5 py-0.5 border ${
                        isOddBar
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : 'bg-[#12110f] text-stone-400 border-stone-800'
                      }`}
                      title="Measure length (beats)"
                    >
                      <option value="2">2b (Dylan 2/4 Breath)</option>
                      <option value="3">3b (3/4 Waltz Step)</option>
                      <option value="4">4b (4/4 Common Time)</option>
                      <option value="5">5b (5/4 Asymmetric)</option>
                      <option value="6">6b (6/4 Harmonica Hold)</option>
                    </select>

                    <button
                      onClick={(e) => handleDuplicateChord(e, index)}
                      className="p-1 text-stone-500 hover:text-stone-300"
                      title="Duplicate chord"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteChord(e, index)}
                      className="p-1 text-stone-500 hover:text-rose-400"
                      title="Delete chord"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Card Main: Chord Name & Numeral */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-serif-vintage font-bold text-amber-200">
                      {chord.name}
                    </span>
                    <span className="text-xs font-mono text-stone-400">
                      {chord.numeral}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400/90 block mt-0.5">
                    {chord.inversion}
                  </span>

                  {chord.lyricsSnippet && (
                    <p className="text-xs text-stone-300 italic mt-2 bg-[#12110f] p-2 rounded border border-stone-800/80">
                      "{chord.lyricsSnippet}"
                    </p>
                  )}
                </div>

                {/* 5-Voice Pitch Allocations */}
                <div className="space-y-1.5 pt-2 border-t border-stone-800/80 text-[11px] font-mono">
                  <div className="flex justify-between items-center text-amber-300">
                    <span className="text-stone-400">Brian (Falsetto):</span>
                    <span className="font-bold">{midiToNoteName(fPitch)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sky-300">
                    <span className="text-stone-400">Carl (1st Tenor):</span>
                    <span className="font-bold">{midiToNoteName(tPitch)}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-300">
                    <span className="text-stone-400">Al/Lead (Melody):</span>
                    <span className="font-bold">{midiToNoteName(lPitch)}</span>
                  </div>
                  <div className="flex justify-between items-center text-purple-300">
                    <span className="text-stone-400">Dennis (Baritone):</span>
                    <span className="font-bold">{midiToNoteName(bPitch)}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-300">
                    <span className="text-stone-400">Mike (Bass):</span>
                    <span className="font-bold">{midiToNoteName(bsPitch)}</span>
                  </div>
                </div>

                {/* Bottom Bar: Voicing Variations Button */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/60 text-[10px] font-mono">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setVariationChordIndex(variationChordIndex === index ? null : index);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 underline"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Variations</span>
                  </button>

                  <span className="text-stone-500">
                    /{chord.vowel}/ • {chord.durationBeats} Beats
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dylan Weirdo Structure Modal */}
      {isDylanModalOpen && (
        <DylanWeirdoModal
          currentChords={currentPreset.chords}
          onApplyChords={(newChords, title) => {
            onPresetChange({
              ...currentPreset,
              title: title || currentPreset.title,
              chords: newChords,
            });
          }}
          onClose={() => setIsDylanModalOpen(false)}
        />
      )}
    </div>
  );
};
