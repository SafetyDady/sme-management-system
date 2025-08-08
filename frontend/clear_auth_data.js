
console.clear();
console.log('🧹 Clearing all authentication data...');

// Clear localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('token') || key.includes('user') || key.includes('auth')) {
    localStorage.removeItem(key);
    console.log('Removed from localStorage:', key);
  }
});

// Clear sessionStorage  
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('token') || key.includes('user') || key.includes('auth')) {
    sessionStorage.removeItem(key);
    console.log('Removed from sessionStorage:', key);
  }
});

// Clear all cookies
document.cookie.split(';').forEach(cookie => {
  const eqPos = cookie.indexOf('=');
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
  if (name) {
    // Clear for current domain
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + location.hostname;
    console.log('Cleared cookie:', name);
  }
});

console.log('✅ All authentication data cleared!');
console.log('🔄 Please refresh the page and try login again');

