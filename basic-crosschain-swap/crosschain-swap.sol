pragma solidity ^0.5.6;

/**
* This is a basic Payable contract to facilitate the transfer of assets between 2 trusted parties between 2 EVM Compatible chains
* @author Patrick O'Sullivan
* @param _beneficiary Address is the other persons address with who you wish to swap an asset with
* @param _digest Bytes32 is the keccak256 hash digest. Each party must enter the same pre-image in order to unlock the funds
* @param _beneficiaryName string The name of the person or an identifier, not strickly necessary
* @param _chain string the name/identifier of the chain which this operation takes place
 */

contract XChainSwap {

    string public version = "0.0.3";
    bytes32 public digest;
    address payable public beneficiary;
    uint public timeOut = now + 4 hours;
    address payable liquidityProvider = msg.sender;
    string beneficiaryName;
    string chain;
    string hashError = "wrong hash preimage";
    string hashCorrect = "Funds transferred to beneficiary";

    event WrongPreImage( string hashError );

    event CorrectPreImage( string hashCorrect );

    modifier onlyLiquidityProvider {
        require(msg.sender == liquidityProvider);
        _;
    }
    modifier onlyCorrectPreImage(string memory _hash) {
        require(digest ==  keccak256(bytes(_hash)));
        emit WrongPreImage(hashError);
        _;
    }

    constructor( address payable _beneficiary, bytes32 _digest, string memory _beneficiaryName, string memory _chain ) public {
        digest            = _digest;
        liquidityProvider = msg.sender;
        beneficiary       = _beneficiary;
        beneficiaryName   = _beneficiaryName;
        chain             = _chain;
    }

    function releaseFunds(string memory _hash)  onlyCorrectPreImage(_hash) public returns(bool result) {
       emit CorrectPreImage("Funds transferred to beneficiary");
       selfdestruct(beneficiary);
       return true;
    }

    function refundOwner() onlyLiquidityProvider public returns(bool result) {
        require(now >= timeOut);
        selfdestruct(liquidityProvider);
        return true;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getBeneficiary() public view returns  (address, string memory, string memory) {
        return (beneficiary, beneficiaryName, chain);
    }

    function () external payable {}

}
