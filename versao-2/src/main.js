import './styles.css'
import { buildSignupEmail, normalizePhone, validateSignup } from './signup.mjs'

// Mobile menu
const toggle = document.querySelector('.menu-toggle')
const nav = document.getElementById('nav')
function setMenu(open) {
  nav.classList.toggle('is-open', open)
  toggle.setAttribute('aria-expanded', String(open))
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu')
}
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')))
nav.addEventListener('click', (event) => { if (event.target.closest('a')) setMenu(false) })
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus() } })

// Signup form: posts to VITE_SIGNUP_ENDPOINT when configured, otherwise prepares an email.
const form = document.getElementById('signup-form')
const status = document.getElementById('form-status')
const submit = form.querySelector('.form-submit')
const endpoint = import.meta.env.VITE_SIGNUP_ENDPOINT?.trim()

function showStatus(message, type = '') {
  status.className = `form-status ${type}`
  status.textContent = message
}

form.addEventListener('input', (event) => event.target.removeAttribute('aria-invalid'))
form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const data = Object.fromEntries(new FormData(form))
  form.querySelectorAll('[aria-invalid]').forEach((input) => input.removeAttribute('aria-invalid'))
  const error = validateSignup(data)
  if (error) {
    const input = form.elements[error.field]
    input.setAttribute('aria-invalid', 'true')
    input.focus()
    showStatus(error.message, 'error')
    return
  }
  const payload = { name: data.name.trim(), age: Number(data.age), email: data.email.trim(), phone: normalizePhone(data.phone) }
  if (!endpoint) {
    showStatus('Seu e-mail está pronto. Envie a mensagem para concluir o cadastro. ')
    const link = document.createElement('a')
    link.href = buildSignupEmail(payload)
    link.textContent = 'Abrir e-mail'
    status.append(link)
    return
  }
  submit.disabled = true
  showStatus('Enviando…')
  try {
    if (!endpoint.startsWith('https://')) throw new Error('invalid endpoint')
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error('request failed')
    form.reset()
    showStatus('Cadastro enviado! Em breve você recebe as novidades da Kin.')
  } catch {
    showStatus('Não foi possível enviar agora. Tente novamente ou escreva para contato@kinmovimento.com.br.', 'error')
  } finally {
    submit.disabled = false
  }
})
