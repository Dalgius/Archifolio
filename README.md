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
3. In `firestore.rules` inserisci quell'UID nella funzione `isAdmin()`.
4. Pubblica le regole: `firebase deploy --only firestore:rules`, oppure incollale in
   Firestore Database → Regole.
5. (Consigliato) Authentication → Settings → User actions: disattiva la registrazione di nuovi utenti.

## Immagini

Le immagini non stanno nei documenti `projects` ma nella collezione `projectImages` (stesso id del
progetto), così l'elenco dei progetti resta leggero. Il sito pubblico le serve da
`/images/<id>/<versione>` con cache permanente (la versione cambia a ogni nuovo caricamento).
I documenti nel vecchio formato (campo `image`) vengono convertiti automaticamente al primo accesso in `/admin`.

## Sito pubblico e Google

Home e pagine dei progetti sono generate sul server (titolo, descrizione e anteprima per i social)
e rigenerate al massimo ogni 60 secondi: le modifiche fatte in admin compaiono entro un minuto.
`/sitemap.xml` e `/robots.txt` sono generati automaticamente. Per usare un dominio personalizzato
negli URL della sitemap e delle anteprime imposta `NEXT_PUBLIC_SITE_URL` (es. `https://www.gdastudio.it`);
altrimenti viene usato l'indirizzo Netlify.

## Contatti dello studio

Email, telefono, indirizzo e link mostrati nella sezione "Contatti" e nel footer del sito pubblico
si modificano in `src/lib/site.ts` (oggetto `STUDIO`). Un campo vuoto (`''`) viene nascosto.

## Dati di esempio

Se la collezione `projects` è vuota, in `/admin` compare il pulsante "Carica progetti di esempio"
(dati in `src/lib/seed.ts`).

## Build pubblica

Con `NEXT_PUBLIC_BUILD_MODE=public` il pulsante "Accesso Admin" viene nascosto dall'header.

## Sviluppo

Con gli emulatori Firebase (`firebase emulators:start --only firestore,auth`) imposta
`NEXT_PUBLIC_FIREBASE_EMULATORS=true` e `NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-gdastudio`.

```
npm install
npm run dev        # http://localhost:9002
npm run typecheck
npm run build
```
