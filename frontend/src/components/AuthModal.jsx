import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, User, Phone, Anchor, Ship, 
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, 
  RefreshCw, LogOut, KeyRound, Globe, Shield,
  Activity, Compass, FileText, History, LifeBuoy, ShieldAlert, Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MarineApi from '../services/api';

export default function AuthModal({ onLoginSuccess, onNavigateToAuthorityAuth }) {
  const { 
    user, 
    authModal, 
    closeAuthModal, 
    login, 
    register, 
    logout, 
    updateProfile,
    setAuthModal 
  } = useAuth();

  // Suppress background leaflet popups and tooltips while modal is open
  useEffect(() => {
    if (authModal.isOpen) {
      document.body.classList.add('auth-modal-active');
      document.querySelectorAll('.leaflet-popup-pane, .leaflet-tooltip-pane').forEach(el => {
        el.style.display = 'none';
      });
      document.querySelectorAll('.leaflet-popup-close-button').forEach(b => b.click());
    } else {
      document.body.classList.remove('auth-modal-active');
      document.querySelectorAll('.leaflet-popup-pane, .leaflet-tooltip-pane').forEach(el => {
        el.style.display = '';
      });
    }
    return () => {
      document.body.classList.remove('auth-modal-active');
      document.querySelectorAll('.leaflet-popup-pane, .leaflet-tooltip-pane').forEach(el => {
        el.style.display = '';
      });
    };
  }, [authModal.isOpen]);

  const [mode, setMode] = useState(authModal.mode || 'login'); // 'login' | 'register' | 'forgot' | 'profile' | 'authority'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authority portal state
  const [authSubTab, setAuthSubTab] = useState('login'); // 'login' | 'register'
  const [authOfficerName, setAuthOfficerName] = useState('Cmdr. S. R. Ramanathan');
  const [authDepartment, setAuthDepartment] = useState('Indian Coast Guard (ICG) - Eastern Seaboard');
  const [authBadgeNo, setAuthBadgeNo] = useState('ICG-CMD-8842');
  const [authBaseStation, setAuthBaseStation] = useState('Visakhapatnam Operations HQ');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('+91 891 256 4421');

  // Profile Sub-tab state
  const [profileTab, setProfileTab] = useState('profile'); // 'profile' | 'activity'
  const [activityData, setActivityData] = useState(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVesselName, setRegVesselName] = useState('Matsya-Varuna');
  const [regBasePort, setRegBasePort] = useState('Rameswaram Fishing Harbor');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1 = enter email, 2 = enter token & new password

  // Profile form state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileBasePort, setProfileBasePort] = useState('');
  const [profileVesselName, setProfileVesselName] = useState('');
  const [profileVesselReg, setProfileVesselReg] = useState('');
  const [profileVesselType, setProfileVesselType] = useState('');
  const [profileLanguage, setProfileLanguage] = useState('en');

  // Sync mode with authModal.mode
  useEffect(() => {
    if (authModal.mode) {
      setMode(authModal.mode);
      setError('');
      setSuccessMsg('');
    }
  }, [authModal.mode, authModal.isOpen]);

  // Sync profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileBasePort(user.base_port || 'Rameswaram Fishing Harbor');
      setProfileVesselName(user.vessel_name || 'Matsya-Varuna');
      setProfileVesselReg(user.vessel_reg || 'IND-TN-09-MM-4421');
      setProfileVesselType(user.vessel_type || 'Mechanized Wooden Trawler (14m)');
      setProfileLanguage(user.preferred_language || 'en');
    }
  }, [user]);

  const loadActivity = async () => {
    if (!user) return;
    setIsLoadingActivity(true);
    try {
      const res = await MarineApi.getMyActivity();
      if (res && res.success) {
        setActivityData(res);
      }
    } catch (err) {
      console.warn('Failed to load user activity:', err);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (mode === 'profile' && user) {
      loadActivity();
    }
  }, [mode, user]);

  if (!authModal.isOpen) return null;

  // 1-Click Quick Demo Account
  const handleQuickDemoLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await login('demo@marine-ai.io', 'marineai2026');
      closeAuthModal();
      if (onLoginSuccess) onLoginSuccess(authModal.targetScreen);
    } catch (err) {
      setError(err.message || 'Demo authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Maritime Authority Account
  const handleQuickAuthorityLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await login('authority@marine-ai.io', 'authority2026');
      closeAuthModal();
      if (onLoginSuccess) onLoginSuccess('screen-authority');
    } catch (err) {
      setError(err.message || 'Authority authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorityLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(authEmail || 'authority@marine-ai.io', authPassword || 'authority2026');
      closeAuthModal();
      if (onLoginSuccess) onLoginSuccess('screen-authority');
    } catch (err) {
      setError(err.message || 'Invalid authority credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorityRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authPassword !== authConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (authPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: authOfficerName,
        email: authEmail,
        password: authPassword,
        confirm_password: authConfirmPassword,
        role: 'authority',
        department: authDepartment,
        badge_no: authBadgeNo,
        phone: authPhone,
        base_port: authBaseStation,
        vessel_name: `${authDepartment} HQ`,
      });
      closeAuthModal();
      if (onLoginSuccess) onLoginSuccess('screen-authority');
    } catch (err) {
      setError(err.message || 'Authority registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      closeAuthModal();
      if (onLoginSuccess) onLoginSuccess(authModal.targetScreen);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        confirm_password: regConfirmPassword,
        phone: regPhone,
        base_port: regBasePort,
        vessel_name: regVesselName,
      });
      closeAuthModal();
      if (onLoginSuccess) onLoginSuccess(authModal.targetScreen);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await MarineApi.forgotPassword({ email: forgotEmail });
      if (res && res.token_available) {
        setResetToken(res.reset_token);
        setResetStep(2);
        setSuccessMsg('Reset token generated. Enter your new password below.');
      } else {
        setSuccessMsg(res?.message || 'Password reset instructions have been logged.');
      }
    } catch (err) {
      setError(err.message || 'Error processing request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await MarineApi.resetPassword({
        token: resetToken,
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      });
      setSuccessMsg('Password reset successfully. You can now log in.');
      setMode('login');
      setResetStep(1);
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: profileName,
        phone: profilePhone,
        base_port: profileBasePort,
        vessel_name: profileVesselName,
        vessel_reg: profileVesselReg,
        vessel_type: profileVesselType,
        preferred_language: profileLanguage,
      });
      setSuccessMsg('Profile and vessel registrations updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Profile update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative z-[9100] bg-white rounded-[16px] max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className={`px-5 py-4 text-white flex items-center justify-between shrink-0 ${
          mode === 'authority' 
            ? 'bg-gradient-to-r from-[#071322] via-[#0B1E36] to-[#163558] border-b border-amber-500/30'
            : 'bg-gradient-to-r from-[#0B1E36] to-[#163558]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xs ${
              mode === 'authority' 
                ? 'bg-amber-500/20 border border-amber-400/50 text-amber-400' 
                : 'bg-blue-500/20 border border-blue-400/40 text-blue-400'
            }`}>
              {mode === 'authority' ? <ShieldAlert className="w-4 h-4 text-amber-400" /> : '🌊'}
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide leading-tight flex items-center gap-1.5">
                <span>
                  {mode === 'authority' 
                    ? 'Maritime Authority Command Portal' 
                    : mode === 'profile' 
                    ? 'Master Fisher Profile' 
                    : 'Marine Intelligence Account'}
                </span>
                {mode === 'authority' && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-600 text-white font-black uppercase tracking-wider">
                    HQ
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-300 mt-0.5">
                {mode === 'authority' && 'Official credential authorization for Coast Guard, INCOIS & Disaster Management'}
                {mode === 'login' && 'Secure access to vessel telemetry & decision engine'}
                {mode === 'register' && 'Register your vessel identity & coastal telemetry'}
                {mode === 'forgot' && 'Account recovery & credential reset'}
                {mode === 'profile' && 'Authorized credentials & vessel registry'}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Message Banner if redirected */}
        {authModal.message && (
          <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-[11px] text-blue-800 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{authModal.message}</span>
          </div>
        )}

        {/* Tab Switcher */}
        {mode === 'authority' ? (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => { setAuthSubTab('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authSubTab === 'login'
                  ? 'bg-white text-[#0B1E36] border-b-2 border-[#0B1E36] font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Authority Login</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthSubTab('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
                authSubTab === 'register'
                  ? 'bg-white text-[#0B1E36] border-b-2 border-[#0B1E36] font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Authority Register</span>
            </button>
          </div>
        ) : mode !== 'forgot' && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold shrink-0">
            {user ? (
              <div className="px-5 py-2.5 text-[#1D63ED] border-b-2 border-[#1D63ED] bg-white w-full flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>My Profile & Vessel</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2.5 text-center transition cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-[#1D63ED] border-b-2 border-[#1D63ED] font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2.5 text-center transition cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-[#1D63ED] border-b-2 border-[#1D63ED] font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs text-[#0F2942]">
          {/* Alerts */}
          {error && (
            <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= MODE: AUTHORITY (LOGIN / REGISTER) ================= */}
          {mode === 'authority' && (
            <div className="space-y-3">
              {authSubTab === 'login' ? (
                /* Authority Login */
                <form onSubmit={handleAuthorityLoginSubmit} className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#0B1E36] border border-amber-500/40 text-white text-[11px] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      </div>
                      <div>
                        <span className="font-bold text-amber-300 block text-xs">Official Authority Access</span>
                        <span className="text-[10px] text-slate-300">Indian Coast Guard • INCOIS • SDMA</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono font-black text-[9px] uppercase tracking-wider">RESTRICTED</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Official Service Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="authority@marine-ai.io"
                        className="w-full pl-9 pr-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] focus:bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Service Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                        className="text-[11px] text-[#1D63ED] hover:underline font-semibold cursor-pointer"
                      >
                        Forgot Passphrase?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] focus:bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-[8px] bg-[#0B1E36] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5 text-amber-400" />}
                    <span>Sign In to Maritime Authority Command</span>
                  </button>

                  {/* Dev / Quick Test Autofill Helper */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthEmail('authority@marine-ai.io');
                        setAuthPassword('authority2026');
                        setError('');
                      }}
                      className="w-full py-2 rounded-[8px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Autofill Demo Credentials (Cmdr. Ramanathan)</span>
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                        className="text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline cursor-pointer"
                      >
                        ← Return to Master Fisher & Crew Portal
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Authority Register */
                <form onSubmit={handleAuthorityRegisterSubmit} className="space-y-3">
                  <div className="p-2.5 rounded-[8px] bg-slate-900 border border-slate-700 text-white text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-300 block">Authority Officer Registration</span>
                        <span className="text-[10px] text-slate-300">Issue credentials for maritime command</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[9px]">OFFICIAL</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Officer Full Name & Rank *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={authOfficerName}
                        onChange={(e) => setAuthOfficerName(e.target.value)}
                        placeholder="e.g., Commander S. R. Ramanathan"
                        className="w-full pl-9 pr-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Agency / Department *
                      </label>
                      <select
                        value={authDepartment}
                        onChange={(e) => setAuthDepartment(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] text-xs"
                      >
                        <option>Indian Coast Guard (ICG)</option>
                        <option>INCOIS Advisory Division</option>
                        <option>Disaster Management (SDMA)</option>
                        <option>Mercantile Marine Dept (MMD)</option>
                        <option>Harbor Master / Port Authority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Badge / Service ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={authBadgeNo}
                        onChange={(e) => setAuthBadgeNo(e.target.value)}
                        placeholder="e.g., ICG-CMD-8842"
                        className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] focus:bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Duty Base Station *
                      </label>
                      <select
                        value={authBaseStation}
                        onChange={(e) => setAuthBaseStation(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] text-xs"
                      >
                        <option>Visakhapatnam Operations HQ</option>
                        <option>Chennai Naval / CG Station</option>
                        <option>Kochi Maritime Rescue HQ</option>
                        <option>Paradip Coast Guard Station</option>
                        <option>Kakinada Operations Base</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Official Phone
                      </label>
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="+91 891 256 4421"
                        className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] focus:bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="officer.name@coastguard.gov.in"
                      className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] focus:bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#0B1E36] text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-[8px] bg-[#0B1E36] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
                    <span>Register Authorized Officer & Enter Command Center</span>
                  </button>

                  <div className="pt-2 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                      className="text-slate-500 hover:text-slate-800 text-xs font-semibold hover:underline cursor-pointer"
                    >
                      ← Return to Master Fisher & Crew Portal
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= MODE: LOGIN ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@marine-ai.io"
                    className="w-full pl-9 pr-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-[10px] text-[#1D63ED] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] focus:bg-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-[8px] bg-[#1D63ED] hover:bg-[#1552C6] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Sign In to Marine Intelligence</span>
              </button>

              {/* Demo 1-Click Fast Login */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={isSubmitting}
                  className="w-full py-2 rounded-[8px] bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#86EFAC] text-[#166534] font-semibold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>One-Click Fisher (K. Murugan)</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickAuthorityLogin}
                  disabled={isSubmitting}
                  className="w-full py-2 rounded-[8px] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] font-semibold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>One-Click Maritime Authority (Cmdr. Ramanathan)</span>
                </button>

                <div className="pt-1.5 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('authority');
                      setAuthSubTab('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-[#0B1E36] hover:text-[#1D63ED] font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>Maritime Authority / Coast Guard Portal →</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ================= MODE: REGISTER ================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Name / Captain *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g., Captain Alice Murugan"
                    className="w-full pl-9 pr-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="captain@sea.in"
                    className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] focus:bg-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vessel Name
                  </label>
                  <input
                    type="text"
                    value={regVesselName}
                    onChange={(e) => setRegVesselName(e.target.value)}
                    placeholder="Matsya-Varuna"
                    className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Home Base Port
                  </label>
                  <select
                    value={regBasePort}
                    onChange={(e) => setRegBasePort(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] text-xs"
                  >
                    <option>Rameswaram Fishing Harbor</option>
                    <option>Visakhapatnam Outer Harbor</option>
                    <option>Kochi Fishing Harbor</option>
                    <option>Chennai Kasimedu Port</option>
                    <option>Kakinada Deep Water Port</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-[8px] bg-[#1D63ED] hover:bg-[#1552C6] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Create Master Fisher Account</span>
              </button>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('authority');
                    setAuthSubTab('register');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-[#0B1E36] hover:text-[#1D63ED] font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Maritime Officer Registration Portal →</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= MODE: FORGOT / RESET PASSWORD ================= */}
          {mode === 'forgot' && (
            <div className="space-y-3">
              {resetStep === 1 ? (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Enter the email address registered with your vessel account to receive a secure recovery token.
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="captain@marine-ai.io"
                      className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-slate-900 focus:outline-none focus:border-[#1D63ED] focus:bg-white text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-slate-600 hover:text-slate-900"
                    >
                      Back to Sign In
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-[6px] bg-[#1D63ED] text-white font-bold text-xs"
                    >
                      {isSubmitting ? 'Generating...' : 'Continue'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Reset Token
                    </label>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3 py-2 rounded-[6px] bg-[#F8FAFC] border border-slate-300 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-[8px] bg-[#1D63ED] text-white font-bold text-xs"
                  >
                    {isSubmitting ? 'Updating...' : 'Set New Password'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ================= MODE: USER PROFILE ================= */}
          {mode === 'profile' && user && (
            <div className="space-y-3">
              {/* Account Identifier Card */}
              <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#0B1E36] text-white font-bold text-sm flex items-center justify-center">
                    {user.name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{user.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{user.email}</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                  Verified Fisher
                </span>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex rounded-[8px] bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setProfileTab('profile')}
                  className={`flex-1 py-1.5 px-3 rounded-[6px] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    profileTab === 'profile'
                      ? 'bg-white text-[#0B1E36] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Ship className="w-3.5 h-3.5" />
                  <span>Vessel Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileTab('activity');
                    loadActivity();
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-[6px] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    profileTab === 'activity'
                      ? 'bg-white text-[#1D63ED] shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-[#1D63ED]" />
                  <span>My Activity & History</span>
                </button>
              </div>

              {profileTab === 'profile' ? (
                <form onSubmit={handleProfileSave} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[6px] bg-white border border-slate-300 text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[6px] bg-white border border-slate-300 text-xs font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Base Port
                      </label>
                      <select
                        value={profileBasePort}
                        onChange={(e) => setProfileBasePort(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-[6px] bg-white border border-slate-300 text-xs text-slate-900"
                      >
                        <option>Rameswaram Fishing Harbor</option>
                        <option>Visakhapatnam Outer Harbor</option>
                        <option>Kochi Fishing Harbor</option>
                        <option>Chennai Kasimedu Port</option>
                        <option>Kakinada Deep Water Port</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Preferred Language
                      </label>
                      <select
                        value={profileLanguage}
                        onChange={(e) => setProfileLanguage(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-[6px] bg-white border border-slate-300 text-xs text-slate-900"
                      >
                        <option value="en">English</option>
                        <option value="te">Telugu (తెలుగు)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="ml">Malayalam (മലയാളം)</option>
                        <option value="bn">Bengali (বাংলা)</option>
                        <option value="or">Odia (ଓଡ଼ିଆ)</option>
                      </select>
                    </div>
                  </div>

                  {/* Vessel Registration Sub-card */}
                  <div className="p-3 rounded-[8px] bg-sky-50/50 border border-sky-200/70 space-y-2">
                    <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block">
                      Registered Vessel Telemetry
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-500 block">Vessel Name</label>
                        <input
                          type="text"
                          value={profileVesselName}
                          onChange={(e) => setProfileVesselName(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 block">Registration Code</label>
                        <input
                          type="text"
                          value={profileVesselReg}
                          onChange={(e) => setProfileVesselReg(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={logout}
                      className="px-3 py-1.5 rounded-[6px] text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-[6px] bg-[#1D63ED] hover:bg-[#1552C6] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Activity & History Sub-view */
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#1D63ED]" />
                      <span>Lifetime Activity Stats</span>
                    </div>
                    <button
                      type="button"
                      onClick={loadActivity}
                      disabled={isLoadingActivity}
                      className="text-[10px] text-[#1D63ED] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoadingActivity ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {/* 6-Metric Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-[8px] bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-500 block uppercase font-medium">Missions</span>
                      <span className="text-base font-bold text-[#0B1E36] font-mono">
                        {activityData?.stats?.total_missions ?? 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-[8px] bg-sky-50 border border-sky-200">
                      <span className="text-[9px] text-sky-700 block uppercase font-medium">AI Queries</span>
                      <span className="text-base font-bold text-sky-900 font-mono">
                        {activityData?.stats?.total_scientific_queries ?? 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-[8px] bg-amber-50 border border-amber-200">
                      <span className="text-[9px] text-amber-700 block uppercase font-medium">Safety Alerts</span>
                      <span className="text-base font-bold text-amber-900 font-mono">
                        {activityData?.stats?.total_safety_events ?? 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-[8px] bg-emerald-50 border border-emerald-200">
                      <span className="text-[9px] text-emerald-700 block uppercase font-medium">Sea Hours</span>
                      <span className="text-base font-bold text-emerald-900 font-mono">
                        {activityData?.stats?.total_sea_hours ?? 0}h
                      </span>
                    </div>

                    <div className="p-2 rounded-[8px] bg-indigo-50 border border-indigo-200">
                      <span className="text-[9px] text-indigo-700 block uppercase font-medium">Total Catch</span>
                      <span className="text-base font-bold text-indigo-900 font-mono">
                        {activityData?.stats?.total_catch_kg ?? 0} kg
                      </span>
                    </div>

                    <div className="p-2 rounded-[8px] bg-purple-50 border border-purple-200">
                      <span className="text-[9px] text-purple-700 block uppercase font-medium">Family Contacts</span>
                      <span className="text-base font-bold text-purple-900 font-mono">
                        {activityData?.stats?.total_family_contacts ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Recent Missions list */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">
                      Recent Missions
                    </span>
                    {activityData?.recent_missions?.length > 0 ? (
                      <div className="space-y-1">
                        {activityData.recent_missions.map((m) => (
                          <div key={m.id} className="p-2 rounded-[6px] bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-semibold text-slate-800">{m.mission_name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {m.base_port} → {m.destination_zone}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              {m.status || 'LOGGED'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-500 text-[11px] text-center">
                        No missions recorded yet for this vessel profile.
                      </div>
                    )}
                  </div>

                  {/* Recent AI Scientist Queries */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">
                      Recent Scientific AI Analyses
                    </span>
                    {activityData?.recent_scientific_queries?.length > 0 ? (
                      <div className="space-y-1">
                        {activityData.recent_scientific_queries.map((q) => (
                          <div key={q.id} className="p-2 rounded-[6px] bg-sky-50/60 border border-sky-200 flex items-center justify-between text-xs">
                            <div className="truncate max-w-[280px]">
                              <div className="font-medium text-sky-950 truncate">{q.query}</div>
                              <div className="text-[10px] text-sky-700 font-mono">{q.target_zone}</div>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9px] font-mono font-bold">
                              {q.confidence}% conf
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-[6px] bg-slate-50 border border-slate-200 text-slate-500 text-[11px] text-center">
                        No scientific queries recorded yet.
                      </div>
                    )}
                  </div>

                  {/* Bottom Signout */}
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      type="button"
                      onClick={logout}
                      className="px-3 py-1.5 rounded-[6px] text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
