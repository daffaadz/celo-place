// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract CeloPlace {
    struct Pixel {
        address painter;
        uint24 color;
        uint256 timestamp;
        uint256 paintCount;
    }

    struct UserState {
        uint256 lastPaintDay;
        uint256 charges;
    }

    mapping(bytes32 => Pixel) public pixels;
    
    // mapping(user => mapping(day => uint256))
    mapping(address => mapping(uint256 => uint256)) public lastPaintTimestamp;
    mapping(address => mapping(uint256 => uint256)) public chargesUsedToday;
    
    // Cooldown mapping: key => address => last overwrite timestamp
    mapping(bytes32 => mapping(address => uint256)) private lastOverwriteTime;

    mapping(address => UserState) public userStates; // Used mainly for tracking when charges reset
    mapping(address => uint256) public currentStreak;
    mapping(address => uint256) public lastActiveDay;
    mapping(address => uint256) public bonusCharges; // Grantable by MissionBoard

    address public treasury;
    address public rewardPool;
    address public missionBoard;
    
    uint256 public constant VIRGIN_FEE = 0.001 ether;

    event PixelPainted(address indexed painter, int256 lat, int256 lng, uint24 color, uint256 timestamp);
    
    error InvalidCoordinates();
    error NoChargesRemaining();
    error CooldownActive();
    error PixelTooNew();
    error InsufficientFee();
    error TransferFailed();
    error Unauthorized();

    constructor(address _treasury) {
        treasury = _treasury;
    }
    
    function setContracts(address _rewardPool, address _missionBoard) external {
        require(rewardPool == address(0) && missionBoard == address(0), "Already set");
        rewardPool = _rewardPool;
        missionBoard = _missionBoard;
    }

    function getOverwritePrice(int256 lat, int256 lng) public view returns (uint256) {
        bytes32 key = keccak256(abi.encodePacked(lat, lng));
        Pixel memory p = pixels[key];
        
        if (p.painter == address(0)) {
            return VIRGIN_FEE;
        }

        uint256 ageSeconds = block.timestamp - p.timestamp;
        uint256 agePriceWei;

        if (ageSeconds < 1 days) {
            agePriceWei = 0.005 ether;
        } else if (ageSeconds < 3 days) {
            agePriceWei = 0.008 ether;
        } else if (ageSeconds < 7 days) {
            agePriceWei = 0.015 ether;
        } else if (ageSeconds < 30 days) {
            agePriceWei = 0.03 ether;
        } else {
            agePriceWei = 0.05 ether;
        }

        uint256 hotspotMultiplierBase10 = 10;
        if (p.paintCount >= 6) {
            hotspotMultiplierBase10 = 20; // 2x
        } else if (p.paintCount >= 3) {
            hotspotMultiplierBase10 = 15; // 1.5x
        }

        return (agePriceWei * hotspotMultiplierBase10) / 10;
    }

    function grantBonusCharges(address user, uint256 amount) external {
        if (msg.sender != missionBoard) revert Unauthorized();
        bonusCharges[user] += amount;
    }

    function getTierInfo(address user) external view returns (uint256 streak, uint256 charges, uint256 bonus) {
        streak = currentStreak[user];
        uint256 currentDay = block.timestamp / 1 days;
        
        // Return 0 streak if missed a day
        if (lastActiveDay[user] < currentDay - 1 && lastActiveDay[user] != currentDay) {
            streak = 0;
        }

        uint256 baseCharges = _getBaseChargesForStreak(streak);
        
        // If haven't painted today, full charges available. Else, fetch remaining.
        if (userStates[user].lastPaintDay < currentDay) {
            charges = baseCharges;
        } else {
            charges = userStates[user].charges;
        }
        
        bonus = bonusCharges[user];
    }
    
    function _getBaseChargesForStreak(uint256 streak) internal pure returns (uint256) {
        if (streak <= 2) return 3;
        if (streak <= 6) return 4;
        if (streak <= 13) return 5;
        if (streak <= 29) return 6;
        return 8;
    }

    function getTierCharges(address user) public view returns (uint256) {
        uint256 streak = currentStreak[user];
        uint256 currentDay = block.timestamp / 1 days;
        if (lastActiveDay[user] < currentDay - 1 && lastActiveDay[user] != currentDay) {
            streak = 0;
        }
        return _getBaseChargesForStreak(streak);
    }

    function paintPixel(int256 lat, int256 lng, uint24 color) external payable {
        if (lat < -900000 || lat > 900000 || lng < -1800000 || lng > 1800000) {
            revert InvalidCoordinates();
        }

        uint256 currentDay = block.timestamp / 1 days;
        
        // --- Streak & Charge Logic ---
        if (lastActiveDay[msg.sender] < currentDay - 1 && lastActiveDay[msg.sender] != currentDay) {
             // Missed yesterday
             currentStreak[msg.sender] = 1;
        } else if (lastActiveDay[msg.sender] == currentDay - 1) {
             // Painted yesterday
             currentStreak[msg.sender] += 1;
        } else if (lastActiveDay[msg.sender] == 0) {
             currentStreak[msg.sender] = 1;
        }
        lastActiveDay[msg.sender] = currentDay;
        
        UserState storage state = userStates[msg.sender];
        if (state.lastPaintDay < currentDay) {
            state.charges = _getBaseChargesForStreak(currentStreak[msg.sender]);
            state.lastPaintDay = currentDay;
            // Note: chargesUsedToday starts at 0 automatically for new day context
        }

        if (state.charges == 0 && bonusCharges[msg.sender] == 0) {
            revert NoChargesRemaining();
        }

        if (bonusCharges[msg.sender] > 0) {
            bonusCharges[msg.sender] -= 1;
        } else {
            state.charges -= 1;
        }
        
        // For missions
        lastPaintTimestamp[msg.sender][currentDay] = block.timestamp;
        chargesUsedToday[msg.sender][currentDay] += 1;
        
        // --- Economy & Validation Logic ---
        bytes32 pixelId = keccak256(abi.encodePacked(lat, lng));
        Pixel storage p = pixels[pixelId];
        address prevPainter = p.painter;
        
        if (prevPainter == address(0) || prevPainter == msg.sender) {
            // Virgin pixel or Self-overwrite
            if (msg.value < VIRGIN_FEE) revert InsufficientFee();
            
            (bool s1, ) = treasury.call{value: VIRGIN_FEE}("");
            if (!s1) revert TransferFailed();
            
            // refund excess
            if (msg.value > VIRGIN_FEE) {
                (bool sr, ) = msg.sender.call{value: msg.value - VIRGIN_FEE}("");
                sr; // ignore failure to refund
            }
            
        } else {
            // Overwriting someone else
            // Cooldown protect
            if (block.timestamp - lastOverwriteTime[pixelId][msg.sender] < 24 hours) {
                revert CooldownActive();
            }
            // Age protect
            if (block.timestamp - p.timestamp < 1 hours) {
                revert PixelTooNew();
            }
            
            uint256 overwriteFee = getOverwritePrice(lat, lng);
            if (msg.value < overwriteFee) revert InsufficientFee();
            
            lastOverwriteTime[pixelId][msg.sender] = block.timestamp;
            
            uint256 split = overwriteFee / 2;
            (bool s1, ) = prevPainter.call{value: split}("");
            if (!s1) revert TransferFailed();
            
            (bool s2, ) = rewardPool.call{value: overwriteFee - split}("");
            if (!s2) revert TransferFailed();
            
            // refund excess
            if (msg.value > overwriteFee) {
                (bool sr, ) = msg.sender.call{value: msg.value - overwriteFee}("");
                sr;
            }
        }
        
        // Proceed with paint
        p.painter = msg.sender;
        p.color = color;
        p.timestamp = block.timestamp;
        p.paintCount += 1;

        emit PixelPainted(msg.sender, lat, lng, color, block.timestamp);
    }

    function getPixel(int256 lat, int256 lng) external view returns (Pixel memory) {
        bytes32 pixelId = keccak256(abi.encodePacked(lat, lng));
        return pixels[pixelId];
    }
}
