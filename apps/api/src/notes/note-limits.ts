// Shared by the REST DTOs and the MCP tool schemas.
export const NOTE_LIMITS = {
  titleMaxLength: 200,
  bodyMaxLength: 10_000,
  tagsMaxCount: 10,
  tagMaxLength: 30,
  queryMaxLength: 200,
} as const;
