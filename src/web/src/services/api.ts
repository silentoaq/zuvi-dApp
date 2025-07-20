const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:3002/api'
    : '/api';

export const apiService = {
    async getListings(status?: string) {
        const params = status ? `?status=${status}` : '';
        const res = await fetch(`${API_BASE_URL}/listings${params}`);
        return res.json();
    },

    async getPropertyDetails(propertyId: string) {
        const res = await fetch(`${API_BASE_URL}/listings/${propertyId}`);
        return res.json();
    },

    async getUserApplications(userDid: string) {
        const res = await fetch(`${API_BASE_URL}/applications/user/${userDid}`);
        return res.json();
    },

    async getUserContracts(userDid: string) {
        const res = await fetch(`${API_BASE_URL}/contracts/user/${userDid}`);
        return res.json();
    },
    
    async getUserListings(ownerDid: string) {
        const res = await fetch(`${API_BASE_URL}/listings?owner=${ownerDid}`);
        return res.json();
    },

    async prepareListProperty(data: {
        propertyId: string;
        ownerDid: string;
        ownerAttestation: string;
        monthlyRent: number;
        depositMonths: number;
        propertyDetails: any;
    }) {
        const res = await fetch(`${API_BASE_URL}/listings/prepare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    }


};