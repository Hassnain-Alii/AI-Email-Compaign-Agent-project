import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Content',
    description: 'Generate professional email copy instantly with advanced AI.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Zap,
    title: 'Smart Delivery',
    description: 'Queue-based sending with automatic retry ensures deliverability.',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'OAuth 2.0, JWT tokens and rate limiting keep your data safe.',
    gradient: 'from-emerald-400 to-teal-500',
  },
];

const Login = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      toast.error('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-surface-secondary dark:bg-surface-dark flex">
      <Toaster position="top-right" />

      {/* Left – Hero */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 text-white flex-col justify-between p-14">
        {/* Texture / Decoration */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">EmailSaaS</span>
          </div>

          <div className="space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wide border border-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
              Powered by OpenAI + SendGrid
            </div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
              Email campaigns<br />
              that <span className="text-brand-200">actually convert.</span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed max-w-md">
              Generate, schedule, and send professional marketing campaigns with AI — in minutes, not hours.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4">
          {features.map(({ icon: Icon, title, description, gradient }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10 hover:bg-white/15 transition-colors"
            >
              <div className={`flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br ${gradient}`}>
                <Icon className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-white/60 mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right – Login form */}
      <div className="flex-1 lg:max-w-[480px] flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="h-9 w-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Mail className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">EmailSaaS</span>
        </div>

        <div className="w-full max-w-sm space-y-8 animate-slide-up">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
              Sign in to manage your email campaigns.
            </p>
          </div>

          <div className="card p-6 shadow-glass space-y-5 dark:bg-surface-dark-secondary">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border dark:border-border-dark rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-surface dark:bg-surface-dark hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary transition-all duration-200 shadow-card hover:shadow-card-hover active:scale-[0.98]"
            >
              <img
                className="h-5 w-5"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
              />
              Continue with Google
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border dark:bg-border-dark" />
              <span className="text-xs text-slate-400 flex-shrink-0">Secure SSO</span>
              <div className="flex-1 h-px bg-border dark:bg-border-dark" />
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl p-3.5">
              <Shield className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>Protected by Google OAuth 2.0 — we never store your password.</span>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
