declare module '@mui/material/styles' {
  interface CssVarsThemeOptions {
    gap: (spacing: number) => number
  }

  interface ExtendedTheme {
    gap: (spacing: number) => number
  }
  interface PaletteOptions {
    memberList: {
      header: string
      search: {
        main: string
        hover: string
        focus: string
      }
      filterBackground: string
    }
    headerLink: string
  }
  interface Palette {
    memberList: {
      header: string
      search: {
        main: string
        hover: string
        focus: string
      }
      filterBackground: string
    }
    headerLink: string
  }

  interface Theme extends ExtendedTheme {}
  interface ThemeOptions extends ExtendedTheme {}
}

export {}
