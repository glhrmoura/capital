import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Wallet, User, Camera, Languages } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
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
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';

const Settings = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
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
        title: t('common.error'),
        description: t('settings.profile.nameEmptyError'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateDisplayName(nameValue.trim());
      setIsEditNameOpen(false);
      toast({
        title: t('common.success'),
        description: t('settings.profile.nameUpdateSuccess'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('settings.profile.nameUpdateError'),
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
        title: t('common.error'),
        description: t('settings.profile.photoURLEmptyError'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = new URL(photoURLValue.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid URL');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('settings.profile.photoURLInvalidError'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await updatePhotoURL(photoURLValue.trim());
      setIsEditPhotoOpen(false);
      toast({
        title: t('common.success'),
        description: t('settings.profile.photoUpdateSuccess'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('settings.profile.photoUpdateError'),
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

  const getThemeLabel = () => {
    if (theme === 'dark') return t('settings.appearance.dark');
    if (theme === 'light') return t('settings.appearance.light');
    return t('settings.appearance.system');
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
                {t('settings.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-20 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || t('settings.profile.name')} />
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
                <CardTitle className="text-lg">{user?.displayName || t('settings.profile.name')}</CardTitle>
                <CardDescription className="text-sm">{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('settings.profile.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.profile.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <label className="text-sm font-medium">{t('settings.profile.name')}</label>
                <div className="text-sm text-muted-foreground">
                  {user?.displayName || t('settings.profile.notInformed')}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditName}
              >
                {t('common.edit')}
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('settings.profile.email')}</label>
              <div className="text-sm text-muted-foreground">
                {user?.email || t('settings.profile.notInformed')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              {t('settings.appearance.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.appearance.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t('settings.appearance.theme')}</label>
                <p className="text-sm text-muted-foreground">
                  {getThemeLabel()}
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
                  {t('settings.appearance.light')}
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="h-9"
                >
                  <Moon className="h-4 w-4 mr-2" />
                  {t('settings.appearance.dark')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t('settings.language.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.language.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">{t('settings.language.title')}</label>
                <p className="text-sm text-muted-foreground">
                  {currentLanguage === 'pt-BR' ? t('settings.language.portuguese') : t('settings.language.english')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={currentLanguage === 'pt-BR' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeLanguage('pt-BR')}
                  className="h-9"
                >
                  {t('settings.language.portuguese')}
                </Button>
                <Button
                  variant={currentLanguage === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeLanguage('en')}
                  className="h-9"
                >
                  {t('settings.language.english')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t('settings.investments.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.investments.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">{t('settings.investments.initialAmount')}</label>
                  <p className="text-sm text-muted-foreground">
                    {initialAmount !== undefined 
                      ? formatCurrency(initialAmount)
                      : t('settings.investments.notDefined')
                    }
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditInitialAmountOpen(true)}
                >
                  {initialAmount !== undefined ? t('common.edit') : t('settings.investments.define')}
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
            <DialogTitle>{t('settings.profile.editName')}</DialogTitle>
            <DialogDescription>
              {t('settings.profile.editNameDescription')}
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
              placeholder={t('settings.profile.namePlaceholder')}
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
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="flex-1" disabled={!nameValue.trim()}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditPhotoOpen} onOpenChange={setIsEditPhotoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.profile.editPhoto')}</DialogTitle>
            <DialogDescription>
              {t('settings.profile.editPhotoDescription')}
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
              placeholder={t('settings.profile.photoURLPlaceholder')}
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
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="flex-1" disabled={!photoURLValue.trim()}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Settings;
