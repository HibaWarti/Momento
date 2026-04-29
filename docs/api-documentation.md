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
| GET | /:id | Get public user profile by ID | No |
| POST | /:id/follow | Follow a user | Yes |
| DELETE | /:id/follow | Unfollow a user | Yes |
| GET | /:id/followers | Get user followers | No |
| GET | /:id/following | Get users followed by this user | No |

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


---

## Phase 6 — Provider and Services APIs

Base path:

/api/providers

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | /health | Check Provider Service status | No |
| GET | /db-health | Check Provider Service database connection | No |
| GET | /auth-check | Check Provider Service authentication middleware | Yes |
| POST | /requests | Submit provider request | Yes |
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

---

## Admin and Moderation APIs

Base path:

/api/admin

To be added after Phase 8.

---

## Notifications APIs

Base path:

/api/notifications

To be added after Phase 9.

---

## Chat APIs

Base path:

/api/chats

To be added after Phase 10.
