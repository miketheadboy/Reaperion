import React, { useState, useRef } from 'react';
import {
  EditableTempoNode,
  DEFAULT_TEMPO_NODES,
  generateTempoCurve,
  generateReaperTempoMapReaScript,
} from '../audio/tempoMapEngine';
import { Sliders, Plus, Trash2, Download, Copy, Check, Activity, Clock, Flame, Sparkles } from 'lucide-react';

interface TempoMappingTabProps {
  currentBpm?: number;
  onApplyBpmToSession?: (bpm: number) => void;
}

export const TempoMappingTab: React.FC<TempoMappingTabProps> = ({
  currentBpm = 78,
  onApplyBpmToSession,
}) => {
  const [tempoNodes, setTempoNodes] = useState<EditableTempoNode[]>(DEFAULT_TEMPO_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(DEFAULT_TEMPO_NODES[0].id);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Tap Tempo state
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [calculatedTapBpm, setCalculatedTapBpm] = useState<number | null>(null);
  const [isTapping, setIsTapping] = useState(false);

  const selectedNode = tempoNodes.find((n) => n.id === selectedNodeId) || tempoNodes[0];

  const handleTap = () => {
    const now = performance.now();
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 150);

    setTapTimes((prev) => {
      // Reset if last tap was more than 2.5 seconds ago
      const recent = prev.filter((t) => now - t < 2500);
      const updated = [...recent, now];

      if (updated.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < updated.length; i++) {
          intervals.push(updated[i] - updated[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const bpm = Math.round(60000 / avgInterval);
        setCalculatedTapBpm(bpm);
        if (onApplyBpmToSession) {
          onApplyBpmToSession(bpm);
        }
      }
      return updated;
    });
  };

  const handleApplyCurve = (
    archetype: 'dylan_rubato' | 'godspeed_crescendo' | 'dangelo_swing' | 'natural_ritard' | 'constant'
  ) => {
    const newNodes = generateTempoCurve(archetype, calculatedTapBpm || currentBpm, 16);
    setTempoNodes(newNodes);
    if (newNodes.length > 0) {
      setSelectedNodeId(newNodes[0].id);
    }
  };

  const handleUpdateNode = (field: keyof EditableTempoNode, value: any) => {
    setTempoNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, [field]: value } : n))
    );
  };

  const handleAddNode = () => {
    const last = tempoNodes[tempoNodes.length - 1];
    const newNode: EditableTempoNode = {
      id: 'node_' + Date.now(),
      barNumber: (last?.barNumber || 1) + 4,
      beatPosition: (last?.beatPosition || 0) + 16,
      bpm: last?.bpm || 78,
      numerator: 4,
      denominator: 4,
      label: `Section Marker ${tempoNodes.length + 1}`,
      curveType: 'instant',
    };
    setTempoNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (id: string) => {
    if (tempoNodes.length <= 1) return;
    setTempoNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNodeId === id) {
      setSelectedNodeId(tempoNodes[0].id);
    }
  };

  const handleDownloadReaScript = () => {
    const script = generateReaperTempoMapReaScript(tempoNodes);
    const blob = new Blob([script], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'REAPER_TempoMap_Injector.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyReaScript = () => {
    const script = generateReaperTempoMapReaScript(tempoNodes);
    navigator.clipboard.writeText(script);
    setCopiedType('reascript');
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div id="tempo-mapping-studio" className="space-y-6">
      {/* Top Banner: Overview & Tap Tempo Bar */}
      <div className="bg-[#181614] border border-stone-800 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                REAPER Tempo & Meter Engine
              </span>
              <h2 className="font-serif-vintage text-2xl font-bold text-amber-100">
                Visual Tempo & Time Signature Mapper
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Plot precise BPM curves, Bob Dylan irregular 2/4 lyrical pivot bars, Godspeed post-rock accelerandos, and export native REAPER ReaScript markers directly to the project timeline.
            </p>
          </div>

          {/* Interactive Tap Tempo Unit */}
          <div className="flex items-center gap-3 bg-[#12110f] border border-stone-700/80 rounded-xl p-2 px-3 shadow">
            <div className="text-center font-mono">
              <span className="text-[10px] text-stone-500 uppercase block">Tap Tempo</span>
              <span className="text-xl font-black text-amber-300">
                {calculatedTapBpm ? `${calculatedTapBpm} BPM` : `${currentBpm} BPM`}
              </span>
            </div>

            <button
              id="tap-tempo-btn"
              onClick={handleTap}
              className={`px-4 py-2.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 shadow ${
                isTapping
                  ? 'bg-amber-400 text-black scale-95'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>TAP</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tempo Curve Archetypes */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-stone-400 uppercase font-semibold">
              Generate Dynamic Curve:
            </span>
            <button
              onClick={() => handleApplyCurve('dylan_rubato')}
              className="px-3 py-1.5 bg-[#12110f] hover:bg-stone-800 border border-amber-500/30 text-amber-300 text-xs font-mono rounded-lg transition"
            >
              ⚡ Dylan Rubato (2/4 & 6/4 Holds)
            </button>
            <button
              onClick={() => handleApplyCurve('godspeed_crescendo')}
              className="px-3 py-1.5 bg-[#12110f] hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-mono rounded-lg transition"
            >
              🔥 Godspeed 12/8 Crescendo
            </button>
            <button
              onClick={() => handleApplyCurve('natural_ritard')}
              className="px-3 py-1.5 bg-[#12110f] hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-mono rounded-lg transition"
            >
              🍃 Natural Cadence Ritardando
            </button>
            <button
              onClick={() => handleApplyCurve('constant')}
              className="px-3 py-1.5 bg-[#12110f] hover:bg-stone-800 border border-stone-700 text-stone-400 text-xs font-mono rounded-lg transition"
            >
              Grid Locked Constant
            </button>
          </div>

          <button
            onClick={handleAddNode}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Marker</span>
          </button>
        </div>
      </div>

      {/* Visual Interactive Timeline Map */}
      <div className="bg-[#181614] border border-stone-800 rounded-xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm font-bold text-stone-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Timeline Metric Nodes ({tempoNodes.length} Markers)</span>
          </h3>
          <span className="text-xs font-mono text-stone-400">
            Total Length: Bar {tempoNodes[tempoNodes.length - 1]?.barNumber + 4}
          </span>
        </div>

        {/* Visual Graph Nodes */}
        <div className="relative border-b-2 border-stone-700 pb-12 pt-8 overflow-x-auto">
          <div className="min-w-[700px] flex items-end justify-between gap-3 relative">
            {/* Horizontal Grid Baseline */}
            <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-stone-700" />

            {tempoNodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;
              const heightPercent = Math.min(100, Math.max(25, ((node.bpm - 40) / 100) * 100));
              const isWeirdo = node.numerator !== 4;

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="flex-1 flex flex-col items-center cursor-pointer group relative"
                >
                  {/* Node Badge on Top */}
                  <div
                    className={`mb-2 px-2.5 py-1 rounded-md text-[11px] font-mono transition text-center shadow-lg whitespace-nowrap border ${
                      isSelected
                        ? 'bg-amber-500 text-black border-amber-300 font-black scale-110'
                        : isWeirdo
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-stone-800 text-stone-300 border-stone-700 group-hover:border-amber-400'
                    }`}
                  >
                    <div className="font-bold">{node.bpm} BPM</div>
                    <div className="text-[10px] font-bold">
                      {node.numerator}/{node.denominator}
                    </div>
                  </div>

                  {/* Vertical Stalk to Timeline Baseline */}
                  <div
                    className={`w-[3px] transition ${
                      isSelected
                        ? 'bg-amber-400'
                        : isWeirdo
                        ? 'bg-rose-400/80'
                        : 'bg-stone-700 group-hover:bg-amber-500/60'
                    }`}
                    style={{ height: `${heightPercent}px` }}
                  />

                  {/* Timeline Point Handle */}
                  <div
                    className={`w-4 h-4 rounded-full -mb-2 z-10 transition border-2 ${
                      isSelected
                        ? 'bg-amber-400 border-stone-950 scale-125 ring-2 ring-amber-400/50'
                        : isWeirdo
                        ? 'bg-rose-500 border-stone-950'
                        : 'bg-stone-600 border-stone-900 group-hover:bg-amber-400'
                    }`}
                  />

                  {/* Bar and Label Below Timeline */}
                  <div className="absolute top-full mt-3 text-center w-full">
                    <span className="text-[10px] font-mono text-stone-500 block">
                      Bar {node.barNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono truncate max-w-[90px] block ${
                        isSelected ? 'text-amber-300 font-bold' : 'text-stone-400'
                      }`}
                    >
                      {node.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Marker Inspector Editor */}
        {selectedNode && (
          <div className="bg-[#12110f] border border-stone-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div>
              <label className="text-[11px] font-mono text-stone-400 uppercase block mb-1">
                Marker Label
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => handleUpdateNode('label', e.target.value)}
                className="w-full bg-[#181614] border border-stone-700 text-stone-200 px-3 py-1.5 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-stone-400 uppercase block mb-1">
                BPM ({selectedNode.bpm})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={selectedNode.bpm}
                  onChange={(e) => handleUpdateNode('bpm', parseInt(e.target.value, 10))}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <input
                  type="number"
                  min="40"
                  max="240"
                  value={selectedNode.bpm}
                  onChange={(e) => handleUpdateNode('bpm', parseInt(e.target.value, 10) || 78)}
                  className="w-16 bg-[#181614] border border-stone-700 text-amber-300 px-2 py-1 rounded text-xs font-mono text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-stone-400 uppercase block mb-1">
                Meter (Time Signature)
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={`${selectedNode.numerator}/${selectedNode.denominator}`}
                  onChange={(e) => {
                    const [num, denom] = e.target.value.split('/').map((n) => parseInt(n, 10));
                    handleUpdateNode('numerator', num);
                    handleUpdateNode('denominator', denom);
                  }}
                  className="w-full bg-[#181614] border border-stone-700 text-amber-300 px-2 py-1.5 rounded-lg text-xs font-mono focus:border-amber-500 focus:outline-none"
                >
                  <option value="4/4">4/4 Common Time</option>
                  <option value="2/4">2/4 Dylan Lyrical Cut</option>
                  <option value="3/4">3/4 Waltz Step</option>
                  <option value="6/4">6/4 Harmonica Hold</option>
                  <option value="5/4">5/4 Asymmetric Metre</option>
                  <option value="6/8">6/8 Doo-Wop Swing</option>
                  <option value="7/8">7/8 Progressive Cut</option>
                  <option value="12/8">12/8 Post-Rock Drone</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => handleDeleteNode(selectedNode.id)}
                disabled={tempoNodes.length <= 1}
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-lg text-xs font-mono flex items-center gap-1.5 disabled:opacity-40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}

        {/* REAPER Integration Actions */}
        <div className="bg-[#12110f] border border-stone-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold block">
              Direct REAPER Timeline Integration
            </span>
            <p className="text-xs text-stone-400 mt-0.5">
              Exports Python script calling <code>RPR_SetTempoTimeSigMarker</code> to automatically write all {tempoNodes.length} markers and time signatures to the REAPER project ruler.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-tempo-reascript-btn"
              onClick={handleCopyReaScript}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-mono text-xs rounded-lg flex items-center gap-1.5 transition"
            >
              {copiedType === 'reascript' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'reascript' ? 'Copied Python!' : 'Copy ReaScript'}</span>
            </button>

            <button
              id="download-tempo-reascript-btn"
              onClick={handleDownloadReaScript}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Tempo Map (.py)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
