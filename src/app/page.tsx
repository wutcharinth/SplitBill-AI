import App from '@/components/app/App';
import { modelName } from '@/ai/genkit';

export default function Home() {
  const formattedModelName = modelName
    .replace('googleai/gemini-', 'Gemini ')
    .replace('-latest', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <main className="min-h-screen text-foreground bg-slate-100 font-sans">
      <App modelName={formattedModelName} />
    </main>
  );
}
