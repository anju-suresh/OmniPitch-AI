import React from 'react';
import { Select, HStack, Box, Text, Badge } from '@chakra-ui/react';
import { Globe } from 'lucide-react';

export const LANGUAGES = [
  { code: 'en', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es', name: 'Español (LatAm)', flag: '🇲🇽' },
  { code: 'pt', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'zh', name: '中文 (Mandarin)', flag: '🇨🇳' }
];

export const LanguagePicker = ({ selectedLanguage, onSelectLanguage, size = 'sm' }) => {
  return (
    <HStack spacing={2} bg="#111827" px={3} py={1.5} borderRadius="12px" border="1px solid rgba(255, 255, 255, 0.08)">
      <Globe size={16} color="#3B82F6" />
      <Select
        size={size}
        value={selectedLanguage}
        onChange={(e) => onSelectLanguage(e.target.value)}
        variant="unstyled"
        cursor="pointer"
        color="white"
        fontWeight="600"
        fontSize="xs"
        w={{ base: "130px", sm: "160px" }}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} style={{ backgroundColor: '#0E1626', color: '#FFFFFF' }}>
            {l.flag} {l.name}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
