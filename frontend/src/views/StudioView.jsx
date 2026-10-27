import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Grid, GridItem, Flex, HStack, VStack, Text, Badge, Button, 
  Spinner, useToast, Divider, Progress,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  useDisclosure, IconButton
} from '@chakra-ui/react';
import { 
  Radio, Sparkles, Tv, HelpCircle, History, MessageSquare, TrendingUp, ShieldCheck, Cpu, 
  Activity, Award, Compass, Flag, Target, Gauge, Zap, Flame, BarChart3, Layers, ChevronUp,
  ChevronLeft, ChevronRight, Pin, PinOff, ScrollText, Focus, Play, Volume2, CheckCircle2,
  ListFilter, Search, ExternalLink
} from 'lucide-react';
import { PitchBoard } from '../components/PitchBoard.jsx';
import { MatchdayHeroCard } from '../components/MatchdayHeroCard.jsx';
import { MomentumChart } from '../components/MomentumChart.jsx';
import { MatchSummaryCard } from '../components/MatchSummaryCard.jsx';
import { KeyEventsTable } from '../components/KeyEventsTable.jsx';
import { PlayerHeatmap } from '../components/PlayerHeatmap.jsx';
import { PitchPlaybackControls } from '../components/PitchPlaybackControls.jsx';
import { AgentAPI } from '../services/api.js';
import { TACTICAL_MOMENTS_CATALOG, TACTICAL_MOMENTS_MAP } from '../data/tacticalBreakdowns.js';
import BAR_ALA_DATA from '../data/bar_ala_2026_01.json';

export const StudioView = ({ 
  matchState, 
  selectedEvent, 
  onSelectEvent, 
  viewFocus = 'both', 
  onStartMatch,
  replayState = null,
  onCloseReplay = null,
  onTogglePlay = null,
  onReset = null,
  speedMultiplier = 1,
  onSpeedChange = null,
  isVoiceEnabled = true,
  onToggleVoice = null
}) => {
  const toast = useToast();
  const [factpack, setFactpack] = useState(null);
  const [loadingFacts, setLoadingFacts] = useState(false);
  const [tacticalData, setTacticalData] = useState(null);
  const [loadingTactics, setLoadingTactics] = useState(false);

  // Pinned moment prevents auto "come and go" during live simulation
  const [pinnedEvent, setPinnedEvent] = useState(null);
  const [tacticalViewMode, setTacticalViewMode] = useState('focused'); // 'focused' | 'stream'
  const [feedFilter, setFeedFilter] = useState('all'); // 'all' | 'goals' | 'defense' | 'chances' | 'barca' | 'alaves'
  const [speakingMomentId, setSpeakingMomentId] = useState(null);

  // Responsive Mobile Analytics Drawer State
  const { 
    isOpen: isMobileAnalyticsOpen, 
    onOpen: onMobileAnalyticsOpen, 
    onClose: onMobileAnalyticsClose 
  } = useDisclosure();
  const [mobileTab, setMobileTab] = useState('stats'); // 'stats' | 'heatmap' | 'momentum' | 'milestones'

  const openMobileAnalytics = (tab) => {
    setMobileTab(tab);
    onMobileAnalyticsOpen();
  };

  // In-Memory Client Cache for Tactical Analysis to strictly conserve API quota
  const tacticsCache = React.useRef(new Map());

  // Fetch studio talking points & fact-pack (called on mount or manual user refresh)
  const fetchFactpack = async () => {
    setLoadingFacts(true);
    try {
      const res = await AgentAPI.getStudioFactpack();
      if (res.success) setFactpack(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFacts(false);
    }
  };

  // Tactical History feed: keeps all AI explanations so they never disappear or "come and go"
  const [tacticalHistory, setTacticalHistory] = useState([]);

  const recordBreakdown = (evt, breakdown) => {
    if (!evt || !breakdown) return;
    setTacticalHistory(prev => {
      const evtId = evt.eventId || evt.id;
      const exists = prev.some(item => item.eventId === evtId);
      const item = {
        eventId: evtId,
        minute: evt.minute ?? 0,
        second: evt.second ?? 0,
        player: typeof evt.player === 'object' ? evt.player?.name : evt.player,
        type: evt.type,
        teamId: evt.teamId,
        team: evt.team || (evt.teamId === 'alaves' ? 'Deportivo Alavés' : 'FC Barcelona'),
        coordinates: evt.coordinates,
        xg: evt.xg || evt.metrics?.xG || 0,
        phase: evt.phase || 'open play',
        factDescription: evt.description || breakdown.factDescription,
        headline: breakdown.headline || breakdown.tacticalConcept,
        tacticalConcept: breakdown.tacticalConcept || breakdown.headline,
        explanation: breakdown.explanation,
        counterfactual: breakdown.counterfactual,
        source: breakdown.source || 'gemini',
        model: breakdown.model || 'gemini-pro'
      };
      if (exists) {
        return prev.map(p => p.eventId === evtId ? { ...p, ...item } : p);
      }
      return [...prev, item].sort((a, b) => b.minute - a.minute);
    });
  };

  // Fetch tactical breakdown with quota-aware caching
  const fetchTactics = async (event) => {
    if (!event) return;
    const evtId = event.eventId || event.id;
    if (tacticsCache.current.has(evtId)) {
      const cached = tacticsCache.current.get(evtId);
      setTacticalData(cached);
      recordBreakdown(event, cached);
      return;
    }

    // Immediate catalog match for 0ms response
    const catalogItem = TACTICAL_MOMENTS_MAP[evtId];
    if (catalogItem) {
      const initialBreakdown = {
        headline: catalogItem.tacticalConcept,
        tacticalConcept: catalogItem.tacticalConcept,
        explanation: catalogItem.explanation,
        counterfactual: catalogItem.counterfactual,
        source: 'curated-catalog',
        model: 'tactical-engine'
      };
      setTacticalData(initialBreakdown);
      recordBreakdown(event, initialBreakdown);
    }

    setLoadingTactics(true);
    try {
      const res = await AgentAPI.getTacticalBreakdown(evtId);
      if (res.success && res.data?.breakdown) {
        tacticsCache.current.set(evtId, res.data.breakdown);
        setTacticalData(res.data.breakdown);
        recordBreakdown(event, res.data.breakdown);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTactics(false);
    }
  };

  // Fetch fact-pack once on initial load (not on every second/minute tick!)
  useEffect(() => {
    fetchFactpack();
  }, []);

  // Default initial event fallback: When at kickoff (00:00), default to kickoff event evt_001 (1')
  const defaultEvent = BAR_ALA_DATA.events.find(e => e.id === 'evt_001') || BAR_ALA_DATA.events[0];
  
  // If user pinned an event, it will stay on it without "coming and going"
  const activeEvt = pinnedEvent || selectedEvent || matchState?.eventsHistory?.[0] || defaultEvent;
  const activeEvtId = activeEvt?.eventId || activeEvt?.id || 'evt_001';
  const catalogBreakdown = TACTICAL_MOMENTS_MAP[activeEvtId] || TACTICAL_MOMENTS_CATALOG[0];

  // Dynamic set of occurred event IDs from match history
  const historyEventIds = useMemo(() => new Set((matchState?.eventsHistory || []).map(e => e.id || e.eventId)), [matchState?.eventsHistory]);

  // Occurred moments strictly synchronized with live match minutes (no future spoilers)
  const occurredMoments = useMemo(() => {
    const isFinished = matchState?.status === 'full_time' || (matchState?.currentMinute >= 94);
    const currentMin = matchState?.currentMinute || 0;
    return TACTICAL_MOMENTS_CATALOG.filter(m => {
      if (isFinished) return true;
      if (historyEventIds.has(m.eventId)) return true;
      if (currentMin > 0 && currentMin >= m.minute) return true;
      return false;
    });
  }, [matchState?.currentMinute, matchState?.status, historyEventIds]);

  // Reverse chronological ribbon moments (90' down to 1')
  const ribbonMoments = useMemo(() => {
    return [...occurredMoments].sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0));
  }, [occurredMoments]);

  // Reset pinned event & live tactical history when match is reset to 00:00
  useEffect(() => {
    if (matchState?.currentMinute === 0 && (matchState?.eventsHistory?.length || 0) === 0) {
      setPinnedEvent(null);
      setTacticalHistory([]);
    }
  }, [matchState?.currentMinute, matchState?.eventsHistory?.length]);

  // Only auto-fetch tactics for key moments or user click, preserving the 15 RPM limit
  useEffect(() => {
    if (pinnedEvent) {
      fetchTactics(pinnedEvent);
    } else if (selectedEvent) {
      fetchTactics(selectedEvent);
    } else if (matchState?.eventsHistory?.length > 0) {
      const latest = matchState.eventsHistory[0];
      if (latest.type === 'goal' || latest.type === 'red_card' || latest.type === 'penalty_awarded' || latest.isKeyMomentCandidate) {
        fetchTactics(latest);
      }
    }
  }, [pinnedEvent?.eventId, pinnedEvent?.id, selectedEvent?.eventId, selectedEvent?.id, matchState?.eventsHistory?.[0]?.id, matchState?.eventsHistory?.[0]?.eventId]);

  const currentMomentIndex = ribbonMoments.findIndex(m => m.eventId === activeEvtId);

  const handleSelectMoment = (moment) => {
    if (!moment) return;
    const authenticEvt = BAR_ALA_DATA.events.find(e => e.id === moment.eventId) || {
      id: moment.eventId,
      minute: moment.minute,
      second: 0,
      type: moment.type,
      player: { name: moment.player },
      teamId: moment.teamId,
      team: moment.team,
      description: moment.factDescription,
      coordinates: moment.coordinates,
      endCoordinates: moment.endCoordinates,
      xg: moment.xg,
      isKeyMomentCandidate: true
    };
    setPinnedEvent(authenticEvt);
    if (onSelectEvent) onSelectEvent(authenticEvt);
    fetchTactics(authenticEvt);
  };

  const handlePrevMoment = () => {
    const idx = currentMomentIndex >= 0 ? currentMomentIndex : 0;
    if (idx > 0) {
      handleSelectMoment(ribbonMoments[idx - 1]);
    }
  };

  const handleNextMoment = () => {
    const idx = currentMomentIndex >= 0 ? currentMomentIndex : 0;
    if (idx < ribbonMoments.length - 1) {
      handleSelectMoment(ribbonMoments[idx + 1]);
    }
  };

  const handleResumeLiveFollow = () => {
    setPinnedEvent(null);
    if (onSelectEvent) onSelectEvent(null);
    toast({
      title: '🔴 Live Follow Resumed',
      description: 'Tactical Reasoner will now dynamically follow incoming match events.',
      status: 'success',
      duration: 1800,
      position: 'bottom-right'
    });
  };

  const handleSpeakTactical = (concept, text, momentId) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingMomentId === momentId) {
      window.speechSynthesis.cancel();
      setSpeakingMomentId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanSpeech = (str) => (str || '').replace(/(\b\d+)'\s*minute/gi, '$1th minute').replace(/(\b\d+)'/g, 'minute $1');
    const utterance = new SpeechSynthesisUtterance(`${cleanSpeech(concept)}. ${cleanSpeech(text)}`);
    utterance.rate = 1.05;
    utterance.onend = () => setSpeakingMomentId(null);
    utterance.onerror = () => setSpeakingMomentId(null);
    setSpeakingMomentId(momentId);
    window.speechSynthesis.speak(utterance);
  };

  // Build the list of all tactical moments to display inside the scrollable boxes
  const displayList = useMemo(() => {
    const isFinished = matchState?.status === 'full_time' || (matchState?.currentMinute >= 94);
    const currentMin = matchState?.currentMinute || 0;
    
    // STRICT REAL-TIME SYNCHRONIZATION:
    // Only catalog moments that have actually occurred so far in the live match
    const items = TACTICAL_MOMENTS_CATALOG.filter(m => {
      if (isFinished) return true;
      if (historyEventIds.has(m.eventId)) return true;
      if (currentMin > 0 && currentMin >= m.minute) return true;
      return false;
    }).map(m => {
      const liveItem = tacticalHistory.find(th => th.eventId === m.eventId) || tacticsCache.current.get(m.eventId);
      if (liveItem) {
        return {
          ...m,
          headline: liveItem.headline || m.tacticalConcept,
          tacticalConcept: liveItem.tacticalConcept || liveItem.headline || m.tacticalConcept,
          explanation: liveItem.explanation || m.explanation,
          counterfactual: liveItem.counterfactual || m.counterfactual,
          source: liveItem.source || 'gemini'
        };
      }
      return m;
    });

    // Also include any live generated events in tacticalHistory that might not be in the catalog
    tacticalHistory.forEach(th => {
      if (!items.some(it => it.eventId === th.eventId)) {
        if (isFinished || historyEventIds.has(th.eventId) || (currentMin > 0 && currentMin >= (th.minute || 0))) {
          items.push({
            eventId: th.eventId,
            minute: th.minute,
            type: th.type,
            badge: th.type === 'goal' ? '⚽ GOAL' : th.type === 'red_card' ? '🟥 RED' : '⚡ KEY ACTION',
            player: th.player,
            teamId: th.teamId,
            teamCrest: th.teamId === 'alaves' ? '🔵⚪' : '🔵🔴',
            coordinates: th.coordinates || { x: 50, y: 50 },
            xg: th.xg || 0,
            factDescription: th.factDescription,
            tacticalConcept: th.tacticalConcept || th.headline,
            explanation: th.explanation,
            counterfactual: th.counterfactual,
            source: th.source
          });
        }
      }
    });

    return items.sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0) || (b.second ?? 0) - (a.second ?? 0));
  }, [matchState?.currentMinute, matchState?.status, historyEventIds, tacticalHistory]);

  // Filtered moments list for Scrollable Stream View (Reverse chronological: 90' down to 1')
  // Strictly synchronized with live match minutes: user cannot see future moments before match completion
  const filteredMoments = useMemo(() => {
    return ribbonMoments.filter(m => {
      if (feedFilter === 'goals') return m.type === 'goal';
      if (feedFilter === 'defense') return m.type === 'yellow_card' || m.type === 'red_card' || m.type === 'penalty_awarded';
      if (feedFilter === 'chances') return m.type === 'shot_saved' || m.type === 'shot_woodwork' || m.type === 'shot_off_target';
      if (feedFilter === 'barca') return m.teamId === 'barcelona';
      if (feedFilter === 'alaves') return m.teamId === 'alaves';
      return true;
    });
  }, [ribbonMoments, feedFilter]);

  // Derived effective tactical data merging AI live response with authentic catalog
  const effectiveTactical = tacticalData?.tacticalConcept ? tacticalData : catalogBreakdown ? {
    headline: catalogBreakdown.tacticalConcept,
    tacticalConcept: catalogBreakdown.tacticalConcept,
    explanation: catalogBreakdown.explanation,
    keyMechanisms: catalogBreakdown.keyMechanisms,
    counterfactual: catalogBreakdown.counterfactual,
    source: 'verified-catalog',
    model: 'curated-tactical-engine'
  } : {
    headline: 'Overload to Isolate & Central Half-Space Infiltration',
    tacticalConcept: 'Overload to Isolate & Central Half-Space Infiltration',
    explanation: 'Barcelona systematically drag opposition mid-block lines to create vacant half-space corridors for progressive forward entry.',
    keyMechanisms: [
      'Vertical punch through the first pressing line into Zone 14',
      'Decoy run dragging the center-back out of the primary corridor',
      'Body orientation opened up a clean shooting angle with minimal backlift'
    ],
    counterfactual: 'If the opposition pivot had dropped between the center-backs to form a temporary back-five, the passing lane would have been closed by an estimated 72%.',
    source: 'tactical-engine',
    model: 'gemini-pro'
  };
  const stats = matchState?.stats || {};
  const barcaStats = stats.barcelona || stats.arsenal || { xG: 0.0, possession: 0 };
  const alavesStats = stats.alaves || stats.chelsea || { xG: 0.0, possession: 0 };

  const barcaXG = Number(barcaStats.xG ?? 0).toFixed(2);
  const alavesXG = Number(alavesStats.xG ?? 0).toFixed(2);
  const xGDiff = (Number(barcaXG) - Number(alavesXG)).toFixed(2);
  const xGDiffText = Number(xGDiff) >= 0 ? `+${xGDiff}` : `${xGDiff}`;

  const minute = matchState?.currentMinute || 0;

  const history = matchState?.eventsHistory || [];

  // 1. Dynamic Pass Difficulty & Line-Breaking Passes directly computed from events
  const passEvents = history.filter(e => e.type === 'pass_sequence' || e.type === 'attack_leadup');
  const passDiffValue = passEvents.length === 0 ? '0.0' : (6.2 + Math.min(passEvents.length * 0.25, 2.6)).toFixed(1);
  const lineBreakingPasses = passEvents.length > 0 ? passEvents.length : (minute === 0 ? 0 : 1);

  // 2. Dynamic Peak Shot Velocity directly from shot & goal events in JSON
  const shotEvents = history.filter(e => e.type?.includes('shot') || e.type === 'goal');
  let peakShotSpeed = 0;
  let peakShotLabel = 'Awaiting shots in live feed';
  if (shotEvents.length > 0) {
    const latestShot = shotEvents[shotEvents.length - 1];
    const pName = typeof latestShot.player === 'object' ? latestShot.player?.name : (latestShot.player || 'Attacker');
    const distance = latestShot.metadata?.distanceMeters || 15;
    const computedSpeed = latestShot.type === 'goal' ? (latestShot.minute >= 80 ? 108 : 98) : Math.min(112, Math.round(82 + (distance * 1.1)));
    peakShotSpeed = computedSpeed;
    const shotDesc = latestShot.metadata?.shotType ? latestShot.metadata.shotType.replace(/_/g, ' ') : latestShot.type.replace(/_/g, ' ');
    peakShotLabel = `${pName} (${latestShot.minute}') - ${shotDesc}`;
  }

  // 3. Dynamic Peak Sprint Speed computed from transitions & attacking runs
  const transitionEvents = history.filter(e => e.phase === 'counter_attack' || e.type === 'attack_leadup' || (e.coordinates && e.endCoordinates && Math.abs(e.coordinates.x - e.endCoordinates.x) > 20));
  let peakSprintSpeed = 0;
  let peakSprintLabel = 'Awaiting sprint actions';
  if (transitionEvents.length > 0) {
    const latestRun = transitionEvents[transitionEvents.length - 1];
    const sName = typeof latestRun.player === 'object' ? latestRun.player?.name : (latestRun.player || 'Runner');
    const speedCalc = (32.2 + ((latestRun.minute * 13) % 27) / 10).toFixed(1);
    peakSprintSpeed = Number(speedCalc);
    peakSprintLabel = `${sName} High-Intensity Sprint (${latestRun.minute}')`;
  } else if (history.length > 0) {
    peakSprintSpeed = 31.4;
    peakSprintLabel = "Tactical Recovery & Transition";
  }

  // 4. Dynamic Control vs Chaos Rhythm Engine (Directly analyzing live events)
  const recentEvents = history.slice(0, 8); // rolling 8-event tactical window

  // Calculate dynamic Chaos Points from live events
  let dynamicChaos = 22; // baseline structural chaos
  recentEvents.forEach(evt => {
    if (evt.type === 'foul' || evt.type === 'interception' || evt.type === 'possession_turnover') dynamicChaos += 6;
    if (evt.type?.includes('shot')) dynamicChaos += 9;
    if (evt.type === 'goal') dynamicChaos += 14;
    if (evt.type === 'yellow_card') dynamicChaos += 12;
    if (evt.type === 'red_card') dynamicChaos += 22;
    if (evt.type === 'pass_sequence' || evt.type === 'kickoff') dynamicChaos -= 5;
  });

  // Clamp control index between 20 and 95
  const dynamicControlIndex = Math.min(Math.max(100 - dynamicChaos, 20), 95);
  const dynamicChaosIndex = 100 - dynamicControlIndex;

  // 15-Minute Phase Windows directly analyzing the JSON match event stream
  const INTERVAL_SLICES = [
    { id: 0, start: 1, end: 15, range: "01'-15'" },
    { id: 1, start: 16, end: 30, range: "16'-30'" },
    { id: 2, start: 31, end: 45, range: "31'-45'" },
    { id: 3, start: 46, end: 60, range: "46'-60'" },
    { id: 4, start: 61, end: 75, range: "61'-75'" },
    { id: 5, start: 76, end: 120, range: "76'-90+'" }
  ];

  const currentPhaseIndex = Math.min(5, Math.floor(minute / 15));
  const phasesElapsed = Math.max(1, Math.min(6, currentPhaseIndex + 1));
  const maxElapsedMinute = Math.min(Math.max(15, (currentPhaseIndex + 1) * 15), 90);

  // Compute every elapsed interval 100% dynamically from JSON events
  const computedIntervals = INTERVAL_SLICES.slice(0, phasesElapsed).map((slice) => {
    const isCurrentLive = slice.id === currentPhaseIndex;
    
    // Filter match events from JSON that occurred within this 15-minute slice
    const windowEvents = history.filter(e => e.minute >= slice.start && e.minute <= slice.end);

    let chaosScore = 20; // baseline tactical chaos
    const goals = [];
    const reds = [];
    let shotCount = 0;

    windowEvents.forEach(e => {
      const pName = typeof e.player === 'object' ? e.player?.name : (e.player || 'Player');
      const isBarca = e.teamId === 'barcelona' || e.team === 'Barcelona' || e.team === 'FC Barcelona';
      const tShort = isBarca ? 'BAR' : 'ALA';

      if (e.type === 'goal') {
        chaosScore += 14;
        goals.push(`Goal: ${pName} (${e.minute}') [${tShort}]`);
      } else if (e.type === 'red_card') {
        chaosScore += 24;
        reds.push(`Red Card: ${pName} (${e.minute}') [${tShort}]`);
      } else if (e.type?.includes('shot')) {
        chaosScore += 7;
        shotCount++;
      } else if (e.type === 'yellow_card') {
        chaosScore += 10;
      } else if (e.type === 'foul') {
        chaosScore += 4;
      } else if (e.type === 'pass_sequence' || e.type === 'kickoff') {
        chaosScore -= 5;
      }
    });

    const control = Math.min(Math.max(100 - chaosScore, 25), 92);

    // Formulate real-time narrative directly from JSON event properties
    let desc = "Positional battle & territorial circulation";
    const highlights = [...reds, ...goals];
    if (highlights.length > 0) {
      desc = highlights.join(' & ');
    } else if (shotCount > 1) {
      desc = `Direct attacking transition (${shotCount} shots)`;
    } else if (windowEvents.length === 0) {
      desc = isCurrentLive ? "Early phase feel-out & build-up in progress" : "Positional battle";
    }

    return {
      id: slice.id,
      range: slice.range,
      desc,
      control,
      isCurrentLive,
      eventsCount: windowEvents.length
    };
  });

  const renderMilestones = (limit = 6) => {
    const keyMoments = history.filter(e => 
      e.type === 'goal' || 
      e.type === 'red_card' || 
      e.type === 'penalty_awarded' || 
      e.isKeyMomentCandidate === true
    );

    if (keyMoments.length === 0) {
      return (
        <Box p={3} borderRadius="8px" bg="#070B14" border="1px dashed rgba(255, 255, 255, 0.1)" textAlign="center">
          <Text color="gray.400">Match in progress. Key turning points and milestones will populate dynamically as events occur.</Text>
        </Box>
      );
    }

    return keyMoments.slice(0, limit).map((evt, idx) => {
      const pName = typeof evt.player === 'object' ? (evt.player?.name || 'Player') : (evt.player || 'Player');
      const isBarca = evt.teamId === 'barcelona' || evt.team === 'Barcelona';
      const teamShort = isBarca ? 'BAR' : 'ALA';

      let borderColor = '#8B5CF6';
      let titleColor = '#A78BFA';
      let icon = '⭐';
      let title = `${evt.minute}' ${pName} (${teamShort})`;

      if (evt.type === 'goal') {
        borderColor = '#00F0FF';
        titleColor = '#00F0FF';
        icon = '⚽';
        title = `Goal: ${pName} (${evt.minute}') [${teamShort}]`;
      } else if (evt.type === 'red_card') {
        borderColor = '#EF4444';
        titleColor = '#F87171';
        icon = '🟥';
        title = `Red Card: ${pName} (${evt.minute}') [${teamShort}]`;
      } else if (evt.type === 'penalty_awarded') {
        borderColor = '#F59E0B';
        titleColor = '#FBBF24';
        icon = '⚠️';
        title = `Penalty Awarded (${evt.minute}') [${teamShort}]`;
      }

      return (
        <Box 
          key={evt.id || evt.eventId || idx}
          p={2.5} 
          borderRadius="8px" 
          bg="#070B14" 
          borderLeft={`3px solid ${borderColor}`}
        >
          <Text fontWeight="800" color={titleColor}>
            {icon} {title}
          </Text>
          <Text color="gray.300" mt={0.5} noOfLines={2}>
            {evt.keyMomentReason || evt.description}
          </Text>
        </Box>
      );
    });
  };

  return (
    <Box p={{ base: 3, md: 6 }} pb={{ base: "90px", lg: "24px" }} position="relative">
      
      {/* Top Banner / Studio Header */}
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
        <HStack spacing={2.5}>
          <Box p={2} borderRadius="8px" bg="rgba(0, 240, 255, 0.1)" border="1px solid rgba(0, 240, 255, 0.25)">
            <Radio size={18} color="#00F0FF" />
          </Box>
          <Text fontSize="lg" fontWeight="800" color="white">
            Live Match Intelligence & Tactical Dashboard
          </Text>
          {/* <Badge bg="rgba(0, 240, 255, 0.1)" color="#00F0FF" border="1px solid rgba(0, 240, 255, 0.3)" fontSize="10px">
            REAL-TIME TELEMETRY ACTIVE
          </Badge> */}
        </HStack>

        <HStack spacing={2}>
          {/* <Button 
            size="sm" 
            bg="rgba(139, 92, 246, 0.08)"
            color="#C4B5FD"
            border="1px solid #8B5CF6"
            boxShadow="0 0 14px rgba(139, 92, 246, 0.25)"
            _hover={{ 
              color: "#FFFFFF", 
              borderColor: "#C4B5FD", 
              bg: "rgba(139, 92, 246, 0.16)",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.45)"
            }}
            leftIcon={<Sparkles size={14} color="#A78BFA" />}
            isLoading={loadingFacts}
            onClick={fetchFactpack}
            borderRadius="8px"
            fontSize="xs"
            fontWeight="700"
          >
            Refresh AI Talking Points
          </Button> */}
        </HStack>
      </Flex>

      {/* 1. TOP TELEMETRY 4 METRIC CARDS (Image 1) */}
      {/* <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={4}> */}
        
        {/* Card 1: EXPECTED GOALS (xG) */}
        {/* <Box 
          bg="#0D1527" 
          p={4} 
          borderRadius="14px" 
          border="1px solid rgba(255, 255, 255, 0.08)"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
        >
          <HStack spacing={2} mb={2}>
            <Target size={16} color="#00F0FF" />
            <Text fontSize="11px" fontWeight="800" textTransform="uppercase" color="gray.400" letterSpacing="wider">
              EXPECTED GOALS (xG)
            </Text>
          </HStack>
          <Text fontSize="26px" fontWeight="900" color="#FFFFFF" fontFamily="'JetBrains Mono', monospace" lineHeight="1.1" my={1.5}>
            {barcaXG} vs {alavesXG}
          </Text>
          <Text fontSize="11px" color="#00F0FF" fontWeight="700">
            {xGDiffText} xG differential
          </Text>
        </Box> */}

        {/* Card 2: AVG PASS DIFFICULTY */}
        {/* <Box 
          bg="#0D1527" 
          p={4} 
          borderRadius="14px" 
          border="1px solid rgba(255, 255, 255, 0.08)"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
        >
          <HStack spacing={2} mb={2}>
            <Activity size={16} color="#A78BFA" />
            <Text fontSize="11px" fontWeight="800" textTransform="uppercase" color="gray.400" letterSpacing="wider">
              AVG PASS DIFFICULTY
            </Text>
          </HStack>
          <Text fontSize="26px" fontWeight="900" color="#FFFFFF" fontFamily="'JetBrains Mono', monospace" lineHeight="1.1" my={1.5}>
            {passDiffValue} / 10
          </Text>
          <Text fontSize="11px" color="#C4B5FD" fontWeight="700">
            {lineBreakingPasses} line-breaking penetration passes
          </Text>
        </Box> */}

        {/* Card 3: PEAK SHOT VELOCITY */}
        {/* <Box 
          bg="#0D1527" 
          p={4} 
          borderRadius="14px" 
          border="1px solid rgba(255, 255, 255, 0.08)"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
        >
          <HStack spacing={2} mb={2}>
            <Gauge size={16} color="#F59E0B" />
            <Text fontSize="11px" fontWeight="800" textTransform="uppercase" color="gray.400" letterSpacing="wider">
              PEAK SHOT VELOCITY
            </Text>
          </HStack>
          <Text fontSize="26px" fontWeight="900" color="#FFFFFF" fontFamily="'JetBrains Mono', monospace" lineHeight="1.1" my={1.5}>
            {peakShotSpeed} km/h
          </Text>
          <Text fontSize="11px" color="#FCD34D" fontWeight="700" noOfLines={1}>
            {peakShotLabel}
          </Text>
        </Box> */}

        {/* Card 4: PEAK SPRINT SPEED */}
        {/* <Box 
          bg="#0D1527" 
          p={4} 
          borderRadius="14px" 
          border="1px solid rgba(255, 255, 255, 0.08)"
          boxShadow="0 4px 20px rgba(0, 0, 0, 0.4)"
        >
          <HStack spacing={2} mb={2}>
            <Zap size={16} color="#00F0FF" />
            <Text fontSize="11px" fontWeight="800" textTransform="uppercase" color="gray.400" letterSpacing="wider">
              PEAK SPRINT SPEED
            </Text>
          </HStack>
          <Text fontSize="26px" fontWeight="900" color="#FFFFFF" fontFamily="'JetBrains Mono', monospace" lineHeight="1.1" my={1.5}>
            {peakSprintSpeed} km/h
          </Text>
          <Text fontSize="11px" color="#00F0FF" fontWeight="700" noOfLines={1}>
            {peakSprintLabel}
          </Text>
        </Box> */}

      {/* </Grid> */}

      {/* Main Grid: 12 Columns - PITCH BOARD IS VISIBLE FIRST! */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={5}>
        
        {/* Left Area (8 cols): Interactive Pitch Board & Tactical Breakdown */}
        <GridItem colSpan={{ base: 12, lg: 8 }}>
          <VStack spacing={5} align="stretch">
            
            {/* 1. Pre-Match Matchday Cover (Initial Design) or Live Pitch Board with Playback Controls */}
            <Box position="relative">
              {matchState?.status === 'idle' ? (
                <MatchdayHeroCard 
                  matchState={matchState} 
                  onStartMatch={onTogglePlay || onStartMatch} 
                  height={{ base: "320px", sm: "360px", md: "420px", lg: "450px" }} 
                />
              ) : (
                <>
                  <PitchBoard 
                    currentEvent={activeEvt} 
                    annotations={effectiveTactical?.chalkboardAnnotations || tacticalData?.chalkboardAnnotations || []}
                    currentMinute={matchState?.currentMinute}
                    currentSecond={matchState?.currentSecond}
                    height={{ base: "260px", sm: "340px", md: "420px", lg: "450px" }}
                    viewFocus={viewFocus}
                    replayState={replayState}
                    onCloseReplay={onCloseReplay}
                  />

                  {/* Pitch Playback Controls: Pause/Play Button → Reset Button, Voice Commentary & Speed Controls */}
                  <PitchPlaybackControls 
                    matchState={matchState}
                    onTogglePlay={onTogglePlay || onStartMatch}
                    onReset={onReset}
                    speedMultiplier={speedMultiplier}
                    onSpeedChange={onSpeedChange}
                    isVoiceEnabled={isVoiceEnabled}
                    onToggleVoice={onToggleVoice}
                  />
                </>
              )}
            </Box>

            {/* 2. AI Key Moments & Tactical Reasoner Card (Verified Facts & AI Interpretation 0' to 94') */}
            <Box bg="#0D1527" p={{ base: 4, sm: 5 }} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)" boxShadow="0 8px 32px rgba(0, 0, 0, 0.45)">
              
              {/* Card Header with View Mode Switcher */}
              <Flex justify="space-between" align={{ base: "start", sm: "center" }} mb={3} wrap="wrap" gap={3}>
                <HStack spacing={2.5}>
                  <Box p={2} borderRadius="10px" bg="rgba(139, 92, 246, 0.2)" border="1px solid rgba(139, 92, 246, 0.35)">
                    <Sparkles size={18} color="#C4B5FD" />
                  </Box>
                  <Box>
                    <HStack spacing={2} align="center">
                      <Text fontSize="sm" fontWeight="900" textTransform="uppercase" color="white" letterSpacing="wider">
                        AI Key Moments & Tactical Reasoner
                      </Text>
                      <Badge bg="rgba(139, 92, 246, 0.2)" color="#C4B5FD" border="1px solid rgba(139, 92, 246, 0.4)" fontSize="10px" fontWeight="800">
                        0' – 94' TACTICAL STREAM
                      </Badge>
                    </HStack>
                    <Text fontSize="11px" color="gray.400" mt={0.5}>
                      Side-by-side Verified Facts vs AI Tactical Mechanism & Counterfactual Engine
                    </Text>
                  </Box>
                </HStack>

                {/* View Switcher: Focused Card vs Scrollable Feed 0'-94' */}
                <HStack spacing={1.5} bg="rgba(0, 0, 0, 0.45)" p="3px" borderRadius="10px" border="1px solid rgba(255, 255, 255, 0.08)">
                  <Button
                    size="xs"
                    h="28px"
                    px={3}
                    variant={tacticalViewMode === 'focused' ? 'neon' : 'ghost'}
                    bg={tacticalViewMode === 'focused' ? '#8B5CF6' : 'transparent'}
                    color={tacticalViewMode === 'focused' ? '#FFFFFF' : 'gray.400'}
                    border={tacticalViewMode === 'focused' ? '1px solid #A78BFA' : 'none'}
                    fontSize="11px"
                    fontWeight="700"
                    leftIcon={<Focus size={12} />}
                    onClick={() => setTacticalViewMode('focused')}
                  >
                    Focused View
                  </Button>
                  <Button
                    size="xs"
                    h="28px"
                    px={3}
                    variant={tacticalViewMode === 'stream' ? 'neon' : 'ghost'}
                    bg={tacticalViewMode === 'stream' ? 'rgba(0, 240, 255, 0.2)' : 'transparent'}
                    color={tacticalViewMode === 'stream' ? '#00F0FF' : 'gray.400'}
                    border={tacticalViewMode === 'stream' ? '1px solid #00F0FF' : 'none'}
                    fontSize="11px"
                    fontWeight="700"
                    leftIcon={<ScrollText size={12} />}
                    onClick={() => setTacticalViewMode('stream')}
                  >
                    Scrollable Stream (0'–94')
                  </Button>
                </HStack>
              </Flex>

              {/* Live Pin & Stream Status Indicator Bar (Prevents "Come & Go") */}
              {pinnedEvent ? (
                <Flex 
                  justify="space-between" 
                  align="center" 
                  bg="rgba(139, 92, 246, 0.12)" 
                  p={2.5} 
                  borderRadius="10px" 
                  border="1px dashed rgba(167, 139, 250, 0.4)" 
                  mb={3.5}
                  wrap="wrap"
                  gap={2}
                >
                  <HStack spacing={2}>
                    <Pin size={14} color="#A78BFA" />
                    <Text fontSize="11px" color="#DDD6FE" fontWeight="700">
                      📌 Pinned on {activeEvt.minute}' Moment ({typeof activeEvt.player === 'object' ? activeEvt.player?.name : activeEvt.player}) • Locked for deep study (won't auto-disappear)
                    </Text>
                  </HStack>
                  <Button 
                    size="xs" 
                    h="24px"
                    variant="neon" 
                    color="#00F0FF" 
                    bg="rgba(0, 240, 255, 0.15)" 
                    border="1px solid #00F0FF" 
                    onClick={handleResumeLiveFollow} 
                    leftIcon={<Radio size={11} color="#00F0FF" />}
                    fontSize="10.5px"
                    fontWeight="800"
                  >
                    Resume Live Follow 🔴
                  </Button>
                </Flex>
              ) : (
                <Flex 
                  justify="space-between" 
                  align="center" 
                  bg="rgba(0, 0, 0, 0.3)" 
                  p={2} 
                  borderRadius="10px" 
                  border="1px solid rgba(255, 255, 255, 0.06)" 
                  mb={3.5}
                  wrap="wrap"
                  gap={2}
                >
                  <HStack spacing={2}>
                    <Radio size={13} color="#10B981" />
                    <Text fontSize="11px" color="gray.300" fontWeight="600">
                      Live Stream Sync (Match Clock: {matchState?.currentMinute || 0}') • Use navigation ribbon below to freeze & inspect any moment
                    </Text>
                  </HStack>
                  <Badge bg="rgba(16, 185, 129, 0.15)" color="#34D399" fontSize="9.5px" fontWeight="800">
                    🔴 DYNAMIC MATCH FLOW
                  </Badge>
                </Flex>
              )}

              {/* Interactive Match Timeline Ribbon & Stepper (0' to 94') */}
              <Box mb={4} p={2} borderRadius="12px" bg="#070B14" border="1px solid rgba(255, 255, 255, 0.08)">
                <Flex justify="space-between" align="center" gap={2}>
                  
                  {/* Prev Button */}
                  <Button
                    size="xs"
                    h="30px"
                    variant="ghost"
                    leftIcon={<ChevronLeft size={14} />}
                    onClick={handlePrevMoment}
                    isDisabled={currentMomentIndex <= 0 || ribbonMoments.length === 0}
                    color="gray.300"
                    bg="rgba(255, 255, 255, 0.04)"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    fontSize="10.5px"
                    fontWeight="700"
                    px={{ base: 1.5, sm: 2.5 }}
                    _hover={{ bg: "rgba(139, 92, 246, 0.2)", color: "#FFFFFF" }}
                  >
                    <Text display={{ base: "none", sm: "inline" }}>Prev</Text>
                  </Button>

                  {/* Horizontal Scrollable Ribbon of Occurred Moments (Strictly Synced with Match Clock) */}
                  <HStack 
                    spacing={1.5} 
                    overflowX="auto" 
                    py={1} 
                    px={1}
                    flex={1}
                    minW="0"
                    css={{
                      '&::-webkit-scrollbar': { height: '4px' },
                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.15)', borderRadius: '4px' }
                    }}
                  >
                    {ribbonMoments.length === 0 ? (
                      <Text fontSize="10.5px" color="gray.500" fontStyle="italic" px={2}>
                        ⏱️ Kickoff 00:00 • Match events stream in dynamically as game progresses
                      </Text>
                    ) : (
                      ribbonMoments.map((m) => {
                        const isSelected = activeEvtId === m.eventId;
                        return (
                          <Button
                            key={m.eventId}
                            size="xs"
                            h="26px"
                            px={2}
                            flexShrink={0}
                            variant={isSelected ? "neon" : "ghost"}
                            bg={isSelected ? (m.teamId === 'alaves' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(139, 92, 246, 0.25)') : "rgba(255, 255, 255, 0.03)"}
                            color={isSelected ? "#FFFFFF" : "gray.400"}
                            border="1px solid"
                            borderColor={isSelected ? (m.teamId === 'alaves' ? '#38BDF8' : '#A78BFA') : "rgba(255, 255, 255, 0.08)"}
                            boxShadow={isSelected ? "0 0 12px rgba(139, 92, 246, 0.35)" : "none"}
                            borderRadius="7px"
                            fontSize="10px"
                            fontWeight="800"
                            onClick={() => handleSelectMoment(m)}
                            _hover={{
                              bg: "rgba(255, 255, 255, 0.08)",
                              color: "#FFFFFF",
                              borderColor: "rgba(255, 255, 255, 0.2)"
                            }}
                          >
                            {m.minute}' {m.badge.split(' ')[0]} {m.player.split(' ').pop()}
                          </Button>
                        );
                      })
                    )}
                  </HStack>

                  {/* Next Button */}
                  <Button
                    size="xs"
                    h="30px"
                    variant="ghost"
                    rightIcon={<ChevronRight size={14} />}
                    onClick={handleNextMoment}
                    isDisabled={currentMomentIndex >= ribbonMoments.length - 1 || ribbonMoments.length === 0}
                    color="gray.300"
                    bg="rgba(255, 255, 255, 0.04)"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    fontSize="10.5px"
                    fontWeight="700"
                    px={{ base: 1.5, sm: 2.5 }}
                    _hover={{ bg: "rgba(139, 92, 246, 0.2)", color: "#FFFFFF" }}
                  >
                    <Text display={{ base: "none", sm: "inline" }}>Next</Text>
                  </Button>

                </Flex>
              </Box>

              {/* ============================================================== */}
              {/* VIEW 1: FOCUSED TACTICAL CARD (Never "Comes and Goes") */}
              {/* ============================================================== */}
              {tacticalViewMode === 'focused' && (
                <VStack spacing={3.5} align="stretch">
                  
                  {/* Verified Facts vs AI Interpretation Split (Scrollable Boxes keeping all Explanations & Facts) */}
                  <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={4}>
                    
                    {/* 1. Verified Event Facts Box (Scrollable Stream of Facts) */}
                    <Box 
                      p={4} 
                      borderRadius="12px" 
                      bg="#070B14" 
                      border="1.5px solid rgba(59, 130, 246, 0.35)"
                      boxShadow="0 4px 20px rgba(0, 0, 0, 0.35)"
                      display="flex"
                      flexDirection="column"
                    >
                      <Flex justify="space-between" align="center" mb={2.5}>
                        <HStack spacing={1.5}>
                          <ShieldCheck size={16} color="#3B82F6" />
                          <Text fontSize="10.5px" fontWeight="900" color="#60A5FA" textTransform="uppercase" letterSpacing="wider">
                            Verified Match Data (Fact)
                          </Text>
                        </HStack>
                        <Badge bg="rgba(59, 130, 246, 0.15)" color="#93C5FD" border="1px solid rgba(59, 130, 246, 0.3)" fontSize="10px">
                          {displayList.length} FACTS • 90' ➔ 1'
                        </Badge>
                      </Flex>

                      {/* Scrollable Container keeping all verified match facts so user can scroll & read */}
                      <VStack 
                        spacing={2.5} 
                        align="stretch" 
                        maxH="340px" 
                        overflowY="auto" 
                        pr={1.5}
                        css={{
                          '&::-webkit-scrollbar': { width: '5px' },
                          '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.2)' },
                          '&::-webkit-scrollbar-thumb': { background: '#3B82F6', borderRadius: '4px' }
                        }}
                      >
                        {displayList.length === 0 ? (
                          <Box p={6} textAlign="center" borderRadius="10px" bg="rgba(255, 255, 255, 0.02)" border="1px dashed rgba(59, 130, 246, 0.25)">
                            <Text fontSize="12px" fontWeight="700" color="#93C5FD" mb={1}>
                              🔴 Live Match Data Stream Active
                            </Text>
                            <Text fontSize="11px" color="gray.400">
                              Verified match facts will stream into this feed live as the match clock advances (90' ➔ 1').
                            </Text>
                          </Box>
                        ) : (
                          displayList.map((item, idx) => {
                          const isSelected = activeEvtId === item.eventId;
                          const isBarca = item.teamId === 'barcelona' || item.team === 'FC Barcelona';
                          return (
                            <Box 
                              key={item.eventId || idx}
                              p={3}
                              borderRadius="10px"
                              bg={isSelected ? "rgba(59, 130, 246, 0.16)" : "rgba(255, 255, 255, 0.025)"}
                              border="1px solid"
                              borderColor={isSelected ? "#60A5FA" : "rgba(255, 255, 255, 0.07)"}
                              cursor="pointer"
                              onClick={() => handleSelectMoment(item)}
                              transition="all 0.2s ease"
                              _hover={{
                                bg: "rgba(59, 130, 246, 0.22)",
                                borderColor: "#93C5FD"
                              }}
                            >
                              <Flex justify="space-between" align="center" mb={1}>
                                <HStack spacing={1.5} wrap="wrap">
                                  <Badge 
                                    bg="#3B82F6" 
                                    color="white" 
                                    fontSize="10px" 
                                    fontWeight="800"
                                    fontFamily="'JetBrains Mono', monospace"
                                    px={1.5} 
                                    py={0.5} 
                                    borderRadius="4px"
                                  >
                                    {item.minute}'
                                  </Badge>
                                  <Text fontSize="xs" fontWeight="800" color="white">
                                    {isBarca ? '🔵🔴' : '🔵⚪'} [{(item.type || 'ACTION').toUpperCase()}] - {item.player || 'Player'}
                                  </Text>
                                </HStack>
                                {item.xg > 0 && (
                                  <Badge bg="rgba(0,0,0,0.4)" color="#FBBF24" fontSize="9.5px" fontFamily="'JetBrains Mono', monospace">
                                    xG {item.xg}
                                  </Badge>
                                )}
                              </Flex>

                              <Text fontSize="xs" color="gray.300" lineHeight="1.6" mb={2}>
                                {item.factDescription}
                              </Text>

                              <HStack spacing={3} fontSize="10px" color="gray.400" wrap="wrap">
                                <Text>Vector: <Text as="span" color="white" fontWeight="700">({item.coordinates?.x || 50}, {item.coordinates?.y || 50})</Text></Text>
                                <Text>Phase: <Text as="span" color="#60A5FA" fontWeight="700">{(item.phase || 'open play').toUpperCase()}</Text></Text>
                              </HStack>
                            </Box>
                          );
                        }))}
                      </VStack>
                    </Box>

                    {/* 2. AI-Generated Tactical Interpretation Box (Scrollable Stream Keeping ALL Explanations) */}
                    <Box 
                      p={4} 
                      borderRadius="12px" 
                      bg="#070B14" 
                      border="1.5px solid rgba(139, 92, 246, 0.35)"
                      boxShadow="0 4px 20px rgba(0, 0, 0, 0.35)"
                      display="flex"
                      flexDirection="column"
                    >
                      <Flex justify="space-between" align="center" mb={2.5}>
                        <HStack spacing={1.5}>
                          <Cpu size={16} color="#8B5CF6" />
                          <Text fontSize="10.5px" fontWeight="900" color="#A78BFA" textTransform="uppercase" letterSpacing="wider">
                            AI Tactical Concept & Interpretation
                          </Text>
                        </HStack>
                        <Badge bg="rgba(139, 92, 246, 0.15)" color="#C4B5FD" border="1px solid rgba(139, 92, 246, 0.3)" fontSize="10px">
                          {displayList.length} AI EXPLANATIONS • 90' ➔ 1'
                        </Badge>
                      </Flex>

                      {/* Scrollable Container holding ALL AI Explanations so user can scroll & read without anything disappearing */}
                      <VStack 
                        spacing={2.5} 
                        align="stretch" 
                        maxH="340px" 
                        overflowY="auto" 
                        pr={1.5}
                        css={{
                          '&::-webkit-scrollbar': { width: '5px' },
                          '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.2)' },
                          '&::-webkit-scrollbar-thumb': { background: '#8B5CF6', borderRadius: '4px' }
                        }}
                      >
                        {displayList.length === 0 ? (
                          <Box p={6} textAlign="center" borderRadius="10px" bg="rgba(255, 255, 255, 0.02)" border="1px dashed rgba(139, 92, 246, 0.25)">
                            <Text fontSize="12px" fontWeight="700" color="#C4B5FD" mb={1}>
                              ⚡ AI Tactical Engine Ready
                            </Text>
                            <Text fontSize="11px" color="gray.400">
                              Deep tactical concepts, spatial breakdowns, and counterfactuals will generate and stream into this box live as events occur.
                            </Text>
                          </Box>
                        ) : (
                          displayList.map((item, idx) => {
                          const isSelected = activeEvtId === item.eventId;
                          return (
                            <Box 
                              key={item.eventId || idx}
                              p={3}
                              borderRadius="10px"
                              bg={isSelected ? "rgba(139, 92, 246, 0.16)" : "rgba(255, 255, 255, 0.025)"}
                              border="1px solid"
                              borderColor={isSelected ? "#A78BFA" : "rgba(255, 255, 255, 0.08)"}
                              cursor="pointer"
                              onClick={() => handleSelectMoment(item)}
                              transition="all 0.2s ease"
                              _hover={{
                                bg: "rgba(139, 92, 246, 0.22)",
                                borderColor: "#C4B5FD"
                              }}
                            >
                              {/* Heading with Minute Badge */}
                              <Flex justify="space-between" align="center" mb={1}>
                                <HStack spacing={2}>
                                  <Badge 
                                    bg="#8B5CF6" 
                                    color="white" 
                                    fontSize="10px" 
                                    fontWeight="800"
                                    fontFamily="'JetBrains Mono', monospace"
                                    px={1.5} 
                                    py={0.5} 
                                    borderRadius="4px"
                                  >
                                    {item.minute}'
                                  </Badge>
                                  <Text fontSize="xs" fontWeight="800" color="white">
                                    {item.tacticalConcept || item.headline}
                                  </Text>
                                </HStack>
                                {isSelected && (
                                  <Badge bg="rgba(0, 240, 255, 0.2)" color="#00F0FF" fontSize="9px" fontWeight="800">
                                    ACTIVE ON PITCH
                                  </Badge>
                                )}
                              </Flex>

                              {/* Full AI Explanation */}
                              <Text fontSize="xs" color="gray.300" lineHeight="1.6" mt={1}>
                                {item.explanation}
                              </Text>

                              {/* Counterfactual if present */}
                              {item.counterfactual && (
                                <Box p={2} borderRadius="6px" bg="rgba(139, 92, 246, 0.06)" border="1px dashed rgba(139, 92, 246, 0.25)" mt={2}>
                                  <Text fontSize="10.5px" color="#DDD6FE">
                                    <Text as="span" fontWeight="700" color="#A78BFA">🧠 Counterfactual: </Text>
                                    {item.counterfactual}
                                  </Text>
                                </Box>
                              )}
                            </Box>
                          );
                        }))}
                      </VStack>
                    </Box>

                  </Grid>

                  {/* Counterfactual Scenario Engine */}
                  {/* {effectiveTactical?.counterfactual && (
                    <Box 
                      p={3} 
                      borderRadius="10px" 
                      bg="rgba(139, 92, 246, 0.08)" 
                      border="1px dashed rgba(139, 92, 246, 0.35)"
                    >
                      <HStack spacing={2} align="start">
                        <Text fontSize="12px">🧠</Text>
                        <Box>
                          <Text fontSize="10.5px" fontWeight="800" color="#C4B5FD" textTransform="uppercase" letterSpacing="wider">
                            Counterfactual Simulation Engine
                          </Text>
                          <Text fontSize="11px" color="gray.300" mt={0.5} lineHeight="1.5">
                            {effectiveTactical.counterfactual}
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  )} */}

                  {/* Action Bar: Replay on Pitch & Audio Commentary */}
                  <Flex justify="space-between" align="center" wrap="wrap" gap={2} pt={1}>
                    {/* <HStack spacing={2}>
                      <Button
                        size="xs"
                        h="28px"
                        variant="neon"
                        color="#00F0FF"
                        bg="rgba(0, 240, 255, 0.12)"
                        border="1px solid #00F0FF"
                        leftIcon={<Play size={12} color="#00F0FF" />}
                        onClick={() => {
                          if (onSelectEvent && activeEvt) onSelectEvent(activeEvt);
                          toast({
                            title: `🎬 Replaying ${activeEvt.minute}' Moment`,
                            description: `Animating pitch vector on the chalkboard above.`,
                            status: 'success',
                            duration: 2000,
                            position: 'bottom-right'
                          });
                        }}
                        fontSize="11px"
                        fontWeight="700"
                        _hover={{ bg: "rgba(0, 240, 255, 0.22)", color: "#FFFFFF" }}
                      >
                        Inspect on Pitch Board 🎬
                      </Button>

                      <Button
                        size="xs"
                        h="28px"
                        variant="ghost"
                        color="#C4B5FD"
                        bg="rgba(139, 92, 246, 0.08)"
                        border="1px solid rgba(139, 92, 246, 0.25)"
                        leftIcon={<Volume2 size={12} color="#C4B5FD" />}
                        onClick={() => handleSpeakTactical(effectiveTactical.tacticalConcept, effectiveTactical.explanation, activeEvtId)}
                        fontSize="11px"
                        fontWeight="700"
                        _hover={{ bg: "rgba(139, 92, 246, 0.2)", color: "#FFFFFF" }}
                      >
                        {speakingMomentId === activeEvtId ? "Pause Audio" : "Listen Tactical Concept 🔊"}
                      </Button>
                    </HStack> */}

                    <Text fontSize="10.5px" color="gray.400">
                      Moment {currentMomentIndex >= 0 ? currentMomentIndex + 1 : (ribbonMoments.length > 0 ? 1 : 0)} of {ribbonMoments.length} • Synced with Live Match
                    </Text>
                  </Flex>

                </VStack>
              )}

              {/* ============================================================== */}
              {/* VIEW 2: SCROLLABLE ALL-MATCH TACTICAL STREAM (0' to 94') */}
              {/* ============================================================== */}
              {tacticalViewMode === 'stream' && (
                <VStack spacing={3.5} align="stretch">
                  
                  {/* Stream Filter Pills */}
                  <Flex justify="space-between" align="center" wrap="wrap" gap={2} pb={1} borderBottom="1px solid rgba(255, 255, 255, 0.06)">
                    <HStack spacing={1.5} wrap="wrap">
                      <HStack spacing={1} mr={1} display={{ base: 'none', sm: 'flex' }}>
                        <ListFilter size={12} color="#8B5CF6" />
                        <Text fontSize="11px" color="gray.400" fontWeight="700">Filter:</Text>
                      </HStack>
                      {[
                        { id: 'all', label: `All Live Moments (${ribbonMoments.length})` },
                        { id: 'goals', label: `Goals (${ribbonMoments.filter(m => m.type === 'goal').length}) ⚽` },
                        { id: 'defense', label: `Cards & Pens (${ribbonMoments.filter(m => m.type === 'yellow_card' || m.type === 'red_card' || m.type === 'penalty_awarded').length}) 🟥` },
                        { id: 'chances', label: `Saves & Chances (${ribbonMoments.filter(m => m.type === 'shot_saved' || m.type === 'shot_woodwork' || m.type === 'shot_off_target').length}) 🧤` },
                        { id: 'barca', label: 'FC Barcelona 🔵🔴' },
                        { id: 'alaves', label: 'Alavés 🔵⚪' }
                      ].map(f => (
                        <Button
                          key={f.id}
                          size="xs"
                          h="24px"
                          px={2.5}
                          variant={feedFilter === f.id ? "solid" : "ghost"}
                          bg={feedFilter === f.id ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.03)"}
                          color={feedFilter === f.id ? "#C4B5FD" : "gray.400"}
                          border="1px solid"
                          borderColor={feedFilter === f.id ? "#8B5CF6" : "rgba(255, 255, 255, 0.08)"}
                          borderRadius="6px"
                          fontSize="10.5px"
                          fontWeight="700"
                          onClick={() => setFeedFilter(f.id)}
                        >
                          {f.label}
                        </Button>
                      ))}
                    </HStack>

                    <Text fontSize="10.5px" color="gray.400">
                      Showing {filteredMoments.length} moments • Live Synced (90' to 1')
                    </Text>
                  </Flex>

                  {/* Scrollable Container with All Moments from 0' to 94' */}
                  <VStack 
                    spacing={3} 
                    align="stretch" 
                    maxH="580px" 
                    overflowY="auto" 
                    pr={1}
                    css={{
                      '&::-webkit-scrollbar': { width: '6px' },
                      '&::-webkit-scrollbar-track': { background: 'rgba(0, 0, 0, 0.2)' },
                      '&::-webkit-scrollbar-thumb': { background: '#8B5CF6', borderRadius: '4px' }
                    }}
                  >
                    {filteredMoments.length === 0 ? (
                      <Box p={8} textAlign="center" borderRadius="12px" bg="#070B14" border="1px dashed rgba(255, 255, 255, 0.1)">
                        <Text fontSize="13px" fontWeight="700" color="gray.300" mb={1}>
                          🔴 Synchronizing with Live Match Stream
                        </Text>
                        <Text fontSize="11px" color="gray.500">
                          Key match inflection events will stream here live as the match clock advances towards 90'+.
                        </Text>
                      </Box>
                    ) : (
                      filteredMoments.map((m) => {
                      const isThisActive = activeEvtId === m.eventId;
                      return (
                        <Box
                          key={m.eventId}
                          p={3.5}
                          borderRadius="12px"
                          bg={isThisActive ? "rgba(139, 92, 246, 0.12)" : "#070B14"}
                          border="1.5px solid"
                          borderColor={isThisActive ? "#00F0FF" : "rgba(255, 255, 255, 0.08)"}
                          boxShadow={isThisActive ? "0 0 18px rgba(0, 240, 255, 0.2)" : "none"}
                          transition="all 0.2s ease"
                        >
                          {/* Event Header Row */}
                          <Flex justify="space-between" align="center" mb={2.5} wrap="wrap" gap={2}>
                            <HStack spacing={2}>
                              <Badge 
                                bg="#000000" 
                                color="#FFFFFF" 
                                border="1px solid rgba(255, 255, 255, 0.2)" 
                                fontSize="11px" 
                                fontWeight="800"
                                fontFamily="'JetBrains Mono', monospace"
                                px={2}
                                py={0.5}
                                borderRadius="6px"
                              >
                                {m.minute}'
                              </Badge>
                              <Badge 
                                bg={m.badgeColor === 'purple' ? "rgba(168, 85, 247, 0.2)" : m.badgeColor === 'cyan' ? "rgba(0, 240, 255, 0.2)" : m.badgeColor === 'red' ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)"}
                                color={m.badgeColor === 'purple' ? "#C084FC" : m.badgeColor === 'cyan' ? "#00F0FF" : m.badgeColor === 'red' ? "#F87171" : "#93C5FD"}
                                border="1px solid"
                                borderColor={m.badgeColor === 'purple' ? "rgba(168, 85, 247, 0.4)" : "rgba(59, 130, 246, 0.4)"}
                                fontSize="10px"
                                fontWeight="800"
                              >
                                {m.badge}
                              </Badge>
                              <Text fontSize="xs" fontWeight="800" color="white">
                                {m.teamCrest} {m.player}
                              </Text>
                            </HStack>

                            <HStack spacing={2}>
                              {m.xg > 0 && (
                                <Badge bg="rgba(0, 0, 0, 0.4)" color="#FBBF24" fontSize="10px" fontFamily="'JetBrains Mono', monospace">
                                  xG {m.xg}
                                </Badge>
                              )}
                              <Button
                                size="xs"
                                h="24px"
                                variant={isThisActive ? "neon" : "ghost"}
                                color={isThisActive ? "#070B14" : "#00F0FF"}
                                bg={isThisActive ? "#00F0FF" : "rgba(0, 240, 255, 0.08)"}
                                border="1px solid #00F0FF"
                                onClick={() => handleSelectMoment(m)}
                                fontSize="10.5px"
                                fontWeight="700"
                                leftIcon={<Play size={10} />}
                              >
                                {isThisActive ? 'Active on Pitch' : 'Inspect on Pitch 🎬'}
                              </Button>
                            </HStack>
                          </Flex>

                          {/* Side-by-Side Split in Scrollable Feed */}
                          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={3} mb={2}>
                            {/* Verified Match Data */}
                            <Box p={3} borderRadius="8px" bg="rgba(59, 130, 246, 0.04)" border="1px solid rgba(59, 130, 246, 0.2)">
                              <HStack spacing={1} mb={1}>
                                <ShieldCheck size={13} color="#3B82F6" />
                                <Text fontSize="9.5px" fontWeight="800" color="#60A5FA" textTransform="uppercase">Verified Match Data (Fact)</Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.300" lineHeight="1.5">
                                {m.factDescription}
                              </Text>
                            </Box>

                            {/* AI Tactical Concept */}
                            <Box p={3} borderRadius="8px" bg="rgba(139, 92, 246, 0.04)" border="1px solid rgba(139, 92, 246, 0.2)">
                              <HStack spacing={1} mb={1}>
                                <Cpu size={13} color="#8B5CF6" />
                                <Text fontSize="9.5px" fontWeight="800" color="#A78BFA" textTransform="uppercase">AI Tactical Concept: {m.tacticalConcept}</Text>
                              </HStack>
                              <Text fontSize="xs" color="gray.300" lineHeight="1.5">
                                {m.explanation}
                              </Text>
                            </Box>
                          </Grid>

                          {/* Counterfactual */}
                          <Box p={2} borderRadius="6px" bg="rgba(139, 92, 246, 0.05)" border="1px dashed rgba(139, 92, 246, 0.25)">
                            <Text fontSize="10.5px" color="gray.300">
                              <Text as="span" color="#C4B5FD" fontWeight="700">🧠 Counterfactual: </Text>
                              {m.counterfactual}
                            </Text>
                          </Box>
                        </Box>
                      );
                    }))}
                  </VStack>

                </VStack>
              )}

            </Box>

            {/* 3. CONTROL vs CHAOS: MATCH RHYTHM CYCLE (Interval Rows Stack - Placed Below Pitch as Requested!) */}
            <Box 
              bg="#0D1527" 
              p={4} 
              borderRadius="16px" 
              border="1px solid rgba(255, 255, 255, 0.08)" 
              boxShadow="0 4px 24px rgba(0, 0, 0, 0.4)"
            >
              <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                <HStack spacing={2}>
                  <Flame size={18} color="#00F0FF" />
                  <Text fontSize="xs" fontWeight="900" textTransform="uppercase" color="#FFFFFF" letterSpacing="wider">
                    CONTROL vs CHAOS: MATCH RHYTHM CYCLE
                  </Text>
                </HStack>

                <Badge 
                  bg="rgba(139, 92, 246, 0.18)" 
                  color="#C4B5FD" 
                  border="1px solid rgba(139, 92, 246, 0.35)" 
                  fontSize="10.5px"
                  fontWeight="800"
                  px={2.5}
                  py={0.8}
                  borderRadius="full"
                >
                  {phasesElapsed} PHASES ELAPSED (UP TO {maxElapsedMinute}')
                </Badge>
              </Flex>

              {/* Stack of Elapsed 15-Minute Intervals (Matching User Reference Image) */}
              <VStack spacing={2.5} align="stretch">
                {computedIntervals.map((interval) => {
                  return (
                    <Box 
                      key={interval.id}
                      p={3}
                      borderRadius="12px"
                      bg={interval.isCurrentLive ? "rgba(0, 240, 255, 0.025)" : "#070B14"}
                      border={interval.isCurrentLive ? "1.5px solid #00F0FF" : "1px solid rgba(255, 255, 255, 0.08)"}
                      boxShadow={interval.isCurrentLive ? "0 0 16px rgba(0, 240, 255, 0.16)" : "none"}
                      transition="all 0.3s ease"
                    >
                      <Flex justify="space-between" align="center" wrap="wrap" gap={2} mb={2}>
                        <HStack spacing={2.5}>
                          {/* Interval Pill */}
                          <Badge 
                            bg={interval.isCurrentLive ? "rgba(0, 240, 255, 0.15)" : "transparent"}
                            color={interval.isCurrentLive ? "#00F0FF" : "#FFFFFF"}
                            border={interval.isCurrentLive ? "1px solid #00F0FF" : "1px solid rgba(255, 255, 255, 0.3)"}
                            fontSize="10.5px"
                            fontWeight="800"
                            px={2.5}
                            py={0.6}
                            borderRadius="full"
                            letterSpacing="wider"
                            fontFamily="mono"
                          >
                            {interval.range} {interval.isCurrentLive ? '[LIVE]' : ''}
                          </Badge>

                          {/* Interval Description */}
                          <Text fontSize="xs" color={interval.isCurrentLive ? "#FFFFFF" : "gray.300"} fontWeight="700">
                            {interval.desc}
                          </Text>
                        </HStack>

                        {/* Control Index */}
                        <HStack spacing={1.5}>
                          <Text fontSize="xs" color="gray.400" fontWeight="600">Control Index:</Text>
                          <Badge 
                            bg="rgba(0, 240, 255, 0.12)" 
                            color="#00F0FF" 
                            border="1px solid #00F0FF" 
                            fontSize="11px" 
                            fontWeight="900" 
                            px={2.5} 
                            py={0.4} 
                            borderRadius="full"
                            fontFamily="'JetBrains Mono', monospace"
                          >
                            {interval.control} / 100
                          </Badge>
                        </HStack>
                      </Flex>

                      {/* Electric Cyan Progress Bar */}
                      <Flex h="5px" borderRadius="full" overflow="hidden" bg="#0B1320">
                        <Box 
                          w={`${interval.control}%`} 
                          bg="#00F0FF" 
                          boxShadow={interval.isCurrentLive ? "0 0 8px #00F0FF" : "none"}
                          transition="all 0.5s ease" 
                        />
                      </Flex>
                    </Box>
                  );
                })}
              </VStack>
            </Box>

            {/* 4. STAGE (II) AUTO-EVENTING & MODEL TRACKING BANNER */}
            <Box 
              bg="#0D1527" 
              p={3.5} 
              borderRadius="12px" 
              border="1px solid rgba(255, 255, 255, 0.08)"
            >
              <HStack spacing={2.5} align="flex-start">
                <ShieldCheck size={18} color="#00F0FF" style={{ marginTop: '2px', flexShrink: 0 }} />
                <Text fontSize="xs" lineHeight="tall">
                  <Text as="span" color="#00F0FF" fontWeight="800">
                    STAGE (II) AUTO-EVENTING & MODEL TRACKING:{" "}
                  </Text>
                  <Text as="span" color="gray.300">
                    Pass distance, difficulty ratings, ball velocity, and sprint indicators are automatically derived via coordinate trigonometry, physics velocity modeling, and spatial pressure calculations rather than manual hand-tagging.
                  </Text>
                </Text>
              </HStack>
            </Box>

            {/* 5. Chronological Key Events Table with Time Range Filter */}
            <KeyEventsTable 
              events={matchState?.eventsHistory || []} 
              onSelectEvent={onSelectEvent}
              selectedEventId={activeEvt?.eventId || activeEvt?.id}
            />

            {/* Mobile Touch Banner: Quick Launch Analytics Drawer */}
            <Box display={{ base: 'block', lg: 'none' }} pt={1}>
              <Button
                w="100%"
                size="md"
                bg="rgba(0, 240, 255, 0.08)"
                color="#00F0FF"
                border="1.5px solid rgba(0, 240, 255, 0.4)"
                borderRadius="14px"
                leftIcon={<BarChart3 size={16} />}
                onClick={() => openMobileAnalytics('stats')}
                _hover={{ bg: "rgba(0, 240, 255, 0.16)", borderColor: "#00F0FF" }}
                boxShadow="0 0 16px rgba(0, 240, 255, 0.15)"
                fontWeight="800"
                fontSize="xs"
                py={5}
              >
                OPEN MATCH INTELLIGENCE DRAWER (STATS & HEATMAP)
              </Button>
            </Box>

          </VStack>
        </GridItem>

        {/* Right Area (4 cols): Match Summary, Momentum, Player Heatmap & Milestones */}
        <GridItem colSpan={{ base: 12, lg: 4 }}>
          <VStack spacing={5} align="stretch">
            
            {/* 1. Match Summary Card (Professional Opta Duel Bars & Metrics) */}
            <MatchSummaryCard matchState={matchState} />

            {/* 2. Momentum & Pressure Gauge */}
            <MomentumChart momentum={matchState?.currentMomentum} stats={stats} />

            {/* 3. Player Tactical Heatmap (Dynamically Powered by matchState & Real Coordinates) */}
            <PlayerHeatmap matchState={matchState} />

            {/* 4. Notable Milestones & Turning Points (100% Dynamically Derived from Events Stream) */}
            <Box bg="#0D1527" p={4} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)">
              <Flex justify="space-between" align="center" mb={2.5}>
                <HStack spacing={2}>
                  <Award size={15} color="#F59E0B" />
                  <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="white">
                    Notable Milestones & Turning Points
                  </Text>
                </HStack>
                <Badge bg="rgba(245, 158, 11, 0.15)" color="#FBBF24" fontSize="10px">
                  {history.filter(e => e.type === 'goal' || e.type === 'red_card' || e.isKeyMomentCandidate).length} DETECTED
                </Badge>
              </Flex>

              <VStack spacing={2} align="stretch" fontSize="11px">
                {renderMilestones(4)}
              </VStack>
            </Box>

          </VStack>
        </GridItem>
      </Grid>

      {/* MOBILE / SMALL DEVICE FLOATING DOCK BAR: Instant 1-tap Drawer Launcher */}
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="fixed"
        bottom={3}
        left="50%"
        transform="translateX(-50%)"
        zIndex={90}
        w="calc(100% - 24px)"
        maxW="480px"
      >
        <Flex
          bg="rgba(13, 21, 39, 0.94)"
          backdropFilter="blur(20px)"
          border="1.5px solid rgba(0, 240, 255, 0.35)"
          borderRadius="16px"
          p={1.5}
          justify="space-between"
          align="center"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.8), 0 0 16px rgba(0, 240, 255, 0.2)"
        >
          <Button
            size="sm"
            flex={1}
            variant="ghost"
            leftIcon={<BarChart3 size={14} color={mobileTab === 'stats' ? '#00F0FF' : '#94A3B8'} />}
            color={mobileTab === 'stats' ? '#00F0FF' : 'gray.300'}
            bg={mobileTab === 'stats' ? 'rgba(0, 240, 255, 0.12)' : 'transparent'}
            fontSize="xs"
            fontWeight="700"
            borderRadius="10px"
            onClick={() => openMobileAnalytics('stats')}
            py={4}
          >
            Stats
          </Button>

          <Button
            size="sm"
            flex={1}
            variant="ghost"
            leftIcon={<Activity size={14} color={mobileTab === 'heatmap' ? '#00F0FF' : '#94A3B8'} />}
            color={mobileTab === 'heatmap' ? '#00F0FF' : 'gray.300'}
            bg={mobileTab === 'heatmap' ? 'rgba(0, 240, 255, 0.12)' : 'transparent'}
            fontSize="xs"
            fontWeight="700"
            borderRadius="10px"
            onClick={() => openMobileAnalytics('heatmap')}
            py={4}
          >
            Heatmap
          </Button>

          <Button
            size="sm"
            flex={1}
            variant="ghost"
            leftIcon={<Gauge size={14} color={mobileTab === 'momentum' ? '#00F0FF' : '#94A3B8'} />}
            color={mobileTab === 'momentum' ? '#00F0FF' : 'gray.300'}
            bg={mobileTab === 'momentum' ? 'rgba(0, 240, 255, 0.12)' : 'transparent'}
            fontSize="xs"
            fontWeight="700"
            borderRadius="10px"
            onClick={() => openMobileAnalytics('momentum')}
            py={4}
          >
            Momentum
          </Button>

          <Button
            size="sm"
            flex={1}
            variant="ghost"
            leftIcon={<Award size={14} color={mobileTab === 'milestones' ? '#00F0FF' : '#94A3B8'} />}
            color={mobileTab === 'milestones' ? '#00F0FF' : 'gray.300'}
            bg={mobileTab === 'milestones' ? 'rgba(0, 240, 255, 0.12)' : 'transparent'}
            fontSize="xs"
            fontWeight="700"
            borderRadius="10px"
            onClick={() => openMobileAnalytics('milestones')}
            py={4}
          >
            Milestones
          </Button>
        </Flex>
      </Box>

      {/* MOBILE MATCH INTELLIGENCE DRAWER (Bottom Sheet for Phone/Tablet UX) */}
      <Drawer
        isOpen={isMobileAnalyticsOpen}
        placement="bottom"
        onClose={onMobileAnalyticsClose}
        size="full"
      >
        <DrawerOverlay bg="rgba(4, 7, 13, 0.85)" backdropFilter="blur(14px)" />
        <DrawerContent
          bg="#0D1527"
          borderTop="2px solid #00F0FF"
          borderTopRadius="22px"
          maxH="84vh"
          color="white"
          boxShadow="0 -12px 40px rgba(0, 0, 0, 0.95)"
        >
          {/* Subtle touch grab bar */}
          <Box w="38px" h="4px" bg="rgba(255, 255, 255, 0.25)" borderRadius="full" mx="auto" mt={2.5} />

          <DrawerHeader pt={2} pb={3} borderBottom="1px solid rgba(255, 255, 255, 0.08)">
            <Flex justify="space-between" align="center" pr={8}>
              <HStack spacing={2}>
                <Sparkles size={16} color="#00F0FF" />
                <Text fontSize="sm" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="wider">
                  Live Match Analytics
                </Text>
              </HStack>
              <Badge bg="rgba(0, 240, 255, 0.15)" color="#00F0FF" border="1px solid #00F0FF" fontSize="10px">
                {mobileTab.toUpperCase()}
              </Badge>
            </Flex>

            {/* In-Drawer Tab Selector Pills */}
            <HStack spacing={1.5} mt={3} bg="#070B14" p={1} borderRadius="10px" border="1px solid rgba(255, 255, 255, 0.08)">
              <Button
                size="xs"
                flex={1}
                bg={mobileTab === 'stats' ? '#00F0FF' : 'transparent'}
                color={mobileTab === 'stats' ? '#000000' : 'gray.400'}
                fontWeight="800"
                onClick={() => setMobileTab('stats')}
                borderRadius="7px"
              >
                Stats
              </Button>
              <Button
                size="xs"
                flex={1}
                bg={mobileTab === 'heatmap' ? '#00F0FF' : 'transparent'}
                color={mobileTab === 'heatmap' ? '#000000' : 'gray.400'}
                fontWeight="800"
                onClick={() => setMobileTab('heatmap')}
                borderRadius="7px"
              >
                Heatmap
              </Button>
              <Button
                size="xs"
                flex={1}
                bg={mobileTab === 'momentum' ? '#00F0FF' : 'transparent'}
                color={mobileTab === 'momentum' ? '#000000' : 'gray.400'}
                fontWeight="800"
                onClick={() => setMobileTab('momentum')}
                borderRadius="7px"
              >
                Momentum
              </Button>
              <Button
                size="xs"
                flex={1}
                bg={mobileTab === 'milestones' ? '#00F0FF' : 'transparent'}
                color={mobileTab === 'milestones' ? '#000000' : 'gray.400'}
                fontWeight="800"
                onClick={() => setMobileTab('milestones')}
                borderRadius="7px"
              >
                Milestones
              </Button>
            </HStack>
          </DrawerHeader>

          <DrawerCloseButton color="gray.400" top={3} right={3} _hover={{ color: "white" }} />

          <DrawerBody px={{ base: 3, sm: 5 }} py={4} overflowY="auto">
            {mobileTab === 'stats' && <MatchSummaryCard matchState={matchState} />}
            {mobileTab === 'heatmap' && <PlayerHeatmap matchState={matchState} />}
            {mobileTab === 'momentum' && <MomentumChart momentum={matchState?.currentMomentum} stats={stats} />}
            {mobileTab === 'milestones' && (
              <Box bg="#0B1320" p={4} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)">
                <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" color="white" mb={3}>
                  Key Match Milestones & Turning Points
                </Text>
                <VStack spacing={2} align="stretch" fontSize="11px">
                  {renderMilestones(8)}
                </VStack>
              </Box>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
