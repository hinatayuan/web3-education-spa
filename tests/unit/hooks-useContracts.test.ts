import { renderHook } from '@testing-library/react';
import {
  useYDTokenContract,
  useUSDTContract,
  useLINKContract,
  useCourseManagerContract,
  useCourseData,
  useCourse,
  useUserPurchasedCourses,
  useHasUserPurchasedCourse,
  useTokenBalance,
  useUSDTBalance,
  useLINKBalance,
  useTokenAllowance,
  useUSDTAllowance,
  useLINKAllowance,
  useExchangeReserves,
  useContractBalances,
  useStakingSystemContract,
  useStakingUserInfo,
  useStakingUserLinkInfo,
  useStakingSystemStats,
  useStakingLinkSystemStats,
  useStakingSystemPaused,
  useStakingApprovalStatus,
  useExchangeRecords,
} from '@hooks/useContracts';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useReadContract: jest.fn(),
  useWriteContract: jest.fn(),
  useWaitForTransactionReceipt: jest.fn(),
  usePublicClient: jest.fn(),
}));

// Mock parseEther
jest.mock('viem', () => ({
  parseEther: jest.fn((value) => {
    const num = parseFloat(value);
    return BigInt(Math.floor(num * 1e18));
  }),
}));

// Mock contract addresses and ABIs
jest.mock('@config/contract', () => ({
  YDToken_CONTRACT_ADDRESS: '0x1234567890123456789012345678901234567890',
  COURSE_MANAGER_CONTRACT_ADDRESS: '0x2234567890123456789012345678901234567890',
  STAKING_SYSTEM_CONTRACT_ADDRESS: '0x3234567890123456789012345678901234567890',
  USDT_CONTRACT_ADDRESS: '0x4234567890123456789012345678901234567890',
  LINK_CONTRACT_ADDRESS: '0x5234567890123456789012345678901234567890',
  YDToken_ABI: [],
  COURSE_MANAGER_ABI: [],
  STAKING_SYSTEM_ABI: [],
  LINK_ABI: [],
}));

describe('Contract Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useYDTokenContract', () => {
    it('should return contract interaction functions and state', () => {
      const mockWriteContract = jest.fn();
      const mockWaitForTransactionReceipt = jest.fn().mockReturnValue({
        isLoading: false,
        isSuccess: false,
      });
      
      require('wagmi').useWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: '0xhash123',
        error: null,
        isPending: false,
      });
      
      require('wagmi').useWaitForTransactionReceipt.mockReturnValue(mockWaitForTransactionReceipt());

      const { result } = renderHook(() => useYDTokenContract());

      expect(result.current).toHaveProperty('approve');
      expect(result.current).toHaveProperty('hash');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isPending');
      expect(result.current).toHaveProperty('isConfirming');
      expect(result.current).toHaveProperty('isConfirmed');
      expect(typeof result.current.approve).toBe('function');
    });

    it('should call writeContract when approve is called', () => {
      const mockWriteContract = jest.fn();
      
      require('wagmi').useWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: null,
        error: null,
        isPending: false,
      });
      
      require('wagmi').useWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: false,
      });

      const { result } = renderHook(() => useYDTokenContract());
      
      const spender = '0x1111111111111111111111111111111111111111';
      const amount = BigInt(1000);
      
      result.current.approve(spender, amount);
      
      expect(mockWriteContract).toHaveBeenCalledWith({
        address: '0x1234567890123456789012345678901234567890',
        abi: [],
        functionName: 'approve',
        args: [spender, amount],
      });
    });
  });

  describe('useUSDTContract', () => {
    it('should return USDT contract functions', () => {
      require('wagmi').useWriteContract.mockReturnValue({
        writeContract: jest.fn(),
        data: null,
        error: null,
        isPending: false,
      });
      
      require('wagmi').useWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: false,
      });

      const { result } = renderHook(() => useUSDTContract());

      expect(result.current).toHaveProperty('approve');
      expect(typeof result.current.approve).toBe('function');
    });
  });

  describe('useLINKContract', () => {
    it('should return LINK contract functions', () => {
      require('wagmi').useWriteContract.mockReturnValue({
        writeContract: jest.fn(),
        data: null,
        error: null,
        isPending: false,
      });
      
      require('wagmi').useWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: false,
      });

      const { result } = renderHook(() => useLINKContract());

      expect(result.current).toHaveProperty('approve');
      expect(typeof result.current.approve).toBe('function');
    });
  });

  describe('useCourseManagerContract', () => {
    it('should return all course manager functions', () => {
      require('wagmi').useWriteContract.mockReturnValue({
        writeContract: jest.fn(),
        data: null,
        error: null,
        isPending: false,
      });
      
      require('wagmi').useWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: false,
      });

      const { result } = renderHook(() => useCourseManagerContract());

      expect(result.current).toHaveProperty('buyTokens');
      expect(result.current).toHaveProperty('sellTokens');
      expect(result.current).toHaveProperty('purchaseCourse');
      expect(result.current).toHaveProperty('createCourse');
      expect(result.current).toHaveProperty('mintTokenReserve');
      expect(result.current).toHaveProperty('addETHReserve');
      expect(typeof result.current.buyTokens).toBe('function');
    });

    it('should call writeContract when buyTokens is called', () => {
      const mockWriteContract = jest.fn();
      
      require('wagmi').useWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: null,
        error: null,
        isPending: false,
      });
      
      require('wagmi').useWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: false,
      });

      const { result } = renderHook(() => useCourseManagerContract());
      
      result.current.buyTokens('1.0');
      
      expect(mockWriteContract).toHaveBeenCalled();
    });
  });

  describe('useCourseData', () => {
    it('should return course IDs', () => {
      const mockCourseIds = ['course1', 'course2', 'course3'];
      
      require('wagmi').useReadContract.mockReturnValue({
        data: mockCourseIds,
      });

      const { result } = renderHook(() => useCourseData());

      expect(result.current.allCourseIds).toEqual(mockCourseIds);
    });

    it('should return empty array when no data', () => {
      require('wagmi').useReadContract.mockReturnValue({
        data: null,
      });

      const { result } = renderHook(() => useCourseData());

      expect(result.current.allCourseIds).toEqual([]);
    });
  });

  describe('useCourse', () => {
    it('should return null when no course data', () => {
      require('wagmi').useReadContract.mockReturnValue({
        data: null,
      });

      const { result } = renderHook(() => useCourse('course1'));

      expect(result.current).toBeNull();
    });

    it('should return course data when available', () => {
      const mockCourseData = [
        'Test Course',
        'Test Description',
        BigInt(1000),
        '0x1234567890123456789012345678901234567890',
        true,
        BigInt(1234567890),
      ];
      
      require('wagmi').useReadContract.mockReturnValue({
        data: mockCourseData,
      });

      const { result } = renderHook(() => useCourse('course1'));

      expect(result.current).toEqual({
        courseId: 'course1',
        title: 'Test Course',
        description: 'Test Description',
        price: BigInt(1000),
        creator: '0x1234567890123456789012345678901234567890',
        isActive: true,
        createdAt: BigInt(1234567890),
      });
    });
  });

  describe('useUserPurchasedCourses', () => {
    it('should return purchased courses', () => {
      const mockPurchasedCourses = ['course1', 'course2'];
      
      require('wagmi').useReadContract.mockReturnValue({
        data: mockPurchasedCourses,
      });

      const { result } = renderHook(() => useUserPurchasedCourses('0x1234567890123456789012345678901234567890'));

      expect(result.current.purchasedCourses).toEqual(mockPurchasedCourses);
    });

    it('should return empty array when no data', () => {
      require('wagmi').useReadContract.mockReturnValue({
        data: null,
      });

      const { result } = renderHook(() => useUserPurchasedCourses('0x1234567890123456789012345678901234567890'));

      expect(result.current.purchasedCourses).toEqual([]);
    });
  });

  describe('useHasUserPurchasedCourse', () => {
    it('should return purchase status and refetch function', () => {
      const mockRefetch = jest.fn();
      
      require('wagmi').useReadContract.mockReturnValue({
        data: true,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => 
        useHasUserPurchasedCourse('course1', '0x1234567890123456789012345678901234567890')
      );

      expect(result.current.hasPurchased).toBe(true);
      expect(result.current.refetchPurchaseStatus).toBe(mockRefetch);
    });
  });

  describe('useTokenBalance', () => {
    it('should return balance and refetch function', () => {
      const mockRefetch = jest.fn();
      const mockBalance = BigInt(1000);
      
      require('wagmi').useReadContract.mockReturnValue({
        data: mockBalance,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useTokenBalance('0x1234567890123456789012345678901234567890'));

      expect(result.current.balance).toBe(mockBalance);
      expect(result.current.refetchBalance).toBe(mockRefetch);
    });

    it('should return 0 when no balance data', () => {
      const mockRefetch = jest.fn();
      
      require('wagmi').useReadContract.mockReturnValue({
        data: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => useTokenBalance('0x1234567890123456789012345678901234567890'));

      expect(result.current.balance).toBe(0n);
    });
  });

  describe('useStakingSystemContract', () => {
    it('should return all staking functions', () => {
      require('wagmi').useWriteContract.mockReturnValue({
        writeContract: jest.fn(),
        data: null,
        error: null,
        isPending: false,
      });
      
      require('wagmi').useWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: false,
      });

      const { result } = renderHook(() => useStakingSystemContract());

      expect(result.current).toHaveProperty('stake');
      expect(result.current).toHaveProperty('withdraw');
      expect(result.current).toHaveProperty('claimRewards');
      expect(result.current).toHaveProperty('stakeLINK');
      expect(result.current).toHaveProperty('withdrawLINK');
      expect(result.current).toHaveProperty('claimLinkRewards');
      expect(typeof result.current.stake).toBe('function');
    });
  });

  describe('useStakingUserInfo', () => {
    it('should return user staking info', () => {
      const mockUserInfo = [
        BigInt(1000), // stakedAmount
        BigInt(1100), // aTokenBalance
        BigInt(1234567890), // lastStakeTime
        BigInt(50), // totalRewardsClaimed
        BigInt(25), // availableRewards
        BigInt(1150), // currentValue
      ];
      const mockRefetch = jest.fn();
      
      require('wagmi').useReadContract.mockReturnValue({
        data: mockUserInfo,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => 
        useStakingUserInfo('0x1234567890123456789012345678901234567890' as `0x${string}`)
      );

      expect(result.current.data).toEqual({
        stakedAmount: BigInt(1000),
        aTokenBalance: BigInt(1100),
        lastStakeTime: BigInt(1234567890),
        totalRewardsClaimed: BigInt(50),
        availableRewards: BigInt(25),
        currentValue: BigInt(1150),
      });
      expect(result.current.refetchUserInfo).toBe(mockRefetch);
    });

    it('should return null when no user info', () => {
      const mockRefetch = jest.fn();
      
      require('wagmi').useReadContract.mockReturnValue({
        data: null,
        refetch: mockRefetch,
      });

      const { result } = renderHook(() => 
        useStakingUserInfo('0x1234567890123456789012345678901234567890' as `0x${string}`)
      );

      expect(result.current.data).toBeNull();
    });
  });

  describe('useStakingSystemStats', () => {
    it('should return system stats', () => {
      const mockSystemStats = [
        BigInt(10000), // totalStaked
        BigInt(500), // totalRewardsPaid
        BigInt(10500), // totalATokens
        BigInt(1000), // availableRewards
        BigInt(5), // currentAPY
      ];
      
      require('wagmi').useReadContract.mockReturnValue({
        data: mockSystemStats,
      });

      const { result } = renderHook(() => useStakingSystemStats());

      expect(result.current).toEqual({
        totalStaked: BigInt(10000),
        totalRewardsPaid: BigInt(500),
        totalATokens: BigInt(10500),
        availableRewards: BigInt(1000),
        currentAPY: BigInt(5),
      });
    });

    it('should return null when no stats data', () => {
      require('wagmi').useReadContract.mockReturnValue({
        data: null,
      });

      const { result } = renderHook(() => useStakingSystemStats());

      expect(result.current).toBeNull();
    });
  });

  describe('useStakingSystemPaused', () => {
    it('should return paused status', () => {
      require('wagmi').useReadContract.mockReturnValue({
        data: true,
      });

      const { result } = renderHook(() => useStakingSystemPaused());

      expect(result.current.isPaused).toBe(true);
    });

    it('should return false when no data', () => {
      require('wagmi').useReadContract.mockReturnValue({
        data: null,
      });

      const { result } = renderHook(() => useStakingSystemPaused());

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('useStakingApprovalStatus', () => {
    it('should calculate approval status correctly', () => {
      require('wagmi').useReadContract
        .mockReturnValueOnce({ data: BigInt(500), refetch: jest.fn() }) // allowance
        .mockReturnValueOnce({ data: BigInt(1000), refetch: jest.fn() }); // balance

      const { result } = renderHook(() => 
        useStakingApprovalStatus('0x1234567890123456789012345678901234567890', BigInt(750))
      );

      expect(result.current.needsApproval).toBe(true);
      expect(result.current.hasBalance).toBe(true);
      expect(result.current.isReady).toBe(false);
      expect(result.current.currentAllowance).toBe(BigInt(500));
      expect(result.current.currentBalance).toBe(BigInt(1000));
      expect(result.current.requiredApproval).toBe(BigInt(250));
    });

    it('should handle zero amount', () => {
      require('wagmi').useReadContract
        .mockReturnValueOnce({ data: BigInt(500), refetch: jest.fn() }) // allowance
        .mockReturnValueOnce({ data: BigInt(1000), refetch: jest.fn() }); // balance

      const { result } = renderHook(() => 
        useStakingApprovalStatus('0x1234567890123456789012345678901234567890', BigInt(0))
      );

      expect(result.current.needsApproval).toBe(false);
      expect(result.current.hasBalance).toBe(false);
      expect(result.current.isReady).toBe(false);
    });
  });

  describe('useExchangeRecords', () => {
    it('should return initial state', () => {
      const mockPublicClient = null; // simulate no client initially
      
      require('wagmi').usePublicClient.mockReturnValue(mockPublicClient);

      const { result } = renderHook(() => 
        useExchangeRecords('')
      );

      expect(result.current.records).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should not fetch when no user address', () => {
      const mockPublicClient = {
        getBlockNumber: jest.fn(),
        getContractEvents: jest.fn(),
      };
      
      require('wagmi').usePublicClient.mockReturnValue(mockPublicClient);

      renderHook(() => useExchangeRecords(''));

      expect(mockPublicClient.getBlockNumber).not.toHaveBeenCalled();
    });
  });
});