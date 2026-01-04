// Test script to verify demo accounts initialization
console.log("Testing demo accounts initialization...");

// Simulate the initialization logic from AuthContext
function initializeDemoAccounts() {
  console.log("Checking for existing demo accounts in localStorage...");
  
  // Simulate localStorage
  let localStorageData = {};
  
  // Mock localStorage functions
  const localStorage = {
    getItem: function(key) {
      return localStorageData[key] || null;
    },
    setItem: function(key, value) {
      localStorageData[key] = value;
      console.log(`Set ${key} = ${value}`);
    },
    removeItem: function(key) {
      delete localStorageData[key];
      console.log(`Removed ${key}`);
    }
  };
  
  // Check if demo accounts exist
  const storedDemoAccounts = localStorage.getItem('demoAccounts');
  
  if (!storedDemoAccounts) {
    console.log("No demo accounts found, creating default accounts...");
    
    // Add default demo accounts
    const defaultDemoAccounts = [
      { username: 'KRISHNA PATIL RAJPUT', joinDate: new Date().toISOString() },
      { username: 'Om Khapote', joinDate: new Date().toISOString() },
      { username: 'Gunjan Pande', joinDate: new Date().toISOString() },
    ];
    
    localStorage.setItem('demoAccounts', JSON.stringify(defaultDemoAccounts));
    console.log("Demo accounts created successfully!");
  } else {
    console.log("Demo accounts already exist:", JSON.parse(storedDemoAccounts));
  }
  
  // Test login functionality
  console.log("\nTesting login functionality...");
  
  function login(username) {
    // Check in demo accounts list
    const storedDemoAccounts = localStorage.getItem('demoAccounts');
    if (storedDemoAccounts) {
      const demoAccounts = JSON.parse(storedDemoAccounts);
      const foundUser = demoAccounts.find(account => account.username === username);
      if (foundUser) {
        console.log(`Login successful for: ${username}`);
        localStorage.setItem('demoUser', JSON.stringify(foundUser));
        return true;
      }
    }
    console.log(`Login failed for: ${username} (user not found)`);
    return false;
  }
  
  // Test login with the demo accounts
  const testUsers = ['KRISHNA PATIL RAJPUT', 'Om Khapote', 'Gunjan Pande', 'NonExistentUser'];
  
  testUsers.forEach(user => {
    login(user);
  });
  
  // Test registration of a new user
  console.log("\nTesting registration of a new user...");
  
  function register(username) {
    const userData = {
      username: username,
      joinDate: new Date().toISOString(),
    };
    
    localStorage.setItem('demoUser', JSON.stringify(userData));
    
    // Add to demo accounts list
    const storedDemoAccounts = localStorage.getItem('demoAccounts');
    let demoAccounts = [];
    if (storedDemoAccounts) {
      demoAccounts = JSON.parse(storedDemoAccounts);
    }
    
    // Check if user already exists in the list
    const existingUserIndex = demoAccounts.findIndex(account => account.username === username);
    if (existingUserIndex === -1) {
      demoAccounts.push(userData);
      localStorage.setItem('demoAccounts', JSON.stringify(demoAccounts));
      console.log(`Registration successful for: ${username}`);
    } else {
      console.log(`User ${username} already exists in demo accounts`);
    }
  }
  
  register("NewTestUser");
  
  // Show final demo accounts list
  console.log("\nFinal demo accounts list:");
  const finalAccounts = JSON.parse(localStorage.getItem('demoAccounts'));
  finalAccounts.forEach((account, index) => {
    console.log(`${index + 1}. ${account.username} (joined: ${account.joinDate})`);
  });
  
  return true;
}

initializeDemoAccounts();
console.log("\nDemo accounts initialization test completed successfully!");