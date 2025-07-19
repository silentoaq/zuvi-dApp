import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { connection, ZUVI_PROGRAM_ID } from '../config/solana';
import { ipfsService, ContractDocumentData } from '../services/ipfs';

const router = Router();

// 取得用戶的所有合約
router.get('/user/:userDid', async (req, res) => {
  try {
    const { userDid } = req.params;
    const userPubkey = new PublicKey(userDid);
    
    // 取得所有合約帳戶
    const accounts = await connection.getProgramAccounts(ZUVI_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: 'LXQJBpEipH0' // RentalContract discriminator
          }
        }
      ]
    });

    const contracts = [];
    
    for (const account of accounts) {
      try {
        const contractData = JSON.parse(account.account.data.toString());
        
        // 檢查用戶是否是房東或租客
        if (contractData.landlord === userDid || contractData.tenant === userDid) {
          // 從 IPFS 取得合約文件
          let contractDocument = null;
          if (contractData.contractHash) {
            try {
              contractDocument = await ipfsService.getData(contractData.contractHash);
            } catch (error) {
              console.warn('無法取得合約文件:', contractData.contractHash);
            }
          }

          contracts.push({
            pubkey: account.pubkey.toString(),
            ...contractData,
            contractDocument,
            userRole: contractData.landlord === userDid ? 'landlord' : 'tenant'
          });
        }
      } catch (error) {
        console.warn('解析合約資料失敗:', error);
      }
    }

    res.json({
      success: true,
      data: contracts
    });
  } catch (error) {
    console.error('取得用戶合約失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得用戶合約失敗' 
    });
  }
});

// 取得單一合約
router.get('/:contractId', async (req, res) => {
  try {
    const { contractId } = req.params;
    const contractPubkey = new PublicKey(contractId);
    
    const accountInfo = await connection.getAccountInfo(contractPubkey);
    if (!accountInfo) {
      return res.status(404).json({ 
        success: false, 
        error: '合約不存在' 
      });
    }

    const contractData = JSON.parse(accountInfo.data.toString());
    
    // 從 IPFS 取得合約文件
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
        contractDocument
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

// 創建合約
router.post('/', async (req, res) => {
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

    // 準備合約文件資料
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

    // 上傳合約文件到 IPFS
    const contractHash = await ipfsService.uploadContractDocument(contractDocument);

    // 計算合約 PDA
    const listingPubkey = new PublicKey(listingId);
    const tenantPubkey = new PublicKey(tenantDid);
    const [contractPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('contract'), listingPubkey.toBuffer(), tenantPubkey.toBuffer()],
      ZUVI_PROGRAM_ID
    );

    // 計算託管帳戶 PDA
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), contractPDA.toBuffer()],
      ZUVI_PROGRAM_ID
    );

    res.json({
      success: true,
      data: {
        contractHash,
        contractPDA: contractPDA.toString(),
        escrowPDA: escrowPDA.toString(),
        transactionData: {
          startDate: new Date(startDate).getTime() / 1000,
          endDate: new Date(endDate).getTime() / 1000,
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

// 簽署合約並支付
router.post('/:contractId/sign-and-pay', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { tenantDid } = req.body;

    if (!tenantDid) {
      return res.status(400).json({ error: '缺少租客 DID' });
    }

    const contractPubkey = new PublicKey(contractId);
    
    // 取得合約資料
    const contractAccount = await connection.getAccountInfo(contractPubkey);
    if (!contractAccount) {
      return res.status(404).json({ error: '合約不存在' });
    }

    const contractData = JSON.parse(contractAccount.data.toString());

    res.json({
      success: true,
      data: {
        contractPDA: contractId,
        listingPDA: contractData.listing,
        escrowPDA: contractData.escrowAccount,
        transactionData: {
          totalAmount: contractData.depositAmount + contractData.monthlyRent
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

// 支付月租
router.post('/:contractId/pay-rent', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { tenantDid, paymentMonth } = req.body;

    if (!tenantDid || !paymentMonth) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const contractPubkey = new PublicKey(contractId);

    res.json({
      success: true,
      data: {
        contractPDA: contractId,
        transactionData: {
          paymentMonth
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

// 終止合約
router.post('/:contractId/terminate', async (req, res) => {
  try {
    const { contractId } = req.params;
    const { userDid, reason } = req.body;

    if (!userDid || !reason) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const contractPubkey = new PublicKey(contractId);

    res.json({
      success: true,
      data: {
        contractPDA: contractId,
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