import React from 'react';
import { 
  Box, Flex, HStack, VStack, Text, Button, Badge, Tooltip, IconButton,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { 
  Zap, Radio, Tv, Users, Database, Volume2, VolumeX, LayoutGrid, Menu 
} from 'lucide-react';

export const Navbar = ({ 
  matchState, 
  activePersona, 
  setActivePersona, 
  isVoiceEnabled = true,
  onToggleVoice,
  isBackendConnected = true
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isLive = matchState?.status === 'live';
  const minute = matchState?.currentMinute ?? 0;
  const second = matchState?.currentSecond ?? 0;
  const homeScore = matchState?.homeScore ?? 0;
  const awayScore = matchState?.awayScore ?? 0;

  const handleSelectPersona = (persona) => {
    setActivePersona(persona);
    onClose();
  };

  return (
    <Box 
      bg="rgba(15, 23, 42, 0.92)" 
      backdropFilter="blur(20px)" 
      borderBottom="1px solid rgba(255, 255, 255, 0.08)"
      px={{ base: 3, md: 6 }} 
      py={3} 
      position="sticky" 
      top={0} 
      zIndex={100}
    >
      <Flex justify="space-between" align="center" gap={3}>
        
        {/* Brand & Live Match Scoreboard */}
        <HStack spacing={{ base: 2.5, md: 4 }}>
          <HStack spacing={2}>
            <Box 
              p={2} 
              borderRadius="10px" 
              bg="rgba(139, 92, 246, 0.15)" 
              border="1px solid rgba(139, 92, 246, 0.35)"
            >
              <Zap size={18} color="#8B5CF6" />
            </Box>
            <Box>
              <HStack spacing={1.5} align="center">
                <Text fontWeight="800" fontSize={{ base: "md", md: "lg" }} letterSpacing="tight" color="#FFFFFF">
                  Omni<Text as="span" color="#8B5CF6">Pitch</Text>
                </Text>
                <Badge bg="rgba(139, 92, 246, 0.15)" color="#C4B5FD" border="1px solid rgba(139, 92, 246, 0.3)" fontSize="9px">
                  AI
                </Badge>
              </HStack>
              <HStack spacing={1.5} display={{ base: 'none', sm: 'flex' }}>
                <Text fontSize="10px" color="gray.400" textTransform="uppercase" letterSpacing="wider">
                  La Liga EA Sports
                </Text>
                <HStack spacing={1}>
                  <Box w="5px" h="5px" borderRadius="full" bg={isBackendConnected ? "#00F0FF" : "#F59E0B"} />
                  <Text fontSize="9px" color={isBackendConnected ? "#00F0FF" : "#F59E0B"} fontWeight="700">
                    {isBackendConnected ? "LIVE SYNC" : "OFFLINE ENGINE"}
                  </Text>
                </HStack>
              </HStack>
            </Box>
          </HStack>

          {/* Live Score Ticker */}
          <HStack 
            bg="#111827" 
            px={{ base: 2.5, sm: 3.5 }} 
            py={1.5} 
            borderRadius="12px" 
            border="1px solid rgba(255, 255, 255, 0.08)"
            spacing={{ base: 2, sm: 3 }}
          >
            <HStack spacing={1.5}>
              <Box 
                w="7px" 
                h="7px" 
                borderRadius="full" 
                bg={isLive ? "#00F0FF" : "#F59E0B"} 
                boxShadow={isLive ? "0 0 8px #00F0FF" : "none"}
                animation={isLive ? "pulse 1.4s infinite" : "none"}
              />
              <Text fontSize="xs" fontWeight="700" color="gray.300" fontFamily="mono">
                {String(minute).padStart(2, '0')}:{String(second).padStart(2, '0')}
              </Text>
            </HStack>

            <HStack spacing={1.5} fontSize="xs" fontWeight="800">
              <Text color="#93C5FD">BAR</Text>
              <Text color="white" bg="#1E293B" px={2} py={0.5} borderRadius="6px" fontFamily="mono">
                {homeScore} - {awayScore}
              </Text>
              <Text color="#BFDBFE">ALA</Text>
            </HStack>
          </HStack>
        </HStack>

        {/* DESKTOP: Persona Switcher Tabs (Visible on large screens) */}
        <HStack 
          display={{ base: 'none', lg: 'flex' }}
          spacing={1.5} 
          bg="#0B1320" 
          p={1.5} 
          borderRadius="12px" 
          border="1px solid rgba(255, 255, 255, 0.08)"
        >
          <Button
            size="sm"
            leftIcon={<LayoutGrid size={15} color={activePersona === 'studio' ? '#00F0FF' : 'currentColor'} />}
            bg={activePersona === 'studio' ? "rgba(0, 240, 255, 0.08)" : "transparent"}
            color={activePersona === 'studio' ? "#00F0FF" : "gray.400"}
            border={activePersona === 'studio' ? "1px solid #00F0FF" : "1px solid transparent"}
            boxShadow={activePersona === 'studio' ? "0 0 15px rgba(0, 240, 255, 0.25)" : "none"}
            _hover={{ color: activePersona === 'studio' ? "#00F0FF" : "#FFFFFF" }}
            onClick={() => setActivePersona('studio')}
            fontSize="xs"
            fontWeight="700"
            borderRadius="8px"
            px={3}
          >
            Studio Dashboard
          </Button>

          <Button
            size="sm"
            leftIcon={<Tv size={15} color={activePersona === 'ott' ? '#00F0FF' : 'currentColor'} />}
            bg={activePersona === 'ott' ? "rgba(0, 240, 255, 0.08)" : "transparent"}
            color={activePersona === 'ott' ? "#00F0FF" : "gray.400"}
            border={activePersona === 'ott' ? "1px solid #00F0FF" : "1px solid transparent"}
            boxShadow={activePersona === 'ott' ? "0 0 15px rgba(0, 240, 255, 0.25)" : "none"}
            _hover={{ color: activePersona === 'ott' ? "#00F0FF" : "#FFFFFF" }}
            onClick={() => setActivePersona('ott')}
            fontSize="xs"
            fontWeight="700"
            borderRadius="8px"
            px={3}
          >
            Broadcast Overlay
          </Button>

          <Button
            size="sm"
            leftIcon={<Users size={15} color={activePersona === 'fan' ? '#00F0FF' : 'currentColor'} />}
            bg={activePersona === 'fan' ? "rgba(0, 240, 255, 0.08)" : "transparent"}
            color={activePersona === 'fan' ? "#00F0FF" : "gray.400"}
            border={activePersona === 'fan' ? "1px solid #00F0FF" : "1px solid transparent"}
            boxShadow={activePersona === 'fan' ? "0 0 15px rgba(0, 240, 255, 0.25)" : "none"}
            _hover={{ color: activePersona === 'fan' ? "#00F0FF" : "#FFFFFF" }}
            onClick={() => setActivePersona('fan')}
            fontSize="xs"
            fontWeight="700"
            borderRadius="8px"
            px={3}
          >
            Fan Experience
          </Button>

         {/* <Button
            size="sm"
            leftIcon={<Database size={15} color={activePersona === 'dataset' ? '#00F0FF' : 'currentColor'} />}
            bg={activePersona === 'dataset' ? "rgba(0, 240, 255, 0.08)" : "transparent"}
            color={activePersona === 'dataset' ? "#00F0FF" : "gray.400"}
            border={activePersona === 'dataset' ? "1px solid #00F0FF" : "1px solid transparent"}
            boxShadow={activePersona === 'dataset' ? "0 0 15px rgba(0, 240, 255, 0.25)" : "none"}
            _hover={{ color: activePersona === 'dataset' ? "#00F0FF" : "#FFFFFF" }}
            onClick={() => setActivePersona('dataset')}
            fontSize="xs"
            fontWeight="700"
            borderRadius="8px"
            px={3}
          >
            Synthetic Lab
          </Button>*/}
        </HStack>

        {/* DESKTOP: Right Tools (Voice Commentary Toggle) */}
        {/* <HStack spacing={2} display={{ base: 'none', lg: 'flex' }}>
          <Tooltip label={isVoiceEnabled ? "Voice Commentary Active (Click to Mute)" : "Voice Commentary Muted (Click to Unmute)"}>
            <IconButton
              size="sm"
              variant="glass"
              icon={isVoiceEnabled ? <Volume2 size={15} color="#00F0FF" /> : <VolumeX size={15} color="#F87171" />}
              onClick={onToggleVoice}
              aria-label="Toggle Voice Commentary"
              borderRadius="10px"
            />
          </Tooltip>
        </HStack> */}

        {/* MOBILE / SMALL DEVICE: Drawer Trigger & Compact Control */}
        <HStack spacing={2} display={{ base: 'flex', lg: 'none' }}>
          {/* <IconButton
            size="sm"
            variant="glass"
            icon={isVoiceEnabled ? <Volume2 size={15} color="#00F0FF" /> : <VolumeX size={15} color="#F87171" />}
            onClick={onToggleVoice}
            aria-label="Toggle Voice Commentary"
            borderRadius="10px"
          /> */}

          <IconButton
            size="sm"
            bg="rgba(0, 240, 255, 0.12)"
            color="#00F0FF"
            border="1px solid rgba(0, 240, 255, 0.4)"
            icon={<Menu size={18} />}
            onClick={onOpen}
            aria-label="Open Navigation Drawer"
            borderRadius="10px"
            _hover={{ bg: "rgba(0, 240, 255, 0.2)" }}
          />
        </HStack>

      </Flex>

      {/* MOBILE RESPONSIVE DRAWER: Hub for Navigation & Match Controls */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay bg="rgba(4, 7, 13, 0.85)" backdropFilter="blur(12px)" />
        <DrawerContent bg="#0D1527" borderLeft="1px solid rgba(0, 240, 255, 0.25)" color="white">
          <DrawerCloseButton color="gray.400" _hover={{ color: "white" }} />
          
          <DrawerHeader borderBottom="1px solid rgba(255, 255, 255, 0.08)" pb={3}>
            <HStack spacing={2}>
              <Zap size={18} color="#00F0FF" />
              <Text fontSize="md" fontWeight="900" color="white">
                Omni<Text as="span" color="#00F0FF">Pitch</Text> Mobile Hub
              </Text>
            </HStack>
            <Text fontSize="10.5px" color="gray.400" mt={1}>
              Live Matchday Intelligence & Telemetry Controller
            </Text>
          </DrawerHeader>

          <DrawerBody py={5}>
            <VStack spacing={5} align="stretch">
              
              {/* Persona Navigation Modes */}
              <Box>
                <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="#00F0FF" mb={3} letterSpacing="wider">
                  Select Experience Mode
                </Text>
                
                <VStack spacing={2.5} align="stretch">
                  <Button
                    size="md"
                    justifyContent="flex-start"
                    leftIcon={<LayoutGrid size={17} color={activePersona === 'studio' ? '#00F0FF' : 'currentColor'} />}
                    bg={activePersona === 'studio' ? "rgba(0, 240, 255, 0.12)" : "rgba(255, 255, 255, 0.03)"}
                    color={activePersona === 'studio' ? "#00F0FF" : "gray.300"}
                    border={activePersona === 'studio' ? "1.5px solid #00F0FF" : "1px solid rgba(255, 255, 255, 0.08)"}
                    onClick={() => handleSelectPersona('studio')}
                    borderRadius="12px"
                    py={6}
                  >
                    <VStack align="start" spacing={0} ml={1}>
                      <Text fontWeight="800" fontSize="sm">Studio Dashboard</Text>
                      <Text fontSize="10px" color="gray.400">Tactics, Pitch & Real-time Stats</Text>
                    </VStack>
                  </Button>

                  <Button
                    size="md"
                    justifyContent="flex-start"
                    leftIcon={<Tv size={17} color={activePersona === 'ott' ? '#00F0FF' : 'currentColor'} />}
                    bg={activePersona === 'ott' ? "rgba(0, 240, 255, 0.12)" : "rgba(255, 255, 255, 0.03)"}
                    color={activePersona === 'ott' ? "#00F0FF" : "gray.300"}
                    border={activePersona === 'ott' ? "1.5px solid #00F0FF" : "1px solid rgba(255, 255, 255, 0.08)"}
                    onClick={() => handleSelectPersona('ott')}
                    borderRadius="12px"
                    py={6}
                  >
                    <VStack align="start" spacing={0} ml={1}>
                      <Text fontWeight="800" fontSize="sm">Broadcast Overlay</Text>
                      <Text fontSize="10px" color="gray.400">OTT Streaming & Highlight Cut-List</Text>
                    </VStack>
                  </Button>

                  <Button
                    size="md"
                    justifyContent="flex-start"
                    leftIcon={<Users size={17} color={activePersona === 'fan' ? '#00F0FF' : 'currentColor'} />}
                    bg={activePersona === 'fan' ? "rgba(0, 240, 255, 0.12)" : "rgba(255, 255, 255, 0.03)"}
                    color={activePersona === 'fan' ? "#00F0FF" : "gray.300"}
                    border={activePersona === 'fan' ? "1.5px solid #00F0FF" : "1px solid rgba(255, 255, 255, 0.08)"}
                    onClick={() => handleSelectPersona('fan')}
                    borderRadius="12px"
                    py={6}
                  >
                    <VStack align="start" spacing={0} ml={1}>
                      <Text fontWeight="800" fontSize="sm">Fan Experience</Text>
                      <Text fontSize="10px" color="gray.400">Multilingual AI & Fan Companion</Text>
                    </VStack>
                  </Button>

                  {/* <Button
                    size="md"
                    justifyContent="flex-start"
                    leftIcon={<Database size={17} color={activePersona === 'dataset' ? '#00F0FF' : 'currentColor'} />}
                    bg={activePersona === 'dataset' ? "rgba(0, 240, 255, 0.12)" : "rgba(255, 255, 255, 0.03)"}
                    color={activePersona === 'dataset' ? "#00F0FF" : "gray.300"}
                    border={activePersona === 'dataset' ? "1.5px solid #00F0FF" : "1px solid rgba(255, 255, 255, 0.08)"}
                    onClick={() => handleSelectPersona('dataset')}
                    borderRadius="12px"
                    py={6}
                  >
                    <VStack align="start" spacing={0} ml={1}>
                      <Text fontWeight="800" fontSize="sm">Synthetic Lab</Text>
                      <Text fontSize="10px" color="gray.400">ML Augmentation & Parquet Export</Text>
                    </VStack>
                  </Button> */}
                </VStack>
              </Box>

            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
