import React, { useState } from 'react';
import { Customer } from '../types';
import { Car, Phone, User, CheckCircle } from 'lucide-react';

interface RegistrationProps {
  onRegister: (customer: Customer) => void;
}

export const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !vehicle) return;

    // Generate a simple ID or use a UUID library. For simplicity, we use date + random
    const newId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newCustomer: Customer = {
      id: newId,
      name,
      phone,
      vehicle,
    };

    onRegister(newCustomer);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to QuickFix</h1>
          <p className="text-gray-500 mt-2">Register your vehicle to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
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
                required
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
                required
                className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-3"
                placeholder="2018 Toyota Camry"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};
