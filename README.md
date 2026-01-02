# GameHub - Multi-Game Platform

A collection of games built with React, TypeScript, and Vite.

## 🎮 Games Included

1. **Tic Tac Toe** - Classic X and O game
2. **Snake** - Classic snake game
3. **Memory Card** - Match pairs of cards
4. **Flappy Bird** - Navigate through pipes
5. **Candy Crush** - Match candies to score
6. **Sudoku** - Number placement puzzle
7. **Stick Hero** - Bridge building challenge
8. **Shape Breaker** - Tetris-style block puzzle
9. **Archery** - Physics-based target shooting
10. **Maze** - Find your way out
11. **Kho Kho** - Tag team game
12. **Cricket** - Bat and ball game
13. **Wack a Mole** - Hit the moles
14. **Wordle** - Guess the word
15. **Rock Paper Scissors** - Classic hand game
16. **2048** - Number merging puzzle

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
- **Responsive UI** with light/dark theme support
- **Global state management** using React Context
- **Client-side routing** with React Router
- **PS5-inspired UI design** with modern aesthetics
- **Mobile-friendly** touch controls

## 📱 Responsive Design

All games are designed to work seamlessly on both desktop and mobile devices with adaptive layouts and touch-friendly controls.

## 🏆 Leaderboards

Compete with players worldwide and climb the rankings with our integrated leaderboard system.

## ⚙️ Settings

Customize your experience with user settings including theme preferences and profile management.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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
