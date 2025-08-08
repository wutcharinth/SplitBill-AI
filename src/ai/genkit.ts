import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const modelName = 'googleai/gemini-1.5-flash-latest';

export const ai = genkit({
  plugins: [googleAI()],
  //model: 'googleai/gemini-1.5-pro-latest',
  model: modelName,
});
