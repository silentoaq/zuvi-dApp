import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Key, Hash, FileDigit, Building , Plus, Eye, EyeOff } from 'lucide-react';
import { CreateListingModal } from '@/components/CreateListingModal';
import { toast } from 'sonner';

export const ListingsPage: React.FC = () => {
    const { attestationStatus } = useAuth();
    const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
    const [selectedAttestation, setSelectedAttestation] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleExpand = (fieldId: string) => {
        setExpandedFields(prev => {
            const newSet = new Set(prev);
            if (newSet.has(fieldId)) {
                newSet.delete(fieldId);
            } else {
                newSet.add(fieldId);
            }
            return newSet;
        });
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const truncate = (str: string, length: number = 8) => {
        if (str.length <= length) return str;
        return `${str.slice(0, length)}...${str.slice(-4)}`;
    };

    const handleCreateListing = (attestation: any) => {
        // 檢查憑證是否過期
        const now = Math.floor(Date.now() / 1000);
        if (attestation.expiry < now) {
            toast.error('此憑證已過期，請重新申請');
            return;
        }

        setSelectedAttestation(attestation);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedAttestation(null);
    };

    const handleListingSuccess = () => {
        toast.success('房源發布成功！');
        // 這裡可以重新載入用戶的房源列表或導航到其他頁面
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    發布管理
                </h1>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <div className="ml-3">
                            <p className="text-sm text-green-800 dark:text-green-200">
                                您擁有 <span className="font-semibold">{attestationStatus?.twland?.count || 0}</span> 個產權憑證
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Building className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            我的產權憑證
                        </h2>
                        {attestationStatus?.twland?.attestations && attestationStatus.twland.attestations.length > 0 && (
                            <button
                                onClick={() => {
                                    if (expandedFields.size > 0) {
                                        setExpandedFields(new Set());
                                    } else {
                                        const allFields = new Set<string>();
                                        attestationStatus.twland?.attestations.forEach((_, index) => {
                                            allFields.add(`address-${index}`);
                                            allFields.add(`merkle-${index}`);
                                            allFields.add(`ref-${index}`);
                                        });
                                        setExpandedFields(allFields);
                                    }
                                }}
                                className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                {expandedFields.size > 0 ? (
                                    <>
                                        <EyeOff className="w-4 h-4" />
                                        <span>收合全部</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        <span>展開全部</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {attestationStatus?.twland?.attestations && attestationStatus.twland.attestations.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {attestationStatus.twland.attestations.map((attestation, index) => (
                                <div 
                                    key={index} 
                                    className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-600"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-2">
                                            <Key className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">憑證地址</p>
                                                    <button
                                                        onClick={() => toggleExpand(`address-${index}`)}
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        {expandedFields.has(`address-${index}`) ? 
                                                            <EyeOff className="w-3 h-3" /> :
                                                            <Eye className="w-3 h-3" />
                                                        }
                                                    </button>
                                                </div>
                                                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                                                    {expandedFields.has(`address-${index}`)
                                                        ? attestation.address
                                                        : truncate(attestation.address)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-2">
                                            <Hash className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Merkle Root</p>
                                                    <button
                                                        onClick={() => toggleExpand(`merkle-${index}`)}
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        {expandedFields.has(`merkle-${index}`) ? 
                                                            <EyeOff className="w-3 h-3" /> :
                                                            <Eye className="w-3 h-3" />
                                                        }
                                                    </button>
                                                </div>
                                                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                                                    {expandedFields.has(`merkle-${index}`)
                                                        ? attestation.data.merkleRoot
                                                        : truncate(attestation.data.merkleRoot)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-2">
                                            <FileDigit className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">憑證參考</p>
                                                    <button
                                                        onClick={() => toggleExpand(`ref-${index}`)}
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        {expandedFields.has(`ref-${index}`) ? 
                                                            <EyeOff className="w-3 h-3" /> :
                                                            <Eye className="w-3 h-3" />
                                                        }
                                                    </button>
                                                </div>
                                                <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                                                    {expandedFields.has(`ref-${index}`)
                                                        ? attestation.data.credentialReference
                                                        : truncate(attestation.data.credentialReference, 12)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-2">
                                            <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">有效期限</p>
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {formatDate(attestation.expiry)}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleCreateListing(attestation)}
                                            className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors group-hover:shadow-md"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>使用此憑證發布房源</span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-not-allowed opacity-50">
                                <div className="text-center">
                                    <Plus className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                        需要更多產權憑證
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        請先到 twland 申請
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <FileDigit className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-4 text-gray-600 dark:text-gray-400">
                                未偵測到產權憑證
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                                請確保您已在 twland 完成房產憑證申請
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 發布房源 Modal */}
            {selectedAttestation && (
                <CreateListingModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    attestation={selectedAttestation}
                    onSuccess={handleListingSuccess}
                />
            )}
        </div>
    );
};