
import App from '@/app/App';

export default function Home() {
  const modelName = 'googleai/gemini-2.0-flash';
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
