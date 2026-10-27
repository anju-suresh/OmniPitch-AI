import React from 'react';
import { 
  Modal, ModalOverlay, ModalContent, ModalBody, Box, Flex, HStack, VStack, 
  Text, Badge, Button, Grid, Divider, IconButton 
} from '@chakra-ui/react';
import { Trophy, RotateCcw, Sparkles, X, Activity, Award } from 'lucide-react';

export const MatchOverModal = ({ 
  isOpen, 
  onClose, 
  matchState, 
  onReset,
  onViewStudio 
}) => {
  const homeScore = matchState?.homeScore ?? 3;
  const awayScore = matchState?.awayScore ?? 1;
  const homeTeam = matchState?.homeTeam?.name || 'FC Barcelona';
  const awayTeam = matchState?.awayTeam?.name || 'Deportivo Alavés';
  const homeFormation = matchState?.homeTeam?.formation || '4-3-3';
  const awayFormation = matchState?.awayTeam?.formation || '4-4-2';

  const isBarcaWin = homeScore > awayScore;
  const isAlavesWin = awayScore > homeScore;
  const isDraw = homeScore === awayScore;

  // Exact format requested: Bold big letters on screen: "team A won and the goal 2-1 eg."
  const winningHeadline = isBarcaWin 
    ? `${homeTeam.toUpperCase()} WON ${homeScore} - ${awayScore}` 
    : isAlavesWin 
    ? `${awayTeam.toUpperCase()} WON ${awayScore} - ${homeScore}` 
    : `MATCH DRAWN ${homeScore} - ${awayScore}`;

  const stats = matchState?.stats || {};
  const barcaStats = stats.barcelona || stats.arsenal || { shots: 14, possession: 64, xG: 2.15, passAccuracy: 89 };
  const alavesStats = stats.alaves || stats.chelsea || { shots: 6, possession: 36, xG: 0.78, passAccuracy: 78 };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "xl", md: "2xl" }} isCentered motionPreset="scale">
      <ModalOverlay bg="rgba(4, 7, 13, 0.92)" backdropFilter="blur(20px)" />
      <ModalContent 
        bg="#0F172A" 
        borderRadius={{ base: "0px", sm: "24px" }}
        border="1px solid rgba(245, 158, 11, 0.4)"
        boxShadow="0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(245, 158, 11, 0.2)"
        overflow="hidden"
        mx={{ base: 0, sm: 4 }}
        color="#F8FAFC"
      >
        <ModalBody p={0}>
          
          {/* Header Banner */}
          <Box 
            p={{ base: 6, md: 8 }} 
            bg="linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 1) 100%)"
            borderBottom="1px solid rgba(255, 255, 255, 0.08)"
            textAlign="center"
            position="relative"
            className="broadcast-shimmer"
          >
            <IconButton 
              size="xs" 
              position="absolute" 
              top={4} 
              right={4} 
              variant="ghost" 
              onClick={onClose}
              color="gray.400"
              _hover={{ color: "white", bg: "rgba(255, 255, 255, 0.1)" }}
              icon={<X size={16} />}
              aria-label="Close"
            />

            <HStack justify="center" spacing={2} mb={2}>
              <Trophy size={20} color="#F59E0B" />
              <Badge 
                bg="rgba(245, 158, 11, 0.18)" 
                color="#FBBF24" 
                border="1px solid rgba(245, 158, 11, 0.35)"
                fontSize="11px" 
                fontWeight="800" 
                px={3} 
                py={0.8} 
                borderRadius="full"
                letterSpacing="widest"
              >
                FULL TIME • OFFICIAL RESULT
              </Badge>
            </HStack>

            {/* BOLD BIG LETTERS ON SCREEN: TEAM WON AND SCORE */}
            <VStack spacing={1} my={4}>
              <Text 
                fontSize={{ base: "28px", sm: "36px", md: "46px" }} 
                fontWeight="900" 
                color="#FFFFFF" 
                textTransform="uppercase"
                letterSpacing="tight"
                lineHeight="1.15"
              >
                👑 {winningHeadline}
              </Text>
              
              <Text fontSize="xs" color="#94A3B8" fontWeight="600" textTransform="uppercase" letterSpacing="widest">
                La Liga EA Sports • Matchday 23 • Estadi Olímpic Lluís Companys
              </Text>
            </VStack>
          </Box>

          {/* Center Stage: Team Badges & Scoreboard */}
          <Box p={{ base: 5, md: 8 }}>
            
            <Grid templateColumns="1fr auto 1fr" gap={{ base: 3, md: 6 }} alignItems="center" mb={6}>
              
              {/* Home: Barcelona */}
              <VStack spacing={2} textAlign="center">
                <Box 
                  w={{ base: "52px", md: "64px" }} 
                  h={{ base: "52px", md: "64px" }} 
                  borderRadius="18px" 
                  bg="linear-gradient(135deg, #004D98 0%, #A50044 100%)" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  fontSize="28px"
                  boxShadow="0 8px 24px rgba(0, 77, 152, 0.4)"
                  border={isBarcaWin ? "2px solid #8B5CF6" : "1px solid rgba(255, 255, 255, 0.2)"}
                >
                  🔵🔴
                </Box>
                <Text fontWeight="900" fontSize={{ base: "sm", md: "md" }} color="white" lineHeight="1.2">
                  {homeTeam}
                </Text>
                <Badge bg="rgba(59, 130, 246, 0.15)" color="#93C5FD" fontSize="10px">
                  {homeFormation}
                </Badge>
              </VStack>

              {/* Big Center Scoreboard Display */}
              <VStack spacing={1.5} px={2}>
                <HStack spacing={{ base: 3, md: 5 }}>
                  <Text 
                    fontSize={{ base: "40px", md: "56px" }} 
                    fontWeight="900" 
                    fontFamily="mono" 
                    color={isBarcaWin ? "#A78BFA" : "white"}
                    lineHeight="1"
                  >
                    {homeScore}
                  </Text>
                  <Text fontSize={{ base: "24px", md: "32px" }} fontWeight="800" color="gray.500" lineHeight="1">
                    -
                  </Text>
                  <Text 
                    fontSize={{ base: "40px", md: "56px" }} 
                    fontWeight="900" 
                    fontFamily="mono" 
                    color={isAlavesWin ? "#A78BFA" : "white"}
                    lineHeight="1"
                  >
                    {awayScore}
                  </Text>
                </HStack>
                <Badge 
                  bg="rgba(139, 92, 246, 0.15)" 
                  color="#C4B5FD" 
                  border="1px solid rgba(139, 92, 246, 0.3)"
                  fontSize="10px" 
                  px={3} 
                  py={0.8} 
                  borderRadius="full" 
                  fontWeight="800"
                >
                  {isBarcaWin ? "3 POINTS SECURED" : isAlavesWin ? "AWAY VICTORY" : "HONOURS EVEN"}
                </Badge>
              </VStack>

              {/* Away: Alavés */}
              <VStack spacing={2} textAlign="center">
                <Box 
                  w={{ base: "52px", md: "64px" }} 
                  h={{ base: "52px", md: "64px" }} 
                  borderRadius="18px" 
                  bg="linear-gradient(135deg, #005BAC 0%, #1E3A8A 100%)" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  fontSize="28px"
                  boxShadow="0 8px 24px rgba(0, 91, 172, 0.4)"
                  border={isAlavesWin ? "2px solid #8B5CF6" : "1px solid rgba(255, 255, 255, 0.2)"}
                >
                  🔵⚪
                </Box>
                <Text fontWeight="900" fontSize={{ base: "sm", md: "md" }} color="white" lineHeight="1.2">
                  {awayTeam}
                </Text>
                <Badge bg="rgba(0, 91, 172, 0.25)" color="#BFDBFE" fontSize="10px">
                  {awayFormation}
                </Badge>
              </VStack>

            </Grid>

            {/* Goal Scorers Timeline Card */}
            <Box bg="#111827" p={4} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)" mb={5}>
              <Text fontSize="11px" fontWeight="800" color="gray.400" textTransform="uppercase" mb={3} textAlign="center" letterSpacing="wider">
                ⚽ Official Goal Scorers
              </Text>
              
                {/* Home Team Scorers (Dynamically Extracted from Events History) */}
                <VStack align="start" spacing={1.5} borderRight="1px solid rgba(255, 255, 255, 0.08)" pr={3}>
                  <Text fontSize="xs" color="#60A5FA" fontWeight="800">{homeTeam} ({homeScore})</Text>
                  {(() => {
                    const homeEvents = (matchState?.eventsHistory || []).filter(e => 
                      (e.teamId === 'barcelona' || e.team === homeTeam || e.team === 'FC Barcelona') && (e.type === 'goal' || e.type === 'red_card')
                    );
                    if (homeEvents.length === 0) {
                      return <Text fontSize="xs" color="gray.500">No goals or dismissals</Text>;
                    }
                    return homeEvents.map((e, idx) => {
                      const pName = typeof e.player === 'object' ? (e.player?.name || 'Player') : (e.player || 'Player');
                      const icon = e.type === 'goal' ? '⚽' : '🟥';
                      const suffix = e.metadata?.shotType === 'penalty' ? ' (P)' : '';
                      return (
                        <Text key={e.id || idx} fontSize="xs" color="gray.300">
                          {icon} {e.minute}' {pName}{suffix}
                        </Text>
                      );
                    });
                  })()}
                </VStack>

                {/* Away Team Scorers (Dynamically Extracted from Events History) */}
                <VStack align="start" spacing={1.5} pl={2}>
                  <Text fontSize="xs" color="#93C5FD" fontWeight="800">{awayTeam} ({awayScore})</Text>
                  {(() => {
                    const awayEvents = (matchState?.eventsHistory || []).filter(e => 
                      (e.teamId === 'alaves' || e.team === awayTeam || e.team === 'Deportivo Alavés') && (e.type === 'goal' || e.type === 'red_card')
                    );
                    if (awayEvents.length === 0) {
                      return <Text fontSize="xs" color="gray.500">No goals or dismissals</Text>;
                    }
                    return awayEvents.map((e, idx) => {
                      const pName = typeof e.player === 'object' ? (e.player?.name || 'Player') : (e.player || 'Player');
                      const icon = e.type === 'goal' ? '⚽' : '🟥';
                      const suffix = e.type === 'red_card' ? ' (Red Card)' : '';
                      return (
                        <Text key={e.id || idx} fontSize="xs" color={e.type === 'red_card' ? '#F87171' : 'gray.300'}>
                          {icon} {e.minute}' {pName}{suffix}
                        </Text>
                      );
                    });
                  })()}
                </VStack>
            </Box>

            {/* Quick Match Telemetry */}
            <Grid templateColumns="repeat(3, 1fr)" gap={3} mb={6} textAlign="center">
              <Box p={3} bg="#111827" borderRadius="12px" border="1px solid rgba(255, 255, 255, 0.06)">
                <Text fontSize="10px" color="gray.400" textTransform="uppercase">Possession</Text>
                <Text fontSize="md" fontWeight="800" color="white" mt={1}>
                  {barcaStats.possession || 64}% - {alavesStats.possession || 36}%
                </Text>
              </Box>

              <Box p={3} bg="#111827" borderRadius="12px" border="1px solid rgba(255, 255, 255, 0.06)">
                <Text fontSize="10px" color="gray.400" textTransform="uppercase">Expected Goals (xG)</Text>
                <Text fontSize="md" fontWeight="800" color="#A78BFA" mt={1}>
                  {barcaStats.xG || '2.15'} - {alavesStats.xG || '0.78'}
                </Text>
              </Box>

              <Box p={3} bg="#111827" borderRadius="12px" border="1px solid rgba(255, 255, 255, 0.06)">
                <Text fontSize="10px" color="gray.400" textTransform="uppercase">Total Shots</Text>
                <Text fontSize="md" fontWeight="800" color="white" mt={1}>
                  {barcaStats.shots || 14} - {alavesStats.shots || 6}
                </Text>
              </Box>
            </Grid>

            {/* Action Buttons */}
            <Flex justify="center" gap={3} wrap="wrap">
              <Button 
                variant="neon" 
                size="md" 
                leftIcon={<Sparkles size={16} />}
                onClick={() => {
                  onClose();
                  if (onViewStudio) onViewStudio();
                }}
              >
                View AI Tactical Recap
              </Button>

              <Button 
                variant="glass" 
                size="md" 
                leftIcon={<RotateCcw size={16} />}
                onClick={() => {
                  onClose();
                  if (onReset) onReset();
                }}
              >
                Replay Match
              </Button>

              <Button 
                variant="ghost" 
                size="md" 
                onClick={onClose}
                color="gray.400"
                _hover={{ color: "white" }}
              >
                Dismiss Scoreboard
              </Button>
            </Flex>

          </Box>

        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
