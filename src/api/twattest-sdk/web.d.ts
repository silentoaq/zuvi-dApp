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
export declare class TwattestSDK {
    private baseUrl;
    private apiKey?;
    constructor(config?: TwattestSDKConfig);
    private request;
    checkPermissions(userDid: string): Promise<UserPermissions>;
    requestData(config: DataRequestConfig): Promise<DataRequestSession>;
    generateQRCode(vpRequestUri: string): Promise<string>;
}
//# sourceMappingURL=web.d.ts.map