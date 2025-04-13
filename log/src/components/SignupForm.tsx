import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Reset auth error when input changes
  useEffect(() => {
    if (authError) {
      setAuthError(null);
    }
  }, [email, password, confirmPassword, username, fullName]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!fullName || !username || !email || !password || !confirmPassword) {
      toast({
        title: "Signup Failed",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Signup Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await signUp(email, password, username, 'guest');
      
      if (error) {
        setAuthError(error.message);
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created",
          description: "Your account has been successfully created.",
        });
        
        // The redirect is now handled in the AuthContext
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setAuthError(errorMessage);
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        setAuthError(error.message);
        toast({
          title: "Google Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      }
      // No need for success handling as Supabase will redirect to the dashboard
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setAuthError(errorMessage);
      toast({
        title: "Google Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {authError && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-600 px-3 py-2 rounded-md text-sm">
          {authError}
        </div>
      )}
      
      <div>
        <Input
          id="fullName"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-auth-input-bg border-none text-white placeholder:text-auth-muted-text text-center h-12"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Input
          id="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-auth-input-bg border-none text-white placeholder:text-auth-muted-text text-center h-12"
          disabled={isLoading}
        />
      </div>
      
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
      
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-auth-input-bg border-none text-white placeholder:text-auth-muted-text text-center h-12"
          disabled={isLoading}
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-auth-muted-text"
          disabled={isLoading}
        >
          {showPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
      
      <div className="relative">
        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="bg-auth-input-bg border-none text-white placeholder:text-auth-muted-text text-center h-12"
          disabled={isLoading}
        />
        <button 
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-auth-muted-text"
          disabled={isLoading}
        >
          {showConfirmPassword ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-auth-blue-button hover:bg-blue-600 h-12 text-white font-medium mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            SIGNING UP...
          </>
        ) : 'SIGN UP'}
      </Button>
      
      <div className="relative flex items-center justify-center">
        <Separator className="bg-gray-700" />
        <span className="absolute bg-auth-card-bg px-2 text-sm text-auth-muted-text">OR</span>
      </div>
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleGoogleSignup}
        className="w-full border border-gray-700 hover:bg-gray-800 text-white h-12"
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
        )}
        CONTINUE WITH GOOGLE
      </Button>
      
      <div className="text-center mt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSwitchToLogin}
          className="bg-transparent border border-gray-800 hover:bg-gray-800 text-white w-auto px-6"
          disabled={isLoading || isGoogleLoading}
        >
          ALREADY HAVE AN ACCOUNT?
        </Button>
      </div>
    </form>
  );
};

export default SignupForm;
