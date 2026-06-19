export interface Country {
  id: string;
  name: string;
  code: string;
  flagUrl?: string;
  type: 'local' | 'regional' | 'global';
  popular: boolean;
  color?: string;
}

export interface GlobalPlan {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  countries: Country[];
}

export interface Plan {
  id: string;
  countryId: string;
  countryName: string;
  price: number;
  currency: string;
  imageUrl?: string;
  dataOptions: DataOption[];
  durationOptions: DurationOption[];
  coverage: string;
  network: string;
  aboutProduct: string[];
  tips: string[];
  howToRetrieve: string;
}

export interface DataOption {
  value: string;
  label: string;
}

export interface DurationOption {
  value: number;
  label: string;
}

export type Screen = 'onboarding' | 'country-selection' | 'plan-details' | 'cart' | 'help-center' | 'esim-check' | 'no-esim-support' | 'esim-installation-guide' | 'esim-status' | 'apn-settings' | 'faq' | 'auth' | 'account-details' | 'my-data' | 'my-orders';
