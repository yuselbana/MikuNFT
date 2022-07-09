// SPDX-License-Identifier:MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Whitelist.sol";

contract Miku is ERC721Enumerable, Ownable {
    string baseTokenURI;
    Whitelist whiteList; 
    bool public isPresaleStarted;
    uint256 public presaleEnded; 
    uint256 public maxID = 50;
    uint256 public totalID;
    bool public paused = true;
    uint256 public publicPrice = 0.02 ether;
    uint public presalePrice = 0.01 ether;

    modifier Paused{
        require(!paused,"Contract currently paused");
        _;
    }
    constructor(string memory _baseTokenURI, address whitelistContract) ERC721("Miku","MKU"){
        baseTokenURI = _baseTokenURI;
        whiteList = Whitelist(whitelistContract);
    }
function startPresale() public onlyOwner{
    paused = false; 
    isPresaleStarted = true;
    presaleEnded = block.timestamp + 1 minutes; 
}
function presaleMint() public payable Paused {
    require(isPresaleStarted && block.timestamp < presaleEnded,"Presale has ended...");
    require(whiteList.whitelistedAddresses(msg.sender),"Not in whitelist...");
    require(totalID < maxID,"Excedeed max supply...");
    require (msg.value >= presalePrice);
    totalID +=1;
    _safeMint(msg.sender, totalID);
} 
function mint() public payable Paused{
require(isPresaleStarted && block.timestamp >= presaleEnded,"Presale still in progress...");
require(totalID < maxID,"Excedeed max supply...");
require (msg.value >= publicPrice);
totalID +=1;
_safeMint(msg.sender, totalID);
}
function _baseURI() internal view override returns(string memory){
    return baseTokenURI;
}

function setPause(bool val) public onlyOwner {
    paused = val;
}

function withdraw() public onlyOwner{
    address _owner = owner();
    uint256 amount = address(this).balance;
    (bool sent,) = _owner.call{value: amount}("");
    require(sent, "Failed to send...");
}

receive() external payable {}
fallback() external payable{}
}