function nameWords(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase()
    .match(/[\p{L}\p{N}]+/gu) || []
}

export function matchesWholeWords(existingName, query) {
  if (!existingName || !query) return false
  const existingWords = nameWords(existingName)
  const queryWords = nameWords(query)
  if (!queryWords.length || queryWords.length > existingWords.length) return false

  return existingWords.some((_, index) =>
    queryWords.every((word, queryIndex) => existingWords[index + queryIndex] === word)
  )
}

export function namesMatch(firstName, secondName) {
  return matchesWholeWords(firstName, secondName) || matchesWholeWords(secondName, firstName)
}

export function micronationNameVariants(name = {}) {
  const combine = (title, main) => [title, main].filter((part) => typeof part === 'string' && part.trim()).join(' ').trim()
  return [...new Set([
    name.main,
    name.mainAlt,
    combine(name.title, name.main),
    combine(name.titleAlt, name.mainAlt),
    ...(Array.isArray(name.alt) ? name.alt.flatMap((item) => [item?.main, combine(item?.title, item?.main)]) : [])
  ].filter((value) => typeof value === 'string' && value.trim()))]
}
