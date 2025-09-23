const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');

class SalesEmployee {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.email = data.email;
    this.name = data.name;
    this.role = data.role; // 'sysadmin','admin','sales_rep','sales_manager','b2b_director','legal','hr','interviewer','auditor'
    this.team = data.team; // 'b2b' or 'partners' etc.
    this.locale = data.locale || 'en'; // 'en'|'ar'
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Static methods
  static async findById(id) {
    try {
      const collection = await getCollection('employees');
      const employee = await collection.findOne({ _id: new ObjectId(id) });
      return employee ? new SalesEmployee(employee) : null;
    } catch (error) {
      console.error('Error finding employee by ID:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const collection = await getCollection('employees');
      const employee = await collection.findOne({ email: email.toLowerCase() });
      return employee ? new SalesEmployee(employee) : null;
    } catch (error) {
      console.error('Error finding employee by email:', error);
      throw error;
    }
  }

  static async find(filter = {}, options = {}) {
    try {
      const collection = await getCollection('employees');
      const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;
      
      const employees = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();
      
      return employees.map(employee => new SalesEmployee(employee));
    } catch (error) {
      console.error('Error finding employees:', error);
      throw error;
    }
  }

  static async findByRole(role) {
    try {
      const collection = await getCollection('employees');
      const employees = await collection.find({ role }).toArray();
      return employees.map(employee => new SalesEmployee(employee));
    } catch (error) {
      console.error('Error finding employees by role:', error);
      throw error;
    }
  }

  static async findByTeam(team) {
    try {
      const collection = await getCollection('employees');
      const employees = await collection.find({ team }).toArray();
      return employees.map(employee => new SalesEmployee(employee));
    } catch (error) {
      console.error('Error finding employees by team:', error);
      throw error;
    }
  }

  // Check if employee has permission for sales actions
  hasSalesPermission(action) {
    const salesRoles = ['sysadmin', 'admin', 'sales_rep', 'sales_manager', 'b2b_director'];
    const legalRoles = ['legal', 'admin', 'sysadmin'];
    const hrRoles = ['hr', 'admin', 'sysadmin'];
    
    switch (action) {
      case 'create_lead':
      case 'update_lead':
      case 'create_deal':
      case 'update_deal':
        return salesRoles.includes(this.role);
      case 'approve_contract':
      case 'reject_contract':
        return legalRoles.includes(this.role);
      case 'view_hr_reports':
        return hrRoles.includes(this.role);
      default:
        return false;
    }
  }

  // Get employee statistics
  static async getStats() {
    try {
      const collection = await getCollection('employees');
      const pipeline = [
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ];
      const stats = await collection.aggregate(pipeline).toArray();
      return stats;
    } catch (error) {
      console.error('Error getting employee stats:', error);
      throw error;
    }
  }
}

module.exports = SalesEmployee;
