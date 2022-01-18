import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js';

declare var window: any;
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SolflareWalletService {

  walletProvider?: any;
  connection!: Connection;
  myToken!: Token;
  networkApi: string = '';
  tokenWallet: string = '';
  public tokenBalance?: any;

  constructor(
    private http: HttpClient
  ) { }

  setNetworkConnection(network: 'devnet'|'testnet'|'mainnet-beta') {
    switch (network) {
      case 'devnet':
        this.networkApi = 'https://api.devnet.solana.com';
      break;
      
      case 'testnet':
        this.networkApi = 'https://api.testnet.solana.com';
      break;

      case 'mainnet-beta':
        this.networkApi = 'https://api.mainnet-beta.solana.com';
      break;
    }
    this.connection = new Connection(
      clusterApiUrl(network),
      'confirmed'
    );
  }

  setTokenWallet(tokenWallet: string) {
    this.tokenWallet = tokenWallet;
  }

  private async connectSolflareWallet() {
    const isSolflareInstalled = window.solflare && window.solflare.isSolflare;
    if ( isSolflareInstalled ) {
      if ("solflare" in window) {
        const provider = window.solflare;
        if (provider.isSolflare) {
          if (!provider.isConnected) {
            try {
              await window.solflare.connect();
              return window.solflare;
            } catch (err) {
                console.log('err ==> ', err);
            }
          } else {
            console.log('Already Exists Connection');
            await window.solflare.connect();
            return window.solflare;
          }    
        }
      } else {
        return false;
      }
    } else {
      console.log("Solflare wallet is not installed")
    }
  }

  private createToken() {
    const tokenMint = new PublicKey(this.tokenWallet);
    this.myToken = new Token(
      this.connection,
      tokenMint,
      TOKEN_PROGRAM_ID,
      this.walletProvider.publicKey
    );
  }

  async connectSolflare() {
    this.walletProvider = await this.connectSolflareWallet();
    console.log('Public Key ==> ', this.walletProvider.publicKey.toString());
    this.createToken();
  }

  async disconnectSolflareWallet() {
    await this.walletProvider.disconnect();
  }

  async getBalance() {
    const tokenMint = new PublicKey(this.tokenWallet).toString();
    await this.getTokenBalance(this.walletProvider.publicKey.toString(), tokenMint)
    .subscribe( (response: any) => {
      if(response[0]?.result?.value.length > 0) {
        this.tokenBalance = response[0]?.result?.value[0]?.account?.data?.parsed?.info?.tokenAmount;
        return this.tokenBalance;
      }
    });
  }

  private getTokenBalance(wallet_address: any, token_mint: any) {
    return this.http.post(this.networkApi, [{
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [ wallet_address,
            {
              mint: token_mint,
            },
            {
              encoding: "jsonParsed",
            },
          ],
    }], httpOptions);
  }

  private async getCustomTokenAddress(destPublicKey: any) {
    return await Token.getAssociatedTokenAddress(
      this.myToken.associatedProgramId,
      this.myToken.programId,
      this.myToken.publicKey,
      destPublicKey
    );
  }

  private async signCustomTransaction(transaction: Transaction) {
    let fromWallet = new PublicKey(this.walletProvider.publicKey);
    transaction.recentBlockhash = (await this.connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = fromWallet;
    let signed = await this.walletProvider.signTransaction(transaction);
    let signature = await this.connection.sendRawTransaction(signed.serialize());
    await this.connection.confirmTransaction(signature);
    console.log("Signature: ", signature);
    return signature;
  }

  private async getReceiverTokenAccount(receiverPublicKey: any) {
    try {
      let associatedDestinationTokenAddr = await this.getCustomTokenAddress(receiverPublicKey);
      let receiverAccount = await this.connection.getAccountInfo(associatedDestinationTokenAddr);
      console.log('receiverAccount ==> ', receiverAccount);
      if (receiverAccount == null) {
        let from_wallet = new PublicKey(this.walletProvider.publicKey);
        const transaction = new Transaction().add(
          Token.createAssociatedTokenAccountInstruction(
            this.myToken.associatedProgramId,
            this.myToken.programId,
            this.myToken.publicKey,
            associatedDestinationTokenAddr,
            receiverPublicKey,
            from_wallet
          )
        );
        await this.signCustomTransaction(transaction);
        receiverAccount = await this.connection.getAccountInfo(associatedDestinationTokenAddr);
        console.log('receiverAccount ==> ', receiverAccount);
        // associatedDestinationTokenAddr = await this.getCustomTokenAddress(destPublicKey);
        // console.log('associatedDestinationTokenAddr ==> ', associatedDestinationTokenAddr);
        return await this.myToken.getOrCreateAssociatedAccountInfo(receiverPublicKey);
      } else {
        return await this.myToken.getOrCreateAssociatedAccountInfo(receiverPublicKey);
      }
    } catch (err) {
      console.log('Error ==> ', err);
      return null;
    }
  }

  async transferToken(tokenAmount: number, toWalletAddress: string) {
    let to_wallet = new PublicKey(toWalletAddress);
    console.log('to_wallet ==> ', to_wallet.toString());
    let receiverAccount = await this.getReceiverTokenAccount(to_wallet);
    let senderAccount = await this.getReceiverTokenAccount(this.walletProvider.publicKey);
    if(receiverAccount !== null && senderAccount !== null) {
      try {
          let transaction = new Transaction()
          .add(Token.createTransferInstruction(
              TOKEN_PROGRAM_ID,
              senderAccount.address,
              receiverAccount.address,
              this.walletProvider.publicKey,
              [],
              tokenAmount * 1000000
          ));
          await this.signCustomTransaction(transaction);
      } catch(err) {
        console.log('Transaction Error ==> ', err);
      }
    }
  }
}
