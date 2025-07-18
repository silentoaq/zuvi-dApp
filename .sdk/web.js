import QRCode from 'qrcode';
export class TwattestSDK {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || 'https://twattest.ddns.net/api';
        this.apiKey = config.apiKey;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
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
    async checkPermissions(userDid) {
        return this.request(`/sdk/permissions/${userDid}`);
    }
    async requestData(config) {
        return this.request('/sdk/data-request', {
            method: 'POST',
            body: JSON.stringify(config),
        });
    }
    async generateQRCode(vpRequestUri) {
        try {
            return await QRCode.toDataURL(vpRequestUri, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        }
        catch (error) {
            throw new Error(`QR code generation failed: ${error}`);
        }
    }
}
//# sourceMappingURL=web.js.map