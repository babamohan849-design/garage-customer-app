import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Customer } from '../types';
import { Car, Lock, Mail, Phone, User, Loader2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        await signInWithEmailAndPassword(auth, email, password);
        // App.tsx listener will handle the rest
      } else {
        // Registration Logic
        if (!name || !phone || !vehicle) {
            setError("Please fill in all vehicle details.");
            setLoading(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save extra profile info to Firestore
        const newCustomer: Customer = {
          id: user.uid,
          name,
          phone,
          vehicle,
        };

        await setDoc(doc(db, 'customers', user.uid), newCustomer);
        // App.tsx listener will handle the rest
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = "Authentication failed. Please check your connection and try again.";
      
      // Handle specific error codes
      // Note: auth/invalid-credential covers both wrong password and user not found in newer Firebase versions
      if (err.code === 'auth/invalid-credential') {
        msg = "Incorrect email or password.";
      } else if (err.code === 'auth/email-already-in-use') {
        msg = "That email is already in use. Please sign in instead.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "Invalid email address.";
      } else if (err.code === 'auth/wrong-password') {
        msg = "Incorrect password.";
      } else if (err.code === 'auth/user-not-found') {
        msg = "No account found with this email.";
      } else if (err.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters.";
      }
      
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Join QuickFix'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Sign in to view your requests' : 'Register your vehicle to get started'}
          </p>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-3"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required={!isLogin}
                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-3"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Car className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-3"
                    placeholder="2018 Toyota Camry"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-3"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-3"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
            <button
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                }}
                className="text-sm font-medium text-brand-600 hover:text-brand-500"
            >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
            </button>
        </div>
      </div>
    </div>
  );
};
