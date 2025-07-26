// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AI Marketplace
 * @dev Smart contract for AI Agent Marketplace that enables content creators
 * to monetize their content when AI bots access it
 */
contract AIMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Events
    event ContentRegistered(
        uint256 indexed contentId,
        address indexed creator,
        string title,
        uint256 price,
        string contentHash
    );
    
    event ContentAccessed(
        uint256 indexed contentId,
        address indexed consumer,
        uint256 amount,
        string aiAgentId
    );
    
    event PaymentProcessed(
        uint256 indexed contentId,
        address indexed creator,
        address indexed consumer,
        uint256 amount,
        uint256 platformFee
    );
    
    event CreatorRegistered(address indexed creator, string username);
    event AIAgentRegistered(address indexed agent, string agentId);

    // Structs
    struct Content {
        uint256 id;
        address creator;
        string title;
        string description;
        string contentHash;
        uint256 price;
        bool isActive;
        uint256 totalAccesses;
        uint256 totalRevenue;
        uint256 createdAt;
    }

    struct Creator {
        address wallet;
        string username;
        bool isRegistered;
        uint256 totalContent;
        uint256 totalRevenue;
        uint256 registeredAt;
    }

    struct AIAgent {
        address wallet;
        string agentId;
        bool isRegistered;
        uint256 totalAccesses;
        uint256 totalSpent;
        uint256 registeredAt;
    }

    // State variables
    Counters.Counter private _contentIds;
    Counters.Counter private _accessIds;
    
    uint256 public platformFeePercentage = 5; // 5% platform fee
    uint256 public minContentPrice = 0.001 ether;
    uint256 public maxContentPrice = 10 ether;
    
    mapping(uint256 => Content) public contents;
    mapping(address => Creator) public creators;
    mapping(address => AIAgent) public aiAgents;
    mapping(string => bool) public contentHashes;
    mapping(string => bool) public agentIds;
    
    // Modifiers
    modifier onlyRegisteredCreator() {
        require(creators[msg.sender].isRegistered, "Creator not registered");
        _;
    }
    
    modifier onlyRegisteredAIAgent() {
        require(aiAgents[msg.sender].isRegistered, "AI Agent not registered");
        _;
    }
    
    modifier contentExists(uint256 contentId) {
        require(contents[contentId].creator != address(0), "Content does not exist");
        _;
    }
    
    modifier contentActive(uint256 contentId) {
        require(contents[contentId].isActive, "Content is not active");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a new content creator
     * @param username The creator's username
     */
    function registerCreator(string memory username) external {
        require(!creators[msg.sender].isRegistered, "Creator already registered");
        require(bytes(username).length > 0, "Username cannot be empty");
        
        creators[msg.sender] = Creator({
            wallet: msg.sender,
            username: username,
            isRegistered: true,
            totalContent: 0,
            totalRevenue: 0,
            registeredAt: block.timestamp
        });
        
        emit CreatorRegistered(msg.sender, username);
    }

    /**
     * @dev Register a new AI agent
     * @param agentId The unique identifier for the AI agent
     */
    function registerAIAgent(string memory agentId) external {
        require(!aiAgents[msg.sender].isRegistered, "AI Agent already registered");
        require(!agentIds[agentId], "Agent ID already exists");
        require(bytes(agentId).length > 0, "Agent ID cannot be empty");
        
        aiAgents[msg.sender] = AIAgent({
            wallet: msg.sender,
            agentId: agentId,
            isRegistered: true,
            totalAccesses: 0,
            totalSpent: 0,
            registeredAt: block.timestamp
        });
        
        agentIds[agentId] = true;
        emit AIAgentRegistered(msg.sender, agentId);
    }

    /**
     * @dev Register new content for monetization
     * @param title Content title
     * @param description Content description
     * @param contentHash IPFS hash or unique identifier
     * @param price Price per access in ETH
     */
    function registerContent(
        string memory title,
        string memory description,
        string memory contentHash,
        uint256 price
    ) external onlyRegisteredCreator {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(contentHash).length > 0, "Content hash cannot be empty");
        require(!contentHashes[contentHash], "Content hash already exists");
        require(price >= minContentPrice, "Price too low");
        require(price <= maxContentPrice, "Price too high");
        
        _contentIds.increment();
        uint256 contentId = _contentIds.current();
        
        contents[contentId] = Content({
            id: contentId,
            creator: msg.sender,
            title: title,
            description: description,
            contentHash: contentHash,
            price: price,
            isActive: true,
            totalAccesses: 0,
            totalRevenue: 0,
            createdAt: block.timestamp
        });
        
        contentHashes[contentHash] = true;
        creators[msg.sender].totalContent++;
        
        emit ContentRegistered(contentId, msg.sender, title, price, contentHash);
    }

    /**
     * @dev Access content by paying the required amount
     * @param contentId The ID of the content to access
     * @param aiAgentId The ID of the AI agent accessing the content
     */
    function accessContent(uint256 contentId, string memory aiAgentId) 
        external 
        payable 
        onlyRegisteredAIAgent 
        contentExists(contentId) 
        contentActive(contentId) 
        nonReentrant 
    {
        Content storage content = contents[contentId];
        require(msg.value == content.price, "Incorrect payment amount");
        require(msg.value > 0, "Payment required");
        
        // Calculate fees
        uint256 platformFee = (msg.value * platformFeePercentage) / 100;
        uint256 creatorPayment = msg.value - platformFee;
        
        // Update content stats
        content.totalAccesses++;
        content.totalRevenue += msg.value;
        
        // Update creator stats
        creators[content.creator].totalRevenue += creatorPayment;
        
        // Update AI agent stats
        aiAgents[msg.sender].totalAccesses++;
        aiAgents[msg.sender].totalSpent += msg.value;
        
        // Transfer payments
        payable(content.creator).transfer(creatorPayment);
        payable(owner()).transfer(platformFee);
        
        emit ContentAccessed(contentId, msg.sender, msg.value, aiAgentId);
        emit PaymentProcessed(contentId, content.creator, msg.sender, msg.value, platformFee);
    }

    /**
     * @dev Update content details (only by creator)
     * @param contentId The content ID
     * @param title New title
     * @param description New description
     * @param price New price
     * @param isActive New active status
     */
    function updateContent(
        uint256 contentId,
        string memory title,
        string memory description,
        uint256 price,
        bool isActive
    ) external contentExists(contentId) {
        Content storage content = contents[contentId];
        require(content.creator == msg.sender, "Only creator can update content");
        
        if (bytes(title).length > 0) {
            content.title = title;
        }
        if (bytes(description).length > 0) {
            content.description = description;
        }
        if (price > 0) {
            require(price >= minContentPrice, "Price too low");
            require(price <= maxContentPrice, "Price too high");
            content.price = price;
        }
        content.isActive = isActive;
    }

    /**
     * @dev Get content details
     * @param contentId The content ID
     */
    function getContent(uint256 contentId) external view returns (Content memory) {
        return contents[contentId];
    }

    /**
     * @dev Get creator details
     * @param creatorAddress The creator's wallet address
     */
    function getCreator(address creatorAddress) external view returns (Creator memory) {
        return creators[creatorAddress];
    }

    /**
     * @dev Get AI agent details
     * @param agentAddress The AI agent's wallet address
     */
    function getAIAgent(address agentAddress) external view returns (AIAgent memory) {
        return aiAgents[agentAddress];
    }

    /**
     * @dev Get total number of contents
     */
    function getTotalContents() external view returns (uint256) {
        return _contentIds.current();
    }

    /**
     * @dev Update platform fee percentage (only owner)
     * @param newFeePercentage New fee percentage (0-100)
     */
    function updatePlatformFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 20, "Fee cannot exceed 20%");
        platformFeePercentage = newFeePercentage;
    }

    /**
     * @dev Update price limits (only owner)
     * @param newMinPrice New minimum price
     * @param newMaxPrice New maximum price
     */
    function updatePriceLimits(uint256 newMinPrice, uint256 newMaxPrice) external onlyOwner {
        require(newMinPrice < newMaxPrice, "Min price must be less than max price");
        minContentPrice = newMinPrice;
        maxContentPrice = newMaxPrice;
    }

    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Check if content exists and is active
     * @param contentId The content ID
     */
    function isContentActive(uint256 contentId) external view returns (bool) {
        return contents[contentId].creator != address(0) && contents[contentId].isActive;
    }

    /**
     * @dev Get content access price
     * @param contentId The content ID
     */
    function getContentPrice(uint256 contentId) external view returns (uint256) {
        require(contents[contentId].creator != address(0), "Content does not exist");
        return contents[contentId].price;
    }
} 