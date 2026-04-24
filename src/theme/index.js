import { createTheme } from '@mui/material/styles'

const baseTokens = {
  fontFamily: '"DM Sans", sans-serif',
  fontFamilyMono: '"DM Mono", monospace',
  borderRadius: 12,
  borderRadiusSm: 8,
}

const lightPalette = {
  mode: 'light',
  primary:   { main: '#1B6B4A', light: '#2D9368', dark: '#134E36', contrastText: '#fff' },
  secondary: { main: '#4A6B8A', light: '#6A8FAD', dark: '#2E4F6A', contrastText: '#fff' },
  error:     { main: '#C0392B' },
  warning:   { main: '#D68910' },
  success:   { main: '#1B6B4A' },
  background:{ default: '#F5F7F5', paper: '#FFFFFF' },
  text:      { primary: '#1A1F1A', secondary: '#4A5550' },
  divider:   'rgba(0,0,0,0.08)',
}

const darkPalette = {
  mode: 'dark',
  primary:   { main: '#2D9368', light: '#3DB57F', dark: '#1B6B4A', contrastText: '#fff' },
  secondary: { main: '#6A8FAD', light: '#8AAFC8', dark: '#4A6B8A', contrastText: '#fff' },
  error:     { main: '#E74C3C' },
  warning:   { main: '#F39C12' },
  success:   { main: '#2D9368' },
  background:{ default: '#0F1410', paper: '#181F18' },
  text:      { primary: '#E8EDE8', secondary: '#8FA98F' },
  divider:   'rgba(255,255,255,0.08)',
}

function buildTheme(mode) {
  const palette = mode === 'dark' ? darkPalette : lightPalette
  return createTheme({
    palette,
    typography: {
      fontFamily: baseTokens.fontFamily,
      h1: { fontWeight: 600, letterSpacing: '-0.02em' },
      h2: { fontWeight: 600, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.015em' },
      h4: { fontWeight: 500, letterSpacing: '-0.01em' },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
      subtitle1: { fontWeight: 500 },
      button: { fontWeight: 500, textTransform: 'none', letterSpacing: '0' },
      overline: { letterSpacing: '0.08em', fontWeight: 500 },
    },
    shape: { borderRadius: baseTokens.borderRadius },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: baseTokens.borderRadiusSm, paddingLeft: 20, paddingRight: 20 },
          containedPrimary: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: baseTokens.borderRadius,
            boxShadow: mode === 'dark'
              ? '0 1px 3px rgba(0,0,0,0.4)'
              : '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          root: { '& .MuiOutlinedInput-root': { borderRadius: baseTokens.borderRadiusSm } },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6 } },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: { borderRadius: baseTokens.borderRadiusSm },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            background: mode === 'dark' ? '#131A13' : '#F0F4F0',
          },
        },
      },
    },
  })
}

export { buildTheme }
