import type { Note } from '@team-notes/types'

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString()
}

// shortcut: hardcoded seed data for t2, replaced by the API in t5.
export const FAKE_NOTES: Note[] = [
  {
    id: 6,
    title: 'Q4 launch checklist',
    body: 'Final pass before the embed update ships on Thursday.\n\n- Confirm the new share dialog copy with design\n- Run the embed smoke tests on Safari 18 and Firefox ESR\n- Draft the changelog entry and send it to Marcus\n- Schedule the rollout for 10:00 Colombo time',
    tags: ['launch', 'q4'],
    authorName: 'Maya Okafor',
    source: 'human',
    createdAt: ago(12 * MINUTE_MS),
  },
  {
    id: 5,
    title: 'Summary: customer calls this week',
    body: 'Three themes came up across the five calls on Tuesday and Wednesday.\n\n1. Teams want to import pins from a spreadsheet without reformatting columns.\n2. Two customers asked for share links that expire.\n3. Embed load time on mobile came up twice, both from event organisers.\n\nSource: call notes in the shared drive, Nov 4–5.',
    tags: ['research', 'customers'],
    authorName: 'Priya Raman',
    source: 'agent',
    createdAt: ago(HOUR_MS),
  },
  {
    id: 4,
    title: 'Onboarding copy, round 2',
    body: 'Shortened the welcome screen to one sentence and moved the template picker above the fold.\n\nNext: test the new empty state with three people from support.',
    tags: ['copy', 'onboarding'],
    authorName: 'Tomás Silva',
    source: 'human',
    createdAt: ago(3 * HOUR_MS),
  },
  {
    id: 3,
    title: 'Standup notes, Friday',
    body: 'Marcus is finishing the tag filter. Lena is reviewing the API rate limits. Blocked: waiting on staging credentials from infra.',
    tags: ['standup'],
    authorName: 'Marcus Chen',
    source: 'agent',
    createdAt: ago(DAY_MS),
  },
  {
    id: 2,
    title: 'API rate limits for agents',
    body: 'Agents can create up to 60 notes a minute per token. Above that the API returns 429 with a Retry-After header, and the client should back off.',
    tags: ['api', 'agents'],
    authorName: 'Lena Fischer',
    source: 'human',
    createdAt: ago(2 * DAY_MS),
  },
  {
    id: 1,
    title: 'Offsite ideas',
    body: 'Half-day workshop on the map editor, then dinner. Lena suggested Galle Face Green for an evening walk.',
    tags: ['team'],
    authorName: 'Tomás Silva',
    source: 'human',
    createdAt: ago(9 * DAY_MS),
  },
]
