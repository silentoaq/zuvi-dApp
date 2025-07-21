import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TwattestSDK } from '../../twattest-sdk/web.js';
import { apiService } from '@/services/api';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 

  CheckCircle, 
  AlertCircle, 
  Home,
  Key,
  FileText,
  Shield,
  Smartphone,
  Clock,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const listingSchema = z.object({
  monthlyRent: z.string().min(1, '請輸入月租金'),
  depositMonths: z.string().min(1, '請輸入押金月數'),
  title: z.string().min(5, '標題至少5個字'),
  description: z.string().min(20, '描述至少20個字'),
  features: z.string().optional(),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  attestation: {
    address: string;
    data: {
      merkleRoot: string;
      credentialReference: string;
    };
    expiry: number;
  };
  onSuccess?: () => void;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  attestation,
  onSuccess
}) => {
  const { publicKey } = useWallet();
  const [step, setStep] = useState<'qr' | 'form' | 'confirm'>('qr');
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [vpRequestUri, setVpRequestUri] = useState<string>('');
  const [propertyData, setPropertyData] = useState<any>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [copied, setCopied] = useState(false);
  
  const userDid = publicKey?.toString() || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema)
  });

  const twattestSDK = new TwattestSDK({
    baseUrl: 'https://twattest.ddns.net/api'
  });

  const cleanup = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setQrCodeUrl('');
    setVpRequestUri('');
    setPropertyData(null);
    setStep('qr');
    setCopied(false);
    reset();
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(vpRequestUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('複製失敗');
    }
  };

  // 產生 QR Code 並開始授權流程
  const startAuthorizationFlow = async () => {
    if (!userDid) {
      toast.error('請先連接錢包');
      return;
    }

    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    setLoading(true);
    try {
      const dataRequest = await twattestSDK.requestData({
        credentialType: 'PropertyCredential',
        requiredFields: ['address', 'building_area', 'use', 'ownership_type'],
        purpose: '發布房源到 Zuvi 平台',
        dappDomain: 'zuvi.ddns.net'
      });

      setVpRequestUri(dataRequest.vpRequestUri);

      const qrCode = await twattestSDK.generateQRCode(dataRequest.vpRequestUri);
      setQrCodeUrl(qrCode);

      startPolling(dataRequest.requestId);
    } catch (error) {
      console.error('啟動授權流程失敗:', error);
      toast.error('無法產生 QR Code，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 輪詢檢查授權狀態
  const startPolling = (requestId: string) => {
    let attemptCount = 0;
    const maxAttempts = 100; // 5分鐘 (3秒 * 100 = 300秒)
    
    const interval = setInterval(async () => {
      attemptCount++;
      
      if (attemptCount > maxAttempts) {
        clearInterval(interval);
        setPollingInterval(null);
        toast.error('請求已過期，請重新開始');
        return;
      }
      
      try {
        const response = await fetch(`https://twattest.ddns.net/api/sdk/data-request/${requestId}`);
        
        if (response.status === 404) {
          clearInterval(interval);
          setPollingInterval(null);
          toast.error('請求不存在或已過期');
          return;
        }
        
        if (!response.ok) {
          console.error('Polling error:', response.status);
          return;
        }
        
        const result = await response.json();

        if (result.status === 'completed' && result.data) {
          clearInterval(interval);
          setPollingInterval(null);
          setPropertyData(result.data);
          setStep('form');
          toast.success('房產資料授權成功');
        } else if (result.status === 'expired' || result.status === 'rejected') {
          clearInterval(interval);
          setPollingInterval(null);
          toast.error('授權已過期或被拒絕，請重試');
        }
      } catch (error) {
        console.error('檢查授權狀態失敗:', error);
        clearInterval(interval);
        setPollingInterval(null);
        toast.error('網路錯誤，請重試');
      }
    }, 3000);

    setPollingInterval(interval);
  };

  // 提交房源資料
  const onSubmit = async (formData: ListingFormData) => {
    if (!propertyData || !userDid) {
      toast.error('缺少必要資料');
      return;
    }

    setLoading(true);
    try {
      const propertyDetails = {
        title: formData.title,
        description: formData.description,
        features: formData.features?.split(',').map((f: string) => f.trim()).filter(Boolean) || [],
        address: propertyData.fields.address,
        buildingArea: propertyData.fields.building_area,
        propertyUse: propertyData.fields.use,
        ownershipType: propertyData.fields.ownership_type,
        images: [],
      };

      const response = await apiService.prepareListProperty({
        propertyId: propertyData.credentialId,
        ownerDid: userDid,
        ownerAttestation: attestation.address,
        monthlyRent: parseInt(formData.monthlyRent) * 1000000,
        depositMonths: parseInt(formData.depositMonths),
        propertyDetails
      });

      if (response.success) {
        setStep('confirm');
        toast.success('房源資料準備完成');
      } else {
        throw new Error(response.error || '準備發布失敗');
      }
    } catch (error) {
      console.error('提交房源失敗:', error);
      toast.error('提交房源失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 組件掛載時自動開始授權流程
  useEffect(() => {
    if (isOpen && step === 'qr' && !qrCodeUrl && !loading) {
      startAuthorizationFlow();
    }
  }, [isOpen, step]);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const renderStepIndicator = () => {
    const steps = [
      { id: 'qr', label: '身份驗證', icon: Shield },
      { id: 'form', label: '填寫資訊', icon: FileText },
      { id: 'confirm', label: '確認發布', icon: CheckCircle }
    ];

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <div className={`flex flex-col items-center ${
              step === s.id ? 'text-blue-600 dark:text-blue-400' : 
              steps.findIndex(st => st.id === step) > index ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step === s.id ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30' :
                steps.findIndex(st => st.id === step) > index ? 'border-green-600 bg-green-50 dark:border-green-400 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-600'
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs mt-1 font-medium">{s.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 transition-all ${
                steps.findIndex(st => st.id === step) > index ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] bg-white dark:bg-gray-800">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            發布新房源
          </DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        {/* QR Code 步驟 */}
        {step === 'qr' && (
          <div className="space-y-4">
            {/* 憑證資訊 */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <Key className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    選擇的產權憑證
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono break-all">
                    {attestation.data.credentialReference}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">正在產生驗證請求...</p>
              </div>
            ) : qrCodeUrl ? (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="text-center">
                  <div className="inline-flex p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <img src={qrCodeUrl} alt="QR Code" className="w-56 h-56" />
                  </div>
                </div>

                {/* 使用說明 */}
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4" />
                    <span>使用 walletbz 掃描</span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>5 分鐘內有效</span>
                  </div>
                </div>

                {/* VP Request URI */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">VP Request URI</span>
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-all ${
                        copied 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>已複製</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>複製</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                    {vpRequestUri}
                  </p>
                </div>

                {/* 注意事項 */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        請注意以下事項：
                      </p>
                      <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                        <li>請在 walletbz 中選擇與上方顯示相同的憑證</li>
                        <li>確認憑證持有人 DID 與當前錢包地址一致</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-800 dark:text-red-200">
                    無法產生 QR Code，請稍後再試
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 表單步驟 */}
        {step === 'form' && propertyData && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 顯示授權的房產資料 */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3">
                <Home className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    已取得房產資訊
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-green-800 dark:text-green-200">
                    <div>
                      <span className="font-medium">地址：</span>
                      {propertyData.fields.address}
                    </div>
                    <div>
                      <span className="font-medium">面積：</span>
                      {propertyData.fields.building_area}
                    </div>
                    <div>
                      <span className="font-medium">用途：</span>
                      {propertyData.fields.use}
                    </div>
                    <div>
                      <span className="font-medium">類型：</span>
                      {propertyData.fields.ownership_type}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {/* 房源標題 */}
              <div className="space-y-2">
                <Label htmlFor="title">房源標題</Label>
                <Input
                  id="title"
                  placeholder="例：市中心溫馨兩房一廳"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                )}
              </div>

              {/* 房源描述 */}
              <div className="space-y-2">
                <Label htmlFor="description">房源描述</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="詳細描述房源特色、周邊環境、交通等..."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 月租金 */}
                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">月租金 (USDC)</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    placeholder="例：500"
                    {...register('monthlyRent')}
                  />
                  {errors.monthlyRent && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.monthlyRent.message}</p>
                  )}
                </div>

                {/* 押金月數 */}
                <div className="space-y-2">
                  <Label htmlFor="depositMonths">押金月數</Label>
                  <Input
                    id="depositMonths"
                    type="number"
                    placeholder="例：2"
                    {...register('depositMonths')}
                  />
                  {errors.depositMonths && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.depositMonths.message}</p>
                  )}
                </div>
              </div>

              {/* 房源特色 */}
              <div className="space-y-2">
                <Label htmlFor="features">房源特色 (選填，逗號分隔)</Label>
                <Input
                  id="features"
                  placeholder="例：近捷運站, 有陽台, 可養寵物"
                  {...register('features')}
                />
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('qr')}
                disabled={loading}
              >
                上一步
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                提交房源
              </Button>
            </div>
          </form>
        )}

        {/* 確認步驟 */}
        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                房源資料準備完成！
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                請在錢包中確認交易以完成發布
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    發布費用將從您的錢包扣除，請確保有足夠的 USDC 餘額
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => {
                handleClose();
                onSuccess?.();
              }} size="lg">
                完成
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};