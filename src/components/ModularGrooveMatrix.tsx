import React from 'react';
import {
  Sliders,
  Sparkles,
  Flame,
  Activity,
  Shuffle,
  Music,
  Zap,
} from 'lucide-react';
import { ArtistDnaId, GrooveMatrixConfig } from '../types';
import { ARTIST_PRESETS } from '../data/songCatalog';

interface ModularGrooveMatrixProps {
  groove: GrooveMatrixConfig;
  onUpdateGroove: (updated: Partial<GrooveMatrixConfig>) => void;
  onSelectArtist: (artistId: ArtistDnaId) => void;
  tempo: number;
  onUpdateTempo: (tempo: number) => void;
}

export const ModularGrooveMatrix: React.FC<ModularGrooveMatrixProps> = ({
  groove,
  onUpdateGroove,
  onSelectArtist,
  tempo,
  onUpdateTempo,
}) => {
  return (
    <div className="space-y-6">
      {/* 1-Click Artist DNA Bar */}
      <div className="bg-[#161822] border border-stone-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-mono font-bold text-stone-300 uppercase tracking-wider">
              Artist DNA Matrix Presets
            </h2>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            Click to morph groove engine, timing lag, and strum direction
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {Object.values(ARTIST_PRESETS).map((preset) => {
            const isSelected = groove.artistDna === preset.id;
            return (
              <button
                key={preset.id}
                id={`dna-preset-${preset.id}`}
                onClick={() => onSelectArtist(preset.id)}
                className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10'
                    : 'bg-[#101116] border-stone-800 hover:border-stone-700 hover:bg-[#1c1e28]'
                }`}
              >
                <div>
                  <div className={`text-xs font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-stone-200'}`}>
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-stone-400 line-clamp-2 mt-0.5">
                    {preset.tagline}
                  </div>
                </div>
                <div className="text-[9px] font-mono text-amber-500/80 mt-2">
                  {preset.tempo} BPM • {preset.recommendedTuning.toUpperCase()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Deep Humanization & Micro-timing Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Unquantized Drunk / Looseness & Backbeat Lag */}
        <div className="bg-[#161822] border border-stone-800 rounded-xl p-4 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h3 className="text-xs font-mono font-bold text-stone-300 uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Micro-Timing & Drunk Swing</span>
            </h3>
            <span className="text-[10px] font-mono text-stone-400">J Dilla / D'Angelo</span>
          </div>

          {/* Looseness / Drunk Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-stone-400">Drunk / Looseness</span>
              <span className="text-amber-400 font-bold">{groove.looseness}%</span>
            </div>
            <input
              id="groove-looseness-slider"
              type="range"
              min="0"
              max="100"
              value={groove.looseness}
              onChange={(e) => onUpdateGroove({ looseness: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-stone-500 mt-0.5">
              <span>0% (Laser Grid)</span>
              <span>100% (Drunk Drag)</span>
            </div>
          </div>

          {/* Backbeat Lag (ms delay on beats 2 & 4) */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-stone-400">Backbeat Lag (Beats 2 & 4)</span>
              <span className="text-amber-400 font-bold">{groove.backbeatLagMs} ms</span>
            </div>
            <input
              id="groove-backbeat-lag-slider"
              type="range"
              min="-15"
              max="45"
              value={groove.backbeatLagMs}
              onChange={(e) => onUpdateGroove({ backbeatLagMs: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-mono text-stone-500 mt-0.5">
              <span>-15ms (Rushed NMH)</span>
              <span>0ms (Standard)</span>
              <span>+45ms (Heavy Voodoo)</span>
            </div>
          </div>

          {/* Velocity Jitter */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-stone-400">Velocity Fluctuation</span>
              <span className="text-amber-400 font-bold">±{groove.velocityJitter}</span>
            </div>
            <input
              id="groove-velocity-jitter-slider"
              type="range"
              min="0"
              max="40"
              value={groove.velocityJitter}
              onChange={(e) => onUpdateGroove({ velocityJitter: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 2. Fingerstyle & Strumming Architecture */}
        <div className="bg-[#161822] border border-stone-800 rounded-xl p-4 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h3 className="text-xs font-mono font-bold text-stone-300 uppercase flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Picking & String Dynamics</span>
            </h3>
            <span className="text-[10px] font-mono text-stone-400">Big Thief / Smith</span>
          </div>

          {/* Double-Stop Probability */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-stone-400">Big Thief Double-Stop Pluck</span>
              <span className="text-amber-400 font-bold">{groove.doubleStopProb}%</span>
            </div>
            <input
              id="groove-doublestop-slider"
              type="range"
              min="0"
              max="100"
              value={groove.doubleStopProb}
              onChange={(e) => onUpdateGroove({ doubleStopProb: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[9px] font-mono text-stone-500 mt-0.5 block">
              Probability of plucking two strings simultaneously on offbeats
            </span>
          </div>

          {/* Strum Flam Speed */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-stone-400">Strum Flam Separation</span>
              <span className="text-amber-400 font-bold">{groove.strumSpeedMs} ms</span>
            </div>
            <input
              id="groove-flam-slider"
              type="range"
              min="5"
              max="50"
              value={groove.strumSpeedMs}
              onChange={(e) => onUpdateGroove({ strumSpeedMs: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Strum Direction */}
          <div>
            <label className="text-xs font-mono text-stone-400 block mb-1.5">
              Picking Engine Pattern
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'travis', label: 'Travis Pick' },
                { id: 'down', label: 'Downstrokes' },
                { id: 'up', label: 'Up Arpeggio' },
                { id: 'alternate', label: 'Alternate' },
                { id: 'random', label: 'Organic Free' },
              ].map((m) => (
                <button
                  key={m.id}
                  id={`strum-pattern-${m.id}`}
                  onClick={() => onUpdateGroove({ strumDirection: m.id as any })}
                  className={`py-1.5 rounded text-[10px] font-mono font-semibold transition border text-center ${
                    groove.strumDirection === m.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-[#101116] text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Polyrhythms, Chaos Tiers & Overdrive */}
        <div className="bg-[#161822] border border-stone-800 rounded-xl p-4 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h3 className="text-xs font-mono font-bold text-stone-300 uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Polyrhythms & Tone Drive</span>
            </h3>
            <span className="text-[10px] font-mono text-stone-400">Radiohead / Microphones</span>
          </div>

          {/* Polyrhythm Divisor */}
          <div>
            <label className="text-xs font-mono text-stone-400 block mb-1.5 flex justify-between">
              <span>Radiohead Polyrhythm Divisor</span>
              <span className="text-amber-400 font-bold">1/{groove.polyrhythmDivisor}</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[3, 4, 5, 7].map((div) => (
                <button
                  key={div}
                  id={`polyrhythm-btn-${div}`}
                  onClick={() => onUpdateGroove({ polyrhythmDivisor: div })}
                  className={`py-1.5 rounded text-xs font-mono font-bold transition border text-center ${
                    groove.polyrhythmDivisor === div
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-[#101116] text-stone-300 border-stone-700 hover:border-stone-500'
                  }`}
                >
                  1/{div}
                </button>
              ))}
            </div>
          </div>

          {/* Acoustic Body Overdrive / Fuzz Drive (The Microphones / NMH) */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-stone-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Microphones Tape Fuzz Drive</span>
              </span>
              <span className="text-amber-400 font-bold">{groove.fuzzDrive}%</span>
            </div>
            <input
              id="groove-fuzz-slider"
              type="range"
              min="0"
              max="100"
              value={groove.fuzzDrive}
              onChange={(e) => onUpdateGroove({ fuzzDrive: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[9px] font-mono text-stone-500 mt-0.5 block">
              Simulates overdriven preamp cassette tape saturation on acoustic soundboard
            </span>
          </div>

          {/* Master Project BPM */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-stone-400">Master Song Tempo</span>
              <span className="text-amber-400 font-bold">{tempo} BPM</span>
            </div>
            <input
              id="master-tempo-slider"
              type="range"
              min="40"
              max="200"
              value={tempo}
              onChange={(e) => onUpdateTempo(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
