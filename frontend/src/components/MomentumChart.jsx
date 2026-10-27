import React from 'react';
import { Box, Flex, HStack, Text, Badge } from '@chakra-ui/react';
import { Activity } from 'lucide-react';

export const MomentumChart = ({ momentum, stats }) => {
  const score = momentum?.score ?? 0; // -100 to +100
  const dominantTeam = momentum?.dominantTeam ?? 'Neutral';
  
  // Transform score to 0 - 100 percentage for progress bar (0 = full Alavés, 50 = balance, 100 = full Barcelona)
  const normalizedValue = Math.min(Math.max(((score + 100) / 200) * 100, 0), 100);

  const barcaXG = stats?.barcelona?.xG ?? stats?.arsenal?.xG ?? 0.0;
  const alavesXG = stats?.alaves?.xG ?? stats?.chelsea?.xG ?? 0.0;
  const totalXG = (barcaXG + alavesXG) || 1;
  const barcaXGPct = totalXG > 1 ? (barcaXG / totalXG) * 100 : 50;

  return (
    <Box 
      bg="#111827" 
      p={4} 
      borderRadius="16px" 
      border="1px solid rgba(255, 255, 255, 0.08)"
      boxShadow="0 8px 24px rgba(0, 0, 0, 0.4)"
    >
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <Activity size={16} color="#3B82F6" />
          <Text fontSize="xs" fontWeight="700" color="gray.300" textTransform="uppercase" letterSpacing="wider">
            Match Momentum & Pressure Index
          </Text>
        </HStack>
        <Badge 
          bg={dominantTeam === 'Barcelona' ? 'rgba(139, 92, 246, 0.15)' : dominantTeam === 'Alavés' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.08)'}
          color={dominantTeam === 'Barcelona' ? '#C4B5FD' : dominantTeam === 'Alavés' ? '#93C5FD' : 'gray.300'}
          border="1px solid rgba(255,255,255,0.1)"
          fontSize="10px"
        >
          {dominantTeam === 'Neutral' ? 'Equilibrium' : `${dominantTeam} Pressure (+${Math.abs(score)})`}
        </Badge>
      </Flex>

      {/* Momentum Tug-of-War Bar */}
      <Box position="relative" my={3}>
        <Flex justify="space-between" fontSize="10px" color="gray.400" mb={1} fontWeight="700">
          <Text color="#60A5FA">◀ ALAVÉS</Text>
          <Text color="gray.400" display={{ base: "none", sm: "block" }}>MIDFIELD EQUILIBRIUM</Text>
          <Text color="#A78BFA">BARÇA ▶</Text>
        </Flex>

        {/* Custom Duel Progress Bar */}
        <Box h="10px" w="100%" bg="#0B0F19" borderRadius="full" overflow="hidden" position="relative" border="1px solid rgba(255,255,255,0.1)">
          {/* Center marker */}
          <Box position="absolute" left="50%" top={0} bottom={0} w="2px" bg="white" zIndex={2} opacity={0.4} />

          {/* Indicator fill */}
          <Box 
            position="absolute"
            left={score < 0 ? `${normalizedValue}%` : '50%'}
            w={`${Math.abs(score / 2)}%`}
            top={0}
            bottom={0}
            bg={score >= 0 ? 'linear-gradient(90deg, #F59E0B, #8B5CF6)' : 'linear-gradient(90deg, #3B82F6, #1D4ED8)'}
            borderRadius="full"
            transition="all 0.4s ease"
          />
        </Box>
      </Box>

      {/* Cumulative Expected Goals (xG) Duel */}
      <Box mt={3} pt={2} borderTop="1px solid rgba(255, 255, 255, 0.05)">
        <Flex justify="space-between" fontSize="11px" fontWeight="700" mb={1}>
          <Text color="#A78BFA">Barcelona xG: {Number(barcaXG).toFixed(2)}</Text>
          <Text color="gray.400">Expected Goals (xG)</Text>
          <Text color="#60A5FA">Alavés xG: {Number(alavesXG).toFixed(2)}</Text>
        </Flex>
        <Flex h="6px" w="100%" borderRadius="full" overflow="hidden" bg="#0B0F19">
          <Box w={`${barcaXGPct}%`} bg="#8B5CF6" transition="all 0.4s ease" />
          <Box w={`${100 - barcaXGPct}%`} bg="#3B82F6" transition="all 0.4s ease" />
        </Flex>
      </Box>
    </Box>
  );
};
