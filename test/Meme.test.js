const { FormControlStatic } = require('react-bootstrap');

const Meme = artifacts.require("Meme");

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Meme', (accounts) => {
    // write your tests
    let meme

    before(async () => {
        meme = await Meme.deployed()
    })

    describe('deployment', async() => {
        it('deploys successfully', async () =>{
            meme = await Meme.deployed()
            const address = meme.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)            
        })
    })

    describe('storage', async () => {
        it('updayes the memeHash', async () => {
            let memeHash = 'absdf134'
            await meme.set(memeHash)
            const result = await meme.get()
            assert.equal(result, memeHash)
        })
    })
})