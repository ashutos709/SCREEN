import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import PasswordInput from './PasswordInput';
import GoogleButton from './GoogleButton';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();

  // Reset auth error when input changes
  useEffect(() => {
    if (authError) {
      setAuthError(null);
    }
  }, [email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setAuthError(error.message);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully.",
        });
        // The redirect is now handled in the AuthContext
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setAuthError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setAuthError(error.message);
        toast({
          title: "Google Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
      // No need for success handling as Supabase will redirect to the dashboard
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setAuthError(errorMessage);
      toast({
        title: "Google Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {authError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-600 px-3 py-2 rounded-md text-sm">
          {authError}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-auth-input-bg border-none text-white placeholder:text-auth-muted-text text-center h-12"
            disabled={isLoading}
          />
        </div>
        
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex items-center">
        <Checkbox 
          id="remember-me" 
          checked={rememberMe}
          onCheckedChange={(checked) => {
            setRememberMe(checked as boolean);
          }}
          className="border-auth-muted-text"
          disabled={isLoading}
        />
        <label htmlFor="remember-me" className="ml-2 text-sm text-auth-muted-text">
          Remember Me
        </label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-auth-blue-button hover:bg-blue-600 h-12 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            LOGGING IN...
          </>
        ) : 'LOGIN'}
      </Button>
      
      <div className="relative flex items-center justify-center">
        <Separator className="bg-gray-700" />
        <span className="absolute bg-auth-card-bg px-2 text-sm text-auth-muted-text">OR</span>
      </div>
      
      <GoogleButton 
        onClick={handleGoogleLogin}
        isLoading={isGoogleLoading}
        disabled={isLoading}
      />
      
      <div className="text-center mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSwitchToSignup}
          className="bg-transparent border border-gray-800 hover:bg-gray-800 text-white w-auto px-6"
          disabled={isLoading || isGoogleLoading}
        >
          CREATE AN ACCOUNT
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
