import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, GridItem, Flex, HStack, VStack, Text, Badge, Button, 
  Select, Table, Thead, Tbody, Tr, Th, Td, Spinner, useToast 
} from '@chakra-ui/react';
import { Database, Sparkles, Download, RefreshCw, Cpu, Layers } from 'lucide-react';
import { DatasetAPI } from '../services/api.js';

export const DatasetView = () => {
  const toast = useToast();
  const [patternType, setPatternType] = useState('Counter-Attack from Corner');
  const [count, setCount] = useState(3);
  const [datasets, setDatasets] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await DatasetAPI.list();
      if (res.success && res.datasets?.length > 0) {
        setDatasets(res.datasets);
        setSelectedBatch(res.datasets[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await DatasetAPI.generate(patternType, count);
      if (res.success) {
        toast({
          title: 'Synthetic Dataset Generated!',
          description: `Created ${res.data?.scenarios?.length || count} physics-grounded tactical plays.`,
          status: 'success',
          duration: 2000
        });
        setSelectedBatch(res.data);
        fetchDatasets();
      }
    } catch (e) {
      toast({ title: 'Generation Error', description: e.message, status: 'error' });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  return (
    <Box p={{ base: 3, md: 6 }}>
      
      {/* Header */}
      <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
        <HStack spacing={2}>
          <Database size={20} color="#8B5CF6" />
          <Text fontSize="lg" fontWeight="800" color="white">
            🔬 Synthetic Dataset Lab (AI & Analytics Expansion)
          </Text>
          <Badge bg="rgba(139, 92, 246, 0.15)" color="#C4B5FD" border="1px solid rgba(139, 92, 246, 0.3)">
            PARQUET & OPEN DATA READY
          </Badge>
        </HStack>

        <HStack spacing={3}>
          {selectedBatch && (
            <Button
              as="a"
              href={DatasetAPI.getExportUrl(selectedBatch.datasetBatchId)}
              target="_blank"
              download
              size="sm"
              variant="neon"
              leftIcon={<Download size={14} />}
            >
              Export JSON Dataset
            </Button>
          )}

          <Button 
            size="sm" 
            variant="glass" 
            leftIcon={<RefreshCw size={14} />} 
            onClick={fetchDatasets}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* Generator Control Panel */}
      <Box bg="pitch.800" p={5} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)" mb={5}>
        <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="gray.300" mb={3}>
          Synthesize Rare Match Scenarios
        </Text>

        <Flex gap={4} wrap="wrap" align="center">
          <Box flex={1} minW="260px">
            <Text fontSize="xs" color="gray.400" mb={1}>Tactical Pattern to Augment:</Text>
            <Select 
              size="sm" 
              value={patternType} 
              onChange={(e) => setPatternType(e.target.value)}
              bg="#0D1527"
              color="#F1F5F9"
              borderColor="rgba(255, 255, 255, 0.15)"
              sx={{
                '> option, > optgroup': {
                  background: '#0D1527 !important',
                  color: '#F1F5F9 !important'
                }
              }}
            >
              <option value="Counter-Attack from Corner" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>Counter-Attack from Defending Corner</option>
              <option value="Half-Space Triangulation" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>Half-Space Triangulation Overload</option>
              <option value="High-Press Trap Turnover" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>High-Press Trap in Opponent Third</option>
              <option value="Inverted Full-Back Progression" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>Inverted Full-Back Progression into Zone 14</option>
              <option value="Low-Block Cross-Box Transition" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>Low-Block Defensive Box Clearance</option>
            </Select>
          </Box>

          <Box w="140px">
            <Text fontSize="xs" color="gray.400" mb={1}>Scenario Count:</Text>
            <Select 
              size="sm" 
              value={count} 
              onChange={(e) => setCount(Number(e.target.value))}
              bg="#0D1527"
              color="#F1F5F9"
              borderColor="rgba(255, 255, 255, 0.15)"
              sx={{
                '> option, > optgroup': {
                  background: '#0D1527 !important',
                  color: '#F1F5F9 !important'
                }
              }}
            >
              <option value={2} style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>2 Scenarios</option>
              <option value={3} style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>3 Scenarios</option>
              <option value={5} style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>5 Scenarios</option>
            </Select>
          </Box>

          <Box mt={{ base: 2, md: 5 }}>
            <Button
              size="sm"
              variant="neon"
              leftIcon={<Sparkles size={14} />}
              isLoading={generating}
              onClick={handleGenerate}
            >
              Generate Synthetic Variations
            </Button>
          </Box>
        </Flex>
      </Box>

      {/* Scenarios Display */}
      {loading ? (
        <Flex justify="center" py={12}><Spinner color="#8B5CF6" size="lg" /></Flex>
      ) : selectedBatch ? (
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="700" color="white">
              Batch: {selectedBatch.title} ({selectedBatch.scenarios?.length || 0} scenarios)
            </Text>
            <Badge colorScheme="purple">Batch ID: {selectedBatch.datasetBatchId}</Badge>
          </HStack>

          {selectedBatch.scenarios?.map((scn, i) => (
            <Box 
              key={scn.scenarioId || i} 
              bg="pitch.800" 
              p={5} 
              borderRadius="16px" 
              border="1px solid rgba(255, 255, 255, 0.08)"
            >
              <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                <HStack spacing={2}>
                  <Badge bg="rgba(139, 92, 246, 0.15)" color="#C4B5FD">
                    {scn.scenarioId}
                  </Badge>
                  <Text fontSize="sm" fontWeight="800" color="white">
                    {scn.tacticalPattern}
                  </Text>
                </HStack>

                <HStack spacing={3} fontSize="xs">
                  <Text color="gray.400">Formation: <Text as="span" color="white" fontWeight="600">{scn.attackingFormation}</Text></Text>
                  <Text color="gray.400">Defense: <Text as="span" color="white" fontWeight="600">{scn.defensiveBlock}</Text></Text>
                  <Badge colorScheme="purple">Success Prob: {Math.round((scn.successProbability || 0.65) * 100)}%</Badge>
                </HStack>
              </Flex>

              {/* Event Step Sequence Table */}
              <Box overflowX="auto" mb={3}>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr borderColor="rgba(255, 255, 255, 0.08)">
                      <Th color="gray.400">Step</Th>
                      <Th color="gray.400">Type</Th>
                      <Th color="gray.400">Coordinates (X, Y)</Th>
                      <Th color="gray.400">Velocity (m/s)</Th>
                      <Th color="gray.400">Pressure Rating</Th>
                      <Th color="gray.400">Action Description</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {scn.simulatedEvents?.map((evt, idx) => (
                      <Tr key={idx} borderColor="rgba(255, 255, 255, 0.04)">
                        <Td fontWeight="bold" color="#3B82F6">{evt.sequenceOrder}</Td>
                        <Td>
                          <Badge colorScheme={evt.eventType === 'shot' ? 'yellow' : 'blue'}>
                            {evt.eventType.toUpperCase()}
                          </Badge>
                        </Td>
                        <Td fontFamily="mono" fontSize="xs">({evt.x}, {evt.y})</Td>
                        <Td fontFamily="mono" fontSize="xs">{evt.velocity} m/s</Td>
                        <Td fontFamily="mono" fontSize="xs">{(evt.pressureRating * 100).toFixed(0)}%</Td>
                        <Td fontSize="xs" color="gray.300">{evt.actionDescription}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* AI Enrichment & Tactical Countermeasures */}
              <Box p={3} borderRadius="10px" bg="rgba(59, 130, 246, 0.05)" border="1px solid rgba(59, 130, 246, 0.2)">
                <VStack align="stretch" spacing={1} fontSize="xs">
                  <Text color="#3B82F6" fontWeight="700">
                    💡 Tactical Insight: <Text as="span" color="gray.200" fontWeight="normal">{scn.aiEnrichment?.tacticalInsight}</Text>
                  </Text>
                  <Text color="amber.300" fontWeight="700">
                    ⚠️ Vulnerability: <Text as="span" color="gray.200" fontWeight="normal">{scn.aiEnrichment?.vulnerabilityIdentified}</Text>
                  </Text>
                  <Text color="#A78BFA" fontWeight="700">
                    🛡️ Countermeasure: <Text as="span" color="gray.200" fontWeight="normal">{scn.aiEnrichment?.optimalCountermeasure}</Text>
                  </Text>
                </VStack>
              </Box>
            </Box>
          ))}
        </VStack>
      ) : (
        <Box textAlign="center" py={12} bg="pitch.800" borderRadius="16px">
          <Text color="gray.400" mb={3}>No synthetic datasets generated yet.</Text>
          <Button size="sm" variant="neon" onClick={handleGenerate}>
            Generate First Batch
          </Button>
        </Box>
      )}

    </Box>
  );
};
