export function toLimitedEntryPresentation(entry, entryType = 'micronation') {
  return {
    title: entry?.name?.main || '',
    name: entryType === 'micronation' ? entry?.name || null : null,
    logo: entryType === 'micronation' ? entry?.flag || '' : entry?.logo || '',
    texts: Array.isArray(entry?.texts) ? entry.texts : []
  }
}
