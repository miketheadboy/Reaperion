import React, { useState, useEffect, useRef } from 'react';
import {
  ArtistDnaId,
  ChordVoicing,
  GrooveMatrixConfig,
  MidiNoteEvent,
  SongwritingSession,
  TempoMapMarker,
} from './types';
import { ARTIST_PRESETS, TUNINGS } from './data/songCatalog';
import { generateMidiSequence } from './audio/sequenceGenerator';
import { acousticSynth } from './audio/acousticSynth';
import { downloadMidiFile } from './audio/midiEncoder';

import { Header } from './components/Header';
import { ChordTrackStudio } from './components/ChordTrackStudio';
import { ModularGrooveMatrix } from './components/ModularGrooveMatrix';
import { InteractivePianoRoll } from './components/InteractivePianoRoll';
import { AudioAnalyzerTab } from './components/AudioAnalyzerTab';
import { BeachBoysHarmonizerTab } from './components/BeachBoysHarmonizerTab';
import { CustomTuningsTab } from './components/CustomTuningsTab';
import { TempoMappingTab } from './components/TempoMappingTab';
import { ReaScriptBridgeModal } from './components/ReaScriptBridgeModal';
import { AiSongwriterModal } from './components/AiSongwriterModal';

export default function App() {
  const initialArtist = ARTIST_PRESETS.elliott_smith;

  const [session, setSession] = useState<SongwritingSession>({
    id: 'session-master',
    name: 'Neural_Songwriter_Take',
    tempo: initialArtist.tempo,
    timeSignature: '4/4',
    tuning: TUNINGS.find((t) => t.id === initialArtist.recommendedTuning) || TUNINGS[0],
    capoFret: 0,
    chords: initialArtist.defaultChords,
    grooveMatrix: initialArtist.groove,
    notes: [],
    tempoMap: [
      { markerIndex: 1, barNumber: 1, timeSec: 0.0, beatPosition: 0, bpm: initialArtist.tempo, timeSignature: '4/4', isDownbeat: true },
      { markerIndex: 2, barNumber: 2, timeSec: 3.07, beatPosition: 4, bpm: initialArtist.tempo, timeSignature: '4/4', isDownbeat: true },
      { markerIndex: 3, barNumber: 3, timeSec: 6.15, beatPosition: 8, bpm: initialArtist.tempo, timeSignature: '4/4', isDownbeat: true },
      { markerIndex: 4, barNumber: 4, timeSec: 9.23, beatPosition: 12, bpm: initialArtist.tempo, timeSignature: '4/4', isDownbeat: true },
    ],
    soundMode: 'acoustic_guitar',
  });

  const [activeTab, setActiveTab] = useState<
    'studio' | 'beachboys' | 'tunings' | 'tempomap' | 'groove' | 'pianoroll' | 'analyzer'
  >('studio');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayheadBeat, setCurrentPlayheadBeat] = useState<number>(0);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Regenerate humanized MIDI events whenever chords, groove matrix, tuning, or capo changes
  useEffect(() => {
    const generatedEvents = generateMidiSequence(
      session.chords,
      session.grooveMatrix,
      session.tempo,
      session.tuning,
      session.capoFret
    );
    setSession((prev) => ({ ...prev, notes: generatedEvents }));
  }, [
    session.chords,
    session.grooveMatrix,
    session.tempo,
    session.tuning,
    session.capoFret,
  ]);

  const handleUpdateSession = (updated: Partial<SongwritingSession>) => {
    setSession((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectArtist = (artistId: ArtistDnaId) => {
    const preset = ARTIST_PRESETS[artistId];
    if (!preset) return;

    const matchedTuning = TUNINGS.find((t) => t.id === preset.recommendedTuning) || session.tuning;

    setSession((prev) => ({
      ...prev,
      tempo: preset.tempo,
      tuning: matchedTuning,
      grooveMatrix: preset.groove,
      chords: preset.defaultChords,
    }));
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      acousticSynth.stopSequence();
      setIsPlaying(false);
      setCurrentPlayheadBeat(0);
    } else {
      setIsPlaying(true);
      acousticSynth.playSequence(
        session.notes,
        session.tempo,
        session.soundMode,
        session.grooveMatrix.fuzzDrive,
        (currentBeat) => setCurrentPlayheadBeat(currentBeat),
        () => {
          setIsPlaying(false);
          setCurrentPlayheadBeat(0);
        }
      );
    }
  };

  const handleDownloadMidi = () => {
    downloadMidiFile(session.notes, session.tempo, `${session.name}.mid`);
  };

  const handleApplyAiChords = (chords: ChordVoicing[], tempo: number, artistId: ArtistDnaId) => {
    const preset = ARTIST_PRESETS[artistId] || ARTIST_PRESETS.elliott_smith;
    const matchedTuning = TUNINGS.find((t) => t.id === preset.recommendedTuning) || session.tuning;

    setSession((prev) => ({
      ...prev,
      chords,
      tempo,
      tuning: matchedTuning,
      grooveMatrix: preset.groove,
    }));
  };

  const totalSessionBeats = session.chords.reduce((acc, c) => acc + c.beats, 0);

  return (
    <div className="min-h-screen bg-[#0d0e13] text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Universal Header & Transport */}
      <Header
        session={session}
        onUpdateSession={handleUpdateSession}
        onSelectArtist={handleSelectArtist}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
        onDownloadMidi={handleDownloadMidi}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'studio' && (
          <ChordTrackStudio
            session={session}
            onUpdateSession={handleUpdateSession}
            currentPlayheadBeat={currentPlayheadBeat}
            isPlaying={isPlaying}
          />
        )}

        {activeTab === 'groove' && (
          <ModularGrooveMatrix
            groove={session.grooveMatrix}
            onUpdateGroove={(g) => handleUpdateSession({ grooveMatrix: { ...session.grooveMatrix, ...g } })}
            onSelectArtist={handleSelectArtist}
            tempo={session.tempo}
            onUpdateTempo={(tempo) => handleUpdateSession({ tempo })}
          />
        )}

        {activeTab === 'pianoroll' && (
          <InteractivePianoRoll
            notes={session.notes}
            totalBeats={totalSessionBeats}
            currentPlayheadBeat={currentPlayheadBeat}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            bpm={session.tempo}
          />
        )}

        {activeTab === 'beachboys' && <BeachBoysHarmonizerTab />}

        {activeTab === 'tunings' && (
          <CustomTuningsTab
            selectedChordName={session.chords[0]?.name || 'D'}
            onApplyTuningToArrangement={(tuning, capo) => {
              handleUpdateSession({ tuning, capoFret: capo });
            }}
          />
        )}

        {activeTab === 'tempomap' && (
          <TempoMappingTab
            currentBpm={session.tempo}
            onApplyBpmToSession={(tempo) => handleUpdateSession({ tempo })}
          />
        )}

        {activeTab === 'analyzer' && (
          <AudioAnalyzerTab
            tempoMap={session.tempoMap}
            onUpdateTempoMap={(tempoMap) => handleUpdateSession({ tempoMap })}
            masterTempo={session.tempo}
          />
        )}
      </main>

      {/* Footer Info & REAPER Status */}
      <footer className="bg-[#0f1015] border-t border-stone-800 py-3.5 px-4 sm:px-6 text-xs font-mono text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-stone-300 font-semibold">REAPER Bridge Active</span>
            <span>• Standalone & In-DAW Python ReaScript Compatible</span>
          </div>
          <div className="flex items-center gap-3 text-stone-400">
            <span>Drag MIDI chips directly into REAPER</span>
            <span>•</span>
            <button
              id="footer-open-bridge-btn"
              onClick={() => setIsBridgeModalOpen(true)}
              className="text-amber-400 hover:underline"
            >
              Get NeuralChordInjector.py
            </button>
          </div>
        </div>
      </footer>

      {/* REAPER Python ReaScript Modal */}
      {isBridgeModalOpen && (
        <ReaScriptBridgeModal
          session={session}
          onClose={() => setIsBridgeModalOpen(false)}
        />
      )}

      {/* AI Songwriter Modal */}
      {isAiModalOpen && (
        <AiSongwriterModal
          session={session}
          onApplyChords={handleApplyAiChords}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}
    </div>
  );
}
