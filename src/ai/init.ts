import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const modelName = 'googleai/gemini-pro';

export const ai = genkit({
  plugins: [googleAI()],
  model: modelName,
});
