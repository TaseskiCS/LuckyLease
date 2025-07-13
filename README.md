# LuckyLease - A Sublet Marketplace

 A web-based platform for short-term subletting, focused on student and intern housing, like Facebook Marketplace, but purpose-built for rentals.

![-----------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🚀 Features

### Core Features
- **🍀 Lucky Opinion AI**: Personalized AI advisor that analyzes listings and provides compatibility ratings with pros/cons
- **Authentication**: Email/password signup and login with JWT
- **Listings**: Create, browse, search, and filter property listings with detailed amenities
- **Image Upload**: Multiple image uploads with Supabase Storage
- **Real-time Chat**: Private messaging via Socket.io
- **Interactive Map**: Location-based property discovery with coordinate mapping
- **Advanced Filtering**: Filter by price, location, amenities, bedrooms, bathrooms, school proximity
- **School Integration**: Tailored for university and college students

### Tech Stack
- **Frontend**: Next.js 14 with App Router & TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage
- **Real-time**: Socket.io
- **AI**: Google Gemini API

## 🍀 Lucky Opinion AI

The standout feature of LuckyLease is our AI-powered listing advisor, "Lucky". Users can ask Lucky for personalized opinions on any listing, and the AI analyzes:

- **Budget compatibility** - How the listing price fits your budget
- **Location preferences** - Distance and proximity to schools/campus
- **Amenity matching** - Pet-friendly, parking, laundry, A/C preferences
- **Duration compatibility** - Whether lease terms match your needs

Lucky provides a structured pros and cons analysis with a compatibility rating (0-10) to help students make informed decisions.

## 📁 Project Structure

```
SPURHACK25/
├── client/               # Next.js frontend
│   ├── app/              # App Router pages
│   │   ├── auth/         # Authentication pages
│   │   ├── listings/     # Listing pages (browse, create, details)
│   │   ├── dashboard/    # User dashboard
│   │   ├── map/          # Interactive map
│   │   ├── contact/      # Contact & support
│   │   └── terms/        # Terms of service
│   ├── components/       # Reusable UI components
│   │   └── ui/           # Shadcn/ui components + custom components
│   ├── lib/              # Utility libraries
│   └── data/             # Static data files (schools, etc.)
├── server/               # Express.js backend
│   └── src/
│       ├── routes/       # API routes
│       ├── middleware/   # Express middleware
│       ├── sockets/      # Socket.io handlers
│       └── utils/        # Utility functions (Gemini AI, JWT, Supabase)
```

## 🎯 MVP Status

- ✅ Email/password authentication
- ✅ Create and browse listings
- ✅ Image upload functionality
- ✅ Real-time messaging
- ✅ AI-powered summaries
- ✅ Interactive map integration
- ✅ Production deployment ready

## 👥 Team

Built by the LuckyLease team for **[SPURHACKS25](https://spurhacks.com)**:
- **[Michael Marsillo](https://www.linkedin.com/in/michaelmarsillo)** 
- **[Tony Taseski](https://www.linkedin.com/in/a-taseski)**
- **[Gurshan Sidhar](https://www.linkedin.com/in/gurshan-sidhar)**
- **[Spencer Kelly](https://www.linkedin.com/in/spencergk)** 

## 🆘 Support

For support, email LuckyLease2025@gmail.com or create an issue in the repository.

---
*[Devpost Link](https://devpost.com/software/luckylease)*
