import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Zuvi } from '../types/zuvi';

// Solana 配置
export const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
export const RPC_URL = process.env.RPC_URL || clusterApiUrl(SOLANA_NETWORK as any);

// Zuvi 程式 ID
export const ZUVI_PROGRAM_ID = new PublicKey('2h2Gw1oK7zNHed7GBXFShqvJGzBaVkPEMB7EDRUcVdct');

// USDC Mint (Devnet)
export const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

// Solana 連接
export const connection = new Connection(RPC_URL);

// 取得 Zuvi 程式實例
export const getZuviProgram = (wallet: Wallet): Program<Zuvi> => {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  
  // 這裡會用到 zuvi.json IDL
  const idl = require('../../../types/zuvi.json');
  return new Program<Zuvi>(idl, ZUVI_PROGRAM_ID, provider);
};

// 平台 PDA
export const getPlatformPDA = (): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('platform')],
    ZUVI_PROGRAM_ID
  );
};

// 房源 PDA
export const getListingPDA = (propertyId: string): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('listing'), Buffer.from(propertyId)],
    ZUVI_PROGRAM_ID
  );
};

// 申請 PDA
export const getApplicationPDA = (listing: PublicKey, applicant: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('application'), listing.toBuffer(), applicant.toBuffer()],
    ZUVI_PROGRAM_ID
  );
};