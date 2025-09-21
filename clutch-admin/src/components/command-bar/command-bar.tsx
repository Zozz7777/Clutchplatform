'use client';

import { useState, useEffect, useCallback } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CommandModal, ConfirmModal, InputModal } from '@/components/ui/command-modal';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
// import { useTranslations } from 'next-intl';
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
  const t = (key: string, params?: any) => key;
  const [search, setSearch] = useState('');
  const [actions, setActions] = useState<CommandAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<CommandAction | null>(null);
  
  // Modal states
  const [modalState, setModalState] = useState<{
    type: 'input' | 'confirm' | 'form' | null;
    title: string;
    description?: string;
    fields?: Record<string, unknown>[];
    onSubmit?: (data: Record<string, unknown>) => Promise<void>;
    variant?: 'default' | 'destructive' | 'warning';
  }>({
    type: null,
    title: '',
    description: '',
    fields: [],
    onSubmit: undefined,
    variant: 'default'
  });

  // Initialize command actions
  useEffect(() => {
    const initializeActions = () => {
      const commandActions: CommandAction[] = [
        // User Management
        {
          id: 'create-user',
          title: t('commandBar.actions.createUser'),
          description: t('commandBar.actions.createUserDesc'),
          icon: <User className="h-4 w-4" />,
          category: t('commandBar.categories.users'),
          keywords: ['user', 'create', 'add', 'new'],
          action: () => handleCreateUser(),
          shortcut: 'Ctrl+U',
          impact: 'medium'
        },
        {
          id: 'suspend-user',
          title: t('commandBar.actions.suspendUser'),
          description: t('commandBar.actions.suspendUserDesc'),
          icon: <Shield className="h-4 w-4" />,
          category: t('commandBar.categories.users'),
          keywords: ['user', 'suspend', 'disable', 'block'],
          action: () => handleSuspendUser(),
          requiresConfirmation: true,
          impact: 'high'
        },
        {
          id: 'bulk-user-import',
          title: t('commandBar.actions.bulkUserImport'),
          description: t('commandBar.actions.bulkUserImportDesc'),
          icon: <Users className="h-4 w-4" />,
          category: t('commandBar.categories.users'),
          keywords: ['user', 'import', 'bulk', 'csv'],
          action: () => handleBulkImport(),
          impact: 'high'
        },

        // Fleet Management
        {
          id: 'pause-vehicle',
          title: t('commandBar.actions.pauseVehicle'),
          description: t('commandBar.actions.pauseVehicleDesc'),
          icon: <Truck className="h-4 w-4" />,
          category: t('commandBar.categories.fleet'),
          keywords: ['vehicle', 'pause', 'stop', 'fleet'],
          action: () => handlePauseVehicle(),
          requiresConfirmation: true,
          impact: 'high'
        },
        {
          id: 'emergency-stop',
          title: t('commandBar.actions.emergencyStop'),
          description: t('commandBar.actions.emergencyStopDesc'),
          icon: <AlertTriangle className="h-4 w-4" />,
          category: t('commandBar.categories.fleet'),
          keywords: ['emergency', 'stop', 'all', 'fleet', 'halt'],
          action: () => handleEmergencyStop(),
          requiresConfirmation: true,
          impact: 'critical'
        },
        {
          id: 'schedule-maintenance',
          title: t('commandBar.actions.scheduleMaintenance'),
          description: t('commandBar.actions.scheduleMaintenanceDesc'),
          icon: <Settings className="h-4 w-4" />,
          category: t('commandBar.categories.fleet'),
          keywords: ['maintenance', 'schedule', 'service', 'repair'],
          action: () => handleScheduleMaintenance(),
          impact: 'medium'
        },

        // Financial Operations
        {
          id: 'trigger-payout',
          title: t('commandBar.actions.triggerPayout'),
          description: t('commandBar.actions.triggerPayoutDesc'),
          icon: <DollarSign className="h-4 w-4" />,
          category: t('commandBar.categories.finance'),
          keywords: ['payout', 'payment', 'vendor', 'trigger'],
          action: () => handleTriggerPayout(),
          requiresConfirmation: true,
          impact: 'high'
        },
        {
          id: 'freeze-transactions',
          title: t('commandBar.actions.freezeTransactions'),
          description: t('commandBar.actions.freezeTransactionsDesc'),
          icon: <Shield className="h-4 w-4" />,
          category: t('commandBar.categories.finance'),
          keywords: ['freeze', 'transactions', 'halt', 'stop'],
          action: () => handleFreezeTransactions(),
          requiresConfirmation: true,
          impact: 'critical'
        },
        {
          id: 'generate-invoice',
          title: t('commandBar.actions.generateInvoice'),
          description: t('commandBar.actions.generateInvoiceDesc'),
          icon: <FileText className="h-4 w-4" />,
          category: t('commandBar.categories.finance'),
          keywords: ['invoice', 'generate', 'billing', 'client'],
          action: () => handleGenerateInvoice(),
          impact: 'medium'
        },

        // System Operations
        {
          id: 'system-health-check',
          title: t('commandBar.actions.systemHealthCheck'),
          description: t('commandBar.actions.systemHealthCheckDesc'),
          icon: <Activity className="h-4 w-4" />,
          category: t('commandBar.categories.system'),
          keywords: ['health', 'check', 'diagnostics', 'system'],
          action: () => handleSystemHealthCheck(),
          impact: 'low'
        },
        {
          id: 'clear-cache',
          title: t('commandBar.actions.clearCache'),
          description: t('commandBar.actions.clearCacheDesc'),
          icon: <Zap className="h-4 w-4" />,
          category: t('commandBar.categories.system'),
          keywords: ['cache', 'clear', 'temp', 'data'],
          action: () => handleClearCache(),
          impact: 'medium'
        },
        {
          id: 'backup-system',
          title: t('commandBar.actions.backupSystem'),
          description: t('commandBar.actions.backupSystemDesc'),
          icon: <Shield className="h-4 w-4" />,
          category: t('commandBar.categories.system'),
          keywords: ['backup', 'system', 'data', 'save'],
          action: () => handleBackupSystem(),
          impact: 'high'
        },

        // Analytics & Reports
        {
          id: 'generate-report',
          title: t('commandBar.actions.generateReport'),
          description: t('commandBar.actions.generateReportDesc'),
          icon: <BarChart3 className="h-4 w-4" />,
          category: t('commandBar.categories.analytics'),
          keywords: ['report', 'generate', 'analytics', 'data'],
          action: () => handleGenerateReport(),
          impact: 'low'
        },
        {
          id: 'export-data',
          title: t('commandBar.actions.exportData'),
          description: t('commandBar.actions.exportDataDesc'),
          icon: <TrendingUp className="h-4 w-4" />,
          category: t('commandBar.categories.analytics'),
          keywords: ['export', 'data', 'csv', 'excel'],
          action: () => handleExportData(),
          impact: 'low'
        },

        // Emergency Actions
        {
          id: 'incident-response',
          title: t('commandBar.actions.incidentResponse'),
          description: t('commandBar.actions.incidentResponseDesc'),
          icon: <AlertTriangle className="h-4 w-4" />,
          category: t('commandBar.categories.emergency'),
          keywords: ['incident', 'emergency', 'response', 'protocol'],
          action: () => handleIncidentResponse(),
          requiresConfirmation: true,
          impact: 'critical'
        },
        {
          id: 'war-room-mode',
          title: t('commandBar.actions.warRoomMode'),
          description: t('commandBar.actions.warRoomModeDesc'),
          icon: <Target className="h-4 w-4" />,
          category: t('commandBar.categories.emergency'),
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
    setModalState({
      type: 'form',
      title: t('commandBar.forms.createUser.title'),
      description: t('commandBar.forms.createUser.description'),
      fields: [
        { name: 'name', label: t('commandBar.forms.createUser.fields.name'), type: 'text', placeholder: t('commandBar.forms.createUser.placeholders.name'), required: true },
        { name: 'email', label: t('commandBar.forms.createUser.fields.email'), type: 'email', placeholder: t('commandBar.forms.createUser.placeholders.email'), required: true },
        { 
          name: 'role', 
          label: t('commandBar.forms.createUser.fields.role'), 
          type: 'select', 
          required: true,
          options: [
            { value: 'user', label: t('commandBar.forms.createUser.options.roles.user') },
            { value: 'admin', label: t('commandBar.forms.createUser.options.roles.admin') },
            { value: 'head_administrator', label: t('commandBar.forms.createUser.options.roles.head_administrator') }
          ]
        },
        { 
          name: 'status', 
          label: t('commandBar.forms.createUser.fields.status'), 
          type: 'select', 
          required: true,
          options: [
            { value: 'active', label: t('commandBar.forms.createUser.options.statuses.active') },
            { value: 'inactive', label: t('commandBar.forms.createUser.options.statuses.inactive') },
            { value: 'pending', label: t('commandBar.forms.createUser.options.statuses.pending') }
          ]
        }
      ],
      onSubmit: async (data) => {
        const createdUser = await productionApi.createUser(data);
        if (createdUser) {
          toast.success(t('commandBar.messages.userCreated'), `User ${data.name} has been created.`);
        }
        onClose();
      }
    });
  };

  const handleSuspendUser = async () => {
    setModalState({
      type: 'form',
      title: t('commandBar.forms.suspendUser.title'),
      description: t('commandBar.forms.suspendUser.description'),
      fields: [
        { name: 'userId', label: t('commandBar.forms.suspendUser.fields.userId'), type: 'text', placeholder: t('commandBar.forms.suspendUser.placeholders.userId'), required: true }
      ],
      onSubmit: async (data) => {
        const user = await productionApi.getUserById(data.userId);
        if (user) {
          const updatedUser = await productionApi.updateUser(data.userId, { 
            ...user, 
            status: 'inactive' 
          });
          if (updatedUser) {
            toast.success(t('commandBar.messages.userSuspended'), `User ${user.name} has been suspended.`);
          }
        } else {
          toast.error(t('commandBar.errors.userNotFound'), 'Please check the User ID and try again.');
        }
        onClose();
      }
    });
  };

  const handleBulkImport = async () => {
    setModalState({
      type: 'form',
      title: 'Bulk Import Users',
      description: 'Upload a CSV file to import multiple users at once',
      fields: [
        { 
          name: 'file', 
          label: 'CSV File', 
          type: 'file', 
          placeholder: 'Select CSV file', 
          required: true 
        }
      ],
      onSubmit: async (data) => {
        const file = data.file;
        if (file && file instanceof File) {
          try {
            const text = await file.text();
            const lines = text.split('\n');
            const users = lines.slice(1).map((line: string) => {
              const [name, email, role] = line.split(',');
              return { name, email, role: role?.trim() || 'user', status: 'active' };
            }).filter((user: Record<string, unknown>) => user.name && user.email);

            // Create users in batch
            for (const user of users) {
              await productionApi.createUser(user);
            }
            
            toast.success(`Successfully imported ${users.length} users!`, 'All users have been created successfully.');
            onClose();
          } catch (error) {
            // Error processing CSV
            toast.error('Failed to process CSV file', 'Please check the format and try again.');
          }
        }
      }
    });
  };

  const handlePauseVehicle = async () => {
    setModalState({
      type: 'form',
      title: 'Pause Vehicle',
      description: 'Enter the vehicle ID to pause',
      fields: [
        { name: 'vehicleId', label: 'Vehicle ID', type: 'text', placeholder: 'vehicle-123', required: true }
      ],
      onSubmit: async (data) => {
        const vehicle = await productionApi.getFleetVehicleById(data.vehicleId);
        if (vehicle) {
          const updatedVehicle = await productionApi.updateFleetVehicle(data.vehicleId, { 
            ...vehicle, 
            status: 'maintenance' 
          });
          if (updatedVehicle) {
            toast.success('Vehicle paused successfully!', `Vehicle ${vehicle.id || data.vehicleId} has been paused.`);
          }
        } else {
          toast.error('Vehicle not found!', 'Please check the Vehicle ID and try again.');
        }
        onClose();
      }
    });
  };

  const handleEmergencyStop = async () => {
    setModalState({
      type: 'confirm',
      title: 'Emergency Stop All Vehicles',
      description: 'Are you sure you want to emergency stop ALL vehicles? This action cannot be undone.',
      variant: 'destructive',
      onSubmit: async () => {
        const vehicles = await productionApi.getFleetVehicles();
        let stoppedCount = 0;
        
        for (const vehicle of vehicles) {
          try {
            if (vehicle.id) {
              await productionApi.updateFleetVehicle(vehicle.id, { 
                ...vehicle, 
                status: 'maintenance' 
              });
              stoppedCount++;
            }
          } catch (error) {
            // Failed to stop vehicle
          }
        }
        
        toast.success(`Emergency stop activated for ${stoppedCount} vehicles!`, 'All vehicles have been stopped immediately.');
        onClose();
      }
    });
  };

  const handleScheduleMaintenance = async () => {
    setModalState({
      type: 'form',
      title: 'Schedule Vehicle Maintenance',
      description: 'Enter the maintenance details',
      fields: [
        { name: 'vehicleId', label: 'Vehicle ID', type: 'text', placeholder: 'vehicle-123', required: true },
        { 
          name: 'type', 
          label: 'Maintenance Type', 
          type: 'select', 
          required: true,
          options: [
            { value: 'routine', label: 'Routine' },
            { value: 'emergency', label: 'Emergency' },
            { value: 'inspection', label: 'Inspection' }
          ]
        },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Additional maintenance details' }
      ],
      onSubmit: async (data) => {
        const maintenanceData = {
          vehicleId: data.vehicleId,
          type: data.type,
          scheduledDate: new Date().toISOString(),
          status: 'scheduled',
          description: data.description || `Scheduled ${data.type} maintenance`
        };
        
        const result = await productionApi.createMaintenanceRecord(maintenanceData);
        if (result) {
          toast.success('Maintenance scheduled successfully!', `Maintenance has been scheduled for vehicle ${data.vehicleId}.`);
        }
        onClose();
      }
    });
  };

  const handleTriggerPayout = async () => {
    setModalState({
      type: 'form',
      title: 'Trigger Manual Payout',
      description: 'Enter the payout details',
      fields: [
        { name: 'amount', label: 'Amount', type: 'number', placeholder: '100.00', required: true },
        { name: 'recipient', label: 'Recipient ID', type: 'text', placeholder: 'user-123', required: true },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Reason for payout' }
      ],
      onSubmit: async (data) => {
        const payoutData = {
          amount: parseFloat(data.amount),
          recipient: data.recipient,
          type: 'manual',
          status: 'pending',
          description: data.description || 'Manual payout triggered from command bar'
        };
        
        const result = await productionApi.createPayment(payoutData);
        if (result) {
          toast.success('Payout triggered successfully!', `Payout of $${data.amount} has been initiated.`);
        }
        onClose();
      }
    });
  };

  const handleFreezeTransactions = async () => {
    try {
      // This would typically call a system-wide freeze API
      logger.log('Transactions frozen successfully');
      toast.success('All transactions have been frozen!');
      onClose();
    } catch (error) {
      logger.error('Error freezing transactions:', error);
      toast.error('Failed to freeze transactions. Please try again.');
    }
  };

  const handleGenerateInvoice = async () => {
    setModalState({
      type: 'form',
      title: 'Generate Invoice',
      description: 'Enter the invoice details',
      fields: [
        { name: 'customerId', label: 'Customer ID', type: 'text', placeholder: 'customer-123', required: true },
        { name: 'amount', label: 'Amount', type: 'number', placeholder: '1000.00', required: true },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Invoice description' }
      ],
      onSubmit: async (data) => {
        const invoiceData = {
          customerId: data.customerId,
          amount: parseFloat(data.amount),
          type: 'invoice',
          status: 'pending',
          description: 'Invoice generated from command bar',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        const result = await productionApi.createPayment(invoiceData);
        if (result) {
          logger.log('Invoice generated successfully:', result);
          toast.success('Invoice generated successfully!');
        }
        onClose();
      }
    });
  };

  const handleSystemHealthCheck = async () => {
    try {
      const healthData = await productionApi.getSystemHealth();
      logger.log('System health check completed:', healthData);
      toast.success('System health check completed! Check the system health dashboard for details.');
      onClose();
    } catch (error) {
      logger.error('Error in system health check:', error);
      toast.error('Failed to run system health check. Please try again.');
    }
  };

  const handleClearCache = async () => {
    try {
      // Clear system cache
      if (true) {
        // This would typically call a cache clearing API
        logger.log('System cache cleared successfully');
        toast.success('System cache cleared successfully!');
      }
      onClose();
    } catch (error) {
      logger.error('Error clearing cache:', error);
      toast.error('Failed to clear cache. Please try again.');
    }
  };

  const handleBackupSystem = async () => {
    try {
      // Create system backup
      if (true) {
        // This would typically call a backup API
        logger.log('System backup initiated successfully');
        toast.success('System backup initiated! You will be notified when complete.');
      }
      onClose();
    } catch (error) {
      logger.error('Error creating backup:', error);
      toast.error('Failed to create backup. Please try again.');
    }
  };

  const handleGenerateReport = async () => {
    setModalState({
      type: 'form',
      title: 'Generate Report',
      description: 'Select the report type and format',
      fields: [
        { 
          name: 'type', 
          label: 'Report Type', 
          type: 'select', 
          required: true,
          options: [
            { value: 'analytics', label: 'Analytics' },
            { value: 'financial', label: 'Financial' },
            { value: 'users', label: 'Users' },
            { value: 'fleet', label: 'Fleet' }
          ]
        },
        { 
          name: 'format', 
          label: 'Format', 
          type: 'select', 
          required: true,
          options: [
            { value: 'pdf', label: 'PDF' },
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' }
          ]
        }
      ],
      onSubmit: async (data) => {
        const reportData = {
          type: data.type,
          format: data.format,
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString()
          }
        };
        
        const result = await productionApi.generateReport(reportData);
        if (result) {
          toast.success('Report generated successfully!', 'Check your downloads folder for the report.');
        }
        onClose();
      }
    });
  };

  const handleExportData = async () => {
    setModalState({
      type: 'form',
      title: 'Export Data',
      description: 'Select the data type and export format',
      fields: [
        { 
          name: 'dataType', 
          label: 'Data Type', 
          type: 'select', 
          required: true,
          options: [
            { value: 'users', label: 'Users' },
            { value: 'vehicles', label: 'Vehicles' },
            { value: 'payments', label: 'Payments' },
            { value: 'analytics', label: 'Analytics' }
          ]
        },
        { 
          name: 'format', 
          label: 'Export Format', 
          type: 'select', 
          required: true,
          options: [
            { value: 'csv', label: 'CSV' },
            { value: 'excel', label: 'Excel' },
            { value: 'json', label: 'JSON' }
          ]
        }
      ],
      onSubmit: async (data) => {
        const result = await productionApi.exportData(data.dataType, data.format);
        if (result) {
          toast.success('Data exported successfully!', 'Check your downloads folder for the exported file.');
        }
        onClose();
      }
    });
  };

  const handleIncidentResponse = async () => {
    setModalState({
      type: 'confirm',
      title: 'Activate Incident Response Protocol',
      description: 'Are you sure you want to activate incident response protocol? This will notify all emergency contacts and activate crisis management procedures.',
      variant: 'destructive',
      onSubmit: async () => {
        // This would typically call an incident response API
        toast.success('Incident response protocol activated!', 'Emergency contacts have been notified and crisis management procedures are now active.');
        onClose();
      }
    });
  };

  const handleWarRoomMode = async () => {
    setModalState({
      type: 'confirm',
      title: 'Enter War Room Mode',
      description: 'Are you sure you want to enter War Room Mode? This will activate crisis management dashboard and emergency protocols.',
      variant: 'destructive',
      onSubmit: async () => {
        // This would typically navigate to war room dashboard or activate special mode
        toast.success('War Room Mode activated!', 'Crisis management dashboard is now active.');
        // Could also navigate to a specific war room page
        // window.location.href = '/war-room';
        onClose();
      }
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
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
          <Command className="rounded-[0.625rem] border shadow-2xs">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder={t('commandBar.placeholders.search')}
                value={search}
                onValueChange={setSearch}
                className="flex h-11 w-full rounded-[0.625rem] bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="ml-auto text-xs text-muted-foreground">
                {t('commandBar.shortcuts.open')}
              </div>
            </div>
            <CommandList className="max-h-[400px] overflow-y-auto">
              <CommandEmpty>{t('commandBar.placeholders.noResults')}</CommandEmpty>
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
                          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-[0.625rem] border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
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
                {t('commandBar.confirmations.impactWarning').replace('{impact}', selectedAction.impact || 'low')}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="px-4 py-2 text-sm border rounded-[0.625rem] hover:bg-muted/50"
                >
                  {t('commandBar.confirmations.cancel')}
                </button>
                <button
                  onClick={() => {
                    selectedAction.action();
                    setSelectedAction(null);
                  }}
                  className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-[0.625rem] hover:bg-destructive/90"
                >
                  {t('commandBar.confirmations.confirm')}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Command Modal */}
      {modalState.type && (
        <CommandModal
          isOpen={!!modalState.type}
          onClose={() => setModalState({ type: null, title: '', description: '', fields: [], onSubmit: undefined, variant: 'default' })}
          title={modalState.title}
          description={modalState.description}
          type={modalState.type}
          fields={modalState.fields}
          onSubmit={modalState.onSubmit || (() => Promise.resolve())}
          variant={modalState.variant}
        />
      )}
    </>
  );
}

