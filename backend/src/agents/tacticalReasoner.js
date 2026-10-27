import { callGemini } from "../config/gemini.js";

/**
 * Tactical Reasoner Agent (Gemini Pro)
 * Explains WHY a match moment occurred, tactical mechanisms, and chalkboard instructions.
 */
export const explainTacticalMoment = async (event, recentEvents = []) => {
  const playerName =
    typeof event.player === "object"
      ? event.player?.name || "Player"
      : event.player || "Player";
  const teamName =
    event.team ||
    (event.teamId === "barcelona" ? "FC Barcelona" : "Deportivo Alavés");
  const coords = event.coordinates || { x: 50, y: 50 };

  const prompt = `
You are the Chief Tactical Intelligence Analyst for elite European football clubs.
Analyze this key sequence and explain the tactical mechanisms behind it:

Target Event:
- Minute: ${event.minute}'
- Type: ${event.type}
- Team: ${teamName}
- Player: ${playerName}
- Coordinates: (${coords.x}, ${coords.y})
- Tactical Tags: ${(event.tacticalTags || []).join(", ")}
- Description: ${event.description}

Context (Recent Phase of Play):
${recentEvents
  .slice(0, 3)
  .map((e) => {
    const p =
      typeof e.player === "object"
        ? e.player?.name || "Player"
        : e.player || "Player";
    const t =
      e.team ||
      (e.teamId === "barcelona" ? "FC Barcelona" : "Deportivo Alavés");
    return `${e.minute}' [${t}] ${p}: ${e.type} (${e.description})`;
  })
  .join("\n")}

Generate a comprehensive tactical breakdown formatted as JSON with the following structure:
{
  "headline": "Short punchy tactical headline (e.g. 'How Arsenal's Half-Space Triangulation Unlocked Chelsea')",
  "tacticalConcept": "Name of pattern (e.g. 'Overload to Isolate', 'Inverted Full-Back Pivot', 'Rest Defense Collapse')",
  "explanation": "Detailed breakdown explaining the mechanical breakdown of the defense and why the space opened up",
  "keyMechanisms": [
    "Mechanism 1: Player movement drawing a defender",
    "Mechanism 2: Half-space occupation",
    "Mechanism 3: Execution under pressure"
  ],
  "counterfactual": "What would have happened if the defense made an alternative decision (e.g. held an offside line or doubled the winger)?",
  "chalkboardAnnotations": [
    { "type": "arrow", "from": { "x": 68, "y": 48 }, "to": { "x": 84, "y": 78 }, "color": "#10B981", "label": "Diagonal isolation pass" },
    { "type": "zone", "x": 75, "y": 65, "width": 20, "height": 25, "color": "rgba(59, 130, 246, 0.25)", "label": "Overloaded Half-Space" }
  ]
}
`;

  const fallback = () =>
    JSON.stringify({
      headline:
        event.type === "goal"
          ? `Tactical Breakdown: How ${event.team || "Barcelona"} Exploited Wide Transitions at ${event.minute}'`
          : `Tactical Anatomy: ${playerName}'s Progressive Threat`,
      tacticalConcept:
        event.type === "goal"
          ? "Overload to Isolate & Half-Space Penetration"
          : "High Transition Rest Defense",
      explanation: `${teamName} manipulated the opponent's defensive structure by committing numbers into the central channel. This forced the opposition full-back to narrow his positioning, leaving vacant space on the perimeter for ${playerName} to exploit.`,
      keyMechanisms: [
        `Vertical punch through the first pressing line into Zone 14.`,
        `Decoy run dragging the center-back out of the primary corridor.`,
        `Body orientation opened up a clean shooting angle with minimal backlift.`,
      ],
      counterfactual: `If the opposition pivot had dropped between the center-backs to form a temporary back-five, the passing lane to ${playerName} would have been closed by an estimated 72%.`,
      chalkboardAnnotations: [
        {
          type: "arrow",
          from: { x: (coords.x || 60) - 15, y: (coords.y || 50) - 10 },
          to: { x: coords.x || 60, y: coords.y || 50 },
          color: "#10B981",
          label: "Incisive Progression",
        },
        {
          type: "zone",
          x: Math.max((coords.x || 60) - 10, 0),
          y: Math.max((coords.y || 50) - 12, 0),
          width: 22,
          height: 24,
          color: "rgba(59, 130, 246, 0.2)",
          label: "Exploited Corridor",
        },
      ],
    });

  const response = await callGemini({
    modelName: "gemini-3.5-flash",
    prompt,
    temperature: 0.4,
    fallbackGenerator: fallback,
  });

  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return {
        ...JSON.parse(jsonMatch[0]),
        source: response.source,
        model: response.model,
        isCached: response.isCached,
      };
    }
  } catch (e) {
    // Return fallback
  }

  return {
    ...JSON.parse(fallback()),
    source: response.source || "simulation-engine",
    model: response.model || "fallback",
  };
};
