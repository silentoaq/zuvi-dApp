export interface TwattestSDKConfig {
    baseUrl?: string;
    apiKey?: string;
}
export interface UserPermissions {
    hasCitizenCredential: boolean;
    hasPropertyCredential: boolean;
    propertyCount: number;
}
export interface DataRequestConfig {
    credentialType: 'CitizenCredential' | 'PropertyCredential';
    requiredFields: string[];
    purpose: string;
    dappDomain: string;
}
export interface DataRequestSession {
    requestId: string;
    vpRequestUri: string;
    expiresIn: number;
}
export interface TwfidoAttestation {
    exists: boolean;
    address: string;
    data: {
        merkleRoot: string;
        credentialReference: string;
    } | null;
    expiry: number | null;
}
export interface TwlandAttestation {
    exists: boolean;
    attestations: Array<{
        address: string;
        data: {
            merkleRoot: string;
            credentialReference: string;
        };
        expiry: number;
    }>;
    count: number;
}
export interface AttestationStatus {
    twfido?: TwfidoAttestation;
    twland?: TwlandAttestation;
}
export declare class TwattestSDK {
    private baseUrl;
    private apiKey?;
    constructor(config?: TwattestSDKConfig);
    private request;
    checkPermissions(userDid: string): Promise<UserPermissions>;
    getAttestationStatus(userDid: string): Promise<AttestationStatus>;
    requestData(config: DataRequestConfig): Promise<DataRequestSession>;
    generateQRCode(vpRequestUri: string): Promise<string>;
}
//# sourceMappingURL=web.d.ts.map