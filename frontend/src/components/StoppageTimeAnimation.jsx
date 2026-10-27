import React from 'react';
import { Box, Flex, HStack, VStack, Text, Badge, IconButton } from '@chakra-ui/react';
import { Clock, Zap, X, ShieldAlert } from 'lucide-react';

export const StoppageTimeAnimation = ({ isVisible, onClose, extraMinutes = 4 }) => {
  if (!isVisible) return null;

  return (
    <Box
      position="fixed"
      top={{ base: "70px", md: "80px" }}
      left="50%"
      zIndex={250}
      animation="stoppageSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      maxW="92vw"
      w={{ base: "92vw", sm: "460px", md: "520px" }}
    >
      {/* Modern Broadcast Glass HUD Container */}
      <Box
        bg="rgba(15, 23, 42, 0.96)"
        backdropFilter="blur(20px)"
        borderRadius="16px"
        border="1px solid rgba(245, 158, 11, 0.45)"
        boxShadow="0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.2)"
        p={{ base: 3.5, md: 4.5 }}
        position="relative"
        overflow="hidden"
        className="broadcast-shimmer"
      >
        {/* Top Gold Accent Strip */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          bg="linear-gradient(90deg, #F59E0B 0%, #8B5CF6 50%, #F59E0B 100%)"
        />

        {/* Top Status Header */}
        <Flex justify="space-between" align="center" mb={3}>
          <HStack spacing={2}>
            <Box
              p={1.5}
              borderRadius="8px"
              bg="rgba(245, 158, 11, 0.15)"
              border="1px solid rgba(245, 158, 11, 0.3)"
            >
              <Clock size={15} color="#F59E0B" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="10px" fontWeight="900" color="#F59E0B" letterSpacing="widest" textTransform="uppercase">
                Official Stoppage Time
              </Text>
              <Text fontSize="9px" color="gray.400" fontWeight="600">
                4th Official Digital Board
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={2}>
            <Badge
              bg="rgba(239, 68, 68, 0.15)"
              color="#F87171"
              border="1px solid rgba(239, 68, 68, 0.3)"
              fontSize="10px"
              px={2}
              py={0.5}
              borderRadius="6px"
              fontWeight="800"
              animation="pulse 1.4s infinite"
            >
              REGULATION 90:00
            </Badge>

            {onClose && (
              <IconButton
                size="xs"
                variant="ghost"
                icon={<X size={14} />}
                onClick={onClose}
                color="gray.400"
                _hover={{ color: "white", bg: "rgba(255, 255, 255, 0.1)" }}
                aria-label="Close"
              />
            )}
          </HStack>
        </Flex>

        {/* Big Center Display: Stoppage Time Figure */}
        <Flex
          align="center"
          justify="space-between"
          bg="#0B0F19"
          px={{ base: 4, md: 6 }}
          py={3}
          borderRadius="12px"
          border="1px solid rgba(255, 255, 255, 0.08)"
        >
          <HStack spacing={3}>
            <Text
              fontSize={{ base: "40px", md: "52px" }}
              fontWeight="900"
              fontFamily="mono"
              color="#F59E0B"
              lineHeight="1"
              letterSpacing="tight"
            >
              +{extraMinutes}
            </Text>
            <VStack align="start" spacing={0.5}>
              <Text fontSize="sm" fontWeight="800" color="white" textTransform="uppercase" letterSpacing="wider">
                Minutes Added
              </Text>
              <Text fontSize="10px" color="gray.400">
                Minimum indicated by referee
              </Text>
            </VStack>
          </HStack>

          <Badge
            bg="rgba(139, 92, 246, 0.15)"
            color="#C4B5FD"
            border="1px solid rgba(139, 92, 246, 0.3)"
            fontSize="10px"
            px={2.5}
            py={1}
            borderRadius="8px"
            fontWeight="700"
          >
            IN PROGRESS
          </Badge>
        </Flex>

        {/* Stadium Location Footnote */}
        <Flex justify="space-between" align="center" mt={2.5} px={1}>
          <Text fontSize="10px" color="gray.400">
            Estadi Olímpic Lluís Companys • Matchday 23
          </Text>
          <Text fontSize="10px" color="#F59E0B" fontWeight="600">
            La Liga EA Sports
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};
