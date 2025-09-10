const { getDb } = require('../config/database');

class Diagnostic {
  constructor() {
    this.collectionName = 'diagnostics';
  }

  async getCollection() {
    const db = await getDb();
    return db.collection(this.collectionName);
  }

  async create(diagnosticData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.insertOne({
        ...diagnosticData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      console.error('Error creating diagnostic record:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ _id: id });
    } catch (error) {
      console.error('Error finding diagnostic by ID:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { _id: id },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Error updating diagnostic:', error);
      throw error;
    }
  }

  async findByVehicleId(vehicleId) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ vehicleId }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Error finding diagnostics by vehicle ID:', error);
      throw error;
    }
  }

  async findByUserId(userId) {
    try {
      const collection = await this.getCollection();
      return await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
      console.error('Error finding diagnostics by user ID:', error);
      throw error;
    }
  }

  async getLatestDiagnostic(vehicleId) {
    try {
      const collection = await this.getCollection();
      return await collection.findOne(
        { vehicleId },
        { sort: { createdAt: -1 } }
      );
    } catch (error) {
      console.error('Error getting latest diagnostic:', error);
      throw error;
    }
  }

  async scanVehicle(vehicleId, userId, scanData) {
    try {
      const collection = await this.getCollection();
      
      // Process OBD-II data and generate diagnostic report
      const diagnosticReport = await this.processOBDData(scanData);
      
      const result = await collection.insertOne({
        vehicleId,
        userId,
        scanData,
        diagnosticReport,
        scanDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        diagnosticId: result.insertedId,
        report: diagnosticReport
      };
    } catch (error) {
      console.error('Error scanning vehicle:', error);
      throw error;
    }
  }

  async processOBDData(obdData) {
    try {
      const report = {
        overallHealth: 'good',
        issues: [],
        recommendations: [],
        severity: 'low'
      };

      // Process engine codes
      if (obdData.engineCodes && obdData.engineCodes.length > 0) {
        report.issues.push(...obdData.engineCodes.map(code => ({
          code: code.code,
          description: code.description,
          severity: this.getCodeSeverity(code.code),
          recommendation: this.getCodeRecommendation(code.code)
        })));
      }

      // Process sensor data
      if (obdData.sensors) {
        const sensorIssues = this.analyzeSensorData(obdData.sensors);
        report.issues.push(...sensorIssues);
      }

      // Determine overall health
      const criticalIssues = report.issues.filter(issue => issue.severity === 'critical');
      const highIssues = report.issues.filter(issue => issue.severity === 'high');
      
      if (criticalIssues.length > 0) {
        report.overallHealth = 'critical';
        report.severity = 'critical';
      } else if (highIssues.length > 0) {
        report.overallHealth = 'poor';
        report.severity = 'high';
      } else if (report.issues.length > 0) {
        report.overallHealth = 'fair';
        report.severity = 'medium';
      }

      // Generate recommendations
      report.recommendations = this.generateRecommendations(report.issues);

      return report;
    } catch (error) {
      console.error('Error processing OBD data:', error);
      throw error;
    }
  }

  getCodeSeverity(code) {
    // Define severity levels for different OBD codes
    const criticalCodes = ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0171', 'P0172'];
    const highCodes = ['P0420', 'P0430', 'P0401', 'P0402', 'P0403', 'P0404'];
    
    if (criticalCodes.includes(code)) return 'critical';
    if (highCodes.includes(code)) return 'high';
    return 'low';
  }

  getCodeRecommendation(code) {
    const recommendations = {
      'P0300': 'Check spark plugs and ignition system',
      'P0171': 'Check for vacuum leaks and fuel system',
      'P0420': 'Catalytic converter may need replacement',
      'P0401': 'EGR system needs attention'
    };
    
    return recommendations[code] || 'Consult with a mechanic for diagnosis';
  }

  analyzeSensorData(sensors) {
    const issues = [];
    
    // Analyze engine temperature
    if (sensors.engineTemp > 220) {
      issues.push({
        type: 'sensor',
        sensor: 'engine_temperature',
        value: sensors.engineTemp,
        threshold: 220,
        severity: 'high',
        description: 'Engine temperature is too high',
        recommendation: 'Check cooling system and coolant levels'
      });
    }

    // Analyze oil pressure
    if (sensors.oilPressure < 10) {
      issues.push({
        type: 'sensor',
        sensor: 'oil_pressure',
        value: sensors.oilPressure,
        threshold: 10,
        severity: 'critical',
        description: 'Oil pressure is too low',
        recommendation: 'Stop engine immediately and check oil level'
      });
    }

    // Analyze battery voltage
    if (sensors.batteryVoltage < 12.0) {
      issues.push({
        type: 'sensor',
        sensor: 'battery_voltage',
        value: sensors.batteryVoltage,
        threshold: 12.0,
        severity: 'medium',
        description: 'Battery voltage is low',
        recommendation: 'Check battery and charging system'
      });
    }

    return issues;
  }

  generateRecommendations(issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      if (issue.recommendation && !recommendations.includes(issue.recommendation)) {
        recommendations.push(issue.recommendation);
      }
    });

    // Add general maintenance recommendations
    if (issues.length === 0) {
      recommendations.push('Vehicle is in good condition. Continue regular maintenance.');
    }

    return recommendations;
  }

  async getMaintenanceSchedule(vehicleData, diagnosticHistory = []) {
    try {
      // Generate personalized maintenance schedule based on vehicle data and diagnostic history
      const schedule = {
        immediate: [],
        within30Days: [],
        within90Days: [],
        within6Months: []
      };

      // Check for immediate issues
      const latestDiagnostic = diagnosticHistory[0];
      if (latestDiagnostic && latestDiagnostic.diagnosticReport.issues) {
        const criticalIssues = latestDiagnostic.diagnosticReport.issues.filter(
          issue => issue.severity === 'critical'
        );
        schedule.immediate = criticalIssues.map(issue => ({
          type: 'repair',
          description: issue.description,
          priority: 'critical'
        }));
      }

      // Generate time-based maintenance items
      const mileage = vehicleData.mileage || 0;
      const age = new Date().getFullYear() - vehicleData.year;

      // Oil change schedule
      if (mileage % 5000 < 500) {
        schedule.within30Days.push({
          type: 'maintenance',
          description: 'Oil change and filter replacement',
          priority: 'high'
        });
      }

      // Brake inspection
      if (mileage % 15000 < 1000) {
        schedule.within90Days.push({
          type: 'inspection',
          description: 'Brake system inspection',
          priority: 'medium'
        });
      }

      // Timing belt replacement
      if (age >= 5 && mileage >= 60000) {
        schedule.within6Months.push({
          type: 'replacement',
          description: 'Timing belt replacement',
          priority: 'high'
        });
      }

      return schedule;
    } catch (error) {
      console.error('Error generating maintenance schedule:', error);
      throw error;
    }
  }
}

module.exports = new Diagnostic();
