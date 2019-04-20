
const BigNumber = web3.BigNumber;

const XChainSwap = artifacts.require('XChainSwap');

var accounts = web3.eth.getAccounts();

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should();
    
// let catchRevert = require("./exceptions.js").catchRevert;    

const truffleAssert = require('truffle-assertions');

contract('XChainSwap', accounts => {

    const _beneficiary     = accounts[0];
    const _digestString    = "reptilehaus";
    const _wrongDigest = "reptilehau2s"
    const _digestHash      = web3.utils.soliditySha3(_digestString)
    const _digest          = web3.utils.hexToBytes(_digestHash);
    const _beneficiaryName = "Clive Wright";
    const _chain           = "REPTILEUM"

    beforeEach( async function () {
        this.swap = await XChainSwap.new( _beneficiary, _digest, _beneficiaryName, _chain );
        await this.swap.send(web3.utils.toWei(String(1), "ether"), { from: accounts[0]  });       
    });

    describe('swap attributes', function () {       

        it('has a beneficiary address', async function () {
            const beneficiary = await this.swap.beneficiary();
                  beneficiary.should.equal(_beneficiary);
        });

        it('has a hashable digest and it matches original string', async function () {
            const digest = await this.swap.digest();
            digest.should.equal(_digestHash);
        });   

        it('has a named beneficiary', async function () {
            const beneficiaryName = await this.swap.beneficiaryName();
                  beneficiaryName.should.equal(_beneficiaryName);
        });        

    });

    describe('swap methods', function () {

        it('Confirm the correct beneficiary', async function () {
            const beneficiary = await this.swap.getBeneficiary();
            const t = Object.assign({}, [_beneficiary, _beneficiaryName, _chain ]);                          
            expect(beneficiary).to.eql(t); 
        });

        it('Confirm the correct balance', async function () {
            const balance = await this.swap.getBalance();
            const weiBalance = await web3.utils.fromWei(balance, "wei") 
            expect(weiBalance).to.eql(String(1e18)); 
        });        

        it('Confirm funds not released after wrong pre-image hash', async function () {
            await truffleAssert.fails(
                    this.swap.releaseFunds(_wrongDigest, { from: _beneficiary })
                );
        });

        it('Confirm funds released after correct pre-image hash and the rightful beneficiary', async function () {
            await truffleAssert.passes(
                    this.swap.releaseFunds(_digestString, { from: _beneficiary })
                );
        });   
        
        it('Confirm funds not released after correct pre-image hash but not the rightful beneficiary', async function () {
            await truffleAssert.fails(
                    this.swap.releaseFunds(_digestString, { from: accounts[4] }))
                ;
        });           
        
    });    

});