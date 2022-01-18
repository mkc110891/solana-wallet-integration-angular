import { Component } from '@angular/core';
import { PhantomWalletService } from './service/phantom-wallet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Solana Wallet Integration Angular';
  constructor(private phantomWalletService: PhantomWalletService) {
    this.phantomWalletService.setNetworkConnection('testnet');
    
    // Token of USDC in TestNet
    // @see https://explorer.solana.com/address/CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp?cluster=testnet
    this.phantomWalletService.setTokenWallet('CpMah17kQEL2wqyMKt3mZBdTnZbkbfx4nqmQMFDP5vwp');
  }

  async connectPhantomWallet() {
    await this.phantomWalletService.connectPhantom();
  }

  async getTokenBalance() {
    await this.phantomWalletService.getBalance();
    console.log('Token Balance: ', this.phantomWalletService.tokenBalance);
  }

  async transferToken() {
    await this.phantomWalletService.transferToken(0.001, '74W215ni4AdWJxoybFYSfsWFjXMAoS3avNqtPsvkzbyo');
  }

  async disconnectWallet() {
    await this.phantomWalletService.disconnectPhantomWallet();
    console.log('Wallet disconnected');
  }
}
