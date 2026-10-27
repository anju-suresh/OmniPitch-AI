import React from 'react';
import { 
  Box, Flex, HStack, VStack, Text, Badge, Button, Progress 
} from '@chakra-ui/react';
import { Sparkles, Clock, Flame, Target } from 'lucide-react';

export const MatchScoreBanner = ({ 
  matchState, 
  viewFocus = 'both', 
  onSetViewFocus 
}) => {
  const homeScore = matchState?.homeScore ?? 0;
  const awayScore = matchState?.awayScore ?? 0;
  const minute = matchState?.currentMinute ?? 0;
  const status = matchState?.status ?? 'idle';

  const stats = matchState?.stats || {};
  const history = matchState?.eventsHistory || [];
  const hasStarted = (status !== 'idle' && minute > 0) || history.length > 0;

  const barcaStats = stats.barcelona || stats.arsenal || { possession: 0, xG: 0.0 };
  const alavesStats = stats.alaves || stats.chelsea || { possession: 0, xG: 0.0 };

  let barcaPossession = 0;
  let alavesPossession = 0;

  if (hasStarted) {
    if (barcaStats.possession && barcaStats.possession > 0) {
      barcaPossession = Math.round(barcaStats.possession);
      alavesPossession = 100 - barcaPossession;
    } else if (history.length > 0) {
      let bSec = 0;
      let aSec = 0;
      history.forEach(e => {
        const isB = e.teamId === 'barcelona' || e.team === 'Barcelona' || e.team === 'FC Barcelona';
        const dur = e.possessionDurationSeconds || 30;
        if (isB) bSec += dur;
        else aSec += dur;
      });
      const total = bSec + aSec;
      if (total > 0) {
        barcaPossession = Math.round((bSec / total) * 100);
        alavesPossession = 100 - barcaPossession;
      }
    } else {
      barcaPossession = 50;
      alavesPossession = 50;
    }
  }

  const barcaXG = hasStarted ? Number(barcaStats.xG ?? 0).toFixed(2) : '0.00';
  const alavesXG = hasStarted ? Number(alavesStats.xG ?? 0).toFixed(2) : '0.00';

  // Dynamic Control vs Chaos Index computed directly from events history
  const recentEvents = history.slice(0, 6);
  let chaos = 25;
  recentEvents.forEach(e => {
    if (e.type === 'goal') chaos += 15;
    if (e.type === 'red_card') chaos += 25;
    if (e.type?.includes('shot')) chaos += 8;
    if (e.type === 'pass_sequence') chaos -= 4;
  });
  const controlIndex = Math.min(Math.max(100 - chaos, 35), 90);
  const controlLabel = controlIndex >= 75 
    ? "High Positional Suffocation" 
    : controlIndex >= 65 
    ? "Territorial Rest-Defense Domination" 
    : "Balanced Structured Play";

  // Match period label
  const periodLabel = !hasStarted
    ? 'PRE-MATCH'
    : status === 'full_time' || minute >= 94 
    ? 'FULL TIME' 
    : minute >= 45 
    ? '2ND HALF' 
    : '1ST HALF';

  return (
    <Box 
      bg="#070B14" 
      borderBottom="1px solid rgba(255, 255, 255, 0.08)"
      px={{ base: 3, md: 6 }} 
      py={3}
      position="relative"
    >
      {/* 1. Sub-Header: Synthetic Pipeline Badge, Venue & View Focus Selector (Image 3) */}
      <Flex justify="space-between" align="center" mb={2.5} wrap="wrap" gap={2}>
        <HStack spacing={2} wrap="wrap">
          <Badge 
            bg="rgba(139, 92, 246, 0.1)" 
            color="#C4B5FD" 
            border="1px solid #8B5CF6"
            fontSize="10px" 
            fontWeight="800" 
            px={2.5} 
            py={0.8} 
            borderRadius="6px" 
            letterSpacing="wider"
            display="inline-flex"
            alignItems="center"
            gap={1.5}
            boxShadow="0 0 14px rgba(139, 92, 246, 0.25)"
          >
            <Sparkles size={11} color="#C4B5FD" />
            SYNTHETIC LIVE EVENT PIPELINE
          </Badge>
          <Text fontSize="11px" color="gray.400" fontWeight="600" display={{ base: "none", md: "inline" }}>
            La Liga EA Sports - Matchday 23 • Estadi Olímpic Lluís Companys, Barcelona
          </Text>
        </HStack>

        {/* VIEW FOCUS Pills (Image 3) */}
        <HStack spacing={1.5} fontSize="11px" wrap="wrap">
          <Text color="gray.400" fontWeight="700" mr={1} fontSize="11px" display={{ base: "none", sm: "inline" }}>VIEW FOCUS:</Text>
          <Button 
            size="xs" 
            bg={viewFocus === 'barca' ? "rgba(0, 240, 255, 0.15)" : "#0B1320"}
            color={viewFocus === 'barca' ? "#00F0FF" : "gray.300"}
            border={viewFocus === 'barca' ? "1px solid #00F0FF" : "1px solid rgba(255, 255, 255, 0.1)"}
            _hover={{ borderColor: "#00F0FF", color: "#00F0FF" }}
            onClick={() => onSetViewFocus && onSetViewFocus('barca')}
            borderRadius="6px"
            fontSize="10.5px"
            fontWeight="700"
            px={2}
          >
            🔵🔴 Barca
          </Button>

          <Button 
            size="xs" 
            bg={viewFocus === 'alaves' ? "rgba(0, 240, 255, 0.15)" : "#0B1320"}
            color={viewFocus === 'alaves' ? "#00F0FF" : "gray.300"}
            border={viewFocus === 'alaves' ? "1px solid #00F0FF" : "1px solid rgba(255, 255, 255, 0.1)"}
            _hover={{ borderColor: "#00F0FF", color: "#00F0FF" }}
            onClick={() => onSetViewFocus && onSetViewFocus('alaves')}
            borderRadius="6px"
            fontSize="10.5px"
            fontWeight="700"
            px={2}
          >
            🔵⚪ Alavés
          </Button>

          <Button 
            size="xs" 
            bg={viewFocus === 'both' ? "rgba(0, 240, 255, 0.15)" : "#0B1320"}
            color={viewFocus === 'both' ? "#00F0FF" : "gray.300"}
            border={viewFocus === 'both' ? "1px solid #00F0FF" : "1px solid rgba(255, 255, 255, 0.1)"}
            _hover={{ borderColor: "#00F0FF", color: "#00F0FF" }}
            onClick={() => onSetViewFocus && onSetViewFocus('both')}
            borderRadius="6px"
            fontSize="10.5px"
            fontWeight="700"
            px={2}
          >
            Both
          </Button>
        </HStack>
      </Flex>

      {/* 2. Main Scoreboard Row: Teams, Crests, Big Digital Score, Clock & Half Indicator (Image 3) */}
      <Flex justify="space-between" align="center" py={1} wrap="wrap" gap={{ base: 2, md: 3 }}>
        
        {/* Home Team: FC Barcelona */}
        <HStack spacing={{ base: 2, sm: 3 }} minW={{ base: "auto", sm: "160px", md: "200px" }}>
          <Box 
            w={{ base: "36px", sm: "42px" }} 
            h={{ base: "36px", sm: "42px" }} 
            borderRadius="full" 
            bg="linear-gradient(135deg, #004D98 0%, #A50044 100%)" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            fontSize={{ base: "17px", sm: "20px" }}
            boxShadow="0 0 16px rgba(0, 77, 152, 0.6)"
            border="1.5px solid rgba(255, 255, 255, 0.2)"
          >
            🔵🔴
          </Box>
          <Box>
            <Text fontSize={{ base: "sm", sm: "md", md: "lg" }} fontWeight="900" color="#FFFFFF" letterSpacing="tight">
              FC Barcelona
            </Text>
            <HStack spacing={2} fontSize="11px" mt={0.5}>
              <Badge 
                bg="rgba(148, 163, 184, 0.15)" 
                color="#94A3B8" 
                border="1px solid rgba(148, 163, 184, 0.25)" 
                fontSize="9px"
                px={1.5}
                py={0.2}
                borderRadius="4px"
              >
                4-3-3
              </Badge>
              <Text color="gray.400" fontSize="11px" display={{ base: "none", sm: "inline" }}>Coach: Hansi Flick</Text>
            </HStack>
          </Box>
        </HStack>

        {/* Center: Big Match Score & Digital Clock */}
        <VStack spacing={0.5} textAlign="center" px={{ base: 2, sm: 4 }}>
          <Text 
            fontSize={{ base: "26px", sm: "36px", md: "46px" }} 
            fontWeight="900" 
            fontFamily="'JetBrains Mono', monospace" 
            letterSpacing={{ base: "3px", sm: "5px" }} 
            color="#FFFFFF"
            lineHeight="1"
          >
            {homeScore} - {awayScore}
          </Text>

          <HStack spacing={1.5} justify="center">
            <HStack spacing={1} color="#00F0FF" fontSize="11px" fontWeight="800" fontFamily="mono">
              <Clock size={12} color="#00F0FF" />
              <Text>{minute}'</Text>
            </HStack>

            <Badge 
              bg="rgba(0, 240, 255, 0.08)" 
              border="1px solid #00F0FF" 
              color="#00F0FF" 
              fontSize="8.5px" 
              fontWeight="800" 
              px={2} 
              py={0.2} 
              borderRadius="full"
              letterSpacing="wider"
            >
              {periodLabel}
            </Badge>
          </HStack>
        </VStack>

        {/* Away Team: Deportivo Alavés */}
        <HStack spacing={{ base: 2, sm: 3 }} justify="flex-end" minW={{ base: "auto", sm: "160px", md: "200px" }}>
          <Box textAlign="right">
            <Text fontSize={{ base: "sm", sm: "md", md: "lg" }} fontWeight="900" color="#FFFFFF" letterSpacing="tight">
              Deportivo Alavés
            </Text>
            <HStack spacing={2} fontSize="11px" justify="flex-end" mt={0.5}>
              <Text color="gray.400" fontSize="11px" display={{ base: "none", sm: "inline" }}>Coach: Luis García</Text>
              <Badge 
                bg="rgba(148, 163, 184, 0.15)" 
                color="#94A3B8" 
                border="1px solid rgba(148, 163, 184, 0.25)" 
                fontSize="9px"
                px={1.5}
                py={0.2}
                borderRadius="4px"
              >
                4-4-2
              </Badge>
            </HStack>
          </Box>
          <Box 
            w={{ base: "36px", sm: "42px" }} 
            h={{ base: "36px", sm: "42px" }} 
            borderRadius="full" 
            bg="linear-gradient(135deg, #005BAC 0%, #1E3A8A 100%)" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            fontSize={{ base: "17px", sm: "20px" }}
            boxShadow="0 0 16px rgba(0, 91, 172, 0.6)"
            border="1.5px solid rgba(255, 255, 255, 0.2)"
          >
            🔵⚪
          </Box>
        </HStack>

      </Flex>

      {/* 3. Bottom Strip: Possession Duel Bar & Mini Telemetry Badges (Image 3) */}
      <Box mt={2} pt={1}>
        <Flex justify="space-between" align="center" fontSize="10.5px" fontWeight="800" mb={1}>
          <Text color={hasStarted ? "#00F0FF" : "gray.500"} fontFamily="mono">
            BAR {hasStarted ? `${barcaPossession}%` : '--%'}
          </Text>
          <Text color="gray.400" fontSize="9.5px" letterSpacing="widest" textTransform="uppercase">
            {hasStarted ? "POSSESSION" : "POSSESSION • PRE-MATCH"}
          </Text>
          <Text color={hasStarted ? "#FFFFFF" : "gray.500"} fontFamily="mono">
            ALA {hasStarted ? `${alavesPossession}%` : '--%'}
          </Text>
        </Flex>

        {/* Ultra-thin Duel Possession Bar */}
        <Flex h="3px" borderRadius="full" overflow="hidden" bg="#1E293B">
          {hasStarted && (barcaPossession > 0 || alavesPossession > 0) ? (
            <>
              <Box w={`${barcaPossession}%`} bg="#00F0FF" transition="all 0.5s ease" />
              <Box w={`${alavesPossession}%`} bg="#2563EB" transition="all 0.5s ease" />
            </>
          ) : (
            <Box w="100%" bg="#1E293B" />
          )}
        </Flex>

        {/* Quick Badges Row (Image 3) */}
        <Flex justify="flex-end" gap={2} mt={2} wrap="wrap" align="center">
          {/* Expected Goals Pill */}
          <HStack 
            bg="#0B1320" 
            border="1px solid rgba(255, 255, 255, 0.1)" 
            px={2.5} 
            py={0.8} 
            borderRadius="6px" 
            fontSize="10.5px"
          >
            <Text color="gray.400" fontWeight="600">EXPECTED GOALS (xG):</Text>
            <Text color="#00F0FF" fontWeight="800" fontFamily="mono">{barcaXG}</Text>
            <Text color="gray.500">vs</Text>
            <Text color="#FFFFFF" fontWeight="800" fontFamily="mono">{alavesXG}</Text>
          </HStack>

          {/* Control vs Chaos Pill */}
          <HStack 
            bg="#0B1320" 
            border="1px solid rgba(0, 240, 255, 0.3)" 
            px={2.5} 
            py={0.8} 
            borderRadius="6px" 
            fontSize="10.5px"
          >
            <Flame size={12} color="#00F0FF" />
            <Text color="white" fontWeight="700">CONTROL vs CHAOS:</Text>
            <Badge 
              bg="#00F0FF" 
              color="#070B14" 
              fontSize="9.5px" 
              fontWeight="900" 
              px={1.8} 
              py={0.2} 
              borderRadius="4px"
              fontFamily="mono"
            >
              {controlIndex} / 100
            </Badge>
            <Text color="gray.300" fontSize="10px">• {controlLabel}</Text>
          </HStack>
        </Flex>
      </Box>

    </Box>
  );
};
