import type { AttestationStatus, UserPermissions } from './web.js';
export interface TwattestVerifierConfig {
    baseUrl?: string;
    apiSecret: string;
}
export interface VerificationResult {
    isValid: boolean;
    holderDid: string;
    credentialId: string;
    issuerDid: string;
    verificationTimestamp: number;
    error?: string;
}
export interface ExtractedData {
    fields: Record<string, any>;
    attestationRef: string;
    credentialId: string;
    verificationTimestamp: number;
}
export interface DataSchema {
    [fieldName: string]: 'string' | 'number' | 'boolean' | 'object';
}
export declare class TwattestVerifier {
    private baseUrl;
    private apiSecret;
    constructor(config: TwattestVerifierConfig);
    private request;
    verifyVPToken(vpToken: string): Promise<VerificationResult>;
    extractCredentialData(vpToken: string, schema: DataSchema): Promise<ExtractedData>;
    getAttestationStatus(holderDid: string): Promise<AttestationStatus>;
    checkUserPermissions(holderDid: string): Promise<UserPermissions>;
}
//# sourceMappingURL=node.d.ts.map