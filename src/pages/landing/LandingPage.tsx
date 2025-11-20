import { Footer } from '@/components/layout/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold">AgentForms</h1>
          <p className="text-medium-gray mt-4">AI Conversational Form Builder</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
