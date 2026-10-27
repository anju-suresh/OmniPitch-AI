import React, { useState } from 'react';
import { Box, Text, Badge, Flex, HStack, Select, Button, VStack, Tooltip } from '@chakra-ui/react';
import { Clock, Eye, Sparkles, User, Zap, Activity } from 'lucide-react';

// FC Barcelona 4-3-3 Starting Lineup (Pitch Coordinates 0-100)
const BARCELONA_PLAYERS = [
  { id: 'bar_gk_1', num: 1, name: 'Ter Stegen', pos: 'GK', x: 7, y: 50, topSpeed: 18.2, distanceKm: 4.2, touches: 28, passAcc: 94 },
  { id: 'bar_df_23', num: 23, name: 'Koundé', pos: 'RB', x: 24, y: 82, topSpeed: 32.1, distanceKm: 9.8, touches: 64, passAcc: 88 },
  { id: 'bar_df_2', num: 2, name: 'Cubarsí', pos: 'CB', x: 18, y: 62, topSpeed: 29.4, distanceKm: 8.9, touches: 82, passAcc: 92 },
  { id: 'bar_df_4', num: 4, name: 'Araújo', pos: 'CB', x: 18, y: 38, topSpeed: 33.6, distanceKm: 9.1, touches: 76, passAcc: 89 },
  { id: 'bar_df_3', num: 3, name: 'Balde', pos: 'LB', x: 24, y: 18, topSpeed: 34.2, distanceKm: 10.4, touches: 71, passAcc: 86 },
  { id: 'bar_mf_17', num: 17, name: 'Casadó', pos: 'CM', x: 34, y: 50, topSpeed: 30.5, distanceKm: 11.2, touches: 94, passAcc: 93 },
  { id: 'bar_mf_8', num: 8, name: 'Pedri', pos: 'CM', x: 44, y: 36, topSpeed: 31.4, distanceKm: 11.8, touches: 102, passAcc: 91 },
  { id: 'bar_mf_20', num: 20, name: 'Olmo', pos: 'CAM', x: 50, y: 64, topSpeed: 30.8, distanceKm: 9.6, touches: 58, passAcc: 85 },
  { id: 'bar_fw_19', num: 19, name: 'Yamal', pos: 'RW', x: 70, y: 80, topSpeed: 33.8, distanceKm: 10.1, touches: 68, passAcc: 84 },
  { id: 'bar_fw_11', num: 11, name: 'Raphinha', pos: 'LW', x: 70, y: 20, topSpeed: 33.2, distanceKm: 10.6, touches: 62, passAcc: 82 },
  { id: 'bar_fw_9', num: 9, name: 'Lewandowski', pos: 'ST', x: 76, y: 50, topSpeed: 31.6, distanceKm: 9.3, touches: 44, passAcc: 81 }
];

// Deportivo Alavés 4-4-2 Starting Lineup
const ALAVES_PLAYERS = [
  { id: 'ala_gk_1', num: 1, name: 'Sivera', pos: 'GK', x: 93, y: 50, topSpeed: 17.5, distanceKm: 4.1, touches: 36, passAcc: 68 },
  { id: 'ala_df_14', num: 14, name: 'Tenaglia', pos: 'RB', x: 78, y: 18, topSpeed: 30.9, distanceKm: 9.4, touches: 48, passAcc: 74 },
  { id: 'ala_df_5', num: 5, name: 'Abqar', pos: 'CB', x: 82, y: 38, topSpeed: 29.8, distanceKm: 8.6, touches: 52, passAcc: 76 },
  { id: 'ala_df_22', num: 22, name: 'Sedlar', pos: 'CB', x: 82, y: 62, topSpeed: 28.6, distanceKm: 7.2, touches: 42, passAcc: 72 },
  { id: 'ala_df_3', num: 3, name: 'Sánchez', pos: 'LB', x: 78, y: 82, topSpeed: 31.2, distanceKm: 9.8, touches: 54, passAcc: 71 },
  { id: 'ala_mf_7', num: 7, name: 'Vicente', pos: 'RM', x: 62, y: 18, topSpeed: 33.1, distanceKm: 10.8, touches: 58, passAcc: 78 },
  { id: 'ala_mf_8', num: 8, name: 'Blanco', pos: 'CM', x: 64, y: 40, topSpeed: 29.7, distanceKm: 11.0, touches: 66, passAcc: 82 },
  { id: 'ala_mf_6', num: 6, name: 'Guevara', pos: 'CM', x: 64, y: 60, topSpeed: 29.3, distanceKm: 10.6, touches: 60, passAcc: 80 },
  { id: 'ala_mf_11', num: 11, name: 'Conechny', pos: 'LM', x: 62, y: 82, topSpeed: 31.4, distanceKm: 9.9, touches: 46, passAcc: 75 },
  { id: 'ala_fw_18', num: 18, name: 'Guridi', pos: 'ST', x: 46, y: 40, topSpeed: 29.9, distanceKm: 9.5, touches: 38, passAcc: 73 },
  { id: 'ala_fw_17', num: 17, name: 'Kike G.', pos: 'ST', x: 46, y: 60, topSpeed: 30.4, distanceKm: 9.2, touches: 34, passAcc: 70 }
];

const ALL_PLAYERS = [...BARCELONA_PLAYERS, ...ALAVES_PLAYERS];

/**
 * Miniature SVG Football Jersey Component with Authentic Club Kits
 */
const PlayerJersey = ({ player, team, isActing, isTarget, isRedCarded, isFocused, isAutoEventing }) => {
  const isGK = player.pos === 'GK';
  const isBarca = team === 'Barcelona' || team === 'barcelona';

  const bodyColor = isGK 
    ? (isBarca ? '#FACC15' : '#FB923C') 
    : (isBarca ? '#004D98' : '#005BAC');
    
  const sleeveColor = isGK 
    ? (isBarca ? '#EAB308' : '#EA580C') 
    : (isBarca ? '#A50044' : '#FFFFFF');
    
  const numberColor = isGK && isBarca ? '#0B0F19' : '#FFFFFF';
  const collarColor = isBarca ? '#FACC15' : '#FFFFFF';

  if (isRedCarded) return null; // Sent off

  return (
    <g style={{ cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      {/* PLAYER FOCUS MODE: Spotlight Halo and Rotating Radar */}
      {isFocused && (
        <g>
          <circle r="36" fill="none" stroke="#F59E0B" strokeWidth="2.5" opacity="0.9">
            <animate attributeName="r" values="26;44" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle r="30" fill="rgba(245, 158, 11, 0.18)" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
          </circle>
          {/* Live Speed Tag */}
          <g transform="translate(0, -28)">
            <rect x="-32" y="-8" width="64" height="15" rx="4" fill="rgba(15, 23, 42, 0.95)" stroke="#F59E0B" strokeWidth="1" />
            <text textAnchor="middle" y="3" fill="#F59E0B" fontSize="8.5" fontWeight="900" fontFamily="mono">
              ⚡ {player.topSpeed || '32.1'} km/h
            </text>
          </g>
        </g>
      )}

      {/* AUTO-EVENTING VISION AI: Computer Vision Bounding Box */}
      {isAutoEventing && (
        <g transform="translate(-22, -26)">
          <rect width="44" height="52" fill="none" stroke="#8B5CF6" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.85" />
          <rect x="0" y="-10" width="44" height="10" fill="rgba(139, 92, 246, 0.9)" />
          <text x="2" y="-2" fill="#FFFFFF" fontSize="7" fontWeight="900" fontFamily="mono">
            #{player.num} 98.4%
          </text>
        </g>
      )}

      {/* Dynamic Movement Halo */}
      {isActing && !isFocused && (
        <g>
          <circle r="26" fill="none" stroke="#8B5CF6" strokeWidth="2.5" opacity="0.8">
            <animate attributeName="r" values="16;36" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <ellipse cx="0" cy="14" rx="20" ry="6" fill="rgba(139, 92, 246, 0.3)" />
        </g>
      )}

      {/* Target Recipient Beacon */}
      {isTarget && (
        <g>
          <circle r="22" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 3">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
          </circle>
          <ellipse cx="0" cy="14" rx="16" ry="5" fill="rgba(59, 130, 246, 0.25)" />
        </g>
      )}

      {/* Ground Shadow */}
      <ellipse cx="0" cy="15" rx="12" ry="4" fill="rgba(0, 0, 0, 0.6)" />

      {/* FOOTBALL JERSEY SHAPE */}
      <g 
        filter={isFocused ? "drop-shadow(0 0 14px #F59E0B)" : isActing ? "drop-shadow(0 0 10px rgba(139, 92, 246, 0.8))" : isTarget ? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.7))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"}
        transform={isFocused || isActing ? "scale(1.18)" : "scale(1.0)"}
        style={{ transition: 'transform 0.3s ease' }}
      >
        {/* Left Sleeve */}
        <path d="M -8 -13 L -17 -5 L -14 0 L -8 -3 Z" fill={sleeveColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
        {/* Right Sleeve */}
        <path d="M 8 -13 L 17 -5 L 14 0 L 8 -3 Z" fill={sleeveColor} stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
        {/* Main Body */}
        <path d="M -8 -13 L 8 -13 L 8 13 Q 0 15 -8 13 Z" fill={bodyColor} stroke="rgba(0,0,0,0.35)" strokeWidth="0.8" />
        {/* Barcelona Blaugrana Stripe */}
        {isBarca && !isGK && <rect x="-3" y="-13" width="6" height="26" fill="#A50044" opacity="0.9" />}
        {/* Alavés White Stripe */}
        {!isBarca && !isGK && <rect x="-3" y="-13" width="6" height="26" fill="#FFFFFF" opacity="0.9" />}
        {/* Collar V-Neck */}
        <path d="M -4 -13 Q 0 -9 4 -13" fill="none" stroke={collarColor} strokeWidth="1.8" />
        {/* Number */}
        <text x="0" y="3" textAnchor="middle" fill={numberColor} fontSize="10" fontWeight="900" fontFamily="'JetBrains Mono', monospace" letterSpacing="-0.5">
          {player.num}
        </text>
      </g>

      {/* Player Nameplate Badge */}
      <g transform="translate(0, 23)">
        <rect 
          x="-34" 
          y="-6" 
          width="68" 
          height="14" 
          rx="4" 
          fill={isFocused ? "rgba(245, 158, 11, 0.95)" : isActing ? "rgba(124, 58, 237, 0.95)" : isTarget ? "rgba(59, 130, 246, 0.9)" : "rgba(11, 15, 25, 0.88)"} 
          stroke={isFocused ? "#F59E0B" : isActing ? "#8B5CF6" : isTarget ? "#3B82F6" : "rgba(255, 255, 255, 0.15)"} 
          strokeWidth={isFocused || isActing || isTarget ? "1.5" : "0.8"} 
        />
        <text 
          textAnchor="middle" 
          y="4" 
          fill={isFocused || isActing ? "#FFFFFF" : "#FFFFFF"} 
          fontSize="8.5" 
          fontWeight="800"
          letterSpacing="0.2"
        >
          {player.name}
        </text>
      </g>
    </g>
  );
};

export const PitchBoard = ({ 
  currentEvent, 
  annotations = [], 
  height = { base: '260px', sm: '340px', md: '420px', lg: '450px' }, 
  currentMinute = 0, 
  currentSecond = 0, 
  viewFocus = 'both',
  replayState = null,
  onCloseReplay = null
}) => {
  // Player Focused Mode State
  const [focusedPlayerId, setFocusedPlayerId] = useState('all');
  // Auto-Eventing Vision AI Overlay State
  const [isAutoEventingVision, setIsAutoEventingVision] = useState(false);

  // Replay Mode Resolution
  const isReplaying = Boolean(replayState?.isReplaying);
  const activeEvent = (isReplaying && replayState?.event) ? replayState.event : currentEvent;

  // Convert 0-100 coordinates to SVG viewBox 0-1000 x 0-680
  const toX = (pct) => (pct / 100) * 1000;
  const toY = (pct) => (pct / 100) * 680;

  const ballX = activeEvent?.coordinates ? toX(activeEvent.coordinates.x) : 500;
  const ballY = activeEvent?.coordinates ? toY(activeEvent.coordinates.y) : 340;

  const endX = activeEvent?.endCoordinates ? toX(activeEvent.endCoordinates.x) : null;
  const endY = activeEvent?.endCoordinates ? toY(activeEvent.endCoordinates.y) : null;

  const isGoal = activeEvent?.type === 'goal';
  const isShot = activeEvent?.type?.includes('shot') || activeEvent?.type === 'goal';
  const isSedlarRedCarded = (currentMinute > 80) || (currentMinute === 80 && currentSecond >= 18);

  const formatTime = (min, sec) => {
    const m = String(min).padStart(2, '0');
    const s = String(sec).padStart(2, '0');
    return `${m}:${s}`;
  };

  const playerName = activeEvent?.player?.name || activeEvent?.player || 'Action';
  const teamName = activeEvent?.teamId === 'barcelona' || activeEvent?.team === 'Barcelona' ? 'FC Barcelona' : 'Alavés';

  const isFullTime = currentMinute >= 94 || activeEvent?.type === 'full_time';
  const isStoppage = currentMinute >= 90 && currentMinute < 94;

  // Real-time speed and pass quality telemetry calculation
  let passDistanceMeters = null;
  let ballSpeedKmh = null;
  let isSpeedThresholdTriggered = false;
  if (activeEvent?.coordinates && activeEvent?.endCoordinates) {
    const dx = (activeEvent.endCoordinates.x - activeEvent.coordinates.x) * 1.05;
    const dy = (activeEvent.endCoordinates.y - activeEvent.coordinates.y) * 0.68;
    passDistanceMeters = Math.round(Math.sqrt(dx * dx + dy * dy));
    
    if (isShot) {
      ballSpeedKmh = Math.round(92 + passDistanceMeters * 0.8);
      isSpeedThresholdTriggered = ballSpeedKmh >= 95;
    } else {
      ballSpeedKmh = Math.round(42 + (passDistanceMeters / 40) * 22);
      isSpeedThresholdTriggered = passDistanceMeters >= 35;
    }
  }

  // Find focused player object
  const focusedPlayer = ALL_PLAYERS.find(p => p.id === focusedPlayerId);

  return (
    <Box 
      position="relative" 
      w="100%" 
      h={height} 
      bg="linear-gradient(180deg, #133D26 0%, #0E2E1D 100%)"
      borderRadius="16px" 
      overflow="hidden" 
      border="1px solid rgba(255, 255, 255, 0.12)"
      boxShadow="inset 0 0 50px rgba(0, 0, 0, 0.6), 0 12px 35px rgba(0, 0, 0, 0.5)"
    >
      {/* Top HUD Header: Digital Clock, Live Action, Player Focus & Vision AI Toggle */}
      <Flex 
        position="absolute" 
        top={{ base: 2, sm: 3 }} 
        left={{ base: 2, sm: 4 }} 
        right={{ base: 2, sm: 4 }} 
        justify="space-between" 
        align="center" 
        zIndex={20} 
        pointerEvents="none"
        wrap="wrap"
        gap={1.5}
      >
        <HStack spacing={{ base: 1.5, sm: 2.5 }} wrap="wrap">
          <HStack bg="rgba(11, 15, 25, 0.9)" backdropFilter="blur(10px)" px={{ base: 2, sm: 3 }} py={1} borderRadius="10px" border="1px solid rgba(255, 255, 255, 0.12)">
            <Clock size={14} color="#8B5CF6" />
            <Text fontFamily="mono" fontSize={{ base: "xs", sm: "sm" }} fontWeight="800" color="#A78BFA">
              {formatTime(currentMinute || currentEvent?.minute || 0, currentSecond || currentEvent?.second || 0)}
            </Text>
          </HStack>

          {isReplaying ? (
            <HStack spacing={2} pointerEvents="auto">
              <Badge 
                bg="#00F0FF" 
                color="#070B14" 
                fontSize={{ base: "10px", sm: "xs" }} 
                fontWeight="900" 
                px={{ base: 2, sm: 3 }} 
                py={1} 
                borderRadius="8px" 
                boxShadow="0 0 18px rgba(0, 240, 255, 0.8)"
                animation="pulse 1.2s infinite"
                display="inline-flex"
                alignItems="center"
                gap={1.5}
                letterSpacing="wider"
              >
                <Zap size={13} color="#070B14" />
                ⚡ AI INSTANT REPLAY
              </Badge>
              {onCloseReplay && (
                <Button 
                  size="xs" 
                  bg="rgba(0, 240, 255, 0.2)"
                  color="#00F0FF"
                  border="1px solid #00F0FF"
                  _hover={{ bg: "#00F0FF", color: "#070B14" }}
                  onClick={onCloseReplay} 
                  fontSize="10px" 
                  fontWeight="800"
                  borderRadius="8px"
                  px={2}
                >
                  Skip ⏩
                </Button>
              )}
            </HStack>
          ) : isFullTime ? (
            <Badge bg="#7C3AED" color="#FFFFFF" fontSize={{ base: "10px", sm: "xs" }} fontWeight="900" px={{ base: 2, sm: 3 }} py={1} borderRadius="8px" boxShadow="0 0 15px rgba(124, 58, 237, 0.5)">
              🏆 FULL TIME
            </Badge>
          ) : isStoppage ? (
            <Badge bg="rgba(245, 158, 11, 0.2)" color="#FBBF24" border="1px solid rgba(245, 158, 11, 0.5)" fontSize={{ base: "10px", sm: "xs" }} fontWeight="900" px={{ base: 2, sm: 3 }} py={1} borderRadius="8px" animation="pulse 1.4s infinite">
              ⏱️ 90'+4'
            </Badge>
          ) : activeEvent ? (
            <Badge 
              bg={isGoal ? '#7C3AED' : activeEvent.teamId === 'barcelona' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(100, 116, 139, 0.3)'}
              color="#FFFFFF"
              border="1px solid rgba(255, 255, 255, 0.2)"
              fontSize={{ base: "10px", sm: "xs" }}
              px={{ base: 2, sm: 3 }}
              py={1}
              borderRadius="8px"
              maxW={{ base: "130px", sm: "240px", md: "none" }}
              isTruncated
            >
              {isGoal ? '⚽ GOAL!' : activeEvent.type?.toUpperCase().replace('_', ' ')}: {playerName}
            </Badge>
          ) : (
            <Badge bg="rgba(255, 255, 255, 0.12)" color="white" borderRadius="8px" fontSize={{ base: "9.5px", sm: "xs" }} px={2}>
              MATCH READY
            </Badge>
          )}

          {/* Speed & Distance Threshold Alert Pill */}
          {isSpeedThresholdTriggered && ballSpeedKmh && (
            <Badge bg="#F59E0B" color="#0B0F19" fontSize="9.5px" px={2} py={0.5} borderRadius="full" fontWeight="900" display={{ base: "none", md: "inline-flex" }}>
              {isShot ? `⚡ ${ballSpeedKmh} km/h` : `🎯 ${passDistanceMeters}m`}
            </Badge>
          )}
        </HStack>

        {/* Right Controls: Player Focused Mode Dropdown & Vision AI Toggle */}
        <HStack spacing={1.5} pointerEvents="auto">
          {/* Player Focused Mode Selector */}
          <Select 
            size="xs" 
            w={{ base: "100px", sm: "140px", md: "165px" }}
            value={focusedPlayerId} 
            onChange={(e) => setFocusedPlayerId(e.target.value)}
            bg="#0D1527"
            color="#F1F5F9"
            borderColor="rgba(255, 255, 255, 0.2)"
            borderRadius="8px"
            fontSize="10px"
            fontWeight="700"
            sx={{
              '> option, > optgroup': {
                background: '#0D1527 !important',
                color: '#F1F5F9 !important'
              }
            }}
          >
            <option value="all" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>🌐 All Players</option>
            <option value="bar_fw_19" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>⭐ Lamine Yamal (#19)</option>
            <option value="bar_fw_9" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>⚽ Lewandowski (#9)</option>
            <option value="bar_mf_8" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>🪄 Pedri (#8)</option>
            <option value="bar_fw_11" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>⚡ Raphinha (#11)</option>
            <option value="ala_fw_17" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>🎯 Kike García (#17)</option>
          </Select>

          {/* Vision AI Auto-Eventing Model Toggle */}
          <Tooltip label="Simulate YOLOv8 + ByteTrack Computer Vision Auto-Eventing without manual tagging">
            <Button
              size="xs"
              variant={isAutoEventingVision ? "neon" : "glass"}
              leftIcon={<Eye size={11} />}
              onClick={() => setIsAutoEventingVision(!isAutoEventingVision)}
              fontSize="9.5px"
              borderRadius="8px"
              px={2}
              display={{ base: "none", sm: "inline-flex" }}
            >
              Vision AI {isAutoEventingVision ? "ON" : "OFF"}
            </Button>
          </Tooltip>
        </HStack>
      </Flex>

      {/* 2D Football Pitch SVG */}
      <svg viewBox="0 0 1000 680" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          {/* Alternating Mowed Grass Bands (Realistic Lawn Stripes) */}
          <pattern id="mowedStripe" width="92" height="680" patternUnits="userSpaceOnUse">
            <rect width="46" height="680" fill="#1C5232" />
            <rect x="46" width="46" height="680" fill="#154026" />
          </pattern>

          {/* Micro-Grass Blade Texture Grain */}
          <pattern id="grassFibers" width="16" height="16" patternUnits="userSpaceOnUse">
            <line x1="2" y1="14" x2="6" y2="2" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.8" />
            <line x1="9" y1="16" x2="13" y2="4" stroke="rgba(74, 222, 128, 0.06)" strokeWidth="0.8" />
            <line x1="13" y1="12" x2="15" y2="3" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="0.8" />
          </pattern>

          {/* Stadium Floodlight Radial Atmosphere */}
          <radialGradient id="stadiumFloodlights" cx="50%" cy="48%" r="62%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#154026" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#071A10" stopOpacity="0.55" />
          </radialGradient>

          {/* Goal Netting Mesh Pattern */}
          <pattern id="goalNetMesh" width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="0.5" />
          </pattern>

          <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#8B5CF6" />
          </marker>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#3B82F6" />
          </marker>
        </defs>

        {/* 1. Base Grassy Pitch Bed */}
        <rect width="1000" height="680" fill="#154026" />

        {/* 2. Alternating Mower Lanes */}
        <rect width="1000" height="680" fill="url(#mowedStripe)" />

        {/* 3. Micro Grass Blade Texture Overlay */}
        <rect width="1000" height="680" fill="url(#grassFibers)" />

        {/* 4. Stadium Floodlight Vignette */}
        <rect width="1000" height="680" fill="url(#stadiumFloodlights)" pointerEvents="none" />

        {/* Technical Dugout Boxes along Sideline */}
        <rect x="250" y="8" width="130" height="16" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="4 3" strokeWidth="1" />
        <rect x="620" y="8" width="130" height="16" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeDasharray="4 3" strokeWidth="1" />

        {/* Left Goal Depth Net (FC Barcelona) */}
        <rect x="18" y="295" width="22" height="90" fill="url(#goalNetMesh)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.2" />
        <rect x="25" y="295" width="15" height="90" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2.5" />

        {/* Right Goal Depth Net (Deportivo Alavés) */}
        <rect x="960" y="295" width="22" height="90" fill="url(#goalNetMesh)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1.2" />
        <rect x="960" y="295" width="15" height="90" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2.5" />

        {/* Outer Touchline & Goal Line Boundary */}
        <rect x="40" y="30" width="920" height="620" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />

        {/* Halfway Line & Center Circle */}
        <line x1="500" y1="30" x2="500" y2="650" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />
        <circle cx="500" cy="340" r="91.5" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />
        <circle cx="500" cy="340" r="4.5" fill="#FFFFFF" />

        {/* Left Penalty Area (Barcelona) */}
        <rect x="40" y="140" width="165" height="400" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />
        <rect x="40" y="240" width="55" height="200" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />
        <circle cx="150" cy="340" r="4.5" fill="#FFFFFF" />
        <path d="M 205 285 A 91.5 91.5 0 0 1 205 395" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />

        {/* Right Penalty Area (Alavés) */}
        <rect x="795" y="140" width="165" height="400" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />
        <rect x="905" y="240" width="55" height="200" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />
        <circle cx="850" cy="340" r="4.5" fill="#FFFFFF" />
        <path d="M 795 285 A 91.5 91.5 0 0 0 795 395" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2.5" />

        {/* 4 Corner Quarter Arcs */}
        <path d="M 40 46 A 16 16 0 0 0 56 30" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" />
        <path d="M 944 30 A 16 16 0 0 0 960 46" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" />
        <path d="M 56 650 A 16 16 0 0 0 40 634" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" />
        <path d="M 960 634 A 16 16 0 0 0 944 650" fill="none" stroke="rgba(255, 255, 255, 0.8)" strokeWidth="2" />

        {/* 4 Corner Flags */}
        <g>
          <circle cx="40" cy="30" r="2.5" fill="#FACC15" />
          <path d="M 40 30 L 40 18 L 50 23 Z" fill="#EF4444" />
          <circle cx="960" cy="30" r="2.5" fill="#FACC15" />
          <path d="M 960 30 L 960 18 L 970 23 Z" fill="#EF4444" />
          <circle cx="40" cy="650" r="2.5" fill="#FACC15" />
          <path d="M 40 650 L 40 638 L 50 643 Z" fill="#EF4444" />
          <circle cx="960" cy="650" r="2.5" fill="#FACC15" />
          <path d="M 960 650 L 960 638 L 970 643 Z" fill="#EF4444" />
        </g>

        {/* Auto-Eventing Homography Crosshairs */}
        {isAutoEventingVision && (
          <g opacity="0.6">
            <line x1="490" y1="340" x2="510" y2="340" stroke="#8B5CF6" strokeWidth="1" />
            <line x1="500" y1="330" x2="500" y2="350" stroke="#8B5CF6" strokeWidth="1" />
            <line x1="140" y1="340" x2="160" y2="340" stroke="#8B5CF6" strokeWidth="1" />
            <line x1="150" y1="330" x2="150" y2="350" stroke="#8B5CF6" strokeWidth="1" />
            <line x1="840" y1="340" x2="860" y2="340" stroke="#8B5CF6" strokeWidth="1" />
            <line x1="850" y1="330" x2="850" y2="350" stroke="#8B5CF6" strokeWidth="1" />
          </g>
        )}

        {/* Tactical Annotations */}
        {annotations.map((ann, idx) => {
          if (ann.type === 'zone') {
            return (
              <g key={`zone-${idx}`}>
                <rect x={toX(ann.x)} y={toY(ann.y)} width={toX(ann.width)} height={toY(ann.height)} fill={ann.color || 'rgba(59, 130, 246, 0.15)'} stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 4" rx="8" />
                <text x={toX(ann.x) + 8} y={toY(ann.y) + 18} fill="#93C5FD" fontSize="11" fontWeight="bold">{ann.label}</text>
              </g>
            );
          }
          if (ann.type === 'arrow' && ann.from && ann.to) {
            return (
              <line key={`ann-arr-${idx}`} x1={toX(ann.from.x)} y1={toY(ann.from.y)} x2={toX(ann.to.x)} y2={toY(ann.to.y)} stroke={ann.color || '#8B5CF6'} strokeWidth="3.5" markerEnd="url(#arrow-purple)" />
            );
          }
          return null;
        })}

        {/* Ball Action Vector */}
        {endX && endY && (
          <g>
            <line x1={ballX} y1={ballY} x2={endX} y2={endY} stroke={isGoal ? "#8B5CF6" : isShot ? "#F59E0B" : "#3B82F6"} strokeWidth="3.5" strokeDasharray={isShot ? "none" : "6 4"} markerEnd={isGoal || isShot ? "url(#arrow-purple)" : "url(#arrow-blue)"} />
          </g>
        )}

        {/* REPLAY MODE: Electric Animated Trajectory & Pulsing Target */}
        {isReplaying && activeEvent?.coordinates && activeEvent?.endCoordinates && (
          <g>
            <line 
              x1={toX(activeEvent.coordinates.x)} 
              y1={toY(activeEvent.coordinates.y)} 
              x2={toX(activeEvent.endCoordinates.x)} 
              y2={toY(activeEvent.endCoordinates.y)} 
              stroke="#00F0FF" 
              strokeWidth="4" 
              strokeDasharray="10 6" 
              filter="drop-shadow(0 0 12px #00F0FF)"
            >
              <animate attributeName="stroke-dashoffset" from="64" to="0" dur="0.8s" repeatCount="indefinite" />
            </line>
            <circle cx={toX(activeEvent.coordinates.x)} cy={toY(activeEvent.coordinates.y)} r="14" fill="rgba(0, 240, 255, 0.25)" stroke="#00F0FF" strokeWidth="2">
              <animate attributeName="r" values="8;22" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={toX(activeEvent.endCoordinates.x)} cy={toY(activeEvent.endCoordinates.y)} r="22" fill="none" stroke="#F59E0B" strokeWidth="2.5">
              <animate attributeName="r" values="12;34" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0" dur="1s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* RENDER FC BARCELONA JERSEYS */}
        {BARCELONA_PLAYERS.map((p) => {
          const isActing = (activeEvent?.teamId === 'barcelona' || activeEvent?.team === 'Barcelona') && 
            (activeEvent?.player?.id === p.id || activeEvent?.player?.name?.includes(p.name) || activeEvent?.player?.includes?.(p.name));
          
          const isTarget = activeEvent?.secondaryPlayer && 
            (activeEvent?.secondaryPlayer?.id === p.id || activeEvent?.secondaryPlayer?.name?.includes(p.name) || activeEvent?.recipient?.includes?.(p.name));

          const isFocused = focusedPlayerId === p.id;
          const isDimmed = (viewFocus === 'alaves') || (focusedPlayerId !== 'all' && !isFocused);

          const posX = isActing && activeEvent.coordinates ? toX(activeEvent.coordinates.x) : toX(p.x);
          const posY = isActing && activeEvent.coordinates ? toY(activeEvent.coordinates.y) : toY(p.y);

          return (
            <g key={p.id} transform={`translate(${posX}, ${posY})`} opacity={isDimmed ? 0.3 : 1}>
              <PlayerJersey 
                player={p} 
                team="Barcelona" 
                isActing={isActing} 
                isTarget={isTarget} 
                isFocused={isFocused}
                isAutoEventing={isAutoEventingVision}
              />
            </g>
          );
        })}

        {/* RENDER DEPORTIVO ALAVÉS JERSEYS */}
        {ALAVES_PLAYERS.map((p) => {
          const isActing = (activeEvent?.teamId === 'alaves' || activeEvent?.team === 'Alavés') && 
            (activeEvent?.player?.id === p.id || activeEvent?.player?.name?.includes(p.name) || activeEvent?.player?.includes?.(p.name));
          
          const isTarget = activeEvent?.secondaryPlayer && 
            (activeEvent?.secondaryPlayer?.id === p.id || activeEvent?.secondaryPlayer?.name?.includes(p.name) || activeEvent?.recipient?.includes?.(p.name));

          const isFocused = focusedPlayerId === p.id;
          const isDimmed = (viewFocus === 'barca') || (focusedPlayerId !== 'all' && !isFocused);
          const isRedCarded = p.num === 22 && isSedlarRedCarded;

          const posX = isActing && activeEvent.coordinates ? toX(activeEvent.coordinates.x) : toX(p.x);
          const posY = isActing && activeEvent.coordinates ? toY(activeEvent.coordinates.y) : toY(p.y);

          return (
            <g key={p.id} transform={`translate(${posX}, ${posY})`} opacity={isDimmed ? 0.3 : 1}>
              <PlayerJersey 
                player={p} 
                team="Alavés" 
                isActing={isActing} 
                isTarget={isTarget}
                isRedCarded={isRedCarded}
                isFocused={isFocused}
                isAutoEventing={isAutoEventingVision}
              />
            </g>
          );
        })}

        {/* Football with Pulse Waveform */}
        <g transform={`translate(${ballX}, ${ballY})`}>
          <circle r="16" fill="none" stroke={isGoal ? "#8B5CF6" : "#3B82F6"} strokeWidth="2" opacity="0.8">
            <animate attributeName="r" values="8;24" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0" dur="1.2s" repeatCount="indefinite" />
          </circle>

          {/* Crisp Match Ball */}
          <circle r="6.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle r="2" fill="#0B0F19" />

          {/* Vision AI Ball Object Detection Frame */}
          {isAutoEventingVision && (
            <g transform="translate(-16, -16)">
              <rect width="32" height="32" fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />
              <text x="0" y="-4" fill="#F59E0B" fontSize="6.5" fontWeight="900" fontFamily="mono">
                BALL 99.4% {ballSpeedKmh ? `${ballSpeedKmh}km/h` : ''}
              </text>
            </g>
          )}

          {/* Action HUD Banner Floating Over Ball */}
          {currentEvent && !isAutoEventingVision && (
            <g transform="translate(0, -18)">
              <rect x="-70" y="-13" width="140" height="18" rx="6" fill="rgba(11, 15, 25, 0.94)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.8" />
              <text textAnchor="middle" y="0" fill={isGoal ? "#C4B5FD" : "#FFFFFF"} fontSize="9.5" fontWeight="bold">
                ⚽ {playerName} ({currentEvent.type?.toUpperCase().replace('_', ' ')})
              </text>
            </g>
          )}
        </g>

        {/* Full-Time Center Pitch Banner */}
        {isFullTime && (
          <g transform="translate(500, 340)">
            <rect x="-260" y="-55" width="520" height="110" rx="18" fill="rgba(15, 23, 42, 0.96)" stroke="#F59E0B" strokeWidth="2.5" />
            <text textAnchor="middle" y="-24" fill="#F59E0B" fontSize="11" fontWeight="800" letterSpacing="3">
              🏆 FULL TIME RESULT
            </text>
            <text textAnchor="middle" y="6" fill="#FFFFFF" fontSize="24" fontWeight="900" letterSpacing="1">
              👑 FC BARCELONA WON 3 - 1
            </text>
            <text textAnchor="middle" y="38" fill="#C4B5FD" fontSize="12" fontWeight="800" letterSpacing="2">
              ESTADI OLÍMPIC LLUÍS COMPANYS
            </text>
          </g>
        )}
      </svg>

      {/* Auto-Eventing Vision AI Bottom Status Banner */}
      {isAutoEventingVision && (
        <Flex 
          position="absolute" 
          bottom={3} 
          left={4} 
          right={4} 
          bg="rgba(15, 23, 42, 0.92)" 
          backdropFilter="blur(12px)"
          border="1px solid rgba(139, 92, 246, 0.4)"
          borderRadius="10px"
          px={3}
          py={1.5}
          justify="space-between"
          align="center"
          fontSize="10px"
        >
          <HStack spacing={2}>
            <Box w="6px" h="6px" borderRadius="full" bg="#8B5CF6" animation="pulse 1.2s infinite" />
            <Text color="#A78BFA" fontWeight="800">COMPUTER VISION ENGINE ACTIVE</Text>
            <Text color="gray.300">YOLOv8 + ByteTrack • Pitch Homography 60 FPS • Auto-generating pass vectors & speed</Text>
          </HStack>
          <Badge bg="rgba(139, 92, 246, 0.15)" color="#C4B5FD">ZERO MANUAL TAGGING</Badge>
        </Flex>
      )}

      {/* PLAYER FOCUS MODE: Floating Telemetry HUD Card */}
      {focusedPlayer && (
        <Box
          position="absolute"
          bottom={4}
          left={4}
          bg="rgba(15, 23, 42, 0.94)"
          backdropFilter="blur(14px)"
          border="1px solid rgba(245, 158, 11, 0.5)"
          borderRadius="14px"
          p={3}
          boxShadow="0 8px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.15)"
          minW="220px"
        >
          <Flex justify="space-between" align="center" mb={2}>
            <HStack spacing={1.5}>
              <User size={13} color="#F59E0B" />
              <Text fontSize="10px" fontWeight="900" color="#F59E0B" textTransform="uppercase" letterSpacing="wider">
                PLAYER SPOTLIGHT CAM
              </Text>
            </HStack>
            <Badge bg="rgba(245, 158, 11, 0.2)" color="#FBBF24" fontSize="9px">
              #{focusedPlayer.num} {focusedPlayer.pos}
            </Badge>
          </Flex>

          <Text fontSize="sm" fontWeight="900" color="white" mb={2}>
            {focusedPlayer.name}
          </Text>

          <Flex justify="space-between" fontSize="10px" color="gray.300" borderTop="1px solid rgba(255, 255, 255, 0.08)" pt={2}>
            <VStack spacing={0} align="start">
              <Text color="gray.500">Top Speed</Text>
              <Text fontWeight="800" color="#F59E0B">{focusedPlayer.topSpeed} km/h</Text>
            </VStack>

            <VStack spacing={0} align="start">
              <Text color="gray.500">Distance</Text>
              <Text fontWeight="800" color="white">{focusedPlayer.distanceKm} km</Text>
            </VStack>

            <VStack spacing={0} align="start">
              <Text color="gray.500">Touches</Text>
              <Text fontWeight="800" color="white">{focusedPlayer.touches}</Text>
            </VStack>

            <VStack spacing={0} align="start">
              <Text color="gray.500">Pass Acc</Text>
              <Text fontWeight="800" color="#A78BFA">{focusedPlayer.passAcc}%</Text>
            </VStack>
          </Flex>
        </Box>
      )}

      {/* AI TACTICAL RECAP FLOATING BANNER (Visible during key moment replay) */}
      {isReplaying && (
        <Box
          position="absolute"
          bottom={3}
          left="50%"
          transform="translateX(-50%)"
          w="calc(100% - 24px)"
          maxW="680px"
          bg="rgba(11, 15, 25, 0.96)"
          backdropFilter="blur(20px)"
          border="2px solid #00F0FF"
          borderRadius="16px"
          p={3.5}
          zIndex={35}
          boxShadow="0 12px 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(0, 240, 255, 0.35)"
        >
          <Flex justify="space-between" align="center" mb={1.5} wrap="wrap" gap={2}>
            <HStack spacing={2}>
              <Badge bg="#00F0FF" color="#070B14" fontWeight="900" fontSize="11px" px={2.5} py={0.5} borderRadius="6px">
                AI RECAP
              </Badge>
              <Text fontSize="xs" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="wider">
                {activeEvent?.minute}' {activeEvent?.type === 'goal' ? '⚽ Goal Breakdown' : activeEvent?.type === 'red_card' ? '🟥 Red Card Analysis' : '⚠️ Key Turning Point'}
              </Text>
            </HStack>

            <HStack spacing={2.5} fontSize="11px">
              {activeEvent?.xg && (
                <Text color="gray.300">
                  xG: <Text as="span" color="#00F0FF" fontWeight="800">{activeEvent.xg}</Text>
                </Text>
              )}
              {ballSpeedKmh && (
                <Text color="gray.300">
                  Speed: <Text as="span" color="#FBBF24" fontWeight="800">{ballSpeedKmh} km/h</Text>
                </Text>
              )}
              {onCloseReplay && (
                <Button size="xs" variant="ghost" color="#00F0FF" onClick={onCloseReplay} fontSize="10px">
                  Resume Match ▶
                </Button>
              )}
            </HStack>
          </Flex>

          <Text fontSize="xs" color="gray.200" lineHeight="tall" fontWeight="500">
            {replayState?.tacticalExplanation || activeEvent?.description}
          </Text>
        </Box>
      )}

    </Box>
  );
};
