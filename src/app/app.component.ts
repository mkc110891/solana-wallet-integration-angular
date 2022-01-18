import { Component } from '@angular/core';
import { WalletService } from './interface/wallet-service.interface';
import { PhantomWalletService } from './service/phantom-wallet.service';
import { SolflareWalletService } from './service/solflare-wallet.service';
import { SolletWalletService } from './service/sollet-wallet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Solana Wallet Integration Angular';
  walletTypes: any = {
    phantom: 'phantom',
    solflare: 'solflare',
    sollet: 'sollet'
  }
  constructor(
    private phantomWalletService: PhantomWalletService,
    private solflareWalletService: SolflareWalletService,
    private solletWalletService: SolletWalletService
    ) {
    this.phantomWalletService.setNetworkConnection('testnet');
    
    // Token of USDC in TestNet
    // @see https://explorer.solana.com/address/CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp?cluster=testnet
    this.phantomWalletService.setTokenWallet('CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp');

    this.solflareWalletService.setNetworkConnection('testnet');
    this.solflareWalletService.setTokenWallet('CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp');

    this.solletWalletService.setNetworkConnection('testnet');
    this.solletWalletService.setTokenWallet('CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp');
  }

  async connectWallet(walletService: WalletService) {
    switch (walletService) {
      case this.walletTypes.phantom:
        await this.phantomWalletService.connectPhantom();
      break;
      case this.walletTypes.solflare:
        await this.solflareWalletService.connectSolflare();
      break;
      case this.walletTypes.sollet:
        await this.solletWalletService.connectSollet();
      break;
    }
    
  }

  async getTokenBalance(walletService: WalletService) {
    switch (walletService) {
      case this.walletTypes.phantom:
        await this.phantomWalletService.getBalance();
        console.log('Token Balance: ', this.phantomWalletService.tokenBalance);
      break;
      case this.walletTypes.solflare:
        await this.solflareWalletService.getBalance();
        console.log('Token Balance: ', this.solflareWalletService.tokenBalance);
      break;
      case this.walletTypes.sollet:
        await this.solletWalletService.getBalance();
        console.log('Token Balance: ', this.solletWalletService.tokenBalance);
      break;
    }
    
    
  }

  async transferToken(walletService: WalletService) {
    let solletWallet = 'DzYrzLsXHBhp3WAYRVQjaffS9u8i1GKan3gdzpFPquwV';
    let solflareWallet = '74W215ni4AdWJxoybFYSfsWFjXMAoS3avNqtPsvkzbyo';
    let phantomWallet = '2MfKdhiBtkV3so8S9GNnzhx9MaP7A4weGVYHp9qNByqZ';
    switch (walletService) {
      case this.walletTypes.phantom:
        await this.phantomWalletService.transferToken(0.005, solletWallet);
      break;
      case this.walletTypes.solflare:
        await this.solflareWalletService.transferToken(0.001, solletWallet);
      break;
      case this.walletTypes.sollet:
        await this.solletWalletService.transferToken(0.001, phantomWallet);
      break;
    }
  }

  async disconnectWallet(walletService: WalletService) {
    switch (walletService) {
      case this.walletTypes.phantom:
        await this.phantomWalletService.disconnectPhantomWallet();
      break;
      case this.walletTypes.solflare:
        await this.solflareWalletService.disconnectSolflareWallet();
      break;
    }
    console.log('Wallet disconnected');
  }
}