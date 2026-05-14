// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract CeloPlace {
    struct Pixel {
        address lastPainter;
        uint24 color;
        uint256 timestamp;
        uint256 count;
    }

    struct UserState {
        uint256 lastPaintDay;
        uint256 charges;
    }

    mapping(bytes32 => Pixel) public pixels;
    mapping(address => UserState) public userStates;

    event PixelPainted(address indexed painter, int256 lat, int256 lng, uint24 color, uint256 timestamp);

    error InvalidCoordinates();
    error NoChargesRemaining();

    function paintPixel(int256 lat, int256 lng, uint24 color) external {
        if (lat < -900000 || lat > 900000 || lng < -1800000 || lng > 1800000) {
            revert InvalidCoordinates();
        }

        uint256 currentDay = block.timestamp / 1 days;
        UserState storage state = userStates[msg.sender];

        if (state.lastPaintDay < currentDay) {
            state.charges = 3;
            state.lastPaintDay = currentDay;
        }

        if (state.charges == 0) {
            revert NoChargesRemaining();
        }

        state.charges -= 1;

        bytes32 pixelId = keccak256(abi.encodePacked(lat, lng));
        Pixel storage pixel = pixels[pixelId];
        
        pixel.lastPainter = msg.sender;
        pixel.color = color;
        pixel.timestamp = block.timestamp;
        pixel.count += 1;

        emit PixelPainted(msg.sender, lat, lng, color, block.timestamp);
    }

    function getPixel(int256 lat, int256 lng) external view returns (Pixel memory) {
        bytes32 pixelId = keccak256(abi.encodePacked(lat, lng));
        return pixels[pixelId];
    }

    function getCharges(address user) external view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        UserState memory state = userStates[user];

        if (state.lastPaintDay < currentDay) {
            return 3;
        }
        
        return state.charges;
    }
}
