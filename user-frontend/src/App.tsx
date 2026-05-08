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
  Eye,
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
  UserX,
  Users,
  Video,
  Trash2,
  Zap,
  X,
} from 'lucide-react'
import {
  createContext,
  type FormEvent,
  type ChangeEvent,
  type ReactNode,
  type Ref,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  clearStoredToken,
  addPostComment as addPostCommentApi,
  createPost as createPostApi,
  createChatConversation,
  createProviderRequest,
  createProviderService,
  createServiceReview,
  createSupportTicket,
  getChatConversations,
  getChatMessages,
  getAdminReports,
  getAdminUsers,
  getAdminProviderRequests,
  getAdminProviderRequest,
  getAdminReport,
  getAdminStats,
  getSuperadminStats,
  getAdminLogs,
  getSuperadminLogs,
  getAdminTickets,
  getAdminTicket,
  updateAdminTicketStatus,
  replyAdminTicket,
  blockAdminUser,
  unblockAdminUser,
  promoteAdminBySuperadmin,
  updateUserRoleBySuperadmin,
  deleteUserBySuperadmin,
  reviewAdminProviderRequest,
  approveAdminProviderRequest,
  rejectAdminProviderRequest,
  getNotifications,
  getStoredToken,
  deleteServiceImage,
  deleteProviderService,
  deletePostComment,
  getPosts,
  getServices,
  getCurrentUser,
  getFollowers,
  getFollowing,
  getSupportTickets,
  getServiceReviews,
  followUser,
  likePost,
  likePostComment,
  loginUser,
  registerUser,
  reportPost,
  reportPostComment,
  reportUser,
  rejectAdminReport,
  resolveAdminReport,
  markAdminReportReviewing,
  savePost,
  sendChatMessage,
  setServiceCoverImage,
  unlikePost,
  unlikePostComment,
  unfollowUser,
  unsavePost,
  updatePostComment,
  updateProviderService,
  uploadPostImages,
  uploadProviderCinPicture,
  uploadServiceImages,
  markChatConversationRead,
  markNotificationAsRead,
  type ApiComment,
  type ApiChatMessage,
  type ApiConversation,
  type ApiReport,
  type AdminUserRow,
  type AdminProviderRequest,
  type AdminLog,
  type AdminStats,
  type AdminTicket,
  type ApiNotification,
  type ApiReview,
  type ApiUser,
  type ApiPost,
  type ApiService,
  type SupportTicket,
  API_ORIGIN,
} from './api'
import {
  createChatSocket,
  createNotificationSocket,
  type ChatServerEvents,
  type ChatClientEvents,
  type NotificationServerEvents,
  type RealtimeConversation,
  type Socket,
} from './api/realtime'

type Role = 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPERADMIN'
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
  images: Array<{ id: string; url: string }>
  city?: string
  price?: number | null
  reviewsCount: number
}

type ServiceReviewItem = {
  id: string
  user: AppUser
  rating: number
  comment: string
  createdAt: string
}

type Conversation = {
  id: string
  user: AppUser
  unread: number
  messages: Array<{ id: string; fromMe: boolean; text: string; time: string }>
}

type NotificationItem = {
  id: string
  actor: AppUser
  title: string
  detail: string
  path: string
  action: string
  type: string
  unread: boolean
}

type AppContextValue = {
  currentUser: AppUser | null
  authReady: boolean
  theme: ThemeKey
  setTheme: (theme: ThemeKey) => void
  users: AppUser[]
  posts: PostItem[]
  services: ServiceItem[]
  conversations: Conversation[]
  notifications: NotificationItem[]
  followedUserIds: string[]
  login: (role?: Role) => void
  loginWithCredentials: (email: string, password: string) => Promise<AppUser>
  registerAccount: (payload: {
    displayName: string
    username: string
    email: string
    password: string
    requestedRole: Extract<Role, 'USER' | 'PROVIDER'>
  }) => Promise<void>
  logout: () => void
  createPost: (payload: {
    caption: string
    hashtags: string[]
    location?: string
    media: MediaItem[]
    files?: File[]
  }) => void
  createService: (payload: {
    title: string
    category: string
    subcategory: string
    keywords: string[]
    description: string
    image: string
    city?: string
    price?: number | null
    files?: File[]
  }) => void
  updateService: (serviceId: string, payload: {
    title: string
    category: string
    subcategory: string
    keywords: string[]
    description: string
    city?: string
    price?: number | null
    files?: File[]
    coverFile?: File | null
    coverImageId?: string
    deletedImageIds?: string[]
  }) => Promise<void>
  deleteService: (serviceId: string) => Promise<void>
  togglePostLike: (postId: string) => void
  togglePostSave: (postId: string) => void
  toggleFollow: (userId: string) => void
  addComment: (postId: string, content: string) => void
  replyToComment: (postId: string, parentCommentId: string, content: string) => void
  updateComment: (commentId: string, content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
  reportComment: (commentId: string, reason: string, description?: string) => Promise<void>
  reportPostById: (postId: string, reason: string, description?: string) => Promise<void>
  reportUserById: (userId: string, reason: string, description?: string) => Promise<void>
  toggleCommentLike: (commentId: string, liked: boolean) => Promise<void>
  reportContent: (kind: string, target: string) => void
  loadConversationMessages: (conversationId: string) => Promise<void>
  startConversation: (userId: string) => Promise<string | null>
  sendMessage: (conversationId: string, text: string) => void
  updateProfile: (payload: Partial<Pick<AppUser, 'displayName' | 'username' | 'bio' | 'avatar' | 'role' | 'providerStatus'>>) => void
  markNotificationRead: (notificationId: string) => void
  openCreate: (type?: 'post' | 'service') => void
  openNotifications: () => void
  openSwitchAccount: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

const usersSeed: AppUser[] = [
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
    author: usersSeed[1],
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
        user: usersSeed[3],
        content: 'The lighting is beautiful. This looks so calm and elegant.',
        liked: true,
        likes: 12,
        replies: [
          {
            id: 'c-1-r-1',
            user: usersSeed[1],
            content: 'Thank you. We wanted it to feel intimate.',
            liked: false,
            likes: 3,
            replies: [],
          },
        ],
      },
      {
        id: 'c-2',
        user: usersSeed[0],
        content: 'Saving this for the color palette alone.',
        liked: false,
        likes: 5,
        replies: [],
      },
    ],
  },
  {
    id: 'p-2',
    author: usersSeed[2],
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
        user: usersSeed[1],
        content: 'The movement is smooth. This would be great for service previews.',
        liked: false,
        likes: 7,
        replies: [],
      },
    ],
  },
  {
    id: 'p-3',
    author: usersSeed[3],
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
    provider: usersSeed[1],
    title: 'Soft Glam Bridal Makeup',
    category: 'Beauty',
    subcategory: 'Makeup',
    keywords: ['bridal', 'soft glam', 'casablanca'],
    description: 'Full bridal makeup with skin prep, lashes, and touch-up kit.',
    rating: 4.9,
    saved: true,
    city: 'Casablanca',
    price: 1200,
    reviewsCount: 18,
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 's-1-img-1', url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80' },
      { id: 's-1-img-2', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80' },
    ],
  },
  {
    id: 's-2',
    provider: usersSeed[2],
    title: 'Event Photography and Reel',
    category: 'Media',
    subcategory: 'Photography',
    keywords: ['wedding', 'video', 'reel'],
    description: 'Photo coverage plus a short vertical reel for social sharing.',
    rating: 4.8,
    saved: false,
    city: 'Rabat',
    price: 2500,
    reviewsCount: 11,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
    images: [
      { id: 's-2-img-1', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80' },
      { id: 's-2-img-2', url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
    ],
  },
]

const notificationsSeed: NotificationItem[] = [
  {
    id: 'n-1',
    actor: usersSeed[1],
    title: 'Reply on your comment',
    detail: 'Nora Studio replied to your question about the bridal makeup package.',
    path: '/home',
    action: 'Open post',
    type: 'reply',
    unread: true,
  },
  {
    id: 'n-2',
    actor: usersSeed[2],
    title: 'Message',
    detail: 'Yassine Frames sent you a new message.',
    path: '/messages',
    action: 'Reply',
    type: 'message',
    unread: true,
  },
  {
    id: 'n-3',
    actor: usersSeed[0],
    title: 'Ticket update',
    detail: 'Your support ticket was marked in progress.',
    path: '/tickets',
    action: 'View ticket',
    type: 'ticket',
    unread: false,
  },
  {
    id: 'n-4',
    actor: usersSeed[3],
    title: 'Comment like',
    detail: 'Sara liked your comment on a birthday planning post.',
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
  const isProvider = user.role === 'PROVIDER' || requestedRole === 'PROVIDER'
  const isApprovedProvider = user.providerRequests?.some((request) => request.status === 'APPROVED')
  const mappedRole: Role =
    user.role === 'ADMIN' || user.role === 'SUPERADMIN'
      ? user.role
      : isProvider
        ? 'PROVIDER'
        : 'USER'

  return {
    id: user.id,
    displayName: `${user.firstName} ${user.lastName}`.trim(),
    username: user.username,
    role: mappedRole,
    providerStatus: isProvider ? (isApprovedProvider ? 'APPROVED' : 'PENDING') : undefined,
    avatar: user.profilePicturePath
      ? apiAssetUrl(user.profilePicturePath)
      : `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() || 'M',
    bio: user.bio || 'Building moments on Momento.',
  }
}

function apiAssetUrl(path?: string | null) {
  if (!path) return ''
  if (/^(https?:|data:|blob:)/.test(path)) return path

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_ORIGIN}${normalizedPath}`
}

function parsePostContent(content: string) {
  const hashtags = Array.from(content.matchAll(/#([\p{L}\p{N}_-]+)/gu)).map((match) => match[1])
  const cleaned = content.replace(/(^|\s)#[\p{L}\p{N}_-]+/gu, '').replace(/\s+/g, ' ').trim()

  return {
    caption: cleaned || content,
    hashtags,
  }
}

function mapApiPost(post: ApiPost, currentUserId?: string): PostItem {
  const parsed = parsePostContent(post.content)
  const mapComment = (comment: ApiComment): CommentItem => ({
    id: comment.id,
    user: mapApiUser(comment.user),
    content: comment.content,
    liked: Boolean(currentUserId && comment.reactions?.some((reaction) => reaction.userId === currentUserId)),
    likes: comment.reactions?.length ?? 0,
    replies: (comment.replies ?? []).map(mapComment),
  })
  const comments = (post.comments ?? []).map(mapComment)

  return {
    id: post.id,
    author: mapApiUser(post.author),
    media: post.images.map((image) => ({ type: 'image' as const, url: apiAssetUrl(image.imagePath) })),
    caption: parsed.caption,
    hashtags: parsed.hashtags,
    liked: Boolean(currentUserId && post.reactions.some((reaction) => reaction.userId === currentUserId)),
    likes: post._count?.reactions ?? post.reactions.length,
    saved: false,
    comments,
  }
}

function mapApiService(service: ApiService): ServiceItem {
  const images = service.images.map((image) => ({ id: image.id, url: apiAssetUrl(image.imagePath) }))
  return {
    id: service.id,
    provider: mapApiUser({
      ...service.providerProfile.user,
      role: 'PROVIDER',
      providerProfile: { providerStatus: service.providerProfile.providerStatus },
    }),
    title: service.title,
    category: service.category,
    subcategory: service.subcategory || 'Service',
    keywords: service.keywords,
    description: service.description,
    rating: service._count?.reviews ? Math.min(5, 4 + service._count.reviews / 10) : 0,
    saved: false,
    city: service.city ?? undefined,
    price: service.price ?? null,
    reviewsCount: service._count?.reviews ?? 0,
    image: images[0]?.url || 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
    images,
  }
}

function mapApiReview(review: ApiReview): ServiceReviewItem {
  return {
    id: review.id,
    user: mapApiUser(review.user),
    rating: review.rating,
    comment: review.comment || '',
    createdAt: review.createdAt,
  }
}

function formatMessageTime(value?: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function mapApiChatMessage(message: ApiChatMessage, currentUserId?: string): Conversation['messages'][number] {
  return {
    id: message.id,
    fromMe: message.senderId === currentUserId,
    text: message.content,
    time: formatMessageTime(message.createdAt),
  }
}

function mapApiConversation(conversation: ApiConversation, currentUserId?: string): Conversation | null {
  const otherParticipant =
    conversation.participants.find((participant) => participant.userId !== currentUserId) ??
    conversation.participants[0]

  if (!otherParticipant) return null

  return {
    id: conversation.id,
    user: mapApiUser(otherParticipant.user),
    unread: conversation.unreadCount ?? 0,
    messages: [...(conversation.messages ?? [])]
      .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
      .map((message) => mapApiChatMessage(message, currentUserId)),
  }
}

function notificationMeta(type: string) {
  const normalized = type.toLowerCase()
  if (normalized.includes('ticket')) return { path: '/tickets', action: 'View ticket', type: 'ticket' }
  if (normalized.includes('report')) return { path: '/tickets', action: 'View report', type: 'ticket' }
  if (normalized.includes('comment')) return { path: '/home', action: 'Open post', type: 'reply' }
  if (normalized.includes('like')) return { path: '/home', action: 'Open post', type: 'like' }
  if (normalized.includes('follow')) return { path: '/profile/me', action: 'Open profile', type: 'follow' }
  return { path: '/home', action: 'Open', type: normalized || 'system' }
}

function mapApiNotification(notification: ApiNotification, actor: AppUser): NotificationItem {
  const meta = notificationMeta(notification.type)

  return {
    id: notification.id,
    actor,
    title: notification.title,
    detail: notification.message,
    path: meta.path,
    action: meta.action,
    type: meta.type,
    unread: !notification.isRead,
  }
}

function mergeConversation(current: Conversation[], incoming: Conversation) {
  const existing = current.find((conversation) => conversation.id === incoming.id)
  const messages = existing ? [...existing.messages] : []

  incoming.messages.forEach((message) => {
    if (!messages.some((item) => item.id === message.id)) messages.push(message)
  })

  return [
    {
      ...incoming,
      messages,
    },
    ...current.filter((conversation) => conversation.id !== incoming.id),
  ]
}

function appendRealtimeMessage(
  conversations: Conversation[],
  conversationId: string,
  message: ApiChatMessage,
  currentUserId: string,
) {
  console.debug('[realtime] appendRealtimeMessage', { conversationId, messageId: message.id })
  const mapped = mapApiChatMessage(message, currentUserId)

  return conversations.map((conversation) => {
    if (conversation.id !== conversationId) return conversation

    const existingMessage = conversation.messages.find((item) => item.id === mapped.id)
    if (existingMessage) return conversation

    const localMessage = conversation.messages.find(
      (item) => item.id.startsWith('m-local-') && item.fromMe && mapped.fromMe && item.text === mapped.text,
    )
    const messages = localMessage
      ? conversation.messages.map((item) => (item.id === localMessage.id ? mapped : item))
      : [...conversation.messages, mapped]

    return {
      ...conversation,
      unread: mapped.fromMe ? conversation.unread : conversation.unread + 1,
      messages,
    }
  })
}

function syncAuthor(user: AppUser, posts: PostItem[]) {
  return posts.map((post) => ({
    ...post,
    author: post.author.id === user.id ? user : post.author,
    comments: post.comments.map((comment) => syncCommentUser(user, comment)),
  }))
}

function syncCommentUser(user: AppUser, comment: CommentItem): CommentItem {
  return {
    ...comment,
    user: comment.user.id === user.id ? user : comment.user,
    replies: comment.replies.map((reply) => syncCommentUser(user, reply)),
  }
}

function syncProvider(user: AppUser, serviceItems: ServiceItem[]) {
  return serviceItems.map((service) => ({
    ...service,
    provider: service.provider.id === user.id ? user : service.provider,
  }))
}

function makeNotification(actor: AppUser, title: string, detail: string, path: string, type: string): NotificationItem {
  return {
    id: `n-local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    actor,
    title,
    detail,
    path,
    action: 'Open',
    type,
    unread: true,
  }
}

const storageKeys = {
  theme: 'momento:v3:theme',
} as const

function loadStoredState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function storeState<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
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

function useOutsideClose<T extends HTMLElement>(active: boolean, onClose: () => void) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!active) return

    function handlePointerDown(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      onClose()
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [active, onClose])

  return ref
}

function ProviderBadges({ user, compact = false }: { user: AppUser; compact?: boolean }) {
  if (user.role !== 'PROVIDER') return null
  return (
    <span
      className={`pro-badge ${compact ? 'pro-badge-compact' : ''} ${
        user.providerStatus === 'APPROVED' ? 'pro-badge-verified' : ''
      }`}
      title={user.providerStatus === 'APPROVED' ? 'Verified provider' : 'Provider'}
    >
      {user.providerStatus === 'APPROVED' ? <ShieldCheck size={compact ? 13 : 15} /> : null}
      Pro
    </span>
  )
}

function Avatar({ user, size = 'md' }: { user: AppUser; size?: 'sm' | 'md' | 'lg' }) {
  const isImage = user.avatar.startsWith('data:') || user.avatar.startsWith('blob:') || user.avatar.startsWith('http')
  return (
    <span className={`avatar avatar-${size}`}>
      {isImage ? <img src={user.avatar} alt={user.displayName} /> : user.avatar}
    </span>
  )
}

function profilePath(user: AppUser) {
  return `/profile/${user.id}`
}

function UserProfileLink({
  user,
  children,
  className,
}: {
  user: AppUser
  children: ReactNode
  className?: string
}) {
  return (
    <Link to={profilePath(user)} className={className ?? 'profile-link'}>
      {children}
    </Link>
  )
}

function FollowButton({ user }: { user: AppUser }) {
  const { currentUser, followedUserIds, toggleFollow } = useApp()
  if (!currentUser || currentUser.id === user.id) return null
  const isFollowing = followedUserIds.includes(user.id)

  return (
    <button
      className={isFollowing ? 'follow-text following' : 'follow-text'}
      type="button"
      onClick={() => toggleFollow(user.id)}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  )
}

function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const navigate = useNavigate()
  const featuredServices = services.concat([
    {
      id: 's-3',
      provider: usersSeed[1],
      title: 'Warm Minimal Event Decor',
      category: 'Events',
      subcategory: 'Decoration',
      keywords: ['minimal', 'florals', 'candles'],
      description: 'A refined setup for intimate dinners, engagements, and birthdays.',
      rating: 4.9,
      saved: false,
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
      images: [
        { id: 's-3-img-1', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80' },
      ],
      city: 'Marrakech',
      price: 1800,
      reviewsCount: 9,
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
          {usersSeed.map((user) => (
            <article key={user.id}>
              <Avatar user={user} size="lg" />
              <strong>{user.displayName}</strong>
              <span>@{user.username}</span>
              <ProviderBadges user={user} compact />
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
      const user = await loginWithCredentials(String(formData.get('email') || ''), String(formData.get('password') || ''))
      navigate(user.role === 'ADMIN' || user.role === 'SUPERADMIN' ? '/admin' : '/home')
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

function AdminLoginPage() {
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
      const user = await loginWithCredentials(String(formData.get('email') || ''), String(formData.get('password') || ''))
      if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        setError('This login is reserved for administrators.')
        navigate('/home')
        return
      }
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFrame
      title="Administration login"
      subtitle="Moderation and trust operations for Momento staff."
      image="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80"
      imageTitle="Backoffice access"
      imageText="Review reports, protect users, and keep the community professional."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Admin email
          <input name="email" type="email" placeholder="admin@momento.com" />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="Password" />
        </label>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Checking access...' : 'Enter backoffice'}
        </button>
        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </AuthFrame>
  )
}

function RegisterPage() {
  const { registerAccount } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState<Extract<Role, 'USER' | 'PROVIDER'> | null>(null)
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
          <span>You become a provider now. The verified badge appears only after admin CIN review.</span>
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

function AdminRoute({ children }: { children: ReactNode }) {
  const { currentUser, authReady } = useApp()
  if (!authReady) {
    return (
      <div className="route-loading">
        <ShieldCheck size={24} />
        <span>Loading backoffice...</span>
      </div>
    )
  }
  if (!currentUser) return <Navigate to="/admin/login" replace />
  return currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN' ? children : <Navigate to="/home" replace />
}

function UserRoute({ children }: { children: ReactNode }) {
  const { currentUser, authReady } = useApp()
  if (!authReady) {
    return (
      <div className="route-loading">
        <Sparkles size={24} />
        <span>Loading Momento...</span>
      </div>
    )
  }
  if (!currentUser) return <Navigate to="/" replace />
  if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN') return <Navigate to="/admin" replace />
  return children
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
  const [createMenuOpen, setCreateMenuOpen] = useState(false)
  const navigate = useNavigate()
  const profileMenuRef = useOutsideClose<HTMLDivElement>(menuOpen, () => setMenuOpen(false))
  const createMenuRef = useOutsideClose<HTMLDivElement>(createMenuOpen, () => setCreateMenuOpen(false))

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
          <div className="sidebar-create-wrap" ref={createMenuRef}>
            <button className="sidebar-item" type="button" onClick={() => setCreateMenuOpen((value) => !value)}>
              <Plus />
              <span>Create</span>
            </button>
            {createMenuOpen ? (
              <div className="popover-menu create-menu">
                <button type="button" onClick={() => { openCreate('post'); setCreateMenuOpen(false) }}>
                  <ImageIcon size={16} /> Create post
                </button>
                {currentUser.role === 'PROVIDER' ? (
                  <button type="button" onClick={() => { openCreate('service'); setCreateMenuOpen(false) }}>
                    <BriefcaseBusiness size={16} /> Create service
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="sidebar-bottom" ref={profileMenuRef}>
          <button className="profile-menu-button" type="button" onClick={() => setMenuOpen((v) => !v)}>
            <Avatar user={currentUser} size="sm" />
            <span className="profile-menu-name">{currentUser.username}</span>
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
  const { currentUser, openCreate, posts, services, users, togglePostLike, togglePostSave } = useApp()
  const [activePost, setActivePost] = useState<PostItem | null>(null)

  return (
    <AppShell>
      <section className="content-grid">
        <div className="feed-column">
          <div className="composer-card">
            <div className="composer-top">
              <Avatar user={currentUser ?? users[0]} />
              <button type="button" onClick={() => openCreate('post')}>
                Create a memory, add images, video, location, or event details
              </button>
            </div>
            <div className="composer-actions">
              <button type="button" onClick={() => openCreate('post')}>
                <ImageIcon size={18} /> Images
              </button>
              <button type="button" onClick={() => openCreate('post')}>
                <Video size={18} /> Video
              </button>
              <button type="button" onClick={() => openCreate('post')}>
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
              onComments={() => setActivePost(posts.find((item) => item.id === post.id) ?? post)}
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
      {activePost ? (
        <PostModal
          post={posts.find((item) => item.id === activePost.id) ?? activePost}
          onClose={() => setActivePost(null)}
        />
      ) : null}
    </AppShell>
  )
}

function PostDetailPage() {
  const { postId } = useParams()
  const { posts, togglePostLike, togglePostSave } = useApp()
  const commentsRef = useRef<HTMLElement | null>(null)
  const post = posts.find((item) => item.id === postId)

  return (
    <AppShell>
      <section className="single-post-page">
        {post ? (
          <>
            <PostCard
              post={post}
              onLike={togglePostLike}
              onSave={togglePostSave}
              onComments={() => commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              showCommentsAction={false}
            />
            <PostCommentsSection commentsRef={commentsRef} post={post} variant="page" />
          </>
        ) : (
          <div className="empty-state">
            <ImageIcon size={34} />
            <h2>Post not found</h2>
            <p>This post may have been deleted or hidden.</p>
          </div>
        )}
      </section>
    </AppShell>
  )
}

function PostCard({
  post,
  onLike,
  onSave,
  onComments,
  showCommentsAction = true,
}: {
  post: PostItem
  onLike: (postId: string) => void
  onSave: (postId: string) => void
  onComments: () => void
  showCommentsAction?: boolean
}) {
  const { currentUser, reportPostById, reportUserById } = useApp()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [userReportOpen, setUserReportOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useOutsideClose<HTMLDivElement>(menuOpen, () => setMenuOpen(false))
  const postUrl = `${window.location.origin}/p/${post.id}`

  function copyPostLink() {
    void navigator.clipboard?.writeText(postUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <article className={`post-card ${post.media.length ? '' : 'post-card-text-only'}`}>
      <header className="post-header">
        <UserProfileLink user={post.author} className="profile-inline profile-link">
          <Avatar user={post.author} />
          <div>
            <div className="name-line">
              <strong>{post.author.displayName}</strong>
              <ProviderBadges user={post.author} compact />
            </div>
            <span>
              @{post.author.username}
              {post.location ? ` · ${post.location}` : ''}
            </span>
          </div>
        </UserProfileLink>
        <div className="post-menu-wrap" ref={menuRef}>
          <FollowButton user={post.author} />
          <button className="icon-button" type="button" onClick={() => setMenuOpen((v) => !v)}>
            <MoreHorizontal />
          </button>
          {menuOpen ? (
            <div className="popover-menu">
              {currentUser?.id !== post.author.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setReportOpen(true)
                      setMenuOpen(false)
                    }}
                  >
                    <Flag size={16} /> Report post
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserReportOpen(true)
                      setMenuOpen(false)
                    }}
                  >
                    <User size={16} /> Report user
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => onSave(post.id)}>
                <Bookmark size={16} /> {post.saved ? 'Unsave' : 'Save'}
              </button>
              <button type="button" onClick={() => { navigate(`/p/${post.id}`); setMenuOpen(false) }}>
                <ExternalLink size={16} /> Go to post
              </button>
              <button type="button" onClick={copyPostLink}>
                <Copy size={16} /> {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {post.media.length ? <PostMediaGallery media={post.media} caption={post.caption} onOpen={onComments} /> : null}

      <footer className="post-footer">
        <div className="post-actions">
          <button className={post.liked ? 'liked' : ''} type="button" onClick={() => onLike(post.id)}>
            <Heart className={post.liked ? 'fill-icon' : ''} />
          </button>
          <button type="button" onClick={onComments}>
            <MessageCircle />
          </button>
          <button type="button" onClick={copyPostLink}>
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
        {showCommentsAction ? (
          <button className="muted-action" type="button" onClick={onComments}>
            View all {post.comments.length} comments
          </button>
        ) : null}
      </footer>
      {reportOpen ? (
        <ReportDialog
          title="Report post"
          onClose={() => setReportOpen(false)}
          onSubmit={(reason, description) => reportPostById(post.id, reason, description)}
        />
      ) : null}
      {userReportOpen ? (
        <ReportDialog
          title="Report user"
          onClose={() => setUserReportOpen(false)}
          onSubmit={(reason, description) => reportUserById(post.author.id, reason, description)}
        />
      ) : null}
    </article>
  )
}

function PostMediaGallery({
  media,
  caption,
  onOpen,
}: {
  media: MediaItem[]
  caption: string
  onOpen: () => void
}) {
  const visibleMedia = media.slice(0, media.length === 3 ? 3 : 4)
  const hiddenCount = Math.max(media.length - visibleMedia.length, 0)

  return (
    <button
      className={`post-media post-media-gallery gallery-count-${Math.min(media.length, 4)}`}
      type="button"
      onClick={onOpen}
      aria-label="Open post pictures"
    >
      {visibleMedia.map((item, index) => (
        <span key={`${item.url}-${index}`} className="gallery-tile">
          {item.type === 'video' ? (
            <>
              <video src={item.url} muted loop playsInline />
              <Play size={24} />
            </>
          ) : (
            <img src={item.url} alt={index === 0 ? caption : ''} />
          )}
          {hiddenCount && index === visibleMedia.length - 1 ? (
            <span className="media-count media-count-cover">+{hiddenCount}</span>
          ) : null}
        </span>
      ))}
    </button>
  )
}

const PostCommentsSection = ({
  post,
  variant = 'modal',
  commentsRef,
}: {
  post: PostItem
  variant?: 'modal' | 'page'
  commentsRef?: Ref<HTMLElement>
}) => {
  const {
    addComment: addPostComment,
    replyToComment: addReplyToComment,
    updateComment,
  } = useApp()
  const [draft, setDraft] = useState('')
  const [replyTarget, setReplyTarget] = useState<CommentItem | null>(null)
  const [replyParentId, setReplyParentId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<CommentItem | null>(null)

  function addComment() {
    if (!draft.trim()) return
    if (editTarget) {
      void updateComment(editTarget.id, draft.trim())
        .then(() => {
          setDraft('')
          setEditTarget(null)
        })
        .catch(() => undefined)
    } else if (replyParentId) {
      addReplyToComment(post.id, replyParentId, draft.trim())
      setDraft('')
      setReplyTarget(null)
      setReplyParentId(null)
    } else {
      addPostComment(post.id, draft.trim())
      setDraft('')
    }
  }

  function replyToComment(comment: CommentItem, parentCommentId: string) {
    setDraft(`@${comment.user.username} `)
    setReplyTarget(comment)
    setReplyParentId(parentCommentId)
    setEditTarget(null)
  }

  function editCommentInline(comment: CommentItem) {
    setDraft(comment.content)
    setEditTarget(comment)
    setReplyTarget(null)
    setReplyParentId(null)
  }

  function cancelComposerMode() {
    setDraft('')
    setReplyTarget(null)
    setReplyParentId(null)
    setEditTarget(null)
  }

  return (
    <section ref={commentsRef} className={`post-comments-section ${variant === 'page' ? 'post-comments-page' : ''}`}>
      {variant === 'page' ? <div className="comments-inline-divider" /> : null}
      <div className="comments-list">
        {post.comments.map((comment) => (
          <CommentRow key={comment.id} comment={comment} onReply={replyToComment} onEdit={editCommentInline} />
        ))}
        {!post.comments.length ? (
          <div className="empty-comments">
            <MessageCircle size={26} />
            <p>No comments yet. Start the conversation.</p>
          </div>
        ) : null}
      </div>
      {replyTarget ? (
        <div className="replying-banner">
          <span>Replying to @{replyTarget.user.username}</span>
          <button type="button" onClick={cancelComposerMode}>Cancel</button>
        </div>
      ) : null}
      <div className="comment-composer">
        {editTarget ? (
          <button className="composer-cancel" type="button" onClick={cancelComposerMode} aria-label="Cancel edit">
            <X size={16} />
          </button>
        ) : null}
        <EmojiPicker onPick={(emoji) => setDraft((value) => `${value}${emoji}`)} />
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={editTarget ? 'Edit your comment...' : 'Add a comment...'}
        />
        <button type="button" disabled={!draft.trim()} onClick={addComment}>
          {editTarget ? 'Edit' : 'Post'}
        </button>
      </div>
    </section>
  )
}

function PostModal({ post, onClose }: { post: PostItem; onClose: () => void }) {
  const {
    currentUser,
    reportPostById,
    reportUserById,
  } = useApp()
  const navigate = useNavigate()
  const [mediaIndex, setMediaIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [userReportOpen, setUserReportOpen] = useState(false)
  const menuRef = useOutsideClose<HTMLDivElement>(menuOpen, () => setMenuOpen(false))
  const activeMedia = post.media[mediaIndex] ?? post.media[0]
  const hasMedia = post.media.length > 0
  const postUrl = `${window.location.origin}/p/${post.id}`

  function copyPostLink() {
    void navigator.clipboard?.writeText(postUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className={`post-modal ${hasMedia ? '' : 'post-modal-text-only'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose}>
          <X />
        </button>
        {hasMedia ? (
          <div className="modal-media">
            {activeMedia.type === 'video' ? (
              <video src={activeMedia.url} controls />
            ) : (
              <img src={activeMedia.url} alt={post.caption} />
            )}
            {post.media.length > 1 ? (
              <div className="media-strip">
                {post.media.map((item, index) => (
                  <button
                    key={`${item.url}-${index}`}
                    type="button"
                    className={index === mediaIndex ? 'active' : ''}
                    onClick={() => setMediaIndex(index)}
                  >
                    {item.type === 'video' ? <Video size={16} /> : <img src={item.url} alt="" />}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="modal-discussion">
          <header className="modal-header">
            <UserProfileLink user={post.author} className="profile-inline profile-link">
              <Avatar user={post.author} />
              <div>
                <div className="name-line">
                  <strong>{post.author.displayName}</strong>
                  <ProviderBadges user={post.author} compact />
                </div>
                <span>@{post.author.username}</span>
              </div>
            </UserProfileLink>
            <div className="post-menu-wrap" ref={menuRef}>
              <button className="icon-button" type="button" onClick={() => setMenuOpen((value) => !value)}>
                <MoreHorizontal />
              </button>
              {menuOpen ? (
                <div className="popover-menu modal-post-menu">
                  {currentUser?.id !== post.author.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setReportOpen(true)
                          setMenuOpen(false)
                        }}
                      >
                        <Flag size={16} /> Report post
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserReportOpen(true)
                          setMenuOpen(false)
                        }}
                      >
                        <User size={16} /> Report user
                      </button>
                    </>
                  ) : null}
                  <button type="button" onClick={() => { navigate(`/p/${post.id}`); setMenuOpen(false) }}>
                    <ExternalLink size={16} /> Go to post
                  </button>
                  <button type="button" onClick={() => { copyPostLink(); setMenuOpen(false) }}>
                    <Copy size={16} /> {copied ? 'Copied' : 'Copy link'}
                  </button>
                </div>
              ) : null}
            </div>
          </header>
          <div className="caption-block">
            <strong>{post.author.displayName}</strong>
            <span>{post.caption}</span>
            <div className="hashtag-row">{post.hashtags.map((tag) => `#${tag}`).join(' ')}</div>
          </div>
          <PostCommentsSection post={post} />
        </div>
      </section>
      {reportOpen ? (
        <ReportDialog
          title="Report post"
          onClose={() => setReportOpen(false)}
          onSubmit={(reason, description) => reportPostById(post.id, reason, description)}
        />
      ) : null}
      {userReportOpen ? (
        <ReportDialog
          title="Report user"
          onClose={() => setUserReportOpen(false)}
          onSubmit={(reason, description) => reportUserById(post.author.id, reason, description)}
        />
      ) : null}
    </div>
  )
}

function CommentRow({
  comment,
  onReply,
  onEdit,
}: {
  comment: CommentItem
  onReply: (comment: CommentItem, parentCommentId: string) => void
  onEdit: (comment: CommentItem) => void
}) {
  const { currentUser, deleteComment, reportComment, toggleCommentLike } = useApp()
  const [liked, setLiked] = useState(comment.liked)
  const [likes, setLikes] = useState(comment.likes)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reporting, setReporting] = useState(false)
  const menuRef = useOutsideClose<HTMLDivElement>(menuOpen, () => setMenuOpen(false))
  const isMine = currentUser?.id === comment.user.id

  function toggleLike() {
    setLiked((value) => !value)
    setLikes((value) => (liked ? value - 1 : value + 1))
    void toggleCommentLike(comment.id, liked).catch(() => {
      setLiked(liked)
      setLikes(likes)
    })
  }

  return (
    <div className="comment-row">
      <UserProfileLink user={comment.user} className="profile-link">
        <Avatar user={comment.user} size="sm" />
      </UserProfileLink>
      <div>
        <p>
          <UserProfileLink user={comment.user} className="inline-profile-link">
            <strong>{comment.user.username}</strong>
          </UserProfileLink>{' '}
          {comment.content}
        </p>
        <div className="comment-meta">
          <span>{likes} likes</span>
          <button type="button" onClick={() => onReply(comment, comment.id)}>
            <Reply size={13} /> Reply
          </button>
        </div>
        {comment.replies.map((reply) => (
          <ReplyRow
            key={reply.id}
            reply={reply}
            parentCommentId={comment.id}
            onReply={onReply}
            onEdit={onEdit}
          />
        ))}
      </div>
      <div className="comment-actions" ref={menuRef}>
        <button type="button" onClick={toggleLike} className={liked ? 'liked' : ''}>
          <Heart size={16} className={liked ? 'fill-icon' : ''} />
        </button>
        <button type="button" className="comment-more" onClick={() => setMenuOpen((value) => !value)}>
          <MoreHorizontal size={16} />
        </button>
        {menuOpen ? (
          <div className="popover-menu comment-menu">
            {isMine ? (
              <>
                <button type="button" onClick={() => { onEdit(comment); setMenuOpen(false) }}>
                  <Settings size={16} /> Edit
                </button>
                <button type="button" onClick={() => { setDeleting(true); setMenuOpen(false) }}>
                  <X size={16} /> Delete
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { setReporting(true); setMenuOpen(false) }}>
                <Flag size={16} /> Report
              </button>
            )}
          </div>
        ) : null}
      </div>
      {deleting ? (
        <ConfirmDialog
          title="Delete comment?"
          body="This comment will be removed from the conversation. Replies under it will be hidden too."
          confirmLabel="Delete"
          onClose={() => setDeleting(false)}
          onConfirm={() => deleteComment(comment.id)}
        />
      ) : null}
      {reporting ? (
        <ReportDialog
          title="Report comment"
          onClose={() => setReporting(false)}
          onSubmit={(reason, description) => reportComment(comment.id, reason, description)}
        />
      ) : null}
    </div>
  )
}

function ReplyRow({
  reply,
  parentCommentId,
  onReply,
  onEdit,
}: {
  reply: CommentItem
  parentCommentId: string
  onReply: (comment: CommentItem, parentCommentId: string) => void
  onEdit: (comment: CommentItem) => void
}) {
  const { currentUser, deleteComment, reportComment, toggleCommentLike } = useApp()
  const [liked, setLiked] = useState(reply.liked)
  const [likes, setLikes] = useState(reply.likes)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reporting, setReporting] = useState(false)
  const menuRef = useOutsideClose<HTMLDivElement>(menuOpen, () => setMenuOpen(false))
  const isMine = currentUser?.id === reply.user.id

  function toggleLike() {
    setLiked((value) => !value)
    setLikes((value) => (liked ? Math.max(0, value - 1) : value + 1))
    void toggleCommentLike(reply.id, liked).catch(() => {
      setLiked(liked)
      setLikes(likes)
    })
  }

  return (
    <div className="reply-row">
      <div className="reply-copy">
        <UserProfileLink user={reply.user} className="inline-profile-link">
          <strong>{reply.user.username}</strong>
        </UserProfileLink>{' '}
        {reply.content}
        <div className="comment-meta">
          <span>{likes} likes</span>
          <button type="button" onClick={() => onReply(reply, parentCommentId)}>
            <Reply size={12} /> Reply
          </button>
        </div>
      </div>
      <div className="comment-actions reply-actions" ref={menuRef}>
        <button type="button" onClick={toggleLike} className={liked ? 'liked' : ''}>
          <Heart size={15} className={liked ? 'fill-icon' : ''} />
        </button>
        <button type="button" className="comment-more" onClick={() => setMenuOpen((value) => !value)}>
          <MoreHorizontal size={15} />
        </button>
        {menuOpen ? (
          <div className="popover-menu comment-menu">
            {isMine ? (
              <>
                <button type="button" onClick={() => { onEdit(reply); setMenuOpen(false) }}>
                  <Settings size={16} /> Edit
                </button>
                <button type="button" onClick={() => { setDeleting(true); setMenuOpen(false) }}>
                  <X size={16} /> Delete
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { setReporting(true); setMenuOpen(false) }}>
                <Flag size={16} /> Report
              </button>
            )}
          </div>
        ) : null}
      </div>
      {deleting ? (
        <ConfirmDialog
          title="Delete reply?"
          body="This reply will be removed from the conversation."
          confirmLabel="Delete"
          onClose={() => setDeleting(false)}
          onConfirm={() => deleteComment(reply.id)}
        />
      ) : null}
      {reporting ? (
        <ReportDialog
          title="Report reply"
          onClose={() => setReporting(false)}
          onSubmit={(reason, description) => reportComment(reply.id, reason, description)}
        />
      ) : null}
    </div>
  )
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  title: string
  body: string
  confirmLabel: string
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="action-dialog confirm-dialog" onClick={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        <p>{body}</p>
        {error ? <span className="dialog-error">{error}</span> : null}
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="danger-button" disabled={submitting} onClick={submit}>
            {submitting ? 'Working...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}

function ReportDialog({
  title,
  onClose,
  onSubmit,
}: {
  title: string
  onClose: () => void
  onSubmit: (reason: string, description?: string) => Promise<void>
}) {
  const reasons = ['Harassment or hate', 'Spam or scam', 'Inappropriate content', 'False information', 'Other']
  const [reason, setReason] = useState(reasons[0])
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(reason, description.trim() || undefined)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit report')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section className="action-dialog report-dialog" onClick={(event) => event.stopPropagation()}>
        {submitted ? (
          <>
            <CheckCircle size={34} />
            <h2>Report submitted</h2>
            <p>Thanks. The moderation team can now review it with your reason and notes.</p>
            <div className="dialog-actions">
              <button type="button" className="primary-button" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{title}</h2>
            <label>
              Reason
              <select value={reason} onChange={(event) => setReason(event.target.value)}>
                {reasons.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Details
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add context for the moderation team..."
              />
            </label>
            {error ? <span className="dialog-error">{error}</span> : null}
            <div className="dialog-actions">
              <button type="button" className="secondary-button" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="primary-button" disabled={submitting} onClick={submit}>
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </>
        )}
      </section>
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

function AdminBackofficePage() {
  const { currentUser, logout } = useApp()
  const navigate = useNavigate()
  const isSuperadmin = currentUser?.role === 'SUPERADMIN'
  const [tab, setTab] = useState<'dashboard' | 'users' | 'providerRequests' | 'reports' | 'tickets' | 'logs'>('dashboard')
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [reports, setReports] = useState<ApiReport[]>([])
  const [providerRequests, setProviderRequests] = useState<AdminProviderRequest[]>([])
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [detailModal, setDetailModal] = useState<null | { kind: 'report' | 'provider' | 'ticket' | 'user'; id: string }>(null)
  const [reportDetail, setReportDetail] = useState<ApiReport | null>(null)
  const [providerDetail, setProviderDetail] = useState<AdminProviderRequest | null>(null)
  const [ticketDetail, setTicketDetail] = useState<AdminTicket | null>(null)
  const [userDetail, setUserDetail] = useState<AdminUserRow | null>(null)
  const [note, setNote] = useState('')
  const [action, setAction] = useState('NO_ACTION')
  const [ticketReply, setTicketReply] = useState('')
  const [newAdminUserId, setNewAdminUserId] = useState('')

  async function loadAll() {
    const [usersResponse, reportsResponse, providerResponse, ticketResponse, logsResponse, statsResponse] = await Promise.all([
      getAdminUsers(),
      getAdminReports(),
      getAdminProviderRequests(),
      getAdminTickets(),
      isSuperadmin ? getSuperadminLogs(120) : getAdminLogs(120),
      isSuperadmin ? getSuperadminStats() : getAdminStats(),
    ])

    setUsers(usersResponse.users)
    setReports(reportsResponse.reports)
    setProviderRequests(providerResponse.providerRequests)
    setTickets(ticketResponse.tickets)
    setLogs(logsResponse.logs)
    setStats(statsResponse.stats)
  }

  useEffect(() => {
    void loadAll().catch((error) => setStatus(error instanceof Error ? error.message : 'Could not load admin data'))
  }, [isSuperadmin])

  function targetName(report: ApiReport) {
    if (report.postId) return 'Post'
    if (report.commentId) return 'Comment'
    if (report.serviceId) return 'Service'
    if (report.reportedUserId) return 'User'
    return 'Content'
  }

  async function handleBlock(userId: string) {
    await blockAdminUser(userId)
    await loadAll()
  }

  async function handleUnblock(userId: string) {
    await unblockAdminUser(userId)
    await loadAll()
  }

  async function handlePromote() {
    if (!newAdminUserId) return
    await promoteAdminBySuperadmin(newAdminUserId)
    await loadAll()
    setNewAdminUserId('')
  }

  async function handleRoleChange(userId: string, role: 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPERADMIN') {
    await updateUserRoleBySuperadmin(userId, role)
    await loadAll()
  }

  async function handleDeleteUser(userId: string) {
    await deleteUserBySuperadmin(userId)
    await loadAll()
  }

  async function handleProviderRequest(requestId: string, next: 'REVIEWING' | 'APPROVED' | 'REJECTED') {
    if (next === 'REVIEWING') await reviewAdminProviderRequest(requestId)
    if (next === 'APPROVED') await approveAdminProviderRequest(requestId)
    if (next === 'REJECTED') await rejectAdminProviderRequest(requestId)
    await loadAll()
  }

  async function openProvider(requestId: string) {
    await reviewAdminProviderRequest(requestId)
    const response = await getAdminProviderRequest(requestId)
    setProviderDetail(response.providerRequest)
    setDetailModal({ kind: 'provider', id: requestId })
    await loadAll()
  }

  async function openReport(reportId: string) {
    await markAdminReportReviewing(reportId)
    const response = await getAdminReport(reportId)
    setReportDetail(response.report)
    setNote(response.report.moderationNote ?? '')
    setAction(response.report.actionTaken ?? 'NO_ACTION')
    setDetailModal({ kind: 'report', id: reportId })
    await loadAll()
  }

  async function openTicket(ticketId: string) {
    const response = await getAdminTicket(ticketId)
    setTicketDetail(response.ticket)
    setDetailModal({ kind: 'ticket', id: ticketId })
  }

  async function handleResolveReport() {
    if (!reportDetail) return
    await resolveAdminReport(reportDetail.id, { moderationNote: note, actionTaken: action })
    setDetailModal(null)
    await loadAll()
  }

  async function handleRejectReport() {
    if (!reportDetail) return
    await rejectAdminReport(reportDetail.id, { moderationNote: note, actionTaken: 'NO_ACTION' })
    setDetailModal(null)
    await loadAll()
  }

  async function handleTicketUpdate(payload: { status?: AdminTicket['status']; priority?: AdminTicket['priority']; assignToMe?: boolean }) {
    if (!ticketDetail) return
    await updateAdminTicketStatus(ticketDetail.id, payload)
    const response = await getAdminTicket(ticketDetail.id)
    setTicketDetail(response.ticket)
    await loadAll()
  }

  async function handleTicketReply() {
    if (!ticketDetail || !ticketReply.trim()) return
    await replyAdminTicket(ticketDetail.id, ticketReply.trim())
    setTicketReply('')
    const response = await getAdminTicket(ticketDetail.id)
    setTicketDetail(response.ticket)
    await loadAll()
  }

  const chartRows = stats
    ? [
        { label: 'Users', value: stats.totalUsers },
        { label: 'Posts', value: stats.totalPosts },
        { label: 'Services', value: stats.totalServices },
        { label: 'Reports', value: stats.totalReports },
        { label: 'Tickets', value: stats.totalTickets },
        { label: 'Reviews', value: stats.totalReviews },
      ]
    : []
  const chartMax = Math.max(...chartRows.map((row) => row.value), 1)

  return (
    <section className="admin-page">
      <aside className="admin-sidebar">
        <div>
          <p className="eyebrow">Momento</p>
          <h1>Backoffice</h1>
          <span>{currentUser?.role === 'SUPERADMIN' ? 'Super admin' : 'Admin'} access</span>
        </div>
        <button type="button" onClick={() => { logout(); navigate('/admin/login') }}>
          <LogOut size={17} /> Log out
        </button>
      </aside>
      <main className="admin-workspace">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Backoffice</p>
            <h2>Administration center</h2>
          </div>
          <span>{reports.filter((report) => report.status === 'PENDING').length} pending reports</span>
        </header>
        <div className="segmented-tabs">
          <button className={tab === 'dashboard' ? 'active' : ''} type="button" onClick={() => setTab('dashboard')}>Dashboard</button>
          <button className={tab === 'users' ? 'active' : ''} type="button" onClick={() => setTab('users')}>Users</button>
          <button className={tab === 'providerRequests' ? 'active' : ''} type="button" onClick={() => setTab('providerRequests')}>Provider requests</button>
          <button className={tab === 'reports' ? 'active' : ''} type="button" onClick={() => setTab('reports')}>Reports</button>
          <button className={tab === 'tickets' ? 'active' : ''} type="button" onClick={() => setTab('tickets')}>Tickets</button>
          <button className={tab === 'logs' ? 'active' : ''} type="button" onClick={() => setTab('logs')}>Logs</button>
        </div>
        {status ? <p className="ticket-status">{status}</p> : null}

        {tab === 'dashboard' ? (
          <section className="admin-grid admin-grid-wide">
            <div className="admin-report-detail">
              <h3>Platform stats</h3>
              <div className="admin-context-grid">
                <article><span>Total users</span><strong>{stats?.totalUsers ?? 0}</strong></article>
                <article><span>Providers</span><strong>{stats?.totalProviders ?? 0}</strong></article>
                <article><span>Posts</span><strong>{stats?.totalPosts ?? 0}</strong></article>
                <article><span>Services</span><strong>{stats?.totalServices ?? 0}</strong></article>
                <article><span>Reports</span><strong>{stats?.totalReports ?? 0}</strong></article>
                <article><span>Tickets</span><strong>{stats?.totalTickets ?? 0}</strong></article>
              </div>
            </div>
            <div className="admin-report-detail">
              <h3>Volume chart</h3>
              <div className="admin-bar-chart">
                {chartRows.map((row) => (
                  <article key={row.label}>
                    <span>{row.label}</span>
                    <div><i style={{ width: `${Math.max(6, (row.value / chartMax) * 100)}%` }} /></div>
                    <strong>{row.value}</strong>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {tab === 'users' ? (
          <section className="admin-report-detail">
            {isSuperadmin ? (
              <div className="dialog-actions">
                <select value={newAdminUserId} onChange={(event) => setNewAdminUserId(event.target.value)}>
                  <option value="">Select user to promote to admin</option>
                  {users.filter((user) => user.role !== 'ADMIN' && user.role !== 'SUPERADMIN').map((user) => (
                    <option key={user.id} value={user.id}>@{user.username}</option>
                  ))}
                </select>
                <button className="primary-button" type="button" disabled={!newAdminUserId} onClick={() => void handlePromote()}>Create admin</button>
              </div>
            ) : null}
            <div className="admin-table">
              {users.map((user) => (
                <article key={user.id}>
                  <div>
                    <strong>{user.firstName} {user.lastName}</strong>
                    <span>@{user.username} - {user.role} - {user.accountStatus}</span>
                  </div>
                  <div className="dialog-actions">
                    {isSuperadmin ? <button className="secondary-button" type="button" onClick={() => { setUserDetail(user); setDetailModal({ kind: 'user', id: user.id }) }}><Eye size={15} /></button> : null}
                    {user.accountStatus === 'BLOCKED' ? (
                      <button className="secondary-button" type="button" onClick={() => void handleUnblock(user.id)}><UserX size={15} /></button>
                    ) : (
                      <button className="secondary-button" type="button" onClick={() => void handleBlock(user.id)}><UserX size={15} /></button>
                    )}
                    {isSuperadmin ? (
                      <select aria-label="Edit role" value={user.role} onChange={(event) => void handleRoleChange(user.id, event.target.value as 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPERADMIN')}>
                        <option value="USER">USER</option>
                        <option value="PROVIDER">PROVIDER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPERADMIN">SUPERADMIN</option>
                      </select>
                    ) : null}
                    {isSuperadmin && user.role !== 'SUPERADMIN' ? (
                      <button className="danger-button" type="button" onClick={() => void handleDeleteUser(user.id)}><Trash2 size={15} /></button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === 'providerRequests' ? (
          <section className="admin-report-detail">
            <div className="admin-table">
              {providerRequests.map((request) => (
                <article key={request.id}>
                  <div>
                    <strong>{request.professionalName}</strong>
                    <span>@{request.user.username} - {request.city} - {request.status}</span>
                  </div>
                  <div className="dialog-actions">
                    <button className="secondary-button" type="button" onClick={() => void openProvider(request.id)}>View</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === 'reports' ? (
          <section className="admin-report-detail">
            <div className="admin-table">
              {reports.map((report) => (
                <article key={report.id}>
                  <div>
                    <strong>{targetName(report)} report</strong>
                    <span>{report.reason}</span>
                    <small>{report.status}</small>
                  </div>
                  <div className="dialog-actions">
                    <button className="secondary-button" type="button" onClick={() => void openReport(report.id)}>View</button>
                  </div>
                </article>
              ))}
              {!reports.length ? <p className="empty-profile-note">No reports yet.</p> : null}
            </div>
          </section>
        ) : null}

        {tab === 'tickets' ? (
          <section className="admin-report-detail">
            <div className="admin-table">
              {tickets.map((ticket) => (
                <article key={ticket.id}>
                  <div>
                    <strong>{ticket.subject}</strong>
                    <span>{ticket.category} - {ticket.priority}</span>
                    <small>{ticket.status}</small>
                  </div>
                  <div className="dialog-actions">
                    <button className="secondary-button" type="button" onClick={() => void openTicket(ticket.id)}>View</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {tab === 'logs' ? (
          <section className="admin-report-detail">
            <div className="admin-table">
              {logs.map((log) => (
                <article key={log.id}>
                  <div>
                    <strong>{log.action}</strong>
                    <span>{log.entityType} - {log.description}</span>
                    <small>{new Date(log.createdAt).toLocaleString()}</small>
                  </div>
                  <span>{log.actor ? `@${log.actor.username}` : 'System'}</span>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      {detailModal?.kind === 'report' && reportDetail ? (
        <div className="action-dialog-backdrop" onClick={() => setDetailModal(null)}>
          <section className="action-dialog report-dialog admin-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <div><p className="eyebrow">{targetName(reportDetail)}</p><h2>{reportDetail.reason}</h2></div>
              <button type="button" onClick={() => setDetailModal(null)}><X size={17} /></button>
            </header>
            <p>{reportDetail.description || 'No extra details provided.'}</p>
            {reportDetail.comment ? <article className="admin-context-card"><strong>Reported comment</strong><p>{reportDetail.comment.content}</p></article> : null}
            {(reportDetail as any).comment?.post ? <article className="admin-context-card"><strong>Comment post</strong><p>{(reportDetail as any).comment.post.content}</p></article> : null}
            {reportDetail.post ? <article className="admin-context-card"><strong>Reported post</strong><p>{reportDetail.post.content}</p></article> : null}
            {reportDetail.service ? <article className="admin-context-card"><strong>Reported service</strong><p>{reportDetail.service.title}</p></article> : null}
            {reportDetail.reportedUser ? <article className="admin-context-card"><strong>Reported user</strong><p>@{reportDetail.reportedUser.username} ({reportDetail.reportedUser.firstName} {reportDetail.reportedUser.lastName})</p></article> : null}
            <label>Action<select value={action} onChange={(event) => setAction(event.target.value)}><option value="NO_ACTION">No action</option><option value="WARN_USER">Warn user</option><option value="HIDE_POST">Hide post</option><option value="DELETE_COMMENT">Delete comment</option><option value="HIDE_SERVICE">Hide service</option><option value="BAN_USER">Ban user</option></select></label>
            <label>Moderation note<textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain this decision." /></label>
            <div className="dialog-actions"><button className="danger-button" type="button" onClick={() => void handleRejectReport()}>Reject</button><button className="primary-button" type="button" onClick={() => void handleResolveReport()}>Resolve</button></div>
          </section>
        </div>
      ) : null}
      {detailModal?.kind === 'provider' && providerDetail ? (
        <div className="action-dialog-backdrop" onClick={() => setDetailModal(null)}>
          <section className="action-dialog report-dialog admin-modal" onClick={(event) => event.stopPropagation()}>
            <header><div><p className="eyebrow">Provider request</p><h2>{providerDetail.professionalName}</h2></div><button type="button" onClick={() => setDetailModal(null)}><X size={17} /></button></header>
            <article className="admin-context-card"><strong>User</strong><p>@{providerDetail.user.username} ({providerDetail.user.firstName} {providerDetail.user.lastName})</p></article>
            <article className="admin-context-card"><strong>Description</strong><p>{providerDetail.professionalDescription}</p></article>
            <article className="admin-context-card"><strong>Details</strong><p>{providerDetail.city} - {providerDetail.phone} - CIN: {providerDetail.cinNumber}</p></article>
            {providerDetail.additionalInfo ? <article className="admin-context-card"><strong>Additional info</strong><p>{providerDetail.additionalInfo}</p></article> : null}
            <div className="dialog-actions"><button className="danger-button" type="button" onClick={() => void handleProviderRequest(providerDetail.id, 'REJECTED')}>Reject</button><button className="primary-button" type="button" onClick={() => void handleProviderRequest(providerDetail.id, 'APPROVED')}>Approve</button></div>
          </section>
        </div>
      ) : null}
      {detailModal?.kind === 'ticket' && ticketDetail ? (
        <div className="action-dialog-backdrop" onClick={() => setDetailModal(null)}>
          <section className="action-dialog report-dialog admin-modal" onClick={(event) => event.stopPropagation()}>
            <header><div><p className="eyebrow">Support ticket</p><h2>{ticketDetail.subject}</h2></div><button type="button" onClick={() => setDetailModal(null)}><X size={17} /></button></header>
            <p>{ticketDetail.description}</p>
            <article className="admin-context-card"><strong>User</strong><p>@{ticketDetail.user?.username}</p></article>
            {ticketDetail.relatedComment ? <article className="admin-context-card"><strong>Related comment</strong><p>{ticketDetail.relatedComment.content}</p></article> : null}
            {ticketDetail.relatedPost ? <article className="admin-context-card"><strong>Related post</strong><p>{ticketDetail.relatedPost.content}</p></article> : null}
            <div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => void handleTicketUpdate({ assignToMe: true })}>Assign me</button><button className="secondary-button" type="button" onClick={() => void handleTicketUpdate({ status: 'IN_PROGRESS' })}>In progress</button><button className="primary-button" type="button" onClick={() => void handleTicketUpdate({ status: 'RESOLVED' })}>Resolve</button></div>
            <label>Reply<textarea value={ticketReply} onChange={(event) => setTicketReply(event.target.value)} placeholder="Reply to this ticket..." /></label>
            <div className="dialog-actions"><button className="primary-button" type="button" onClick={() => void handleTicketReply()}>Send reply</button></div>
          </section>
        </div>
      ) : null}
      {detailModal?.kind === 'user' && userDetail ? (
        <div className="action-dialog-backdrop" onClick={() => setDetailModal(null)}>
          <section className="action-dialog report-dialog admin-modal" onClick={(event) => event.stopPropagation()}>
            <header><div><p className="eyebrow">User</p><h2>{userDetail.firstName} {userDetail.lastName}</h2></div><button type="button" onClick={() => setDetailModal(null)}><X size={17} /></button></header>
            <article className="admin-context-card"><strong>Username</strong><p>@{userDetail.username}</p></article>
            <article className="admin-context-card"><strong>Email</strong><p>{userDetail.email}</p></article>
            <article className="admin-context-card"><strong>Role</strong><p>{userDetail.role}</p></article>
            <article className="admin-context-card"><strong>Status</strong><p>{userDetail.accountStatus}</p></article>
            <div className="dialog-actions"><button className="secondary-button" type="button" onClick={() => setDetailModal(null)}>Cancel</button></div>
          </section>
        </div>
      ) : null}
    </section>
  )
}

function MessagesWorkspace({ compact = false }: { compact?: boolean }) {
  const { conversations, sendMessage, loadConversationMessages } = useApp()
  const location = useLocation()
  const requestedConversationId = (location.state as { conversationId?: string } | null)?.conversationId
  const [activeId, setActiveId] = useState<string | null>(requestedConversationId ?? (compact ? conversations[0]?.id ?? null : null))
  const [draft, setDraft] = useState('')
  const active = conversations.find((conversation) => conversation.id === activeId)
  const messageStreamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeId && compact && conversations[0]) setActiveId(conversations[0].id)
  }, [activeId, compact, conversations])

  useEffect(() => {
    if (requestedConversationId && conversations.some((conversation) => conversation.id === requestedConversationId)) {
      setActiveId(requestedConversationId)
    }
  }, [requestedConversationId, conversations])

  useEffect(() => {
    if (!activeId) return
    void loadConversationMessages(activeId)
  }, [activeId])

  useEffect(() => {
    if (messageStreamRef.current && active) {
      messageStreamRef.current.scrollTop = messageStreamRef.current.scrollHeight
    }
  }, [active?.messages])

  function submitMessage() {
    if (!active || !draft.trim()) return
    sendMessage(active.id, draft.trim())
    setDraft('')
  }

  if (!conversations.length) {
    return (
      <section className={`messages-workspace ${compact ? 'compact-messages' : ''}`}>
        <div className="chat-panel no-conversations">
          <div className="empty-state fill-empty">
            <MessageCircle size={34} />
            <h2>Choose a conversation or send a message to start chatting.</h2>
          </div>
        </div>
      </section>
    )
  }

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
            <div ref={messageStreamRef} className="message-stream">
              {active.messages.map((message) => (
                <p key={message.id} className={message.fromMe ? 'mine' : ''}>
                  {message.text}
                  <span>{message.time}</span>
                </p>
              ))}
            </div>
            <form className="message-compose" onSubmit={(event) => event.preventDefault()}>
              <EmojiPicker onPick={(emoji) => setDraft((value) => `${value}${emoji}`)} />
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message..."
              />
              <button type="button" disabled={!draft.trim()} onClick={submitMessage}>
                <Send size={17} />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <MessageCircle size={42} />
            <h2>Choose a conversation or send a msg to start chatting.</h2>
          </div>
        )}
      </div>
    </section>
  )
}

function SearchPage() {
  const { users, services, posts } = useApp()
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
  const resultPosts = posts.filter((post) =>
    `${post.caption} ${post.hashtags.join(' ')}`.toLowerCase().includes(normalized),
  )

  const groups = normalized
    ? [
    { key: 'users', title: 'Users', items: resultUsers, show: mode === 'all' || mode === 'users' },
    {
      key: 'services',
      title: 'Services',
      items: resultServices,
      show: mode === 'all' || mode === 'services',
    },
    { key: 'posts', title: 'Posts', items: resultPosts, show: mode === 'all' || mode === 'posts' },
  ].filter((group) => group.show && group.items.length > 0)
    : []

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
        {(mode === 'users' || mode === 'all') && normalized && resultUsers.length > 0 ? (
          <label className="toggle-line">
            <input
              type="checkbox"
              checked={providersOnly}
              onChange={(event) => setProvidersOnly(event.target.checked)}
            />
            Providers only
          </label>
        ) : null}
        {!normalized ? (
          <div className="empty-state search-idle">
            <Search size={34} />
            <h2>Start typing to search</h2>
            <p>Search users, providers, services, posts, hashtags, or categories.</p>
          </div>
        ) : groups.length === 0 ? (
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
    return <MiniProfile user={item} action="View" />
  }
  if ('title' in item) {
    return <ServiceMini service={item} />
  }
  return (
    <Link to={`/p/${item.id}`} className={`search-post-result ${item.media.length ? '' : 'search-post-text-only'}`}>
      {item.media.length ? <img src={item.media[0]?.url} alt="" /> : null}
      <div>
        <strong>{item.author.displayName}</strong>
        <span>{item.caption}</span>
      </div>
    </Link>
  )
}

function ExplorePage() {
  const { services } = useApp()
  return (
    <AppShell>
      <section className="explore-page">
        <div className="page-heading">
          <p className="eyebrow">Services</p>
          <h1>Explore trusted creative services.</h1>
          <p>Browse provider offers, compare details, open service pages, and leave reviews after working with someone.</p>
        </div>
        <div className="explore-grid">
          {services.map((service) => (
            <Link key={service.id} to={`/services/${service.id}`} className="explore-tile service-tile">
              <img src={service.image} alt={service.title} />
              <span>{service.title}</span>
              <div className="explore-tile-meta">
                <strong>{service.category}</strong>
                <small>{service.city || 'Morocco'} {service.price ? `· from ${service.price} MAD` : ''}</small>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  )
}

function ServiceDetailPage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { currentUser, services, startConversation, updateService, deleteService } = useApp()
  const service = services.find((item) => item.id === serviceId)
  const [reviews, setReviews] = useState<ServiceReviewItem[]>([])
  const [visibleReviews, setVisibleReviews] = useState(3)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [editingService, setEditingService] = useState(false)
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!serviceId) return
    getServiceReviews(serviceId)
      .then((response) => setReviews(response.reviews.map(mapApiReview)))
      .catch(() => setReviews([]))
  }, [serviceId])

  async function messageProvider() {
    if (!service) return
    try {
      const conversationId = await startConversation(service.provider.id)
      if (conversationId) navigate('/messages', { state: { conversationId } })
    } catch {}
  }

  if (!service) {
    return (
      <AppShell>
        <section className="utility-page">
          <div className="empty-state fill-empty">
            <BriefcaseBusiness size={34} />
            <h2>Service not found</h2>
            <p>This service may have been removed.</p>
          </div>
        </section>
      </AppShell>
    )
  }

  const visibleReviewItems = reviews.slice(0, visibleReviews)
  const providerBio =
    service.provider.bio.length > 150 ? `${service.provider.bio.slice(0, 150).trim()}...` : service.provider.bio
  const serviceImages = service.images.length ? service.images : [{ id: 'fallback', url: service.image }]
  const activeImage = serviceImages[Math.min(activeImageIndex, serviceImages.length - 1)] ?? serviceImages[0]
  const isOwnService = currentUser?.id === service.provider.id
  const serviceMenuRef = useOutsideClose<HTMLDivElement>(serviceMenuOpen, () => setServiceMenuOpen(false))

  async function removeService() {
    if (!service) return
    await deleteService(service.id)
    navigate('/profile/me')
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!serviceId || !currentUser) return
    try {
      setSubmittingReview(true)
      await createServiceReview(serviceId, { rating: reviewRating, comment: reviewComment.trim() || undefined })
      const response = await getServiceReviews(serviceId)
      setReviews(response.reviews.map(mapApiReview))
      setReviewComment('')
      setReviewRating(5)
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <AppShell>
      <section className="service-detail-page">
        <div className="service-detail-hero">
          <div className="service-media-gallery">
            <img src={activeImage.url} alt={service.title} />
            {serviceImages.length > 1 ? (
              <div className="service-thumb-row">
                {serviceImages.map((image, index) => (
                  <button
                    key={image.id}
                    className={index === activeImageIndex ? 'active' : ''}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`View service picture ${index + 1}`}
                  >
                    <img src={image.url} alt="" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="service-hero-copy">
            <div className="service-kicker-row">
              <span>{service.subcategory}</span>
              <span><Star size={16} /> {service.rating ? service.rating.toFixed(1) : 'New'}</span>
              {isOwnService ? (
                <div className="service-owner-menu" ref={serviceMenuRef}>
                  <button type="button" onClick={() => setServiceMenuOpen((value) => !value)} aria-label="Service options">
                    <MoreHorizontal size={19} />
                  </button>
                  {serviceMenuOpen ? (
                    <div className="popover-menu service-options-menu">
                      <button type="button" onClick={() => { setEditingService(true); setServiceMenuOpen(false) }}>
                        Edit service
                      </button>
                      <button type="button" onClick={() => void removeService()}>
                        Delete service
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
            <h1>{service.title}</h1>
            <p className="service-category-label">{service.category}</p>
            <p className="service-description">{service.description}</p>
            {service.keywords.length ? (
              <div className="hashtag-row">{service.keywords.map((keyword) => `#${keyword}`).join(' ')}</div>
            ) : null}
            <div className="service-facts">
              <span>{reviews.length || service.reviewsCount} reviews</span>
              {service.city ? <span><MapPin size={16} /> {service.city}</span> : null}
              {service.price ? <span>Starting at {service.price.toLocaleString()} MAD</span> : null}
            </div>
          </div>
        </div>
        <div className={`service-detail-grid ${isOwnService ? 'service-detail-grid-wide' : ''}`}>
          <section className="settings-card service-reviews-card">
            <h2>Reviews</h2>
            {visibleReviewItems.map((review) => (
              <article key={review.id} className="review-row">
                <UserProfileLink user={review.user} className="profile-link">
                  <Avatar user={review.user} size="sm" />
                </UserProfileLink>
                <div>
                  <UserProfileLink user={review.user} className="inline-profile-link">
                    <strong>{review.user.displayName}</strong>
                  </UserProfileLink>
                  <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                  {review.comment ? <p>{review.comment}</p> : null}
                </div>
              </article>
            ))}
            {!reviews.length ? <p className="empty-profile-note">No reviews yet.</p> : null}
            {visibleReviews < reviews.length ? (
              <button className="see-more-button" type="button" onClick={() => setVisibleReviews((current) => current + 3)}>
                See more
              </button>
            ) : null}
            {!isOwnService ? (
              <form className="service-review-form" onSubmit={submitReview}>
                <div className="dialog-actions">
                  <label>Rating</label>
                  <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
                  </select>
                </div>
                <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Write your review..." />
                <button className="primary-button" type="submit" disabled={submittingReview}>
                  {submittingReview ? 'Sending...' : 'Submit review'}
                </button>
              </form>
            ) : null}
          </section>
          {!isOwnService ? (
            <aside className="settings-card service-provider-card">
              <UserProfileLink user={service.provider} className="profile-inline profile-link">
                <Avatar user={service.provider} />
                <div>
                  <div className="name-line">
                    <strong>{service.provider.displayName}</strong>
                    <ProviderBadges user={service.provider} compact />
                  </div>
                  <span>@{service.provider.username}</span>
                </div>
              </UserProfileLink>
              <p>{providerBio}</p>
              <button className="primary-button service-message-button" type="button" onClick={messageProvider}>
                <MessageCircle size={16} /> Contact provider
              </button>
            </aside>
          ) : null}
        </div>
        {editingService ? (
          <ServiceEditModal
            service={service}
            onClose={() => setEditingService(false)}
            onSave={async (payload) => {
              await updateService(service.id, payload)
              setEditingService(false)
              setActiveImageIndex(0)
            }}
          />
        ) : null}
      </section>
    </AppShell>
  )
}

type ServiceEditPayload = Parameters<AppContextValue['updateService']>[1]

function ServiceEditModal({
  service,
  onClose,
  onSave,
}: {
  service: ServiceItem
  onClose: () => void
  onSave: (payload: ServiceEditPayload) => Promise<void>
}) {
  const [title, setTitle] = useState(service.title)
  const [category, setCategory] = useState(service.category)
  const [subcategory, setSubcategory] = useState(service.subcategory)
  const [description, setDescription] = useState(service.description)
  const [city, setCity] = useState(service.city ?? '')
  const [price, setPrice] = useState(service.price?.toString() ?? '')
  const [keywords, setKeywords] = useState(service.keywords.join(', '))
  const [existingImages, setExistingImages] = useState(service.images)
  const [coverImageId, setCoverImageId] = useState<string | undefined>(service.images[0]?.id)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const galleryInputRef = useRef<HTMLInputElement | null>(null)

  function chooseCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setCoverImageId(undefined)
    event.target.value = ''
  }

  function addImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return
    setNewFiles((current) => [...current, ...files])
    setNewPreviews((current) => [...current, ...files.map((file) => URL.createObjectURL(file))])
    event.target.value = ''
  }

  function removeExistingImage(imageId: string) {
    setExistingImages((current) => current.filter((image) => image.id !== imageId))
    setDeletedImageIds((current) => current.includes(imageId) ? current : [...current, imageId])
    if (coverImageId === imageId) {
      const nextCover = existingImages.find((image) => image.id !== imageId)
      setCoverImageId(nextCover?.id)
    }
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(newPreviews[index] || '')
    setNewFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setNewPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      setSaving(true)
      setError(null)
      await onSave({
        title: title.trim(),
        category: category.trim(),
        subcategory: subcategory.trim(),
        description: description.trim(),
        city: city.trim(),
        price: price ? Number(price) : null,
        keywords: keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean),
        files: newFiles,
        coverFile,
        coverImageId,
        deletedImageIds,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update service')
      setSaving(false)
    }
  }

  const currentCover = coverPreview ?? existingImages.find((image) => image.id === coverImageId)?.url ?? existingImages[0]?.url ?? service.image

  return (
    <div className="dialog-backdrop">
      <form className="service-edit-modal" onSubmit={submit}>
        <div className="modal-form-header">
          <div>
            <p className="eyebrow">Service</p>
            <h2>Edit service</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close editor">
            <X size={18} />
          </button>
        </div>
        <div className="service-edit-layout">
          <section className="service-edit-media">
            <img src={currentCover} alt={title} />
            <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={chooseCover} />
            <input ref={galleryInputRef} type="file" accept="image/*" multiple hidden onChange={addImages} />
            <div className="dialog-actions">
              <button className="secondary-button" type="button" onClick={() => coverInputRef.current?.click()}>
                Change main picture
              </button>
              <button className="secondary-button" type="button" onClick={() => galleryInputRef.current?.click()}>
                Add pictures
              </button>
            </div>
            <div className="service-edit-thumbs">
              {existingImages.map((image) => (
                <div key={image.id} className={image.id === coverImageId ? 'active' : ''}>
                  <button type="button" onClick={() => { setCoverImageId(image.id); setCoverFile(null); setCoverPreview(null) }}>
                    <img src={image.url} alt="" />
                  </button>
                  <button type="button" onClick={() => removeExistingImage(image.id)} aria-label="Remove picture">
                    <X size={13} />
                  </button>
                </div>
              ))}
              {newPreviews.map((preview, index) => (
                <div key={preview}>
                  <button type="button">
                    <img src={preview} alt="" />
                  </button>
                  <button type="button" onClick={() => removeNewImage(index)} aria-label="Remove new picture">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className="service-edit-fields">
            <label>
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <div className="form-grid">
              <label>
                Category
                <input value={category} onChange={(event) => setCategory(event.target.value)} required />
              </label>
              <label>
                Subcategory
                <input value={subcategory} onChange={(event) => setSubcategory(event.target.value)} />
              </label>
            </div>
            <label>
              Description
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} required />
            </label>
            <div className="form-grid">
              <label>
                City
                <input value={city} onChange={(event) => setCity(event.target.value)} />
              </label>
              <label>
                Starting price
                <input value={price} onChange={(event) => setPrice(event.target.value)} type="number" min="0" />
              </label>
            </div>
            <label>
              Keywords
              <input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="wedding, makeup, glam" />
            </label>
            {error ? <p className="dialog-error">{error}</p> : null}
          </section>
        </div>
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  )
}

function ProfilePage() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const { currentUser, users, posts, services, followedUserIds, updateProfile, openCreate, startConversation, togglePostLike, togglePostSave, reportUserById } = useApp()
  const [photoMenu, setPhotoMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState<'posts' | 'services'>('posts')
  const [activePost, setActivePost] = useState<PostItem | null>(null)
  const [profileCounts, setProfileCounts] = useState({ followers: 0, following: 0 })
  const [followersList, setFollowersList] = useState<AppUser[]>([])
  const [followingList, setFollowingList] = useState<AppUser[]>([])
  const [connectionsOpen, setConnectionsOpen] = useState<null | 'followers' | 'following'>(null)
  const [messageError, setMessageError] = useState<string | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileReportOpen, setProfileReportOpen] = useState(false)
  const [profileCopied, setProfileCopied] = useState(false)
  const photoMenuRef = useOutsideClose<HTMLDivElement>(photoMenu, () => setPhotoMenu(false))
  const profileMoreRef = useOutsideClose<HTMLDivElement>(profileMenuOpen, () => setProfileMenuOpen(false))
  const profile =
    profileId === 'me'
      ? currentUser ?? users[0]
      : users.find((user) => user.id === profileId) ??
        posts.find((post) => post.author.id === profileId)?.author ??
        services.find((service) => service.provider.id === profileId)?.provider ??
        currentUser ??
        users[0]
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isProvider = profile.role === 'PROVIDER'
  const isOwnProfile = currentUser?.id === profile.id
  const ownPosts = posts.filter((post) => post.author.id === profile.id)
  const ownServices = services.filter((service) => service.provider.id === profile.id)

  useEffect(() => {
    let active = true
    Promise.all([getFollowers(profile.id), getFollowing(profile.id)])
      .then(([followersResponse, followingResponse]) => {
        if (!active) return
        setProfileCounts({
          followers: followersResponse.count,
          following: followingResponse.count,
        })
        setFollowersList(followersResponse.followers.map((user) => mapApiUser(user)))
        setFollowingList(followingResponse.following.map((user) => mapApiUser(user)))
      })
      .catch(() => {
        if (!active) return
        setProfileCounts({ followers: 0, following: 0 })
        setFollowersList([])
        setFollowingList([])
      })

    return () => {
      active = false
    }
  }, [profile.id, followedUserIds])

  function uploadProfilePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    updateProfile({ avatar: URL.createObjectURL(file) })
    setPhotoMenu(false)
    event.target.value = ''
  }

  async function messageProfile() {
    try {
      setMessageError(null)
      const conversationId = await startConversation(profile.id)
      if (conversationId) navigate('/messages', { state: { conversationId } })
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : 'Could not start conversation')
    }
  }

  function copyProfileLink() {
    void navigator.clipboard?.writeText(`${window.location.origin}${profilePath(profile)}`)
    setProfileCopied(true)
    window.setTimeout(() => setProfileCopied(false), 1600)
  }

  return (
    <AppShell>
      <section className="profile-page">
        <div className="profile-top">
          <div className="profile-photo-wrap" ref={photoMenuRef}>
            <button className="profile-photo" type="button" onClick={() => isOwnProfile && setPhotoMenu((v) => !v)}>
              <Avatar user={profile} size="lg" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={uploadProfilePhoto} />
            {photoMenu && isOwnProfile ? (
              <div className="photo-popover">
                <button type="button" onClick={() => fileInputRef.current?.click()}>Upload photo</button>
                <button type="button" onClick={() => { updateProfile({ avatar: profile.displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'M' }); setPhotoMenu(false) }}>Remove photo</button>
                <button type="button" onClick={() => setPhotoMenu(false)}>
                  Cancel
                </button>
              </div>
            ) : null}
          </div>
          <div className="profile-info">
            <div className="profile-title-row">
              <h1>{profile.displayName}</h1>
              <ProviderBadges user={profile} />
              {isOwnProfile && profile.providerStatus === 'PENDING' ? <span className="pending-badge">Pending verification</span> : null}
              {isOwnProfile ? (
                <button className="secondary-button" type="button" onClick={() => setEditing((value) => !value)}>
                  {editing ? 'Close editor' : 'Edit profile'}
                </button>
              ) : (
                <div className="profile-action-row">
                  <FollowButton user={profile} />
                  <button className="secondary-button" type="button" onClick={messageProfile}>
                    <MessageCircle size={16} /> Message
                  </button>
                  <div className="post-menu-wrap" ref={profileMoreRef}>
                    <button className="icon-button" type="button" onClick={() => setProfileMenuOpen((value) => !value)} aria-label="Profile options">
                      <MoreHorizontal />
                    </button>
                    {profileMenuOpen ? (
                      <div className="popover-menu profile-more-menu">
                        <button type="button" onClick={() => { copyProfileLink(); setProfileMenuOpen(false) }}>
                          <Copy size={16} /> {profileCopied ? 'Copied' : 'Copy profile link'}
                        </button>
                        <button type="button" onClick={() => { setProfileReportOpen(true); setProfileMenuOpen(false) }}>
                          <Flag size={16} /> Report user
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
            <p>@{profile.username}</p>
            {messageError ? <p className="ticket-status">{messageError}</p> : null}
            <div className="profile-stats">
              <button type="button" className="stat-link" onClick={() => setConnectionsOpen('followers')}>
                <strong>{profileCounts.followers} followers</strong>
              </button>
              <button type="button" className="stat-link" onClick={() => setConnectionsOpen('following')}>
                <strong>{profileCounts.following} following</strong>
              </button>
              <strong>{ownPosts.length} posts</strong>
              {isProvider ? <strong>{ownServices.length} services</strong> : null}
            </div>
            <p className="profile-bio">{profile.bio}</p>
            {editing && isOwnProfile ? (
              <form
                className="profile-editor"
                onSubmit={(event) => {
                  event.preventDefault()
                  const formData = new FormData(event.currentTarget)
                  updateProfile({
                    displayName: String(formData.get('displayName') || profile.displayName),
                    username: String(formData.get('username') || profile.username),
                    bio: String(formData.get('bio') || profile.bio),
                  })
                  setEditing(false)
                }}
              >
                <div className="form-grid">
                  <label>
                    Display name
                    <input name="displayName" defaultValue={profile.displayName} />
                  </label>
                  <label>
                    Username
                    <input name="username" defaultValue={profile.username} />
                  </label>
                </div>
                <label>
                  Bio
                  <textarea name="bio" defaultValue={profile.bio} />
                </label>
                <button className="primary-button" type="submit">Save profile</button>
              </form>
            ) : null}
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
          <div className="profile-feed-section">
            <div className="profile-section-title">
              <h2>Posts</h2>
              {isOwnProfile ? (
                <button className="secondary-button" type="button" onClick={() => openCreate('post')}>
                  <Plus size={16} /> New post
                </button>
              ) : null}
            </div>
            {ownPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={togglePostLike}
                onSave={togglePostSave}
                onComments={() => setActivePost(posts.find((item) => item.id === post.id) ?? post)}
              />
            ))}
            {!ownPosts.length ? <div className="empty-state fill-empty"><ImageIcon size={34} /><h2>No posts yet</h2><p>{isOwnProfile ? 'Create your first memory from your profile or sidebar.' : 'This profile has not shared any posts yet.'}</p></div> : null}
          </div>
        ) : (
          <div className="profile-services-wrap">
            <div className="profile-section-title">
              <div>
                <p className="eyebrow">Services</p>
                <h2>Services</h2>
              </div>
              {isOwnProfile ? (
                <button className="secondary-button" type="button" onClick={() => openCreate('service')}>
                  <Plus size={16} /> New service
                </button>
              ) : null}
            </div>
            <div className="service-grid profile-services-section">
              {ownServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
              {!ownServices.length ? <div className="empty-state fill-empty"><BriefcaseBusiness size={34} /><h2>No services yet</h2><p>{isOwnProfile ? 'Add your first service from your profile.' : 'This provider has not published services yet.'}</p></div> : null}
            </div>
          </div>
        )}
        {activePost ? (
          <PostModal
            post={posts.find((item) => item.id === activePost.id) ?? activePost}
            onClose={() => setActivePost(null)}
          />
        ) : null}
        {profileReportOpen ? (
          <ReportDialog
            title="Report user"
            onClose={() => setProfileReportOpen(false)}
            onSubmit={(reason, description) => reportUserById(profile.id, reason, description)}
          />
        ) : null}
        {connectionsOpen ? (
          <UserListModal
            title={connectionsOpen === 'followers' ? 'Followers' : 'Following'}
            users={connectionsOpen === 'followers' ? followersList : followingList}
            onClose={() => setConnectionsOpen(null)}
          />
        ) : null}
      </section>
    </AppShell>
  )
}

function UserListModal({ title, users, onClose }: { title: string; users: AppUser[]; onClose: () => void }) {
  return (
    <div className="action-dialog-backdrop" onClick={onClose}>
      <section className="action-dialog report-dialog followers-modal" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><h2>{title}</h2></div>
          <button type="button" onClick={onClose}><X size={17} /></button>
        </header>
        <div className="followers-list">
          {users.map((user) => (
            <div key={user.id} className="followers-row">
              <UserProfileLink user={user} className="profile-inline profile-link">
                <Avatar user={user} size="sm" />
                <div>
                  <strong>{user.displayName}</strong>
                  <span>@{user.username}</span>
                </div>
              </UserProfileLink>
              <FollowButton user={user} />
            </div>
          ))}
          {!users.length ? <p className="empty-profile-note">No users here yet.</p> : null}
        </div>
      </section>
    </div>
  )
}

function ActivityPage() {
  const { currentUser, posts, services, notifications } = useApp()
  const likedPosts = posts.filter((post) => post.liked)
  const commentedPosts = posts.filter((post) =>
    post.comments.some((comment) => comment.user.id === currentUser?.id || comment.replies.some((reply) => reply.user.id === currentUser?.id)),
  )
  const savedPosts = posts.filter((post) => post.saved)
  const savedServices = services.filter((service) => service.saved)

  return (
    <AppShell>
      <section className="utility-page activity-page">
        <p className="eyebrow">Your activity</p>
        <h1>Your activity</h1>
        <div className="activity-grid">
          <article><Heart size={19} /><strong>{likedPosts.length}</strong><span>Liked posts</span></article>
          <article><MessageCircle size={19} /><strong>{commentedPosts.length}</strong><span>Commented posts</span></article>
          <article><Bookmark size={19} /><strong>{savedPosts.length + savedServices.length}</strong><span>Saved items</span></article>
          <article><Bell size={19} /><strong>{notifications.filter((item) => item.unread).length}</strong><span>Unread alerts</span></article>
        </div>
        <div className="saved-section">
          <h2>Liked posts</h2>
          <div className="utility-list">
            {likedPosts.slice(0, 12).map((post) => (
              <Link key={post.id} to={`/p/${post.id}`} className="activity-link-row">
                <Heart size={18} />
                <span className="activity-ellipsis">You liked the post: {post.caption || 'Post without caption'}</span>
              </Link>
            ))}
            {!likedPosts.length ? <div><Sparkles size={18} /><span>No liked posts yet.</span></div> : null}
          </div>
        </div>
        <div className="saved-section">
          <h2>Comments</h2>
          <div className="utility-list">
            {commentedPosts.slice(0, 12).map((post) => (
              <Link key={post.id} to={`/p/${post.id}`} className="activity-link-row">
                <MessageCircle size={18} />
                <span className="activity-ellipsis">You commented on: {post.caption || 'Post without caption'}</span>
              </Link>
            ))}
            {!commentedPosts.length ? <div><MessageCircle size={18} /><span>No comments yet.</span></div> : null}
          </div>
        </div>
      </section>
    </AppShell>
  )
}

function SavedPage() {
  const { posts, services } = useApp()
  const savedPosts = posts.filter((post) => post.saved)
  const savedServices = services.filter((service) => service.saved)
  return (
    <AppShell>
      <section className="utility-page">
        <p className="eyebrow">Saved</p>
        <h1>Saved posts and services</h1>
        <div className="saved-section">
          <h2>Posts</h2>
          {savedPosts.map((post) => (
            <Link key={post.id} to={`/p/${post.id}`} className={`saved-post-card ${post.media.length ? '' : 'saved-post-text-only'}`}>
              {post.media.length ? <img src={post.media[0]?.url} alt={post.caption} /> : null}
              <div>
                <strong>{post.caption}</strong>
                <span>{post.hashtags.map((tag) => `#${tag}`).join(' ')}</span>
              </div>
            </Link>
          ))}
          {!savedPosts.length ? <div className="empty-state fill-empty"><Bookmark size={34} /><h2>No saved posts</h2><p>Saved posts will appear here.</p></div> : null}
        </div>
        <div className="saved-section">
          <h2>Services</h2>
          <div className="service-grid">
          {savedServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
          {!savedServices.length ? <div className="empty-state fill-empty"><BriefcaseBusiness size={34} /><h2>No saved services</h2><p>Saved services will appear here.</p></div> : null}
          </div>
        </div>
      </section>
    </AppShell>
  )
}

function SettingsPage() {
  const { currentUser, theme, setTheme, updateProfile } = useApp()
  const [providerStatus, setProviderStatus] = useState<string | null>(null)
  const [cinFile, setCinFile] = useState<File | null>(null)
  const [submittingProvider, setSubmittingProvider] = useState(false)

  async function submitProviderRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    if (!cinFile) {
      setProviderStatus('Please upload a CIN picture before submitting.')
      return
    }

    try {
      setSubmittingProvider(true)
      setProviderStatus(null)
      const cinResponse = await uploadProviderCinPicture(cinFile)
      await createProviderRequest({
        professionalName: String(formData.get('professionalName') || '').trim(),
        professionalDescription: String(formData.get('professionalDescription') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        city: String(formData.get('city') || '').trim(),
        cinNumber: String(formData.get('cinNumber') || '').trim(),
        cinPicturePath: cinResponse.cinPicturePath,
        additionalInfo: String(formData.get('additionalInfo') || '').trim(),
      })
      updateProfile({ role: 'PROVIDER', providerStatus: 'PENDING' })
      setProviderStatus('Provider request submitted. Your Pro account is active, and verification waits for admin review.')
      event.currentTarget.reset()
      setCinFile(null)
    } catch (error) {
      setProviderStatus(error instanceof Error ? error.message : 'Failed to submit provider request')
    } finally {
      setSubmittingProvider(false)
    }
  }

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
          <h2>Privacy and account</h2>
          <div className="settings-list">
            <label className="toggle-line"><input type="checkbox" defaultChecked /> Allow people to message me from my profile</label>
            <label className="toggle-line"><input type="checkbox" defaultChecked /> Show my saved service recommendations</label>
            <label className="toggle-line"><input type="checkbox" /> Hide activity status in messages</label>
          </div>
        </div>
        <div className="settings-card">
          <h2>Notifications</h2>
          <div className="settings-list">
            <label className="toggle-line"><input type="checkbox" defaultChecked /> Ticket status changes</label>
            <label className="toggle-line"><input type="checkbox" defaultChecked /> Likes, replies, and comment mentions</label>
            <label className="toggle-line"><input type="checkbox" defaultChecked /> Provider verification updates</label>
          </div>
        </div>
        <div className="settings-card provider-application-card">
          <h2>Become a provider</h2>
          <p>Submit your professional details and CIN information. You can create provider content now; the verified icon appears only after admin approval.</p>
          <form className="provider-request-form" onSubmit={submitProviderRequest}>
            <div className="form-grid">
              <label>
                Professional name
                <input name="professionalName" defaultValue={currentUser?.displayName} required />
              </label>
              <label>
                City
                <input name="city" placeholder="Casablanca" required />
              </label>
            </div>
            <div className="form-grid">
              <label>
                Main category
                <select name="mainCategory" defaultValue="Events">
                  <option>Events</option>
                  <option>Beauty</option>
                  <option>Media</option>
                  <option>Decoration</option>
                  <option>Catering</option>
                </select>
              </label>
              <label>
                Phone
                <input name="phone" placeholder="+212 6..." required />
              </label>
            </div>
            <div className="form-grid">
              <label>
                CIN number
                <input name="cinNumber" placeholder="AB123456" required />
              </label>
              <label>
                CIN picture
                <input type="file" accept="image/*" onChange={(event) => setCinFile(event.target.files?.[0] ?? null)} required />
              </label>
            </div>
            <label>
              Professional description
              <textarea name="professionalDescription" placeholder="Describe your services, style, and experience." required />
            </label>
            <label>
              Additional information
              <textarea name="additionalInfo" placeholder="Availability, portfolio links, categories, or admin notes." />
            </label>
            <button className="primary-button" type="submit" disabled={submittingProvider}>
              {submittingProvider ? 'Submitting...' : currentUser?.role === 'PROVIDER' ? 'Update provider request' : 'Submit provider request'}
            </button>
            {providerStatus ? <p className="ticket-status">{providerStatus}</p> : null}
          </form>
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

function CreateModal({ initialType = 'post', onClose }: { initialType?: 'post' | 'service'; onClose: () => void }) {
  const { currentUser, createPost, createService } = useApp()
  const [type, setType] = useState<'post' | 'service'>(initialType)
  const [step, setStep] = useState(1)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [serviceTitle, setServiceTitle] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [category, setCategory] = useState('Events')
  const [subcategory, setSubcategory] = useState('Photography')
  const [serviceCity, setServiceCity] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [keywords, setKeywords] = useState('')
  const [media, setMedia] = useState<MediaItem[]>([])
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const canCreateService = currentUser?.role === 'PROVIDER'
  const lockedType = initialType === 'service'
  const totalSteps = 4

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    const items = files.map((file) => ({
      type: 'image' as const,
      url: URL.createObjectURL(file),
    }))
    setMedia((current) => [...current, ...items])
    setMediaFiles((current) => [...current, ...files])
    event.target.value = ''
  }

  function removeMedia(index: number) {
    setMedia((current) => {
      URL.revokeObjectURL(current[index]?.url || '')
      return current.filter((_, itemIndex) => itemIndex !== index)
    })
    setMediaFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  function nextStep() {
    setError(null)
    if (step === 1) {
      if (type === 'post' && !caption.trim()) {
        setError('Write a caption before continuing.')
        return
      }
      if (type === 'service' && (!serviceTitle.trim() || !serviceDescription.trim())) {
        setError('Add a service title and description before continuing.')
        return
      }
    }
    if (step === totalSteps) {
      if (type === 'post') {
        createPost({
          caption: caption.trim(),
          hashtags: hashtags.split(/[\s,]+/).map((tag) => tag.replace(/^#/, '')).filter(Boolean),
          location: location.trim() || undefined,
          media,
          files: mediaFiles,
        })
      } else {
        createService({
          title: serviceTitle.trim(),
          category,
          subcategory,
          keywords: keywords.split(/[\s,]+/).map((tag) => tag.replace(/^#/, '')).filter(Boolean),
          description: serviceDescription.trim(),
          city: serviceCity.trim(),
          price: servicePrice ? Number(servicePrice) : null,
          image: media[0]?.url || 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
          files: mediaFiles,
        })
      }
      onClose()
      return
    }
    setStep((value) => value + 1)
  }

  return (
    <div className="modal-backdrop">
      <section className="create-modal">
        <header>
          <button type="button" onClick={step === 1 ? onClose : () => setStep((value) => value - 1)}>
            {step === 1 ? <X /> : <ArrowLeft />}
          </button>
          <strong>Create {type} - step {step} of {totalSteps}</strong>
          <button type="button" className="text-button" onClick={nextStep}>
            {step === totalSteps ? (type === 'service' ? 'Publish' : 'Share') : 'Next'}
          </button>
        </header>
        {canCreateService && !lockedType ? (
          <div className="segmented-tabs">
            <button className={type === 'post' ? 'active' : ''} type="button" onClick={() => setType('post')}>
              Post
            </button>
            <button className={type === 'service' ? 'active' : ''} type="button" onClick={() => setType('service')}>
              Service
            </button>
          </div>
        ) : null}
        {error ? <p className="create-error">{error}</p> : null}
        {step === 1 ? (
          <div className="create-fields">
            {type === 'service' ? (
              <>
                <label>
                  Service title
                  <input value={serviceTitle} onChange={(event) => setServiceTitle(event.target.value)} placeholder="Event photography package" />
                </label>
                <label>
                  Description
                  <textarea value={serviceDescription} onChange={(event) => setServiceDescription(event.target.value)} placeholder="Describe your service offer" />
                </label>
              </>
            ) : (
              <>
                <label>
                  Caption
                  <textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Write a caption..." />
                </label>
                <label>
                  Location
                  <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Casablanca, Rabat..." />
                </label>
              </>
            )}
          </div>
        ) : null}
        {step === 2 ? (
          <div className="create-fields">
            {type === 'service' ? (
              <>
                <label>
                  Category
                  <select value={category} onChange={(event) => setCategory(event.target.value)}>
                    <option>Events</option>
                    <option>Beauty</option>
                    <option>Media</option>
                  </select>
                </label>
                <label>
                  Subcategory
                  <select value={subcategory} onChange={(event) => setSubcategory(event.target.value)}>
                    <option>Photography</option>
                    <option>Makeup</option>
                    <option>Decoration</option>
                    <option>Catering</option>
                  </select>
                </label>
                <label>
                  Keywords
                  <input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="wedding, luxury, portraits" />
                </label>
                <div className="form-grid">
                  <label>
                    Service city
                    <input value={serviceCity} onChange={(event) => setServiceCity(event.target.value)} placeholder="Casablanca" />
                  </label>
                  <label>
                    Starting price
                    <input value={servicePrice} onChange={(event) => setServicePrice(event.target.value)} type="number" min="0" placeholder="1200" />
                  </label>
                </div>
              </>
            ) : (
              <label>
                Hashtags
                <input value={hashtags} onChange={(event) => setHashtags(event.target.value)} placeholder="wedding decor birthday" />
              </label>
            )}
          </div>
        ) : null}
        {step === 3 ? (
          <div className="upload-dropzone">
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
            <Camera size={40} />
            <h2>Add pictures</h2>
            <p>{type === 'service' ? 'Choose a main picture first, then add supporting pictures that show the service clearly.' : 'You can select multiple pictures. Posts can show several images.'}</p>
            <button className="secondary-button" type="button" onClick={() => fileInputRef.current?.click()}>
              Choose files
            </button>
            {media.length ? (
              <div className="media-preview-grid">
                {media.map((item, index) => (
                  <button key={`${item.url}-${index}`} type="button" onClick={() => removeMedia(index)}>
                    {item.type === 'video' ? <Video size={24} /> : <img src={item.url} alt="" />}
                    <span>Remove</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        {step === 4 ? (
          <div className="create-review">
            <p className="eyebrow">Review</p>
            <h2>{type === 'service' ? serviceTitle || 'Untitled service' : caption || 'Untitled post'}</h2>
            <p>{type === 'service' ? serviceDescription : `${location ? `${location} - ` : ''}${hashtags}`}</p>
            <div className="media-preview-grid">
              {media.length ? media.map((item, index) => (
                <span key={`${item.url}-${index}`}>
                  {item.type === 'video' ? <Video size={24} /> : <img src={item.url} alt="" />}
                </span>
              )) : <small>No media selected. You can still share now.</small>}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}

function NotificationsDrawer({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead } = useApp()
  const navigate = useNavigate()

  function notificationIcon(type: string) {
    if (type === 'message') return <MessageCircle size={18} />
    if (type === 'ticket') return <Ticket size={18} />
    if (type === 'like') return <Heart size={18} />
    return <Bell size={18} />
  }

  function openNotification(notification: NotificationItem) {
    markNotificationRead(notification.id)
    const path = notification.path
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
            onClick={() => openNotification(notification)}
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
  const { conversations, sendMessage, loadConversationMessages } = useApp()
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const active = conversations.find((conversation) => conversation.id === activeId)
  const unreadTotal = conversations.reduce((total, conversation) => total + conversation.unread, 0)
  const messageStreamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeId) return
    void loadConversationMessages(activeId)
  }, [activeId])

  useEffect(() => {
    if (messageStreamRef.current && active) {
      messageStreamRef.current.scrollTop = messageStreamRef.current.scrollHeight
    }
  }, [active?.messages])

  if (location.pathname === '/messages') return null
  if (!conversations.length) return null

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
            <div ref={messageStreamRef} className="mini-message-stream">
              {active.messages.map((message) => (
                <p key={message.id} className={message.fromMe ? 'mine' : ''}>
                  {message.text}
                  <span>{message.time}</span>
                </p>
              ))}
            </div>
            <form className="message-compose" onSubmit={(event) => event.preventDefault()}>
              <EmojiPicker onPick={(emoji) => setDraft((value) => `${value}${emoji}`)} />
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Message..."
              />
              <button
                type="button"
                disabled={!draft.trim()}
                onClick={() => {
                  if (!active) return
                  sendMessage(active.id, draft.trim())
                  setDraft('')
                }}
              >
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
      <UserProfileLink user={user} className="profile-link">
        <Avatar user={user} />
      </UserProfileLink>
      <UserProfileLink user={user} className="mini-profile-copy profile-link">
        <div className="name-line">
          <strong>{user.displayName}</strong>
          <ProviderBadges user={user} compact />
        </div>
        <span>@{user.username}</span>
      </UserProfileLink>
      {action === 'Follow' ? <FollowButton user={user} /> : <Link to={profilePath(user)}>{action}</Link>}
    </div>
  )
}

function ServiceMini({ service }: { service: ServiceItem }) {
  const price = service.price ? `From ${service.price.toLocaleString()} MAD` : service.city || service.subcategory
  return (
    <Link to={`/services/${service.id}`} className="service-mini">
      <span className="service-mini-image">
        <img src={service.image} alt={service.title} />
      </span>
      <div>
        <small>{service.subcategory || service.category}</small>
        <strong>{service.title}</strong>
        <span>
          {price} / {service.rating ? service.rating.toFixed(1) : 'New'}
        </span>
      </div>
    </Link>
  )
}

function ServiceCard({ service }: { service: ServiceItem }) {
  return (
    <Link to={`/services/${service.id}`} className="service-card">
      <div className="service-card-media">
        <img src={service.image} alt={service.title} />
        <span>{service.subcategory || service.category}</span>
      </div>
      <div className="service-card-body">
        <div className="service-card-title">
          <strong>{service.title}</strong>
          <ProviderBadges user={service.provider} compact />
        </div>
        <p>{service.description}</p>
        <div className="service-card-meta">
          <span>{service.city || service.category}</span>
          {service.price ? <span>From {service.price.toLocaleString()} MAD</span> : null}
          <span className="service-rating-line">
            <Star size={14} /> {service.rating ? service.rating.toFixed(1) : 'New'}
          </span>
        </div>
        {service.keywords.length ? <small>{service.keywords.slice(0, 3).map((keyword) => `#${keyword}`).join(' ')}</small> : null}
      </div>
    </Link>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
    </div>
  )
}

const quickEmojis = ['😊', '😍', '😂', '❤️', '✨', '👏', '🙏', '🔥']

function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false)
  const pickerRef = useOutsideClose<HTMLDivElement>(open, () => setOpen(false))

  return (
    <div className="emoji-picker" ref={pickerRef}>
      <button type="button" className="emoji-trigger" onClick={() => setOpen((value) => !value)} aria-label="Add emoji">
        <Smile size={19} />
      </button>
      {open ? (
        <div className="emoji-popover">
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onPick(emoji)
                setOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [theme, setTheme] = useState<ThemeKey>(() => loadStoredState(storageKeys.theme, 'light'))
  const [appUsers, setAppUsers] = useState<AppUser[]>(usersSeed)
  const [posts, setPosts] = useState<PostItem[]>(postsSeed)
  const [appServices, setAppServices] = useState<ServiceItem[]>(services)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [appNotifications, setAppNotifications] = useState<NotificationItem[]>(notificationsSeed)
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<'post' | 'service'>('post')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  
  const chatSocketRef = useRef<Socket<ChatServerEvents, ChatClientEvents> | null>(null)
  const notificationSocketRef = useRef<Socket<NotificationServerEvents> | null>(null)
  const joinedRoomsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    getCurrentUser()
      .then((response) => {
        const mapped = mapApiUser(response.user)
        setCurrentUser(mapped)
        setAppUsers((current) => current.some((user) => user.id === mapped.id) ? current : [mapped, ...current])
      })
      .catch(() => undefined)
      .finally(() => setAuthReady(true))
  }, [])

  useEffect(() => {
    getPosts()
      .then((response) => {
        const mappedPosts = response.posts.map((post) => mapApiPost(post, currentUser?.id))
        setPosts(mappedPosts)
        setAppUsers((current) => {
          const usersById = new Map(current.map((user) => [user.id, user]))
          mappedPosts.forEach((post) => {
            usersById.set(post.author.id, post.author)
            post.comments.forEach((comment) => {
              usersById.set(comment.user.id, comment.user)
              comment.replies.forEach((reply) => usersById.set(reply.user.id, reply.user))
            })
          })
          return Array.from(usersById.values())
        })
      })
      .catch(() => undefined)
  }, [currentUser?.id])

  useEffect(() => {
    getServices()
      .then((response) => {
        const mappedServices = response.services.map(mapApiService)
        setAppServices(mappedServices)
        setAppUsers((current) => {
          const usersById = new Map(current.map((user) => [user.id, user]))
          mappedServices.forEach((service) => usersById.set(service.provider.id, service.provider))
          return Array.from(usersById.values())
        })
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!currentUser) {
      setFollowedUserIds([])
      setConversations([])
      return
    }

    getFollowing(currentUser.id)
      .then((response) => setFollowedUserIds(response.following.map((user) => user.id)))
      .catch(() => undefined)
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return

    getChatConversations()
      .then((response) => {
        setConversations(
          response.conversations
            .map((conversation) => mapApiConversation(conversation, currentUser.id))
            .filter((conversation): conversation is Conversation => Boolean(conversation)),
        )
      })
      .catch(() => setConversations([]))
  }, [currentUser?.id])

  useEffect(() => {
    if (!currentUser) return

    getNotifications()
      .then((response) => {
        setAppNotifications(response.notifications.map((notification) => mapApiNotification(notification, currentUser)))
      })
      .catch(() => undefined)
  }, [currentUser?.id])

  useEffect(() => {
    if (!currentUser) return
    const token = getStoredToken()
    if (!token) return
    const currentUserId = currentUser.id

    const chatSocket = createChatSocket({ token })
    const notificationSocket = createNotificationSocket({ token })
    
    chatSocketRef.current = chatSocket
    notificationSocketRef.current = notificationSocket

    function refreshConversations() {
      getChatConversations()
        .then((response) => {
          setConversations(
            response.conversations
              .map((conversation) => mapApiConversation(conversation, currentUserId))
              .filter((conversation): conversation is Conversation => Boolean(conversation)),
          )
        })
        .catch(() => undefined)
    }

    chatSocket.on('message:new', (payload: { conversationId: string; message: ApiChatMessage }) => {
      console.debug('[socket] message:new', payload)
      setConversations((current) => {
        if (!current.some((conversation) => conversation.id === payload.conversationId)) {
          refreshConversations()
          return current
        }
        return appendRealtimeMessage(current, payload.conversationId, payload.message, currentUserId)
      })
    })

    chatSocket.on('conversation:updated', (payload: { conversation: RealtimeConversation }) => {
      const mapped = mapApiConversation(payload.conversation as unknown as ApiConversation, currentUserId)
      if (!mapped) return
      setConversations((current) => mergeConversation(current, mapped))
    })

    chatSocket.on('message:read', (payload: { conversationId: string; userId: string }) => {
      if (payload.userId !== currentUserId) return
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === payload.conversationId ? { ...conversation, unread: 0 } : conversation,
        ),
      )
    })

    chatSocket.on('message:deleted', (payload: { conversationId: string; messageId: string }) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === payload.conversationId
            ? {
                ...conversation,
                messages: conversation.messages.filter((message) => message.id !== payload.messageId),
              }
            : conversation,
        ),
      )
    })

    notificationSocket.on('notification:new', (payload: { notification: ApiNotification }) => {
      const mapped = mapApiNotification(payload.notification, currentUser)
      setAppNotifications((current) => [mapped, ...current.filter((notification) => notification.id !== mapped.id)])
    })

    notificationSocket.on('notification:read', (payload: { notification: ApiNotification }) => {
      const mapped = mapApiNotification(payload.notification, currentUser)
      setAppNotifications((current) =>
        current.map((notification) => (notification.id === mapped.id ? mapped : notification)),
      )
    })

    notificationSocket.on('notifications:read-all', () => {
      setAppNotifications((current) => current.map((notification) => ({ ...notification, unread: false })))
    })

    notificationSocket.on('notification:deleted', (payload: { notificationId: string }) => {
      setAppNotifications((current) => current.filter((notification) => notification.id !== payload.notificationId))
    })

    notificationSocket.on('notification:unread-count', (payload: { unreadCount: number }) => {
      if (payload.unreadCount === 0) {
        setAppNotifications((current) => current.map((notification) => ({ ...notification, unread: false })))
      }
    })

    return () => {
      // Leave all joined conversation rooms
      joinedRoomsRef.current.forEach((roomId) => {
        chatSocket.emit('conversation:leave', roomId)
      })
      joinedRoomsRef.current.clear()
      chatSocketRef.current = null
      notificationSocketRef.current = null
      
      chatSocket.disconnect()
      notificationSocket.disconnect()
    }
  }, [currentUser?.id])

  useEffect(() => storeState(storageKeys.theme, theme), [theme])

  const appValue = useMemo<AppContextValue>(
    () => ({
      currentUser,
      authReady,
      theme,
      setTheme,
      users: appUsers,
      posts,
      services: appServices,
      conversations,
      notifications: appNotifications,
      followedUserIds,
      login: (role = 'USER') => {
        setCurrentUser(role === 'PROVIDER' ? { ...appUsers[1], role: 'PROVIDER', providerStatus: 'PENDING' } : appUsers[0])
        setAuthReady(true)
      },
      loginWithCredentials: async (email, password) => {
        const response = await loginUser({ email, password })
        const mapped = mapApiUser(response.user)
        setCurrentUser(mapped)
        setAppUsers((current) => current.some((user) => user.id === mapped.id) ? current : [mapped, ...current])
        setAuthReady(true)
        return mapped
      },
      registerAccount: async ({ displayName, username, email, password, requestedRole }) => {
        const { firstName, lastName } = splitDisplayName(displayName)
        const response = await registerUser({
          firstName,
          lastName,
          username,
          email,
          password,
          requestedRole,
        })
        const mapped = mapApiUser(response.user, requestedRole)
        setCurrentUser(mapped)
        setAppUsers((current) => [mapped, ...current.filter((user) => user.id !== mapped.id)])
        setAuthReady(true)
      },
      logout: () => {
        clearStoredToken()
        setCurrentUser(null)
        setAuthReady(true)
      },
      createPost: ({ caption, hashtags, location, files }) => {
        void (async () => {
          const contentParts = [caption, location ? `\n\n${location}` : '', hashtags.map((tag) => `#${tag}`).join(' ')]
          const response = await createPostApi({ content: contentParts.join(' ').trim() })
          if (files?.length) {
            await uploadPostImages(response.post.id, files)
          }
          const fresh = await getPosts()
          setPosts(fresh.posts.map((post) => mapApiPost(post, currentUser?.id)))
        })()
      },
      createService: ({ title, category, subcategory, keywords, description, city, price, files }) => {
        void (async () => {
          const response = await createProviderService({
            title,
            category,
            subcategory,
            keywords,
            description,
            city: city || 'Casablanca',
            price: price ?? null,
          })
          if (files?.length) {
            await uploadServiceImages(response.service.id, files)
          }
          const fresh = await getServices()
          setAppServices(fresh.services.map(mapApiService))
        })()
      },
      updateService: async (serviceId, payload) => {
        const response = await updateProviderService(serviceId, {
          title: payload.title,
          category: payload.category,
          subcategory: payload.subcategory,
          keywords: payload.keywords,
          description: payload.description,
          city: payload.city || 'Casablanca',
          price: payload.price ?? null,
        })
        let nextImages = response.service.images

        for (const imageId of payload.deletedImageIds ?? []) {
          await deleteServiceImage(serviceId, imageId)
          nextImages = nextImages.filter((image) => image.id !== imageId)
        }

        if (payload.coverFile) {
          const uploaded = await uploadServiceImages(serviceId, [payload.coverFile])
          nextImages = [...nextImages, ...uploaded.images]
          if (uploaded.images[0]) {
            const coverResponse = await setServiceCoverImage(serviceId, uploaded.images[0].id)
            nextImages = coverResponse.images
          }
        }

        if (payload.files?.length) {
          const uploaded = await uploadServiceImages(serviceId, payload.files)
          nextImages = [...nextImages, ...uploaded.images]
        }

        if (!payload.coverFile && payload.coverImageId) {
          const coverResponse = await setServiceCoverImage(serviceId, payload.coverImageId)
          nextImages = coverResponse.images
        }

        const mapped = mapApiService({ ...response.service, images: nextImages })
        setAppServices((current) => current.map((service) => (service.id === serviceId ? mapped : service)))

        const fresh = await getServices()
        setAppServices(fresh.services.map(mapApiService))
      },
      deleteService: async (serviceId) => {
        await deleteProviderService(serviceId)
        setAppServices((current) => current.filter((service) => service.id !== serviceId))
      },
      togglePostLike: (postId) => {
        const post = posts.find((item) => item.id === postId)
        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? { ...post, liked: !post.liked, likes: post.liked ? Math.max(0, post.likes - 1) : post.likes + 1 }
              : post,
          ),
        )
        void (post?.liked ? unlikePost(postId) : likePost(postId)).catch(() => {
          getPosts()
            .then((response) => setPosts(response.posts.map((item) => mapApiPost(item, currentUser?.id))))
            .catch(() => undefined)
        })
      },
      togglePostSave: (postId) => {
        const post = posts.find((item) => item.id === postId)
        setPosts((current) => current.map((post) => (post.id === postId ? { ...post, saved: !post.saved } : post)))
        void (post?.saved ? unsavePost(postId) : savePost(postId)).catch(() => undefined)
      },
      toggleFollow: (userId) => {
        if (currentUser?.id === userId) return
        const isFollowing = followedUserIds.includes(userId)
        setFollowedUserIds((current) =>
          isFollowing ? current.filter((id) => id !== userId) : [...current, userId],
        )
        void (isFollowing ? unfollowUser(userId) : followUser(userId)).catch(() => {
          setFollowedUserIds((current) =>
            isFollowing ? [...current, userId] : current.filter((id) => id !== userId),
          )
        })
      },
      addComment: (postId, content) => {
        void addPostCommentApi(postId, content)
          .then(() => getPosts())
          .then((response) => setPosts(response.posts.map((post) => mapApiPost(post, currentUser?.id))))
          .catch(() => undefined)
      },
      replyToComment: (postId, parentCommentId, content) => {
        void addPostCommentApi(postId, content, parentCommentId)
          .then(() => getPosts())
          .then((response) => setPosts(response.posts.map((post) => mapApiPost(post, currentUser?.id))))
          .catch(() => undefined)
      },
      updateComment: async (commentId, content) => {
        await updatePostComment(commentId, content)
        const response = await getPosts()
        setPosts(response.posts.map((post) => mapApiPost(post, currentUser?.id)))
      },
      deleteComment: async (commentId) => {
        await deletePostComment(commentId)
        const response = await getPosts()
        setPosts(response.posts.map((post) => mapApiPost(post, currentUser?.id)))
      },
      reportComment: async (commentId, reason, description) => {
        await reportPostComment(commentId, reason, description)
      },
      reportPostById: async (postId, reason, description) => {
        await reportPost(postId, reason, description)
      },
      reportUserById: async (userId, reason, description) => {
        await reportUser(userId, reason, description)
      },
      toggleCommentLike: async (commentId, liked) => {
        if (liked) {
          await unlikePostComment(commentId)
        } else {
          await likePostComment(commentId)
        }
        const response = await getPosts()
        setPosts(response.posts.map((post) => mapApiPost(post, currentUser?.id)))
      },
      reportContent: (kind, target) => {
        const actor = currentUser ?? appUsers[0]
        if (kind === 'post') {
          void reportPost(target, 'User report').catch(() => undefined)
        }
        setAppNotifications((current) => [
          makeNotification(actor, 'Report submitted', `Thanks. We saved your ${kind} report for review: ${target}`, '/tickets', 'ticket'),
          ...current,
        ])
      },
      loadConversationMessages: async (conversationId) => {
        if (!currentUser) return
        
        // Leave any previously joined conversation rooms
        for (const roomId of Array.from(joinedRoomsRef.current)) {
          chatSocketRef.current?.emit('conversation:leave', roomId)
          joinedRoomsRef.current.delete(roomId)
        }
        
        // Join the new conversation room
        chatSocketRef.current?.emit('conversation:join', conversationId)
        joinedRoomsRef.current.add(conversationId)
        
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
          ),
        )
        const response = await getChatMessages(conversationId)
        await markChatConversationRead(conversationId).catch(() => undefined)
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  unread: 0,
                  messages: response.messages.map((message) => mapApiChatMessage(message, currentUser.id)),
                }
              : conversation,
          ),
        )
      },
      startConversation: async (userId) => {
        if (!currentUser || currentUser.id === userId) return null
        const response = await createChatConversation(userId)
        const mapped = mapApiConversation(response.conversation, currentUser.id)
        if (!mapped) return response.conversation.id
        setConversations((current) => [mapped, ...current.filter((conversation) => conversation.id !== mapped.id)])
        return mapped.id
      },
      sendMessage: (conversationId, text) => {
        if (!currentUser) return
        const localMessage = { id: `m-local-${Date.now()}`, fromMe: true, text, time: 'Now' }
        console.debug('[sendMessage] adding local message', { conversationId, localId: localMessage.id, text })
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, unread: 0, messages: [...conversation.messages, localMessage] }
              : conversation,
          ),
        )
        void sendChatMessage(conversationId, text)
          .then((response) => {
            console.debug('[sendMessage] server response', { conversationId, serverId: response.chatMessage.id })
            setConversations((current) =>
              current.map((conversation) =>
                conversation.id === conversationId
                  ? {
                      ...conversation,
                      messages: [
                        ...conversation.messages.filter((message) => message.id !== localMessage.id && message.id !== response.chatMessage.id),
                        mapApiChatMessage(response.chatMessage, currentUser.id),
                      ],
                    }
                  : conversation,
              ),
            )
          })
          .catch(() => {
            setConversations((current) =>
              current.map((conversation) =>
                conversation.id === conversationId
                  ? { ...conversation, messages: conversation.messages.filter((message) => message.id !== localMessage.id) }
                  : conversation,
              ),
            )
          })
      },
      updateProfile: (payload) => {
        setCurrentUser((user) => {
          if (!user) return user
          const next = { ...user, ...payload }
          setAppUsers((current) => current.map((item) => (item.id === next.id ? next : item)))
          setPosts((current) => syncAuthor(next, current))
          setAppServices((current) => syncProvider(next, current))
          setConversations((current) => current.map((conversation) => ({
            ...conversation,
            user: conversation.user.id === next.id ? next : conversation.user,
          })))
          return next
        })
      },
      markNotificationRead: (notificationId) => {
        setAppNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId ? { ...notification, unread: false } : notification,
          ),
        )
        void markNotificationAsRead(notificationId).catch(() => undefined)
      },
      openCreate: (type = 'post') => {
        setCreateType(type)
        setCreateOpen(true)
      },
      openNotifications: () => setNotificationsOpen(true),
      openSwitchAccount: () => setSwitchOpen(true),
    }),
    [appNotifications, appServices, appUsers, authReady, conversations, currentUser, followedUserIds, posts, theme],
  )

  return (
    <AppContext.Provider value={appValue}>
      <div className="app-root" data-theme={theme}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/superadmin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminBackofficePage />
              </AdminRoute>
            }
          />
          <Route
            path="/p/:postId"
            element={
              <UserRoute>
                <PostDetailPage />
              </UserRoute>
            }
          />
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
              <UserRoute>
                <HomePage />
              </UserRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <UserRoute>
                <MessagesPage />
              </UserRoute>
            }
          />
          <Route
            path="/search"
            element={
              <UserRoute>
                <SearchPage />
              </UserRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <UserRoute>
                <ExplorePage />
              </UserRoute>
            }
          />
          <Route
            path="/services/:serviceId"
            element={
              <UserRoute>
                <ServiceDetailPage />
              </UserRoute>
            }
          />
          <Route
            path="/profile/:profileId"
            element={
              <UserRoute>
                <ProfilePage />
              </UserRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <UserRoute>
                <ActivityPage />
              </UserRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <UserRoute>
                <SavedPage />
              </UserRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <UserRoute>
                <SettingsPage />
              </UserRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <UserRoute>
                <TicketsPage />
              </UserRoute>
            }
          />
          <Route path="*" element={<Navigate to={currentUser ? '/home' : '/'} replace />} />
        </Routes>
        {createOpen ? <CreateModal initialType={createType} onClose={() => setCreateOpen(false)} /> : null}
        {notificationsOpen ? <NotificationsDrawer onClose={() => setNotificationsOpen(false)} /> : null}
        {switchOpen ? <SwitchAccountModal onClose={() => setSwitchOpen(false)} /> : null}
      </div>
    </AppContext.Provider>
  )
}

export default App
