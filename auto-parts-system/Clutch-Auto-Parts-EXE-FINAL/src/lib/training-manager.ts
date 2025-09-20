import { logger } from './logger';
import { DatabaseManager } from './database';

export interface TrainingStep {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  type: 'info' | 'interactive' | 'demo' | 'quiz';
  module: 'inventory' | 'sales' | 'customers' | 'suppliers' | 'reports' | 'settings' | 'ai' | 'marketplace' | 'branches';
  order: number;
  is_required: boolean;
  estimated_time_minutes: number;
  prerequisites: string[];
  content: {
    text?: string;
    text_ar?: string;
    video_url?: string;
    interactive_elements?: any[];
    quiz_questions?: QuizQuestion[];
  };
  completion_criteria: {
    type: 'manual' | 'automatic' | 'quiz_pass';
    threshold?: number;
    actions?: string[];
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  question_ar: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: Array<{
    id: string;
    text: string;
    text_ar: string;
    is_correct: boolean;
  }>;
  correct_answer?: string;
  explanation: string;
  explanation_ar: string;
}

export interface TrainingProgress {
  user_id: number;
  step_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  time_spent_minutes: number;
  attempts: number;
  quiz_score?: number;
  notes?: string;
}

export interface TrainingModule {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  icon: string;
  color: string;
  order: number;
  is_required: boolean;
  estimated_time_minutes: number;
  steps: TrainingStep[];
  completion_percentage: number;
}

export interface TrainingSession {
  id: string;
  user_id: number;
  module_id: string;
  started_at: string;
  last_activity: string;
  current_step_id?: string;
  completed_steps: string[];
  total_time_minutes: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
}

export class TrainingManager {
  private db: DatabaseManager;

  constructor() {
    this.db = new DatabaseManager();
  }

  async initialize(): Promise<void> {
    logger.info('Training Manager initialized');
    await this.createTrainingTables();
    await this.createDefaultTrainingContent();
  }

  /**
   * Create tables for training functionality
   */
  private async createTrainingTables(): Promise<void> {
    const tables = [
      // Training steps
      `CREATE TABLE IF NOT EXISTS training_steps (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        title_ar TEXT NOT NULL,
        description TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        type TEXT NOT NULL,
        module TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        is_required BOOLEAN DEFAULT 1,
        estimated_time_minutes INTEGER DEFAULT 5,
        prerequisites TEXT,
        content TEXT NOT NULL,
        completion_criteria TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Training progress
      `CREATE TABLE IF NOT EXISTS training_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        step_id TEXT NOT NULL,
        status TEXT DEFAULT 'not_started',
        started_at DATETIME,
        completed_at DATETIME,
        time_spent_minutes INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        quiz_score REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, step_id)
      )`,

      // Training sessions
      `CREATE TABLE IF NOT EXISTS training_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        module_id TEXT NOT NULL,
        started_at DATETIME NOT NULL,
        last_activity DATETIME NOT NULL,
        current_step_id TEXT,
        completed_steps TEXT,
        total_time_minutes INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Training achievements
      `CREATE TABLE IF NOT EXISTS training_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_type TEXT NOT NULL,
        achievement_name TEXT NOT NULL,
        achievement_name_ar TEXT NOT NULL,
        description TEXT NOT NULL,
        description_ar TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];

    for (const table of tables) {
      try {
        await this.db.exec(table);
      } catch (error) {
        logger.error('Error creating training table:', error);
        throw error;
      }
    }

    logger.info('Training tables created successfully');
  }

  /**
   * Create default training content
   */
  private async createDefaultTrainingContent(): Promise<void> {
    try {
      // Check if training content already exists
      const existingSteps = await this.db.query('SELECT COUNT(*) as count FROM training_steps');
      if (existingSteps[0]?.count > 0) {
        return; // Content already exists
      }

      const defaultSteps: TrainingStep[] = [
        // Welcome & Overview
        {
          id: 'welcome_overview',
          title: 'Welcome to Clutch Auto Parts System',
          title_ar: 'أهلاً بك في نظام كلتش لقطع غيار السيارات',
          description: 'Get started with your new auto parts management system',
          description_ar: 'ابدأ مع نظام إدارة قطع غيار السيارات الجديد',
          type: 'info',
          module: 'inventory',
          order: 1,
          is_required: true,
          estimated_time_minutes: 3,
          prerequisites: [],
          content: {
            text: 'Welcome to the Clutch Auto Parts System! This comprehensive training will guide you through all the features and help you become proficient in managing your auto parts business.',
            text_ar: 'أهلاً بك في نظام كلتش لقطع غيار السيارات! سيرشدك هذا التدريب الشامل عبر جميع الميزات ويساعدك على إتقان إدارة أعمال قطع غيار السيارات.',
            video_url: 'https://example.com/welcome-video'
          },
          completion_criteria: {
            type: 'manual',
            actions: ['acknowledge_welcome']
          }
        },

        // Inventory Management
        {
          id: 'inventory_basics',
          title: 'Inventory Management Basics',
          title_ar: 'أساسيات إدارة المخزون',
          description: 'Learn how to manage your product inventory',
          description_ar: 'تعلم كيفية إدارة مخزون المنتجات',
          type: 'interactive',
          module: 'inventory',
          order: 2,
          is_required: true,
          estimated_time_minutes: 10,
          prerequisites: ['welcome_overview'],
          content: {
            text: 'Inventory management is the core of your business. Learn how to add products, track stock levels, and manage categories.',
            text_ar: 'إدارة المخزون هي جوهر عملك. تعلم كيفية إضافة المنتجات وتتبع مستويات المخزون وإدارة الفئات.',
            interactive_elements: [
              { type: 'button', text: 'Add Product', action: 'navigate_to_add_product' },
              { type: 'button', text: 'View Inventory', action: 'navigate_to_inventory' }
            ]
          },
          completion_criteria: {
            type: 'automatic',
            actions: ['add_product', 'view_inventory']
          }
        },

        // Sales (POS) System
        {
          id: 'pos_system',
          title: 'Point of Sale (POS) System',
          title_ar: 'نظام نقاط البيع',
          description: 'Master the POS system for efficient sales',
          description_ar: 'أتقن نظام نقاط البيع للمبيعات الفعالة',
          type: 'demo',
          module: 'sales',
          order: 3,
          is_required: true,
          estimated_time_minutes: 15,
          prerequisites: ['inventory_basics'],
          content: {
            text: 'The POS system allows you to process sales quickly and efficiently. Learn about payment methods, discounts, and receipts.',
            text_ar: 'يسمح نظام نقاط البيع بمعالجة المبيعات بسرعة وفعالية. تعلم عن طرق الدفع والخصومات والإيصالات.',
            video_url: 'https://example.com/pos-demo'
          },
          completion_criteria: {
            type: 'automatic',
            actions: ['process_sale', 'apply_discount']
          }
        },

        // Customer Management
        {
          id: 'customer_management',
          title: 'Customer Management',
          title_ar: 'إدارة العملاء',
          description: 'Learn to manage customer relationships and loyalty',
          description_ar: 'تعلم إدارة علاقات العملاء والولاء',
          type: 'interactive',
          module: 'customers',
          order: 4,
          is_required: false,
          estimated_time_minutes: 8,
          prerequisites: ['pos_system'],
          content: {
            text: 'Build strong customer relationships with our customer management features. Track purchase history, manage loyalty programs, and handle credit accounts.',
            text_ar: 'ابني علاقات عملاء قوية مع ميزات إدارة العملاء. تتبع تاريخ المشتريات وإدارة برامج الولاء والتعامل مع حسابات الائتمان.',
            interactive_elements: [
              { type: 'button', text: 'Add Customer', action: 'navigate_to_add_customer' },
              { type: 'button', text: 'View Customers', action: 'navigate_to_customers' }
            ]
          },
          completion_criteria: {
            type: 'automatic',
            actions: ['add_customer', 'view_customer_history']
          }
        },

        // Reports and Analytics
        {
          id: 'reports_analytics',
          title: 'Reports and Analytics',
          title_ar: 'التقارير والتحليلات',
          description: 'Understand your business with comprehensive reports',
          description_ar: 'افهم عملك مع التقارير الشاملة',
          type: 'info',
          module: 'reports',
          order: 5,
          is_required: false,
          estimated_time_minutes: 12,
          prerequisites: ['customer_management'],
          content: {
            text: 'Generate detailed reports to understand your business performance. Learn about sales reports, inventory reports, and financial analytics.',
            text_ar: 'أنشئ تقارير مفصلة لفهم أداء عملك. تعلم عن تقارير المبيعات وتقارير المخزون والتحليلات المالية.',
            video_url: 'https://example.com/reports-overview'
          },
          completion_criteria: {
            type: 'manual',
            actions: ['generate_report']
          }
        },

        // AI-Powered Insights
        {
          id: 'ai_insights',
          title: 'AI-Powered Business Insights',
          title_ar: 'رؤى الأعمال بالذكاء الاصطناعي',
          description: 'Leverage AI for business optimization',
          description_ar: 'استفد من الذكاء الاصطناعي لتحسين الأعمال',
          type: 'demo',
          module: 'ai',
          order: 6,
          is_required: false,
          estimated_time_minutes: 10,
          prerequisites: ['reports_analytics'],
          content: {
            text: 'Discover how AI can help optimize your business with demand forecasting, pricing optimization, and inventory recommendations.',
            text_ar: 'اكتشف كيف يمكن للذكاء الاصطناعي المساعدة في تحسين عملك مع توقع الطلب وتحسين الأسعار وتوصيات المخزون.',
            video_url: 'https://example.com/ai-insights-demo'
          },
          completion_criteria: {
            type: 'automatic',
            actions: ['view_ai_insights', 'generate_forecast']
          }
        },

        // Multi-Branch Management
        {
          id: 'multi_branch',
          title: 'Multi-Branch Management',
          title_ar: 'إدارة الفروع المتعددة',
          description: 'Manage multiple business locations',
          description_ar: 'إدارة مواقع الأعمال المتعددة',
          type: 'interactive',
          module: 'branches',
          order: 7,
          is_required: false,
          estimated_time_minutes: 8,
          prerequisites: ['ai_insights'],
          content: {
            text: 'If you have multiple locations, learn how to manage inventory transfers, branch performance, and centralized reporting.',
            text_ar: 'إذا كان لديك مواقع متعددة، تعلم كيفية إدارة تحويلات المخزون وأداء الفروع والتقارير المركزية.',
            interactive_elements: [
              { type: 'button', text: 'View Branches', action: 'navigate_to_branches' },
              { type: 'button', text: 'Create Transfer', action: 'navigate_to_transfer' }
            ]
          },
          completion_criteria: {
            type: 'automatic',
            actions: ['view_branches', 'create_transfer']
          }
        },

        // System Settings
        {
          id: 'system_settings',
          title: 'System Settings and Configuration',
          title_ar: 'إعدادات النظام والتكوين',
          description: 'Configure your system preferences',
          description_ar: 'قم بتكوين تفضيلات النظام',
          type: 'info',
          module: 'settings',
          order: 8,
          is_required: false,
          estimated_time_minutes: 6,
          prerequisites: ['multi_branch'],
          content: {
            text: 'Customize your system settings, manage users, configure backups, and set up integrations.',
            text_ar: 'خصص إعدادات النظام وإدارة المستخدمين وتكوين النسخ الاحتياطية وإعداد التكاملات.',
            video_url: 'https://example.com/settings-overview'
          },
          completion_criteria: {
            type: 'manual',
            actions: ['access_settings']
          }
        },

        // Final Quiz
        {
          id: 'final_quiz',
          title: 'Knowledge Check Quiz',
          title_ar: 'اختبار التحقق من المعرفة',
          description: 'Test your understanding of the system',
          description_ar: 'اختبر فهمك للنظام',
          type: 'quiz',
          module: 'inventory',
          order: 9,
          is_required: true,
          estimated_time_minutes: 10,
          prerequisites: ['system_settings'],
          content: {
            text: 'Complete this quiz to verify your understanding of the Clutch Auto Parts System.',
            text_ar: 'أكمل هذا الاختبار للتحقق من فهمك لنظام كلتش لقطع غيار السيارات.',
            quiz_questions: [
              {
                id: 'q1',
                question: 'What is the main purpose of the inventory management module?',
                question_ar: 'ما هو الغرض الرئيسي من وحدة إدارة المخزون؟',
                type: 'multiple_choice',
                options: [
                  { id: 'a', text: 'To process sales', text_ar: 'لمعالجة المبيعات', is_correct: false },
                  { id: 'b', text: 'To manage products and stock', text_ar: 'لإدارة المنتجات والمخزون', is_correct: true },
                  { id: 'c', text: 'To handle customer data', text_ar: 'للتعامل مع بيانات العملاء', is_correct: false }
                ],
                explanation: 'The inventory module is specifically designed to manage products, track stock levels, and handle inventory operations.',
                explanation_ar: 'وحدة المخزون مصممة خصيصاً لإدارة المنتجات وتتبع مستويات المخزون والتعامل مع عمليات المخزون.'
              },
              {
                id: 'q2',
                question: 'Which payment methods are supported in the POS system?',
                question_ar: 'ما هي طرق الدفع المدعومة في نظام نقاط البيع؟',
                type: 'multiple_choice',
                options: [
                  { id: 'a', text: 'Cash only', text_ar: 'نقداً فقط', is_correct: false },
                  { id: 'b', text: 'Cash, Visa, InstaPay, and Wallets', text_ar: 'نقداً، فيزا، إنستاباي، والمحافظ', is_correct: true },
                  { id: 'c', text: 'Credit cards only', text_ar: 'بطاقات الائتمان فقط', is_correct: false }
                ],
                explanation: 'The POS system supports multiple payment methods including cash, Visa, InstaPay, and digital wallets.',
                explanation_ar: 'يدعم نظام نقاط البيع طرق دفع متعددة تشمل النقد والفيزا وإنستاباي والمحافظ الرقمية.'
              }
            ]
          },
          completion_criteria: {
            type: 'quiz_pass',
            threshold: 70
          }
        }
      ];

      // Insert training steps
      for (const step of defaultSteps) {
        await this.db.exec(
          `INSERT INTO training_steps (id, title, title_ar, description, description_ar, type, module, order_index, is_required, estimated_time_minutes, prerequisites, content, completion_criteria)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            step.id, step.title, step.title_ar, step.description, step.description_ar,
            step.type, step.module, step.order, step.is_required, step.estimated_time_minutes,
            JSON.stringify(step.prerequisites), JSON.stringify(step.content), JSON.stringify(step.completion_criteria)
          ]
        );
      }

      logger.info('Default training content created successfully');

    } catch (error) {
      logger.error('Failed to create default training content:', error);
      throw error;
    }
  }

  /**
   * Get all training modules with progress
   */
  async getTrainingModules(userId: number): Promise<TrainingModule[]> {
    try {
      const steps = await this.db.query(`
        SELECT * FROM training_steps 
        ORDER BY order_index ASC
      `);

      // Group steps by module
      const modulesMap = new Map<string, TrainingModule>();
      
      for (const step of steps) {
        const moduleId = step.module;
        
        if (!modulesMap.has(moduleId)) {
          modulesMap.set(moduleId, {
            id: moduleId,
            name: this.getModuleName(moduleId),
            name_ar: this.getModuleNameAr(moduleId),
            description: this.getModuleDescription(moduleId),
            description_ar: this.getModuleDescriptionAr(moduleId),
            icon: this.getModuleIcon(moduleId),
            color: this.getModuleColor(moduleId),
            order: this.getModuleOrder(moduleId),
            is_required: moduleId === 'inventory' || moduleId === 'sales',
            estimated_time_minutes: 0,
            steps: [],
            completion_percentage: 0
          });
        }

        const module = modulesMap.get(moduleId)!;
        module.steps.push({
          id: step.id,
          title: step.title,
          title_ar: step.title_ar,
          description: step.description,
          description_ar: step.description_ar,
          type: step.type,
          module: step.module,
          order: step.order_index,
          is_required: step.is_required,
          estimated_time_minutes: step.estimated_time_minutes,
          prerequisites: JSON.parse(step.prerequisites || '[]'),
          content: JSON.parse(step.content),
          completion_criteria: JSON.parse(step.completion_criteria)
        });

        module.estimated_time_minutes += step.estimated_time_minutes;
      }

      // Calculate completion percentage for each module
      for (const module of modulesMap.values()) {
        const progress = await this.getModuleProgress(userId, module.id);
        module.completion_percentage = progress;
      }

      return Array.from(modulesMap.values()).sort((a, b) => a.order - b.order);

    } catch (error) {
      logger.error('Failed to get training modules:', error);
      throw error;
    }
  }

  /**
   * Get training progress for a user
   */
  async getTrainingProgress(userId: number): Promise<TrainingProgress[]> {
    try {
      const progress = await this.db.query(`
        SELECT * FROM training_progress 
        WHERE user_id = ? 
        ORDER BY updated_at DESC
      `, [userId]);

      return progress.map((p: any) => ({
        user_id: p.user_id,
        step_id: p.step_id,
        status: p.status,
        started_at: p.started_at,
        completed_at: p.completed_at,
        time_spent_minutes: p.time_spent_minutes,
        attempts: p.attempts,
        quiz_score: p.quiz_score,
        notes: p.notes
      }));

    } catch (error) {
      logger.error('Failed to get training progress:', error);
      throw error;
    }
  }

  /**
   * Start a training session
   */
  async startTrainingSession(userId: number, moduleId: string): Promise<TrainingSession> {
    try {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await this.db.exec(
        `INSERT INTO training_sessions (id, user_id, module_id, started_at, last_activity, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [sessionId, userId, moduleId, now, now, 'active']
      );

      const session: TrainingSession = {
        id: sessionId,
        user_id: userId,
        module_id: moduleId,
        started_at: now,
        last_activity: now,
        completed_steps: [],
        total_time_minutes: 0,
        status: 'active'
      };

      logger.info(`Training session started: ${sessionId} for user ${userId}`);
      return session;

    } catch (error) {
      logger.error('Failed to start training session:', error);
      throw error;
    }
  }

  /**
   * Update training progress
   */
  async updateTrainingProgress(
    userId: number,
    stepId: string,
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped',
    timeSpentMinutes: number = 0,
    quizScore?: number,
    notes?: string
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      
      // Check if progress record exists
      const existing = await this.db.get(
        'SELECT * FROM training_progress WHERE user_id = ? AND step_id = ?',
        [userId, stepId]
      );

      if (existing) {
        // Update existing progress
        await this.db.exec(
          `UPDATE training_progress 
           SET status = ?, completed_at = ?, time_spent_minutes = ?, attempts = attempts + 1, quiz_score = ?, notes = ?, updated_at = ?
           WHERE user_id = ? AND step_id = ?`,
          [status, status === 'completed' ? now : existing.completed_at, timeSpentMinutes, quizScore, notes, now, userId, stepId]
        );
      } else {
        // Create new progress record
        await this.db.exec(
          `INSERT INTO training_progress (user_id, step_id, status, started_at, completed_at, time_spent_minutes, attempts, quiz_score, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, stepId, status, status !== 'not_started' ? now : null, status === 'completed' ? now : null, timeSpentMinutes, 1, quizScore, notes]
        );
      }

      logger.info(`Training progress updated: ${stepId} for user ${userId} - ${status}`);

    } catch (error) {
      logger.error('Failed to update training progress:', error);
      throw error;
    }
  }

  /**
   * Get training achievements
   */
  async getTrainingAchievements(userId: number): Promise<any[]> {
    try {
      const achievements = await this.db.query(`
        SELECT * FROM training_achievements 
        WHERE user_id = ? 
        ORDER BY earned_at DESC
      `, [userId]);

      return achievements;

    } catch (error) {
      logger.error('Failed to get training achievements:', error);
      throw error;
    }
  }

  /**
   * Award training achievement
   */
  async awardAchievement(
    userId: number,
    achievementType: string,
    achievementName: string,
    achievementNameAr: string,
    description: string,
    descriptionAr: string
  ): Promise<void> {
    try {
      await this.db.exec(
        `INSERT INTO training_achievements (user_id, achievement_type, achievement_name, achievement_name_ar, description, description_ar)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, achievementType, achievementName, achievementNameAr, description, descriptionAr]
      );

      logger.info(`Achievement awarded: ${achievementName} to user ${userId}`);

    } catch (error) {
      logger.error('Failed to award achievement:', error);
      throw error;
    }
  }

  // Helper methods
  private async getModuleProgress(userId: number, moduleId: string): Promise<number> {
    try {
      const moduleSteps = await this.db.query(`
        SELECT id FROM training_steps WHERE module = ?
      `, [moduleId]);

      if (moduleSteps.length === 0) return 0;

      const completedSteps = await this.db.query(`
        SELECT COUNT(*) as count FROM training_progress 
        WHERE user_id = ? AND step_id IN (${moduleSteps.map(() => '?').join(',')}) AND status = 'completed'
      `, [userId, ...moduleSteps.map((s: any) => s.id)]);

      return Math.round((completedSteps[0]?.count || 0) / moduleSteps.length * 100);

    } catch (error) {
      logger.error('Failed to get module progress:', error);
      return 0;
    }
  }

  private getModuleName(moduleId: string): string {
    const names: { [key: string]: string } = {
      'inventory': 'Inventory Management',
      'sales': 'Sales & POS',
      'customers': 'Customer Management',
      'suppliers': 'Supplier Management',
      'reports': 'Reports & Analytics',
      'settings': 'System Settings',
      'ai': 'AI Insights',
      'marketplace': 'Marketplace',
      'branches': 'Multi-Branch'
    };
    return names[moduleId] || moduleId;
  }

  private getModuleNameAr(moduleId: string): string {
    const names: { [key: string]: string } = {
      'inventory': 'إدارة المخزون',
      'sales': 'المبيعات ونقاط البيع',
      'customers': 'إدارة العملاء',
      'suppliers': 'إدارة الموردين',
      'reports': 'التقارير والتحليلات',
      'settings': 'إعدادات النظام',
      'ai': 'رؤى الذكاء الاصطناعي',
      'marketplace': 'السوق',
      'branches': 'الفروع المتعددة'
    };
    return names[moduleId] || moduleId;
  }

  private getModuleDescription(moduleId: string): string {
    const descriptions: { [key: string]: string } = {
      'inventory': 'Manage your product inventory and stock levels',
      'sales': 'Process sales and manage point of sale operations',
      'customers': 'Build and maintain customer relationships',
      'suppliers': 'Manage supplier relationships and purchase orders',
      'reports': 'Generate reports and analyze business performance',
      'settings': 'Configure system settings and preferences',
      'ai': 'Leverage AI for business insights and optimization',
      'marketplace': 'Connect to online marketplaces',
      'branches': 'Manage multiple business locations'
    };
    return descriptions[moduleId] || '';
  }

  private getModuleDescriptionAr(moduleId: string): string {
    const descriptions: { [key: string]: string } = {
      'inventory': 'إدارة مخزون المنتجات ومستويات المخزون',
      'sales': 'معالجة المبيعات وإدارة عمليات نقاط البيع',
      'customers': 'بناء والحفاظ على علاقات العملاء',
      'suppliers': 'إدارة علاقات الموردين وأوامر الشراء',
      'reports': 'إنشاء التقارير وتحليل أداء الأعمال',
      'settings': 'تكوين إعدادات النظام والتفضيلات',
      'ai': 'الاستفادة من الذكاء الاصطناعي لرؤى الأعمال والتحسين',
      'marketplace': 'الاتصال بالأسواق الإلكترونية',
      'branches': 'إدارة مواقع الأعمال المتعددة'
    };
    return descriptions[moduleId] || '';
  }

  private getModuleIcon(moduleId: string): string {
    const icons: { [key: string]: string } = {
      'inventory': '📦',
      'sales': '💰',
      'customers': '👥',
      'suppliers': '🏭',
      'reports': '📊',
      'settings': '⚙️',
      'ai': '🤖',
      'marketplace': '🛒',
      'branches': '🏢'
    };
    return icons[moduleId] || '📚';
  }

  private getModuleColor(moduleId: string): string {
    const colors: { [key: string]: string } = {
      'inventory': '#3B82F6',
      'sales': '#10B981',
      'customers': '#F59E0B',
      'suppliers': '#8B5CF6',
      'reports': '#EF4444',
      'settings': '#6B7280',
      'ai': '#EC4899',
      'marketplace': '#06B6D4',
      'branches': '#84CC16'
    };
    return colors[moduleId] || '#6B7280';
  }

  private getModuleOrder(moduleId: string): number {
    const orders: { [key: string]: number } = {
      'inventory': 1,
      'sales': 2,
      'customers': 3,
      'suppliers': 4,
      'reports': 5,
      'ai': 6,
      'marketplace': 7,
      'branches': 8,
      'settings': 9
    };
    return orders[moduleId] || 10;
  }
}
