# 🚚 Smart Delivery Management System

A modern, efficient delivery management platform built with Next.js 14, TypeScript, and Supabase.

## ✨ Features

- 📦 **Order Management**
  - Create and track delivery orders
  - Real-time status updates
  - Customer information management

- 👥 **Delivery Partner Management**
  - Partner profiles and performance metrics
  - Area-based assignment
  - Success rate tracking

- 📍 **Assignment System**
  - Smart order-to-partner matching
  - Real-time delivery tracking
  - Performance analytics

- 🎨 **Modern UI/UX**
  - Glass morphism design
  - Responsive layout
  - Dark mode support
  - Smooth animations

## 🛠️ Tech Stack

- **Frontend**:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Radix UI Components

- **Backend**:
  - Supabase (PostgreSQL)
  - Row Level Security
  - Real-time subscriptions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pranav452/delivery-management-system.git
   cd delivery-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Update Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Run the SQL scripts in `database/schema.sql` in your Supabase SQL editor
   - This will create the necessary tables and sample data

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Login with the default credentials or create a new account

## 📱 Usage Guide

### Dashboard
- View key metrics and statistics
- Quick access to all features
- Real-time updates

### Orders
- Create new delivery orders
- Track order status
- View delivery history

### Delivery Partners
- Manage partner profiles
- View performance metrics
- Track active deliveries

### Assignments
- Assign orders to partners
- Monitor delivery progress
- View assignment history

## 🔒 Security

- Row Level Security (RLS) enabled
- Secure authentication flow
- Environment variable protection
- Input validation and sanitization

## 🎯 Future Enhancements

- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Route optimization
- [ ] Customer feedback system
- [ ] Integration with mapping services
- [ ] Push notifications

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License 

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase team for the backend infrastructure
- All contributors and users of this system

---

Made with ❤️ by Pranav Nair
