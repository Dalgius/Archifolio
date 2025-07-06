
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-ai';
import {firebase} from 'genkit/firebase';

export const ai = genkit({
  plugins: [googleAI(), firebase()],
});
