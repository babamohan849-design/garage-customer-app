import React, { useEffect, useState } from 'react';
import { Customer } from './types';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch profile data from Firestore
        try {
          const docRef = doc(db, 'customers', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setCustomer(docSnap.data() as Customer);
          } else {
            // Edge case: User created in Auth but not in Firestore.
            // Sign out to prevent stuck state and allow user to try registering again.
            console.error("No customer profile found! Signing out.");
            await auth.signOut();
            setCustomer(null);
          }
        } catch (error) {
          console.error("Error fetching customer data:", error);
          setCustomer(null);
        }
      } else {
        // User is signed out
        setCustomer(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-sm">Loading...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="antialiased text-gray-900 bg-gray-50 min-h-screen">
      {!customer ? (
        <Auth />
      ) : (
        <Dashboard customer={customer} onLogout={() => auth.signOut()} />
      )}
    </div>
  );
}

export default App;
