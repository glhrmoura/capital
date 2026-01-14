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
        const credentialId = sessionStorage.getItem('biometricCredentialId');
        
        if (credentialId) {
          const credentialIdBuffer = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0));
          
          const getOptions: PublicKeyCredentialRequestOptions = {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            allowCredentials: [{
              id: credentialIdBuffer,
              type: 'public-key',
            }],
            userVerification: 'required',
            timeout: 60000,
          };

          const assertion = await navigator.credentials.get({
            publicKey: getOptions,
          });

          if (assertion) {
            sessionStorage.setItem('biometricAuthenticated', 'true');
            onAuthenticated();
            return;
          }
        } else {
          const userId = new Uint8Array(16);
          crypto.getRandomValues(userId);
          const userIdBase64 = btoa(String.fromCharCode(...userId));

          const createOptions: PublicKeyCredentialCreationOptions = {
            challenge: crypto.getRandomValues(new Uint8Array(32)),
            rp: {
              name: 'Capital',
              id: window.location.hostname,
            },
            user: {
              id: userId,
              name: 'user@capital.app',
              displayName: 'Capital User',
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required',
            },
            timeout: 60000,
          };

          const credential = await navigator.credentials.create({
            publicKey: createOptions,
          }) as PublicKeyCredential | null;

          if (credential) {
            sessionStorage.setItem('biometricCredentialId', userIdBase64);
            sessionStorage.setItem('biometricAuthenticated', 'true');
            onAuthenticated();
            return;
          }
        }
      }
      
      sessionStorage.setItem('biometricAuthenticated', 'true');
      onAuthenticated();
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        setError('Autenticação cancelada');
      } else if (err.name === 'NotSupportedError' || err.name === 'InvalidStateError') {
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
      return;
    }

    const wasAuthenticated = sessionStorage.getItem('biometricAuthenticated');
    const credentialId = sessionStorage.getItem('biometricCredentialId');

    if (wasAuthenticated === 'true' && credentialId && isWebAuthnSupported()) {
      try {
        const credentialIdBuffer = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0));
        
        const getOptions: PublicKeyCredentialRequestOptions = {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{
            id: credentialIdBuffer,
            type: 'public-key',
          }],
          userVerification: 'required',
          timeout: 60000,
        };

        navigator.credentials.get({
          publicKey: getOptions,
        }).then((assertion) => {
          if (assertion) {
            onAuthenticated();
          }
        }).catch(() => {
          sessionStorage.removeItem('biometricAuthenticated');
          sessionStorage.removeItem('biometricCredentialId');
        });
      } catch {
        sessionStorage.removeItem('biometricAuthenticated');
        sessionStorage.removeItem('biometricCredentialId');
      }
    }
  }, [onAuthenticated]);

  if (!isIOS()) {
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
