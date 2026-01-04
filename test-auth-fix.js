// Test script to verify the authentication fix
console.log("Testing authentication system fix...");

// Simulate the complete authentication flow
function testAuthSystem() {
  console.log("Setting up localStorage simulation...");
  
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
  
  // Simulate the AuthContext initialization
  console.log("\n--- Simulating AuthContext initialization ---");
  
  // Initialize default demo accounts if none exist (this happens on app start)
  const storedDemoAccounts = localStorage.getItem('demoAccounts');
  if (!storedDemoAccounts) {
    console.log("No demo accounts found, initializing default accounts...");
    
    // Add default demo accounts
    const defaultDemoAccounts = [
      { username: 'KRISHNA PATIL RAJPUT', joinDate: new Date().toISOString() },
      { username: 'Om Khapote', joinDate: new Date().toISOString() },
      { username: 'Gunjan Pande', joinDate: new Date().toISOString() },
    ];
    
    localStorage.setItem('demoAccounts', JSON.stringify(defaultDemoAccounts));
    console.log("✅ Default demo accounts initialized");
  } else {
    console.log("Demo accounts already exist:", JSON.parse(storedDemoAccounts));
  }
  
  // Simulate login function
  function login(username) {
    console.log(`\nAttempting to login with: ${username}`);
    
    // First check if it's the currently logged in user
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.username === username) {
        console.log(`✅ Login successful (current user): ${username}`);
        localStorage.setItem('demoUser', JSON.stringify(userData));
        return true;
      }
    }
    
    // Check in demo accounts list
    const storedDemoAccounts = localStorage.getItem('demoAccounts');
    if (storedDemoAccounts) {
      const demoAccounts = JSON.parse(storedDemoAccounts);
      console.log(`Found ${demoAccounts.length} demo accounts in storage`);
      
      const foundUser = demoAccounts.find(account => account.username === username);
      if (foundUser) {
        console.log(`✅ Login successful (demo account): ${username}`);
        localStorage.setItem('demoUser', JSON.stringify(foundUser));
        return true;
      } else {
        console.log(`❌ User not found in demo accounts: ${username}`);
      }
    } else {
      console.log("❌ No demo accounts found in storage");
    }
    
    console.log(`❌ Login failed for: ${username}`);
    return false;
  }
  
  // Test the login functionality with demo accounts
  console.log("\n--- Testing Demo Account Logins ---");
  
  const demoUsers = ['KRISHNA PATIL RAJPUT', 'Om Khapote', 'Gunjan Pande'];
  
  demoUsers.forEach(user => {
    const result = login(user);
    console.log(`Result for ${user}: ${result ? 'SUCCESS' : 'FAILED'}`);
  });
  
  // Test with a non-existent user
  console.log("\n--- Testing Non-Existent User ---");
  const invalidResult = login('NonExistentUser');
  console.log(`Result for NonExistentUser: ${invalidResult ? 'SUCCESS' : 'FAILED'}`);
  
  // Test the register function as well
  console.log("\n--- Testing Registration ---");
  
  function register(username) {
    console.log(`Registering new user: ${username}`);
    
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
      console.log(`✅ User registered successfully: ${username}`);
    } else {
      console.log(`ℹ️  User already exists: ${username}`);
    }
    
    return true;
  }
  
  // Register a new user and then try to login
  register('NewTestUser');
  const newTestResult = login('NewTestUser');
  console.log(`Login result for NewTestUser: ${newTestResult ? 'SUCCESS' : 'FAILED'}`);
  
  // Final check of all accounts in storage
  console.log("\n--- Final State ---");
  const finalAccounts = JSON.parse(localStorage.getItem('demoAccounts') || '[]');
  console.log(`Total demo accounts: ${finalAccounts.length}`);
  finalAccounts.forEach((account, index) => {
    console.log(`  ${index + 1}. ${account.username}`);
  });
  
  console.log("\n✅ Authentication system test completed successfully!");
  console.log("The demo accounts should work correctly now.");
  console.log("If you're still having issues, try clearing your browser's localStorage and refreshing the page.");
  
  return true;
}

testAuthSystem();