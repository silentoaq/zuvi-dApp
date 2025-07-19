import { Router } from 'express';
import { PublicKey } from '@solana/web3.js';
import { getSolanaService } from '../services/solana.js';
import { ipfsService, PropertyDetailsData } from '../services/ipfs.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    const solanaService = getSolanaService();
    const listings = await solanaService.getAllListings();
    
    const filteredListings = status ? 
      listings.filter(listing => listing.status.hasOwnProperty(status.toString().toLowerCase())) :
      listings;

    const listingsWithDetails = await Promise.all(
      filteredListings.map(async (listing) => {
        let propertyDetails = null;
        if (listing.propertyDetailsHash) {
          try {
            propertyDetails = await ipfsService.getData(listing.propertyDetailsHash);
          } catch (error) {
            console.warn('無法取得房源詳細資料:', listing.propertyDetailsHash);
          }
        }
        
        return {
          ...listing,
          propertyDetails,
          monthlyRent: listing.monthlyRent.toString(),
          createdAt: new Date(listing.createdAt * 1000).toISOString()
        };
      })
    );

    res.json({
      success: true,
      data: listingsWithDetails
    });
  } catch (error) {
    console.error('取得房源列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得房源列表失敗' 
    });
  }
});

router.get('/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const solanaService = getSolanaService();
    const [listingPDA] = solanaService.getListingPDA(propertyId);
    const listingData = await solanaService.getAccountData(listingPDA);
    
    if (!listingData) {
      return res.status(404).json({ 
        success: false, 
        error: '房源不存在' 
      });
    }

    let propertyDetails = null;
    if (listingData.propertyDetailsHash) {
      try {
        propertyDetails = await ipfsService.getData(listingData.propertyDetailsHash);
      } catch (error) {
        console.warn('無法取得房源詳細資料:', listingData.propertyDetailsHash);
      }
    }

    res.json({
      success: true,
      data: {
        pubkey: listingPDA.toString(),
        ...listingData,
        propertyDetails,
        monthlyRent: listingData.monthlyRent.toString(),
        createdAt: new Date(listingData.createdAt * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('取得房源失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得房源失敗' 
    });
  }
});

router.post('/prepare', async (req, res) => {
  try {
    const {
      propertyId,
      ownerDid,
      ownerAttestation,
      monthlyRent,
      depositMonths,
      propertyDetails
    } = req.body;

    if (!propertyId || !ownerDid || !ownerAttestation || !monthlyRent || !depositMonths || !propertyDetails) {
      return res.status(400).json({ error: '缺少必要欄位' });
    }

    const propertyDetailsHash = await ipfsService.uploadPropertyDetails(propertyDetails as PropertyDetailsData);

    const solanaService = getSolanaService();
    const [listingPDA] = solanaService.getListingPDA(propertyId);
    const [platformPDA] = solanaService.getPlatformPDA();
    
    res.json({
      success: true,
      data: {
        propertyDetailsHash,
        listingPDA: listingPDA.toString(),
        platformPDA: platformPDA.toString(),
        transactionData: {
          propertyId,
          ownerAttestation,
          monthlyRent: parseInt(monthlyRent),
          depositMonths: parseInt(depositMonths),
          propertyDetailsHash
        }
      }
    });
  } catch (error) {
    console.error('準備房源發布失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備房源發布失敗' 
    });
  }
});

router.post('/:propertyId/delist', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { ownerDid } = req.body;

    if (!ownerDid) {
      return res.status(400).json({ error: '缺少擁有者 DID' });
    }

    const solanaService = getSolanaService();
    const [listingPDA] = solanaService.getListingPDA(propertyId);
    
    res.json({
      success: true,
      data: {
        listingPDA: listingPDA.toString(),
        transactionData: {
          propertyId
        }
      }
    });
  } catch (error) {
    console.error('準備下架房源失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '準備下架房源失敗' 
    });
  }
});

router.get('/:propertyId/applications', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const solanaService = getSolanaService();
    const [listingPDA] = solanaService.getListingPDA(propertyId);
    
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('取得申請列表失敗:', error);
    res.status(500).json({ 
      success: false, 
      error: '取得申請列表失敗' 
    });
  }
});

export { router as listingsRoutes };