# Talangin

**Talangin** (from "talangin" - Indonesian for "tracking" or "keeping tabs") is a mobile-first web app that makes group food delivery orders transparent and organized. No more lost receipts or confusing chat logs - just clear tracking of who ordered what and who owes what.

## 🚀 What's Actually Built

This is a **fully functional Vue.js frontend** with Supabase backend integration. Here's what you can do right now:

### Core Features

#### 1. **Room Management**
- **Create rooms** with title, restaurant name, and delivery platform
- **Join rooms** via room code or QR code scan
- **View your rooms** (created and joined) with filtering options
- **Close rooms** to finalize orders and calculate totals
- **Delete rooms** (owner only)
- **Room status tracking** — open, locked, closed states

#### 2. **Order Item Management**
- **Add items** to active rooms (name, quantity, price, notes)
- **Edit items** (owner or runner can modify)
- **Delete items** (owner or runner can remove)
- **View grouped items** by participant with automatic totals
- **Runner adds items on behalf of guests** (non-registered users)

#### 3. **Participant System**
- **Join rooms** without creating full accounts
- **Guest participants** — runner can invite non-registered users by name or email
- **Real-time participant updates** via Supabase
- **User profiles** with avatars and display names
- **Visual indicators** for who's participating (guest-labeled)
- **Guest to user promotion** — guest rows auto-claimed when the person signs up

#### 4. **Payment Tracking**
- **Payment method management** (runner's payment details)
- **Payment confirmation flow** for participants
- **Copy payment details** to clipboard automatically
- **Track payment status** per participant

#### 5. **History & Dashboard**
- **Monthly spending summary** on dashboard
- **Active vs Closed rooms** tabs in history
- **Room details** with full participant and item breakdown
- **Filter rooms** by platform, restaurant, date range

#### 6. **Real-time Collaboration**
- **Live updates** when items are added/edited/deleted
- **Instant sync** across all participants
- **Real-time participant list** updates

#### 7. **Sharing & QR Codes**
- **Generate QR codes** for instant room sharing
- **Shareable links** that open directly in the app
- **QR scanner** to join rooms quickly

## 🛠️ Tech Stack

### Frontend
- **Vue 3** with Composition API
- **Vue Router** for navigation
- **Tailwind CSS** for styling
- **Lucide Vue Next** for icons
- **Shadcn-Vue** for reusable components
- **Vue Sonner** for toast notifications
- **HTML5-QRCode** for QR scanning
- **QR Code** library for generation

### Backend & Infrastructure
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Supabase Auth** with OAuth providers (Discord, LinkedIn, Email)
- **Supabase Realtime** for live updates
- **TanStack Vue Query** for data caching and state management

### Build Tools
- **Vite** for fast development
- **Prettier** for code formatting

## 📱 App Structure

### Pages
- `/` - Dashboard with join room and monthly spending
- `/create-room` - Create new order room
- `/myroom/` - List of rooms you created
- `/myroom/[id]` - Manage your room (close/delete)
- `/histori/` - History of joined rooms (active/closed)
- `/active-room/[id]` - Active room view (add items, view cart)
- `/profile/` - User profile and settings
- `/profile/mypayment` - Payment method management

### Key Components
- `AuthForm` - Login/registration
- `AddOrderItemModal` - Add items to order
- `EditOrderItemModal` - Edit existing items
- `PaymentModal` - Confirm payment
- `QRScanDialog` - Scan QR to join
- `JoinRoomPrompt` - Join room confirmation
- `CloseRoomModal` - Close room with final total
- `FilterModal` - Filter room lists
- `SettingsModal` - Update username
- `addGuestParticipantModal` - Add guest participants by name or email

## 🎯 User Flow

### For the Runner (Order Creator)
1. Create a room with order details
2. Share room code or QR code with friends
3. Invite guests (non-registered users) by name or email
4. Add items for themselves and on behalf of guests
5. Close the room when everyone is ready
6. Record who has paid

### For Participants (Joiners)
1. Join room via code or QR scan
2. Add their meal items
3. Mark payment as done (select runner's payment method)
4. View their total and payment status

### For Guests (Non-Registered Users)
1. Added to a room by the runner (by name or email)
2. Receive items added by the runner on their behalf
3. Appear in the split math with their share of the bill
4. No login required — passive cost bucket managed by the runner
5. Auto-promoted to full user if they sign up with matching email

## 🔧 Database Schema

The app uses these main tables:
- `rooms` - Order sessions with metadata
- `room_participants` - Who's in which room
- `order_items` - Individual order items
- `payment_methods` - Runner's payment details

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)

### Setup
1. **Clone and install**
   ```bash
   npm install
   ```

2. **Environment variables** (`.env.local`)
   ```env
   VITE_PUBLIC_SUPABASE_URL=your_supabase_url
   VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database setup**
   - Run the `schema.sql` file in Supabase SQL editor
   - This creates all necessary tables and RLS policies

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎨 Design Philosophy

- **Mobile-first**: Optimized for phone use during ordering
- **Fast**: Minimal clicks to add items and track payments
- **Clear**: Visual hierarchy showing who owes what
- **Real-time**: Changes appear instantly for all participants

## 📊 Current Status

✅ **Completed Features:**
- Full authentication flow
- Room creation and management
- Order item CRUD operations
- Participant joining system
- Guest participant support
- Guest user auto-promotion on signup
- Payment method management
- Real-time updates
- QR code sharing/scanning
- History and dashboard
- Filtering and search
- Mobile-responsive UI

🔄 **In Development:**
- Push notification reminders
- Export to CSV/Google Sheets
- Receipt photo uploads
- Advanced fee splitting strategies
- Automated invoice email delivery
- Guest payment confirmation link

## 🎯 Success Metrics (What We're Building Towards)

- Runner can create and share a room in **under 30 seconds**
- Joiner can add their meal and mark payment in **under 5 taps**
- All participants have zero outstanding payments within **24 hours** in 80% of sessions

## 🤝 Contributing

This is a learning project built to solve real-world group ordering problems. Contributions, feedback, and feature requests are welcome!

---

**Built with ❤️ for group food ordering chaos**