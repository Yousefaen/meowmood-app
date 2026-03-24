import { Outlet } from 'react-router-dom';
import TabNav from './TabNav';

export default function AppShell() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            <span className="text-primary">Meow</span>Mood
          </h1>
          <span className="text-xs text-muted-foreground">Demo</span>
        </div>
      </header>
      <main className="px-4 py-4 pb-20">
        <Outlet />
      </main>
      <TabNav />
    </div>
  );
}
