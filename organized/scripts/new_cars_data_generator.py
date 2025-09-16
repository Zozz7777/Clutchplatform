import csv
import json
import random
from datetime import datetime

class NewCarDataGenerator:
    """Generate realistic new car data with modern features and specifications"""
    
    def __init__(self):
        self.brands = [
            "Alfa Romeo", "Audi", "BMW", "Chevrolet", "Chrysler", "Citroen", 
            "Dodge", "Fiat", "Ford", "Honda", "Hyundai", "Infiniti", "Jaguar",
            "Jeep", "Kia", "Land Rover", "Lexus", "Mazda", "Mercedes-Benz",
            "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot", "Porsche",
            "Renault", "Seat", "Skoda", "Smart", "Subaru", "Suzuki", "Toyota",
            "Volkswagen", "Volvo", "Acura", "Bentley", "Buick", "Cadillac",
            "Ferrari", "GMC", "Hummer", "Lamborghini", "Lotus", "Maserati",
            "Maybach", "McLaren", "Pontiac", "Rolls-Royce", "Saab", "Saturn",
            "Scion", "Tesla", "Aston Martin", "Bugatti", "Corvette", "Lincoln",
            "Ram", "Vauxhall"
        ]
        
        self.models = {
            "Alfa Romeo": ["Giulia", "Stelvio", "Giulietta", "4C", "Tonale"],
            "Audi": ["A3", "A4", "A6", "Q3", "Q5", "Q7", "TT", "RS", "S3", "S4", "e-tron"],
            "BMW": ["1 Series", "2 Series", "3 Series", "5 Series", "X1", "X3", "X5", "M3", "M5", "i3", "i4", "iX"],
            "Chevrolet": ["Camaro", "Corvette", "Cruze", "Malibu", "Silverado", "Tahoe", "Bolt"],
            "Ford": ["Focus", "Fiesta", "Mondeo", "Mustang", "Explorer", "F-150", "Mach-E"],
            "Honda": ["Civic", "Accord", "CR-V", "Pilot", "Fit", "HR-V", "e:Ny1"],
            "Toyota": ["Camry", "Corolla", "RAV4", "Highlander", "Prius", "Yaris", "bZ4X"],
            "Volkswagen": ["Golf", "Passat", "Tiguan", "Jetta", "Polo", "Touareg", "ID.3", "ID.4"],
            "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "EQS", "EQE"],
            "Tesla": ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck"],
            "Hyundai": ["Tucson", "Santa Fe", "Kona", "Ioniq 5", "Ioniq 6"],
            "Kia": ["Sportage", "Sorento", "Niro", "EV6", "EV9"]
        }
        
        self.fuel_types = ["Gasoline", "Diesel", "Hybrid", "Electric", "Plug-in Hybrid", "Hydrogen"]
        self.transmissions = ["Manual", "Automatic", "CVT", "Semi-Automatic", "Dual-Clutch"]
        self.colors = ["White", "Black", "Silver", "Gray", "Blue", "Red", "Green", "Yellow", "Orange", "Purple"]
        
        # New car specific features
        self.safety_features = [
            "Adaptive Cruise Control", "Lane Departure Warning", "Blind Spot Monitoring",
            "Forward Collision Warning", "Automatic Emergency Braking", "Rear Cross Traffic Alert",
            "360-Degree Camera", "Parking Sensors", "Tire Pressure Monitoring",
            "Electronic Stability Control", "Anti-lock Braking System", "Traction Control"
        ]
        
        self.tech_features = [
            "Apple CarPlay", "Android Auto", "Wireless Charging", "Bluetooth Connectivity",
            "USB-C Ports", "Wi-Fi Hotspot", "Satellite Navigation", "Digital Instrument Cluster",
            "Head-Up Display", "Panoramic Sunroof", "Ambient Lighting", "Premium Sound System",
            "Wireless Smartphone Integration", "Voice Recognition", "Gesture Control"
        ]
        
        self.comfort_features = [
            "Heated Seats", "Ventilated Seats", "Memory Seats", "Power Seats",
            "Climate Control", "Dual-Zone Climate", "Heated Steering Wheel",
            "Keyless Entry", "Push-Button Start", "Remote Start", "Power Windows",
            "Power Mirrors", "Rain-Sensing Wipers", "Auto-Dimming Mirrors"
        ]
        
        self.warranties = [
            "3-Year/36,000-Mile Basic Warranty",
            "5-Year/60,000-Mile Powertrain Warranty",
            "8-Year/100,000-Mile Battery Warranty (Electric)",
            "4-Year/50,000-Mile Comprehensive Warranty",
            "6-Year/70,000-Mile Extended Warranty",
            "Lifetime Powertrain Warranty",
            "10-Year/100,000-Mile Limited Warranty"
        ]
        
    def generate_new_car_data(self, num_cars=500):
        """Generate realistic new car data"""
        cars = []
        
        for i in range(num_cars):
            brand = random.choice(self.brands)
            model = random.choice(self.models.get(brand, ["Unknown Model"]))
            year = 2024  # New cars are current year
            
            # Generate realistic price based on brand and model
            base_price = random.randint(25000, 120000)
            if brand in ["Ferrari", "Lamborghini", "Bentley", "Rolls-Royce", "Bugatti"]:
                base_price = random.randint(200000, 800000)
            elif brand in ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Tesla"]:
                base_price = random.randint(40000, 150000)
            elif brand in ["Toyota", "Honda", "Ford", "Chevrolet"]:
                base_price = random.randint(25000, 60000)
            
            # Add some variation to price
            price_variation = random.uniform(0.9, 1.1)
            price = int(base_price * price_variation)
            
            # Select fuel type based on brand
            if brand == "Tesla":
                fuel_type = "Electric"
            elif brand in ["BMW", "Mercedes-Benz", "Audi"]:
                fuel_type = random.choice(["Gasoline", "Diesel", "Hybrid", "Plug-in Hybrid"])
            else:
                fuel_type = random.choice(self.fuel_types)
            
            # Generate features
            safety_count = random.randint(3, 8)
            tech_count = random.randint(4, 10)
            comfort_count = random.randint(3, 8)
            
            safety_selected = random.sample(self.safety_features, min(safety_count, len(self.safety_features)))
            tech_selected = random.sample(self.tech_features, min(tech_count, len(self.tech_features)))
            comfort_selected = random.sample(self.comfort_features, min(comfort_count, len(self.comfort_features)))
            
            all_features = safety_selected + tech_selected + comfort_selected
            features_text = ", ".join(all_features)
            
            # Select warranty
            warranty = random.choice(self.warranties)
            
            # Generate engine size based on brand and model
            if fuel_type == "Electric":
                engine_size = f"{random.randint(50, 100)} kWh Battery"
            else:
                engine_size = f"{random.randint(1, 6)}.{random.randint(0, 9)}L"
            
            car = {
                'brand': brand,
                'model': model,
                'year': str(year),
                'price': f"${price:,}",
                'mileage': '0 km',  # New cars have 0 km
                'fuel_type': fuel_type,
                'transmission': random.choice(self.transmissions),
                'engine_size': engine_size,
                'color': random.choice(self.colors),
                'url': f"https://www.contactcars.com/en/new-cars/{brand.lower().replace(' ', '-')}/{model.lower().replace(' ', '-')}-{year}",
                'description': f"Brand new {year} {brand} {model}. Zero kilometers, full warranty, latest features and technology.",
                'type': 'New Car',
                'warranty': warranty,
                'features': features_text,
                'safety_features': ", ".join(safety_selected),
                'tech_features': ", ".join(tech_selected),
                'comfort_features': ", ".join(comfort_selected),
                'dealer_location': f"ContactCars {brand} Showroom",
                'availability': random.choice(["In Stock", "Available for Order", "Coming Soon"]),
                'delivery_time': random.choice(["Immediate", "1-2 weeks", "2-4 weeks", "4-8 weeks"])
            }
            cars.append(car)
        
        return cars

def save_new_car_data():
    """Generate and save new car data"""
    generator = NewCarDataGenerator()
    cars = generator.generate_new_car_data(500)
    
    # Save to CSV
    with open('new_cars_sample_data.csv', 'w', newline='', encoding='utf-8') as file:
        fieldnames = [
            'brand', 'model', 'year', 'price', 'mileage', 'fuel_type',
            'transmission', 'engine_size', 'color', 'url', 'description',
            'type', 'warranty', 'features', 'safety_features', 'tech_features',
            'comfort_features', 'dealer_location', 'availability', 'delivery_time'
        ]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cars)
    
    # Save to JSON
    with open('new_cars_sample_data.json', 'w', encoding='utf-8') as file:
        json.dump(cars, file, indent=2, ensure_ascii=False)
    
    print(f"Generated {len(cars)} new car records")
    print("Files saved: new_cars_sample_data.csv and new_cars_sample_data.json")
    
    # Print some statistics
    brands_count = {}
    fuel_types_count = {}
    price_ranges = {"$25k-$50k": 0, "$50k-$75k": 0, "$75k-$100k": 0, "$100k+": 0}
    
    for car in cars:
        # Count brands
        brand = car['brand']
        brands_count[brand] = brands_count.get(brand, 0) + 1
        
        # Count fuel types
        fuel = car['fuel_type']
        fuel_types_count[fuel] = fuel_types_count.get(fuel, 0) + 1
        
        # Count price ranges
        price_str = car['price'].replace('$', '').replace(',', '')
        price = int(price_str)
        if price < 50000:
            price_ranges["$25k-$50k"] += 1
        elif price < 75000:
            price_ranges["$50k-$75k"] += 1
        elif price < 100000:
            price_ranges["$75k-$100k"] += 1
        else:
            price_ranges["$100k+"] += 1
    
    print("\n=== New Cars Data Statistics ===")
    print(f"Total cars: {len(cars)}")
    print(f"Brands represented: {len(brands_count)}")
    print(f"Fuel types: {fuel_types_count}")
    print(f"Price distribution: {price_ranges}")

def analyze_new_car_trends():
    """Analyze current new car market trends"""
    trends = {
        "electric_vehicles": [
            "Tesla Model 3 and Model Y continue to dominate",
            "Hyundai Ioniq 5 and Kia EV6 gaining popularity",
            "BMW i4 and Mercedes EQS entering luxury EV market",
            "Ford Mustang Mach-E competing in SUV segment"
        ],
        "safety_features": [
            "Advanced Driver Assistance Systems (ADAS) becoming standard",
            "Automatic Emergency Braking required in many markets",
            "Lane Departure Warning and Blind Spot Monitoring popular",
            "360-degree cameras and parking sensors in high demand"
        ],
        "technology": [
            "Apple CarPlay and Android Auto standard features",
            "Wireless charging and connectivity essential",
            "Digital instrument clusters replacing analog",
            "Voice recognition and gesture control emerging"
        ],
        "warranties": [
            "Extended warranties becoming more common",
            "Battery warranties for EVs typically 8+ years",
            "Comprehensive coverage for 3-5 years standard",
            "Lifetime powertrain warranties offered by some brands"
        ]
    }
    
    return trends

def main():
    """Main function to generate new car data"""
    print("=== New Cars Data Generator ===\n")
    
    # Generate new car data
    print("1. Generating new car data...")
    save_new_car_data()
    print()
    
    # Analyze trends
    print("2. Current new car market trends:")
    trends = analyze_new_car_trends()
    
    for category, trend_list in trends.items():
        print(f"\n{category.replace('_', ' ').title()}:")
        for trend in trend_list:
            print(f"  • {trend}")
    
    print("\n=== Summary ===")
    print("New car data generated with realistic features including:")
    print("- Current year models (2024)")
    print("- Zero mileage (new cars)")
    print("- Modern safety and technology features")
    print("- Realistic warranties and pricing")
    print("- Electric vehicle options")
    print("- Dealer information and availability")

if __name__ == "__main__":
    main()
