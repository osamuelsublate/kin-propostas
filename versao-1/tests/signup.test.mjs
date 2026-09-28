import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizePhone, validateSignup, buildSignupEmail } from '../src/signup.mjs'

const valid = { name: 'Maria Silva', email: 'maria@example.com', phone: '(11) 99999-1234', age: '32', consent: 'on' }

test('accepts a complete adult signup', () => assert.equal(validateSignup(valid), null))
test('normalizes Brazilian phone formatting', () => assert.equal(normalizePhone('+55 (11) 99999-1234'), '5511999991234'))
test('accepts a country code and a landline', () => {
  assert.equal(validateSignup({ ...valid, phone: '+55 (11) 3333-1234' }), null)
  assert.equal(validateSignup({ ...valid, phone: '+55 (11) 99999-1234' }), null)
})
test('rejects missing name, malformed email, phone, and missing consent', () => {
  for (const overrides of [{ name: ' ' }, { email: 'invalid' }, { phone: '123' }, { phone: '123456789012' }, { consent: '' }]) {
    assert.equal(typeof validateSignup({ ...valid, ...overrides }), 'string')
  }
})
test('does not collect direct signups from children or accept invalid ages', () => {
  for (const age of ['12', '17', '', '32.5', 'abc', '121']) assert.equal(typeof validateSignup({ ...valid, age }), 'string')
})
test('builds an encoded email without claiming to store data', () => {
  const url = buildSignupEmail({ ...valid, name: 'Maria & João' })
  assert.ok(url.startsWith('mailto:contato@kinmovimento.com.br?'))
  const params = new URLSearchParams(url.split('?')[1])
  assert.equal(params.get('subject'), 'Quero conhecer a KIN')
  assert.ok(params.get('body').includes('Maria & João'))
  assert.ok(params.get('body').includes('Autorizo o contato'))
})
