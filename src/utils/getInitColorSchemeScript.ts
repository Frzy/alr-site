;(function () {
  try {
    var mode = localStorage.getItem('mui-mode') || 'light'
    var colorScheme = ''
    if (mode === 'system') {
      // handle system mode
      var mql = window.matchMedia('(prefers-color-scheme: dark)')
      if (mql.matches) {
        colorScheme = localStorage.getItem('mui-color-scheme-dark') || 'dark'
      } else {
        colorScheme = localStorage.getItem('mui-color-scheme-light') || 'light'
      }
    }
    if (mode === 'light') {
      colorScheme = localStorage.getItem('mui-color-scheme-light') || 'light'
    }
    if (mode === 'dark') {
      colorScheme = localStorage.getItem('mui-color-scheme-dark') || 'dark'
    }
    if (colorScheme) {
      document.documentElement.setAttribute('data-mui-color-scheme', colorScheme)
    }
  } catch (e) {}
})()
