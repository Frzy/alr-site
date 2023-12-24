export function getUrlParams(): URLSearchParams {
  const queryParams = window.location.search.slice(1)

  return new URLSearchParams(queryParams)
}

export function getUrl(path: string, params: URLSearchParams): string {
  const queryString = params.toString()

  if (!queryString) return path

  return `${path}?${queryString}`
}
