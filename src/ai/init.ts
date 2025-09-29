import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const modelName = 'googleai/gemini-2.0-flash';

export const ai = genkit({
  plugins: [googleAI()],
  model: modelName,
});
