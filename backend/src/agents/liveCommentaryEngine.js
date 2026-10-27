import { callGemini } from "../config/gemini.js";

/**
 * Live Contextual Commentary Engine (Gemini 3.5 Flash)
 * Analyzes live match events in the context of preceding lead-up events, tactical shapes,
 * and game state to produce Peter Drury-grade contextual live commentary and TTS audio scripts.
 */
export const generateContextualLiveCommentary = async ({
  currentEvent,
  leadupEvents = [],
  matchState = {},
}) => {
  const pName =
    typeof currentEvent.player === "object"
      ? currentEvent.player?.name || "Player"
      : currentEvent.player || "Player";
  const isBarca =
    currentEvent.teamId === "barcelona" ||
    currentEvent.team === "Barcelona" ||
    currentEvent.team === "FC Barcelona";
  const teamName = isBarca ? "FC Barcelona" : "Deportivo Alavés";
  const oppTeamName = isBarca ? "Deportivo Alavés" : "FC Barcelona";
  const min = currentEvent.minute || 1;
  const xG = currentEvent.metrics?.xG || currentEvent.xg || 0;

  // Format preceding actions chronologically
  const recentLeadups = (leadupEvents || []).slice(-4);
  const leadupDescriptions = recentLeadups.length > 0
    ? recentLeadups
        .map((e, idx) => {
          const p =
            typeof e.player === "object"
              ? e.player?.name || "Player"
              : e.player || "Player";
          const t =
            e.teamId === "barcelona" || e.team === "Barcelona"
              ? "FC Barcelona"
              : "Deportivo Alavés";
          const sec = e.second != null ? `:${String(e.second).padStart(2, "0")}` : "";
          return `[Action ${idx + 1} at ${e.minute}'${sec}] ${t} - ${p} (${e.type}): ${e.description || "play sequence"}`;
        })
        .join("\n")
    : "Initial phase development leading into the attacking third.";

  const precedingPlayers = recentLeadups
    .map((e) => (typeof e.player === "object" ? e.player?.name : e.player))
    .filter(Boolean);
  const lastLeadupPlayer = precedingPlayers[precedingPlayers.length - 1] || (isBarca ? "Lamine Yamal" : "Carlos Vicente");

  // Factual telemetry fallback if Gemini is rate-limited or offline (No hardcoded fake commentary)
  const fallback = () => {
    const leadupSummary = recentLeadups.length > 0
      ? recentLeadups.map((e) => {
          const p = typeof e.player === "object" ? e.player?.name : e.player;
          return `${e.minute}' ${p || "Player"} (${e.type})`;
        }).join(" → ")
      : `Play progressing in the ${min}th minute.`;

    return JSON.stringify({
      broadcastCall: currentEvent.description || `${min}' | ${pName} in possession for ${teamName}.`,
      buildupStory: `Preceding play sequence: ${leadupSummary}`,
      tacticalRecap: `Pitch Telemetry: Action at (${currentEvent.coordinates?.x || 50}, ${currentEvent.coordinates?.y || 50})${xG > 0 ? ` with ${xG} xG` : ""}. Live AI analysis pending telemetry window.`,
      gameImpact: `Match state: FC Barcelona ${matchState.homeScore || 0} - ${matchState.awayScore || 0} Deportivo Alavés.`,
      spokenCall: `${min}' | ${pName} for ${teamName}. ${currentEvent.description || ""}`,
      isAiGenerated: false,
    });
  };

  const prompt = `
You are the Lead Play-by-Play TV Football Commentator & Chief Tactical Analyst (Peter Drury & Gary Neville style) for the live broadcast of FC Barcelona vs Deportivo Alavés.

Synthesize synchronized, real-time live match commentary for fans that explicitly connects this moment to the preceding lead-up events and match context:

CURRENT MOMENT:
- Minute: ${min}' (Second: ${currentEvent.second || 0})
- Event Type: ${currentEvent.type}
- Team: ${teamName}
- Key Player: ${pName}
- Action Description: ${currentEvent.description}
- Pitch Coordinates: (${currentEvent.coordinates?.x || 50}, ${currentEvent.coordinates?.y || 50})
- Expected Goals (xG): ${xG}
- Current Score: FC Barcelona ${matchState.homeScore || 0} - ${matchState.awayScore || 0} Deportivo Alavés

PRECEDING BUILD-UP SEQUENCE (Events directly leading to this moment):
${leadupDescriptions}

MATCH CONTEXT & TELEMETRY:
- Possession: FC Barcelona ${matchState.stats?.barcelona?.possession || 64}% vs Deportivo Alavés ${matchState.stats?.alaves?.possession || 36}%
- Momentum Score: ${matchState.currentMomentum?.score || 0} (${matchState.currentMomentum?.dominantTeam || "Neutral"} dominant)
- Cards: Barcelona (${matchState.stats?.barcelona?.yellowCards || 0}Y/${matchState.stats?.barcelona?.redCards || 0}R) vs Alavés (${matchState.stats?.alaves?.yellowCards || 0}Y/${matchState.stats?.alaves?.redCards || 0}R)

Requirements:
1. WHAT HAPPENED: Electrifying, poetic broadcast climax call for the moment itself.
2. HOW IT DEVELOPED: Specifically reference the preceding sequence (the passes, dribble, switch, or defensive lapse that created this opening).
3. WHY IT MATTERS & TACTICAL MECHANISM: Explain the tactical reason why the space opened up, defender positioning, and player performance.
4. HOW IT CHANGES THE MATCH: Explain how this moment alters the game dynamics (e.g. forced low block, transition vulnerability, game state).
5. SPOKEN SCRIPT: A natural 2-3 sentence broadcast voice script ideal for Text-to-Speech audio so fans can listen live with clear, engaging cadence.

Return strict clean JSON with keys:
{
  "broadcastCall": "Electrifying climax call",
  "buildupStory": "Clear explanation of how the preceding events developed into this moment",
  "tacticalRecap": "Tactical mechanism breakdown (defender errors, space exploitation, pass execution)",
  "gameImpact": "How this alters the tactical dynamic and scoreline pressure",
  "spokenCall": "Natural broadcast spoken script for audio commentary"
}
`;

  try {
    const response = await callGemini({
      modelName: "gemini-3.5-flash",
      prompt,
      temperature: 0.5,
      fallbackGenerator: fallback,
    });

    let data;
    try {
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(fallback());
    } catch (e) {
      data = JSON.parse(fallback());
    }

    return {
      success: true,
      data: {
        eventId: currentEvent.id || currentEvent.eventId,
        minute: min,
        second: currentEvent.second || 0,
        type: currentEvent.type,
        player: pName,
        team: teamName,
        source: response.source || "gemini-3.5-flash",
        model: response.model || "gemini-3.5-flash",
        isAiGenerated: response.source === "live-gemini",
        ...data,
      },
    };
  } catch (err) {
    console.error("[LiveCommentaryEngine Error]", err.message);
    const parsedFallback = JSON.parse(fallback());
    return {
      success: true,
      data: {
        eventId: currentEvent.id || currentEvent.eventId,
        minute: min,
        second: currentEvent.second || 0,
        type: currentEvent.type,
        player: pName,
        team: teamName,
        source: "simulation-engine",
        model: "gemini-3.5-flash-simulated",
        ...parsedFallback,
      },
    };
  }
};
