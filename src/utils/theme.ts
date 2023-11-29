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
  },
}

const theme = extendTheme(extendedTheme)

export default theme
