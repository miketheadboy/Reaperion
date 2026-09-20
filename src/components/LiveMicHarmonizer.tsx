import React, { useState, useEffect, useRef } from 'react';
import { HarmonyStyle, VowelType } from '../types';
import { micPitchTracker, PitchDetectionResult } from '../audio/pitchDetector';
import { harmonizeMelodyNote, midiToNoteName } from '../audio/harmonyEngine';
import { vocalSynth } from '../audio/vocalSynth';
import { Mic, MicOff, Volume2, Sparkles, Activity, Radio } from 'lucide-react';

interface LiveMicHarmonizerProps {
  harmonyStyle: HarmonyStyle;
  onStyleChange: (style: HarmonyStyle) => void;
  vowel: VowelType;
  onVowelChange: (vowel: VowelType) => void;
}

export const LiveMicHarmonizer: React.FC<LiveMicHarmonizerProps> = ({
  harmonyStyle,
  onStyleChange,
  vowel,
  onVowelChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [pitchData, setPitchData] = useState<PitchDetectionResult | null>(null);
  const [harmonizedParts, setHarmonizedParts] = useState<{
    falsetto: number;
    tenor1: number;
    lead: number;
    baritone: number;
    bass: number;
  } | null>(null);
  const [autoSingBacking, setAutoSingBacking] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const lastMidiRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<any>(null);

  const toggleMic = async () => {
    if (isRecording) {
      micPitchTracker.stop();
      vocalSynth.stopAll();
      setIsRecording(false);
      setPitchData(null);
      setHarmonizedParts(null);
      lastMidiRef.current = null;
    } else {
      setErrorMsg(null);
      const success = await micPitchTracker.start((result) => {
        setPitchData(result);

        if (result) {
          clearTimeout(silenceTimeoutRef.current);

          // Only trigger re-harmonization if pitch changed by at least 1 semitone
          if (lastMidiRef.current !== result.midi) {
            lastMidiRef.current = result.midi;
            const stack = harmonizeMelodyNote(result.midi, harmonyStyle);
            setHarmonizedParts(stack);

            if (autoSingBacking) {
              // Play Brian (falsetto), Carl (tenor), Dennis (baritone), Mike (bass)
              // Let the user sing the lead!
              vocalSynth.playVoice('falsetto', stack.falsetto, vowel);
              vocalSynth.playVoice('tenor1', stack.tenor1, vowel);
              vocalSynth.playVoice('baritone', stack.baritone, vowel);
              vocalSynth.playVoice('bass', stack.bass, vowel);
            }
          }
        } else {
          // Voice paused / silent: stop backing choir after 250ms
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = setTimeout(() => {
            vocalSynth.stopAll();
            lastMidiRef.current = null;
            setHarmonizedParts(null);
          }, 250);
        }
      });

      if (success) {
        setIsRecording(true);
      } else {
        setErrorMsg('Could not access microphone. Please check your browser audio permissions.');
      }
    }
  };

  useEffect(() => {
    return () => {
      micPitchTracker.stop();
      vocalSynth.stopAll();
    };
  }, []);

  return (
    <div id="live-mic-harmonizer-panel" className="bg-[#181614] border border-stone-800 rounded-xl p-5 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h2 className="font-serif-vintage text-xl font-bold text-amber-100">
              Live Microphone Vocal Harmonizer
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Sing directly into your microphone. The engine analyzes your fundamental pitch in real-time and stacks Brian, Carl, Dennis, and Mike around your lead voice.
          </p>
        </div>

        {/* Live Mic Activation Button */}
        <button
          id="toggle-mic-harmonizer-btn"
          onClick={toggleMic}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-mono font-bold text-sm transition shadow-lg ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
              : 'bg-amber-500 hover:bg-amber-400 text-black'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop Harmonizer</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Sing Into Microphone</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-lg text-rose-300 text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Pitch Detection Visualizer Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Vintage VU / Pitch Needle */}
        <div className="lg:col-span-1 bg-[#100f0d] border border-stone-800 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-[11px] font-mono-studio uppercase text-stone-400 tracking-wider">
            Detected Lead Voice Pitch
          </span>

          <div className="w-32 h-32 rounded-full border-4 border-stone-800 bg-[#161412] flex flex-col items-center justify-center relative shadow-inner">
            {isRecording ? (
              pitchData ? (
                <>
                  <span className="text-3xl font-serif-vintage font-bold text-amber-400">
                    {pitchData.noteName}
                  </span>
                  <span className="text-xs font-mono text-stone-400 mt-0.5">
                    {pitchData.frequency} Hz
                  </span>
                  <div className="w-16 h-1 bg-stone-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${Math.round(pitchData.confidence * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-stone-600">
                  <Activity className="w-6 h-6 animate-pulse" />
                  <span className="text-[10px] font-mono mt-1">Listening...</span>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center text-stone-600">
                <Mic className="w-7 h-7" />
                <span className="text-[10px] font-mono mt-1">Mic Inactive</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              id="auto-sing-toggle"
              type="checkbox"
              checked={autoSingBacking}
              onChange={(e) => setAutoSingBacking(e.target.checked)}
              className="rounded accent-amber-500 cursor-pointer"
            />
            <label htmlFor="auto-sing-toggle" className="text-xs text-stone-300 select-none cursor-pointer">
              Auto-Sing Backing Choirs
            </label>
          </div>
        </div>

        {/* Right: 5-Part Vocal Section Allocation */}
        <div className="lg:col-span-2 bg-[#100f0d] border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
            <span className="text-xs font-mono-studio uppercase text-stone-300 font-semibold">
              Live Choral Stacking Matrix
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Choir Vowel:</span>
              <select
                id="mic-vowel-select"
                value={vowel}
                onChange={(e) => onVowelChange(e.target.value as VowelType)}
                className="bg-[#181614] text-xs font-mono text-amber-300 border border-stone-700 rounded px-2 py-1"
              >
                <option value="ooh">Ooh (Pet Sounds)</option>
                <option value="aah">Aah (Soaring)</option>
                <option value="doo">Doo (Doo-Wop)</option>
                <option value="wah">Wah (Swells)</option>
              </select>
            </div>
          </div>

          {/* 5 Voices Live Status Bars */}
          <div className="space-y-2.5">
            {/* Brian Falsetto */}
            <div className="flex items-center justify-between bg-[#171513] p-2.5 rounded-lg border border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-200">Brian Wilson (Falsetto)</span>
                <span className="text-[10px] text-stone-400">Floating top layer</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {harmonizedParts ? midiToNoteName(harmonizedParts.falsetto) : '—'}
              </span>
            </div>

            {/* Carl Tenor */}
            <div className="flex items-center justify-between bg-[#171513] p-2.5 rounded-lg border border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-xs font-bold text-sky-200">Carl Wilson (1st Tenor)</span>
                <span className="text-[10px] text-stone-400">Silky 7th / 9th harmony</span>
              </div>
              <span className="text-xs font-mono font-bold text-sky-400">
                {harmonizedParts ? midiToNoteName(harmonizedParts.tenor1) : '—'}
              </span>
            </div>

            {/* User Singing (Lead) */}
            <div className="flex items-center justify-between bg-[#171513] p-2.5 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-300">You (Live Microphone Lead)</span>
                <span className="text-[10px] text-emerald-400/80">Central melody anchor</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {pitchData ? pitchData.noteName : 'Waiting for voice...'}
              </span>
            </div>

            {/* Dennis Baritone */}
            <div className="flex items-center justify-between bg-[#171513] p-2.5 rounded-lg border border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span className="text-xs font-bold text-purple-200">Dennis / Bruce (Baritone)</span>
                <span className="text-[10px] text-stone-400">Warm inner glue</span>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400">
                {harmonizedParts ? midiToNoteName(harmonizedParts.baritone) : '—'}
              </span>
            </div>

            {/* Mike Bass */}
            <div className="flex items-center justify-between bg-[#171513] p-2.5 rounded-lg border border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="text-xs font-bold text-rose-200">Mike Love (Bass Vocal)</span>
                <span className="text-[10px] text-stone-400">Deep resonant root</span>
              </div>
              <span className="text-xs font-mono font-bold text-rose-400">
                {harmonizedParts ? midiToNoteName(harmonizedParts.bass) : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
