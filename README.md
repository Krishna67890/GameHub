# GameHub - Multi-Game Platform

A collection of games built with React, TypeScript, and Vite.

## 🎮 Games Included

1. **2048** - Number merging puzzle
2. **Balloon Goes Up** - Keep the balloon in the air
3. **Archery** - Physics-based target shooting
4. **Bubble Shooter** - Match bubbles of the same color
5. **Candy Crush** - Match candies to score
6. **Carrom** - Traditional Indian board game with realistic physics
7. **Cricket** - Bat and ball game
8. **Flappy Bird** - Navigate through pipes
9. **Hangman** - Classic word guessing game
10. **Kho Kho** - Traditional Indian tag team game
11. **Maze** - Find your way out
12. **Memory Card** - Match pairs of cards
13. **Poll Game** - Voting and polling game
14. **Pong** - Classic table tennis game
15. **Rock Paper Scissors** - Classic hand game
16. **Shape Breaker** - Tetris-style block puzzle
17. **Snake** - Classic snake game
18. **Stick Hero** - Bridge building challenge
19. **Sudoku** - Number placement puzzle
20. **Tic Tac Toe** - Classic X and O game
21. **Troll Launch** - Physics-based launching game
22. **Wack a Mole** - Hit the moles
23. **Wordle** - Guess the word

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## 🛠 Technologies Used

- React 18
- TypeScript
- Vite
- React Router DOM
- Zustand (State Management)
- Framer Motion (Animations)

## 📁 Project Structure

```
src/
├── components/
│   ├── context/       # Context providers (Auth, Game, Theme)
│   ├── layout/        # Layout components (MainLayout)
│   ├── shared/        # Shared UI components (Header, Footer)
│   └── ui/            # Reusable UI components
├── games/             # Individual game implementations
├── pages/             # Route-level views
├── styles/            # Global styles
└── utils/             # Reusable logic
```

## 🎨 Features

- **Multi-game platform** hosting various games
- **Demo account system** with pre-loaded accounts and user registration
- **Username-only authentication** (no passwords required)
- **Responsive UI** with light/dark theme support
- **Global state management** using React Context
- **Client-side routing** with React Router
- **PS5-inspired UI design** with modern aesthetics
- **Mobile-friendly** touch controls

## 📱 Responsive Design

All games are designed to work seamlessly on both desktop and mobile devices with adaptive layouts and touch-friendly controls.

## 🏆 Leaderboards

Compete with players worldwide and climb the rankings with our integrated leaderboard system. All registered users appear on the leaderboard, with demo accounts included by default.

## ⚙️ Settings

Customize your experience with user settings including theme preferences and profile management. Update your username or delete your account as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Authentication System

The application uses a demo authentication system that requires only usernames (no passwords). The system includes:

- **Pre-loaded demo accounts**: KRISHNA PATIL RAJPUT, Om Khapote, and Gunjan Pande
- **User registration**: Other users can create their own demo accounts
- **Username-only login**: Simply enter your username to sign in
- **Local storage**: All user data is stored in the browser's localStorage
- **Game progress tracking**: Scores and game progress are associated with user accounts

To add new default demo accounts, modify the `AuthContext.tsx` file and add entries to the defaultDemoAccounts array during initialization.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌐 Deployment

### Handling Client-Side Routing

This application uses client-side routing with React Router. When deploying to production, you need to configure your web server to redirect all routes to `index.html` to prevent 404 errors when accessing nested routes directly.

### For Different Platforms:

**Vercel:** Add a `vercel.json` file with:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify:** Add a `_redirects` file in the public directory with:
```
/*    /index.html   200
```

**Apache (.htaccess):**
```
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

**Nginx:**
```
location / {
  try_files $uri $uri/ /index.html;
}
```

### Development

For development, the Vite configuration (`appType: 'spa'`) handles routing properly. Run `npm run dev` to start the development server.

### Production Build

To build for production, run `npm run build` and serve the `dist` folder using the server configuration that handles client-side routing.
