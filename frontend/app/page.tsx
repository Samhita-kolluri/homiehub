"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { isAuthenticated, apiClient, setAccessToken } from "@/lib/apiClient";
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from "@/lib/validation";
import { GENDER_OPTIONS } from "@/lib/types";
import { Sparkles, Heart, Users, Home, Star, Zap, Coffee, Music, Book, Gamepad2, Dumbbell, Palette, Wifi, Utensils, TrendingUp, Shield, Clock, MapPin, MessageCircle, Key, DollarSign, Award, Target, Flame, Cloud, Moon, Sun, Camera, Headphones, Laptop, Phone, Mail, Gift } from "lucide-react";
import { RotatingText } from "@/components/landing/RotatingText";
import { ScrollingInfographic } from "@/components/landing/ScrollingInfographic";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { PostAdModal } from "@/components/modals/PostAdModal";

export default function HomePage() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [patternIcons, setPatternIcons] = useState<Array<{Icon: any, x: string, y: string, rotation: number}>>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPostAdModal, setShowPostAdModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState<LoginFormData>({ email: "", password: "" });
  const [signupData, setSignupData] = useState<any>({
    name: "",
    email: "",
    password: "",
    contact_number: "",
    age: "",
    gender: "Prefer not to say",
  });
  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [signupErrors, setSignupErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate random icons on client side only
  useEffect(() => {
    const icons = [Sparkles, Heart, Users, Home, Star, Zap, Coffee, Music, Book, Gamepad2, 
                   Dumbbell, Palette, Wifi, Utensils, TrendingUp, Shield, Clock, MapPin, 
                   MessageCircle, Key, DollarSign, Award, Target, Flame, Cloud, Moon, Sun, 
                   Camera, Headphones, Laptop, Phone, Mail, Gift];
    
    const positions = [];
    // Generate 1200 random icons with random positions and rotations
    for (let i = 0; i < 1200; i++) {
      const randomIcon = icons[Math.floor(Math.random() * icons.length)];
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const rotation = Math.random() * 360 - 180;
      
      positions.push({
        Icon: randomIcon,
        x: `${x}%`,
        y: `${y}%`,
        rotation: rotation,
      });
    }
    setPatternIcons(positions);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    setApiError("");
    
    const result = loginSchema.safeParse(loginData);
    
    if (!result.success) {
      const errors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as keyof LoginFormData] = err.message;
        }
      });
      setLoginErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const response: any = await apiClient.login(result.data);
      const { access_token, user } = response;
      
      setAccessToken(access_token);
      if (user?.email) {
        sessionStorage.setItem('user_email', user.email);
      }
      
      setIsAuth(true);
      setShowLoginModal(false);
      router.push("/app");
    } catch (error: any) {
      setApiError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    setApiError("");

    const dataToValidate = {
      ...signupData,
      age: signupData.age ? parseInt(signupData.age) : undefined,
    };

    const result = signupSchema.safeParse(dataToValidate);
    
    if (!result.success) {
      const errors: any = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setSignupErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.signup(result.data);
      
      // Auto login after successful signup
      const loginResponse: any = await apiClient.login({
        email: result.data.email,
        password: result.data.password,
      });
      
      const { access_token, user } = loginResponse;
      setAccessToken(access_token);
      if (user?.email) {
        sessionStorage.setItem('user_email', user.email);
      }
      
      setIsAuth(true);
      setShowSignupModal(false);
      router.push("/app");
    } catch (error: any) {
      setApiError(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0f172a] relative">
      {/* Hero Section with Pattern Icons */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Mouse Spotlight Effect - Acts as torch revealing patterns */}
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            width: "500px",
            height: "500px",
            marginLeft: "-250px",
            marginTop: "-250px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-full h-full rounded-full bg-gradient-radial from-accent/30 via-accent/10 to-transparent blur-3xl" />
        </motion.div>

        {/* Static Pattern Icons - Revealed by spotlight - HERO SECTION ONLY */}
        {patternIcons.length > 0 && patternIcons.slice(0, 600).map(({ Icon, x, y, rotation }, index) => {
          const iconX = typeof window !== 'undefined' ? (parseFloat(x) / 100) * window.innerWidth : 0;
          const iconY = typeof window !== 'undefined' ? (parseFloat(y) / 100) * window.innerHeight : 0;
          const distance = Math.sqrt(
            Math.pow(mousePosition.x - iconX, 2) + Math.pow(mousePosition.y - iconY, 2)
          );
          const isRevealed = distance < 250;
          
          return (
            <div
              key={index}
              className="absolute pointer-events-none z-0 transition-all duration-300"
              style={{
                left: x,
                top: y,
                transform: `rotate(${rotation}deg) scale(${isRevealed ? 1.1 : 1})`,
                opacity: isRevealed ? 0.6 : 0.12,
              }}
            >
              <Icon className="w-4 h-4 text-accent" strokeWidth={1} />
            </div>
          );
        })}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="swiss-heading mb-4"
            >
              AI-POWERED ROOMMATE MATCHING
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="heading-xl mb-6 dark:text-white"
            >
              Find roommates who match your life, not just your budget.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
            >
              HomieHub is an AI-powered, cloud-native roommate matching platform for university 
              students and young professionals. We use semantic embeddings, LLM-based scoring, 
              and a recommendation engine to match you with compatible rooms and roommates.
            </motion.p>

            <RotatingText />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              {!isAuth && (
                <motion.button
                  onClick={() => setShowSignupModal(true)}
                  className="btn-primary text-base px-8 py-4"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get started
                </motion.button>
              )}
              {isAuth ? (
                <motion.button
                  onClick={() => setShowPostAdModal(true)}
                  className="btn-secondary text-base px-8 py-4"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Find Your Homie
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowLoginModal(true)}
                  className="btn-secondary text-base px-8 py-4"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Find Your Homie
                </motion.button>
              )}
            </motion.div>
          </motion.div>

          {/* Right: 3D Card Stack */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative h-[500px] perspective-1000 hidden lg:block"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ y: i * 40, rotate: i * 3, scale: 1 - i * 0.05 }}
                animate={{ 
                  y: i * 40, 
                  rotate: i * 3,
                  scale: 1 - i * 0.05,
                }}
                whileHover={{
                  y: i * 40 - 10,
                  rotate: i * 3 - 2,
                  scale: 1 - i * 0.05 + 0.02,
                  transition: { duration: 0.2 }
                }}
                className={`absolute inset-x-0 card p-6 shadow-xl preserve-3d ${
                  i === 0 
                    ? 'bg-white dark:bg-black' 
                    : i === 1 
                      ? 'bg-white/80 dark:bg-black/80' 
                      : 'bg-white/60 dark:bg-black/60'
                }`}
                style={{
                  zIndex: 3 - i,
                }}
              >
                {i === 0 && (
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">Modern Studio</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cambridge, MA</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-accent">$1,400</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">/month</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Private</span>
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">WiFi</span>
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">Laundry</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      Perfect for grad students. Quiet building near MIT campus.
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent font-bold">
                          98
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Match Score</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Highly compatible</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Scrolling Infographic */}
      <section className="py-32 bg-gray-50 dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="swiss-heading mb-4 dark:text-gray-400">POWERED BY ADVANCED AI</h2>
            <p className="heading-lg dark:text-white">The technology behind the magic</p>
          </div>
        </div>
        <ScrollingInfographic />
      </section>

      {/* How it Works */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="swiss-heading mb-4">HOW IT WORKS</h2>
            <p className="heading-lg">Three simple steps to your perfect match</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Tell us who you are",
                description: "Share your preferences, lifestyle, and what you're looking for in a roommate.",
              },
              {
                step: "02",
                title: "We crunch the numbers",
                description: "Our AI analyzes your profile against thousands of listings using ML algorithms.",
              },
              {
                step: "03",
                title: "Get curated matches",
                description: "Receive personalized room and roommate recommendations ranked by compatibility.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-accent/20 dark:text-accent/30 mb-4">{item.step}</div>
                <h3 className="heading-sm mb-3 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-gray-50 dark:bg-[#0f172a] px-6 relative overflow-hidden">
        {/* Mouse Spotlight Effect for Features */}
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            width: "500px",
            height: "500px",
            marginLeft: "-250px",
            marginTop: "-250px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-full h-full rounded-full bg-gradient-radial from-accent/30 via-accent/10 to-transparent blur-3xl" />
        </motion.div>

        {/* Pattern Icons for Features Section */}
        {patternIcons.length > 0 && patternIcons.slice(600, 1200).map(({ Icon, x, y, rotation }, index) => {
          const iconX = typeof window !== 'undefined' ? (parseFloat(x) / 100) * window.innerWidth : 0;
          const iconY = typeof window !== 'undefined' ? (parseFloat(y) / 100) * window.innerHeight : 0;
          const distance = Math.sqrt(
            Math.pow(mousePosition.x - iconX, 2) + Math.pow(mousePosition.y - iconY, 2)
          );
          const isRevealed = distance < 250;
          
          return (
            <div
              key={`feature-${index}`}
              className="absolute pointer-events-none z-0 transition-all duration-300"
              style={{
                left: x,
                top: y,
                transform: `rotate(${rotation}deg) scale(${isRevealed ? 1.2 : 1})`,
                opacity: isRevealed ? 0.8 : 0.15,
              }}
            >
              <Icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
            </div>
          );
        })}
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="swiss-heading mb-4 dark:text-gray-400">FEATURES</h2>
            <p className="heading-lg dark:text-white">Everything you need to find your perfect roommate</p>
          </div>
          <FeatureGrid />
        </div>
      </section>

      {/* Trust & Privacy */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl mb-6">🔐</div>
            <h2 className="heading-lg mb-6 dark:text-white">Student trust & privacy-first design</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              HomieHub is built with privacy at its core. We use .edu authentication via Auth0, 
              encrypt all sensitive data, and never share your information without consent. 
              Your trust is our top priority.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="pill-accent dark:bg-accent/20 dark:text-accent">🎓 .edu verified</span>
              <span className="pill-accent dark:bg-accent/20 dark:text-accent">🔒 End-to-end encryption</span>
              <span className="pill-accent dark:bg-accent/20 dark:text-accent">⚖️ Fairness monitoring</span>
              <span className="pill-accent dark:bg-accent/20 dark:text-accent">☁️ Cloud-secured</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground dark:bg-black text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold mb-4">HomieHub</div>
          <p className="text-gray-400 mb-6">
            Built on GCP • MLOps-driven • MIT-licensed
          </p>
          <a
            href="https://github.com/homiehub/homiehub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            View on GitHub
          </a>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-black rounded-2xl p-8 max-w-md w-full shadow-2xl border dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>

              <h2 className="text-3xl font-bold mb-6 dark:text-white">Welcome back</h2>

              {apiError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="you@example.com"
                  />
                  {loginErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{loginErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{loginErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                  }}
                  className="text-accent font-semibold hover:underline"
                >
                  Sign up
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSignupModal(false)}
          >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-black rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto border dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSignupModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>

              <h2 className="text-3xl font-bold mb-6 dark:text-white">Create account</h2>

              {apiError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
                  {apiError}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="John Doe"
                  />
                  {signupErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="you@example.com"
                  />
                  {signupErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : <Eye className="w-5 h-5 text-gray-500 dark:text-gray-400" />}
                    </button>
                  </div>
                  {signupErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-contact" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Contact Number
                  </label>
                  <input
                    id="signup-contact"
                    type="tel"
                    value={signupData.contact_number}
                    onChange={(e) => setSignupData({ ...signupData, contact_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="+1234567890"
                  />
                  {signupErrors.contact_number && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.contact_number}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-age" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Age
                  </label>
                  <input
                    id="signup-age"
                    type="number"
                    value={signupData.age}
                    onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="25"
                  />
                  {signupErrors.age && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.age}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="signup-gender" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Gender
                  </label>
                  <select
                    id="signup-gender"
                    value={signupData.gender}
                    onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {signupErrors.gender && (
                    <p className="mt-1 text-sm text-red-600">{signupErrors.gender}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                  }}
                  className="text-accent font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Ad Modal */}
      <AnimatePresence>
        {showPostAdModal && (
          <PostAdModal
            onClose={() => setShowPostAdModal(false)}
            onSuccess={() => {
              setShowPostAdModal(false);
              router.push("/app");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
