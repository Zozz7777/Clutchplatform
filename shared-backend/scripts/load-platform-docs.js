#!/usr/bin/env node

/**
 * Platform Documentation Loader
 * Loads all platform documentation into the AI agent's knowledge base
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');
const { promisify } = require('util');

const globAsync = promisify(glob);

class PlatformDocumentationLoader {
  constructor() {
    this.documentationFiles = [];
    this.loadedDocs = {};
  }

  /**
   * Load all platform documentation
   */
  async loadAllDocumentation() {
    console.log('📚 Loading platform documentation...');
    
    try {
      // Find all documentation files
      await this.findDocumentationFiles();
      
      // Load each documentation file
      await this.loadDocumentationFiles();
      
      // Create knowledge base summary
      const summary = this.createKnowledgeBaseSummary();
      
      console.log('✅ Platform documentation loaded successfully');
      console.log(`📊 Loaded ${Object.keys(this.loadedDocs).length} documentation files`);
      
      return {
        success: true,
        filesLoaded: Object.keys(this.loadedDocs).length,
        summary: summary
      };
      
    } catch (error) {
      console.error('❌ Failed to load platform documentation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Find all documentation files
   */
  async findDocumentationFiles() {
    const patterns = [
      '**/*.md',
      '**/README.md',
      '**/docs/**/*.md',
      '**/documentation/**/*.md',
      '**/*.txt',
      '**/swagger.json',
      '**/api-docs.json'
    ];

    for (const pattern of patterns) {
      try {
        const files = await globAsync(pattern, { 
          ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
        });
        this.documentationFiles.push(...files);
      } catch (error) {
        console.warn(`Warning: Could not search for pattern ${pattern}:`, error.message);
      }
    }

    // Remove duplicates
    this.documentationFiles = [...new Set(this.documentationFiles)];
    
    console.log(`📁 Found ${this.documentationFiles.length} documentation files`);
  }

  /**
   * Load documentation files
   */
  async loadDocumentationFiles() {
    for (const filePath of this.documentationFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        this.loadedDocs[relativePath] = {
          content: content,
          size: content.length,
          type: this.getDocumentType(filePath),
          lastModified: (await fs.stat(filePath)).mtime
        };
        
        console.log(`📄 Loaded: ${relativePath}`);
      } catch (error) {
        console.warn(`Warning: Could not load ${filePath}:`, error.message);
      }
    }
  }

  /**
   * Get document type based on file path
   */
  getDocumentType(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    
    if (fileName.includes('readme')) return 'readme';
    if (fileName.includes('api') || fileName.includes('swagger')) return 'api';
    if (fileName.includes('deploy') || fileName.includes('deployment')) return 'deployment';
    if (fileName.includes('architecture') || fileName.includes('design')) return 'architecture';
    if (fileName.includes('troubleshoot') || fileName.includes('fix')) return 'troubleshooting';
    if (fileName.includes('business') || fileName.includes('requirement')) return 'business';
    if (fileName.includes('security') || fileName.includes('auth')) return 'security';
    if (fileName.includes('performance') || fileName.includes('optimization')) return 'performance';
    if (fileName.includes('test') || fileName.includes('testing')) return 'testing';
    if (fileName.includes('config') || fileName.includes('environment')) return 'configuration';
    
    return 'general';
  }

  /**
   * Create knowledge base summary
   */
  createKnowledgeBaseSummary() {
    const summary = {
      totalFiles: Object.keys(this.loadedDocs).length,
      totalSize: 0,
      byType: {},
      keyDocuments: []
    };

    // Calculate statistics
    Object.entries(this.loadedDocs).forEach(([filePath, doc]) => {
      summary.totalSize += doc.size;
      
      if (!summary.byType[doc.type]) {
        summary.byType[doc.type] = { count: 0, size: 0 };
      }
      summary.byType[doc.type].count++;
      summary.byType[doc.type].size += doc.size;
      
      // Identify key documents
      if (doc.size > 1000 || doc.type === 'readme' || doc.type === 'api') {
        summary.keyDocuments.push({
          path: filePath,
          type: doc.type,
          size: doc.size
        });
      }
    });

    return summary;
  }

  /**
   * Get documentation by type
   */
  getDocumentationByType(type) {
    return Object.entries(this.loadedDocs)
      .filter(([_, doc]) => doc.type === type)
      .map(([path, doc]) => ({ path, ...doc }));
  }

  /**
   * Search documentation
   */
  searchDocumentation(query) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    Object.entries(this.loadedDocs).forEach(([filePath, doc]) => {
      if (doc.content.toLowerCase().includes(searchTerm)) {
        const matches = (doc.content.toLowerCase().match(new RegExp(searchTerm, 'g')) || []).length;
        results.push({
          filePath,
          type: doc.type,
          matches,
          relevance: matches / doc.size * 1000 // Normalize by file size
        });
      }
    });
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Get platform overview
   */
  getPlatformOverview() {
    const overview = {
      architecture: this.getDocumentationByType('architecture'),
      apis: this.getDocumentationByType('api'),
      deployment: this.getDocumentationByType('deployment'),
      troubleshooting: this.getDocumentationByType('troubleshooting'),
      business: this.getDocumentationByType('business'),
      security: this.getDocumentationByType('security'),
      performance: this.getDocumentationByType('performance')
    };

    return overview;
  }
}

// CLI usage
if (require.main === module) {
  const loader = new PlatformDocumentationLoader();
  
  loader.loadAllDocumentation()
    .then(result => {
      if (result.success) {
        console.log('\n📊 Documentation Summary:');
        console.log(JSON.stringify(result.summary, null, 2));
        
        console.log('\n🔍 Key Documents:');
        result.summary.keyDocuments.forEach(doc => {
          console.log(`  - ${doc.path} (${doc.type}, ${doc.size} bytes)`);
        });
      } else {
        console.error('Failed to load documentation:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = PlatformDocumentationLoader;
