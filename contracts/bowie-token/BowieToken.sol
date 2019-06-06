pragma solidity 0.5.9;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract BowieToken is Ownable, Pausable, ERC20 {
    using SafeMath for uint256;
    string public name = "Bowie";
    string public symbol = "XBW";
    uint8 public decimals = 18;
    uint256 public initialSupply = 1000 * 1000 * 1000;
    uint256 _totalSupply;

    constructor() public {
        _totalSupply = initialSupply * (10 ** uint256(decimals));
        _mint(msg.sender, _totalSupply);
    }

    function approveAndCall(address _spender, uint256 _value, bytes memory _data) public returns (bool) {
        require(_spender != address(this));
        require(super.approve(_spender, _value));
        (bool success, )  = _spender.call(_data);
        require(success);
        return true;
    }    

}