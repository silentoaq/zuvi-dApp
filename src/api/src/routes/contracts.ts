import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { getSolanaService } from '../services/solana.js';
import { ipfsService, ContractDocumentData } from '../services/ipfs.js';

const router = Router();

router.get('/user/:userDid', async (req, res) => {
  try {
    const { userDid } = req.params;
    const userPubkey = new PublicKey(userDid);
    
    const solanaService = getSolanaService();
    const contracts = await solanaService.getUserContracts(userPubkey);

    const contractsWithDetails = await Promise.all(
      contracts.map(async (contract) => {
        let contractDocument = null;
        if (contract.contractHash) {
          try {
            contractDocument = await ipfsService.getData(contract.contractHash);
          } catch (error) {
            console.warn('無法取得合約文件:', contract.contractHash);
          }
        }

        return {
          ...contract,
          contractDocument,
          monthlyRent: contract.monthlyRent.toString(),
          depositAmount: contract.depositAmount.toString(),
          startDate: new Date(contract.startDate * 1000).toISOString(),
          endDate: new Date(contract.endDate * 1000).toISOString(),
          createdAt: new Date(contract.createdAt * 1000).toISOString()
        };
      })
    );

    res.json({
      success: true,
      data: contractsWithDetails
    });
  } catch (error) {
    console.error('取得用戶合約失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得用戶合約失敗' 
    });
  }
});

router.get('/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    const contractPubkey = new PublicKey(contractId);
    
    const solanaService = getSolanaService();
    const contractData = await solanaService.getAccountData(contractPubkey);
    if (!contractData) {
      return res.status(404).json({ 
        success: false, 
        error: '合約不存在' 
      });
    }

    let contractDocument = null;
    if (contractData.contractHash) {
      try {
        contractDocument = await ipfsService.getData(contractData.contractHash);
      } catch (error) {
        console.warn('無法取得合約文件:', contractData.contractHash);
      }
    }

    res.json({
      success: true,
      data: {
        pubkey: contractPubkey.toString(),
        ...contractData,
        contractDocument,
        monthlyRent: contractData.monthlyRent.toString(),
        depositAmount: contractData.depositAmount.toString(),
        startDate: new Date(contractData.startDate * 1000).toISOString(),
        endDate: new Date(contractData.endDate * 1000).toISOString(),
        createdAt: new Date(contractData.createdAt * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('取得合約失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得合約失敗' 
    });
  }
});

router.post('/prepare', async (req, res) => {
  try {
    const {
      listingId,
      applicationId,
      landlordDid,
      tenantDid,
      propertyId,
      monthlyRent,
      depositMonths,
      startDate,
      endDate,
      paymentDay,
      terms
    } = req.body;

    if (!listingId || !applicationId || !landlordDid || !tenantDid || !propertyId || 
        !monthlyRent || !depositMonths || !startDate || !endDate || !paymentDay) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const contractDocument: ContractDocumentData = {
      templateVersion: '1.0',
      landlordDid,
      tenantDid,
      propertyId,
      monthlyRent: parseInt(monthlyRent),
      depositAmount: parseInt(monthlyRent) * parseInt(depositMonths),
      startDate,
      endDate,
      paymentDay: parseInt(paymentDay),
      terms: terms || {},
      timestamp: Date.now()
    };

    const contractHash = await ipfsService.uploadContractDocument(contractDocument);

    const listingPubkey = new PublicKey(listingId);
    const tenantPubkey = new PublicKey(tenantDid);
    const solanaService = getSolanaService();
    const [contractPDA] = solanaService.getContractPDA(listingPubkey, tenantPubkey);
    const escrowPDA = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), contractPDA.toBuffer()],
      new PublicKey('2h2Gw1oK7zNHed7GBXFShqvJGzBaVkPEMB7EDRUcVdct')
    )[0];

    res.json({
      success: true,
      data: {
        contractHash,
        contractPDA: contractPDA.toString(),
        escrowPDA: escrowPDA.toString(),
        transactionData: {
          startDate: Math.floor(new Date(startDate).getTime() / 1000),
          endDate: Math.floor(new Date(endDate).getTime() / 1000),
          paymentDay: parseInt(paymentDay),
          contractHash
        }
      }
    });
  } catch (error) {
    console.error('準備創建合約失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備創建合約失敗' 
    });
  }
});

router.post('/:contractId/sign-and-pay/prepare', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { tenantDid } = req.body;

    if (!tenantDid) {
      return res.status(400).json({ error: '缺少租客 DID' });
    }

    const contractPubkey = new PublicKey(contractId);
    const solanaService = getSolanaService();
    const contractData = await solanaService.getAccountData(contractPubkey);

    if (!contractData) {
      return res.status(404).json({ error: '合約不存在' });
    }

    const [platformPDA] = solanaService.getPlatformPDA();

    res.json({
      success: true,
      data: {
        contractPDA: contractId,
        listingPDA: contractData.listing.toString(),
        escrowPDA: contractData.escrowAccount.toString(),
        platformPDA: platformPDA.toString(),
        transactionData: {
          totalAmount: (contractData.depositAmount + contractData.monthlyRent).toString()
        }
      }
    });
  } catch (error) {
    console.error('準備簽署合約失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備簽署合約失敗' 
    });
  }
});

router.post('/:contractId/pay-rent/prepare', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { tenantDid, paymentMonth } = req.body;

    if (!tenantDid || !paymentMonth) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const contractPubkey = new PublicKey(contractId);
    const solanaService = getSolanaService();
    const contractData = await solanaService.getAccountData(contractPubkey);

    if (!contractData) {
      return res.status(404).json({ error: '合約不存在' });
    }

    const [platformPDA] = solanaService.getPlatformPDA();

    res.json({
      success: true,
      data: {
        contractPDA: contractId,
        platformPDA: platformPDA.toString(),
        transactionData: {
          paymentMonth,
          amount: contractData.monthlyRent.toString()
        }
      }
    });
  } catch (error) {
    console.error('準備支付月租失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備支付月租失敗' 
    });
  }
});

router.post('/:contractId/terminate/prepare', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { userDid, reason } = req.body;

    if (!userDid || !reason) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const contractPubkey = new PublicKey(contractId);
    const solanaService = getSolanaService();
    const contractData = await solanaService.getAccountData(contractPubkey);

    if (!contractData) {
      return res.status(404).json({ error: '合約不存在' });
    }

    res.json({
      success: true,
      data: {
        contractPDA: contractId,
        listingPDA: contractData.listing.toString(),
        escrowPDA: contractData.escrowAccount.toString(),
        transactionData: {
          reason
        }
      }
    });
  } catch (error) {
    console.error('準備終止合約失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備終止合約失敗' 
    });
  }
});

export { router as contractsRoutes };