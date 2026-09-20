/**
 * Python ReaScript code for REAPER
 * Complete Neural Bridge V5 Ecosystem with floating Tkinter GUI
 */
export const PYTHON_REASCRIPT_CODE = `# ==============================================================================
# REAPER Neural Songwriter Bridge V5 (Master Package)
# For REAPER 6 & 7 + Python ReaScript
# Provides bidirectional sync between REAPER and Neural Songwriter Studio:
# - INJECT MIDI: Plots complex fingerstyle, micro-timing, & artist DNA
# - EXPORT DEMO: Extracts audio/MIDI from timeline for browser analysis
# - INJECT TEMPO MAP: Warps project grid to match free-time acoustic performances
# ==============================================================================

import os
import json
import base64
import tkinter as tk
from tkinter import filedialog, messagebox

# Check if running inside REAPER ReaScript environment
try:
    import reaper_python as reaper
    IN_REAPER = True
except ImportError:
    try:
        import reaper
        IN_REAPER = True
    except ImportError:
        IN_REAPER = False

class ReaperNeuralBridgeApp:
    def __init__(self, root):
        self.root = root
        self.root.title("REAPER Neural Songwriter Bridge V5")
        self.root.geometry("460x390")
        self.root.configure(bg="#121316")
        self.root.resizable(False, False)

        # Title Banner
        title_frame = tk.Frame(root, bg="#1a1c23", pady=10)
        title_frame.pack(fill="x")
        
        lbl_title = tk.Label(
            title_frame, 
            text="REAPER NEURAL SONGWRITER BRIDGE", 
            font=("Helvetica", 12, "bold"), 
            fg="#f59e0b", 
            bg="#1a1c23"
        )
        lbl_title.pack()
        
        lbl_sub = tk.Label(
            title_frame, 
            text="Closed-Loop MIDI, Audio Analysis & Tempo Warping", 
            font=("Helvetica", 8), 
            fg="#9ca3af", 
            bg="#1a1c23"
        )
        lbl_sub.pack()

        # Status readout
        self.status_var = tk.StringVar()
        self.status_var.set("Ready. Select active track or MIDI item in REAPER.")
        lbl_status = tk.Label(
            root, 
            textvariable=self.status_var, 
            font=("Courier", 8), 
            fg="#10b981", 
            bg="#0c0e12", 
            relief="sunken", 
            pady=6,
            wraplength=420
        )
        lbl_status.pack(fill="x", padx=16, pady=10)

        btn_frame = tk.Frame(root, bg="#121316")
        btn_frame.pack(fill="both", expand=True, padx=20, pady=5)

        # 1. Inject MIDI
        btn_inject = tk.Button(
            btn_frame, 
            text="1. INJECT MIDI TO REAPER\\n(Fingerstyle / Chords / Groove)", 
            bg="#2563eb", 
            fg="white", 
            font=("Helvetica", 9, "bold"), 
            pady=8, 
            cursor="hand2",
            command=self.inject_midi
        )
        btn_inject.pack(fill="x", pady=4)

        # 2. Export Demo Media
        btn_export = tk.Button(
            btn_frame, 
            text="2. EXPORT DEMO (TO WEB)\\n(Rips Selected Audio/MIDI item to JSON)", 
            bg="#d97706", 
            fg="white", 
            font=("Helvetica", 9, "bold"), 
            pady=8, 
            cursor="hand2",
            command=self.export_demo_media
        )
        btn_export.pack(fill="x", pady=4)

        # 3. Inject Tempo Map
        btn_tempo = tk.Button(
            btn_frame, 
            text="3. INJECT TEMPO MAP\\n(Warp Project Grid to Organic Downbeats)", 
            bg="#059669", 
            fg="white", 
            font=("Helvetica", 9, "bold"), 
            pady=8, 
            cursor="hand2",
            command=self.inject_tempo_map
        )
        btn_tempo.pack(fill="x", pady=4)

        # Footer info
        footer = tk.Label(
            root, 
            text="Works with Elliott Smith, Big Thief, Dylan, Dilla & Beach Boys algorithms", 
            font=("Helvetica", 7), 
            fg="#6b7280", 
            bg="#121316"
        )
        footer.pack(side="bottom", pady=6)

    def log(self, message, is_error=False):
        self.status_var.set(message)
        if IN_REAPER:
            reaper.ShowConsoleMsg(f"[NeuralBridge] {message}\\n")

    def inject_midi(self):
        file_path = filedialog.askopenfilename(
            title="Select Songwriter Session / MIDI JSON",
            filetypes=[("JSON Files", "*.json"), ("All Files", "*.*")]
        )
        if not file_path:
            return

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            events = data.get("notes") or data.get("events") or []
            bpm = data.get("tempo", 78)

            if not IN_REAPER:
                self.log(f"Test Mode: Read {len(events)} events at {bpm} BPM.")
                messagebox.showinfo("Success (Standalone Mode)", f"Parsed {len(events)} MIDI events successfully!")
                return

            take = reaper.MIDIEditor_GetTake(reaper.MIDIEditor_GetActive())
            if not take:
                item = reaper.GetSelectedMediaItem(0, 0)
                if item:
                    take = reaper.GetActiveTake(item)

            if not take:
                track = reaper.GetSelectedTrack(0, 0)
                if not track:
                    self.log("Error: Please select a track or double-click a MIDI item first.", is_error=True)
                    return
                cursor_pos = reaper.GetCursorPosition()
                total_beats = max([e.get("startBeat", 0) + e.get("durationBeats", 1) for e in events]) if events else 16
                sec_per_beat = 60.0 / bpm
                item_len = total_beats * sec_per_beat
                item = reaper.CreateNewMIDIItemInProj(track, cursor_pos, cursor_pos + item_len, False)
                take = reaper.GetActiveTake(item)

            reaper.Undo_BeginBlock2(0)

            inserted = 0
            for ev in events:
                pitch = int(ev.get("note", 60))
                vel = int(ev.get("velocity", 96))
                start_beat = float(ev.get("startBeat", 0.0))
                dur_beat = float(ev.get("durationBeats", 1.0))

                start_qn = start_beat
                end_qn = start_beat + dur_beat
                start_ppq = reaper.MIDI_GetPPQPosFromProjQN(take, start_qn)
                end_ppq = reaper.MIDI_GetPPQPosFromProjQN(take, end_qn)

                reaper.MIDI_InsertNote(take, False, False, int(start_ppq), int(end_ppq), 0, pitch, vel, False)
                inserted += 1

            reaper.MIDI_Sort(take)
            reaper.Undo_EndBlock2(0, "Inject Neural Songwriter MIDI", -1)
            reaper.UpdateArrange()

            self.log(f"Success! Injected {inserted} humanized notes into active item.")
            messagebox.showinfo("REAPER Injected", f"Successfully plotted {inserted} notes with micro-timing!")

        except Exception as e:
            self.log(f"Error: {str(e)}", is_error=True)
            messagebox.showerror("Injection Failed", str(e))

    def export_demo_media(self):
        if not IN_REAPER:
            self.log("Standalone simulation: Exporting demo JSON...")
            save_path = filedialog.asksaveasfilename(
                title="Save Demo Analysis Payload",
                defaultextension=".json",
                filetypes=[("JSON Files", "*.json")]
            )
            if save_path:
                mock_payload = {
                    "type": "audio_export",
                    "sampleRate": 44100,
                    "bpm": 80,
                    "info": "Demo take exported from REAPER track"
                }
                with open(save_path, "w") as f:
                    json.dump(mock_payload, f, indent=2)
                self.log(f"Exported demo to {os.path.basename(save_path)}")
            return

        item = reaper.GetSelectedMediaItem(0, 0)
        if not item:
            self.log("Error: Please select an audio item in REAPER first.", is_error=True)
            return

        take = reaper.GetActiveTake(item)
        source = reaper.GetMediaItemTake_Source(take)
        filename = reaper.GetMediaSourceFileName(source, "", 1024)

        if not filename or not os.path.exists(filename):
            self.log("Error: Could not locate source audio file on disk.", is_error=True)
            return

        save_path = filedialog.asksaveasfilename(
            title="Save Audio Export for Neural Studio",
            defaultextension=".json",
            filetypes=[("JSON Files", "*.json")]
        )
        if not save_path:
            return

        try:
            with open(filename, "rb") as f:
                raw_bytes = f.read(2 * 1024 * 1024)
            b64_data = base64.b64encode(raw_bytes).decode("ascii")

            payload = {
                "type": "audio_export",
                "sourceFile": os.path.basename(filename),
                "audioBase64": b64_data,
                "projectBpm": reaper.Master_GetTempo()
            }

            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(payload, f)

            self.log(f"Exported {os.path.basename(filename)} for Spectral/Bar Analysis!")
            messagebox.showinfo("Export Complete", "Audio take ready! Upload this JSON into the Web Analyzer tab.")
        except Exception as e:
            self.log(f"Export error: {str(e)}", is_error=True)

    def inject_tempo_map(self):
        file_path = filedialog.askopenfilename(
            title="Select Tempo Map JSON",
            filetypes=[("JSON Files", "*.json"), ("All Files", "*.*")]
        )
        if not file_path:
            return

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            markers = data.get("tempoMap") or data.get("markers") or []
            if not markers:
                self.log("Error: No tempo markers found in JSON.", is_error=True)
                return

            if not IN_REAPER:
                self.log(f"Parsed {len(markers)} tempo markers.")
                messagebox.showinfo("Success (Standalone)", f"Read {len(markers)} tempo map markers!")
                return

            reaper.Undo_BeginBlock2(0)

            for m in markers:
                time_sec = float(m.get("timeSec", 0.0))
                bpm = float(m.get("bpm", 80))
                reaper.SetTempoTimeSigMarker(0, -1, time_sec, -1, -1, bpm, 4, 4, False)

            reaper.Undo_EndBlock2(0, "Inject Neural Songwriter Tempo Map", -1)
            reaper.UpdateTimeline()

            self.log(f"Success! Grid snapped to {len(markers)} organic downbeat markers.")
            messagebox.showinfo("Tempo Map Injected", f"REAPER grid snapped to {len(markers)} performance downbeats!")
        except Exception as e:
            self.log(f"Tempo injection error: {str(e)}", is_error=True)

if __name__ == "__main__":
    root = tk.Tk()
    app = ReaperNeuralBridgeApp(root)
    root.mainloop()
`;
