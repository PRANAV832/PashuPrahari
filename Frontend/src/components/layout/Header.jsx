import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  LogIn,
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  Radio,
  Bell,
  UserCheck,
  User,
  PlusCircle,
  Menu,
  X,
  MapPin,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  ChevronDown,
  Globe,
} from 'lucide-react';
import { APP_NAME, APP_NAME_DEVANAGARI, APP_TAGLINE } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../services/authService';
import { useFarmerLanguage } from '../../context/FarmerLanguageContext';
import { NotificationBell } from '../alerts/NotificationBell';
import logoImg from '../../assets/logo.jpg';

export const Header = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { t, lang, setLang, languages } = useFarmerLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setProfileModalOpen(false);
    navigate('/login');
  };

  const getRoleBadgeStyle = (userRole) => {
    switch (userRole) {
      case USER_ROLES.ADMIN:
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case USER_ROLES.VETERINARIAN:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case USER_ROLES.FARMER:
      default:
        return 'bg-green-50 text-green-800 border-green-200';
    }
  };

  const getRoleTheme = (userRole) => {
    switch (userRole) {
      case USER_ROLES.ADMIN:
        return {
          activeClass: 'bg-purple-50 text-purple-900 font-black border border-purple-200 shadow-2xs',
          iconClass: 'text-purple-700',
        };
      case USER_ROLES.VETERINARIAN:
        return {
          activeClass: 'bg-emerald-50 text-emerald-900 font-black border border-emerald-200 shadow-2xs',
          iconClass: 'text-emerald-700',
        };
      case USER_ROLES.FARMER:
      default:
        return {
          activeClass: 'bg-green-50 text-green-900 font-black border border-green-200 shadow-2xs',
          iconClass: 'text-green-700',
        };
    }
  };

  const theme = getRoleTheme(role);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* ── 1. Consistent PashuPrahari Branding ────────────────────────── */}
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-3 group cursor-pointer focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs ring-2 ring-emerald-200/80 bg-white flex items-center justify-center group-hover:ring-emerald-400 transition-all">
              <img
                src={logoImg}
                alt="PashuPrahari Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg text-slate-900 tracking-tight group-hover:text-emerald-800 transition-colors">
                  {APP_NAME}
                </span>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {APP_NAME_DEVANAGARI}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block leading-none mt-0.5">
                {APP_TAGLINE}
              </p>
            </div>
          </NavLink>

          {/* ── 2. Unified Desktop Navigation (Role-Scoped) ───────────────── */}
          {isAuthenticated && user && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
              
              {/* ── ADMIN Navigation ── */}
              {role === USER_ROLES.ADMIN && (
                <>
                  <NavLink
                    to="/admin/dashboard"
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? theme.activeClass
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
                    <span>Dashboard</span>
                  </NavLink>

                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? theme.activeClass
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span>Users</span>
                  </NavLink>

                  <NavLink
                    to="/admin/cases"
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? theme.activeClass
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>Cases</span>
                  </NavLink>

                  <NavLink
                    to="/admin/assignment"
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive || location.pathname === '/admin/assignment'
                          ? theme.activeClass
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Assignment</span>
                  </NavLink>
                </>
              )}

              {/* ── FARMER Navigation ── */}
              {role === USER_ROLES.FARMER && (
                <>
                  <NavLink
                    to="/farmer/report"
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? theme.activeClass
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('navigation.reportIssue')}</span>
                  </NavLink>

                  <NavLink
                    to="/farmer/dashboard"
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? theme.activeClass
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-green-600" />
                    <span>{t('navigation.dashboard')}</span>
                  </NavLink>

                  <NavLink
                    to="/farmer/cases"
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? theme.activeClass
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('navigation.myReports')}</span>
                  </NavLink>
                </>
              )}

              {/* ── VETERINARIAN Navigation ── */}
              {role === USER_ROLES.VETERINARIAN && (
                <>
                  <NavLink
                    to="/veterinarian/dashboard"
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? theme.activeClass
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Dashboard</span>
                  </NavLink>

                  <NavLink
                    to="/veterinarian/cases"
                    className={({ isActive }) =>
                      `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive || location.pathname.startsWith('/veterinarian/cases') || location.pathname === '/veterinarian/assigned-cases'
                          ? 'bg-emerald-100/70 text-emerald-950 font-black border border-emerald-300'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`
                    }
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Assigned Cases</span>
                  </NavLink>
                </>
              )}

            </nav>
          )}

          {/* ── 3. Right Action Block (Alerts, Profile, Mobile Toggle) ───────── */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Farmer In-Header Language Switcher Control */}
            {isAuthenticated && user && role === USER_ROLES.FARMER && (
              <div
                className="flex items-center bg-emerald-50/70 p-1 rounded-xl border border-emerald-200/80 gap-1 text-xs"
                role="group"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700 ml-1.5 mr-0.5 shrink-0 hidden sm:inline" />
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      lang === l.code
                        ? 'bg-emerald-600 text-white shadow-xs font-black'
                        : 'text-slate-700 hover:text-emerald-900 hover:bg-emerald-100/60'
                    }`}
                    title={l.name}
                  >
                    {l.nativeName}
                  </button>
                ))}
              </div>
            )}

            {/* Notification Bell (Admin and Veterinarian) */}
            {isAuthenticated && user && (role === USER_ROLES.ADMIN || role === USER_ROLES.VETERINARIAN) && (
              <NotificationBell />
            )}

            {/* Profile Dropdown / Modal Trigger */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
                  title="View User Profile"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {user.name}
                    </span>
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border self-start mt-0.5 ${getRoleBadgeStyle(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{role === USER_ROLES.FARMER ? t('navigation.logout') : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle Button */}
            {isAuthenticated && user && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

          </div>

        </div>
      </div>

      {/* ── 4. Responsive Mobile Navigation Menu ─────────────────────────── */}
      {mobileMenuOpen && isAuthenticated && user && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          
          <div className="px-2 py-1.5 mb-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Logged in as: <strong>{user.name}</strong></span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(user.role)}`}>
              {user.role}
            </span>
          </div>

          {/* ADMIN Mobile Items */}
          {role === USER_ROLES.ADMIN && (
            <div className="space-y-1">
              <NavLink
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-900"
              >
                <LayoutDashboard className="w-4 h-4 text-purple-600" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-900"
              >
                <Users className="w-4 h-4 text-purple-600" />
                <span>Users</span>
              </NavLink>
              <NavLink
                to="/admin/cases"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-900"
              >
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Cases</span>
              </NavLink>
              <NavLink
                to="/admin/assignment"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-900"
              >
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Assignment Queue</span>
              </NavLink>
            </div>
          )}

          {/* FARMER Mobile Items */}
          {role === USER_ROLES.FARMER && (
            <div className="space-y-2">
              <div className="space-y-1">
                <NavLink
                  to="/farmer/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-green-50 hover:text-green-900"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>{t('navigation.reportIssue')}</span>
                </NavLink>
                <NavLink
                  to="/farmer/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-green-50 hover:text-green-900"
                >
                  <LayoutDashboard className="w-4 h-4 text-green-600" />
                  <span>{t('navigation.dashboard')}</span>
                </NavLink>
                <NavLink
                  to="/farmer/cases"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-green-50 hover:text-green-900"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{t('navigation.myReports')}</span>
                </NavLink>
              </div>

              {/* Mobile Language Switcher Pill Container */}
              <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 mb-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('navigation.selectLanguage')}:</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLang(l.code);
                        setMobileMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                        lang === l.code
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {l.nativeName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VETERINARIAN Mobile Items */}
          {role === USER_ROLES.VETERINARIAN && (
            <div className="space-y-1">
              <NavLink
                to="/veterinarian/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink
                to="/veterinarian/cases"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Assigned Cases</span>
              </NavLink>
            </div>
          )}

          {/* Mobile Profile & Logout */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setProfileModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200"
            >
              <User className="w-3.5 h-3.5" />
              <span>{role === USER_ROLES.FARMER ? t('navigation.profile') : 'Profile'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl border border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{role === USER_ROLES.FARMER ? t('navigation.logout') : 'Logout'}</span>
            </button>
          </div>

        </div>
      )}

      {/* ── 5. User Profile Modal ────────────────────────────────────────── */}
      {profileModalOpen && user && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden space-y-0 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {user.name}
                  </h3>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border inline-block mt-0.5 ${getRoleBadgeStyle(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Full Name:</span>
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Role:</span>
                  <span className="font-bold text-slate-900">{user.role}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Assigned Area / Circle:</span>
                  <span className="font-bold text-slate-900">{user.assignedArea || user.village || 'Thane District'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 font-medium">Session Status:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Authorized Session
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 text-xs"
                >
                  {role === USER_ROLES.FARMER ? t('common.close') : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs"
                >
                  {role === USER_ROLES.FARMER ? t('navigation.logout') : 'Sign Out'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
