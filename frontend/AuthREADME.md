# FreightFlow Authentication System

A comprehensive authentication and route protection system built for the FreightFlow React application using Next.js 15 App Router.

## Features

### Authentication Infrastructure

- **JWT-based Authentication**: Secure token-based authentication with localStorage storage
- **React Context API**: Global authentication state management
- **Higher-Order Components (HOCs)**: Route protection with `withAuth`, `withAuthRequired`, and `withGuest`
- **Next.js Middleware**: Server-side route protection before page renders
- **TypeScript Support**: Strict typing throughout the application

### Authentication Pages

- **Login Page** (`/login`): Email/password authentication with validation
- **Register Page** (`/register`): User registration with password strength indicator
- **Dashboard Page** (`/dashboard`): Protected dashboard with user stats and activities
- **Profile Page** (`/profile`): Protected user profile settings

### Route Protection

- **Protected Routes**: `/dashboard`, `/profile`, `/settings` require authentication
- **Guest Routes**: `/login`, `/register` redirect authenticated users to dashboard
- **Automatic Redirects**: Unauthenticated users redirected to login with return URL

## File Structure

```
frontend/
├── app/
│   ├── dashboard/page.tsx      # Protected dashboard
│   ├── login/page.tsx          # Login form
│   ├── register/page.tsx       # Registration form
│   ├── profile/page.tsx        # User profile
│   ├── page.tsx               # Home page (routes to Home component)
│   └── layout.tsx             # Root layout with AuthProvider
├── components/
│   └── pages/
│       └── Home.tsx           # Main home page component
├── lib/
│   ├── auth-api.ts            # Authentication API service
│   ├── auth-context.tsx       # React Context for auth state
│   └── with-auth.tsx          # HOCs for route protection
└── middleware.ts              # Next.js middleware for server-side protection
```

## How It Works

### 1. Authentication Flow

1. User visits protected route (e.g., `/dashboard`)
2. Middleware checks for authentication token
3. If not authenticated, redirects to `/login?returnUrl=/dashboard`
4. User logs in successfully
5. Redirected back to original destination (`/dashboard`)

### 2. State Management

- **AuthContext** provides global authentication state
- **useAuth** hook gives access to user data and auth functions
- **localStorage** persists authentication state across sessions

### 3. Route Protection

- **withAuthRequired**: Protects routes requiring authentication
- **withGuest**: Protects routes for unauthenticated users only
- **Middleware**: Server-side protection for better security

### 4. API Integration

- **authApi** service handles all authentication endpoints
- **Error handling** with custom AuthApiError class
- **Token management** with automatic header injection

## Usage

### Protecting a Route

```tsx
import { withAuthRequired } from "@/lib/with-auth";

function ProtectedPage() {
  return <div>This page requires authentication</div>;
}

export default withAuthRequired(ProtectedPage);
```

### Using Authentication State

```tsx
import { useAuth } from "@/lib/auth-context";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user?.name}!</div>;
  }

  return <div>Please log in</div>;
}
```

### Guest-Only Routes

```tsx
import { withGuest } from "@/lib/with-auth";

function LoginPage() {
  return <div>Login form</div>;
}

export default withGuest(LoginPage);
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Protected Routes (Middleware)

Edit `middleware.ts` to add/remove protected routes:

```typescript
const protectedRoutes = ["/dashboard", "/profile", "/settings"];
const guestRoutes = ["/login", "/register"];
```

## Home Page Configuration

The application uses a modular home page structure:

### Current Setup

- **`app/page.tsx`**: Simple routing component that imports and renders the Home component
- **`components/pages/Home.tsx`**: Full featured home page with authentication-aware navigation

### Reverting to Original Home Page

If you want to use the original simple home page instead of the new Home component:

1. **Replace `app/page.tsx` content** with:

```tsx
export default function Home() {
  return <h1>FreightFlow Homepage</h1>;
}
```

2. **Optional**: Delete `components/pages/Home.tsx` if no longer needed

### Benefits of Current Structure

- **Separation of Concerns**: Page routing separated from component logic
- **Reusability**: Home component can be used elsewhere
- **Maintainability**: Easier to modify home page without affecting routing
- **Authentication Integration**: Home page is aware of user authentication state

## Development

### Running the Application

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Security Features

- **Server-side Route Protection**: Middleware prevents unauthorized access
- **Token Validation**: API endpoints verify JWT tokens
- **Secure Storage**: Tokens stored in localStorage with proper cleanup
- **Error Handling**: Graceful handling of authentication errors
- **Type Safety**: TypeScript ensures type safety throughout

## Browser Support

- Modern browsers with ES6+ support
- Next.js 15 App Router compatibility
- React 18+ features

## Notes

- Authentication state persists across browser sessions
- Automatic token refresh can be implemented in the auth API
- All routes are protected by default through middleware
- Guest routes automatically redirect authenticated users
- Loading states are handled throughout the authentication flow

This authentication system provides a robust foundation for secure user management in the FreightFlow application.
