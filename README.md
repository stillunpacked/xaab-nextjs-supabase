# XAAB - XISS Alumni Association Bangalore

A complete replica of the IIMBAA website with XAAB branding, featuring a comprehensive backend system with Google OAuth authentication, CRUD operations, and a content management system.

## 🚀 Features

### Frontend
- **Modern Design**: Responsive, mobile-first design with Tailwind CSS
- **Interactive UI**: Smooth animations with Framer Motion
- **SEO Optimized**: Meta tags, structured data, and performance optimized
- **Accessibility**: WCAG compliant with proper ARIA labels

### Backend
- **RESTful API**: Express.js with comprehensive CRUD endpoints
- **Authentication**: Google OAuth 2.0 integration
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Cloudinary integration for media management
- **Email Service**: Nodemailer for contact forms and notifications

### Content Management
- **Admin Dashboard**: Complete CMS for managing all content
- **User Management**: Role-based access control (Admin, Moderator, Member)
- **Media Management**: Upload, organize, and manage images and files
- **Real-time Updates**: Live content updates without page refresh

## 📁 Project Structure

```
xaab/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── about/             # About page
│   │   ├── events/            # Events listing and details
│   │   ├── news/              # News articles
│   │   ├── gallery/           # Photo gallery
│   │   ├── alumni/            # Alumni directory
│   │   ├── contact/           # Contact form
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Admin dashboard
│   │   └── api/               # API routes
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions and configurations
│   └── types/                 # TypeScript type definitions
├── server/                    # Backend Express.js server
│   ├── models/                # MongoDB models
│   ├── routes/                # API route handlers
│   └── index.js               # Server entry point
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **NextAuth.js** - Authentication for Next.js
- **Lucide React** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **Cloudinary** - Cloud-based image management
- **Nodemailer** - Email service

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Google OAuth credentials
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd xaab
   ```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in the environment variables:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/xaab
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   
   # Email
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Server
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start separately
   npm run dev        # Frontend (port 3000)
   npm run server     # Backend (port 5000)
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/api/health

## 📊 Database Models

### User
- Personal information (name, email, profile picture)
- XISS details (batch, graduation year)
- Professional info (company, position, location)
- Role-based permissions (admin, moderator, member)

### Page
- Dynamic page content management
- SEO metadata
- Navigation structure
- Version control

### Event
- Event details and scheduling
- Registration management
- Speaker and sponsor information
- Location and virtual options

### News
- Article content and metadata
- Categories and tags
- Featured and breaking news flags
- View and engagement tracking

### Gallery
- Photo collections
- Event associations
- Image metadata and ordering
- Category organization

### Contact
- Contact form submissions
- Status tracking
- Admin response management

## 🔐 Authentication & Authorization

### Google OAuth Flow
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. User grants permissions
4. Google returns authorization code
5. Backend exchanges code for access token
6. User profile data is fetched and stored
7. JWT token is generated and returned

### Role-Based Access Control
- **Admin**: Full access to all features
- **Moderator**: Content management access
- **Member**: Basic user features

## 📱 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Content Management
- `GET /api/pages` - List pages
- `POST /api/pages` - Create page
- `PUT /api/pages/:id` - Update page
- `DELETE /api/pages/:id` - Delete page

### Events
- `GET /api/events` - List events
- `GET /api/events/upcoming` - Upcoming events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event

### News
- `GET /api/news` - List news articles
- `GET /api/news/featured` - Featured articles
- `POST /api/news` - Create article
- `PUT /api/news/:id` - Update article

### Gallery
- `GET /api/gallery` - List galleries
- `POST /api/gallery` - Create gallery
- `POST /api/gallery/:id/images` - Add images

### Media
- `POST /api/media/upload` - Upload single file
- `POST /api/media/upload-multiple` - Upload multiple files
- `DELETE /api/media/:publicId` - Delete file

## 🎨 Customization

### Branding
All IIMBAA references have been replaced with XAAB:
- Logo and branding elements
- Color scheme (blue, orange, green theme)
- Content and copy
- Contact information

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind configuration in `tailwind.config.js`
- Component-specific styles use Tailwind classes

### Content
- All content is managed through the admin dashboard
- Pages can be created and edited dynamically
- Images and media are uploaded through Cloudinary

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create a new project on Railway/Heroku
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Get connection string
3. Update `MONGODB_URI` in environment variables

## 📈 Performance Optimization

- **Image Optimization**: Next.js Image component with Cloudinary
- **Code Splitting**: Automatic with Next.js App Router
- **Caching**: API response caching
- **SEO**: Meta tags and structured data
- **Lighthouse Score**: 90+ on all metrics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: API rate limiting
- **CORS**: Configured for production
- **Helmet**: Security headers
- **Environment Variables**: Sensitive data protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Email: support@xaab.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Event ticketing system
- [ ] Alumni job board
- [ ] Mentorship matching
- [ ] Payment integration
- [ ] Multi-language support

---

**Built with ❤️ for the XISS Alumni Community**