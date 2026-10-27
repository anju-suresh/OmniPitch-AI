import React from 'react';
import { 
  Box, Flex, HStack, VStack, Text, Badge, Button 
} from '@chakra-ui/react';
import { Play, Trophy, Calendar, MapPin, Sparkles, Swords, Zap } from 'lucide-react';

export const MatchdayHeroCard = ({ 
  matchState, 
  onStartMatch, 
  height = "430px" 
}) => {
  const homeTeam = matchState?.homeTeam?.name || 'FC Barcelona';
  const awayTeam = matchState?.awayTeam?.name || 'Deportivo Alavés';
  const homeFormation = matchState?.homeTeam?.formation || '4-3-3';
  const awayFormation = matchState?.awayTeam?.formation || '4-4-2';
  const competition = matchState?.competition || 'La Liga EA Sports - Matchday 23';
  const venue = matchState?.venue || 'Estadi Olímpic Lluís Companys, Barcelona';

const today = new Date();

const formattedDate = today
  .toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  .replace(
    /(\d{2}) (\w+) (\d{4})/,
    (_, day, month, year) => `${day} ${month.toUpperCase()}, ${year}`,
  );


  return (
    <Box
      position="relative"
      w="100%"
      h={height}
      borderRadius="20px"
      overflow="hidden"
      border="1.5px solid rgba(0, 240, 255, 0.35)"
      boxShadow="0 14px 48px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 240, 255, 0.15)"
      bg="linear-gradient(135deg, #050811 0%, #0B1327 50%, #070B16 100%)"
      cursor="pointer"
      onClick={onStartMatch}
      role="group"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        borderColor: "#00F0FF",
        boxShadow: "0 18px 60px rgba(0, 0, 0, 0.9), 0 0 55px rgba(0, 240, 255, 0.3)",
        transform: "translateY(-2px)"
      }}
    >
      {/* Stadium Ambient Floodlight Cones */}
      <Box
        position="absolute"
        top="-80px"
        left="10%"
        w="320px"
        h="320px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(0, 240, 255, 0.18) 0%, transparent 70%)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        top="-80px"
        right="10%"
        w="320px"
        h="320px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)"
        pointerEvents="none"
      />

      {/* Cyber Grid Texture */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.08}
        backgroundImage="radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)"
        backgroundSize="28px 28px"
        pointerEvents="none"
      />

      {/* Main Full-Width Content Container */}
      <Flex 
        h="100%" 
        w="100%" 
        direction="column" 
        justify="space-between" 
        p={{ base: 5, sm: 8 }} 
        position="relative" 
        zIndex={2}
      >
        
        {/* Top Header Row: Competition & Live Status */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <HStack spacing={2}>
            <Trophy size={16} color="#F59E0B" />
            <Text 
              fontSize={{ base: "10.5px", sm: "12px" }} 
              fontWeight="900" 
              color="#FBBF24" 
              textTransform="uppercase" 
              letterSpacing="widest"
            >
              {competition.toUpperCase()}
            </Text>
          </HStack>

          
        </Flex>

        {/* Center Section: Big Typography & Team Duel Strip */}
        <VStack spacing={4} w="100%" my="auto">
          
          {/* Athletic Headline: TODAY MATCH DAY */}
          <VStack spacing={0} lineHeight="0.95" textAlign="center">
            <Text 
              fontSize={{ base: "13px", sm: "16px" }} 
              fontWeight="900" 
              color="#60A5FA" 
              letterSpacing="5px" 
              textTransform="uppercase"
            >
              TODAY
            </Text>
            <Text 
              fontSize={{ base: "36px", sm: "42px", md: "48px" }} 
              fontWeight="900" 
              letterSpacing="-1px"
              bgGradient="linear(90deg, #FFFFFF 0%, #00F0FF 48%, #8B5CF6 100%)"
              bgClip="text"
              textTransform="uppercase"
            >
              MATCH DAY
            </Text>
          </VStack>

          {/* Full-Width Head-to-Head Duel Card */}
          <Box
            w="100%"
            maxW="900px"
            p={{ base: 3, sm: 4 }}
            borderRadius="16px"
            bg="rgba(11, 19, 35, 0.85)"
            border="1px solid rgba(255, 255, 255, 0.12)"
            backdropFilter="blur(12px)"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.5)"
          >
            <Flex justify="space-between" align="center" px={{ base: 1.5, sm: 6 }}>
              
              {/* Home: FC Barcelona */}
              <HStack spacing={{ base: 2, sm: 4 }}>
                <Box
                  w={{ base: "38px", sm: "48px", md: "58px" }}
                  h={{ base: "38px", sm: "48px", md: "58px" }}
                  borderRadius="16px"
                  bg="linear-gradient(135deg, #004D98 0%, #A50044 100%)"
                  border="2px solid rgba(255, 255, 255, 0.3)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={{ base: "17px", sm: "22px", md: "28px" }}
                  boxShadow="0 6px 20px rgba(0, 77, 152, 0.6)"
                >
                  🔵🔴
                </Box>
                <VStack align="start" spacing={0.5}>
                  <Text fontWeight="900" fontSize={{ base: "xs", sm: "md", md: "lg" }} color="white" lineHeight="1.1">
                    {homeTeam}
                  </Text>
                  <HStack spacing={1.5}>
                    <Badge bg="rgba(0, 77, 152, 0.45)" color="#93C5FD" fontSize="9.5px" px={1.5} py={0.3} borderRadius="4px">
                      {homeFormation}
                    </Badge>
                    <Text fontSize="10.5px" color="gray.400" display={{ base: 'none', md: 'block' }}>Hansi Flick</Text>
                  </HStack>
                </VStack>
              </HStack>

              {/* Center VS Emblem */}
              <Box
                p={{ base: 1.5, sm: 2 }}
                px={{ base: 2, sm: 3 }}
                borderRadius="full"
                bg="rgba(0, 240, 255, 0.12)"
                border="1.5px solid rgba(0, 240, 255, 0.45)"
                boxShadow="0 0 20px rgba(0, 240, 255, 0.25)"
              >
                <Text fontSize={{ base: "10px", sm: "12px" }} fontWeight="900" color="#00F0FF" letterSpacing="wider">
                  VS
                </Text>
              </Box>

              {/* Away: Deportivo Alavés */}
              <HStack spacing={{ base: 2, sm: 4 }} justify="flex-end">
                <VStack align="end" spacing={0.5} textAlign="right">
                  <Text fontWeight="900" fontSize={{ base: "xs", sm: "md", md: "lg" }} color="white" lineHeight="1.1">
                    {awayTeam}
                  </Text>
                  <HStack spacing={1.5} justify="flex-end">
                    <Text fontSize="10.5px" color="gray.400" display={{ base: 'none', md: 'block' }}>Luis García</Text>
                    <Badge bg="rgba(0, 91, 172, 0.45)" color="#BFDBFE" fontSize="9.5px" px={1.5} py={0.3} borderRadius="4px">
                      {awayFormation}
                    </Badge>
                  </HStack>
                </VStack>
                <Box
                  w={{ base: "38px", sm: "48px", md: "58px" }}
                  h={{ base: "38px", sm: "48px", md: "58px" }}
                  borderRadius="16px"
                  bg="linear-gradient(135deg, #005BAC 0%, #1E3A8A 100%)"
                  border="2px solid rgba(255, 255, 255, 0.3)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={{ base: "17px", sm: "22px", md: "28px" }}
                  boxShadow="0 6px 20px rgba(0, 91, 172, 0.6)"
                >
                  🔵⚪
                </Box>
              </HStack>

            </Flex>
          </Box>

          {/* Prominent Glowing Play Button CTA */}
          <Button
            size="lg"
            variant="unstyled"
            display="flex"
            alignItems="center"
            gap={3}
            bg="linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(139, 92, 246, 0.28) 100%)"
            border="2px solid #00F0FF"
            boxShadow="0 0 30px rgba(0, 240, 255, 0.45), inset 0 0 16px rgba(0, 240, 255, 0.25)"
            px={{ base: 5, sm: 8 }}
            py={{ base: 2.5, sm: 3.5 }}
            h="auto"
            borderRadius="full"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _groupHover={{
              bg: "linear-gradient(135deg, rgba(0, 240, 255, 0.32) 0%, rgba(139, 92, 246, 0.42) 100%)",
              boxShadow: "0 0 50px rgba(0, 240, 255, 0.75), inset 0 0 24px rgba(0, 240, 255, 0.35)",
              transform: "scale(1.06)"
            }}
            _active={{ transform: "scale(0.97)" }}
          >
            {/* Pulsing Play Disc */}
            <Box
              w={{ base: "32px", sm: "42px" }}
              h={{ base: "32px", sm: "42px" }}
              borderRadius="full"
              bg="#00F0FF"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 0 18px #00F0FF"
              position="relative"
            >
              <Box
                position="absolute"
                inset="-5px"
                borderRadius="full"
                border="2px solid #00F0FF"
                opacity={0.7}
                animation="pulseRing 1.5s infinite"
              />
              <Play size={20} fill="#070B14" color="#070B14" style={{ marginLeft: '3px' }} />
            </Box>

            <VStack align="start" spacing={0}>
              <Text fontSize="sm" fontWeight="900" color="#FFFFFF" letterSpacing="wider" textTransform="uppercase">
                WATCH LIVE MATCH
              </Text>
              {/* <Text fontSize="10px" color="#00F0FF" fontWeight="700">
                Click anywhere to launch live pitch
              </Text> */}
            </VStack>
          </Button>

        </VStack>

        {/* Bottom Row: Venue, Date & AI Ready */}
        <Flex 
          justify="space-between" 
          align="center" 
          wrap="wrap" 
          gap={2}
          pt={2}
          borderTop="1px solid rgba(255, 255, 255, 0.08)"
          fontSize="11px" 
          color="gray.400"
        >
          <HStack spacing={1.5}>
            <Calendar size={13} color="#00F0FF" />
            <Text color="gray.300" fontWeight="600">{formattedDate}</Text>
          </HStack>

          <HStack spacing={1.5} maxW={{ base: "160px", sm: "none" }} isTruncated>
            <MapPin size={13} color="#8B5CF6" />
            <Text color="gray.400" isTruncated>{venue}</Text>
          </HStack>

          <HStack spacing={1.5} display={{ base: 'none', sm: 'flex' }}>
            <Zap size={13} color="#00F0FF" />
            <Text color="#00F0FF" fontWeight="700">AI TELEMETRY STANDING BY</Text>
          </HStack>
        </Flex>

      </Flex>
    </Box>
  );
};
