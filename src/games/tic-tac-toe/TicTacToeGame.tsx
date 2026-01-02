import React, { useState, useEffect } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import PS5Animator from '../../utils/ps5-animator';
import '../../styles/ps5-theme.css';

const TicTacToeGame = () => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ x: 0, o: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const [isTie, setIsTie] = useState(false);
  const [playerNames, setPlayerNames] = useState({ x: 'Player X', o: 'Player O' });
  const [gameStarted, setGameStarted] = useState(false);

  const handlePlayerNameChange = (player: 'x' | 'o', name: string) => {
    setPlayerNames(prev => ({ ...prev, [player]: name || `Player ${player.toUpperCase()}` }));
  };

  const startGame = () => {
    setGameStarted(true);
    resetBoard();
    PS5Animator.createNotification("Game Started! May the best player win.", "success");
  };

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) {
      return;
    }
    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsTie(false);
    setXIsNext(true);
  };

  const resetGame = () => {
    resetBoard();
    setScores({ x: 0, o: 0 });
    setGameStarted(false);
  };

  useEffect(() => {
    const checkWinner = calculateWinner(board);
    if (checkWinner) {
      setWinner(checkWinner);
      if (checkWinner === 'X') {
        setScores(prev => ({ ...prev, x: prev.x + 1 }));
        PS5Animator.createNotification(`${playerNames.x} wins the round!`, "success");
      } else {
        setScores(prev => ({ ...prev, o: prev.o + 1 }));
        PS5Animator.createNotification(`${playerNames.o} wins the round!`, "success");
      }
      setTimeout(resetBoard, 2000);
    } else if (board.every(square => square !== null)) {
      setIsTie(true);
      PS5Animator.createNotification("It's a tie!", "warning");
      setTimeout(resetBoard, 2000);
    }
  }, [board, playerNames]);

  const renderSquare = (i: number) => (
    <button
      className={`ps5-button tic-tac-toe-cell ${board[i] === 'X' ? 'x' : board[i] === 'O' ? 'o' : ''}`}
      onClick={() => handleClick(i)}
      disabled={!!winner || !!board[i]}
      style={{ 
        width: '100px', 
        height: '100px',
        fontSize: '2.5rem',
        lineHeight: '100px'
       }}
    >
      {board[i]}
    </button>
  );

  if (!gameStarted) {
    return (
      <PS5GameWrapper gameTitle="Tic-Tac-Toe" onBack={() => window.history.back()}>
        <div className="ps5-card" style={{ padding: '30px', textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '20px' }}>Enter Player Names</h2>
          <input
            type="text"
            placeholder="Player X Name"
            onChange={(e) => handlePlayerNameChange('x', e.target.value)}
            className="ps5-input" 
            style={{ marginBottom: '10px' }}
          />
          <input
            type="text"
            placeholder="Player O Name"
            onChange={(e) => handlePlayerNameChange('o', e.target.value)}
            className="ps5-input" 
            style={{ marginBottom: '20px' }}
          />
          <button className="ps5-button" onClick={startGame}>Start Game</button>
        </div>
      </PS5GameWrapper>
    );
  }

  let status;
  if (winner) {
    status = `Winner: ${winner === 'X' ? playerNames.x : playerNames.o}`;
  } else if (isTie) {
    status = "It's a Tie!";
  } else {
    status = `Next Player: ${xIsNext ? playerNames.x : playerNames.o}`;
  }

  return (
    <PS5GameWrapper gameTitle="Tic-Tac-Toe" onBack={() => window.history.back()}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div className="ps5-card" style={{ display: 'flex', justifyContent: 'space-around', width: '100%', maxWidth: '400px', padding: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem' }}>{playerNames.x} (X)</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>{scores.x}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem' }}>{playerNames.o} (O)</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--ps5-danger)' }}>{scores.o}</div>
          </div>
        </div>

        <div className="ps5-card" style={{ padding: '20px' }}>
          <div className="tic-tac-toe-board">
            <div className="board-row">{renderSquare(0)}{renderSquare(1)}{renderSquare(2)}</div>
            <div className="board-row">{renderSquare(3)}{renderSquare(4)}{renderSquare(5)}</div>
            <div className="board-row">{renderSquare(6)}{renderSquare(7)}{renderSquare(8)}</div>
          </div>
        </div>
        
        <div className="ps5-card" style={{ padding: '15px', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{status}</h3>
        </div>

        <button className="ps5-button ps5-button--danger" onClick={resetGame}>Reset Game</button>
      </div>
    </PS5GameWrapper>
  );
};

export default TicTacToeGame;