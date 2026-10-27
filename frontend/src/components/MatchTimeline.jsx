import React from 'react';
import { Box, Flex, HStack, Text, Badge, VStack } from '@chakra-ui/react';
import { Clock } from 'lucide-react';

export const MatchTimeline = ({ events = [], selectedEvent, onSelectEvent }) => {
  // Filter for key inflection events (goals, shots, cards)
  const keyEvents = events.filter(e => ['goal', 'shot', 'card', 'tackle', 'penalty_awarded'].includes(e.type));

  const getEventBadge = (type) => {
    switch (type) {
      case 'goal':
        return <Badge bg="rgba(139, 92, 246, 0.2)" color="#C4B5FD" border="1px solid rgba(139, 92, 246, 0.4)">⚽ GOAL</Badge>;
      case 'shot':
        return <Badge bg="rgba(245, 158, 11, 0.2)" color="#FBBF24" border="1px solid rgba(245, 158, 11, 0.4)">🎯 SHOT</Badge>;
      case 'card':
        return <Badge bg="rgba(239, 68, 68, 0.2)" color="#F87171" border="1px solid rgba(239, 68, 68, 0.4)">🟨 CARD</Badge>;
      case 'penalty_awarded':
        return <Badge bg="rgba(139, 92, 246, 0.2)" color="#C4B5FD" border="1px solid rgba(139, 92, 246, 0.4)">⚠️ PENALTY</Badge>;
      default:
        return <Badge bg="rgba(59, 130, 246, 0.2)" color="#93C5FD">⚔️ DUEL</Badge>;
    }
  };

  return (
    <Box 
      bg="#111827" 
      p={4} 
      borderRadius="16px" 
      border="1px solid rgba(255, 255, 255, 0.08)"
      h="100%"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <HStack spacing={2}>
          <Clock size={16} color="#8B5CF6" />
          <Text fontSize="xs" fontWeight="700" color="gray.300" textTransform="uppercase" letterSpacing="wider">
            Key Match Inflections ({keyEvents.length})
          </Text>
        </HStack>
        <Text fontSize="10px" color="gray.400">Click to Inspect Tactics</Text>
      </Flex>

      <VStack spacing={2} align="stretch" maxH="280px" overflowY="auto" pr={1}>
        {keyEvents.length === 0 ? (
          <Text fontSize="xs" color="gray.500" textAlign="center" py={6}>
            Waiting for kickoff... Match events will populate here.
          </Text>
        ) : (
          keyEvents.map((evt) => {
            const isSelected = selectedEvent?.eventId === evt.eventId || selectedEvent?.id === evt.id;
            const pName = typeof evt.player === 'object' ? (evt.player?.name || 'Player') : (evt.player || 'Player');
            const isBarca = evt.teamId === 'barcelona' || evt.team === 'Barcelona' || evt.team === 'FC Barcelona';

            return (
              <Box
                key={evt.eventId || evt.id}
                p={2.5}
                borderRadius="10px"
                bg={isSelected ? 'rgba(139, 92, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)'}
                border="1px solid"
                borderColor={isSelected ? '#8B5CF6' : 'rgba(255, 255, 255, 0.06)'}
                cursor="pointer"
                onClick={() => onSelectEvent && onSelectEvent(evt)}
                _hover={{ bg: 'rgba(255, 255, 255, 0.07)', borderColor: 'rgba(255, 255, 255, 0.15)' }}
                transition="all 0.2s ease"
              >
                <Flex justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Text fontWeight="800" fontSize="xs" color="white" fontFamily="mono">
                      {evt.minute}'
                    </Text>
                    {getEventBadge(evt.type)}
                    <Text fontSize="xs" fontWeight="700" color={isBarca ? '#93C5FD' : '#60A5FA'}>
                      {pName}
                    </Text>
                  </HStack>

                  {(evt.xg || evt.metrics?.xG) > 0 && (
                    <Text fontSize="10px" fontFamily="mono" color="gray.400">
                      xG {evt.xg || evt.metrics.xG}
                    </Text>
                  )}
                </Flex>

                <Text fontSize="11px" color={evt.aiCommentary ? "#F1F5F9" : "gray.300"} mt={1} noOfLines={1}>
                  {evt.aiCommentary?.broadcastCall || evt.description}
                </Text>
              </Box>
            );
          })
        )}
      </VStack>
    </Box>
  );
};
