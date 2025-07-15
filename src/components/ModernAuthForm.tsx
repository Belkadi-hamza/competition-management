import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield, Trophy, Target, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ModernAuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const { login, register, loading, error } = useAuth();

  // Animated background particles
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number}>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1
    }));
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result) {
          setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert('Les mots de passe ne correspondent pas');
          return;
        }
        if (formData.password.length < 6) {
          alert('Le mot de passe doit contenir au moins 6 caractères');
          return;
        }
        const result = await register(formData.email, formData.password, formData.fullName);
        if (result) {
          setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden rounded-3xl">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.id * 0.1}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 text-white/20 animate-bounce">
        <Trophy className="w-8 h-8" />
      </div>
      <div className="absolute top-40 right-32 text-white/20 animate-pulse">
        <Target className="w-6 h-6" />
      </div>
      <div className="absolute bottom-32 left-40 text-white/20 animate-bounce" style={{ animationDelay: '1s' }}>
        <Shield className="w-7 h-7" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-8 pb-6">
            {/* Tab Switcher */}
            <div className="relative bg-white/10 rounded-2xl p-1 mb-6">
              <div
                className={`absolute top-1 bottom-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl transition-all duration-300 ${
                  isLogin ? 'left-1 right-1/2' : 'left-1/2 right-1'
                }`}
              />
              <div className="relative flex">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${
                    isLogin ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-3 text-sm font-medium rounded-xl transition-colors ${
                    !isLogin ? 'text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Inscription
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="group">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/80 transition-colors" />
                    <input
                      type="text"
                      name="fullName"
                      required={!isLogin}
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                      placeholder="Votre nom complet"
                    />
                  </div>
                </div>
              )}

              <div className="group">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/80 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/80 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                    placeholder={isLogin ? "••••••••" : "Minimum 6 caractères"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="group">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/80 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required={!isLogin}
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || isLoading}
                className="group w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl font-medium hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading || isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Chargement...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? 'Se connecter' : 'Créer un compte'}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  onClick={toggleMode}
                  className="ml-2 text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </button>
              </p>
            </div>

            {/* Security Badge */}
            <div className="mt-6 flex items-center justify-center space-x-2 text-white/50 text-xs">
              <Shield className="w-4 h-4" />
              <span>Connexion sécurisée SSL</span>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-white/60">
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs">Gestion complète</p>
          </div>
          <div className="text-white/60">
            <Target className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs">Interface intuitive</p>
          </div>
          <div className="text-white/60">
            <Shield className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs">Sécurité avancée</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAuthForm;