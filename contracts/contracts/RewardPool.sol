// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract RewardPool {
    uint256 public weeklyPoolBalance;
    uint256 public missionPoolBalance;
    
    address public owner;
    address public missionBoard;
    
    bytes32 public currentMerkleRoot;
    uint256 public currentWeekId;
    
    // mapping(weekId => mapping(address => bool))
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    
    event PoolFunded(uint256 weeklyAmount, uint256 missionAmount);
    event WeeklyRootSet(uint256 weekId, bytes32 merkleRoot, uint256 totalDistribution);
    event RewardClaimed(uint256 weekId, address indexed user, uint256 amount);
    
    error Unauthorized();
    error InsufficientPoolBalance();
    error AlreadyClaimed();
    error InvalidProof();
    error TransferFailed();
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    
    function setMissionBoard(address _missionBoard) external onlyOwner {
        require(missionBoard == address(0), "Already set");
        missionBoard = _missionBoard;
    }
    
    receive() external payable {
        if (msg.value > 0) {
            uint256 weeklyShare = (msg.value * 70) / 100;
            uint256 missionShare = msg.value - weeklyShare;
            
            weeklyPoolBalance += weeklyShare;
            missionPoolBalance += missionShare;
            
            emit PoolFunded(weeklyShare, missionShare);
        }
    }
    
    function setWeeklyRoot(bytes32 merkleRoot, uint256 totalDistribution) external onlyOwner {
        if (weeklyPoolBalance < totalDistribution) revert InsufficientPoolBalance();
        
        currentWeekId += 1;
        currentMerkleRoot = merkleRoot;
        
        emit WeeklyRootSet(currentWeekId, merkleRoot, totalDistribution);
    }
    
    function claimWeeklyReward(uint256 weekId, uint256 amount, bytes32[] calldata proof) external {
        if (hasClaimed[weekId][msg.sender]) revert AlreadyClaimed();
        
        // Ensure claiming against the active root if desired, or allow older if tracked.
        // For simplicity, we assume they can claim the current active week
        require(weekId == currentWeekId, "Can only claim current week");
        
        bytes32 leaf = keccak256(abi.encodePacked(weekId, msg.sender, amount));
        if (!verifyProof(proof, currentMerkleRoot, leaf)) revert InvalidProof();
        
        hasClaimed[weekId][msg.sender] = true;
        
        if (weeklyPoolBalance < amount) revert InsufficientPoolBalance();
        weeklyPoolBalance -= amount;
        
        (bool s, ) = msg.sender.call{value: amount}("");
        if (!s) revert TransferFailed();
        
        emit RewardClaimed(weekId, msg.sender, amount);
    }
    
    function transferToMissions(uint256 amount) external onlyOwner {
        if (missionPoolBalance < amount) revert InsufficientPoolBalance();
        missionPoolBalance -= amount;
        
        (bool s, ) = missionBoard.call{value: amount}("");
        if (!s) revert TransferFailed();
    }
    
    function getClaimStatus(uint256 weekId, address user) external view returns (bool) {
        return hasClaimed[weekId][user];
    }
    
    function getPoolBalances() external view returns (uint256 weekly, uint256 missions) {
        return (weeklyPoolBalance, missionPoolBalance);
    }
    
    // Internal generic Merkle proof verification
    function verifyProof(bytes32[] memory proof, bytes32 root, bytes32 leaf) internal pure returns (bool) {
        bytes32 computedHash = leaf;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];

            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }
}