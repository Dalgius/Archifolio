'use client';

import * as React from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { GDAStudioLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const errorMessage = (code: string | undefined) => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-email':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email o password non validi.';
    case 'auth/too-many-requests':
      return 'Troppi tentativi. Riprova tra qualche minuto.';
    default:
      return 'Accesso non riuscito. Riprova.';
  }
};

export default function LoginPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // On success the admin layout sees the signed-in user and redirects to /admin.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), String(formData.get('email')), String(formData.get('password')));
    } catch (e) {
      setError(errorMessage((e as { code?: string }).code));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
             <GDAStudioLogo className="w-20 h-20" />
          </div>
          <CardTitle className="text-2xl font-headline">Accesso Area Riservata</CardTitle>
          <CardDescription>Inserisci le tue credenziali per gestire il portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
             {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errore di Accesso</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
