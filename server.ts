import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "Beach Boys Harmonizer",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Brian Wilson AI Vocal Arranger Endpoint
app.post("/api/gemini/arrange-vocal", async (req, res) => {
  try {
    const {
      prompt = "Bittersweet summer ballad with floating falsetto and inverted chords",
      key = "E Major",
      tempo = 78,
      style = "pet_sounds",
      chordCount = 6,
      preferredVowel = "aah",
    } = req.body;

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "algorithmic_brian_wilson_engine",
        message: "Arranged using built-in Brian Wilson vocal scoring engine (add GEMINI_API_KEY for dynamic LLM composition).",
        data: generateAlgorithmicBeachBoysArrangement(prompt, key, tempo, style, chordCount, preferredVowel),
      });
    }

    const systemInstruction = `You are Brian Wilson, legendary producer, composer, and vocal arranger for The Beach Boys (Pet Sounds, Smile, Today!, Surfer Girl).
You are arranging a pristine 5-part vocal choir for a song.

The 5 vocal parts are:
1. Brian (Falsetto): Soaring high lead (MIDI 60 to 84, C4-C6), carrying floating 3rds, maj7ths, 9ths, or emotional top falsetto lines.
2. Carl (1st Tenor): Silky sweet upper tenor (MIDI 55 to 77, G3-F5), sweet 7ths and smooth voice-leading.
3. Al Jardine / Brian (Lead / 2nd Tenor): The central melody anchor (MIDI 50 to 74, D3-D5).
4. Dennis / Bruce (Baritone): Inner warm glue (MIDI 45 to 69, A2-A4), close 2nds/3rds, diminished color tones.
5. Mike Love (Bass): Deep resonant chest bass vocal (MIDI 36 to 60, C2-C4), singing roots or Brian's signature inverted bass notes (3rd or 5th in the bass for floating, unresolved tension).

Always return strictly valid JSON matching this schema:
{
  "title": "Song / Vocal Suite Title",
  "albumStyle": "Pet Sounds / Smile / Surfer Girl / Sunflower",
  "key": "${key}",
  "tempo": ${tempo},
  "harmonyStyle": "${style}",
  "brianProductionNotes": "Detailed commentary in Brian Wilson's voice discussing the tape chamber, mic placements, emotional chord colors, and vocal blends.",
  "chords": [
    {
      "id": "c1",
      "name": "Chord Name (e.g. A/E, F#m6/E, Emaj7, G6, Dadd9)",
      "numeral": "e.g. IV/V, ii6/V, Imaj7",
      "root": "A",
      "quality": "Major / Minor / Inverted",
      "inversion": "Root / 1st Inversion / 2nd Inversion / Slash",
      "durationBeats": 4,
      "lyricsSnippet": "Singable lyric line or syllable",
      "vowel": "ooh" | "aah" | "doo" | "wah" | "ee" | "mm",
      "notes": {
        "falsetto": number (MIDI 60-84),
        "tenor1": number (MIDI 55-77),
        "lead": number (MIDI 50-74),
        "baritone": number (MIDI 45-69),
        "bass": number (MIDI 36-60)
      },
      "voicingDescription": "Explanation of interval tensions and voice movement"
    }
  ]
}
Make sure every chord has realistic, playable MIDI numbers and gorgeous close barbershop voice leading. Do NOT wrap in markdown fences. Output raw JSON only.`;

    const userMessage = `Create a 5-part Beach Boys vocal arrangement:
Prompt: "${prompt}"
Key: ${key}
Tempo: ${tempo} BPM
Style Archetype: ${style}
Number of Chords: ${chordCount}
Primary Vowel: ${preferredVowel}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.75,
      },
    });

    const responseText = response.text || "";
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch {
      const cleaned = responseText.replace(/```json\s*|```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      source: "gemini",
      data: parsedData,
    });
  } catch (err: any) {
    console.error("Gemini vocal arrange error:", err);
    return res.json({
      success: true,
      source: "algorithmic_brian_wilson_engine",
      fallbackReason: err?.message || "LLM request fallback",
      data: generateAlgorithmicBeachBoysArrangement(
        req.body.prompt,
        req.body.key,
        req.body.tempo,
        req.body.style,
        req.body.chordCount,
        req.body.preferredVowel
      ),
    });
  }
});

function generateAlgorithmicBeachBoysArrangement(
  prompt: string = "Bittersweet summer ballad",
  key: string = "E Major",
  tempo: number = 78,
  style: string = "pet_sounds",
  count: number = 6,
  preferredVowel: string = "aah"
) {
  const isSmile = prompt.toLowerCase().includes("smile") || style === "smile_poly";
  const isDooWop = prompt.toLowerCase().includes("doo") || style === "surfer_girl";
  const isVibrations = prompt.toLowerCase().includes("vibration") || style === "good_vibrations";

  const standardEChords = [
    {
      id: "gen_1",
      name: "A/E",
      numeral: "IV/V",
      root: "A",
      quality: "Major",
      inversion: "2nd Inversion (Bass on E)",
      durationBeats: 4,
      lyricsSnippet: "Summer winds whisper soft...",
      vowel: preferredVowel as any || "aah",
      notes: { falsetto: 73, tenor1: 69, lead: 64, baritone: 57, bass: 40 },
      voicingDescription: "Signature Brian Wilson floating inverted bass on E under A major triad",
    },
    {
      id: "gen_2",
      name: "F#m6/E",
      numeral: "ii6/V",
      root: "F#",
      quality: "Minor 6th",
      inversion: "Bass on E",
      durationBeats: 4,
      lyricsSnippet: "Holding on to your hand...",
      vowel: "ooh" as any,
      notes: { falsetto: 74, tenor1: 69, lead: 66, baritone: 61, bass: 40 },
      voicingDescription: "Bittersweet minor 6th tension maintaining the resonant E pedal point",
    },
    {
      id: "gen_3",
      name: "Emaj7",
      numeral: "Imaj7",
      root: "E",
      quality: "Major 7th",
      inversion: "Root",
      durationBeats: 4,
      lyricsSnippet: "Stars shining down from above...",
      vowel: "aah" as any,
      notes: { falsetto: 75, tenor1: 71, lead: 68, baritone: 64, bass: 40 },
      voicingDescription: "Rich major 7th resolution with shimmering D#5 in Brian's falsetto",
    },
    {
      id: "gen_4",
      name: "C#m9",
      numeral: "vi9",
      root: "C#",
      quality: "Minor 9th",
      inversion: "Root",
      durationBeats: 4,
      lyricsSnippet: "Time slips away like the tide...",
      vowel: "ooh" as any,
      notes: { falsetto: 75, tenor1: 71, lead: 68, baritone: 63, bass: 49 },
      voicingDescription: "Intimate Four Freshmen minor 9th with tight interior half-steps",
    },
    {
      id: "gen_5",
      name: "F#m7/B",
      numeral: "V11",
      root: "B",
      quality: "Suspended 11th",
      inversion: "Slash chord",
      durationBeats: 4,
      lyricsSnippet: "God only knows in my heart...",
      vowel: "doo" as any,
      notes: { falsetto: 73, tenor1: 69, lead: 66, baritone: 61, bass: 47 },
      voicingDescription: "Gospel dominant 11th with Mike Love singing the deep B bass note",
    },
    {
      id: "gen_6",
      name: "E (add9)",
      numeral: "Iadd9",
      root: "E",
      quality: "Major add9",
      inversion: "Root",
      durationBeats: 4,
      lyricsSnippet: "Forever and always with you...",
      vowel: "aah" as any,
      notes: { falsetto: 74, tenor1: 71, lead: 64, baritone: 59, bass: 40 },
      voicingDescription: "Pure transcendent major resolution with bell-like F# add9 ring",
    },
  ];

  return {
    title: prompt ? `Arrangement: ${prompt.slice(0, 36)}` : "Pacific Coast Vocal Suite",
    albumStyle: isSmile ? "Smile (1967)" : isDooWop ? "Surfer Girl (1963)" : isVibrations ? "Smiley Smile" : "Pet Sounds (1966)",
    key: key || "E Major",
    tempo: tempo || 78,
    harmonyStyle: style || "pet_sounds",
    brianProductionNotes: `Arranged at Western Recorders Studio 3 with Scully 8-track tape saturation and concrete echo chamber reverb. Brian sings the floating top line, Carl and Al provide close barbershop inner voice glue, and Mike Love anchors the low root pedal.`,
    chords: standardEChords.slice(0, count),
  };
}

// Universal AI Progression Generator for REAPER Songwriter
app.post("/api/gemini/generate-progression", async (req, res) => {
  try {
    const { prompt = "Intimate bittersweet fingerstyle acoustic ballad" } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        source: "offline_fallback",
        message: "Gemini client not initialized. Fallback enabled.",
      });
    }

    const systemInstruction = `You are a master composer, music theorist, and REAPER songwriter expert.
Generate a chord progression matching the user's prompt with specific voicings and artist DNA.
Supported artist DNA identifiers:
- 'beach_boys' (Pet Sounds slash chords, 5-part vocal stack)
- 'radiohead' (Lydian #11, polyrhythms, modal interchange)
- 'big_thief' (Adrianne Lenker open DADGAD drones, syncopated cuts)
- 'elliott_smith' (Travis picking, add9/sus2, chromatic descending bass)
- 'dangelo' (Neo-soul m11, J Dilla backbeat lag)
- 'microphones' (Lo-fi acoustic fuzz downbeat rakes)
- 'neutral_milk_hotel' (Raw acoustic cowboy strums, urgent push)
- 'godspeed' (Post-rock modal drone crescendo, slow meter)
- 'bob_dylan' (Irregular meter, lyric-held bars)

Return STRICT JSON matching this schema:
{
  "title": "Progression Title",
  "artistDna": "elliott_smith" | "beach_boys" | "radiohead" | "big_thief" | "dangelo" | "microphones" | "neutral_milk_hotel" | "godspeed" | "bob_dylan",
  "bpm": number (e.g. 78),
  "chords": [
    {
      "id": "c1",
      "name": "Chord name (e.g. Fmaj7#11, A/E, Dm(add9), G7sus4)",
      "numeral": "e.g. IVmaj7#11, I/5, i(add9)",
      "beats": 4,
      "midiNotes": [41, 48, 52, 55, 59, 64],
      "bassNote": 41,
      "inversion": 0,
      "extension": "maj7#11",
      "voicingDescription": "Voice-leading rationale and texture"
    }
  ]
}
Output raw JSON only without markdown wrapping.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const text = response.text || "";
    let data;
    try {
      data = JSON.parse(text.trim());
    } catch {
      data = JSON.parse(text.replace(/```json\s*|```/g, "").trim());
    }

    return res.json({
      success: true,
      source: "gemini",
      ...data,
    });
  } catch (err: any) {
    console.error("Gemini progression error:", err);
    return res.json({
      success: true,
      source: "fallback",
      error: err?.message,
    });
  }
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Beach Boys Harmonizer running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
