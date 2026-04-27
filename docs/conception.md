# Momento — Conception Notes

## 1. Project Overview

Momento is a social platform focused on sharing memories and inspiration from past events.  
Users can publish posts, interact with other users, follow profiles, and discover service providers.

The platform includes different roles:

- Visitor
- User
- Provider
- Admin
- SuperAdmin

Visitors can browse public content without authentication.  
Registered users can create posts and interact with the platform.  
Providers are users who have been approved by an admin after submitting a provider request.  
Admins manage moderation and provider requests.  
The SuperAdmin monitors global statistics and platform logs.

---

## 2. Main Business Rules

### 2.1 Visitor Rules

A visitor can:

- Browse public posts
- View public user profiles
- View provider profiles
- View services

A visitor cannot:

- Create posts
- Like posts
- Comment on posts
- Follow users
- Submit provider requests
- Report content

---

### 2.2 User Rules

A registered user can:

- Log in and log out
- Edit their profile
- Create posts
- Upload multiple images for a post
- Like posts
- Comment on posts
- Follow and unfollow users
- Report posts
- Report users
- Submit a provider request

A user cannot:

- Access admin features
- Manage reports
- Approve provider requests
- View system logs
- View global platform statistics

---

### 2.3 Provider Request Rules

A user can submit a request to become a provider.

A provider request must include:

- Professional name
- Professional description
- Phone number
- City
- CIN number
- CIN picture
- Additional information, optional

A user can have only one pending provider request at a time.

If the request is approved:

- The user becomes a provider
- A provider profile is created
- The provider can add services

If the request is rejected:

- The user keeps the normal user role
- The user may submit another request later

---

### 2.4 Provider Rules

A provider can:

- Keep all normal user features
- Manage their provider profile
- Create services
- Add images to services
- Edit their services
- Delete their services

A provider cannot:

- Approve other provider requests
- Manage reports
- Access admin statistics
- Access system logs

---

### 2.5 Post Rules

A post belongs to one user.

A post can contain:

- Text content
- Multiple images
- Creation date
- Update date

A user can:

- Create their own posts
- Edit their own posts
- Delete their own posts

A user cannot:

- Edit another user's post
- Delete another user's post, unless they are an admin/moderator

---

### 2.6 Comment Rules

A comment belongs to:

- One user
- One post

A user can:

- Add comments
- Delete their own comments

An admin can delete inappropriate comments.

---

### 2.7 Reaction Rules

A reaction belongs to:

- One user
- One post

A user can react to a post only once.

If the user reacts again to the same post, the old reaction should be updated or removed depending on the chosen logic.

---

### 2.8 Follow Rules

A user can follow another user.

A user cannot follow themselves.

A follow relation must be unique between two users.

Example:

If user A follows user B, the same relation cannot be duplicated.

---

### 2.9 Report Rules

A user can report:

- A post
- Another user

A report contains:

- Reason
- Description
- Status
- Creation date
- Review date

An admin can:

- View reports
- Review reports
- Mark reports as resolved
- Reject reports
- Take moderation actions

---

### 2.10 Admin Rules

An admin can:

- View users
- Block users
- Unblock users
- Review provider requests
- Approve provider requests
- Reject provider requests
- Review reports
- Moderate posts and comments
- Manage public inspiration content if needed

An admin cannot:

- Access SuperAdmin-only features
- Manage system-level settings unless authorized

---

### 2.11 SuperAdmin Rules

A SuperAdmin can:

- View global statistics
- View system logs
- Monitor platform activity
- Manage important administrative actions
- Access all admin features

---

## 3. Main Entities

### 3.1 User

Represents a platform account.

Fields:

- id
- firstName
- lastName
- username
- email
- password
- profilePicture
- bio
- role
- accountStatus
- createdAt
- updatedAt

Relations:

- A user can create many posts
- A user can create many comments
- A user can react to many posts
- A user can follow many users
- A user can be followed by many users
- A user can submit provider requests
- A user can have one provider profile
- A user can create reports
- A user can receive notifications

---

### 3.2 Post

Represents a publication shared by a user.

Fields:

- id
- content
- authorId
- createdAt
- updatedAt

Relations:

- A post belongs to one user
- A post can have many images
- A post can have many comments
- A post can have many reactions
- A post can have many reports

---

### 3.3 PostImage

Represents an image attached to a post.

Fields:

- id
- imagePath
- postId
- createdAt

Relations:

- A post image belongs to one post

---

### 3.4 Comment

Represents a comment on a post.

Fields:

- id
- content
- postId
- userId
- createdAt
- updatedAt

Relations:

- A comment belongs to one post
- A comment belongs to one user

---

### 3.5 Reaction

Represents a user reaction to a post.

Fields:

- id
- type
- postId
- userId
- createdAt

Relations:

- A reaction belongs to one post
- A reaction belongs to one user

Constraint:

- One user can react only once to the same post

---

### 3.6 Follow

Represents a follow relation between two users.

Fields:

- id
- followerId
- followingId
- createdAt

Relations:

- A follow has one follower
- A follow has one followed user

Constraint:

- A user cannot follow themselves
- The pair followerId/followingId must be unique

---

### 3.7 ProviderRequest

Represents a request submitted by a user to become a provider.

Fields:

- id
- userId
- professionalName
- professionalDescription
- phone
- city
- cinNumber
- cinPicturePath
- additionalInfo
- status
- submittedAt
- reviewedAt
- reviewedById

Relations:

- A provider request belongs to one user
- A provider request may be reviewed by one admin

---

### 3.8 ProviderProfile

Represents the professional profile of an approved provider.

Fields:

- id
- userId
- professionalName
- professionalDescription
- phone
- city
- providerStatus
- createdAt
- updatedAt

Relations:

- A provider profile belongs to one user
- A provider profile can have many services

---

### 3.9 Service

Represents a service offered by a provider.

Fields:

- id
- providerProfileId
- title
- description
- price
- city
- category
- status
- createdAt
- updatedAt

Relations:

- A service belongs to one provider profile
- A service can have many images

---

### 3.10 ServiceImage

Represents an image attached to a provider service.

Fields:

- id
- serviceId
- imagePath
- createdAt

Relations:

- A service image belongs to one service

---

### 3.11 Report

Represents a report submitted by a user.

Fields:

- id
- reporterId
- reportedUserId
- postId
- reason
- description
- status
- createdAt
- reviewedAt
- reviewedById

Relations:

- A report belongs to one reporter
- A report may concern one reported user
- A report may concern one post
- A report may be reviewed by one admin

Rule:

A report should concern either a post or a user.

---

### 3.12 Notification

Represents a notification sent to a user.

Fields:

- id
- userId
- type
- title
- message
- isRead
- createdAt

Relations:

- A notification belongs to one user

---

### 3.13 Log

Represents an important system action.

Fields:

- id
- actorId
- action
- entityType
- entityId
- description
- createdAt

Relations:

- A log may belong to one actor/user

---

## 4. Enums

### UserRole

Possible values:

- USER
- PROVIDER
- ADMIN
- SUPERADMIN

---

### AccountStatus

Possible values:

- ACTIVE
- BLOCKED
- DELETED

---

### ProviderRequestStatus

Possible values:

- PENDING
- REVIEWING
- APPROVED
- REJECTED

---

### ProviderStatus

Possible values:

- ACTIVE
- SUSPENDED

---

### PostStatus

Possible values:

- ACTIVE
- HIDDEN
- DELETED

---

### ServiceStatus

Possible values:

- ACTIVE
- HIDDEN
- DELETED

---

### ReactionType

Possible values:

- LIKE
- LOVE
- WOW
- HAHA
- SAD
- ANGRY

---

### ReportStatus

Possible values:

- PENDING
- REVIEWING
- RESOLVED
- REJECTED

---

### ReviewStatus

Possible values:

- VISIBLE
- HIDDEN

---

### NotificationType

Possible values:

- LIKE
- COMMENT
- FOLLOW
- PROVIDER_REQUEST_APPROVED
- PROVIDER_REQUEST_REJECTED
- REPORT_STATUS
- SYSTEM

---

### LogAction

Possible values:

- USER_LOGIN
- USER_REGISTER
- POST_CREATED
- POST_DELETED
- PROVIDER_REQUEST_SUBMITTED
- PROVIDER_REQUEST_APPROVED
- PROVIDER_REQUEST_REJECTED
- USER_BLOCKED
- USER_UNBLOCKED
- REPORT_REVIEWED
- SERVICE_CREATED
- SERVICE_DELETED

---

## 5. Database Structure Summary

```txt
User
├── Post
│   ├── PostImage
│   ├── Comment
│   ├── Reaction
│   └── Report
│
├── ProviderRequest
├── ProviderProfile
│   └── Service
│       └── ServiceImage
│
├── Follow
├── Notification
└── Log