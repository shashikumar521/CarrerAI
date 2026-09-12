import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { GoogleIcon } from './GoogleIcon';
import { CareerAiAnimation } from './CareerAiAnimation';
import {
  signInWithEmail,
  signUpWithEmail,
  handleGoogleCredentialResponse,
} from '../utils/authService';
import { sendAdminLoginNotification } from '../utils/notificationService';
import { AccountRecord } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onAuthSuccess: (record: AccountRecord, isNewUser: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [isGsiRendered, setIsGsiRendered] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowTryAgain(false);
    setIsConnectingGoogle(false);
  }, [initialMode, isOpen]);

  // Helper to ensure Google Identity Services SDK is loaded
  const ensureGoogleGsiLoaded = (): Promise<boolean> => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.google?.accounts?.id) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts >= 40) {
            clearInterval(interval);
            resolve(false);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.google?.accounts?.id) {
            clearInterval(interval);
            resolve(true);
          } else if (attempts >= 20) {
            clearInterval(interval);
            resolve(false);
          }
        }, 50);
      };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  // Google credential response handler for GIS
  const handleGoogleCredentialCallback = (response: any) => {
    setIsConnectingGoogle(false);

    if (!response || !response.credential) {
      setErrorMessage('Google Sign-In could not be completed. Please try again.');
      setShowTryAgain(true);
      return;
    }

    try {
      setLoading(true);
      const authResult = handleGoogleCredentialResponse(response);

      if (!authResult.success || !authResult.record) {
        setLoading(false);
        setErrorMessage(authResult.error || 'Google Sign-In could not be completed. Please try again.');
        setShowTryAgain(true);
        return;
      }

      sendAdminLoginNotification({
        name: authResult.record.user.name || 'Google Student',
        email: authResult.record.user.email,
        loginMethod: 'Google',
        eventType: authResult.isNewUser ? 'registration' : 'login',
      });

      setSuccessMessage(
        authResult.isNewUser
          ? 'Google account connected! Loading your workspace...'
          : 'Signed in successfully! Redirecting to Dashboard...'
      );

      setTimeout(() => {
        setLoading(false);
        onAuthSuccess(authResult.record!, authResult.isNewUser || false);
        onClose();
      }, 500);
    } catch (err) {
      setLoading(false);
      setErrorMessage('Google Sign-In could not be completed. Please try again.');
      setShowTryAgain(true);
    }
  };

  // Initialize Google Identity Services and render official button when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (!googleClientId) {
      return;
    }

    let isMounted = true;

    ensureGoogleGsiLoaded().then((loaded) => {
      if (!isMounted) return;

      if (loaded && window.google?.accounts?.id) {
        try {
          // Initialize Google Identity Services with exact single Client ID
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialCallback,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: 'signin',
            ux_mode: 'popup',
            itp_support: true,
          });

          // Render official Google button into container
          if (googleBtnContainerRef.current) {
            googleBtnContainerRef.current.innerHTML = '';
            const parentWidth = googleBtnContainerRef.current.offsetWidth || 360;
            const buttonWidth = Math.min(380, Math.max(240, parentWidth));

            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: buttonWidth,
            });
            setIsGsiRendered(true);
          }

          // Safe debug output to verify Client ID and origin in production without exposing secrets
          if (typeof window !== 'undefined') {
            const currentOrigin = window.location.origin;
            const maskedClientId =
              googleClientId.length > 20
                ? `${googleClientId.substring(0, 12)}...${googleClientId.slice(-20)}`
                : googleClientId;
            console.log(
              `[CareerAI Auth] Google Identity Services initialized: ${maskedClientId} | Browser Origin: ${currentOrigin}`
            );
            if (currentOrigin.includes('run.app')) {
              console.warn(
                `[CareerAI Auth] Notice: Active browsing origin is an internal Cloud Run preview URL (${currentOrigin}). When deployed and opened at https://carrer-ai-kappa.vercel.app, the browser origin is https://carrer-ai-kappa.vercel.app.`
              );
            }
          }
        } catch (err) {
          console.warn('[CareerAI Auth] Google Identity Services notice:', err);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, googleClientId, mode]);

  // Handle Email/Password Sign In
  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowTryAgain(false);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    const result = signInWithEmail(email, password);
    setLoading(false);

    if (result.success && result.record) {
      sendAdminLoginNotification({
        name: result.record.user.name || 'Student',
        email: result.record.user.email,
        loginMethod: 'Email',
        eventType: 'login',
      });
      setSuccessMessage('Signed in successfully! Loading your student profile...');
      setTimeout(() => {
        onAuthSuccess(result.record!, false);
        onClose();
      }, 500);
    } else {
      setErrorMessage(result.error || 'Failed to sign in.');
    }
  };

  // Handle Email/Password Sign Up
  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setShowTryAgain(false);

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const result = signUpWithEmail(fullName, email, password);
    setLoading(false);

    if (result.success && result.record) {
      sendAdminLoginNotification({
        name: result.record.user.name || 'Student',
        email: result.record.user.email,
        loginMethod: 'Email',
        eventType: 'registration',
      });
      setSuccessMessage('Account created successfully! Redirecting to student assessment...');
      setTimeout(() => {
        onAuthSuccess(result.record!, true);
        onClose();
      }, 600);
    } else {
      setErrorMessage(result.error || 'Failed to create account.');
    }
  };

  // Trigger Real Production Google OAuth Flow using GIS popup/callback
  const handleContinueWithGoogle = async () => {
    setErrorMessage(null);
    setShowTryAgain(false);

    // If VITE_GOOGLE_CLIENT_ID is missing:
    // show a simple user-friendly message such as:
    // "Google Sign-In is temporarily unavailable. Please use email and password."
    // Do NOT show developer setup instructions.
    if (!googleClientId) {
      setErrorMessage('Google Sign-In is temporarily unavailable. Please use email and password.');
      return;
    }

    setIsConnectingGoogle(true);

    try {
      const isLoaded = await ensureGoogleGsiLoaded();
      if (!isLoaded || !window.google?.accounts?.id) {
        setIsConnectingGoogle(false);
        setErrorMessage('Google Sign-In could not be completed. Please try again.');
        setShowTryAgain(true);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
        itp_support: true,
      });

      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = '';
        const parentWidth = googleBtnContainerRef.current.offsetWidth || 360;
        const buttonWidth = Math.min(380, Math.max(240, parentWidth));
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: buttonWidth,
        });
        setIsGsiRendered(true);
      }

      window.google.accounts.id.prompt((notification: any) => {
        setIsConnectingGoogle(false);
        if (notification.isDismissedMoment()) {
          return;
        }
      });
    } catch (err) {
      setIsConnectingGoogle(false);
      setErrorMessage('Google Sign-In could not be completed. Please try again.');
      setShowTryAgain(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        id="auth-modal-card"
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative my-8 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img
              src="/careerai-logo.png"
              alt="CareerAI logo"
              className="w-9 h-9 rounded-full object-contain border border-amber-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <h2 id="auth-modal-title" className="text-lg font-semibold tracking-tight text-slate-900 leading-tight">
                {mode === 'signin' ? 'Sign In to CareerAI' : 'Create CareerAI Account'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Engineering placement readiness &amp; career guidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
              setShowTryAgain(false);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
              setShowTryAgain(false);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-5">
          {/* Active Loading State with Official CareerAI Animation */}
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <CareerAiAnimation
                size="md"
                loop={true}
                transparentBg={true}
                label={mode === 'signup' ? 'Creating CareerAI Account...' : 'Authenticating Account...'}
                sublabel="Connecting to secure session registry and loading student intelligence metrics"
              />
            </div>
          ) : (
            <>
              {/* Error Banner with Optional Try Again */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                  {showTryAgain && (
                    <button
                      type="button"
                      onClick={handleContinueWithGoogle}
                      className="text-xs font-bold text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer ml-2"
                    >
                      Try again
                    </button>
                  )}
                </div>
              )}

              {/* Success Banner */}
              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Prominent "Continue with Google" Container */}
              <div className="w-full flex flex-col items-center justify-center">
                {/* Official Google Identity Services Render Container */}
                <div
                  ref={googleBtnContainerRef}
                  className={`w-full flex items-center justify-center min-h-[44px] ${
                    isGsiRendered ? 'block' : 'hidden'
                  }`}
                />

                {/* Fallback button shown before GIS button renders or if client ID unavailable */}
                {!isGsiRendered && (
                  <button
                    type="button"
                    id="google-signin-btn"
                    onClick={handleContinueWithGoogle}
                    disabled={loading || isConnectingGoogle}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isConnectingGoogle ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                        <span>Connecting to Google...</span>
                      </>
                    ) : (
                      <>
                        <GoogleIcon className="w-5 h-5 shrink-0" />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* OR Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 font-semibold text-slate-400 tracking-wider">
                    or
                  </span>
                </div>
              </div>

              {/* Form: Email & Password */}
              <form onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sudarsi Shashi Kumar"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@college.edu.in"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || isConnectingGoogle}
                  className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : mode === 'signin' ? (
                    <span>Sign In</span>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Privacy & Account Isolation Policy */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-normal">
              <strong>Account Isolation:</strong> Your student metrics and diagnostic assessments are private to your CareerAI account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

