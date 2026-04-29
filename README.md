# Momento

Momento is a social platform focused on sharing memories and inspiration from past events.  
The platform allows users to publish posts, interact with content, follow other users, and discover service providers.

## Main Features

- User registration and authentication
- Public browsing of posts and profiles
- Post creation with multiple images
- Likes, comments, and follows
- Provider request system
- Provider profiles and services
- Reports and moderation
- Admin dashboard
- SuperAdmin statistics and logs
- Notifications

## Technologies

### Frontend

- React.js
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

### Images

- Local uploads during development
- Cloudinary for production deployment

### Deployment

- Frontend: Vercel
- Backend: Render or Railway
- Database: Neon, Supabase, or Railway

## Project Structure

```txt
momento/
├── frontend/
├── api-gateway/
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── post-service/
│   ├── provider-service/
│   ├── admin-service/
│   └── notification-service/
├── docs/
└── README.md

```

## Documentation

Project documentation is available in the `docs/` folder.

Main documents:

- `docs/conception.md`
- `docs/architecture.md`
- `docs/local-development.md`
- `docs/frontend-structure.md`

Main development commands:

- npm run dev:backend
- npm run dev:frontend
- npm run dev