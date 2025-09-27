// Comprehensive Car Data for Egypt Market
// This file contains all car brands, models, and trims available in Egypt

const egyptCarData = {
  brands: [
    // Popular Brands in Egypt
    {
      name: 'Toyota',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_logo.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'Corolla',
          yearStart: 1966,
          yearEnd: null,
          trims: ['Base', 'LE', 'XLE', 'SE', 'XSE', 'Hybrid LE', 'Hybrid XLE']
        },
        {
          name: 'Camry',
          yearStart: 1982,
          yearEnd: null,
          trims: ['LE', 'SE', 'XLE', 'XSE', 'TRD', 'Hybrid LE', 'Hybrid XLE']
        },
        {
          name: 'RAV4',
          yearStart: 1994,
          yearEnd: null,
          trims: ['LE', 'XLE', 'XLE Premium', 'Adventure', 'TRD Off-Road', 'Hybrid LE', 'Hybrid XLE']
        },
        {
          name: 'Prius',
          yearStart: 1997,
          yearEnd: null,
          trims: ['LE', 'XLE', 'Limited']
        },
        {
          name: 'Highlander',
          yearStart: 2000,
          yearEnd: null,
          trims: ['LE', 'XLE', 'Limited', 'Platinum', 'Hybrid LE', 'Hybrid XLE']
        },
        {
          name: 'Land Cruiser',
          yearStart: 1951,
          yearEnd: null,
          trims: ['Base', 'GX-R', 'VX-R', 'VX-R Limited']
        },
        {
          name: 'Hilux',
          yearStart: 1968,
          yearEnd: null,
          trims: ['Single Cab', 'Double Cab', 'Extra Cab', 'SR', 'SR5']
        }
      ]
    },
    {
      name: 'Hyundai',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Hyundai_logo.svg',
      country: 'South Korea',
      isActive: true,
      models: [
        {
          name: 'Accent',
          yearStart: 1994,
          yearEnd: null,
          trims: ['Base', 'SE', 'Limited']
        },
        {
          name: 'Elantra',
          yearStart: 1990,
          yearEnd: null,
          trims: ['SE', 'SEL', 'Limited', 'N Line']
        },
        {
          name: 'Sonata',
          yearStart: 1985,
          yearEnd: null,
          trims: ['SE', 'SEL', 'Limited', 'N Line']
        },
        {
          name: 'Tucson',
          yearStart: 2004,
          yearEnd: null,
          trims: ['SE', 'SEL', 'Limited', 'N Line']
        },
        {
          name: 'Santa Fe',
          yearStart: 2000,
          yearEnd: null,
          trims: ['SE', 'SEL', 'Limited', 'Calligraphy']
        },
        {
          name: 'Ioniq 5',
          yearStart: 2021,
          yearEnd: null,
          trims: ['SE', 'SEL', 'Limited']
        },
        {
          name: 'Staria',
          yearStart: 2021,
          yearEnd: null,
          trims: ['Base', 'Premium', 'Luxury']
        }
      ]
    },
    {
      name: 'Kia',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Kia_logo.svg',
      country: 'South Korea',
      isActive: true,
      models: [
        {
          name: 'Rio',
          yearStart: 1999,
          yearEnd: null,
          trims: ['LX', 'S', 'EX']
        },
        {
          name: 'Forte',
          yearStart: 2008,
          yearEnd: null,
          trims: ['LX', 'S', 'EX', 'GT']
        },
        {
          name: 'Optima',
          yearStart: 2000,
          yearEnd: null,
          trims: ['LX', 'S', 'EX', 'SX']
        },
        {
          name: 'Sportage',
          yearStart: 1993,
          yearEnd: null,
          trims: ['LX', 'S', 'EX', 'SX']
        },
        {
          name: 'Sorento',
          yearStart: 2002,
          yearEnd: null,
          trims: ['LX', 'S', 'EX', 'SX']
        },
        {
          name: 'Telluride',
          yearStart: 2019,
          yearEnd: null,
          trims: ['LX', 'S', 'EX', 'SX', 'SX Prestige']
        },
        {
          name: 'Seltos',
          yearStart: 2019,
          yearEnd: null,
          trims: ['LX', 'S', 'EX', 'SX']
        }
      ]
    },
    {
      name: 'Nissan',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Nissan_logo.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'Sentra',
          yearStart: 1982,
          yearEnd: null,
          trims: ['S', 'SV', 'SR', 'SL']
        },
        {
          name: 'Altima',
          yearStart: 1992,
          yearEnd: null,
          trims: ['S', 'SV', 'SR', 'SL', 'Platinum']
        },
        {
          name: 'Maxima',
          yearStart: 1981,
          yearEnd: null,
          trims: ['S', 'SV', 'SL', 'Platinum']
        },
        {
          name: 'Rogue',
          yearStart: 2007,
          yearEnd: null,
          trims: ['S', 'SV', 'SL', 'Platinum']
        },
        {
          name: 'Murano',
          yearStart: 2002,
          yearEnd: null,
          trims: ['S', 'SV', 'SL', 'Platinum']
        },
        {
          name: 'Pathfinder',
          yearStart: 1985,
          yearEnd: null,
          trims: ['S', 'SV', 'SL', 'Platinum']
        },
        {
          name: 'Patrol',
          yearStart: 1951,
          yearEnd: null,
          trims: ['Base', 'SE', 'LE', 'Platinum']
        }
      ]
    },
    {
      name: 'Honda',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Honda_logo.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'Civic',
          yearStart: 1972,
          yearEnd: null,
          trims: ['LX', 'Sport', 'EX', 'Touring', 'Type R']
        },
        {
          name: 'Accord',
          yearStart: 1976,
          yearEnd: null,
          trims: ['LX', 'Sport', 'EX', 'Touring', 'Hybrid']
        },
        {
          name: 'CR-V',
          yearStart: 1995,
          yearEnd: null,
          trims: ['LX', 'EX', 'EX-L', 'Touring', 'Hybrid']
        },
        {
          name: 'HR-V',
          yearStart: 2015,
          yearEnd: null,
          trims: ['LX', 'EX', 'EX-L']
        },
        {
          name: 'Pilot',
          yearStart: 2002,
          yearEnd: null,
          trims: ['LX', 'EX', 'EX-L', 'Touring', 'Elite']
        },
        {
          name: 'Passport',
          yearStart: 2018,
          yearEnd: null,
          trims: ['Sport', 'EX-L', 'Touring', 'Elite']
        }
      ]
    },
    {
      name: 'Mercedes-Benz',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
      country: 'Germany',
      isActive: true,
      models: [
        {
          name: 'A-Class',
          yearStart: 1997,
          yearEnd: null,
          trims: ['A 180', 'A 200', 'A 220', 'A 250', 'A 35 AMG', 'A 45 AMG']
        },
        {
          name: 'C-Class',
          yearStart: 1993,
          yearEnd: null,
          trims: ['C 180', 'C 200', 'C 220', 'C 300', 'C 43 AMG', 'C 63 AMG']
        },
        {
          name: 'E-Class',
          yearStart: 1993,
          yearEnd: null,
          trims: ['E 200', 'E 220', 'E 300', 'E 400', 'E 53 AMG', 'E 63 AMG']
        },
        {
          name: 'S-Class',
          yearStart: 1972,
          yearEnd: null,
          trims: ['S 350', 'S 400', 'S 500', 'S 600', 'S 63 AMG', 'S 65 AMG']
        },
        {
          name: 'GLA',
          yearStart: 2013,
          yearEnd: null,
          trims: ['GLA 180', 'GLA 200', 'GLA 220', 'GLA 250', 'GLA 35 AMG', 'GLA 45 AMG']
        },
        {
          name: 'GLC',
          yearStart: 2015,
          yearEnd: null,
          trims: ['GLC 200', 'GLC 220', 'GLC 300', 'GLC 400', 'GLC 43 AMG', 'GLC 63 AMG']
        },
        {
          name: 'GLE',
          yearStart: 1997,
          yearEnd: null,
          trims: ['GLE 300', 'GLE 350', 'GLE 400', 'GLE 450', 'GLE 53 AMG', 'GLE 63 AMG']
        },
        {
          name: 'GLS',
          yearStart: 2006,
          yearEnd: null,
          trims: ['GLS 350', 'GLS 400', 'GLS 450', 'GLS 500', 'GLS 63 AMG']
        }
      ]
    },
    {
      name: 'BMW',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
      country: 'Germany',
      isActive: true,
      models: [
        {
          name: '1 Series',
          yearStart: 2004,
          yearEnd: null,
          trims: ['116i', '118i', '120i', '125i', 'M135i']
        },
        {
          name: '2 Series',
          yearStart: 2013,
          yearEnd: null,
          trims: ['218i', '220i', '225i', 'M235i', 'M2']
        },
        {
          name: '3 Series',
          yearStart: 1975,
          yearEnd: null,
          trims: ['318i', '320i', '325i', '330i', 'M340i', 'M3']
        },
        {
          name: '5 Series',
          yearStart: 1972,
          yearEnd: null,
          trims: ['520i', '525i', '530i', '540i', 'M550i', 'M5']
        },
        {
          name: '7 Series',
          yearStart: 1977,
          yearEnd: null,
          trims: ['730i', '740i', '750i', '760i', 'M760i']
        },
        {
          name: 'X1',
          yearStart: 2009,
          yearEnd: null,
          trims: ['sDrive18i', 'sDrive20i', 'xDrive20i', 'xDrive25i']
        },
        {
          name: 'X3',
          yearStart: 2003,
          yearEnd: null,
          trims: ['sDrive20i', 'xDrive20i', 'xDrive30i', 'M40i', 'X3 M']
        },
        {
          name: 'X5',
          yearStart: 1999,
          yearEnd: null,
          trims: ['xDrive30i', 'xDrive40i', 'xDrive50i', 'M50i', 'X5 M']
        }
      ]
    },
    {
      name: 'Audi',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg',
      country: 'Germany',
      isActive: true,
      models: [
        {
          name: 'A1',
          yearStart: 2010,
          yearEnd: null,
          trims: ['30 TFSI', '35 TFSI', '40 TFSI', 'S1']
        },
        {
          name: 'A3',
          yearStart: 1996,
          yearEnd: null,
          trims: ['30 TFSI', '35 TFSI', '40 TFSI', 'S3', 'RS3']
        },
        {
          name: 'A4',
          yearStart: 1994,
          yearEnd: null,
          trims: ['35 TFSI', '40 TFSI', '45 TFSI', 'S4', 'RS4']
        },
        {
          name: 'A6',
          yearStart: 1994,
          yearEnd: null,
          trims: ['40 TFSI', '45 TFSI', '55 TFSI', 'S6', 'RS6']
        },
        {
          name: 'A8',
          yearStart: 1994,
          yearEnd: null,
          trims: ['50 TFSI', '55 TFSI', '60 TFSI', 'S8']
        },
        {
          name: 'Q2',
          yearStart: 2016,
          yearEnd: null,
          trims: ['30 TFSI', '35 TFSI', '40 TFSI', 'SQ2']
        },
        {
          name: 'Q3',
          yearStart: 2011,
          yearEnd: null,
          trims: ['35 TFSI', '40 TFSI', '45 TFSI', 'SQ3']
        },
        {
          name: 'Q5',
          yearStart: 2008,
          yearEnd: null,
          trims: ['40 TFSI', '45 TFSI', '55 TFSI', 'SQ5', 'RS Q5']
        },
        {
          name: 'Q7',
          yearStart: 2005,
          yearEnd: null,
          trims: ['45 TFSI', '55 TFSI', '60 TFSI', 'SQ7']
        }
      ]
    },
    {
      name: 'Volkswagen',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg',
      country: 'Germany',
      isActive: true,
      models: [
        {
          name: 'Polo',
          yearStart: 1975,
          yearEnd: null,
          trims: ['Trendline', 'Comfortline', 'Highline', 'GTI']
        },
        {
          name: 'Golf',
          yearStart: 1974,
          yearEnd: null,
          trims: ['Trendline', 'Comfortline', 'Highline', 'GTI', 'R']
        },
        {
          name: 'Jetta',
          yearStart: 1979,
          yearEnd: null,
          trims: ['Trendline', 'Comfortline', 'Highline', 'GLI']
        },
        {
          name: 'Passat',
          yearStart: 1973,
          yearEnd: null,
          trims: ['Trendline', 'Comfortline', 'Highline', 'R-Line']
        },
        {
          name: 'Tiguan',
          yearStart: 2007,
          yearEnd: null,
          trims: ['Trendline', 'Comfortline', 'Highline', 'R-Line']
        },
        {
          name: 'Touareg',
          yearStart: 2002,
          yearEnd: null,
          trims: ['V6', 'V8', 'R-Line', 'Hybrid']
        }
      ]
    },
    {
      name: 'Peugeot',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Peugeot_logo.svg',
      country: 'France',
      isActive: true,
      models: [
        {
          name: '208',
          yearStart: 2012,
          yearEnd: null,
          trims: ['Active', 'Allure', 'GT Line', 'GT']
        },
        {
          name: '308',
          yearStart: 2007,
          yearEnd: null,
          trims: ['Active', 'Allure', 'GT Line', 'GT']
        },
        {
          name: '508',
          yearStart: 2010,
          yearEnd: null,
          trims: ['Active', 'Allure', 'GT Line', 'GT']
        },
        {
          name: '2008',
          yearStart: 2013,
          yearEnd: null,
          trims: ['Active', 'Allure', 'GT Line', 'GT']
        },
        {
          name: '3008',
          yearStart: 2008,
          yearEnd: null,
          trims: ['Active', 'Allure', 'GT Line', 'GT']
        },
        {
          name: '5008',
          yearStart: 2009,
          yearEnd: null,
          trims: ['Active', 'Allure', 'GT Line', 'GT']
        }
      ]
    },
    {
      name: 'Renault',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Renault_logo.svg',
      country: 'France',
      isActive: true,
      models: [
        {
          name: 'Clio',
          yearStart: 1990,
          yearEnd: null,
          trims: ['Expression', 'Dynamique', 'Intens', 'RS']
        },
        {
          name: 'Megane',
          yearStart: 1995,
          yearEnd: null,
          trims: ['Expression', 'Dynamique', 'Intens', 'RS']
        },
        {
          name: 'Captur',
          yearStart: 2013,
          yearEnd: null,
          trims: ['Expression', 'Dynamique', 'Intens']
        },
        {
          name: 'Kadjar',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Expression', 'Dynamique', 'Intens']
        },
        {
          name: 'Koleos',
          yearStart: 2007,
          yearEnd: null,
          trims: ['Expression', 'Dynamique', 'Intens']
        },
        {
          name: 'Duster',
          yearStart: 2010,
          yearEnd: null,
          trims: ['Expression', 'Dynamique', 'Intens']
        }
      ]
    },
    {
      name: 'Skoda',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Skoda_Auto_logo.svg',
      country: 'Czech Republic',
      isActive: true,
      models: [
        {
          name: 'Fabia',
          yearStart: 1999,
          yearEnd: null,
          trims: ['Active', 'Ambition', 'Style', 'RS']
        },
        {
          name: 'Octavia',
          yearStart: 1996,
          yearEnd: null,
          trims: ['Active', 'Ambition', 'Style', 'RS']
        },
        {
          name: 'Superb',
          yearStart: 2001,
          yearEnd: null,
          trims: ['Active', 'Ambition', 'Style', 'Laurin & Klement']
        },
        {
          name: 'Kamiq',
          yearStart: 2019,
          yearEnd: null,
          trims: ['Active', 'Ambition', 'Style']
        },
        {
          name: 'Karoq',
          yearStart: 2017,
          yearEnd: null,
          trims: ['Active', 'Ambition', 'Style']
        },
        {
          name: 'Kodiaq',
          yearStart: 2016,
          yearEnd: null,
          trims: ['Active', 'Ambition', 'Style', 'RS']
        }
      ]
    },
    {
      name: 'MG',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/MG_logo.svg',
      country: 'UK/China',
      isActive: true,
      models: [
        {
          name: 'MG3',
          yearStart: 2011,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        },
        {
          name: 'MG5',
          yearStart: 2012,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        },
        {
          name: 'MG6',
          yearStart: 2010,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        },
        {
          name: 'HS',
          yearStart: 2018,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        },
        {
          name: 'ZS',
          yearStart: 2017,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        }
      ]
    },
    {
      name: 'Chery',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Chery_logo.svg',
      country: 'China',
      isActive: true,
      models: [
        {
          name: 'Tiggo 3',
          yearStart: 2014,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        },
        {
          name: 'Tiggo 4',
          yearStart: 2017,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        },
        {
          name: 'Tiggo 7',
          yearStart: 2016,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        },
        {
          name: 'Tiggo 8',
          yearStart: 2018,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        },
        {
          name: 'Arrizo 5',
          yearStart: 2013,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        },
        {
          name: 'Arrizo 6',
          yearStart: 2016,
          yearEnd: null,
          trims: ['Base', 'Comfort', 'Luxury']
        }
      ]
    },
    {
      name: 'BYD',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/BYD_logo.svg',
      country: 'China',
      isActive: true,
      models: [
        {
          name: 'Han',
          yearStart: 2020,
          yearEnd: null,
          trims: ['Standard', 'Premium', 'Luxury']
        },
        {
          name: 'Tang',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Standard', 'Premium', 'Luxury']
        },
        {
          name: 'Song',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Standard', 'Premium', 'Luxury']
        },
        {
          name: 'Yuan',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Standard', 'Premium', 'Luxury']
        },
        {
          name: 'Seal',
          yearStart: 2022,
          yearEnd: null,
          trims: ['Standard', 'Premium', 'Luxury']
        },
        {
          name: 'Dolphin',
          yearStart: 2021,
          yearEnd: null,
          trims: ['Standard', 'Premium', 'Luxury']
        }
      ]
    },
    {
      name: 'Mazda',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Mazda_logo_with_emblem.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'Mazda2',
          yearStart: 2002,
          yearEnd: null,
          trims: ['Base', 'Sport', 'Touring', 'Grand Touring']
        },
        {
          name: 'Mazda3',
          yearStart: 2003,
          yearEnd: null,
          trims: ['Base', 'Sport', 'Touring', 'Grand Touring']
        },
        {
          name: 'Mazda6',
          yearStart: 2002,
          yearEnd: null,
          trims: ['Base', 'Sport', 'Touring', 'Grand Touring']
        },
        {
          name: 'CX-3',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Base', 'Sport', 'Touring', 'Grand Touring']
        },
        {
          name: 'CX-5',
          yearStart: 2012,
          yearEnd: null,
          trims: ['Base', 'Sport', 'Touring', 'Grand Touring']
        },
        {
          name: 'CX-9',
          yearStart: 2006,
          yearEnd: null,
          trims: ['Base', 'Sport', 'Touring', 'Grand Touring']
        }
      ]
    },
    {
      name: 'Ford',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_logo_flat.svg',
      country: 'USA',
      isActive: true,
      models: [
        {
          name: 'Fiesta',
          yearStart: 1976,
          yearEnd: null,
          trims: ['Base', 'SE', 'SES', 'ST']
        },
        {
          name: 'Focus',
          yearStart: 1998,
          yearEnd: null,
          trims: ['Base', 'SE', 'SES', 'ST', 'RS']
        },
        {
          name: 'Fusion',
          yearStart: 2005,
          yearEnd: null,
          trims: ['S', 'SE', 'SEL', 'Titanium', 'Sport']
        },
        {
          name: 'Escape',
          yearStart: 2000,
          yearEnd: null,
          trims: ['S', 'SE', 'SEL', 'Titanium', 'ST']
        },
        {
          name: 'Explorer',
          yearStart: 1990,
          yearEnd: null,
          trims: ['Base', 'XLT', 'Limited', 'Platinum', 'ST']
        },
        {
          name: 'F-150',
          yearStart: 1948,
          yearEnd: null,
          trims: ['Regular Cab', 'SuperCab', 'SuperCrew', 'Raptor']
        }
      ]
    },
    {
      name: 'Chevrolet',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Chevrolet_logo.svg',
      country: 'USA',
      isActive: true,
      models: [
        {
          name: 'Cruze',
          yearStart: 2008,
          yearEnd: null,
          trims: ['LS', 'LT', 'Premier', 'RS']
        },
        {
          name: 'Malibu',
          yearStart: 1964,
          yearEnd: null,
          trims: ['L', 'LS', 'LT', 'Premier', 'RS']
        },
        {
          name: 'Impala',
          yearStart: 1958,
          yearEnd: null,
          trims: ['LS', 'LT', 'Premier']
        },
        {
          name: 'Equinox',
          yearStart: 2004,
          yearEnd: null,
          trims: ['L', 'LS', 'LT', 'Premier', 'RS']
        },
        {
          name: 'Traverse',
          yearStart: 2008,
          yearEnd: null,
          trims: ['L', 'LS', 'LT', 'Premier', 'RS']
        },
        {
          name: 'Tahoe',
          yearStart: 1995,
          yearEnd: null,
          trims: ['LS', 'LT', 'Premier', 'High Country']
        }
      ]
    }
  ]
};

module.exports = egyptCarData;
