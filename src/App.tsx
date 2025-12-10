import React from 'react'
import './games/tic-tac-toe/TicTacToeGame.css'
import TicTacToeGame from './games/tic-tac-toe/TicTacToeGame'

const App = () => {
  return (
    <div>
      <h1>Game Hub</h1>
      <p>Welcome to our collection of games!</p>
      <TicTacToeGame />
    </div>
  )
}

export default App