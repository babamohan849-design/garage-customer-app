
import React, { useEffect, useState } from 'react';
import { Customer, ServiceRequest } from '../types';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Plus, Wrench, Clock, History, LogOut, Calendar } from 'lucide-react';
import { CreateRequest } from './CreateRequest';
import { RequestDetail } from './RequestDetail';

interface DashboardProps {
  customer: Customer;
  onLogout: () => void;
  initialRequestId?: string; // Add capability to deep link
}

export const Dashboard: React.FC<DashboardProps> = ({ customer, onLogout, initialRequestId }) => {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);

  // Real-time listener
  // This function fetches ALL fields in the document, including new fields like estimation_amount
  useEffect(() => {
    // Note: Removed orderBy('timestamp', 'desc') to avoid needing a Firestore composite index.
    // We will sort the results client-side instead.
    const q = query(
      collection(db, 'requests'),
      where('customer_id', '==', customer.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests: ServiceRequest[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to JS Date
          createdAt: data.timestamp ? data.timestamp.toDate() : new Date(),
        } as ServiceRequest;
      });

      // Client-side sorting: Newest first
      fetchedRequests.sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });

      setRequests(fetchedRequests);
      setLoading(false);

      // If we are looking at a detail view, update the selected request object automatically
      // This ensures that if the garage adds an estimation_amount while the user is viewing, it updates instantly.
      if (selectedRequest) {
        const updated = fetchedRequests.find(r => r.id === selectedRequest.id);
        if (updated) setSelectedRequest(updated);
      }
      
      // Handle deep linking via initialRequestId (only runs once if view is 'list')
      if (initialRequestId && view === 'list' && fetchedRequests.length > 0) {
          const target = fetchedRequests.find(r => r.id === initialRequestId);
          if (target) {
              setSelectedRequest(target);
              setView('detail');
          }
      }
    });

    return () => unsubscribe();
  }, [customer.id, selectedRequest, initialRequestId]); // view is not in dep array to prevent loop

  const handleSelectRequest = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setView('detail');
  };

  const handleCreateSuccess = () => {
    setView('list');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading your garage data...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Navbar */}
      <nav className="bg-brand-700 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <Wrench className="w-6 h-6" />
                <span className="font-bold text-lg">QuickFix</span>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm opacity-90 hidden sm:block">Hi, {customer.name.split(' ')[0]}</span>
                <button 
                  onClick={onLogout} 
                  className="flex items-center space-x-1 text-xs bg-brand-800 hover:bg-brand-900 py-1.5 px-3 rounded transition"
                >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-4">
        {view === 'list' && (
          <>
            {/* Header Action */}
            <div className="flex justify-between items-center mb-6 mt-2">
              <h2 className="text-2xl font-bold text-gray-800">My Requests</h2>
              <button
                onClick={() => setView('create')}
                className="flex items-center bg-brand-600 text-white px-4 py-2 rounded-lg shadow hover:bg-brand-700 transition"
              >
                <Plus className="w-5 h-5 mr-1" />
                New Request
              </button>
            </div>

            {/* List */}
            {requests.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No requests yet</h3>
                <p className="text-gray-500 mt-1 mb-6">Create your first service request to get started.</p>
                <button
                    onClick={() => setView('create')}
                    className="text-brand-600 font-medium hover:underline"
                >
                    Create Request
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center space-x-2 mb-1">
                            <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                                req.status === 'confirmed' ? 'bg-green-500' : 
                                req.status === 'quoted' ? 'bg-blue-500' : 
                                req.status === 'rejected' ? 'bg-red-500' :
                                req.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                            <h3 className="font-semibold text-gray-900 truncate">{req.vehicle}</h3>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">{req.problem_text}</p>
                        
                        {/* Show appointment time OR Estimate if available */}
                        {req.garage_reply ? (
                            <div className="text-sm text-gray-500 flex flex-wrap gap-2 items-center">
                                {req.garage_reply.date && (
                                  <span className="flex items-center text-brand-600 font-medium">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {req.garage_reply.date}
                                  </span>
                                )}
                                {/* Display Estimate or Quote amount in list preview */}
                                <span className="text-gray-900 font-semibold">
                                  ${req.garage_reply.quotation_amount || req.garage_reply.cost || req.garage_reply.estimation_amount}
                                  {/* Add suffix if it's only an estimate */}
                                  {!req.garage_reply.quotation_amount && req.garage_reply.estimation_amount && " (Est.)"}
                                </span>
                            </div>
                        ) : req.status === 'rejected' ? (
                            <p className="text-sm text-red-500 font-medium">Quote Rejected</p>
                        ) : (
                            <p className="text-sm text-gray-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Requested: {req.createdAt?.toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <div className="text-right flex-shrink-0">
                         <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full capitalize ${
                             req.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                             req.status === 'quoted' ? 'bg-blue-100 text-blue-700' :
                             req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                             req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                         }`}>
                             {req.status}
                         </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {view === 'create' && (
          <CreateRequest 
            customer={customer} 
            onSuccess={handleCreateSuccess} 
            onCancel={() => setView('list')} 
          />
        )}

        {view === 'detail' && selectedRequest && (
          <RequestDetail 
            request={selectedRequest} 
            onClose={() => {
                setSelectedRequest(null);
                setView('list');
            }} 
          />
        )}
      </main>
    </div>
  );
};
