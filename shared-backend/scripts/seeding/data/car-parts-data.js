// Comprehensive Car Parts Database with Lifespan Information
// This file contains thousands of car parts with detailed lifespan data

const carPartsData = {
  // Engine Components
  engine: [
    {
      name: 'Engine Oil Filter',
      category: 'filters',
      brand: 'Bosch',
      partNumber: 'BO-0986AF0061',
      description: 'High-quality engine oil filter for optimal engine protection',
      vehicleCompatibility: {
        makes: ['Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes'],
        models: ['Corolla', 'Civic', 'Altima', '3 Series', 'C-Class'],
        years: {
          start: 2010,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 100,
          width: 80,
          height: 50,
          unit: 'mm'
        },
        weight: {
          value: 0.5,
          unit: 'kg'
        },
        material: 'Synthetic fiber',
        color: 'White'
      },
      installationInfo: {
        difficulty: 'easy',
        estimatedTime: {
          value: 15,
          unit: 'minutes'
        },
        toolsRequired: ['Oil filter wrench', 'Drain pan'],
        instructions: 'Remove old filter, install new filter, add oil'
      },
      pricing: {
        cost: 150,
        currency: 'EGP',
        supplier: {
          name: 'Bosch Egypt',
          contact: '+20 123 456 789',
          website: 'https://www.bosch.com.eg'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 60,
          unit: 'months'
        },
        storageConditions: 'Dry, cool place'
      },
      status: 'available',
      images: [{
        url: 'oil-filter-1.jpg',
        alt: 'Engine Oil Filter',
        isPrimary: true
      }],
      ratings: {
        average: 4.5,
        count: 1250
      },
      reviews: [],
      tags: ['maintenance', 'essential', 'frequent-replacement'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      name: 'Timing Belt',
      category: 'engine',
      brand: 'Gates',
      partNumber: 'GT-5506',
      description: 'Premium timing belt for precise engine timing',
      vehicleCompatibility: {
        makes: ['Toyota', 'Honda', 'Nissan', 'Mazda'],
        models: ['Camry', 'Accord', 'Maxima', '3'],
        years: {
          start: 2005,
          end: 2020
        }
      },
      specifications: {
        dimensions: {
          length: 1200,
          width: 25,
          height: 8,
          unit: 'mm'
        },
        weight: {
          value: 0.3,
          unit: 'kg'
        },
        material: 'Neoprene',
        color: 'Black'
      },
      installationInfo: {
        difficulty: 'professional',
        estimatedTime: {
          value: 5,
          unit: 'hours'
        },
        toolsRequired: ['Timing tools', 'Wrenches', 'Pulley holder'],
        instructions: 'Remove timing cover, align timing marks, install new belt'
      },
      pricing: {
        cost: 800,
        currency: 'EGP',
        supplier: {
          name: 'Gates Egypt',
          contact: '+20 123 456 790',
          website: 'https://www.gates.com'
        }
      },
      expiryTracking: {
        hasExpiry: true,
        shelfLife: {
          value: 48,
          unit: 'months'
        },
        storageConditions: 'Dry, sealed package'
      },
      status: 'available',
      images: [{
        url: 'timing-belt-1.jpg',
        alt: 'Timing Belt',
        isPrimary: true
      }],
      ratings: {
        average: 4.7,
        count: 890
      },
      reviews: [],
      tags: ['critical', 'timing', 'engine'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      name: 'Spark Plugs',
      category: 'engine',
      brand: 'NGK',
      partNumber: 'NGK-7090',
      description: 'Iridium spark plugs for optimal ignition performance',
      vehicleCompatibility: {
        makes: ['All gasoline engines'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 19,
          width: 14,
          height: 19,
          unit: 'mm'
        },
        weight: {
          value: 0.1,
          unit: 'kg'
        },
        material: 'Iridium',
        color: 'Silver'
      },
      installationInfo: {
        difficulty: 'medium',
        estimatedTime: {
          value: 1,
          unit: 'hours'
        },
        toolsRequired: ['Spark plug socket', 'Torque wrench'],
        instructions: 'Remove ignition coils, replace spark plugs, torque to specification'
      },
      pricing: {
        cost: 120,
        currency: 'EGP',
        supplier: {
          name: 'NGK Egypt',
          contact: '+20 123 456 791',
          website: 'https://www.ngk.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 120,
          unit: 'months'
        },
        storageConditions: 'Dry, sealed package'
      },
      status: 'available',
      images: [{
        url: 'spark-plugs-1.jpg',
        alt: 'Spark Plugs',
        isPrimary: true
      }],
      ratings: {
        average: 4.6,
        count: 2100
      },
      reviews: [],
      tags: ['ignition', 'performance', 'maintenance'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],

  // Transmission Components
  transmission: [
    {
      name: 'Automatic Transmission Fluid',
      category: 'fluids',
      brand: 'Castrol',
      partNumber: 'CA-ATF-001',
      description: 'High-performance automatic transmission fluid',
      vehicleCompatibility: {
        makes: ['All automatic transmission vehicles'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 200,
          width: 100,
          height: 300,
          unit: 'mm'
        },
        weight: {
          value: 4,
          unit: 'kg'
        },
        material: 'Synthetic fluid',
        color: 'Red'
      },
      installationInfo: {
        difficulty: 'medium',
        estimatedTime: {
          value: 2,
          unit: 'hours'
        },
        toolsRequired: ['Fluid pump', 'Drain pan'],
        instructions: 'Drain old fluid, replace filter, add new fluid'
      },
      pricing: {
        cost: 450,
        currency: 'EGP',
        supplier: {
          name: 'Castrol Egypt',
          contact: '+20 123 456 792',
          website: 'https://www.castrol.com'
        }
      },
      expiryTracking: {
        hasExpiry: true,
        shelfLife: {
          value: 60,
          unit: 'months'
        },
        storageConditions: 'Sealed, cool place'
      },
      status: 'available',
      images: [{
        url: 'atf-1.jpg',
        alt: 'Automatic Transmission Fluid',
        isPrimary: true
      }],
      ratings: {
        average: 4.4,
        count: 750
      },
      reviews: [],
      tags: ['transmission', 'fluid', 'maintenance'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      name: 'Clutch Kit',
      category: 'transmission',
      brand: 'LUK',
      partNumber: 'LK-03-050',
      description: 'Complete clutch kit including disc, pressure plate, and bearing',
      vehicleCompatibility: {
        makes: ['Manual transmission vehicles'],
        models: ['All manual models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 240,
          width: 240,
          height: 50,
          unit: 'mm'
        },
        weight: {
          value: 8,
          unit: 'kg'
        },
        material: 'Organic friction',
        color: 'Black'
      },
      installationInfo: {
        difficulty: 'professional',
        estimatedTime: {
          value: 7,
          unit: 'hours'
        },
        toolsRequired: ['Clutch alignment tool', 'Transmission jack'],
        instructions: 'Remove transmission, replace clutch components, reinstall'
      },
      pricing: {
        cost: 2500,
        currency: 'EGP',
        supplier: {
          name: 'LUK Egypt',
          contact: '+20 123 456 793',
          website: 'https://www.luk.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 120,
          unit: 'months'
        },
        storageConditions: 'Dry, prevent rust'
      },
      status: 'available',
      images: [{
        url: 'clutch-kit-1.jpg',
        alt: 'Clutch Kit',
        isPrimary: true
      }],
      ratings: {
        average: 4.8,
        count: 420
      },
      reviews: [],
      tags: ['clutch', 'transmission', 'professional'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],

  // Brake Components
  brakes: [
    {
      name: 'Brake Pads (Front)',
      category: 'brakes',
      brand: 'Brembo',
      partNumber: 'BR-PAD-001',
      description: 'High-performance front brake pads for excellent stopping power',
      vehicleCompatibility: {
        makes: ['All passenger vehicles'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 150,
          width: 80,
          height: 20,
          unit: 'mm'
        },
        weight: {
          value: 0.8,
          unit: 'kg'
        },
        material: 'Ceramic compound',
        color: 'Gray'
      },
      installationInfo: {
        difficulty: 'medium',
        estimatedTime: {
          value: 1.5,
          unit: 'hours'
        },
        toolsRequired: ['Brake tools', 'C-clamp'],
        instructions: 'Remove caliper, replace pads, reinstall caliper'
      },
      pricing: {
        cost: 600,
        currency: 'EGP',
        supplier: {
          name: 'Brembo Egypt',
          contact: '+20 123 456 794',
          website: 'https://www.brembo.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 60,
          unit: 'months'
        },
        storageConditions: 'Dry, sealed package'
      },
      status: 'available',
      images: [{
        url: 'brake-pads-1.jpg',
        alt: 'Brake Pads',
        isPrimary: true
      }],
      ratings: {
        average: 4.6,
        count: 1800
      },
      reviews: [],
      tags: ['brakes', 'safety', 'maintenance'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      name: 'Brake Rotors',
      category: 'brakes',
      brand: 'Brembo',
      partNumber: 'BR-ROT-001',
      description: 'Premium brake rotors for optimal heat dissipation',
      vehicleCompatibility: {
        makes: ['All passenger vehicles'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 300,
          width: 300,
          height: 28,
          unit: 'mm'
        },
        weight: {
          value: 8,
          unit: 'kg'
        },
        material: 'Cast iron',
        color: 'Black'
      },
      installationInfo: {
        difficulty: 'medium',
        estimatedTime: {
          value: 2,
          unit: 'hours'
        },
        toolsRequired: ['Brake tools', 'Torque wrench'],
        instructions: 'Remove wheel and caliper, replace rotor, reinstall'
      },
      pricing: {
        cost: 1200,
        currency: 'EGP',
        supplier: {
          name: 'Brembo Egypt',
          contact: '+20 123 456 794',
          website: 'https://www.brembo.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 120,
          unit: 'months'
        },
        storageConditions: 'Dry, prevent rust'
      },
      status: 'available',
      images: [{
        url: 'brake-rotors-1.jpg',
        alt: 'Brake Rotors',
        isPrimary: true
      }],
      ratings: {
        average: 4.7,
        count: 950
      },
      reviews: [],
      tags: ['brakes', 'rotors', 'performance'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],

  // Suspension Components
  suspension: [
    {
      name: 'Shock Absorbers (Front)',
      category: 'suspension',
      brand: 'KYB',
      partNumber: 'KYB-334001',
      description: 'High-quality front shock absorbers for smooth ride',
      vehicleCompatibility: {
        makes: ['All passenger vehicles'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 400,
          width: 80,
          height: 80,
          unit: 'mm'
        },
        weight: {
          value: 2,
          unit: 'kg'
        },
        material: 'Steel',
        color: 'Black'
      },
      installationInfo: {
        difficulty: 'medium',
        estimatedTime: {
          value: 2,
          unit: 'hours'
        },
        toolsRequired: ['Spring compressor', 'Wrenches'],
        instructions: 'Remove old shocks, install new shocks, align if necessary'
      },
      pricing: {
        cost: 800,
        currency: 'EGP',
        supplier: {
          name: 'KYB Egypt',
          contact: '+20 123 456 795',
          website: 'https://www.kyb.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 120,
          unit: 'months'
        },
        storageConditions: 'Dry, prevent rust'
      },
      status: 'available',
      images: [{
        url: 'shock-absorbers-1.jpg',
        alt: 'Shock Absorbers',
        isPrimary: true
      }],
      ratings: {
        average: 4.5,
        count: 680
      },
      reviews: [],
      tags: ['suspension', 'ride-quality', 'handling'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      name: 'Control Arm Bushings',
      category: 'suspension',
      brand: 'Lemforder',
      partNumber: 'LF-123456',
      description: 'Durable control arm bushings for precise steering',
      vehicleCompatibility: {
        makes: ['All passenger vehicles'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 50,
          width: 50,
          height: 30,
          unit: 'mm'
        },
        weight: {
          value: 0.3,
          unit: 'kg'
        },
        material: 'Natural rubber',
        color: 'Black'
      },
      installationInfo: {
        difficulty: 'medium',
        estimatedTime: {
          value: 1.5,
          unit: 'hours'
        },
        toolsRequired: ['Bushing press', 'Wrenches'],
        instructions: 'Press out old bushings, press in new bushings'
      },
      pricing: {
        cost: 300,
        currency: 'EGP',
        supplier: {
          name: 'Lemforder Egypt',
          contact: '+20 123 456 796',
          website: 'https://www.lemforder.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 120,
          unit: 'months'
        },
        storageConditions: 'Dry, prevent UV exposure'
      },
      status: 'available',
      images: [{
        url: 'control-arm-bushings-1.jpg',
        alt: 'Control Arm Bushings',
        isPrimary: true
      }],
      ratings: {
        average: 4.3,
        count: 420
      },
      reviews: [],
      tags: ['suspension', 'bushings', 'steering'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],

  // Electrical Components
  electrical: [
    {
      name: 'Battery',
      category: 'battery',
      brand: 'Varta',
      partNumber: 'VT-60AH',
      description: 'High-performance automotive battery',
      vehicleCompatibility: {
        makes: ['All vehicles'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 300,
          width: 170,
          height: 200,
          unit: 'mm'
        },
        weight: {
          value: 15,
          unit: 'kg'
        },
        material: 'Lead-acid',
        color: 'Black'
      },
      installationInfo: {
        difficulty: 'easy',
        estimatedTime: {
          value: 0.5,
          unit: 'hours'
        },
        toolsRequired: ['Wrenches', 'Battery terminal cleaner'],
        instructions: 'Disconnect terminals, remove old battery, install new battery'
      },
      pricing: {
        cost: 1200,
        currency: 'EGP',
        supplier: {
          name: 'Varta Egypt',
          contact: '+20 123 456 797',
          website: 'https://www.varta.com'
        }
      },
      expiryTracking: {
        hasExpiry: true,
        shelfLife: {
          value: 36,
          unit: 'months'
        },
        storageConditions: 'Charged, cool place'
      },
      status: 'available',
      images: [{
        url: 'battery-1.jpg',
        alt: 'Automotive Battery',
        isPrimary: true
      }],
      ratings: {
        average: 4.4,
        count: 1500
      },
      reviews: [],
      tags: ['electrical', 'starting', 'essential'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      name: 'Alternator',
      category: 'electrical',
      brand: 'Bosch',
      partNumber: 'BO-ALT-001',
      description: 'High-output alternator for reliable charging',
      vehicleCompatibility: {
        makes: ['All vehicles'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 200,
          width: 150,
          height: 150,
          unit: 'mm'
        },
        weight: {
          value: 5,
          unit: 'kg'
        },
        material: 'Aluminum',
        color: 'Silver'
      },
      installationInfo: {
        difficulty: 'medium',
        estimatedTime: {
          value: 2,
          unit: 'hours'
        },
        toolsRequired: ['Wrenches', 'Belt tensioner tool'],
        instructions: 'Remove belt, disconnect wiring, replace alternator'
      },
      pricing: {
        cost: 2500,
        currency: 'EGP',
        supplier: {
          name: 'Bosch Egypt',
          contact: '+20 123 456 789',
          website: 'https://www.bosch.com.eg'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 120,
          unit: 'months'
        },
        storageConditions: 'Dry, prevent moisture'
      },
      status: 'available',
      images: [{
        url: 'alternator-1.jpg',
        alt: 'Alternator',
        isPrimary: true
      }],
      ratings: {
        average: 4.6,
        count: 780
      },
      reviews: [],
      tags: ['electrical', 'charging', 'performance'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ],

  // Cooling System
  cooling: [
    {
      name: 'Radiator',
      category: 'cooling',
      brand: 'Nissens',
      partNumber: 'NI-RAD-001',
      description: 'High-efficiency radiator for optimal engine cooling',
      vehicleCompatibility: {
        makes: ['All vehicles'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 600,
          width: 400,
          height: 50,
          unit: 'mm'
        },
        weight: {
          value: 5,
          unit: 'kg'
        },
        material: 'Aluminum',
        color: 'Silver'
      },
      installationInfo: {
        difficulty: 'medium',
        estimatedTime: {
          value: 3,
          unit: 'hours'
        },
        toolsRequired: ['Wrenches', 'Coolant drain pan'],
        instructions: 'Drain coolant, remove hoses, replace radiator, refill coolant'
      },
      pricing: {
        cost: 1800,
        currency: 'EGP',
        supplier: {
          name: 'Nissens Egypt',
          contact: '+20 123 456 798',
          website: 'https://www.nissens.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 180,
          unit: 'months'
        },
        storageConditions: 'Dry, prevent damage'
      },
      status: 'available',
      images: [{
        url: 'radiator-1.jpg',
        alt: 'Radiator',
        isPrimary: true
      }],
      ratings: {
        average: 4.5,
        count: 320
      },
      reviews: [],
      tags: ['cooling', 'engine', 'performance'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      name: 'Water Pump',
      category: 'cooling',
      brand: 'GMB',
      partNumber: 'GM-WP-001',
      description: 'Reliable water pump for coolant circulation',
      vehicleCompatibility: {
        makes: ['All vehicles'],
        models: ['All models'],
        years: {
          start: 1990,
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 150,
          width: 150,
          height: 100,
          unit: 'mm'
        },
        weight: {
          value: 2,
          unit: 'kg'
        },
        material: 'Cast iron',
        color: 'Black'
      },
      installationInfo: {
        difficulty: 'medium',
        estimatedTime: {
          value: 2,
          unit: 'hours'
        },
        toolsRequired: ['Wrenches', 'Gasket scraper'],
        instructions: 'Remove belt, replace water pump, install new gasket'
      },
      pricing: {
        cost: 600,
        currency: 'EGP',
        supplier: {
          name: 'GMB Egypt',
          contact: '+20 123 456 799',
          website: 'https://www.gmb.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 120,
          unit: 'months'
        },
        storageConditions: 'Dry, prevent rust'
      },
      status: 'available',
      images: [{
        url: 'water-pump-1.jpg',
        alt: 'Water Pump',
        isPrimary: true
      }],
      ratings: {
        average: 4.4,
        count: 450
      },
      reviews: [],
      tags: ['cooling', 'water-pump', 'circulation'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ]
};

// Generate comprehensive car parts array with lifespan data
function generateAllCarParts() {
  const allParts = [];
  
  // Add parts from each category
  Object.values(carPartsData).forEach(category => {
    if (Array.isArray(category)) {
      allParts.push(...category);
    }
  });
  
  // Generate additional parts programmatically for comprehensive coverage
  // Engine parts - 5000 parts
  for (let i = 0; i < 5000; i++) {
    const partNumber = `ENG-${i.toString().padStart(6, '0')}`;
    const partTypes = ['Piston', 'Crankshaft', 'Camshaft', 'Valve', 'Connecting Rod', 'Cylinder Head', 'Engine Block', 'Oil Pump', 'Fuel Pump', 'Turbocharger'];
    const partType = partTypes[i % partTypes.length];
    
    allParts.push({
      name: `${partType} ${i + 1}`,
      category: 'engine',
      brand: ['Bosch', 'NGK', 'Gates', 'Continental', 'Mahle'][i % 5],
      partNumber: partNumber,
      description: `High-quality ${partType.toLowerCase()} for optimal engine performance`,
      vehicleCompatibility: {
        makes: ['Toyota', 'Honda', 'Nissan', 'BMW', 'Mercedes'],
        models: ['Corolla', 'Civic', 'Altima', '3 Series', 'C-Class'],
        years: {
          start: 2010 + (i % 10),
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 50 + (i % 20),
          width: 30 + (i % 15),
          height: 20 + (i % 10),
          unit: 'mm'
        },
        weight: {
          value: 0.1 + (i % 5),
          unit: 'kg'
        },
        material: ['Steel', 'Aluminum', 'Cast Iron', 'Titanium'][i % 4],
        color: ['Black', 'Silver', 'Gray', 'Gold'][i % 4]
      },
      installationInfo: {
        difficulty: ['easy', 'medium', 'hard', 'professional'][i % 4],
        estimatedTime: {
          value: 1 + (i % 4),
          unit: 'hours'
        },
        toolsRequired: ['Basic tools', 'Specialized equipment'],
        instructions: 'Follow manufacturer guidelines for proper installation'
      },
      pricing: {
        cost: 500 + (i * 10),
        currency: 'EGP',
        supplier: {
          name: 'Auto Parts Egypt',
          contact: '+20 123 456 700',
          website: 'https://www.autopartsegypt.com'
        }
      },
      expiryTracking: {
        hasExpiry: i % 3 === 0,
        shelfLife: {
          value: 60 + (i % 60),
          unit: 'months'
        },
        storageConditions: 'Dry, cool place'
      },
      status: 'available',
      images: [{
        url: `${partType.toLowerCase()}-${i + 1}.jpg`,
        alt: `${partType} ${i + 1}`,
        isPrimary: true
      }],
      ratings: {
        average: 4.0 + (i % 10) / 10,
        count: 100 + (i * 5)
      },
      reviews: [],
      tags: ['engine', 'performance', 'maintenance'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  // Transmission parts - 3000 parts
  for (let i = 0; i < 3000; i++) {
    const partNumber = `TRN-${i.toString().padStart(6, '0')}`;
    const partTypes = ['Gear', 'Shaft', 'Bearing', 'Seal', 'Synchronizer', 'Fork', 'Hub', 'Ring', 'Planet', 'Sun'];
    const partType = partTypes[i % partTypes.length];
    
    allParts.push({
      name: `${partType} ${i + 1}`,
      category: 'transmission',
      brand: ['ZF', 'Getrag', 'Aisin', 'Jatco', 'LUK'][i % 5],
      partNumber: partNumber,
      description: `Precision ${partType.toLowerCase()} for smooth transmission operation`,
      vehicleCompatibility: {
        makes: ['All transmission types'],
        models: ['All models'],
        years: {
          start: 2000 + (i % 15),
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 100 + (i % 50),
          width: 50 + (i % 30),
          height: 30 + (i % 20),
          unit: 'mm'
        },
        weight: {
          value: 0.5 + (i % 3),
          unit: 'kg'
        },
        material: ['Steel', 'Bronze', 'Aluminum', 'Composite'][i % 4],
        color: ['Silver', 'Gold', 'Black', 'Gray'][i % 4]
      },
      installationInfo: {
        difficulty: 'professional',
        estimatedTime: {
          value: 3 + (i % 4),
          unit: 'hours'
        },
        toolsRequired: ['Transmission tools', 'Lifting equipment'],
        instructions: 'Professional installation required'
      },
      pricing: {
        cost: 800 + (i * 15),
        currency: 'EGP',
        supplier: {
          name: 'Transmission Parts Egypt',
          contact: '+20 123 456 701',
          website: 'https://www.transmissionparts.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 120 + (i % 60),
          unit: 'months'
        },
        storageConditions: 'Dry, prevent rust'
      },
      status: 'available',
      images: [{
        url: `${partType.toLowerCase()}-${i + 1}.jpg`,
        alt: `${partType} ${i + 1}`,
        isPrimary: true
      }],
      ratings: {
        average: 4.2 + (i % 8) / 10,
        count: 80 + (i * 3)
      },
      reviews: [],
      tags: ['transmission', 'precision', 'professional'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  // Brake parts - 4000 parts
  for (let i = 0; i < 4000; i++) {
    const partNumber = `BRK-${i.toString().padStart(6, '0')}`;
    const partTypes = ['Pad', 'Rotor', 'Caliper', 'Master Cylinder', 'Wheel Cylinder', 'Brake Line', 'ABS Sensor', 'Brake Booster', 'Proportioning Valve', 'Brake Fluid'];
    const partType = partTypes[i % partTypes.length];
    
    allParts.push({
      name: `${partType} ${i + 1}`,
      category: 'brakes',
      brand: ['Brembo', 'ATE', 'TRW', 'Bosch', 'Continental'][i % 5],
      partNumber: partNumber,
      description: `High-performance ${partType.toLowerCase()} for reliable braking`,
      vehicleCompatibility: {
        makes: ['All vehicles'],
        models: ['All models'],
        years: {
          start: 1990 + (i % 20),
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 100 + (i % 100),
          width: 50 + (i % 50),
          height: 20 + (i % 30),
          unit: 'mm'
        },
        weight: {
          value: 0.5 + (i % 5),
          unit: 'kg'
        },
        material: ['Steel', 'Ceramic', 'Aluminum', 'Composite'][i % 4],
        color: ['Black', 'Gray', 'Silver', 'Red'][i % 4]
      },
      installationInfo: {
        difficulty: ['easy', 'medium', 'hard', 'professional'][i % 4],
        estimatedTime: {
          value: 1 + (i % 3),
          unit: 'hours'
        },
        toolsRequired: ['Brake tools', 'Safety equipment'],
        instructions: 'Follow safety procedures for brake system work'
      },
      pricing: {
        cost: 400 + (i * 12),
        currency: 'EGP',
        supplier: {
          name: 'Brake Parts Egypt',
          contact: '+20 123 456 702',
          website: 'https://www.brakepartsegypt.com'
        }
      },
      expiryTracking: {
        hasExpiry: i % 2 === 0,
        shelfLife: {
          value: 60 + (i % 60),
          unit: 'months'
        },
        storageConditions: 'Dry, sealed package'
      },
      status: 'available',
      images: [{
        url: `${partType.toLowerCase()}-${i + 1}.jpg`,
        alt: `${partType} ${i + 1}`,
        isPrimary: true
      }],
      ratings: {
        average: 4.3 + (i % 7) / 10,
        count: 120 + (i * 4)
      },
      reviews: [],
      tags: ['brakes', 'safety', 'performance'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  // Suspension parts - 3000 parts
  for (let i = 0; i < 3000; i++) {
    const partNumber = `SUS-${i.toString().padStart(6, '0')}`;
    const partTypes = ['Shock', 'Spring', 'Bushing', 'Ball Joint', 'Tie Rod', 'Stabilizer Bar', 'Control Arm', 'Strut', 'Bearing', 'Mount'];
    const partType = partTypes[i % partTypes.length];
    
    allParts.push({
      name: `${partType} ${i + 1}`,
      category: 'suspension',
      brand: ['KYB', 'Bilstein', 'Sachs', 'Monroe', 'Lemforder'][i % 5],
      partNumber: partNumber,
      description: `Durable ${partType.toLowerCase()} for smooth ride and handling`,
      vehicleCompatibility: {
        makes: ['All vehicles'],
        models: ['All models'],
        years: {
          start: 1990 + (i % 25),
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 200 + (i % 200),
          width: 100 + (i % 100),
          height: 50 + (i % 50),
          unit: 'mm'
        },
        weight: {
          value: 1 + (i % 5),
          unit: 'kg'
        },
        material: ['Steel', 'Aluminum', 'Rubber', 'Polyurethane'][i % 4],
        color: ['Black', 'Silver', 'Gray', 'Blue'][i % 4]
      },
      installationInfo: {
        difficulty: ['medium', 'hard', 'professional'][i % 3],
        estimatedTime: {
          value: 2 + (i % 3),
          unit: 'hours'
        },
        toolsRequired: ['Suspension tools', 'Alignment equipment'],
        instructions: 'Professional installation recommended'
      },
      pricing: {
        cost: 600 + (i * 18),
        currency: 'EGP',
        supplier: {
          name: 'Suspension Parts Egypt',
          contact: '+20 123 456 703',
          website: 'https://www.suspensionpartsegypt.com'
        }
      },
      expiryTracking: {
        hasExpiry: false,
        shelfLife: {
          value: 120 + (i % 60),
          unit: 'months'
        },
        storageConditions: 'Dry, prevent UV exposure'
      },
      status: 'available',
      images: [{
        url: `${partType.toLowerCase()}-${i + 1}.jpg`,
        alt: `${partType} ${i + 1}`,
        isPrimary: true
      }],
      ratings: {
        average: 4.4 + (i % 6) / 10,
        count: 90 + (i * 3)
      },
      reviews: [],
      tags: ['suspension', 'ride-quality', 'handling'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  // Electrical parts - 2000 parts
  for (let i = 0; i < 2000; i++) {
    const partNumber = `ELC-${i.toString().padStart(6, '0')}`;
    const partTypes = ['Sensor', 'Relay', 'Fuse', 'Switch', 'Motor', 'Solenoid', 'Module', 'Harness', 'Connector', 'Light'];
    const partType = partTypes[i % partTypes.length];
    
    allParts.push({
      name: `${partType} ${i + 1}`,
      category: 'electrical',
      brand: ['Bosch', 'Valeo', 'Hella', 'Denso', 'Continental'][i % 5],
      partNumber: partNumber,
      description: `Reliable ${partType.toLowerCase()} for electrical system`,
      vehicleCompatibility: {
        makes: ['All vehicles'],
        models: ['All models'],
        years: {
          start: 1990 + (i % 25),
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 50 + (i % 100),
          width: 30 + (i % 50),
          height: 20 + (i % 30),
          unit: 'mm'
        },
        weight: {
          value: 0.1 + (i % 2),
          unit: 'kg'
        },
        material: ['Plastic', 'Metal', 'Composite', 'Glass'][i % 4],
        color: ['Black', 'White', 'Red', 'Blue'][i % 4]
      },
      installationInfo: {
        difficulty: ['easy', 'medium', 'hard', 'professional'][i % 4],
        estimatedTime: {
          value: 1 + (i % 2),
          unit: 'hours'
        },
        toolsRequired: ['Electrical tools', 'Multimeter'],
        instructions: 'Disconnect battery before installation'
      },
      pricing: {
        cost: 300 + (i * 20),
        currency: 'EGP',
        supplier: {
          name: 'Electrical Parts Egypt',
          contact: '+20 123 456 704',
          website: 'https://www.electricalpartsegypt.com'
        }
      },
      expiryTracking: {
        hasExpiry: i % 3 === 0,
        shelfLife: {
          value: 120 + (i % 60),
          unit: 'months'
        },
        storageConditions: 'Dry, prevent moisture'
      },
      status: 'available',
      images: [{
        url: `${partType.toLowerCase()}-${i + 1}.jpg`,
        alt: `${partType} ${i + 1}`,
        isPrimary: true
      }],
      ratings: {
        average: 4.1 + (i % 9) / 10,
        count: 70 + (i * 2)
      },
      reviews: [],
      tags: ['electrical', 'performance', 'safety'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  // Cooling parts - 2000 parts
  for (let i = 0; i < 2000; i++) {
    const partNumber = `CLD-${i.toString().padStart(6, '0')}`;
    const partTypes = ['Thermostat', 'Fan', 'Hose', 'Reservoir', 'Cap', 'Sensor', 'Pump', 'Core', 'Tank', 'Gasket'];
    const partType = partTypes[i % partTypes.length];
    
    allParts.push({
      name: `${partType} ${i + 1}`,
      category: 'cooling',
      brand: ['Gates', 'GMB', 'Nissens', 'Behr', 'Valeo'][i % 5],
      partNumber: partNumber,
      description: `Efficient ${partType.toLowerCase()} for engine cooling`,
      vehicleCompatibility: {
        makes: ['All vehicles'],
        models: ['All models'],
        years: {
          start: 1990 + (i % 25),
          end: 2024
        }
      },
      specifications: {
        dimensions: {
          length: 100 + (i % 150),
          width: 50 + (i % 100),
          height: 30 + (i % 50),
          unit: 'mm'
        },
        weight: {
          value: 0.2 + (i % 3),
          unit: 'kg'
        },
        material: ['Aluminum', 'Plastic', 'Rubber', 'Steel'][i % 4],
        color: ['Silver', 'Black', 'Blue', 'Green'][i % 4]
      },
      installationInfo: {
        difficulty: ['easy', 'medium', 'hard', 'professional'][i % 4],
        estimatedTime: {
          value: 1 + (i % 3),
          unit: 'hours'
        },
        toolsRequired: ['Basic tools', 'Coolant'],
        instructions: 'Drain coolant before installation'
      },
      pricing: {
        cost: 200 + (i * 25),
        currency: 'EGP',
        supplier: {
          name: 'Cooling Parts Egypt',
          contact: '+20 123 456 705',
          website: 'https://www.coolingpartsegypt.com'
        }
      },
      expiryTracking: {
        hasExpiry: i % 2 === 0,
        shelfLife: {
          value: 120 + (i % 60),
          unit: 'months'
        },
        storageConditions: 'Dry, prevent corrosion'
      },
      status: 'available',
      images: [{
        url: `${partType.toLowerCase()}-${i + 1}.jpg`,
        alt: `${partType} ${i + 1}`,
        isPrimary: true
      }],
      ratings: {
        average: 4.2 + (i % 8) / 10,
        count: 60 + (i * 2)
      },
      reviews: [],
      tags: ['cooling', 'engine', 'temperature'],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
  
  return allParts;
}

module.exports = {
  carPartsData,
  generateAllCarParts
};
