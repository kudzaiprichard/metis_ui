/**
 * LoginForm Component
 * Medical-themed login form
 */

'use client';

import { useState, FormEvent } from 'react';
import { useLogin } from '../hooks/useAuth';
import { useToast } from '@/src/components/shared/ui/toast';
import { ApiError } from '@/src/lib/types';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const login = useLogin();
    const { showToast } = useToast();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Validation
        if (!email || !password) {
            showToast('Validation Error', 'Please fill in all fields', 'error');
            return;
        }

        // Call login mutation
        // Success toast is queued in useLogin hook and will show on next page
        // Error toast shows immediately on this page
        login.mutate(
            { email, password },
            {
                onError: (error: ApiError) => {
                    showToast('Login Failed', error.getMessage(), 'error');
                },
            }
        );
    };

    return (
        <>
            <div className="login-container">
                <div className="login-header">
                    <div className="logo">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                    </div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Diabetes Treatment Optimization System</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="input-field"
                            placeholder="healthcare@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={login.isPending}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={login.isPending}
                        />
                    </div>

                    <div className="options-row">
                        <div className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={login.isPending}
                            />
                            <label htmlFor="remember" className="checkbox-label">Remember me</label>
                        </div>
                        <a href="#" className="forgot-link">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={login.isPending}
                    >
                        {login.isPending ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="divider">
                    <div className="divider-line"></div>
                    <span className="divider-text">or</span>
                    <div className="divider-line"></div>
                </div>

                <p className="footer-text">
                    Don`t have an account? <a href="/register" className="footer-link">Contact Administrator</a>
                </p>
            </div>

            <style jsx>{`
        .login-container {
          position: relative;
          z-index: 10;
          width: 420px;
          padding: 48px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 8px 16px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transform: translateZ(0);
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .logo {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #047857, #10b981);
          border-radius: 12px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .login-title {
          font-size: 24px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
        }

        .input-group {
          margin-bottom: 24px;
        }

        .input-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
        }

        .input-field {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          font-size: 15px;
          color: #ffffff;
          transition: all 0.3s ease;
          outline: none;
        }

        .input-field::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .input-field:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }

        .input-field:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-field:-webkit-autofill,
        .input-field:-webkit-autofill:hover,
        .input-field:-webkit-autofill:focus,
        .input-field:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgba(19, 52, 42, 0.9) inset !important;
          -webkit-text-fill-color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.12);
          transition: background-color 5000s ease-in-out 0s;
        }

        .options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox-wrapper input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #10b981;
        }

        .checkbox-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
        }

        .forgot-link {
          font-size: 13px;
          color: #34d399;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .forgot-link:hover {
          color: #6ee7b7;
        }

        .login-button {
          width: 100%;
          padding: 14px;
          background: #0d3a2e;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(13, 58, 46, 0.6);
        }

        .login-button:hover:not(:disabled) {
          box-shadow: 0 6px 14px rgba(13, 58, 46, 0.7);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          margin: 32px 0;
          gap: 16px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .divider-text {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
        }

        .footer-text {
          text-align: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 24px;
        }

        .footer-link {
          color: #34d399;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #6ee7b7;
        }
      `}</style>
        </>
    );
}