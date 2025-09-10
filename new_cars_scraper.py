import requests
from bs4 import BeautifulSoup
import csv
import time
import random
import json
import re
from urllib.parse import urljoin, urlparse
import logging
import cloudscraper
from fake_useragent import UserAgent

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class NewCarsScraper:
    def __init__(self):
        self.base_url = "https://www.contactcars.com"
        self.new_cars_url = "https://www.contactcars.com/en/new-cars"
        self.all_cars = []
        
        # Initialize multiple session types
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
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
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
                
                time.sleep(random.uniform(3, 7))
        return None

    def extract_new_car_brands(self):
        """Extract new car brands from the new cars page"""
        logger.info("Extracting new car brands...")
        
        # Try different approaches to get new car brands
        new_car_urls = [
            "/en/new-cars",
            "/en/new-vehicles",
            "/en/cars/new",
            "/en/vehicles/new",
            "/en/dealers/new-cars",
            "/en/showrooms"
        ]
        
        brands = []
        
        for url_path in new_car_urls:
            full_url = urljoin(self.base_url, url_path)
            response = self.get_page(full_url)
            if response:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for brand links in various possible selectors
                brand_selectors = [
                    'a[href*="/new-cars/"]',
                    'a[href*="/brand/"]',
                    'a[href*="/dealer/"]',
                    'a[href*="/showroom/"]',
                    '.brand-link',
                    '.brand-item a',
                    '.brands-list a',
                    '.dealer-link',
                    '.showroom-link'
                ]
                
                for selector in brand_selectors:
                    brand_links = soup.select(selector)
                    if brand_links:
                        for link in brand_links:
                            href = link.get('href')
                            if href:
                                brand_name = link.get_text(strip=True)
                                if brand_name and len(brand_name) > 1:
                                    brands.append({
                                        'name': brand_name,
                                        'url': urljoin(self.base_url, href)
                                    })
                        break
                
                if brands:
                    logger.info(f"Found {len(brands)} new car brands")
                    break
        
        # If no brands found, use a comprehensive list of new car brands
        if not brands:
            logger.warning("No brands found automatically, using comprehensive new car brands list")
            new_car_brands = [
                "alfa-romeo", "audi", "bmw", "chevrolet", "chrysler", "citroen", 
                "dodge", "fiat", "ford", "honda", "hyundai", "infiniti", "jaguar",
                "jeep", "kia", "land-rover", "lexus", "mazda", "mercedes-benz",
                "mini", "mitsubishi", "nissan", "opel", "peugeot", "porsche",
                "renault", "seat", "skoda", "smart", "subaru", "suzuki", "toyota",
                "volkswagen", "volvo", "acura", "bentley", "buick", "cadillac",
                "ferrari", "gmc", "hummer", "lamborghini", "lotus", "maserati",
                "maybach", "mclaren", "pontiac", "rolls-royce", "saab", "saturn",
                "scion", "tesla", "aston-martin", "bugatti", "corvette", "lincoln",
                "ram", "vauxhall"
            ]
            
            for brand in new_car_brands:
                brands.append({
                    'name': brand.replace('-', ' ').title(),
                    'url': f"{self.base_url}/en/new-cars/{brand}"
                })
        
        return brands

    def scrape_new_car_brand(self, brand_info):
        """Scrape new cars for a specific brand"""
        brand_name = brand_info['name']
        brand_url = brand_info['url']
        
        logger.info(f"Scraping new cars for brand: {brand_name}")
        
        page = 1
        max_pages = 20  # Safety limit for new cars
        
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
                
                # Find new car listings with various possible selectors
                car_selectors = [
                    '.new-car-item',
                    '.new-vehicle-item',
                    '.car-item',
                    '.vehicle-item',
                    '.listing-item',
                    '.car-card',
                    '.vehicle-card',
                    '.product-item',
                    'a[href*="/new-car/"]',
                    'a[href*="/new-vehicle/"]',
                    'a[href*="/car/"]',
                    'a[href*="/vehicle/"]',
                    '[class*="new-car"]',
                    '[class*="new-vehicle"]',
                    '[class*="car"]',
                    '[class*="vehicle"]'
                ]
                
                car_listings = []
                for selector in car_selectors:
                    car_listings = soup.select(selector)
                    if car_listings:
                        logger.info(f"Found {len(car_listings)} car listings with selector: {selector}")
                        break
                
                if not car_listings:
                    logger.info(f"No more new car listings found for {brand_name} on page {page}")
                    break
                
                cars_found = 0
                for listing in car_listings:
                    try:
                        car_data = self.extract_new_car_from_listing(listing, brand_name)
                        if car_data:
                            self.all_cars.append(car_data)
                            cars_found += 1
                    except Exception as e:
                        logger.error(f"Error extracting car data: {e}")
                        continue
                
                logger.info(f"Found {cars_found} new cars on page {page}")
                
                if cars_found == 0:
                    break
                
                # Random delay between pages
                delay = random.uniform(4, 8)
                logger.info(f"Waiting {delay:.2f} seconds...")
                time.sleep(delay)
                
                page += 1
                
            except Exception as e:
                logger.error(f"Error scraping page {page} for {brand_name}: {e}")
                break
        
        logger.info(f"Completed scraping {brand_name}. Total new cars found: {len([car for car in self.all_cars if car['brand'] == brand_name])}")

    def extract_new_car_from_listing(self, listing, brand_name):
        """Extract new car information from a listing element"""
        car_data = {
            'brand': brand_name,
            'model': '',
            'year': '',
            'price': '',
            'mileage': '0 km',  # New cars typically have 0 km
            'fuel_type': '',
            'transmission': '',
            'engine_size': '',
            'color': '',
            'url': '',
            'description': '',
            'type': 'New Car',
            'warranty': '',
            'features': ''
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
                else:
                    # For new cars, use current year
                    car_data['year'] = str(2024)
                break
        
        # Extract price
        price_selectors = [
            '.price', '.car-price', '.vehicle-price',
            '.product-price', '.listing-price', '.new-car-price',
            '[class*="price"]', '.cost', '.value'
        ]
        
        for selector in price_selectors:
            price_elem = listing.select_one(selector)
            if price_elem:
                car_data['price'] = price_elem.get_text(strip=True)
                break
        
        # Extract other details
        detail_selectors = [
            '.fuel', '.transmission', '.engine', '.color',
            '.fuel-type', '.transmission-type', '.engine-size',
            '[class*="fuel"]', '[class*="transmission"]',
            '[class*="engine"]', '[class*="color"]'
        ]
        
        for selector in detail_selectors:
            elem = listing.select_one(selector)
            if elem:
                text = elem.get_text(strip=True)
                if 'fuel' in selector.lower():
                    car_data['fuel_type'] = text
                elif 'transmission' in selector.lower():
                    car_data['transmission'] = text
                elif 'engine' in selector.lower():
                    car_data['engine_size'] = text
                elif 'color' in selector.lower():
                    car_data['color'] = text
        
        # Extract warranty information for new cars
        warranty_selectors = [
            '.warranty', '.guarantee', '.coverage',
            '[class*="warranty"]', '[class*="guarantee"]'
        ]
        
        for selector in warranty_selectors:
            warranty_elem = listing.select_one(selector)
            if warranty_elem:
                car_data['warranty'] = warranty_elem.get_text(strip=True)
                break
        
        # Extract features
        features_selectors = [
            '.features', '.specs', '.specifications',
            '[class*="features"]', '[class*="specs"]'
        ]
        
        for selector in features_selectors:
            features_elem = listing.select_one(selector)
            if features_elem:
                car_data['features'] = features_elem.get_text(strip=True)
                break
        
        return car_data

    def save_to_csv(self, filename='new_cars_data.csv'):
        """Save scraped new car data to CSV file"""
        if not self.all_cars:
            logger.warning("No new car data to save")
            return
        
        fieldnames = [
            'brand', 'model', 'year', 'price', 'mileage', 'fuel_type',
            'transmission', 'engine_size', 'color', 'url', 'description',
            'type', 'warranty', 'features'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.all_cars)
        
        logger.info(f"New car data saved to {filename}")
        logger.info(f"Total new cars scraped: {len(self.all_cars)}")

    def save_to_json(self, filename='new_cars_data.json'):
        """Save scraped new car data to JSON file"""
        if not self.all_cars:
            logger.warning("No new car data to save")
            return
        
        with open(filename, 'w', encoding='utf-8') as file:
            json.dump(self.all_cars, file, indent=2, ensure_ascii=False)
        
        logger.info(f"New car data saved to {filename}")

    def run(self, max_brands=None):
        """Main method to run the new cars scraper"""
        logger.info("Starting New Cars scraper...")
        
        # Extract new car brands
        brands = self.extract_new_car_brands()
        logger.info(f"Found {len(brands)} new car brands to scrape")
        
        # Limit brands for testing if specified
        if max_brands:
            brands = brands[:max_brands]
            logger.info(f"Limited to {len(brands)} brands for testing")
        
        # Scrape each brand
        for i, brand in enumerate(brands, 1):
            logger.info(f"Progress: {i}/{len(brands)} - {brand['name']}")
            self.scrape_new_car_brand(brand)
            
            # Longer delay between brands
            if i < len(brands):
                delay = random.uniform(8, 15)
                logger.info(f"Waiting {delay:.2f} seconds before next brand...")
                time.sleep(delay)
        
        # Save data
        if self.all_cars:
            self.save_to_csv()
            self.save_to_json()
            logger.info("New cars scraping completed successfully!")
        else:
            logger.warning("No new car data was collected")

def main():
    """Main function to run the new cars scraper"""
    scraper = NewCarsScraper()
    
    # For testing, limit to 3 brands
    scraper.run(max_brands=3)

if __name__ == "__main__":
    main()
