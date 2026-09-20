import React, { useState } from 'react';
import { BeachBoysChord, HarmonyStyle, SongPreset, VowelType } from '../types';
import { Sparkles, Loader2, Music, Check, Disc, Play } from 'lucide-react';
import { vocalSynth } from '../audio/vocalSynth';

interface BrianWilsonAiArrangerProps {
  onApplyArrangement: (preset: SongPreset) => void;
  onClose: () => void;
}

const INSPIRATION_PROMPTS = [
  'Bittersweet summer ballad with floating falsetto, A/E inversions, and Pet Sounds echo chamber',
  'Upbeat 1963 surf doo-wop slow dance in D major with Mike Love "Ba-ba-ba" bassline',
  'Complex Four Freshmen jazz harmony with tight major 2nd rubs and stacked 9ths in F major',
  'Heroes and Villains Smile suite choral operetta with dramatic barbershop pauses and modal surprise',
  'Warmth of the Sun style melancholic ballad with diminished passing chords and weeping falsetto',
];

export const BrianWilsonAiArranger: React.FC<BrianWilsonAiArrangerProps> = ({
  onApplyArrangement,
  onClose,
}) => {
  const [prompt, setPrompt] = useState(
    'Bittersweet summer ballad with floating falsetto, A/E inversions, and Pet Sounds echo chamber'
  );
  const [key, setKey] = useState('E Major');
  const [tempo, setTempo] = useState(78);
  const [style, setStyle] = useState<HarmonyStyle>('pet_sounds');
  const [chordCount, setChordCount] = useState(6);
  const [vowel, setVowel] = useState<VowelType>('aah');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<SongPreset | null>(null);
  const [brianNotes, setBrianNotes] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/arrange-vocal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          key,
          tempo,
          style,
          chordCount,
          preferredVowel: vowel,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        const preset: SongPreset = {
          id: `ai_${Date.now()}`,
          title: data.title || 'Pacific Coast Vocal Suite',
          album: data.albumStyle || 'Pet Sounds (1966)',
          year: 1966,
          key: data.key || key,
          tempo: Number(data.tempo) || tempo,
          harmonyStyle: (data.harmonyStyle as HarmonyStyle) || style,
          description: data.brianProductionNotes || 'Arranged in Brian Wilson 5-part close harmony.',
          funFact: 'Composed with Brian Wilson AI Studio harmonic engine.',
          chords: data.chords || [],
        };

        setGeneratedResult(preset);
        setBrianNotes(data.brianProductionNotes || null);
      }
    } catch (err) {
      console.error('Failed to arrange vocal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const auditionGenerated = () => {
    if (!generatedResult || generatedResult.chords.length === 0) return;
    // Play first chord
    const first = generatedResult.chords[0];
    vocalSynth.playBeachBoysChord(first.notes, first.vowel, 2.5);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#181614] border border-stone-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-vintage text-xl font-bold text-amber-100">
                Brian Wilson AI Vocal Arranger
              </h2>
              <p className="text-xs text-stone-400">
                Compose custom 5-part vocal scores with inverted bass, close barbershop voicings, and Western Recorders chamber acoustics.
              </p>
            </div>
          </div>

          <button
            id="close-ai-arranger-modal-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 text-lg font-mono p-1"
          >
            ✕
          </button>
        </div>

        {/* Input Parameters */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase text-stone-300 block mb-1.5 font-semibold">
              Arrangement Vision / Lyric Mood / Sonic Prompt
            </label>
            <textarea
              id="ai-prompt-input"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Heartbreaking bittersweet sunset waltz with inverted chords..."
              className="w-full bg-[#100f0d] text-stone-200 text-sm rounded-lg border border-stone-700 p-3 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* Prompt quick inspiration chips */}
          <div className="flex flex-wrap gap-1.5">
            {INSPIRATION_PROMPTS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#12110f] hover:bg-stone-800 text-stone-300 border border-stone-800 transition text-left"
              >
                + {p.slice(0, 42)}...
              </button>
            ))}
          </div>

          {/* Grid Settings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Key / Tonal Center</label>
              <select
                id="ai-key-select"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-[#100f0d] text-amber-300 font-mono text-xs rounded border border-stone-700 p-2"
              >
                <option value="E Major">E Major (God Only Knows)</option>
                <option value="D Major">D Major (Surfer Girl)</option>
                <option value="F Major">F Major (Wouldn't It Be Nice)</option>
                <option value="C Major">C Major (In My Room)</option>
                <option value="Bb Major">Bb Major (Heroes & Villains)</option>
                <option value="Eb Minor">Eb Minor (Good Vibrations)</option>
                <option value="A Major">A Major</option>
                <option value="G Major">G Major</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Harmony Style</label>
              <select
                id="ai-style-select"
                value={style}
                onChange={(e) => setStyle(e.target.value as HarmonyStyle)}
                className="w-full bg-[#100f0d] text-stone-200 font-mono text-xs rounded border border-stone-700 p-2"
              >
                <option value="pet_sounds">Pet Sounds Inversions</option>
                <option value="four_freshmen">Four Freshmen Close</option>
                <option value="surfer_girl">Surfer Girl Doo-Wop</option>
                <option value="good_vibrations">Good Vibrations Pocket</option>
                <option value="smile_poly">Smile Polyphonic</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Tempo: {tempo} BPM</label>
              <input
                id="ai-tempo-slider"
                type="range"
                min="55"
                max="140"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-full mt-2 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-stone-400 block mb-1">Chords Count</label>
              <select
                id="ai-chords-count-select"
                value={chordCount}
                onChange={(e) => setChordCount(Number(e.target.value))}
                className="w-full bg-[#100f0d] text-stone-200 font-mono text-xs rounded border border-stone-700 p-2"
              >
                <option value="4">4 Chords</option>
                <option value="6">6 Chords</option>
                <option value="8">8 Chords (Full Suite)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          id="trigger-ai-arrange-btn"
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Brian Wilson is Arranging the Vocal Tracks in Studio 3...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Arrange 5-Part Choral Suite</span>
            </>
          )}
        </button>

        {/* Generated Preview */}
        {generatedResult && (
          <div className="bg-[#100f0d] border border-amber-500/40 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                  Arrangement Completed
                </span>
                <h3 className="font-serif-vintage text-lg font-bold text-amber-100">
                  {generatedResult.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="audition-ai-btn"
                  onClick={auditionGenerated}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded text-xs font-mono flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Audition #1 Chord</span>
                </button>

                <button
                  id="apply-ai-arrangement-btn"
                  onClick={() => {
                    onApplyArrangement(generatedResult);
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-xs font-mono font-bold flex items-center gap-1 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Load Into Studio Arranger</span>
                </button>
              </div>
            </div>

            {brianNotes && (
              <p className="text-xs text-stone-300 italic bg-[#171513] p-3 rounded border border-stone-800">
                "{brianNotes}"
              </p>
            )}

            {/* Chords preview pills */}
            <div className="flex flex-wrap gap-2">
              {generatedResult.chords.map((c: BeachBoysChord, i: number) => (
                <div key={i} className="bg-[#181614] border border-stone-800 px-3 py-1.5 rounded-lg text-center">
                  <span className="text-xs font-bold text-amber-300 font-mono block">{c.name}</span>
                  <span className="text-[9px] text-stone-400 font-mono">{c.numeral} • {c.durationBeats}b</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
