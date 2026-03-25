import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/health', label: 'Health', icon: '💓' },
  { to: '/map', label: 'Map', icon: '📍' },
  { to: '/feeding', label: 'Feeding', icon: '🍽️' },
  { to: '/hub', label: 'Cat TV', icon: '📺' },
  { to: '/chat', label: 'AI Vet', icon: '🤖' },
];

export default function TabNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 text-xs transition-colors ${
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
