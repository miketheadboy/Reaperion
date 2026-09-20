import React from 'react';
import { BeachBoysChord, SongPreset } from '../types';
import { BOB_DYLAN_WEIRDO_PRESETS, dylanizeProgression } from '../audio/dylanStructureEngine';
import { Sparkles, Play, Clock, ArrowRight, BookOpen, Music, Check } from 'lucide-react';
import { vocalSynth } from '../audio/vocalSynth';

interface DylanWeirdoModalProps {
  currentChords: BeachBoysChord[];
  onApplyChords: (newChords: BeachBoysChord[], title?: string) => void;
  onClose: () => void;
}

export const DylanWeirdoModal: React.FC<DylanWeirdoModalProps> = ({
  currentChords,
  onApplyChords,
  onClose,
}) => {
  const handleDylanizeCurrent = () => {
    const transformed = dylanizeProgression(currentChords);
    onApplyChords(transformed, 'Dylanized Asymmetric Suite');
    onClose();
  };

  const handleSelectPreset = (presetId: string) => {
    const found = BOB_DYLAN_WEIRDO_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onApplyChords(found.chords, found.title);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#181614] border border-stone-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 text-lg font-serif-vintage font-bold">
              BD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-vintage text-xl font-bold text-amber-100">
                  Bob Dylan Structure Weirdo Engine
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Elastic Meter & Lyrical Holds
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Break square 4/4 pop constraints with asymmetric 13-bar verses, 2/4 lyrical breath cuts, and 6/4 screaming harmonica holds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 text-lg font-mono p-1"
          >
            ✕
          </button>
        </div>

        {/* Quick Transformation Action Box */}
        <div className="bg-gradient-to-r from-amber-950/40 via-[#1c1813] to-stone-900 border border-amber-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-md">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>One-Click "Dylanize" Current Progression</span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              Automatically injects an authentic 2/4 lyrical breath bar at the midpoint, a 6/4 held harmonica turnaround at the cadence, and subtle folk rubato phrasing.
            </p>
          </div>

          <button
            id="dylanize-btn"
            onClick={handleDylanizeCurrent}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Dylanize My {currentChords.length} Chords</span>
          </button>
        </div>

        {/* Historic Weirdo Structure Presets */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-stone-400 uppercase font-bold block">
            Iconic Dylan Structural Anomalies
          </span>

          <div className="space-y-3">
            {BOB_DYLAN_WEIRDO_PRESETS.map((p) => (
              <div
                key={p.id}
                className="bg-[#12110f] border border-stone-800 hover:border-amber-500/40 rounded-xl p-4 space-y-3 transition group"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-stone-200 group-hover:text-amber-300 transition">
                      {p.title}
                    </h3>
                    <span className="text-[11px] font-mono text-stone-400">
                      {p.album} ({p.year}) • {p.key} • {p.tempo} BPM • {p.timeSignature}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectPreset(p.id)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-amber-500 hover:text-black text-stone-300 font-mono text-xs rounded-lg transition flex items-center gap-1.5"
                  >
                    <span>Load {p.chords.length} Chords</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">{p.structureExplanation}</p>

                {/* Quirk highlight badge */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-xs font-mono text-amber-300 flex items-start gap-2">
                  <span className="font-bold whitespace-nowrap">⚡ Quirk:</span>
                  <span>{p.weirdQuirk}</span>
                </div>

                {/* Chord strip preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.chords.map((ch, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-1 rounded text-[11px] font-mono border ${
                        ch.durationBeats !== 4
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold'
                          : 'bg-stone-900 text-stone-300 border-stone-800'
                      }`}
                    >
                      <span>{ch.name}</span>
                      <span className="text-[10px] text-stone-500 ml-1">({ch.durationBeats}b)</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
