import { useAuthStore } from '../store/authStore';

export default function WelcomeMessage() {
  const { user } = useAuthStore();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = user?.email?.split('@')[0] || 'Guest';
  const formattedName = displayName.split('.').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h2 className="text-xl font-medium text-gray-800">
        {getGreeting()}, {formattedName}!
      </h2>
    </div>
  );
}