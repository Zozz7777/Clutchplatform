import requests
from bs4 import BeautifulSoup
import csv
import time
import random
import json
import re
from urllib.parse import urljoin, urlparse
import logging
from fake_useragent import UserAgent
import cloudscraper

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedContactCarsScraper:
    def __init__(self):
        self.base_url = "https://www.contactcars.com"
        self.all_cars = []
        self.brands = []
        
        # Initialize different session types for different approaches
        self.session = requests.Session()
        self.scraper = cloudscraper.create_scraper()
        
        # Rotate user agents
        try:
            self.ua = UserAgent()
        except:
            self.ua = None
        
        self.setup_headers()
        
    def setup_headers(self):
        """Setup headers with rotating user agents"""
        if self.ua:
            user_agent = self.ua.random
        else:
            user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        
        self.headers = {
            'User-Agent': user_agent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
            'DNT': '1',
        }
        
        self.session.headers.update(self.headers)
        self.scraper.headers.update(self.headers)
    
    def get_page(self, url, retries=3, use_cloudscraper=False):
        """Get page content with multiple fallback methods"""
        for attempt in range(retries):
            try:
                # Rotate user agent for each attempt
                if self.ua:
                    self.session.headers['User-Agent'] = self.ua.random
                    self.scraper.headers['User-Agent'] = self.ua.random
                
                if use_cloudscraper:
                    response = self.scraper.get(url, timeout=30)
                else:
                    response = self.session.get(url, timeout=30)
                
                response.raise_for_status()
                return response
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                
                if attempt == retries - 1:
                    # Try cloudscraper as last resort
                    if not use_cloudscraper:
                        logger.info("Trying cloudscraper as fallback...")
                        return self.get_page(url, retries=1, use_cloudscraper=True)
                    else:
                        logger.error(f"Failed to get {url} after all attempts")
                        return None
                
                time.sleep(random.uniform(2, 5))
        return None

    def extract_brands_from_api(self):
        """Try to extract brands from potential API endpoints"""
        logger.info("Trying to extract brands from API endpoints...")
        
        api_endpoints = [
            "/api/brands",
            "/api/cars/brands",
            "/api/vehicles/brands",
            "/api/categories",
            "/api/makes"
        ]
        
        for endpoint in api_endpoints:
            url = urljoin(self.base_url, endpoint)
            response = self.get_page(url)
            if response:
                try:
                    data = response.json()
                    logger.info(f"Found API data at {endpoint}")
                    return self.parse_api_brands(data)
                except:
                    continue
        
        return []

    def parse_api_brands(self, data):
        """Parse brands from API response"""
        brands = []
        
        # Handle different API response structures
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict):
                    brand_name = item.get('name') or item.get('brand') or item.get('make')
                    brand_url = item.get('url') or item.get('slug')
                    if brand_name:
                        brands.append({
                            'name': brand_name,
                            'url': f"{self.base_url}/en/used-cars/{brand_url}" if brand_url else None
                        })
        elif isinstance(data, dict):
            # Handle nested structures
            for key in ['brands', 'makes', 'categories', 'data']:
                if key in data:
                    return self.parse_api_brands(data[key])
        
        return brands

    def extract_brands(self):
        """Extract all available car brands using multiple methods"""
        logger.info("Extracting car brands...")
        
        # Method 1: Try API endpoints
        brands = self.extract_brands_from_api()
        if brands:
            self.brands = brands
            logger.info(f"Found {len(brands)} brands via API")
            return brands
        
        # Method 2: Try different page URLs
        brand_urls = [
            "/en/used-cars",
            "/en/cars",
            "/en/brands",
            "/en/vehicles",
            "/en/search",
            "/en/catalog"
        ]
        
        for url_path in brand_urls:
            full_url = urljoin(self.base_url, url_path)
            response = self.get_page(full_url)
            if response:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for brand links in various possible selectors
                brand_selectors = [
                    'a[href*="/brand/"]',
                    'a[href*="/used-cars/"]',
                    'a[href*="/cars/"]',
                    'a[href*="/make/"]',
                    '.brand-link',
                    '.brand-item a',
                    '.brands-list a',
                    '.makes-list a',
                    'a[href*="brand"]',
                    'a[href*="make"]'
                ]
                
                for selector in brand_selectors:
                    brand_links = soup.select(selector)
                    if brand_links:
                        for link in brand_links:
                            href = link.get('href')
                            if href:
                                brand_name = link.get_text(strip=True)
                                if brand_name and len(brand_name) > 1:
                                    self.brands.append({
                                        'name': brand_name,
                                        'url': urljoin(self.base_url, href)
                                    })
                        break
                
                if self.brands:
                    logger.info(f"Found {len(self.brands)} brands")
                    break
        
        # Method 3: Use fallback list if no brands found
        if not self.brands:
            logger.warning("No brands found automatically, using comprehensive fallback list")
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
                "saturn", "scion", "tesla", "vauxhall"
            ]
            
            for brand in fallback_brands:
                self.brands.append({
                    'name': brand.replace('-', ' ').title(),
                    'url': f"{self.base_url}/en/used-cars/{brand}"
                })
        
        return self.brands

    def scrape_brand(self, brand_info):
        """Scrape all cars for a specific brand"""
        brand_name = brand_info['name']
        brand_url = brand_info['url']
        
        logger.info(f"Scraping brand: {brand_name}")
        
        page = 1
        max_pages = 20  # Reduced for testing
        
        while page <= max_pages:
            try:
                # Construct page URL
                if '?' in brand_url:
                    page_url = f"{brand_url}&page={page}"
                else:
                    page_url = f"{brand_url}?page={page}"
                
                logger.info(f"Scraping page {page}: {page_url}")
                
                response = self.get_page(page_url)
                if not response:
                    break
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Find car listings with various possible selectors
                car_selectors = [
                    '.car-item',
                    '.vehicle-item',
                    '.listing-item',
                    '.car-card',
                    '.vehicle-card',
                    '.product-item',
                    'a[href*="/car/"]',
                    'a[href*="/vehicle/"]',
                    'a[href*="/product/"]',
                    '[class*="car"]',
                    '[class*="vehicle"]',
                    '[class*="listing"]'
                ]
                
                car_listings = []
                for selector in car_selectors:
                    car_listings = soup.select(selector)
                    if car_listings:
                        break
                
                if not car_listings:
                    logger.info(f"No more car listings found for {brand_name} on page {page}")
                    break
                
                cars_found = 0
                for listing in car_listings:
                    try:
                        car_data = self.extract_car_from_listing(listing, brand_name)
                        if car_data:
                            self.all_cars.append(car_data)
                            cars_found += 1
                    except Exception as e:
                        logger.error(f"Error extracting car data: {e}")
                        continue
                
                logger.info(f"Found {cars_found} cars on page {page}")
                
                if cars_found == 0:
                    break
                
                # Random delay between pages
                delay = random.uniform(3, 7)
                logger.info(f"Waiting {delay:.2f} seconds...")
                time.sleep(delay)
                
                page += 1
                
            except Exception as e:
                logger.error(f"Error scraping page {page} for {brand_name}: {e}")
                break
        
        logger.info(f"Completed scraping {brand_name}. Total cars found: {len([car for car in self.all_cars if car['brand'] == brand_name])}")

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
            'h2', 'h3', 'h4',
            '.title', '.car-title', '.vehicle-title',
            '.model', '.car-model', '.vehicle-model',
            '.name', '.product-name',
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
            '.price', '.car-price', '.vehicle-price',
            '.product-price', '.listing-price',
            '[class*="price"]'
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
        logger.info("Starting Enhanced ContactCars scraper...")
        
        # Extract brands
        brands = self.extract_brands()
        logger.info(f"Found {len(brands)} brands to scrape")
        
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
                delay = random.uniform(8, 15)
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
    scraper = EnhancedContactCarsScraper()
    
    # For testing, limit to 3 brands
    scraper.run(max_brands=3)

if __name__ == "__main__":
    main()
