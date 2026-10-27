import { callGemini } from "../config/gemini.js";
import { getInMemoryStore } from "../config/db.js";
import { SyntheticDataset } from "../models/SyntheticDataset.js";

/**
 * Data Augmentation Agent (Gemini Pro)
 * Generates synthetic match event variations to expand rare tactical event datasets for sports analytics and ML training.
 */
export const generateSyntheticScenarios = async ({
  patternType = "Counter-Attack from Corner",
  count = 3,
}) => {
  const prompt = `
You are an AI Sports Science & Spatial-Temporal Data Engineer.
Your task is to generate ${count} physics-grounded synthetic football match event sequences to expand datasets for machine learning models.

Target Tactical Pattern: "${patternType}"
Coordinate system: 0-100 for X (0 = own goal, 100 = opponent goal) and 0-100 for Y (0 = left touchline, 100 = right touchline).

For each scenario, generate 3-5 sequential event steps (tackles, passes, shots, carries) with:
- sequenceOrder
- eventType ('tackle', 'pass', 'carry', 'shot', 'goal')
- x, y coordinates
- velocity (m/s, range 4 to 28)
- pressureRating (0.0 to 1.0)
- actionDescription

Also provide AI enrichment:
- tacticalInsight
- vulnerabilityIdentified
- optimalCountermeasure
- calculated successProbability (0.0 to 1.0)

Return strict JSON:
{
  "datasetBatchId": "SYNTH-BATCH-${Date.now()}",
  "title": "Synthetic Dataset: ${patternType}",
  "totalScenarios": ${count},
  "scenarios": [
    {
      "scenarioId": "SCN-101",
      "tacticalPattern": "${patternType}",
      "attackingFormation": "4-3-3",
      "defensiveBlock": "Unbalanced Rest Defense (3-1)",
      "successProbability": 0.68,
      "simulatedEvents": [
        { "sequenceOrder": 1, "eventType": "tackle", "x": 16, "y": 48, "velocity": 6.2, "pressureRating": 0.85, "actionDescription": "Defensive clearance at edge of 6-yard box" },
        { "sequenceOrder": 2, "eventType": "carry", "x": 38, "y": 62, "velocity": 8.5, "pressureRating": 0.45, "actionDescription": "Explosive progressive carry past midfield pivot" },
        { "sequenceOrder": 3, "eventType": "pass", "x": 68, "y": 78, "velocity": 18.2, "pressureRating": 0.30, "actionDescription": "Curling diagonal pass behind retreating full-back" },
        { "sequenceOrder": 4, "eventType": "shot", "x": 88, "y": 54, "velocity": 24.5, "pressureRating": 0.60, "actionDescription": "First-time strike into far corner" }
      ],
      "aiEnrichment": {
        "tacticalInsight": "Exploits the space vacated by attacking full-backs who committed to the attacking corner.",
        "vulnerabilityIdentified": "Delay in defensive recovery sprint of the defensive pivot.",
        "optimalCountermeasure": "Foul tactically in the middle third or maintain a 2-man rest defense anchor."
      }
    }
  ]
}
`;

  const fallback = () =>
    JSON.stringify({
      datasetBatchId: `SYNTH-BATCH-${Date.now()}`,
      title: `Synthetic Dataset: ${patternType}`,
      totalScenarios: count,
      scenarios: [
        {
          scenarioId: `SCN-${Date.now()}-1`,
          tacticalPattern: patternType,
          attackingFormation: "4-3-3 Fast Transition",
          defensiveBlock: "High Line Broken",
          successProbability: 0.74,
          simulatedEvents: [
            {
              sequenceOrder: 1,
              eventType: "recovery",
              x: 18,
              y: 50,
              velocity: 5.4,
              pressureRating: 0.9,
              actionDescription: "Header clearance from set piece",
            },
            {
              sequenceOrder: 2,
              eventType: "pass",
              x: 42,
              y: 35,
              velocity: 16.5,
              pressureRating: 0.5,
              actionDescription:
                "Vertical line-breaking pass into open channel",
            },
            {
              sequenceOrder: 3,
              eventType: "carry",
              x: 70,
              y: 28,
              velocity: 8.8,
              pressureRating: 0.35,
              actionDescription: "Winger drives into final third 2v1 advantage",
            },
            {
              sequenceOrder: 4,
              eventType: "shot",
              x: 89,
              y: 46,
              velocity: 26.0,
              pressureRating: 0.65,
              actionDescription: "Low driven shot past diving keeper",
            },
          ],
          aiEnrichment: {
            tacticalInsight:
              "Synthetic variation simulates high-speed transition under variable wind resistance and delayed tracking.",
            vulnerabilityIdentified:
              "Opposition center-backs caught flat-footed after corner delivery.",
            optimalCountermeasure:
              "Drop wide winger into a temporary full-back channel during attacking corners.",
          },
        },
        {
          scenarioId: `SCN-${Date.now()}-2`,
          tacticalPattern: patternType,
          attackingFormation: "3-2-4-1 Half-Space Overload",
          defensiveBlock: "Low Block 5-3-2",
          successProbability: 0.58,
          simulatedEvents: [
            {
              sequenceOrder: 1,
              eventType: "pass",
              x: 55,
              y: 50,
              velocity: 14.0,
              pressureRating: 0.4,
              actionDescription: "Switch of play across the pitch",
            },
            {
              sequenceOrder: 2,
              eventType: "pass",
              x: 68,
              y: 82,
              velocity: 12.2,
              pressureRating: 0.6,
              actionDescription:
                "Inverted full-back slips ball into inner channel",
            },
            {
              sequenceOrder: 3,
              eventType: "shot",
              x: 86,
              y: 64,
              velocity: 22.8,
              pressureRating: 0.75,
              actionDescription: "Curled effort toward far post",
            },
          ],
          aiEnrichment: {
            tacticalInsight:
              "Triangulation draws opposition wing-back outward to isolate the central center-back.",
            vulnerabilityIdentified:
              "Slow lateral shift of the defensive midfield line.",
            optimalCountermeasure:
              "Compact the central zone and force play outside.",
          },
        },
      ],
    });

  const response = await callGemini({
    modelName: "gemini-3.5-flash",
    prompt,
    temperature: 0.5,
    fallbackGenerator: fallback,
  });

  let parsedBatch = null;
  try {
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedBatch = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Return fallback
  }

  if (!parsedBatch) {
    parsedBatch = JSON.parse(fallback());
  }

  // Persist to DB / memory
  try {
    getInMemoryStore().datasets.unshift(parsedBatch);
    if (SyntheticDataset.db?.readyState === 1) {
      await SyntheticDataset.create(parsedBatch);
    }
  } catch (e) {
    // Non-blocking
  }

  return parsedBatch;
};
