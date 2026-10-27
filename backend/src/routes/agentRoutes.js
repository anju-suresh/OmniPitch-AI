import express from "express";
import { explainTacticalMoment } from "../agents/tacticalReasoner.js";
import { generateMatchStory } from "../agents/storyGenerator.js";
import { localizeContent } from "../agents/localizer.js";
import { generateContextualLiveCommentary } from "../agents/liveCommentaryEngine.js";
import { callGemini } from "../config/gemini.js";

export const createAgentRouter = (simulator) => {
  const router = express.Router();

  // Explain tactical moment
  router.post("/tactical-breakdown", async (req, res) => {
    try {
      const { eventId } = req.body;
      const events = simulator.matchState.eventsHistory;
      let targetEvent = events.find((e) => e.eventId === eventId);

      // Fallback to most impactful event if none specified
      if (!targetEvent && events.length > 0) {
        targetEvent = events.find((e) => e.type === "goal") || events[0];
      }

      if (!targetEvent) {
        return res
          .status(400)
          .json({
            success: false,
            message: "No match events available for analysis yet.",
          });
      }

      const breakdown = await explainTacticalMoment(targetEvent, events);
      res.json({
        success: true,
        data: {
          event: targetEvent,
          breakdown,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Generate stories, recaps & highlight cue points
  router.post("/generate-story", async (req, res) => {
    try {
      const story = await generateMatchStory(simulator.matchState);
      res.json({
        success: true,
        data: story,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Localize content into target language & cultural style with club loyalty perspective
  router.post("/localize", async (req, res) => {
    try {
      const { text, targetLanguageCode, fanMode, clubLoyalty } = req.body;
      if (!text) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Text is required for localization",
          });
      }

      const result = await localizeContent({
        text,
        targetLanguageCode: targetLanguageCode || "en",
        fanMode: fanMode || "casual",
        clubLoyalty: clubLoyalty || "FC Barcelona",
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Conversational Fan Q&A assistant
  router.post("/fan-chat", async (req, res) => {
    try {
      const { question, favoriteTeam, language } = req.body;
      const state = simulator.matchState;
      const events = state.eventsHistory.slice(0, 5);
      const homeName = state.homeTeam?.name || "FC Barcelona";
      const awayName = state.awayTeam?.name || "Deportivo Alavés";
      const homeXG =
        state.stats?.barcelona?.xG ?? state.stats?.arsenal?.xG ?? 0;
      const awayXG = state.stats?.alaves?.xG ?? state.stats?.chelsea?.xG ?? 0;

      const prompt = `
You are the OmniPitch AI Fan Companion Assistant.
Answer this fan's question with deep tactical insight and conversational energy.

User's Favorite Team: ${favoriteTeam || "Neutral Football Fan"}
Current Match: ${homeName} ${state.homeScore} - ${state.awayScore} ${awayName} (${state.currentMinute}')
Current Momentum: ${state.currentMomentum.dominantTeam} (Score: ${state.currentMomentum.score})
Recent Events:
${events
  .map((e) => {
    const p =
      typeof e.player === "object"
        ? e.player?.name || "Player"
        : e.player || "Player";
    const t = e.team || (e.teamId === "barcelona" ? homeName : awayName);
    return `${e.minute}' - ${t} ${p}: ${e.description}`;
  })
  .join("\n")}

Fan Question: "${question}"

Provide a 2-3 paragraph enthusiastic, tactically grounded answer. Address the user directly.
`;

      const fallback = () =>
        `Great question! Looking at the live tactical data right now at minute ${state.currentMinute}', ${homeName} are asserting heavy territorial control with an xG of ${homeXG} compared to ${awayName}'s ${awayXG}. The key factor has been how Hansi Flick committed Pedri and Casadó into the half-spaces, generating central overloads that free up Lewandowski and Yamal in the final third!`;

      const response = await callGemini({
        modelName: "gemini-3.5-flash",
        prompt,
        temperature: 0.7,
        fallbackGenerator: fallback,
      });
console.log(response.text,'ressssponse')
      res.json({
        success: true,
        answer: response.text,
        source: response.source,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Studio / Broadcaster Teleprompter & Fact-Pack Generator
  router.post("/studio-factpack", async (req, res) => {
    try {
      const state = simulator.matchState;
      const homeName = state.homeTeam?.name || "FC Barcelona";
      const awayName = state.awayTeam?.name || "Deportivo Alavés";

      const prompt = `
Generate 3 live teleprompter talking points and 2 historical trivia facts for a TV commentator covering ${homeName} vs ${awayName} right now.
Score: ${homeName} ${state.homeScore} - ${state.awayScore} ${awayName} (${state.currentMinute}').
Return clean JSON with keys: "talkingPoints" (array of strings) and "historicalFacts" (array of strings).
`;

      const fallback = () =>
        JSON.stringify({
          talkingPoints: [
            `Barcelona have controlled 64% of possession, consistently rotating through Pedri and Casadó to stretch the Alavés low block.`,
            `Lamine Yamal has created 3 key chances cutting inside off the right flank against Manu Sánchez.`,
            `Alavés remain dangerous on direct breaks, with Kike García contesting 8 aerial duels against Cubarsí and Araújo.`,
          ],
          historicalFacts: [
            `Robert Lewandowski has scored in 5 consecutive La Liga appearances against Basque opposition.`,
            `Deportivo Alavés last secured a league point at Montjuïc in an unforgettable 1-1 draw in 2021.`,
          ],
        });

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

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Live broadcast commentary, pre-event buildup, and tactical recap generator
  router.post("/live-commentary", async (req, res) => {
    try {
      const { event, leadupEvents } = req.body;
      if (!event) {
        return res
          .status(400)
          .json({ success: false, message: "Event is required" });
      }

      const result = await generateContextualLiveCommentary({
        currentEvent: event,
        leadupEvents: leadupEvents || simulator.slidingLeadupBuffer || [],
        matchState: simulator.matchState,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
