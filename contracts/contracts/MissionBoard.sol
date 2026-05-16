// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ICeloPlace {
    function grantBonusCharges(address user, uint256 amount) external;
    function currentStreak(address user) external view returns (uint256);
    function chargesUsedToday(address user, uint256 day) external view returns (uint256);
}

contract MissionBoard {
    address public owner;
    ICeloPlace public celoPlace;
    
    uint256 public constant REWARD_AMOUNT = 0.5 ether;
    uint256 public constant BONUS_CHARGES = 2;
    
    mapping(uint256 => mapping(address => bool)) public hasCompletedMission;
    
    event MissionCompleted(uint256 day, address indexed user, uint256 reward, uint256 bonusCharges);
    
    constructor(address _celoPlace) {
        owner = msg.sender;
        celoPlace = ICeloPlace(_celoPlace);
    }
    
    receive() external payable {}
    
    // Deterministic random mission per day based on day index
    function getDailyMission(uint256 day) public pure returns (uint256 targetType, uint256 targetValue) {
        uint256 rand = uint256(keccak256(abi.encodePacked("CELO_MISSION_SEED", day)));
        targetType = rand % 2; // 0 = Paint X pixels, 1 = Reach X streak
        
        if (targetType == 0) {
            targetValue = (rand % 3) + 3; // Paint 3 to 5 pixels
        } else {
            targetValue = (rand % 3) + 2; // Streak of 2 to 4
        }
    }
    
    function getTodayMission() external view returns (uint256 targetType, uint256 targetValue, bool completed) {
        uint256 currentDay = block.timestamp / 1 days;
        (targetType, targetValue) = getDailyMission(currentDay);
        completed = hasCompletedMission[currentDay][msg.sender];
    }
    
    function completeMission() external {
        uint256 currentDay = block.timestamp / 1 days;
        require(!hasCompletedMission[currentDay][msg.sender], "Already completed today");
        
        (uint256 mType, uint256 mValue) = getDailyMission(currentDay);
        
        if (mType == 0) {
            require(celoPlace.chargesUsedToday(msg.sender, currentDay) >= mValue, "Not enough pixels painted today");
        } else if (mType == 1) {
            require(celoPlace.currentStreak(msg.sender) >= mValue, "Streak not high enough");
        }
        
        hasCompletedMission[currentDay][msg.sender] = true;
        
        // Grant bonus charges back on the main contract
        celoPlace.grantBonusCharges(msg.sender, BONUS_CHARGES);
        
        // Dispense CELO reward if pool has balance
        uint256 dispensed = 0;
        if (address(this).balance >= REWARD_AMOUNT) {
            dispensed = REWARD_AMOUNT;
            (bool s,) = msg.sender.call{value: dispensed}("");
            require(s, "Reward transfer failed");
        }
        
        emit MissionCompleted(currentDay, msg.sender, dispensed, BONUS_CHARGES);
    }
}