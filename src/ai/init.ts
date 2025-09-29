import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const modelName = 'googleai/gemini-1.5-pro-latest';

export const ai = genkit({
  plugins: [googleAI()],
  model: modelName,
});
