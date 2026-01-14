import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fingerprint } from 'lucide-react';

interface BiometricAuthProps {
  onAuthenticated: () => void;
}

const isIOS = () => {
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
};

const isWebAuthnSupported = () => {
  return typeof window !== 'undefined' && 
         'PublicKeyCredential' in window &&
         typeof PublicKeyCredential !== 'undefined';
};

export const BiometricAuth = ({ onAuthenticated }: BiometricAuthProps) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      if (isWebAuthnSupported()) {
        const credential = await navigator.credentials.get({
          publicKey: {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            allowCredentials: [],
            userVerification: 'required',
            timeout: 60000,
          } as PublicKeyCredentialRequestOptions,
        });

        if (credential) {
          sessionStorage.setItem('biometricAuthenticated', 'true');
          onAuthenticated();
          return;
        }
      } else {
        sessionStorage.setItem('biometricAuthenticated', 'true');
        onAuthenticated();
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        setError('Autenticação cancelada');
      } else if (err.name === 'NotSupportedError') {
        sessionStorage.setItem('biometricAuthenticated', 'true');
        onAuthenticated();
      } else {
        setError('Erro na autenticação. Tente novamente.');
        console.error('Biometric auth error:', err);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (!isIOS()) {
      sessionStorage.setItem('biometricAuthenticated', 'true');
      onAuthenticated();
    }
  }, [onAuthenticated]);

  if (!isIOS() || !isWebAuthnSupported()) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Fingerprint className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Autenticação Necessária</CardTitle>
          <CardDescription>
            Use Face ID para acessar o aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <Button 
            onClick={authenticate} 
            disabled={isAuthenticating}
            className="w-full"
            size="lg"
          >
            {isAuthenticating ? 'Autenticando...' : 'Autenticar com Face ID'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
