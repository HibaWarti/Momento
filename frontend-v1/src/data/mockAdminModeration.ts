export const mockProviderRequests = [
  {
    id: '1',
    professionalName: 'Bloom Events',
    userName: 'Salma El Idrissi',
    city: 'Casablanca',
    phone: '06 12 34 56 78',
    status: 'PENDING',
    submittedAt: 'Today',
  },
  {
    id: '2',
    professionalName: 'Nora Beauty',
    userName: 'Nora Bakkali',
    city: 'Marrakech',
    phone: '06 98 76 54 32',
    status: 'REVIEWING',
    submittedAt: 'Yesterday',
  },
  {
    id: '3',
    professionalName: 'Atlas Photography',
    userName: 'Yassine Amrani',
    city: 'Rabat',
    phone: '06 45 78 12 90',
    status: 'APPROVED',
    submittedAt: '3 days ago',
  },
]

export const mockReports = [
  {
    id: '1',
    type: 'Post',
    reporter: 'Hiba Bennani',
    target: 'Birthday evening post',
    reason: 'Inappropriate content',
    status: 'PENDING',
    createdAt: '20 minutes ago',
  },
  {
    id: '2',
    type: 'User',
    reporter: 'Sara El Amrani',
    target: 'unknown_user22',
    reason: 'Harassment',
    status: 'REVIEWING',
    createdAt: '1 hour ago',
  },
  {
    id: '3',
    type: 'Post',
    reporter: 'Nora Beauty',
    target: 'Photography event post',
    reason: 'Spam',
    status: 'RESOLVED',
    createdAt: 'Yesterday',
  },
]