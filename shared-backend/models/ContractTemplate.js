const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class ContractTemplate {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.name = data.name;
    this.description = data.description;
    this.type = data.type; // 'partners', 'b2b_enterprise', 'fleet', 'insurance'
    this.category = data.category; // 'shop', 'repair_center', 'importer', 'fleet_company', 'insurance_company'
    
    // Template Content
    this.template = {
      html: data.template?.html,
      pdfTemplate: data.template?.pdfTemplate,
      variables: data.template?.variables || [], // Fields that need to be filled
      sections: data.template?.sections || []
    };
    
    // Contract Terms
    this.terms = {
      duration: data.terms?.duration, // '12_months', '24_months', 'indefinite'
      commission: data.terms?.commission, // Percentage or fixed amount
      minimumCommitment: data.terms?.minimumCommitment,
      paymentTerms: data.terms?.paymentTerms,
      terminationClause: data.terms?.terminationClause,
      exclusivity: data.terms?.exclusivity, // 'exclusive', 'non_exclusive', 'semi_exclusive'
      territory: data.terms?.territory
    };
    
    // Legal & Compliance
    this.legal = {
      requiredDocuments: data.legal?.requiredDocuments || [],
      complianceRequirements: data.legal?.complianceRequirements || [],
      riskLevel: data.legal?.riskLevel || 'medium', // 'low', 'medium', 'high'
      requiresLegalReview: data.legal?.requiresLegalReview || true
    };
    
    // Status & Versioning
    this.status = data.status || 'active'; // 'draft', 'active', 'deprecated', 'archived'
    this.version = data.version || '1.0';
    this.effectiveDate = data.effectiveDate || new Date();
    this.expiryDate = data.expiryDate;
    
    // Metadata
    this.createdBy = data.createdBy ? new ObjectId(data.createdBy) : null;
    this.approvedBy = data.approvedBy ? new ObjectId(data.approvedBy) : null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Static methods
  static async findById(id) {
    try {
      const collection = await getCollection('contract_templates');
      const template = await collection.findOne({ _id: new ObjectId(id) });
      return template ? new ContractTemplate(template) : null;
    } catch (error) {
      console.error('Error finding contract template by ID:', error);
      throw error;
    }
  }

  static async findByType(type, category = null) {
    try {
      const collection = await getCollection('contract_templates');
      const query = { type, status: 'active' };
      if (category) query.category = category;
      
      const templates = await collection.find(query).sort({ createdAt: -1 }).toArray();
      return templates.map(template => new ContractTemplate(template));
    } catch (error) {
      console.error('Error finding contract templates by type:', error);
      throw error;
    }
  }

  static async getActiveTemplates() {
    try {
      const collection = await getCollection('contract_templates');
      const templates = await collection.find({ status: 'active' }).sort({ type: 1, category: 1 }).toArray();
      return templates.map(template => new ContractTemplate(template));
    } catch (error) {
      console.error('Error getting active contract templates:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const collection = await getCollection('contract_templates');
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
      console.error('Error saving contract template:', error);
      throw error;
    }
  }

  async generateContract(leadData, employeeId) {
    try {
      // This would integrate with a PDF generation service
      // For now, we'll create a contract record
      
      const contractData = {
        templateId: this._id,
        leadId: leadData._id,
        type: this.type,
        category: this.category,
        status: 'draft',
        generatedBy: new ObjectId(employeeId),
        generatedAt: new Date(),
        content: {
          variables: this.extractVariables(leadData),
          terms: this.terms,
          legal: this.legal
        }
      };
      
      return contractData;
    } catch (error) {
      console.error('Error generating contract:', error);
      throw error;
    }
  }

  extractVariables(leadData) {
    const variables = {};
    
    // Basic company info
    variables.companyName = leadData.companyName;
    variables.contactName = leadData.contact.name;
    variables.contactEmail = leadData.contact.email;
    variables.contactPhone = leadData.contact.phone;
    variables.businessAddress = leadData.businessDetails.address;
    variables.city = leadData.businessDetails.city;
    variables.governorate = leadData.businessDetails.governorate;
    
    // Business details
    variables.businessType = leadData.businessType;
    variables.businessLicense = leadData.businessDetails.businessLicense;
    variables.taxId = leadData.businessDetails.taxId;
    
    // Contract terms
    variables.contractDuration = this.terms.duration;
    variables.commissionRate = this.terms.commission;
    variables.territory = this.terms.territory;
    variables.effectiveDate = new Date().toLocaleDateString();
    
    // Partner-specific variables
    if (leadData.team === 'partners') {
      variables.shopType = leadData.partnerProfile.shopType;
      variables.servicesOffered = leadData.partnerProfile.servicesOffered.join(', ');
      variables.monthlyVolume = leadData.partnerProfile.monthlyPartsVolume;
    }
    
    // B2B-specific variables
    if (leadData.team === 'b2b') {
      variables.companySize = leadData.enterpriseProfile.companySize;
      variables.fleetSize = leadData.enterpriseProfile.fleetSize;
      variables.budget = leadData.enterpriseProfile.budget;
    }
    
    return variables;
  }

  async updateStatus(newStatus, updatedBy) {
    try {
      this.status = newStatus;
      this.updatedAt = new Date();
      
      if (newStatus === 'active') {
        this.approvedBy = new ObjectId(updatedBy);
      }
      
      await this.save();
      return this;
    } catch (error) {
      console.error('Error updating contract template status:', error);
      throw error;
    }
  }
}

module.exports = ContractTemplate;
