declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACTIVITY_LOG_DATA_SHEET_KEY: number
      ACTIVITY_LOG_SPREADSHEET_KEY: string
      ACTIVITY_LOG_VAR_SHEET_KEY: number
      COMBINED_ACTIVITY_LOG_SHEET_KEY: number
      COMBINED_ACTIVITY_LOG_SPREADSHEET_KEY: string
      GOOGLE_CALENDAR_ID: string
      GOOGLE_CLIENT_EMAIL: string
      GOOGLE_PRIVATE_KEY: string
      LOG_SHEET_KEY: string
      NEXTAUTH_SECRET: string
      NEXTAUTH_URL: string
      ROSTER_DATA_SHEET_KEY: number
      ROSTER_SHEET_KEY: number
      ROSTER_SHEET_KEY: number
      ROSTER_SPREADSHEET_KEY: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
