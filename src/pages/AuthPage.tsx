import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { Dices, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('請輸入有效的電子郵件');
const passwordSchema = z.string().min(6, '密碼至少需要 6 個字元');

export default function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, username || undefined);
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('此電子郵件已被註冊');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('註冊成功！請查看你的電子郵件以驗證帳號。');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('電子郵件或密碼錯誤');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('請先驗證你的電子郵件');
        } else {
          toast.error(error.message);
        }
      }
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl gradient-warm flex items-center justify-center shadow-elevated mb-4">
            <Dices className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">桌遊記錄</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignUp ? '建立帳號開始你的桌遊旅程' : '登入你的桌遊收藏'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="使用者名稱"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-card shadow-card border-0"
                />
              </div>
            </motion.div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="電子郵件"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-card shadow-card border-0"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-12 rounded-xl bg-card shadow-card border-0"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl gradient-warm text-primary-foreground font-bold text-base shadow-elevated hover:opacity-90 transition-opacity"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              '建立帳號'
            ) : (
              '登入'
            )}
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? '已有帳號？' : '還沒有帳號？'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-semibold ml-1 hover:underline"
          >
            {isSignUp ? '登入' : '免費註冊'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
