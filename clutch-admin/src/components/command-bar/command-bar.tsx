'use client';

import { useState, useEffect, useCallback } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User, 
  Truck, 
  DollarSign, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  Users,
  FileText,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';
import { productionApi } from '@/lib/production-api';

interface CommandAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  keywords: string[];
  action: () => void;
  shortcut?: string;
  requiresConfirmation?: boolean;
  impact?: 'low' | 'medium' | 'high' | 'critical';
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const [search, setSearch] = useState('');
  const [actions, setActions] = useState<CommandAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<CommandAction | null>(null);

  // Initialize command actions
  useEffect(() => {
    const initializeActions = () => {
      const commandActions: CommandAction[] = [
        // User Management
        {
          id: 'create-user',
          title: 'Create User',
          description: 'Add a new user to the system',
          icon: <User className="h-4 w-4" />,
          category: 'Users',
          keywords: ['user', 'create', 'add', 'new'],
          action: () => handleCreateUser(),
          shortcut: 'Ctrl+U',
          impact: 'medium'
        },
        {
          id: 'suspend-user',
          title: 'Suspend User',
          description: 'Temporarily disable user access',
          icon: <Shield className="h-4 w-4" />,
          category: 'Users',
          keywords: ['user', 'suspend', 'disable', 'block'],
          action: () => handleSuspendUser(),
          requiresConfirmation: true,
          impact: 'high'
        },
        {
          id: 'bulk-user-import',
          title: 'Bulk Import Users',
          description: 'Import multiple users from CSV',
          icon: <Users className="h-4 w-4" />,
          category: 'Users',
          keywords: ['user', 'import', 'bulk', 'csv'],
          action: () => handleBulkImport(),
          impact: 'high'
        },

        // Fleet Management
        {
          id: 'pause-vehicle',
          title: 'Pause Vehicle',
          description: 'Temporarily halt vehicle operations',
          icon: <Truck className="h-4 w-4" />,
          category: 'Fleet',
          keywords: ['vehicle', 'pause', 'stop', 'fleet'],
          action: () => handlePauseVehicle(),
          requiresConfirmation: true,
          impact: 'high'
        },
        {
          id: 'emergency-stop',
          title: 'Emergency Stop All Vehicles',
          description: 'Immediately halt all fleet operations',
          icon: <AlertTriangle className="h-4 w-4" />,
          category: 'Fleet',
          keywords: ['emergency', 'stop', 'all', 'fleet', 'halt'],
          action: () => handleEmergencyStop(),
          requiresConfirmation: true,
          impact: 'critical'
        },
        {
          id: 'schedule-maintenance',
          title: 'Schedule Maintenance',
          description: 'Book maintenance for selected vehicles',
          icon: <Settings className="h-4 w-4" />,
          category: 'Fleet',
          keywords: ['maintenance', 'schedule', 'service', 'repair'],
          action: () => handleScheduleMaintenance(),
          impact: 'medium'
        },

        // Financial Operations
        {
          id: 'trigger-payout',
          title: 'Trigger Payout',
          description: 'Process immediate payment to vendor',
          icon: <DollarSign className="h-4 w-4" />,
          category: 'Finance',
          keywords: ['payout', 'payment', 'vendor', 'trigger'],
          action: () => handleTriggerPayout(),
          requiresConfirmation: true,
          impact: 'high'
        },
        {
          id: 'freeze-transactions',
          title: 'Freeze All Transactions',
          description: 'Temporarily halt all financial transactions',
          icon: <Shield className="h-4 w-4" />,
          category: 'Finance',
          keywords: ['freeze', 'transactions', 'halt', 'stop'],
          action: () => handleFreezeTransactions(),
          requiresConfirmation: true,
          impact: 'critical'
        },
        {
          id: 'generate-invoice',
          title: 'Generate Invoice',
          description: 'Create invoice for selected client',
          icon: <FileText className="h-4 w-4" />,
          category: 'Finance',
          keywords: ['invoice', 'generate', 'billing', 'client'],
          action: () => handleGenerateInvoice(),
          impact: 'medium'
        },

        // System Operations
        {
          id: 'system-health-check',
          title: 'System Health Check',
          description: 'Run comprehensive system diagnostics',
          icon: <Activity className="h-4 w-4" />,
          category: 'System',
          keywords: ['health', 'check', 'diagnostics', 'system'],
          action: () => handleSystemHealthCheck(),
          impact: 'low'
        },
        {
          id: 'clear-cache',
          title: 'Clear System Cache',
          description: 'Clear all system caches and temporary data',
          icon: <Zap className="h-4 w-4" />,
          category: 'System',
          keywords: ['cache', 'clear', 'temp', 'data'],
          action: () => handleClearCache(),
          impact: 'medium'
        },
        {
          id: 'backup-system',
          title: 'Backup System',
          description: 'Create full system backup',
          icon: <Shield className="h-4 w-4" />,
          category: 'System',
          keywords: ['backup', 'system', 'data', 'save'],
          action: () => handleBackupSystem(),
          impact: 'high'
        },

        // Analytics & Reports
        {
          id: 'generate-report',
          title: 'Generate Report',
          description: 'Create custom analytics report',
          icon: <BarChart3 className="h-4 w-4" />,
          category: 'Analytics',
          keywords: ['report', 'generate', 'analytics', 'data'],
          action: () => handleGenerateReport(),
          impact: 'low'
        },
        {
          id: 'export-data',
          title: 'Export Data',
          description: 'Export selected data to CSV/Excel',
          icon: <TrendingUp className="h-4 w-4" />,
          category: 'Analytics',
          keywords: ['export', 'data', 'csv', 'excel'],
          action: () => handleExportData(),
          impact: 'low'
        },

        // Emergency Actions
        {
          id: 'incident-response',
          title: 'Activate Incident Response',
          description: 'Trigger emergency incident response protocol',
          icon: <AlertTriangle className="h-4 w-4" />,
          category: 'Emergency',
          keywords: ['incident', 'emergency', 'response', 'protocol'],
          action: () => handleIncidentResponse(),
          requiresConfirmation: true,
          impact: 'critical'
        },
        {
          id: 'war-room-mode',
          title: 'Enter War Room Mode',
          description: 'Activate crisis management dashboard',
          icon: <Target className="h-4 w-4" />,
          category: 'Emergency',
          keywords: ['war', 'room', 'crisis', 'management'],
          action: () => handleWarRoomMode(),
          impact: 'critical'
        }
      ];

      setActions(commandActions);
    };

    initializeActions();
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        // Toggle command bar
        if (isOpen) {
          onClose();
        } else {
          // Open command bar (handled by parent)
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter actions based on search
  const filteredActions = actions.filter(action => {
    const searchLower = search.toLowerCase();
    return (
      action.title.toLowerCase().includes(searchLower) ||
      action.description.toLowerCase().includes(searchLower) ||
      action.keywords.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
      action.category.toLowerCase().includes(searchLower)
    );
  });

  // Group actions by category
  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, CommandAction[]>);

  // Action handlers
  const handleCreateUser = async () => {
    try {
      // Implementation for creating user
      console.log('Creating user...');
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleSuspendUser = async () => {
    try {
      // Implementation for suspending user
      console.log('Suspending user...');
      onClose();
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleBulkImport = async () => {
    try {
      // Implementation for bulk import
      console.log('Bulk importing users...');
      onClose();
    } catch (error) {
      console.error('Error bulk importing:', error);
    }
  };

  const handlePauseVehicle = async () => {
    try {
      // Implementation for pausing vehicle
      console.log('Pausing vehicle...');
      onClose();
    } catch (error) {
      console.error('Error pausing vehicle:', error);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      // Implementation for emergency stop
      console.log('Emergency stop activated...');
      onClose();
    } catch (error) {
      console.error('Error in emergency stop:', error);
    }
  };

  const handleScheduleMaintenance = async () => {
    try {
      // Implementation for scheduling maintenance
      console.log('Scheduling maintenance...');
      onClose();
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
    }
  };

  const handleTriggerPayout = async () => {
    try {
      // Implementation for triggering payout
      console.log('Triggering payout...');
      onClose();
    } catch (error) {
      console.error('Error triggering payout:', error);
    }
  };

  const handleFreezeTransactions = async () => {
    try {
      // Implementation for freezing transactions
      console.log('Freezing transactions...');
      onClose();
    } catch (error) {
      console.error('Error freezing transactions:', error);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      // Implementation for generating invoice
      console.log('Generating invoice...');
      onClose();
    } catch (error) {
      console.error('Error generating invoice:', error);
    }
  };

  const handleSystemHealthCheck = async () => {
    try {
      // Implementation for system health check
      console.log('Running system health check...');
      onClose();
    } catch (error) {
      console.error('Error in system health check:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      // Implementation for clearing cache
      console.log('Clearing system cache...');
      onClose();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const handleBackupSystem = async () => {
    try {
      // Implementation for system backup
      console.log('Creating system backup...');
      onClose();
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      // Implementation for generating report
      console.log('Generating report...');
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleExportData = async () => {
    try {
      // Implementation for exporting data
      console.log('Exporting data...');
      onClose();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleIncidentResponse = async () => {
    try {
      // Implementation for incident response
      console.log('Activating incident response...');
      onClose();
    } catch (error) {
      console.error('Error in incident response:', error);
    }
  };

  const handleWarRoomMode = async () => {
    try {
      // Implementation for war room mode
      console.log('Entering war room mode...');
      onClose();
    } catch (error) {
      console.error('Error entering war room mode:', error);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const executeAction = (action: CommandAction) => {
    if (action.requiresConfirmation) {
      setSelectedAction(action);
    } else {
      action.action();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0">
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Type a command or search..."
                value={search}
                onValueChange={setSearch}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="ml-auto text-xs text-muted-foreground">
                Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd> to open
              </div>
            </div>
            <CommandList className="max-h-[400px] overflow-y-auto">
              <CommandEmpty>No results found.</CommandEmpty>
              {Object.entries(groupedActions).map(([category, categoryActions]) => (
                <CommandGroup key={category} heading={category}>
                  {categoryActions.map((action) => (
                    <CommandItem
                      key={action.id}
                      value={action.id}
                      onSelect={() => executeAction(action)}
                      className="flex items-center justify-between p-2"
                    >
                      <div className="flex items-center space-x-3">
                        {action.icon}
                        <div>
                          <div className="font-medium">{action.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {action.shortcut && (
                          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            {action.shortcut}
                          </kbd>
                        )}
                        <Badge 
                          variant="secondary" 
                          className={`h-2 w-2 p-0 ${getImpactColor(action.impact || 'low')}`}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      {selectedAction && (
        <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
          <DialogContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {selectedAction.icon}
                <div>
                  <h3 className="font-semibold">{selectedAction.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAction.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="destructive" 
                  className={getImpactColor(selectedAction.impact || 'low')}
                >
                  {selectedAction.impact?.toUpperCase()} IMPACT
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                This action will have a <strong>{selectedAction.impact}</strong> impact on the system. 
                Are you sure you want to proceed?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    selectedAction.action();
                    setSelectedAction(null);
                  }}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
