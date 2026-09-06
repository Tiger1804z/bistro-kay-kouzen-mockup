import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import logoSrc from './imports/IMG_0309.jpeg'

type MediaKind = 'image' | 'video'

type MediaAssetProps = {
  kind?: MediaKind
  src: string
  poster?: string
  alt: string
  className?: string
  priority?: boolean
}

const MEDIA = {
  heroPoster: 'https://images.unsplash.com/photo-1781955781178-6ea29c66e860?w=2560&h=1440&fit=crop&auto=format&q=92',
  heroVideo: 'https://videos.pexels.com/video-files/5498710/5498710-hd_1920_1080_25fps.mp4',
  experiencePoster: 'https://images.unsplash.com/photo-1756981168649-0e3c3c8a32f3?w=1800&h=2200&fit=crop&auto=format&q=90',
  experienceVideo: 'https://videos.pexels.com/video-files/8922781/8922781-hd_2048_1080_25fps.mp4',
  // Créole/caribéen — bannann peze, crevettes épicées, portions généreuses.
  // Le recadrage focalpoint sort une bouteille de marque du cadre d'origine.
  food: 'https://images.unsplash.com/photo-1723437496817-01322948c104?w=1900&h=1350&fit=crop&crop=focalpoint&fp-x=0.62&fp-y=0.72&auto=format&q=90',
  foodPlantain: 'https://images.unsplash.com/photo-1783408356251-f4953f943bb2?w=1500&h=1900&fit=crop&auto=format&q=90',
  cocktail: 'https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?w=1400&h=1800&fit=crop&auto=format&q=90',
  cateringPoster: 'https://images.unsplash.com/photo-1762765684810-b734486c5eda?w=2400&h=1500&fit=crop&auto=format&q=90',
  cateringVideo: 'https://videos.pexels.com/video-files/4253335/4253335-hd_1080_2048_25fps.mp4',
  roomPoster: 'https://images.unsplash.com/photo-1769638913500-4a0b6ac4561a?w=2400&h=1500&fit=crop&auto=format&q=90',
  roomVideo: 'https://videos.pexels.com/video-files/6174608/6174608-hd_1920_1080_30fps.mp4',
  acousticPoster: 'https://images.unsplash.com/photo-1786644806311-cbe6998156ac?w=2000&h=1400&fit=crop&auto=format&q=90',
  acousticVideo: 'https://videos.pexels.com/video-files/6174184/6174184-hd_1920_1080_30fps.mp4',
  jazz: 'https://images.unsplash.com/photo-1768949005507-8c0f571285f4?w=2000&h=1400&fit=crop&auto=format&q=90',
  caribbean: 'https://images.unsplash.com/photo-1500217052183-bc01eee1a74e?w=2000&h=1400&fit=crop&auto=format&q=90',
  galleryVideo: 'https://videos.pexels.com/video-files/7608912/7608912-hd_1920_1080_25fps.mp4',
  finalPoster: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=2400&h=1500&fit=crop&auto=format&q=90',
  finalVideo: 'https://videos.pexels.com/video-files/4485541/4485541-hd_1920_1080_25fps.mp4',
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const smoothstep = (from: number, to: number, value: number) => {
  const x = clamp((value - from) / (to - from))
  return x * x * (3 - 2 * x)
}

function useReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      }),
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )
    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
}

function useScrollChoreography() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // No loop runs, so land the counters on their final value rather than "00".
      document.querySelectorAll<HTMLElement>('[data-count-to]').forEach((element) => {
        element.textContent = String(Number(element.dataset.countTo || 0)).padStart(2, '0')
      })
      return
    }

    const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-scene]'))
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-section]'))
    const parallaxItems = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    const driftItems = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-drift]'))
    const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count-to]'))
    const toneSections = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-tone]'))
    // Each floating control resolves its own contrast: a section can be cream while
    // a dark photograph travels under just one of the three clusters.
    const navRoot = document.querySelector<HTMLElement>('.floating-nav')
    const navZones: [string, HTMLElement][] = (
      [['Logo', '.floating-logo'], ['Center', '.nav-center'], ['Actions', '.floating-nav .nav-social'], ['Toggle', '.menu-toggle']] as const
    )
      .map(([name, selector]) => [name, document.querySelector<HTMLElement>(selector)] as [string, HTMLElement | null])
      .filter((entry): entry is [string, HTMLElement] => Boolean(entry[1]))
    const contrastMedia = Array.from(document.querySelectorAll<HTMLElement>('[data-media-tone]'))
    let frame = 0

    const setScenePhases = (element: HTMLElement, progress: number) => {
      const name = element.dataset.scrollScene
      element.style.setProperty('--p', progress.toFixed(4))

      if (name === 'hero') {
        element.style.setProperty('--hero-copy-out', smoothstep(0.12, 0.54, progress).toFixed(4))
        element.style.setProperty('--hero-frame', smoothstep(0.48, 0.94, progress).toFixed(4))
        element.style.setProperty('--hero-handoff', smoothstep(0.58, 0.86, progress).toFixed(4))
      }

      if (name === 'experience') {
        const second = smoothstep(0.25, 0.42, progress)
        const third = smoothstep(0.61, 0.78, progress)
        element.style.setProperty('--panel-one', (1 - smoothstep(0.2, 0.36, progress)).toFixed(4))
        element.style.setProperty('--panel-two', Math.min(second, 1 - smoothstep(0.52, 0.68, progress)).toFixed(4))
        element.style.setProperty('--panel-three', third.toFixed(4))
        element.style.setProperty('--experience-shift', smoothstep(0.18, 0.82, progress).toFixed(4))
      }

      if (name === 'events') {
        const second = smoothstep(0.2, 0.38, progress)
        const third = smoothstep(0.55, 0.73, progress)
        element.style.setProperty('--event-one-out', smoothstep(0.25, 0.4, progress).toFixed(4))
        element.style.setProperty('--event-two', second.toFixed(4))
        element.style.setProperty('--event-two-out', smoothstep(0.58, 0.72, progress).toFixed(4))
        element.style.setProperty('--event-three', third.toFixed(4))
      }
    }

    const update = () => {
      const viewportHeight = window.innerHeight
      const scrollY = window.scrollY
      const total = Math.max(document.documentElement.scrollHeight - viewportHeight, 1)
      document.documentElement.style.setProperty('--page-progress', (scrollY / total).toFixed(4))

      scenes.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const distance = Math.max(element.offsetHeight - viewportHeight, 1)
        setScenePhases(element, clamp(-rect.top / distance))
      })

      sections.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height))
        element.style.setProperty('--sp', progress.toFixed(4))
        if (element.dataset.scrollSection === 'final') {
          element.style.setProperty('--final-reveal', smoothstep(0.04, 0.5, progress).toFixed(4))
          element.style.setProperty('--final-copy', smoothstep(0.34, 0.67, progress).toFixed(4))
        }
        if (element.dataset.scrollSection === 'food') {
          // L'assiette entre, le cocktail remonte dans la composition, la citation
          // puis le lien suivent — le vide se remplit au fil du défilement.
          element.style.setProperty('--food-main', smoothstep(0.1, 0.36, progress).toFixed(4))
          element.style.setProperty('--food-cocktail', smoothstep(0.28, 0.6, progress).toFixed(4))
          element.style.setProperty('--food-quote', smoothstep(0.46, 0.68, progress).toFixed(4))
          element.style.setProperty('--food-cta', smoothstep(0.44, 0.62, progress).toFixed(4))
        }
      })

      parallaxItems.forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (rect.bottom < -120 || rect.top > viewportHeight + 120) return
        const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height))
        const amount = Number(element.dataset.parallax || 28)
        element.style.setProperty('--parallax-y', `${(progress - 0.5) * amount * 2}px`)
      })

      driftItems.forEach((element) => {
        const rect = element.getBoundingClientRect()
        if (rect.bottom < -160 || rect.top > viewportHeight + 160) return
        const progress = clamp((viewportHeight - rect.top) / (viewportHeight + rect.height))
        const amount = Number(element.dataset.scrollDrift || 40)
        element.style.setProperty('--drift-y', `${(progress - 0.5) * amount * 2}px`)
      })

      counters.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const progress = smoothstep(0, 1, clamp((viewportHeight * 0.82 - rect.top) / (viewportHeight * 0.34)))
        element.textContent = String(Math.round(Number(element.dataset.countTo || 0) * progress)).padStart(2, '0')
      })

      let tone = 'light'
      toneSections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 48 && rect.bottom >= 48) tone = section.dataset.navTone || 'light'
      })
      document.documentElement.dataset.navTone = tone

      if (navRoot) {
        navZones.forEach(([name, zone]) => {
          const zoneRect = zone.getBoundingClientRect()
          const covered = contrastMedia.some((media) => {
            const rect = media.getBoundingClientRect()
            return rect.top < zoneRect.bottom && rect.bottom > zoneRect.top
              && rect.left < zoneRect.right && rect.right > zoneRect.left
          })
          navRoot.dataset[`zone${name}`] = covered ? 'light' : tone
        })
      }

      frame = 0
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
      delete document.documentElement.dataset.navTone
    }
  }, [])
}

function MediaAsset({ kind = 'image', src, poster, alt, className = '', priority = false }: MediaAssetProps) {
  const [videoFailed, setVideoFailed] = useState(false)
  const [armed, setArmed] = useState(priority)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Only pull video bytes for the scene the visitor is about to reach — eight
  // simultaneous loops would otherwise all download on first paint.
  useEffect(() => {
    if (armed || kind !== 'video') return
    const node = videoRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        setArmed(true)
        observer.disconnect()
      }),
      { rootMargin: '500px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [armed, kind])

  if (kind === 'video' && !videoFailed) {
    return (
      <video
        ref={videoRef}
        className={`media-asset ${className}`}
        src={armed ? src : undefined}
        poster={poster}
        aria-label={alt}
        autoPlay
        muted
        loop
        playsInline
        preload={priority ? 'auto' : 'metadata'}
        onError={() => setVideoFailed(true)}
      />
    )
  }
  return <img className={`media-asset ${className}`} src={poster || src} alt={alt} fetchPriority={priority ? 'high' : undefined} decoding="async" />
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? 'eyebrow-light' : ''}`}><span className="eyebrow-dot" />{children}</p>
}

function Button({ children, href = '#', ghost = false, dark = false }: { children: React.ReactNode; href?: string; ghost?: boolean; dark?: boolean }) {
  return <a className={`pill ${ghost ? 'pill-ghost' : ''} ${dark ? 'pill-dark' : ''}`} href={href}>{children}<span aria-hidden="true">↗</span></a>
}

function TextLink({ children, href = '#', dark = false }: { children: React.ReactNode; href?: string; dark?: boolean }) {
  return <a className={`text-link ${dark ? 'text-link-dark' : ''}`} href={href}>{children}<span /></a>
}

const SOCIAL_ICONS = {
  instagram: (
    <>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.9 5.9 0 0 0 1.38 2.13 5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Z" />
      <path d="M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Z" />
      <circle cx="18.41" cy="5.59" r="1.44" />
    </>
  ),
  tiktok: <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1 0-5.18c.27 0 .53.04.77.12v-3.2a5.76 5.76 0 0 0-.77-.05A5.72 5.72 0 0 0 4.14 15.3 5.72 5.72 0 0 0 9.86 21a5.72 5.72 0 0 0 5.72-5.7V9.01a7.35 7.35 0 0 0 4.28 1.37V7.3a4.29 4.29 0 0 1-3.26-1.48Z" />,
  facebook: <path d="M24 12.07A12 12 0 1 0 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.54-4.69 1.32 0 2.7.24 2.7.24v2.96h-1.52c-1.5 0-1.96.93-1.96 1.88v2.27h3.34l-.53 3.49h-2.81V24A12 12 0 0 0 24 12.07Z" />,
}

const SOCIALS = [
  ['Instagram', 'instagram'],
  ['TikTok', 'tiktok'],
  ['Facebook', 'facebook'],
] as const

function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`nav-social ${className}`}>
      {SOCIALS.map(([label, icon]) => (
        <a href="#" key={label} aria-label={label} title={label}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{SOCIAL_ICONS[icon]}</svg>
        </a>
      ))}
    </div>
  )
}

const MENU_LINKS = [
  ['Accueil', '#top'],
  ['Menu', '#table'],
  ['Traiteur', '#traiteur'],
  ['Événements', '#soirees'],
  ['Location de salle', '#salle'],
  ['À propos', '#experience'],
  ['Contact', '#contact'],
]

function FullScreenMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`menu-overlay ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="menu-atmosphere" />
      <div className="menu-content">
        <p className="menu-meta"><span>Navigation</span><span>Bistro lounge · Montréal</span></p>
        <nav className="menu-links">
          {MENU_LINKS.map(([label, href], index) => (
            <a href={href} onClick={onClose} key={label} style={{ '--menu-index': index } as React.CSSProperties}>
              <span>{String(index + 1).padStart(2, '0')}</span>{label}
            </a>
          ))}
        </nav>
        <div className="menu-bottom">
          <p>La table, le bar, la nuit.</p>
          <SocialLinks className="menu-social" />
        </div>
      </div>
    </div>
  )
}

function FloatingNav({ menuOpen, onToggle }: { menuOpen: boolean; onToggle: () => void }) {
  return (
    <header className={`floating-nav ${menuOpen ? 'menu-is-open' : ''}`}>
      <a href="#top" className="floating-logo" aria-label="Bistro Kay Kouzen — accueil">
        <img src={logoSrc} alt="" />
        <span><small>Bistro</small>Kay Kouzen</span>
      </a>
      <nav className="nav-center" aria-label="Navigation principale">
        <a href="#table">Menu</a><a href="#traiteur">Traiteur</a><a href="#soirees">Événements</a>
      </nav>
      <div className="nav-actions">
        <SocialLinks />
        <a href="#contact" className="nav-reserve">Commander</a>
        <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} type="button" onClick={onToggle} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen}>
          <span /><span />
        </button>
      </div>
    </header>
  )
}

function ScrollProgress() {
  return <div className="scroll-progress" aria-hidden="true"><span>Scroll</span><i><b /></i></div>
}

function ScrollOrbit() {
  return (
    <a className="scroll-orbit" href="#experience" aria-label="Découvrir en faisant défiler">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs><path id="scrollCircle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" /></defs>
        <text><textPath href="#scrollCircle">DÉCOUVRIR · DÉFILER · </textPath></text>
      </svg>
      <span className="scroll-orbit-mark"><i /></span>
    </a>
  )
}

function Hero() {
  return (
    <section id="top" className="hero-scene" data-scroll-scene="hero" data-nav-tone="light">
      <div className="hero-stage">
        <div className="hero-bleed" aria-hidden="true" />
        <div className="hero-media-shell">
          <MediaAsset kind="video" src={MEDIA.heroVideo} poster={MEDIA.heroPoster} alt="Ambiance du Bistro Kay Kouzen" priority />
          <div className="hero-grade" />
          <div className="hero-ambient" />
          <span className="media-badge"><i /> Vidéo d'ambiance · Média temporaire</span>
        </div>
        <div className="hero-content">
          <p className="hero-kicker"><span />Montréal · Bistro · Lounge</p>
          <h1>
            <span className="hero-line hero-line-one"><span className="hero-line-inner"><em>Une table.</em></span></span>
            <span className="hero-line hero-line-two"><span className="hero-line-inner"><em>Une ambiance.</em></span></span>
            <span className="hero-line hero-line-three"><span className="hero-line-inner">Votre soirée.</span></span>
          </h1>
          <p className="hero-copy">Cuisine, cocktails et ambiance lounge dans un lieu pensé pour se retrouver.</p>
          <div className="hero-actions"><Button href="#table">Voir le menu</Button><Button ghost href="#contact">Commander</Button></div>
        </div>
        <div className="hero-handoff" aria-hidden="true">
          <span>01 · L'expérience</span>
          <p>La soirée ne se regarde pas.<br /><em>Elle se vit.</em></p>
        </div>
        <ScrollOrbit />
      </div>
    </section>
  )
}

function BrandStrip() {
  return (
    <div className="brand-strip" data-nav-tone="light">
      <div><span>Cuisine</span><i>✦</i><span>Cocktails</span><i>✦</i><span>Musique</span><i>✦</i><span>Événements</span><i>✦</i><span>Cuisine</span><i>✦</i><span>Cocktails</span></div>
    </div>
  )
}

const experiencePanels = [
  { number: '01', eyebrow: 'La table', title: <>Une cuisine <em>généreuse.</em></>, copy: "Des assiettes franches, colorées et faites pour être partagées. Le premier mouvement de la soirée commence ici." },
  { number: '02', eyebrow: 'Les gestes', title: <>Le bar en <em>mouvement.</em></>, copy: "Cocktails signature, lumière basse, service attentif : chaque détail accompagne le rythme de la salle." },
  { number: '03', eyebrow: 'Après le repas', title: <>La nuit <em>continue.</em></>, copy: "La musique monte doucement, les conversations s'allongent et le bistro devient lounge." },
]

function ExperienceSection() {
  return (
    <section id="experience" className="experience-scene" data-scroll-scene="experience" data-nav-tone="light">
      <div className="experience-stage">
        <div className="experience-heading" aria-hidden="true"><span>L'expérience</span></div>
        <div className="experience-brandmark" aria-hidden="true"><em>Kay Kouzen</em></div>
        <div className="experience-layout">
          <div className="experience-media">
            <MediaAsset kind="video" src={MEDIA.experienceVideo} poster={MEDIA.experiencePoster} alt="La salle et le service Kay Kouzen" />
            <div className="media-vignette" />
            <span className="media-badge"><i /> Vidéo · Service & ambiance</span>
          </div>
          <div className="experience-copy">
            <Eyebrow light>L'expérience Kay Kouzen</Eyebrow>
            <div className="experience-panels">
              {experiencePanels.map((panel, index) => (
                <article className={`experience-panel experience-panel-${index + 1}`} key={panel.number}>
                  <span className="panel-number">{panel.number}</span>
                  <p>{panel.eyebrow}</p>
                  <h2>{panel.title}</h2>
                  <div className="panel-rule" />
                  <p className="panel-copy">{panel.copy}</p>
                  {index === 2 && <TextLink href="#table">Découvrir le bistro</TextLink>}
                </article>
              ))}
            </div>
            <div className="experience-progress" aria-hidden="true"><span /><span /><span /></div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FoodSection() {
  return (
    <section id="table" className="food-section" data-scroll-section="food" data-nav-tone="dark">
      <div className="food-layout">
        <div className="food-heading">
          <Eyebrow>À la carte</Eyebrow>
          <h2>Cuisine<br /><em>& cocktails</em></h2>
          <p>Griot, bananes pesées, pikliz, poisson grillé : une cuisine créole généreuse, servie sans détour, et des cocktails préparés avec soin.</p>
          <TextLink dark>Découvrir le menu</TextLink>
        </div>
        <div className="food-composition">
          <figure className="food-main" data-scroll-drift="32" data-media-tone="light">
            <div className="media-frame"><MediaAsset src={MEDIA.food} alt="Crevettes épicées et bannann peze" /></div>
            <figcaption><span>Crevettes épicées, bannann peze</span><small>Menu du soir · 01</small></figcaption>
          </figure>
          <figure className="food-cocktail" data-scroll-drift="-58" data-media-tone="light">
            <div className="media-frame"><MediaAsset src={MEDIA.cocktail} alt="Cocktail signature Kay Kouzen" /></div>
            <figcaption><span>Cocktails signature</span><small>Carte du bar · 02</small></figcaption>
          </figure>
          <blockquote>« On commence par un plat,<br />on finit par une soirée. »</blockquote>
        </div>
      </div>
    </section>
  )
}

function CateringSection() {
  return (
    <section id="traiteur" className="catering-section" data-scroll-section="catering" data-nav-tone="light">
      <div className="catering-media">
        <MediaAsset kind="video" src={MEDIA.cateringVideo} poster={MEDIA.cateringPoster} alt="Préparation du service traiteur" />
        <div className="catering-grade" />
      </div>
      <div className="catering-panel" data-reveal>
        <Eyebrow light>Service traiteur</Eyebrow>
        <h2>Kay Kouzen<br /><em>vient à vous.</em></h2>
        <p>Pour vos événements privés, professionnels ou familiaux : une cuisine maison et des saveurs authentiques, là où vous célébrez.</p>
        <div className="catering-stat"><strong data-count-to="5">00</strong><span>Ans d'expérience<small>en service traiteur à Montréal</small></span></div>
        <Button>Découvrir le traiteur</Button>
      </div>
      <span className="catering-index">02 / TRAITEUR</span>
    </section>
  )
}

function PrivateRoomSection() {
  const useCases = ['Anniversaire', 'Réception', 'Événement privé', 'Corporatif']
  return (
    <section id="salle" className="room-section" data-scroll-section="room" data-nav-tone="light">
      <div className="room-media">
        <MediaAsset kind="video" src={MEDIA.roomVideo} poster={MEDIA.roomPoster} alt="Événement privé chez Kay Kouzen" />
        <div className="room-grade" />
      </div>
      <div className="room-copy">
        <Eyebrow light>Location de salle</Eyebrow>
        <h2><span><i>Votre événement.</i></span><span><i><em>Notre espace.</em></i></span></h2>
        <p>Privatisez l'espace Kay Kouzen pour une expérience sur mesure dans un cadre unique.</p>
        <div className="room-labels">{useCases.map((item, index) => <span key={item} style={{ '--label-index': index } as React.CSSProperties}>{String(index + 1).padStart(2, '0')} · {item}</span>)}</div>
        <div className="room-action"><Button>Demander une location</Button></div>
      </div>
      <span className="media-badge room-media-badge"><i /> Vidéo · Événement privé</span>
    </section>
  )
}

const events = [
  { number: '01', kind: 'video' as MediaKind, src: MEDIA.acousticVideo, poster: MEDIA.acousticPoster, title: 'Soirée acoustique', sub: 'Artiste invité', date: 'Vendredi · 20 h' },
  { number: '02', kind: 'image' as MediaKind, src: MEDIA.jazz, title: 'Soirée jazz', sub: 'Duo local', date: 'Samedi · 21 h' },
  { number: '03', kind: 'image' as MediaKind, src: MEDIA.caribbean, title: 'Nuit caribéenne', sub: 'DJ invité', date: 'Jeudi · 22 h' },
]

function EventsSection() {
  return (
    <section id="soirees" className="events-scene" data-scroll-scene="events" data-nav-tone="light">
      <div className="events-stage">
        <div className="events-intro">
          <Eyebrow light>Agenda</Eyebrow>
          <h2>Les soirées<br /><em>Kay Kouzen</em></h2>
          <p>La programmation change. L'énergie reste.</p>
          <TextLink>Voir les événements</TextLink>
          <div className="events-rail" aria-hidden="true"><span /><span /><span /></div>
        </div>
        <div className="event-stack">
          {events.map((event, index) => (
            <article className={`event-card event-card-${index + 1}`} key={event.number}>
              <MediaAsset kind={event.kind} src={event.src} poster={event.poster} alt={event.title} />
              <div className="event-grade" />
              <span className="event-number">EVENT {event.number}</span>
              {event.kind === 'video' && <span className="event-video-label"><i /> Vidéo live</span>}
              <div className="event-info"><p>{event.date}</p><h3>{event.title}</h3><span>{event.sub}</span></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const gallery = [
  { id: 'g1', kind: 'image' as MediaKind, src: MEDIA.foodPlantain, alt: 'Bananes pesées et poisson grillé', className: 'gallery-tall', drift: 14 },
  { id: 'g2', kind: 'video' as MediaKind, src: MEDIA.galleryVideo, poster: MEDIA.cocktail, alt: 'Cocktail en préparation', className: 'gallery-wide', drift: -11 },
  { id: 'g3', kind: 'image' as MediaKind, src: MEDIA.experiencePoster, alt: 'Ambiance lounge', className: 'gallery-square', drift: 21 },
  { id: 'g4', kind: 'image' as MediaKind, src: MEDIA.jazz, alt: 'Musique live', className: 'gallery-landscape', drift: -17 },
  { id: 'g5', kind: 'video' as MediaKind, src: MEDIA.acousticVideo, poster: MEDIA.acousticPoster, alt: 'Performance acoustique', className: 'gallery-video', drift: 12 },
  { id: 'g6', kind: 'image' as MediaKind, src: MEDIA.cateringPoster, alt: 'Moment de partage', className: 'gallery-small', drift: -15 },
]

function GallerySection() {
  return (
    <section id="galerie" className="gallery-section" data-scroll-section="gallery" data-nav-tone="light">
      <div className="gallery-heading" data-reveal>
        <div><Eyebrow light>Galerie sociale</Eyebrow><h2>Un soir<br /><em>chez nous.</em></h2></div>
        <p>Photos, gestes, musique et fragments de soirée.<br /><a href="#">@bistrokaykouzen ↗</a></p>
      </div>
      <div className="gallery-grid">
        {gallery.map((item, index) => (
          <figure className={`gallery-item ${item.className}`} data-scroll-drift={item.drift} key={item.id}>
            <MediaAsset kind={item.kind} src={item.src} poster={item.poster} alt={item.alt} />
            <figcaption><span>{String(index + 1).padStart(2, '0')}</span>{item.kind === 'video' ? 'Vidéo' : item.alt}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section id="contact" className="contact-section" data-nav-tone="light">
      <div data-reveal>
        <Eyebrow light>Nous trouver</Eyebrow>
        <h2>Votre table<br /><em>vous attend.</em></h2>
      </div>
      <div className="contact-details" data-reveal>
        <p><small>Adresse</small>[Adresse à confirmer]<br />Montréal, QC</p>
        <p><small>Heures</small>[À confirmer]</p>
        <p><small>Instagram</small>@bistrokaykouzen</p>
        <Button>Obtenir l'itinéraire</Button>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className="final-section" data-scroll-section="final" data-nav-tone="light">
      <div className="final-media">
        <MediaAsset kind="video" src={MEDIA.finalVideo} poster={MEDIA.finalPoster} alt="Atmosphère nocturne chez Kay Kouzen" />
        <div className="final-grade" />
      </div>
      <div className="final-copy">
        <span>La soirée commence ici</span>
        <h2><span><i>On se retrouve</i></span><span><i><em>chez Kay Kouzen.</em></i></span></h2>
        <div><Button>Commander</Button><Button ghost>Nous contacter</Button></div>
      </div>
      <span className="final-media-label"><i /> Boucle d'ambiance · Média temporaire</span>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <div className="footer-brand"><img src={logoSrc} alt="Bistro Kay Kouzen" /><p>Cuisine, cocktails<br />et ambiance lounge.</p></div>
      <nav>{MENU_LINKS.slice(0, 5).map(([label, href]) => <a href={href} key={label}>{label}</a>)}</nav>
      <div className="footer-note"><span>Montréal, QC</span><span>© Bistro Kay Kouzen</span><span>Site par J&R Technologies</span></div>
    </footer>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)

  useReveal()

  useEffect(() => {
    const previewScroll = new URLSearchParams(window.location.search).get('__previewScroll')
    if (!previewScroll) return
    const scrollTarget = Number(previewScroll)
    if (!Number.isFinite(scrollTarget)) return
    const jumpToPreview = () => {
      window.scrollTo(0, scrollTarget)
      window.dispatchEvent(new Event('scroll'))
    }
    jumpToPreview()
    const timer = window.setTimeout(jumpToPreview, 250)
    return () => window.clearTimeout(timer)
  }, [])

  useScrollChoreography()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (new URLSearchParams(window.location.search).has('__previewScroll')) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9, anchors: true, overscroll: true })
    lenisRef.current = lenis
    return () => { lenis.destroy(); lenisRef.current = null }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    if (menuOpen) lenisRef.current?.stop()
    else lenisRef.current?.start()
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="site-shell">
      <FloatingNav menuOpen={menuOpen} onToggle={() => setMenuOpen((current) => !current)} />
      <FullScreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <ScrollProgress />
      <Hero />
      <BrandStrip />
      <ExperienceSection />
      <FoodSection />
      <CateringSection />
      <PrivateRoomSection />
      <EventsSection />
      <GallerySection />
      <ContactSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
