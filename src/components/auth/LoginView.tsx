import React, { useState } from 'react';
import { Utensils, Shield, Lock, Mail, Eye, EyeOff, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { InputField } from '@components/ui/forms/InputField';
import { Button } from '@components/ui/Button';
import { Heading } from '@components/ui/Heading';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { getCurrentUser, isSuperAdmin } from '@/lib/security';
import { PLATFORM_NAME, PLATFORM_TAGLINE } from '@/config/platform';

export function LoginView() {
  const { loginWithCredentials } = useAuthStore();
  const { addToast } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await loginWithCredentials(email, password);
      setIsLoading(false);

      if (res.success) {
        addToast(`Welcome back to the ${PLATFORM_TAGLINE}!`, 'success');
        const user = getCurrentUser();
        if (user) {
          if (isSuperAdmin(user)) {
            window.history.pushState(null, '', '/super-admin/dashboard');
          } else {
            let targetPath = `/restaurant/${user.restaurantId}/dashboard`;
            if (user.role === 'kitchen') {
              targetPath = `/restaurant/${user.restaurantId}/kitchen`;
            } else if (user.role === 'cashier') {
              targetPath = `/restaurant/${user.restaurantId}/orders`;
            }
            window.history.pushState(null, '', targetPath);
          }
          window.dispatchEvent(new Event('popstate'));
        }
      } else {
        setErrorMessage(res.message || 'Login failed');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-white font-sans select-none">

      {/* LEFT SIDE: Creative Landing Visual & Stats */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent-dark text-white p-12 md:p-16 flex-col justify-between relative overflow-hidden">
        {/* Dynamic Abstract Vectors & Glow Effects */}
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary/20 to-transparent pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/3 w-80 h-80 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none" />

        {/* Top Logo & Branding */}
        <div className="relative z-10 flex justify-center items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 shadow-lg">
            <Utensils size={20} className="text-accent-primary animate-pulse" />
          </div>
          <span className="font-poppins font-bold text-center dtext-2xl tracking-tight text-white whitespace-nowrap">
            {PLATFORM_NAME}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-white/10 border border-white/5 text-white/80">
            Enterprise
          </span>
        </div>

        {/* Middle Visual Highlights - Slogan & Bento Glassmorphism Card */}
        <div className="relative z-10 max-w-md space-y-8 my-auto">
          <div className="space-y-3">
            <Heading as="h1" size="3xl" className="font-extrabold font-poppins leading-tight bg-gradient-to-r from-white via-white to-accent-light bg-clip-text text-transparent">
              One Engine. <br />
              Infinite Brands.
            </Heading>
            <p className="text-white/70 text-xs md:text-sm font-medium leading-relaxed">
              Super admins can deploy, configure, white-label, and manage credentials for hundreds of independent restaurant tenants. Each tenant gets their own distinct colors, categories, menu items, order flows, and customer files.
            </p>
          </div>

          {/* Interactive Stat Cards representing dashboard values */}
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/8 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                <ShoppingBag size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold font-mono">100% Isolated Tenants</p>
                <p className="text-[11px] text-white/60 font-semibold mt-0.5">Isolated databases, orders, and dashboards</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/8 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                <Sparkles size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold font-mono">Instant White-Labeling</p>
                <p className="text-[11px] text-white/60 font-semibold mt-0.5">Automatic UI theme generation via hex brand colors</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/8 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                <Shield size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold font-mono">Role-Based Access</p>
                <p className="text-[11px] text-white/60 font-semibold mt-0.5">Secure logins for Super Admin, Kitchen, and POS users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Platform Trust Lines */}
        <div className="relative z-10 flex items-center justify-between text-white/50 text-xs font-semibold border-t border-white/10 pt-5 mt-4">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-accent-primary" />
            <span>Enterprise Multi-Tenancy</span>
          </div>
          <span>© {new Date().getFullYear()} Indolj Network</span>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-canvas-bg overflow-y-auto">
        <div className="w-full max-w-md space-y-6 py-8 animate-fade-in">

          {/* Form Header */}
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-dark flex items-center justify-center text-white shadow-md">
                <Utensils size={24} />
              </div>
            </div>
            <Heading as="h2" size="2xl">
              {PLATFORM_NAME}
            </Heading>
            <p className="text-text-secondary text-xs md:text-sm font-semibold">
              Enter your admin details to login.
            </p>
          </div>

          {/* Form container */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl text-center animate-fade-in flex items-center justify-center gap-2">
                <Shield size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <InputField
              label="Email Address"
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@restaurant.com"
              leftIcon={<Mail size={16} />}
            />

            {/* Password Field */}
            <div className="relative">
              <div className="absolute right-0 top-0">
                <a href="#forgot" onClick={(e) => { e.preventDefault(); addToast('Please contact support to reset password.', 'info'); }} className="text-[10px] font-bold text-accent-primary hover:underline">
                  Forgot?
                </a>
              </div>
              <InputField
                label="Password"
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-text-primary transition-colors cursor-pointer flex items-center justify-center h-full"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-accent-primary focus:ring-accent-primary border-border-subtle rounded"
                />
                <span className="text-[11px] font-semibold text-text-secondary">Keep me signed in</span>
              </label>
            </div>

            {/* Submit Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] bg-accent-dark hover:bg-accent-dark/90 rounded-2xl text-xs"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight size={15} className="ml-2" />
                </>
              )}
            </Button>
          </form>



          {/* Footer Rights */}
          <div className="text-center text-[10px] text-text-secondary font-medium">
            Protected by Indolj Core Multi-Tenant Security Engine.
          </div>

        </div>
      </div>

    </div>
  );
}
