declare module '@mui/material/styles' {
  interface CssVarsThemeOptions {
    gap: (spacing: number) => number
  }

  interface ExtendedTheme {
    gap: (spacing: number) => number
  }
  interface PaletteOptions {
    headerSearch: {
      main: string
      hover: string
    }
    headerLink: string
    rosterHeader: string
  }
  interface Palette {
    headerSearch: {
      main: string
      hover: string
    }
    headerLink: string
    rosterHeader: string
  }

  interface Theme extends ExtendedTheme {}
  interface ThemeOptions extends ExtendedTheme {}
}

declare module '@mui/material/toolbar' {
  interface ToolbarPropsVariantOverrides {
    rounded: true
  }
}

export {}
