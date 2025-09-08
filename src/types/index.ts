export interface Course {
  courseId: string;
  title: string;
  description: string;
  price: bigint;
  creator: string;
  isActive: boolean;
  createdAt: bigint;
}

export interface UserData {
  address: string;
  name: string;
  purchasedCourses: string[];
}

export interface TokenExchangeProps {
  ethAmount: string;
  tokenAmount: string;
}

// Global window type declarations
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any; // Keep as any to avoid conflicts with existing declarations
  }
}

export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (accounts: string[]) => void) => void;
  removeListener?: (event: string, callback: (accounts: string[]) => void) => void;
}

export interface EthereumError extends Error {
  code?: number;
}
