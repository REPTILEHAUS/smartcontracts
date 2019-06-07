
const BigNumber = web3.BigNumber;

const BowieToken = artifacts.require('BowieToken');

const truffleAssert = require('truffle-assertions');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('BowieToken', accounts => {
    
    const _approvedSpender = accounts[1];
    const totalSupplyWei = 1000000000000000000000000000;
    const totalSupplyBowie = 1000000000;    
    const _symbol = "XBW";
    const _name = "Bowie";
    
    beforeEach(async function () {
        this.owner = accounts[0];
         this.erc20 = await BowieToken.new();
    });

    describe('all values should be set on constructor call', function () {
        it('has correct total supply', async function () {
            const totalSupply = await this.erc20.totalSupply();
            assert.equal(totalSupplyWei, totalSupply.valueOf(), "correct total supply should be set")
        });     
        it('Total supply should be transferred and reflect in the owners balance', async function () {
            const balance = await this.erc20.balanceOf.call(this.owner)
            assert.equal(totalSupplyWei, balance.valueOf(), "balance should be equal to total supply")
        })              
    });

    describe('token attributes', function () {

        it('has a token symbol', async function () {
            const symbol = await this.erc20.symbol();
            symbol.should.equal(_symbol);
        });
        
        it('has a token name', async function () {
            const name = await this.erc20.name();
            name.should.equal(_name);
        });        
        
        it('has a token total supply equal to 1 billion', async function () {
            const totalSupplyWei = await this.erc20.totalSupply();
            const totalSupplyMainUnix = web3.utils.fromWei(String(totalSupplyWei.valueOf()), "ether");
            assert.equal(totalSupplyBowie, totalSupplyMainUnix)
        });                
    });
    
    describe('token erc223 method', function () {
        it('has approved another account to spend tokens on its behalf', async function () {
            const approveAndCall = await this.erc20.approveAndCall(_approvedSpender, 1000000000, "0x0");
            truffleAssert.eventEmitted(approveAndCall, 'Approval', (ev) => {
                // console.log("ASADASDASDAS ", ev.owner, ev.spender, ev.value);
                return ev.owner === this.owner && ev.spender === _approvedSpender;
            });
        });
    });
        

});