import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSignupEmail, normalizePhone, validateSignup } from '../src/signup.mjs'

const valid = { name: 'Ana Souza', age: '34', email: 'ana@email.com', phone: '(11) 90000-0000' }

test('accepts the four briefing fields', () => {
  assert.equal(validateSignup(valid), null)
})

test('points each error at the field that needs fixing', () => {
  assert.equal(validateSignup({ ...valid, name: ' ' }).field, 'name')
  assert.equal(validateSignup({ ...valid, age: '' }).field, 'age')
  assert.equal(validateSignup({ ...valid, age: '4.5' }).field, 'age')
  assert.equal(validateSignup({ ...valid, email: 'ana@' }).field, 'email')
  assert.equal(validateSignup({ ...valid, phone: '9000' }).field, 'phone')
})

test('normalizes phone numbers to digits', () => {
  assert.equal(normalizePhone('+55 (11) 90000-0000'), '5511900000000')
})

test('builds a prefilled email to the Kin contact address', () => {
  const link = buildSignupEmail({ ...valid, phone: normalizePhone(valid.phone) })
  assert.ok(link.startsWith('mailto:contato@kinmovimento.com.br?'))
  assert.match(decodeURIComponent(link), /Nome: Ana Souza\nIdade: 34\nE-mail: ana@email.com\nTelefone: 11900000000/)
})
