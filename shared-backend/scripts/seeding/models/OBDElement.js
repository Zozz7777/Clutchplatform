const mongoose = require('../../../shims/mongoose');

const obdElementSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Validate OBD-II code format (P, C, B, U followed by 4 digits)
        return /^[PCBU]\d{4}$/.test(v);
      },
      message: 'OBD code must be in format P0000, C0000, B0000, or U0000'
    }
  },
  
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  category: {
    type: String,
    required: true,
    enum: ['Engine', 'Transmission', 'Body', 'Chassis', 'Network'],
    default: 'Engine'
  },
  
  severity: {
    type: String,
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  
  possible_causes: [{
    type: String,
    trim: true
  }],
  
  symptoms: [{
    type: String,
    trim: true
  }],
  
  recommended_actions: [{
    type: String,
    trim: true
  }],
  
  estimated_repair_cost_min: {
    type: Number,
    required: true,
    min: 0,
    default: 100
  },
  
  estimated_repair_cost_max: {
    type: Number,
    required: true,
    min: 0,
    default: 500
  },
  
  urgency_level: {
    type: String,
    required: true,
    enum: ['IMMEDIATE', 'SOON', 'SCHEDULED', 'MONITOR'],
    default: 'SOON'
  },
  
  can_drive: {
    type: Boolean,
    default: true
  },
  
  requires_tow: {
    type: Boolean,
    default: false
  },
  
  affected_systems: [{
    type: String,
    trim: true
  }],
  
  related_codes: [{
    type: String,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[PCBU]\d{4}$/.test(v);
      },
      message: 'Related codes must be valid OBD codes'
    }
  }],
  
  troubleshooting_steps: [{
    step: {
      type: Number,
      required: true,
      min: 1
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    tools_needed: [{
      type: String,
      trim: true
    }],
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'],
      default: 'MEDIUM'
    },
    estimated_time_minutes: {
      type: Number,
      min: 1,
      default: 30
    },
    safety_warnings: [{
      type: String,
      trim: true
    }]
  }],
  
  professional_services_needed: [{
    type: String,
    trim: true
  }],
  
  diy_possible: {
    type: Boolean,
    default: true
  },
  
  diy_difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD', 'EXPERT'],
    default: 'MEDIUM'
  },
  
  safety_notes: [{
    type: String,
    trim: true
  }],
  
  environmental_impact: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  
  fuel_economy_impact: {
    type: String,
    enum: ['NONE', 'MINOR', 'MODERATE', 'SIGNIFICANT'],
    default: 'NONE'
  },
  
  performance_impact: {
    type: String,
    enum: ['NONE', 'MINOR', 'MODERATE', 'SIGNIFICANT'],
    default: 'NONE'
  },
  
  manufacturer_specific: {
    type: Boolean,
    default: false
  },
  
  manufacturer: {
    type: String,
    trim: true
  },
  
  model_years: {
    start: {
      type: Number,
      min: 1990,
      max: new Date().getFullYear() + 1
    },
    end: {
      type: Number,
      min: 1990,
      max: new Date().getFullYear() + 1
    }
  },
  
  engine_types: [{
    type: String,
    trim: true
  }],
  
  transmission_types: [{
    type: String,
    trim: true
  }],
  
  fuel_types: [{
    type: String,
    enum: ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid'],
    trim: true
  }],
  
  common_vehicles: [{
    make: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    years: [{
      type: Number,
      min: 1990,
      max: new Date().getFullYear() + 1
    }]
  }],
  
  diagnostic_procedures: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    steps: [{
      step_number: {
        type: Number,
        required: true
      },
      instruction: {
        type: String,
        required: true,
        trim: true
      },
      expected_result: {
        type: String,
        trim: true
      }
    }],
    tools_required: [{
      type: String,
      trim: true
    }],
    time_estimate: {
      type: Number,
      min: 1,
      default: 30
    }
  }],
  
  parts_commonly_needed: [{
    part_name: {
      type: String,
      required: true,
      trim: true
    },
    part_number: {
      type: String,
      trim: true
    },
    estimated_cost_min: {
      type: Number,
      min: 0,
      default: 50
    },
    estimated_cost_max: {
      type: Number,
      min: 0,
      default: 200
    },
    availability: {
      type: String,
      enum: ['COMMON', 'MODERATE', 'RARE', 'SPECIAL_ORDER'],
      default: 'COMMON'
    }
  }],
  
  labor_estimates: {
    diy_hours: {
      type: Number,
      min: 0,
      default: 1
    },
    professional_hours: {
      type: Number,
      min: 0,
      default: 2
    },
    hourly_rate_egp: {
      type: Number,
      min: 0,
      default: 150
    }
  },
  
  warranty_implications: {
    covered_under_warranty: {
      type: Boolean,
      default: false
    },
    warranty_type: {
      type: String,
      enum: ['Bumper_to_Bumper', 'Powertrain', 'Emissions', 'Extended'],
      trim: true
    },
    warranty_notes: {
      type: String,
      trim: true
    }
  },
  
  regulatory_compliance: {
    emissions_related: {
      type: Boolean,
      default: false
    },
    safety_related: {
      type: Boolean,
      default: false
    },
    inspection_impact: {
      type: String,
      enum: ['NONE', 'MINOR', 'MAJOR', 'FAIL'],
      default: 'NONE'
    }
  },
  
  frequency_data: {
    occurrence_rate: {
      type: String,
      enum: ['RARE', 'UNCOMMON', 'COMMON', 'VERY_COMMON'],
      default: 'COMMON'
    },
    typical_mileage_range: {
      min: {
        type: Number,
        min: 0
      },
      max: {
        type: Number,
        min: 0
      }
    },
    seasonal_factors: [{
      type: String,
      enum: ['Winter', 'Spring', 'Summer', 'Fall', 'All_Year'],
      trim: true
    }]
  },
  
  prevention_tips: [{
    type: String,
    trim: true
  }],
  
  maintenance_schedule: {
    inspection_interval_months: {
      type: Number,
      min: 1,
      default: 12
    },
    replacement_interval_months: {
      type: Number,
      min: 1
    },
    maintenance_tasks: [{
      type: String,
      trim: true
    }]
  },
  
  metadata: {
    source: {
      type: String,
      trim: true
    },
    last_updated: {
      type: Date,
      default: Date.now
    },
    version: {
      type: String,
      trim: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verified_by: {
      type: String,
      trim: true
    },
    verified_date: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
obdElementSchema.index({ code: 1 });
obdElementSchema.index({ category: 1 });
obdElementSchema.index({ severity: 1 });
obdElementSchema.index({ urgency_level: 1 });
obdElementSchema.index({ manufacturer_specific: 1 });
obdElementSchema.index({ manufacturer: 1 });
obdElementSchema.index({ 'model_years.start': 1, 'model_years.end': 1 });
obdElementSchema.index({ affected_systems: 1 });
obdElementSchema.index({ diy_possible: 1 });
obdElementSchema.index({ 'frequency_data.occurrence_rate': 1 });
obdElementSchema.index({ 'metadata.verified': 1 });

// Text search index
obdElementSchema.index({
  code: 'text',
  description: 'text',
  possible_causes: 'text',
  symptoms: 'text',
  affected_systems: 'text'
});

// Pre-save middleware
obdElementSchema.pre('save', function(next) {
  // Ensure code is uppercase
  this.code = this.code.toUpperCase();
  
  // Update metadata
  this.metadata.last_updated = new Date();
  
  next();
});

// Static methods
obdElementSchema.statics.findByCode = async function(code) {
  try {
    return await this.findOne({ code: code.toUpperCase() });
  } catch (error) {
    throw new Error(`Failed to find OBD code ${code}: ${error.message}`);
  }
};

obdElementSchema.statics.findByCategory = async function(category) {
  try {
    return await this.find({ category }).sort({ code: 1 });
  } catch (error) {
    throw new Error(`Failed to find OBD codes by category ${category}: ${error.message}`);
  }
};

obdElementSchema.statics.findBySeverity = async function(severity) {
  try {
    return await this.find({ severity }).sort({ code: 1 });
  } catch (error) {
    throw new Error(`Failed to find OBD codes by severity ${severity}: ${error.message}`);
  }
};

obdElementSchema.statics.findCriticalCodes = async function() {
  try {
    return await this.find({
      $or: [
        { severity: 'CRITICAL' },
        { urgency_level: 'IMMEDIATE' },
        { requires_tow: true }
      ]
    }).sort({ severity: 1, code: 1 });
  } catch (error) {
    throw new Error(`Failed to find critical OBD codes: ${error.message}`);
  }
};

obdElementSchema.statics.findByManufacturer = async function(manufacturer) {
  try {
    return await this.find({ 
      manufacturer: new RegExp(manufacturer, 'i'),
      manufacturer_specific: true 
    }).sort({ code: 1 });
  } catch (error) {
    throw new Error(`Failed to find manufacturer-specific OBD codes for ${manufacturer}: ${error.message}`);
  }
};

obdElementSchema.statics.findByVehicle = async function(make, model, year) {
  try {
    return await this.find({
      $or: [
        { manufacturer_specific: false }, // Generic codes
        {
          'common_vehicles.make': new RegExp(make, 'i'),
          'common_vehicles.model': new RegExp(model, 'i'),
          'common_vehicles.years': year
        }
      ],
      'model_years.start': { $lte: year },
      'model_years.end': { $gte: year }
    }).sort({ severity: 1, code: 1 });
  } catch (error) {
    throw new Error(`Failed to find OBD codes for vehicle ${make} ${model} ${year}: ${error.message}`);
  }
};

obdElementSchema.statics.searchCodes = async function(searchTerm, filters = {}) {
  try {
    const query = {
      $or: [
        { code: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { symptoms: { $regex: searchTerm, $options: 'i' } },
        { affected_systems: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Apply filters
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.severity) {
      query.severity = filters.severity;
    }
    if (filters.urgency_level) {
      query.urgency_level = filters.urgency_level;
    }
    if (filters.diy_possible !== undefined) {
      query.diy_possible = filters.diy_possible;
    }
    if (filters.manufacturer_specific !== undefined) {
      query.manufacturer_specific = filters.manufacturer_specific;
    }

    return await this.find(query)
      .sort({ severity: 1, code: 1 })
      .limit(filters.limit || 50);
  } catch (error) {
    throw new Error(`Failed to search OBD codes: ${error.message}`);
  }
};

obdElementSchema.statics.getStatistics = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          total_codes: { $sum: 1 },
          by_category: {
            $push: {
              category: '$category',
              code: '$code'
            }
          },
          by_severity: {
            $push: {
              severity: '$severity',
              code: '$code'
            }
          },
          by_urgency: {
            $push: {
              urgency: '$urgency_level',
              code: '$code'
            }
          },
          critical_codes: {
            $sum: {
              $cond: [
                { $in: ['$severity', ['HIGH', 'CRITICAL']] },
                1,
                0
              ]
            }
          },
          manufacturer_specific: {
            $sum: {
              $cond: ['$manufacturer_specific', 1, 0]
            }
          },
          diy_possible: {
            $sum: {
              $cond: ['$diy_possible', 1, 0]
            }
          }
        }
      }
    ]);

    return stats[0] || {};
  } catch (error) {
    throw new Error(`Failed to get OBD code statistics: ${error.message}`);
  }
};

// Instance methods
obdElementSchema.methods.isCritical = function() {
  return this.severity === 'CRITICAL' || this.urgency_level === 'IMMEDIATE' || this.requires_tow;
};

obdElementSchema.methods.canBeFixedByUser = function() {
  return this.diy_possible && this.diy_difficulty !== 'EXPERT';
};

obdElementSchema.methods.getEstimatedTotalCost = function() {
  const partsCost = (this.estimated_repair_cost_min + this.estimated_repair_cost_max) / 2;
  const laborCost = this.labor_estimates.professional_hours * this.labor_estimates.hourly_rate_egp;
  return Math.round(partsCost + laborCost);
};

obdElementSchema.methods.getSafetyWarnings = function() {
  const warnings = [];
  
  if (this.requires_tow) {
    warnings.push('Vehicle should not be driven - requires towing');
  }
  if (!this.can_drive) {
    warnings.push('Vehicle should not be driven until repaired');
  }
  if (this.safety_related) {
    warnings.push('This is a safety-related issue');
  }
  
  return warnings.concat(this.safety_notes || []);
};

module.exports = mongoose.model('OBDElement', obdElementSchema);
