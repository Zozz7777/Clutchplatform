const axios = require('axios');

class RealWebSearchService {
  constructor() {
    this.apiKeys = {
      google: process.env.GOOGLE_SEARCH_API_KEY,
      googleCSE: process.env.GOOGLE_CSE_ID,
      bing: process.env.BING_SEARCH_API_KEY,
      duckduckgo: process.env.DUCKDUCKGO_API_KEY
    };
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Search using Google Custom Search API
   */
  async searchGoogle(query, options = {}) {
    try {
      if (!this.apiKeys.google || !this.apiKeys.googleCSE) {
        throw new Error('Google Search API key or CSE ID not configured');
      }

      const params = {
        key: this.apiKeys.google,
        cx: this.apiKeys.googleCSE,
        q: query,
        num: options.limit || 10,
        start: options.offset || 1,
        safe: options.safe || 'medium'
      };

      const response = await axios.get('https://www.googleapis.com/customsearch/v1', { params });
      
      return response.data.items?.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        source: 'Google',
        timestamp: new Date().toISOString()
      })) || [];
    } catch (error) {
      console.error('Google search failed:', error.message);
      return [];
    }
  }

  /**
   * Search using Bing Search API
   */
  async searchBing(query, options = {}) {
    try {
      if (!this.apiKeys.bing) {
        throw new Error('Bing Search API key not configured');
      }

      const params = {
        q: query,
        count: options.limit || 10,
        offset: options.offset || 0,
        mkt: options.market || 'en-US',
        safeSearch: options.safe || 'Moderate'
      };

      const response = await axios.get('https://api.bing.microsoft.com/v7.0/search', {
        params,
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKeys.bing
        }
      });

      return response.data.webPages?.value?.map(item => ({
        title: item.name,
        link: item.url,
        snippet: item.snippet,
        source: 'Bing',
        timestamp: new Date().toISOString()
      })) || [];
    } catch (error) {
      console.error('Bing search failed:', error.message);
      return [];
    }
  }

  /**
   * Search using DuckDuckGo Instant Answer API
   */
  async searchDuckDuckGo(query, options = {}) {
    try {
      const params = {
        q: query,
        format: 'json',
        no_html: 1,
        skip_disambig: 1
      };

      const response = await axios.get('https://api.duckduckgo.com/', { params });
      
      const results = [];
      
      // Add abstract if available
      if (response.data.Abstract) {
        results.push({
          title: response.data.Heading || query,
          link: response.data.AbstractURL || '',
          snippet: response.data.Abstract,
          source: 'DuckDuckGo',
          timestamp: new Date().toISOString()
        });
      }

      // Add related topics
      if (response.data.RelatedTopics) {
        response.data.RelatedTopics.slice(0, options.limit || 5).forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text,
              link: topic.FirstURL,
              snippet: topic.Text,
              source: 'DuckDuckGo',
              timestamp: new Date().toISOString()
            });
          }
        });
      }

      return results;
    } catch (error) {
      console.error('DuckDuckGo search failed:', error.message);
      return [];
    }
  }

  /**
   * Search using multiple engines and combine results
   */
  async searchWeb(query, options = {}) {
    const cacheKey = `search_${query}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.results;
    }

    try {
      const searchPromises = [];
      
      // Add Google search if API key is available
      if (this.apiKeys.google && this.apiKeys.googleCSE) {
        searchPromises.push(this.searchGoogle(query, options));
      }
      
      // Add Bing search if API key is available
      if (this.apiKeys.bing) {
        searchPromises.push(this.searchBing(query, options));
      }
      
      // Always add DuckDuckGo (no API key required)
      searchPromises.push(this.searchDuckDuckGo(query, options));

      const results = await Promise.all(searchPromises);
      const combinedResults = results.flat();
      
      // Remove duplicates based on URL
      const uniqueResults = combinedResults.filter((result, index, self) => 
        index === self.findIndex(r => r.link === result.link)
      );

      // Sort by relevance (you could implement more sophisticated ranking)
      const sortedResults = uniqueResults.slice(0, options.limit || 20);

      // Cache results
      this.cache.set(cacheKey, {
        results: sortedResults,
        timestamp: Date.now()
      });

      return sortedResults;
    } catch (error) {
      console.error('Web search failed:', error);
      return [];
    }
  }

  /**
   * Search for technical documentation
   */
  async searchTechnicalDocs(query, options = {}) {
    const technicalQuery = `${query} documentation API reference`;
    return this.searchWeb(technicalQuery, { ...options, limit: 10 });
  }

  /**
   * Search for code examples
   */
  async searchCodeExamples(query, options = {}) {
    const codeQuery = `${query} code example tutorial`;
    return this.searchWeb(codeQuery, { ...options, limit: 10 });
  }

  /**
   * Search for recent news
   */
  async searchNews(query, options = {}) {
    const newsQuery = `${query} news latest 2024`;
    return this.searchWeb(newsQuery, { ...options, limit: 10 });
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query) {
    try {
      const response = await axios.get('https://suggestqueries.google.com/complete/search', {
        params: {
          client: 'firefox',
          q: query
        }
      });

      return response.data[1] || [];
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  /**
   * Clear search cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = RealWebSearchService;