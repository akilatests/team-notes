// Tags travel in the `tags` attribute as one comma-separated string, so a tag can never contain a comma.
export const TAG_SEPARATOR = ','

export function hasTag(tags: readonly string[], tag: string): boolean {
  const wanted = tag.toLowerCase()
  return tags.some((existing) => existing.toLowerCase() === wanted)
}

export function splitTags(text: string): string[] {
  return text
    .split(TAG_SEPARATOR)
    .map((part) => part.trim())
    .filter((tag) => tag.length > 0)
}

/**
 * Adds every comma-separated tag in `text`, skipping case-insensitive duplicates.
 * Stops once the list holds `maxCount` tags.
 */
export function addTags(tags: readonly string[], text: string, maxCount = Infinity): string[] {
  const result = [...tags]
  for (const tag of splitTags(text)) {
    if (result.length >= maxCount) break
    if (!hasTag(result, tag)) result.push(tag)
  }
  return result
}

export function parseTags(value: string | null): string[] {
  return addTags([], value ?? '')
}
