import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Wallet, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useInvestmentData } from '@/hooks/useInvestmentData';
import { InitialAmountDialog } from '@/components/InitialAmountDialog';
import { formatCurrency } from '@/utils/formatters';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { initialAmount, setInitialAmount } = useInvestmentData();
  const { user } = useAuth();
  const [isEditInitialAmountOpen, setIsEditInitialAmountOpen] = useState(false);

  const handleSetInitialAmount = (amount: number) => {
    setInitialAmount(amount);
    setIsEditInitialAmountOpen(false);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Configurações
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas preferências
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-6 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">{user?.displayName || 'Usuário'}</CardTitle>
                <CardDescription className="text-sm">{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <div className="text-sm text-muted-foreground">
                {user?.displayName || 'Não informado'}
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="text-sm text-muted-foreground">
                {user?.email || 'Não informado'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Escolha o tema da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Tema</label>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Escuro' : theme === 'light' ? 'Claro' : 'Sistema'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="h-9"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Claro
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="h-9"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Escuro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Investimentos
            </CardTitle>
            <CardDescription>
              Configure seus investimentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Montante Inicial</label>
                  <p className="text-sm text-muted-foreground">
                    {initialAmount !== undefined 
                      ? formatCurrency(initialAmount)
                      : 'Não definido'
                    }
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditInitialAmountOpen(true)}
                >
                  {initialAmount !== undefined ? 'Editar' : 'Definir'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <InitialAmountDialog
        open={isEditInitialAmountOpen}
        onOpenChange={setIsEditInitialAmountOpen}
        initialValue={initialAmount}
        onSave={handleSetInitialAmount}
      />
    </div>
  );
};

export default Settings;
