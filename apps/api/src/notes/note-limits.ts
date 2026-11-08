// One place for input limits, shared by the REST DTOs and (in t6) the MCP tool schemas.
export const NOTE_LIMITS = {
  titleMaxLength: 200,
  bodyMaxLength: 10_000,
  tagsMaxCount: 10,
  tagMaxLength: 30,
  queryMaxLength: 200,
} as const;
