import requests
from bs4 import BeautifulSoup
import csv
import time
import random
import json
import re
from urllib.parse import urljoin
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SimpleContactCarsScraper:
    def __init__(self):
        self.base_url = "https://www.contactcars.com"
        self.all_cars = []
        self.brands = []
        
        # Create session with rotating user agents
        self.session = requests.Session()
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
        ]
        
        self.setup_headers()
        
    def setup_headers(self):
        """Setup headers with random user agent"""
        user_agent = random.choice(self.user_agents)
        
        self.headers = {
            'User-Agent': user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'DNT': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
        }
        
        self.session.headers.update(self.headers)
    
    def get_page(self, url, retries=3):
        """Get page content with retry logic and rotating user agents"""
        for attempt in range(retries):
            try:
                # Rotate user agent for each attempt
                self.session.headers['User-Agent'] = random.choice(self.user_agents)
                
                response = self.session.get(url, timeout=30)
                
                # If we get 403, try with different headers
                if response.status_code == 403:
                    logger.warning(f"Got 403 for {url}, trying with different approach...")
                    # Try with minimal headers
                    minimal_headers = {
                        'User-Agent': random.choice(self.user_agents),
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    }
                    response = self.session.get(url, headers=minimal_headers, timeout=30)
                
                response.raise_for_status()
                return response
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt == retries - 1:
                    logger.error(f"Failed to get {url} after {retries} attempts")
                    return None
                time.sleep(random.uniform(3, 7))
        return None

    def extract_brands(self):
        """Extract car brands using fallback list since website blocks scraping"""
        logger.info("Using comprehensive car brands list...")
        
        # Comprehensive list of car brands
        fallback_brands = [
            "alfa-romeo", "audi", "bmw", "chevrolet", "chrysler", "citroen", 
            "dodge", "fiat", "ford", "honda", "hyundai", "infiniti", "jaguar",
            "jeep", "kia", "land-rover", "lexus", "mazda", "mercedes-benz",
            "mini", "mitsubishi", "nissan", "opel", "peugeot", "porsche",
            "renault", "seat", "skoda", "smart", "subaru", "suzuki", "toyota",
            "volkswagen", "volvo", "acura", "bentley", "buick", "cadillac",
            "daewoo", "daihatsu", "ferrari", "fisker", "gmc", "hummer",
            "isuzu", "lamborghini", "lancia", "lotus", "maserati", "maybach",
            "mclaren", "oldsmobile", "pontiac", "rolls-royce", "saab",
            "saturn", "scion", "tesla", "vauxhall", "aston-martin", "bentley",
            "bugatti", "chevrolet", "corvette", "dodge", "ferrari", "fiat",
            "ford", "gmc", "honda", "hyundai", "infiniti", "jaguar", "jeep",
            "kia", "lamborghini", "land-rover", "lexus", "lincoln", "lotus",
            "maserati", "mazda", "mclaren", "mercedes-benz", "mini", "mitsubishi",
            "nissan", "oldsmobile", "pontiac", "porsche", "ram", "rolls-royce",
            "saab", "saturn", "scion", "smart", "subaru", "suzuki", "tesla",
            "toyota", "volkswagen", "volvo"
        ]
        
        for brand in fallback_brands:
            self.brands.append({
                'name': brand.replace('-', ' ').title(),
                'url': f"{self.base_url}/en/used-cars/{brand}"
            })
        
        logger.info(f"Prepared {len(self.brands)} brands for scraping")
        return self.brands

    def scrape_brand(self, brand_info):
        """Scrape cars for a specific brand"""
        brand_name = brand_info['name']
        brand_url = brand_info['url']
        
        logger.info(f"Attempting to scrape brand: {brand_name}")
        
        # Try to access the brand page
        response = self.get_page(brand_url)
        if not response:
            logger.warning(f"Could not access {brand_name} page, skipping...")
            return
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for car listings
        car_selectors = [
            '.car-item', '.vehicle-item', '.listing-item', '.car-card', '.vehicle-card',
            '.product-item', 'a[href*="/car/"]', 'a[href*="/vehicle/"]', 'a[href*="/product/"]',
            '[class*="car"]', '[class*="vehicle"]', '[class*="listing"]', '.item', '.card'
        ]
        
        car_listings = []
        for selector in car_selectors:
            car_listings = soup.select(selector)
            if car_listings:
                logger.info(f"Found {len(car_listings)} car listings with selector: {selector}")
                break
        
        if not car_listings:
            logger.info(f"No car listings found for {brand_name}")
            return
        
        # Extract car data from listings
        for listing in car_listings:
            try:
                car_data = self.extract_car_from_listing(listing, brand_name)
                if car_data:
                    self.all_cars.append(car_data)
            except Exception as e:
                logger.error(f"Error extracting car data: {e}")
                continue
        
        logger.info(f"Extracted {len([car for car in self.all_cars if car['brand'] == brand_name])} cars for {brand_name}")

    def extract_car_from_listing(self, listing, brand_name):
        """Extract car information from a listing element"""
        car_data = {
            'brand': brand_name,
            'model': '',
            'year': '',
            'price': '',
            'mileage': '',
            'fuel_type': '',
            'transmission': '',
            'engine_size': '',
            'color': '',
            'url': '',
            'description': ''
        }
        
        # Extract URL
        link = listing.find('a')
        if link:
            href = link.get('href')
            if href:
                car_data['url'] = urljoin(self.base_url, href)
        
        # Extract title/model
        title_selectors = [
            'h2', 'h3', 'h4', '.title', '.car-title', '.vehicle-title',
            '.model', '.car-model', '.vehicle-model', '.name', '.product-name',
            '[class*="title"]', '[class*="model"]', '[class*="name"]'
        ]
        
        for selector in title_selectors:
            title_elem = listing.select_one(selector)
            if title_elem:
                title_text = title_elem.get_text(strip=True)
                car_data['model'] = title_text
                
                # Try to extract year from title
                year_match = re.search(r'\b(19|20)\d{2}\b', title_text)
                if year_match:
                    car_data['year'] = year_match.group()
                break
        
        # Extract price
        price_selectors = [
            '.price', '.car-price', '.vehicle-price', '.product-price', '.listing-price',
            '[class*="price"]', '.cost', '.value'
        ]
        
        for selector in price_selectors:
            price_elem = listing.select_one(selector)
            if price_elem:
                car_data['price'] = price_elem.get_text(strip=True)
                break
        
        # Extract other details
        detail_selectors = [
            '.mileage', '.fuel', '.transmission', '.engine', '.color',
            '.km', '.fuel-type', '.transmission-type', '.engine-size',
            '[class*="mileage"]', '[class*="fuel"]', '[class*="transmission"]',
            '[class*="engine"]', '[class*="color"]', '[class*="km"]'
        ]
        
        for selector in detail_selectors:
            elem = listing.select_one(selector)
            if elem:
                text = elem.get_text(strip=True)
                if 'mileage' in selector.lower() or 'km' in selector.lower():
                    car_data['mileage'] = text
                elif 'fuel' in selector.lower():
                    car_data['fuel_type'] = text
                elif 'transmission' in selector.lower():
                    car_data['transmission'] = text
                elif 'engine' in selector.lower():
                    car_data['engine_size'] = text
                elif 'color' in selector.lower():
                    car_data['color'] = text
        
        return car_data

    def save_to_csv(self, filename='contactcars_data.csv'):
        """Save scraped data to CSV file"""
        if not self.all_cars:
            logger.warning("No car data to save")
            return
        
        fieldnames = [
            'brand', 'model', 'year', 'price', 'mileage', 'fuel_type',
            'transmission', 'engine_size', 'color', 'url', 'description'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.all_cars)
        
        logger.info(f"Data saved to {filename}")
        logger.info(f"Total cars scraped: {len(self.all_cars)}")

    def save_to_json(self, filename='contactcars_data.json'):
        """Save scraped data to JSON file"""
        if not self.all_cars:
            logger.warning("No car data to save")
            return
        
        with open(filename, 'w', encoding='utf-8') as file:
            json.dump(self.all_cars, file, indent=2, ensure_ascii=False)
        
        logger.info(f"Data saved to {filename}")

    def run(self, max_brands=None):
        """Main method to run the scraper"""
        logger.info("Starting Simple ContactCars scraper...")
        
        # Extract brands
        brands = self.extract_brands()
        logger.info(f"Prepared {len(brands)} brands to scrape")
        
        # Limit brands for testing if specified
        if max_brands:
            brands = brands[:max_brands]
            logger.info(f"Limited to {len(brands)} brands for testing")
        
        # Scrape each brand
        for i, brand in enumerate(brands, 1):
            logger.info(f"Progress: {i}/{len(brands)} - {brand['name']}")
            self.scrape_brand(brand)
            
            # Longer delay between brands
            if i < len(brands):
                delay = random.uniform(5, 10)
                logger.info(f"Waiting {delay:.2f} seconds before next brand...")
                time.sleep(delay)
        
        # Save data
        if self.all_cars:
            self.save_to_csv()
            self.save_to_json()
            logger.info("Scraping completed successfully!")
        else:
            logger.warning("No car data was collected")

def main():
    """Main function to run the scraper"""
    scraper = SimpleContactCarsScraper()
    
    # For testing, limit to 5 brands
    scraper.run(max_brands=5)

if __name__ == "__main__":
    main()
