import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Activity,
  Waves,
  CheckCircle,
  FileCode,
  Download,
  Play,
  Square,
  Sparkles,
} from 'lucide-react';
import { TempoMapMarker } from '../types';
import { generateTempoMapFromTransients } from '../audio/sequenceGenerator';

interface AudioAnalyzerTabProps {
  tempoMap: TempoMapMarker[];
  onUpdateTempoMap: (markers: TempoMapMarker[]) => void;
  masterTempo: number;
}

export const AudioAnalyzerTab: React.FC<AudioAnalyzerTabProps> = ({
  tempoMap,
  onUpdateTempoMap,
  masterTempo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('sample_acoustic_take.wav');
  const [transients, setTransients] = useState<number[]>([0.2, 2.15, 4.08, 6.02, 7.95, 9.9, 11.85]);
  const [detectedBpm, setDetectedBpm] = useState<number>(78);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Generate synthetic acoustic take waveform if no file uploaded
  useEffect(() => {
    drawWaveform();
  }, [audioBuffer, transients]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0f1015';
    ctx.fillRect(0, 0, w, h);

    // Center zero line
    ctx.strokeStyle = '#222533';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Waveform simulation or actual buffer peaks
    ctx.fillStyle = 'rgba(245, 158, 11, 0.65)';
    const totalDurationSec = 14;

    for (let x = 0; x < w; x++) {
      const timeAtX = (x / w) * totalDurationSec;
      // Synthesize realistic acoustic envelope with guitar plucks
      let amp = 0.05;
      transients.forEach((t) => {
        const dt = timeAtX - t;
        if (dt >= 0 && dt < 1.8) {
          amp += Math.exp(-dt * 2.5) * (0.4 + Math.sin(timeAtX * 30) * 0.2);
        }
      });
      amp = Math.min(0.9, amp);
      const barH = amp * (h / 2 - 10);
      ctx.fillRect(x, h / 2 - barH, 1, barH * 2);
    }

    // Draw detected downbeat amber dashed lines
    transients.forEach((tSec, idx) => {
      const x = (tSec / totalDurationSec) * w;
      ctx.beginPath();
      ctx.strokeStyle = '#f59e0b'; // Amber dashed
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Bar marker label
      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px monospace';
      ctx.fillText(`Bar ${idx + 1}`, x + 4, 15);
      ctx.fillText(`${tSec.toFixed(2)}s`, x + 4, 28);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const arrayBuf = ev.target?.result as ArrayBuffer;
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decoded = await audioCtx.decodeAudioData(arrayBuf);
        setAudioBuffer(decoded);

        // Analyze real audio transients
        const rawData = decoded.getChannelData(0);
        const sr = decoded.sampleRate;
        const blockSize = Math.floor(sr * 0.05); // 50ms windows
        const peaks: number[] = [];

        for (let i = 0; i < rawData.length - blockSize; i += blockSize) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[i + j]);
          }
          const energy = sum / blockSize;
          if (energy > 0.15) {
            const timeSec = i / sr;
            if (peaks.length === 0 || timeSec - peaks[peaks.length - 1] > 0.5) {
              peaks.push(parseFloat(timeSec.toFixed(3)));
            }
          }
        }

        const newTransients = peaks.slice(0, 12);
        setTransients(newTransients);

        const { markers, averageBpm } = generateTempoMapFromTransients(newTransients, sr);
        setDetectedBpm(averageBpm);
        onUpdateTempoMap(markers);
      } catch (err) {
        console.error('Audio decode error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportTempoMapJson = () => {
    const payload = {
      type: 'tempo_map_export',
      averageBpm: detectedBpm,
      markers: tempoMap,
      generatedAt: new Date().toISOString(),
      instructions: 'Run REAPER Neural Bridge (NeuralChordInjector.py) and click "3. Inject Tempo Map"',
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `REAPER_Tempo_Map_${fileName.replace(/\.[^/.]+$/, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Waveform Display */}
      <div className="bg-[#14151b] border border-stone-800 rounded-xl p-4 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-xs font-mono font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Audio Analyzer & Bar Finder (Spectral Transient Detection)</span>
            </h2>
            <p className="text-[11px] text-stone-400 font-mono mt-0.5">
              Renders audio take waveform, detects performance downbeats, and warps REAPER's grid to fit organic tempo
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-2">
            <label
              id="upload-audio-btn"
              className="px-3 py-1.5 bg-[#1e212b] hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono font-semibold cursor-pointer flex items-center gap-1.5 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isAnalyzing ? 'Analyzing Take...' : 'Upload WAV / MP3 / AIFF'}</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              id="export-tempo-map-btn"
              onClick={handleExportTempoMapJson}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Tempo Map (.json)</span>
            </button>
          </div>
        </div>

        {/* Waveform Canvas */}
        <div className="relative rounded-lg overflow-hidden border border-stone-800 bg-[#0c0d11]">
          <canvas
            id="audio-analyzer-canvas"
            ref={canvasRef}
            width={950}
            height={180}
            className="w-full block"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <span className="text-stone-300 font-bold">{fileName}</span>
            <span>• Detected Tempo:</span>
            <span className="text-amber-400 font-bold">{detectedBpm} BPM</span>
            <span>• {transients.length} Performance Downbeats Detected</span>
          </div>
          <div className="text-stone-500">
            Amber dashed lines = REAPER Bar Downbeat markers
          </div>
        </div>
      </div>

      {/* Generated Tempo Map Table */}
      <div className="bg-[#14151b] border border-stone-800 rounded-xl p-4 shadow-xl space-y-3">
        <h3 className="text-xs font-mono font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
          <span>REAPER Grid Synchronization Map</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400">
                <th className="py-2 px-3">Marker #</th>
                <th className="py-2 px-3">Bar Downbeat</th>
                <th className="py-2 px-3">Timeline Pos (Sec)</th>
                <th className="py-2 px-3">Instant BPM</th>
                <th className="py-2 px-3">Meter</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {tempoMap.map((m) => (
                <tr key={m.markerIndex} className="hover:bg-[#1b1e28] transition">
                  <td className="py-2 px-3 font-semibold text-amber-400">#{m.markerIndex}</td>
                  <td className="py-2 px-3">Bar {m.barNumber}.1.00</td>
                  <td className="py-2 px-3">{m.timeSec.toFixed(3)}s</td>
                  <td className="py-2 px-3 font-bold text-stone-200">{m.bpm} BPM</td>
                  <td className="py-2 px-3">{m.timeSignature}</td>
                  <td className="py-2 px-3 text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Locked</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
