// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AI Agent Registry
 * @dev Registry for AI agents on Base network following CDP AgentKit patterns
 * Based on Base documentation: https://docs.base.org/cookbook/launch-ai-agents
 */
contract AIAgentRegistry is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Events
    event AgentRegistered(
        uint256 indexed agentId,
        address indexed wallet,
        string agentName,
        string capabilities,
        uint256 registrationFee
    );
    
    event AgentUpdated(
        uint256 indexed agentId,
        string agentName,
        string capabilities,
        bool isActive
    );
    
    event AgentDeactivated(uint256 indexed agentId, address indexed wallet);
    event AgentBalanceUpdated(uint256 indexed agentId, uint256 newBalance);

    // Structs
    struct AIAgent {
        uint256 id;
        address wallet;
        string agentName;
        string description;
        string capabilities; // JSON string of capabilities
        bool isActive;
        uint256 balance;
        uint256 totalTransactions;
        uint256 totalVolume;
        uint256 registrationFee;
        uint256 registeredAt;
        uint256 lastActive;
    }

    // State variables
    Counters.Counter private _agentIds;
    
    uint256 public registrationFee = 0.001 ether; // Base registration fee
    uint256 public platformFeePercentage = 5; // 5% platform fee
    
    mapping(uint256 => AIAgent) public agents;
    mapping(address => uint256) public walletToAgentId;
    mapping(string => bool) public agentNames;
    
    // Agent capabilities mapping
    mapping(uint256 => mapping(string => bool)) public agentCapabilities;
    
    // Modifiers
    modifier onlyRegisteredAgent() {
        require(walletToAgentId[msg.sender] != 0, "Agent not registered");
        require(agents[walletToAgentId[msg.sender]].isActive, "Agent not active");
        _;
    }
    
    modifier onlyAgentOwner(uint256 agentId) {
        require(agents[agentId].wallet == msg.sender, "Not agent owner");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a new AI agent
     * @param agentName Unique name for the agent
     * @param description Agent description
     * @param capabilities JSON string of agent capabilities
     */
    function registerAgent(
        string memory agentName,
        string memory description,
        string memory capabilities
    ) external payable nonReentrant {
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(bytes(agentName).length > 0, "Agent name cannot be empty");
        require(!agentNames[agentName], "Agent name already exists");
        require(walletToAgentId[msg.sender] == 0, "Wallet already registered");
        
        _agentIds.increment();
        uint256 agentId = _agentIds.current();
        
        agents[agentId] = AIAgent({
            id: agentId,
            wallet: msg.sender,
            agentName: agentName,
            description: description,
            capabilities: capabilities,
            isActive: true,
            balance: 0,
            totalTransactions: 0,
            totalVolume: 0,
            registrationFee: msg.value,
            registeredAt: block.timestamp,
            lastActive: block.timestamp
        });
        
        walletToAgentId[msg.sender] = agentId;
        agentNames[agentName] = true;
        
        // Transfer registration fee to owner
        payable(owner()).transfer(msg.value);
        
        emit AgentRegistered(agentId, msg.sender, agentName, capabilities, msg.value);
    }

    /**
     * @dev Update agent information
     * @param agentId The agent ID
     * @param agentName New agent name
     * @param description New description
     * @param capabilities New capabilities
     */
    function updateAgent(
        uint256 agentId,
        string memory agentName,
        string memory description,
        string memory capabilities
    ) external onlyAgentOwner(agentId) {
        AIAgent storage agent = agents[agentId];
        
        if (bytes(agentName).length > 0) {
            require(!agentNames[agentName] || keccak256(bytes(agentName)) == keccak256(bytes(agent.agentName)), "Name already taken");
            agentNames[agent.agentName] = false;
            agent.agentName = agentName;
            agentNames[agentName] = true;
        }
        
        if (bytes(description).length > 0) {
            agent.description = description;
        }
        
        if (bytes(capabilities).length > 0) {
            agent.capabilities = capabilities;
        }
        
        agent.lastActive = block.timestamp;
        
        emit AgentUpdated(agentId, agentName, capabilities, agent.isActive);
    }

    /**
     * @dev Deactivate an agent
     * @param agentId The agent ID
     */
    function deactivateAgent(uint256 agentId) external onlyAgentOwner(agentId) {
        AIAgent storage agent = agents[agentId];
        agent.isActive = false;
        agent.lastActive = block.timestamp;
        
        emit AgentDeactivated(agentId, msg.sender);
    }

    /**
     * @dev Reactivate an agent
     * @param agentId The agent ID
     */
    function reactivateAgent(uint256 agentId) external onlyAgentOwner(agentId) {
        AIAgent storage agent = agents[agentId];
        agent.isActive = true;
        agent.lastActive = block.timestamp;
        
        emit AgentUpdated(agentId, agent.agentName, agent.capabilities, true);
    }

    /**
     * @dev Add funds to agent balance
     * @param agentId The agent ID
     */
    function addFunds(uint256 agentId) external payable onlyAgentOwner(agentId) {
        require(msg.value > 0, "Amount must be greater than 0");
        
        AIAgent storage agent = agents[agentId];
        agent.balance += msg.value;
        
        emit AgentBalanceUpdated(agentId, agent.balance);
    }

    /**
     * @dev Withdraw funds from agent balance
     * @param agentId The agent ID
     * @param amount Amount to withdraw
     */
    function withdrawFunds(uint256 agentId, uint256 amount) external onlyAgentOwner(agentId) {
        AIAgent storage agent = agents[agentId];
        require(agent.balance >= amount, "Insufficient balance");
        
        agent.balance -= amount;
        payable(msg.sender).transfer(amount);
        
        emit AgentBalanceUpdated(agentId, agent.balance);
    }

    /**
     * @dev Execute a transaction on behalf of the agent
     * @param agentId The agent ID
     * @param target Target contract address
     * @param data Transaction data
     * @param value ETH value to send
     */
    function executeTransaction(
        uint256 agentId,
        address target,
        bytes calldata data,
        uint256 value
    ) external onlyRegisteredAgent {
        require(agentId == walletToAgentId[msg.sender], "Agent ID mismatch");
        
        AIAgent storage agent = agents[agentId];
        require(agent.balance >= value, "Insufficient agent balance");
        
        // Execute the transaction
        (bool success, ) = target.call{value: value}(data);
        require(success, "Transaction failed");
        
        // Update agent stats
        agent.balance -= value;
        agent.totalTransactions++;
        agent.totalVolume += value;
        agent.lastActive = block.timestamp;
        
        emit AgentBalanceUpdated(agentId, agent.balance);
    }

    /**
     * @dev Get agent information
     * @param agentId The agent ID
     */
    function getAgent(uint256 agentId) external view returns (AIAgent memory) {
        return agents[agentId];
    }

    /**
     * @dev Get agent by wallet address
     * @param wallet The wallet address
     */
    function getAgentByWallet(address wallet) external view returns (AIAgent memory) {
        uint256 agentId = walletToAgentId[wallet];
        require(agentId != 0, "Agent not found");
        return agents[agentId];
    }

    /**
     * @dev Get total number of agents
     */
    function getTotalAgents() external view returns (uint256) {
        return _agentIds.current();
    }

    /**
     * @dev Check if agent has specific capability
     * @param agentId The agent ID
     * @param capability The capability to check
     */
    function hasCapability(uint256 agentId, string memory capability) external view returns (bool) {
        return agentCapabilities[agentId][capability];
    }

    /**
     * @dev Update registration fee (owner only)
     * @param newFee New registration fee
     */
    function updateRegistrationFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
    }

    /**
     * @dev Update platform fee percentage (owner only)
     * @param newFeePercentage New fee percentage
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 20, "Fee cannot exceed 20%");
        platformFeePercentage = newFeePercentage;
    }

    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Get agent statistics
     * @param agentId The agent ID
     */
    function getAgentStats(uint256 agentId) external view returns (
        uint256 balance,
        uint256 totalTransactions,
        uint256 totalVolume,
        uint256 registeredAt,
        uint256 lastActive
    ) {
        AIAgent storage agent = agents[agentId];
        return (
            agent.balance,
            agent.totalTransactions,
            agent.totalVolume,
            agent.registeredAt,
            agent.lastActive
        );
    }
} 