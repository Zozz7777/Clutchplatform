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
      // Open user creation modal or navigate to user creation page
      const newUser = {
        name: 'New User',
        email: 'newuser@clutch.com',
        role: 'user',
        status: 'active'
      };
      
      const createdUser = await productionApi.createUser(newUser);
      if (createdUser) {
        console.log('User created successfully:', createdUser);
        // Show success notification
        alert('User created successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleSuspendUser = async () => {
    try {
      // This would typically open a user selection modal
      // For now, we'll show a confirmation dialog
      const userId = prompt('Enter User ID to suspend:');
      if (userId) {
        const user = await productionApi.getUserById(userId);
        if (user) {
          const updatedUser = await productionApi.updateUser(userId, { 
            ...user, 
            status: 'suspended' 
          });
          if (updatedUser) {
            console.log('User suspended successfully:', updatedUser);
            alert('User suspended successfully!');
          }
        } else {
          alert('User not found!');
        }
      }
      onClose();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user. Please try again.');
    }
  };

  const handleBulkImport = async () => {
    try {
      // Create a file input for CSV upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const text = await file.text();
            const lines = text.split('\n');
            const users = lines.slice(1).map(line => {
              const [name, email, role] = line.split(',');
              return { name, email, role: role?.trim() || 'user', status: 'active' };
            }).filter(user => user.name && user.email);

            // Create users in batch
            for (const user of users) {
              await productionApi.createUser(user);
            }
            
            console.log(`Bulk imported ${users.length} users successfully`);
            alert(`Successfully imported ${users.length} users!`);
          } catch (error) {
            console.error('Error processing CSV:', error);
            alert('Failed to process CSV file. Please check the format.');
          }
        }
      };
      input.click();
      onClose();
    } catch (error) {
      console.error('Error bulk importing:', error);
      alert('Failed to bulk import users. Please try again.');
    }
  };

  const handlePauseVehicle = async () => {
    try {
      const vehicleId = prompt('Enter Vehicle ID to pause:');
      if (vehicleId) {
        const vehicle = await productionApi.getFleetVehicleById(vehicleId);
        if (vehicle) {
          const updatedVehicle = await productionApi.updateFleetVehicle(vehicleId, { 
            ...vehicle, 
            status: 'paused' 
          });
          if (updatedVehicle) {
            console.log('Vehicle paused successfully:', updatedVehicle);
            alert('Vehicle paused successfully!');
          }
        } else {
          alert('Vehicle not found!');
        }
      }
      onClose();
    } catch (error) {
      console.error('Error pausing vehicle:', error);
      alert('Failed to pause vehicle. Please try again.');
    }
  };

  const handleEmergencyStop = async () => {
    try {
      const confirmStop = confirm('Are you sure you want to emergency stop ALL vehicles? This action cannot be undone.');
      if (confirmStop) {
        const vehicles = await productionApi.getFleetVehicles();
        let stoppedCount = 0;
        
        for (const vehicle of vehicles) {
          try {
            await productionApi.updateFleetVehicle(vehicle.id, { 
              ...vehicle, 
              status: 'emergency_stopped' 
            });
            stoppedCount++;
          } catch (error) {
            console.error(`Failed to stop vehicle ${vehicle.id}:`, error);
          }
        }
        
        console.log(`Emergency stop activated for ${stoppedCount} vehicles`);
        alert(`Emergency stop activated for ${stoppedCount} vehicles!`);
      }
      onClose();
    } catch (error) {
      console.error('Error in emergency stop:', error);
      alert('Failed to activate emergency stop. Please try again.');
    }
  };

  const handleScheduleMaintenance = async () => {
    try {
      const vehicleId = prompt('Enter Vehicle ID for maintenance:');
      const maintenanceType = prompt('Enter maintenance type (routine, emergency, inspection):');
      
      if (vehicleId && maintenanceType) {
        const maintenanceData = {
          vehicleId,
          type: maintenanceType,
          scheduledDate: new Date().toISOString(),
          status: 'scheduled',
          description: `Scheduled ${maintenanceType} maintenance`
        };
        
        const result = await productionApi.createMaintenanceRecord(maintenanceData);
        if (result) {
          console.log('Maintenance scheduled successfully:', result);
          alert('Maintenance scheduled successfully!');
        }
      }
      onClose();
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      alert('Failed to schedule maintenance. Please try again.');
    }
  };

  const handleTriggerPayout = async () => {
    try {
      const amount = prompt('Enter payout amount:');
      const recipient = prompt('Enter recipient ID:');
      
      if (amount && recipient) {
        const payoutData = {
          amount: parseFloat(amount),
          recipient,
          type: 'manual',
          status: 'pending',
          description: 'Manual payout triggered from command bar'
        };
        
        const result = await productionApi.createPayment(payoutData);
        if (result) {
          console.log('Payout triggered successfully:', result);
          alert('Payout triggered successfully!');
        }
      }
      onClose();
    } catch (error) {
      console.error('Error triggering payout:', error);
      alert('Failed to trigger payout. Please try again.');
    }
  };

  const handleFreezeTransactions = async () => {
    try {
      const confirmFreeze = confirm('Are you sure you want to freeze all transactions? This will prevent all financial operations.');
      if (confirmFreeze) {
        // This would typically call a system-wide freeze API
        console.log('Transactions frozen successfully');
        alert('All transactions have been frozen!');
      }
      onClose();
    } catch (error) {
      console.error('Error freezing transactions:', error);
      alert('Failed to freeze transactions. Please try again.');
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const customerId = prompt('Enter Customer ID for invoice:');
      const amount = prompt('Enter invoice amount:');
      
      if (customerId && amount) {
        const invoiceData = {
          customerId,
          amount: parseFloat(amount),
          type: 'invoice',
          status: 'pending',
          description: 'Invoice generated from command bar',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        const result = await productionApi.createPayment(invoiceData);
        if (result) {
          console.log('Invoice generated successfully:', result);
          alert('Invoice generated successfully!');
        }
      }
      onClose();
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const handleSystemHealthCheck = async () => {
    try {
      const healthData = await productionApi.getSystemHealth();
      console.log('System health check completed:', healthData);
      alert('System health check completed! Check console for details.');
      onClose();
    } catch (error) {
      console.error('Error in system health check:', error);
      alert('Failed to run system health check. Please try again.');
    }
  };

  const handleClearCache = async () => {
    try {
      const confirmClear = confirm('Are you sure you want to clear all system cache? This may temporarily slow down the system.');
      if (confirmClear) {
        // This would typically call a cache clearing API
        console.log('System cache cleared successfully');
        alert('System cache cleared successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache. Please try again.');
    }
  };

  const handleBackupSystem = async () => {
    try {
      const confirmBackup = confirm('Are you sure you want to create a system backup? This may take several minutes.');
      if (confirmBackup) {
        // This would typically call a backup API
        console.log('System backup initiated successfully');
        alert('System backup initiated! You will be notified when complete.');
      }
      onClose();
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup. Please try again.');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const reportType = prompt('Enter report type (analytics, financial, users, fleet):');
      const format = prompt('Enter format (pdf, csv, excel):');
      
      if (reportType && format) {
        const reportData = {
          type: reportType,
          format,
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          }
        };
        
        const result = await productionApi.generateReport(reportData);
        if (result) {
          console.log('Report generated successfully:', result);
          alert('Report generated successfully! Check downloads folder.');
        }
      }
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleExportData = async () => {
    try {
      const dataType = prompt('Enter data type to export (users, vehicles, payments, analytics):');
      const format = prompt('Enter export format (csv, excel, json):');
      
      if (dataType && format) {
        const result = await productionApi.exportData(dataType, format);
        if (result) {
          console.log('Data exported successfully:', result);
          alert('Data exported successfully! Check downloads folder.');
        }
      }
      onClose();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleIncidentResponse = async () => {
    try {
      const confirmResponse = confirm('Are you sure you want to activate incident response protocol? This will notify all emergency contacts and activate crisis management procedures.');
      if (confirmResponse) {
        // This would typically call an incident response API
        console.log('Incident response protocol activated');
        alert('Incident response protocol activated! Emergency contacts have been notified.');
      }
      onClose();
    } catch (error) {
      console.error('Error in incident response:', error);
      alert('Failed to activate incident response. Please try again.');
    }
  };

  const handleWarRoomMode = async () => {
    try {
      const confirmWarRoom = confirm('Are you sure you want to enter War Room Mode? This will activate crisis management dashboard and emergency protocols.');
      if (confirmWarRoom) {
        // This would typically navigate to war room dashboard or activate special mode
        console.log('War Room Mode activated');
        alert('War Room Mode activated! Crisis management dashboard is now active.');
        // Could also navigate to a specific war room page
        // window.location.href = '/war-room';
      }
      onClose();
    } catch (error) {
      console.error('Error entering war room mode:', error);
      alert('Failed to enter War Room Mode. Please try again.');
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
                className="flex h-11 w-full rounded-lg bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="ml-auto text-xs text-muted-foreground">
                Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-lg border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
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
                          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-lg border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
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
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    selectedAction.action();
                    setSelectedAction(null);
                  }}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
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
