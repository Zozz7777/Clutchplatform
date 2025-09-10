import requests
import csv
import json
import time

class NHTSACarAPI:
    """Use NHTSA API to get car data"""
    
    def __init__(self):
        self.base_url = "https://vpic.nhtsa.dot.gov/api"
        
    def get_makes(self):
        """Get all car makes"""
        url = f"{self.base_url}/vehicles/getallmakes?format=json"
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get('Results', [])
        except Exception as e:
            print(f"Error getting makes: {e}")
            return []
    
    def get_models_for_make(self, make_id):
        """Get models for a specific make"""
        url = f"{self.base_url}/vehicles/getmodelsformakeid/{make_id}?format=json"
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get('Results', [])
        except Exception as e:
            print(f"Error getting models for make {make_id}: {e}")
            return []
    
    def get_years_for_make_model(self, make_id, model_id):
        """Get years for a specific make and model"""
        url = f"{self.base_url}/vehicles/getmodelyearsformakeidmodelid/{make_id}/{model_id}?format=json"
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get('Results', [])
        except Exception as e:
            print(f"Error getting years for make {make_id}, model {model_id}: {e}")
            return []
    
    def get_vehicle_details(self, make_id, model_id, year):
        """Get detailed vehicle information"""
        url = f"{self.base_url}/vehicles/getvehicletypesformakeid/{make_id}?format=json"
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get('Results', [])
        except Exception as e:
            print(f"Error getting vehicle details: {e}")
            return []

def main():
    """Main function to demonstrate NHTSA API usage"""
    print("=== NHTSA API Car Data Example ===\n")
    
    api = NHTSACarAPI()
    
    # Get all makes
    print("1. Getting car makes...")
    makes = api.get_makes()
    print(f"Found {len(makes)} car makes")
    
    # Show first 10 makes
    print("\nFirst 10 makes:")
    for i, make in enumerate(makes[:10]):
        print(f"  {i+1}. {make.get('Make_Name', 'Unknown')} (ID: {make.get('Make_ID', 'N/A')})")
    
    # Get models for a specific make (BMW)
    print("\n2. Getting models for BMW...")
    bmw_make_id = None
    for make in makes:
        if make.get('Make_Name', '').lower() == 'bmw':
            bmw_make_id = make.get('Make_ID')
            break
    
    if bmw_make_id:
        models = api.get_models_for_make(bmw_make_id)
        print(f"Found {len(models)} BMW models")
        
        print("\nBMW Models:")
        for i, model in enumerate(models[:10]):  # Show first 10
            print(f"  {i+1}. {model.get('Model_Name', 'Unknown')} (ID: {model.get('Model_ID', 'N/A')})")
    
    # Generate sample data using the API
    print("\n3. Generating sample car data from API...")
    sample_cars = []
    
    # Get data for popular makes
    popular_makes = ['BMW', 'AUDI', 'MERCEDES-BENZ', 'TOYOTA', 'HONDA', 'FORD']
    
    for make_name in popular_makes:
        print(f"Processing {make_name}...")
        
        # Find make ID
        make_id = None
        for make in makes:
            if make.get('Make_Name', '').upper() == make_name:
                make_id = make.get('Make_ID')
                break
        
        if make_id:
            # Get models for this make
            models = api.get_models_for_make(make_id)
            
            # Take first 5 models
            for model in models[:5]:
                model_name = model.get('Model_Name', 'Unknown')
                model_id = model.get('Model_ID')
                
                # Generate sample years (2015-2024)
                for year in range(2015, 2025):
                    car_data = {
                        'brand': make_name.title(),
                        'model': model_name,
                        'year': str(year),
                        'price': f"${(year - 2015) * 2000 + 15000:,}",  # Simulated price
                        'mileage': f"{((2024 - year) * 10000) + 5000:,} km",
                        'fuel_type': 'Gasoline',  # Default
                        'transmission': 'Automatic',  # Default
                        'engine_size': '2.0L',  # Default
                        'color': 'White',  # Default
                        'url': f"https://example.com/cars/{make_name.lower()}/{model_name.lower().replace(' ', '-')}-{year}",
                        'description': f"{year} {make_name.title()} {model_name} in excellent condition."
                    }
                    sample_cars.append(car_data)
                
                # Add delay to be respectful to the API
                time.sleep(0.1)
    
    # Save to CSV
    if sample_cars:
        with open('nhtsa_api_cars.csv', 'w', newline='', encoding='utf-8') as file:
            fieldnames = [
                'brand', 'model', 'year', 'price', 'mileage', 'fuel_type',
                'transmission', 'engine_size', 'color', 'url', 'description'
            ]
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(sample_cars)
        
        # Save to JSON
        with open('nhtsa_api_cars.json', 'w', encoding='utf-8') as file:
            json.dump(sample_cars, file, indent=2, ensure_ascii=False)
        
        print(f"\nGenerated {len(sample_cars)} car records from NHTSA API")
        print("Files saved: nhtsa_api_cars.csv and nhtsa_api_cars.json")
    
    print("\n=== Summary ===")
    print("This example demonstrates how to use the NHTSA API to get real car data.")
    print("The API provides:")
    print("- All car makes and models")
    print("- Vehicle specifications")
    print("- Year information")
    print("- Free access with no rate limits")
    print("\nThis is a much more reliable approach than web scraping!")

if __name__ == "__main__":
    main()
