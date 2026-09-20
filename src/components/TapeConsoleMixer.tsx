import React from 'react';
import { TapeAcoustics, VocalVoiceState, VoiceId, VowelType } from '../types';
import { Volume2, VolumeX, Mic, Sliders, Radio, Sparkles, Disc } from 'lucide-react';
import { vocalSynth } from '../audio/vocalSynth';
import { midiToNoteName } from '../audio/harmonyEngine';

interface TapeConsoleMixerProps {
  voices: VocalVoiceState[];
  onVoicesChange: (voices: VocalVoiceState[]) => void;
  acoustics: TapeAcoustics;
  onAcousticsChange: (acoustics: TapeAcoustics) => void;
  activeChordsPlaying?: boolean;
}

const VOWEL_OPTIONS: { id: VowelType; label: string; phonetic: string }[] = [
  { id: 'ooh', label: 'Ooh', phonetic: '/uː/ (Pet Sounds classic)' },
  { id: 'aah', label: 'Aah', phonetic: '/ɑː/ (Soaring choral)' },
  { id: 'doo', label: 'Doo', phonetic: '/duː/ (Doo-wop punch)' },
  { id: 'wah', label: 'Wah', phonetic: '/wɑː/ (Vocal swell)' },
  { id: 'ee',  label: 'Eee', phonetic: '/iː/ (Bright bite)' },
  { id: 'mm',  label: 'Mm',  phonetic: '/m/ (Intimate hum)' },
];

export const TapeConsoleMixer: React.FC<TapeConsoleMixerProps> = ({
  voices,
  onVoicesChange,
  acoustics,
  onAcousticsChange,
  activeChordsPlaying = false,
}) => {
  const handleVoiceChange = (id: VoiceId, updates: Partial<VocalVoiceState>) => {
    const updated = voices.map((v) => (v.id === id ? { ...v, ...updates } : v));
    onVoicesChange(updated);
    vocalSynth.updateVoiceConfig(updated, acoustics);
  };

  const handleAcousticChange = (key: keyof TapeAcoustics, val: number) => {
    const updated = { ...acoustics, [key]: val };
    onAcousticsChange(updated);
    vocalSynth.updateVoiceConfig(voices, updated);
  };

  const testVoiceSingleNote = (voice: VocalVoiceState) => {
    // Play a comfortable middle note in the singer's natural range
    const midMidi = Math.round((voice.range[0] + voice.range[1]) / 2);
    vocalSynth.playVoice(voice.id, midMidi, voice.vowel, 1.2);
  };

  return (
    <div id="tape-console-mixer" className="bg-[#181614] border border-stone-800 rounded-xl p-5 shadow-2xl space-y-6">
      {/* Top Banner: Vintage Console Faceplate */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-800/80 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="font-serif-vintage text-xl font-bold text-amber-100 tracking-wide">
              Western Recorders Studio 3 • 5-Voice Tracking Console
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Modeled on the 1966 8-Track Scully tape machine and Western Recorders concrete echo chamber used by Brian Wilson.
          </p>
        </div>

        {/* Master Acoustics Knobs */}
        <div className="flex flex-wrap items-center gap-4 bg-[#100f0d] px-4 py-2.5 rounded-lg border border-stone-800">
          {/* Wow & Flutter */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono-studio text-amber-400 uppercase tracking-wider">Tape Wow/Drift</span>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                id="wow-flutter-slider"
                type="range"
                min="0"
                max="100"
                value={acoustics.wowFlutter}
                onChange={(e) => handleAcousticChange('wowFlutter', Number(e.target.value))}
                className="w-20 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-stone-300 w-7 text-right">{acoustics.wowFlutter}%</span>
            </div>
          </div>

          {/* Chamber Reverb */}
          <div className="flex flex-col items-center border-l border-stone-800 pl-4">
            <span className="text-[10px] font-mono-studio text-amber-400 uppercase tracking-wider">Echo Chamber #2</span>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                id="chamber-reverb-slider"
                type="range"
                min="0"
                max="100"
                value={acoustics.chamberReverb}
                onChange={(e) => handleAcousticChange('chamberReverb', Number(e.target.value))}
                className="w-20 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-stone-300 w-7 text-right">{acoustics.chamberReverb}%</span>
            </div>
          </div>

          {/* Tape Saturation */}
          <div className="flex flex-col items-center border-l border-stone-800 pl-4">
            <span className="text-[10px] font-mono-studio text-amber-400 uppercase tracking-wider">Tape Warmth</span>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                id="tape-warmth-slider"
                type="range"
                min="0"
                max="100"
                value={acoustics.tapeWarmth}
                onChange={(e) => handleAcousticChange('tapeWarmth', Number(e.target.value))}
                className="w-20 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-stone-300 w-7 text-right">{acoustics.tapeWarmth}%</span>
            </div>
          </div>

          {/* Stereo Width (Mono vs Stereo) */}
          <div className="flex flex-col items-center border-l border-stone-800 pl-4">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono-studio text-amber-400 uppercase tracking-wider">Mix Mode</span>
              <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded font-mono">
                {acoustics.stereoWidth < 20 ? '1966 Mono' : 'Stereo Spread'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                id="stereo-width-slider"
                type="range"
                min="0"
                max="100"
                value={acoustics.stereoWidth}
                onChange={(e) => handleAcousticChange('stereoWidth', Number(e.target.value))}
                className="w-20 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-stone-300 w-7 text-right">{acoustics.stereoWidth}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Channel Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {voices.map((voice) => {
          const isAnySolo = voices.some((v) => v.solo);
          const isSilenced = voice.mute || (isAnySolo && !voice.solo);

          return (
            <div
              key={voice.id}
              id={`channel-strip-${voice.id}`}
              className={`bg-[#12110f] border rounded-lg p-3.5 flex flex-col justify-between transition-all duration-200 ${
                isSilenced
                  ? 'border-stone-800/50 opacity-60'
                  : 'border-stone-700/80 shadow-md hover:border-amber-500/50'
              }`}
            >
              {/* Channel Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono-studio uppercase tracking-wider font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${voice.color}25`, color: voice.color }}
                  >
                    {voice.name}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">
                    {midiToNoteName(voice.range[0])}–{midiToNoteName(voice.range[1])}
                  </span>
                </div>

                <div className="mt-1.5">
                  <h3 className="text-sm font-bold text-stone-200">{voice.singer}</h3>
                  <p className="text-[11px] text-stone-400 truncate">{voice.role}</p>
                </div>
              </div>

              {/* Vowel Formant Selector */}
              <div className="mt-3.5 pt-3 border-t border-stone-800/80">
                <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                  Vocal Formant Vowel
                </label>
                <select
                  id={`vowel-select-${voice.id}`}
                  value={voice.vowel}
                  onChange={(e) => handleVoiceChange(voice.id, { vowel: e.target.value as VowelType })}
                  className="w-full bg-[#1c1a17] text-stone-200 text-xs rounded border border-stone-700 px-2 py-1.5 focus:outline-none focus:border-amber-500 font-mono"
                >
                  {VOWEL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} • {opt.phonetic}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fader & Controls */}
              <div className="mt-4 space-y-3">
                {/* Volume Fader */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-1">
                    <span>Level</span>
                    <span>{Math.round(voice.volume * 100)}%</span>
                  </div>
                  <input
                    id={`voice-vol-${voice.id}`}
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={voice.volume}
                    onChange={(e) => handleVoiceChange(voice.id, { volume: Number(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Pan Fader */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-1">
                    <span>Pan</span>
                    <span>
                      {voice.pan === 0
                        ? 'C'
                        : voice.pan < 0
                        ? `L${Math.round(Math.abs(voice.pan) * 100)}`
                        : `R${Math.round(voice.pan * 100)}`}
                    </span>
                  </div>
                  <input
                    id={`voice-pan-${voice.id}`}
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={voice.pan}
                    onChange={(e) => handleVoiceChange(voice.id, { pan: Number(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Micro Detune (Analog Vocal Thickness) */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-1">
                    <span>Vocal Detune</span>
                    <span>{voice.detuneCents > 0 ? `+${voice.detuneCents}` : voice.detuneCents}¢</span>
                  </div>
                  <input
                    id={`voice-detune-${voice.id}`}
                    type="range"
                    min="-25"
                    max="25"
                    step="1"
                    value={voice.detuneCents}
                    onChange={(e) => handleVoiceChange(voice.id, { detuneCents: Number(e.target.value) })}
                    className="w-full cursor-pointer"
                  />
                </div>

                {/* Mute & Solo & Audition Buttons */}
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  <button
                    id={`mute-btn-${voice.id}`}
                    onClick={() => handleVoiceChange(voice.id, { mute: !voice.mute })}
                    className={`text-[10px] font-mono uppercase font-bold py-1.5 rounded transition ${
                      voice.mute
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    Mute
                  </button>

                  <button
                    id={`solo-btn-${voice.id}`}
                    onClick={() => handleVoiceChange(voice.id, { solo: !voice.solo })}
                    className={`text-[10px] font-mono uppercase font-bold py-1.5 rounded transition ${
                      voice.solo
                        ? 'bg-amber-500 text-black shadow font-extrabold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    Solo
                  </button>

                  <button
                    id={`test-sing-${voice.id}`}
                    onClick={() => testVoiceSingleNote(voice)}
                    className="text-[10px] font-mono uppercase font-bold py-1.5 bg-stone-800 hover:bg-amber-600/30 text-amber-300 rounded border border-amber-500/20 transition flex items-center justify-center gap-1"
                    title="Sing a test vowel tone"
                  >
                    Audition
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
