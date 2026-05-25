'use client';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, clearAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => { 
    const currentUser = getUser();
    console.log('🔍 Navbar - Current user:', currentUser);
    console.log('🔍 Navbar - User role:', currentUser?.role);
    
    // FIX: Check if user is actually logged in (has an id or email)
    const isValidUser = currentUser && (currentUser.id || currentUser.email);
    setUser(isValidUser ? currentUser : null);
  }, [pathname]);

  function logout() {
    clearAuth();
    router.push('/');
  }

  const role = user?.role;
  // FIX: Check if user exists and is truly logged in
  const isLoggedIn = user !== null && user !== undefined;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a className="navbar-logo" href="/" style={{ cursor: 'pointer' }}>
          <div className="logo-dot">🔬</div>
          DermAI
        </a>

        <div className="navbar-links">
          {/* FIX: Not logged in - check properly */}
          {!isLoggedIn && (
            <>
              <span className="nav-link" onClick={() => router.push('/pricing')}>Pricing</span>
              <button className="nav-btn nav-btn-outline" onClick={() => router.push('/login')}>Login</button>
              <button className="nav-btn nav-btn-primary" onClick={() => router.push('/register')}>Get Started</button>
            </>
          )}

          {/* FIX: Logged in - show everything including Developer link */}
          {isLoggedIn && (
            <>
              <span className={`nav-link ${pathname === '/home' ? 'active' : ''}`} onClick={() => router.push('/home')}>
                Predict
              </span>
              
              {/* Developer link - visible to ALL logged in users */}
              <span className={`nav-link ${pathname === '/dev' ? 'active' : ''}`} onClick={() => router.push('/dev')}>
                Developer
              </span>
              
              <span className={`nav-link ${pathname === '/chat' ? 'active' : ''}`} onClick={() => router.push('/chat')}>
                Chat
              </span>
              
              <span className="nav-link" onClick={() => router.push('/pricing')}>
                Pricing
              </span>
              
              <button className="nav-btn nav-btn-outline" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}