import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Zuvi } from '../types/zuvi.js';
import idl from '../../../target/idl/zuvi.json' assert { type: 'json' };
import bs58 from 'bs58';

export class SolanaService {
  public connection: Connection;
  private program: Program<Zuvi>;
  private payerWallet: Wallet;
  private rpcUrl: string;
  private programId: PublicKey;
  private payerKeypair: Keypair;

  constructor() {
    this.validateEnvironment();
    this.rpcUrl = `https://${process.env.RPC_ROOT}`;
    this.programId = new PublicKey(process.env.ZUVI_PROGRAM_ID!);
    this.payerKeypair = Keypair.fromSecretKey(bs58.decode(process.env.PAYER_KEYPAIR!));
    
    this.connection = new Connection(this.rpcUrl);
    this.payerWallet = new Wallet(this.payerKeypair);
    
    const provider = new AnchorProvider(this.connection, this.payerWallet, {
      commitment: 'confirmed',
    });
    
    this.program = new Program<Zuvi>(idl as any, provider);
  }

  private validateEnvironment(): void {
    const required = ['RPC_ROOT', 'ZUVI_PROGRAM_ID', 'PAYER_KEYPAIR'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`缺少環境變數: ${missing.join(', ')}`);
    }
  }

  getPlatformPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform')],
      this.programId
    );
  }

  getListingPDA(propertyId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), Buffer.from(propertyId)],
      this.programId
    );
  }

  getApplicationPDA(listing: PublicKey, applicant: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('application'), listing.toBuffer(), applicant.toBuffer()],
      this.programId
    );
  }

  getContractPDA(listing: PublicKey, tenant: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('contract'), listing.toBuffer(), tenant.toBuffer()],
      this.programId
    );
  }

  async executeTransaction(transaction: Transaction, userWallet: PublicKey): Promise<string> {
    try {
      transaction.feePayer = this.payerWallet.publicKey;
      
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payerKeypair],
        { commitment: 'confirmed' }
      );

      return signature;
    } catch (error) {
      console.error('交易執行失敗:', error);
      throw error;
    }
  }

  async getAccountData(pubkey: PublicKey): Promise<any> {
    try {
      const accountInfo = await this.connection.getAccountInfo(pubkey);
      if (!accountInfo) return null;
      
      try {
        return await this.program.account.propertyListing.fetch(pubkey);
      } catch {
        try {
          return await this.program.account.rentalApplication.fetch(pubkey);
        } catch {
          try {
            return await this.program.account.rentalContract.fetch(pubkey);
          } catch {
            return null;
          }
        }
      }
    } catch (error) {
      console.error('取得帳戶資料失敗:', error);
      return null;
    }
  }

  async getAllListings(): Promise<any[]> {
    try {
      const accounts = await this.program.account.propertyListing.all();
      return accounts.map(account => ({
        pubkey: account.publicKey.toString(),
        ...account.account
      }));
    } catch (error) {
      console.error('取得房源列表失敗:', error);
      return [];
    }
  }

  async getUserApplications(userPubkey: PublicKey): Promise<any[]> {
    try {
      const accounts = await this.program.account.rentalApplication.all();
      
      const userApplications = accounts.filter(account => 
        account.account.applicant.equals(userPubkey)
      );
      
      return userApplications.map(account => ({
        pubkey: account.publicKey.toString(),
        ...account.account
      }));
    } catch (error) {
      console.error('取得用戶申請失敗:', error);
      return [];
    }
  }

  async getUserContracts(userPubkey: PublicKey): Promise<any[]> {
    try {
      const accounts = await this.program.account.rentalContract.all();
      
      const userContracts = accounts.filter(account => 
        account.account.landlord.equals(userPubkey) || 
        account.account.tenant.equals(userPubkey)
      );
      
      return userContracts.map(account => ({
        pubkey: account.publicKey.toString(),
        ...account.account,
        userRole: account.account.landlord.equals(userPubkey) ? 'landlord' : 'tenant'
      }));
    } catch (error) {
      console.error('取得用戶合約失敗:', error);
      return [];
    }
  }
}

// 延遲初始化
let solanaServiceInstance: SolanaService | null = null;

export const getSolanaService = (): SolanaService => {
  if (!solanaServiceInstance) {
    solanaServiceInstance = new SolanaService();
  }
  return solanaServiceInstance;
};