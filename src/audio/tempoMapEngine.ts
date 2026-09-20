import { TempoMapMarker } from '../types';

export interface EditableTempoNode {
  id: string;
  barNumber: number;
  beatPosition: number; // In quarter note beats from start
  bpm: number;
  numerator: number;
  denominator: number;
  label: string;
  curveType: 'instant' | 'linear_accel' | 'linear_ritard';
}

export const DEFAULT_TEMPO_NODES: EditableTempoNode[] = [
  {
    id: 'node_1',
    barNumber: 1,
    beatPosition: 0,
    bpm: 78,
    numerator: 4,
    denominator: 4,
    label: 'Verse 1 (Intro Pocket)',
    curveType: 'instant',
  },
  {
    id: 'node_2',
    barNumber: 5,
    beatPosition: 16,
    bpm: 78,
    numerator: 4,
    denominator: 4,
    label: 'Verse 2 (Full Band)',
    curveType: 'instant',
  },
  {
    id: 'node_3',
    barNumber: 9,
    beatPosition: 32,
    bpm: 76,
    numerator: 2,
    denominator: 4,
    label: '⚡ Dylan 2/4 Lyrical Pivot',
    curveType: 'instant',
  },
  {
    id: 'node_4',
    barNumber: 10,
    beatPosition: 34,
    bpm: 82,
    numerator: 4,
    denominator: 4,
    label: 'Chorus Swell',
    curveType: 'linear_accel',
  },
  {
    id: 'node_5',
    barNumber: 14,
    beatPosition: 50,
    bpm: 72,
    numerator: 6,
    denominator: 4,
    label: 'Harmonica Cadence Ritardando',
    curveType: 'linear_ritard',
  },
];

/**
 * Generates an automated curve of tempo nodes based on a songwriting archetype
 */
export function generateTempoCurve(
  archetype: 'dylan_rubato' | 'godspeed_crescendo' | 'dangelo_swing' | 'natural_ritard' | 'constant',
  baseBpm: number = 78,
  totalBars: number = 12
): EditableTempoNode[] {
  const nodes: EditableTempoNode[] = [];

  switch (archetype) {
    case 'dylan_rubato': {
      // Bob Dylan push/pull: slight accelerando during vocal delivery, deceleration at line ends, 2/4 insert
      nodes.push({
        id: 'dyn_1',
        barNumber: 1,
        beatPosition: 0,
        bpm: baseBpm,
        numerator: 4,
        denominator: 4,
        label: 'Acoustic Strum Opening',
        curveType: 'instant',
      });
      nodes.push({
        id: 'dyn_2',
        barNumber: 4,
        beatPosition: 12,
        bpm: baseBpm + 3,
        numerator: 4,
        denominator: 4,
        label: 'Narrative Push',
        curveType: 'instant',
      });
      nodes.push({
        id: 'dyn_3',
        barNumber: 7,
        beatPosition: 24,
        bpm: baseBpm - 2,
        numerator: 2,
        denominator: 4,
        label: '2/4 Dylan Lyrical Cut',
        curveType: 'instant',
      });
      nodes.push({
        id: 'dyn_4',
        barNumber: 8,
        beatPosition: 26,
        bpm: baseBpm + 4,
        numerator: 4,
        denominator: 4,
        label: 'Chorus Release',
        curveType: 'instant',
      });
      nodes.push({
        id: 'dyn_5',
        barNumber: 11,
        beatPosition: 38,
        bpm: baseBpm - 6,
        numerator: 6,
        denominator: 4,
        label: '6/4 Harmonica Hold Ritardando',
        curveType: 'linear_ritard',
      });
      return nodes;
    }

    case 'godspeed_crescendo': {
      // Monumental slow-burn post-rock acceleration
      nodes.push({
        id: 'gs_1',
        barNumber: 1,
        beatPosition: 0,
        bpm: Math.max(50, baseBpm - 18),
        numerator: 12,
        denominator: 8,
        label: 'Ambient Drone (Sub-bass rumble)',
        curveType: 'instant',
      });
      nodes.push({
        id: 'gs_2',
        barNumber: 5,
        beatPosition: 24,
        bpm: baseBpm - 8,
        numerator: 12,
        denominator: 8,
        label: 'Guitar Tremolo Gathering',
        curveType: 'linear_accel',
      });
      nodes.push({
        id: 'gs_3',
        barNumber: 9,
        beatPosition: 48,
        bpm: baseBpm + 6,
        numerator: 12,
        denominator: 8,
        label: 'Crescendo Climax (Field Recording)',
        curveType: 'linear_accel',
      });
      nodes.push({
        id: 'gs_4',
        barNumber: 13,
        beatPosition: 72,
        bpm: baseBpm + 14,
        numerator: 12,
        denominator: 8,
        label: 'Full Heavy Wall of Sound',
        curveType: 'instant',
      });
      return nodes;
    }

    case 'natural_ritard': {
      // Gentle 4-bar breathing cadence slowdown
      nodes.push({
        id: 'rit_1',
        barNumber: 1,
        beatPosition: 0,
        bpm: baseBpm,
        numerator: 4,
        denominator: 4,
        label: 'Main Groove',
        curveType: 'instant',
      });
      nodes.push({
        id: 'rit_2',
        barNumber: totalBars - 2,
        beatPosition: (totalBars - 3) * 4,
        bpm: baseBpm,
        numerator: 4,
        denominator: 4,
        label: 'Begin Molto Ritardando',
        curveType: 'linear_ritard',
      });
      nodes.push({
        id: 'rit_3',
        barNumber: totalBars,
        beatPosition: (totalBars - 1) * 4,
        bpm: Math.max(40, baseBpm - 16),
        numerator: 4,
        denominator: 4,
        label: 'Final Chord Resolution',
        curveType: 'instant',
      });
      return nodes;
    }

    case 'constant':
    default: {
      return [
        {
          id: 'const_1',
          barNumber: 1,
          beatPosition: 0,
          bpm: baseBpm,
          numerator: 4,
          denominator: 4,
          label: 'Steady Metric Grid',
          curveType: 'instant',
        },
      ];
    }
  }
}

/**
 * Builds REAPER Python ReaScript code that executes:
 * RPR_SetTempoTimeSigMarker(proj, -1, time_pos, measurepos, beatpos, bpm, timesig_num, timesig_denom, lineartempo)
 */
export function generateReaperTempoMapReaScript(
  nodes: EditableTempoNode[],
  projectName: string = 'REAPER Tempo Map'
): string {
  const nodesJson = JSON.stringify(nodes, null, 2);

  return `# ==============================================================================
# REAPER ReaScript: Precision Tempo & Time Signature Map Injector
# Project: ${projectName}
# Injects ${nodes.length} tempo & meter changes with exact grid alignment & linear transitions
# ==============================================================================
# Instructions:
# 1. In REAPER, go to Actions -> Show action list -> New action -> Load ReaScript.
# 2. Select this .py file and run it.
# 3. REAPER will automatically write all tempo markers, time signature changes,
#    and curve transitions directly into the master project ruler!
# ==============================================================================

import json
import reaper_python as R

TEMPO_NODES = ${nodesJson}

def main():
    R.Undo_BeginBlock()
    
    # Optional: Clear existing tempo markers or append
    # num_markers = R.CountTempoTimeSigMarkers(0)
    
    # Iterate through and inject each tempo / meter node
    current_time = R.GetCursorPosition()
    accum_beats = 0.0
    accum_time_sec = current_time
    
    for idx, node in enumerate(TEMPO_NODES):
        bpm = float(node["bpm"])
        num = int(node["numerator"])
        denom = int(node["denominator"])
        is_linear = (node.get("curveType") == "linear_accel" or node.get("curveType") == "linear_ritard")
        
        # Calculate time position based on beats
        # In REAPER, SetTempoTimeSigMarker takes:
        # proj, ptidx (-1 to add), timepos, measurepos (-1), beatpos (-1), bpm, timesig_num, timesig_denom, lineartempo
        time_pos = accum_time_sec
        
        R.SetTempoTimeSigMarker(
            0,            # Active Project
            -1,           # Append new marker
            time_pos,     # Time in seconds
            -1,           # Measure (-1 auto)
            -1,           # Beat (-1 auto)
            bpm,          # BPM
            num,          # Time signature numerator (e.g. 4, 2, 3, 6, 12)
            denom,        # Time signature denominator (e.g. 4, 8)
            is_linear     # Linear tempo transition (accelerando/ritardando)
        )
        
        # Advance time estimate for next node
        if idx < len(TEMPO_NODES) - 1:
            next_node = TEMPO_NODES[idx + 1]
            beats_delta = next_node["beatPosition"] - node["beatPosition"]
            if beats_delta > 0:
                sec_per_beat = 60.0 / bpm
                accum_time_sec += beats_delta * sec_per_beat
    
    R.UpdateTimeline()
    R.Undo_EndBlock("Inject REAPER Tempo & Time-Sig Map", -1)
    R.ShowConsoleMsg(f"Successfully injected {len(TEMPO_NODES)} tempo & meter markers into REAPER ruler!\\n")

if __name__ == "__main__":
    main()
`;
}
