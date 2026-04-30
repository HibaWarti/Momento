# Momento — API Documentation

This document contains the APIs implemented in Momento.

Each section is updated after finishing a backend phase.

---

## Authentication APIs

Base path:

/api/auth

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | /health | Check Auth Service status | No |
| GET | /db-health | Check Auth Service database connection | No |
| POST | /register | Register a new user | No |
| POST | /login | Login user and return JWT token | No |
| GET | /me | Get authenticated user from JWT token | Yes |

---

## User/Profile APIs

Base path:

/api/users

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | /health | Check User Service status | No |
| GET | /db-health | Check User Service database connection | No |
| GET | /profile/me | Get current authenticated user profile | Yes |
| PATCH | /profile/me | Update current authenticated user profile | Yes |
| PATCH | /profile/me/picture | Upload/update current user profile picture | Yes |
| GET | /:id | Get public user profile by ID | No |
| POST | /:id/follow | Follow a user | Yes |
| DELETE | /:id/follow | Unfollow a user | Yes |
| GET | /:id/followers | Get user followers | No |
| GET | /:id/following | Get users followed by this user | No |
| POST | /:id/reports | Report a user | Yes |

---

## Posts APIs

Base path:

/api/posts

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | /health | Check Post Service status | No |
| GET | /db-health | Check Post Service database connection | No |
| GET | /auth-check | Check Post Service authentication middleware | Yes |
| POST | / | Create a new post | Yes |
| GET | / | Get feed/posts list | No |
| GET | /:id | Get post details | No |
| PATCH | /:id | Update own post | Yes |
| DELETE | /:id | Delete own post | Yes |
| POST | /:id/comments | Add comment to post | Yes |
| GET | /:id/comments | Get comments of a post | No |
| DELETE | /comments/:commentId | Delete own comment | Yes |
| POST | /:id/reactions | Add or update reaction | Yes |
| DELETE | /:id/reactions | Remove reaction | Yes |
| POST | /:id/reports | Report a post | Yes |
| POST | /:id/images | Upload images for a post | Yes |
| DELETE | /:id/images/:imageId | Delete a post image | Yes |

---

## Provider and Services APIs

Base path:

/api/providers

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | /health | Check Provider Service status | No |
| GET | /db-health | Check Provider Service database connection | No |
| GET | /auth-check | Check Provider Service authentication middleware | Yes |
| POST | /requests | Submit provider request | Yes |
| POST | /requests/cin-picture | Upload CIN picture for provider request | Yes |
| GET | /requests/me | Get current user's provider requests | Yes |
| GET | / | Get providers list | No |
| GET | /:id | Get provider profile by ID | No |
| GET | /me/profile | Get current provider profile | Yes |
| PATCH | /me/profile | Update current provider profile | Yes |
| GET | /me/services | Get current provider services | Yes |
| POST | /services | Create service | Yes |
| GET | /services | Get services list | No |
| GET | /services/:id | Get service details | No |
| PATCH | /services/:id | Update own service | Yes |
| DELETE | /services/:id | Delete own service | Yes |
| GET | /services/:id/reviews | Get service reviews | No |
| POST | /services/:id/reviews | Add review to service | Yes |
| PATCH | /reviews/:reviewId | Update own review | Yes |
| DELETE | /reviews/:reviewId | Delete own review | Yes |
| POST | /services/:id/reports | Report a service | Yes |
| POST | /services/:id/images | Upload images for a service | Yes |
| DELETE | /services/:id/images/:imageId | Delete a service image | Yes |

---

## Static Uploads

Base path:

/uploads

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | /profiles/:filename | View uploaded profile picture | No |
| GET | /posts/:filename | View uploaded post image | No |
| GET | /cin/:filename | View uploaded CIN picture locally | No |
| GET | /services/:filename | View uploaded service image | No |

Important note:
Local uploads are used for development.
Cloudinary or another cloud storage service should be used later for production deployment.

---

## Admin and Moderation APIs

Base path:

/api/admin

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | /health | Check Admin Service status | No |
| GET | /db-health | Check Admin Service database connection | No |
| GET | /auth-check | Check Admin Service authentication | Yes (Admin/SuperAdmin) |
| GET | /superadmin/auth-check | Check Super Admin authentication | Yes (SuperAdmin only) |
| GET | /users | Get all users | Yes (Admin/SuperAdmin) |
| GET | /users/:id | Get user details by ID | Yes (Admin/SuperAdmin) |
| PATCH | /users/:id/block | Block a user | Yes (Admin/SuperAdmin) |
| PATCH | /users/:id/unblock | Unblock a user | Yes (Admin/SuperAdmin) |
| GET | /provider-requests | Get all provider requests | Yes (Admin/SuperAdmin) |
| GET | /provider-requests/:id | Get provider request details | Yes (Admin/SuperAdmin) |
| PATCH | /provider-requests/:id/reviewing | Mark provider request as reviewing | Yes (Admin/SuperAdmin) |
| PATCH | /provider-requests/:id/approve | Approve provider request | Yes (Admin/SuperAdmin) |
| PATCH | /provider-requests/:id/reject | Reject provider request | Yes (Admin/SuperAdmin) |
| GET | /reports | Get all reports | Yes (Admin/SuperAdmin) |
| GET | /reports/:id | Get report details | Yes (Admin/SuperAdmin) |
| PATCH | /reports/:id/reviewing | Mark report as reviewing | Yes (Admin/SuperAdmin) |
| PATCH | /reports/:id/resolve | Resolve report | Yes (Admin/SuperAdmin) |
| PATCH | /reports/:id/reject | Reject report | Yes (Admin/SuperAdmin) |
| PATCH | /posts/:id/hide | Hide a post | Yes (Admin/SuperAdmin) |
| PATCH | /posts/:id/restore | Restore a post | Yes (Admin/SuperAdmin) |
| PATCH | /services/:id/hide | Hide a service | Yes (Admin/SuperAdmin) |
| PATCH | /services/:id/restore | Restore a service | Yes (Admin/SuperAdmin) |
| PATCH | /reviews/:id/hide | Hide a review | Yes (Admin/SuperAdmin) |
| PATCH | /reviews/:id/restore | Restore a review | Yes (Admin/SuperAdmin) |
| GET | /stats | Get admin dashboard stats | Yes (Admin/SuperAdmin) |
| GET | /logs | Get admin logs | Yes (Admin/SuperAdmin) |
| GET | /superadmin/logs | Get super admin logs | Yes (SuperAdmin only) |
| GET | /superadmin/stats | Get super admin stats | Yes (SuperAdmin only) |

---

## Notifications APIs

Base path:

/api/notifications

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | /health | Check Notification Service status | No |
| GET | /db-health | Check Notification Service database connection | No |
| GET | /auth-check | Check Notification Service authentication middleware | Yes |
| GET | / | Get authenticated user's notifications | Yes |
| GET | /unread-count | Get unread notifications count | Yes |
| PATCH | /:id/read | Mark notification as read | Yes |
| PATCH | /read-all | Mark all notifications as read | Yes |
| DELETE | /:id | Delete notification | Yes |
| POST | /internal | Create notification from another service | Internal |

Important note:
Notifications are implemented with normal HTTP requests in this version.
Real-time notifications can be added later as a future improvement.

---

## Chat APIs

Base path:

/api/chats

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | /health | Check Chat Service status | No |
| GET | /db-health | Check Chat Service database connection | No |
| GET | /auth-check | Check Chat Service authentication middleware | Yes |
| POST | /conversations | Create or get conversation | Yes |
| GET | /conversations | Get current user's conversations | Yes |
| GET | /conversations/:id | Get conversation details | Yes |
| GET | /conversations/:id/messages | Get messages in a conversation | Yes |
| POST | /conversations/:id/messages | Send message | Yes |
| PATCH | /conversations/:id/read | Mark conversation messages as read | Yes |
| DELETE | /messages/:messageId | Delete own message | Yes |

Important note:

Chat is implemented with normal HTTP requests in this version.  
Real-time chat with WebSocket or Socket.IO can be added later as a future improvement.