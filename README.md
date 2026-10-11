# GDAStudio — Portfolio progetti

Portfolio pubblico dei progetti di architettura con area admin per gestire i lavori ed esportare l'elenco in PDF.
Next.js 15 + Firebase (Firestore e Authentication).

## Variabili d'ambiente

Crea `.env.local` (già in `.gitignore`) con la configurazione web del progetto Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Le stesse variabili vanno impostate nel pannello del provider di hosting (es. Netlify).

## Accesso admin e sicurezza

L'area `/admin` usa Firebase Authentication (email/password). La protezione vera dei dati è nelle
regole Firestore (`firestore.rules`): i visitatori leggono solo i progetti con `isPublic == true`,
solo l'admin può leggere i progetti privati e scrivere.

Configurazione (una tantum):

1. Firebase Console → Authentication → Sign-in method: abilita **Email/Password**.
2. Authentication → Users → **Add user**: crea l'utente admin e copia il suo **User UID**.
3. In `firestore.rules` sostituisci `ADMIN_UID` con quell'UID.
4. Pubblica le regole: `firebase deploy --only firestore:rules`, oppure incollale in
   Firestore Database → Regole.
5. (Consigliato) Authentication → Settings → User actions: disattiva la registrazione di nuovi utenti.

## Dati di esempio

Se la collezione `projects` è vuota, in `/admin` compare il pulsante "Carica progetti di esempio"
(dati in `src/lib/seed.ts`).

## Build pubblica

Con `NEXT_PUBLIC_BUILD_MODE=public` il pulsante "Accesso Admin" viene nascosto dall'header.

## Sviluppo

```
npm install
npm run dev        # http://localhost:9002
npm run typecheck
npm run build
```
