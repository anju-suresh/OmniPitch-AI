import React, { useState, useMemo } from 'react';
import { Box, Flex, HStack, Text, Select, Badge } from '@chakra-ui/react';
import { Flame, User } from 'lucide-react';

export const PlayerHeatmap = ({ matchState }) => {
  const history = matchState?.eventsHistory || [];
  const homeTeam = matchState?.homeTeam;
  const awayTeam = matchState?.awayTeam;

  // 1. Dynamically extract all players from lineups and match events
  const playersList = useMemo(() => {
    const map = new Map();

    // Seed from official lineups if available
    if (homeTeam?.lineup) {
      homeTeam.lineup.forEach(p => {
        map.set(p.name, {
          name: p.name,
          number: p.number,
          position: p.position,
          team: homeTeam.name || 'FC Barcelona',
          isHome: true
        });
      });
    }
    if (awayTeam?.lineup) {
      awayTeam.lineup.forEach(p => {
        map.set(p.name, {
          name: p.name,
          number: p.number,
          position: p.position,
          team: awayTeam.name || 'Deportivo Alavés',
          isHome: false
        });
      });
    }

    // Also pick up any player mentioned in events
    history.forEach(e => {
      const p = e.player;
      const pName = typeof p === 'object' ? p?.name : p;
      if (pName && !map.has(pName)) {
        map.set(pName, {
          name: pName,
          number: typeof p === 'object' ? p?.number : 0,
          position: typeof p === 'object' ? p?.position : 'MF',
          team: e.teamId === 'barcelona' ? (homeTeam?.name || 'FC Barcelona') : (awayTeam?.name || 'Deportivo Alavés'),
          isHome: e.teamId === 'barcelona'
        });
      }
    });

    return Array.from(map.values());
  }, [homeTeam, awayTeam, history.length]);

  // Default to first active player (or Lewandowski)
  const [selectedPlayerName, setSelectedPlayerName] = useState('Robert Lewandowski');

  // Verify selected player exists, otherwise default
  const activePlayer = playersList.find(p => p.name === selectedPlayerName) || playersList[0] || {
    name: 'Robert Lewandowski',
    number: 9,
    position: 'ST',
    team: 'FC Barcelona',
    isHome: true
  };

  // 2. Compute dynamic density points and zone from real match event coordinates
  const { densityPoints, primaryZone, touchesCount, avgCoords } = useMemo(() => {
    const playerEvents = history.filter(e => {
      const p = e.player;
      const pName = typeof p === 'object' ? p?.name : p;
      const s = e.secondaryPlayer;
      const sName = typeof s === 'object' ? s?.name : s;
      return pName === activePlayer.name || sName === activePlayer.name;
    });

    const pts = [];
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    playerEvents.forEach((evt, idx) => {
      if (evt.coordinates?.x !== undefined && evt.coordinates?.y !== undefined) {
        sumX += evt.coordinates.x;
        sumY += evt.coordinates.y;
        count++;

        // Add heat point for this actual event
        pts.push({
          x: evt.coordinates.x,
          y: evt.coordinates.y,
          r: evt.type === 'goal' ? 26 : evt.type?.includes('shot') ? 22 : 18,
          opacity: 0.75
        });
      }

      // If they were receiver of pass, add endCoords
      if (evt.secondaryPlayer && typeof evt.secondaryPlayer === 'object' && evt.secondaryPlayer.name === activePlayer.name && evt.endCoordinates) {
        sumX += evt.endCoordinates.x;
        sumY += evt.endCoordinates.y;
        count++;
        pts.push({
          x: evt.endCoordinates.x,
          y: evt.endCoordinates.y,
          r: 16,
          opacity: 0.6
        });
      }
    });

    // If no events recorded yet for this player, provide tactical baseline point
    if (pts.length === 0) {
      const posX = activePlayer.position === 'ST' ? 82 : activePlayer.position === 'RW' ? 72 : activePlayer.position === 'LW' ? 72 : activePlayer.position === 'CM' ? 52 : activePlayer.position === 'CB' ? 28 : 10;
      const posY = activePlayer.position === 'RW' ? 78 : activePlayer.position === 'LW' ? 22 : 50;
      pts.push({ x: posX, y: posY, r: 20, opacity: 0.5 });
      sumX = posX;
      sumY = posY;
      count = 1;
    }

    const avgX = Math.round(sumX / count);
    const avgY = Math.round(sumY / count);

    // Compute tactical zone name from real coordinates
    let zoneX = "Midfield Third";
    if (avgX > 66) zoneX = "Attacking Third & Box";
    else if (avgX < 34) zoneX = "Defensive Third";

    let zoneY = "Central Corridor";
    if (avgY > 66) zoneY = "Right Flank / Half-Space";
    else if (avgY < 34) zoneY = "Left Flank / Channel";

    return {
      densityPoints: pts,
      primaryZone: `${zoneX} (${zoneY})`,
      touchesCount: playerEvents.length,
      avgCoords: { x: avgX, y: avgY }
    };
  }, [activePlayer.name, history]);

  return (
    <Box bg="#111827" p={4} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)">
      
      {/* Header with Dynamic Player Selector */}
      <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
        <HStack spacing={2}>
          <Flame size={16} color="#8B5CF6" />
          <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="white" letterSpacing="wider">
            Player Heatmap ({touchesCount} Actions)
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Select 
            size="xs" 
            value={activePlayer.name}
            onChange={(e) => setSelectedPlayerName(e.target.value)}
            bg="#0D1527"
            color="#F1F5F9"
            borderColor="rgba(255, 255, 255, 0.2)"
            w={{ base: "190px", sm: "220px" }}
            borderRadius="8px"
            fontWeight="700"
            _hover={{ borderColor: "#00F0FF" }}
            _focus={{ borderColor: "#00F0FF", boxShadow: "0 0 10px rgba(0, 240, 255, 0.3)" }}
            sx={{
              '> option, > optgroup': {
                background: '#0D1527 !important',
                color: '#F1F5F9 !important',
                padding: '6px 10px'
              }
            }}
          >
            {playersList.map((p) => (
              <option 
                key={p.name} 
                value={p.name}
                style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}
              >
                {p.name} (#{p.number || '-'} {p.position})
              </option>
            ))}
          </Select>
        </HStack>
      </Flex>

      {/* Primary Zone & Position Badge */}
      <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
        <HStack spacing={2}>
          <Badge bg="rgba(139, 92, 246, 0.15)" color="#C4B5FD" border="1px solid rgba(139, 92, 246, 0.3)" fontSize="10px">
            {activePlayer.team} • {activePlayer.position}
          </Badge>
          <Text fontSize="xs" color="gray.300">
            Active Zone: <Text as="span" color="white" fontWeight="700">{primaryZone}</Text>
          </Text>
        </HStack>
      </Flex>

      {/* 2D Pitch Graphic with Dynamic Heat Density */}
      <Box 
        position="relative" 
        w="100%" 
        h="180px" 
        bg="linear-gradient(180deg, #133D26 0%, #0E2E1D 100%)" 
        borderRadius="12px" 
        overflow="hidden"
        border="1px solid rgba(255, 255, 255, 0.1)"
        boxShadow="inset 0 0 20px rgba(0, 0, 0, 0.6)"
      >
        <svg viewBox="0 0 100 65" width="100%" height="100%" preserveAspectRatio="none">
          <defs>
            {/* Alternating Mowed Stripes for Mini Pitch */}
            <pattern id="miniMowedStripe" width="10" height="65" patternUnits="userSpaceOnUse">
              <rect width="5" height="65" fill="#1C5232" />
              <rect x="5" width="5" height="65" fill="#154026" />
            </pattern>

            {/* Heat Gradient Definitions */}
            <radialGradient id="heat-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#F59E0B" stopOpacity="0.65" />
              <stop offset="75%" stopColor="#8B5CF6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Mowed Turf Bed */}
          <rect width="100" height="65" fill="url(#miniMowedStripe)" />

          {/* Pitch Lines */}
          <rect x="2" y="2" width="96" height="61" fill="none" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.75" rx="1" />
          <line x1="50" y1="2" x2="50" y2="63" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.75" />
          <circle cx="50" cy="32.5" r="9" fill="none" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.75" />
          <circle cx="50" cy="32.5" r="0.8" fill="rgba(255, 255, 255, 0.4)" />

          {/* Left Penalty Area */}
          <rect x="2" y="14" width="16" height="37" fill="none" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.75" />
          <rect x="2" y="22" width="6" height="21" fill="none" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.75" />
          
          {/* Right Penalty Area */}
          <rect x="82" y="14" width="16" height="37" fill="none" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.75" />
          <rect x="92" y="22" width="6" height="21" fill="none" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="0.75" />

          {/* Render Heat Density Nodes Directly from Real Event Coordinates */}
          {densityPoints.map((pt, i) => (
            <circle 
              key={i} 
              cx={pt.x} 
              cy={pt.y * 0.65} 
              r={pt.r * 0.65} 
              fill="url(#heat-core)" 
              opacity={pt.opacity}
              style={{ filter: 'blur(3px)' }}
            />
          ))}

          {/* Dynamic Average Anchor Pin */}
          <circle 
            cx={avgCoords.x} 
            cy={avgCoords.y * 0.65} 
            r="1.8" 
            fill="#FFFFFF" 
            stroke="#000" 
            strokeWidth="0.5" 
          />
        </svg>

        {/* Heat Intensity Legend */}
        <Flex 
          position="absolute" 
          bottom={1.5} 
          right={2} 
          align="center" 
          gap={1.5} 
          bg="rgba(11, 15, 25, 0.88)" 
          backdropFilter="blur(8px)"
          px={2} 
          py={0.5} 
          borderRadius="6px"
        >
          <Text fontSize="9px" color="gray.400">Low</Text>
          <Box w="36px" h="4px" borderRadius="full" bg="linear-gradient(90deg, #8B5CF6 0%, #F59E0B 50%, #EF4444 100%)" />
          <Text fontSize="9px" color="gray.400">High Activity</Text>
        </Flex>

      </Box>

    </Box>
  );
};
