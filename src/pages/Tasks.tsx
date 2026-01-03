import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/context/AuthContext';
import { useGame } from '../components/context/GameContext';
import '../styles/ps5-theme.css';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  reward: number;
  category: string;
  gameName?: string; // For game-related tasks
  completedAt?: string; // Date when task was completed
  progress?: number; // For progress-based tasks
  target?: number; // Target value for progress-based tasks
}

interface DailyAttendance {
  date: string;
  completed: boolean;
}

const Tasks = () => {
  const { user } = useAuth();
  const { getAllGameProgress } = useGame();
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Play 2048 Game', description: 'Complete one game of 2048', completed: false, reward: 50, category: 'Game', gameName: '2048', progress: 0, target: 1 },
    { id: '2', title: 'Play Snake Game', description: 'Score at least 500 points in Snake', completed: false, reward: 75, category: 'Game', gameName: 'Snake', progress: 0, target: 500 },
    { id: '3', title: 'Play Tic Tac Toe', description: 'Win a game of Tic Tac Toe', completed: false, reward: 50, category: 'Game', gameName: 'Tic Tac Toe', progress: 0, target: 1 },
    { id: '4', title: 'Play Archery', description: 'Complete level 3 in Archery', completed: false, reward: 100, category: 'Game', gameName: 'Archery', progress: 0, target: 3 },
    { id: '5', title: 'Play Bubble Shooter', description: 'Complete level 5 in Bubble Shooter', completed: false, reward: 100, category: 'Game', gameName: 'Bubble Shooter', progress: 0, target: 5 },
    { id: '6', title: 'Play Flappy Bird', description: 'Score at least 10 points in Flappy Bird', completed: false, reward: 75, category: 'Game', gameName: 'Flappy Bird', progress: 0, target: 10 },
    { id: '7', title: 'Visit Daily', description: 'Log in to the site today', completed: false, reward: 25, category: 'Attendance' },
    { id: '8', title: 'Invite Friend', description: 'Share the game with a friend', completed: false, reward: 100, category: 'Social' },
    { id: '9', title: 'Complete All Games', description: 'Play at least one level in each game', completed: false, reward: 200, category: 'Challenge', progress: 0, target: 9 }, // Updated to include Flappy Bird

  ]);
  
  const [attendance, setAttendance] = useState<DailyAttendance[]>([]);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [proPlayer, setProPlayer] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize data from localStorage
  useEffect(() => {
    if (user) {
      const savedTasks = localStorage.getItem(`tasks_${user.username}`);
      const savedAttendance = localStorage.getItem(`attendance_${user.username}`);
      const savedProStatus = localStorage.getItem(`proStatus_${user.username}`);
      const savedPoints = localStorage.getItem(`points_${user.username}`);
      
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
        } catch (e) {
          console.error('Error parsing tasks data:', e);
        }
      }
      
      if (savedAttendance) {
        try {
          setAttendance(JSON.parse(savedAttendance));
        } catch (e) {
          console.error('Error parsing attendance data:', e);
        }
      }
      
      if (savedProStatus) {
        setProPlayer(JSON.parse(savedProStatus));
      }
      
      if (savedPoints) {
        setTotalPoints(JSON.parse(savedPoints));
      }
      
      // Check if daily reward was already claimed today
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = JSON.parse(savedAttendance || '[]').find(
        (a: DailyAttendance) => a.date === today
      );
      setDailyRewardClaimed(!!todayAttendance);
    }
  }, [user]);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`tasks_${user.username}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`attendance_${user.username}`, JSON.stringify(attendance));
    }
  }, [attendance, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`proStatus_${user.username}`, JSON.stringify(proPlayer));
    }
  }, [proPlayer, user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`points_${user.username}`, JSON.stringify(totalPoints));
    }
  }, [totalPoints, user]);

  // Check and update tasks based on game progress
  const updateTasksFromGameProgress = () => {
    if (!user) return;
    
    const gameProgress = getAllGameProgress(user.username);
    
    setTasks(prevTasks => {
      let newTotalPoints = totalPoints;
      let taskCompleted = false;
      
      const updatedTasks = prevTasks.map(task => {
        // Skip non-game tasks
        if (!task.gameName) return task;
        
        // Skip already completed tasks
        if (task.completed) return task;
        
        let newTask = { ...task };
        
        if (task.id === '9') { // Complete All Games task
          // Count how many games have been played
          const games = ['2048', 'Snake', 'Tic Tac Toe', 'Archery', 'Bubble Shooter', 'Flappy Bird'];
          const completedGames = games.filter(game => 
            gameProgress.some(p => p.gameName === game)
          ).length;
          
          newTask.progress = completedGames;
          
          // Check if task is now completed
          if (newTask.progress !== undefined && newTask.target && newTask.progress >= newTask.target) {
            newTask.completed = true;
            newTask.completedAt = new Date().toISOString();
            
            // Add reward
            newTotalPoints += newTask.reward;
            taskCompleted = true;
          }
        } else {
          // Find progress for this specific game
          const gameProgressForTask = gameProgress.find(p => p.gameName === task.gameName);
          
          if (gameProgressForTask) {
            // Update progress based on game progress
            if (task.gameName === '2048' && gameProgressForTask.completed) {
              newTask.progress = 1;
            } else if (task.gameName === 'Snake' && gameProgressForTask.score) {
              newTask.progress = gameProgressForTask.score;
            } else if (task.gameName === 'Tic Tac Toe' && gameProgressForTask.completed) {
              newTask.progress = 1;
            } else if (task.gameName === 'Archery' && gameProgressForTask.level) {
              newTask.progress = gameProgressForTask.level;
            } else if (task.gameName === 'Bubble Shooter' && gameProgressForTask.level) {
              newTask.progress = gameProgressForTask.level;
            } else if (task.gameName === 'Flappy Bird' && gameProgressForTask.score) {
              newTask.progress = gameProgressForTask.score;
            }
            
            // Check if task is now completed
            if (newTask.progress !== undefined && newTask.target && newTask.progress >= newTask.target) {
              newTask.completed = true;
              newTask.completedAt = new Date().toISOString();
              
              // Add reward
              newTotalPoints += newTask.reward;
              taskCompleted = true;
            }
          }
        }
        
        return newTask;
      });
      
      // Update total points if a task was completed
      if (taskCompleted) {
        setTotalPoints(newTotalPoints);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
      
      return updatedTasks;
    });
  };

  // Mark attendance for today
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const existingAttendance = attendance.find(a => a.date === today);
      
      if (!existingAttendance) {
        const newAttendance: DailyAttendance = {
          date: today,
          completed: true
        };
        setAttendance(prev => [...prev, newAttendance]);
      }
    }
  }, [user, attendance]);

  // Update tasks when game progress changes
  useEffect(() => {
    if (user) {
      updateTasksFromGameProgress();
    }
  }, [user]); // This will run when game progress might have changed

  // Periodically check for game progress updates
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        updateTasksFromGameProgress();
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleTask = (id: string) => {
    if (!user) return;
    
    const taskToToggle = tasks.find(t => t.id === id);
    
    // For game-related tasks, don't allow manual toggle since they're auto-completed
    if (taskToToggle && taskToToggle.gameName) {
      return; // Don't allow manual toggling of game tasks
    }
    
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
    
    // Update points when task is toggled
    if (taskToToggle) {
      if (taskToToggle.completed) {
        setTotalPoints(prev => prev - taskToToggle.reward);
      } else {
        setTotalPoints(prev => prev + taskToToggle.reward);
        
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }
  };

  const claimDailyReward = () => {
    if (!user || dailyRewardClaimed) return;
    
    setTotalPoints(prev => prev + 100); // Daily reward
    setDailyRewardClaimed(true);
    
    // Mark attendance as completed for today
    const today = new Date().toISOString().split('T')[0];
    setAttendance(prev => {
      const updated = prev.map(att => 
        att.date === today ? { ...att, completed: true } : att
      );
      return updated;
    });
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const checkProPlayerStatus = () => {
    const allTasksCompleted = tasks.every(task => task.completed);
    const hasEnoughPoints = totalPoints >= 500; // Require 500 points to be pro
    const hasGoodAttendance = attendance.length >= 5; // Require 5 days of attendance
    
    if (allTasksCompleted && hasEnoughPoints && hasGoodAttendance) {
      setProPlayer(true);
      return true;
    }
    return false;
  };

  // Check pro status whenever tasks or attendance changes
  useEffect(() => {
    checkProPlayerStatus();
  }, [tasks, attendance, totalPoints]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const attendanceCount = attendance.length;
  const today = new Date().toISOString().split('T')[0];
  const currentStreak = attendance.filter(a => a.completed).length;

  return (
    <div className="ps5-container" style={{ padding: '20px' }}>
      <div className="ps5-header">
        <h1 className="ps5-title">🎯 Daily Tasks & Challenges</h1>
        <p className="ps5-subtitle">Complete tasks to earn rewards and become a Pro Player!</p>
      </div>

      {showSuccess && (
        <div className="ps5-card" style={{ 
          backgroundColor: 'rgba(46, 204, 113, 0.2)', 
          border: '1px solid #2ecc71', 
          color: '#2ecc71',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Task completed successfully! + Reward earned!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="ps5-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--ps5-accent-blue)', marginBottom: '10px' }}>Your Status</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: proPlayer ? '#f1c40f' : '#e74c3c', marginBottom: '10px' }}>
            {proPlayer ? '🏆 PRO PLAYER' : '🎮 REGULAR PLAYER'}
          </div>
          <div style={{ fontSize: '1.5rem', color: 'var(--ps5-accent-blue)' }}>
            Points: {totalPoints}
          </div>
        </div>

        <div className="ps5-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--ps5-accent-blue)', marginBottom: '10px' }}>Attendance</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2ecc71', marginBottom: '10px' }}>
            {currentStreak} 🔥
          </div>
          <div style={{ color: 'white' }}>
            Days Online: {attendanceCount}
          </div>
        </div>

        <div className="ps5-card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--ps5-accent-blue)', marginBottom: '10px' }}>Progress</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db', marginBottom: '10px' }}>
            {completedTasks}/{totalTasks}
          </div>
          <div style={{ color: 'white' }}>
            {Math.round((completedTasks / totalTasks) * 100)}% Complete
          </div>
        </div>
      </div>

      <div className="ps5-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--ps5-accent-blue)', margin: 0 }}>Daily Attendance</h2>
          {!dailyRewardClaimed && (
            <button 
              className="ps5-button" 
              onClick={claimDailyReward}
              disabled={dailyRewardClaimed}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              {dailyRewardClaimed ? 'Reward Claimed' : 'Claim Daily Reward'}
            </button>
          )}
          {dailyRewardClaimed && (
            <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>✓ Daily Reward Claimed</span>
          )}
        </div>
        
        <div style={{ color: 'white', marginBottom: '10px' }}>
          Login today to maintain your streak! Current streak: {currentStreak} days
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {attendance.slice(-7).map((day, index) => (
            <div 
              key={index} 
              style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                backgroundColor: day.completed ? '#2ecc71' : '#95a5a6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
              title={day.date}
            >
              ✓
            </div>
          ))}
        </div>
      </div>

      <div className="ps5-card" style={{ padding: '20px' }}>
        <h2 style={{ color: 'var(--ps5-accent-blue)', margin: '0 0 20px 0' }}>Available Tasks</h2>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          {tasks.map(task => (
            <div 
              key={task.id} 
              className="ps5-card" 
              style={{ 
                padding: '15px', 
                backgroundColor: task.completed ? 'rgba(46, 204, 113, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: task.completed ? '1px solid #2ecc71' : '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: task.completed ? '#2ecc71' : 'white' }}>
                    {task.title} {task.completed && '✓'}
                  </h3>
                  <p style={{ margin: '5px 0', color: 'rgba(255, 255, 255, 0.7)' }}>{task.description}</p>
                  <div style={{ fontSize: '0.9rem', color: 'var(--ps5-accent-blue)' }}>
                    Reward: {task.reward} pts | Category: {task.category}
                  </div>
                </div>
                <button 
                  className={`ps5-button ${task.completed ? 'ps5-button-secondary' : ''}`} 
                  onClick={() => toggleTask(task.id)}
                  disabled={!!task.gameName} // Disable for game-related tasks
                  style={{ 
                    padding: '8px 16px',
                    opacity: task.gameName ? 0.6 : 1,
                    cursor: task.gameName ? 'not-allowed' : 'pointer'
                  }}
                >
                  {task.gameName ? (task.completed ? 'Auto-Completed' : 'In Progress') : (task.completed ? 'Completed' : 'Mark Complete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ps5-card" style={{ padding: '20px', marginTop: '20px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--ps5-accent-blue)', marginBottom: '10px' }}>How to Become a Pro Player</h3>
        <div style={{ color: 'white', lineHeight: '1.6' }}>
          <p>• Complete all daily tasks</p>
          <p>• Maintain a 5-day attendance streak</p>
          <p>• Earn at least 500 points</p>
          <p>• Play regularly and engage with the community</p>
        </div>
      </div>
    </div>
  );
};

export default Tasks;