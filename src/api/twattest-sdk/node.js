export class TwattestVerifier {
    constructor(config) {
        this.baseUrl = config.baseUrl || 'https://twattest.ddns.net/api';
        this.apiSecret = config.apiSecret;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiSecret}`,
        };
        // 安全地合併 headers
        if (options.headers) {
            const optionHeaders = options.headers instanceof Headers
                ? Object.fromEntries(options.headers.entries())
                : options.headers;
            Object.assign(headers, optionHeaders);
        }
        const response = await fetch(url, {
            ...options,
            headers,
        });
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    async verifyVPToken(vpToken) {
        try {
            // 這裡整合現有的 verifySDJWT 邏輯
            const result = await this.request('/verify/vp-token', {
                method: 'POST',
                body: JSON.stringify({ vp_token: vpToken }),
            });
            return {
                isValid: result.success || false,
                holderDid: result.holderDid || '',
                credentialId: result.credentialId || '',
                issuerDid: result.issuerDid || '',
                verificationTimestamp: Date.now(),
                error: result.error
            };
        }
        catch (error) {
            return {
                isValid: false,
                holderDid: '',
                credentialId: '',
                issuerDid: '',
                verificationTimestamp: Date.now(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async extractCredentialData(vpToken, schema) {
        try {
            const result = await this.request('/verify/extract-data', {
                method: 'POST',
                body: JSON.stringify({
                    vp_token: vpToken,
                    schema
                }),
            });
            return {
                fields: result.fields || {},
                attestationRef: result.attestationRef || '',
                credentialId: result.credentialId || '',
                verificationTimestamp: Date.now()
            };
        }
        catch (error) {
            throw new Error(`Data extraction failed: ${error}`);
        }
    }
    async getAttestationStatus(holderDid) {
        return this.request(`/attestation/status/${holderDid}`);
    }
    async checkUserPermissions(holderDid) {
        return this.request(`/sdk/permissions/${holderDid}`);
    }
}
//# sourceMappingURL=node.js.map