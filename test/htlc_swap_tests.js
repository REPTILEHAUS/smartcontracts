
const BigNumber = web3.BigNumber;

const XChainSwap = artifacts.require('XChainSwap');

const accounts = web3.eth.getAccounts();

const truffleAssert = require('truffle-assertions');

require('chai')
    .use(require('chai-bignumber')(BigNumber))
    .should(); 



contract('XChainSwap', accounts => {

    const _liquidityProvider = accounts[0];    
    const _beneficiary       = accounts[1];
    const _digestString      = "reptilehaus";
    const _wrongDigest       = "reptilehaus_wrong_digest"
    const _digestHash        = web3.utils.soliditySha3(_digestString)
    const _digest            = web3.utils.hexToBytes(_digestHash);
    const _beneficiaryName   = "Clive Wright";
    const _chain             = "REPTILEUM"

    beforeEach( async function () {
        this.swap = await XChainSwap.new( _beneficiary, _digest, _beneficiaryName, _chain );
        await this.swap.send(web3.utils.toWei(String(1), "ether"), { from: _liquidityProvider  });       
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
        
        it('Confirm funds not released after correct pre-image hash but not the rightful beneficiary (contract owner/LP)', async function () {
            await truffleAssert.fails(
                this.swap.releaseFunds(_digestString, { from: accounts[2] }))
                ;
        });           
        
    });    

});