// import { createTheme, responsiveFontSizes, ThemeOptions } from '@mui/material/styles'
import { lightBlue } from '@mui/material/colors'
import { experimental_extendTheme as extendTheme, CssVarsThemeOptions } from '@mui/material/styles'

import { TextField } from '@mui/material'

// const generalTheme: ThemeOptions = {}

// const darkTheme: ThemeOptions = {
//   palette: {
//     mode: 'dark',
//   },
// }

// const lightTheme: ThemeOptions = {
//   palette: {
//     mode: 'light',
//   },
// }

const extendedTheme: CssVarsThemeOptions = {
  colorSchemes: {
    light: {},
    dark: {},
  },
}

const theme = extendTheme(extendedTheme)

export default theme

// export default function getTheme(mode: 'dark' | 'light') {
//   return responsiveFontSizes(
//     createTheme(
//       mode === 'dark' ? { ...generalTheme, ...darkTheme } : { ...generalTheme, ...lightTheme },
//     ),
//   )
// }
