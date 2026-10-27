import React, { useState } from 'react';
import { 
  Box, Flex, HStack, Text, Badge, Button, Table, Thead, Tbody, Tr, Th, Td 
} from '@chakra-ui/react';
import { ListFilter, Clock, CheckCircle2 } from 'lucide-react';

const TIME_RANGES = [
  { label: 'All 0–90’', min: 0, max: 120 },
  { label: '0–15’', min: 0, max: 15 },
  { label: '15–30’', min: 15, max: 30 },
  { label: '30–45’', min: 30, max: 45 },
  { label: '45–60’', min: 45, max: 60 },
  { label: '60–75’', min: 60, max: 75 },
  { label: '75–90’+', min: 75, max: 120 }
];

export const KeyEventsTable = ({ events = [], onSelectEvent, selectedEventId }) => {
  const [activeRange, setActiveRange] = useState(TIME_RANGES[0]);

  // Filter events based on selected time range
  const filteredEvents = events.filter(e => {
    return e.minute >= activeRange.min && e.minute <= activeRange.max;
  });

  return (
    <Box bg="#111827" p={4} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)">
      
      {/* Header & Time Range Filter Selector */}
      <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={3}>
        <HStack spacing={2}>
          <ListFilter size={16} color="#8B5CF6" />
          <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="white" letterSpacing="wider">
            Key Events Table
          </Text>
          <Badge bg="rgba(139, 92, 246, 0.15)" color="#C4B5FD" border="1px solid rgba(139, 92, 246, 0.3)" fontSize="10px">
            {filteredEvents.length} Events
          </Badge>
        </HStack>

        {/* Time Range Selector Buttons (User Core Feature 3 Requirement) */}
        <HStack spacing={1} overflowX="auto" py={1} maxW="100%">
          {TIME_RANGES.map((range) => {
            const isSelected = activeRange.label === range.label;
            return (
              <Button
                key={range.label}
                size="xs"
                bg={isSelected ? "rgba(139, 92, 246, 0.08)" : "transparent"}
                color={isSelected ? "#C4B5FD" : "gray.400"}
                border={isSelected ? "1px solid #8B5CF6" : "1px solid rgba(255, 255, 255, 0.08)"}
                boxShadow={isSelected ? "0 0 14px rgba(139, 92, 246, 0.25)" : "none"}
                _hover={{
                  color: "#FFFFFF",
                  borderColor: isSelected ? "#C4B5FD" : "rgba(139, 92, 246, 0.35)",
                  bg: "rgba(139, 92, 246, 0.15)"
                }}
                onClick={() => setActiveRange(range)}
                fontSize="10px"
                fontWeight="700"
                px={2.5}
                py={1}
                borderRadius="6px"
              >
                {range.label}
              </Button>
            );
          })}
        </HStack>
      </Flex>

      {/* Events Table (Inspired by Reference Image) */}
      <Box overflowX="auto" maxH="280px" overflowY="auto">
        <Table variant="unstyled" size="sm">
          <Thead position="sticky" top={0} bg="#0B0F19" zIndex={2}>
            <Tr borderBottom="1px solid rgba(255, 255, 255, 0.08)">
              <Th color="gray.400" fontSize="10px" textTransform="uppercase" py={2}>Time</Th>
              <Th color="gray.400" fontSize="10px" textTransform="uppercase" py={2}>Event</Th>
              <Th color="gray.400" fontSize="10px" textTransform="uppercase" py={2}>Team</Th>
              <Th color="gray.400" fontSize="10px" textTransform="uppercase" py={2}>Player</Th>
              <Th color="gray.400" fontSize="10px" textTransform="uppercase" py={2}>Description</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEvents.length === 0 ? (
              <Tr>
                <Td colSpan={5} textAlign="center" py={6} color="gray.500" fontSize="xs">
                  No events recorded in the {activeRange.label} window yet.
                </Td>
              </Tr>
            ) : (
              filteredEvents.map((evt, idx) => {
                const isSelected = selectedEventId === (evt.eventId || evt.id);
                const isBarca = evt.teamId === 'barcelona' || evt.team === 'Barcelona' || evt.team === 'FC Barcelona';
                const pName = typeof evt.player === 'object' ? (evt.player?.name || 'Player') : (evt.player || 'Player');
                const teamName = evt.team || (isBarca ? 'FC Barcelona' : 'Deportivo Alavés');

                let badgeColor = 'gray';
                if (evt.type === 'goal') badgeColor = 'purple';
                else if (evt.type === 'red_card') badgeColor = 'red';
                else if (evt.type === 'yellow_card') badgeColor = 'yellow';
                else if (evt.type?.includes('shot')) badgeColor = 'blue';
                else if (evt.type === 'penalty_awarded') badgeColor = 'purple';

                return (
                  <Tr 
                    key={evt.eventId || evt.id || idx}
                    bg={isSelected ? "rgba(139, 92, 246, 0.18)" : idx % 2 === 0 ? "rgba(255, 255, 255, 0.015)" : "transparent"}
                    _hover={{ bg: "rgba(139, 92, 246, 0.12)", cursor: "pointer" }}
                    onClick={() => onSelectEvent && onSelectEvent(evt)}
                    borderBottom="1px solid rgba(255, 255, 255, 0.04)"
                    transition="all 0.15s ease"
                  >
                    {/* Time */}
                    <Td py={2} fontSize="11px" fontFamily="mono" color={isSelected ? "#A78BFA" : "gray.300"}>
                      {String(evt.minute).padStart(2, '0')}:{String(evt.second || 0).padStart(2, '0')}
                    </Td>

                    {/* Event Type */}
                    <Td py={2}>
                      <Badge colorScheme={badgeColor} fontSize="9px" px={1.5} borderRadius="4px" textTransform="uppercase">
                        {evt.type?.replace(/_/g, ' ')}
                      </Badge>
                    </Td>

                    {/* Team */}
                    <Td py={2} fontSize="11px" fontWeight="700" color={isBarca ? "#93C5FD" : "#60A5FA"}>
                      <HStack spacing={1}>
                        <Text>{isBarca ? "🔵🔴" : "🔵⚪"}</Text>
                        <Text isTruncated maxW="90px">{teamName}</Text>
                      </HStack>
                    </Td>

                    {/* Player */}
                    <Td py={2} fontSize="11px" fontWeight="600" color="white">
                      {pName}
                    </Td>

                    {/* Description & AI Commentary */}
                    <Td py={2} fontSize="11px" color={evt.aiCommentary ? "#F1F5F9" : "gray.300"} maxW="360px">
                      <HStack spacing={1.5}>
                        {evt.aiCommentary && (
                          <Badge bg="rgba(0, 240, 255, 0.15)" color="#00F0FF" fontSize="9px" px={1} borderRadius="3px">
                            ⚡ AI
                          </Badge>
                        )}
                        <Text isTruncated>
                          {evt.aiCommentary?.broadcastCall || evt.description}
                        </Text>
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </Box>

    </Box>
  );
};
