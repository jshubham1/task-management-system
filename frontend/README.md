# TaskFlow - Task Management System Frontend

A modern, responsive task management application built with Next.js 15, React 19, TypeScript, and Tailwind CSS. This
frontend provides a complete task and project management solution with authentication, dashboard analytics, Kanban
boards, and team collaboration features.

## 🚀 Features

### Authentication & User Management

- **Secure Login/Register** - Form validation with Zod and React Hook Form
- **User Profiles** - Avatar upload, profile editing, account management
- **Settings** - Notifications, theme preferences, localization

### Dashboard & Analytics

- **Overview Dashboard** - Task statistics, project progress, activity feed
- **Interactive Charts** - Task completion trends using Chart.js
- **Quick Actions** - Fast task/project creation, team invitations

### Task Management

- **Kanban Board** - Drag-and-drop task organization with react-beautiful-dnd
- **List View** - Tabular task display with inline editing
- **Advanced Filtering** - Search, status, priority, project, and date filters
- **Task CRUD** - Create, edit, delete tasks with rich forms
- **Priority & Status** - Visual indicators and easy status updates

### Project Management

- **Grid & List Views** - Flexible project display options
- **Project Progress** - Visual progress bars and completion tracking
- **Team Management** - Member assignment and collaboration
- **Color Coding** - Custom project colors for organization

### UI/UX Excellence

- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Smooth Animations** - Framer Motion transitions and micro-interactions
- **Modern Components** - Radix UI primitives with custom styling
- **Dark/Light Theme** - Theme switching support
- **Toast Notifications** - Real-time feedback with react-hot-toast

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI, Headless UI
- **Animations**: Framer Motion
- **Drag & Drop**: react-beautiful-dnd
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Heroicons
- **Notifications**: react-hot-toast

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── layouts/          # Layout components
│   └── features/         # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── stores/               # Zustand stores
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## 🏗️ Architecture

### State Management

- **Authentication**: Zustand store with localStorage persistence
- **Server State**: TanStack Query for API data caching and synchronization
- **Form State**: React Hook Form for form management

### API Integration

- **RESTful API**: Centralized API client with error handling
- **Authentication**: JWT token-based authentication
- **Data Fetching**: Optimistic updates and background refetching

### Component Design

- **Atomic Design**: Reusable UI components with consistent styling
- **Feature Components**: Domain-specific components for tasks, projects, etc.
- **Layout Components**: Responsive layouts with sidebar navigation

## 🎨 Design System

### Colors

- **Primary**: Blue gradient (blue-600 to purple-600)
- **Status Colors**: Green (success), Red (danger), Yellow (warning)
- **Neutral**: Gray scale for backgrounds and text

### Typography

- **Font**: Geist Sans (primary), Geist Mono (code)
- **Scale**: Tailwind's default type scale

### Components

- **Consistent Spacing**: 4px grid system
- **Border Radius**: Rounded corners (4px, 8px, 12px)
- **Shadows**: Subtle elevation with Tailwind shadows

## 🔐 Security

- **Input Validation**: Zod schemas for all forms
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: API token validation
- **Secure Storage**: JWT tokens in localStorage (consider httpOnly cookies for production)

## 📱 Responsive Design

- **Mobile First**: Tailwind's mobile-first breakpoints
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation**: Collapsible sidebar on mobile devices

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

- **Netlify**: Static site deployment
- **AWS Amplify**: Full-stack deployment
- **Docker**: Containerized deployment

## 🧪 Testing (Future Enhancement)

Planned testing setup:

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Testing user workflows
- **E2E Tests**: Playwright for full application testing

## 📈 Performance

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Lazy Loading**: React.lazy for component loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Radix UI for accessible component primitives
- All open-source contributors who made this project possible
