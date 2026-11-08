// Tags travel in the `tags` attribute as one comma-separated string, so a tag can never contain a comma.
export const TAG_SEPARATOR = ','

export function hasTag(tags: readonly string[], tag: string): boolean {
  const wanted = tag.toLowerCase()
  return tags.some((existing) => existing.toLowerCase() === wanted)
}

/** Adds every comma-separated tag in `text`, trimmed, skipping blanks and case-insensitive duplicates. */
export function addTags(tags: readonly string[], text: string): string[] {
  const result = [...tags]
  for (const part of text.split(TAG_SEPARATOR)) {
    const tag = part.trim()
    if (tag && !hasTag(result, tag)) result.push(tag)
  }
  return result
}

export function parseTags(value: string | null): string[] {
  return addTags([], value ?? '')
}
