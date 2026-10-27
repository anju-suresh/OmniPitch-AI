import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, GridItem, Flex, HStack, VStack, Text, Badge, Button, 
  Input, InputGroup, InputRightElement, Spinner, useToast, Select, RadioGroup, Radio,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure
} from '@chakra-ui/react';
import { 
  Users, Globe, Volume2, Send, Sparkles, Heart, MessageCircle, Bot, Lock 
} from 'lucide-react';
import { LanguagePicker, LANGUAGES } from '../components/LanguagePicker.jsx';
import { ClubGoldenMoments } from '../components/ClubGoldenMoments.jsx';
import { AgentAPI } from '../services/api.js';

export const FanView = ({ 
  matchState, 
  onSelectEvent, 
  onSwitchPersona,
  fanPoll = null,
  onVoteFanPoll = null
}) => {
  const toast = useToast();
  
  // Responsive Mobile Drawer for AI Chat
  const { 
    isOpen: isChatDrawerOpen, 
    onOpen: onChatDrawerOpen, 
    onClose: onChatDrawerClose 
  } = useDisclosure();
  
  // Fan preferences
  const [favoriteTeam, setFavoriteTeam] = useState('FC Barcelona');
  const [fanMode, setFanMode] = useState('casual'); // 'casual' | 'tactics' | 'fantasy'
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // AI Story & Localization states
  const [storyData, setStoryData] = useState(null);
  const [localizedContent, setLocalizedContent] = useState(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [loadingLocalize, setLoadingLocalize] = useState(false);

  // Fan Poll State (connected to persistent top-level App or fallback to local)
  const [localFanVote, setLocalFanVote] = useState(null);
  const [localFanHasVoted, setLocalFanHasVoted] = useState(false);

  const hasFanVoted = fanPoll ? Boolean(fanPoll.hasVoted) : localFanHasVoted;
  const fanPollVote = fanPoll ? fanPoll.vote : localFanVote;

  const handleFanVote = (val) => {
    if (onVoteFanPoll) {
      onVoteFanPoll(val);
    } else {
      setLocalFanVote(val);
      setLocalFanHasVoted(true);
    }
    toast({ 
      title: 'Prediction Locked!', 
      description: `Your prediction (${val === 'yes' ? 'Yes, Absolutely' : 'No, Momentum Shifts'}) is locked and preserved for this match.`,
      status: 'success', 
      duration: 2000 
    });
  };

  // Fan Chat
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: "👋 ¡Hola Culé! I'm your OmniPitch AI match companion. Ask me anything about Barcelona vs Alavés, Lewandowski's goals, Yamal's brilliance, or Flick's pressing masterclass!" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const homeScore = matchState?.homeScore ?? 0;
  const awayScore = matchState?.awayScore ?? 0;
  const minute = matchState?.currentMinute ?? 0;
  const isLive = matchState?.status === 'live';
  const history = matchState?.eventsHistory || [];

  // Compute live stadium atmosphere and decibel levels
  const isBarcaFav = favoriteTeam === 'FC Barcelona';
  const isAlavesFav = favoriteTeam === 'Deportivo Alavés';

  const stadiumDecibels = homeScore >= 3 ? 104 : homeScore === 2 ? 98 : homeScore === 1 ? 94 : 86;
  const fanMoodPct = isBarcaFav 
    ? (homeScore > awayScore ? 96 : homeScore === awayScore ? 65 : 42)
    : isAlavesFav
    ? (awayScore > homeScore ? 98 : awayScore === homeScore ? 74 : 52)
    : 88;

  const fanMoodLabel = isBarcaFav
    ? (homeScore >= 3 ? "🔥 Pure Euphoria • Singing Cant del Barça!" : homeScore === 1 ? "🎉 Electric Optimism" : "⚡ Tense Anticipation")
    : isAlavesFav
    ? (awayScore >= 1 ? "⚔️ Defiant Pride • Fighting Basque Spirit!" : "🛡️ Resolute Defensive Stance")
    : "⭐ 9.4/10 La Liga Tactical Spectacle";

  // Client-side cache to preserve Gemini Free Tier quota and provide 0ms UI toggling
  const storyCache = React.useRef(new Map());
  const localizeCache = React.useRef(new Map());

  // Fetch match story with quota caching
  const fetchStory = async (force = false) => {
    const cacheKey = `story_${homeScore}_${awayScore}_${favoriteTeam}`;
    if (!force && storyCache.current.has(cacheKey)) {
      const cached = storyCache.current.get(cacheKey);
      setStoryData(cached);
      handleLocalize(cached.leadParagraph, selectedLanguage, fanMode, favoriteTeam);
      return;
    }

    setLoadingStory(true);
    try {
      const res = await AgentAPI.generateStory();
      if (res.success && res.data) {
        storyCache.current.set(cacheKey, res.data);
        setStoryData(res.data);
        // Automatically localize for current loyalty & language
        handleLocalize(res.data.leadParagraph, selectedLanguage, fanMode, favoriteTeam, force);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStory(false);
    }
  };

  // Localize content with quota caching, club loyalty bias, and perspective mode
  const handleLocalize = async (textToTranslate, langCode, mode, club, force = false) => {
    const text = textToTranslate || storyData?.leadParagraph || "Under the lights at Estadi Olímpic Lluís Companys, FC Barcelona and Deportivo Alavés engaged in an intense battle.";
    const lang = langCode || selectedLanguage;
    const m = mode || fanMode;
    const c = club || favoriteTeam;

    const cacheKey = `${text.slice(0, 50)}_${lang}_${m}_${c}`;
    if (!force && localizeCache.current.has(cacheKey)) {
      setLocalizedContent(localizeCache.current.get(cacheKey));
      return;
    }

    setLoadingLocalize(true);
    try {
      const res = await AgentAPI.localize(text, lang, m, c);
      if (res.success && res.data) {
        localizeCache.current.set(cacheKey, res.data);
        setLocalizedContent(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLocalize(false);
    }
  };

  // Language changed
  const onLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    handleLocalize(storyData?.leadParagraph, newLang, fanMode, favoriteTeam, true);
  };

  // Perspective mode changed (Casual, Tactics, Fantasy)
  const onModeChange = (newMode) => {
    setFanMode(newMode);
    handleLocalize(storyData?.leadParagraph, selectedLanguage, newMode, favoriteTeam, true);
  };

  // Club loyalty changed (FC Barcelona, Deportivo Alavés, Neutral)
  const onClubLoyaltyChange = (newClub) => {
    setFavoriteTeam(newClub);
    handleLocalize(storyData?.leadParagraph, selectedLanguage, fanMode, newClub, true);

    // Update AI companion greeting to match loyalty
    if (newClub === 'Deportivo Alavés') {
      setChatMessages([
        { sender: 'ai', text: "👋 ¡Aúpa Alavés! I'm your OmniPitch AI match companion. Ask me anything about Deportivo Alavés, Kike García's counter-attack goal, our defensive discipline, or the battle at Montjuïc!" }
      ]);
    } else if (newClub === 'FC Barcelona') {
      setChatMessages([
        { sender: 'ai', text: "👋 ¡Hola Culé! I'm your OmniPitch AI match companion. Ask me anything about Barcelona vs Alavés, Lewandowski's brace, Yamal's brilliance, or Flick's pressing masterclass!" }
      ]);
    } else {
      setChatMessages([
        { sender: 'ai', text: "👋 Welcome football fan! I'm your OmniPitch AI match companion. Ask me anything about Barcelona vs Alavés tactical analysis, player performances, or key match statistics!" }
      ]);
    }
  };

  useEffect(() => {
    fetchStory();
  }, [matchState?.homeScore, matchState?.awayScore]);

  // Handle Fan Chat submission
  const handleSendMessage = async (customText) => {
    const q = customText || userInput;
    if (!q || !q.trim()) return;
    setUserInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: q }]);
    setSendingChat(true);

    try {
      const res = await AgentAPI.askFanAssistant(q, favoriteTeam);
      if (res.success) {
        setChatMessages(prev => [...prev, { sender: 'ai', text: res.answer }]);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I had a problem analyzing the play. Try again!" }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Dynamic Fan Reactions generated from actual match events
  const keyEvents = history.filter(e => 
    e.type === 'goal' || 
    e.type === 'red_card' || 
    e.type === 'penalty_awarded' || 
    e.isKeyMomentCandidate === true
  );

  const renderChat = (isDrawer = false) => (
    <Box 
      bg={isDrawer ? "transparent" : "pitch.800"} 
      p={isDrawer ? 0 : 5} 
      borderRadius="16px" 
      border={isDrawer ? "none" : "1px solid rgba(255, 255, 255, 0.08)"} 
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <Flex justify="space-between" align="center" mb={3}>
        <HStack spacing={2}>
          <MessageCircle size={18} color="#8B5CF6" />
          <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="gray.300">
            Ask OmniPitch AI Fan Assistant
          </Text>
        </HStack>
        <Badge colorScheme="purple">Gemini Powered</Badge>
      </Flex>

      {/* Chat History Container */}
      <VStack 
        spacing={3} 
        align="stretch" 
        flex={1} 
        maxH={isDrawer ? "360px" : "420px"} 
        overflowY="auto" 
        pr={1} 
        mb={3}
      >
        {chatMessages.map((msg, i) => (
          <Box 
            key={i} 
            alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
            maxW="88%"
            p={3}
            borderRadius="14px"
            bg={msg.sender === 'user' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'}
            border="1px solid"
            borderColor={msg.sender === 'user' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'}
          >
            <Text fontSize="xs" color="gray.200" lineHeight="base">
              {msg.text}
            </Text>
          </Box>
        ))}

        {sendingChat && (
          <Flex align="center" spacing={2} p={2}>
            <Spinner size="xs" color="#8B5CF6" mr={2} />
            <Text fontSize="xs" color="gray.400">OmniPitch is thinking...</Text>
          </Flex>
        )}
      </VStack>

      {/* Quick Prompts */}
      <HStack spacing={1.5} mb={3} overflowX="auto" py={1}>
        <Button
          size="xs"
          variant="glass"
          fontSize="10px"
          onClick={() => handleSendMessage("Explain Lewandowski's goal tactic and movement")}
        >
          ⚽ Lewandowski goal
        </Button>
        <Button
          size="xs"
          variant="glass"
          fontSize="10px"
          onClick={() => handleSendMessage("How is Lamine Yamal creating chances against Alavés?")}
        >
          ⭐ Yamal chances
        </Button>
        <Button
          size="xs"
          variant="glass"
          fontSize="10px"
          onClick={() => handleSendMessage("Analyze Aleksandar Sedlar's red card decision")}
        >
          🟥 Sedlar red card
        </Button>
        <Button
          size="xs"
          variant="glass"
          fontSize="10px"
          onClick={() => handleSendMessage("What are Hansi Flick's pressing triggers today?")}
        >
          🧠 Flick tactics
        </Button>
      </HStack>

      {/* Chat Input */}
      <InputGroup size="sm">
        <Input
          placeholder="Ask about Lewandowski's goals, Yamal, or tactics..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          bg="pitch.900"
          borderColor="rgba(255, 255, 255, 0.1)"
          borderRadius="12px"
          fontSize="xs"
        />
        <InputRightElement>
          <Button 
            size="xs" 
            variant="neon" 
            onClick={handleSendMessage} 
            isLoading={sendingChat}
            borderRadius="8px"
          >
            <Send size={12} />
          </Button>
        </InputRightElement>
      </InputGroup>
    </Box>
  );

  return (
    <Box p={{ base: 3, md: 6 }} pb={{ base: "84px", lg: "24px" }} position="relative">
      
      {/* Top Preference Bar */}
      <Box bg="pitch.800" p={4} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)" mb={4}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          
          {/* Title & Club Loyalty */}
          <HStack spacing={3}>
            <Box p={2} bg="rgba(139, 92, 246, 0.15)" borderRadius="10px">
              <Users size={18} color="#8B5CF6" />
            </Box>
            <Box>
              <Text fontSize="md" fontWeight="800" color="white">
                Personalized Multilingual Fan Hub
              </Text>
              <HStack spacing={2} mt={1}>
                <Text fontSize="xs" color="gray.400">My Club Loyalty:</Text>
                <Select 
                  size="xs" 
                  value={favoriteTeam} 
                  onChange={(e) => onClubLoyaltyChange(e.target.value)}
                  w="170px" 
                  bg="#0D1527"
                  color="#F1F5F9"
                  borderColor="rgba(255, 255, 255, 0.2)"
                  borderRadius="8px"
                  fontWeight="700"
                  sx={{
                    '> option, > optgroup': {
                      background: '#0D1527 !important',
                      color: '#F1F5F9 !important'
                    }
                  }}
                >
                  <option value="FC Barcelona" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>FC Barcelona 🔵🔴</option>
                  <option value="Deportivo Alavés" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>Deportivo Alavés 🔵⚪</option>
                  <option value="Neutral" style={{ backgroundColor: '#0D1527', color: '#F1F5F9' }}>Neutral Spectator ⚽</option>
                </Select>
              </HStack>
            </Box>
          </HStack>

          {/* Complexity Tier, Language & Direct Pitch Link */}
          <HStack spacing={3} wrap="wrap">
            <HStack spacing={1}>
              <Text fontSize="xs" color="gray.400" mr={1}>Perspective:</Text>
              <Button 
                size="xs" 
                variant={fanMode === 'casual' ? 'neon' : 'glass'}
                onClick={() => onModeChange('casual')}
              >
                Casual Fan
              </Button>
              <Button 
                size="xs" 
                variant={fanMode === 'tactics' ? 'neon' : 'glass'}
                onClick={() => onModeChange('tactics')}
              >
                Tactics Geek
              </Button>
              <Button 
                size="xs" 
                variant={fanMode === 'fantasy' ? 'neon' : 'glass'}
                onClick={() => onModeChange('fantasy')}
              >
                Fantasy Stats
              </Button>
            </HStack>

            {/* Language Selector */}
            <LanguagePicker selectedLanguage={selectedLanguage} onSelectLanguage={onLanguageChange} />

            {/* Direct Link to Pitch Board */}
            {onSwitchPersona && (
              <Button
                size="xs"
                bg="rgba(0, 240, 255, 0.15)"
                color="#00F0FF"
                border="1px solid #00F0FF"
                _hover={{ bg: "#00F0FF", color: "#0B0F19" }}
                onClick={() => onSwitchPersona('studio')}
                fontWeight="800"
                borderRadius="8px"
              >
                🏟️ Pitch Board ▶
              </Button>
            )}
          </HStack>

        </Flex>
      </Box>

      {/* LIVE STADIUM ATMOSPHERE & FAN DECIBEL GAUGE */}
      <Box 
        bg="#0D1527" 
        p={4} 
        borderRadius="16px" 
        border="1px solid rgba(255, 255, 255, 0.08)" 
        mb={5}
        boxShadow="0 8px 24px rgba(0, 0, 0, 0.4)"
      >
        <Grid templateColumns={{ base: '1fr', md: '1.2fr 1fr' }} gap={4} align="center">
          
          {/* Decibel & Mood Gauge */}
          <Box >
            <Flex width={'100%'} justify="space-between" align="center" mb={1.5}>
              <HStack spacing={2}>
                <Volume2 size={16} color="#00F0FF" />
                <Text fontSize="xs" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="wider">
                  Stadium Decibel & Fan Sentiment Pulse
                </Text>
              </HStack>
              <Badge bg="#00F0FF" color="#070B14" fontSize="10px" fontWeight="900" px={2} borderRadius="4px">
                {stadiumDecibels} dB PEAK
              </Badge>
            </Flex>

            <Flex h="7px" w="100%" bg="#070B14" borderRadius="full" overflow="hidden" mb={2}>
              <Box 
                w={`${fanMoodPct}%`} 
                bg={isBarcaFav ? "linear-gradient(90deg, #8B5CF6, #00F0FF)" : "linear-gradient(90deg, #3B82F6, #60A5FA)"} 
                boxShadow="0 0 10px #00F0FF"
                transition="all 0.5s ease" 
              />
            </Flex>

            <Flex justify="space-between" fontSize="11px">
              <Text color="#00F0FF" fontWeight="700">{fanMoodLabel}</Text>
              <Text color="gray.400">{isLive ? "Live Syncing with Pitch Action" : "Pre-Match Stadium Buildup"}</Text>
            </Flex>
          </Box>

          {/* Club Anthem / Chant Sing-Along Banner */}
          {/* <Box 
            p={3} 
            borderRadius="12px" 
            bg="rgba(139, 92, 246, 0.08)" 
            border="1px dashed rgba(139, 92, 246, 0.35)"
          >
            <HStack spacing={2} mb={1}>
              <Heart size={14} color="#C4B5FD" />
              <Text fontSize="10.5px" fontWeight="800" color="#C4B5FD" textTransform="uppercase" letterSpacing="wider">
                {isBarcaFav ? "Montjuïc Terrace Chant (Cant del Barça)" : isAlavesFav ? "Himno del Glorioso Alavés" : "Stadium Atmosphere"}
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.300" fontStyle="italic" noOfLines={2}>
              {isBarcaFav 
                ? "“Tot el camp, és un clam, som la gent blaugrana, tant se val d'on venim, si del sud o del nord... ¡Barça, Barça, Baaarça!”"
                : isAlavesFav
                ? "“¡Bravo equipo albiazul, que supiste luchar y vencer con valor y nobleza...! ¡Aúpa Alavés!”"
                : "“High-tempo Spanish football with 50,000 supporters roaring under the floodlights at Estadi Olímpic!”"
              }
            </Text>
          </Box> */}

        </Grid>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={5}>
        
        {/* Left (7 cols): Multilingual Match Story & Audio Recap */}
        <GridItem colSpan={{ base: 12, lg: 7 }}>
          <VStack spacing={4} align="stretch">
            
            {/* Localized Story Card */}
            <Box bg="pitch.800" p={5} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)">
              <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
                <HStack spacing={2}>
                  <Globe size={18} color="#3B82F6" />
                  <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="gray.300">
                    Localized Match Story ({localizedContent?.languageName || 'English (UK)'} • {favoriteTeam} • {fanMode.toUpperCase()})
                  </Text>
                </HStack>

                <HStack spacing={2}>
                  <Badge 
                    bg={localizedContent?.source === 'live-gemini' ? "rgba(16, 185, 129, 0.2)" : "rgba(139, 92, 246, 0.15)"} 
                    color={localizedContent?.source === 'live-gemini' ? "#10B981" : "#C4B5FD"} 
                    border="1px solid" 
                    borderColor={localizedContent?.source === 'live-gemini' ? "#10B981" : "rgba(139, 92, 246, 0.3)"} 
                    fontSize="10px" 
                    fontWeight="800"
                  >
                    {localizedContent?.source === 'live-gemini' ? `🟢 LIVE ${localizedContent?.model ? localizedContent.model.toUpperCase() : 'GEMINI FLASH'}` : localizedContent?.source === 'live-gemini-cache' ? "⚡ GEMINI CACHED" : "GEMINI POWERED"}
                  </Badge>

                  <Button 
                    size="xs" 
                    variant="cyber" 
                    leftIcon={<Sparkles size={12} />}
                    isLoading={loadingStory || loadingLocalize}
                    onClick={() => fetchStory(true)}
                  >
                    Regenerate Story
                  </Button>
                </HStack>
              </Flex>

              {loadingLocalize ? (
                <Flex justify="center" py={10}><Spinner color="#8B5CF6" /></Flex>
              ) : (
                <Box>
                  <Text fontSize="lg" fontWeight="800" color="white" mb={2}>
                    {localizedContent?.translatedHeadline || storyData?.headline || 'Loading match story...'}
                  </Text>

                  <Text fontSize="sm" color="gray.300" lineHeight="tall">
                    {localizedContent?.translatedContent || storyData?.leadParagraph}
                  </Text>
                </Box>
              )}
            </Box>

            {/* CLUB GOLDEN MOMENTS REEL (Goals, Miracle Saves & Heroic Moments) */}
            <ClubGoldenMoments 
              favoriteTeam={favoriteTeam}
              matchState={matchState}
              onSelectEvent={onSelectEvent}
              onSwitchPersona={onSwitchPersona}
              selectedLanguage={selectedLanguage}
            />

            {/* LIVE FAN REACTIONS & STADIUM CHATTER FEED (Dynamically Linked to Match Events) */}
            <Box bg="pitch.800" p={5} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)">
              <Flex justify="space-between" align="center" mb={3}>
                <HStack spacing={2}>
                  <Sparkles size={18} color="#00F0FF" />
                  <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="gray.300">
                    Live Fan Reactions & Stadium Buzz
                  </Text>
                </HStack>
                <Badge bg="rgba(0, 240, 255, 0.15)" color="#00F0FF" fontSize="10px">
                  {keyEvents.length} KEY HIGHLIGHT REACTIONS
                </Badge>
              </Flex>

              <VStack spacing={3} align="stretch" maxH="380px" overflowY="auto" pr={1}>
                {keyEvents.length === 0 ? (
                  <Box p={4} textAlign="center" borderRadius="10px" bg="#070B14" border="1px dashed rgba(255, 255, 255, 0.1)">
                    <Text fontSize="xs" color="gray.400">Match in progress. As goals, cards, and key inflection plays occur, live Culé and Babazorro fan social reactions will stream here automatically.</Text>
                  </Box>
                ) : (
                  keyEvents.map((evt, idx) => {
                    const isBarca = evt.teamId === 'barcelona' || evt.team === 'Barcelona';
                    const pName = typeof evt.player === 'object' ? (evt.player?.name || 'Player') : (evt.player || 'Player');

                    let culeText = `🔥 What an action by ${pName}! Blaugrana dominant in the ${evt.minute}th minute!`;
                    let alavesText = `Stay compact! Alavés need to absorb pressure and hit the flanks.`;

                    if (evt.type === 'goal') {
                      if (isBarca) {
                        culeText = `⚽ GOLAZO! ${pName.toUpperCase()}!! What an incredible delivery from Yamal! Montjuïc is roaring! 🔵🔴`;
                        alavesText = `Tough blow conceding that cutback after disciplined defending. We have to regroup!`;
                      } else {
                        culeText = `Defensive slip on the counter! Balde was caught too high up the pitch.`;
                        alavesText = `⚪🔵 GOOOL! KIKE GARCÍA! Silence Montjuïc! That's how Basque fighters play football! ⚔️`;
                      }
                    } else if (evt.type === 'red_card') {
                      culeText = `Clear red card! That reckless tackle halted a dangerous counter-attack.`;
                      alavesText = `So harsh! Sedlar was playing for the ball. Now we battle with ten men!`;
                    } else if (evt.type === 'penalty_awarded') {
                      culeText = `Penalty for Barça! Silky footwork in the box leaving the defender no choice.`;
                      alavesText = `Heartbreaker in the box, Sivera please pull off a miracle save!`;
                    }

                    return (
                      <Box 
                        key={evt.id || idx} 
                        p={3} 
                        borderRadius="12px" 
                        bg="#0B0F19" 
                        border="1px solid rgba(255, 255, 255, 0.08)"
                      >
                        <Flex justify="space-between" align="center" mb={1.5}>
                          <HStack spacing={2}>
                            <Badge 
                              bg={evt.type === 'goal' ? '#8B5CF6' : evt.type === 'red_card' ? '#EF4444' : '#00F0FF'} 
                              color="white" 
                              fontSize="9.5px"
                              fontWeight="800"
                            >
                              {evt.minute}' {evt.type?.toUpperCase().replace('_', ' ')}
                            </Badge>
                            <Text fontSize="xs" fontWeight="800" color="white">
                              {pName}
                            </Text>
                          </HStack>

                          {onSelectEvent && (
                            <Button
                              size="xs"
                              bg="rgba(0, 240, 255, 0.12)"
                              color="#00F0FF"
                              border="1px solid rgba(0, 240, 255, 0.4)"
                              _hover={{ bg: "#00F0FF", color: "#0B0F19" }}
                              onClick={() => onSelectEvent(evt)}
                              fontSize="9.5px"
                              fontWeight="800"
                              borderRadius="6px"
                              px={2}
                            >
                              ⚡ Replay on Pitch ▶
                            </Button>
                          )}
                        </Flex>

                        <VStack spacing={1.5} align="stretch" fontSize="11px" mt={2}>
                          {isAlavesFav ? (
                            <>
                              <Box p={2} borderRadius="8px" bg="rgba(0, 91, 172, 0.25)" borderLeft="3px solid #00F0FF">
                                <Text color="#00F0FF" fontWeight="800">@GloriosoVitoria (Alavés Fan Community):</Text>
                                <Text color="white">{alavesText}</Text>
                              </Box>
                              <Box p={2} borderRadius="8px" bg="rgba(0, 77, 152, 0.12)" borderLeft="3px solid rgba(0, 77, 152, 0.4)">
                                <Text color="#93C5FD" fontWeight="600">@CulerTerrace (Barça):</Text>
                                <Text color="gray.400">{culeText}</Text>
                              </Box>
                            </>
                          ) : (
                            <>
                              <Box p={2} borderRadius="8px" bg="rgba(0, 77, 152, 0.25)" borderLeft="3px solid #8B5CF6">
                                <Text color="#C4B5FD" fontWeight="800">@CulerTerrace (Barça Fan Community):</Text>
                                <Text color="white">{culeText}</Text>
                              </Box>
                              <Box p={2} borderRadius="8px" bg="rgba(0, 91, 172, 0.12)" borderLeft="3px solid rgba(0, 91, 172, 0.4)">
                                <Text color="#BFDBFE" fontWeight="600">@GloriosoVitoria (Alavés):</Text>
                                <Text color="gray.400">{alavesText}</Text>
                              </Box>
                            </>
                          )}
                        </VStack>
                      </Box>
                    );
                  })
                )}
              </VStack>
            </Box>

          </VStack>
        </GridItem>

        {/* Right (5 cols): Interactive Poll & Gemini Conversational Fan Assistant */}
        <GridItem colSpan={{ base: 12, lg: 5 }}>
          <VStack spacing={4} align="stretch">
            
            {/* Live Audience Prediction Poll */}
            <Box bg="pitch.800" p={5} borderRadius="16px" border="1px solid rgba(255, 255, 255, 0.08)">
              <Flex justify="space-between" align="center" mb={2.5}>
                <HStack spacing={2}>
                  <Users size={16} color="#00F0FF" />
                  <Text fontSize="xs" fontWeight="800" textTransform="uppercase" color="gray.300">
                    Live Stream Fan Prediction
                  </Text>
                </HStack>
                <HStack spacing={1.5}>
                  {hasFanVoted && (
                    <Badge bg="rgba(0, 240, 255, 0.2)" color="#00F0FF" fontSize="10px" px={2} py={0.5} borderRadius="full" border="1px solid rgba(0, 240, 255, 0.3)">
                      🔒 LOCKED
                    </Badge>
                  )}
                  <Badge bg="rgba(0, 240, 255, 0.15)" color="#00F0FF" fontSize="10px">
                    {homeScore > awayScore ? "BARCA LEADING" : homeScore === awayScore ? "LEVEL 1-1" : "ALAVÉS AHEAD"}
                  </Badge>
                </HStack>
              </Flex>

              <Text fontSize="sm" fontWeight="700" color="white" mb={3}>
                {homeScore >= 3 
                  ? "Will FC Barcelona keep this 2-goal margin until full-time?" 
                  : "Will there be another goal scored in this match?"}
              </Text>

              <VStack spacing={2.5} align="stretch">
                <Box>
                  <Flex justify="space-between" fontSize="xs" fontWeight="700" mb={1}>
                    <Text color="#00F0FF">Yes, Absolutely (76%)</Text>
                    <Text color="gray.400">18.4k votes</Text>
                  </Flex>
                  <Flex h="6px" bg="#070B14" borderRadius="full" overflow="hidden">
                    <Box w="76%" bg="#00F0FF" />
                  </Flex>
                </Box>

                <Box>
                  <Flex justify="space-between" fontSize="xs" fontWeight="700" mb={1}>
                    <Text color="#3B82F6">No, Momentum Shifts (24%)</Text>
                    <Text color="gray.400">5.8k votes</Text>
                  </Flex>
                  <Flex h="6px" bg="#070B14" borderRadius="full" overflow="hidden">
                    <Box w="24%" bg="#3B82F6" />
                  </Flex>
                </Box>

                <HStack spacing={2} mt={1}>
                  <Button
                    size="xs"
                    flex={1}
                    variant={hasFanVoted ? (fanPollVote === 'yes' ? 'neon' : 'ghost') : 'glass'}
                    bg={hasFanVoted && fanPollVote === 'yes' ? 'linear-gradient(135deg, #00F0FF, #0284C7)' : undefined}
                    color={hasFanVoted && fanPollVote === 'yes' ? '#070B14' : hasFanVoted ? 'gray.500' : 'white'}
                    border={hasFanVoted && fanPollVote === 'yes' ? '1px solid #00F0FF' : '1px solid rgba(255, 255, 255, 0.1)'}
                    opacity={hasFanVoted && fanPollVote !== 'yes' ? 0.35 : 1}
                    isDisabled={hasFanVoted}
                    onClick={() => handleFanVote('yes')}
                    fontWeight="700"
                  >
                    {hasFanVoted && fanPollVote === 'yes' ? 'Locked: Yes ✓' : 'Vote Yes'}
                  </Button>
                  <Button
                    size="xs"
                    flex={1}
                    variant={hasFanVoted ? (fanPollVote === 'no' ? 'neon' : 'ghost') : 'glass'}
                    bg={hasFanVoted && fanPollVote === 'no' ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : undefined}
                    color={hasFanVoted && fanPollVote === 'no' ? '#FFFFFF' : hasFanVoted ? 'gray.500' : 'white'}
                    border={hasFanVoted && fanPollVote === 'no' ? '1px solid #60A5FA' : '1px solid rgba(255, 255, 255, 0.1)'}
                    opacity={hasFanVoted && fanPollVote !== 'no' ? 0.35 : 1}
                    isDisabled={hasFanVoted}
                    onClick={() => handleFanVote('no')}
                    fontWeight="700"
                  >
                    {hasFanVoted && fanPollVote === 'no' ? 'Locked: No ✓' : 'Vote No'}
                  </Button>
                </HStack>

                {hasFanVoted && (
                  <Flex 
                    p={2} 
                    borderRadius="8px" 
                    bg="rgba(0, 240, 255, 0.08)" 
                    border="1px solid rgba(0, 240, 255, 0.25)" 
                    align="center" 
                    justify="center" 
                    gap={2}
                  >
                    <Lock size={12} color="#00F0FF" />
                    <Text fontSize="11px" fontWeight="600" color="#E2E8F0">
                      Prediction Locked: <Text as="span" fontWeight="700" color="#00F0FF">
                        {fanPollVote === 'yes' ? 'Yes, Absolutely' : 'No, Momentum Shifts'}
                      </Text> • Preserved for this match
                    </Text>
                  </Flex>
                )}
              </VStack>
            </Box>

            {/* Interactive Gemini Chat Assistant */}
            {renderChat(false)}
          </VStack>
        </GridItem>

      </Grid>

      {/* MOBILE FLOATING DOCK BAR: AI Fan Chat */}
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
        <Button
          w="100%"
          size="md"
          bg="rgba(139, 92, 246, 0.92)"
          backdropFilter="blur(16px)"
          color="white"
          boxShadow="0 8px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(139, 92, 246, 0.4)"
          borderRadius="14px"
          leftIcon={<MessageCircle size={17} />}
          onClick={onChatDrawerOpen}
          _hover={{ bg: "#7C3AED" }}
          fontWeight="800"
          fontSize="xs"
          py={5}
        >
          💬 CHAT WITH AI FAN ASSISTANT
        </Button>
      </Box>

      {/* MOBILE AI FAN ASSISTANT DRAWER (Bottom Sheet) */}
      <Drawer
        isOpen={isChatDrawerOpen}
        placement="bottom"
        onClose={onChatDrawerClose}
        size="full"
      >
        <DrawerOverlay bg="rgba(4, 7, 13, 0.85)" backdropFilter="blur(14px)" />
        <DrawerContent
          bg="#0D1527"
          borderTop="2px solid #8B5CF6"
          borderTopRadius="22px"
          maxH="82vh"
          color="white"
          boxShadow="0 -12px 40px rgba(0, 0, 0, 0.95)"
        >
          <Box w="38px" h="4px" bg="rgba(255, 255, 255, 0.25)" borderRadius="full" mx="auto" mt={2.5} />

          <DrawerHeader pt={2} pb={3} borderBottom="1px solid rgba(255, 255, 255, 0.08)">
            <Flex justify="space-between" align="center" pr={8}>
              <HStack spacing={2}>
                <MessageCircle size={16} color="#8B5CF6" />
                <Text fontSize="sm" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="wider">
                  AI Fan Companion Chat
                </Text>
              </HStack>
              <Badge colorScheme="purple" fontSize="10px">GEMINI 2.0</Badge>
            </Flex>
          </DrawerHeader>

          <DrawerCloseButton color="gray.400" top={3} right={3} _hover={{ color: "white" }} />

          <DrawerBody px={{ base: 3, sm: 5 }} py={4}>
            {renderChat(true)}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

    </Box>
  );
};
