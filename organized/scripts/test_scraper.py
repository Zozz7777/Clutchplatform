import requests
from bs4 import BeautifulSoup
import json

def test_website_access():
    """Test if we can access the website and understand its structure"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    # Test URLs
    test_urls = [
        "https://www.contactcars.com",
        "https://www.contactcars.com/en",
        "https://www.contactcars.com/en/used-cars",
        "https://www.contactcars.com/en/cars"
    ]
    
    for url in test_urls:
        print(f"\n=== Testing URL: {url} ===")
        try:
            response = requests.get(url, headers=headers, timeout=10)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Print page title
                title = soup.title.string if soup.title else "No title found"
                print(f"Page Title: {title}")
                
                # Look for potential brand links
                brand_links = []
                selectors = [
                    'a[href*="/brand/"]',
                    'a[href*="/used-cars/"]',
                    'a[href*="/cars/"]',
                    '.brand-link',
                    '.brand-item a'
                ]
                
                for selector in selectors:
                    links = soup.select(selector)
                    if links:
                        print(f"Found {len(links)} links with selector: {selector}")
                        for link in links[:5]:  # Show first 5
                            href = link.get('href', '')
                            text = link.get_text(strip=True)
                            if text and len(text) > 1:
                                brand_links.append({'text': text, 'href': href})
                        break
                
                # Look for car listings
                car_selectors = [
                    '.car-item',
                    '.vehicle-item',
                    '.listing-item',
                    'a[href*="/car/"]',
                    'a[href*="/vehicle/"]'
                ]
                
                for selector in car_selectors:
                    cars = soup.select(selector)
                    if cars:
                        print(f"Found {len(cars)} car listings with selector: {selector}")
                        break
                
                # Save sample HTML for inspection
                with open(f'sample_page_{url.split("/")[-1] or "home"}.html', 'w', encoding='utf-8') as f:
                    f.write(soup.prettify())
                print(f"Saved sample HTML to sample_page_{url.split('/')[-1] or 'home'}.html")
                
            else:
                print(f"Failed to access URL: {response.status_code}")
                
        except Exception as e:
            print(f"Error accessing {url}: {e}")

if __name__ == "__main__":
    test_website_access()
