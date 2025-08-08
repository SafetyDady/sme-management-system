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
