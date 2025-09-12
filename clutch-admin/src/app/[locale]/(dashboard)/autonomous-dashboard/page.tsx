import { Metadata } from 'next';
import AutonomousDashboard from '@/components/autonomous/AutonomousDashboard';

export const metadata: Metadata = {
  title: 'Autonomous Dashboard | Clutch Admin',
  description: 'Self-healing, AI-powered analytics dashboard with real-time monitoring and intelligent insights',
};

export default function AutonomousDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <AutonomousDashboard />
    </div>
  );
}
