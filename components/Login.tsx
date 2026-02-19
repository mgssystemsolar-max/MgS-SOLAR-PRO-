
import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Mail, Lock, ArrowLeft, UserPlus, KeyRound, Check } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

type AuthMode = 'login' | 'register' | 'recovery';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    // Simulação de Latência de Rede
    setTimeout(() => {
        if (mode === 'recovery') {
            if (!email.includes('@')) {
                setError("Digite um e-mail válido.");
                setIsLoading(false);
                return;
            }
            setSuccessMsg(`Link de recuperação enviado para ${email}`);
            setIsLoading(false);
            // Opcional: Voltar para login após alguns segundos
            setTimeout(() => setMode('login'), 3000);
            return;
        }

        if (mode === 'register') {
             if (!email || !password || !confirmPassword) {
                setError("Preencha todos os campos.");
                setIsLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError("As senhas não coincidem.");
                setIsLoading(false);
                return;
            }
            // Sucesso no cadastro, faz login automático
            onLogin(email);
            return;
        }

        // Mode: Login
        if (email && password) {
            onLogin(email);
        } else {
            setError("Preencha e-mail e senha.");
            setIsLoading(false);
        }
    }, 800);
  };

  const toggleMode = (newMode: AuthMode) => {
      setMode(newMode);
      setError('');
      setSuccessMsg('');
      setPassword('');
      setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[100px]" />

      <div className="z-10 flex flex-col items-center mb-8 animate-fade-in-down text-center">
        <div className="bg-white p-4 rounded-2xl shadow-xl shadow-green-500/20 mb-6">
            <img src="logo.png" alt="MGS Logo" className="h-20 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">MGS SOLAR PRO <span className="text-2xl">👊</span></h1>
        <p className="text-slate-400 mt-2">Sistema de Gestão Fotovoltaica</p>
      </div>

      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl z-10 transition-all duration-300">
        
        {/* Header do Formulário */}
        <div className="mb-6">
            {mode === 'login' && <h2 className="text-xl font-bold text-white">Acessar Conta</h2>}
            {mode === 'register' && <h2 className="text-xl font-bold text-white">Novo Cadastro</h2>}
            {mode === 'recovery' && <h2 className="text-xl font-bold text-white">Recuperar Senha</h2>}
            <p className="text-slate-500 text-xs mt-1">
                {mode === 'login' && 'Entre com suas credenciais abaixo.'}
                {mode === 'register' && 'Crie sua conta para acessar o sistema.'}
                {mode === 'recovery' && 'Enviaremos um link para seu e-mail.'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Campo E-mail (Comum a todos) */}
            <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">E-mail</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3.5 text-slate-500" />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-10 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                    />
                </div>
            </div>
            
            {/* Campos de Senha (Login e Cadastro) */}
            {mode !== 'recovery' && (
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Senha</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3.5 text-slate-500" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-10 pr-10 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors"
                            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmar Senha (Apenas Cadastro) */}
            {mode === 'register' && (
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Confirmar Senha</label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3.5 text-slate-500" />
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 pl-10 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Mensagens de Erro/Sucesso */}
            {error && <p className="text-red-400 text-sm text-center font-medium bg-red-500/10 p-2 rounded">{error}</p>}
            {successMsg && <p className="text-green-400 text-sm text-center font-medium bg-green-500/10 p-2 rounded">{successMsg}</p>}

            {/* Opções Extras (Lembre-me e Recuperar Senha) - Apenas Login */}
            {mode === 'login' && (
                <div className="flex justify-between items-center mt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-green-500 border-green-500' : 'border-slate-600 bg-slate-900 group-hover:border-slate-500'}`}>
                            {rememberMe && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <input 
                            type="checkbox" 
                            className="hidden"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium select-none">Lembre-me</span>
                    </label>

                    <button 
                        type="button"
                        onClick={() => toggleMode('recovery')}
                        className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-medium flex items-center gap-1"
                    >
                        Esqueceu a senha?
                    </button>
                </div>
            )}

            {/* Botão de Ação Principal */}
            <button 
                type="submit" 
                disabled={isLoading}
                className={`mt-2 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                    mode === 'recovery' 
                    ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/30' 
                    : 'bg-green-600 hover:bg-green-500 shadow-green-900/30'
                }`}
            >
                {isLoading ? (
                    'PROCESSANDO...'
                ) : (
                    <>
                        {mode === 'login' && <>ENTRAR NO SISTEMA <ArrowRight size={18} /></>}
                        {mode === 'register' && <>CRIAR CONTA <UserPlus size={18} /></>}
                        {mode === 'recovery' && <>ENVIAR LINK <KeyRound size={18} /></>}
                    </>
                )}
            </button>
        </form>

        {/* Rodapé do Cartão (Links de Navegação) */}
        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            {mode === 'login' ? (
                 <p className="text-slate-400 text-sm">
                    Não tem uma conta?{' '}
                    <button 
                        onClick={() => toggleMode('register')}
                        className="text-green-400 hover:text-green-300 font-bold ml-1 transition-colors"
                    >
                        Cadastre-se
                    </button>
                 </p>
            ) : (
                <button 
                    onClick={() => toggleMode('login')}
                    className="text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 w-full transition-colors font-medium"
                >
                    <ArrowLeft size={16} /> Voltar para o Login
                </button>
            )}
        </div>
      </div>
      
      <p className="mt-8 text-slate-600 text-xs z-10">v44.1 - Oficial Build</p>
    </div>
  );
};
