import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthDebug = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSupabaseConfig = async () => {
    setLoading(true);
    try {
      // Test basic Supabase connection
      const { data, error } = await supabase.auth.getSession();
      
      const config = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
        sessionData: data,
        sessionError: error,
        timestamp: new Date().toISOString()
      };
      
      setDebugInfo(config);
      console.log('Supabase config test:', config);
    } catch (err) {
      setDebugInfo({ error: err, timestamp: new Date().toISOString() });
      console.error('Config test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testEmailValidation = async () => {
    setLoading(true);
    try {
      // Test with a simple email
      const testEmail = 'test@example.com';
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      });
      
      const result = {
        testEmail,
        data,
        error,
        timestamp: new Date().toISOString()
      };
      
      setDebugInfo(result);
      console.log('Email validation test:', result);
    } catch (err) {
      setDebugInfo({ error: err, timestamp: new Date().toISOString() });
      console.error('Email validation test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Auth Debug</h1>
      
      <div className="space-y-4 mb-6">
        <Button onClick={testSupabaseConfig} disabled={loading}>
          {loading ? 'Testing...' : 'Test Supabase Config'}
        </Button>
        
        <Button onClick={testEmailValidation} disabled={loading} variant="outline">
          {loading ? 'Testing...' : 'Test Email Validation'}
        </Button>
      </div>

      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthDebug; 