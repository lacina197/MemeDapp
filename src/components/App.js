import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Meme from '../abis/Meme.json'

//import { create } from 'ipfs-http-client'
//const ipfs = create({ host: 'localhost', port: '5001' })

//const IPFS=require('ipfs-http-client');
//const ipfs2 =IPFS({host:'ipfs.infura.io',port:5001,protocol:'https'});

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  constructor(props) {
    super(props);
    this.state = {
      account: null,
      buffer: null,
      contract: null,
      memeHash: ''
    };
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      console.log("1-"+window.web3)
      await window.ethereum.enable()
      console.log("2-")
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      console.log("3-")
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask! Be aware of Developer AREA!!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Get the account
    const accounts = await web3.eth.getAccounts()
    console.log("Account : "+accounts)
    this.setState({account: accounts[0] })
    // Get the network
    const networkId = await web3.eth.net.getId()
    console.log("Network id : "+networkId)
    // Get SC (we need abi: "Meme.abi" and address: "networkData.address")
    const networkData = Meme.networks[networkId]
    if(networkData)
    {
      // fecth contract
      const abi = Meme.abi
      const address = networkData.address
      const contract = web3.eth.Contract(abi,address)
      this.setState({contract})
      console.log(contract)
      // Get meme hash
      const memeHash = await contract.methods.get().call()
      this.setState( {memeHash} )
      console.log("current meme hash : "+memeHash)
    }
    else 
    {
      window.alert('Smart contract not deployed to detected network! ')
      console.log("Smart contract not deployed to detected network!!!!")
    }
  }

  captureFile = (event) => {
    event.preventDefault()
    console.log('file captured!')
    // process file for IPFS
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('Reader Buffer : ', this.state.buffer)
    }
  }

  // Example1 Hash = QmXfojCPuMEv94vRBEFVKgRhn4pd6EBbECHFFgnMMD68oB
  // Example1 url = https://ipfs.infura.io/ipfs/QmXfojCPuMEv94vRBEFVKgRhn4pd6EBbECHFFgnMMD68oB
  /*
  onSubmit = (event) => {
    event.preventDefault()
    console.log("Submiting file to ipfs..")
  
    ipfs.add(this.state.buffer, (error,result) => {
      console.log('IPFS Result', result);
      // const memeHash = result[0]
      if(error) {
        console.error("BUFFER STATE ERROR : "+error)
        return
      }
      this.setState({ memeHash: result[0].hash })
      // 2. Store file in BC
      this.state.contract.methods.set(result[0].hash).send({ from: this.state.account }).then((r) => {
        return this.setState({ memeHash: result[0].hash 
      })1
    })
  })
}
*/
  onSubmit = (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      const memeHash = result[0].hash
      if(error) {
        console.error(error)
        return
      }
      //this.state.contract.methods.set(result[0].hash).send({ from: this.state.account }).then((r) => {
      //   return this.setState({ memeHash: result.hash })
      //})
      this.state.contract.methods.set(memeHash).send({ from: this.state.account }).then((r) => {
        this.setState({ memeHash })
      })
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hello Lacin
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nawrap d-none d-sm-none d-sm-block">
              <small className="text-white"> {this.state.account} </small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="javascript:window.top.location.reload(true)" 
                  href="www.github.com"
                  class="continue"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} 
                  alt="LacinDBImage" width="500" height="400" />
                </a>
                <p>&nbsp;</p>
                <h2>Change Your Meme</h2>
                <form onSubmit={this.onSubmit}>
                  <input type="file" onChange={this.captureFile} />
                  <input type="submit"/>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
