import React, { useState, useEffect, useRef } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';
import './CricketGame.css';

const CricketGame = () => {
  const [gameState, setGameState] = useState({
    score: 0,
    wickets: 0,
    balls: 0,
    overs: 0,
    target: null as number | null,
    mode: 'practice',
    isGameOver: false,
    commentary: 'Welcome to Pro Cricket Simulator!',
  });

  const [teamSelection, setTeamSelection] = useState(true);
  const [gameMode, setGameMode] = useState('practice');
  const [teams, setTeams] = useState({
    team1: { name: 'Team 1', captain: 'Captain 1' },
    team2: { name: 'Team 2', captain: 'Captain 2' },
  });

  const ballRef = useRef<HTMLDivElement>(null);

  const shotTypes = {
    drive: { runs: [0, 1, 2, 3, 4, 6], probabilities: [0.25, 0.2, 0.15, 0.1, 0.15, 0.15], wicketChance: 0.08, commentary: ["Elegant drive!", "Perfectly timed!"] },
    cut: { runs: [0, 1, 2, 3, 4], probabilities: [0.3, 0.2, 0.2, 0.15, 0.15], wicketChance: 0.15, commentary: ["Sharp cut!", "Risky but effective!"] },
    pull: { runs: [0, 1, 2, 4, 6], probabilities: [0.3, 0.2, 0.2, 0.15, 0.15], wicketChance: 0.25, commentary: ["Massive pull!", "Powerful hit!"] },
    defense: { runs: [0], probabilities: [1], wicketChance: 0.02, commentary: ["Solid defense.", "Careful shot."] },
  };

  const handleModeSelection = (mode: string) => {
    setGameMode(mode);
  };

  const handleStartMatch = () => {
    setTeamSelection(false);
    resetGame();
  };

  const updateGameStats = (runs: number, isOut: boolean) => {
    let { score, wickets, balls, overs } = gameState;
    if (isOut) {
      wickets++;
      if (wickets >= 10) {
        endGame('All out!');
        return false;
      }
    } else {
      score += runs;
    }
    
    balls++;
    overs = Math.floor(balls / 6) + (balls % 6) / 10;
    const runRate = overs > 0 ? (score / (balls/6)).toFixed(2) : '0.00';

    setGameState(prev => ({ ...prev, score, wickets, overs, commentary: `${runs} runs!` }));
    return true;
  };

  const playShot = (shotType: keyof typeof shotTypes) => {
    if (gameState.isGameOver) return;

    const shot = shotTypes[shotType];
    const rand = Math.random();
    let cumulativeProb = 0;
    let runs = 0;
    for(let i=0; i<shot.runs.length; i++){
        cumulativeProb += shot.probabilities[i];
        if(rand < cumulativeProb){
            runs = shot.runs[i];
            break;
        }
    }

    const isOut = Math.random() < shot.wicketChance;
    const commentary = isOut ? 'OUT! Wicket fallen!' : `${shot.commentary[Math.floor(Math.random() * shot.commentary.length)]}`;

    setGameState(prev => ({ ...prev, commentary }));
    animateBall();
    updateGameStats(runs, isOut);
  };

  const animateBall = () => {
    if (!ballRef.current) return;
    ballRef.current.style.transition = 'all 1s ease-out';
    ballRef.current.style.transform = `translate(${Math.random() * 200 - 100}px, -200px) scale(0.5)`;

    setTimeout(() => {
        if (!ballRef.current) return;
        ballRef.current.style.transition = 'none';
        ballRef.current.style.transform = 'translate(-50%, 0) scale(1)';
    }, 1000);
  };

  const endGame = (reason: string) => {
    setGameState(prev => ({ ...prev, isGameOver: true, commentary: `${reason} | Final Score: ${prev.score}/${prev.wickets}` }));
  };

  const resetGame = () => {
    setGameState({
      score: 0, wickets: 0, balls: 0, overs: 0,
      target: gameMode === 'tournament' ? Math.floor(Math.random() * 150) + 100 : null,
      mode: gameMode, isGameOver: false,
      commentary: `${teams.team1.name} is batting!`
    });
  };

  if (teamSelection) {
    return (
        <PS5GameWrapper gameTitle="Cricket Setup" onBack={() => {}}>
            <div className="ps5-card" style={{maxWidth: '600px', margin:'auto', textAlign:'center'}}>
                <h2>Cricket Tournament Setup</h2>
                <div style={{margin: '20px 0'}}>
                    <h3>Select Game Mode</h3>
                    <div style={{display:'flex', justifyContent:'center', gap:'10px', marginTop:'10px'}}>
                        <button className={`ps5-button ${gameMode === 'practice' ? 'active' : ''}`} onClick={() => handleModeSelection('practice')}>Practice</button>
                        <button className={`ps5-button ${gameMode === 'tournament' ? 'active' : ''}`} onClick={() => handleModeSelection('tournament')}>Tournament</button>
                        <button className={`ps5-button ${gameMode === 'challenge' ? 'active' : ''}`} onClick={() => handleModeSelection('challenge')}>Challenge</button>
                    </div>
                </div>
                <div>
                    <h3>Team Details</h3>
                    <input type="text" placeholder="Team 1 Name" onChange={e => setTeams(t => ({...t, team1: {...t.team1, name: e.target.value}}))} className="ps5-input" style={{margin:'5px 0'}} />
                    <input type="text" placeholder="Team 2 Name" onChange={e => setTeams(t => ({...t, team2: {...t.team2, name: e.target.value}}))} className="ps5-input" style={{margin:'5px 0'}} />
                </div>
                <button className="ps5-button" onClick={handleStartMatch} style={{marginTop:'20px'}}>Start Match</button>
            </div>
        </PS5GameWrapper>
    )
  }

  return (
    <PS5GameWrapper gameTitle="Pro Cricket Simulator" onBack={() => setTeamSelection(true)}>
      <div className="cricket-stadium">
        <div className="scoreboard">
            <div className="scoreboard-item"><h3>Score</h3><div>{gameState.score}/{gameState.wickets}</div></div>
            <div className="scoreboard-item"><h3>Overs</h3><div>{gameState.overs.toFixed(1)}</div></div>
            <div className="scoreboard-item"><h3>Run Rate</h3><div>{gameState.overs > 0 ? (gameState.score / (gameState.balls/6)).toFixed(2) : '0.00'}</div></div>
            <div className="scoreboard-item"><h3>Target</h3><div>{gameState.target || 'N/A'}</div></div>
        </div>

        <div className="game-field">
            <div className="crowd"></div>
            <div id="cricket-pitch"></div>
            <div id="batsman"></div>
            <div id="bowler"></div>
            <div id="ball" ref={ballRef}></div>
            <div className="stumps"></div>
            <div className="stumps-2"></div>
        </div>

        <div className="shot-controls">
            {Object.keys(shotTypes).map(shot => (
                <button key={shot} className="shot-button" onClick={() => playShot(shot as any)} disabled={gameState.isGameOver}>
                    {shot.charAt(0).toUpperCase() + shot.slice(1)}
                    <span className="shot-risk">{shotTypes[shot as keyof typeof shotTypes].wicketChance * 100}% Risk</span>
                </button>
            ))}
        </div>

        <div id="commentary-box">{gameState.commentary}</div>
        {gameState.isGameOver && <button className="ps5-button" onClick={resetGame}>Play Again</button>}
      </div>
    </PS5GameWrapper>
  );
};

export default CricketGame;