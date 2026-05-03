# Momento — Conception Notes

## 1. Project Overview

Momento is a social platform focused on sharing memories, experiences, and inspiration from past events.  
Users can publish posts, interact with other users, follow profiles, exchange messages, and discover service providers.

The platform includes the following access levels:

- Visitor
- User
- Provider
- Admin
- SuperAdmin

Visitors can see the public landing page and public post detail pages opened by direct post id.  
Registered users can create posts and interact with the platform.  
Providers are registered users whose provider request has been approved by an admin. After approval, the user's role changes from `USER` to `PROVIDER`, and a provider profile is created.  
Admins manage users, moderation, provider requests, reports, services, reviews, logs, and dashboard statistics.  
The SuperAdmin has all admin permissions and can also access SuperAdmin-only statistics and logs.

Momento does not include a separate `Event` entity in the first version. Posts are used to share memories and inspiration related to past events.

---

## 2. Version 1 Scope

In the current v3 direction, Momento focuses on:

- A public landing page for visitors
- Public post access only through a direct post URL/id when content is public
- User authentication and profile management
- Posts with multiple images now, with frontend video support planned in the post flow
- Comments, reactions, follows, saved posts/services, and reports
- Comment reports and comment moderation
- Provider requests with CIN number and CIN picture
- Provider profiles and services with category, subcategory, and searchable keywords
- Service images and service reviews
- User support tickets through "Report a problem"
- Admin moderation of users, posts, comments, reports, services, reviews, and support tickets
- Notifications through HTTP and Socket.IO events
- Chat through HTTP and Socket.IO events
- Logs and statistics for admin and SuperAdmin usage

The first version does not include:

- A separate event management module
- Future event creation or event reservations
- Online payment
- Advanced recommendation algorithms

These features may be considered as future improvements.

---

## 3. Main Business Rules

### 3.1 Visitor Rules

A visitor can:

- View the public landing page
- View a public post detail page when they have the direct post URL/id

A visitor cannot:

- Browse the authenticated feed
- Browse user/provider suggestions
- Browse the search or explore experience
- View private profiles, services, followers, or following lists
- Create posts
- Upload images
- Like or react to posts
- Comment on posts
- Follow users
- Submit provider requests
- Report users, posts, or services
- Send messages
- Access notifications
- Access provider private pages
- Access admin features

---

### 3.2 User Rules

A registered user can:

- Register, log in, and log out
- View their authenticated account through `/auth/me`
- Edit their profile
- Upload or update their profile picture
- Create posts
- Upload multiple images for a post
- Edit their own posts
- Delete their own posts
- Add comments
- Delete their own comments
- Add, update, or remove reactions on posts
- Follow and unfollow users
- Save and unsave posts
- Save and unsave services
- Report posts
- Report comments
- Report users
- Report services
- Open support tickets from "Report a problem"
- Reply to their own support tickets
- Close their own support tickets
- Submit a provider request
- View their provider request history
- Add reviews to services
- Update or delete their own reviews
- Receive notifications
- Start or access conversations where they are a participant
- Send messages in their own conversations
- Delete their own messages

A user cannot:

- Access admin features
- Manage reports
- Approve or reject provider requests
- Hide or restore posts, services, or reviews
- View system logs
- View admin or SuperAdmin statistics
- Create services unless their role is `PROVIDER`

---

### 3.3 Provider Request Rules

A user can submit a request to become a provider.

A provider request must include:

- Professional name
- Professional description
- Phone number
- City
- CIN number
- CIN picture
- Additional information, optional

A user can have only one active provider request at a time. An active request is a request with status `PENDING` or `REVIEWING`.

If the request is approved:

- The request status becomes `APPROVED`
- The user's role changes from `USER` to `PROVIDER`
- A provider profile is created using the information from the approved request
- The provider can access provider-specific pages
- The provider can create and manage services
- A notification can be sent to the user
- A log can be created for the approval action

If the request is rejected:

- The request status becomes `REJECTED`
- The user keeps the normal `USER` role
- No provider profile is created
- The user may submit another request later
- A notification can be sent to the user
- A log can be created for the rejection action

---

### 3.4 Provider Rules

A provider is a user with role `PROVIDER`.

A provider can:

- Keep all normal user features
- Access their provider profile
- Update their provider profile
- Create services
- Add images to services
- View their own services
- Edit their own services
- Delete their own services
- Receive messages from users interested in their services

A provider cannot:

- Approve other provider requests
- Manage reports
- Hide or restore other users' content
- Access admin statistics
- Access system logs

A provider profile can be suspended by moderation using `providerStatus = SUSPENDED`. A suspended provider account can still exist, but provider-specific activity may be limited depending on backend rules.

---

### 3.5 Post Rules

A post belongs to one user.

A post represents a memory, experience, or inspiration related to a past event. Momento does not manage future event creation in version 1.

A post can contain:

- Text content
- Multiple images
- Status
- Creation date
- Update date

A user can:

- Create their own posts
- Upload images for their own posts
- Edit their own posts
- Delete their own posts

A visitor can:

- View active public posts
- View post details
- View comments of a post

An admin or SuperAdmin can:

- Hide posts
- Restore posts
- Moderate inappropriate posts

A user cannot:

- Edit another user's post
- Delete another user's post unless they are authorized as admin or SuperAdmin

---

### 3.6 Comment Rules

A comment belongs to:

- One user
- One post

A user can:

- Add comments to posts
- Delete their own comments

A visitor can:

- View comments of a public post

An admin or SuperAdmin can:

- Moderate inappropriate comments

---

### 3.7 Reaction Rules

A reaction belongs to:

- One user
- One post

A user can react to a post only once.

If the user reacts again to the same post, the old reaction should be updated or removed depending on the chosen backend logic.

Constraint:

- The pair `postId/userId` must be unique

---

### 3.8 Follow Rules

A user can follow another user.

A user cannot follow themselves.

A follow relation must be unique between two users.

Example:

If user A follows user B, the same relation cannot be duplicated.

Constraint:

- The pair `followerId/followingId` must be unique

---

### 3.9 Report Rules

A user can report:

- A post
- A comment
- Another user
- A service

A report contains:

- Reporter
- Reported user, optional
- Reported post, optional
- Reported comment, optional
- Reported service, optional
- Reason
- Description, optional
- Status
- Moderation note, optional
- Action taken, optional
- Creation date
- Review date
- Reviewer, optional

A report should concern one main target: either a post, a comment, a user, or a service.

An admin or SuperAdmin can:

- View reports
- View report details
- Mark reports as reviewing
- Resolve reports
- Reject reports
- Take moderation actions
- Link a report to a support ticket when the user opens a broader problem ticket

---

### 3.10 Service Rules

A service belongs to one provider profile.

Only a user with role `PROVIDER` can create services.

A service can contain:

- Title
- Description
- Price, optional
- City
- Category
- Subcategory, optional
- Search keywords
- Status
- Images
- Reviews

A provider can:

- Create services
- View their own services
- Edit their own services
- Delete their own services
- Upload service images
- Delete service images

A visitor can:

- View public active services
- View service details
- View service reviews

An admin or SuperAdmin can:

- Hide services
- Restore services
- Moderate inappropriate services

---

### 3.11 Review Rules

A review belongs to:

- One user
- One service

A user can:

- Add a review to a service
- Update their own review
- Delete their own review

A visitor can:

- View visible reviews of a service

An admin or SuperAdmin can:

- Hide reviews
- Restore reviews
- Moderate inappropriate reviews

Constraint:

- One user can review the same service only once

---

### 3.12 Admin Rules

An admin can:

- View users
- View user details
- Block users
- Unblock users
- Review provider requests
- Mark provider requests as reviewing
- Approve provider requests
- Reject provider requests
- Review reports
- Mark reports as reviewing
- Resolve reports
- Reject reports
- Hide posts
- Restore posts
- Hide services
- Restore services
- Hide reviews
- Restore reviews
- View admin dashboard statistics
- View admin logs
- Access all regular admin moderation features

An admin cannot:

- Access SuperAdmin-only statistics
- Access SuperAdmin-only logs
- Manage system-level settings unless authorized

---

### 3.13 SuperAdmin Rules

A SuperAdmin can:

- Access all admin features
- View SuperAdmin-only statistics
- View SuperAdmin-only logs
- Monitor global platform activity
- Manage important administrative actions

---

### 3.14 Notification Rules

A notification belongs to one user.

A user can:

- View their notifications
- View their unread notification count
- Mark one notification as read
- Mark all notifications as read
- Delete a notification

Notifications are persisted through HTTP APIs and delivered live through Socket.IO events when the user is connected.

---

### 3.15 Chat Rules

A user can start a conversation with another user or with a provider.

A conversation can contain multiple participants and multiple messages.

A message belongs to:

- One conversation
- One sender

A user can only view conversations where they are a participant.

A user can only view messages from conversations where they are a participant.

A provider can receive messages from users interested in their services.

Real-time chat events are handled with Socket.IO while HTTP endpoints remain the source of truth for persistence.

---

### 3.16 Support Ticket Rules

A support ticket is opened by a registered user from "Report a problem".

A support ticket can contain:

- User who opened the ticket
- Assigned admin, optional
- Subject
- Description
- Category
- Priority
- Status
- Linked reported item, optional
- Linked report, optional
- Messages between the user and admins
- Creation date, update date, and close date

A user can:

- Create a support ticket
- View their own tickets
- Reply to their own tickets
- Close their own tickets

An admin or SuperAdmin can:

- View all tickets
- Assign a ticket
- Change status and priority
- Reply to the user
- Link ticket context to a report or reported item

Ticket statuses:

- OPEN
- IN_PROGRESS
- WAITING_FOR_USER
- RESOLVED
- CLOSED

---

## 4. Main Entities

### 4.1 User

Represents a platform account.

Fields:

- id
- firstName
- lastName
- username
- email
- password
- profilePicturePath
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
- A user can submit many provider requests
- A user can review provider requests as admin or SuperAdmin
- A user can have one provider profile
- A user can create reports
- A user can be reported by other users
- A user can review reports as admin or SuperAdmin
- A user can receive notifications
- A user can create reviews for services
- A user can participate in many conversations
- A user can send many messages
- A user can be the actor of many logs

---

### 4.2 Post

Represents a publication shared by a user.

Fields:

- id
- content
- status
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

### 4.3 PostImage

Represents an image attached to a post.

Fields:

- id
- imagePath
- postId
- createdAt

Relations:

- A post image belongs to one post

---

### 4.4 Comment

Represents a comment on a post.

Fields:

- id
- content
- status
- postId
- userId
- createdAt
- updatedAt

Relations:

- A comment belongs to one post
- A comment belongs to one user
- A comment can have many reports
- A comment can be linked to support tickets

---

### 4.5 Reaction

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
- The pair `postId/userId` must be unique

---

### 4.6 Follow

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
- The pair `followerId/followingId` must be unique

---

### 4.7 ProviderRequest

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
- A provider request may be reviewed by one admin or SuperAdmin

---

### 4.8 ProviderProfile

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

Constraint:

- One user can have only one provider profile
- `userId` must be unique

---

### 4.9 Service

Represents a service offered by a provider.

Fields:

- id
- providerProfileId
- title
- description
- price
- city
- category
- subcategory
- keywords
- status
- createdAt
- updatedAt

Relations:

- A service belongs to one provider profile
- A service can have many images
- A service can have many reviews
- A service can have many reports

---

### 4.10 ServiceImage

Represents an image attached to a provider service.

Fields:

- id
- serviceId
- imagePath
- createdAt

Relations:

- A service image belongs to one service

---

### 4.11 Report

Represents a report submitted by a user.

Fields:

- id
- reporterId
- reportedUserId
- postId
- commentId
- serviceId
- reason
- description
- status
- moderationNote
- actionTaken
- createdAt
- reviewedAt
- reviewedById

Relations:

- A report belongs to one reporter
- A report may concern one reported user
- A report may concern one post
- A report may concern one comment
- A report may concern one service
- A report may be reviewed by one admin or SuperAdmin
- A report may be linked to support tickets

Rule:

- A report should concern one main target: either a user, a post, a comment, or a service

---

### 4.12 Notification

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

### 4.13 Log

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

### 4.14 Review

Represents a user review for a service offered by a provider.

Fields:

- id
- userId
- serviceId
- rating
- comment
- status
- createdAt
- updatedAt

Relations:

- A review belongs to one user
- A review belongs to one service

Constraint:

- One user can review the same service only once
- The pair `userId/serviceId` must be unique

---

### 4.15 Conversation

Represents a private discussion between users.

Fields:

- id
- createdAt
- updatedAt

Relations:

- A conversation can have many participants
- A conversation can have many messages

---

### 4.16 ConversationParticipant

Represents a user participating in a conversation.

Fields:

- id
- conversationId
- userId
- createdAt

Relations:

- A conversation participant belongs to one conversation
- A conversation participant belongs to one user

Constraint:

- A user can only appear once in the same conversation
- The pair `conversationId/userId` must be unique

---

### 4.17 Message

Represents a message sent inside a conversation.

Fields:

- id
- conversationId
- senderId
- content
- isRead
- createdAt
- updatedAt

Relations:

- A message belongs to one conversation
- A message belongs to one sender

---

### 4.18 SavedPost

Represents a post saved by a user.

Fields:

- id
- userId
- postId
- createdAt

Relations:

- A saved post belongs to one user
- A saved post belongs to one post

Constraint:

- One user can save the same post only once
- The pair `userId/postId` must be unique

---

### 4.19 SavedService

Represents a service saved by a user.

Fields:

- id
- userId
- serviceId
- createdAt

Relations:

- A saved service belongs to one user
- A saved service belongs to one service

Constraint:

- One user can save the same service only once
- The pair `userId/serviceId` must be unique

---

### 4.20 SupportTicket

Represents a support request opened through "Report a problem".

Fields:

- id
- userId
- assignedToId
- relatedUserId
- relatedPostId
- relatedCommentId
- relatedServiceId
- relatedReportId
- subject
- description
- category
- status
- priority
- createdAt
- updatedAt
- closedAt

Relations:

- A support ticket belongs to the user who opened it
- A support ticket may be assigned to an admin or SuperAdmin
- A support ticket may link to a user, post, comment, service, or report
- A support ticket can have many support ticket messages

---

### 4.21 SupportTicketMessage

Represents a message inside a support ticket.

Fields:

- id
- ticketId
- authorId
- message
- isStaff
- createdAt

Relations:

- A support ticket message belongs to one support ticket
- A support ticket message belongs to one author

---

## 5. Enums

### 5.1 UserRole

Possible values:

- USER
- PROVIDER
- ADMIN
- SUPERADMIN

---

### 5.2 AccountStatus

Possible values:

- ACTIVE
- BLOCKED
- DELETED

---

### 5.3 ProviderRequestStatus

Possible values:

- PENDING
- REVIEWING
- APPROVED
- REJECTED

---

### 5.4 ProviderStatus

Possible values:

- ACTIVE
- SUSPENDED

---

### 5.5 PostStatus

Possible values:

- ACTIVE
- HIDDEN
- DELETED

---

### 5.6 CommentStatus

Possible values:

- VISIBLE
- HIDDEN
- DELETED

---

### 5.7 ServiceStatus

Possible values:

- ACTIVE
- HIDDEN
- DELETED

---

### 5.8 ReportStatus

Possible values:

- PENDING
- REVIEWING
- RESOLVED
- REJECTED

---

### 5.9 ReviewStatus

Possible values:

- VISIBLE
- HIDDEN

---

### 5.10 NotificationType

Possible values:

- LIKE
- COMMENT
- FOLLOW
- PROVIDER_REQUEST_APPROVED
- PROVIDER_REQUEST_REJECTED
- REPORT_STATUS
- TICKET_STATUS
- TICKET_REPLY
- SYSTEM

---

### 5.11  LogAction

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
- REPORT_CREATED
- SERVICE_CREATED
- SERVICE_DELETED
- TICKET_CREATED
- TICKET_UPDATED
- TICKET_MESSAGE_CREATED

---

### 5.12 TicketStatus

Possible values:

- OPEN
- IN_PROGRESS
- WAITING_FOR_USER
- RESOLVED
- CLOSED

---

### 5.13 TicketPriority

Possible values:

- LOW
- NORMAL
- HIGH
- URGENT

---

### 5.14 TicketCategory

Possible values:

- ACCOUNT
- TECHNICAL
- REPORT
- PROVIDER
- OTHER

---

## 6. Database Structure Summary

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
│       ├── ServiceImage
│       ├── Review
│       └── Report
│
├── Follow
├── Notification
├── ConversationParticipant
├── Message
├── Review
└── Log

Conversation
├── ConversationParticipant
└── Message
```

---

## 7. Main API Modules

The backend is organized around the following API modules:

- Authentication APIs: registration, login, and authenticated user retrieval
- User/Profile APIs: profile management, public profile access, follow system, and user reports
- Posts APIs: posts, post images, comments, reactions, saved posts, post reports, and comment reports
- Provider and Services APIs: provider requests, CIN picture upload, provider profiles, services, service images, service reviews, saved services, and service reports
- Support Ticket APIs: user ticket creation, ticket history, ticket messages, and ticket closing
- Admin and Moderation APIs: users, provider requests, reports, support tickets, post moderation, comment moderation, service moderation, review moderation, statistics, and logs
- Notifications APIs: user notifications and unread count
- Chat APIs: conversations, messages, read status, and message deletion
- Static Uploads: local development access to uploaded profile, post, CIN, and service images

---

## 8. Uploads and Storage

The first version uses local uploads for development.

The upload paths are organized by type:

- `/uploads/profiles/:filename`
- `/uploads/posts/:filename`
- `/uploads/cin/:filename`
- `/uploads/services/:filename`

For production deployment, a cloud storage service such as Cloudinary or another external storage provider should be used later.

---

## 9. Important Notes for Implementation

### 9.1 Provider Approval Logic

When an admin or SuperAdmin approves a provider request, the backend should update the request, update the user role, and create the provider profile in the same logical operation.

Expected result:

- `ProviderRequest.status = APPROVED`
- `User.role = PROVIDER`
- `ProviderProfile` is created
- Optional notification is created
- Optional log is created

### 9.2 Rejection Logic

When an admin or SuperAdmin rejects a provider request:

- `ProviderRequest.status = REJECTED`
- `User.role` remains `USER`
- No provider profile is created
- Optional notification is created
- Optional log is created

### 9.3 Provider Access Logic

Provider pages and provider service management should require:

- Authenticated user
- `role = PROVIDER`
- Existing provider profile
- Active account status

### 9.4 Admin Access Logic

Admin moderation pages should require:

- `role = ADMIN` or `role = SUPERADMIN`

SuperAdmin-only pages should require:

- `role = SUPERADMIN`

### 9.5 Token Refresh Note

After a provider request is approved, a user who is already logged in may still have an old token containing `role = USER`. To avoid frontend mismatch, the frontend should refresh the authenticated user using `/api/auth/me` or ask the user to log in again.
