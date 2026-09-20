import React from 'react';
import { BeachBoysChord, VowelType } from '../types';
import { vocalSynth } from '../audio/vocalSynth';
import { midiToNoteName } from '../audio/harmonyEngine';
import { Volume2, Check, Sparkles, Wand2, Layers, Music } from 'lucide-react';

interface VoicingVariationsDeckProps {
  chord: BeachBoysChord;
  onApplyVariation: (updatedChord: BeachBoysChord) => void;
  onClose?: () => void;
}

interface VoicingOption {
  id: string;
  name: string;
  category: 'Barbershop Vocal' | 'Acoustic Drone' | 'Drop-2 Jazz' | 'Inverted Bass' | 'Folk Hammer-on';
  notes: { falsetto: number; tenor1: number; lead: number; baritone: number; bass: number };
  vowel: VowelType;
  description: string;
  guitarFretsHint?: string;
}

export const VoicingVariationsDeck: React.FC<VoicingVariationsDeckProps> = ({
  chord,
  onApplyVariation,
  onClose,
}) => {
  // Generate 5 distinct artistic voicings based on chord.notes
  const variations: VoicingOption[] = [
    {
      id: 'var_barbershop',
      name: `${chord.name} (Close Barbershop Stack)`,
      category: 'Barbershop Vocal',
      notes: {
        falsetto: chord.notes.falsetto,
        tenor1: chord.notes.tenor1,
        lead: chord.notes.lead,
        baritone: chord.notes.baritone,
        bass: chord.notes.bass,
      },
      vowel: 'aah',
      description: 'Tight 5-voice barbershop vocal stack with soaring top falsetto.',
    },
    {
      id: 'var_open_drone',
      name: `${chord.name} (Acoustic Open Drone)`,
      category: 'Acoustic Drone',
      notes: {
        falsetto: chord.notes.falsetto + 12, // High bell ring
        tenor1: chord.notes.lead,
        lead: chord.notes.baritone,
        baritone: chord.notes.bass + 12,
        bass: Math.max(36, chord.notes.bass - 12), // Deep acoustic low string
      },
      vowel: 'ooh',
      description: 'Wide acoustic folk drone with open unisons and high chiming 1st string.',
    },
    {
      id: 'var_drop2',
      name: `${chord.name} (Drop-2 Jazz Shell)`,
      category: 'Drop-2 Jazz',
      notes: {
        falsetto: chord.notes.falsetto,
        tenor1: chord.notes.lead,
        lead: chord.notes.baritone,
        baritone: chord.notes.tenor1 - 12, // Drop second voice from top down an octave
        bass: chord.notes.bass,
      },
      vowel: 'ooh',
      description: 'Classic jazz Drop-2 spread voicing: silky inner 3rd and 7th guide tones.',
    },
    {
      id: 'var_slash_inverted',
      name: `${chord.name}/${midiToNoteName(chord.notes.tenor1).slice(0, -1)} (Floating Inversion)`,
      category: 'Inverted Bass',
      notes: {
        falsetto: chord.notes.falsetto,
        tenor1: chord.notes.tenor1,
        lead: chord.notes.lead,
        baritone: chord.notes.baritone,
        bass: chord.notes.tenor1 - 12, // Inverted bass note
      },
      vowel: 'aah',
      description: 'Brian Wilson Pet Sounds floating bass inversion: suspends resolution.',
    },
    {
      id: 'var_folk_hammer',
      name: `${chord.name}(sus2) (Dylan Folk Hammer-on)`,
      category: 'Folk Hammer-on',
      notes: {
        falsetto: chord.notes.falsetto,
        tenor1: chord.notes.tenor1 - 2, // 2nd resolving to 3rd
        lead: chord.notes.lead,
        baritone: chord.notes.baritone,
        bass: chord.notes.bass,
      },
      vowel: 'aah',
      description: 'Classic folk acoustic ornamentation: suspended 2nd ready to hammer-on.',
    },
  ];

  const handleAudition = (opt: VoicingOption) => {
    vocalSynth.playBeachBoysChord(opt.notes, opt.vowel, 2.0);
  };

  const handleApply = (opt: VoicingOption) => {
    const updated: BeachBoysChord = {
      ...chord,
      name: opt.name,
      notes: opt.notes,
      vowel: opt.vowel,
      voicingDescription: opt.description,
    };
    onApplyVariation(updated);
  };

  return (
    <div className="bg-[#141210] border border-stone-800 rounded-xl p-4 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
            Harmonic Variations & Revoicing
          </span>
          <h4 className="text-sm font-bold text-stone-200">
            Alternate Voicings for <span className="text-amber-300">{chord.name}</span>
          </h4>
        </div>

        {onClose && (
          <button onClick={onClose} className="text-xs font-mono text-stone-500 hover:text-stone-300">
            Close ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {variations.map((v) => (
          <div
            key={v.id}
            className="bg-[#181614] border border-stone-800 hover:border-amber-500/40 rounded-xl p-3 flex flex-col justify-between space-y-3 transition"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-400">
                  {v.category}
                </span>
                <button
                  onClick={() => handleAudition(v)}
                  className="p-1.5 rounded-md bg-stone-800 hover:bg-stone-700 text-amber-300 transition"
                  title="Audition Voicing"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h5 className="text-xs font-bold text-stone-200 mt-2">{v.name}</h5>
              <p className="text-[11px] text-stone-400 mt-1 leading-normal">{v.description}</p>
            </div>

            <button
              onClick={() => handleApply(v)}
              className="w-full py-1.5 bg-[#12110f] hover:bg-amber-500 hover:text-black text-amber-300 border border-stone-700 hover:border-amber-400 text-xs font-mono font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Voicing</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
