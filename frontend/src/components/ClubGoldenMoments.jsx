import React, { useState } from 'react';
import { 
  Box, Flex, HStack, VStack, Text, Badge, Button, Tooltip, useToast, Progress
} from '@chakra-ui/react';
import { 
  Trophy, Sparkles, Volume2, Play, Pause, Star, Radio, ArrowRight, Shield 
} from 'lucide-react';
import BAR_ALA_DATA from '../data/bar_ala_2026_01.json';

// Authentic Golden Moments for FC Barcelona linked directly to bar_ala_2026_01.json
const BARCELONA_GOLDEN_MOMENTS = [
  {
    id: 'bar_moment_1',
    eventId: 'evt_010',
    minute: 27,
    type: 'goal',
    badge: '⚽ GOLAZO',
    badgeColor: 'purple',
    title: 'Lewandowski Clinical Opener (1-0)',
    player: 'Robert Lewandowski',
    assister: 'Lamine Yamal',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    metricLabel: 'xG 0.64 • Low Corner Drive',
    description: 'GOAL! FC Barcelona 1, Deportivo Alavés 0! Lamine Yamal cuts inside and squares an unselfish ball across the six-yard box, where Robert Lewandowski sweeps it clinically into the bottom left corner!',
    audioCallEn: 'Robert Lewandowski strikes with predatory precision! Lamine Yamal threads the needle and Barcelona break the deadlock at Montjuïc!',
    audioCallEs: '¡Gooool del Barça! ¡Robert Lewandowski no perdona tras la maravillosa asistencia de Lamine Yamal! ¡1-0 en Montjuïc!',
    audioCallFr: 'But de Robert Lewandowski! Une finition limpide sur une offrande royale de Lamine Yamal!',
    defaultVotes: 420,
    coordinates: { x: 92, y: 48 },
    endCoordinates: { x: 100, y: 48 }
  },
  {
    id: 'bar_moment_2',
    eventId: 'evt_014',
    minute: 42,
    type: 'shot_saved',
    badge: '🪄 MIDFIELD MAGIC',
    badgeColor: 'blue',
    title: 'Pedri Line-Splitting Raid & Strike',
    player: 'Pedri',
    assister: 'Robert Lewandowski',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    metricLabel: 'xG 0.19 • Zone 14 Penetration',
    description: 'Pedri glides through the midfield, exchanges a give-and-go with Lewandowski, and shoots low towards the far post, forcing a diving stop from Sivera.',
    audioCallEn: 'Pedri dancing between lines! A breathtaking give-and-go with Lewandowski slicing open the Alavés midfield!',
    audioCallEs: '¡Qué delicia de Pedri! Pared de ensueño con Lewandowski y disparo que exige al máximo a Sivera.',
    audioCallFr: 'La virtuosité de Pedri au cœur du jeu! Une combinaison somptueuse qui met le feu à la défense adverse!',
    defaultVotes: 195,
    coordinates: { x: 85, y: 54 },
    endCoordinates: { x: 98, y: 52 }
  },
  {
    id: 'bar_moment_3',
    eventId: 'evt_025',
    minute: 67,
    type: 'shot_woodwork',
    badge: '⚡ WOODWORK THUNDERBOLT',
    badgeColor: 'yellow',
    title: 'Raphinha Screamer Off Upright',
    player: 'Raphinha',
    assister: 'Gavi',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    metricLabel: 'xG 0.28 • 104 km/h Rocket',
    description: 'OFF THE POST! Gavi wins a thunderous tackle in midfield and feeds Raphinha, who unleashes a venomous drive that cannons off the base of the left upright!',
    audioCallEn: 'OFF THE POST! Raphinha unleashes an absolute missile that rattles the woodwork! Montjuïc gasps!',
    audioCallEs: '¡Al palo Raphinha! ¡Zurdazo descomunal que hace temblar la portería del Alavés!',
    audioCallFr: 'Poteau de Raphinha! Un missile surpuissant qui s\'écrase sur le montant!',
    defaultVotes: 230,
    coordinates: { x: 84, y: 35 },
    endCoordinates: { x: 99, y: 45 }
  },
  {
    id: 'bar_moment_4',
    eventId: 'evt_026',
    minute: 71,
    type: 'penalty_awarded',
    badge: '🎯 PENALTY WON',
    badgeColor: 'cyan',
    title: 'Ferran Torres Decisive Box Dribble',
    player: 'Ferran Torres',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    metricLabel: 'Decisive Box Incursion',
    description: 'PENALTY AWARDED TO BARCELONA! Ferran Torres bursts into the penalty box, cuts sharply past Tenaglia, and gets brought down by a trailing leg! The referee points to the spot without hesitation!',
    audioCallEn: 'Penalty awarded to Barcelona! Ferran Torres displays explosive acceleration to draw the foul inside the box!',
    audioCallEs: '¡Penalti a favor del Barça! Entrada providencial de Ferran Torres en el área que provoca la pena máxima.',
    audioCallFr: 'Pénalty indiscutable pour Barcelone! Ferran Torres fait la différence dans la surface.',
    defaultVotes: 180,
    coordinates: { x: 88, y: 52 },
    endCoordinates: { x: 88, y: 52 }
  },
  {
    id: 'bar_moment_5',
    eventId: 'evt_027',
    minute: 73,
    type: 'goal',
    badge: '⚽ PENALTY BRACE',
    badgeColor: 'purple',
    title: 'Lewandowski Ice-Cold Penalty Double (2-1)',
    player: 'Robert Lewandowski',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    metricLabel: 'xG 0.79 • Bottom-Right Corner',
    description: 'GOAL! FC Barcelona 2, Deportivo Alavés 1! Robert Lewandowski steps up, employs his trademark stuttering run-up, and sends Sivera the wrong way, slotting into the bottom-right corner!',
    audioCallEn: 'Lewandowski converts with nerves of steel! The stuttering run, the calm finish, and Barcelona regain the lead!',
    audioCallEs: '¡Gooool de Lewandowski! ¡Pausa, engaña al portero y firma el doblete para poner el 2-1!',
    audioCallFr: 'Et de deux pour Lewandowski! Un sang-froid magistral sur ce pénalty pour redonner l\'avantage aux Blaugranas!',
    defaultVotes: 380,
    coordinates: { x: 88, y: 50 },
    endCoordinates: { x: 100, y: 54 }
  },
  {
    id: 'bar_moment_6',
    eventId: 'evt_029',
    minute: 80,
    type: 'red_card',
    badge: '🟥 RED CARD ADVANTAGE',
    badgeColor: 'red',
    title: 'Lamine Yamal Draws Sedlar Dismissal',
    player: 'Lamine Yamal',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    metricLabel: 'Alavés Down to 10 Men',
    description: 'RED CARD! Alavés are down to 10 men! Aleksandar Sedlar lunges late into Lamine Yamal near the touchline. The referee brandishes a second yellow followed by the RED CARD!',
    audioCallEn: 'Red card! Sedlar cannot cope with Yamal\'s wizardry and receives his marching orders! Advantage Barcelona!',
    audioCallEs: '¡Segunda amarilla y roja para Sedlar! El desequilibrio de Lamine Yamal deja al Alavés con 10 futbolistas.',
    audioCallFr: 'Carton rouge pour Sedlar! Lamine Yamal provoque l\'expulsion et scelle la supériorité numérique du Barça!',
    defaultVotes: 275,
    coordinates: { x: 75, y: 82 },
    endCoordinates: { x: 75, y: 82 }
  },
  {
    id: 'bar_moment_7',
    eventId: 'evt_032',
    minute: 88,
    type: 'goal',
    badge: '⚡ WONDER GOAL',
    badgeColor: 'purple',
    title: 'Lamine Yamal Top-Corner Magic (3-1)',
    player: 'Lamine Yamal',
    assister: 'Gavi',
    team: 'FC Barcelona',
    teamId: 'barcelona',
    teamCrest: '🔵🔴',
    metricLabel: 'xG 0.31 • Top Stanchion Rocket',
    description: 'GOAL! FC Barcelona 3, Deportivo Alavés 1! Pure brilliance from Lamine Yamal! Gavi switches play out wide; Yamal drops a shoulder, cuts inside Manu Sánchez onto his left boot, and curls an exquisite finish into the top far corner!',
    audioCallEn: 'LAMINE YAMAL! PURE UNFILTERED GENIUS! Curled with pinpoint majesty into the top stanchion! Barcelona seal the three points!',
    audioCallEs: '¡GOLAZOOOOO DE LAMINE YAMAL! ¡Qué barbaridad, qué parábola perfecta a la escuadra! ¡Una auténtica joya!',
    audioCallFr: 'QUEL CHEF-D\'ŒUVRE DE LAMINE YAMAL! Une frappe enroulée d\'anthologie dans la lucarne pour clore le festival!',
    defaultVotes: 590,
    coordinates: { x: 83, y: 72 },
    endCoordinates: { x: 100, y: 52 }
  }
];

// Authentic Golden Moments for Deportivo Alavés linked directly to bar_ala_2026_01.json
const ALAVES_GOLDEN_MOMENTS = [
  {
    id: 'ala_moment_1',
    eventId: 'evt_003',
    minute: 7,
    type: 'shot_saved',
    badge: '🧤 MIRACLE REFLEX',
    badgeColor: 'cyan',
    title: 'Antonio Sivera Point-Blank Denial',
    player: 'Antonio Sivera',
    team: 'Deportivo Alavés',
    teamId: 'alaves',
    teamCrest: '🔵⚪',
    metricLabel: '0.78 xGOT Denied • Header Parried',
    description: 'First big chance! Dani Olmo delivers a pinpoint cross into the box; Lewandowski leaps high and heads firmly, but Sivera parries it away with stunning reflexes!',
    audioCallEn: 'Astonishing stop by Antonio Sivera! Point-blank reflex stop denying Lewandowski\'s thunderous header!',
    audioCallEs: '¡Paradón monumental de Antonio Sivera a bocajarro ante Lewandowski! ¡Vuela el arquero albiazul!',
    audioCallFr: 'Arrêt réflexe miraculeux de Sivera pour priver Lewandowski du but!',
    defaultVotes: 310,
    coordinates: { x: 89, y: 50 },
    endCoordinates: { x: 98, y: 50 }
  },
  {
    id: 'ala_moment_2',
    eventId: 'evt_006',
    minute: 15,
    type: 'shot_off_target',
    badge: '⚡ COUNTER BREAK',
    badgeColor: 'blue',
    title: 'Kike García Wing Counter Volley',
    player: 'Kike García',
    assister: 'Carlos Vicente',
    team: 'Deportivo Alavés',
    teamId: 'alaves',
    teamCrest: '🔵⚪',
    metricLabel: 'Deep Cross • Near Post',
    description: 'Alavés counter quickly down the right wing! Carlos Vicente crosses deep to Kike García, whose half-volley flashes wide of the near upright.',
    audioCallEn: 'Lightning transition by Alavés! Vicente breaks down the right and finds Kike García with menacing intent!',
    audioCallEs: '¡Contragolpe vertiginoso del Glorioso! Gran servicio de Carlos Vicente y remate peligroso de Kike García.',
    audioCallFr: 'Contre-attaque fulgurante menée par Vicente! Kike García tout près de surprendre la défense barcelonaise!',
    defaultVotes: 165,
    coordinates: { x: 24, y: 38 },
    endCoordinates: { x: 6, y: 42 }
  },
  {
    id: 'ala_moment_3',
    eventId: 'evt_013',
    minute: 38,
    type: 'yellow_card',
    badge: '🛡️ TACTICAL STOP',
    badgeColor: 'blue',
    title: 'Sedlar Sacrificial 3-on-2 Halt',
    player: 'Aleksandar Sedlar',
    team: 'Deportivo Alavés',
    teamId: 'alaves',
    teamCrest: '🔵⚪',
    metricLabel: 'Tactical Foul to Halt Break',
    description: 'YELLOW CARD! Aleksandar Sedlar is booked after cynically tugging back Dani Olmo as Barcelona initiated a rapid 3-on-2 counter-attack, halting a clear goal danger.',
    audioCallEn: 'Sedlar takes one for the team! Halting a dangerous 3-on-2 Barcelona breakaway with cynical precision.',
    audioCallEs: 'Sedlar corta la contra de raíz. Falta táctica inteligente para evitar un peligro mayúsculo.',
    audioCallFr: 'Faute tactique indispensable de Sedlar pour couper net une contre-attaque catalane à 3 contre 2.',
    defaultVotes: 145,
    coordinates: { x: 65, y: 52 },
    endCoordinates: { x: 65, y: 52 }
  },
  {
    id: 'ala_moment_4',
    eventId: 'evt_020',
    minute: 52,
    type: 'goal',
    badge: '⚽ GLORIOSO EQUALIZER',
    badgeColor: 'blue',
    title: 'Kike García Counter-Attack Equalizer (1-1)',
    player: 'Kike García',
    assister: 'Jon Guridi',
    team: 'Deportivo Alavés',
    teamId: 'alaves',
    teamCrest: '🔵⚪',
    metricLabel: 'xG 0.42 • Low Left-Post Strike',
    description: 'GOAL! Deportivo Alavés equalize! FC Barcelona 1, Deportivo Alavés 1! Guridi robs the ball 30 yards out, slips it into the path of Kike García, who rifles a low strike inside the left post beyond Ter Stegen\'s reach!',
    audioCallEn: 'KIKE GARCÍA EQUALIZES FOR ALAVÉS! Guridi wins possession high, feeds Kike García, and the Basque side silences Montjuïc!',
    audioCallEs: '¡GOOOOOOL DEL GLORIOSO! ¡Kike García remata cruzado al palo izquierdo y silencia Montjuïc! ¡Empata el Alavés 1-1!',
    audioCallFr: 'Égalisation retentissante de Kike García! Le Glorioso frappe en contre et remet les compteurs à zéro!',
    defaultVotes: 390,
    coordinates: { x: 18, y: 46 },
    endCoordinates: { x: 2, y: 46 }
  },
  {
    id: 'ala_moment_5',
    eventId: 'evt_030',
    minute: 82,
    type: 'substitution',
    badge: '🛡️ HEROIC BARRICADE',
    badgeColor: 'blue',
    title: '10-Man Defensive Bunker Adjustment',
    player: 'Carlos Benavídez',
    team: 'Deportivo Alavés',
    teamId: 'alaves',
    teamCrest: '🔵⚪',
    metricLabel: 'Backline Stabilization',
    description: 'Alavés tactical substitution: Following the red card, striker Kike García is sacrificed for midfielder Carlos Benavídez to shore up the depleted backline with Basque fighting spirit.',
    audioCallEn: 'Alavés dig in deep! Benavídez introduced to fortify the central blockade following the dismissal.',
    audioCallEs: 'Reajuste táctico del Alavés para resistir con diez hombres. Pura garra defensiva en Montjuïc.',
    audioCallFr: 'Réorganisation défensive héroïque d\'Alavés pour tenir le choc en infériorité numérique.',
    defaultVotes: 120,
    coordinates: { x: 50, y: 95 },
    endCoordinates: { x: 65, y: 50 }
  }
];

export const ClubGoldenMoments = ({
  favoriteTeam = 'FC Barcelona',
  matchState,
  onSelectEvent,
  onSwitchPersona,
  selectedLanguage = 'en'
}) => {
  const toast = useToast();

  // Match state extraction
  const currentMinute = matchState?.currentMinute ?? 0;
  const isMatchLive = matchState?.status === 'live';
  const isMatchPaused = matchState?.status === 'paused';
  const isMatchIdle = matchState?.status === 'idle' || (currentMinute === 0 && !isMatchLive);
  
  // A match is only completed when explicitly full_time or clocked 94+ without live state
  const isMatchFinished = matchState?.status === 'full_time' || (currentMinute >= 94 && !isMatchLive);

  const isBarca = favoriteTeam === 'FC Barcelona';
  const isAlaves = favoriteTeam === 'Deportivo Alavés';
  const isNeutral = !isBarca && !isAlaves;

  // Active moments list based on club loyalty
  let allMoments = [];
  if (isBarca) {
    allMoments = BARCELONA_GOLDEN_MOMENTS;
  } else if (isAlaves) {
    allMoments = ALAVES_GOLDEN_MOMENTS;
  } else {
    // Neutral: merge both and sort chronologically by minute
    allMoments = [...BARCELONA_GOLDEN_MOMENTS, ...ALAVES_GOLDEN_MOMENTS].sort((a, b) => a.minute - b.minute);
  }

  // Set of event IDs already processed in eventsHistory
  const historyEventIds = new Set((matchState?.eventsHistory || []).map(e => e.id || e.eventId));

  // Determine if a moment has actually occurred in the live match progress
  const hasMomentOccurred = (m) => {
    if (isMatchFinished) return true;
    if (historyEventIds.has(m.eventId)) return true;
    if (currentMinute > 0 && currentMinute >= m.minute) return true;
    return false;
  };

  // STRICT LIVE DATA STREAM RULE:
  // User cannot see future moments before match completion.
  // Before full time: ONLY moments that have occurred so far are shown.
  // After full time: ALL 90' moments are revealed as the completed archive.
  // Sorted in reverse chronological order (90' to 1') as requested
  const displayedMoments = [...(isMatchFinished 
    ? allMoments 
    : allMoments.filter(hasMomentOccurred)
  )].sort((a, b) => (b.minute ?? 0) - (a.minute ?? 0));

  // Voting state for fan interaction
  const [votesState, setVotesState] = useState(() => {
    const initial = {};
    [...BARCELONA_GOLDEN_MOMENTS, ...ALAVES_GOLDEN_MOMENTS].forEach(m => {
      initial[m.id] = { votes: m.defaultVotes, hasVoted: false };
    });
    return initial;
  });

  // Track currently playing audio
  const [playingMomentId, setPlayingMomentId] = useState(null);

  // Handle fan voting
  const handleVote = (momentId, title) => {
    setVotesState(prev => {
      const current = prev[momentId] || { votes: 100, hasVoted: false };
      if (current.hasVoted) return prev;
      return {
        ...prev,
        [momentId]: { votes: current.votes + 1, hasVoted: true }
      };
    });

    toast({
      title: '⭐ Golden Moment Vote Recorded!',
      description: `You voted for "${title}". Added to ${favoriteTeam} Matchday Leaderboards.`,
      status: 'success',
      duration: 2000,
      position: 'bottom-right'
    });
  };

  // Play spoken commentary for the golden moment
  const handlePlayAudio = (moment) => {
    if (playingMomentId === moment.id) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingMomentId(null);
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Select text based on language
    let callText = moment.audioCallEn;
    let langCode = 'en-GB';

    if (selectedLanguage === 'es') {
      callText = moment.audioCallEs || moment.audioCallEn;
      langCode = 'es-ES';
    } else if (selectedLanguage === 'fr') {
      callText = moment.audioCallFr || moment.audioCallEn;
      langCode = 'fr-FR';
    } else if (selectedLanguage === 'de') {
      callText = moment.audioCallEn;
      langCode = 'de-DE';
    }

    const cleanCallText = (callText || '').replace(/(\b\d+)'\s*minute/gi, '$1th minute').replace(/(\b\d+)'/g, 'minute $1');
    const utterance = new SpeechSynthesisUtterance(cleanCallText);
    utterance.lang = langCode;
    utterance.rate = 1.05;
    utterance.pitch = 1.05;

    utterance.onend = () => setPlayingMomentId(null);
    utterance.onerror = () => setPlayingMomentId(null);

    setPlayingMomentId(moment.id);
    window.speechSynthesis.speak(utterance);

    toast({
      title: `🔊 Playing ${moment.badge} Call`,
      description: `Commentary for ${moment.player} (${moment.minute}') in ${selectedLanguage.toUpperCase()}`,
      status: 'info',
      duration: 1800
    });
  };

  // Teleport to pitch animation using authentic JSON event
  const handleTeleportToPitch = (moment) => {
    if (onSelectEvent) {
      // Find the authentic event from BAR_ALA_DATA.events
      const authenticEvt = BAR_ALA_DATA.events.find(e => e.id === moment.eventId);
      const eventToSend = authenticEvt ? {
        ...authenticEvt,
        player: authenticEvt.player || { name: moment.player },
        teamId: authenticEvt.teamId || moment.teamId,
        description: authenticEvt.description || moment.description
      } : {
        id: moment.eventId,
        minute: moment.minute,
        second: 0,
        type: moment.type,
        player: { name: moment.player },
        teamId: moment.teamId,
        team: moment.team,
        description: moment.description,
        coordinates: moment.coordinates,
        endCoordinates: moment.endCoordinates,
        isKeyMomentCandidate: true
      };

      onSelectEvent(eventToSend);
      toast({
        title: `🎬 Replaying ${moment.minute}' Moment`,
        description: `Teleporting pitch animation to ${moment.player} (${moment.title}).`,
        status: 'success',
        duration: 2200,
        position: 'bottom-right'
      });
    }
  };

  const accentColor = isBarca ? '#A855F7' : isAlaves ? '#3B82F6' : '#00F0FF';
  const badgeBorder = isBarca ? 'rgba(168, 85, 247, 0.35)' : isAlaves ? 'rgba(59, 130, 246, 0.35)' : 'rgba(0, 240, 255, 0.35)';

  return (
    <Box 
      bg="#0D1527" 
      p={{ base: 4, sm: 5 }} 
      borderRadius="16px" 
      border="1px solid rgba(255, 255, 255, 0.08)"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.45)"
    >
      {/* Header Banner */}
      <Flex justify="space-between" align={{ base: "start", sm: "center" }} mb={3} wrap="wrap" gap={3}>
        <HStack spacing={2.5}>
          <Box p={2} borderRadius="10px" bg={`${accentColor}20`} border={`1px solid ${badgeBorder}`}>
            <Trophy size={18} color={accentColor} />
          </Box>
          <Box>
            <HStack spacing={2} align="center">
              <Text fontSize="sm" fontWeight="900" textTransform="uppercase" color="white" letterSpacing="wider">
                {isBarca ? 'Blaugrana Golden Moments Reel' : isAlaves ? 'Glorioso Heroic Moments Reel' : 'Matchday Golden Moments Duel'}
              </Text>
              <Badge 
                bg={`${accentColor}25`} 
                color={accentColor} 
                border={`1px solid ${badgeBorder}`}
                fontSize="10px" 
                fontWeight="800"
                px={2}
              >
                {isBarca ? '🔵🔴 BARÇA FOCUS' : isAlaves ? '🔵⚪ ALAVÉS FOCUS' : '⚔️ HEAD-TO-HEAD'}
              </Badge>
            </HStack>
            <Text fontSize="11px" color="gray.400" mt={0.5}>
              {isMatchFinished 
                ? `Complete 90' matchday archive for ${favoriteTeam} supporters`
                : `Live dynamic match inflection feed streaming in real-time for ${favoriteTeam}`}
            </Text>
          </Box>
        </HStack>

        {/* Live Broadcast Feed State Badge (Strict Live Stream Feeling) */}
        <HStack spacing={2}>
          {isMatchFinished ? (
            <Badge 
              bg="rgba(16, 185, 129, 0.2)" 
              color="#34D399" 
              border="1px solid rgba(16, 185, 129, 0.45)"
              fontSize="10px"
              fontWeight="800"
              px={2.5}
              py={1}
              borderRadius="8px"
            >
              🏆 FULL TIME 90' ARCHIVE
            </Badge>
          ) : (
            <Badge 
              bg={isMatchLive ? 'rgba(239, 68, 68, 0.2)' : isMatchPaused ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)'}
              color={isMatchLive ? '#F87171' : isMatchPaused ? '#FBBF24' : 'gray.300'}
              border="1px solid"
              borderColor={isMatchLive ? 'rgba(239, 68, 68, 0.4)' : isMatchPaused ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.12)'}
              fontSize="10px"
              fontWeight="800"
              px={2.5}
              py={1}
              borderRadius="8px"
            >
              {isMatchLive ? '🔴 LIVE STREAM FEED' : isMatchPaused ? '⏸️ STREAM PAUSED' : '⏱️ READY FOR KICKOFF'}
            </Badge>
          )}
        </HStack>
      </Flex>

      {/* Live Match Clock & Stream Progress Bar */}
      <Box 
        p={2.5} 
        mb={3.5} 
        borderRadius="10px" 
        bg="rgba(0, 0, 0, 0.35)" 
        border="1px solid rgba(255, 255, 255, 0.06)"
      >
        <Flex justify="space-between" align="center" mb={1.5} fontSize="11px">
          <HStack spacing={2}>
            <Radio size={12} color={isMatchLive ? '#EF4444' : isMatchFinished ? '#10B981' : '#9CA3AF'} />
            <Text color="gray.300" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
              {isMatchFinished ? "Full Time Whistle (90'+4)" : `Live Match Clock: ${currentMinute}'`}
            </Text>
          </HStack>

          <Text color="gray.400" fontWeight="600">
            {isMatchFinished ? (
              <Text as="span" color="#34D399" fontWeight="800">
                All {allMoments.length} 90' Moments Unlocked
              </Text>
            ) : (
              <>
                <Text as="span" color={accentColor} fontWeight="800">{displayedMoments.length}</Text> Live Moment{displayedMoments.length === 1 ? '' : 's'} Recorded
              </>
            )}
          </Text>
        </Flex>

        <Progress 
          value={isMatchFinished ? 100 : Math.min(100, Math.max(2, (currentMinute / 94) * 100))} 
          size="xs" 
          borderRadius="4px" 
          colorScheme={isMatchFinished ? 'green' : isBarca ? 'purple' : isAlaves ? 'blue' : 'cyan'} 
          bg="rgba(255, 255, 255, 0.08)"
        />
      </Box>

      {/* Full Time Completed Banner (Only shown after match completion) */}
      {isMatchFinished && (
        <Box 
          p={3} 
          borderRadius="12px" 
          bg="rgba(16, 185, 129, 0.12)" 
          border="1px solid rgba(16, 185, 129, 0.35)" 
          mb={3.5}
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <HStack spacing={2}>
              <Trophy size={16} color="#34D399" />
              <Text fontSize="xs" fontWeight="900" textTransform="uppercase" color="#34D399" letterSpacing="wide">
                Full Time Whistle — Complete 90' Matchday Moments Reel
              </Text>
            </HStack>
            <Badge bg="rgba(16, 185, 129, 0.25)" color="#34D399" fontSize="10px" fontWeight="800">
              {matchState?.homeTeam?.shortName || 'BAR'} {matchState?.homeScore ?? 3} - {matchState?.awayScore ?? 1} {matchState?.awayTeam?.shortName || 'ALA'}
            </Badge>
          </Flex>
          <Text fontSize="11px" color="gray.300" mt={1}>
            The match has concluded. Review all decisive goals, miracle saves, and tactical inflection moments below.
          </Text>
        </Box>
      )}

      {/* STATE 1: In-Match Live Standby (before any moments have occurred) */}
      {!isMatchFinished && displayedMoments.length === 0 && (
        <Box 
          p={5} 
          textAlign="center" 
          borderRadius="12px" 
          bg="rgba(7, 11, 20, 0.7)" 
          border="1px dashed rgba(255, 255, 255, 0.15)"
          mb={3}
        >
          <HStack justify="center" spacing={2} mb={2}>
            <Radio size={16} color="#EF4444" />
            <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="gray.200">
              {isMatchIdle ? 'Live Stream Standby • Ready for Kickoff (00:00)' : `Live Stream Active • Minute ${currentMinute}'`}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.400" maxW="460px" mx="auto" lineHeight="1.6" mb={3}>
            {isMatchIdle 
              ? `The match simulation has not kicked off yet. As decisive goals, clutch saves, and turning points occur in the live match stream, they will appear here in real time.`
              : `The match is in progress. As golden moments occur for ${favoriteTeam}, they will stream into this feed live as they happen.`}
          </Text>
          {isMatchIdle && onSwitchPersona && (
            <Button
              size="xs"
              variant="neon"
              color="#00F0FF"
              bg="rgba(0, 240, 255, 0.15)"
              border="1px solid #00F0FF"
              onClick={() => onSwitchPersona('studio')}
              rightIcon={<ArrowRight size={12} />}
              fontSize="11px"
              fontWeight="700"
            >
              Go to Pitch & Start Match
            </Button>
          )}
        </Box>
      )}

      {/* STATE 2: Golden Moments Cards List (Strictly Live Occurred Moments) */}
      <VStack spacing={3} align="stretch">
        {displayedMoments.map((m, idx) => {
          const voteInfo = votesState[m.id] || { votes: m.defaultVotes, hasVoted: false };
          const isPlayingThis = playingMomentId === m.id;
          const isLatestUnlocked = !isMatchFinished && isMatchLive && idx === displayedMoments.length - 1;

          return (
            <Box
              key={m.id}
              p={3.5}
              borderRadius="12px"
              bg={isPlayingThis ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.025)"}
              border="1px solid"
              borderColor={isPlayingThis ? "#00F0FF" : isLatestUnlocked ? accentColor : "rgba(255, 255, 255, 0.08)"}
              transition="all 0.25s ease"
              _hover={{
                bg: "rgba(255, 255, 255, 0.05)",
                borderColor: accentColor,
                transform: "translateY(-1px)",
                boxShadow: `0 6px 20px ${accentColor}18`
              }}
            >
              <Flex justify="space-between" align={{ base: "start", sm: "center" }} wrap="wrap" gap={2} mb={2}>
                <HStack spacing={2} wrap="wrap">
                  {/* Minute Pill */}
                  <Badge 
                    bg="#070B14" 
                    color="#FFFFFF" 
                    border="1px solid rgba(255, 255, 255, 0.15)"
                    fontFamily="'JetBrains Mono', monospace"
                    fontSize="11px"
                    fontWeight="800"
                    px={2}
                    py={0.5}
                    borderRadius="6px"
                  >
                    {m.minute}'
                  </Badge>

                  {/* Live Stream / FT Status Badge */}
                  {isLatestUnlocked ? (
                    <Badge 
                      bg="rgba(239, 68, 68, 0.2)" 
                      color="#F87171" 
                      border="1px solid rgba(239, 68, 68, 0.45)"
                      fontSize="9.5px" 
                      fontWeight="800"
                      px={1.5}
                      borderRadius="4px"
                    >
                      🔴 LIVE UNLOCKED
                    </Badge>
                  ) : isMatchFinished ? (
                    <Badge 
                      bg="rgba(16, 185, 129, 0.15)" 
                      color="#34D399" 
                      border="1px solid rgba(16, 185, 129, 0.35)"
                      fontSize="9.5px" 
                      fontWeight="800"
                      px={1.5}
                      borderRadius="4px"
                    >
                      ✓ FT ARCHIVE
                    </Badge>
                  ) : null}

                  {/* Moment Category Badge */}
                  <Badge 
                    bg={m.badgeColor === 'purple' ? "rgba(168, 85, 247, 0.2)" : m.badgeColor === 'cyan' ? "rgba(0, 240, 255, 0.2)" : m.badgeColor === 'red' ? "rgba(239, 68, 68, 0.2)" : m.badgeColor === 'yellow' ? "rgba(245, 158, 11, 0.2)" : "rgba(59, 130, 246, 0.2)"}
                    color={m.badgeColor === 'purple' ? "#C084FC" : m.badgeColor === 'cyan' ? "#00F0FF" : m.badgeColor === 'red' ? "#F87171" : m.badgeColor === 'yellow' ? "#FBBF24" : "#93C5FD"}
                    border="1px solid"
                    borderColor={m.badgeColor === 'purple' ? "rgba(168, 85, 247, 0.4)" : m.badgeColor === 'cyan' ? "rgba(0, 240, 255, 0.4)" : m.badgeColor === 'red' ? "rgba(239, 68, 68, 0.4)" : m.badgeColor === 'yellow' ? "rgba(245, 158, 11, 0.4)" : "rgba(59, 130, 246, 0.4)"}
                    fontSize="10px"
                    fontWeight="800"
                    px={2}
                    borderRadius="6px"
                  >
                    {m.badge}
                  </Badge>

                  {/* Title & Player */}
                  <Text fontSize="xs" fontWeight="800" color="white">
                    {m.teamCrest} {m.title}
                  </Text>
                </HStack>

                {/* Metric Telemetry Chip */}
                <Badge 
                  bg="rgba(0, 0, 0, 0.4)" 
                  color="#FBBF24" 
                  fontFamily="'JetBrains Mono', monospace" 
                  fontSize="10px"
                  px={2}
                  py={0.5}
                  borderRadius="6px"
                  border="1px solid rgba(251, 191, 36, 0.25)"
                >
                  {m.metricLabel}
                </Badge>
              </Flex>

              {/* Moment Description from Match JSON */}
              <Text fontSize="xs" color="gray.300" lineHeight="1.5" mb={3}>
                {m.description}
              </Text>

              {/* Action Buttons Row */}
              <Flex justify="space-between" align="center" wrap="wrap" gap={2} pt={1} borderTop="1px solid rgba(255, 255, 255, 0.05)">
                <HStack spacing={2}>
                  {/* Listen to Commentary Call */}
                  <Button
                    size="xs"
                    h="26px"
                    variant={isPlayingThis ? "neon" : "ghost"}
                    color={isPlayingThis ? "#00F0FF" : "gray.300"}
                    bg={isPlayingThis ? "rgba(0, 240, 255, 0.15)" : "rgba(255, 255, 255, 0.04)"}
                    border="1px solid"
                    borderColor={isPlayingThis ? "#00F0FF" : "rgba(255, 255, 255, 0.1)"}
                    leftIcon={isPlayingThis ? <Pause size={11} /> : <Volume2 size={11} color="#00F0FF" />}
                    onClick={() => handlePlayAudio(m)}
                    fontSize="10.5px"
                    fontWeight="700"
                    _hover={{ bg: "rgba(0, 240, 255, 0.15)", color: "#00F0FF" }}
                  >
                    {isPlayingThis ? 'Pause Call' : 'Hear Commentary 🔊'}
                  </Button>

                  {/* Jump to Pitch Replay (passes authentic JSON event) */}
                  <Button
                    size="xs"
                    h="26px"
                    variant="ghost"
                    color="#C4B5FD"
                    bg="rgba(139, 92, 246, 0.08)"
                    border="1px solid rgba(139, 92, 246, 0.25)"
                    leftIcon={<Play size={11} color="#C4B5FD" />}
                    onClick={() => handleTeleportToPitch(m)}
                    fontSize="10.5px"
                    fontWeight="700"
                    _hover={{ bg: "rgba(139, 92, 246, 0.2)", color: "#FFFFFF" }}
                  >
                    Pitch Replay 🎬
                  </Button>
                </HStack>

                {/* Fan Upvote Button */}
                <HStack spacing={1.5}>
                  <Button
                    size="xs"
                    h="26px"
                    px={2.5}
                    variant="ghost"
                    color={voteInfo.hasVoted ? "#FBBF24" : "gray.400"}
                    bg={voteInfo.hasVoted ? "rgba(245, 158, 11, 0.15)" : "transparent"}
                    border="1px solid"
                    borderColor={voteInfo.hasVoted ? "rgba(245, 158, 11, 0.4)" : "rgba(255, 255, 255, 0.08)"}
                    leftIcon={<Star size={11} fill={voteInfo.hasVoted ? "#FBBF24" : "none"} color={voteInfo.hasVoted ? "#FBBF24" : "currentColor"} />}
                    onClick={() => handleVote(m.id, m.title)}
                    isDisabled={voteInfo.hasVoted}
                    fontSize="10.5px"
                    fontWeight="700"
                    _hover={{ bg: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}
                  >
                    {voteInfo.votes} {voteInfo.hasVoted ? 'Voted ★' : 'Vote'}
                  </Button>
                </HStack>
              </Flex>
            </Box>
          );
        })}
      </VStack>

      {/* In-Match Live Stream Radar Notice (Only during live match) */}
      {!isMatchFinished && displayedMoments.length > 0 && (
        <Box 
          mt={3} 
          p={2.5} 
          borderRadius="10px" 
          bg="rgba(0, 0, 0, 0.25)" 
          border="1px dashed rgba(255, 255, 255, 0.08)"
        >
          <HStack justify="space-between" align="center" wrap="wrap" gap={2}>
            <HStack spacing={1.5}>
              <Radio size={12} color="#EF4444" />
              <Text fontSize="10.5px" fontWeight="700" color="gray.300">
                Live stream monitoring matchday inflections (Minute {currentMinute}')
              </Text>
            </HStack>
            <Text fontSize="10px" color="gray.400">
              Complete 90' moments archive unlocks at full-time
            </Text>
          </HStack>
        </Box>
      )}

      {/* Historic Milestone Throwback Banner */}
      <Box 
        mt={4} 
        p={3} 
        borderRadius="12px" 
        bg="rgba(0, 0, 0, 0.35)" 
        border="1px dashed rgba(255, 255, 255, 0.12)"
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <HStack spacing={2}>
            <Sparkles size={14} color="#F59E0B" />
            <Text fontSize="11px" fontWeight="800" color="#FCD34D" textTransform="uppercase">
              {isBarca ? 'Classic Montjuïc Milestone' : isAlaves ? 'Mendizorrotza Historic Memory' : 'Historic Fixture Memory'}
            </Text>
          </HStack>
          <Text fontSize="10px" color="gray.400">Matchday Flashback</Text>
        </Flex>
        <Text fontSize="11px" color="gray.300" mt={1}>
          {isBarca 
            ? '🔵🔴 2021 Record: Barcelona have scored in each of their last 12 consecutive home league meetings against Alavés.'
            : isAlaves
            ? '🔵⚪ 2016 Miracle: Alavés famously stunned Barcelona 2-1 at Camp Nou on September 10, 2016 through goals from Deyverson and Ibai Gómez.'
            : '⚔️ 2001 UEFA Cup Final: One of the greatest European finals in history — Liverpool 5-4 Deportivo Alavés in Dortmund.'}
        </Text>
      </Box>
    </Box>
  );
};
