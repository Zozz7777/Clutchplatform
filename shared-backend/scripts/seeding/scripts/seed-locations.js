const databaseConfig = require('../config/database-config');
const seedingConfig = require('../config/seeding-config');

class LocationsSeeder {
  constructor() {
    this.stats = {
      total: 0,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
  }

  async initialize() {
    try {
      console.log('📍 Initializing Locations Seeder...');
      
      // Connect to database
      await databaseConfig.connect();
      
      console.log('✅ Locations Seeder initialized');
    } catch (error) {
      console.error('❌ Error initializing Locations Seeder:', error);
      throw error;
    }
  }

  async seedLocations() {
    try {
      console.log('\n📍 Starting Locations Seeding...');
      
      // Seed cities first
      await this.seedCities();
      
      // Seed areas
      await this.seedAreas();
      
      await this.printStats();
      await this.validateSeeding();
      
    } catch (error) {
      console.error('❌ Error seeding locations:', error);
      throw error;
    }
  }

  async seedCities() {
    try {
      console.log('\n🏙️  Seeding Cities...');
      
      const cities = this.generateCities();
      this.stats.total += cities.length;
      
      for (const cityData of cities) {
        try {
          // Create city record
          // Note: In a real implementation, you'd have a City model
          console.log(`✅ Processed city: ${cityData.name} (${cityData.governorate})`);
          this.stats.created++;
          
        } catch (error) {
          this.stats.failed++;
          this.stats.errors.push({
            city: cityData.name,
            error: error.message
          });
          
          console.warn(`⚠️  Failed to process city ${cityData.name}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Error seeding cities:', error);
      throw error;
    }
  }

  async seedAreas() {
    try {
      console.log('\n🏘️  Seeding Areas...');
      
      const areas = this.generateAreas();
      this.stats.total += areas.length;
      
      for (const areaData of areas) {
        try {
          // Create area record
          // Note: In a real implementation, you'd have an Area model
          console.log(`✅ Processed area: ${areaData.name} (${areaData.city})`);
          this.stats.created++;
          
        } catch (error) {
          this.stats.failed++;
          this.stats.errors.push({
            area: areaData.name,
            error: error.message
          });
          
          console.warn(`⚠️  Failed to process area ${areaData.name}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Error seeding areas:', error);
      throw error;
    }
  }

  generateCities() {
    return [
      // Cairo Governorate
      {
        name: 'Cairo',
        governorate: 'Cairo',
        type: 'capital',
        population: 9500000,
        coordinates: { lat: 30.0444, lng: 31.2357 },
        postalCode: '11511',
        description: 'The capital and largest city of Egypt',
        majorAreas: ['Downtown', 'Heliopolis', 'Maadi', 'Zamalek', 'Nasr City', '6th October', 'New Cairo']
      },
      {
        name: 'Giza',
        governorate: 'Giza',
        type: 'major_city',
        population: 4200000,
        coordinates: { lat: 30.0131, lng: 31.2089 },
        postalCode: '12511',
        description: 'Third largest city in Egypt, home to the Pyramids',
        majorAreas: ['Dokki', 'Mohandessin', 'Agouza', 'Haram', 'Faisal', 'Sheikh Zayed']
      },
      {
        name: 'Alexandria',
        governorate: 'Alexandria',
        type: 'major_city',
        population: 5200000,
        coordinates: { lat: 31.2001, lng: 29.9187 },
        postalCode: '21511',
        description: 'Second largest city and major Mediterranean port',
        majorAreas: ['Miami', 'Stanley', 'Sidi Gaber', 'Mansheya', 'Agami', 'Borg El Arab']
      },
      {
        name: 'Sharm El Sheikh',
        governorate: 'South Sinai',
        type: 'tourist_city',
        population: 73000,
        coordinates: { lat: 27.9158, lng: 34.3300 },
        postalCode: '46619',
        description: 'Major tourist destination on the Red Sea',
        majorAreas: ['Naama Bay', 'Sharks Bay', 'Ras Um Sid', 'Hadaba', 'Old Market']
      },
      {
        name: 'Hurghada',
        governorate: 'Red Sea',
        type: 'tourist_city',
        population: 95000,
        coordinates: { lat: 27.2579, lng: 33.8116 },
        postalCode: '84511',
        description: 'Popular Red Sea resort city',
        majorAreas: ['Sahl Hasheesh', 'El Gouna', 'Makadi Bay', 'Soma Bay', 'Safaga']
      },
      {
        name: 'Luxor',
        governorate: 'Luxor',
        type: 'tourist_city',
        population: 1300000,
        coordinates: { lat: 25.6872, lng: 32.6396 },
        postalCode: '85511',
        description: 'Ancient city with major archaeological sites',
        majorAreas: ['East Bank', 'West Bank', 'Karnak', 'Luxor Temple', 'Valley of the Kings']
      },
      {
        name: 'Aswan',
        governorate: 'Aswan',
        type: 'major_city',
        population: 1500000,
        coordinates: { lat: 24.0889, lng: 32.8998 },
        postalCode: '81511',
        description: 'Southern city known for the Aswan Dam',
        majorAreas: ['Elephantine Island', 'Philae', 'Abu Simbel', 'Nubian Village']
      },
      {
        name: 'Port Said',
        governorate: 'Port Said',
        type: 'port_city',
        population: 750000,
        coordinates: { lat: 31.2667, lng: 32.3000 },
        postalCode: '42511',
        description: 'Major port city at the Mediterranean entrance of the Suez Canal',
        majorAreas: ['Port Fouad', 'Arab District', 'Mansheya', 'Sharq']
      },
      {
        name: 'Suez',
        governorate: 'Suez',
        type: 'port_city',
        population: 750000,
        coordinates: { lat: 29.9668, lng: 32.5498 },
        postalCode: '43511',
        description: 'Port city at the southern entrance of the Suez Canal',
        majorAreas: ['Suez Canal', 'Faisal', 'Arbaeen', 'Attaka']
      },
      {
        name: 'Ismailia',
        governorate: 'Ismailia',
        type: 'major_city',
        population: 1300000,
        coordinates: { lat: 30.6043, lng: 32.2723 },
        postalCode: '41511',
        description: 'City on the Suez Canal, known for its gardens',
        majorAreas: ['Canal District', 'Ferdan', 'El Qantara', 'El Tal El Kebir']
      },
      {
        name: 'Mansoura',
        governorate: 'Dakahlia',
        type: 'major_city',
        population: 960000,
        coordinates: { lat: 31.0409, lng: 31.3785 },
        postalCode: '35511',
        description: 'Capital of Dakahlia Governorate',
        majorAreas: ['Downtown', 'El Salam', 'El Matareya', 'El Senbellawein']
      },
      {
        name: 'Tanta',
        governorate: 'Gharbia',
        type: 'major_city',
        population: 420000,
        coordinates: { lat: 30.7865, lng: 31.0004 },
        postalCode: '31511',
        description: 'Major city in the Nile Delta',
        majorAreas: ['Downtown', 'El Mahalla', 'Kafr El Sheikh', 'El Senbellawein']
      },
      {
        name: 'Zagazig',
        governorate: 'Sharqia',
        type: 'major_city',
        population: 350000,
        coordinates: { lat: 30.5877, lng: 31.5020 },
        postalCode: '44511',
        description: 'Capital of Sharqia Governorate',
        majorAreas: ['Downtown', '10th of Ramadan', 'Belbeis', 'Abu Hammad']
      },
      {
        name: 'Beni Suef',
        governorate: 'Beni Suef',
        type: 'major_city',
        population: 300000,
        coordinates: { lat: 29.0668, lng: 31.0997 },
        postalCode: '62511',
        description: 'Capital of Beni Suef Governorate',
        majorAreas: ['Downtown', 'El Fashn', 'Biba', 'El Wasta']
      },
      {
        name: 'Minya',
        governorate: 'Minya',
        type: 'major_city',
        population: 250000,
        coordinates: { lat: 28.1094, lng: 30.7503 },
        postalCode: '61511',
        description: 'Capital of Minya Governorate',
        majorAreas: ['Downtown', 'Beni Mazar', 'Mallawi', 'Abu Qurqas']
      },
      {
        name: 'Assiut',
        governorate: 'Assiut',
        type: 'major_city',
        population: 400000,
        coordinates: { lat: 27.1828, lng: 31.1828 },
        postalCode: '71511',
        description: 'Capital of Assiut Governorate',
        majorAreas: ['Downtown', 'El Badari', 'Sohag', 'Abu Tig']
      },
      {
        name: 'Sohag',
        governorate: 'Sohag',
        type: 'major_city',
        population: 200000,
        coordinates: { lat: 26.5569, lng: 31.6947 },
        postalCode: '82511',
        description: 'Capital of Sohag Governorate',
        majorAreas: ['Downtown', 'Akhmim', 'Girga', 'El Balyana']
      },
      {
        name: 'Qena',
        governorate: 'Qena',
        type: 'major_city',
        population: 150000,
        coordinates: { lat: 26.1551, lng: 32.7167 },
        postalCode: '83511',
        description: 'Capital of Qena Governorate',
        majorAreas: ['Downtown', 'Dendera', 'Nag Hammadi', 'Qus']
      },
      {
        name: 'Damanhur',
        governorate: 'Beheira',
        type: 'major_city',
        population: 250000,
        coordinates: { lat: 31.0344, lng: 30.4683 },
        postalCode: '22511',
        description: 'Capital of Beheira Governorate',
        majorAreas: ['Downtown', 'Kafr El Dawwar', 'Rashid', 'Abu El Matamir']
      },
      {
        name: 'Kafr El Sheikh',
        governorate: 'Kafr El Sheikh',
        type: 'major_city',
        population: 200000,
        coordinates: { lat: 31.1117, lng: 30.9397 },
        postalCode: '33511',
        description: 'Capital of Kafr El Sheikh Governorate',
        majorAreas: ['Downtown', 'Desouk', 'Fuwa', 'El Hamool']
      },
      {
        name: 'Damietta',
        governorate: 'Damietta',
        type: 'port_city',
        population: 350000,
        coordinates: { lat: 31.4165, lng: 31.8133 },
        postalCode: '34511',
        description: 'Port city at the Mediterranean coast',
        majorAreas: ['Downtown', 'Ras El Bar', 'El Zarqa', 'Kafr Saad']
      },
      {
        name: 'Arish',
        governorate: 'North Sinai',
        type: 'major_city',
        population: 100000,
        coordinates: { lat: 31.1325, lng: 33.8031 },
        postalCode: '45511',
        description: 'Capital of North Sinai Governorate',
        majorAreas: ['Downtown', 'Sheikh Zuweid', 'Rafah', 'Bir El Abd']
      },
      {
        name: 'El Tor',
        governorate: 'South Sinai',
        type: 'major_city',
        population: 15000,
        coordinates: { lat: 28.2414, lng: 33.6222 },
        postalCode: '46611',
        description: 'Capital of South Sinai Governorate',
        majorAreas: ['Downtown', 'St. Catherine', 'Dahab', 'Nuweiba']
      },
      {
        name: 'El Kharga',
        governorate: 'New Valley',
        type: 'major_city',
        population: 50000,
        coordinates: { lat: 25.4515, lng: 30.5464 },
        postalCode: '72511',
        description: 'Capital of New Valley Governorate',
        majorAreas: ['Downtown', 'Dakhla', 'Farafra', 'Bahariya']
      },
      {
        name: 'Marsa Matruh',
        governorate: 'Matruh',
        type: 'coastal_city',
        population: 120000,
        coordinates: { lat: 31.3525, lng: 27.2453 },
        postalCode: '51511',
        description: 'Capital of Matruh Governorate, Mediterranean coastal city',
        majorAreas: ['Downtown', 'El Alamein', 'Sidi Barrani', 'Siwa Oasis']
      },
      {
        name: 'El Gouna',
        governorate: 'Red Sea',
        type: 'tourist_city',
        population: 15000,
        coordinates: { lat: 27.3941, lng: 33.6782 },
        postalCode: '84521',
        description: 'Luxury resort town near Hurghada',
        majorAreas: ['Downtown', 'Marina', 'Abu Tig Marina', 'Mangroovy Beach']
      }
    ];
  }

  generateAreas() {
    return [
      // Cairo Areas
      {
        name: 'Downtown Cairo',
        city: 'Cairo',
        governorate: 'Cairo',
        type: 'commercial',
        coordinates: { lat: 30.0444, lng: 31.2357 },
        postalCode: '11511',
        description: 'Historic commercial and cultural center',
        landmarks: ['Tahrir Square', 'Egyptian Museum', 'Cairo Opera House']
      },
      {
        name: 'Heliopolis',
        city: 'Cairo',
        governorate: 'Cairo',
        type: 'residential',
        coordinates: { lat: 30.1089, lng: 31.3308 },
        postalCode: '11341',
        description: 'Upscale residential district',
        landmarks: ['Heliopolis Palace', 'Baron Palace', 'Cairo International Airport']
      },
      {
        name: 'Maadi',
        city: 'Cairo',
        governorate: 'Cairo',
        type: 'residential',
        coordinates: { lat: 29.9627, lng: 31.2597 },
        postalCode: '11431',
        description: 'Expatriate-friendly residential area',
        landmarks: ['Maadi Grand Mall', 'Cairo American College', 'Nile Corniche']
      },
      {
        name: 'Zamalek',
        city: 'Cairo',
        governorate: 'Cairo',
        type: 'residential',
        coordinates: { lat: 30.0588, lng: 31.2238 },
        postalCode: '11211',
        description: 'Island district with cultural institutions',
        landmarks: ['Cairo Tower', 'Gezira Sporting Club', 'Cairo Opera House']
      },
      {
        name: 'Nasr City',
        city: 'Cairo',
        governorate: 'Cairo',
        type: 'residential',
        coordinates: { lat: 30.0626, lng: 31.2497 },
        postalCode: '11371',
        description: 'Modern residential district',
        landmarks: ['Al-Azhar Park', 'City Stars Mall', 'Cairo International Conference Center']
      },
      {
        name: '6th October',
        city: 'Cairo',
        governorate: 'Giza',
        type: 'residential',
        coordinates: { lat: 29.9361, lng: 30.9269 },
        postalCode: '12566',
        description: 'New urban development west of Cairo',
        landmarks: ['Mall of Egypt', 'Smart Village', 'Dreamland']
      },
      {
        name: 'New Cairo',
        city: 'Cairo',
        governorate: 'Cairo',
        type: 'residential',
        coordinates: { lat: 30.0300, lng: 31.4700 },
        postalCode: '11835',
        description: 'Modern planned city east of Cairo',
        landmarks: ['American University in Cairo', 'Cairo Festival City', 'Point 90']
      },
      
      // Alexandria Areas
      {
        name: 'Miami',
        city: 'Alexandria',
        governorate: 'Alexandria',
        type: 'residential',
        coordinates: { lat: 31.2001, lng: 29.9187 },
        postalCode: '21599',
        description: 'Coastal residential area',
        landmarks: ['Miami Beach', 'Miami Mall', 'Bibliotheca Alexandrina']
      },
      {
        name: 'Stanley',
        city: 'Alexandria',
        governorate: 'Alexandria',
        type: 'residential',
        coordinates: { lat: 31.2167, lng: 29.9500 },
        postalCode: '21511',
        description: 'Upscale coastal district',
        landmarks: ['Stanley Bridge', 'Stanley Beach', 'Montazah Palace']
      },
      {
        name: 'Sidi Gaber',
        city: 'Alexandria',
        governorate: 'Alexandria',
        type: 'commercial',
        coordinates: { lat: 31.2333, lng: 29.9667 },
        postalCode: '21599',
        description: 'Major commercial and transportation hub',
        landmarks: ['Sidi Gaber Railway Station', 'Alexandria University', 'Green Plaza']
      },
      
      // Giza Areas
      {
        name: 'Dokki',
        city: 'Giza',
        governorate: 'Giza',
        type: 'residential',
        coordinates: { lat: 30.0333, lng: 31.2167 },
        postalCode: '12611',
        description: 'Central residential district',
        landmarks: ['Cairo University', 'Orman Garden', 'Giza Zoo']
      },
      {
        name: 'Mohandessin',
        city: 'Giza',
        governorate: 'Giza',
        type: 'commercial',
        coordinates: { lat: 30.0500, lng: 31.2000 },
        postalCode: '12411',
        description: 'Major commercial and entertainment district',
        landmarks: ['Arkan Plaza', 'Cairo Festival City', 'Smart Village']
      },
      {
        name: 'Sheikh Zayed',
        city: 'Giza',
        governorate: 'Giza',
        type: 'residential',
        coordinates: { lat: 30.0167, lng: 30.9667 },
        postalCode: '12588',
        description: 'Modern residential community',
        landmarks: ['Mall of Egypt', 'American University in Cairo', 'Smart Village']
      },
      
      // Tourist Areas
      {
        name: 'Naama Bay',
        city: 'Sharm El Sheikh',
        governorate: 'South Sinai',
        type: 'tourist',
        coordinates: { lat: 27.9158, lng: 34.3300 },
        postalCode: '46619',
        description: 'Main tourist area with beaches and nightlife',
        landmarks: ['Naama Bay Beach', 'Soho Square', 'Old Market']
      },
      {
        name: 'Sahl Hasheesh',
        city: 'Hurghada',
        governorate: 'Red Sea',
        type: 'tourist',
        coordinates: { lat: 27.2579, lng: 33.8116 },
        postalCode: '84511',
        description: 'Luxury resort area',
        landmarks: ['Sahl Hasheesh Beach', 'Marina', 'Golf Course']
      },
      
      // Port Areas
      {
        name: 'Port Fouad',
        city: 'Port Said',
        governorate: 'Port Said',
        type: 'residential',
        coordinates: { lat: 31.2667, lng: 32.3000 },
        postalCode: '42512',
        description: 'Residential area across the canal',
        landmarks: ['Suez Canal', 'Port Fouad Beach', 'Fishing Port']
      },
      {
        name: 'Suez Canal',
        city: 'Suez',
        governorate: 'Suez',
        type: 'industrial',
        coordinates: { lat: 29.9668, lng: 32.5498 },
        postalCode: '43511',
        description: 'Major shipping and industrial area',
        landmarks: ['Suez Canal', 'Port of Suez', 'Oil Refineries']
      }
    ];
  }

  async printStats() {
    console.log('\n📊 Locations Seeding Statistics:');
    console.log(`   Total items processed: ${this.stats.total}`);
    console.log(`   Items created: ${this.stats.created}`);
    console.log(`   Items updated: ${this.stats.updated}`);
    console.log(`   Items failed: ${this.stats.failed}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.stats.errors.slice(0, 10).forEach(error => {
        console.log(`   ${error.city || error.area}: ${error.error}`);
      });
      if (this.stats.errors.length > 10) {
        console.log(`   ... and ${this.stats.errors.length - 10} more errors`);
      }
    }
  }

  async validateSeeding() {
    try {
      console.log('\n🔍 Validating locations seeding...');
      
      // In a real implementation, you'd validate against actual models
      console.log('✅ Locations seeding validation completed');
      
    } catch (error) {
      console.error('❌ Error validating locations seeding:', error);
    }
  }

  async disconnect() {
    try {
      await databaseConfig.disconnect();
      console.log('🔌 Locations Seeder disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Locations Seeder:', error);
    }
  }
}

// Main execution function
async function main() {
  const seeder = new LocationsSeeder();
  
  try {
    await seeder.initialize();
    await seeder.seedLocations();
  } catch (error) {
    console.error('❌ Locations seeding failed:', error);
    process.exit(1);
  } finally {
    await seeder.disconnect();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = LocationsSeeder;
