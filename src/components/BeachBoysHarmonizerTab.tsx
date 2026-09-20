import React, { useState } from 'react';
import {
  Volume2,
  Sliders,
  Sparkles,
  Music,
  Download,
  Flame,
  Layers,
} from 'lucide-react';
import { VocalVoiceConfig, SongPreset, VocalVoiceState } from '../types';
import { ALL_SONGWRITER_PRESETS } from '../audio/artistDnaPresets';
import { acousticSynth } from '../audio/acousticSynth';
import { downloadMidiFile } from '../audio/midiEncoder';
import { SongArranger } from './SongArranger';
import { ReaperExportModal } from './ReaperExportModal';
import { BrianWilsonAiArranger } from './BrianWilsonAiArranger';

const DEFAULT_VOICES: VocalVoiceConfig[] = [
  { id: 'v1', name: 'Brian Wilson', role: 'falsetto_lead', midiNote: 71, vowel: 'ooh', volume: 85, pan: 0.2, vibratoDepth: 35, vibratoSpeed: 5.5, mute: false, solo: false },
  { id: 'v2', name: 'Carl Wilson', role: 'tenor', midiNote: 66, vowel: 'ooh', volume: 80, pan: -0.3, vibratoDepth: 25, vibratoSpeed: 5.2, mute: false, solo: false },
  { id: 'v3', name: 'Al Jardine', role: 'high_baritone', midiNote: 62, vowel: 'ooh', volume: 82, pan: 0.0, vibratoDepth: 20, vibratoSpeed: 5.0, mute: false, solo: false },
  { id: 'v4', name: 'Dennis Wilson', role: 'baritone', midiNote: 57, vowel: 'ooh', volume: 78, pan: -0.25, vibratoDepth: 18, vibratoSpeed: 4.8, mute: false, solo: false },
  { id: 'v5', name: 'Mike Love', role: 'bass', midiNote: 50, vowel: 'doo', volume: 88, pan: 0.1, vibratoDepth: 15, vibratoSpeed: 4.5, mute: false, solo: false },
];

const DEFAULT_ARRANGER_VOICES: VocalVoiceState[] = [
  { id: 'falsetto', name: 'Brian Wilson', singer: 'Brian Wilson', role: 'Falsetto Lead', range: [60, 84], volume: 0.85, pan: 0.2, mute: false, solo: false, detuneCents: 0, vowel: 'ooh', color: '#f59e0b' },
  { id: 'tenor1', name: 'Carl Wilson', singer: 'Carl Wilson', role: '1st Tenor', range: [55, 76], volume: 0.80, pan: -0.3, mute: false, solo: false, detuneCents: 0, vowel: 'ooh', color: '#38bdf8' },
  { id: 'lead', name: 'Al Jardine', singer: 'Al Jardine', role: 'High Baritone Lead', range: [50, 72], volume: 0.82, pan: 0.0, mute: false, solo: false, detuneCents: 0, vowel: 'aah', color: '#34d399' },
  { id: 'baritone', name: 'Dennis Wilson', singer: 'Dennis Wilson', role: 'Baritone', range: [45, 68], volume: 0.78, pan: -0.25, mute: false, solo: false, detuneCents: 0, vowel: 'ooh', color: '#c084fc' },
  { id: 'bass', name: 'Mike Love', singer: 'Mike Love', role: 'Bass', range: [36, 60], volume: 0.88, pan: 0.1, mute: false, solo: false, detuneCents: 0, vowel: 'doo', color: '#fb7185' },
];

export const BeachBoysHarmonizerTab: React.FC = () => {
  const [voices, setVoices] = useState<VocalVoiceConfig[]>(DEFAULT_VOICES);
  const [activePreset, setActivePreset] = useState<SongPreset>(ALL_SONGWRITER_PRESETS[0]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleUpdateVoice = (id: string, updates: Partial<VocalVoiceConfig>) => {
    setVoices((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  return (
    <div className="space-y-6">
      {/* Song Arranger Component with Full Drag-and-Drop, Dylan Weirdo Engine & Sound Engine */}
      <SongArranger
        currentPreset={activePreset}
        onPresetChange={setActivePreset}
        voices={DEFAULT_ARRANGER_VOICES}
        onOpenReaperExport={() => setIsExportModalOpen(true)}
        onOpenAiArranger={() => setIsAiModalOpen(true)}
      />

      {/* 5-Voice Choral Console & Formant Model */}
      <div className="bg-[#14151b] border border-stone-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-sm font-mono font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>5-Voice Console & Formant Vowel Model</span>
            </h3>
            <p className="text-xs text-stone-400 font-mono mt-0.5">
              Western Recorders Studio 3 • Formant filters (Ooh, Aah, Doo, Bah, Ee) & analog stereo panning
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
            Scully 8-Track
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {voices.map((voice) => (
            <div
              key={voice.id}
              className="bg-[#181a24] border border-stone-800 rounded-lg p-3 space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-200">
                    {voice.name}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-700">
                    {voice.role.replace('_', ' ')}
                  </span>
                </div>

                {/* Vowel Selector */}
                <div className="mt-2">
                  <label className="text-[9px] font-mono text-stone-400 block mb-1">
                    Vowel Formant:
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {(['ooh', 'aah', 'doo', 'bah', 'ee'] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => handleUpdateVoice(voice.id, { vowel: v })}
                        className={`py-1 rounded text-[10px] font-mono font-semibold transition border ${
                          voice.vowel === v
                            ? 'bg-amber-500 text-stone-950 border-amber-400'
                            : 'bg-[#101116] text-stone-400 border-stone-700 hover:text-stone-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-stone-400">Level</span>
                    <span className="text-amber-400">{voice.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={voice.volume}
                    onChange={(e) => handleUpdateVoice(voice.id, { volume: parseInt(e.target.value, 10) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Pan Slider */}
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-stone-400">Pan</span>
                    <span className="text-stone-300">
                      {voice.pan < 0 ? `L ${Math.abs(Math.round(voice.pan * 100))}%` : voice.pan > 0 ? `R ${Math.round(voice.pan * 100)}%` : 'C'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={voice.pan}
                    onChange={(e) => handleUpdateVoice(voice.id, { pan: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Mute / Solo Buttons */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-stone-800">
                <button
                  onClick={() => handleUpdateVoice(voice.id, { mute: !voice.mute })}
                  className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition border ${
                    voice.mute
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-[#101116] text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                >
                  MUTE
                </button>
                <button
                  onClick={() => handleUpdateVoice(voice.id, { solo: !voice.solo })}
                  className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition border ${
                    voice.solo
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-[#101116] text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                >
                  SOLO
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REAPER Export Modal */}
      {isExportModalOpen && (
        <ReaperExportModal
          preset={activePreset}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* Brian Wilson AI Arranger Modal */}
      {isAiModalOpen && (
        <BrianWilsonAiArranger
          onApplyArrangement={(p: SongPreset) => {
            setActivePreset(p);
            setIsAiModalOpen(false);
          }}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}
    </div>
  );
};
