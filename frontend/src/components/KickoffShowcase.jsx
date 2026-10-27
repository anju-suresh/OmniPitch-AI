import React from 'react';
import { 
  Modal, ModalOverlay, ModalContent, ModalBody, Box, Flex, HStack, VStack, 
  Text, Badge, Button, Grid, GridItem 
} from '@chakra-ui/react';
import { Swords, Play, Trophy } from 'lucide-react';

export const KickoffShowcase = ({ isOpen, onClose, onKickoff }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "xl", md: "3xl" }} isCentered motionPreset="slideInBottom">
      <ModalOverlay bg="rgba(4, 7, 13, 0.88)" backdropFilter="blur(16px)" />
      <ModalContent 
        bg="pitch.850" 
        borderRadius={{ base: "0px", sm: "24px" }}
        border="1px solid rgba(139, 92, 246, 0.4)"
        boxShadow="0 0 60px rgba(139, 92, 246, 0.25), 0 20px 40px rgba(0, 0, 0, 0.8)"
        overflow="hidden"
        m={{ base: 0, sm: 4 }}
      >
        <ModalBody p={0}>
          
          {/* Top Broadcast Banner */}
          <Box 
            p={{ base: 4, sm: 6 }} 
            bg="linear-gradient(180deg, rgba(0, 77, 152, 0.3) 0%, rgba(165, 0, 68, 0.15) 50%, rgba(14, 22, 38, 0) 100%)"
            borderBottom="1px solid rgba(255, 255, 255, 0.08)"
            textAlign="center"
          >
            <HStack justify="center" spacing={2} mb={1}>
              <Trophy size={16} color="#F59E0B" />
              <Text fontSize="xs" fontWeight="800" color="#F59E0B" textTransform="uppercase" letterSpacing="widest">
                LA LIGA EA SPORTS • MATCHDAY 23
              </Text>
            </HStack>
            <Text fontSize={{ base: "xl", sm: "2xl" }} fontWeight="900" color="white" letterSpacing="tight">
              FC BARCELONA vs DEPORTIVO ALAVÉS
            </Text>
            <Text fontSize="xs" color="gray.300">
              Estadi Olímpic Lluís Companys, Barcelona • AI Sports Intelligence Powered by OmniPitch & Gemini
            </Text>
          </Box>

          {/* Center Teams Matchup Stage */}
          <Box p={{ base: 3, sm: 6 }}>
            <Grid templateColumns={{ base: "1fr", sm: "1fr auto 1fr" }} gap={4} alignItems="center" mb={6}>
              
              {/* Home Team: FC Barcelona */}
              <VStack 
                spacing={2} 
                p={4} 
                borderRadius="16px" 
                bg="linear-gradient(135deg, rgba(0, 77, 152, 0.2) 0%, rgba(165, 0, 68, 0.2) 100%)" 
                border="1px solid rgba(0, 77, 152, 0.5)"
              >
                <Box 
                  w="56px" 
                  h="56px" 
                  borderRadius="full" 
                  bg="#004D98" 
                  border="2px solid #A50044"
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  boxShadow="0 0 25px rgba(165, 0, 68, 0.6)"
                >
                  <Text fontWeight="900" fontSize="xl" color="#FACC15">FCB</Text>
                </Box>
                <Text fontWeight="900" fontSize="lg" color="white">FC BARCELONA 🔵🔴</Text>
                <Badge bg="rgba(0, 77, 152, 0.4)" color="#60A5FA" border="1px solid rgba(0, 77, 152, 0.6)">
                  Formation: 4-3-3
                </Badge>
                <Text fontSize="xs" color="gray.300">Coach: Hansi Flick</Text>
                <Box p={2} borderRadius="8px" bg="rgba(0,0,0,0.4)" w="100%" textAlign="center">
                  <Text fontSize="10px" color="gray.400">Tactical Identity:</Text>
                  <Text fontSize="11px" fontWeight="700" color="#A78BFA">High Press • Positional Dominance</Text>
                </Box>
              </VStack>

              {/* VS Emblem */}
              <VStack spacing={1}>
                <Box 
                  p={3} 
                  borderRadius="full" 
                  bg="pitch.700" 
                  border="2px solid rgba(255, 255, 255, 0.2)"
                  boxShadow="0 0 20px rgba(59, 130, 246, 0.4)"
                >
                  <Swords size={24} color="#3B82F6" />
                </Box>
                <Text fontSize="xs" fontWeight="900" color="gray.400">VS</Text>
              </VStack>

              {/* Away Team: Deportivo Alavés */}
              <VStack 
                spacing={2} 
                p={4} 
                borderRadius="16px" 
                bg="rgba(0, 91, 172, 0.12)" 
                border="1px solid rgba(0, 91, 172, 0.4)"
              >
                <Box 
                  w="56px" 
                  h="56px" 
                  borderRadius="full" 
                  bg="#005BAC" 
                  border="2px solid #FFFFFF"
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  boxShadow="0 0 25px rgba(0, 91, 172, 0.6)"
                >
                  <Text fontWeight="900" fontSize="xl" color="white">ALA</Text>
                </Box>
                <Text fontWeight="900" fontSize="lg" color="white">DEPORTIVO ALAVÉS 🔵⚪</Text>
                <Badge bg="rgba(0, 91, 172, 0.3)" color="#93C5FD" border="1px solid rgba(0, 91, 172, 0.6)">
                  Formation: 4-4-2
                </Badge>
                <Text fontSize="xs" color="gray.300">Coach: Luis García Plaza</Text>
                <Box p={2} borderRadius="8px" bg="rgba(0,0,0,0.4)" w="100%" textAlign="center">
                  <Text fontSize="10px" color="gray.400">Tactical Identity:</Text>
                  <Text fontSize="11px" fontWeight="700" color="#3B82F6">Compact Low Block • Direct Counters</Text>
                </Box>
              </VStack>

            </Grid>

            {/* Tactical Key Matchups */}
            <Box p={4} borderRadius="16px" bg="pitch.800" border="1px solid rgba(255, 255, 255, 0.08)" mb={6}>
              <Text fontSize="xs" fontWeight="800" color="gray.300" textTransform="uppercase" mb={3}>
                ⚡ Key Tactical Battlegrounds
              </Text>
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={3} fontSize="xs">
                <Box p={2.5} borderRadius="10px" bg="rgba(255, 255, 255, 0.03)" border="1px solid rgba(255, 255, 255, 0.06)">
                  <Text fontWeight="700" color="#A78BFA">Flank Isolation</Text>
                  <Text color="gray.400" mt={0.5}>Lamine Yamal (#19) vs Manu Sánchez (#3)</Text>
                </Box>
                <Box p={2.5} borderRadius="10px" bg="rgba(255, 255, 255, 0.03)" border="1px solid rgba(255, 255, 255, 0.06)">
                  <Text fontWeight="700" color="#3B82F6">Midfield Pivot Battle</Text>
                  <Text color="gray.400" mt={0.5}>Pedri (#8) vs Antonio Blanco (#8)</Text>
                </Box>
                <Box p={2.5} borderRadius="10px" bg="rgba(255, 255, 255, 0.03)" border="1px solid rgba(255, 255, 255, 0.06)">
                  <Text fontWeight="700" color="#F59E0B">Box Target Duel</Text>
                  <Text color="gray.400" mt={0.5}>Robert Lewandowski (#9) vs Aleksandar Sedlar (#22)</Text>
                </Box>
              </Grid>
            </Box>

            {/* Kickoff Action Button */}
            <Button
              w="100%"
              size="lg"
              variant="neon"
              leftIcon={<Play size={18} fill="#FFFFFF" />}
              onClick={() => {
                onClose();
                onKickoff();
              }}
              py={6}
              fontSize="md"
              fontWeight="800"
            >
              Blow Referee Whistle & Kick Off Match
            </Button>
          </Box>

        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
