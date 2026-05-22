// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ICeloPlace {
    struct Pixel {
        address painter;
        uint24 color;
        uint256 timestamp;
        uint256 paintCount;
    }

    function grantBonusCharges(address user, uint256 amount) external;
    function currentStreak(address user) external view returns (uint256);
    function chargesUsedToday(address user, uint256 day) external view returns (uint256);
    function lastPaintTimestamp(address user, uint256 day) external view returns (uint256);
    function getTierCharges(address user) external view returns (uint256);
    function getPixel(int256 lat, int256 lng) external view returns (Pixel memory);
}

contract MissionBoard {
    address public owner;
    ICeloPlace public celoPlace;
    
    uint256 public constant TOTAL_MISSION_TYPES = 6;
    
    // Mission Types
    uint8 public constant EARLY_BIRD = 0;
    uint8 public constant FULL_CHARGES = 1;
    uint8 public constant NEIGHBOR = 2;
    uint8 public constant CONTESTED = 3;
    uint8 public constant PIONEER = 4;
    uint8 public constant STREAK_KEEPER = 5;

    // Slot reward percentages in basis points (10000 = 100%)
    // Slot 1 (easy): 5% of contract balance per completer
    // Slot 2 (medium): 10% of contract balance per completer
    // Slot 3 (hard/race): 5% of contract balance per winner (max 3 winners)
    uint256 public constant SLOT1_REWARD_BPS = 500;
    uint256 public constant SLOT2_REWARD_BPS = 1000;
    uint256 public constant SLOT3_REWARD_BPS = 500;
    
    // day => user => slot (0, 1, 2) => bool
    mapping(uint256 => mapping(address => bool[3])) public missionCompleted;
    
    // day => slot => completers
    mapping(uint256 => address[]) public slot1Completers;
    mapping(uint256 => address[]) public slot2Completers;
    
    // Slot 3 is a race, max 3 completers
    mapping(uint256 => address[3]) public slot3TopCompleters;
    mapping(uint256 => uint256) public slot3CompletionCount;
    
    event MissionCompleted(uint256 day, address indexed user, uint8 slot, uint256 reward);
    event AllMissionsCompleted(uint256 day, address indexed user, uint256 bonusCharges);

    constructor(address _celoPlace) {
        owner = msg.sender;
        celoPlace = ICeloPlace(_celoPlace);
    }
    
    receive() external payable {}

    /// @dev Calculate reward amount for a slot based on current contract balance
    function _slotReward(uint256 bps) internal view returns (uint256) {
        if (address(this).balance == 0) return 0;
        return (address(this).balance * bps) / 10000;
    }
    
    function getMissionsToday() public view returns (uint8[3] memory types, uint256[3] memory rewards, uint256 slot3SpotsLeft) {
        uint256 currentDay = block.timestamp / 1 days;
        bytes32 seed = keccak256(abi.encodePacked("Missions", currentDay));
        
        uint8[6] memory pool = [0,1,2,3,4,5];
        
        for (uint i = 0; i < 3; i++) {
            uint idx = i + (uint8(seed[i]) % (TOTAL_MISSION_TYPES - i));
            
            uint8 temp = pool[i];
            pool[i] = pool[idx];
            pool[idx] = temp;
            
            types[i] = pool[i];
        }
        
        // Dynamic rewards based on current pool balance
        rewards[0] = _slotReward(SLOT1_REWARD_BPS);
        rewards[1] = _slotReward(SLOT2_REWARD_BPS);
        rewards[2] = _slotReward(SLOT3_REWARD_BPS);
        
        uint256 completedCount = slot3CompletionCount[currentDay];
        slot3SpotsLeft = completedCount >= 3 ? 0 : 3 - completedCount;
    }
    
    function completeMission(uint8 slot, bytes calldata proof) external {
        require(slot < 3, "Invalid slot");
        uint256 currentDay = block.timestamp / 1 days;
        require(!missionCompleted[currentDay][msg.sender][slot], "Already completed this mission today");
        
        (uint8[3] memory types, , ) = getMissionsToday();
        uint8 mType = types[slot];
        
        _verifyMission(mType, proof, currentDay);
        
        missionCompleted[currentDay][msg.sender][slot] = true;
        
        uint256 rewardToSend = 0;
        
        if (slot == 0) {
            slot1Completers[currentDay].push(msg.sender);
            rewardToSend = _slotReward(SLOT1_REWARD_BPS);
        } else if (slot == 1) {
            slot2Completers[currentDay].push(msg.sender);
            rewardToSend = _slotReward(SLOT2_REWARD_BPS);
        } else if (slot == 2) {
            uint256 count = slot3CompletionCount[currentDay];
            require(count < 3, "Slot 3 race already won");
            slot3TopCompleters[currentDay][count] = msg.sender;
            slot3CompletionCount[currentDay] = count + 1;
            rewardToSend = _slotReward(SLOT3_REWARD_BPS);
        }
        
        // Dispense reward if available
        if (rewardToSend > 0 && address(this).balance >= rewardToSend) {
            (bool s, ) = msg.sender.call{value: rewardToSend}("");
            require(s, "Transfer failed");
        } else {
            rewardToSend = 0; // Did not send (insufficient balance)
        }
        
        emit MissionCompleted(currentDay, msg.sender, slot, rewardToSend);
        
        // Check if all 3 are completed — grant bonus charges
        if (missionCompleted[currentDay][msg.sender][0] && 
            missionCompleted[currentDay][msg.sender][1] && 
            missionCompleted[currentDay][msg.sender][2]) {
            celoPlace.grantBonusCharges(msg.sender, 2);
            emit AllMissionsCompleted(currentDay, msg.sender, 2);
        }
    }
    
    function _verifyMission(uint8 mType, bytes calldata proof, uint256 currentDay) internal view {
        if (mType == EARLY_BIRD) {
            uint256 todayStart = currentDay * 1 days;
            uint256 lastPaint = celoPlace.lastPaintTimestamp(msg.sender, currentDay);
            require(lastPaint > 0 && lastPaint < todayStart + 8 hours, "Not an early bird");
            
        } else if (mType == FULL_CHARGES) {
            uint256 used = celoPlace.chargesUsedToday(msg.sender, currentDay);
            uint256 tierCharges = celoPlace.getTierCharges(msg.sender);
            require(used >= tierCharges && tierCharges > 0, "Charges not fully used");
            
        } else if (mType == NEIGHBOR) {
            // proof contains: myLat, myLng, neighborLat, neighborLng (encoded as int256)
            require(proof.length == 128, "Invalid proof length for NEIGHBOR");
            (int256 myLat, int256 myLng, int256 nLat, int256 nLng) = abi.decode(proof, (int256, int256, int256, int256));
            
            // Check adjacency: coordinates are scaled by 1e4, so 1 unit = 0.0001 degrees
            // Grid step is 0.08 degrees = 800 units. Adjacent cells differ by exactly 800.
            int256 diffLat = myLat > nLat ? myLat - nLat : nLat - myLat;
            int256 diffLng = myLng > nLng ? myLng - nLng : nLng - myLng;
            require(diffLat <= 800 && diffLng <= 800 && (diffLat > 0 || diffLng > 0), "Not neighbors");
            
            ICeloPlace.Pixel memory myPixel = celoPlace.getPixel(myLat, myLng);
            require(myPixel.painter == msg.sender, "You don't own the source pixel");
            
            ICeloPlace.Pixel memory nPixel = celoPlace.getPixel(nLat, nLng);
            require(nPixel.painter != address(0) && nPixel.painter != msg.sender, "Neighbor is empty or owned by you");
            
        } else if (mType == CONTESTED) {
            require(proof.length == 64, "Invalid proof length for CONTESTED");
            (int256 lat, int256 lng) = abi.decode(proof, (int256, int256));
            ICeloPlace.Pixel memory p = celoPlace.getPixel(lat, lng);
            require(p.painter == msg.sender, "You don't own this pixel");
            require(p.paintCount >= 3, "Pixel is not contested enough");
            
        } else if (mType == PIONEER) {
            require(proof.length == 64, "Invalid proof length for PIONEER");
            (int256 lat, int256 lng) = abi.decode(proof, (int256, int256));
            ICeloPlace.Pixel memory p = celoPlace.getPixel(lat, lng);
            require(p.painter == msg.sender, "You don't own this pixel");
            require(p.paintCount == 1, "Pixel is not a pioneer pixel");
            
        } else if (mType == STREAK_KEEPER) {
            uint256 streak = celoPlace.currentStreak(msg.sender);
            require(streak >= 7, "Streak is less than 7");
            uint256 used = celoPlace.chargesUsedToday(msg.sender, currentDay);
            require(used > 0, "Must paint today to keep streak");
        } else {
            revert("Unknown mission type");
        }
    }
}