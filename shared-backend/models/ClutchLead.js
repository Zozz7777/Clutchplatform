const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class ClutchLead {
  constructor(data) {
    this._id = data._id || new ObjectId();
    
    // Basic Lead Info
    this.title = data.title;
    this.type = data.type; // 'shop', 'repair_center', 'accessories_store', 'parts_importer', 'manufacturer', 'fleet_company', 'insurance_company', 'installment_company'
    this.companyName = data.companyName;
    this.businessType = data.businessType; // 'retail', 'wholesale', 'service', 'manufacturing', 'fleet', 'insurance', 'financing'
    
    // Contact Information
    this.contact = {
      name: data.contact?.name,
      email: data.contact?.email,
      phone: data.contact?.phone,
      position: data.contact?.position, // 'owner', 'manager', 'fleet_manager', 'operations_director'
      secondaryContacts: data.contact?.secondaryContacts || []
    };
    
    // Business Details
    this.businessDetails = {
      address: data.businessDetails?.address,
      city: data.businessDetails?.city,
      governorate: data.businessDetails?.governorate,
      businessLicense: data.businessDetails?.businessLicense,
      taxId: data.businessDetails?.taxId,
      yearsInBusiness: data.businessDetails?.yearsInBusiness,
      employeeCount: data.businessDetails?.employeeCount,
      monthlyRevenue: data.businessDetails?.monthlyRevenue
    };
    
    // Clutch-Specific Fields
    this.team = data.team; // 'partners' or 'b2b'
    this.pipeline = data.pipeline; // 'partners' or 'b2b_enterprise'
    this.status = data.status || 'new'; // 'new', 'contacted', 'qualified', 'proposal_sent', 'contract_sent', 'signed', 'onboarded', 'live', 'lost'
    this.priority = data.priority || 'medium'; // 'low', 'medium', 'high', 'urgent'
    
    // Partner-Specific Fields (for Partners Team)
    this.partnerProfile = {
      shopType: data.partnerProfile?.shopType, // 'accessories', 'repair_center', 'parts_shop', 'importer', 'manufacturer'
      servicesOffered: data.partnerProfile?.servicesOffered || [], // ['oil_change', 'brake_service', 'engine_repair', 'parts_sales']
      currentInventory: data.partnerProfile?.currentInventory || [],
      existingSystems: data.partnerProfile?.existingSystems || [], // ['manual', 'basic_software', 'advanced_erp']
      monthlyPartsVolume: data.partnerProfile?.monthlyPartsVolume,
      targetCustomers: data.partnerProfile?.targetCustomers || [] // ['individuals', 'fleet', 'other_shops']
    };
    
    // B2B-Specific Fields (for B2B Team)
    this.enterpriseProfile = {
      companySize: data.enterpriseProfile?.companySize, // 'small', 'medium', 'large', 'enterprise'
      fleetSize: data.enterpriseProfile?.fleetSize,
      currentFleetManagement: data.enterpriseProfile?.currentFleetManagement,
      painPoints: data.enterpriseProfile?.painPoints || [],
      budget: data.enterpriseProfile?.budget,
      decisionMakers: data.enterpriseProfile?.decisionMakers || [],
      timeline: data.enterpriseProfile?.timeline,
      requirements: data.enterpriseProfile?.requirements || []
    };
    
    // Assignment & Tracking
    this.assignedTo = data.assignedTo ? new ObjectId(data.assignedTo) : null; // References employees collection
    this.assignedTeam = data.assignedTeam; // 'partners' or 'b2b'
    this.source = data.source; // 'cold_outreach', 'referral', 'inbound', 'campaign', 'trade_show'
    
    // Activity Tracking
    this.activities = data.activities || [];
    this.notes = data.notes || [];
    this.attachments = data.attachments || [];
    
    // Contract & Onboarding
    this.contract = {
      status: data.contract?.status || 'not_started', // 'not_started', 'draft', 'sent', 'signed', 'approved', 'rejected'
      templateId: data.contract?.templateId,
      draftUrl: data.contract?.draftUrl,
      signedUrl: data.contract?.signedUrl,
      signedDate: data.contract?.signedDate,
      legalReview: data.contract?.legalReview || null
    };
    
    // Account Creation
    this.accounts = {
      partnersApp: {
        created: data.accounts?.partnersApp?.created || false,
        accountId: data.accounts?.partnersApp?.accountId,
        credentials: data.accounts?.partnersApp?.credentials || null,
        status: data.accounts?.partnersApp?.status || 'pending' // 'pending', 'active', 'suspended'
      },
      partsSystem: {
        created: data.accounts?.partsSystem?.created || false,
        accountId: data.accounts?.partsSystem?.accountId,
        credentials: data.accounts?.partsSystem?.credentials || null,
        status: data.accounts?.partsSystem?.status || 'pending'
      },
      enterpriseDashboard: {
        created: data.accounts?.enterpriseDashboard?.created || false,
        dashboardId: data.accounts?.enterpriseDashboard?.dashboardId,
        whiteLabelConfig: data.accounts?.enterpriseDashboard?.whiteLabelConfig || null,
        status: data.accounts?.enterpriseDashboard?.status || 'pending'
      }
    };
    
    // Timestamps
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastActivityAt = data.lastActivityAt || new Date();
  }

  // Static methods
  static async findById(id) {
    try {
      const collection = await getCollection('clutch_leads');
      const lead = await collection.findOne({ _id: new ObjectId(id) });
      return lead ? new ClutchLead(lead) : null;
    } catch (error) {
      console.error('Error finding Clutch lead by ID:', error);
      throw error;
    }
  }

  static async findByTeam(team, filters = {}) {
    try {
      const collection = await getCollection('clutch_leads');
      const query = { team, ...filters };
      const leads = await collection.find(query).sort({ createdAt: -1 }).toArray();
      return leads.map(lead => new ClutchLead(lead));
    } catch (error) {
      console.error('Error finding Clutch leads by team:', error);
      throw error;
    }
  }

  static async findByStatus(status, team = null) {
    try {
      const collection = await getCollection('clutch_leads');
      const query = { status };
      if (team) query.team = team;
      const leads = await collection.find(query).sort({ createdAt: -1 }).toArray();
      return leads.map(lead => new ClutchLead(lead));
    } catch (error) {
      console.error('Error finding Clutch leads by status:', error);
      throw error;
    }
  }

  static async getPipelineData(team) {
    try {
      const collection = await getCollection('clutch_leads');
      const pipeline = await collection.aggregate([
        { $match: { team } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' || 0 }
        }},
        { $sort: { _id: 1 } }
      ]).toArray();
      return pipeline;
    } catch (error) {
      console.error('Error getting pipeline data:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const collection = await getCollection('clutch_leads');
      this.updatedAt = new Date();
      
      if (this._id) {
        await collection.updateOne(
          { _id: this._id },
          { $set: this }
        );
      } else {
        const result = await collection.insertOne(this);
        this._id = result.insertedId;
      }
      return this;
    } catch (error) {
      console.error('Error saving Clutch lead:', error);
      throw error;
    }
  }

  async addActivity(employeeId, type, description, metadata = {}) {
    try {
      const activity = {
        id: new ObjectId(),
        employeeId: new ObjectId(employeeId),
        type, // 'call', 'visit', 'email', 'meeting', 'proposal_sent', 'contract_sent'
        description,
        metadata,
        createdAt: new Date()
      };
      
      this.activities.push(activity);
      this.lastActivityAt = new Date();
      await this.save();
      return activity;
    } catch (error) {
      console.error('Error adding activity to Clutch lead:', error);
      throw error;
    }
  }

  async addNote(employeeId, text, isInternal = false) {
    try {
      const note = {
        id: new ObjectId(),
        employeeId: new ObjectId(employeeId),
        text,
        isInternal,
        createdAt: new Date()
      };
      
      this.notes.push(note);
      await this.save();
      return note;
    } catch (error) {
      console.error('Error adding note to Clutch lead:', error);
      throw error;
    }
  }

  async updateStatus(newStatus, employeeId, reason = null) {
    try {
      const oldStatus = this.status;
      this.status = newStatus;
      this.updatedAt = new Date();
      
      // Add status change activity
      await this.addActivity(employeeId, 'status_change', 
        `Status changed from ${oldStatus} to ${newStatus}`, 
        { oldStatus, newStatus, reason }
      );
      
      await this.save();
      return this;
    } catch (error) {
      console.error('Error updating Clutch lead status:', error);
      throw error;
    }
  }

  async assignTo(employeeId, assignedBy) {
    try {
      this.assignedTo = new ObjectId(employeeId);
      this.updatedAt = new Date();
      
      await this.addActivity(assignedBy, 'assignment', 
        `Lead assigned to employee`, 
        { assignedTo: employeeId }
      );
      
      await this.save();
      return this;
    } catch (error) {
      console.error('Error assigning Clutch lead:', error);
      throw error;
    }
  }

  async createContract(templateId, employeeId) {
    try {
      this.contract = {
        status: 'draft',
        templateId,
        draftUrl: null,
        signedUrl: null,
        signedDate: null,
        legalReview: null
      };
      
      await this.addActivity(employeeId, 'contract_created', 
        `Contract draft created using template ${templateId}`);
      
      await this.save();
      return this.contract;
    } catch (error) {
      console.error('Error creating contract for Clutch lead:', error);
      throw error;
    }
  }

  async uploadSignedContract(signedUrl, employeeId) {
    try {
      this.contract.signedUrl = signedUrl;
      this.contract.signedDate = new Date();
      this.contract.status = 'signed';
      this.status = 'signed';
      
      await this.addActivity(employeeId, 'contract_signed', 
        `Signed contract uploaded`);
      
      await this.save();
      return this.contract;
    } catch (error) {
      console.error('Error uploading signed contract:', error);
      throw error;
    }
  }

  async approveContract(legalReviewerId, approved, reason = null) {
    try {
      this.contract.legalReview = {
        reviewerId: new ObjectId(legalReviewerId),
        approved,
        reason,
        reviewedAt: new Date()
      };
      
      this.contract.status = approved ? 'approved' : 'rejected';
      
      if (approved) {
        this.status = 'approved';
        // Trigger account creation process
        await this.triggerAccountCreation();
      }
      
      await this.save();
      return this.contract;
    } catch (error) {
      console.error('Error approving contract:', error);
      throw error;
    }
  }

  async triggerAccountCreation() {
    try {
      // This would integrate with Clutch Partners App and Parts System APIs
      // For now, we'll mark the accounts as ready for creation
      
      if (this.team === 'partners') {
        this.accounts.partnersApp.status = 'ready_for_creation';
        this.accounts.partsSystem.status = 'ready_for_creation';
      } else if (this.team === 'b2b') {
        this.accounts.enterpriseDashboard.status = 'ready_for_creation';
      }
      
      await this.save();
      return this.accounts;
    } catch (error) {
      console.error('Error triggering account creation:', error);
      throw error;
    }
  }
}

module.exports = ClutchLead;
