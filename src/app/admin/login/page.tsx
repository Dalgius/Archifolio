
'use client';

import * as React from 'react';
import { useFormState } from 'react-dom';
import { ArchifolioLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction] = useFormState(login, null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
             <ArchifolioLogo className="w-12 h-12" />
          </div>
          <CardTitle className="text-2xl font-headline">Accesso Area Riservata</CardTitle>
          <CardDescription>Inserisci le tue credenziali per gestire il portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
             {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Errore di Accesso</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Accedi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
