import React, { useState } from 'react'
import { useTheme } from '../../components/context/ThemeContext'
import './TicTacToeGame.css'

const TicTacToeGame = () => {
  const { theme } = useTheme()
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState<boolean>(true)
  const [scores, setScores] = useState<{x: number, o: number}>({ x: 0, o: 0 })

  const handleClick = (index: number) => {
    if (calculateWinner(board) || board[index]) {
      return
    }
    
    const newBoard = [...board]
    newBoard[index] = xIsNext ? 'X' : 'O'
    setBoard(newBoard)
    setXIsNext(!xIsNext)
  }

  const winner = calculateWinner(board)
  const status = winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? 'X' : 'O'}`

  const renderSquare = (index: number) => {
    return (
      <button 
        className={`square ${theme}`} 
        onClick={() => handleClick(index)}
      >
        {board[index]}
      </button>
    )
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setXIsNext(true)
  }

  const resetMatch = () => {
    resetGame()
    setScores({ x: 0, o: 0 })
  }

  // Check for winner and update scores
  if (winner && (scores.x < 10 && scores.o < 10)) {
    if (winner === 'X') {
      setScores((prev: {x: number, o: number}) => ({ ...prev, x: prev.x + 1 }))
    } else {
      setScores((prev: {x: number, o: number}) => ({ ...prev, o: prev.o + 1 }))
    }
    
    // Reset board for next round
    setTimeout(() => {
      setBoard(Array(9).fill(null))
      setXIsNext(true)
    }, 1000)
  }

  const matchWinner = scores.x >= 10 ? 'X' : scores.o >= 10 ? 'O' : null

  return (
    <div className={`game ${theme}`}>
      <h2>Tic Tac Toe</h2>
      {matchWinner ? (
        <div className="match-winner">
          <h3>Match Winner: {matchWinner}</h3>
          <p>Final Score - X: {scores.x}, O: {scores.o}</p>
          <button onClick={resetMatch}>Play New Match</button>
        </div>
      ) : (
        <>
          <div className="score-board">
            <p>Score - X: {scores.x}, O: {scores.o}</p>
          </div>
          <div className="board-row">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
          </div>
          <div className="board-row">
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
          </div>
          <div className="board-row">
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
          <div className="game-info">
            <p>{status}</p>
            <button onClick={resetGame}>Reset Game</button>
          </div>
        </>
      )}
    </div>
  )
}

function calculateWinner(squares: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}

export default TicTacToeGame