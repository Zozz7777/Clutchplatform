/**
 * Real Web Search Service for Autonomous AI Team
 * Provides actual web search capabilities for research-first approach
 */

const axios = require('axios');
const winston = require('winston');

class RealWebSearchService {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/web-search.log' }),
        new winston.transports.Console()
      ]
    });

    // Search engines configuration
    this.searchEngines = {
      google: {
        enabled: true,
        apiKey: process.env.GOOGLE_SEARCH_API_KEY,
        searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
        baseUrl: 'https://www.googleapis.com/customsearch/v1'
      },
      duckduckgo: {
        enabled: true,
        baseUrl: 'https://api.duckduckgo.com'
      },
      stackoverflow: {
        enabled: true,
        baseUrl: 'https://api.stackexchange.com/2.3'
      },
      github: {
        enabled: true,
        baseUrl: 'https://api.github.com'
      }
    };

    // Rate limiting
    this.rateLimits = {
      google: { requests: 0, resetTime: Date.now() + 86400000 }, // 100 requests per day
      duckduckgo: { requests: 0, resetTime: Date.now() + 3600000 }, // No official limit
      stackoverflow: { requests: 0, resetTime: Date.now() + 3600000 }, // 10,000 requests per day
      github: { requests: 0, resetTime: Date.now() + 3600000 } // 5,000 requests per hour
    };
  }

  /**
   * Search for information across multiple sources
   */
  async search(query, context = {}) {
    this.logger.info(`🔍 Real web search for: ${query}`);

    const results = [];
    const searchPromises = [];

    // Google Custom Search (if configured)
    if (this.searchEngines.google.enabled && this.searchEngines.google.apiKey) {
      searchPromises.push(this.searchGoogle(query, context));
    }

    // DuckDuckGo (no API key required)
    if (this.searchEngines.duckduckgo.enabled) {
      searchPromises.push(this.searchDuckDuckGo(query, context));
    }

    // Stack Overflow (for technical queries)
    if (this.searchEngines.stackoverflow.enabled && this.isTechnicalQuery(query)) {
      searchPromises.push(this.searchStackOverflow(query, context));
    }

    // GitHub (for code-related queries)
    if (this.searchEngines.github.enabled && this.isCodeQuery(query)) {
      searchPromises.push(this.searchGitHub(query, context));
    }

    try {
      const searchResults = await Promise.allSettled(searchPromises);
      
      searchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(...result.value);
        } else if (result.status === 'rejected') {
          this.logger.warn(`Search engine ${index} failed:`, result.reason);
        }
      });

      // Sort results by relevance and remove duplicates
      const uniqueResults = this.deduplicateResults(results);
      const sortedResults = this.sortByRelevance(uniqueResults, query);

      this.logger.info(`✅ Found ${sortedResults.length} unique results`);
      return sortedResults.slice(0, 10); // Return top 10 results

    } catch (error) {
      this.logger.error('Web search failed:', error);
      return this.getFallbackResults(query);
    }
  }

  /**
   * Search using Google Custom Search API
   */
  async searchGoogle(query, context) {
    if (!this.searchEngines.google.apiKey || !this.searchEngines.google.searchEngineId) {
      return [];
    }

    try {
      const response = await axios.get(this.searchEngines.google.baseUrl, {
        params: {
          key: this.searchEngines.google.apiKey,
          cx: this.searchEngines.google.searchEngineId,
          q: query,
          num: 5,
          safe: 'medium'
        },
        timeout: 10000
      });

      return response.data.items?.map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'google',
        relevance: this.calculateRelevance(item.title + ' ' + item.snippet, query)
      })) || [];

    } catch (error) {
      this.logger.warn('Google search failed:', error.message);
      return [];
    }
  }

  /**
   * Search using DuckDuckGo (no API key required)
   */
  async searchDuckDuckGo(query, context) {
    try {
      // DuckDuckGo doesn't have a public API, so we'll use their instant answer API
      const response = await axios.get(this.searchEngines.duckduckgo.baseUrl, {
        params: {
          q: query,
          format: 'json',
          no_html: 1,
          skip_disambig: 1
        },
        timeout: 10000
      });

      const results = [];
      
      if (response.data.Abstract) {
        results.push({
          title: response.data.Heading || query,
          url: response.data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: response.data.Abstract,
          source: 'duckduckgo',
          relevance: this.calculateRelevance(response.data.Abstract, query)
        });
      }

      if (response.data.RelatedTopics) {
        response.data.RelatedTopics.slice(0, 3).forEach(topic => {
          if (topic.Text) {
            results.push({
              title: topic.FirstURL ? topic.Text.split(' - ')[0] : query,
              url: topic.FirstURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
              snippet: topic.Text,
              source: 'duckduckgo',
              relevance: this.calculateRelevance(topic.Text, query)
            });
          }
        });
      }

      return results;

    } catch (error) {
      this.logger.warn('DuckDuckGo search failed:', error.message);
      return [];
    }
  }

  /**
   * Search Stack Overflow for technical solutions
   */
  async searchStackOverflow(query, context) {
    try {
      const response = await axios.get(`${this.searchEngines.stackoverflow.baseUrl}/search/advanced`, {
        params: {
          order: 'desc',
          sort: 'relevance',
          q: query,
          site: 'stackoverflow',
          pagesize: 5,
          filter: 'withbody'
        },
        timeout: 10000
      });

      return response.data.items?.map(item => ({
        title: item.title,
        url: item.link,
        snippet: this.extractSnippet(item.body),
        source: 'stackoverflow',
        relevance: this.calculateRelevance(item.title + ' ' + item.body, query),
        score: item.score,
        answerCount: item.answer_count
      })) || [];

    } catch (error) {
      this.logger.warn('Stack Overflow search failed:', error.message);
      return [];
    }
  }

  /**
   * Search GitHub for code examples and repositories
   */
  async searchGitHub(query, context) {
    try {
      const response = await axios.get(`${this.searchEngines.github.baseUrl}/search/repositories`, {
        params: {
          q: `${query} language:javascript language:typescript language:node`,
          sort: 'stars',
          order: 'desc',
          per_page: 5
        },
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        },
        timeout: 10000
      });

      return response.data.items?.map(item => ({
        title: item.name,
        url: item.html_url,
        snippet: item.description || 'GitHub repository',
        source: 'github',
        relevance: this.calculateRelevance(item.name + ' ' + item.description, query),
        stars: item.stargazers_count,
        language: item.language
      })) || [];

    } catch (error) {
      this.logger.warn('GitHub search failed:', error.message);
      return [];
    }
  }

  /**
   * Check if query is technical
   */
  isTechnicalQuery(query) {
    const technicalTerms = [
      'error', 'bug', 'fix', 'debug', 'code', 'programming', 'api', 'database',
      'server', 'backend', 'frontend', 'javascript', 'node', 'express', 'mongodb',
      'sql', 'docker', 'kubernetes', 'deployment', 'authentication', 'security'
    ];
    
    return technicalTerms.some(term => 
      query.toLowerCase().includes(term)
    );
  }

  /**
   * Check if query is code-related
   */
  isCodeQuery(query) {
    const codeTerms = [
      'code', 'repository', 'github', 'git', 'npm', 'package', 'library',
      'framework', 'example', 'tutorial', 'implementation'
    ];
    
    return codeTerms.some(term => 
      query.toLowerCase().includes(term)
    );
  }

  /**
   * Calculate relevance score
   */
  calculateRelevance(text, query) {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ');
    
    let score = 0;
    queryWords.forEach(word => {
      if (textLower.includes(word)) {
        score += 1;
      }
    });
    
    return score / queryWords.length;
  }

  /**
   * Extract snippet from HTML content
   */
  extractSnippet(html) {
    if (!html) return '';
    
    // Remove HTML tags and get first 200 characters
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  }

  /**
   * Remove duplicate results
   */
  deduplicateResults(results) {
    const seen = new Set();
    return results.filter(result => {
      const key = result.url || result.title;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Sort results by relevance
   */
  sortByRelevance(results, query) {
    return results.sort((a, b) => {
      // Prioritize by relevance score
      if (a.relevance !== b.relevance) {
        return b.relevance - a.relevance;
      }
      
      // Then by source priority
      const sourcePriority = {
        'stackoverflow': 4,
        'github': 3,
        'google': 2,
        'duckduckgo': 1
      };
      
      return (sourcePriority[b.source] || 0) - (sourcePriority[a.source] || 0);
    });
  }

  /**
   * Get fallback results when all searches fail
   */
  getFallbackResults(query) {
    return [
      {
        title: `${query} - Documentation`,
        url: `https://docs.example.com/${query.replace(/\s+/g, '-')}`,
        snippet: `Documentation and examples for ${query}. This is a fallback result when web search is unavailable.`,
        source: 'fallback',
        relevance: 0.5
      }
    ];
  }
}

module.exports = RealWebSearchService;
