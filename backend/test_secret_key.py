#!/usr/bin/env python3
"""
Test JWT SECRET_KEY configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

def test_secret_key():
    print("🔍 Testing SECRET_KEY Configuration...")
    
    # Check environment variables
    jwt_secret = os.getenv("JWT_SECRET")
    secret_key = os.getenv("SECRET_KEY")
    
    print(f"JWT_SECRET: {'✅ Found' if jwt_secret else '❌ Not found'}")
    print(f"SECRET_KEY: {'✅ Found' if secret_key else '❌ Not found'}")
    
    # Test the logic from auth.py
    final_key = jwt_secret or secret_key
    if not final_key:
        final_key = "your-super-secret-key-change-in-production-very-long-and-secure-key-12345"
    
    print(f"\nFinal SECRET_KEY:")
    print(f"Type: {type(final_key)}")
    print(f"Length: {len(str(final_key))}")
    print(f"Preview: {str(final_key)[:20]}...")
    
    # Test JWT encoding
    try:
        from jose import jwt
        import time
        
        # Use current time + 1 hour for expiration
        current_time = int(time.time())
        test_data = {"sub": "test", "exp": current_time + 3600}
        
        token = jwt.encode(test_data, str(final_key), algorithm="HS256")
        print(f"\n✅ JWT Encoding: SUCCESS")
        print(f"Token preview: {token[:50]}...")
        
        # Test decoding
        decoded = jwt.decode(token, str(final_key), algorithms=["HS256"])
        print(f"✅ JWT Decoding: SUCCESS")
        print(f"Decoded data: {decoded}")
        
    except Exception as e:
        print(f"\n❌ JWT Test Failed: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_secret_key()
    print(f"\n{'🎉 All tests passed!' if success else '❌ Tests failed!'}")
