# Momento — Frontend Structure

## 1. Overview

The frontend of Momento is built with React, TypeScript, Vite, and Tailwind CSS.

The goal of this structure is to keep the application organized by feature and by responsibility.  
Reusable components are separated from pages, mock data is isolated, and route paths are centralized.

## 2. Main Structure

Momento frontend structure:

src/
- api/
- assets/
- components/
  - layout/
  - ui/
  - posts/
  - services/
  - users/
  - admin/
- constants/
- data/
- hooks/
- pages/
  - admin/
  - auth/
  - feed/
  - notifications/
  - profile/
  - providers/
  - public/
  - services/
- routes/
- types/
- utils/

## 3. Folder Roles

### api/

Contains frontend API helper files.

Examples:

- authApi.ts
- userApi.ts
- postApi.ts
- providerApi.ts

These files will later communicate with the API Gateway.

### assets/

Contains static assets such as images, logos, and icons if needed.

### components/

Contains reusable components used across multiple pages.

### components/layout/

Contains layout-related components.

Current examples:

- Navbar
- PublicLayout

Future examples:

- AuthLayout
- DashboardLayout
- AdminLayout

### components/ui/

Contains small reusable UI components.

Current examples:

- Button
- Input
- Card
- Badge

### components/posts/

Contains post-related components.

Current examples:

- PostCard

Future examples:

- CommentList
- ReactionButton
- CreatePostForm
- PostImageGallery

### components/services/

Contains service/provider marketplace components.

Current examples:

- ServiceCard

Future examples:

- ServiceFilters
- ReviewList
- ServiceForm
- ServiceImageGallery

### components/users/

Contains user-related components.

Current examples:

- UserCard
- NotificationItem

Future examples:

- ProfileHeader
- FollowButton
- UserStats
- EditProfileForm

### components/admin/

Contains admin dashboard and moderation components.

Current examples:

- AdminStatCard
- AdminStatusBadge

Future examples:

- AdminSidebar
- ReportsTable
- ProviderRequestsTable
- UserManagementTable

### constants/

Contains reusable constants such as theme values and navigation items.

Current examples:

- theme.ts
- navigation.ts

### data/

Contains temporary mock data used before backend integration.

Current examples:

- mockPosts.ts
- mockUsers.ts
- mockServices.ts
- mockNotifications.ts
- mockAdminStats.ts
- mockAdminModeration.ts

### hooks/

Contains custom React hooks.

Future examples:

- useAuth
- usePosts
- useNotifications

### pages/

Contains route-level pages grouped by feature.

Current page groups:

- public
- auth
- feed
- profile
- providers
- services
- notifications
- admin

### routes/

Contains route constants and route-related configuration.

Current example:

- paths.ts

### types/

Contains shared TypeScript types.

Future examples:

- user.types.ts
- post.types.ts
- service.types.ts
- notification.types.ts

### utils/

Contains helper functions.

Future examples:

- formatDate.ts
- formatPrice.ts
- classNames.ts

## 4. Current Pages

The current frontend includes:

- Public landing page
- Explore page
- Login page
- Register page
- Feed page
- User profile page
- Services listing page
- Service details page
- Providers page
- Provider profile page
- Provider request page
- Notifications page
- Admin dashboard page
- Admin provider requests page
- Admin reports/moderation page
- Not found page

## 5. Current Design System

Momento uses a warm and premium color palette.

Main colors:

- Primary orange: #F97316
- Secondary purple: #7C3AED
- Accent pink: #EC4899
- Light background: #FFF7ED
- Dark text: #0F172A
- Muted text: #64748B
- Border: #E2E8F0
- Success: #22C55E
- Warning: #F59E0B
- Error: #EF4444

The UI style focuses on:

- rounded cards
- soft shadows
- clean spacing
- responsive layouts
- warm social-media feeling
- service marketplace clarity
- professional admin dashboard style

## 6. Routing

Route paths are centralized in:

src/routes/paths.ts

This avoids hardcoding paths in multiple files and makes navigation easier to maintain.

Main routes:

- /
- /explore
- /services
- /services/:serviceId
- /providers
- /providers/:providerId
- /provider-request
- /login
- /register
- /feed
- /profile
- /notifications
- /admin
- /admin/provider-requests
- /admin/reports

## 7. Backend Integration Notes

The frontend currently uses mock data.

Later, the frontend will communicate with the backend through the API Gateway:

API Gateway:

http://localhost:3000

Expected future API helper files:

- src/api/authApi.ts
- src/api/userApi.ts
- src/api/postApi.ts
- src/api/providerApi.ts
- src/api/adminApi.ts
- src/api/notificationApi.ts

## 8. Important Notes

- The current frontend pages are static prototypes.
- Authentication is not connected yet.
- Admin routes are not protected yet.
- Mock data will be replaced later with real API calls.
- Service pages use “Contact Provider” instead of online payment.
- Online payment is considered a future improvement, not part of the first version.