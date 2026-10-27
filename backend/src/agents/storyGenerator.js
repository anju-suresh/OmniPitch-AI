import { callGemini } from "../config/gemini.js";
import { getInMemoryStore } from "../config/db.js";
import { MatchRecap } from "../models/MatchRecap.js";

/**
 * Story & Recap Generator Agent (Gemini Pro)
 * Produces multi-format journalistic stories, viral social reel scripts, and highlight cue points.
 */
export const generateMatchStory = async (matchState) => {
  const events = matchState.eventsHistory || [];
  const goals = events.filter((e) => e.type === "goal");
  const shots = events.filter((e) => e.type?.includes("shot"));

  const homeName = matchState.homeTeam?.name || "FC Barcelona";
  const awayName = matchState.awayTeam?.name || "Deportivo Alavés";
  const competition = matchState.competition || "La Liga EA Sports";
  const venue = matchState.venue || "Estadi Olímpic Lluís Companys, Barcelona";

  const homeXG =
    matchState.stats?.barcelona?.xG ?? matchState.stats?.arsenal?.xG ?? 0;
  const awayXG =
    matchState.stats?.alaves?.xG ?? matchState.stats?.chelsea?.xG ?? 0;

  const prompt = `
You are the Chief Sports Editor and Creative Director for Global Sports Broadcast Media.
Generate an engaging, multi-format match story and recap package for this live match:

Match: ${homeName} vs ${awayName}
Competition: ${competition} (${venue})
Score: ${homeName} ${matchState.homeScore} - ${matchState.awayScore} ${awayName}
Current Minute: ${matchState.currentMinute}'
Match Status: ${matchState.status}
${homeName} xG: ${homeXG} | ${awayName} xG: ${awayXG}
Key Goals Scored:
${
  goals
    .map((g) => {
      const p = typeof g.player === "object" ? g.player?.name : g.player;
      const t = g.team || (g.teamId === "barcelona" ? homeName : awayName);
      return `- ${g.minute}': ${p} (${t}) [${g.description}]`;
    })
    .join("\n") || "None yet"
}

Notable Chances & Key Moments:
${events
  .slice(0, 5)
  .map((s) => {
    const p = typeof s.player === "object" ? s.player?.name : s.player;
    const t = s.team || (s.teamId === "barcelona" ? homeName : awayName);
    return `- ${s.minute}': [${t}] ${p} - ${s.type} (${s.description})`;
  })
  .join("\n")}

Generate a comprehensive media package formatted as strict JSON with this exact structure:
{
  "headline": "Sensational, viral headline capturing the essence of the match",
  "leadParagraph": "Compelling 3-4 sentence journalistic opening detailing the atmosphere, stakes, and narrative arc",
  "tacticalSummary": "Overview of managerial duel and in-game tactical adjustments",
  "turningPoints": [
    "Turning point 1 with minute and tactical context",
    "Turning point 2 with minute and tactical context",
    "Turning point 3 with minute and tactical context"
  ],
  "socialReelScript": {
    "hook": "5-second viral visual hook (e.g. 'DO NOT BLINK! Lamine Yamal just bent physics in Barcelona!')",
    "visualCues": [
      "0-5s: Close-up of goal celebration with stadium roar",
      "5-15s: Replay of defense-splitting buildup and assist",
      "15-30s: Side-by-side xG momentum wave showing decisive dominance"
    ],
    "audioScript": "Punchy 30-second spoken commentary script for TikTok/Reels narrator"
  },
  "highlights": [
    {
      "timestamp": "27'",
      "minute": 27,
      "title": "Robert Lewandowski Header Goal",
      "clipDurationSeconds": 25,
      "keyPlayer": "Robert Lewandowski",
      "xG": 0.42,
      "commentaryCue": "Pinpoint cross met with predatory power!"
    },
    {
      "timestamp": "52'",
      "minute": 52,
      "title": "Kike García Equalizer",
      "clipDurationSeconds": 20,
      "keyPlayer": "Kike García",
      "xG": 0.38,
      "commentaryCue": "Alavés strike back on the counter!"
    },
    {
      "timestamp": "88'",
      "minute": 88,
      "title": "Lamine Yamal Wonder Strike",
      "clipDurationSeconds": 30,
      "keyPlayer": "Lamine Yamal",
      "xG": 0.08,
      "commentaryCue": "Pure Catalan magic curls into the top stanchion!"
    }
  ],
  "audioRecapText": "Complete 45-second broadcast radio voiceover summary ready for text-to-speech audio playback."
}
`;

  const fallback = () =>
    JSON.stringify({
      headline:
        matchState.homeScore > matchState.awayScore
          ? `Blaugrana Brilliance: Barcelona Surge Past Resilient Alavés in Montjuïc Thriller`
          : matchState.homeScore < matchState.awayScore
            ? `Basque Shock: Alavés Stun Barcelona in Epic Tactical Masterclass`
            : `High-Stakes Stalemate: Barcelona and Alavés Trade Blows in La Liga Duel`,
      leadParagraph: `Under the lights at Estadi Olímpic Lluís Companys, ${homeName} and ${awayName} engaged in a fiercely competitive La Liga encounter. Hansi Flick's high-tempo vertical football collided with Luis García Plaza's disciplined low-block counter-punching in an atmosphere charged with intensity.`,
      tacticalSummary: `Barcelona dominated territorial possession with Pedri and Casadó pulling strings in the half-spaces, while Alavés remained lethal through direct transitional bursts led by Kike García and Carlos Vicente.`,
      turningPoints: [
        `27' - Robert Lewandowski rose highest to break the deadlock with an emphatic header.`,
        `52' - Kike García punished a defensive transition to restore parity for Alavés.`,
        `80' - Aleksandar Sedlar received a straight red card for a denial of a goal-scoring opportunity.`,
        `88' - Lamine Yamal unleashed a breathtaking curled effort from the corner of the box into the top stanchion.`,
      ],
      socialReelScript: {
        hook: `Did Lamine Yamal just score the goal of the season?! 🔥`,
        visualCues: [
          `0-5s: Slow-motion ball hitting the top-corner net`,
          `5-15s: Hansi Flick celebrating as Montjuïc erupts`,
          `15-30s: Pitch heatmap lighting up on the right flank`,
        ],
        audioScript: `Montjuïc just erupted! Barcelona locked in an absolute thriller against Alavés. Lewandowski, Pedri, and a Lamine Yamal masterclass in the dying minutes. Pure football poetry!`,
      },
      highlights: [
        {
          timestamp: "27'",
          minute: 27,
          title: "Robert Lewandowski Header Goal",
          clipDurationSeconds: 25,
          keyPlayer: "Robert Lewandowski",
          xG: 0.42,
          commentaryCue: "Clinical predatory instinct from Lewandowski!",
        },
        {
          timestamp: "52'",
          minute: 52,
          title: "Kike García Equalizer",
          clipDurationSeconds: 20,
          keyPlayer: "Kike García",
          xG: 0.38,
          commentaryCue: "Kike García stuns the home crowd on the counter!",
        },
        {
          timestamp: "88'",
          minute: 88,
          title: "Lamine Yamal Wonder Strike",
          clipDurationSeconds: 30,
          keyPlayer: "Lamine Yamal",
          xG: 0.08,
          commentaryCue: "Unbelievable strike into the top corner from Yamal!",
        },
      ],
      audioRecapText: `Welcome to the OmniPitch global match debrief. An extraordinary clash at Estadi Olímpic Lluís Companys saw FC Barcelona triumph over Deportivo Alavés. Lewandowski opened the scoring before Kike García equalized for the visitors. With Alavés reduced to 10 men, late drama ensued as Lewandowski secured his brace from the penalty spot before Lamine Yamal capped off a sensational victory with a curled wonder-goal.`,
    });

  const response = await callGemini({
    modelName: "gemini-3.5-flash",
    prompt,
    temperature: 0.6,
    fallbackGenerator: fallback,
  });

  let parsedRecap = null;
  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedRecap = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Return fallback
  }

  if (!parsedRecap) {
    parsedRecap = JSON.parse(fallback());
  }

  // Persist recap
  const recapDoc = {
    recapId: `RECAP-${Date.now()}`,
    matchId: matchState.matchId,
    minute: matchState.currentMinute,
    source: response.source || "simulation",
    model: response.model || "gemini-3.5-flash",
    ...parsedRecap,
  };

  try {
    getInMemoryStore().recaps.unshift(recapDoc);
    if (MatchRecap.db?.readyState === 1) {
      await MatchRecap.create(recapDoc);
    }
  } catch (e) {
    // Non-blocking
  }

  return recapDoc;
};
