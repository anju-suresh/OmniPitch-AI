import React, { useState, useEffect, useRef } from 'react';
import { Box, useToast, Flex, Text, HStack, Badge, Button, Spinner } from '@chakra-ui/react';
import { Radio, Volume2, Sparkles, Clock, SkipForward } from 'lucide-react';
import { Navbar } from './components/Navbar.jsx';
import { MatchScoreBanner } from './components/MatchScoreBanner.jsx';
import { MatchOverModal } from './components/MatchOverModal.jsx';
import { StoppageTimeAnimation } from './components/StoppageTimeAnimation.jsx';
import { StudioView } from './views/StudioView.jsx';
import { OTTView } from './views/OTTView.jsx';
import { FanView } from './views/FanView.jsx';
import { DatasetView } from './views/DatasetView.jsx';
import { getSocket } from './services/socket.js';
import { MatchAPI } from './services/api.js';
import BAR_ALA_DATA from './data/bar_ala_2026_01.json';

export const CONTINUOUS_MATCH_EVENTS = BAR_ALA_DATA.events;

export const INITIAL_MATCH_STATE = {
  matchId: BAR_ALA_DATA.match.id,
  matchName: BAR_ALA_DATA.match.name,
  competition: BAR_ALA_DATA.match.competition,
  venue: BAR_ALA_DATA.match.venue,
  homeScore: 0,
  awayScore: 0,
  currentMinute: 0,
  currentSecond: 0,
  status: 'idle', // 'idle' | 'live' | 'paused' | 'full_time'
  homeTeam: BAR_ALA_DATA.match.homeTeam,
  awayTeam: BAR_ALA_DATA.match.awayTeam,
  stats: {
    barcelona: { name: 'FC Barcelona', short: 'BAR', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 },
    alaves: { name: 'Deportivo Alavés', short: 'ALA', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 },
    arsenal: { name: 'FC Barcelona', short: 'BAR', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 },
    chelsea: { name: 'Deportivo Alavés', short: 'ALA', shots: 0, shotsOnTarget: 0, goals: 0, xG: 0.0, possession: 0, fouls: 0, yellowCards: 0, redCards: 0 }
  },
  currentMomentum: { score: 15, dominantTeam: 'Barcelona', intensity: 15 },
  eventsHistory: []
};

// Resilient Sequential Commentary Speech Queue (prevents mid-sentence audio cutoffs)
const speechQueue = [];
let isSpeakingCurrently = false;
let speechPendingTimeout = null;

const OTT_PREDICTION_STORAGE_KEY = 'omnipitch_ott_prediction';
const FAN_PREDICTION_STORAGE_KEY = 'omnipitch_fan_prediction';

const loadSavedPrediction = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.hasVoted) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn(`Error loading stored prediction for ${key}:`, e);
  }
  return { vote: null, hasVoted: false };
};

// Helper to clean commentary text for browser Text-to-Speech (TTS)
// Prevents e.g. "24'" from being pronounced as "24 feet" instead of "24th minute" / "minute 24"
export const cleanTextForSpeech = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    // "24' minute" or "24'min" -> "24th minute"
    .replace(/(\b\d+)'\s*minute/gi, '$1th minute')
    // "minute 24'" -> "minute 24"
    .replace(/minute\s+(\d+)'/gi, 'minute $1')
    // Any remaining number followed by prime/apostrophe "24'" -> "minute 24"
    .replace(/(\b\d+)'/g, 'minute $1')
    .replace(/\s+/g, ' ')
    .trim();
};

const processNextSpeechItem = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (speechQueue.length === 0) {
    isSpeakingCurrently = false;
    return;
  }

  isSpeakingCurrently = true;
  const item = speechQueue.shift();

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const cleanedText = cleanTextForSpeech(item.text);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = item.rate || 1.05;
    utterance.pitch = item.pitch || 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      // Natural 250ms broadcast breath between continuous phrases
      setTimeout(() => {
        processNextSpeechItem();
      }, 250);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setTimeout(() => {
        processNextSpeechItem();
      }, 100);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis speak error:', err);
    processNextSpeechItem();
  }
};

const speakCommentary = (text, isVoiceEnabled = true, isUrgent = false) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const speechText = cleanTextForSpeech(text);

  // If muted or text is empty, immediately clear pending timeouts, flush queue, and cancel speech
  if (!isVoiceEnabled || !speechText) {
    speechQueue.length = 0;
    isSpeakingCurrently = false;
    if (speechPendingTimeout) {
      clearTimeout(speechPendingTimeout);
      speechPendingTimeout = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    return;
  }

  // If urgent key event (Goal, Red Card, Penalty Awarded), interrupt routine transitional speech immediately
  if (isUrgent) {
    speechQueue.length = 0;
    if (speechPendingTimeout) {
      clearTimeout(speechPendingTimeout);
      speechPendingTimeout = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    isSpeakingCurrently = false;
    speechQueue.push({ text: speechText, rate: 1.1, pitch: 1.05 });
    processNextSpeechItem();
    return;
  }

  // For regular sequential events, enqueue so ongoing commentary (e.g. 12') finishes naturally before 15' starts
  if (speechQueue.length >= 2) {
    speechQueue.shift(); // keep queue tight to avoid lagging behind live pitch
  }
  speechQueue.push({ text: speechText, rate: 1.05, pitch: 1.0 });

  if (!isSpeakingCurrently && !window.speechSynthesis.speaking) {
    processNextSpeechItem();
  }
};

export default function App() {
  const toast = useToast();
  const [activePersona, setActivePersona] = useState('studio'); // 'studio' | 'ott' | 'fan' | 'dataset'
  const [matchState, setMatchState] = useState(INITIAL_MATCH_STATE);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const speedMultiplierRef = useRef(1);
  const [isMatchOverOpen, setIsMatchOverOpen] = useState(false);
  const [isStoppageTimeOpen, setIsStoppageTimeOpen] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const isVoiceEnabledRef = useRef(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [latestCommentary, setLatestCommentary] = useState("🎙️ Ready for kickoff: FC Barcelona (4-3-3) vs Deportivo Alavés (4-4-2). Press 'Start Match' to begin.");
  const [viewFocus, setViewFocus] = useState('both'); // 'both' | 'barca' | 'alaves'
  
  // Persistent Match Predictions (Audience / OTT and Fan)
  const [ottPoll, setOttPoll] = useState(() => loadSavedPrediction(OTT_PREDICTION_STORAGE_KEY));
  const [fanPoll, setFanPoll] = useState(() => loadSavedPrediction(FAN_PREDICTION_STORAGE_KEY));

  const handleVoteOTTPoll = (vote) => {
    const newPrediction = { vote, hasVoted: true, timestamp: Date.now() };
    setOttPoll(newPrediction);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(OTT_PREDICTION_STORAGE_KEY, JSON.stringify(newPrediction));
      }
    } catch (e) {
      console.warn('Failed to save OTT prediction:', e);
    }
  };

  const handleVoteFanPoll = (vote) => {
    const newPrediction = { vote, hasVoted: true, timestamp: Date.now() };
    setFanPoll(newPrediction);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(FAN_PREDICTION_STORAGE_KEY, JSON.stringify(newPrediction));
      }
    } catch (e) {
      console.warn('Failed to save Fan prediction:', e);
    }
  };
  
  // Dynamic Reading Time & Commentary Queue System
  const [activeCommentaryItem, setActiveCommentaryItem] = useState({
    eventId: null,
    minute: 0,
    text: "🎙️ Ready for kickoff: FC Barcelona (4-3-3) vs Deportivo Alavés (4-4-2). Press 'Start Match' to begin.",
    isAi: false,
    isKeyMoment: false,
    tacticalRecap: '',
    buildupStory: ''
  });
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [queuedCount, setQueuedCount] = useState(0);

  const commentaryQueueRef = useRef([]);
  const commentaryTimerRef = useRef(null);
  const currentCommentaryExpiresAtRef = useRef(0);
  const latestHandledEventMinuteRef = useRef(0);

  // Dynamic Reading Duration based on actual commentary word count (~220 words per minute)
  const calculateReadingDurationMs = (text, isKeyMoment = false, spd = 1) => {
    if (!text) return 4500;
    const words = text.trim().split(/\s+/).length;
    let durationMs = 3800 + (words * 260);
    if (isKeyMoment) durationMs += 3500; // Extra celebration / reading window for goals, red cards, penalties
    const scaled = durationMs / (spd || 1);
    return Math.min(Math.max(scaled, 5000), 14000);
  };

  // Queue or display commentary item to ensure unread commentary is not replaced immediately
  const queueOrDisplayCommentary = (item) => {
    const now = Date.now();
    const remainingTime = currentCommentaryExpiresAtRef.current - now;

    // Goals and major inflection moments take immediate priority over routine passes
    const isPriorityShift = item.isKeyMoment && !activeCommentaryItem.isKeyMoment;

    if (remainingTime <= 0 || isPriorityShift) {
      showCommentaryNow(item);
    } else {
      // Avoid duplicate items in queue
      if (!commentaryQueueRef.current.some(q => q.eventId === item.eventId && q.text === item.text)) {
        commentaryQueueRef.current.push(item);
        setQueuedCount(commentaryQueueRef.current.length);
      }
    }
  };

  const showCommentaryNow = (item) => {
    if (commentaryTimerRef.current) clearTimeout(commentaryTimerRef.current);

    const durationMs = calculateReadingDurationMs(item.text, item.isKeyMoment, speedMultiplierRef.current);
    currentCommentaryExpiresAtRef.current = Date.now() + durationMs;

    setActiveCommentaryItem(item);
    setLatestCommentary(`${item.minute}' | ${item.text}`);
    setQueuedCount(commentaryQueueRef.current.length);

    commentaryTimerRef.current = setTimeout(() => {
      if (commentaryQueueRef.current.length > 0) {
        const nextItem = commentaryQueueRef.current.shift();
        setQueuedCount(commentaryQueueRef.current.length);
        showCommentaryNow(nextItem);
      }
    }, durationMs);
  };

  // Manual skip button to next queued commentary if user finished reading early
  const handleSkipToNextCommentary = () => {
    if (commentaryQueueRef.current.length > 0) {
      const nextItem = commentaryQueueRef.current.shift();
      setQueuedCount(commentaryQueueRef.current.length);
      showCommentaryNow(nextItem);
    }
  };

  // Replay State for Key Pitch Moments (Goal, Penalty, Red Card, Big Saves)
  const [replayState, setReplayState] = useState({
    isReplaying: false,
    event: null,
    tacticalExplanation: '',
    timeRemaining: 0
  });
  const replayTimeoutRef = useRef(null);
  const replayExplanationTimeoutRef = useRef(null);

  const localSimIndex = useRef(0);
  const localTimerRef = useRef(null);
  const isBackendConnectedRef = useRef(false);
  const lastEventMinuteRef = useRef(0);

  // Synchronize ref and immediately silence browser speech on mute
  useEffect(() => {
    isVoiceEnabledRef.current = isVoiceEnabled;
    if (!isVoiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }, [isVoiceEnabled]);

  // Clean up replay timeouts on unmount
  useEffect(() => {
    return () => {
      if (replayTimeoutRef.current) clearTimeout(replayTimeoutRef.current);
      if (replayExplanationTimeoutRef.current) clearTimeout(replayExplanationTimeoutRef.current);
      if (commentaryTimerRef.current) clearTimeout(commentaryTimerRef.current);
    };
  }, []);

  // Close Replay manually
  const handleCloseReplay = () => {
    if (replayTimeoutRef.current) clearTimeout(replayTimeoutRef.current);
    if (replayExplanationTimeoutRef.current) clearTimeout(replayExplanationTimeoutRef.current);
    setReplayState(prev => ({ ...prev, isReplaying: false }));
  };

  // Dynamic commentary derivation without hardcoded mock sentences
  const getEventCommentaryPackage = (event, prevMinute = 0) => {
    // If backend AI commentary engine has analyzed and enriched this moment, use it directly
    if (event.aiCommentary) {
      const isKey = event.type === 'goal' || event.type === 'red_card' || event.type === 'penalty_awarded' || event.type === 'shot_saved' || event.type === 'shot_woodwork' || Boolean(event.isKeyMomentCandidate);
      return {
        broadcastCall: event.aiCommentary.broadcastCall || event.description,
        spokenCall: event.aiCommentary.spokenCall || event.aiCommentary.broadcastCall,
        tacticalRecap: `${event.aiCommentary.buildupStory || ''} ${event.aiCommentary.tacticalRecap || ''}`.trim(),
        isKeyMoment: isKey,
        buildupStory: event.aiCommentary.buildupStory,
        gameImpact: event.aiCommentary.gameImpact,
        isAi: Boolean(event.aiCommentary.isAiGenerated ?? true)
      };
    }

    const pName = typeof event.player === 'object' ? (event.player?.name || 'Player') : (event.player || 'Player');
    const isBarca = event.teamId === 'barcelona' || event.team === 'Barcelona' || event.team === 'FC Barcelona';
    const tName = isBarca ? 'FC Barcelona' : 'Deportivo Alavés';
    const min = event.minute || 0;

    let continuityPrefix = '';
    if (prevMinute > 0 && min > prevMinute) {
      const gap = min - prevMinute;
      if (gap >= 4) {
        continuityPrefix = `Advancing into the ${min}th minute: `;
      } else if (gap >= 2) {
        continuityPrefix = `In the ${min}th minute: `;
      }
    }

    const isKey = event.type === 'goal' || event.type === 'red_card' || event.type === 'penalty_awarded' || event.type === 'shot_saved' || event.type === 'shot_woodwork' || Boolean(event.isKeyMomentCandidate);

    // Pure dynamic telemetry description without hardcoded mock sentences
    const broadcastCall = event.description || `${pName} in possession for ${tName}.`;
    const spokenCall = isKey ? broadcastCall : `${continuityPrefix}${broadcastCall}`;
    const tacticalRecap = `Pitch Action at minute ${min}: ${pName} (${tName}) recorded ${event.type}. Contextual tactical analysis updating live.`;

    return { broadcastCall, spokenCall, tacticalRecap, isKeyMoment: isKey, isAi: false };
  };

  // Automatically open the Full Time Center Scoreboard when match finishes
  useEffect(() => {
    if (matchState?.status === 'full_time') {
      setIsMatchOverOpen(true);
    }
  }, [matchState?.status]);

  // Trigger audio commentary, tactical replay, and notification when an event occurs
  const handleIncomingEvent = (event) => {
    setSelectedEvent(event);
    const pName = typeof event.player === 'object' ? (event.player?.name || 'Player') : (event.player || 'Player');
    const isBarca = event.teamId === 'barcelona' || event.team === 'Barcelona' || event.team === 'FC Barcelona';
    const tName = isBarca ? 'FC Barcelona' : 'Deportivo Alavés';
    const voiceOn = isVoiceEnabledRef.current;
    const prevMin = lastEventMinuteRef.current;
    lastEventMinuteRef.current = event.minute || 0;
    latestHandledEventMinuteRef.current = event.minute || 0;

    const { broadcastCall, spokenCall, tacticalRecap, isKeyMoment, isAi } = getEventCommentaryPackage(event, prevMin);

    // If a key moment occurs and AI hasn't enriched it yet, indicate AI analysis in progress
    if (isKeyMoment && !event.aiCommentary) {
      setIsAiGenerating(true);
    }

    const item = {
      eventId: event.id || event.eventId,
      minute: event.minute,
      text: broadcastCall,
      isAi: isAi,
      isKeyMoment: isKeyMoment,
      tacticalRecap: tacticalRecap,
      buildupStory: event.aiCommentary?.buildupStory || '',
      spokenCall: spokenCall
    };

    queueOrDisplayCommentary(item);

    // Speak broadcast commentary with sequential queue continuity
    if (!event.aiCommentary) {
      speakCommentary(spokenCall, voiceOn, isKeyMoment);
    }

    // If key moment (Goal, Penalty, Red Card, Big Chance Save), trigger pitch replay
    if (isKeyMoment) {
      if (replayTimeoutRef.current) clearTimeout(replayTimeoutRef.current);
      if (replayExplanationTimeoutRef.current) clearTimeout(replayExplanationTimeoutRef.current);

      setReplayState({
        isReplaying: true,
        event,
        tacticalExplanation: event.aiCommentary ? `${event.aiCommentary.buildupStory} ${event.aiCommentary.tacticalRecap}` : 'Analyzing tactical sequence...',
        timeRemaining: 8
      });

      // Conclude replay after 8.5s and continue
      replayTimeoutRef.current = setTimeout(() => {
        setReplayState(prev => ({ ...prev, isReplaying: false }));
      }, 8500);

      toast({
        title: event.type === 'goal' ? `⚽ GOAL! ${tName.toUpperCase()} (${event.minute}')` : event.type === 'red_card' ? `🟥 RED CARD (${event.minute}')` : `⚠️ ${event.type?.toUpperCase()} (${event.minute}')`,
        description: `${pName}: ${broadcastCall}`,
        status: event.type === 'goal' ? 'success' : event.type === 'red_card' ? 'error' : 'info',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } else if (event.type === 'stoppage_time_announced' || (event.minute === 90 && event.second === 0)) {
      setIsStoppageTimeOpen(true);
      const audioCall = `The fourth official raises the electronic board! A minimum of 4 minutes of added stoppage time at Montjuïc!`;
      speakCommentary(audioCall, voiceOn);
      setTimeout(() => setIsStoppageTimeOpen(false), 7000);
    } else if (event.type === 'full_time' || event.minute >= 94) {
      setIsStoppageTimeOpen(false);
      setIsMatchOverOpen(true);
      const audioCall = `FULL TIME! FC BARCELONA HAS WON 3 TO 1 AGAINST DEPORTIVO ALAVÉS! A glorious performance at Montjuïc!`;
      speakCommentary(audioCall, voiceOn);
    }
  };

  // Calculate dynamic adaptive delay for local simulation (mirrors backend scheduler)
  const calculateLocalEventDelay = (prevEvent, nextEvent) => {
    let baseDelayMs = 4200;
    if (prevEvent?.type === 'goal') {
      baseDelayMs = 9500;
    } else if (prevEvent?.type === 'red_card' || prevEvent?.type === 'penalty_awarded') {
      baseDelayMs = 8000;
    } else if (prevEvent?.type === 'shot_saved' || prevEvent?.type === 'shot_woodwork' || Boolean(prevEvent?.isKeyMomentCandidate)) {
      baseDelayMs = 6500;
    } else if (prevEvent?.type === 'yellow_card' || prevEvent?.type === 'substitution') {
      baseDelayMs = 5200;
    }

    if (nextEvent && prevEvent && nextEvent.minute > prevEvent.minute) {
      const minGap = nextEvent.minute - prevEvent.minute;
      baseDelayMs += Math.min(minGap * 400, 2000);
    }

    return Math.max(Math.round(baseDelayMs / (speedMultiplierRef.current || 1)), 1000);
  };

  const scheduleLocalTick = (delayMs = null) => {
    if (localTimerRef.current) {
      clearTimeout(localTimerRef.current);
      localTimerRef.current = null;
    }
    const prevEvt = localSimIndex.current > 0 ? CONTINUOUS_MATCH_EVENTS[localSimIndex.current - 1] : null;
    const nextEvt = localSimIndex.current < CONTINUOUS_MATCH_EVENTS.length ? CONTINUOUS_MATCH_EVENTS[localSimIndex.current] : null;
    const computedDelay = delayMs !== null ? delayMs : calculateLocalEventDelay(prevEvt, nextEvt);

    localTimerRef.current = setTimeout(() => {
      localTick();
    }, computedDelay);
  };

  // Offline Fallback Local Simulation Tick (ONLY used when backend server is unreachable)
  const localTick = () => {
    if (localSimIndex.current >= CONTINUOUS_MATCH_EVENTS.length) {
      setMatchState(prev => ({ ...prev, status: 'full_time' }));
      if (localTimerRef.current) {
        clearTimeout(localTimerRef.current);
        localTimerRef.current = null;
      }
      speakCommentary("Full time at Montjuïc! FC Barcelona defeat Deportivo Alavés 3 to 1 in La Liga!", isVoiceEnabledRef.current);
      setIsMatchOverOpen(true);
      return;
    }

    const evt = CONTINUOUS_MATCH_EVENTS[localSimIndex.current];
    localSimIndex.current += 1;

    setMatchState(prev => {
      const isBarca = evt.teamId === 'barcelona' || evt.team === 'Barcelona';
      const homeScore = evt.type === 'goal' && isBarca ? prev.homeScore + 1 : prev.homeScore;
      const awayScore = evt.type === 'goal' && !isBarca ? prev.awayScore + 1 : prev.awayScore;
      const evtXG = evt.xg || evt.metrics?.xG || 0;

      const barcaXG = isBarca && evtXG ? +(prev.stats.barcelona.xG + evtXG).toFixed(2) : prev.stats.barcelona.xG;
      const alavesXG = !isBarca && evtXG ? +(prev.stats.alaves.xG + evtXG).toFixed(2) : prev.stats.alaves.xG;

      // Dynamic Event-Weighted Momentum Delta based on Match Telemetry
      let evtWeight = 2;
      if (evt.type === 'goal') evtWeight = 28;
      else if (evt.type?.includes('shot')) evtWeight = 10 + Math.round(evtXG * 15);
      else if (evt.type === 'penalty_awarded') evtWeight = 20;
      else if (evt.type === 'corner') evtWeight = 6;
      else if (evt.type === 'tackle' || evt.type === 'interception') evtWeight = 5;
      else if (evt.type === 'pass_sequence' || evt.type === 'attack_leadup') evtWeight = 4;
      else if (evt.type === 'red_card') evtWeight = -24;
      else if (evt.type === 'yellow_card') evtWeight = -7;
      else if (evt.type === 'foul') evtWeight = -4;

      const momentumDelta = isBarca ? evtWeight : -evtWeight;
      const momentumScore = Math.max(Math.min(prev.currentMomentum.score + momentumDelta, 100), -100);

      const updatedHistory = [evt, ...prev.eventsHistory];

      // Dynamically calculate cumulative possession from match events stream
      let barcaSec = 0;
      let alavesSec = 0;
      for (const e of updatedHistory) {
        const isB = e.teamId === 'barcelona' || e.team === 'Barcelona' || e.team === 'FC Barcelona';
        const dur = e.possessionDurationSeconds || 25;
        if (isB) barcaSec += dur;
        else alavesSec += dur;
      }
      const totalDur = barcaSec + alavesSec;
      const barcaPoss = totalDur > 0 ? Math.round((barcaSec / totalDur) * 100) : 0;
      const alavesPoss = totalDur > 0 ? (100 - barcaPoss) : 0;

      const nextState = {
        ...prev,
        homeScore,
        awayScore,
        currentMinute: evt.minute,
        currentSecond: evt.second,
        status: 'live',
        stats: {
          barcelona: {
            ...prev.stats.barcelona,
            goals: homeScore,
            shots: isBarca && (evt.type?.includes('shot') || evt.type === 'goal') ? prev.stats.barcelona.shots + 1 : prev.stats.barcelona.shots,
            shotsOnTarget: isBarca && (evt.type === 'shot_saved' || evt.type === 'goal') ? prev.stats.barcelona.shotsOnTarget + 1 : prev.stats.barcelona.shotsOnTarget,
            xG: barcaXG,
            possession: barcaPoss,
            fouls: evt.type === 'foul' && isBarca ? prev.stats.barcelona.fouls + 1 : prev.stats.barcelona.fouls,
            yellowCards: evt.type === 'yellow_card' && isBarca ? prev.stats.barcelona.yellowCards + 1 : prev.stats.barcelona.yellowCards,
            redCards: evt.type === 'red_card' && isBarca ? prev.stats.barcelona.redCards + 1 : prev.stats.barcelona.redCards
          },
          alaves: {
            ...prev.stats.alaves,
            goals: awayScore,
            shots: !isBarca && (evt.type?.includes('shot') || evt.type === 'goal') ? prev.stats.alaves.shots + 1 : prev.stats.alaves.shots,
            shotsOnTarget: !isBarca && (evt.type === 'shot_saved' || evt.type === 'goal') ? prev.stats.alaves.shotsOnTarget + 1 : prev.stats.alaves.shotsOnTarget,
            xG: alavesXG,
            possession: alavesPoss,
            fouls: evt.type === 'foul' && !isBarca ? prev.stats.alaves.fouls + 1 : prev.stats.alaves.fouls,
            yellowCards: evt.type === 'yellow_card' && !isBarca ? prev.stats.alaves.yellowCards + 1 : prev.stats.alaves.yellowCards,
            redCards: evt.type === 'red_card' && !isBarca ? prev.stats.alaves.redCards + 1 : prev.stats.alaves.redCards
          },
          arsenal: {
            shots: isBarca && (evt.type?.includes('shot') || evt.type === 'goal') ? prev.stats.barcelona.shots + 1 : prev.stats.barcelona.shots,
            shotsOnTarget: isBarca && (evt.type === 'shot_saved' || evt.type === 'goal') ? prev.stats.barcelona.shotsOnTarget + 1 : prev.stats.barcelona.shotsOnTarget,
            goals: homeScore,
            xG: barcaXG,
            possession: barcaPoss,
            fouls: evt.type === 'foul' && isBarca ? prev.stats.barcelona.fouls + 1 : prev.stats.barcelona.fouls,
            yellowCards: evt.type === 'yellow_card' && isBarca ? prev.stats.barcelona.yellowCards + 1 : prev.stats.barcelona.yellowCards
          },
          chelsea: {
            shots: !isBarca && (evt.type?.includes('shot') || evt.type === 'goal') ? prev.stats.alaves.shots + 1 : prev.stats.alaves.shots,
            shotsOnTarget: !isBarca && (evt.type === 'shot_saved' || evt.type === 'goal') ? prev.stats.alaves.shotsOnTarget + 1 : prev.stats.alaves.shotsOnTarget,
            goals: awayScore,
            xG: alavesXG,
            possession: alavesPoss,
            fouls: evt.type === 'foul' && !isBarca ? prev.stats.alaves.fouls + 1 : prev.stats.alaves.fouls,
            yellowCards: evt.type === 'yellow_card' && !isBarca ? prev.stats.alaves.yellowCards + 1 : prev.stats.alaves.yellowCards
          }
        },
        currentMomentum: {
          score: momentumScore,
          dominantTeam: momentumScore > 10 ? 'Barcelona' : momentumScore < -10 ? 'Alavés' : 'Neutral',
          intensity: Math.abs(momentumScore)
        },
        eventsHistory: updatedHistory
      };

      return nextState;
    });

    handleIncomingEvent(evt);

    // Schedule next dynamic tick if still running in local offline mode
    if (localSimIndex.current < CONTINUOUS_MATCH_EVENTS.length) {
      scheduleLocalTick();
    }
  };

  // Direct Start Live Action with Dynamic Formation Announcement
  const startLiveAction = () => {
    if (matchState.status === 'full_time' || matchState.currentMinute >= 94) {
      handleReset();
      return;
    }
    setMatchState(prev => ({ ...prev, status: 'live' }));
    
    const hName = matchState?.homeTeam?.name || 'FC Barcelona';
    const aName = matchState?.awayTeam?.name || 'Deportivo Alavés';
    const hForm = matchState?.homeTeam?.formation ? ` (${matchState.homeTeam.formation})` : '';
    const aForm = matchState?.awayTeam?.formation ? ` (${matchState.awayTeam.formation})` : '';
    const venue = matchState?.venue || 'the stadium';

    const kickoffCall = `Match underway! ${hName}${hForm} against ${aName}${aForm} at ${venue}!`;
    setLatestCommentary(`⚽ Kickoff: ${hName}${hForm} vs ${aName}${aForm}`);
    speakCommentary(kickoffCall, isVoiceEnabledRef.current);

    toast({ 
      title: '⚽ MATCH UNDERWAY!', 
      description: `${hName}${hForm} vs ${aName}${aForm} • ${venue}`, 
      status: 'success', 
      duration: 1500,
      position: 'top-right'
    });

    const socket = getSocket();
    if (socket && socket.connected) {
      if (localTimerRef.current) {
        clearTimeout(localTimerRef.current);
        localTimerRef.current = null;
      }
      MatchAPI.start().catch(err => console.error('Start error:', err));
    } else {
      if (localTimerRef.current) clearTimeout(localTimerRef.current);
      scheduleLocalTick(1200);
    }
  };

  // Toggle Start / Pause
  const handleTogglePlay = async () => {
    const socket = getSocket();
    if (matchState.status === 'live') {
      // Pause
      setMatchState(prev => ({ ...prev, status: 'paused' }));
      if (localTimerRef.current) {
        clearTimeout(localTimerRef.current);
        localTimerRef.current = null;
      }
      if (socket && socket.connected) {
        try { await MatchAPI.pause(); } catch (e) {}
      }
      toast({ title: 'Match Paused', status: 'info', duration: 1500 });
    } else {
      // Start directly!
      startLiveAction();
    }
  };

  // Reset Match
  const handleReset = async () => {
    if (localTimerRef.current) {
      clearTimeout(localTimerRef.current);
      localTimerRef.current = null;
    }
    localSimIndex.current = 0;
    lastEventMinuteRef.current = 0;
    latestHandledEventMinuteRef.current = 0;
    commentaryQueueRef.current = [];
    setQueuedCount(0);
    setIsAiGenerating(false);
    if (commentaryTimerRef.current) {
      clearTimeout(commentaryTimerRef.current);
      commentaryTimerRef.current = null;
    }
    currentCommentaryExpiresAtRef.current = 0;
    speakCommentary('', false); // cancel ongoing and clear speech queue
    setMatchState(INITIAL_MATCH_STATE);
    setSelectedEvent(null);
    setIsMatchOverOpen(false);
    const resetItem = {
      eventId: null,
      minute: 0,
      text: "Ready for kickoff: FC Barcelona (4-3-3) vs Deportivo Alavés (4-4-2). Press 'Start Match' to begin.",
      isAi: false,
      isKeyMoment: false,
      tacticalRecap: '',
      buildupStory: ''
    };
    setActiveCommentaryItem(resetItem);
    setLatestCommentary("🎙️ Match reset to 00:00: FC Barcelona (4-3-3) vs Deportivo Alavés (4-4-2). Press 'Start Match' to begin.");

    // Reset audience & fan predictions ONLY on match reset or restart
    setOttPoll({ vote: null, hasVoted: false });
    setFanPoll({ vote: null, hasVoted: false });
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(OTT_PREDICTION_STORAGE_KEY);
        localStorage.removeItem(FAN_PREDICTION_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to clear predictions on match reset:', e);
    }

    const socket = getSocket();
    if (socket && socket.connected) {
      try { await MatchAPI.reset(); } catch (e) {}
    }
    toast({ title: 'Match Reset to 00:00', status: 'warning', duration: 1500 });
  };

  // Speed change
  const handleSpeedChange = async (spd) => {
    setSpeedMultiplier(spd);
    speedMultiplierRef.current = spd;
    const socket = getSocket();
    if (socket && socket.connected) {
      try { await MatchAPI.setSpeed(spd); } catch (e) {}
    } else if (matchState.status === 'live') {
      scheduleLocalTick();
    }
  };

  // Toggle Voice Commentary
  const handleToggleVoice = () => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    isVoiceEnabledRef.current = nextState;
    if (nextState) {
      speakCommentary("Voice commentary unmuted.", true);
      toast({ title: '🔊 Voice Commentary Active', status: 'success', duration: 1500 });
    } else {
      speakCommentary('', false); // immediately kills and cancels any ongoing or queued speech
      toast({ title: '🔇 Voice Commentary Muted', status: 'info', duration: 1500 });
    }
  };

  // Test Audio Button
  const handleTestAudio = () => {
    speakCommentary("Testing OmniPitch live match commentary. Audio system operational for Barcelona vs Alavés!", true);
    toast({ title: '🔊 Audio Test Triggered', description: 'Testing voice output through your speakers.', status: 'info', duration: 2000 });
  };

  // Connect to backend Socket.IO (Single Source of Truth)
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsBackendConnected(true);
      isBackendConnectedRef.current = true;
      if (localTimerRef.current) {
        clearInterval(localTimerRef.current);
        localTimerRef.current = null;
      }
      MatchAPI.getState()
        .then(res => {
          if (res.success && res.data) setMatchState(res.data);
        })
        .catch(() => {});
    };

    const onDisconnect = () => {
      setIsBackendConnected(false);
      isBackendConnectedRef.current = false;
    };

    const onMatchState = (state) => {
      if (state) setMatchState(state);
    };

    const onMatchEvent = (evt) => {
      if (evt) handleIncomingEvent(evt);
    };

    const onAiCommentary = (aiPkg) => {
      if (!aiPkg) return;
      const voiceOn = isVoiceEnabledRef.current;
      setIsAiGenerating(false);

      // Prevent late/stale AI responses from overwriting newer match events
      if (aiPkg.minute && latestHandledEventMinuteRef.current > 0 && aiPkg.minute < latestHandledEventMinuteRef.current - 1) {
        console.warn(`[Commentary] Discarding stale AI response from minute ${aiPkg.minute}' (current: ${latestHandledEventMinuteRef.current}')`);
        return;
      }

      const item = {
        eventId: aiPkg.eventId,
        minute: aiPkg.minute,
        text: aiPkg.broadcastCall || '',
        isAi: true,
        isKeyMoment: true,
        tacticalRecap: aiPkg.tacticalRecap || '',
        buildupStory: aiPkg.buildupStory || '',
        spokenCall: aiPkg.spokenCall || aiPkg.broadcastCall || ''
      };

      queueOrDisplayCommentary(item);

      // If replay is active, enrich it with the deep AI tactical explanation
      setReplayState(prev => {
        if (prev.isReplaying) {
          return {
            ...prev,
            tacticalExplanation: `${aiPkg.buildupStory || ''} ${aiPkg.tacticalRecap || ''}`.trim()
          };
        }
        return prev;
      });

      // Queue spoken audio call into resilient sequential speech queue
      if (aiPkg.spokenCall) {
        speakCommentary(aiPkg.spokenCall, voiceOn, true);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('match:state', onMatchState);
    socket.on('match:event', onMatchEvent);
    socket.on('match:ai-commentary', onAiCommentary);

    if (socket.connected) {
      onConnect();
    } else {
      MatchAPI.getState()
        .then(res => {
          if (res.success && res.data) {
            setMatchState(res.data);
            setIsBackendConnected(true);
          }
        })
        .catch(() => console.log('Offline mode: Using client engine'));
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('match:state', onMatchState);
      socket.off('match:event', onMatchEvent);
      socket.off('match:ai-commentary', onAiCommentary);
      if (localTimerRef.current) clearTimeout(localTimerRef.current);
    };
  }, []);

  return (
    <Box minH="100vh" bg="#0B0F19" color="#F1F5F9">
      
      {/* 90' Stoppage Time LED Board Super Animation */}
      <StoppageTimeAnimation 
        isVisible={isStoppageTimeOpen} 
        onClose={() => setIsStoppageTimeOpen(false)} 
        extraMinutes={4} 
      />

      {/* Center Highlight: Match Over / Full Time Celebration Scoreboard */}
      <MatchOverModal 
        isOpen={isMatchOverOpen}
        onClose={() => setIsMatchOverOpen(false)}
        matchState={matchState}
        onReset={handleReset}
        onViewStudio={() => setActivePersona('studio')}
      />

      {/* Top Navigation & Controls */}
      <Navbar 
        matchState={matchState} 
        activePersona={activePersona} 
        setActivePersona={setActivePersona}
        isVoiceEnabled={isVoiceEnabled}
        onToggleVoice={handleToggleVoice}
        isBackendConnected={isBackendConnected}
      />

      {/* Top Match Broadcast Scoreboard Header with View Focus & Possession Duel (Image 3) */}
      <MatchScoreBanner 
        matchState={matchState} 
        viewFocus={viewFocus} 
        onSetViewFocus={setViewFocus} 
      />

      {/* Live Commentary Broadcast Ticker Banner with Synced Speed Controls & Dynamic Reading System */}
      <Box 
        bg="rgba(11, 15, 25, 0.9)" 
        backdropFilter="blur(12px)"
        borderBottom="1px solid rgba(0, 240, 255, 0.2)" 
        boxShadow="0 4px 20px rgba(0, 0, 0, 0.45)"
        px={{ base: 3, md: 6 }} 
        py={2.5}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <HStack spacing={3} flex={{ base: "1 1 100%", lg: "1" }} minW="0" align="center" wrap="wrap">
            {activeCommentaryItem.isAi ? (
              <Sparkles size={16} color="#00F0FF" />
            ) : (
              <Radio size={14} color="#8B5CF6" />
            )}
            
            {activeCommentaryItem.isAi ? (
              <Badge 
                bg="linear-gradient(90deg, rgba(0, 240, 255, 0.2) 0%, rgba(139, 92, 246, 0.25) 100%)" 
                color="#00F0FF" 
                border="1px solid rgba(0, 240, 255, 0.45)"
                fontSize="9px" 
                px={2.5} 
                py={0.5}
                borderRadius="6px"
                fontWeight="800"
                letterSpacing="wider"
                boxShadow="0 0 10px rgba(0, 240, 255, 0.2)"
              >
                ⚡ GEMINI 3.5 AI LIVE
              </Badge>
            ) : (
              <Badge 
                bg="rgba(139, 92, 246, 0.15)" 
                color="#C4B5FD" 
                border="1px solid rgba(139, 92, 246, 0.3)"
                fontSize="9px" 
                px={2} 
                py={0.5}
                borderRadius="6px"
                fontWeight="800"
              >
                BROADCAST TICKER
              </Badge>
            )}

            {isAiGenerating && (
              <HStack spacing={1.5} bg="rgba(0, 240, 255, 0.12)" px={2} py={0.5} borderRadius="4px" border="1px dashed rgba(0, 240, 255, 0.4)">
                <Spinner size="xs" color="#00F0FF" speed="0.7s" />
                <Text fontSize="10px" color="#00F0FF" fontWeight="600">Analyzing buildup...</Text>
              </HStack>
            )}

            <Box flex={1} minW={{ base: "140px", sm: "180px" }}>
              <Text fontSize="xs" color="#F8FAFC" fontStyle="italic" fontWeight="500" lineHeight="1.4">
                "{latestCommentary}"
              </Text>
              {activeCommentaryItem.buildupStory && (
                <Text fontSize="10px" color="#94A3B8" noOfLines={1} mt={0.5}>
                  <Text as="span" color="#38BDF8" fontWeight="600">Buildup: </Text>
                  {activeCommentaryItem.buildupStory}
                </Text>
              )}
            </Box>

            {queuedCount > 0 && (
              <HStack 
                spacing={1.5} 
                bg="rgba(139, 92, 246, 0.15)" 
                border="1px solid rgba(139, 92, 246, 0.35)" 
                px={2} 
                py={1} 
                borderRadius="8px"
              >
                <Text fontSize="10px" color="#C4B5FD" fontWeight="700">
                  +{queuedCount} queued
                </Text>
                <Button 
                  size="xs" 
                  h="18px" 
                  px={1.5} 
                  fontSize="9px" 
                  variant="ghost" 
                  color="#00F0FF" 
                  _hover={{ bg: "rgba(0, 240, 255, 0.15)" }}
                  onClick={handleSkipToNextCommentary} 
                  title="Skip to next queued commentary item"
                  rightIcon={<SkipForward size={10} />}
                >
                  Skip
                </Button>
              </HStack>
            )}
          </HStack>

          <HStack spacing={2} wrap="wrap" justify={{ base: "space-between", lg: "flex-end" }} w={{ base: "100%", lg: "auto" }}>
            {/* Quick Commentary Pace Selector */}
            <HStack 
              spacing={1} 
              bg="rgba(0, 0, 0, 0.45)" 
              p="3px" 
              borderRadius="8px" 
              border="1px solid rgba(255, 255, 255, 0.08)"
              wrap="wrap"
            >
              <Text fontSize="10px" color="gray.400" px={1} fontWeight="700" display={{ base: "none", sm: "inline" }}>Commentary Pace:</Text>
              <Button 
                size="xs" 
                h="20px"
                px={2}
                fontSize="10px"
                variant={speedMultiplier === 0.5 ? 'neon' : 'ghost'}
                color={speedMultiplier === 0.5 ? '#070B14' : 'gray.300'}
                bg={speedMultiplier === 0.5 ? '#00F0FF' : 'transparent'}
                onClick={() => handleSpeedChange(0.5)}
                title="Relaxed Commentary Pace (gives speech and reader ample time)"
              >
                0.5x Synced
              </Button>
              <Button 
                size="xs" 
                h="20px"
                px={2}
                fontSize="10px"
                variant={speedMultiplier === 1 ? 'neon' : 'ghost'}
                color={speedMultiplier === 1 ? '#070B14' : 'gray.300'}
                bg={speedMultiplier === 1 ? '#00F0FF' : 'transparent'}
                onClick={() => handleSpeedChange(1)}
                title="Standard Pace (Dynamic Reading Time)"
              >
                1x
              </Button>
              <Button 
                size="xs" 
                h="20px"
                px={2}
                fontSize="10px"
                variant={speedMultiplier === 1.5 ? 'neon' : 'ghost'}
                color={speedMultiplier === 1.5 ? '#070B14' : 'gray.300'}
                bg={speedMultiplier === 1.5 ? '#00F0FF' : 'transparent'}
                onClick={() => handleSpeedChange(1.5)}
                title="1.5x Accelerated"
              >
                1.5x
              </Button>
              <Button 
                size="xs" 
                h="20px"
                px={2}
                fontSize="10px"
                variant={speedMultiplier === 2 ? 'neon' : 'ghost'}
                color={speedMultiplier === 2 ? '#070B14' : 'gray.300'}
                bg={speedMultiplier === 2 ? '#00F0FF' : 'transparent'}
                onClick={() => handleSpeedChange(2)}
                title="Fast Forward"
              >
                2x
              </Button>
            </HStack>

            <Button 
              size="xs" 
              variant="ghost" 
              leftIcon={<Volume2 size={12} color="#8B5CF6" />}
              onClick={handleTestAudio} 
              fontSize="10px" 
              color="gray.300"
              _hover={{ color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" }}
            >
              Test Speakers 🔊
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Main Persona Viewport */}
      <Box maxW="1600px" mx="auto" minH="calc(100vh - 150px)">
        {activePersona === 'studio' && (
          <StudioView 
            matchState={matchState} 
            selectedEvent={selectedEvent} 
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            viewFocus={viewFocus}
            onStartMatch={startLiveAction}
            replayState={replayState}
            onCloseReplay={handleCloseReplay}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            speedMultiplier={speedMultiplier}
            onSpeedChange={handleSpeedChange}
            isVoiceEnabled={isVoiceEnabled}
            onToggleVoice={handleToggleVoice}
          />
        )}

        {activePersona === 'ott' && (
          <OTTView 
            matchState={matchState} 
            selectedEvent={selectedEvent} 
            onSelectEvent={(evt) => setSelectedEvent(evt)} 
            onStartMatch={startLiveAction}
            replayState={replayState}
            onCloseReplay={handleCloseReplay}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            speedMultiplier={speedMultiplier}
            onSpeedChange={handleSpeedChange}
            isVoiceEnabled={isVoiceEnabled}
            onToggleVoice={handleToggleVoice}
            ottPoll={ottPoll}
            onVoteOTTPoll={handleVoteOTTPoll}
          />
        )}

        {activePersona === 'fan' && (
          <FanView 
            matchState={matchState} 
            onSelectEvent={(evt) => {
              setSelectedEvent(evt);
              setActivePersona('studio');
            }}
            onSwitchPersona={setActivePersona}
            fanPoll={fanPoll}
            onVoteFanPoll={handleVoteFanPoll}
          />
        )}

        {activePersona === 'dataset' && (
          <DatasetView />
        )}
      </Box>

      {/* Modern Stadium Footer */}
      <Box 
        borderTop="1px solid rgba(255, 255, 255, 0.06)" 
        py={3.5} 
        px={6} 
        bg="#070B14" 
        fontSize="xs" 
        color="gray.400"
      >
        <Flex justify="center" align="center">
          <Text fontWeight="600" color="gray.400">
            OmniPitch AI @ {new Date().getFullYear()}
          </Text>
        </Flex>
      </Box>

    </Box>
  );
}
