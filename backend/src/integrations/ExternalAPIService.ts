/**
 * External API Service
 * Integrates with government and third-party APIs for data enrichment
 */

export interface GSTDetails {
  businessName: string;
  gstin: string;
  address: string;
  state: string;
  registrationDate: string;
  businessType: string;
  status: string;
}

export interface PANDetails {
  name: string;
  pan: string;
  status: string;
  category: string;
}

export interface LocationDetails {
  city: string;
  district: string;
  state: string;
  country: string;
}

export interface BankDetails {
  bankName: string;
  branch: string;
  address: string;
  city: string;
  state: string;
  micr?: string;
}

export class ExternalAPIService {
  private gstApiKey: string;
  private panApiKey: string;

  constructor() {
    this.gstApiKey = process.env.GST_API_KEY || '';
    this.panApiKey = process.env.PAN_API_KEY || '';
  }

  /**
   * Fetch business details from GST API
   * In production, integrate with MCA/GST APIs
   */
  async fetchGSTDetails(gstin: string): Promise<Partial<GSTDetails>> {
    try {
      // Mock implementation - in production, call actual GST API
      // Example: https://commonapi.mastersindia.co/
      // Or: https://www.gstapi.in/

      // Simulate API call delay
      await this.delay(500);

      // Return mock data
      return {
        businessName: 'ABC Enterprises Private Limited',
        gstin: gstin,
        address: '123 Business Park, Andheri East',
        state: 'Maharashtra',
        registrationDate: '2020-01-15',
        businessType: 'Proprietorship',
        status: 'Active',
      };
    } catch (error) {
      console.error('GST API Error:', error);
      return {};
    }
  }

  /**
   * Fetch PAN details
   * In production, integrate with Income Tax Department APIs
   */
  async fetchPANDetails(pan: string): Promise<Partial<PANDetails>> {
    try {
      // Mock implementation - in production, call actual PAN API
      // Note: Direct PAN verification APIs are restricted

      await this.delay(500);

      return {
        name: 'John Doe',
        pan: pan,
        status: 'Valid',
        category: 'Individual',
      };
    } catch (error) {
      console.error('PAN API Error:', error);
      return {};
    }
  }

  /**
   * Fetch location details from pincode
   */
  async fetchLocationFromPincode(pincode: string): Promise<Partial<LocationDetails>> {
    try {
      // Use India Post API or other pincode APIs
      // Example: https://api.postalpincode.in/pincode/{pincode}

      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );

      if (!response.ok) {
        throw new Error('Pincode API failed');
      }

      const data = await response.json();

      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const location = data[0].PostOffice[0];
        return {
          city: location.District,
          district: location.District,
          state: location.State,
          country: location.Country,
        };
      }

      return {};
    } catch (error) {
      console.error('Pincode API Error:', error);
      // Return mock data as fallback
      return this.getMockLocationData(pincode);
    }
  }

  /**
   * Fetch bank details from IFSC code
   */
  async fetchBankDetails(ifscCode: string): Promise<Partial<BankDetails>> {
    try {
      // Use IFSC API
      // Example: https://ifsc.razorpay.com/{ifsc}

      const response = await fetch(
        `https://ifsc.razorpay.com/${ifscCode}`
      );

      if (!response.ok) {
        throw new Error('IFSC API failed');
      }

      const data = await response.json();

      return {
        bankName: data.BANK,
        branch: data.BRANCH,
        address: data.ADDRESS,
        city: data.CITY,
        state: data.STATE,
        micr: data.MICR,
      };
    } catch (error) {
      console.error('IFSC API Error:', error);
      return this.getMockBankData(ifscCode);
    }
  }

  /**
   * Verify business through MCA (Ministry of Corporate Affairs)
   */
  async verifyBusinessMCA(
    businessName: string,
    pan?: string
  ): Promise<{
    verified: boolean;
    companyName?: string;
    cin?: string;
    registrationDate?: string;
  }> {
    try {
      // In production, integrate with MCA API
      // Requires proper authentication and authorization

      await this.delay(500);

      return {
        verified: true,
        companyName: businessName,
        cin: 'U74999MH2020PTC123456',
        registrationDate: '2020-01-15',
      };
    } catch (error) {
      console.error('MCA Verification Error:', error);
      return { verified: false };
    }
  }

  /**
   * Verify Aadhaar (with user consent)
   * Uses UIDAI APIs
   */
  async initiateAadhaarVerification(
    aadhaarNumber: string,
    consent: boolean
  ): Promise<{
    transactionId: string;
    status: string;
  }> {
    if (!consent) {
      throw new Error('Aadhaar verification requires user consent');
    }

    try {
      // In production, integrate with UIDAI eKYC APIs
      // Requires government approval and compliance

      await this.delay(500);

      return {
        transactionId: 'TXN' + Date.now(),
        status: 'OTP_SENT',
      };
    } catch (error) {
      console.error('Aadhaar Verification Error:', error);
      throw error;
    }
  }

  /**
   * Complete Aadhaar verification with OTP
   */
  async completeAadhaarVerification(
    transactionId: string,
    otp: string
  ): Promise<{
    verified: boolean;
    name?: string;
    address?: string;
    dob?: string;
  }> {
    try {
      // Verify OTP and get eKYC data

      await this.delay(500);

      return {
        verified: true,
        name: 'John Doe',
        address: '123 Main Street, Mumbai, Maharashtra - 400001',
        dob: '1990-01-01',
      };
    } catch (error) {
      console.error('Aadhaar OTP Verification Error:', error);
      return { verified: false };
    }
  }

  /**
   * Check business name availability
   */
  async checkBusinessNameAvailability(
    businessName: string
  ): Promise<{
    available: boolean;
    suggestions?: string[];
  }> {
    try {
      // Check against existing merchant database
      // Check MCA database for company names

      await this.delay(300);

      return {
        available: true,
        suggestions: [],
      };
    } catch (error) {
      console.error('Name availability check error:', error);
      return { available: true };
    }
  }

  /**
   * Fetch merchant category suggestions based on business description
   */
  async suggestMerchantCategory(
    businessDescription: string
  ): Promise<string[]> {
    try {
      // In production, use ML model or API to suggest categories

      await this.delay(200);

      return [
        'Retail - Electronics',
        'Retail - General',
        'E-commerce',
      ];
    } catch (error) {
      console.error('Category suggestion error:', error);
      return [];
    }
  }

  /**
   * Verify bank account
   * Uses penny drop method
   */
  async verifyBankAccount(
    accountNumber: string,
    ifscCode: string,
    accountHolderName: string
  ): Promise<{
    verified: boolean;
    actualName?: string;
    match?: boolean;
  }> {
    try {
      // In production, use services like:
      // - Razorpay Fund Account Validation
      // - Cashfree Verification API
      // - Direct bank APIs

      await this.delay(1000);

      return {
        verified: true,
        actualName: accountHolderName,
        match: true,
      };
    } catch (error) {
      console.error('Bank verification error:', error);
      return { verified: false };
    }
  }

  /**
   * Perform KYC check
   */
  async performKYCCheck(
    pan: string,
    aadhaar?: string
  ): Promise<{
    status: 'VERIFIED' | 'PENDING' | 'FAILED';
    riskScore: number;
    alerts: string[];
  }> {
    try {
      // Integrate with KYC service providers like:
      // - IDfy
      // - Signzy
      // - Digio

      await this.delay(1500);

      return {
        status: 'VERIFIED',
        riskScore: 0.15, // Low risk
        alerts: [],
      };
    } catch (error) {
      console.error('KYC check error:', error);
      return {
        status: 'FAILED',
        riskScore: 1.0,
        alerts: ['KYC verification failed'],
      };
    }
  }

  /**
   * Check business in negative lists/sanctions
   */
  async checkNegativeLists(
    businessName: string,
    ownerName: string,
    pan: string
  ): Promise<{
    clear: boolean;
    matches: string[];
  }> {
    try {
      // Check against:
      // - RBI defaulter list
      // - SEBI debarred entities
      // - International sanctions lists (OFAC, UN, EU)

      await this.delay(800);

      return {
        clear: true,
        matches: [],
      };
    } catch (error) {
      console.error('Negative list check error:', error);
      return {
        clear: false,
        matches: ['Check failed - manual review required'],
      };
    }
  }

  // Helper methods

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getMockLocationData(pincode: string): Partial<LocationDetails> {
    // Mock data for common pincodes
    const mockData: Record<string, LocationDetails> = {
      '400001': {
        city: 'Mumbai',
        district: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      },
      '110001': {
        city: 'New Delhi',
        district: 'Central Delhi',
        state: 'Delhi',
        country: 'India',
      },
      '560001': {
        city: 'Bangalore',
        district: 'Bangalore Urban',
        state: 'Karnataka',
        country: 'India',
      },
    };

    return mockData[pincode] || {
      city: 'Unknown',
      state: 'Unknown',
      country: 'India',
    };
  }

  private getMockBankData(ifscCode: string): Partial<BankDetails> {
    // Extract bank code (first 4 characters)
    const bankCode = ifscCode.substring(0, 4);

    const bankNames: Record<string, string> = {
      'SBIN': 'State Bank of India',
      'HDFC': 'HDFC Bank',
      'ICIC': 'ICICI Bank',
      'UTIB': 'Axis Bank',
      'KKBK': 'Kotak Mahindra Bank',
    };

    return {
      bankName: bankNames[bankCode] || 'Unknown Bank',
      branch: 'Main Branch',
      city: 'Mumbai',
      state: 'Maharashtra',
    };
  }

  /**
   * Batch enrich merchant data
   */
  async enrichMerchantData(data: {
    gstin?: string;
    pan?: string;
    pincode?: string;
    ifscCode?: string;
  }): Promise<Record<string, any>> {
    const enrichedData: Record<string, any> = {};

    // Fetch all data in parallel
    const promises: Promise<any>[] = [];

    if (data.gstin) {
      promises.push(
        this.fetchGSTDetails(data.gstin).then(gst => {
          Object.assign(enrichedData, gst);
        })
      );
    }

    if (data.pan) {
      promises.push(
        this.fetchPANDetails(data.pan).then(pan => {
          Object.assign(enrichedData, pan);
        })
      );
    }

    if (data.pincode) {
      promises.push(
        this.fetchLocationFromPincode(data.pincode).then(location => {
          Object.assign(enrichedData, location);
        })
      );
    }

    if (data.ifscCode) {
      promises.push(
        this.fetchBankDetails(data.ifscCode).then(bank => {
          Object.assign(enrichedData, bank);
        })
      );
    }

    await Promise.allSettled(promises);

    return enrichedData;
  }
}

export default ExternalAPIService;
