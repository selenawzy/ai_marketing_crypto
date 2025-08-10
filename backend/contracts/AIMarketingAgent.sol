// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AIMarketingAgent
 * @dev Smart contract for an autonomous AI marketing agent that can:
 * - Accept payments for marketing services
 * - Execute automated campaigns
 * - Distribute rewards based on performance
 * - Manage client funds securely
 */
contract AIMarketingAgent is Ownable, ReentrancyGuard {
    
    // Agent metadata
    string public agentName;
    string public agentDescription;
    address public agentWallet;
    
    // Service pricing
    uint256 public basePrice = 0.01 ether; // Base price per service call
    uint256 public performanceFee = 500; // 5% performance fee (basis points)
    
    // Campaign tracking
    struct Campaign {
        uint256 id;
        address client;
        string campaignType;
        uint256 budget;
        uint256 spent;
        uint256 performance; // Performance score (0-10000 basis points)
        bool active;
        uint256 createdAt;
    }
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256[]) public clientCampaigns;
    uint256 public campaignCounter;
    
    // Performance metrics
    uint256 public totalCampaigns;
    uint256 public totalRevenue;
    uint256 public averagePerformance;
    
    // Events
    event CampaignCreated(uint256 indexed campaignId, address indexed client, uint256 budget);
    event CampaignExecuted(uint256 indexed campaignId, uint256 spent, uint256 performance);
    event RevenueDistributed(address indexed recipient, uint256 amount);
    event AgentConfigured(string name, address wallet);
    
    constructor(
        string memory _name,
        string memory _description,
        address _agentWallet
    ) {
        agentName = _name;
        agentDescription = _description;
        agentWallet = _agentWallet;
        emit AgentConfigured(_name, _agentWallet);
    }
    
    /**
     * @dev Create a new marketing campaign
     */
    function createCampaign(
        string memory _campaignType,
        uint256 _budget
    ) external payable nonReentrant {
        require(msg.value >= basePrice, "Insufficient payment");
        require(_budget > 0, "Budget must be greater than 0");
        
        campaignCounter++;
        
        campaigns[campaignCounter] = Campaign({
            id: campaignCounter,
            client: msg.sender,
            campaignType: _campaignType,
            budget: _budget,
            spent: 0,
            performance: 0,
            active: true,
            createdAt: block.timestamp
        });
        
        clientCampaigns[msg.sender].push(campaignCounter);
        totalCampaigns++;
        
        emit CampaignCreated(campaignCounter, msg.sender, _budget);
    }
    
    /**
     * @dev Execute campaign and record performance (called by AI agent)
     */
    function executeCampaign(
        uint256 _campaignId,
        uint256 _spent,
        uint256 _performance
    ) external {
        require(msg.sender == agentWallet || msg.sender == owner(), "Only agent or owner can execute");
        require(campaigns[_campaignId].active, "Campaign not active");
        require(_performance <= 10000, "Performance cannot exceed 100%");
        
        Campaign storage campaign = campaigns[_campaignId];
        campaign.spent = _spent;
        campaign.performance = _performance;
        
        // Update global metrics
        totalRevenue += _spent;
        averagePerformance = (averagePerformance * (totalCampaigns - 1) + _performance) / totalCampaigns;
        
        emit CampaignExecuted(_campaignId, _spent, _performance);
    }
    
    /**
     * @dev Complete campaign and distribute rewards
     */
    function completeCampaign(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.active, "Campaign already completed");
        require(
            msg.sender == campaign.client || 
            msg.sender == agentWallet || 
            msg.sender == owner(), 
            "Unauthorized"
        );
        
        campaign.active = false;
        
        // Calculate performance-based rewards
        if (campaign.performance >= 7500) { // 75% performance threshold
            uint256 bonus = (campaign.spent * performanceFee) / 10000;
            if (address(this).balance >= bonus) {
                payable(agentWallet).transfer(bonus);
                emit RevenueDistributed(agentWallet, bonus);
            }
        }
    }
    
    /**
     * @dev Get campaign details
     */
    function getCampaign(uint256 _campaignId) external view returns (Campaign memory) {
        return campaigns[_campaignId];
    }
    
    /**
     * @dev Get client's campaign IDs
     */
    function getClientCampaigns(address _client) external view returns (uint256[] memory) {
        return clientCampaigns[_client];
    }
    
    /**
     * @dev Update agent configuration
     */
    function updateAgentConfig(
        string memory _name,
        string memory _description,
        address _newWallet
    ) external onlyOwner {
        agentName = _name;
        agentDescription = _description;
        agentWallet = _newWallet;
        emit AgentConfigured(_name, _newWallet);
    }
    
    /**
     * @dev Update pricing
     */
    function updatePricing(uint256 _basePrice, uint256 _performanceFee) external onlyOwner {
        basePrice = _basePrice;
        performanceFee = _performanceFee;
    }
    
    /**
     * @dev Withdraw contract balance (emergency only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get agent performance metrics
     */
    function getPerformanceMetrics() external view returns (
        uint256 _totalCampaigns,
        uint256 _totalRevenue,
        uint256 _averagePerformance,
        uint256 _contractBalance
    ) {
        return (
            totalCampaigns,
            totalRevenue,
            averagePerformance,
            address(this).balance
        );
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Accept ETH for campaign funding
    }
}