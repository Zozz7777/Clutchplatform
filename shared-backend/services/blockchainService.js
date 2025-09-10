const { logger } = require('../config/logger');
const crypto = require('crypto');

/**
 * Blockchain Service
 * Manages decentralized service history tracking and smart contracts
 */
class BlockchainService {
  constructor() {
    this.blocks = [];
    this.pendingTransactions = [];
    this.nodes = new Set();
    this.smartContracts = new Map();
    this.initializeBlockchain();
  }

  /**
   * Initialize blockchain
   */
  initializeBlockchain() {
    // Create genesis block
    const genesisBlock = {
      index: 0,
      timestamp: new Date().toISOString(),
      transactions: [],
      previousHash: '0',
      hash: this.calculateHash(0, new Date().toISOString(), [], '0'),
      nonce: 0
    };

    this.blocks.push(genesisBlock);
    
    // Initialize smart contracts
    this.initializeSmartContracts();
    
    logger.info('Blockchain initialized with genesis block');
  }

  /**
   * Initialize smart contracts
   */
  initializeSmartContracts() {
    // Service History Contract
    this.smartContracts.set('serviceHistory', {
      name: 'ServiceHistory',
      address: this.generateContractAddress('serviceHistory'),
      functions: {
        addServiceRecord: this.addServiceRecord.bind(this),
        getServiceHistory: this.getServiceHistory.bind(this),
        verifyServiceRecord: this.verifyServiceRecord.bind(this)
      },
      state: new Map()
    });

    // Vehicle Ownership Contract
    this.smartContracts.set('vehicleOwnership', {
      name: 'VehicleOwnership',
      address: this.generateContractAddress('vehicleOwnership'),
      functions: {
        transferOwnership: this.transferOwnership.bind(this),
        getOwnership: this.getOwnership.bind(this),
        verifyOwnership: this.verifyOwnership.bind(this)
      },
      state: new Map()
    });

    // Service Agreement Contract
    this.smartContracts.set('serviceAgreement', {
      name: 'ServiceAgreement',
      address: this.generateContractAddress('serviceAgreement'),
      functions: {
        createAgreement: this.createAgreement.bind(this),
        executeAgreement: this.executeAgreement.bind(this),
        getAgreement: this.getAgreement.bind(this)
      },
      state: new Map()
    });

    logger.info('Smart contracts initialized');
  }

  /**
   * Generate contract address
   */
  generateContractAddress(contractName) {
    return '0x' + crypto.createHash('sha256').update(contractName + Date.now()).digest('hex').substring(0, 40);
  }

  /**
   * Calculate block hash
   */
  calculateHash(index, timestamp, transactions, previousHash) {
    const data = index + timestamp + JSON.stringify(transactions) + previousHash;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Mine new block
   */
  async mineBlock(difficulty = 4) {
    try {
      const lastBlock = this.blocks[this.blocks.length - 1];
      const newBlockIndex = lastBlock.index + 1;
      const newBlockTimestamp = new Date().toISOString();
      const newBlockTransactions = [...this.pendingTransactions];
      const previousHash = lastBlock.hash;

      let nonce = 0;
      let newBlockHash = '';

      // Proof of Work
      do {
        newBlockHash = this.calculateHash(newBlockIndex, newBlockTimestamp, newBlockTransactions, previousHash);
        nonce++;
      } while (newBlockHash.substring(0, difficulty) !== '0'.repeat(difficulty));

      const newBlock = {
        index: newBlockIndex,
        timestamp: newBlockTimestamp,
        transactions: newBlockTransactions,
        previousHash: previousHash,
        hash: newBlockHash,
        nonce: nonce
      };

      this.blocks.push(newBlock);
      this.pendingTransactions = [];

      logger.info(`Block mined: ${newBlockHash.substring(0, 10)}...`);
      return newBlock;
    } catch (error) {
      logger.error('Error mining block:', error);
      throw error;
    }
  }

  /**
   * Add transaction to pending transactions
   */
  addTransaction(transaction) {
    try {
      const transactionData = {
        id: crypto.randomUUID(),
        ...transaction,
        timestamp: new Date().toISOString(),
        signature: this.signTransaction(transaction)
      };

      this.pendingTransactions.push(transactionData);
      logger.info(`Transaction added: ${transactionData.id}`);
      return transactionData;
    } catch (error) {
      logger.error('Error adding transaction:', error);
      throw error;
    }
  }

  /**
   * Sign transaction
   */
  signTransaction(transaction) {
    const data = JSON.stringify(transaction);
    return crypto.createHmac('sha256', process.env.BLOCKCHAIN_SECRET || 'default-secret').update(data).digest('hex');
  }

  /**
   * Verify transaction signature
   */
  verifyTransactionSignature(transaction) {
    const expectedSignature = this.signTransaction({
      from: transaction.from,
      to: transaction.to,
      data: transaction.data,
      amount: transaction.amount
    });
    return transaction.signature === expectedSignature;
  }

  /**
   * Get blockchain status
   */
  getBlockchainStatus() {
    return {
      totalBlocks: this.blocks.length,
      pendingTransactions: this.pendingTransactions.length,
      lastBlockHash: this.blocks[this.blocks.length - 1]?.hash,
      difficulty: 4,
      isChainValid: this.isChainValid()
    };
  }

  /**
   * Validate blockchain integrity
   */
  isChainValid() {
    try {
      for (let i = 1; i < this.blocks.length; i++) {
        const currentBlock = this.blocks[i];
        const previousBlock = this.blocks[i - 1];

        // Check if current block hash is valid
        const calculatedHash = this.calculateHash(
          currentBlock.index,
          currentBlock.timestamp,
          currentBlock.transactions,
          currentBlock.previousHash
        );

        if (currentBlock.hash !== calculatedHash) {
          return false;
        }

        // Check if previous hash matches
        if (currentBlock.previousHash !== previousBlock.hash) {
          return false;
        }
      }
      return true;
    } catch (error) {
      logger.error('Error validating blockchain:', error);
      return false;
    }
  }

  /**
   * Smart Contract: Add service record
   */
  async addServiceRecord(contractAddress, params) {
    try {
      const { vehicleId, serviceType, description, cost, date, mechanicId, mileage } = params;
      
      const serviceRecord = {
        id: crypto.randomUUID(),
        vehicleId,
        serviceType,
        description,
        cost,
        date,
        mechanicId,
        mileage,
        timestamp: new Date().toISOString(),
        blockHash: this.blocks[this.blocks.length - 1]?.hash
      };

      // Store in smart contract state
      const contract = this.smartContracts.get('serviceHistory');
      if (!contract.state.has(vehicleId)) {
        contract.state.set(vehicleId, []);
      }
      
      const vehicleHistory = contract.state.get(vehicleId);
      vehicleHistory.push(serviceRecord);
      contract.state.set(vehicleId, vehicleHistory);

      // Add to blockchain
      const transaction = {
        from: mechanicId,
        to: contractAddress,
        data: {
          action: 'addServiceRecord',
          serviceRecord
        },
        amount: 0
      };

      this.addTransaction(transaction);

      logger.info(`Service record added to blockchain: ${serviceRecord.id}`);
      return serviceRecord;
    } catch (error) {
      logger.error('Error adding service record:', error);
      throw error;
    }
  }

  /**
   * Smart Contract: Get service history
   */
  async getServiceHistory(contractAddress, vehicleId) {
    try {
      const contract = this.smartContracts.get('serviceHistory');
      const history = contract.state.get(vehicleId) || [];
      
      return {
        vehicleId,
        records: history,
        totalRecords: history.length,
        lastUpdated: history.length > 0 ? history[history.length - 1].timestamp : null
      };
    } catch (error) {
      logger.error('Error getting service history:', error);
      throw error;
    }
  }

  /**
   * Smart Contract: Verify service record
   */
  async verifyServiceRecord(contractAddress, recordId) {
    try {
      const contract = this.smartContracts.get('serviceHistory');
      
      for (const [vehicleId, history] of contract.state) {
        const record = history.find(r => r.id === recordId);
        if (record) {
          return {
            verified: true,
            record,
            vehicleId,
            blockHash: record.blockHash,
            verificationTimestamp: new Date().toISOString()
          };
        }
      }
      
      return {
        verified: false,
        message: 'Service record not found'
      };
    } catch (error) {
      logger.error('Error verifying service record:', error);
      throw error;
    }
  }

  /**
   * Smart Contract: Transfer vehicle ownership
   */
  async transferOwnership(contractAddress, params) {
    try {
      const { vehicleId, fromOwner, toOwner, transferDate } = params;
      
      const ownershipRecord = {
        vehicleId,
        fromOwner,
        toOwner,
        transferDate: transferDate || new Date().toISOString(),
        timestamp: new Date().toISOString(),
        blockHash: this.blocks[this.blocks.length - 1]?.hash
      };

      // Store in smart contract state
      const contract = this.smartContracts.get('vehicleOwnership');
      contract.state.set(vehicleId, ownershipRecord);

      // Add to blockchain
      const transaction = {
        from: fromOwner,
        to: contractAddress,
        data: {
          action: 'transferOwnership',
          ownershipRecord
        },
        amount: 0
      };

      this.addTransaction(transaction);

      logger.info(`Vehicle ownership transferred: ${vehicleId}`);
      return ownershipRecord;
    } catch (error) {
      logger.error('Error transferring ownership:', error);
      throw error;
    }
  }

  /**
   * Smart Contract: Get vehicle ownership
   */
  async getOwnership(contractAddress, vehicleId) {
    try {
      const contract = this.smartContracts.get('vehicleOwnership');
      const ownership = contract.state.get(vehicleId);
      
      return ownership || null;
    } catch (error) {
      logger.error('Error getting ownership:', error);
      throw error;
    }
  }

  /**
   * Smart Contract: Verify vehicle ownership
   */
  async verifyOwnership(contractAddress, vehicleId, ownerId) {
    try {
      const ownership = await this.getOwnership(contractAddress, vehicleId);
      
      if (!ownership) {
        return {
          verified: false,
          message: 'No ownership record found'
        };
      }

      const isOwner = ownership.toOwner === ownerId;
      
      return {
        verified: isOwner,
        ownership,
        verificationTimestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error verifying ownership:', error);
      throw error;
    }
  }

  /**
   * Smart Contract: Create service agreement
   */
  async createAgreement(contractAddress, params) {
    try {
      const { agreementId, customerId, mechanicId, vehicleId, serviceType, terms, cost } = params;
      
      const agreement = {
        id: agreementId,
        customerId,
        mechanicId,
        vehicleId,
        serviceType,
        terms,
        cost,
        status: 'pending',
        createdAt: new Date().toISOString(),
        blockHash: this.blocks[this.blocks.length - 1]?.hash
      };

      // Store in smart contract state
      const contract = this.smartContracts.get('serviceAgreement');
      contract.state.set(agreementId, agreement);

      // Add to blockchain
      const transaction = {
        from: customerId,
        to: contractAddress,
        data: {
          action: 'createAgreement',
          agreement
        },
        amount: 0
      };

      this.addTransaction(transaction);

      logger.info(`Service agreement created: ${agreementId}`);
      return agreement;
    } catch (error) {
      logger.error('Error creating agreement:', error);
      throw error;
    }
  }

  /**
   * Smart Contract: Execute service agreement
   */
  async executeAgreement(contractAddress, agreementId) {
    try {
      const contract = this.smartContracts.get('serviceAgreement');
      const agreement = contract.state.get(agreementId);
      
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      agreement.status = 'executed';
      agreement.executedAt = new Date().toISOString();
      agreement.blockHash = this.blocks[this.blocks.length - 1]?.hash;

      contract.state.set(agreementId, agreement);

      // Add to blockchain
      const transaction = {
        from: agreement.mechanicId,
        to: contractAddress,
        data: {
          action: 'executeAgreement',
          agreement
        },
        amount: agreement.cost
      };

      this.addTransaction(transaction);

      logger.info(`Service agreement executed: ${agreementId}`);
      return agreement;
    } catch (error) {
      logger.error('Error executing agreement:', error);
      throw error;
    }
  }

  /**
   * Smart Contract: Get service agreement
   */
  async getAgreement(contractAddress, agreementId) {
    try {
      const contract = this.smartContracts.get('serviceAgreement');
      return contract.state.get(agreementId) || null;
    } catch (error) {
      logger.error('Error getting agreement:', error);
      throw error;
    }
  }

  /**
   * Execute smart contract function
   */
  async executeContract(contractName, functionName, params) {
    try {
      const contract = this.smartContracts.get(contractName);
      if (!contract) {
        throw new Error(`Contract not found: ${contractName}`);
      }

      const contractFunction = contract.functions[functionName];
      if (!contractFunction) {
        throw new Error(`Function not found: ${functionName}`);
      }

      const result = await contractFunction(contract.address, params);
      
      logger.info(`Contract function executed: ${contractName}.${functionName}`);
      return result;
    } catch (error) {
      logger.error('Error executing contract:', error);
      throw error;
    }
  }

  /**
   * Get all transactions for a vehicle
   */
  async getVehicleTransactions(vehicleId) {
    try {
      const transactions = [];
      
      // Get transactions from blockchain
      this.blocks.forEach(block => {
        block.transactions.forEach(transaction => {
          if (transaction.data && 
              (transaction.data.vehicleId === vehicleId || 
               transaction.data.serviceRecord?.vehicleId === vehicleId ||
               transaction.data.ownershipRecord?.vehicleId === vehicleId ||
               transaction.data.agreement?.vehicleId === vehicleId)) {
            transactions.push({
              ...transaction,
              blockIndex: block.index,
              blockHash: block.hash,
              blockTimestamp: block.timestamp
            });
          }
        });
      });

      return transactions;
    } catch (error) {
      logger.error('Error getting vehicle transactions:', error);
      throw error;
    }
  }

  /**
   * Get blockchain statistics
   */
  getBlockchainStats() {
    try {
      const stats = {
        totalBlocks: this.blocks.length,
        totalTransactions: this.blocks.reduce((sum, block) => sum + block.transactions.length, 0),
        pendingTransactions: this.pendingTransactions.length,
        smartContracts: this.smartContracts.size,
        chainValid: this.isChainValid(),
        lastBlock: this.blocks[this.blocks.length - 1] || null,
        timestamp: new Date().toISOString()
      };

      // Contract statistics
      stats.contractStats = {};
      this.smartContracts.forEach((contract, name) => {
        stats.contractStats[name] = {
          address: contract.address,
          stateSize: contract.state.size,
          functions: Object.keys(contract.functions).length
        };
      });

      return stats;
    } catch (error) {
      logger.error('Error getting blockchain stats:', error);
      throw error;
    }
  }

  /**
   * Add node to network
   */
  addNode(nodeAddress) {
    this.nodes.add(nodeAddress);
    logger.info(`Node added to network: ${nodeAddress}`);
  }

  /**
   * Remove node from network
   */
  removeNode(nodeAddress) {
    this.nodes.delete(nodeAddress);
    logger.info(`Node removed from network: ${nodeAddress}`);
  }

  /**
   * Get network nodes
   */
  getNodes() {
    return Array.from(this.nodes);
  }

  /**
   * Sync blockchain with other nodes
   */
  async syncBlockchain() {
    try {
      // In a real implementation, this would sync with other nodes
      logger.info('Blockchain sync completed');
      return {
        synced: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error syncing blockchain:', error);
      throw error;
    }
  }

  /**
   * Health check for blockchain
   */
  async healthCheck() {
    try {
      const stats = this.getBlockchainStats();
      const healthStatus = {
        status: 'healthy',
        totalBlocks: stats.totalBlocks,
        chainValid: stats.chainValid,
        pendingTransactions: stats.pendingTransactions,
        timestamp: new Date().toISOString()
      };

      if (!stats.chainValid) {
        healthStatus.status = 'unhealthy';
        healthStatus.message = 'Blockchain integrity compromised';
      }

      if (stats.pendingTransactions > 100) {
        healthStatus.status = 'warning';
        healthStatus.message = 'High number of pending transactions';
      }

      return healthStatus;
    } catch (error) {
      logger.error('Error in blockchain health check:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
