
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ 
  value, 
  onChange, 
  disabled = false,
  placeholder = "Password" 
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-auth-input-bg border-none text-white placeholder:text-auth-muted-text text-center h-12"
        disabled={disabled}
      />
      <button 
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-auth-muted-text"
        disabled={disabled}
      >
        {showPassword ? (
          <EyeOff size={18} />
        ) : (
          <Eye size={18} />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
