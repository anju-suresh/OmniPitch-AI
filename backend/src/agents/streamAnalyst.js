import { callGemini } from "../config/gemini.js";

/**
 * Stream Analyst Agent (Gemini Flash)
 * Analyzes live match metrics and detects momentum shifts or critical inflections in real time.
 */
export const analyzeEventStream = async (event, currentMomentum, stats) => {
  const playerName =
    typeof event.player === "object"
      ? event.player?.name || "Player"
      : event.player || "Player";
  const teamName =
    event.team ||
    (event.teamId === "barcelona" ? "FC Barcelona" : "Deportivo Alavés");
  const coords = event.coordinates || { x: 50, y: 50 };
  const endCoords = event.endCoordinates || {};

  const barcaXG = stats.barcelona?.xG ?? stats.arsenal?.xG ?? 0;
  const alavesXG = stats.alaves?.xG ?? stats.chelsea?.xG ?? 0;

  const prompt = `
You are the OmniPitch AI Real-Time Stream Analyst for elite European football.
Analyze this live event that just occurred:

Event Type: ${event.type}
Minute: ${event.minute}' (Second: ${event.second})
Team: ${teamName}
Player: ${playerName}
Description: ${event.description}
Coordinates: (${coords.x}, ${coords.y}) -> (${endCoords.x || ""}, ${endCoords.y || ""})
Event xG: ${event.metrics?.xG || event.xg || 0}
Current Match Momentum Score: ${currentMomentum.score} (Dominant: ${currentMomentum.dominantTeam}, Intensity: ${currentMomentum.intensity})
Match Totals: FC Barcelona xG ${barcaXG} vs Deportivo Alavés xG ${alavesXG}

Provide a concise, high-impact tactical alert (2-3 sentences max) assessing the immediate game impact, tactical intention, and danger level. Format as clean JSON with keys: "alertType", "urgency", "commentaryPoint", "tacticalImpact".
`;

  const fallback = () =>
    JSON.stringify({
      alertType:
        event.type === "goal"
          ? "GOAL_BREAKTHROUGH"
          : (event.metrics?.xG || event.xg) > 0.2
            ? "HIGH_THREAT_CHANCE"
            : "TACTICAL_TRANSITION",
      urgency: event.type === "goal" ? "CRITICAL" : "HIGH",
      commentaryPoint: `${playerName}'s decisive action at ${event.minute}' creates an immediate inflection point for ${teamName}.`,
      tacticalImpact: `Momentum swinging toward ${currentMomentum.dominantTeam}. Defensive recovery speed was compromised in Zone 14.`,
    });

  const response = await callGemini({
    modelName: "gemini-3.5-flash",
    prompt,
    temperature: 0.3,
    fallbackGenerator: fallback,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Return text wrapped
  }

  return {
    alertType: "LIVE_EVENT_UPDATE",
    urgency: "MEDIUM",
    commentaryPoint: response.text,
    tacticalImpact: `Event processed at minute ${event.minute}'.`,
  };
};
