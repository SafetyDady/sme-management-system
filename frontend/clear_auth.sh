#!/bin/bash

echo "🧹 Clearing Browser Data for Authentication Reset"
echo "================================================="

# Create a script that can be copied and pasted into browser console
cat > clear_browser_auth.js << 'EOF'
// Clear Browser Authentication Data
console.clear();
console.log('🧹 Clearing all authentication data...');

// 1. Clear localStorage
console.log('📦 Clearing localStorage...');
const localStorageKeys = Object.keys(localStorage);
localStorageKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log('  Removed:', key);
});

// 2. Clear sessionStorage
console.log('📦 Clearing sessionStorage...');
const sessionStorageKeys = Object.keys(sessionStorage);
sessionStorageKeys.forEach(key => {
  sessionStorage.removeItem(key);
  console.log('  Removed:', key);
});

// 3. Clear all cookies
console.log('🍪 Clearing cookies...');
document.cookie.split(';').forEach(cookie => {
  const eqPos = cookie.indexOf('=');
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
  if (name) {
    // Clear for current domain
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + location.hostname;
    console.log('  Cleared cookie:', name);
  }
});

// 4. Clear IndexedDB (if used)
if ('indexedDB' in window) {
  console.log('🗃️ Clearing IndexedDB...');
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      indexedDB.deleteDatabase(db.name);
      console.log('  Deleted database:', db.name);
    });
  });
}

console.log('✅ All authentication data cleared!');
console.log('🔄 Reloading page...');

// Reload the page after a short delay
setTimeout(() => {
  window.location.reload();
}, 1000);
EOF

echo "📄 Created clear_browser_auth.js script"
echo
echo "🔧 Manual Steps to Clear Browser Data:"
echo "1. Open browser and go to http://localhost:5174"
echo "2. Open Developer Tools (F12)"
echo "3. Go to Console tab"
echo "4. Copy and paste the content of clear_browser_auth.js"
echo "5. Press Enter to execute"
echo
echo "Or you can:"
echo "1. Right-click on the browser"
echo "2. Choose 'Inspect' or 'Developer Tools'"
echo "3. Go to Application tab (Chrome) or Storage tab (Firefox)"
echo "4. Clear Local Storage, Session Storage, and Cookies manually"
echo
echo "The script content is:"
echo "----------------------------------------"
cat clear_browser_auth.js
echo "----------------------------------------"
