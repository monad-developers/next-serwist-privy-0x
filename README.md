# Next.js 14 + Privy + Serwist PWA + 0x Swap API

A modern, full-stack Progressive Web Application built with Next.js 14, featuring cryptocurrency token swapping via 0x Protocol, Web3 authentication with Privy, and offline capabilities powered by Serwist.

## 🚀 Features

- **🔐 Web3 Authentication**: Seamless wallet connection and user authentication using Privy
- **💱 Token Swapping**: Integrated 0x Protocol for decentralized token exchanges
- **📱 Progressive Web App**: Full PWA capabilities with offline support via Serwist
- **🔔 Push Notifications**: Web push notifications for user engagement
- **🌙 Dark/Light Mode**: Responsive design with theme support
- **📱 Mobile-First**: Optimized for mobile devices with install prompts
- **⚡ Modern Stack**: Built with Next.js 14, TypeScript, and Tailwind CSS

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Privy, Wagmi, Viem
- **DEX Integration**: 0x Protocol API
- **PWA**: Serwist (Service Worker)
- **State Management**: TanStack Query
- **Notifications**: Web Push API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- A Privy account and App ID from [privy.io](https://privy.io)
- A 0x account and an API KEY from [0x.org](https://0x.org/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd next14-privy-serwist-0x
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Option 1: Copy from example (if .env.example exists)
cp .env.example .env.local

# Option 2: Create manually
touch .env.local
```

Add the following environment variables to your `.env.local` file:

```env
# Privy 
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
NEXT_PUBLIC_PRIVY_CLIENT_ID= # optional, you can leave this empty

# Web Push
WEB_PUSH_EMAIL=user@example.com
WEB_PUSH_PRIVATE_KEY=your_vapid_private_key
NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY=your_vapid_public_key

# 0x Protocol Configuration (Required for swapping)
ZEROX_API_KEY=your_0x_api_key_here
```

> **Important**: Replace all placeholder values with your actual credentials. See the steps below for obtaining these values.

### 4. Generate VAPID Keys

Generate VAPID keys for web push notifications:

```bash
npx web-push generate-vapid-keys --json
```

Copy the generated keys to your `.env.local` file.

### 5. Get Privy App ID

1. Visit [privy.io](https://privy.io) and create an account
2. Create a new app, choose Web as the Platform and create the app
3. Right after creating the app, copy the App ID
3. Add the App ID to your `.env.local` file

### 6. Get 0x API Key

1. Visit [0x.org](https://0x.org/) and create an account
2. Create a new API key and copy it
3. Add the API key to your `.env.local` file

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Mode

For full PWA functionality (including install prompts):

```bash
npm run build && npm run start
```

> **Note**: The install app button only works in production mode (`npm run build && npm run start`)

## 📱 PWA Features

### Installation

- **Desktop**: Install button appears in supported browsers
- **Mobile**: Add to Home Screen prompts on iOS/Android
- **Offline**: Service worker enables offline functionality

### Push Notifications

The app includes web push notification capabilities for user engagement and updates.

## 🔔 Notification Setup

> [!IMPORTANT]
> **Enable notifications for the best experience!**
> 
> To receive push notifications from this app, you need to enable notifications in your browser and/or system settings:

### Browser Settings

**Chrome/Edge:**
1. Click the lock icon 🔒 in the address bar
2. Set "Notifications" to "Allow"
3. Or go to Settings → Privacy and security → Site Settings → Notifications

**Firefox:**
1. Click the shield icon 🛡️ in the address bar
2. Turn off "Enhanced Tracking Protection" for this site (if needed)
3. Allow notifications when prompted
4. Or go to Settings → Privacy & Security → Permissions → Notifications

**Safari:**
1. Go to Safari → Settings → Websites → Notifications
2. Find your site and set it to "Allow"

### System Settings

**macOS:**
1. System Preferences → Notifications & Focus
2. Find your browser and ensure notifications are enabled
3. Check "Allow notifications from websites" in browser settings

**Windows:**
1. Settings → System → Notifications & actions
2. Ensure your browser can send notifications
3. Check browser notification settings

**iOS:**
1. Settings → Notifications → [Your Browser]
2. Enable "Allow Notifications"
3. Also enable in browser settings

**Android:**
1. Settings → Apps → [Your Browser] → Notifications
2. Enable notifications
3. Check browser notification permissions

### 🔧 Backend Integration Required

> [!NOTE]
> **The `SendNotification.tsx` component is sample code** that requires backend implementation:
> 
> - **Save subscription data** when users subscribe (see TODO comments in code)
> - **Delete subscription data** when users unsubscribe  
> - **Implement `/notification` endpoint** to send actual push notifications
> - **Use `web-push` library** or similar for server-side notification delivery

## Changing the app name

- Edit the `manifest.json` file
- Change the `name` and `short_name` fields
- Run `npm run build` to update the app

## 🔧 Project Structure

```
next14-privy-serwist/
├── app/
│   ├── components/          # React components
│   │   ├── 0x/             # 0x Protocol integration
│   │   ├── InstallPWA.tsx  # PWA install prompt
│   │   ├── SwapComponent.tsx # Token swap interface
│   │   └── ...
│   ├── api/                # API routes
│   │   ├── price/          # Token price endpoints
│   │   └── quote/          # Swap quote endpoints
│   ├── ~offline/           # Offline page
│   └── ...
├── public/                 # Static assets
├── utils/                  # Utility functions
└── ...
```

## 🔗 Key Components

- **SwapComponent**: Main interface for token swapping
- **PriceView**: Display token prices and swap interface
- **QuoteView**: Review and execute trades
- **UseLoginPrivy**: Privy authentication integration
- **InstallPWA**: PWA installation prompts

## 🌐 API Integration

The app integrates with:

- **0x Protocol**: For decentralized token swapping
- **Privy**: For Web3 authentication
- **Web Push API**: For notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Join [Monad Dev Discord](https://discord.gg/monaddev)
2. Review the [Privy](https://privy.io/) documentation
3. Check the [Next.js 14](https://nextjs.org/) documentation
4. Check the [0x Protocol](https://0x.org/) documentation
5. Check the [Serwist](https://serwist.pages.dev/) documentation
