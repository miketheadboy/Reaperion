import React from 'react';
import {
  Sparkles,
  Play,
  Square,
  Volume2,
  VolumeX,
  Layers,
  Sliders,
  Activity,
  Music,
  Terminal,
  Download,
  Share2,
} from 'lucide-react';
import { ArtistDnaId, SongwritingSession } from '../types';
import { ARTIST_PRESETS } from '../data/songCatalog';

interface HeaderProps {
  session: SongwritingSession;
  onUpdateSession: (updated: Partial<SongwritingSession>) => void;
  onSelectArtist: (artistId: ArtistDnaId) => void;
  activeTab: 'studio' | 'beachboys' | 'tunings' | 'tempomap' | 'groove' | 'pianoroll' | 'analyzer';
  setActiveTab: (tab: 'studio' | 'beachboys' | 'tunings' | 'tempomap' | 'groove' | 'pianoroll' | 'analyzer') => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenAiModal: () => void;
  onOpenBridgeModal: () => void;
  onDownloadMidi: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onUpdateSession,
  onSelectArtist,
  activeTab,
  setActiveTab,
  isPlaying,
  onTogglePlay,
  onOpenAiModal,
  onOpenBridgeModal,
  onDownloadMidi,
}) => {
  return (
    <header className="bg-[#14151a] border-b border-stone-800 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Top Bar: Brand, Artist DNA Dropdown, Playback Transport & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & REAPER Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-black font-mono text-lg shadow-lg shadow-amber-500/20 border border-amber-400/40">
            RP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-amber-100 tracking-tight flex items-center gap-2">
                REAPER Neural Songwriter
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  V5 Master Suite
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              Studio One Chord Track • Artist DNA • ReaScript Bridge • Beach Boys Stack
            </p>
          </div>
        </div>

        {/* Artist DNA Quick Selector */}
        <div className="flex items-center gap-2 bg-[#1b1d24] px-3 py-1.5 rounded-lg border border-stone-700">
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
            Artist DNA:
          </span>
          <select
            id="artist-dna-select"
            value={session.grooveMatrix.artistDna}
            onChange={(e) => onSelectArtist(e.target.value as ArtistDnaId)}
            className="bg-transparent text-xs font-mono font-bold text-amber-300 focus:outline-none cursor-pointer"
          >
            {Object.values(ARTIST_PRESETS).map((p) => (
              <option key={p.id} value={p.id} className="bg-[#1b1d24] text-stone-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Master Transport & Quick Export Buttons */}
        <div className="flex items-center gap-2">
          {/* Play / Stop Button */}
          <button
            id="transport-play-btn"
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition shadow-md ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'STOP' : 'AUDITION'}</span>
          </button>

          {/* AI Arranger */}
          <button
            id="header-ai-songwriter-btn"
            onClick={onOpenAiModal}
            className="px-3 py-2 bg-[#222530] hover:bg-stone-700 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">AI Songwriter</span>
          </button>

          {/* Download Standard MIDI */}
          <button
            id="header-download-midi-btn"
            onClick={onDownloadMidi}
            className="px-3 py-2 bg-[#222530] hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition"
            title="Download Standard MIDI File (.mid)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Export MIDI</span>
          </button>

          {/* REAPER Python Bridge */}
          <button
            id="header-reaper-bridge-btn"
            onClick={onOpenBridgeModal}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition shadow"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>REAPER Bridge</span>
          </button>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-1 border-t border-stone-800 overflow-x-auto py-1.5">
        <button
          id="tab-btn-studio"
          onClick={() => setActiveTab('studio')}
          className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-md transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'studio'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Chord Track & Arranger</span>
        </button>

        <button
          id="tab-btn-beachboys"
          onClick={() => setActiveTab('beachboys')}
          className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-md transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'beachboys'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Songwriter DNA & Harmonizer</span>
        </button>

        <button
          id="tab-btn-tunings"
          onClick={() => setActiveTab('tunings')}
          className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-md transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tunings'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Custom Tunings & Fretboard</span>
        </button>

        <button
          id="tab-btn-tempomap"
          onClick={() => setActiveTab('tempomap')}
          className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-md transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tempomap'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tempo & Meter Mapping</span>
        </button>

        <button
          id="tab-btn-groove"
          onClick={() => setActiveTab('groove')}
          className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-md transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'groove'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Modular Groove Matrix</span>
        </button>

        <button
          id="tab-btn-pianoroll"
          onClick={() => setActiveTab('pianoroll')}
          className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-md transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pianoroll'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Interactive Piano Roll</span>
        </button>

        <button
          id="tab-btn-analyzer"
          onClick={() => setActiveTab('analyzer')}
          className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-md transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analyzer'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Audio Bar Finder</span>
        </button>
      </div>
    </header>
  );
};
