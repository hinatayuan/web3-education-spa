import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from 'wagmi';
import { parseEther } from 'viem';
import { useState, useEffect, useCallback } from 'react';
import {
  YDToken_CONTRACT_ADDRESS,
  COURSE_MANAGER_CONTRACT_ADDRESS,
  STAKING_SYSTEM_CONTRACT_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  LINK_CONTRACT_ADDRESS,
  YDToken_ABI,
  COURSE_MANAGER_ABI,
  STAKING_SYSTEM_ABI,
  LINK_ABI,
} from '../config/contract';
import type { Course } from '../types';

// ERC20标准ABI的子集（用于USDT）
const ERC20_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const useYDTokenContract = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (spender: string, amount: bigint) => {
    writeContract({
      address: YDToken_CONTRACT_ADDRESS,
      abi: YDToken_ABI,
      functionName: 'approve',
      args: [spender, amount],
    });
  };

  return {
    approve,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useUSDTContract = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (spender: string, amount: bigint) => {
    writeContract({
      address: USDT_CONTRACT_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, amount],
    });
  };

  return {
    approve,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useLINKContract = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (spender: string, amount: bigint) => {
    writeContract({
      address: LINK_CONTRACT_ADDRESS as `0x${string}`,
      abi: LINK_ABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, amount],
    });
  };

  return {
    approve,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useCourseManagerContract = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const buyTokens = (ethAmount: string) => {
    writeContract({
      address: COURSE_MANAGER_CONTRACT_ADDRESS,
      abi: COURSE_MANAGER_ABI,
      functionName: 'buyTokens',
      value: parseEther(ethAmount),
    });
  };

  const purchaseCourse = (courseId: string) => {
    writeContract({
      address: COURSE_MANAGER_CONTRACT_ADDRESS,
      abi: COURSE_MANAGER_ABI,
      functionName: 'purchaseCourse',
      args: [courseId],
    });
  };

  const createCourse = (courseId: string, title: string, description: string, price: bigint) => {
    writeContract({
      address: COURSE_MANAGER_CONTRACT_ADDRESS,
      abi: COURSE_MANAGER_ABI,
      functionName: 'createCourse',
      args: [courseId, title, description, price],
    });
  };

  // 管理员功能：直接mint YD代币作为储备金
  const mintTokenReserve = (amount: bigint) => {
    writeContract({
      address: COURSE_MANAGER_CONTRACT_ADDRESS,
      abi: COURSE_MANAGER_ABI,
      functionName: 'mintTokenReserve',
      args: [amount],
    });
  };

  // 管理员功能：添加ETH储备金
  const addETHReserve = (ethAmount: string) => {
    writeContract({
      address: COURSE_MANAGER_CONTRACT_ADDRESS,
      abi: COURSE_MANAGER_ABI,
      functionName: 'addETHReserve',
      value: parseEther(ethAmount),
    });
  };

  // YD币兑换回ETH
  const sellTokens = (tokenAmount: bigint) => {
    writeContract({
      address: COURSE_MANAGER_CONTRACT_ADDRESS,
      abi: COURSE_MANAGER_ABI,
      functionName: 'sellTokens',
      args: [tokenAmount],
    });
  };

  return {
    buyTokens,
    sellTokens,
    purchaseCourse,
    createCourse,
    mintTokenReserve,
    addETHReserve,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useCourseData = () => {
  const { data: allCourseIds } = useReadContract({
    address: COURSE_MANAGER_CONTRACT_ADDRESS,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getAllCourseIds',
  });

  return { allCourseIds: (allCourseIds as string[]) || [] };
};

export const useCourse = (courseId: string) => {
  const { data: courseData } = useReadContract({
    address: COURSE_MANAGER_CONTRACT_ADDRESS,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getCourse',
    args: [courseId],
  });

  if (!courseData) return null;

  const [title, description, price, creator, isActive, createdAt] = courseData;

  return {
    courseId,
    title,
    description,
    price,
    creator,
    isActive,
    createdAt,
  } as Course;
};

export const useUserPurchasedCourses = (userAddress: string) => {
  const { data: purchasedCourses } = useReadContract({
    address: COURSE_MANAGER_CONTRACT_ADDRESS,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getUserPurchasedCourses',
    args: [userAddress as `0x${string}`],
  });

  return { purchasedCourses: (purchasedCourses as string[]) || [] };
};

export const useHasUserPurchasedCourse = (courseId: string, userAddress: string) => {
  const { data: hasPurchased, refetch } = useReadContract({
    address: COURSE_MANAGER_CONTRACT_ADDRESS,
    abi: COURSE_MANAGER_ABI,
    functionName: 'hasUserPurchasedCourse',
    args: [courseId, userAddress as `0x${string}`],
    query: {
      enabled: !!courseId && !!userAddress,
      staleTime: 2000, // 2秒后数据就算过期
      refetchOnWindowFocus: true,
    },
  });

  return { hasPurchased: hasPurchased as boolean, refetchPurchaseStatus: refetch };
};

export const useTokenBalance = (userAddress: string) => {
  const { data: balance, refetch } = useReadContract({
    address: YDToken_CONTRACT_ADDRESS,
    abi: YDToken_ABI,
    functionName: 'balanceOf',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
      staleTime: 1000, // 1秒后数据就算过期
      refetchOnWindowFocus: true,
    },
  });

  return { balance: (balance as bigint) || 0n, refetchBalance: refetch };
};

export const useUSDTBalance = (userAddress: string) => {
  const { data: balance, refetch } = useReadContract({
    address: USDT_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
      staleTime: 1000,
      refetchOnWindowFocus: true,
    },
  });

  return { balance: (balance as bigint) || 0n, refetchBalance: refetch };
};

export const useLINKBalance = (userAddress: string) => {
  const { data: balance, refetch } = useReadContract({
    address: LINK_CONTRACT_ADDRESS as `0x${string}`,
    abi: LINK_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
      staleTime: 1000,
      refetchOnWindowFocus: true,
    },
  });

  return { balance: (balance as bigint) || 0n, refetchBalance: refetch };
};

export const useTokenAllowance = (owner: string, spender: string) => {
  const { data: allowance, refetch } = useReadContract({
    address: YDToken_CONTRACT_ADDRESS,
    abi: YDToken_ABI,
    functionName: 'allowance',
    args: [owner, spender],
    query: {
      enabled: !!owner && !!spender,
      staleTime: 1000, // 1秒后数据就算过期，确保及时更新
      refetchOnWindowFocus: true,
    },
  });

  return { allowance: (allowance as bigint) || 0n, refetchAllowance: refetch };
};

export const useUSDTAllowance = (owner: string, spender: string) => {
  const { data: allowance, refetch } = useReadContract({
    address: USDT_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [owner as `0x${string}`, spender as `0x${string}`],
    query: {
      enabled: !!owner && !!spender,
      staleTime: 1000,
      refetchOnWindowFocus: true,
    },
  });

  return { allowance: (allowance as bigint) || 0n, refetchAllowance: refetch };
};

export const useLINKAllowance = (owner: string, spender: string) => {
  const { data: allowance, refetch } = useReadContract({
    address: LINK_CONTRACT_ADDRESS as `0x${string}`,
    abi: LINK_ABI,
    functionName: 'allowance',
    args: [owner as `0x${string}`, spender as `0x${string}`],
    query: {
      enabled: !!owner && !!spender,
      staleTime: 1000,
      refetchOnWindowFocus: true,
    },
  });

  return { allowance: (allowance as bigint) || 0n, refetchAllowance: refetch };
};

// 查询兑换储备金余额
export const useExchangeReserves = () => {
  const { data: reserves, refetch } = useReadContract({
    address: COURSE_MANAGER_CONTRACT_ADDRESS,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getExchangeReserves',
    query: {
      staleTime: 2000, // 2秒后数据就算过期
      refetchOnWindowFocus: true,
    },
  });

  if (!reserves) return { ethReserve: 0n, tokenReserve: 0n, refetchReserves: refetch };

  const [ethReserve, tokenReserve] = reserves;
  return {
    ethReserve: ethReserve as bigint,
    tokenReserve: tokenReserve as bigint,
    refetchReserves: refetch,
  };
};

// 查询合约余额状态
export const useContractBalances = () => {
  const { data: balances, refetch } = useReadContract({
    address: COURSE_MANAGER_CONTRACT_ADDRESS,
    abi: COURSE_MANAGER_ABI,
    functionName: 'getContractBalances',
    query: {
      staleTime: 2000, // 2秒后数据就算过期
      refetchOnWindowFocus: true,
    },
  });

  if (!balances) return { ethBalance: 0n, tokenBalance: 0n, refetchContractBalances: refetch };

  const [ethBalance, tokenBalance] = balances;
  return {
    ethBalance: ethBalance as bigint,
    tokenBalance: tokenBalance as bigint,
    refetchContractBalances: refetch,
  };
};

// 质押系统相关的hooks
export const useStakingSystemContract = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const stake = (usdtAmount: bigint) => {
    writeContract({
      address: STAKING_SYSTEM_CONTRACT_ADDRESS,
      abi: STAKING_SYSTEM_ABI,
      functionName: 'stake',
      args: [usdtAmount],
    });
  };

  const withdraw = (usdtAmount: bigint) => {
    writeContract({
      address: STAKING_SYSTEM_CONTRACT_ADDRESS,
      abi: STAKING_SYSTEM_ABI,
      functionName: 'withdraw',
      args: [usdtAmount],
    });
  };

  const claimRewards = () => {
    writeContract({
      address: STAKING_SYSTEM_CONTRACT_ADDRESS,
      abi: STAKING_SYSTEM_ABI,
      functionName: 'claimRewards',
    });
  };

  const stakeLINK = (linkAmount: bigint) => {
    writeContract({
      address: STAKING_SYSTEM_CONTRACT_ADDRESS,
      abi: STAKING_SYSTEM_ABI,
      functionName: 'stakeLINK',
      args: [linkAmount],
    });
  };

  const withdrawLINK = (linkAmount: bigint) => {
    writeContract({
      address: STAKING_SYSTEM_CONTRACT_ADDRESS,
      abi: STAKING_SYSTEM_ABI,
      functionName: 'withdrawLINK',
      args: [linkAmount],
    });
  };

  const claimLinkRewards = () => {
    writeContract({
      address: STAKING_SYSTEM_CONTRACT_ADDRESS,
      abi: STAKING_SYSTEM_ABI,
      functionName: 'claimLinkRewards',
    });
  };

  return {
    stake,
    withdraw,
    claimRewards,
    stakeLINK,
    withdrawLINK,
    claimLinkRewards,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useStakingUserInfo = (userAddress: `0x${string}`) => {
  const { data: userInfo, refetch } = useReadContract({
    address: STAKING_SYSTEM_CONTRACT_ADDRESS,
    abi: STAKING_SYSTEM_ABI,
    functionName: 'getUserInfo',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
      staleTime: 2000,
      refetchOnWindowFocus: true,
    },
  });

  if (!userInfo) return { data: null, refetchUserInfo: refetch };

  const [
    stakedAmount,
    aTokenBalance,
    lastStakeTime,
    totalRewardsClaimed,
    availableRewards,
    currentValue,
  ] = userInfo;

  return {
    data: {
      stakedAmount: stakedAmount as bigint,
      aTokenBalance: aTokenBalance as bigint,
      lastStakeTime: lastStakeTime as bigint,
      totalRewardsClaimed: totalRewardsClaimed as bigint,
      availableRewards: availableRewards as bigint,
      currentValue: currentValue as bigint,
    },
    refetchUserInfo: refetch,
  };
};

export const useStakingUserLinkInfo = (userAddress: `0x${string}`) => {
  const { data: userInfo, refetch } = useReadContract({
    address: STAKING_SYSTEM_CONTRACT_ADDRESS,
    abi: STAKING_SYSTEM_ABI,
    functionName: 'getUserLinkInfo',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
      staleTime: 2000,
      refetchOnWindowFocus: true,
    },
  });

  if (!userInfo) return { data: null, refetchUserInfo: refetch };

  const [
    stakedAmount,
    aTokenBalance,
    lastStakeTime,
    totalRewardsClaimed,
    availableRewards,
    currentValue,
  ] = userInfo;

  return {
    data: {
      stakedAmount: stakedAmount as bigint,
      aTokenBalance: aTokenBalance as bigint,
      lastStakeTime: lastStakeTime as bigint,
      totalRewardsClaimed: totalRewardsClaimed as bigint,
      availableRewards: availableRewards as bigint,
      currentValue: currentValue as bigint,
    },
    refetchUserInfo: refetch,
  };
};

export const useStakingSystemStats = () => {
  const { data: systemStats } = useReadContract({
    address: STAKING_SYSTEM_CONTRACT_ADDRESS,
    abi: STAKING_SYSTEM_ABI,
    functionName: 'getSystemStats',
  });

  if (!systemStats) return null;

  const [totalStakedRaw, totalRewardsPaidRaw, totalATokensRaw, availableRewardsRaw, currentAPYRaw] =
    systemStats;

  return {
    totalStaked: totalStakedRaw as bigint,
    totalRewardsPaid: totalRewardsPaidRaw as bigint,
    totalATokens: totalATokensRaw as bigint,
    availableRewards: availableRewardsRaw as bigint,
    currentAPY: currentAPYRaw as bigint,
  };
};

export const useStakingLinkSystemStats = () => {
  const { data: systemStats, refetch } = useReadContract({
    address: STAKING_SYSTEM_CONTRACT_ADDRESS,
    abi: STAKING_SYSTEM_ABI,
    functionName: 'getLinkSystemStats',
    query: {
      staleTime: 2000,
      refetchOnWindowFocus: true,
    },
  });

  if (!systemStats) return { data: null, refetchSystemStats: refetch };

  const [
    totalLinkStakedRaw,
    totalLinkRewardsPaidRaw,
    totalLinkATokensRaw,
    availableLinkRewardsRaw,
    currentLinkAPYRaw,
  ] = systemStats;

  return {
    data: {
      totalLinkStaked: totalLinkStakedRaw as bigint,
      totalLinkRewardsPaid: totalLinkRewardsPaidRaw as bigint,
      totalLinkATokens: totalLinkATokensRaw as bigint,
      availableLinkRewards: availableLinkRewardsRaw as bigint,
      currentLinkAPY: currentLinkAPYRaw as bigint,
    },
    refetchSystemStats: refetch,
  };
};

export const useStakingSystemPaused = () => {
  const { data: isPaused } = useReadContract({
    address: STAKING_SYSTEM_CONTRACT_ADDRESS,
    abi: STAKING_SYSTEM_ABI,
    functionName: 'paused',
  });

  return { isPaused: (isPaused as boolean) || false };
};

// 检查质押授权状态的helper hook
export const useStakingApprovalStatus = (userAddress: string, amount: bigint) => {
  const { allowance } = useTokenAllowance(userAddress, STAKING_SYSTEM_CONTRACT_ADDRESS);
  const { balance } = useTokenBalance(userAddress);

  const needsApproval = amount > 0n && amount > (allowance || 0n);
  const hasBalance = amount > 0n && amount <= (balance || 0n);
  const isReady = hasBalance && !needsApproval;

  return {
    needsApproval,
    hasBalance,
    isReady,
    currentAllowance: allowance || 0n,
    currentBalance: balance || 0n,
    requiredApproval: needsApproval ? amount - (allowance || 0n) : 0n,
  };
};

// 兑换记录类型定义
export interface ExchangeRecord {
  id: string;
  type: 'buy' | 'sell';
  userAddress: string;
  tokenAmount: bigint;
  ethAmount: bigint;
  timestamp: number;
  blockNumber: bigint;
  transactionHash: string;
}

// 获取用户兑换记录的hook
export const useExchangeRecords = (userAddress: string) => {
  const [records, setRecords] = useState<ExchangeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  const fetchRecords = useCallback(async () => {
    if (!userAddress || !publicClient) return;

    setLoading(true);
    setError(null);

    try {
      // 获取最近1000个区块的日志（可以根据需要调整）
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock - 1000n > 0n ? latestBlock - 1000n : 0n;

      // 获取购买记录 (TokensPurchased 事件)
      const buyLogs = await publicClient.getContractEvents({
        address: COURSE_MANAGER_CONTRACT_ADDRESS,
        abi: COURSE_MANAGER_ABI,
        eventName: 'TokensPurchased',
        args: {
          buyer: userAddress as `0x${string}`,
        },
        fromBlock,
        toBlock: 'latest',
      });

      // 获取出售记录 (TokensSold 事件)
      const sellLogs = await publicClient.getContractEvents({
        address: COURSE_MANAGER_CONTRACT_ADDRESS,
        abi: COURSE_MANAGER_ABI,
        eventName: 'TokensSold',
        args: {
          seller: userAddress as `0x${string}`,
        },
        fromBlock,
        toBlock: 'latest',
      });

      // 转换和合并记录
      const exchangeRecords: ExchangeRecord[] = [];

      // 处理购买记录
      buyLogs.forEach((log, index) => {
        if (log.args) {
          exchangeRecords.push({
            id: `buy-${log.transactionHash}-${index}`,
            type: 'buy',
            userAddress: log.args.buyer as string,
            ethAmount: log.args.ethAmount as bigint,
            tokenAmount: log.args.tokenAmount as bigint,
            timestamp: Date.now(), // 实际应该从区块中获取时间戳
            blockNumber: log.blockNumber || 0n,
            transactionHash: log.transactionHash || '',
          });
        }
      });

      // 处理出售记录
      sellLogs.forEach((log, index) => {
        if (log.args) {
          exchangeRecords.push({
            id: `sell-${log.transactionHash}-${index}`,
            type: 'sell',
            userAddress: log.args.seller as string,
            tokenAmount: log.args.tokenAmount as bigint,
            ethAmount: log.args.ethAmount as bigint,
            timestamp: Date.now(), // 实际应该从区块中获取时间戳
            blockNumber: log.blockNumber || 0n,
            transactionHash: log.transactionHash || '',
          });
        }
      });

      // 按区块号排序（最新的在前）
      exchangeRecords.sort((a, b) => Number(b.blockNumber - a.blockNumber));

      setRecords(exchangeRecords);
    } catch (err) {
      console.error('获取兑换记录失败:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userAddress, publicClient]);

  useEffect(() => {
    if (userAddress) {
      fetchRecords();
    }
  }, [userAddress, fetchRecords]);

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
  };
};
