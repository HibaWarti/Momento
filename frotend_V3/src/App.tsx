import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Camera,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Compass,
  Copy,
  ExternalLink,
  Flag,
  Globe,
  Heart,
  Home,
  Image as ImageIcon,
  LogOut,
  MapPin,
  Maximize2,
  MessageCircle,
  MoreHorizontal,
  Palette,
  Play,
  Plus,
  Reply,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Ticket,
  User,
  Users,
  Video,
  Zap,
  X,
} from 'lucide-react'
import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  clearStoredToken,
  createSupportTicket,
  getCurrentUser,
  getSupportTickets,
  loginUser,
  registerUser,
  type ApiUser,
  type SupportTicket,
} from './api'

type Role = 'USER' | 'PROVIDER'
type ProviderStatus = 'PENDING' | 'APPROVED'
type MediaType = 'image' | 'video'
type ThemeKey = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange'

type AppUser = {
  id: string
  displayName: string
  username: string
  role: Role
  providerStatus?: ProviderStatus
  avatar: string
  bio: string
}

type MediaItem = {
  type: MediaType
  url: string
}

type CommentItem = {
  id: string
  user: AppUser
  content: string
  liked: boolean
  likes: number
  replies: CommentItem[]
}

type PostItem = {
  id: string
  author: AppUser
  media: MediaItem[]
  caption: string
  hashtags: string[]
  location?: string
  liked: boolean
  likes: number
  saved: boolean
  comments: CommentItem[]
}

type ServiceItem = {
  id: string
  provider: AppUser
  title: string
  category: string
  subcategory: string
  keywords: string[]
  description: string
  rating: number
  saved: boolean
  image: string
}

type Conversation = {
  id: string
  user: AppUser
  unread: number
  messages: Array<{ id: string; fromMe: boolean; text: string; time: string }>
}

type AppContextValue = {
  currentUser: AppUser | null
  theme: ThemeKey
  setTheme: (theme: ThemeKey) => void
  login: (role?: Role) => void
  loginWithCredentials: (email: string, password: string) => Promise<void>
  registerAccount: (payload: {
    displayName: string
    username: string
    email: string
    password: string
    requestedRole: Role
  }) => Promise<void>
  logout: () => void
  openCreate: () => void
  openNotifications: () => void
  openSwitchAccount: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

const users: AppUser[] = [
  {
    id: 'u-hiba',
    displayName: 'Hiba Warti',
    username: 'hiba.warti',
    role: 'USER',
    avatar: 'HW',
    bio: 'Planning memories, saving ideas, and discovering event makers.',
  },
  {
    id: 'u-nora',
    displayName: 'Nora Studio',
    username: 'nora.events',
    role: 'PROVIDER',
    providerStatus: 'APPROVED',
    avatar: 'NS',
    bio: 'Wedding makeup, soft glam, and event-ready beauty in Casablanca.',
  },
  {
    id: 'u-yassine',
    displayName: 'Yassine Frames',
    username: 'yassine.frames',
    role: 'PROVIDER',
    providerStatus: 'APPROVED',
    avatar: 'YF',
    bio: 'Photography and short event films with a cinematic feel.',
  },
  {
    id: 'u-sara',
    displayName: 'Sara El Amrani',
    username: 'sara.memories',
    role: 'USER',
    avatar: 'SA',
    bio: 'Birthday boards, family gatherings, and tiny details.',
  },
]

const postsSeed: PostItem[] = [
  {
    id: 'p-1',
    author: users[1],
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    caption: 'A soft ivory wedding setup with warm candles and fresh flowers.',
    hashtags: ['wedding', 'decor', 'casablanca'],
    location: 'Casablanca',
    liked: true,
    likes: 342,
    saved: true,
    comments: [
      {
        id: 'c-1',
        user: users[3],
        content: 'The lighting is beautiful. This looks so calm and elegant.',
        liked: true,
        likes: 12,
        replies: [
          {
            id: 'c-1-r-1',
            user: users[1],
            content: 'Thank you. We wanted it to feel intimate.',
            liked: false,
            likes: 3,
            replies: [],
          },
        ],
      },
      {
        id: 'c-2',
        user: users[0],
        content: 'Saving this for the color palette alone.',
        liked: false,
        likes: 5,
        replies: [],
      },
    ],
  },
  {
    id: 'p-2',
    author: users[2],
    media: [
      {
        type: 'video',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      },
    ],
    caption: 'A tiny preview from last weekend. Video support is designed in from day one.',
    hashtags: ['eventfilm', 'highlights', 'rabat'],
    location: 'Rabat',
    liked: false,
    likes: 191,
    saved: false,
    comments: [
      {
        id: 'c-3',
        user: users[1],
        content: 'The movement is smooth. This would be great for service previews.',
        liked: false,
        likes: 7,
        replies: [],
      },
    ],
  },
  {
    id: 'p-3',
    author: users[3],
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    caption: 'Birthday table inspiration. I want something colorful but still clean.',
    hashtags: ['birthday', 'inspiration'],
    liked: false,
    likes: 88,
    saved: false,
    comments: [],
  },
]

const services: ServiceItem[] = [
  {
    id: 's-1',
    provider: users[1],
    title: 'Soft Glam Bridal Makeup',
    category: 'Beauty',
    subcategory: 'Makeup',
    keywords: ['bridal', 'soft glam', 'casablanca'],
    description: 'Full bridal makeup with skin prep, lashes, and touch-up kit.',
    rating: 4.9,
    saved: true,
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 's-2',
    provider: users[2],
    title: 'Event Photography and Reel',
    category: 'Media',
    subcategory: 'Photography',
    keywords: ['wedding', 'video', 'reel'],
    description: 'Photo coverage plus a short vertical reel for social sharing.',
    rating: 4.8,
    saved: false,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
  },
]

const conversationsSeed: Conversation[] = [
  {
    id: 'm-1',
    user: users[1],
    unread: 3,
    messages: [
      { id: 'm-1-1', fromMe: false, text: 'I can send two package options tonight.', time: '10:21' },
      { id: 'm-1-2', fromMe: false, text: 'Do you want a trial makeup session too?', time: '10:22' },
      { id: 'm-1-3', fromMe: true, text: 'Yes please, send both options.', time: '10:24' },
    ],
  },
  {
    id: 'm-2',
    user: users[2],
    unread: 0,
    messages: [
      { id: 'm-2-1', fromMe: true, text: 'Can you film a birthday party?', time: 'Yesterday' },
      { id: 'm-2-2', fromMe: false, text: 'Yes, I have a compact event package.', time: 'Yesterday' },
    ],
  },
]

const notifications = [
  {
    id: 'n-1',
    actor: users[1],
    title: 'New comment',
    detail: 'Nora Studio commented on your saved post.',
    path: '/home',
    action: 'Open post',
    type: 'comment',
    unread: true,
  },
  {
    id: 'n-2',
    actor: users[2],
    title: 'Message',
    detail: 'Yassine Frames sent you a new message.',
    path: '/messages',
    action: 'Reply',
    type: 'message',
    unread: true,
  },
  {
    id: 'n-3',
    actor: users[0],
    title: 'Ticket update',
    detail: 'Your support ticket was marked in progress.',
    path: '/tickets',
    action: 'View ticket',
    type: 'ticket',
    unread: false,
  },
  {
    id: 'n-4',
    actor: users[3],
    title: 'Comment like',
    detail: 'Sara liked your comment on a birthday post.',
    path: '/activity',
    action: 'See activity',
    type: 'like',
    unread: false,
  },
]

const themes: Array<{ key: ThemeKey; name: string }> = [
  { key: 'light', name: 'Light' },
  { key: 'dark', name: 'Dark' },
  { key: 'blue', name: 'Blue' },
  { key: 'green', name: 'Green' },
  { key: 'purple', name: 'Purple' },
  { key: 'orange', name: 'Orange' },
]

const landingCategories = [
  { name: 'Photography', icon: Camera, count: 24 },
  { name: 'Event Planning', icon: Sparkles, count: 18 },
  { name: 'Catering', icon: Globe, count: 15 },
  { name: 'Videography', icon: Play, count: 12 },
  { name: 'Entertainment', icon: Zap, count: 9 },
  { name: 'Decoration', icon: Award, count: 21 },
]

const landingStats = [
  { label: 'Active users', value: '10K+', icon: Users },
  { label: 'Services listed', value: '2,500+', icon: BriefcaseBusiness },
  { label: 'Moments shared', value: '50K+', icon: Heart },
  { label: 'Cities covered', value: '30+', icon: MapPin },
]

const landingSteps = [
  {
    step: '01',
    title: 'Create your account',
    description: 'Set up a personal or provider profile and start shaping your event plans.',
    icon: CheckCircle,
  },
  {
    step: '02',
    title: 'Discover and save',
    description: 'Search services, follow creators, and keep your favorite moments close.',
    icon: Search,
  },
  {
    step: '03',
    title: 'Message providers',
    description: 'Talk through dates, details, and packages without leaving Momento.',
    icon: MessageCircle,
  },
  {
    step: '04',
    title: 'Share the result',
    description: 'Post your memories and help the next person find trusted talent.',
    icon: Star,
  },
]

const landingTestimonials = [
  {
    name: 'Fatima Z.',
    role: 'Bride',
    avatar: 'FZ',
    text: 'Momento helped me find a photographer whose style actually matched the wedding I imagined.',
  },
  {
    name: 'Omar H.',
    role: 'Event organizer',
    avatar: 'OH',
    text: 'The service discovery feels calm and direct. I can compare providers without losing the moodboard.',
  },
  {
    name: 'Nadia K.',
    role: 'Provider',
    avatar: 'NK',
    text: 'It gives my work a place to live beyond a single post, and clients can message me right away.',
  },
  {
    name: 'Salma B.',
    role: 'Birthday host',
    avatar: 'SB',
    text: 'I started with one saved decor post and ended up finding the makeup artist and photographer in the same afternoon.',
  },
  {
    name: 'Youssef A.',
    role: 'Photographer',
    avatar: 'YA',
    text: 'The best part is that clients arrive with references already saved, so the conversation starts with taste, not confusion.',
  },
  {
    name: 'Meriem L.',
    role: 'Planner',
    avatar: 'ML',
    text: 'It feels polished without being noisy. I can move from inspiration to actual providers without opening five different apps.',
  },
]

const footerSections = [
  {
    title: 'Platform',
    links: [
      { label: 'Feed', to: '/home' },
      { label: 'Services', to: '/explore' },
      { label: 'Messages', to: '/messages' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
      { label: 'Support', to: '/support' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ],
  },
]

function mapApiUser(user: ApiUser, requestedRole?: Role): AppUser {
  const isApprovedProvider = user.role === 'PROVIDER'

  return {
    id: user.id,
    displayName: `${user.firstName} ${user.lastName}`.trim(),
    username: user.username,
    role: isApprovedProvider ? 'PROVIDER' : 'USER',
    providerStatus: isApprovedProvider ? 'APPROVED' : requestedRole === 'PROVIDER' ? 'PENDING' : undefined,
    avatar: `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() || 'M',
    bio: user.bio || 'Building moments on Momento.',
  }
}

function splitDisplayName(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  const firstName = parts[0] || 'Momento'
  const lastName = parts.slice(1).join(' ') || 'User'

  return { firstName, lastName }
}

function useApp() {
  const value = useContext(AppContext)
  if (!value) {
    throw new Error('useApp must be used inside AppContext')
  }
  return value
}

function ProviderBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`pro-badge ${compact ? 'pro-badge-compact' : ''}`} title="Approved provider">
      <ShieldCheck size={compact ? 13 : 15} />
      Pro
    </span>
  )
}

function Avatar({ user, size = 'md' }: { user: AppUser; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`avatar avatar-${size}`}>{user.avatar}</span>
}

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const navigate = useNavigate()
  const featuredServices = services.concat([
    {
      id: 's-3',
      provider: users[1],
      title: 'Warm Minimal Event Decor',
      category: 'Events',
      subcategory: 'Decoration',
      keywords: ['minimal', 'florals', 'candles'],
      description: 'A refined setup for intimate dinners, engagements, and birthdays.',
      rating: 4.9,
      saved: false,
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
    },
  ])

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (searchQuery.trim()) {
      navigate('/explore')
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % landingTestimonials.length)
    }, 4800)

    return () => window.clearInterval(timer)
  }, [])

  const currentTestimonial = landingTestimonials[activeTestimonial]

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link to="/" className="brand-lockup">
          <span className="logo-mark">M</span>
          <span>Momento</span>
        </Link>
        <div className="landing-actions">
          <Link to="/login" className="text-link">
            Log in
          </Link>
          <Link to="/register" className="primary-button">
            Sign up
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-copy landing-copy-centered">
          <h1>
            Share your <span>Moments</span>, discover amazing <span>Services</span>
          </h1>
          <p>
            Connect with top-rated photographers, planners, decorators, and creatives.
            Save inspiration, message providers, and turn real memories into your next event.
          </p>
          <form className="landing-search" onSubmit={submitSearch}>
            <Search size={20} />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search services... wedding photography, catering, decor"
            />
            <button type="submit">Search</button>
          </form>
          <div className="popular-tags">
            <span>Popular:</span>
            {['Photography', 'Wedding', 'Catering', 'DJ', 'Decoration'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchQuery(tag)
                  navigate('/explore')
                }}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Create free account <ArrowRight size={17} />
            </Link>
            <Link to="/login" className="secondary-button">
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      <section className="stats-band">
        {landingStats.map((stat) => (
          <article key={stat.label}>
            <span>
              <stat.icon size={20} />
            </span>
            <strong>{stat.value}</strong>
            <small>{stat.label}</small>
          </article>
        ))}
      </section>

      <LandingSection
        eyebrow="Browse by category"
        title="Find exactly what the moment needs"
        action={<Link to="/explore">All categories <ChevronRight size={16} /></Link>}
      >
        <div className="landing-category-grid">
          {landingCategories.map((category) => (
            <button key={category.name} type="button" onClick={() => navigate('/explore')}>
              <span>
                <category.icon size={28} />
              </span>
              <strong>{category.name}</strong>
              <small>{category.count} services</small>
            </button>
          ))}
        </div>
      </LandingSection>

      <LandingSection
        className="soft-section"
        eyebrow="Trending now"
        title="Featured services"
        action={<Link to="/explore">View all <ArrowRight size={16} /></Link>}
      >
        <div className="landing-service-grid">
          {featuredServices.map((service) => (
            <article key={service.id} className="landing-service-card">
              <img src={service.image} alt={service.title} />
              <div>
                <span>{service.category} / {service.subcategory}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <small>{service.rating} rating</small>
              </div>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="How it works" title="Get started in four simple steps">
        <div className="steps-grid">
          {landingSteps.map((step) => (
            <article key={step.step}>
              <span className="step-icon">
                <step.icon size={28} />
                <i>{step.step}</i>
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection
        className="soft-section"
        eyebrow="Recent moments"
        title="See what the community is sharing"
        action={<Link to="/home">View feed <ArrowRight size={16} /></Link>}
      >
        <div className="moment-grid">
          {postsSeed.map((post) => (
            <article key={post.id} className="moment-card">
              <img src={post.media[0]?.url} alt={post.caption} />
              <div>
                <Avatar user={post.author} size="sm" />
                <span>{post.author.displayName}</span>
              </div>
              <p>{post.caption}</p>
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection eyebrow="Top providers" title="Trusted professionals ready to help">
        <div className="provider-grid">
          {users.map((user) => (
            <article key={user.id}>
              <Avatar user={user} size="lg" />
              <strong>{user.displayName}</strong>
              <span>@{user.username}</span>
              {user.providerStatus === 'APPROVED' ? <ProviderBadge compact /> : null}
            </article>
          ))}
        </div>
      </LandingSection>

      <LandingSection className="soft-section" title="What our community says">
        <div className="testimonial-gallery" aria-live="polite">
          <button
            type="button"
            className="testimonial-peek previous"
            onClick={() =>
              setActiveTestimonial((activeTestimonial - 1 + landingTestimonials.length) % landingTestimonials.length)
            }
          >
            <span>{landingTestimonials[(activeTestimonial - 1 + landingTestimonials.length) % landingTestimonials.length].avatar}</span>
            <strong>{landingTestimonials[(activeTestimonial - 1 + landingTestimonials.length) % landingTestimonials.length].name}</strong>
          </button>
          <article className="testimonial-feature" key={currentTestimonial.name}>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={18} />
              ))}
            </div>
            <p>"{currentTestimonial.text}"</p>
            <div className="testimonial-author">
              <span className="avatar avatar-md">{currentTestimonial.avatar}</span>
              <span>
                <strong>{currentTestimonial.name}</strong>
                <small>{currentTestimonial.role}</small>
              </span>
            </div>
          </article>
          <button
            type="button"
            className="testimonial-peek next"
            onClick={() => setActiveTestimonial((activeTestimonial + 1) % landingTestimonials.length)}
          >
            <span>{landingTestimonials[(activeTestimonial + 1) % landingTestimonials.length].avatar}</span>
            <strong>{landingTestimonials[(activeTestimonial + 1) % landingTestimonials.length].name}</strong>
          </button>
          <div className="testimonial-dots">
            {landingTestimonials.map((testimonial, index) => (
              <button
                key={testimonial.name}
                type="button"
                className={index === activeTestimonial ? 'active' : ''}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`Show testimonial from ${testimonial.name}`}
              />
            ))}
          </div>
        </div>
      </LandingSection>

      <section className="provider-cta">
        <div>
          <h2>Are you a service provider?</h2>
          <p>
            Join Momento to showcase your work, meet new clients, and turn your creative services
            into a profile people can trust.
          </p>
        </div>
        <Link to="/register" className="secondary-button">
          Start offering services <ArrowRight size={17} />
        </Link>
      </section>

      <section className="final-cta">
        <h2>
          Ready to join <span>Momento</span>?
        </h2>
        <p>Create your account and start sharing moments, discovering services, and planning beautifully.</p>
        <div>
          <Link to="/register" className="primary-button">
            Create free account <ArrowRight size={17} />
          </Link>
          <Link to="/login" className="secondary-button">
            Log in
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}

function LandingSection({
  eyebrow,
  title,
  action,
  className = '',
  children,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`landing-section ${className}`}>
      <div className="section-title-row">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
        {action ? <div className="section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand-lockup">
            <span className="logo-mark">M</span>
            <span>Momento</span>
          </Link>
          <p>
            The social platform for memories, event inspiration, and trusted creative services.
          </p>
        </div>
        {footerSections.map((section) => (
          <div key={section.title} className="footer-column">
            <h3>{section.title}</h3>
            {section.links.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Momento. All rights reserved.</span>
        <span>Built for thoughtful celebrations and trusted local talent.</span>
      </div>
    </footer>
  )
}

function LoginPage() {
  const { loginWithCredentials } = useApp()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      setIsSubmitting(true)
      setError(null)
      await loginWithCredentials(String(formData.get('email') || ''), String(formData.get('password') || ''))
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFrame
      title="Sign in"
      subtitle="Welcome back. Let's revisit some memories."
      image="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80"
      imageTitle="Welcome back to your moments."
      imageText="Pick up the memories you started sharing and continue planning from the same place."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" placeholder="hiba@example.com" />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Password" />
        </label>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </AuthFrame>
  )
}

function RegisterPage() {
  const { registerAccount } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    try {
      setIsSubmitting(true)
      setError(null)
      await registerAccount({
        displayName: String(formData.get('displayName') || ''),
        username: String(formData.get('username') || ''),
        email: String(formData.get('email') || ''),
        password: String(formData.get('password') || ''),
        requestedRole: role ?? 'USER',
      })
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFrame
      title="Create your account"
      subtitle="Start sharing, saving, and planning your next celebration in a few steps."
      image="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"
      imageTitle="Some moments deserve a home."
      imageText="Join a community that celebrates memory, craft, and trusted creative services."
      reverse
    >
      <div className="role-grid">
        <button
          type="button"
          className={`role-card ${role === 'USER' ? 'selected' : ''}`}
          onClick={() => setRole('USER')}
        >
          <User size={24} />
          <strong>Normal user</strong>
          <span>Post, save, message, follow, and discover event ideas.</span>
        </button>
        <button
          type="button"
          className={`role-card ${role === 'PROVIDER' ? 'selected' : ''}`}
          onClick={() => setRole('PROVIDER')}
        >
          <BriefcaseBusiness size={24} />
          <strong>Provider</strong>
          <span>Create a provider profile now. Services stay pending until approved.</span>
        </button>
      </div>

      {role ? (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Display name
              <input name="displayName" placeholder={role === 'PROVIDER' ? 'Nora Studio' : 'Hiba Warti'} />
            </label>
            <label>
              Username
              <input name="username" placeholder={role === 'PROVIDER' ? 'nora.events' : 'hiba.warti'} />
            </label>
          </div>
          {role === 'PROVIDER' ? (
            <>
              <label>
                Professional category
                <select>
                  <option>Photography</option>
                  <option>Makeup</option>
                  <option>Decoration</option>
                  <option>Catering</option>
                </select>
              </label>
              <label>
                Provider bio
                <textarea placeholder="Describe your event services, city, and style." />
              </label>
            </>
          ) : (
            <label>
              Bio
              <textarea placeholder="Tell people what kind of memories you like." />
            </label>
          )}
          <div className="form-grid">
            <label>
              Email
              <input name="email" type="email" placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input name="password" type="password" placeholder="At least 8 characters" />
            </label>
          </div>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>
          {error ? <p className="form-error">{error}</p> : null}
        </form>
      ) : null}
    </AuthFrame>
  )
}

function AuthFrame({
  title,
  subtitle,
  image,
  imageTitle,
  imageText,
  reverse = false,
  children,
}: {
  title: string
  subtitle: string
  image: string
  imageTitle: string
  imageText: string
  reverse?: boolean
  children: ReactNode
}) {
  return (
    <main className={`auth-page ${reverse ? 'auth-page-reverse' : ''}`}>
      <section className="auth-visual" aria-label={imageTitle}>
        <img src={image} alt="" />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-copy">
          <h2>{imageTitle}</h2>
          <p>{imageText}</p>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-card">
          <Link to="/" className="brand-lockup">
            <span className="logo-mark">M</span>
            <span>Momento</span>
          </Link>
          <div className="auth-heading">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}

function FooterInfoPage({
  eyebrow,
  title,
  intro,
  items,
}: {
  eyebrow: string
  title: string
  intro: string
  items: Array<{ title: string; body: string }>
}) {
  return (
    <main className="info-page">
      <nav className="landing-nav">
        <Link to="/" className="brand-lockup">
          <span className="logo-mark">M</span>
          <span>Momento</span>
        </Link>
        <div className="landing-actions">
          <Link to="/login" className="text-link">
            Log in
          </Link>
          <Link to="/register" className="primary-button">
            Sign up
          </Link>
        </div>
      </nav>
      <section className="info-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>
      <section className="info-list">
        {items.map((item) => (
          <article key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </article>
        ))}
      </section>
      <LandingFooter />
    </main>
  )
}

function ContactPage() {
  return (
    <main className="info-page">
      <nav className="landing-nav">
        <Link to="/" className="brand-lockup">
          <span className="logo-mark">M</span>
          <span>Momento</span>
        </Link>
        <div className="landing-actions">
          <Link to="/login" className="text-link">
            Log in
          </Link>
          <Link to="/register" className="primary-button">
            Sign up
          </Link>
        </div>
      </nav>
      <section className="contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">Contact us</p>
          <h1>Tell us what you need help with</h1>
          <p>
            Send a note about support, provider onboarding, partnerships, or anything that would
            make Momento easier to use.
          </p>
          <div className="contact-methods">
            <article>
              <MessageCircle size={20} />
              <div>
                <strong>Support</strong>
                <span>For account, listing, or technical questions.</span>
              </div>
            </article>
            <article>
              <BriefcaseBusiness size={20} />
              <div>
                <strong>Providers</strong>
                <span>For service profiles, approvals, and business setup.</span>
              </div>
            </article>
          </div>
        </div>
        <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <label>
              Name
              <input placeholder="Your name" />
            </label>
            <label>
              Email
              <input type="email" placeholder="you@example.com" />
            </label>
          </div>
          <label>
            Topic
            <select defaultValue="support">
              <option value="support">Support</option>
              <option value="provider">Provider help</option>
              <option value="partnership">Partnership</option>
              <option value="feedback">Feedback</option>
            </select>
          </label>
          <label>
            Message
            <textarea placeholder="How can we help?" />
          </label>
          <button className="primary-button" type="submit">
            Send message
          </button>
        </form>
      </section>
      <LandingFooter />
    </main>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useApp()
  return currentUser ? children : <Navigate to="/" replace />
}

function AppShell({ children }: { children: ReactNode }) {
  const {
    currentUser,
    openCreate,
    openNotifications,
    openSwitchAccount,
    logout,
  } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  if (!currentUser) return null

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/home" className="sidebar-logo">
          <span className="logo-mark">M</span>
          <span className="sidebar-title">Momento</span>
        </Link>
        <nav className="sidebar-nav">
          <SidebarLink to="/home" icon={<Home />} label="Home" />
          <SidebarLink to="/messages" icon={<MessageCircle />} label="Messages" />
          <SidebarLink to="/search" icon={<Search />} label="Search" />
          <SidebarLink to="/explore" icon={<Compass />} label="Explore" />
          <button className="sidebar-item" type="button" onClick={openNotifications}>
            <Bell />
            <span>Notifications</span>
          </button>
          <button className="sidebar-item" type="button" onClick={openCreate}>
            <Plus />
            <span>Create</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="profile-menu-button" type="button" onClick={() => setMenuOpen((v) => !v)}>
            <Avatar user={currentUser} size="sm" />
            <span>{currentUser.username}</span>
            <ChevronDown className="profile-chevron" size={14} />
          </button>
          {menuOpen ? (
            <div className="profile-menu">
              <button type="button" onClick={() => navigate('/profile/me')}>
                <User size={17} /> Profile
              </button>
              <button type="button" onClick={() => navigate('/settings')}>
                <Settings size={17} /> Settings
              </button>
              <button type="button" onClick={() => navigate('/activity')}>
                <BarChart3 size={17} /> Your activity
              </button>
              <button type="button" onClick={() => navigate('/saved')}>
                <Bookmark size={17} /> Saved
              </button>
              <button type="button" onClick={() => navigate('/settings')}>
                <Palette size={17} /> Themes
              </button>
              <button type="button" onClick={() => navigate('/tickets')}>
                <Ticket size={17} /> Report a problem
              </button>
              <button type="button" onClick={openSwitchAccount}>
                <Users size={17} /> Switch account
              </button>
              <button type="button" onClick={logout}>
                <LogOut size={17} /> Log out
              </button>
            </div>
          ) : null}
        </div>
      </aside>
      <main className="app-main">{children}</main>
      <FloatingMessenger />
    </div>
  )
}

function SidebarLink({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <NavLink className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} to={to} aria-label={label}>
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

function HomePage() {
  const { openCreate } = useApp()
  const [posts, setPosts] = useState(postsSeed)
  const [activePost, setActivePost] = useState<PostItem | null>(null)

  function togglePostLike(postId: string) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  function togglePostSave(postId: string) {
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, saved: !post.saved } : post)),
    )
  }

  return (
    <AppShell>
      <section className="content-grid">
        <div className="feed-column">
          <div className="composer-card">
            <div className="composer-top">
              <Avatar user={users[0]} />
              <button type="button" onClick={openCreate}>
                Create a memory, add images, video, location, or event details
              </button>
            </div>
            <div className="composer-actions">
              <button type="button" onClick={openCreate}>
                <ImageIcon size={18} /> Images
              </button>
              <button type="button" onClick={openCreate}>
                <Video size={18} /> Video
              </button>
              <button type="button" onClick={openCreate}>
                <Sparkles size={18} /> Event info
              </button>
            </div>
          </div>

          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={togglePostLike}
              onSave={togglePostSave}
              onComments={() => setActivePost(post)}
            />
          ))}
        </div>

        <aside className="right-rail">
          <SectionHeader title="Suggested providers" />
          {users
            .filter((user) => user.role === 'PROVIDER')
            .map((user) => (
              <MiniProfile key={user.id} user={user} action="Follow" />
            ))}
          <SectionHeader title="Service ideas" />
          {services.map((service) => (
            <ServiceMini key={service.id} service={service} />
          ))}
        </aside>
      </section>
      {activePost ? <PostModal post={activePost} onClose={() => setActivePost(null)} /> : null}
    </AppShell>
  )
}

function PostCard({
  post,
  onLike,
  onSave,
  onComments,
}: {
  post: PostItem
  onLike: (postId: string) => void
  onSave: (postId: string) => void
  onComments: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const firstMedia = post.media[0]

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="profile-inline">
          <Avatar user={post.author} />
          <div>
            <div className="name-line">
              <strong>{post.author.displayName}</strong>
              {post.author.providerStatus === 'APPROVED' ? <ProviderBadge compact /> : null}
            </div>
            <span>
              @{post.author.username}
              {post.location ? ` · ${post.location}` : ''}
            </span>
          </div>
        </div>
        <div className="post-menu-wrap">
          {post.author.id !== users[0].id ? <button className="follow-text">Follow</button> : null}
          <button className="icon-button" type="button" onClick={() => setMenuOpen((v) => !v)}>
            <MoreHorizontal />
          </button>
          {menuOpen ? (
            <div className="popover-menu">
              <button type="button">
                <Flag size={16} /> Report
              </button>
              <button type="button" onClick={() => onSave(post.id)}>
                <Bookmark size={16} /> {post.saved ? 'Unsave' : 'Save'}
              </button>
              <button type="button">
                <ExternalLink size={16} /> Go to post
              </button>
              <button type="button">
                <Copy size={16} /> Copy link
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <button className="post-media" type="button" onClick={onComments}>
        {firstMedia?.type === 'video' ? (
          <video src={firstMedia.url} muted loop playsInline />
        ) : (
          <img src={firstMedia?.url} alt={post.caption} />
        )}
      </button>

      <footer className="post-footer">
        <div className="post-actions">
          <button className={post.liked ? 'liked' : ''} type="button" onClick={() => onLike(post.id)}>
            <Heart className={post.liked ? 'fill-icon' : ''} />
          </button>
          <button type="button" onClick={onComments}>
            <MessageCircle />
          </button>
          <button type="button">
            <Send />
          </button>
          <button type="button" className="save-action" onClick={() => onSave(post.id)}>
            <Bookmark className={post.saved ? 'fill-icon' : ''} />
          </button>
        </div>
        <strong>{post.likes.toLocaleString()} likes</strong>
        <p>
          <span>{post.author.displayName}</span> {post.caption}
        </p>
        <div className="hashtag-row">{post.hashtags.map((tag) => `#${tag}`).join(' ')}</div>
        <button className="muted-action" type="button" onClick={onComments}>
          View all {post.comments.length} comments
        </button>
      </footer>
    </article>
  )
}

function PostModal({ post, onClose }: { post: PostItem; onClose: () => void }) {
  const [comments, setComments] = useState(post.comments)
  const [draft, setDraft] = useState('')
  const firstMedia = post.media[0]

  function addComment() {
    if (!draft.trim()) return
    setComments((current) => [
      {
        id: `local-${Date.now()}`,
        user: users[0],
        content: draft.trim(),
        liked: false,
        likes: 0,
        replies: [],
      },
      ...current,
    ])
    setDraft('')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="post-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose}>
          <X />
        </button>
        <div className="modal-media">
          {firstMedia?.type === 'video' ? (
            <video src={firstMedia.url} controls />
          ) : (
            <img src={firstMedia?.url} alt={post.caption} />
          )}
        </div>
        <div className="modal-discussion">
          <header className="modal-header">
            <div className="profile-inline">
              <Avatar user={post.author} />
              <div>
                <div className="name-line">
                  <strong>{post.author.displayName}</strong>
                  {post.author.providerStatus === 'APPROVED' ? <ProviderBadge compact /> : null}
                </div>
                <span>@{post.author.username}</span>
              </div>
            </div>
            <button className="icon-button" type="button">
              <MoreHorizontal />
            </button>
          </header>
          <div className="caption-block">
            <strong>{post.author.displayName}</strong>
            <span>{post.caption}</span>
            <div className="hashtag-row">{post.hashtags.map((tag) => `#${tag}`).join(' ')}</div>
          </div>
          <div className="comments-list">
            {comments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} />
            ))}
          </div>
          <div className="comment-composer">
            <Smile size={20} />
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a comment..."
            />
            <button type="button" disabled={!draft.trim()} onClick={addComment}>
              Post
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function CommentRow({ comment }: { comment: CommentItem }) {
  const [liked, setLiked] = useState(comment.liked)
  const [likes, setLikes] = useState(comment.likes)

  function toggleLike() {
    setLiked((value) => !value)
    setLikes((value) => (liked ? value - 1 : value + 1))
  }

  return (
    <div className="comment-row">
      <Avatar user={comment.user} size="sm" />
      <div>
        <p>
          <strong>{comment.user.username}</strong> {comment.content}
        </p>
        <div className="comment-meta">
          <span>{likes} likes</span>
          <button type="button">
            <Reply size={13} /> Reply
          </button>
        </div>
        {comment.replies.map((reply) => (
          <div key={reply.id} className="reply-row">
            <strong>{reply.user.username}</strong> {reply.content}
          </div>
        ))}
      </div>
      <div className="comment-actions">
        <button type="button" onClick={toggleLike} className={liked ? 'liked' : ''}>
          <Heart size={16} className={liked ? 'fill-icon' : ''} />
        </button>
        <button type="button" className="comment-more">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  )
}

function MessagesPage() {
  return (
    <AppShell>
      <MessagesWorkspace />
    </AppShell>
  )
}

function MessagesWorkspace({ compact = false }: { compact?: boolean }) {
  const [conversations] = useState(conversationsSeed)
  const [activeId, setActiveId] = useState<string | null>(compact ? conversations[0]?.id ?? null : null)
  const [draft, setDraft] = useState('')
  const active = conversations.find((conversation) => conversation.id === activeId)

  return (
    <section className={`messages-workspace ${compact ? 'compact-messages' : ''}`}>
      <aside className="conversation-list">
        <h1>Messages</h1>
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className={conversation.id === activeId ? 'active' : ''}
            onClick={() => setActiveId(conversation.id)}
          >
            <Avatar user={conversation.user} />
            <span>
              <strong>{conversation.user.displayName}</strong>
              <small className={conversation.unread ? 'unread-copy' : ''}>
                {conversation.unread
                  ? conversation.unread > 9
                    ? '+9 new msgs'
                    : `${conversation.unread} new msg${conversation.unread > 1 ? 's' : ''}`
                  : conversation.messages.at(-1)?.text}
              </small>
            </span>
            {conversation.unread ? <i /> : null}
          </button>
        ))}
      </aside>
      <div className="chat-panel">
        {active ? (
          <>
            <header>
              <div className="profile-inline">
                <Avatar user={active.user} />
                <div>
                  <strong>{active.user.displayName}</strong>
                  <span>@{active.user.username}</span>
                </div>
              </div>
            </header>
            <div className="message-stream">
              {active.messages.map((message) => (
                <p key={message.id} className={message.fromMe ? 'mine' : ''}>
                  {message.text}
                  <span>{message.time}</span>
                </p>
              ))}
            </div>
            <form className="message-compose" onSubmit={(event) => event.preventDefault()}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message..."
              />
              <button type="button" disabled={!draft.trim()} onClick={() => setDraft('')}>
                <Send size={17} />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <MessageCircle size={42} />
            <h2>Your conversations</h2>
            <p>Choose a chat on the left or start a message from a profile or service.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function SearchPage() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<'all' | 'users' | 'services' | 'posts'>('all')
  const [providersOnly, setProvidersOnly] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const normalized = query.toLowerCase().trim()

  const resultUsers = users
    .filter((user) => !providersOnly || user.role === 'PROVIDER')
    .filter((user) => `${user.displayName} ${user.username}`.toLowerCase().includes(normalized))
  const resultServices = services.filter((service) =>
    `${service.title} ${service.category} ${service.subcategory} ${service.keywords.join(' ')}`
      .toLowerCase()
      .includes(normalized),
  )
  const resultPosts = postsSeed.filter((post) =>
    `${post.caption} ${post.hashtags.join(' ')}`.toLowerCase().includes(normalized),
  )

  const groups = [
    { key: 'users', title: 'Users', items: resultUsers, show: mode === 'all' || mode === 'users' },
    {
      key: 'services',
      title: 'Services',
      items: resultServices,
      show: mode === 'all' || mode === 'services',
    },
    { key: 'posts', title: 'Posts', items: resultPosts, show: mode === 'all' || mode === 'posts' },
  ].filter((group) => group.show && (normalized ? group.items.length > 0 : true))

  return (
    <AppShell>
      <section className="search-page">
        <h1>Search Momento</h1>
        <div className="large-search">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users, providers, services, posts..."
            autoFocus
          />
        </div>
        <div className="segmented-tabs">
          {(['all', 'users', 'services', 'posts'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={mode === tab ? 'active' : ''}
              onClick={() => setMode(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {mode === 'users' || mode === 'all' ? (
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={providersOnly}
              onChange={(event) => setProvidersOnly(event.target.checked)}
            />
            Providers only
          </label>
        ) : null}
        {normalized && groups.length === 0 ? (
          <div className="empty-state">
            <Search size={34} />
            <h2>No results found</h2>
            <p>Try another keyword, provider name, service category, or hashtag.</p>
          </div>
        ) : (
          <div className="search-groups">
            {groups.map((group) => (
              <section key={group.key} className="result-group">
                <button
                  type="button"
                  onClick={() => setCollapsed((current) => ({ ...current, [group.key]: !current[group.key] }))}
                >
                  <strong>{group.title}</strong>
                  <span>{group.items.length} results</span>
                </button>
                {!collapsed[group.key] ? (
                  <div className="result-list">
                    {group.items.slice(0, 5).map((item) => (
                      <SearchResult key={'id' in item ? item.id : String(item)} item={item} />
                    ))}
                    {group.items.length > 5 ? <button className="see-more">See more</button> : null}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

function SearchResult({ item }: { item: AppUser | ServiceItem | PostItem }) {
  if ('displayName' in item) {
    return <MiniProfile user={item} action={item.role === 'PROVIDER' ? 'View provider' : 'View'} />
  }
  if ('title' in item) {
    return <ServiceMini service={item} />
  }
  return (
    <div className="search-post-result">
      <img src={item.media[0]?.url} alt="" />
      <div>
        <strong>{item.author.displayName}</strong>
        <span>{item.caption}</span>
      </div>
    </div>
  )
}

function ExplorePage() {
  return (
    <AppShell>
      <section className="explore-page">
        <div className="page-heading">
          <p className="eyebrow">Discover</p>
          <h1>Explore ideas, providers, and services together.</h1>
          <p>
            Explore should be mixed for Momento: posts give inspiration, providers give trust,
            and services help users act on what they saved.
          </p>
        </div>
        <div className="explore-grid">
          {postsSeed.map((post) => (
            <article key={post.id} className="explore-tile">
              <img src={post.media[0]?.url} alt={post.caption} />
              <span>{post.caption}</span>
            </article>
          ))}
          {services.map((service) => (
            <article key={service.id} className="explore-tile service-tile">
              <img src={service.image} alt={service.title} />
              <span>{service.title}</span>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  )
}

function ProfilePage() {
  const { currentUser } = useApp()
  const [photoMenu, setPhotoMenu] = useState(false)
  const [tab, setTab] = useState<'posts' | 'services'>('posts')
  const profile = currentUser ?? users[0]
  const isProvider = profile.role === 'PROVIDER'
  const ownPosts = postsSeed.filter((post) => post.author.id === profile.id)
  const ownServices = services.filter((service) => service.provider.id === profile.id)

  return (
    <AppShell>
      <section className="profile-page">
        <div className="profile-top">
          <button className="profile-photo" type="button" onClick={() => setPhotoMenu((v) => !v)}>
            <Avatar user={profile} size="lg" />
          </button>
          {photoMenu ? (
            <div className="photo-popover">
              <button type="button">Upload photo</button>
              <button type="button">Remove photo</button>
              <button type="button" onClick={() => setPhotoMenu(false)}>
                Cancel
              </button>
            </div>
          ) : null}
          <div className="profile-info">
            <div className="profile-title-row">
              <h1>{profile.displayName}</h1>
              {profile.providerStatus === 'APPROVED' ? <ProviderBadge /> : null}
              {profile.providerStatus === 'PENDING' ? <span className="pending-badge">Pending verification</span> : null}
              <button className="secondary-button">Edit profile</button>
            </div>
            <p>@{profile.username}</p>
            <div className="profile-stats">
              <strong>{ownPosts.length} posts</strong>
              {isProvider ? <strong>{ownServices.length} services</strong> : null}
              <strong>1.8k followers</strong>
              <strong>420 following</strong>
            </div>
            <p className="profile-bio">{profile.bio}</p>
          </div>
        </div>
        {isProvider ? (
          <div className="segmented-tabs">
            <button className={tab === 'posts' ? 'active' : ''} type="button" onClick={() => setTab('posts')}>
              Posts
            </button>
            <button className={tab === 'services' ? 'active' : ''} type="button" onClick={() => setTab('services')}>
              Services
            </button>
          </div>
        ) : null}
        {tab === 'posts' ? (
          <div className="profile-grid">
            {(ownPosts.length ? ownPosts : postsSeed).map((post) => (
              <img key={post.id} src={post.media[0]?.url} alt={post.caption} />
            ))}
          </div>
        ) : (
          <div className="service-grid">
            {ownServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  )
}

function ActivityPage() {
  return (
    <AppShell>
      <UtilityPage
        eyebrow="Your activity"
        title="Everything you touched"
        rows={[
          'Posts you liked',
          'Comments you liked or replied to',
          'Mentions and tags',
          'Reports made by you',
          'Ticket history',
        ]}
      />
    </AppShell>
  )
}

function SavedPage() {
  return (
    <AppShell>
      <section className="utility-page">
        <p className="eyebrow">Saved</p>
        <h1>Saved posts and services</h1>
        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </AppShell>
  )
}

function SettingsPage() {
  const { theme, setTheme } = useApp()
  return (
    <AppShell>
      <section className="settings-page">
        <p className="eyebrow">Settings</p>
        <h1>Appearance, privacy, and provider tools</h1>
        <div className="settings-card">
          <h2>Themes</h2>
          <p>Each color works with light and dark mode through shared tokens.</p>
          <div className="theme-grid">
            {themes.map((item) => (
              <button
                key={item.key}
                type="button"
                className={theme === item.key ? 'selected' : ''}
                onClick={() => setTheme(item.key)}
              >
                <span className={`theme-dot theme-${item.key}`} />
                {item.name}
                {theme === item.key ? <Check size={16} /> : null}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-card">
          <h2>Become a provider</h2>
          <p>Normal users can apply from here. Services stay hidden until approval.</p>
          <button className="primary-button">Start provider application</button>
        </div>
      </section>
    </AppShell>
  )
}

function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<SupportTicket['category']>('TECHNICAL')
  const [priority, setPriority] = useState<SupportTicket['priority']>('NORMAL')
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getSupportTickets()
      .then((response) => setTickets(response.tickets))
      .catch(() => setTickets([]))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!subject.trim() || !description.trim()) return

    try {
      setIsSubmitting(true)
      setStatus(null)
      const response = await createSupportTicket({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      })

      setTickets((current) => [response.ticket, ...current])
      setSubject('')
      setDescription('')
      setCategory('TECHNICAL')
      setPriority('NORMAL')
      setStatus('Ticket created and saved to the database.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <section className="tickets-page">
        <div className="page-heading">
          <p className="eyebrow">Support</p>
          <h1>Report a problem</h1>
          <p>Tickets are stored in the backend so admins can review, reply, and link them to reported content.</p>
        </div>

        <div className="tickets-layout">
          <form className="ticket-form" onSubmit={handleSubmit}>
            <label>
              Subject
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Short title"
              />
            </label>
            <label>
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What happened?"
              />
            </label>
            <div className="form-grid">
              <label>
                Category
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as SupportTicket['category'])}
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="ACCOUNT">Account</option>
                  <option value="REPORT">Report</option>
                  <option value="PROVIDER">Provider</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
              <label>
                Priority
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as SupportTicket['priority'])}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </label>
            </div>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create ticket'}
            </button>
            {status ? <p className="ticket-status">{status}</p> : null}
          </form>

          <aside className="ticket-list">
            <h2>Your tickets</h2>
            {tickets.length ? (
              tickets.map((ticket) => (
                <article key={ticket.id} className="ticket-row">
                  <div>
                    <strong>{ticket.subject}</strong>
                    <span>{ticket.category.toLowerCase()} / {ticket.priority.toLowerCase()}</span>
                  </div>
                  <small>{ticket.status.replaceAll('_', ' ').toLowerCase()}</small>
                </article>
              ))
            ) : (
              <div className="empty-ticket-list">
                <Ticket size={32} />
                <p>No tickets yet.</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </AppShell>
  )
}

function UtilityPage({
  eyebrow,
  title,
  rows,
  action,
}: {
  eyebrow: string
  title: string
  rows: string[]
  action?: string
}) {
  return (
    <section className="utility-page">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="utility-list">
        {rows.map((row) => (
          <div key={row}>
            <Sparkles size={18} />
            <span>{row}</span>
          </div>
        ))}
      </div>
      {action ? <button className="primary-button">{action}</button> : null}
    </section>
  )
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const { currentUser } = useApp()
  const [type, setType] = useState<'post' | 'service'>('post')
  const [step, setStep] = useState(1)
  const canCreateService = currentUser?.role === 'PROVIDER'

  return (
    <div className="modal-backdrop">
      <section className="create-modal">
        <header>
          <button type="button" onClick={step === 1 ? onClose : () => setStep((value) => value - 1)}>
            {step === 1 ? <X /> : <ArrowLeft />}
          </button>
          <strong>Create {type}</strong>
          <button type="button" className="text-button" onClick={step === 3 ? onClose : () => setStep((value) => value + 1)}>
            {step === 3 ? 'Share' : 'Next'}
          </button>
        </header>
        {canCreateService ? (
          <div className="segmented-tabs">
            <button className={type === 'post' ? 'active' : ''} type="button" onClick={() => setType('post')}>
              Post
            </button>
            <button className={type === 'service' ? 'active' : ''} type="button" onClick={() => setType('service')}>
              Service
            </button>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="upload-dropzone">
            <Camera size={40} />
            <h2>Add images or video</h2>
            <p>Media is optional in the concept, but the UI supports image and video from the start.</p>
            <button className="secondary-button">Choose files</button>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="create-fields">
            <label>
              {type === 'service' ? 'Service title' : 'Caption'}
              <textarea placeholder={type === 'service' ? 'Describe your service offer' : 'Write a caption...'} />
            </label>
            <label>
              Location
              <input placeholder="Casablanca, Rabat..." />
            </label>
            <label>
              Date
              <input type="date" />
            </label>
          </div>
        ) : null}
        {step === 3 ? (
          <div className="create-fields">
            {type === 'service' ? (
              <>
                <label>
                  Category
                  <select>
                    <option>Events</option>
                    <option>Beauty</option>
                    <option>Media</option>
                  </select>
                </label>
                <label>
                  Subcategory
                  <select>
                    <option>Photography</option>
                    <option>Makeup</option>
                    <option>Decoration</option>
                  </select>
                </label>
                <label>
                  Keywords
                  <input placeholder="wedding, luxury, casablanca" />
                </label>
              </>
            ) : (
              <label>
                Hashtags
                <input placeholder="wedding decor birthday" />
              </label>
            )}
          </div>
        ) : null}
      </section>
    </div>
  )
}

function NotificationsDrawer({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()

  function notificationIcon(type: string) {
    if (type === 'message') return <MessageCircle size={18} />
    if (type === 'ticket') return <Ticket size={18} />
    if (type === 'like') return <Heart size={18} />
    return <Bell size={18} />
  }

  function openNotification(path: string) {
    navigate(path)
    onClose()
  }

  return (
    <div className="drawer-layer">
      <aside className="side-drawer notifications-drawer">
        <header>
          <div>
            <p className="eyebrow">Inbox</p>
            <h2>Notifications</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            <X />
          </button>
        </header>
        {notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            className={`notification-card ${notification.unread ? 'unread' : ''}`}
            onClick={() => openNotification(notification.path)}
          >
            <span className="notification-avatar">
              <Avatar user={notification.actor} size="sm" />
              <span>{notificationIcon(notification.type)}</span>
            </span>
            <span className="notification-copy">
              <strong>{notification.title}</strong>
              <span>{notification.detail}</span>
              <small>{notification.action}</small>
            </span>
            {notification.unread ? <i aria-label="Unread" /> : null}
          </button>
        ))}
      </aside>
      <button className="drawer-scrim" type="button" onClick={onClose} aria-label="Close notifications" />
    </div>
  )
}

function SwitchAccountModal({ onClose }: { onClose: () => void }) {
  const { login } = useApp()
  return (
    <div className="modal-backdrop">
      <section className="switch-modal">
        <button className="modal-close" type="button" onClick={onClose}>
          <X />
        </button>
        <h2>Switch account</h2>
        <p>Log in without leaving the page you are on.</p>
        <label>
          Email
          <input placeholder="another@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Password" />
        </label>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            login('PROVIDER')
            onClose()
          }}
        >
          Switch
        </button>
      </section>
    </div>
  )
}

function FloatingMessenger() {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const conversations = conversationsSeed
  const active = conversations.find((conversation) => conversation.id === activeId)
  const unreadTotal = conversations.reduce((total, conversation) => total + conversation.unread, 0)

  if (location.pathname === '/messages') return null

  if (!open) {
    return (
      <button className="messenger-launcher" type="button" onClick={() => setOpen(true)} aria-label="Open messages">
        <MessageCircle />
        {unreadTotal ? <span>{unreadTotal > 9 ? '+9' : unreadTotal}</span> : null}
      </button>
    )
  }

  return (
    <aside className="floating-messenger">
      <header>
        <strong>{active ? active.user.displayName : 'Messages'}</strong>
        <div>
          <button type="button" onClick={() => navigate('/messages')} title="Expand">
            <Maximize2 size={16} />
          </button>
          <button type="button" onClick={() => setOpen(false)} title="Close">
            <X size={16} />
          </button>
        </div>
      </header>
      {active ? (
        <div className="mini-chat-shell">
          <aside className="mini-avatar-rail" aria-label="Conversations">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={conversation.id === active.id ? 'active' : ''}
                onClick={() => setActiveId(conversation.id)}
                aria-label={conversation.user.displayName}
              >
                <Avatar user={conversation.user} size="sm" />
                {conversation.unread ? <i /> : null}
              </button>
            ))}
          </aside>
          <section className="mini-chat-main">
            <div className="mini-chat-top">
              <button type="button" onClick={() => setActiveId(null)} aria-label="Back to conversations">
                <ArrowLeft size={16} />
              </button>
              <Avatar user={active.user} size="sm" />
              <div>
                <strong>{active.user.displayName}</strong>
                <span>@{active.user.username}</span>
              </div>
            </div>
            <div className="mini-message-stream">
              {active.messages.map((message) => (
                <p key={message.id} className={message.fromMe ? 'mine' : ''}>
                  {message.text}
                  <span>{message.time}</span>
                </p>
              ))}
            </div>
            <form className="message-compose" onSubmit={(event) => event.preventDefault()}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message..."
              />
              <button type="button" disabled={!draft.trim()} onClick={() => setDraft('')}>
                <Send size={17} />
              </button>
            </form>
          </section>
        </div>
      ) : (
        <div className="mini-conversation-list">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages.at(-1)
            return (
              <button key={conversation.id} type="button" onClick={() => setActiveId(conversation.id)}>
                <Avatar user={conversation.user} />
                <span>
                  <strong>{conversation.user.displayName}</strong>
                  <small className={conversation.unread ? 'unread-copy' : ''}>
                    {conversation.unread
                      ? conversation.unread > 9
                        ? '+9 new msgs'
                        : `${conversation.unread} new msg${conversation.unread > 1 ? 's' : ''}`
                      : lastMessage?.text}
                  </small>
                </span>
                {conversation.unread ? <i>{conversation.unread > 9 ? '+9' : conversation.unread}</i> : null}
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}

function MiniProfile({ user, action }: { user: AppUser; action: string }) {
  return (
    <div className="mini-profile">
      <Avatar user={user} />
      <div>
        <div className="name-line">
          <strong>{user.displayName}</strong>
          {user.providerStatus === 'APPROVED' ? <ProviderBadge compact /> : null}
        </div>
        <span>@{user.username}</span>
      </div>
      <button type="button">{action}</button>
    </div>
  )
}

function ServiceMini({ service }: { service: ServiceItem }) {
  return (
    <div className="service-mini">
      <img src={service.image} alt={service.title} />
      <div>
        <strong>{service.title}</strong>
        <span>
          {service.subcategory} · {service.rating}
        </span>
      </div>
    </div>
  )
}

function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <article className="service-card">
      <img src={service.image} alt={service.title} />
      <div>
        <div className="name-line">
          <strong>{service.title}</strong>
          <ProviderBadge compact />
        </div>
        <p>{service.description}</p>
        <span>
          {service.category} / {service.subcategory}
        </span>
        <small>{service.keywords.map((keyword) => `#${keyword}`).join(' ')}</small>
      </div>
    </article>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
    </div>
  )
}

function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [theme, setTheme] = useState<ThemeKey>('light')
  const [createOpen, setCreateOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)

  useEffect(() => {
    getCurrentUser()
      .then((response) => setCurrentUser(mapApiUser(response.user)))
      .catch(() => undefined)
  }, [])

  const appValue = useMemo<AppContextValue>(
    () => ({
      currentUser,
      theme,
      setTheme,
      login: (role = 'USER') => {
        setCurrentUser(role === 'PROVIDER' ? { ...users[1], providerStatus: 'PENDING' } : users[0])
      },
      loginWithCredentials: async (email, password) => {
        const response = await loginUser({ email, password })
        setCurrentUser(mapApiUser(response.user))
      },
      registerAccount: async ({ displayName, username, email, password, requestedRole }) => {
        const { firstName, lastName } = splitDisplayName(displayName)
        const response = await registerUser({
          firstName,
          lastName,
          username,
          email,
          password,
        })
        setCurrentUser(mapApiUser(response.user, requestedRole))
      },
      logout: () => {
        clearStoredToken()
        setCurrentUser(null)
      },
      openCreate: () => setCreateOpen(true),
      openNotifications: () => setNotificationsOpen(true),
      openSwitchAccount: () => setSwitchOpen(true),
    }),
    [currentUser, theme],
  )

  return (
    <AppContext.Provider value={appValue}>
      <div className="app-root" data-theme={theme}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/p/:postId" element={<LandingPage />} />
          <Route
            path="/about"
            element={
              <FooterInfoPage
                eyebrow="About Momento"
                title="A calmer way to plan and share celebrations"
                intro="Momento brings social inspiration and local event services into one place, so people can save ideas, talk to providers, and share the memories that come after."
                items={[
                  {
                    title: 'Designed around real moments',
                    body: 'The platform keeps photos, posts, services, and conversations close together so planning feels connected instead of scattered.',
                  },
                  {
                    title: 'Built for local creative work',
                    body: 'Providers can show their style, earn trust, and meet clients who already understand the type of event they want to create.',
                  },
                ]}
              />
            }
          />
          <Route
            path="/faq"
            element={
              <FooterInfoPage
                eyebrow="FAQ"
                title="Questions people usually ask"
                intro="A quick guide to how accounts, provider profiles, and discovery work inside Momento."
                items={[
                  {
                    title: 'Can I use Momento without being a provider?',
                    body: 'Yes. Normal users can post moments, save inspiration, follow people, search services, and message providers.',
                  },
                  {
                    title: 'How do provider services become visible?',
                    body: 'Providers can create a profile first. Public service listings are designed to go through approval so the marketplace stays trustworthy.',
                  },
                  {
                    title: 'Can I message providers directly?',
                    body: 'Yes. Messaging is part of the core experience so event details, pricing, and availability can be discussed in context.',
                  },
                ]}
              />
            }
          />
          <Route
            path="/contact"
            element={<ContactPage />}
          />
          <Route
            path="/support"
            element={
              <FooterInfoPage
                eyebrow="Support"
                title="Support that keeps the planning moving"
                intro="Use support for technical issues, account questions, provider listing help, or reports that need review."
                items={[
                  {
                    title: 'In-app tickets',
                    body: 'Logged-in users can open a support ticket from the app menu and track issues by category and priority.',
                  },
                  {
                    title: 'Provider assistance',
                    body: 'Providers can ask for help with profile setup, service details, listing standards, and approval expectations.',
                  },
                  {
                    title: 'Safety and reports',
                    body: 'Reports and trust-related concerns should include enough context for the support team to review them clearly.',
                  },
                ]}
              />
            }
          />
          <Route
            path="/privacy"
            element={
              <FooterInfoPage
                eyebrow="Privacy"
                title="Privacy principles"
                intro="Momento should feel personal, so privacy choices need to be understandable and respectful."
                items={[
                  {
                    title: 'Profile and content data',
                    body: 'Your profile, posts, saved content, messages, and support requests should be used to provide the app experience and improve safety.',
                  },
                  {
                    title: 'Provider discovery',
                    body: 'Provider details are intended to help users evaluate services, contact professionals, and make informed event decisions.',
                  },
                ]}
              />
            }
          />
          <Route
            path="/terms"
            element={
              <FooterInfoPage
                eyebrow="Terms"
                title="Community expectations"
                intro="Momento works best when people share honestly, respect creative work, and use provider tools responsibly."
                items={[
                  {
                    title: 'Respectful participation',
                    body: 'Users should post content they have the right to share, communicate respectfully, and avoid misleading provider or event claims.',
                  },
                  {
                    title: 'Responsible bookings',
                    body: 'Service details, prices, and commitments should be confirmed clearly between users and providers before an event.',
                  },
                ]}
              />
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:profileId"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <TicketsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={currentUser ? '/home' : '/'} replace />} />
        </Routes>
        {createOpen ? <CreateModal onClose={() => setCreateOpen(false)} /> : null}
        {notificationsOpen ? <NotificationsDrawer onClose={() => setNotificationsOpen(false)} /> : null}
        {switchOpen ? <SwitchAccountModal onClose={() => setSwitchOpen(false)} /> : null}
      </div>
    </AppContext.Provider>
  )
}

export default App
