import React, { useState, useEffect } from 'react';
import PS5GameWrapper from '../../components/PS5GameWrapper';
import '../../styles/ps5-theme.css';
import '../carrom/CarromGame.css';

const PollGame = () => {
  const [polls, setPolls] = useState([
    {
      id: 1,
      question: "What's your favorite game genre?",
      options: [
        { id: 'a', text: 'Action', votes: 0 },
        { id: 'b', text: 'Adventure', votes: 0 },
        { id: 'c', text: 'Puzzle', votes: 0 },
        { id: 'd', text: 'Strategy', votes: 0 }
      ],
      totalVotes: 0,
      active: true
    },
    {
      id: 2,
      question: "Which platform do you prefer?",
      options: [
        { id: 'a', text: 'PC', votes: 0 },
        { id: 'b', text: 'PlayStation', votes: 0 },
        { id: 'c', text: 'Xbox', votes: 0 },
        { id: 'd', text: 'Mobile', votes: 0 }
      ],
      totalVotes: 0,
      active: true
    },
    {
      id: 3,
      question: "How often do you play games?",
      options: [
        { id: 'a', text: 'Daily', votes: 0 },
        { id: 'b', text: 'Weekly', votes: 0 },
        { id: 'c', text: 'Monthly', votes: 0 },
        { id: 'd', text: 'Rarely', votes: 0 }
      ],
      totalVotes: 0,
      active: true
    }
  ]);
  
  const [currentPoll, setCurrentPoll] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', '', '', ''] });

  const handleVote = (optionId: string) => {
    if (voted || !selectedOption) return;
    
    setPolls(prevPolls => {
      const updatedPolls = [...prevPolls];
      const pollIndex = updatedPolls.findIndex(p => p.id === polls[currentPoll].id);
      
      if (pollIndex !== -1) {
        const optionIndex = updatedPolls[pollIndex].options.findIndex((o: any) => o.id === optionId);
        if (optionIndex !== -1) {
          updatedPolls[pollIndex].options[optionIndex].votes += 1;
          updatedPolls[pollIndex].totalVotes += 1;
        }
      }
      
      return updatedPolls;
    });
    
    setVoted(true);
  };

  const nextPoll = () => {
    if (currentPoll < polls.length - 1) {
      setCurrentPoll(prev => prev + 1);
      setVoted(false);
      setSelectedOption(null);
      setShowResults(false);
    }
  };

  const prevPoll = () => {
    if (currentPoll > 0) {
      setCurrentPoll(prev => prev - 1);
      setVoted(false);
      setSelectedOption(null);
      setShowResults(false);
    }
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  const addNewPoll = () => {
    if (!newPoll.question || newPoll.options.some(opt => !opt.trim())) return;
    
    const pollToAdd = {
      id: polls.length + 1,
      question: newPoll.question,
      options: newPoll.options.map((opt, index) => ({
        id: String.fromCharCode(97 + index), // a, b, c, d
        text: opt,
        votes: 0
      })),
      totalVotes: 0,
      active: true
    };
    
    setPolls(prev => [...prev, pollToAdd]);
    setNewPoll({ question: '', options: ['', '', '', ''] });
  };

  const currentPollData = polls[currentPoll];
  const maxVotes = Math.max(...currentPollData.options.map((o: any) => o.votes));

  return (
    <PS5GameWrapper gameTitle="Poll Game" onBack={() => window.history.back()}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        height: '100%',
        padding: '20px'
      }}>
        {/* Navigation */}
        <div className="ps5-card" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
          maxWidth: '600px',
          padding: '15px'
        }}>
          <button 
            className="ps5-button" 
            onClick={prevPoll} 
            disabled={currentPoll === 0}
          >
            ← Prev
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <div className="ps5-game-name" style={{ fontSize: '1rem', marginBottom: '5px' }}>Poll</div>
            <div className="ps5-score-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--ps5-accent-blue)' }}>
              {currentPoll + 1} / {polls.length}
            </div>
          </div>
          
          <button 
            className="ps5-button" 
            onClick={nextPoll} 
            disabled={currentPoll === polls.length - 1}
          >
            Next →
          </button>
        </div>

        {/* Poll Question */}
        <div className="ps5-card" style={{ 
          padding: '25px', 
          textAlign: 'center',
          width: '100%',
          maxWidth: '600px'
        }}>
          <h2 style={{ color: 'white', margin: '0 0 20px 0' }}>{currentPollData.question}</h2>
          
          {/* Poll Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {currentPollData.options.map((option: any) => {
              const percentage = currentPollData.totalVotes > 0 
                ? Math.round((option.votes / currentPollData.totalVotes) * 100) 
                : 0;
              
              return (
                <div 
                  key={option.id}
                  onClick={() => !voted && setSelectedOption(option.id)}
                  style={{
                    padding: '15px',
                    backgroundColor: selectedOption === option.id 
                      ? 'var(--ps5-accent-blue)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    cursor: voted ? 'default' : 'pointer',
                    border: `2px solid ${selectedOption === option.id ? 'var(--ps5-accent-blue)' : 'rgba(255, 255, 255, 0.2)'}`,
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{option.text}</span>
                    {voted && (
                      <span style={{ color: 'white', fontWeight: 'bold' }}>{percentage}%</span>
                    )}
                  </div>
                  
                  {voted && (
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: 'rgba(0, 247, 255, 0.3)',
                        zIndex: 1,
                        transition: 'width 0.5s ease'
                      }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Vote Button */}
          {!voted && (
            <button 
              className="ps5-button ps5-button--success" 
              onClick={() => selectedOption && handleVote(selectedOption)}
              disabled={!selectedOption}
              style={{ marginTop: '20px', width: '100%', maxWidth: '300px' }}
            >
              Vote
            </button>
          )}
          
          {/* Results Toggle */}
          {voted && (
            <div style={{ marginTop: '20px' }}>
              <button 
                className="ps5-button" 
                onClick={toggleResults}
              >
                {showResults ? 'Hide Results' : 'Show Results'}
              </button>
            </div>
          )}
        </div>

        {/* Results View */}
        {voted && showResults && (
          <div className="ps5-card" style={{ 
            padding: '25px', 
            width: '100%',
            maxWidth: '600px'
          }}>
            <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Results</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {currentPollData.options
                .sort((a: any, b: any) => b.votes - a.votes)
                .map((option: any, index: number) => {
                  const percentage = Math.round((option.votes / currentPollData.totalVotes) * 100);
                  const isWinner = option.votes === maxVotes && currentPollData.totalVotes > 0;
                  
                  return (
                    <div key={option.id} style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>
                          {index === 0 && '🏆 '}{option.text}
                        </span>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>
                          {option.votes} votes ({percentage}%)
                        </span>
                      </div>
                      <div 
                        style={{
                          height: '20px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <div 
                          style={{
                            height: '100%',
                            width: `${percentage}%`,
                            backgroundColor: isWinner 
                              ? 'var(--ps5-accent-gold)' 
                              : 'var(--ps5-accent-blue)',
                            transition: 'width 0.5s ease',
                            position: 'relative'
                          }}
                        >
                          {percentage > 0 && (
                            <div style={{ 
                              position: 'absolute', 
                              right: '5px', 
                              top: '50%', 
                              transform: 'translateY(-50%)',
                              color: 'white',
                              fontSize: '0.8rem'
                            }}>
                              {percentage}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Create New Poll */}
        <div className="ps5-card" style={{ 
          padding: '25px', 
          width: '100%',
          maxWidth: '600px'
        }}>
          <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Create New Poll</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="text"
              placeholder="Enter your poll question"
              value={newPoll.question}
              onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
              className="ps5-input"
              style={{ padding: '10px', width: '100%' }}
            />
            
            {newPoll.options.map((option, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...newPoll.options];
                  newOptions[index] = e.target.value;
                  setNewPoll({...newPoll, options: newOptions});
                }}
                className="ps5-input"
                style={{ padding: '10px', width: '100%' }}
              />
            ))}
            
            <button 
              className="ps5-button ps5-button--success"
              onClick={addNewPoll}
              disabled={!newPoll.question || newPoll.options.some(opt => !opt.trim())}
              style={{ width: '100%' }}
            >
              Add Poll
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="ps5-card" style={{ 
          maxWidth: '600px',
          textAlign: 'center',
          padding: '15px'
        }}>
          <p>📊 Vote on polls and see real-time results</p>
          <p>📝 Create your own polls to share with others</p>
          <p>🏆 See which options are most popular</p>
        </div>
      </div>
    </PS5GameWrapper>
  );
};

export default PollGame;