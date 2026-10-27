import React from 'react';
import { Box, Flex, HStack, VStack, Text, Button, Badge, Tooltip } from '@chakra-ui/react';
import { Play, Pause, RotateCcw, Zap, Activity, Volume2, VolumeX } from 'lucide-react';

/**
 * Dedicated Pitch Playback Controls Component
 * Layout: Football Pitch → Play/Pause Button → Reset Button, Voice Commentary & Speed Controls (0.5x, 1x, 1.5x, 2x)
 */
export const PitchPlaybackControls = ({
  matchState,
  onTogglePlay,
  onReset,
  speedMultiplier = 1,
  onSpeedChange,
  isVoiceEnabled = true,
  onToggleVoice
}) => {
  const isLive = matchState?.status === 'live';
  const isPaused = matchState?.status === 'paused';
  const isFullTime = matchState?.status === 'full_time';
  const isIdle = matchState?.status === 'idle' || !matchState?.status;

  const minute = matchState?.currentMinute ?? 0;
  const second = matchState?.currentSecond ?? 0;

  const SPEED_OPTIONS = [
    { value: 0.5, label: '0.5x', desc: 'Relaxed Pace' },
    { value: 1, label: '1x', desc: 'Standard Pace' },
    { value: 1.5, label: '1.5x', desc: 'Accelerated' },
    { value: 2, label: '2x', desc: 'Fast Forward' }
  ];

  return (
    <Box 
      w="100%" 
      bg="linear-gradient(180deg, rgba(13, 21, 39, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)"
      border="1px solid rgba(255, 255, 255, 0.08)"
      borderRadius="16px"
      p={{ base: 3, sm: 4 }}
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
      mt={3}
    >
      <VStack spacing={3} align="stretch">
        
        {/* ROW 1: PROMINENT PLAY / PAUSE BUTTON DIRECTLY BELOW THE PITCH */}
        <Button
          size="lg"
          h={{ base: "48px", sm: "54px" }}
          w="100%"
          onClick={onTogglePlay}
          variant={isLive ? "glass" : "neon"}
          bg={
            isLive 
              ? "rgba(139, 92, 246, 0.16)" 
              : "linear-gradient(90deg, #00F0FF 0%, #38BDF8 50%, #8B5CF6 100%)"
          }
          color={isLive ? "#FFFFFF" : "#070B14"}
          border={isLive ? "1.5px solid rgba(139, 92, 246, 0.6)" : "1.5px solid #00F0FF"}
          boxShadow={
            isLive 
              ? "0 0 20px rgba(139, 92, 246, 0.35)" 
              : "0 0 28px rgba(0, 240, 255, 0.45), 0 4px 14px rgba(0, 0, 0, 0.6)"
          }
          _hover={{
            bg: isLive 
              ? "rgba(139, 92, 246, 0.28)" 
              : "linear-gradient(90deg, #38BDF8 0%, #00F0FF 100%)",
            boxShadow: isLive 
              ? "0 0 28px rgba(139, 92, 246, 0.55)" 
              : "0 0 36px rgba(0, 240, 255, 0.65)",
            transform: "translateY(-1px)"
          }}
          _active={{
            transform: "translateY(1px)"
          }}
          borderRadius="12px"
          fontSize={{ base: "sm", sm: "md" }}
          fontWeight="900"
          letterSpacing="0.04em"
          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <HStack spacing={3} justify="center" align="center">
            {isLive ? (
              <>
                <Box 
                  w="10px" 
                  h="10px" 
                  borderRadius="full" 
                  bg="#EF4444" 
                  boxShadow="0 0 10px #EF4444"
                  animation="pulse 1.2s infinite"
                />
                <Pause size={20} color="#FFFFFF" />
                <Text>PAUSE MATCH SIMULATION ({String(minute).padStart(2, '0')}:{String(second).padStart(2, '0')})</Text>
              </>
            ) : isPaused ? (
              <>
                <Box 
                  w="10px" 
                  h="10px" 
                  borderRadius="full" 
                  bg="#00F0FF" 
                  boxShadow="0 0 10px #00F0FF"
                />
                <Play size={20} fill="#070B14" color="#070B14" />
                <Text>RESUME MATCH (At {String(minute).padStart(2, '0')}:{String(second).padStart(2, '0')})</Text>
              </>
            ) : isFullTime ? (
              <>
                <RotateCcw size={20} color="#070B14" />
                <Text>MATCH FINISHED • RESTART FROM KICKOFF</Text>
              </>
            ) : (
              <>
                <Play size={22} fill="#070B14" color="#070B14" />
                <Text>START MATCH • LIVE PITCH ACTION</Text>
                <Badge 
                  bg="rgba(7, 11, 20, 0.25)" 
                  color="#070B14" 
                  fontSize="10px" 
                  px={2} 
                  py={0.5} 
                  borderRadius="6px"
                  fontWeight="900"
                >
                  00:00
                </Badge>
              </>
            )}
          </HStack>
        </Button>

        {/* ROW 2: RESET BUTTON & PLAYBACK SPEED CONTROLS BELOW PLAY/PAUSE */}
        <Flex 
          justify="space-between" 
          align="center" 
          wrap="wrap" 
          gap={2.5}
          pt={1}
          borderTop="1px solid rgba(255, 255, 255, 0.05)"
        >
          {/* Left Action Buttons: Reset & Voice Commentary */}
          <HStack spacing={2} wrap="wrap">
            {/* Reset Button */}
            <Button
              size="sm"
              h="36px"
              variant="ghost"
              leftIcon={<RotateCcw size={15} color="#94A3B8" />}
              onClick={onReset}
              bg="rgba(255, 255, 255, 0.04)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              color="gray.300"
              _hover={{
                bg: "rgba(239, 68, 68, 0.12)",
                color: "#FCA5A5",
                borderColor: "rgba(239, 68, 68, 0.35)"
              }}
              borderRadius="10px"
              fontSize="xs"
              fontWeight="700"
              px={3.5}
              title="Restart the match from the beginning (00:00), reset score, clock, stats & restore initial player formations"
            >
              Reset Match (00:00)
            </Button>

            {/* Voice Commentary Button (Directly beside Reset Button) */}
            {onToggleVoice && (
              <Tooltip label={isVoiceEnabled ? "Voice Commentary Active (Click to Mute)" : "Voice Commentary Muted (Click to Unmute)"}>
                <Button
                  size="sm"
                  h="36px"
                  variant={isVoiceEnabled ? "neon" : "ghost"}
                  leftIcon={isVoiceEnabled ? <Volume2 size={15} color="#00F0FF" /> : <VolumeX size={15} color="#F87171" />}
                  onClick={onToggleVoice}
                  bg={isVoiceEnabled ? "rgba(0, 240, 255, 0.12)" : "rgba(255, 255, 255, 0.04)"}
                  border="1px solid"
                  borderColor={isVoiceEnabled ? "#00F0FF" : "rgba(255, 255, 255, 0.1)"}
                  color={isVoiceEnabled ? "#00F0FF" : "gray.400"}
                  _hover={{
                    bg: isVoiceEnabled ? "rgba(0, 240, 255, 0.22)" : "rgba(248, 113, 113, 0.15)",
                    color: isVoiceEnabled ? "#FFFFFF" : "#FCA5A5",
                    borderColor: isVoiceEnabled ? "#38BDF8" : "rgba(248, 113, 113, 0.35)"
                  }}
                  borderRadius="10px"
                  fontSize="xs"
                  fontWeight="700"
                  px={3}
                >
                  Voice: {isVoiceEnabled ? "Active 🔊" : "Muted 🔇"}
                </Button>
              </Tooltip>
            )}
          </HStack>

          {/* Speed Controls: 0.5x, 1x, 1.5x, 2x */}
          <HStack 
            spacing={1} 
            bg="rgba(0, 0, 0, 0.45)" 
            p="3px" 
            borderRadius="10px" 
            border="1px solid rgba(255, 255, 255, 0.08)"
          >
            <HStack spacing={1} px={2} display={{ base: 'none', sm: 'flex' }}>
              <Zap size={13} color="#00F0FF" />
              <Text fontSize="11px" color="gray.400" fontWeight="700">Speed:</Text>
            </HStack>

            {SPEED_OPTIONS.map((opt) => {
              const isSelected = speedMultiplier === opt.value;
              return (
                <Button
                  key={opt.value}
                  size="xs"
                  h="28px"
                  px={{ base: 2.5, sm: 3 }}
                  fontSize="11px"
                  fontWeight="800"
                  fontFamily="'JetBrains Mono', monospace"
                  variant={isSelected ? 'neon' : 'ghost'}
                  color={isSelected ? '#070B14' : 'gray.400'}
                  bg={isSelected ? '#00F0FF' : 'transparent'}
                  boxShadow={isSelected ? '0 0 12px rgba(0, 240, 255, 0.4)' : 'none'}
                  _hover={{
                    color: isSelected ? '#070B14' : '#FFFFFF',
                    bg: isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.06)'
                  }}
                  borderRadius="7px"
                  onClick={() => onSpeedChange && onSpeedChange(opt.value)}
                  title={`${opt.label} (${opt.desc})`}
                >
                  {opt.label}
                </Button>
              );
            })}
          </HStack>

          {/* Current Status Pill */}
          <HStack spacing={1.5} px={2} py={1} borderRadius="8px" bg="rgba(255, 255, 255, 0.03)" border="1px solid rgba(255, 255, 255, 0.06)">
            <Box 
              w="6px" 
              h="6px" 
              borderRadius="full" 
              bg={isLive ? "#00F0FF" : isPaused ? "#F59E0B" : "gray.500"} 
            />
            <Text fontSize="11px" color="gray.300" fontWeight="700" textTransform="uppercase">
              {isLive ? `Live (${speedMultiplier}x)` : isPaused ? 'Paused' : isFullTime ? 'Full Time' : 'Ready'}
            </Text>
          </HStack>
        </Flex>

      </VStack>
    </Box>
  );
};
