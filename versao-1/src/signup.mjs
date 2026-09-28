export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '')
}

export function validateSignup(data) {
  if (typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.trim().length > 120) return 'Informe seu nome completo.'
  if (typeof data.email !== 'string' || data.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'Informe um e-mail válido.'
  const phone = normalizePhone(data.phone)
  if (!/^(?:55)?\d{10,11}$/.test(phone)) return 'Informe um telefone válido, incluindo o DDD.'
  const age = Number(data.age)
  if (!Number.isInteger(age) || age < 18 || age > 120) return 'O cadastro deve ser feito por uma pessoa maior de 18 anos. Para menores, peça a um responsável.'
  if (data.consent !== 'on' && data.consent !== true) return 'Autorize o contato para continuar.'
  return null
}

export function buildSignupEmail(data) {
  const body = `Olá, equipe KIN!\n\nQuero conhecer a KIN e receber novidades.\n\nNome: ${data.name}\nE-mail: ${data.email}\nTelefone: ${data.phone}\nIdade: ${data.age}\n\nAutorizo o contato por e-mail ou telefone para receber novidades da KIN.`
  return `mailto:contato@kinmovimento.com.br?subject=${encodeURIComponent('Quero conhecer a KIN')}&body=${encodeURIComponent(body)}`
}
