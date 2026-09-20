import React, { useState } from 'react';
import { SongPreset } from '../types';
import { buildMultiTrackBeachBoysMidi, generateReaperReaScript, generateLeadSheetText } from '../audio/reaperExport';
import { Download, FileCode, FileText, Check, Copy, Music, Sparkles } from 'lucide-react';

interface ReaperExportModalProps {
  preset: SongPreset;
  onClose: () => void;
}

export const ReaperExportModal: React.FC<ReaperExportModalProps> = ({ preset, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const downloadMidi = () => {
    const midiBytes = buildMultiTrackBeachBoysMidi(preset.chords, preset.tempo, preset.title);
    const blob = new Blob([midiBytes.buffer as ArrayBuffer], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.id}_BeachBoys_5Voice_Choral.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPythonReaScript = () => {
    const scriptContent = generateReaperReaScript(preset);
    const blob = new Blob([scriptContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BeachBoys_${preset.id}_ReaScript.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyReaScript = () => {
    const scriptContent = generateReaperReaScript(preset);
    navigator.clipboard.writeText(scriptContent);
    setCopiedType('reascript');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const copyLeadSheet = () => {
    const text = generateLeadSheetText(preset);
    navigator.clipboard.writeText(text);
    setCopiedType('leadsheet');
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#181614] border border-stone-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif-vintage text-xl font-bold text-amber-100">
                REAPER & DAW Vocal Harmony Exporter
              </h2>
              <p className="text-xs text-stone-400">
                Export 5-voice MIDI, native REAPER ReaScript injector, or complete choral lead sheet.
              </p>
            </div>
          </div>

          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 text-lg font-mono p-1"
          >
            ✕
          </button>
        </div>

        {/* Current Song Context Card */}
        <div className="bg-[#12110f] border border-stone-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Selected Song</span>
            <h3 className="text-base font-bold text-stone-200">{preset.title}</h3>
            <span className="text-xs text-stone-400 font-mono">
              {preset.album} ({preset.year}) • {preset.tempo} BPM • {preset.chords.length} Chords
            </span>
          </div>

          <span className="text-xs font-mono px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full">
            5 Dedicated Vocal Tracks
          </span>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: 5-Track Standard MIDI */}
          <div className="bg-[#12110f] border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Download className="w-4 h-4" />
                <span>Multi-Track MIDI (.mid)</span>
              </div>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Standard MIDI File (Format 1) with 5 separate tracks:
                <br />
                • Track 1: Brian (Falsetto)
                <br />
                • Track 2: Carl (1st Tenor)
                <br />
                • Track 3: Al/Lead (Melody)
                <br />
                • Track 4: Dennis (Baritone)
                <br />
                • Track 5: Mike Love (Bass)
              </p>
            </div>

            <button
              id="download-midi-btn"
              onClick={downloadMidi}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Download .MID File</span>
            </button>
          </div>

          {/* Option 2: REAPER ReaScript (Python) */}
          <div className="bg-[#12110f] border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FileCode className="w-4 h-4" />
                <span>Native REAPER ReaScript (.py)</span>
              </div>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                Run directly in REAPER via <em>Actions → Load ReaScript</em>. Automatically generates a colored "Beach Boys Vocal Choir" folder, sets track colors (gold, cyan, emerald, purple, rose), and inserts all MIDI takes!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="download-reascript-btn"
                onClick={downloadPythonReaScript}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-mono font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .py</span>
              </button>

              <button
                id="copy-reascript-btn"
                onClick={copyReaScript}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow"
              >
                {copiedType === 'reascript' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lead Sheet Copy Option */}
        <div className="bg-[#12110f] border border-stone-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-sky-400" />
            <div>
              <h4 className="text-xs font-bold text-stone-200">Vocal Lead Sheet & Choral Chart</h4>
              <p className="text-[11px] text-stone-400">
                Complete chord symbols, Roman numerals, lyrics, and exact pitch notation for sheet music.
              </p>
            </div>
          </div>

          <button
            id="copy-leadsheet-btn"
            onClick={copyLeadSheet}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-mono font-medium border border-stone-700 flex items-center gap-1.5"
          >
            {copiedType === 'leadsheet' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Chart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
