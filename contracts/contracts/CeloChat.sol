// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract CeloChat {
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
        uint256 tipAmount;
    }

    Message[] public messages;

    event MessageSent(uint256 indexed messageId, address indexed sender, string content, uint256 timestamp);
    event MessageTipped(uint256 indexed messageId, address indexed tipper, address indexed recipient, uint256 amount);

    error EmptyMessage();
    error MessageTooLong();
    error MessageDoesNotExist();
    error ZeroTipAmount();
    error TransferFailed();

    function sendMessage(string calldata content) external {
        if (bytes(content).length == 0) revert EmptyMessage();
        if (bytes(content).length > 280) revert MessageTooLong();

        uint256 messageId = messages.length;
        messages.push(Message({
            sender: msg.sender,
            content: content,
            timestamp: block.timestamp,
            tipAmount: 0
        }));

        emit MessageSent(messageId, msg.sender, content, block.timestamp);
    }

    function tipMessage(uint256 messageId) external payable {
        if (messageId >= messages.length) revert MessageDoesNotExist();
        if (msg.value == 0) revert ZeroTipAmount();

        Message storage message = messages[messageId];
        message.tipAmount += msg.value;

        // Perform tip transfer
        (bool success, ) = message.sender.call{value: msg.value}("");
        if (!success) revert TransferFailed();

        emit MessageTipped(messageId, msg.sender, message.sender, msg.value);
    }

    function getMessages(uint256 offset, uint256 limit) external view returns (Message[] memory) {
        uint256 total = messages.length;
        if (offset >= total) {
            return new Message[](0);
        }

        uint256 count = limit > 100 ? 100 : limit;
        if (offset + count > total) {
            count = total - offset;
        }

        Message[] memory result = new Message[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = messages[offset + i];
        }
        
        return result;
    }

    function getRecentMessages(uint256 count) external view returns (Message[] memory) {
        uint256 total = messages.length;
        uint256 actualCount = count > total ? total : count;
        
        Message[] memory result = new Message[](actualCount);
        for (uint256 i = 0; i < actualCount; i++) {
            result[i] = messages[total - actualCount + i];
        }

        return result;
    }

    function getTotalMessages() external view returns (uint256) {
        return messages.length;
    }
}
