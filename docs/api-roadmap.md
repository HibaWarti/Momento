# Momento — API Roadmap

This document contains the complete API roadmap for Momento.

It has two parts:

1. Final API list: all APIs that should exist by the end of the project.
2. Done APIs: only APIs that are already implemented and tested.

---

# Part 1 — Final API List

## 1. Auth Service

Base path:

/api/auth

| Method | Route | Description |
|---|---|---|
| GET | /health | Check Auth Service status |
| GET | /db-health | Check Auth Service database connection |
| POST | /register | Register a new user |
| POST | /login | Login user and return JWT token |
| GET | /me | Get authenticated user from JWT token |
| POST | /logout | Logout user on frontend side / invalidate session if needed |

---

## 2. User Service

Base path:

/api/users

| Method | Route | Description |
|---|---|---|
| GET | /health | Check User Service status |
| GET | /db-health | Check User Service database connection |
| GET | /profile/me | Get current authenticated user profile |
| PATCH | /profile/me | Update current authenticated user profile |
| PATCH | /profile/me/picture | Update current user profile picture |
| GET | /:id | Get public user profile by ID |
| GET | /:id/posts | Get posts created by a specific user |
| POST | /:id/follow | Follow a user |
| DELETE | /:id/follow | Unfollow a user |
| GET | /:id/followers | Get user followers |
| GET | /:id/following | Get users followed by this user |
| GET | /search | Search users by username/name |

---

## 3. Post Service

Base path:

/api/posts

| Method | Route | Description |
|---|---|---|
| GET | /health | Check Post Service status |
| GET | /db-health | Check Post Service database connection |
| POST | / | Create a new post |
| GET | / | Get feed/posts list |
| GET | /:id | Get post details |
| PATCH | /:id | Update own post |
| DELETE | /:id | Delete own post |
| POST | /:id/images | Upload images for a post |
| DELETE | /:id/images/:imageId | Delete a post image |
| POST | /:id/comments | Add comment to post |
| GET | /:id/comments | Get comments of a post |
| PATCH | /comments/:commentId | Update own comment |
| DELETE | /comments/:commentId | Delete own comment |
| POST | /:id/reactions | Add or update reaction |
| DELETE | /:id/reactions | Remove reaction |
| POST | /:id/reports | Report a post |
| GET | /user/:userId | Get posts by user |
| GET | /search | Search posts |

---

## 4. Provider Service

Base path:

/api/providers

| Method | Route | Description |
|---|---|---|
| GET | /health | Check Provider Service status |
| GET | /db-health | Check Provider Service database connection |
| POST | /requests | Submit provider request |
| GET | /requests/me | Get current user's provider request status |
| GET | /requests/me/latest | Get latest provider request of current user |
| GET | / | Get providers list |
| GET | /:id | Get provider profile by ID |
| GET | /me/profile | Get current provider profile |
| PATCH | /me/profile | Update current provider profile |
| POST | /services | Create a service |
| GET | /services | Get services list |
| GET | /services/:id | Get service details |
| GET | /me/services | Get services created by current provider |
| PATCH | /services/:id | Update own service |
| DELETE | /services/:id | Delete own service |
| POST | /services/:id/images | Upload service images |
| DELETE | /services/:id/images/:imageId | Delete service image |
| POST | /services/:id/reviews | Add review to service |
| GET | /services/:id/reviews | Get reviews of a service |
| PATCH | /reviews/:reviewId | Update own review |
| DELETE | /reviews/:reviewId | Delete own review |

Important business rules:

- Provider request must include CIN number.
- Provider request must include CIN picture.
- A user can have only one pending provider request at a time.
- If a request is approved, a provider profile is created.
- Services are contacted through discussion/chat, not direct payment.
- Reviews belong to services, not provider profiles.

---

## 5. Admin Service

Base path:

/api/admin

| Method | Route | Description |
|---|---|---|
| GET | /health | Check Admin Service status |
| GET | /db-health | Check Admin Service database connection |
| GET | /users | Get all users |
| GET | /users/:id | Get user details for admin |
| PATCH | /users/:id/block | Block user |
| PATCH | /users/:id/unblock | Unblock user |
| GET | /provider-requests | Get provider requests |
| GET | /provider-requests/:id | Get provider request details |
| PATCH | /provider-requests/:id/reviewing | Mark provider request as reviewing |
| PATCH | /provider-requests/:id/approve | Approve provider request |
| PATCH | /provider-requests/:id/reject | Reject provider request |
| GET | /reports | Get all reports |
| GET | /reports/:id | Get report details |
| PATCH | /reports/:id/reviewing | Mark report as reviewing |
| PATCH | /reports/:id/resolve | Resolve report |
| PATCH | /reports/:id/reject | Reject report |
| PATCH | /posts/:id/hide | Hide reported post |
| PATCH | /posts/:id/restore | Restore hidden post |
| PATCH | /services/:id/hide | Hide service |
| PATCH | /services/:id/restore | Restore service |
| PATCH | /reviews/:id/hide | Hide review |
| PATCH | /reviews/:id/restore | Restore review |
| GET | /stats | Get admin dashboard statistics |
| GET | /logs | Get system logs |

---

## 6. SuperAdmin Features

Base path:

/api/admin/superadmin

| Method | Route | Description |
|---|---|---|
| GET | /stats | View global platform statistics |
| GET | /logs | View global system logs |
| GET | /admins | View admin accounts |
| POST | /admins | Create admin account if needed |
| PATCH | /admins/:id/disable | Disable admin account if needed |

Important:

- SuperAdmin has all admin permissions.
- SuperAdmin can view global logs and platform statistics.
- Admin account management is optional for the first version.

---

## 7. Notification Service

Base path:

/api/notifications

| Method | Route | Description |
|---|---|---|
| GET | /health | Check Notification Service status |
| GET | /db-health | Check Notification Service database connection |
| GET | / | Get authenticated user's notifications |
| GET | /unread-count | Get unread notifications count |
| PATCH | /:id/read | Mark notification as read |
| PATCH | /read-all | Mark all notifications as read |
| DELETE | /:id | Delete notification |

Internal route:

| Method | Route | Description |
|---|---|---|
| POST | /internal | Create notification from another service |

Notification examples:

- Like on post
- Comment on post
- New follower
- Provider request approved
- Provider request rejected
- Report status updated
- System notification

---

## 8. Chat Service

Base path:

/api/chats

| Method | Route | Description |
|---|---|---|
| GET | /health | Check Chat Service status |
| GET | /db-health | Check Chat Service database connection |
| POST | /conversations | Create or get conversation |
| GET | /conversations | Get current user's conversations |
| GET | /conversations/:id | Get conversation details |
| GET | /conversations/:id/messages | Get messages in a conversation |
| POST | /conversations/:id/messages | Send message |
| PATCH | /conversations/:id/read | Mark conversation messages as read |
| DELETE | /messages/:messageId | Delete own message |

Important:

- Chat is used to contact/discuss with providers.
- The first version can use normal HTTP requests.
- Real-time messaging with WebSocket or Socket.IO is a future improvement.

---

## 9. Upload / Static Files

Depending on implementation, uploads may be handled inside each service or through a shared upload utility.

Needed uploads:

| Feature | Upload Type |
|---|---|
| Profile picture | Image |
| Post images | Multiple images |
| Service images | Multiple images |
| CIN picture | Image |

Development strategy:

- Local uploads first
- Cloudinary or similar service later for deployment

---

# Part 2 — Done APIs

Only add APIs here when they are implemented and tested.

## Auth Service — Done

Base path:

/api/auth

| Method | Route |
|---|---|
| GET | /health |
| GET | /db-health |
| POST | /register |
| POST | /login |
| GET | /me |

---

## User Service — Done

Base path:

/api/users

| Method | Route |
|---|---|
| GET | /health |

---

## Post Service — Done

Base path:

/api/posts

| Method | Route |
|---|---|
| GET | /health |

---

## Provider Service — Done

Base path:

/api/providers

| Method | Route |
|---|---|
| GET | /health |

---

## Admin Service — Done

Base path:

/api/admin

| Method | Route |
|---|---|
| GET | /health |

---

## Notification Service — Done

Base path:

/api/notifications

| Method | Route |
|---|---|
| GET | /health |

---

## Chat Service — Done

Base path:

/api/chats

| Method | Route |
|---|---|
| - | Nothing implemented yet |

---

# Part 3 — Frontend Integration Tracking

Use this part to track whether frontend pages are static or connected to real APIs.

| Feature | Related API | Frontend Status |
|---|---|---|
| Landing page | None | STATIC_UI |
| Login page | POST /api/auth/login | STATIC_UI |
| Register page | POST /api/auth/register | STATIC_UI |
| Profile page | GET /api/users/profile/me | STATIC_UI |
| Edit profile | PATCH /api/users/profile/me | PLANNED |
| Feed page | GET /api/posts | STATIC_UI |
| Create post | POST /api/posts | PLANNED |
| Post details | GET /api/posts/:id | PLANNED |
| Comments | GET /api/posts/:id/comments | PLANNED |
| Reactions | POST /api/posts/:id/reactions | PLANNED |
| Services page | GET /api/providers/services | STATIC_UI |
| Service details | GET /api/providers/services/:id | STATIC_UI |
| Provider profile | GET /api/providers/:id | STATIC_UI |
| Provider request page | POST /api/providers/requests | STATIC_UI |
| Notifications page | GET /api/notifications | STATIC_UI |
| Admin dashboard | GET /api/admin/stats | STATIC_UI |
| Admin provider requests | GET /api/admin/provider-requests | STATIC_UI |
| Admin reports | GET /api/admin/reports | STATIC_UI |
| Chat page | GET /api/chats/conversations | PLANNED |

---

# Part 4 — Notes

- Update this document after every backend feature.
- Move APIs to the Done section only after testing them.
- Keep frontend status updated when pages are connected to real backend data.
- The first version does not include direct online payment.
- Users contact providers through chat/discussion.
- Real-time chat, booking, payment, and recommendations are future improvements.