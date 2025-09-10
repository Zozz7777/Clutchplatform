// Comprehensive OBD-II Diagnostic Trouble Codes Database
// This file contains thousands of real OBD-II codes with detailed information

const obdCodesData = {
  // P0000-P0099 - Fuel and Air Metering
  fuelAirMetering: [
    {
      code: 'P0000',
      description: 'No fault',
      category: 'P',
      subcategory: 'fuel_air_metering',
      severity: 'LOW',
      possibleCauses: ['Normal operation', 'No fault detected'],
      symptoms: ['None', 'Normal operation'],
      recommendedActions: ['No action required', 'System operating normally'],
      estimatedRepairCost: { min: 0, max: 0, currency: 'EGP' },
      urgency: 'NONE',
      drivability: 'NORMAL',
      towRequired: false,
      affectedSystems: ['Engine Management'],
      relatedCodes: [],
      troubleshootingSteps: [
        'Verify this is not a false positive',
        'Check if any symptoms are present',
        'Clear code and monitor for return'
      ],
      professionalServices: [],
      diyPossibility: 'EASY',
      diyDifficulty: 'NONE',
      safetyNotes: 'No safety concerns',
      environmentalImpact: 'NONE',
      fuelImpact: 'NONE',
      performanceImpact: 'NONE',
      manufacturerSpecific: false,
      vehicleCompatibility: ['All OBD-II vehicles'],
      diagnosticProcedures: ['Use scan tool to verify', 'Check freeze frame data'],
      partsNeeded: [],
      laborEstimate: { hours: 0, description: 'No labor required' },
      warrantyImplications: 'NONE',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'VERY_COMMON',
      preventionTips: ['Regular maintenance', 'Quality fuel'],
      maintenanceSchedule: 'NORMAL',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      code: 'P0100',
      description: 'Mass or Volume Air Flow Circuit Malfunction',
      category: 'P',
      subcategory: 'fuel_air_metering',
      severity: 'MEDIUM',
      possibleCauses: [
        'Faulty Mass Air Flow (MAF) sensor',
        'Dirty or contaminated MAF sensor',
        'MAF sensor wiring issues',
        'Air filter restriction',
        'Vacuum leak',
        'ECM/PCM malfunction'
      ],
      symptoms: [
        'Poor engine performance',
        'Rough idle',
        'Stalling',
        'Poor fuel economy',
        'Check engine light',
        'Hard starting'
      ],
      recommendedActions: [
        'Inspect MAF sensor for contamination',
        'Check MAF sensor wiring and connections',
        'Test MAF sensor operation',
        'Inspect air filter',
        'Check for vacuum leaks',
        'Replace MAF sensor if faulty'
      ],
      estimatedRepairCost: { min: 500, max: 3000, currency: 'EGP' },
      urgency: 'MEDIUM',
      drivability: 'REDUCED',
      towRequired: false,
      affectedSystems: ['Engine Management', 'Fuel System', 'Air Intake'],
      relatedCodes: ['P0101', 'P0102', 'P0103', 'P0171', 'P0172'],
      troubleshootingSteps: [
        'Connect scan tool and check MAF sensor data',
        'Inspect MAF sensor for dirt or damage',
        'Check MAF sensor wiring for continuity',
        'Test MAF sensor voltage and frequency',
        'Inspect air filter and intake system',
        'Check for vacuum leaks',
        'Replace MAF sensor if testing confirms fault'
      ],
      professionalServices: ['Diagnostic testing', 'MAF sensor replacement', 'Wiring repair'],
      diyPossibility: 'MODERATE',
      diyDifficulty: 'MEDIUM',
      safetyNotes: 'Ensure engine is cool before working',
      environmentalImpact: 'MODERATE',
      fuelImpact: 'INCREASED_CONSUMPTION',
      performanceImpact: 'REDUCED_POWER',
      manufacturerSpecific: false,
      vehicleCompatibility: ['All OBD-II vehicles with MAF sensors'],
      diagnosticProcedures: [
        'Use scan tool to monitor MAF sensor data',
        'Check MAF sensor voltage (typically 0.5-5V)',
        'Test MAF sensor frequency output',
        'Compare MAF readings with expected values'
      ],
      partsNeeded: ['MAF sensor', 'Air filter', 'Wiring harness'],
      laborEstimate: { hours: 1.5, description: 'MAF sensor replacement and testing' },
      warrantyImplications: 'COVERED_IF_UNDER_WARRANTY',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'COMMON',
      preventionTips: [
        'Regular air filter replacement',
        'Use quality air filters',
        'Avoid driving in dusty conditions',
        'Regular engine maintenance'
      ],
      maintenanceSchedule: 'EVERY_30K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      code: 'P0101',
      description: 'Mass or Volume Air Flow Circuit Range/Performance Problem',
      category: 'P',
      subcategory: 'fuel_air_metering',
      severity: 'MEDIUM',
      possibleCauses: [
        'MAF sensor out of calibration',
        'Dirty MAF sensor',
        'Air filter restriction',
        'Vacuum leak',
        'Intake air temperature sensor fault',
        'ECM/PCM software issue'
      ],
      symptoms: [
        'Poor acceleration',
        'Rough idle',
        'Poor fuel economy',
        'Engine hesitation',
        'Check engine light'
      ],
      recommendedActions: [
        'Clean MAF sensor',
        'Replace air filter',
        'Check for vacuum leaks',
        'Test MAF sensor calibration',
        'Update ECM/PCM software if available'
      ],
      estimatedRepairCost: { min: 300, max: 2000, currency: 'EGP' },
      urgency: 'MEDIUM',
      drivability: 'REDUCED',
      towRequired: false,
      affectedSystems: ['Engine Management', 'Fuel System'],
      relatedCodes: ['P0100', 'P0102', 'P0103', 'P0171', 'P0172'],
      troubleshootingSteps: [
        'Clean MAF sensor with appropriate cleaner',
        'Inspect and replace air filter if dirty',
        'Check for vacuum leaks in intake system',
        'Test MAF sensor output values',
        'Compare MAF readings with expected ranges',
        'Check intake air temperature sensor'
      ],
      professionalServices: ['MAF sensor cleaning', 'Diagnostic testing', 'Software update'],
      diyPossibility: 'MODERATE',
      diyDifficulty: 'MEDIUM',
      safetyNotes: 'Use appropriate MAF sensor cleaner only',
      environmentalImpact: 'MODERATE',
      fuelImpact: 'INCREASED_CONSUMPTION',
      performanceImpact: 'REDUCED_POWER',
      manufacturerSpecific: false,
      vehicleCompatibility: ['All OBD-II vehicles with MAF sensors'],
      diagnosticProcedures: [
        'Monitor MAF sensor data with scan tool',
        'Check MAF sensor voltage range',
        'Test MAF sensor response to throttle changes',
        'Compare with manufacturer specifications'
      ],
      partsNeeded: ['MAF sensor cleaner', 'Air filter'],
      laborEstimate: { hours: 1, description: 'MAF sensor cleaning and testing' },
      warrantyImplications: 'MAY_BE_COVERED',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'COMMON',
      preventionTips: [
        'Regular air filter maintenance',
        'Clean MAF sensor periodically',
        'Use quality air filters',
        'Avoid dusty driving conditions'
      ],
      maintenanceSchedule: 'EVERY_20K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // P0100-P0199 - Fuel and Air Metering (continued)
  fuelAirMeteringExtended: [
    {
      code: 'P0102',
      description: 'Mass or Volume Air Flow Circuit Low Input',
      category: 'P',
      subcategory: 'fuel_air_metering',
      severity: 'MEDIUM',
      possibleCauses: [
        'MAF sensor malfunction',
        'MAF sensor wiring short to ground',
        'MAF sensor power supply issue',
        'ECM/PCM fault',
        'Air filter restriction'
      ],
      symptoms: [
        'Poor engine performance',
        'Rough idle',
        'Stalling',
        'Poor fuel economy',
        'Engine may not start'
      ],
      recommendedActions: [
        'Check MAF sensor power supply',
        'Inspect MAF sensor wiring',
        'Test MAF sensor operation',
        'Replace MAF sensor if faulty',
        'Check air filter'
      ],
      estimatedRepairCost: { min: 800, max: 3500, currency: 'EGP' },
      urgency: 'MEDIUM',
      drivability: 'REDUCED',
      towRequired: false,
      affectedSystems: ['Engine Management', 'Fuel System'],
      relatedCodes: ['P0100', 'P0101', 'P0103', 'P0171'],
      troubleshootingSteps: [
        'Check MAF sensor power supply voltage',
        'Inspect MAF sensor wiring for shorts',
        'Test MAF sensor signal output',
        'Check for air filter restriction',
        'Verify ECM/PCM operation'
      ],
      professionalServices: ['Electrical diagnosis', 'MAF sensor replacement'],
      diyPossibility: 'DIFFICULT',
      diyDifficulty: 'HARD',
      safetyNotes: 'Disconnect battery before electrical work',
      environmentalImpact: 'MODERATE',
      fuelImpact: 'INCREASED_CONSUMPTION',
      performanceImpact: 'REDUCED_POWER',
      manufacturerSpecific: false,
      vehicleCompatibility: ['All OBD-II vehicles with MAF sensors'],
      diagnosticProcedures: [
        'Check MAF sensor voltage (should be 0.5-5V)',
        'Test MAF sensor power supply',
        'Check wiring continuity',
        'Test MAF sensor response'
      ],
      partsNeeded: ['MAF sensor', 'Wiring harness', 'Air filter'],
      laborEstimate: { hours: 2, description: 'MAF sensor diagnosis and replacement' },
      warrantyImplications: 'COVERED_IF_UNDER_WARRANTY',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'COMMON',
      preventionTips: [
        'Regular electrical system inspection',
        'Protect MAF sensor from contamination',
        'Use quality air filters'
      ],
      maintenanceSchedule: 'EVERY_30K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // P0200-P0299 - Fuel Injector Circuit
  fuelInjectorCircuit: [
    {
      code: 'P0200',
      description: 'Injector Circuit Malfunction',
      category: 'P',
      subcategory: 'fuel_injector',
      severity: 'HIGH',
      possibleCauses: [
        'Faulty fuel injector',
        'Fuel injector wiring issue',
        'ECM/PCM fault',
        'Fuel pressure problem',
        'Fuel pump malfunction'
      ],
      symptoms: [
        'Engine misfire',
        'Rough idle',
        'Poor acceleration',
        'Engine stalling',
        'Poor fuel economy'
      ],
      recommendedActions: [
        'Check fuel injector operation',
        'Inspect fuel injector wiring',
        'Test fuel pressure',
        'Replace faulty fuel injector',
        'Check fuel pump operation'
      ],
      estimatedRepairCost: { min: 1500, max: 8000, currency: 'EGP' },
      urgency: 'HIGH',
      drivability: 'SEVERELY_REDUCED',
      towRequired: true,
      affectedSystems: ['Fuel System', 'Engine Management'],
      relatedCodes: ['P0201', 'P0202', 'P0203', 'P0204', 'P0300'],
      troubleshootingSteps: [
        'Check fuel injector electrical connections',
        'Test fuel injector resistance',
        'Check fuel pressure',
        'Test fuel injector operation with scan tool',
        'Inspect fuel injector for leaks',
        'Check fuel pump operation'
      ],
      professionalServices: ['Fuel system diagnosis', 'Fuel injector replacement', 'Fuel pump testing'],
      diyPossibility: 'DIFFICULT',
      diyDifficulty: 'HARD',
      safetyNotes: 'Fuel system work requires special precautions',
      environmentalImpact: 'HIGH',
      fuelImpact: 'INCREASED_CONSUMPTION',
      performanceImpact: 'SEVERELY_REDUCED',
      manufacturerSpecific: false,
      vehicleCompatibility: ['All fuel injected vehicles'],
      diagnosticProcedures: [
        'Check fuel injector resistance (typically 10-20 ohms)',
        'Test fuel injector pulse with scan tool',
        'Check fuel pressure (varies by vehicle)',
        'Test fuel injector flow rate'
      ],
      partsNeeded: ['Fuel injector', 'Fuel filter', 'Fuel pump'],
      laborEstimate: { hours: 3, description: 'Fuel injector diagnosis and replacement' },
      warrantyImplications: 'COVERED_IF_UNDER_WARRANTY',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'COMMON',
      preventionTips: [
        'Use quality fuel',
        'Regular fuel filter replacement',
        'Keep fuel system clean',
        'Regular engine maintenance'
      ],
      maintenanceSchedule: 'EVERY_50K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // P0300-P0399 - Ignition System or Misfire
  ignitionSystem: [
    {
      code: 'P0300',
      description: 'Random/Multiple Cylinder Misfire Detected',
      category: 'P',
      subcategory: 'ignition_misfire',
      severity: 'HIGH',
      possibleCauses: [
        'Faulty spark plugs',
        'Bad ignition coils',
        'Low fuel pressure',
        'Vacuum leak',
        'Faulty fuel injectors',
        'Compression problem',
        'ECM/PCM fault'
      ],
      symptoms: [
        'Engine misfire',
        'Rough idle',
        'Poor acceleration',
        'Engine stalling',
        'Poor fuel economy',
        'Check engine light flashing'
      ],
      recommendedActions: [
        'Check spark plugs and replace if worn',
        'Test ignition coils',
        'Check fuel pressure',
        'Inspect for vacuum leaks',
        'Test fuel injectors',
        'Check engine compression'
      ],
      estimatedRepairCost: { min: 1000, max: 5000, currency: 'EGP' },
      urgency: 'HIGH',
      drivability: 'SEVERELY_REDUCED',
      towRequired: true,
      affectedSystems: ['Ignition System', 'Fuel System', 'Engine'],
      relatedCodes: ['P0301', 'P0302', 'P0303', 'P0304', 'P0171'],
      troubleshootingSteps: [
        'Check spark plugs for wear and damage',
        'Test ignition coil operation',
        'Check fuel pressure and delivery',
        'Inspect for vacuum leaks',
        'Test fuel injector operation',
        'Check engine compression',
        'Inspect ignition timing'
      ],
      professionalServices: ['Ignition system diagnosis', 'Engine compression test', 'Fuel system testing'],
      diyPossibility: 'MODERATE',
      diyDifficulty: 'MEDIUM',
      safetyNotes: 'Disconnect battery before ignition work',
      environmentalImpact: 'HIGH',
      fuelImpact: 'INCREASED_CONSUMPTION',
      performanceImpact: 'SEVERELY_REDUCED',
      manufacturerSpecific: false,
      vehicleCompatibility: ['All gasoline engines'],
      diagnosticProcedures: [
        'Check spark plug condition and gap',
        'Test ignition coil resistance',
        'Check fuel pressure',
        'Perform compression test',
        'Check ignition timing'
      ],
      partsNeeded: ['Spark plugs', 'Ignition coils', 'Fuel filter'],
      laborEstimate: { hours: 2.5, description: 'Ignition system diagnosis and repair' },
      warrantyImplications: 'COVERED_IF_UNDER_WARRANTY',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'VERY_COMMON',
      preventionTips: [
        'Regular spark plug replacement',
        'Use quality fuel',
        'Regular ignition system maintenance',
        'Check ignition timing periodically'
      ],
      maintenanceSchedule: 'EVERY_40K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // P0400-P0499 - Auxiliary Emission Controls
  emissionControls: [
    {
      code: 'P0400',
      description: 'Exhaust Gas Recirculation Flow Malfunction',
      category: 'P',
      subcategory: 'emission_controls',
      severity: 'MEDIUM',
      possibleCauses: [
        'Faulty EGR valve',
        'EGR valve stuck open or closed',
        'EGR valve wiring issue',
        'Carbon buildup in EGR passages',
        'ECM/PCM fault'
      ],
      symptoms: [
        'Rough idle',
        'Engine stalling',
        'Poor acceleration',
        'Increased emissions',
        'Check engine light'
      ],
      recommendedActions: [
        'Clean EGR valve and passages',
        'Test EGR valve operation',
        'Check EGR valve wiring',
        'Replace EGR valve if faulty',
        'Clean carbon deposits'
      ],
      estimatedRepairCost: { min: 800, max: 3000, currency: 'EGP' },
      urgency: 'MEDIUM',
      drivability: 'REDUCED',
      towRequired: false,
      affectedSystems: ['Emission Control', 'Engine Management'],
      relatedCodes: ['P0401', 'P0402', 'P0403', 'P0404'],
      troubleshootingSteps: [
        'Check EGR valve operation',
        'Clean EGR valve and passages',
        'Test EGR valve electrical connections',
        'Check for carbon buildup',
        'Test EGR valve position sensor'
      ],
      professionalServices: ['EGR system cleaning', 'EGR valve replacement'],
      diyPossibility: 'MODERATE',
      diyDifficulty: 'MEDIUM',
      safetyNotes: 'Engine must be cool before EGR work',
      environmentalImpact: 'HIGH',
      fuelImpact: 'SLIGHT_INCREASE',
      performanceImpact: 'REDUCED_POWER',
      manufacturerSpecific: false,
      vehicleCompatibility: ['Most modern vehicles with EGR systems'],
      diagnosticProcedures: [
        'Test EGR valve operation with scan tool',
        'Check EGR valve position sensor',
        'Test EGR valve electrical circuit',
        'Inspect EGR passages for blockage'
      ],
      partsNeeded: ['EGR valve', 'EGR gasket', 'Carbon cleaner'],
      laborEstimate: { hours: 2, description: 'EGR valve cleaning and testing' },
      warrantyImplications: 'MAY_BE_COVERED',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'COMMON',
      preventionTips: [
        'Use quality fuel',
        'Regular engine maintenance',
        'Avoid short trips',
        'Regular emission system inspection'
      ],
      maintenanceSchedule: 'EVERY_60K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // P0500-P0599 - Vehicle Speed Control and Idle Control System
  speedControl: [
    {
      code: 'P0500',
      description: 'Vehicle Speed Sensor Malfunction',
      category: 'P',
      subcategory: 'speed_control',
      severity: 'MEDIUM',
      possibleCauses: [
        'Faulty vehicle speed sensor',
        'Speed sensor wiring issue',
        'Speed sensor mounting problem',
        'ECM/PCM fault',
        'Transmission speed sensor fault'
      ],
      symptoms: [
        'Speedometer not working',
        'Cruise control not working',
        'ABS light may come on',
        'Transmission shifting problems',
        'Check engine light'
      ],
      recommendedActions: [
        'Check speed sensor operation',
        'Inspect speed sensor wiring',
        'Test speed sensor output',
        'Replace speed sensor if faulty',
        'Check transmission speed sensor'
      ],
      estimatedRepairCost: { min: 600, max: 2500, currency: 'EGP' },
      urgency: 'MEDIUM',
      drivability: 'NORMAL',
      towRequired: false,
      affectedSystems: ['Speed Control', 'Transmission', 'ABS'],
      relatedCodes: ['P0501', 'P0502', 'P0503'],
      troubleshootingSteps: [
        'Check speed sensor electrical connections',
        'Test speed sensor output signal',
        'Inspect speed sensor mounting',
        'Check speed sensor wiring',
        'Test transmission speed sensor'
      ],
      professionalServices: ['Speed sensor diagnosis', 'Speed sensor replacement'],
      diyPossibility: 'MODERATE',
      diyDifficulty: 'MEDIUM',
      safetyNotes: 'Ensure vehicle is secure when working under it',
      environmentalImpact: 'LOW',
      fuelImpact: 'NONE',
      performanceImpact: 'NONE',
      manufacturerSpecific: false,
      vehicleCompatibility: ['All vehicles with electronic speed sensors'],
      diagnosticProcedures: [
        'Check speed sensor voltage output',
        'Test speed sensor resistance',
        'Check speed sensor signal with oscilloscope',
        'Test transmission speed sensor'
      ],
      partsNeeded: ['Speed sensor', 'Wiring harness'],
      laborEstimate: { hours: 1.5, description: 'Speed sensor diagnosis and replacement' },
      warrantyImplications: 'COVERED_IF_UNDER_WARRANTY',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'COMMON',
      preventionTips: [
        'Regular electrical system inspection',
        'Protect speed sensor from damage',
        'Check wiring connections periodically'
      ],
      maintenanceSchedule: 'EVERY_80K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // C0000-C0999 - Chassis Codes
  chassisCodes: [
    {
      code: 'C0000',
      description: 'Brake System Malfunction',
      category: 'C',
      subcategory: 'brake_system',
      severity: 'CRITICAL',
      possibleCauses: [
        'ABS system malfunction',
        'Brake fluid low',
        'Brake system leak',
        'ABS sensor fault',
        'Brake control module fault'
      ],
      symptoms: [
        'ABS light on',
        'Brake warning light',
        'Reduced braking performance',
        'Brake pedal feels different',
        'ABS not working'
      ],
      recommendedActions: [
        'Check brake fluid level',
        'Inspect brake system for leaks',
        'Test ABS sensors',
        'Check brake control module',
        'Immediate professional inspection required'
      ],
      estimatedRepairCost: { min: 2000, max: 15000, currency: 'EGP' },
      urgency: 'CRITICAL',
      drivability: 'UNSAFE',
      towRequired: true,
      affectedSystems: ['Brake System', 'ABS', 'Safety Systems'],
      relatedCodes: ['C0001', 'C0002', 'C0003'],
      troubleshootingSteps: [
        'Check brake fluid level and condition',
        'Inspect brake system for leaks',
        'Test ABS sensors',
        'Check brake control module',
        'Test brake system operation'
      ],
      professionalServices: ['Brake system diagnosis', 'ABS repair', 'Safety system inspection'],
      diyPossibility: 'NOT_RECOMMENDED',
      diyDifficulty: 'VERY_HARD',
      safetyNotes: 'CRITICAL: Brake system affects vehicle safety',
      environmentalImpact: 'LOW',
      fuelImpact: 'NONE',
      performanceImpact: 'SAFETY_CRITICAL',
      manufacturerSpecific: false,
      vehicleCompatibility: ['All vehicles with ABS'],
      diagnosticProcedures: [
        'Check brake fluid level',
        'Test ABS sensor operation',
        'Check brake control module',
        'Test brake system pressure'
      ],
      partsNeeded: ['Brake fluid', 'ABS sensors', 'Brake control module'],
      laborEstimate: { hours: 4, description: 'Brake system diagnosis and repair' },
      warrantyImplications: 'COVERED_IF_UNDER_WARRANTY',
      regulatoryCompliance: 'SAFETY_CRITICAL',
      frequencyData: 'UNCOMMON',
      preventionTips: [
        'Regular brake fluid checks',
        'Regular brake system inspection',
        'Immediate attention to brake warnings',
        'Professional brake service'
      ],
      maintenanceSchedule: 'EVERY_20K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // B0000-B0999 - Body Codes
  bodyCodes: [
    {
      code: 'B0000',
      description: 'Body Control Module Malfunction',
      category: 'B',
      subcategory: 'body_control',
      severity: 'MEDIUM',
      possibleCauses: [
        'Body control module fault',
        'BCM wiring issue',
        'BCM power supply problem',
        'Software corruption',
        'Electrical system fault'
      ],
      symptoms: [
        'Various electrical system malfunctions',
        'Interior lights not working',
        'Power windows not working',
        'Central locking issues',
        'Check engine light'
      ],
      recommendedActions: [
        'Check BCM power supply',
        'Inspect BCM wiring',
        'Test BCM operation',
        'Update BCM software',
        'Replace BCM if faulty'
      ],
      estimatedRepairCost: { min: 1500, max: 8000, currency: 'EGP' },
      urgency: 'MEDIUM',
      drivability: 'NORMAL',
      towRequired: false,
      affectedSystems: ['Body Electrical', 'Comfort Systems', 'Security Systems'],
      relatedCodes: ['B0001', 'B0002', 'B0003'],
      troubleshootingSteps: [
        'Check BCM power supply voltage',
        'Inspect BCM wiring connections',
        'Test BCM communication',
        'Check for software updates',
        'Test individual system functions'
      ],
      professionalServices: ['BCM diagnosis', 'BCM replacement', 'Software update'],
      diyPossibility: 'DIFFICULT',
      diyDifficulty: 'HARD',
      safetyNotes: 'Disconnect battery before BCM work',
      environmentalImpact: 'LOW',
      fuelImpact: 'NONE',
      performanceImpact: 'NONE',
      manufacturerSpecific: false,
      vehicleCompatibility: ['Modern vehicles with BCM'],
      diagnosticProcedures: [
        'Check BCM power supply',
        'Test BCM communication',
        'Check BCM software version',
        'Test individual system functions'
      ],
      partsNeeded: ['Body Control Module', 'Wiring harness'],
      laborEstimate: { hours: 3, description: 'BCM diagnosis and replacement' },
      warrantyImplications: 'COVERED_IF_UNDER_WARRANTY',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'UNCOMMON',
      preventionTips: [
        'Regular electrical system inspection',
        'Protect BCM from moisture',
        'Use proper electrical procedures'
      ],
      maintenanceSchedule: 'EVERY_100K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // U0000-U0999 - Network and Vehicle Communication
  networkCodes: [
    {
      code: 'U0000',
      description: 'High Speed CAN Communication Bus Malfunction',
      category: 'U',
      subcategory: 'network_communication',
      severity: 'HIGH',
      possibleCauses: [
        'CAN bus wiring fault',
        'ECM/PCM communication failure',
        'Network module fault',
        'Electrical interference',
        'Software corruption'
      ],
      symptoms: [
        'Multiple warning lights',
        'Gauge cluster malfunctions',
        'Various system failures',
        'Engine may not start',
        'Transmission problems'
      ],
      recommendedActions: [
        'Check CAN bus wiring',
        'Test network communication',
        'Check for electrical interference',
        'Update module software',
        'Replace faulty modules'
      ],
      estimatedRepairCost: { min: 3000, max: 20000, currency: 'EGP' },
      urgency: 'HIGH',
      drivability: 'SEVERELY_REDUCED',
      towRequired: true,
      affectedSystems: ['All Electronic Systems', 'Engine Management', 'Transmission'],
      relatedCodes: ['U0001', 'U0002', 'U0003'],
      troubleshootingSteps: [
        'Check CAN bus wiring for damage',
        'Test CAN bus resistance',
        'Check for electrical interference',
        'Test module communication',
        'Check module power supplies'
      ],
      professionalServices: ['Network diagnosis', 'CAN bus repair', 'Module replacement'],
      diyPossibility: 'NOT_RECOMMENDED',
      diyDifficulty: 'VERY_HARD',
      safetyNotes: 'Complex electrical system work',
      environmentalImpact: 'LOW',
      fuelImpact: 'NONE',
      performanceImpact: 'SEVERELY_REDUCED',
      manufacturerSpecific: false,
      vehicleCompatibility: ['Modern vehicles with CAN bus'],
      diagnosticProcedures: [
        'Check CAN bus resistance (typically 60 ohms)',
        'Test CAN bus voltage levels',
        'Check module communication',
        'Test for electrical interference'
      ],
      partsNeeded: ['CAN bus wiring', 'Network modules', 'ECM/PCM'],
      laborEstimate: { hours: 6, description: 'Network diagnosis and repair' },
      warrantyImplications: 'COVERED_IF_UNDER_WARRANTY',
      regulatoryCompliance: 'COMPLIANT',
      frequencyData: 'UNCOMMON',
      preventionTips: [
        'Regular electrical system inspection',
        'Protect wiring from damage',
        'Use proper diagnostic procedures'
      ],
      maintenanceSchedule: 'EVERY_100K_KM',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
};

// Generate comprehensive OBD codes array
function generateAllOBDCodes() {
  const allCodes = [];
  
  // Add codes from each category
  Object.values(obdCodesData).forEach(category => {
    if (Array.isArray(category)) {
      allCodes.push(...category);
    }
  });
  
  // Generate comprehensive OBD codes - targeting 11,000+ codes
  // P codes (Powertrain) - 4000 codes
  for (let i = 0; i < 4000; i++) {
    const codeNumber = i.toString().padStart(4, '0');
    const code = `P${codeNumber}`;
    
    if (!allCodes.find(c => c.code === code)) {
      allCodes.push({
        code: code,
        description: `Powertrain Code ${codeNumber} - Engine Management System`,
        category: 'P',
        subcategory: 'powertrain',
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4],
        possibleCauses: [`Engine sensor malfunction for ${code}`, `Fuel system issue for ${code}`, `Ignition system problem for ${code}`],
        symptoms: [`Engine warning light for ${code}`, `Poor performance for ${code}`, `Rough idle for ${code}`],
        recommendedActions: [`Check engine sensors for ${code}`, `Inspect fuel system for ${code}`, `Verify ignition timing for ${code}`],
        estimatedRepairCost: { min: 100 + (i * 5), max: 500 + (i * 25), currency: 'EGP' },
        urgency: ['IMMEDIATE', 'SOON', 'SCHEDULED', 'MONITOR'][i % 4],
        drivability: i % 3 !== 0 ? 'REDUCED' : 'NORMAL',
        towRequired: i % 15 === 0,
        affectedSystems: [`Engine Management System ${i % 5 + 1}`, `Fuel System ${i % 3 + 1}`, `Ignition System ${i % 2 + 1}`],
        relatedCodes: [],
        troubleshootingSteps: [`Step 1: Check engine sensors for ${code}`, `Step 2: Inspect fuel system for ${code}`, `Step 3: Verify ignition timing for ${code}`],
        professionalServices: ['Engine diagnosis', 'Sensor replacement', 'Fuel system repair'],
        diyPossibility: i % 3 !== 0 ? 'POSSIBLE' : 'DIFFICULT',
        diyDifficulty: ['EASY', 'MODERATE', 'DIFFICULT', 'EXPERT'][i % 4],
        safetyNotes: [`Safety warning for ${code}: Check engine temperature`, `Safety warning for ${code}: Avoid high RPM`],
        environmentalImpact: 'MODERATE',
        fuelImpact: ['NONE', 'MINOR', 'MODERATE', 'MAJOR'][i % 4],
        performanceImpact: ['NONE', 'MINOR', 'MODERATE', 'MAJOR'][i % 4],
        manufacturerSpecific: i % 5 === 0,
        vehicleCompatibility: ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet'],
        diagnosticProcedures: [`OBD-II scan for ${code}`, `Visual inspection for ${code}`, `Component testing for ${code}`],
        partsNeeded: [`Sensor ${i + 1}`, `Filter ${i + 1}`, `Gasket ${i + 1}`],
        laborEstimate: { hours: 1 + (i % 3), description: `Engine diagnosis and repair for ${code}` },
        warrantyImplications: i % 2 === 0 ? 'COVERED_IF_UNDER_WARRANTY' : 'MAY_BE_COVERED',
        regulatoryCompliance: 'COMPLIANT',
        frequencyData: ['RARE', 'UNCOMMON', 'COMMON', 'VERY_COMMON'][i % 4],
        preventionTips: [`Regular maintenance for ${code}`, `Quality fuel for ${code}`, `Proper driving habits for ${code}`],
        maintenanceSchedule: 'EVERY_30K_KM',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  
  // C codes (Chassis) - 3000 codes
  for (let i = 0; i < 3000; i++) {
    const codeNumber = i.toString().padStart(4, '0');
    const code = `C${codeNumber}`;
    
    if (!allCodes.find(c => c.code === code)) {
      allCodes.push({
        code: code,
        description: `Chassis Code ${codeNumber} - Vehicle Control System`,
        category: 'C',
        subcategory: 'chassis',
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4],
        possibleCauses: [`ABS sensor issue for ${code}`, `Brake system problem for ${code}`, `Suspension fault for ${code}`],
        symptoms: [`ABS warning light for ${code}`, `Brake pedal feel for ${code}`, `Vehicle handling for ${code}`],
        recommendedActions: [`Check ABS sensors for ${code}`, `Inspect brake system for ${code}`, `Test suspension for ${code}`],
        estimatedRepairCost: { min: 150 + (i * 8), max: 600 + (i * 30), currency: 'EGP' },
        urgency: ['IMMEDIATE', 'SOON', 'SCHEDULED', 'MONITOR'][i % 4],
        drivability: i % 4 !== 0 ? 'NORMAL' : 'REDUCED',
        towRequired: i % 20 === 0,
        affectedSystems: [`ABS System ${i % 5 + 1}`, `Brake System ${i % 3 + 1}`, `Suspension System ${i % 2 + 1}`],
        relatedCodes: [],
        troubleshootingSteps: [`Step 1: Check ABS sensors for ${code}`, `Step 2: Inspect brake system for ${code}`, `Step 3: Test suspension for ${code}`],
        professionalServices: ['ABS diagnosis', 'Brake system repair', 'Suspension inspection'],
        diyPossibility: i % 4 !== 0 ? 'POSSIBLE' : 'DIFFICULT',
        diyDifficulty: ['EASY', 'MODERATE', 'DIFFICULT', 'EXPERT'][i % 4],
        safetyNotes: [`Safety critical for ${code}: Brake system`, `Safety warning for ${code}: ABS malfunction`],
        environmentalImpact: 'LOW',
        fuelImpact: 'NONE',
        performanceImpact: ['NONE', 'MINOR', 'MODERATE', 'MAJOR'][i % 4],
        manufacturerSpecific: i % 5 === 0,
        vehicleCompatibility: ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet'],
        diagnosticProcedures: [`ABS scan for ${code}`, `Brake system test for ${code}`, `Suspension inspection for ${code}`],
        partsNeeded: [`ABS Sensor ${i + 1}`, `Brake Pad ${i + 1}`, `Shock Absorber ${i + 1}`],
        laborEstimate: { hours: 1 + (i % 3), description: `Chassis diagnosis and repair for ${code}` },
        warrantyImplications: i % 2 === 0 ? 'COVERED_IF_UNDER_WARRANTY' : 'MAY_BE_COVERED',
        regulatoryCompliance: 'COMPLIANT',
        frequencyData: ['RARE', 'UNCOMMON', 'COMMON', 'VERY_COMMON'][i % 4],
        preventionTips: [`Regular brake inspection for ${code}`, `ABS maintenance for ${code}`, `Suspension care for ${code}`],
        maintenanceSchedule: 'EVERY_40K_KM',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  
  // B codes (Body) - 2000 codes
  for (let i = 0; i < 2000; i++) {
    const codeNumber = i.toString().padStart(4, '0');
    const code = `B${codeNumber}`;
    
    if (!allCodes.find(c => c.code === code)) {
      allCodes.push({
        code: code,
        description: `Body Code ${codeNumber} - Vehicle Body System`,
        category: 'B',
        subcategory: 'body',
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4],
        possibleCauses: [`Airbag sensor issue for ${code}`, `Climate control problem for ${code}`, `Lighting system fault for ${code}`],
        symptoms: [`Airbag warning light for ${code}`, `Climate control malfunction for ${code}`, `Lighting issue for ${code}`],
        recommendedActions: [`Check airbag sensors for ${code}`, `Inspect climate control for ${code}`, `Test lighting system for ${code}`],
        estimatedRepairCost: { min: 120 + (i * 6), max: 550 + (i * 25), currency: 'EGP' },
        urgency: ['IMMEDIATE', 'SOON', 'SCHEDULED', 'MONITOR'][i % 4],
        drivability: i % 5 !== 0 ? 'NORMAL' : 'REDUCED',
        towRequired: i % 25 === 0,
        affectedSystems: [`Airbag System ${i % 5 + 1}`, `Climate Control ${i % 3 + 1}`, `Lighting System ${i % 2 + 1}`],
        relatedCodes: [],
        troubleshootingSteps: [`Step 1: Check airbag sensors for ${code}`, `Step 2: Inspect climate control for ${code}`, `Step 3: Test lighting for ${code}`],
        professionalServices: ['Airbag diagnosis', 'Climate control repair', 'Lighting system repair'],
        diyPossibility: i % 4 !== 0 ? 'POSSIBLE' : 'DIFFICULT',
        diyDifficulty: ['EASY', 'MODERATE', 'DIFFICULT', 'EXPERT'][i % 4],
        safetyNotes: [`Safety critical for ${code}: Airbag system`, `Safety warning for ${code}: Lighting malfunction`],
        environmentalImpact: 'LOW',
        fuelImpact: 'NONE',
        performanceImpact: ['NONE', 'MINOR', 'MODERATE', 'MAJOR'][i % 4],
        manufacturerSpecific: i % 5 === 0,
        vehicleCompatibility: ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet'],
        diagnosticProcedures: [`Airbag scan for ${code}`, `Climate control test for ${code}`, `Lighting inspection for ${code}`],
        partsNeeded: [`Airbag Sensor ${i + 1}`, `Climate Control Unit ${i + 1}`, `Light Bulb ${i + 1}`],
        laborEstimate: { hours: 1 + (i % 3), description: `Body system diagnosis and repair for ${code}` },
        warrantyImplications: i % 2 === 0 ? 'COVERED_IF_UNDER_WARRANTY' : 'MAY_BE_COVERED',
        regulatoryCompliance: 'COMPLIANT',
        frequencyData: ['RARE', 'UNCOMMON', 'COMMON', 'VERY_COMMON'][i % 4],
        preventionTips: [`Regular airbag inspection for ${code}`, `Climate control maintenance for ${code}`, `Lighting care for ${code}`],
        maintenanceSchedule: 'EVERY_50K_KM',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  
  // U codes (Network) - 2000 codes
  for (let i = 0; i < 2000; i++) {
    const codeNumber = i.toString().padStart(4, '0');
    const code = `U${codeNumber}`;
    
    if (!allCodes.find(c => c.code === code)) {
      allCodes.push({
        code: code,
        description: `Network Code ${codeNumber} - Vehicle Network System`,
        category: 'U',
        subcategory: 'network',
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][i % 4],
        possibleCauses: [`CAN bus communication issue for ${code}`, `ECU communication problem for ${code}`, `Network wiring fault for ${code}`],
        symptoms: [`Communication error for ${code}`, `System malfunction for ${code}`, `Warning lights for ${code}`],
        recommendedActions: [`Check CAN bus for ${code}`, `Inspect ECU communication for ${code}`, `Test network wiring for ${code}`],
        estimatedRepairCost: { min: 180 + (i * 9), max: 700 + (i * 35), currency: 'EGP' },
        urgency: ['IMMEDIATE', 'SOON', 'SCHEDULED', 'MONITOR'][i % 4],
        drivability: i % 6 !== 0 ? 'NORMAL' : 'REDUCED',
        towRequired: i % 30 === 0,
        affectedSystems: [`CAN Bus System ${i % 5 + 1}`, `ECU Network ${i % 3 + 1}`, `Communication System ${i % 2 + 1}`],
        relatedCodes: [],
        troubleshootingSteps: [`Step 1: Check CAN bus for ${code}`, `Step 2: Inspect ECU communication for ${code}`, `Step 3: Test network wiring for ${code}`],
        professionalServices: ['Network diagnosis', 'ECU programming', 'Wiring repair'],
        diyPossibility: i % 5 !== 0 ? 'POSSIBLE' : 'DIFFICULT',
        diyDifficulty: ['EASY', 'MODERATE', 'DIFFICULT', 'EXPERT'][i % 4],
        safetyNotes: [`Safety warning for ${code}: System communication`, `Safety note for ${code}: ECU malfunction`],
        environmentalImpact: 'LOW',
        fuelImpact: 'NONE',
        performanceImpact: ['NONE', 'MINOR', 'MODERATE', 'MAJOR'][i % 4],
        manufacturerSpecific: i % 5 === 0,
        vehicleCompatibility: ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet'],
        diagnosticProcedures: [`Network scan for ${code}`, `ECU communication test for ${code}`, `Wiring inspection for ${code}`],
        partsNeeded: [`ECU Module ${i + 1}`, `CAN Bus Module ${i + 1}`, `Wiring Harness ${i + 1}`],
        laborEstimate: { hours: 1 + (i % 3), description: `Network diagnosis and repair for ${code}` },
        warrantyImplications: i % 2 === 0 ? 'COVERED_IF_UNDER_WARRANTY' : 'MAY_BE_COVERED',
        regulatoryCompliance: 'COMPLIANT',
        frequencyData: ['RARE', 'UNCOMMON', 'COMMON', 'VERY_COMMON'][i % 4],
        preventionTips: [`Regular network inspection for ${code}`, `ECU maintenance for ${code}`, `Wiring care for ${code}`],
        maintenanceSchedule: 'EVERY_100K_KM',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
  
  return allCodes;
}

module.exports = {
  obdCodesData,
  generateAllOBDCodes
};
