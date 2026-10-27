import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false
  },
  styles: {
    global: {
      body: {
        bg: '#0B0F19',
        color: '#F1F5F9',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      },
      'select, option, optgroup': {
        bg: '#0D1527 !important',
        color: '#F1F5F9 !important'
      }
    }
  },
  colors: {
    brand: {
      cyan: '#00F0FF',           // Electric cyan neon
      cyanHover: '#00D8E6',
      cyanGlow: 'rgba(0, 240, 255, 0.35)',
      purple: '#8B5CF6',         // Modern electric violet / purple
      purpleHover: '#7C3AED',
      purpleDark: '#6D28D9',
      purpleLight: '#C4B5FD',
      blue: '#3B82F6',           // Clean broadcast blue
      blueHover: '#2563EB',
      amber: '#F59E0B',          // Trophy & added time amber
      rose: '#F43F5E',           // Live card / alert crimson
      emerald: '#10B981'         // Pitch grass accent
    },
    pitch: {
      900: '#070B14',
      850: '#0B0F19',
      800: '#111827',
      750: '#141E33',
      700: '#1E293B',
      600: '#334155',
      500: '#475569'
    }
  },
  fonts: {
    heading: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace"
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: '#0D1527',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }
      }
    },
    Button: {
      baseStyle: {
        borderRadius: '10px',
        fontWeight: '700',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      },
      variants: {
        neon: {
          bg: 'rgba(139, 92, 246, 0.08)',
          color: '#C4B5FD',
          border: '1px solid #8B5CF6',
          boxShadow: '0 0 14px rgba(139, 92, 246, 0.25)',
          _hover: {
            bg: 'rgba(139, 92, 246, 0.18)',
            borderColor: '#A78BFA',
            color: '#FFFFFF',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.45)',
            transform: 'translateY(-1px)'
          },
          _active: {
            bg: 'rgba(139, 92, 246, 0.25)',
            transform: 'translateY(0)'
          }
        },
        cyanPill: {
          bg: 'rgba(0, 240, 255, 0.08)',
          color: '#00F0FF',
          border: '1px solid #00F0FF',
          boxShadow: '0 0 14px rgba(0, 240, 255, 0.25)',
          _hover: {
            bg: 'rgba(0, 240, 255, 0.18)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.45)'
          }
        },
        cyber: {
          bg: 'rgba(139, 92, 246, 0.08)',
          color: '#C4B5FD',
          border: '1px solid #8B5CF6',
          boxShadow: '0 0 14px rgba(139, 92, 246, 0.25)',
          _hover: {
            bg: 'rgba(139, 92, 246, 0.18)',
            borderColor: '#A78BFA',
            color: '#FFFFFF',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.45)'
          }
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.04)',
          color: '#94A3B8',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          _hover: {
            bg: 'rgba(0, 240, 255, 0.08)',
            color: '#FFFFFF',
            borderColor: 'rgba(0, 240, 255, 0.35)'
          }
        }
      }
    },
    Badge: {
      baseStyle: {
        borderRadius: '6px',
        textTransform: 'none',
        fontWeight: '600',
        px: 2,
        py: 0.5
      }
    },
    Select: {
      baseStyle: {
        field: {
          bg: '#0D1527',
          color: '#F1F5F9',
          '> option, > optgroup': {
            bg: '#0D1527 !important',
            color: '#F1F5F9 !important'
          }
        }
      }
    }
  }
});
