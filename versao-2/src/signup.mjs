export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '')
}

export function validateSignup(data) {
  const name = String(data.name || '').trim()
  const email = String(data.email || '').trim()
  if (name.length < 2 || name.length > 120) return { field: 'name', message: 'Informe seu nome completo.' }
  const age = Number(data.age)
  if (!Number.isInteger(age) || age < 1 || age > 120) return { field: 'age', message: 'Informe sua idade.' }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { field: 'email', message: 'Informe um e-mail válido.' }
  if (!/^(?:55)?\d{10,11}$/.test(normalizePhone(data.phone))) return { field: 'phone', message: 'Informe um telefone válido, com DDD.' }
  return null
}

export function buildSignupEmail(data) {
  const body = `Olá, equipe Kin!\n\nQuero conhecer a Kin.\n\nNome: ${data.name}\nIdade: ${data.age}\nE-mail: ${data.email}\nTelefone: ${data.phone}`
  return `mailto:contato@kinmovimento.com.br?subject=${encodeURIComponent('Quero conhecer a Kin!')}&body=${encodeURIComponent(body)}`
}
