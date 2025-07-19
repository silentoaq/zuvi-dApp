import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Zuvi } from '../types/zuvi';
import idl from '../../../target/idl/zuvi.json';
import bs58 from 'bs58';

// 檢查環境變數
if (!process.env.RPC_ROOT) {
  throw new Error('RPC_ROOT 環境變數未設置');
}
if (!process.env.ZUVI_PROGRAM_ID) {
  throw new Error('ZUVI_PROGRAM_ID 環境變數未設置');
}
if (!process.env.PAYER_KEYPAIR) {
  throw new Error('PAYER_KEYPAIR 環境變數未設置');
}

// Solana 連接配置
const RPC_URL = `https://${process.env.RPC_ROOT}`;
const ZUVI_PROGRAM_ID = new PublicKey(process.env.ZUVI_PROGRAM_ID);

// 代付錢包（從環境變數載入）
const PAYER_KEYPAIR = Keypair.fromSecretKey(bs58.decode(process.env.PAYER_KEYPAIR));

export class SolanaService {
  public connection: Connection;
  private program: Program<Zuvi>;
  private payerWallet: Wallet;

  constructor() {
    this.connection = new Connection(RPC_URL);
    this.payerWallet = new Wallet(PAYER_KEYPAIR);
    
    const provider = new AnchorProvider(this.connection, this.payerWallet, {
      commitment: 'confirmed',
    });
    
    this.program = new Program<Zuvi>(idl as any, provider);
  }

  // 取得平台 PDA
  getPlatformPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('platform')],
      ZUVI_PROGRAM_ID
    );
  }

  // 取得房源 PDA
  getListingPDA(propertyId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), Buffer.from(propertyId)],
      ZUVI_PROGRAM_ID
    );
  }

  // 取得申請 PDA
  getApplicationPDA(listing: PublicKey, applicant: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('application'), listing.toBuffer(), applicant.toBuffer()],
      ZUVI_PROGRAM_ID
    );
  }

  // 取得合約 PDA
  getContractPDA(listing: PublicKey, tenant: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('contract'), listing.toBuffer(), tenant.toBuffer()],
      ZUVI_PROGRAM_ID
    );
  }

  // 代付交易
  async executeTransaction(transaction: Transaction, userWallet: PublicKey): Promise<string> {
    try {
      // 設置代付者
      transaction.feePayer = this.payerWallet.publicKey;
      
      // 取得最新區塊雜湊
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // 簽名並發送交易
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [PAYER_KEYPAIR],
        { commitment: 'confirmed' }
      );

      return signature;
    } catch (error) {
      console.error('交易執行失敗:', error);
      throw error;
    }
  }

  // 取得帳戶資料
  async getAccountData(pubkey: PublicKey): Promise<any> {
    try {
      const accountInfo = await this.connection.getAccountInfo(pubkey);
      if (!accountInfo) return null;
      
      // 使用 program.account 直接取得解析後的資料
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

  // 取得所有房源
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

  // 取得用戶申請
  async getUserApplications(userPubkey: PublicKey): Promise<any[]> {
    try {
      const accounts = await this.program.account.rentalApplication.all();
      
      // 過濾出用戶相關的申請
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

  // 取得用戶合約
  async getUserContracts(userPubkey: PublicKey): Promise<any[]> {
    try {
      const accounts = await this.program.account.rentalContract.all();
      
      // 過濾出用戶相關的合約
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

export const solanaService = new SolanaService();