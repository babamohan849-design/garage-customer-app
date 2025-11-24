
import React, { useState } from 'react';
import { ServiceRequest } from '../types';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { Calendar, Clock, DollarSign, CheckCircle, AlertCircle, ArrowLeft, Check, Calculator, XCircle, X } from 'lucide-react';

interface RequestDetailProps {
  request: ServiceRequest;
  onClose: () => void;
}

export const RequestDetail: React.FC<RequestDetailProps> = ({ request, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to determine the display value for the final quote
  // Prefers quotation_amount, falls back to legacy cost field
  const finalQuote = request.garage_reply?.quotation_amount || request.garage_reply?.cost;

  // Helper: has the garage provided appointment details?
  const hasAppointmentDetails = request.garage_reply?.date && request.garage_reply?.time;

  const handleConfirm = async () => {
    if (!window.confirm("Are you sure you want to confirm this appointment time and cost?")) {
      return;
    }

    setIsProcessing(true);
    try {
      const ref = doc(db, 'requests', request.id);
      await updateDoc(ref, {
        status: 'confirmed'
      });
      // The parent listener will update the UI automatically
    } catch (error) {
      console.error("Error confirming:", error);
      alert("Could not confirm appointment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to REJECT this quote? The garage will be notified.")) {
      return;
    }

    setIsProcessing(true);
    try {
      const ref = doc(db, 'requests', request.id);
      await updateDoc(ref, {
        status: 'rejected'
      });
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("Could not reject quote. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Dedicated View for Confirmed Status
  if (request.status === 'confirmed') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 min-h-[50vh] flex flex-col">
        <div className="p-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to List
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            Your vehicle is scheduled for service. We look forward to seeing you.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 w-full max-w-sm">
            <div className="space-y-4">
               <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                 <span className="text-sm text-gray-500">Vehicle</span>
                 <span className="font-semibold text-gray-900">{request.vehicle}</span>
               </div>
               {request.garage_reply?.date && (
                 <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                   <span className="text-sm text-gray-500">Date</span>
                   <span className="font-semibold text-gray-900">{request.garage_reply.date}</span>
                 </div>
               )}
               {request.garage_reply?.time && (
                 <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                   <span className="text-sm text-gray-500">Time</span>
                   <span className="font-semibold text-gray-900">{request.garage_reply.time}</span>
                 </div>
               )}
               <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-500">Agreed Cost</span>
                 <span className="font-bold text-brand-600 text-lg">${finalQuote}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated View for Rejected Status
  if (request.status === 'rejected') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 min-h-[50vh] flex flex-col">
        <div className="p-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to List
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Rejected</h2>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            You have rejected this service quote. The garage has been notified.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full max-w-sm opacity-75">
             <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-500">Rejected Quote</span>
                 <span className="font-medium text-gray-700 strike-through line-through">${finalQuote}</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Detail View for Pending/Quoted
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-start">
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-2">
             {request.vehicle}
          </h3>
          <p className="text-sm text-gray-500">
             Requested on: {request.createdAt ? request.createdAt.toLocaleDateString() : 'Just now'}
          </p>
        </div>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900 underline">
            Back
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Problem Description</h4>
          <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{request.problem_text}</p>
        </div>

        {request.images && request.images.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Attached Images</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
                {request.images.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 flex-shrink-0">
                        <img src={img} alt={`Issue ${idx}`} className="w-full h-full object-cover rounded-md border border-gray-200" />
                    </a>
                ))}
            </div>
          </div>
        )}

        {/* Garage Reply Section */}
        {request.garage_reply && (
          <div className="border-t border-gray-100 pt-6 mt-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-brand-600 mr-2" />
              Garage Proposal
            </h4>
            
            <div className="bg-brand-50 rounded-xl p-5 space-y-4 border border-brand-100">
              <div>
                <span className="text-xs font-bold text-brand-700 uppercase">Diagnosis</span>
                <p className="text-gray-900 font-medium mt-1">{request.garage_reply.problem_found}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Final Quotation */}
                <div className="bg-white p-3 rounded-lg shadow-sm border border-brand-100">
                   <div className="flex items-center text-brand-600 mb-1">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span className="text-xs font-bold uppercase">Final Quote</span>
                   </div>
                   {finalQuote ? (
                     <p className="text-lg font-bold text-gray-900">${finalQuote}</p>
                   ) : (
                     <p className="text-sm text-gray-400 italic">Pending</p>
                   )}
                </div>

                {/* Date & Time */}
                <div className="bg-white p-3 rounded-lg shadow-sm border border-brand-100">
                   <div className="flex items-center text-brand-600 mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-xs font-bold uppercase">Time Slot</span>
                   </div>
                   {hasAppointmentDetails ? (
                     <>
                        <p className="text-sm font-bold text-gray-900">{request.garage_reply.date}</p>
                        <p className="text-xs text-gray-600 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {request.garage_reply.time}
                        </p>
                     </>
                   ) : (
                     <p className="text-sm text-gray-400 italic">TBD</p>
                   )}
                </div>

                {/* Estimation Amount (Fix: Explicitly check and display estimation_amount) */}
                <div className="col-span-2 bg-white p-3 rounded-lg shadow-sm border border-brand-100">
                   <div className="flex items-center text-gray-500 mb-1">
                      <Calculator className="w-4 h-4 mr-1" />
                      <span className="text-xs font-bold uppercase">Garage Estimate</span>
                   </div>
                   {request.garage_reply.estimation_amount ? (
                       <p className="text-sm font-medium text-gray-900">
                           ${request.garage_reply.estimation_amount}
                       </p>
                   ) : (
                       <p className="text-sm text-gray-400 italic">No estimate provided yet</p>
                   )}
                </div>
              </div>
            </div>

            {request.status === 'quoted' && (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-red-200 rounded-lg shadow-sm text-base font-bold text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                >
                  <X className="w-5 h-5 mr-2" />
                  Reject Quote
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex-[2] flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-[1.02]"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Confirm Appointment
                </button>
              </div>
            )}
            {request.status === 'quoted' && (
                <p className="text-xs text-center text-gray-500 mt-3">
                    By confirming, you agree to the final quote of ${finalQuote} and the appointment time.
                </p>
            )}
          </div>
        )}

        {/* Pending State Message */}
        {request.status === 'pending' && !request.garage_reply && (
             <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
             <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
             <div>
                 <h5 className="font-bold text-yellow-800">Waiting for Garage</h5>
                 <p className="text-sm text-yellow-700 mt-1">
                     Your request has been sent. The garage will provide an estimate shortly.
                 </p>
             </div>
         </div>
        )}
      </div>
    </div>
  );
};
