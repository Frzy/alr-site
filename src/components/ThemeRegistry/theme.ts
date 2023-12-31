import { createTheme, type ThemeOptions } from '@mui/material/styles'
import { deepOrange, blue } from '@mui/material/colors'

const defaultTheme = createTheme()

const themeOptions: ThemeOptions = {
  gap: (spacing: number) => parseInt(defaultTheme.spacing(spacing), 10),
  palette: {
    mode: 'dark',
    primary: { main: deepOrange[500] },
    secondary: { main: blue[500] },
    headerLink: deepOrange[500],
    memberList: {
      header: blue[700],
      search: {
        main: 'rgba(0, 0, 0, 0.4)',
        hover: 'rgba(0, 0, 0, 0.5)',
        focus: 'rgba(0, 0, 0, 0.55)',
      },
      filterBackground: 'rgba(0, 0, 0, 0.35)',
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        underline: 'none',
        color: blue.A200,
      },
    },
    MuiInput: {
      styleOverrides: {
        input: {
          '&:-internal-autofill-selected': {
            WebkitBoxShadow: '0 0 0 100px #266798 inset',
            WebkitTextFillColor: '#fff',
            caretColor: '#fff',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          },
          colorScheme: 'dark',
        },
      },
    },
  },
}

const theme = createTheme(themeOptions)

export default theme
