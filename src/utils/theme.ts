import {
  experimental_extendTheme as extendTheme,
  CssVarsThemeOptions,
  alpha,
  darken,
} from '@mui/material/styles'
import { grey, deepOrange, blue } from '@mui/material/colors'

const defaultTheme = extendTheme()

const extendedTheme: CssVarsThemeOptions = {
  gap: (spacing: number) => parseInt(defaultTheme.spacing(spacing), 10),
  colorSchemes: {
    light: {
      palette: {
        headerSearch: { main: grey[300], hover: darken(grey[300], 0.05) },
        headerLink: blue['A700'],
        rosterHeader: blue['A200'],
        primary: { main: deepOrange[500] },
        secondary: { main: blue[500] },
      },
    },
    dark: {
      palette: {
        rosterHeader: blue[700],
        headerSearch: { main: grey[900], hover: alpha(grey[900], 0.85) },
        headerLink: deepOrange[500],
        primary: { main: deepOrange[500] },
        secondary: { main: blue[500] },
      },
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        underline: 'none',
        color: blue['A200'],
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: `rgba(${theme.vars.palette.secondary.mainChannel} / 0.20)`,
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: ({ ownerState, theme }) =>
          theme.unstable_sx({
            ...(ownerState.variant === 'rounded' && {
              minHeight: { xs: 56, md: 64 },
            }),
          }),
      },
      variants: [
        {
          props: { variant: 'rounded' },
          style: {
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
          },
        },
      ],
    },
  },
}

const theme = extendTheme(extendedTheme)

declare module '@mui/material/toolbar' {
  interface ToolbarPropsVariantOverrides {
    rounded: true
  }
}

export default theme
