import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Wallet, User, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useInvestmentData } from '@/hooks/useInvestmentData';
import { InitialAmountDialog } from '@/components/InitialAmountDialog';
import { formatCurrency } from '@/utils/formatters';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { initialAmount, setInitialAmount } = useInvestmentData();
  const { user, updateDisplayName, updatePhotoURL } = useAuth();
  const { toast } = useToast();
  const [isEditInitialAmountOpen, setIsEditInitialAmountOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isEditPhotoOpen, setIsEditPhotoOpen] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [photoURLValue, setPhotoURLValue] = useState('');

  const handleSetInitialAmount = (amount: number) => {
    setInitialAmount(amount);
    setIsEditInitialAmountOpen(false);
  };

  const handleEditName = () => {
    if (user?.displayName) {
      setNameValue(user.displayName);
    }
    setIsEditNameOpen(true);
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome não pode estar vazio',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateDisplayName(nameValue.trim());
      setIsEditNameOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Nome atualizado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o nome',
        variant: 'destructive',
      });
    }
  };

  const handleEditPhoto = () => {
    if (user?.photoURL) {
      setPhotoURLValue(user.photoURL);
    }
    setIsEditPhotoOpen(true);
  };

  const handleSavePhoto = async () => {
    if (!photoURLValue.trim()) {
      toast({
        title: 'Erro',
        description: 'A URL não pode estar vazia',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = new URL(photoURLValue.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('URL inválida');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma URL válida',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updatePhotoURL(photoURLValue.trim());
      setIsEditPhotoOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Foto atualizada com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a foto',
        variant: 'destructive',
      });
    }
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
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Usuário'} />
                  <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full"
                  onClick={handleEditPhoto}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <label className="text-sm font-medium">Nome</label>
                <div className="text-sm text-muted-foreground">
                  {user?.displayName || 'Não informado'}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditName}
              >
                Editar
              </Button>
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

      <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Nome</DialogTitle>
            <DialogDescription>
              Altere o nome exibido no seu perfil
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveName();
            }}
            className="space-y-4"
          >
            <Input
              type="text"
              placeholder="Seu nome"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditNameOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={!nameValue.trim()}>
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditPhotoOpen} onOpenChange={setIsEditPhotoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Foto</DialogTitle>
            <DialogDescription>
              Insira a URL da imagem para sua foto de perfil
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSavePhoto();
            }}
            className="space-y-4"
          >
            <Input
              type="url"
              placeholder="https://exemplo.com/foto.jpg"
              value={photoURLValue}
              onChange={(e) => setPhotoURLValue(e.target.value)}
              autoFocus
            />
            {photoURLValue && (
              <div className="rounded-lg border border-border p-2">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={photoURLValue} alt="Preview" />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsEditPhotoOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={!photoURLValue.trim()}>
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
