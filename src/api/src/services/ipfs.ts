import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY || 'adc765fc063c1d078a8c';
const PINATA_SECRET = process.env.PINATA_SECRET || '6f7e5857e09991efa28940459460f076766a9d1501cdb994ff5b11d7ec1a7f5c';
const PINATA_JWT = process.env.PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjYzM2YmY1My00NTE1LTQ5NmQtYjkzYy1mNzMxY2U3MGU2MmYiLCJlbWFpbCI6IjExMTEwMTA5QGdtLmNoaWhsZWUuZWR1LnR3IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImFkYzc2NWZjMDYzYzFkMDc4YThjIiwic2NvcGVkS2V5U2VjcmV0IjoiNmY3ZTU4NTdlMDk5OTFlZmEyODk0MDQ1OTQ2MGYwNzY3NjZhOWQxNTAxY2RiOTk0ZmY1YjExZDdlYzFhN2Y1YyIsImV4cCI6MTc4NDQyNTY4M30.hB7UQBCSPskUJTXpzVCJAdJkE1MmU5NNTuqtr7CZEIk';
const GATEWAY_URL = 'https://indigo-definite-coyote-168.mypinata.cloud';

export interface PropertyDetailsData {
  title: string;
  description: string;
  address: string;
  area: number;
  rooms: number;
  amenities: string[];
  rules: string[];
  images: string[];
  contact?: {
    phone?: string;
    email?: string;
  };
}

export interface ContractDocumentData {
  templateVersion: string;
  landlordDid: string;
  tenantDid: string;
  propertyId: string;
  monthlyRent: number;
  depositAmount: number;
  startDate: string;
  endDate: string;
  paymentDay: number;
  terms: Record<string, any>;
  timestamp: number;
}

class IPFSService {
  private pinataAxios = axios.create({
    baseURL: 'https://api.pinata.cloud',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json'
    }
  });

  // 上傳 JSON 資料到 IPFS
  async uploadJSON(data: any, name: string): Promise<string> {
    try {
      const response = await this.pinataAxios.post('/pinning/pinJSONToIPFS', {
        pinataContent: data,
        pinataMetadata: {
          name: name,
          keyvalues: {
            type: 'zuvi-data',
            timestamp: Date.now().toString()
          }
        }
      });

      return response.data.IpfsHash;
    } catch (error) {
      console.error('IPFS 上傳失敗:', error);
      throw new Error('IPFS 上傳失敗');
    }
  }

  // 上傳檔案到 IPFS
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: mimeType });
      formData.append('file', blob, fileName);
      formData.append('pinataMetadata', JSON.stringify({
        name: fileName,
        keyvalues: {
          type: 'zuvi-file',
          timestamp: Date.now().toString()
        }
      }));

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Authorization': `Bearer ${PINATA_JWT}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data.IpfsHash;
    } catch (error) {
      console.error('檔案上傳失敗:', error);
      throw new Error('檔案上傳失敗');
    }
  }

  // 從 IPFS 取得資料
  async getData(hash: string): Promise<any> {
    try {
      const response = await axios.get(`${GATEWAY_URL}/ipfs/${hash}`);
      return response.data;
    } catch (error) {
      console.error('IPFS 資料取得失敗:', error);
      throw new Error('IPFS 資料取得失敗');
    }
  }

  // 取得檔案 URL
  getFileUrl(hash: string): string {
    return `${GATEWAY_URL}/ipfs/${hash}`;
  }

  // 上傳房源詳細資料
  async uploadPropertyDetails(data: PropertyDetailsData): Promise<string> {
    return this.uploadJSON(data, `property-${Date.now()}`);
  }

  // 上傳合約文件
  async uploadContractDocument(data: ContractDocumentData): Promise<string> {
    return this.uploadJSON(data, `contract-${data.propertyId}-${Date.now()}`);
  }
}

export const ipfsService = new IPFSService();