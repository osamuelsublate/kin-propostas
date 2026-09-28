import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin, Menu, Plus, X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { buildSignupEmail, normalizePhone, validateSignup } from './signup.mjs'
import HeroMotion from './HeroMotion.jsx'

gsap.registerPlugin(ScrollTrigger)
const addressLink = 'https://www.google.com/maps/search/?api=1&query=Rua+Correia+Dias+73+Vila+Mariana+Sao+Paulo'
const navigation = [['Quem somos', '#sobre'], ['Públicos', '#geracoes'], ['Atividades', '#atividades'], ['Formulário', '#comunidade'], ['Onde estamos', '#localizacao'], ['Parceria', '#parcerias'], ['F.A.Q', '#faq']]

const activities = [
  { name: 'Ginástica', image: 'photo-1594737625785-a6cbdabd333c', position: 'center', alt: 'Pessoa praticando exercício de força e equilíbrio' },
  { name: 'Circo', image: 'photo-1518611012118-696072aa579a', position: 'center', alt: 'Pessoa em uma prática de movimento e alongamento' },
  { name: 'Calistenia', image: 'photo-1598971639058-fab3c3109a00', position: 'center', alt: 'Pessoa praticando exercícios com o peso do corpo' },
  { name: 'Expressão corporal e motora', image: 'photo-1508700115892-45ecd05ae2ad', position: 'center', alt: 'Artista se expressando por meio da dança' },
]
const questions = [
  ['Para quais idades a Kin é indicada?', 'A Kin foi pensada para todas as gerações, com experiências desenvolvidas para crianças, adolescentes, adultos e idosos.'],
  ['Preciso ter experiência para começar?', 'Você não precisa chegar sabendo. A proposta da Kin é acolher diferentes momentos e experiências com o movimento. Os detalhes sobre níveis e turmas serão divulgados antes da inauguração.'],
  ['Quais modalidades serão oferecidas?', 'O projeto inclui ginástica, circo, calistenia e expressão corporal e motora, além de práticas de mobilidade, força, flexibilidade, coordenação e equilíbrio, com saúde e acompanhamento. A programação completa será anunciada em breve.'],
  ['Posso fazer uma aula experimental?', 'As informações sobre aulas experimentais serão divulgadas em breve. Manifeste seu interesse para acompanhar as novidades da inauguração.'],
  ['Existem planos para famílias?', 'Os planos e as condições comerciais ainda serão divulgados. A convivência entre gerações faz parte da proposta da Kin.'],
  ['Crianças e adultos podem fazer atividades ao mesmo tempo?', 'A programação e os horários ainda serão anunciados. Cadastre seu interesse para receber informações sobre as atividades para cada geração.'],
  ['Como funcionam as avaliações?', 'Saúde e acompanhamento fazem parte da proposta da Kin. Os detalhes do processo de avaliação serão compartilhados pela equipe antes do início das atividades.'],
  ['Onde ficará a Kin?', 'Na Rua Correia Dias, 73, Vila Mariana, São Paulo – SP, 04104-000. Próximo ao Metrô Paraíso, à Avenida Paulista e ao Shopping Pátio Paulista.'],
  ['Quando começam as aulas?', 'A data prevista para a inauguração é 12 de dezembro de 2026. O calendário de aulas será divulgado em breve.'],
]

function Flower({ className = '', ...props }) {
  return <svg viewBox="0 0 100 100" fill="currentColor" className={`flower ${className}`} {...props}><path d="M43 4C46-2 54-2 57 4L64 24 84 15C91 12 98 19 95 26L85 46 99 57C105 62 102 71 95 72L73 75 73 96C73 104 63 107 58 101L45 84 28 97C22 102 14 96 16 89L21 68 1 62C-6 60-6 50 1 47L22 40 13 21C10 14 17 7 24 10L43 20Z" /></svg>
}
function KineticForm({ variant }) {
  return <div className={`kinetic-form kinetic-${variant}`} aria-hidden="true">
    <div className="kinetic-core">{Array.from({ length: 9 }, (_, i) => <span key={i} style={{ '--i': i }} />)}</div>
    <span className="kinetic-pearl" />
    <span className="kinetic-shadow" />
  </div>
}
function MotionInterlude() {
  return <section className="motion-interlude" aria-labelledby="motion-title">
    <div className="motion-meta"><span><span className="label-dot" /> MAIS DO QUE UM LUGAR PARA SE EXERCITAR</span><span>UM CLUBE PARA</span></div>
    <div className="motion-field" aria-hidden="true"><div className="motion-halo" /><div className="motion-sculpture">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ '--i': i }} />)}</div><span className="motion-sphere" /></div>
    <h2 id="motion-title"><span className="motion-word">Crescer.</span><span className="motion-word serif">Conviver.</span><span className="motion-word">Continuar.</span></h2>
    <div className="motion-bottom"><p>Um clube para crescer, conviver<br />e continuar <em>em movimento.</em></p><a className="motion-link" href="#atividades" aria-label="Ver atividades"><ArrowDown size={28} /></a><span>VER<br />ATIVIDADES</span></div>
  </section>
}
function Brand({ light = false }) {
  return <a className={`brand ${light ? 'brand-light' : ''}`} href="#inicio" aria-label="Kin — início"><span>kin<span className="brand-dot">.</span></span><span className="brand-description">CLUBE DE<br />MOVIMENTO</span></a>
}
function SectionLabel({ children }) {
  return <div className="section-label"><span className="label-dot" />{children}</div>
}

function SignupForm() {
  const [status, setStatus] = useState({ type: '', message: '' })
  const [sending, setSending] = useState(false)
  const [emailLink, setEmailLink] = useState('')
  const endpoint = import.meta.env.VITE_SIGNUP_ENDPOINT?.trim()
  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    const error = validateSignup(data)
    if (error) { setStatus({ type: 'error', message: error }); return }
    const payload = { name: data.name.trim(), email: data.email.trim(), phone: normalizePhone(data.phone), age: Number(data.age), consent: data.consent === 'on' }
    if (!endpoint) {
      setEmailLink(buildSignupEmail(payload))
      setStatus({ type: 'email', message: 'Seu e-mail está preparado. Clique abaixo para abrir seu aplicativo de e-mail e envie a mensagem para concluir. Nenhum dado foi armazenado neste site.' })
      return
    }
    setSending(true)
    setStatus({ type: '', message: '' })
    try {
      if (!endpoint.startsWith('https://')) throw new Error('invalid endpoint')
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error('request failed')
      setStatus({ type: 'success', message: 'Interesse enviado! Agradecemos por querer fazer parte da comunidade Kin.' })
      form.reset()
    } catch {
      setStatus({ type: 'error', message: 'Não foi possível enviar agora. Tente novamente ou fale com contato@kinmovimento.com.br.' })
    } finally { setSending(false) }
  }
  return <form className="signup-form" onSubmit={submit}>
    <div className="form-topline"><span>SAVE THE DATE 12/12/26</span><ArrowDown size={18} /></div>
    <label className="field full">Nome<input autoComplete="name" name="name" placeholder="Seu nome completo" required minLength={2} maxLength={120} /></label>
    <label className="field full">E-mail<input autoComplete="email" type="email" name="email" placeholder="voce@email.com" required maxLength={254} /></label>
    <label className="field">Telefone<input autoComplete="tel" name="phone" type="tel" placeholder="(11) 90000-0000" required maxLength={20} inputMode="tel" /></label>
    <label className="field">Idade<input name="age" type="number" min="18" max="120" placeholder="Sua idade" required inputMode="numeric" /></label>
    <label className="consent"><input type="checkbox" name="consent" required /><span>Quero receber novidades da Kin e autorizo o contato por e-mail ou telefone.</span></label>
    <button className="button button-dark submit-button" disabled={sending} type="submit">{sending ? 'Enviando…' : 'Quero conhecer a Kin!'}{sending ? <span className="loading-dot" /> : <ArrowUpRight size={21} />}</button>
    <p className="form-note">Cadastro para maiores de 18 anos. Para crianças e adolescentes, o interesse deve ser enviado por um responsável.</p>
    {!endpoint && <p className="form-note">Nesta versão, o envio é feito pelo seu aplicativo de e-mail.</p>}
    <div className={`form-status ${status.type}`} role="status" aria-live="polite">{status.message}{status.type === 'email' && <a className="email-link" href={emailLink}>Abrir e-mail e enviar <ArrowUpRight size={16} /></a>}</div>
  </form>
}

export default function App() {
  const root = useRef(null)
  const menuButton = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeActivity, setActiveActivity] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const reducedMotion = prefersReducedMotion
  const activity = activities[activeActivity]

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setPrefersReducedMotion(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    let boost = 1
    const context = gsap.context(() => {
      gsap.fromTo('.hero-reveal', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' })
      gsap.fromTo('.hero-title-line > span', { yPercent: 115, rotate: 5 }, { yPercent: 0, rotate: 0, duration: 0.95, stagger: 0.08, ease: 'power4.out' })
      gsap.utils.toArray('[data-reveal]').forEach((element) => {
        gsap.fromTo(element, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: element, start: 'top 94%', once: true } })
      })
      gsap.fromTo('.motion-word', { xPercent: (i) => i === 1 ? 16 : -16 }, { xPercent: (i) => i === 1 ? -8 : 8, ease: 'none', scrollTrigger: { trigger: '.motion-interlude', start: 'top bottom', end: 'bottom top', scrub: 1.1 } })
      gsap.fromTo('.motion-sculpture', { rotate: -80, scale: 0.72 }, { rotate: 140, scale: 1.16, ease: 'none', scrollTrigger: { trigger: '.motion-interlude', start: 'top bottom', end: 'bottom top', scrub: 0.4 } })
      gsap.fromTo('.about-visual > img', { yPercent: -6, scale: 1.13 }, { yPercent: 6, scale: 1.13, ease: 'none', scrollTrigger: { trigger: '.about-visual', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.to('.community-flower', { rotate: 150, ease: 'none', scrollTrigger: { trigger: '.community', start: 'top bottom', end: 'bottom top', scrub: 1 } })
      // Scrolling fast spins the 3D forms faster for a moment, then they ease back to their own pace.
      ScrollTrigger.create({ onUpdate: (self) => { boost = Math.max(boost, 1 + Math.min(Math.abs(self.getVelocity()) / 350, 7)) } })
    }, root)
    const spins = Array.from(root.current.querySelectorAll('.kinetic-core, .motion-sculpture > span')).flatMap((element) => element.getAnimations().filter((animation) => animation.animationName === 'form-spin'))
    const easeSpin = () => {
      if (boost === 1) return
      boost = boost - 1 < 0.01 ? 1 : boost + (1 - boost) * 0.06
      spins.forEach((animation) => { animation.playbackRate = boost })
    }
    gsap.ticker.add(easeSpin)
    return () => {
      gsap.ticker.remove(easeSpin)
      spins.forEach((animation) => { animation.playbackRate = 1 })
      context.revert()
    }
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const cleanups = Array.from(root.current.querySelectorAll('.generation-card')).map((card) => {
      let frame = 0
      const move = (event) => {
        cancelAnimationFrame(frame)
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect()
          const x = (event.clientX - rect.left) / rect.width
          const y = (event.clientY - rect.top) / rect.height
          card.style.setProperty('--tilt-x', `${(0.5 - y) * 8}deg`)
          card.style.setProperty('--tilt-y', `${(x - 0.5) * 10}deg`)
          card.style.setProperty('--shine-x', `${x * 100}%`)
          card.style.setProperty('--shine-y', `${y * 100}%`)
        })
      }
      const reset = () => {
        cancelAnimationFrame(frame)
        ;['--tilt-x', '--tilt-y', '--shine-x', '--shine-y'].forEach((name) => card.style.removeProperty(name))
      }
      card.addEventListener('pointermove', move)
      card.addEventListener('pointerleave', reset)
      return () => { reset(); card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', reset) }
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [reducedMotion])

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() }
    }
    const closeOnDesktop = () => { if (window.innerWidth > 1400) setMenuOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeOnDesktop)
    return () => { document.removeEventListener('keydown', closeOnEscape); window.removeEventListener('resize', closeOnDesktop) }
  }, [menuOpen])

  function selectTab(event, index) {
    let next = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % activities.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + activities.length) % activities.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = activities.length - 1
    else return
    event.preventDefault()
    setActiveActivity(next)
    document.getElementById(`activity-tab-${next}`)?.focus()
  }

  return <div ref={root} className={reducedMotion ? 'motion-paused' : ''}>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <div className="announcement"><span className="status-dot" /> <span className="announcement-lead">EM BREVE EM RUA CORREIA DIAS, 73 – VILA MARIANA</span> <span className="announcement-divider">/</span><span>SAVE THE DATE 12/12/26</span><ArrowUpRight size={14} /></div>
    <header className="header" id="inicio">
      <Brand />
      <nav className="desktop-nav" aria-label="Navegação principal">{navigation.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</nav>
      <a className="button button-small button-dark header-cta" href="#comunidade">Quero saber mais <ArrowUpRight size={17} /></a>
      <button ref={menuButton} className="menu-toggle" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      <nav id="mobile-nav" className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegação móvel" inert={!menuOpen}>{[...navigation, ['Quero saber mais', '#comunidade']].map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRight size={20} /></a>)}</nav>
    </header>

    <main id="conteudo">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow hero-reveal"><span className="label-dot" /> SAVE THE DATE 12/12/26</div>
          <h1 id="hero-title"><span className="hero-title-line"><span>Onde os</span></span><span className="hero-title-line"><span>movimentos</span></span><span className="hero-title-line"><span>se <span className="serif">encontram</span></span></span></h1>
          <p className="hero-description hero-reveal">Um novo clube urbano no coração de São Paulo para todas as gerações. <strong>Ginástica, circo, expressão corporal e experiências de movimento para crianças, adolescentes, adultos e idosos.</strong></p>
          <div className="hero-buttons hero-reveal"><a className="button button-dark" href="#comunidade">Quero saber mais <ArrowUpRight size={20} /></a><a className="text-link" href="#atividades">Ver atividades <ArrowDown size={17} /></a></div>
          <div className="hero-location hero-reveal"><MapPin size={15} strokeWidth={1.5} /><span>Em breve em<br /><strong>Rua Correia Dias, 73 – Vila Mariana</strong></span></div>
        </div>
        <HeroMotion paused={reducedMotion} />
      </section>

      <div className="marquee" aria-label="Crescer, conviver e continuar em movimento."><div className="marquee-track">{[0, 1, 2, 3].map((item) => <div key={item} className="marquee-group" aria-hidden={item !== 0}><span>crescer</span><Flower aria-hidden="true" /><span className="serif">conviver</span><Flower aria-hidden="true" /><span>continuar em movimento</span><Flower aria-hidden="true" /></div>)}</div></div>

      <section id="sobre" className="about section-pad">
        <div className="about-intro" data-reveal><SectionLabel>QUEM SOMOS</SectionLabel><h2>Um novo jeito<br />de viver <span className="serif">o movimento</span></h2><div className="about-text"><p>A KIN é um espaço onde diferentes gerações encontram no movimento uma forma de desenvolver autonomia, cuidar da saúde, descobrir novas possibilidades e criar conexões.</p><p><strong>Mais do que um lugar para se exercitar, um clube para crescer, conviver e continuar em movimento.</strong></p><a className="text-link" href="#geracoes">Um lugar para todas as gerações <ArrowDown size={17} /></a></div></div>
        <div className="about-visual" data-reveal><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1100&q=85" alt="Pessoas se exercitando juntas em um espaço de movimento" width="1100" height="730" /><div className="image-shade" /><span className="photo-caption">IMAGEM ILUSTRATIVA</span><div className="round-seal"><Flower aria-hidden="true" /><span>UM NOVO<br /><strong>clube urbano</strong></span></div></div>
        <div className="values-strip" data-reveal><span><Plus size={18} /> AUTONOMIA</span><span><Plus size={18} /> SAÚDE</span><span><Plus size={18} /> NOVAS POSSIBILIDADES</span><span><Plus size={18} /> CONEXÕES</span></div>
      </section>

      <section id="geracoes" className="generations section-pad">
        <div className="section-heading" data-reveal><div><SectionLabel>PÚBLICOS</SectionLabel><h2>Um lugar para<br /><span className="serif">todas as gerações</span></h2></div><p>Da infância à longevidade, a Kin foi projetada para acompanhar o corpo em todas as fases da vida.</p></div>
        <div className="generation-grid">
          <a href="#comunidade" className="generation-card children-card" data-reveal><div className="generation-card-top"><span>CRIANÇAS</span><ArrowUpRight size={26} /></div><div className="generation-drawing" aria-hidden="true"><KineticForm variant="coil" /></div><div className="generation-content"><h3>Crianças</h3><strong className="generation-subtitle">Movimento para crescer.</strong><p>Um espaço para brincar, explorar o corpo, desenvolver habilidades e construir autonomia com liberdade, segurança e prazer.</p><span className="card-link">Quero saber mais <ArrowRight size={17} /></span></div></a>
          <a href="#comunidade" className="generation-card adults-card" data-reveal><div className="generation-card-top"><span>ADULTOS</span><ArrowUpRight size={26} /></div><div className="generation-drawing" aria-hidden="true"><KineticForm variant="orbit" /></div><div className="generation-content"><h3>Adultos</h3><strong className="generation-subtitle">Movimento para viver melhor.</strong><p>Experiências que desenvolvem força, mobilidade e consciência corporal enquanto criam espaço para cuidar de si, experimentar e se conectar.</p><span className="card-link">Quero saber mais <ArrowRight size={17} /></span></div></a>
          <a href="#comunidade" className="generation-card seniors-card" data-reveal><div className="generation-card-top"><span>IDOSOS</span><ArrowUpRight size={26} /></div><div className="generation-drawing" aria-hidden="true"><KineticForm variant="bloom" /></div><div className="generation-content"><h3>Idosos</h3><strong className="generation-subtitle">Movimento para longevidade.</strong><p>Práticas que preservam autonomia, confiança e vitalidade para continuar aprendendo, convivendo e aproveitando a vida em movimento.</p><span className="card-link">Quero saber mais <ArrowRight size={17} /></span></div></a>
        </div>
        <p className="generation-footnote" data-reveal><Flower aria-hidden="true" /> Porque toda idade tem novas possibilidades para descobrir.</p>
      </section>

      <MotionInterlude />

      <section id="atividades" className="activities section-pad">
        <div className="section-heading" data-reveal><div><SectionLabel>ATIVIDADES</SectionLabel><h2>Muitas formas de colocar<br /><span className="serif">o corpo em movimento</span></h2></div></div>
        <div className="activity-explorer" data-reveal><div className="activity-tabs" role="tablist" aria-label="Modalidades">{activities.map((item, index) => <button key={item.name} id={`activity-tab-${index}`} role="tab" aria-selected={activeActivity === index} aria-controls="activity-panel" tabIndex={activeActivity === index ? 0 : -1} onKeyDown={(event) => selectTab(event, index)} onClick={() => setActiveActivity(index)} className={activeActivity === index ? 'active' : ''}><span>{item.name}</span><ArrowUpRight size={24} /></button>)}</div>
          <div className="activity-panel" id="activity-panel" role="tabpanel" aria-labelledby={`activity-tab-${activeActivity}`} tabIndex={0}><img key={activity.image} src={`https://images.unsplash.com/${activity.image}?auto=format&fit=crop&w=1000&q=85`} alt={activity.alt} loading="lazy" decoding="async" style={{ objectPosition: activity.position }} width="1000" height="850" /><div className="activity-overlay" /><span className="activity-image-label">IMAGEM ILUSTRATIVA</span><div className="activity-info" key={activity.name}><h3>{activity.name}<ArrowUpRight size={34} /></h3></div></div>
        </div>
        <div className="movement-tags" data-reveal><span>E TAMBÉM</span>{['Mobilidade', 'Força', 'Flexibilidade', 'Coordenação', 'Equilíbrio', 'Saúde e acompanhamento'].map((tag) => <span className="movement-tag" key={tag}>{tag}<Plus size={13} /></span>)}</div>
      </section>

      <section id="comunidade" className="community section-pad"><div className="community-copy" data-reveal><SectionLabel>FORMULÁRIO</SectionLabel><h2>A Kin está<br /><span className="serif">chegando!</span></h2><p>Faça parte dos primeiros membros da nossa comunidade.</p><p>Cadastre-se para acompanhar as novidades e receber em primeira mão as informações sobre a inauguração da Kin.</p><div className="launch-date"><span>SAVE THE DATE</span><strong>12<span>.</span>12<span>.</span>26</strong><span>VILA MARIANA · SÃO PAULO</span></div><Flower className="community-flower" aria-hidden="true" /></div><div data-reveal><SignupForm /></div></section>

      <section id="localizacao" className="location section-pad"><div className="location-copy" data-reveal><SectionLabel>ONDE ESTAMOS</SectionLabel><h2>Onde encontrar<br /><span className="serif">a Kin</span></h2><p>A Kin está na Vila Mariana, em São Paulo, uma localização pensada para aproximar movimento, convivência e vida cotidiana.</p><div className="address"><MapPin size={23} /><div><strong>Rua Correia Dias, 73 – Vila Mariana</strong><span>São Paulo – SP, 04104-000</span></div></div><div className="location-nearby"><span><span className="metro-symbol">M</span> Próximo ao Metrô Paraíso</span><span><Plus size={15} /> Av. Paulista e Shopping Pátio Paulista</span><span><Plus size={15} /> Importantes escolas da região, como Colégio Bandeirantes, Etapa e Benjamin Constant</span></div><a className="button button-outline" href={addressLink} target="_blank" rel="noopener noreferrer">Como chegar <ArrowUpRight size={19} /></a></div><a href={addressLink} target="_blank" rel="noopener noreferrer" className="map-art" aria-label="Abrir localização da Kin no Google Maps" data-reveal><svg viewBox="0 0 600 510" aria-hidden="true"><defs><pattern id="map-grid" width="130" height="95" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><rect width="130" height="95" fill="#e7e5d9" /><rect x="7" y="7" width="113" height="78" rx="10" fill="#d8d9cc" stroke="#cfd1c2" /></pattern></defs><rect width="600" height="510" fill="url(#map-grid)" /><path d="M-40 425L640 113" stroke="#f6f4e9" strokeWidth="43" /><path d="M144 -20L382 540" stroke="#f6f4e9" strokeWidth="24" /><path d="M-20 113L632 389" stroke="#eeeddf" strokeWidth="19" /><path d="M11 372L617 93" stroke="#bfc3aa" strokeWidth="4" strokeDasharray="7 8" /><path d="M480 18l90 31-35 82-84-36Z" fill="#bccb9e" /><path d="M34 435l69-22 28 64-92 31Z" fill="#bccb9e" /><text x="69" y="318" transform="rotate(-24 69 318)">R. CORREIA DIAS</text><text x="340" y="190" transform="rotate(-24 340 190)">R. VERGUEIRO</text><text x="131" y="110" transform="rotate(66 131 110)">AV. BERNARDINO DE CAMPOS</text><circle cx="147" cy="354" r="14" fill="#49302e" /><text x="142" y="359" fill="#fff" className="map-metro">M</text><text x="80" y="396">PARAÍSO</text></svg><div className="map-pin"><span>kin.</span><span>RUA CORREIA<br />DIAS, 73</span></div><span className="map-district">VILA<br /><i>MARIANA</i></span><span className="map-disclaimer">MAPA ILUSTRATIVO</span><span className="map-open">Explorar no Google Maps <ArrowUpRight size={18} /></span></a></section>

      <section id="parcerias" className="partnership section-pad" data-reveal><Flower aria-hidden="true" /><div><span className="eyebrow">PARCERIA</span><h2>Quer ser um parceiro<br /><span className="serif">da Kin?</span></h2><p>Acreditamos em conexões que ampliam o movimento para além do nosso espaço.</p><p>Se você representa uma <strong>escola, empresa, negócio local, marca</strong> ou é um <strong>profissional de saúde</strong> e acredita que podemos criar algo juntos, queremos conversar.</p></div><a href="mailto:contato@kinmovimento.com.br?subject=Quero%20ser%20parceiro%20Kin" className="button button-dark">Quero ser parceiro Kin <ArrowUpRight size={19} /></a></section>

      <section id="faq" className="faq section-pad"><div data-reveal><SectionLabel>F.A.Q</SectionLabel><h2>Tudo que você<br />precisa saber<br /><span className="serif">sobre a Kin</span></h2><a href="mailto:contato@kinmovimento.com.br" className="text-link">contato@kinmovimento.com.br <ArrowUpRight size={17} /></a></div><div className="faq-list" data-reveal>{questions.map(([question, answer], index) => <details key={question} name="kin-faq" open={index === 0 ? true : undefined}><summary><span>{question}</span><Plus className="faq-plus" size={20} /></summary><p>{answer}</p></details>)}</div></section>
    </main>

    <footer className="footer section-pad"><div className="footer-top"><Brand light /><p>Um clube para crescer, conviver<br />e continuar em movimento.</p><a href="#inicio" className="back-top" aria-label="Voltar ao início"><ArrowUpRight size={25} /></a></div><div className="footer-middle"><span>SAVE THE DATE 12/12/26</span><nav aria-label="Navegação do rodapé"><a href="#sobre">Quem somos</a><a href="#atividades">Atividades</a><a href="#localizacao">Onde estamos</a><a href="#faq">F.A.Q.</a></nav><a href="mailto:contato@kinmovimento.com.br">contato@kinmovimento.com.br <ArrowUpRight size={16} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} KIN. TODOS OS DIREITOS RESERVADOS.</span><span>RUA CORREIA DIAS, 73 · VILA MARIANA · SÃO PAULO</span></div></footer>
  </div>
}
