import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Terminal,
  FileCode,
  Sparkles,
  Layers,
} from 'lucide-react';
import { SongwritingSession } from '../types';
import { PYTHON_REASCRIPT_CODE } from '../data/reaperScript';

interface ReaScriptBridgeModalProps {
  session: SongwritingSession;
  onClose: () => void;
}

export const ReaScriptBridgeModal: React.FC<ReaScriptBridgeModalProps> = ({
  session,
  onClose,
}) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'json' | 'guide'>('guide');

  const sessionJson = JSON.stringify(session, null, 2);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(PYTHON_REASCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(sessionJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadPythonScript = () => {
    const blob = new Blob([PYTHON_REASCRIPT_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NeuralChordInjector.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSessionJson = () => {
    const blob = new Blob([sessionJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.name.replace(/\s+/g, '_')}_Session.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14151b] border border-stone-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-[#181a24]">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-mono font-bold text-amber-100">
                REAPER ReaScript Bridge V5 (Bidirectional Sync)
              </h2>
              <p className="text-[11px] text-stone-400 font-mono">
                NeuralChordInjector.py • Real-Time Tkinter GUI for REAPER
              </p>
            </div>
          </div>
          <button
            id="close-bridge-modal-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-[#121318] px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-t-lg transition border-t border-x ${
              activeTab === 'guide'
                ? 'bg-[#14151b] text-amber-300 border-stone-800'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            3-Step Quick Guide
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-t-lg transition border-t border-x ${
              activeTab === 'script'
                ? 'bg-[#14151b] text-amber-300 border-stone-800'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            Python Script (NeuralChordInjector.py)
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-t-lg transition border-t border-x ${
              activeTab === 'json'
                ? 'bg-[#14151b] text-amber-300 border-stone-800'
                : 'text-stone-400 border-transparent hover:text-stone-200'
            }`}
          >
            Active Session JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs font-mono text-stone-300">
              <div className="bg-[#181b24] p-4 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] border border-amber-500/30">
                    1
                  </span>
                  <span>Save the Python Script into REAPER:</span>
                </div>
                <p className="text-stone-400 pl-7 leading-relaxed">
                  Download <code className="text-amber-200">NeuralChordInjector.py</code> and save it in REAPER's Scripts folder (e.g. <code className="text-stone-300">AppData/Roaming/REAPER/Scripts</code> or <code className="text-stone-300">~/Library/Application Support/REAPER/Scripts</code>).
                </p>
                <div className="pl-7">
                  <button
                    onClick={handleDownloadPythonScript}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded flex items-center gap-1.5 transition shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download NeuralChordInjector.py</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#181b24] p-4 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] border border-amber-500/30">
                    2
                  </span>
                  <span>Load Script in REAPER Action List:</span>
                </div>
                <p className="text-stone-400 pl-7 leading-relaxed">
                  Press <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-200">?</kbd> in REAPER to open Actions &gt; Click <strong>New Action</strong> &gt; <strong>Load ReaScript</strong> &gt; select <code className="text-amber-200">NeuralChordInjector.py</code>.
                </p>
              </div>

              <div className="bg-[#181b24] p-4 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] border border-amber-500/30">
                    3
                  </span>
                  <span>Execute 1-Click Operations:</span>
                </div>
                <div className="pl-7 space-y-2 text-stone-400">
                  <p>• <strong>1. INJECT MIDI:</strong> Plots fingerstyle, micro-timing, and artist DNA chords straight onto selected track or MIDI item.</p>
                  <p>• <strong>2. EXPORT DEMO:</strong> Extracts audio/MIDI take directly from REAPER to inspect in this web analyzer.</p>
                  <p>• <strong>3. INJECT TEMPO MAP:</strong> Snaps REAPER timeline grid to match free-time acoustic performance downbeats.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-400">
                  Full Python 3 ReaScript with Tkinter GUI
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyScript}
                    className="px-2.5 py-1 bg-[#1e212c] hover:bg-stone-700 text-stone-200 rounded text-xs font-mono flex items-center gap-1 transition"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleDownloadPythonScript}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded text-xs font-mono font-bold flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .py</span>
                  </button>
                </div>
              </div>

              <pre className="bg-[#0c0d12] border border-stone-800 rounded-lg p-4 text-[11px] font-mono text-stone-300 overflow-x-auto max-h-[420px] scrollbar-thin">
                {PYTHON_REASCRIPT_CODE}
              </pre>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-stone-400">
                  Current Session Chord, Groove & Note Data
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-2.5 py-1 bg-[#1e212c] hover:bg-stone-700 text-stone-200 rounded text-xs font-mono flex items-center gap-1 transition"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSessionJson}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded text-xs font-mono font-bold flex items-center gap-1 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .json</span>
                  </button>
                </div>
              </div>

              <pre className="bg-[#0c0d12] border border-stone-800 rounded-lg p-4 text-[11px] font-mono text-amber-200/90 overflow-x-auto max-h-[420px] scrollbar-thin">
                {sessionJson}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
