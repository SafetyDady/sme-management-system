// Test API calls directly
async function testAPI() {
    console.log('=== API Test Starting ===');
    
    // 1. Test login first
    try {
        console.log('1. Testing login...');
        const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'superadmin',
                password: 'superadmin123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login Response:', loginData);
        
        if (loginData.access_token) {
            // 2. Test users API with token
            console.log('2. Testing users API...');
            const usersResponse = await fetch('/api/users/', {
                headers: {
                    'Authorization': `Bearer ${loginData.access_token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Users Response Status:', usersResponse.status);
            const usersData = await usersResponse.json();
            console.log('Users Data:', usersData);
        }
    } catch (error) {
        console.error('Test Error:', error);
    }
}

// Run the test
testAPI();
