import React, { useRef, useEffect, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Play,
  Square,
  Volume2,
  Info,
} from 'lucide-react';
import { MidiNoteEvent } from '../types';
import { midiToNoteName } from '../audio/harmonyEngine';
import { acousticSynth } from '../audio/acousticSynth';

interface InteractivePianoRollProps {
  notes: MidiNoteEvent[];
  totalBeats: number;
  currentPlayheadBeat: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  bpm: number;
}

const MIN_MIDI = 36; // C2
const MAX_MIDI = 76; // E5
const ROW_HEIGHT = 16;
const PIANO_KEY_WIDTH = 55;

export const InteractivePianoRoll: React.FC<InteractivePianoRollProps> = ({
  notes,
  totalBeats,
  currentPlayheadBeat,
  isPlaying,
  onTogglePlay,
  bpm,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pixelsPerBeat, setPixelsPerBeat] = useState<number>(65);
  const [hoveredNote, setHoveredNote] = useState<MidiNoteEvent | null>(null);

  // Redraw canvas whenever notes, zoom, or playhead changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const totalRows = MAX_MIDI - MIN_MIDI + 1;
    const canvasWidth = PIANO_KEY_WIDTH + Math.max(16, totalBeats) * pixelsPerBeat + 100;
    const canvasHeight = totalRows * ROW_HEIGHT;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Background
    ctx.fillStyle = '#0f1015';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Pitch Rows & Piano Keys
    for (let i = 0; i < totalRows; i++) {
      const midi = MAX_MIDI - i;
      const y = i * ROW_HEIGHT;
      const isBlack = [1, 3, 6, 8, 10].includes(midi % 12);
      const isC = midi % 12 === 0;

      // Row background
      ctx.fillStyle = isBlack ? '#14161f' : '#191b26';
      ctx.fillRect(PIANO_KEY_WIDTH, y, canvasWidth - PIANO_KEY_WIDTH, ROW_HEIGHT);

      // Subtle horizontal row grid line
      ctx.strokeStyle = '#222533';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PIANO_KEY_WIDTH, y + ROW_HEIGHT);
      ctx.lineTo(canvasWidth, y + ROW_HEIGHT);
      ctx.stroke();

      // Piano Key on left
      ctx.fillStyle = isBlack ? '#1c1e28' : '#e2e8f0';
      ctx.fillRect(0, y, PIANO_KEY_WIDTH, ROW_HEIGHT);
      ctx.strokeStyle = '#2b2e3e';
      ctx.strokeRect(0, y, PIANO_KEY_WIDTH, ROW_HEIGHT);

      // Note label
      if (isC || midi % 12 === 7) {
        ctx.fillStyle = isBlack ? '#94a3b8' : '#0f172a';
        ctx.font = '9px monospace';
        ctx.fillText(midiToNoteName(midi), 6, y + 12);
      }
    }

    // 2. Draw Beat & Bar Grid Lines
    const maxBeat = Math.max(16, Math.ceil(totalBeats));
    for (let b = 0; b <= maxBeat; b++) {
      const x = PIANO_KEY_WIDTH + b * pixelsPerBeat;
      const isDownbeat = b % 4 === 0;

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);

      if (isDownbeat) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)'; // Amber dashed downbeat line
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Draw MIDI Notes
    notes.forEach((ev) => {
      if (ev.note < MIN_MIDI || ev.note > MAX_MIDI) return;

      const rowIndex = MAX_MIDI - ev.note;
      const y = rowIndex * ROW_HEIGHT + 1;
      const x = PIANO_KEY_WIDTH + ev.startBeat * pixelsPerBeat;
      const w = Math.max(4, ev.durationBeats * pixelsPerBeat);
      const h = ROW_HEIGHT - 2;

      // Note color based on velocity and double-stop
      const velIntensity = Math.min(1, Math.max(0.3, ev.velocity / 127));

      if (ev.isDoubleStop) {
        ctx.fillStyle = `rgba(56, 189, 248, ${velIntensity})`; // Cyan for Big Thief double-stops
      } else {
        ctx.fillStyle = `rgba(245, 158, 11, ${velIntensity})`; // Amber for standard plucks
      }

      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 3);
      ctx.fill();

      ctx.strokeStyle = ev.isDoubleStop ? '#0284c7' : '#d97706';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Note text label if width allows
      if (w > 20) {
        ctx.fillStyle = '#000000';
        ctx.font = '8px monospace';
        ctx.fillText(ev.noteName, x + 3, y + 10);
      }
    });

    // 4. Draw Animated Playhead
    if (isPlaying && totalBeats > 0) {
      const playheadX = PIANO_KEY_WIDTH + currentPlayheadBeat * pixelsPerBeat;
      ctx.strokeStyle = '#f43f5e'; // Red line
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, canvasHeight);
      ctx.stroke();

      // Top triangle
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(playheadX - 5, 0);
      ctx.lineTo(playheadX + 5, 0);
      ctx.lineTo(playheadX, 8);
      ctx.fill();
    }
  }, [notes, totalBeats, pixelsPerBeat, currentPlayheadBeat, isPlaying]);

  // Click on piano keys to audition note
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < PIANO_KEY_WIDTH) {
      const rowIndex = Math.floor(y / ROW_HEIGHT);
      const midi = MAX_MIDI - rowIndex;
      acousticSynth.triggerPluck(midi, 100, 1.2, 'acoustic_guitar');
    }
  };

  return (
    <div className="bg-[#14151b] border border-stone-800 rounded-xl p-4 space-y-3 shadow-xl">
      {/* Piano Roll Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-mono font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Interactive Piano Roll Visualizer</span>
          </h2>
          <span className="text-[11px] font-mono text-stone-400">
            {notes.length} MIDI Events • C2 to E5
          </span>
        </div>

        {/* Legend & Zoom Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono text-stone-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Pluck / Downbeat</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-sky-400" />
              <span>Double-Stop Flam</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 border-t border-dashed border-amber-400" />
              <span>Bar Downbeat</span>
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#1a1c26] p-1 rounded-lg border border-stone-700">
            <button
              id="zoom-out-btn"
              onClick={() => setPixelsPerBeat((p) => Math.max(35, p - 10))}
              className="p-1 text-stone-400 hover:text-stone-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-stone-300">
              {pixelsPerBeat}px
            </span>
            <button
              id="zoom-in-btn"
              onClick={() => setPixelsPerBeat((p) => Math.min(130, p + 10))}
              className="p-1 text-stone-400 hover:text-stone-200"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Viewport with Scrollbars */}
      <div
        ref={containerRef}
        className="overflow-auto max-h-[520px] rounded-lg border border-stone-800 bg-[#0d0e12] scrollbar-thin scrollbar-thumb-stone-700"
      >
        <canvas
          id="piano-roll-canvas"
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-crosshair block"
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
        <span>Click on the left piano keys to audition individual notes.</span>
        <span>Amber dashed lines mark measure downbeats for REAPER tempo snapping.</span>
      </div>
    </div>
  );
};
