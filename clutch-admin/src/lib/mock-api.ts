import { generateId } from "./utils";

// Mock data types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastLogin: string;
  avatar?: string;
  permissions: string[];
}

export interface FleetVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  status: "active" | "maintenance" | "offline";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  odometer: number;
  fuelLevel: number;
  lastUpdate: string;
  driver?: {
    id: string;
    name: string;
  };
}

export interface KPIMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: "increase" | "decrease";
  format: "number" | "currency" | "percentage";
  icon: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: "text" | "image" | "file";
  isRead: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// Mock data generators
const generateUsers = (): User[] => {
  const roles = ["platform_admin", "enterprise_client", "service_provider", "business_analyst", "customer_support"];
  const statuses = ["active", "inactive", "pending"] as const;
  
  return Array.from({ length: 150 }, (_, i) => ({
    id: generateId(),
    email: `user${i + 1}@example.com`,
    name: `User ${i + 1}`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
    permissions: [],
  }));
};

const generateFleetVehicles = (): FleetVehicle[] => {
  const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "BMW", "Mercedes", "Audi"];
  const models = ["Camry", "Civic", "F-150", "Silverado", "Altima", "X3", "C-Class", "A4"];
  const statuses = ["active", "maintenance", "offline"] as const;
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: generateId(),
    make: makes[Math.floor(Math.random() * makes.length)],
    model: models[Math.floor(Math.random() * models.length)],
    year: 2020 + Math.floor(Math.random() * 4),
    vin: `VIN${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
    licensePlate: `${Math.random().toString(36).substr(2, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    location: {
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.0060 + (Math.random() - 0.5) * 0.1,
      address: `${Math.floor(Math.random() * 9999)} Main St, New York, NY`,
    },
    odometer: Math.floor(Math.random() * 100000),
    fuelLevel: Math.floor(Math.random() * 100),
    lastUpdate: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
    driver: Math.random() > 0.3 ? {
      id: generateId(),
      name: `Driver ${i + 1}`,
    } : undefined,
  }));
};

const generateKPIMetrics = (): KPIMetric[] => [
  {
    id: "total-users",
    title: "Total Users",
    value: 15420,
    change: 12.5,
    changeType: "increase",
    format: "number",
    icon: "Users",
  },
  {
    id: "active-fleet",
    title: "Active Fleet",
    value: 1247,
    change: 8.2,
    changeType: "increase",
    format: "number",
    icon: "Truck",
  },
  {
    id: "revenue",
    title: "Monthly Revenue",
    value: 2450000,
    change: 15.3,
    changeType: "increase",
    format: "currency",
    icon: "DollarSign",
  },
  {
    id: "api-requests",
    title: "API Requests",
    value: 12500000,
    change: 5.7,
    changeType: "increase",
    format: "number",
    icon: "Activity",
  },
  {
    id: "error-rate",
    title: "Error Rate",
    value: 0.8,
    change: -2.1,
    changeType: "decrease",
    format: "percentage",
    icon: "AlertTriangle",
  },
  {
    id: "uptime",
    title: "System Uptime",
    value: 99.9,
    change: 0.1,
    changeType: "increase",
    format: "percentage",
    icon: "CheckCircle",
  },
];

const generateChatMessages = (): ChatMessage[] => {
  const senders = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "David Brown"];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: generateId(),
    senderId: generateId(),
    senderName: senders[Math.floor(Math.random() * senders.length)],
    content: `This is a sample message ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    type: "text" as const,
    isRead: Math.random() > 0.3,
  }));
};

const generateNotifications = (): Notification[] => {
  const types = ["info", "warning", "error", "success"] as const;
  const titles = [
    "New user registered",
    "Fleet vehicle offline",
    "Payment processed",
    "System maintenance scheduled",
    "API rate limit exceeded",
    "New message received",
    "Contract expiring soon",
    "Backup completed",
  ];
  
  return Array.from({ length: 25 }, (_, i) => ({
    id: generateId(),
    title: titles[Math.floor(Math.random() * titles.length)],
    message: `This is a sample notification message ${i + 1}.`,
    type: types[Math.floor(Math.random() * types.length)],
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: Math.random() > 0.4,
    actionUrl: Math.random() > 0.5 ? `/dashboard` : undefined,
  }));
};

// Mock API store
class MockAPIStore {
  private users: User[] = generateUsers();
  private fleetVehicles: FleetVehicle[] = generateFleetVehicles();
  private kpiMetrics: KPIMetric[] = generateKPIMetrics();
  private chatMessages: ChatMessage[] = generateChatMessages();
  private notifications: Notification[] = generateNotifications();

  // Authentication
  login = async (email: string, password: string): Promise<{ success: boolean; data?: User; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple mock authentication - accept any email/password for demo
    if (email && password) {
      return {
        success: true,
        data: {
          token: "mock-jwt-token-" + generateId(),
          user: {
            id: generateId(),
            email,
            name: "Demo User",
            role: "platform_admin",
          }
        }
      };
    }
    
    return {
      success: false,
      error: "Invalid credentials"
    };
  };

  // Users API
  getUsers = async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.users];
  };

  getUserById = async (id: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.users.find(user => user.id === id) || null;
  };

  createUser = async (userData: Omit<User, "id" | "createdAt">): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  };

  updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  };

  deleteUser = async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  };

  // Fleet API
  getFleetVehicles = async (): Promise<FleetVehicle[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.fleetVehicles];
  };

  getFleetVehicleById = async (id: string): Promise<FleetVehicle | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.fleetVehicles.find(vehicle => vehicle.id === id) || null;
  };

  updateFleetVehicle = async (id: string, updates: Partial<FleetVehicle>): Promise<FleetVehicle | null> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const vehicleIndex = this.fleetVehicles.findIndex(vehicle => vehicle.id === id);
    if (vehicleIndex === -1) return null;
    
    this.fleetVehicles[vehicleIndex] = { ...this.fleetVehicles[vehicleIndex], ...updates };
    return this.fleetVehicles[vehicleIndex];
  };

  // Dashboard API
  getKPIMetrics = async (): Promise<KPIMetric[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.kpiMetrics];
  };

  // Chat API
  getChatMessages = async (): Promise<ChatMessage[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...this.chatMessages];
  };

  sendMessage = async (message: Omit<ChatMessage, "id" | "timestamp">): Promise<ChatMessage> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    this.chatMessages.push(newMessage);
    return newMessage;
  };

  // Notifications API
  getNotifications = async (): Promise<Notification[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.notifications];
  };

  markNotificationAsRead = async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return false;
    
    notification.isRead = true;
    return true;
  };

  // Real-time data simulation
  subscribeToFleetUpdates = (callback: (vehicles: FleetVehicle[]) => void) => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      this.fleetVehicles.forEach(vehicle => {
        if (Math.random() > 0.8) {
          vehicle.fuelLevel = Math.max(0, vehicle.fuelLevel + (Math.random() - 0.5) * 5);
          vehicle.odometer += Math.floor(Math.random() * 2);
          vehicle.lastUpdate = new Date().toISOString();
        }
      });
      callback([...this.fleetVehicles]);
    }, 5000);

    return () => clearInterval(interval);
  };

  subscribeToKPIMetrics = (callback: (metrics: KPIMetric[]) => void) => {
    const interval = setInterval(() => {
      // Simulate real-time KPI updates
      this.kpiMetrics.forEach(metric => {
        if (Math.random() > 0.7) {
          const change = (Math.random() - 0.5) * 0.1;
          metric.value = Math.max(0, metric.value * (1 + change));
          metric.change = (Math.random() - 0.5) * 5;
        }
      });
      callback([...this.kpiMetrics]);
    }, 10000);

    return () => clearInterval(interval);
  };
}

export const mockAPI = new MockAPIStore();
