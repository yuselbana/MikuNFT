import {useRef, useState, useEffect} from "react";
import Web3Modal, { getThemeColors } from "web3modal";
import Head from "next/head";
import {providers, Contract, utils} from "ethers";
import styles from '../styles/Home.module.css';
import {NFT_CONTRACT_ABI,NFT_CONTRACT_ADDRESS} from "../constants";
export default function Home() {
    const[isOwner, setIsOwner]= useState(false);
    const [presaleStarted, setPresaleStarted] = useState(false);
    const [presaleEnded, setPresaleEnded] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const[loading, setLoading]= useState(false);
    const[numTokensMinted,setNumTokensMinted] = useState("0");
    const web3ModalRef = useRef();


    const getNumMintedTokens = async() => {
          
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.totalID();
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setNumTokensMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  } 
    const presaleMint = async() => {
        try {
            setLoading(true);
            const signer = await getProviderOrSigner(true)
            const nftContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                NFT_CONTRACT_ABI,
                signer
            );
            const txn = await nftContract.presaleMint({
                value:utils.parseEther("0.01"),
            });
            console.log(txn);
            await txn.wait();
            window.alert("You have successfully minted Miku.")
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }

    const publicMint = async() => {
        try {
            setLoading(true);
            const signer = await getProviderOrSigner(true);
            const nftContract = new Contract(
                NFT_CONTRACT_ADDRESS,
                NFT_CONTRACT_ABI,
                signer
            );
            const txn = await nftContract.mint({
                value:utils.parseEther("0.02"),
            });
            await txn.wait();
            window.alert("You have successfully minted Miku.");
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }
    const connectWallet = async() => {
        await getProviderOrSigner();
        setWalletConnected(true);
     }

    const startPresale = async() => {
        setLoading(true);
        try {
            const signer = await getProviderOrSigner(true);
            const nftContract= new Contract(
                NFT_CONTRACT_ADDRESS,
                NFT_CONTRACT_ABI,
                signer
            );
            const txn = await nftContract.startPresale();
            
            await txn.wait();
            setPresaleStarted(true);
        } catch (error) {
          console.error(error);
        }
        setLoading(false);
    }
    
    const checkIfPresaleStarted = async() => {
      try {
        const provider = await getProviderOrSigner();
        const nftContract = new Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          provider
        );
        const _presaleStarted = await nftContract.isPresaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
      } catch (error) {
      console.error(error); 
       return false;
      }
    }
    const checkIfPresaleEnded = async() => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract = new Contract(
              NFT_CONTRACT_ADDRESS,
              NFT_CONTRACT_ABI,
              provider
            );    
            const presaleEndTime = await nftContract.presaleEnded();
            const currentTimeInSeconds = Date.now()/1000;
            const hasPresaleEnded = presaleEndTime.lt(Math.floor(currentTimeInSeconds));
            if(hasPresaleEnded){
                setPresaleEnded(true);
            }else{
                setPresaleEnded(false);
            }
        } catch (error) {
          console.error(error);
        }
    }
    const getOwner = async () => {
        try {
            const provider = await getProviderOrSigner();
            const nftContract= new Contract(
                NFT_CONTRACT_ADDRESS,
                NFT_CONTRACT_ABI,
                provider  
            ); 
            const _owner = await nftContract.owner();
            
            const signer = await getProviderOrSigner(true);
            const userAddress = await signer.getAddress();
            if(_owner.toLowerCase() === userAddress.toLowerCase()){ 
                setIsOwner(true);
            }
        } catch (error) {
        console.error(error);
        }
    }
    const getProviderOrSigner = async(needSigner = false) => {
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);
        const {chainId} = await web3Provider.getNetwork();
        if(chainId !== 4){
            window.alert("Switch to rinkeby test network.");
           
        }
        if(needSigner) {
            const signer = web3Provider.getSigner();
            return signer;
        }
        return web3Provider;
    }

    const onPageLoad = async() => {
       await connectWallet();
       const presaleStarted = await checkIfPresaleStarted();
       if(presaleStarted){
        await checkIfPresaleEnded();
       }
       await getNumMintedTokens();

       setInterval(async() => {
        await getNumMintedTokens();
       }, 5* 1000)

       setInterval(async() => {
        const presaleStarted= await checkIfPresaleStarted();
        if(presaleStarted){
            await checkIfPresaleEnded();
        }
       }, 5* 1000)
    } 
    useEffect(() => {
        if(!walletConnected){
            web3ModalRef.current = new Web3Modal({
                network:"rinkeby",
                providerOptions:{},
                disableInjectedProvider:false,
            });
        onPageLoad();  
        }
    }, [])

    function renderBody() {
        if(!walletConnected){
            return(
                <button onClick={connectWallet} className={styles.button}> Connect Wallet</button>
            );
        }
        if(loading){
            return(
                <span className={styles.description}>Loading...</span>
            )
        }
        if(isOwner && !presaleStarted) {
            return(
                <button onClick={startPresale} className={styles.button3}>Start Presale</button>
            )
        }
        if(!presaleStarted){
          return(
            <div>
            <span className={styles.description}>Presale has not started yet!</span>
        </div>
          )
        }
        if(presaleStarted && !presaleEnded) {
            return(
                <div>
                    <span className={styles.description}>
                        Presale has started, mint Miku!
                    </span>
                    <button className={styles.button} onClick={presaleMint}>Presale Mint</button>
                </div>
            )
        }
        if(presaleEnded){
          return(
            <div>
            <button onClick={publicMint} className={styles.button}>Public Mint</button>
            </div>
            
          )
        }
    }


    return (
        <div className={styles.body}>
        <Head>
        <title>Miku</title>
        </Head>
        <div className={styles.main}>
        {renderBody()}
        </div>
        <div className={styles.title}>
        Miku NFT Collection
        <div className={styles.description}>{numTokensMinted}/50 have been minted already!</div>
        </div>
        
        
        </div>)
}