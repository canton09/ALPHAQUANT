
import React, { useState } from 'react';
import { validateApiKey } from '../services/geminiService';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setIsValidating(true);
      setError(null);
      
      const isValid = await validateApiKey(key.trim());
      
      setIsValidating(false);
      
      if (isValid) {
        setSuccess(true);
        // Delay closing to show success state
        setTimeout(() => {
          onSave(key.trim());
        }, 1000);
      } else {
        setError("验证失败：API Key 无效或无法连接到 DeepSeek 服务器。");
      }
    }
  };

  if (success) {
     return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn">
           <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-4 border-cyber-green flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(10,255,10,0.5)]">
                 <svg className="w-10 h-10 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest neon-text text-center">ACCESS GRANTED</h2>
              <p className="text-cyber-green font-mono mt-2 tracking-widest">DEEPSEEK V3.2 LINK ESTABLISHED</p>
           </div>
        </div>
     );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="max-w-md w-full cyber-border p-8 bg-cyber-dark/80 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-blue to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-cyber-purple/10 blur-xl rounded-full"></div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-widest mb-2 neon-text">SYSTEM ACCESS</h2>
          <p className="text-gray-400 font-mono text-xs">SECURITY PROTOCOL: MISSING API CREDENTIALS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-cyber-blue font-mono text-xs mb-2 uppercase tracking-wider">
              Enter DeepSeek API Key
            </label>
            <div className="relative">
                <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-black/50 border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] font-mono transition-all"
                autoFocus
                disabled={isValidating}
                />
                {isValidating && (
                    <div className="absolute right-3 top-3">
                         <div className="w-5 h-5 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
            {error && (
                <p className="text-red-500 text-xs mt-2 font-mono flex items-center">
                    <span className="mr-1">⚠</span> {error}
                </p>
            )}
            <p className="text-[10px] text-gray-500 mt-2 font-mono">
              The key is stored locally in your browser (LocalStorage). It is never sent to our servers.
            </p>
          </div>

          <button
            type="submit"
            disabled={!key.trim() || isValidating}
            className={`w-full py-3 font-bold tracking-widest uppercase text-black transition-all duration-300
              ${key.trim() && !isValidating
                ? 'bg-cyber-blue hover:bg-white hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] cursor-pointer' 
                : 'bg-gray-700 cursor-not-allowed text-gray-500'
              }`}
          >
            {isValidating ? 'VALIDATING...' : 'AUTHENTICATE & CONNECT'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
             <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer" className="text-[10px] text-cyber-purple hover:text-white underline font-mono">
                GET API KEY FROM DEEPSEEK
             </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
