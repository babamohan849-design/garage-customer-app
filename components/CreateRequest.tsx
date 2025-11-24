import React, { useState } from 'react';
import { Customer } from '../types';
import { db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Loader2, X, UploadCloud } from 'lucide-react';

interface CreateRequestProps {
  customer: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateRequest: React.FC<CreateRequestProps> = ({ customer, onSuccess, onCancel }) => {
  const [problemText, setProblemText] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      if (imageFiles.length + files.length > 3) {
        alert("You can only upload up to 3 images.");
        return;
      }
      
      const newFiles = [...imageFiles, ...files];
      setImageFiles(newFiles);

      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]); // cleanup
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const imageUrls: string[] = [];

      // Upload Images
      for (const file of imageFiles) {
        const uniqueName = `requests/${customer.id}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, uniqueName);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        imageUrls.push(url);
      }

      // Create Firestore Doc
      await addDoc(collection(db, 'requests'), {
        customer_id: customer.id,
        customer_name: customer.name,
        phone: customer.phone,
        vehicle: customer.vehicle,
        problem_text: problemText,
        images: imageUrls,
        status: 'pending',
        timestamp: serverTimestamp(),
      });

      onSuccess();
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("Failed to submit request. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">New Service Request</h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Describe your problem</label>
          <textarea
            required
            rows={4}
            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 border p-3"
            placeholder="e.g., Strange noise when braking..."
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Max 3)</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Tap to upload photos</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept="image/*"
                onChange={handleImageChange}
                disabled={imageFiles.length >= 3}
              />
            </label>
          </div>
        </div>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {imagePreviews.map((src, idx) => (
              <div key={idx} className="relative group aspect-square">
                <img src={src} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 flex gap-4">
            <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
            Cancel
            </button>
            <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none disabled:opacity-50"
            >
            {isSubmitting ? (
                <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
                </>
            ) : (
                'Submit Request'
            )}
            </button>
        </div>
      </form>
    </div>
  );
};