import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginButton } from '@/components/LoginButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('appStartTime', Date.now().toString());
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Capital</CardTitle>
          <CardDescription className="text-center">
            Faça login para acessar seus investimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <LoginButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
