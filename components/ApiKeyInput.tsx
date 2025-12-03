
import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave }) => {
  const [key, setKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if key exists in local storage
    const storedKey = localStorage.getItem('deepseek_api_key');
    if (!storedKey) {
      setIsVisible(true);
    } else {
      onSave(storedKey);
    }
  }, [onSave]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim().length < 10) {
      setError('无效的 API Key 格式 (Invalid Key)');
      return;
    }
    
    // Save to local storage
    localStorage.setItem('deepseek_api_key', key.trim());
    setIsVisible(false);
    onSave(key.trim());
    
    // Optional: Reload to clear any stale state
    // window.location.reload(); 
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md p-8 relative overflow-hidden group">
        
        {/* Cyberpunk Border */}
        <div className="absolute inset-0 border border-cyber-blue/30 bg-cyber-dark/80 skew-x-0"></div>
        <div className="absolute top-0 left-0 w-2 h-2 bg-cyber-blue"></div>
        <div className="absolute top-0 right-0 w-2 h-2 bg-cyber-blue"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 bg-cyber-blue"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-cyber-blue"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white tracking-tighter mb-2">
              SYSTEM <span className="text-cyber-blue">ACCESS</span>
            </h2>
            <p className="text-gray-400 font-mono text-xs tracking-widest uppercase">
              Enter DeepSeek API Key to Initialize
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError('');
                }}
                placeholder="sk-..."
                className="w-full bg-black/50 border border-gray-700 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all placeholder-gray-700"
                autoFocus
              />
              {error && (
                <p className="absolute -bottom-6 left-0 text-red-500 text-xs font-mono animate-pulse">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-cyber-blue text-black font-bold uppercase py-3 tracking-widest hover:bg-white hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all duration-300 relative group overflow-hidden"
            >
              <span className="relative z-10">Connect Link</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          <div className="mt-8 text-center">
            <a 
              href="https://platform.deepseek.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 hover:text-cyber-blue transition-colors font-mono border-b border-transparent hover:border-cyber-blue"
            >
              GET API KEY DASHBOARD &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;
