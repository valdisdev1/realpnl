import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface ApiCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ApiCredentialsModal: React.FC<ApiCredentialsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be signed in to save API credentials');
      return;
    }

    if (!apiKey.trim() || !apiSecret.trim()) {
      setError('Please enter both API key and secret');
      return;
    }

    setLoading(true);
    setError(null);

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Request timed out. Please try again.');
    }, 10000); // 10 seconds timeout

    try {
      // First, test if we can even connect to Supabase
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        throw new Error('No active session found. Please sign in again.');
      }

      // Try a very simple query first
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (testError) {
        throw new Error(`Connection test failed: ${testError.message}`);
      }

      // Use upsert to handle both insert and update cases
      const upsertPromise = supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: null,
          api_key: apiKey.trim(),
          api_secret: apiSecret.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      // Add a timeout to the upsert operation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upsert operation timed out')), 5000)
      );

      const { data, error } = await Promise.race([upsertPromise, timeoutPromise]) as any;

      if (error) {
        console.error('ApiCredentialsModal: Update error:', error);
        throw error;
      }

      setSuccess(true);
      setApiKey('');
      setApiSecret('');
      
      // Clear timeout since we succeeded
      clearTimeout(timeoutId);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (error: any) {
      console.error('ApiCredentialsModal: Error during submission:', error);
      
      // Handle specific RLS errors
      let errorMessage = 'Failed to save API credentials';
      
      if (error?.code === '42501') {
        errorMessage = 'Permission denied. This might be an RLS policy issue. Please check your database setup.';
      } else if (error?.code === 'PGRST116') {
        errorMessage = 'Profile not found. Please try signing out and signing back in.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setApiKey('');
    setApiSecret('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add API Credentials</DialogTitle>
          <DialogDescription>
            Enter your API key and secret to connect your trading account.
            These will be securely stored and associated with your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>API credentials saved successfully!</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-secret">API Secret</Label>
            <div className="relative">
              <Input
                id="api-secret"
                type={showSecret ? 'text' : 'password'}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter your API secret"
                disabled={loading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowSecret(!showSecret)}
                disabled={loading}
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Credentials'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiCredentialsModal; 