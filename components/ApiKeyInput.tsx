import React, { useState } from 'react';
import { validateApiKey } from '../services/deepseekService';

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
        }, 1500);
      } else {
        setError("验证失败：API Key 无效或无法连接到 DeepSeek 服务器。");
      }
    }
  };

  if (success) {
     return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn">
           <div className="flex flex-col items-center animate-slideUp">
              <div className="w-24 h-24 rounded-full border-4 border-cyber-green flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(10,255,10,0.5)] bg-cyber-green/10">
                <svg className="w-12 h-12 text-cyber-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white tracking-widest mb-2 font-mono">ACCESS GRANTED</h2>
              <p className="text-cyber-green font-mono tracking-widest text-sm">DEEPSEEK V3.2 LINK ESTABLISHED</p>
           </div>
        </div>
     );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md relative">
        {/* Border Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-blue rounded-lg opacity-50 blur-lg"></div>
        
        <div className="relative bg-[#050505] border border-gray-800 p-8 rounded-lg shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-widest mb-1 font-mono uppercase">System Initialization</h2>
            <p className="text-gray-500 text-xs font-mono tracking-wider">SECURE CONNECTION REQUIRED</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-cyber-blue text-xs font-mono mb-2 tracking-widest uppercase">
                DeepSeek API Key (V3.2)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-[#0a0a0f] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] font-mono transition-all text-sm"
                  autoFocus
                />
                <div className="absolute right-3 top-3.5">
                    <div className={`w-2 h-2 rounded-full ${key.length > 10 ? 'bg-yellow-500 animate-pulse' : 'bg-gray-800'}`}></div>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-gray-600">
                Your key is stored locally in your browser. No data is sent to our servers.
                <br/>
                <a href="https://platform.deepseek.com/" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-cyber-blue underline decoration-dotted">
                  Get API Key ->
                </a>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900 rounded text-red-400 text-xs font-mono flex items-center animate-pulse">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!key || isValidating}
              className={`
                w-full py-4 rounded font-bold text-sm tracking-[0.2em] uppercase transition-all duration-300 relative overflow-hidden group
                ${!key || isValidating 
                  ? 'bg-gray-900 text-gray-600 cursor-not-allowed' 
                  : 'bg-cyber-blue text-black hover:bg-white hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]'}
              `}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isValidating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    VERIFYING CREDENTIALS...
                  </>
                ) : (
                  'INITIALIZE LINK'
                )}
              </span>
              {!isValidating && key && (
                 <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-scan"></div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyInput;