import React, { useState, useEffect } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';
import './PollGame.css';

const PollGame = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [pollData, setPollData] = useState([
    {
        title: 'Which is your favorite Indian YouTuber?',
        options: ['CarryMinati', 'Ashish Chanchlani', 'Bhuvan Bam', 'Amit Bhadana', 'Techno Gamerz', 'Yes Smarty Pie', 'Sourav Joshi', 'Triggered Insaan', 'Emiway Bantai', 'Flying Beast', 'Slay Point', 'Mumbiker Nikhil', 'Harsh Beniwal', 'Sandeep Maheshwari', 'Beer Biceps', 'Nisha Madhulika', 'Be YouNick', 'Prajakta Koli', 'Shirley Setia'],
        votes: {}
    },
    {
        title: 'Which is your favorite Computer Language?',
        options: ['JavaScript', 'Python', 'C++', 'Java'],
        votes: {}
    },
    {
        title: 'Which is your favorite Technology?',
        options: ['AI', 'Blockchain', 'Cloud Computing', 'Quantum Computing'],
        votes: {}
    }
  ]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Load votes from localStorage if available
    const newPollData = pollData.map((poll, index) => {
        const savedVotes = localStorage.getItem(`poll_${index + 1}`);
        return savedVotes ? { ...poll, votes: JSON.parse(savedVotes) } : poll;
    });
    setPollData(newPollData);
  }, []);

  const handleVote = () => {
    if (selectedOption) {
      const newPollData = [...pollData];
      const currentPoll = newPollData[currentLevel];
      const votes = currentPoll.votes as any;
      votes[selectedOption] = (votes[selectedOption] || 0) + 1;
      
      localStorage.setItem(`poll_${currentLevel + 1}`, JSON.stringify(votes));
      setPollData(newPollData);
      setShowResult(true);

      setTimeout(() => {
        if (currentLevel < pollData.length - 1) {
          setCurrentLevel(currentLevel + 1);
          setSelectedOption(null);
          setShowResult(false);
        } else {
          // End of game
        }
      }, 2000);
    }
  };

  const currentPoll = pollData[currentLevel];

  return (
    <PS5GameWrapper gameTitle="Multi-Level Poll" onBack={() => window.history.back()}>
        <div className="ps5-card poll-container" style={{maxWidth: '600px', margin: 'auto'}}>
            <h1>{currentPoll.title}</h1>
            <div>
                {currentPoll.options.map(option => (
                    <label key={option} className="ps5-label">
                        <input 
                            type="radio" 
                            name="poll-option" 
                            value={option} 
                            onChange={() => setSelectedOption(option)} 
                            checked={selectedOption === option}
                        />
                        {option}
                    </label>
                ))}
            </div>
            <button className="ps5-button" onClick={handleVote} disabled={!selectedOption || showResult}>
                Vote
            </button>

            {showResult && (
                <div className="result" style={{marginTop: '20px'}}>
                    <h2>Results</h2>
                    {Object.entries(currentPoll.votes).map(([option, count]) => (
                        <p key={option}>{option}: {count as number} votes</p>
                    ))}
                </div>
            )}
            
            <div className="progress-bar" style={{marginTop: '20px'}}>
                <span>Level {currentLevel + 1} of {pollData.length}</span>
            </div>
        </div>
    </PS5GameWrapper>
  );
};

export default PollGame;
