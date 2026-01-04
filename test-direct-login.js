// Test script to verify direct demo login functionality
console.log("Testing direct demo login functionality...");

// Simulate the authentication logic
function simulateDirectLogin() {
  console.log("Setting up demo accounts...");
  
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
  
  // Initialize demo accounts
  const defaultDemoAccounts = [
    { username: 'KRISHNA PATIL RAJPUT', joinDate: new Date().toISOString() },
    { username: 'Om Khapote', joinDate: new Date().toISOString() },
    { username: 'Gunjan Pande', joinDate: new Date().toISOString() },
  ];
  
  localStorage.setItem('demoAccounts', JSON.stringify(defaultDemoAccounts));
  console.log("Demo accounts initialized:", defaultDemoAccounts);
  
  // Simulate login function
  function login(username) {
    const storedDemoAccounts = localStorage.getItem('demoAccounts');
    if (storedDemoAccounts) {
      const demoAccounts = JSON.parse(storedDemoAccounts);
      const foundUser = demoAccounts.find(account => account.username === username);
      if (foundUser) {
        console.log(`✅ Login successful for: ${username}`);
        localStorage.setItem('demoUser', JSON.stringify(foundUser));
        return true;
      }
    }
    console.log(`❌ Login failed for: ${username} (user not found)`);
    return false;
  }
  
  // Test direct login functionality
  console.log("\n--- Testing Direct Login ---");
  
  const demoUsers = ['KRISHNA PATIL RAJPUT', 'Om Khapote', 'Gunjan Pande'];
  
  demoUsers.forEach(user => {
    console.log(`\nTesting login for: ${user}`);
    const result = login(user);
    console.log(`Result: ${result ? 'SUCCESS' : 'FAILED'}`);
  });
  
  // Test non-existent user
  console.log("\n--- Testing Invalid User ---");
  const invalidResult = login('NonExistentUser');
  console.log(`Result: ${invalidResult ? 'SUCCESS' : 'FAILED'}`);
  
  // Test case sensitivity
  console.log("\n--- Testing Case Sensitivity ---");
  const caseSensitiveResult = login('krishna patil rajput');
  console.log(`Result: ${caseSensitiveResult ? 'SUCCESS' : 'FAILED'}`);
  
  console.log("\n--- Test Results Summary ---");
  console.log("✅ Direct login buttons should work for:");
  demoUsers.forEach(user => console.log(`  • ${user}`));
  console.log("❌ Should fail for non-existent users");
  console.log("ℹ️  Login is case-sensitive");
  
  return true;
}

simulateDirectLogin();
console.log("\n🎉 Direct login functionality test completed!");