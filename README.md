# LuckyLease - A Sublet Marketplace


A full-stack MVP for a peer-to-peer sublet marketplace  think Facebook Marketplace but designed for short-term housing like student sublets, intern rentals, or digital nomad stays.

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🚀 Features

### Core Features
- **Authentication**: Email/password signup and login with JWT
- **Listings**: Create, browse, search, and filter property listings
- **Image Upload**: Multiple image uploads with Supabase Storage
- **Real-time Chat**: Private messaging via Socket.io
- **Offers System**: Send and manage rental offers
- **AI Integration**: Gemini API for listing summaries and tags
- **Like/Save**: Save favorite listings

### Tech Stack
- **Frontend**: Next.js 14 with App Router & TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: Supabase PostgreSQL with Prisma ORM
- **File Storage**: Supabase Storage
- **Real-time**: Socket.io
- **AI**: Google Gemini API

## 📁 Project Structure

```
RoomRelay/
├── client/                 # Next.js frontend
│   ├── app/               # App Router pages
│   │   ├── auth/          # Authentication pages
│   │   ├── listings/      # Listing pages
│   │   └── messages/      # Messaging pages
│   ├── components/        # Reusable components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   └── utils/            # Helper functions
├── server/               # Express.js backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── services/     # Business logic
│   │   ├── sockets/      # Socket.io handlers
│   │   └── utils/        # Utility functions
│   └── prisma/           # Database schema
```



## 📊 Database Schema

### Users
- `id`: Unique identifier
- `email`: User email (unique)
- `passwordHash`: Hashed password
- `name`: User's full name
- `isSeller`: Can list properties
- `isRenter`: Can rent properties

### Listings
- `id`: Unique identifier
- `userId`: Owner reference
- `title`: Listing title
- `description`: Detailed description
- `price`: Monthly rent
- `location`: Property location
- `startDate`: Available from
- `endDate`: Available until
- `imageUrls`: Array of image URLs
- `contactMethod`: "email" or "in_app"
- `summary`: AI-generated summary
- `tags`: AI-generated tags

### Messages
- `id`: Unique identifier
- `listingId`: Associated listing
- `senderId`: Message sender
- `receiverId`: Message receiver
- `content`: Message text
- `timestamp`: When sent

### Offers
- `id`: Unique identifier
- `listingId`: Associated listing
- `fromUserId`: Offer sender
- `toUserId`: Offer receiver
- `amount`: Offer amount
- `message`: Offer message
- `status`: "pending", "accepted", "rejected"

### Likes
- `id`: Unique identifier
- `userId`: User who liked
- `listingId`: Liked listing

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/user/me` - Get user's listings

### Messages
- `GET /api/messages/listing/:listingId` - Get conversation
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get user conversations

### Offers
- `GET /api/offers/listing/:listingId` - Get listing offers
- `POST /api/offers` - Send offer
- `PUT /api/offers/:id/status` - Update offer status
- `GET /api/offers/user/me` - Get user's offers

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Build command: `npm run build`
4. Start command: `npm start`

### Database
- Use Supabase production database
- Run migrations: `npx prisma db push`

## 🎯 MVP Goals

- ✅ Email/password authentication
- ✅ Create and browse listings
- ✅ Image upload functionality
- ✅ Real-time messaging
- ✅ Offer system
- ✅ AI-powered summaries
- ✅ Like/save functionality
- ✅ Responsive design
- ✅ Production deployment


## 🆘 Support

For support, email LuckyLease2025@gmail.com or create an issue in the repository. # SPURHACKS25
