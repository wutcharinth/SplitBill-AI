'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    testFirestore();
  }, []);

  const testFirestore = async () => {
    try {
      setStatus('Testing Firestore connection...');

      // Test 1: Try to add a simple document
      const testRef = collection(db, 'test');
      setStatus('Attempting to write test document...');

      const docRef = await addDoc(testRef, {
        test: 'hello',
        timestamp: new Date().toISOString()
      });

      setStatus(`✅ Success! Document written with ID: ${docRef.id}`);

      // Test 2: Try to read
      const snapshot = await getDocs(testRef);
      setStatus(`✅ Success! Can read ${snapshot.size} documents`);

    } catch (err: any) {
      setError(err);
      setStatus('❌ Failed');
      console.error('Firestore test error:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Firestore Connection Test</h1>
      <p>Status: {status}</p>
      {error && (
        <div style={{ background: '#fee', padding: '10px', marginTop: '10px' }}>
          <h3>Error Details:</h3>
          <p>Code: {error.code}</p>
          <p>Message: {error.message}</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
