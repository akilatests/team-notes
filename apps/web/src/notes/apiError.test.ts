import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError, errorDetail, isNotFound } from './apiError.ts'

test('no response means a connection problem', () => {
  assert.equal(errorDetail(new ApiError('Network Error', undefined)), 'Check your connection and try again.')
  assert.equal(errorDetail(new Error('boom')), 'Check your connection and try again.')
})

test('a 4xx shows the API message so the user can fix the input', () => {
  assert.equal(errorDetail(new ApiError('title should not be empty', 400)), 'title should not be empty')
})

test('a 5xx hides server details', () => {
  assert.equal(errorDetail(new ApiError('Something went wrong', 500)), 'The server had a problem. Try again in a moment.')
})

test('only a 404 counts as not found', () => {
  assert.equal(isNotFound(new ApiError('Note 5 not found', 404)), true)
  assert.equal(isNotFound(new ApiError('Bad', 400)), false)
  assert.equal(isNotFound(new Error('x')), false)
})
