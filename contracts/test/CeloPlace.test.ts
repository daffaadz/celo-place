import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CeloPlace and CeloChat", function () {
  let celoPlace: any;
  let celoChat: any;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const CeloPlace = await ethers.getContractFactory("CeloPlace");
    celoPlace = await CeloPlace.deploy();
    
    const CeloChat = await ethers.getContractFactory("CeloChat");
    celoChat = await CeloChat.deploy();
  });

  describe("CeloPlace", function () {
    it("should allow a user to paint a pixel and emit an event", async function () {
      const tx = await celoPlace.connect(user1).paintPixel(-62088, 1068456, 16777215); // White color
      
      await expect(tx).to.emit(celoPlace, "PixelPainted")
        .withArgs(user1.address, -62088, 1068456, 16777215, await time.latest());
        
      const pixel = await celoPlace.getPixel(-62088, 1068456);
      expect(pixel.lastPainter).to.equal(user1.address);
      expect(pixel.color).to.equal(16777215);
      expect(pixel.count).to.equal(1);
    });

    it("should allow exactly 3 paints and revert on the 4th", async function () {
      await celoPlace.connect(user1).paintPixel(0, 0, 0);
      await celoPlace.connect(user1).paintPixel(1, 1, 0);
      await celoPlace.connect(user1).paintPixel(2, 2, 0);

      const charges = await celoPlace.getCharges(user1.address);
      expect(charges).to.equal(0);

      await expect(
        celoPlace.connect(user1).paintPixel(3, 3, 0)
      ).to.be.revertedWithCustomError(celoPlace, "NoChargesRemaining");
    });

    it("should accurately reflect charges with getCharges on a fresh wallet", async function() {
      const charges = await celoPlace.getCharges(user1.address);
      expect(charges).to.equal(3);
    });
    
    it("should return a zeroed struct for an unpainted coordinate", async function() {
      const pixel = await celoPlace.getPixel(999, 999);
      expect(pixel.lastPainter).to.equal(ethers.ZeroAddress);
      expect(pixel.count).to.equal(0);
    });
  });

  describe("CeloChat", function () {
    it("should allow sending a message and emit event", async function () {
      const tx = await celoChat.connect(user1).sendMessage("Hello World");
      
      await expect(tx).to.emit(celoChat, "MessageSent")
        .withArgs(0, user1.address, "Hello World", await time.latest());
    });

    it("should revert if message is empty", async function () {
      await expect(
        celoChat.connect(user1).sendMessage("")
      ).to.be.revertedWithCustomError(celoChat, "EmptyMessage");
    });
    
    it("should tip a message correctly", async function () {
      await celoChat.connect(user1).sendMessage("Great post");
      
      // owner tips user1
      const tipAmount = ethers.parseEther("1");
      const tx = await celoChat.connect(owner).tipMessage(0, { value: tipAmount });
      
      await expect(tx).to.emit(celoChat, "MessageTipped")
        .withArgs(0, owner.address, user1.address, tipAmount);
        
      // Ensure user received funds implicitly via change in balance
      await expect(tx).to.changeEtherBalances([owner, user1], [-tipAmount, tipAmount]);
    });
    
    it("should return recent messages based on count", async function() {
      await celoChat.sendMessage("Msg 1");
      await celoChat.sendMessage("Msg 2");
      await celoChat.sendMessage("Msg 3");
      
      const recent = await celoChat.getRecentMessages(2);
      expect(recent.length).to.equal(2);
      expect(recent[0].content).to.equal("Msg 2");
      expect(recent[1].content).to.equal("Msg 3");
    });
    
    it("should return messages using pagination", async function() {
      await celoChat.sendMessage("Msg 1");
      await celoChat.sendMessage("Msg 2");
      await celoChat.sendMessage("Msg 3");
      
      const paged = await celoChat.getMessages(1, 10);
      expect(paged.length).to.equal(2);
      expect(paged[0].content).to.equal("Msg 2");
      expect(paged[1].content).to.equal("Msg 3");
    });
  });
});
