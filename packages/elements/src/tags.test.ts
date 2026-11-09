import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addTags, parseTags, splitTags } from './tags.ts'

test('adds a trimmed tag', () => {
  assert.deepEqual(addTags(['launch'], '  q4 '), ['launch', 'q4'])
})

test('skips blanks and case-insensitive duplicates', () => {
  assert.deepEqual(addTags(['Launch'], 'launch'), ['Launch'])
  assert.deepEqual(addTags(['launch'], '   '), ['launch'])
})

test('splits pasted text on commas so a tag never contains one', () => {
  assert.deepEqual(addTags([], 'a, b,,a'), ['a', 'b'])
})

test('does not mutate the input array', () => {
  const tags = ['launch']
  addTags(tags, 'q4')
  assert.deepEqual(tags, ['launch'])
})

test('stops at the maximum count, including for pasted lists', () => {
  assert.deepEqual(addTags(['a'], 'b, c, d', 3), ['a', 'b', 'c'])
  assert.deepEqual(addTags(['a', 'b'], 'c', 2), ['a', 'b'])
})

test('splits a pasted list into trimmed tags without blanks', () => {
  assert.deepEqual(splitTags(' a , ,b,'), ['a', 'b'])
})

test('parses the attribute value, including a missing attribute', () => {
  assert.deepEqual(parseTags('launch,q4'), ['launch', 'q4'])
  assert.deepEqual(parseTags(null), [])
})
