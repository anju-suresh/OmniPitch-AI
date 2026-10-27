import React, { useState } from 'react';
import { 
  Box, Grid, GridItem, Flex, HStack, VStack, Text, Badge, Button, 
  Progress, useToast, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, 
  DrawerContent, DrawerCloseButton, useDisclosure 
} from '@chakra-ui/react';
import { Tv, Bookmark, ThumbsUp, Sparkles, Film, Lock } from 'lucide-react';
import { PitchBoard } from '../components/PitchBoard.jsx';
import { MatchdayHeroCard } from '../components/MatchdayHeroCard.jsx';
import { MatchTimeline } from '../components/MatchTimeline.jsx';
import { PitchPlaybackControls } from '../components/PitchPlaybackControls.jsx';

export const OTTView = ({ 
  matchState, 
  selectedEvent, 
  onSelectEvent, 
  onStartMatch,
  replayState = null,
  onCloseReplay = null,
  onTogglePlay = null,
  onReset = null,
  speedMultiplier = 1,
  onSpeedChange = null,
  isVoiceEnabled = true,
  onToggleVoice = null,
  ottPoll = null,
  onVoteOTTPoll = null
}) => {
  const toast = useToast();
  
  // Use persistent prediction state from top-level App or fallback to local
  const [localPollVote, setLocalPollVote] = useState(null);
  const [localHasVoted, setLocalHasVoted] = useState(false);

  const hasVoted = ottPoll ? Boolean(ottPoll.hasVoted) : localHasVoted;
  const pollVote = ottPoll ? ottPoll.vote : localPollVote;

  // Responsive Drawer for Small Devices
  const { 
    isOpen: isOTTDrawerOpen, 
    onOpen: onOTTDrawerOpen, 
    onClose: onOTTDrawerClose 
  } = useDisclosure();
  const [ottDrawerTab, setOttDrawerTab] = useState('highlights'); // 'highlights' | 'poll'

  const openDrawerWithTab = (tab) => {
    setOttDrawerTab(tab);
    onOTTDrawerOpen();
  };

  const currentEvt = selectedEvent || matchState?.eventsHistory?.[0];

  const handleVote = (val) => {
    if (onVoteOTTPoll) {
      onVoteOTTPoll(val);
    } else {
      setLocalPollVote(val);
      setLocalHasVoted(true);
    }
    toast({
      title: 'Prediction Locked!',
      description: `Your prediction (${val === 'yes' ? 'Yes, Barca Attack' : 'No, Alavés Block'}) has been locked and recorded.`,
      status: 'success',
      duration: 2000
    });
  };

  const renderHighlights = () => {
    const history = matchState?.eventsHistory || [];
    const keyHighlights = history.filter(e => 
      e.type === 'goal' || 
      e.type === 'red_card' || 
      e.type === 'penalty_awarded' || 
      e.isKeyMomentCandidate === true
    );

    if (keyHighlights.length === 0) {
      return (
        <Box p={3} borderRadius="8px" bg="#0B0F19" border="1px dashed rgba(255, 255, 255, 0.08)" textAlign="center">
          <Text color="gray.400">Match streaming live. AI auto-eventing will generate synced highlight cut-clips as goals & key inflection plays occur.</Text>
        </Box>
      );
    }

    return keyHighlights.map((evt, idx) => {
      const pName = typeof evt.player === 'object' ? (evt.player?.name || 'Player') : (evt.player || 'Player');
      const isBarca = evt.teamId === 'barcelona' || evt.team === 'Barcelona';
      const isSelected = selectedEvent?.id === evt.id || selectedEvent?.eventId === evt.eventId;

      let badgeColor = evt.type === 'goal' ? '#8B5CF6' : evt.type === 'red_card' ? '#EF4444' : '#3B82F6';
      let clipTag = evt.type === 'goal' ? '30s Reel' : '20s Clip';

      return (
        <Box 
          key={evt.id || evt.eventId || idx}
          p={2.5} 
          borderRadius="8px" 
          bg={isSelected ? "rgba(139, 92, 246, 0.15)" : "#0B0F19"}
          border="1px solid"
          borderColor={isSelected ? "#8B5CF6" : "rgba(255, 255, 255, 0.06)"}
          cursor="pointer"
          onClick={() => {
            if (onSelectEvent) onSelectEvent(evt);
            onOTTDrawerClose();
          }}
          _hover={{ borderColor: "#8B5CF6", bg: "rgba(139, 92, 246, 0.08)" }}
          transition="all 0.2s ease"
        >
          <Flex justify="space-between" align="center">
            <Text fontWeight="700" color={isBarca ? "#A78BFA" : "#93C5FD"}>
              {evt.minute}' {pName} {evt.type === 'goal' ? '⚽ Goal' : evt.type === 'red_card' ? '🟥 Red Card' : '⭐ Key Moment'}
            </Text>
            <Badge bg={badgeColor} color="#FFFFFF" fontSize="9px" px={2} borderRadius="4px">
              {clipTag}
            </Badge>
          </Flex>
          <Text color={evt.aiCommentary ? "gray.200" : "gray.400"} mt={1} noOfLines={2} fontSize="11px">
            {evt.aiCommentary?.broadcastCall || evt.description}
          </Text>
        </Box>
      );
    });
  };

  const renderPoll = () => (
    <Box bg="#111827" p={5} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)">
      <Flex justify="space-between" align="center" mb={3}>
        <HStack spacing={2}>
          <ThumbsUp size={16} color="#8B5CF6" />
          <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="gray.300">
            Live Stream Audience Prediction
          </Text>
        </HStack>
        {hasVoted && (
          <Badge bg="rgba(139, 92, 246, 0.2)" color="#C4B5FD" fontSize="10px" px={2} py={0.5} borderRadius="full" border="1px solid rgba(139, 92, 246, 0.3)">
            🔒 LOCKED
          </Badge>
        )}
      </Flex>

      <Text fontSize="sm" fontWeight="700" color="white" mb={3}>
        Will FC Barcelona score another goal before the 90th minute?
      </Text>

      <VStack spacing={3} align="stretch">
        <Box>
          <Flex justify="space-between" fontSize="xs" fontWeight="700" mb={1}>
            <Text color="#A78BFA">Yes, Barca Attack (72%)</Text>
            <Text color="gray.400">14.8k Votes</Text>
          </Flex>
          <Progress value={72} size="sm" colorScheme="purple" borderRadius="full" />
        </Box>

        <Box>
          <Flex justify="space-between" fontSize="xs" fontWeight="700" mb={1}>
            <Text color="#3B82F6">No, Alavés Block (28%)</Text>
            <Text color="gray.400">5.2k Votes</Text>
          </Flex>
          <Progress value={28} size="sm" colorScheme="blue" borderRadius="full" />
        </Box>

        {/* Both 'Yes' and 'No' Buttons */}
        <HStack spacing={2} mt={2}>
          <Button 
            flex={1}
            size="sm" 
            variant={hasVoted ? (pollVote === 'yes' ? 'neon' : 'ghost') : 'glass'}
            bg={hasVoted && pollVote === 'yes' ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : undefined}
            color={hasVoted && pollVote === 'yes' ? '#FFFFFF' : hasVoted ? 'gray.500' : 'white'}
            border={hasVoted && pollVote === 'yes' ? '1px solid #A78BFA' : '1px solid rgba(255, 255, 255, 0.1)'}
            opacity={hasVoted && pollVote !== 'yes' ? 0.35 : 1}
            isDisabled={hasVoted}
            onClick={() => handleVote('yes')}
            _hover={!hasVoted ? { bg: "rgba(139, 92, 246, 0.2)", borderColor: "#8B5CF6" } : undefined}
            fontSize="xs"
            fontWeight="700"
          >
            {hasVoted && pollVote === 'yes' ? 'Locked: Yes ✓' : 'Vote Yes'}
          </Button>

          <Button 
            flex={1}
            size="sm" 
            variant={hasVoted ? (pollVote === 'no' ? 'neon' : 'ghost') : 'glass'}
            bg={hasVoted && pollVote === 'no' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : undefined}
            color={hasVoted && pollVote === 'no' ? '#FFFFFF' : hasVoted ? 'gray.500' : 'white'}
            border={hasVoted && pollVote === 'no' ? '1px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.1)'}
            opacity={hasVoted && pollVote !== 'no' ? 0.35 : 1}
            isDisabled={hasVoted}
            onClick={() => handleVote('no')}
            _hover={!hasVoted ? { bg: "rgba(59, 130, 246, 0.2)", borderColor: "#3B82F6" } : undefined}
            fontSize="xs"
            fontWeight="700"
          >
            {hasVoted && pollVote === 'no' ? 'Locked: No ✓' : 'Vote No'}
          </Button>
        </HStack>

        {hasVoted && (
          <Flex 
            p={2} 
            borderRadius="8px" 
            bg="rgba(139, 92, 246, 0.1)" 
            border="1px solid rgba(139, 92, 246, 0.25)" 
            align="center" 
            justify="center" 
            gap={2}
          >
            <Lock size={12} color="#A78BFA" />
            <Text fontSize="11px" fontWeight="600" color="#E2E8F0">
              Prediction Locked: <Text as="span" fontWeight="700" color={pollVote === 'yes' ? "#A78BFA" : "#60A5FA"}>
                {pollVote === 'yes' ? 'Yes, Barca Attack' : 'No, Alavés Block'}
              </Text> • Preserved for this match
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );

  return (
    <Box p={{ base: 3, md: 6 }} pb={{ base: "84px", lg: "24px" }} position="relative">
      
      {/* Header */}
      <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
        <HStack spacing={2.5}>
          <Box p={2} borderRadius="8px" bg="rgba(59, 130, 246, 0.12)">
            <Tv size={18} color="#3B82F6" />
          </Box>
          <Text fontSize="lg" fontWeight="800" color="white">
            OTT Streaming Companion & Interactive Player
          </Text>
        
        </HStack>
        <Text fontSize="xs" color="gray.400">
          Click any key moment on the timeline to replay tactical coordinates
        </Text>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={5}>
        
        {/* Left / Center (8 cols): Simulated Broadcast Video Player & Chalkboard Overlay */}
        <GridItem colSpan={{ base: 12, lg: 8 }}>
          <VStack spacing={4} align="stretch">
            
            {/* Interactive Simulated Broadcast Screen */}
            <Box 
              position="relative" 
              bg="#0B0F19" 
              borderRadius="16px" 
              overflow="hidden" 
              border="1px solid rgba(255, 255, 255, 0.08)"
              boxShadow="0 12px 40px rgba(0, 0, 0, 0.6)"
            >
              {/* Pre-Match Matchday Cover (Initial Design) or Live Pitch Canvas */}
              {matchState?.status === 'idle' ? (
                <MatchdayHeroCard 
                  matchState={matchState} 
                  onStartMatch={onTogglePlay || onStartMatch} 
                  height={{ base: "260px", sm: "320px", md: "400px" }} 
                />
              ) : (
                <PitchBoard 
                  currentEvent={currentEvt} 
                  currentMinute={matchState?.currentMinute}
                  currentSecond={matchState?.currentSecond}
                  height={{ base: "260px", sm: "320px", md: "400px" }} 
                  replayState={replayState}
                  onCloseReplay={onCloseReplay}
                />
              )}

              {/* Streaming Overlay HUD */}
              <Flex 
                position="absolute" 
                bottom={3} 
                left={4} 
                right={4} 
                justify="space-between" 
                align="center"
                bg="rgba(15, 23, 42, 0.85)"
                backdropFilter="blur(12px)"
                p={2.5}
                borderRadius="12px"
                border="1px solid rgba(255, 255, 255, 0.08)"
              >
                <HStack spacing={3}>
                  <Badge bg="#EF4444" color="white" borderRadius="4px" px={2}>LIVE </Badge>
                  <Text fontSize="xs" fontWeight="700" color="white" isTruncated maxW={{ base: "180px", md: "400px" }}>
                    {currentEvt ? `${currentEvt.minute}' - ${currentEvt.description}` : 'Live broadcast stream running'}
                  </Text>
                </HStack>

                <HStack spacing={2}>
                  <Button 
                    size="xs" 
                    variant="glass" 
                    leftIcon={<Bookmark size={12} />}
                    onClick={() => toast({ title: 'Bookmark saved to My Highlights', status: 'info', duration: 1200 })}
                  >
                    Clip Moment
                  </Button>
                </HStack>
              </Flex>
            </Box>

            {/* Football Pitch Playback Controls (Active when match is live/paused) */}
            {matchState?.status !== 'idle' && (
              <PitchPlaybackControls 
                matchState={matchState}
                onTogglePlay={onTogglePlay || onStartMatch}
                onReset={onReset}
                speedMultiplier={speedMultiplier}
                onSpeedChange={onSpeedChange}
                isVoiceEnabled={isVoiceEnabled}
                onToggleVoice={onToggleVoice}
              />
            )}

            {/* Clickable Interactive Timeline */}
            <MatchTimeline 
              events={matchState?.eventsHistory || []} 
              selectedEvent={selectedEvent} 
              onSelectEvent={onSelectEvent} 
            />

            {/* Mobile Touch Drawer Trigger Button */}
            <Box display={{ base: 'block', lg: 'none' }} pt={1}>
              <Button
                w="100%"
                size="md"
                bg="rgba(59, 130, 246, 0.12)"
                color="#60A5FA"
                border="1px solid rgba(59, 130, 246, 0.4)"
                borderRadius="12px"
                leftIcon={<Film size={16} />}
                onClick={() => openDrawerWithTab('highlights')}
                _hover={{ bg: "rgba(59, 130, 246, 0.2)" }}
                fontWeight="800"
                fontSize="xs"
              >
                OPEN HIGHLIGHT CLIPS & FAN POLL DRAWER
              </Button>
            </Box>

          </VStack>
        </GridItem>

        {/* Right Column (4 cols): Live Viewer Poll & Dynamic Tactics */}
        <GridItem colSpan={{ base: 12, lg: 4 }}>
          <VStack spacing={4} align="stretch">
            
            {/* Live Interactive Fan Poll */}
            {renderPoll()}

            {/* Curated Highlight Markers Manifest */}
            <Box bg="#111827" p={4} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)">
              <Flex justify="space-between" align="center" mb={3}>
                <HStack spacing={2}>
                  <Bookmark size={16} color="#F59E0B" />
                  <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="gray.300">
                    Smart Highlight Cut-List
                  </Text>
                </HStack>
                <Badge bg="rgba(245, 158, 11, 0.15)" color="#FBBF24" fontSize="10px">
                  {(matchState?.eventsHistory || []).filter(e => e.type === 'goal' || e.type === 'red_card' || e.isKeyMomentCandidate).length} CLIPS
                </Badge>
              </Flex>

              <VStack spacing={2.5} align="stretch" fontSize="xs" maxH="320px" overflowY="auto">
                {renderHighlights()}
              </VStack>
            </Box>

          </VStack>
        </GridItem>

      </Grid>

      {/* MOBILE FLOATING DOCK BAR: Smart Highlights & Live Poll */}
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="fixed"
        bottom={3}
        left="50%"
        transform="translateX(-50%)"
        zIndex={90}
        w="calc(100% - 24px)"
        maxW="400px"
      >
        <Flex
          bg="rgba(11, 15, 25, 0.95)"
          backdropFilter="blur(20px)"
          border="1px solid rgba(59, 130, 246, 0.4)"
          borderRadius="14px"
          p={1.5}
          justify="space-between"
          align="center"
          boxShadow="0 8px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(59, 130, 246, 0.2)"
        >
          <Button
            size="sm"
            flex={1}
            variant="ghost"
            leftIcon={<Film size={14} color={ottDrawerTab === 'highlights' ? '#60A5FA' : '#94A3B8'} />}
            color={ottDrawerTab === 'highlights' ? '#60A5FA' : 'gray.300'}
            bg={ottDrawerTab === 'highlights' ? 'rgba(59, 130, 246, 0.15)' : 'transparent'}
            fontSize="xs"
            fontWeight="700"
            borderRadius="9px"
            onClick={() => openDrawerWithTab('highlights')}
            py={4}
          >
            Highlights
          </Button>

          <Button
            size="sm"
            flex={1}
            variant="ghost"
            leftIcon={<ThumbsUp size={14} color={ottDrawerTab === 'poll' ? '#60A5FA' : '#94A3B8'} />}
            color={ottDrawerTab === 'poll' ? '#60A5FA' : 'gray.300'}
            bg={ottDrawerTab === 'poll' ? 'rgba(59, 130, 246, 0.15)' : 'transparent'}
            fontSize="xs"
            fontWeight="700"
            borderRadius="9px"
            onClick={() => openDrawerWithTab('poll')}
            py={4}
          >
            Live Poll
          </Button>
        </Flex>
      </Box>

      {/* MOBILE OTT DRAWER (Bottom Sheet) */}
      <Drawer
        isOpen={isOTTDrawerOpen}
        placement="bottom"
        onClose={onOTTDrawerClose}
        size="full"
      >
        <DrawerOverlay bg="rgba(4, 7, 13, 0.85)" backdropFilter="blur(14px)" />
        <DrawerContent
          bg="#0D1527"
          borderTop="2px solid #3B82F6"
          borderTopRadius="22px"
          maxH="82vh"
          color="white"
          boxShadow="0 -12px 40px rgba(0, 0, 0, 0.95)"
        >
          <Box w="38px" h="4px" bg="rgba(255, 255, 255, 0.25)" borderRadius="full" mx="auto" mt={2.5} />

          <DrawerHeader pt={2} pb={3} borderBottom="1px solid rgba(255, 255, 255, 0.08)">
            <Flex justify="space-between" align="center" pr={8}>
              <HStack spacing={2}>
                <Film size={16} color="#3B82F6" />
                <Text fontSize="sm" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="wider">
                  OTT Broadcast Extras
                </Text>
              </HStack>
              <Badge bg="rgba(59, 130, 246, 0.15)" color="#93C5FD" border="1px solid #3B82F6" fontSize="10px">
                {ottDrawerTab.toUpperCase()}
              </Badge>
            </Flex>

            {/* In-Drawer Tab Selector */}
            <HStack spacing={2} mt={3} bg="#070B14" p={1} borderRadius="10px">
              <Button
                size="xs"
                flex={1}
                bg={ottDrawerTab === 'highlights' ? '#3B82F6' : 'transparent'}
                color={ottDrawerTab === 'highlights' ? 'white' : 'gray.400'}
                fontWeight="800"
                onClick={() => setOttDrawerTab('highlights')}
                borderRadius="7px"
              >
                Highlights Cut-List
              </Button>
              <Button
                size="xs"
                flex={1}
                bg={ottDrawerTab === 'poll' ? '#3B82F6' : 'transparent'}
                color={ottDrawerTab === 'poll' ? 'white' : 'gray.400'}
                fontWeight="800"
                onClick={() => setOttDrawerTab('poll')}
                borderRadius="7px"
              >
                Live Fan Poll
              </Button>
            </HStack>
          </DrawerHeader>

          <DrawerCloseButton color="gray.400" top={3} right={3} _hover={{ color: "white" }} />

          <DrawerBody px={{ base: 3, sm: 5 }} py={4} overflowY="auto">
            {ottDrawerTab === 'highlights' ? (
              <VStack spacing={2.5} align="stretch" fontSize="xs">
                {renderHighlights()}
              </VStack>
            ) : (
              renderPoll()
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

    </Box>
  );
};
