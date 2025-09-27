// Extended Car Data for Egypt Market
// This file contains additional car brands, models, and trims available in Egypt

const extendedEgyptCarData = {
  brands: [
    // Additional Popular Brands in Egypt
    {
      name: 'Mitsubishi',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Mitsubishi_logo.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'Lancer',
          yearStart: 1973,
          yearEnd: null,
          trims: ['ES', 'SE', 'GT', 'Evolution']
        },
        {
          name: 'Outlander',
          yearStart: 2001,
          yearEnd: null,
          trims: ['ES', 'SE', 'GT', 'PHEV']
        },
        {
          name: 'ASX',
          yearStart: 2010,
          yearEnd: null,
          trims: ['ES', 'SE', 'GT']
        },
        {
          name: 'Pajero',
          yearStart: 1981,
          yearEnd: null,
          trims: ['GLX', 'GLS', 'Exceed']
        },
        {
          name: 'Triton',
          yearStart: 1978,
          yearEnd: null,
          trims: ['GLX', 'GLS', 'Exceed']
        }
      ]
    },
    {
      name: 'Suzuki',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Suzuki_logo_2.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'Swift',
          yearStart: 1983,
          yearEnd: null,
          trims: ['Base', 'GL', 'GLX', 'Sport']
        },
        {
          name: 'Baleno',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Base', 'GL', 'GLX']
        },
        {
          name: 'Ciaz',
          yearStart: 2014,
          yearEnd: null,
          trims: ['Base', 'GL', 'GLX']
        },
        {
          name: 'Vitara',
          yearStart: 1988,
          yearEnd: null,
          trims: ['Base', 'GL', 'GLX', 'Sport']
        },
        {
          name: 'Jimny',
          yearStart: 1970,
          yearEnd: null,
          trims: ['Base', 'GL', 'GLX']
        }
      ]
    },
    {
      name: 'Subaru',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/79/Subaru_logo.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'Impreza',
          yearStart: 1992,
          yearEnd: null,
          trims: ['Base', 'Premium', 'Sport', 'WRX', 'STI']
        },
        {
          name: 'Legacy',
          yearStart: 1989,
          yearEnd: null,
          trims: ['Base', 'Premium', 'Sport', 'Limited']
        },
        {
          name: 'Outback',
          yearStart: 1994,
          yearEnd: null,
          trims: ['Base', 'Premium', 'Sport', 'Limited']
        },
        {
          name: 'Forester',
          yearStart: 1997,
          yearEnd: null,
          trims: ['Base', 'Premium', 'Sport', 'Limited']
        },
        {
          name: 'XV',
          yearStart: 2011,
          yearEnd: null,
          trims: ['Base', 'Premium', 'Sport', 'Limited']
        }
      ]
    },
    {
      name: 'Lexus',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Lexus_logo.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'IS',
          yearStart: 1998,
          yearEnd: null,
          trims: ['300', '350', 'F Sport', 'F']
        },
        {
          name: 'ES',
          yearStart: 1989,
          yearEnd: null,
          trims: ['250', '300h', '350', 'F Sport']
        },
        {
          name: 'GS',
          yearStart: 1991,
          yearEnd: null,
          trims: ['300', '350', 'F Sport', 'F']
        },
        {
          name: 'LS',
          yearStart: 1989,
          yearEnd: null,
          trims: ['500', '600h', 'F Sport']
        },
        {
          name: 'NX',
          yearStart: 2014,
          yearEnd: null,
          trims: ['200t', '300h', 'F Sport']
        },
        {
          name: 'RX',
          yearStart: 1998,
          yearEnd: null,
          trims: ['350', '450h', 'F Sport']
        },
        {
          name: 'GX',
          yearStart: 2002,
          yearEnd: null,
          trims: ['460', 'F Sport']
        },
        {
          name: 'LX',
          yearStart: 1996,
          yearEnd: null,
          trims: ['570', 'F Sport']
        }
      ]
    },
    {
      name: 'Infiniti',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Infiniti_logo.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'Q50',
          yearStart: 2013,
          yearEnd: null,
          trims: ['2.0t', '3.0t', 'Red Sport 400']
        },
        {
          name: 'Q60',
          yearStart: 2016,
          yearEnd: null,
          trims: ['2.0t', '3.0t', 'Red Sport 400']
        },
        {
          name: 'Q70',
          yearStart: 2009,
          yearEnd: null,
          trims: ['3.7', '5.6', 'Hybrid']
        },
        {
          name: 'QX50',
          yearStart: 2013,
          yearEnd: null,
          trims: ['2.0t', '3.0t']
        },
        {
          name: 'QX60',
          yearStart: 2012,
          yearEnd: null,
          trims: ['3.5', 'Hybrid']
        },
        {
          name: 'QX70',
          yearStart: 2002,
          yearEnd: null,
          trims: ['3.7', '5.0']
        },
        {
          name: 'QX80',
          yearStart: 2003,
          yearEnd: null,
          trims: ['5.6']
        }
      ]
    },
    {
      name: 'Acura',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Acura_logo.svg',
      country: 'Japan',
      isActive: true,
      models: [
        {
          name: 'ILX',
          yearStart: 2012,
          yearEnd: null,
          trims: ['Base', 'Premium', 'Technology', 'A-Spec']
        },
        {
          name: 'TLX',
          yearStart: 2014,
          yearEnd: null,
          trims: ['Base', 'Technology', 'A-Spec', 'Type S']
        },
        {
          name: 'RLX',
          yearStart: 2013,
          yearEnd: null,
          trims: ['Base', 'Technology', 'Sport Hybrid']
        },
        {
          name: 'RDX',
          yearStart: 2006,
          yearEnd: null,
          trims: ['Base', 'Technology', 'A-Spec', 'Advance']
        },
        {
          name: 'MDX',
          yearStart: 2000,
          yearEnd: null,
          trims: ['Base', 'Technology', 'A-Spec', 'Advance']
        },
        {
          name: 'NSX',
          yearStart: 1990,
          yearEnd: null,
          trims: ['Base', 'Type S']
        }
      ]
    },
    {
      name: 'Genesis',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Genesis_logo.svg',
      country: 'South Korea',
      isActive: true,
      models: [
        {
          name: 'G70',
          yearStart: 2017,
          yearEnd: null,
          trims: ['2.0T', '3.3T', 'Sport']
        },
        {
          name: 'G80',
          yearStart: 2016,
          yearEnd: null,
          trims: ['2.5T', '3.5T', 'Sport']
        },
        {
          name: 'G90',
          yearStart: 2016,
          yearEnd: null,
          trims: ['3.3T', '5.0L', 'Luxury']
        },
        {
          name: 'GV70',
          yearStart: 2020,
          yearEnd: null,
          trims: ['2.5T', '3.5T', 'Sport']
        },
        {
          name: 'GV80',
          yearStart: 2020,
          yearEnd: null,
          trims: ['2.5T', '3.5T', 'Sport']
        }
      ]
    },
    {
      name: 'Jaguar',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Jaguar_logo.svg',
      country: 'UK',
      isActive: true,
      models: [
        {
          name: 'XE',
          yearStart: 2015,
          yearEnd: null,
          trims: ['P250', 'P300', 'S']
        },
        {
          name: 'XF',
          yearStart: 2007,
          yearEnd: null,
          trims: ['P250', 'P300', 'S']
        },
        {
          name: 'XJ',
          yearStart: 1968,
          yearEnd: null,
          trims: ['P300', 'P400', 'S']
        },
        {
          name: 'F-PACE',
          yearStart: 2015,
          yearEnd: null,
          trims: ['P250', 'P300', 'S', 'SVR']
        },
        {
          name: 'E-PACE',
          yearStart: 2017,
          yearEnd: null,
          trims: ['P250', 'P300', 'S']
        },
        {
          name: 'I-PACE',
          yearStart: 2018,
          yearEnd: null,
          trims: ['EV400', 'S']
        }
      ]
    },
    {
      name: 'Land Rover',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Land_Rover_logo.svg',
      country: 'UK',
      isActive: true,
      models: [
        {
          name: 'Discovery Sport',
          yearStart: 2014,
          yearEnd: null,
          trims: ['SE', 'HSE', 'R-Dynamic']
        },
        {
          name: 'Discovery',
          yearStart: 1989,
          yearEnd: null,
          trims: ['SE', 'HSE', 'R-Dynamic']
        },
        {
          name: 'Range Rover Evoque',
          yearStart: 2011,
          yearEnd: null,
          trims: ['SE', 'HSE', 'R-Dynamic']
        },
        {
          name: 'Range Rover Velar',
          yearStart: 2017,
          yearEnd: null,
          trims: ['SE', 'HSE', 'R-Dynamic']
        },
        {
          name: 'Range Rover Sport',
          yearStart: 2005,
          yearEnd: null,
          trims: ['SE', 'HSE', 'R-Dynamic', 'SVR']
        },
        {
          name: 'Range Rover',
          yearStart: 1970,
          yearEnd: null,
          trims: ['SE', 'HSE', 'Autobiography', 'SVAutobiography']
        }
      ]
    },
    {
      name: 'Porsche',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Porsche_logo.svg',
      country: 'Germany',
      isActive: true,
      models: [
        {
          name: '718 Boxster',
          yearStart: 1996,
          yearEnd: null,
          trims: ['Base', 'S', 'GTS', 'Spyder']
        },
        {
          name: '718 Cayman',
          yearStart: 2005,
          yearEnd: null,
          trims: ['Base', 'S', 'GTS', 'GT4']
        },
        {
          name: '911',
          yearStart: 1963,
          yearEnd: null,
          trims: ['Carrera', 'Carrera S', 'Carrera 4S', 'Turbo', 'Turbo S', 'GT3', 'GT3 RS']
        },
        {
          name: 'Panamera',
          yearStart: 2009,
          yearEnd: null,
          trims: ['Base', '4', '4S', 'Turbo', 'Turbo S', 'GTS']
        },
        {
          name: 'Macan',
          yearStart: 2014,
          yearEnd: null,
          trims: ['Base', 'S', 'GTS', 'Turbo']
        },
        {
          name: 'Cayenne',
          yearStart: 2002,
          yearEnd: null,
          trims: ['Base', 'S', 'GTS', 'Turbo', 'Turbo S']
        },
        {
          name: 'Taycan',
          yearStart: 2019,
          yearEnd: null,
          trims: ['4S', 'Turbo', 'Turbo S']
        }
      ]
    },
    {
      name: 'Volvo',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Volvo_logo.svg',
      country: 'Sweden',
      isActive: true,
      models: [
        {
          name: 'S60',
          yearStart: 2000,
          yearEnd: null,
          trims: ['T5', 'T6', 'T8', 'Polestar']
        },
        {
          name: 'S90',
          yearStart: 2016,
          yearEnd: null,
          trims: ['T5', 'T6', 'T8', 'Polestar']
        },
        {
          name: 'V60',
          yearStart: 2010,
          yearEnd: null,
          trims: ['T5', 'T6', 'T8', 'Polestar']
        },
        {
          name: 'V90',
          yearStart: 2016,
          yearEnd: null,
          trims: ['T5', 'T6', 'T8', 'Polestar']
        },
        {
          name: 'XC40',
          yearStart: 2017,
          yearEnd: null,
          trims: ['T4', 'T5', 'T8', 'Polestar']
        },
        {
          name: 'XC60',
          yearStart: 2008,
          yearEnd: null,
          trims: ['T5', 'T6', 'T8', 'Polestar']
        },
        {
          name: 'XC90',
          yearStart: 2002,
          yearEnd: null,
          trims: ['T5', 'T6', 'T8', 'Polestar']
        }
      ]
    },
    {
      name: 'Mini',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Mini_logo.svg',
      country: 'UK',
      isActive: true,
      models: [
        {
          name: 'Cooper',
          yearStart: 2001,
          yearEnd: null,
          trims: ['Base', 'S', 'JCW']
        },
        {
          name: 'Cooper Convertible',
          yearStart: 2004,
          yearEnd: null,
          trims: ['Base', 'S', 'JCW']
        },
        {
          name: 'Clubman',
          yearStart: 2007,
          yearEnd: null,
          trims: ['Base', 'S', 'JCW']
        },
        {
          name: 'Countryman',
          yearStart: 2010,
          yearEnd: null,
          trims: ['Base', 'S', 'JCW']
        },
        {
          name: 'Paceman',
          yearStart: 2012,
          yearEnd: null,
          trims: ['Base', 'S', 'JCW']
        }
      ]
    },
    {
      name: 'Smart',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Smart_logo.svg',
      country: 'Germany',
      isActive: true,
      models: [
        {
          name: 'Fortwo',
          yearStart: 1998,
          yearEnd: null,
          trims: ['Pure', 'Passion', 'Prime', 'Brabus']
        },
        {
          name: 'Forfour',
          yearStart: 2004,
          yearEnd: null,
          trims: ['Pure', 'Passion', 'Prime', 'Brabus']
        }
      ]
    },
    {
      name: 'Fiat',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Fiat_logo.svg',
      country: 'Italy',
      isActive: true,
      models: [
        {
          name: '500',
          yearStart: 2007,
          yearEnd: null,
          trims: ['Pop', 'Lounge', 'Sport', 'Abarth']
        },
        {
          name: '500L',
          yearStart: 2012,
          yearEnd: null,
          trims: ['Pop', 'Lounge', 'Sport']
        },
        {
          name: '500X',
          yearStart: 2014,
          yearEnd: null,
          trims: ['Pop', 'Lounge', 'Sport']
        },
        {
          name: 'Panda',
          yearStart: 1980,
          yearEnd: null,
          trims: ['Pop', 'Lounge', 'Sport']
        },
        {
          name: 'Tipo',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Pop', 'Lounge', 'Sport']
        }
      ]
    },
    {
      name: 'Alfa Romeo',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Alfa_Romeo_logo.svg',
      country: 'Italy',
      isActive: true,
      models: [
        {
          name: 'Giulietta',
          yearStart: 2010,
          yearEnd: null,
          trims: ['Base', 'Super', 'Quadrifoglio Verde']
        },
        {
          name: 'Giulia',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Base', 'Super', 'Quadrifoglio']
        },
        {
          name: 'Stelvio',
          yearStart: 2016,
          yearEnd: null,
          trims: ['Base', 'Super', 'Quadrifoglio']
        }
      ]
    },
    {
      name: 'Maserati',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Maserati_logo.svg',
      country: 'Italy',
      isActive: true,
      models: [
        {
          name: 'Ghibli',
          yearStart: 2013,
          yearEnd: null,
          trims: ['Base', 'S', 'Trofeo']
        },
        {
          name: 'Quattroporte',
          yearStart: 1963,
          yearEnd: null,
          trims: ['Base', 'S', 'Trofeo']
        },
        {
          name: 'Levante',
          yearStart: 2016,
          yearEnd: null,
          trims: ['Base', 'S', 'Trofeo']
        },
        {
          name: 'GranTurismo',
          yearStart: 2007,
          yearEnd: null,
          trims: ['Base', 'S', 'MC']
        }
      ]
    },
    {
      name: 'Lamborghini',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Lamborghini_logo.svg',
      country: 'Italy',
      isActive: true,
      models: [
        {
          name: 'Huracán',
          yearStart: 2014,
          yearEnd: null,
          trims: ['LP 580-2', 'LP 610-4', 'Performante', 'Evo']
        },
        {
          name: 'Aventador',
          yearStart: 2011,
          yearEnd: null,
          trims: ['LP 700-4', 'LP 750-4', 'SVJ']
        },
        {
          name: 'Urus',
          yearStart: 2017,
          yearEnd: null,
          trims: ['Base', 'Performante']
        }
      ]
    },
    {
      name: 'Ferrari',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Ferrari_logo.svg',
      country: 'Italy',
      isActive: true,
      models: [
        {
          name: '488',
          yearStart: 2015,
          yearEnd: null,
          trims: ['GTB', 'Spider', 'Pista']
        },
        {
          name: 'F8',
          yearStart: 2019,
          yearEnd: null,
          trims: ['Tributo', 'Spider']
        },
        {
          name: 'SF90',
          yearStart: 2019,
          yearEnd: null,
          trims: ['Stradale', 'Spider']
        },
        {
          name: 'Roma',
          yearStart: 2019,
          yearEnd: null,
          trims: ['Base', 'Spider']
        }
      ]
    },
    {
      name: 'Bentley',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Bentley_logo.svg',
      country: 'UK',
      isActive: true,
      models: [
        {
          name: 'Continental GT',
          yearStart: 2003,
          yearEnd: null,
          trims: ['V8', 'W12', 'Speed']
        },
        {
          name: 'Flying Spur',
          yearStart: 2005,
          yearEnd: null,
          trims: ['V8', 'W12', 'Speed']
        },
        {
          name: 'Bentayga',
          yearStart: 2015,
          yearEnd: null,
          trims: ['V8', 'W12', 'Speed']
        }
      ]
    },
    {
      name: 'Rolls-Royce',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Rolls-Royce_logo.svg',
      country: 'UK',
      isActive: true,
      models: [
        {
          name: 'Ghost',
          yearStart: 2009,
          yearEnd: null,
          trims: ['Base', 'Extended', 'Black Badge']
        },
        {
          name: 'Wraith',
          yearStart: 2013,
          yearEnd: null,
          trims: ['Base', 'Black Badge']
        },
        {
          name: 'Dawn',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Base', 'Black Badge']
        },
        {
          name: 'Cullinan',
          yearStart: 2018,
          yearEnd: null,
          trims: ['Base', 'Black Badge']
        }
      ]
    },
    {
      name: 'Aston Martin',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Aston_Martin_logo.svg',
      country: 'UK',
      isActive: true,
      models: [
        {
          name: 'Vantage',
          yearStart: 2005,
          yearEnd: null,
          trims: ['Base', 'S', 'AMR']
        },
        {
          name: 'DB11',
          yearStart: 2016,
          yearEnd: null,
          trims: ['V8', 'V12', 'AMR']
        },
        {
          name: 'DBS',
          yearStart: 2018,
          yearEnd: null,
          trims: ['Base', 'Superleggera']
        },
        {
          name: 'DBX',
          yearStart: 2019,
          yearEnd: null,
          trims: ['Base', 'S']
        }
      ]
    },
    {
      name: 'McLaren',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/McLaren_logo.svg',
      country: 'UK',
      isActive: true,
      models: [
        {
          name: '540C',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Base']
        },
        {
          name: '570S',
          yearStart: 2015,
          yearEnd: null,
          trims: ['Base', 'Spider']
        },
        {
          name: '720S',
          yearStart: 2017,
          yearEnd: null,
          trims: ['Base', 'Spider']
        },
        {
          name: 'P1',
          yearStart: 2013,
          yearEnd: null,
          trims: ['Base']
        }
      ]
    }
  ]
};

module.exports = extendedEgyptCarData;
