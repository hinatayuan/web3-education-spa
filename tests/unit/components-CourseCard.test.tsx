import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CourseCard } from '../../src/components/CourseCard';
import type { Course } from '../../src/types';

// Mock all the hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
}));

jest.mock('viem', () => ({
  formatEther: jest.fn((value) => '1.0'),
}));

jest.mock('../../src/hooks/useContracts', () => ({
  useHasUserPurchasedCourse: jest.fn(),
  useTokenAllowance: jest.fn(),
  useTokenBalance: jest.fn(),
  useYDTokenContract: jest.fn(),
  useCourseManagerContract: jest.fn(),
}));

jest.mock('../../src/hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

jest.mock('../../src/config/contract', () => ({
  COURSE_MANAGER_CONTRACT_ADDRESS: '0xcontract123',
}));

import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import {
  useHasUserPurchasedCourse,
  useTokenAllowance,
  useTokenBalance,
  useYDTokenContract,
  useCourseManagerContract,
} from '../../src/hooks/useContracts';
import { useUserData } from '../../src/hooks/useUserData';

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;
const mockFormatEther = formatEther as jest.MockedFunction<typeof formatEther>;
const mockUseHasUserPurchasedCourse = useHasUserPurchasedCourse as jest.MockedFunction<typeof useHasUserPurchasedCourse>;
const mockUseTokenAllowance = useTokenAllowance as jest.MockedFunction<typeof useTokenAllowance>;
const mockUseTokenBalance = useTokenBalance as jest.MockedFunction<typeof useTokenBalance>;
const mockUseYDTokenContract = useYDTokenContract as jest.MockedFunction<typeof useYDTokenContract>;
const mockUseCourseManagerContract = useCourseManagerContract as jest.MockedFunction<typeof useCourseManagerContract>;
const mockUseUserData = useUserData as jest.MockedFunction<typeof useUserData>;

afterEach(cleanup);

describe('CourseCard组件测试', () => {
  const mockCourse: Course = {
    courseId: 'course-123',
    title: '测试课程',
    description: '这是一个测试课程的描述',
    price: BigInt('1000000000000000000'), // 1 ETH in wei
    creator: '0x1234567890123456789012345678901234567890',
    isActive: true,
    createdAt: BigInt('1634567890')
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseAccount.mockReturnValue({
      address: undefined,
    } as any);

    mockFormatEther.mockReturnValue('1.0');

    mockUseHasUserPurchasedCourse.mockReturnValue({
      hasPurchased: false,
      refetchPurchaseStatus: jest.fn(),
    } as any);

    mockUseTokenAllowance.mockReturnValue({
      allowance: BigInt('0'),
      refetchAllowance: jest.fn(),
    } as any);

    mockUseTokenBalance.mockReturnValue({
      refetchBalance: jest.fn(),
    } as any);

    mockUseYDTokenContract.mockReturnValue({
      approve: jest.fn(),
      isPending: false,
      isConfirming: false,
      isConfirmed: false,
    } as any);

    mockUseCourseManagerContract.mockReturnValue({
      purchaseCourse: jest.fn(),
      isPending: false,
      isConfirming: false,
      isConfirmed: false,
    } as any);

    mockUseUserData.mockReturnValue({
      addPurchasedCourse: jest.fn(),
    } as any);
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染课程信息', () => {
      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('测试课程')).toBeInTheDocument();
      expect(screen.getByText('这是一个测试课程的描述')).toBeInTheDocument();
      expect(screen.getByText('1.0 YD')).toBeInTheDocument();
      expect(screen.getByText(/创建者:/)).toBeInTheDocument();
      expect(screen.getByText(/0x1234...7890/)).toBeInTheDocument();
      expect(screen.getByText('状态: 可购买')).toBeInTheDocument();
    });

    it('应该显示暂停销售状态', () => {
      const inactiveCourse = { ...mockCourse, isActive: false };
      render(<CourseCard course={inactiveCourse} />);

      expect(screen.getByText('状态: 暂停销售')).toBeInTheDocument();
    });

    it('应该调用formatEther来格式化价格', () => {
      render(<CourseCard course={mockCourse} />);

      expect(mockFormatEther).toHaveBeenCalledWith(mockCourse.price);
    });
  });

  describe('未连接钱包状态测试', () => {
    it('应该显示连接钱包提示', () => {
      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('请先连接钱包')).toBeInTheDocument();
    });
  });

  describe('课程创建者状态测试', () => {
    it('应该显示创建者标识', () => {
      mockUseAccount.mockReturnValue({
        address: mockCourse.creator,
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('👑 我的课程')).toBeInTheDocument();
    });

    it('应该处理大小写不敏感的地址比较', () => {
      mockUseAccount.mockReturnValue({
        address: mockCourse.creator.toUpperCase(),
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('👑 我的课程')).toBeInTheDocument();
    });
  });

  describe('已购买状态测试', () => {
    it('应该显示已购买标识', () => {
      mockUseAccount.mockReturnValue({
        address: '0x9876543210987654321098765432109876543210',
      } as any);

      mockUseHasUserPurchasedCourse.mockReturnValue({
        hasPurchased: true,
        refetchPurchaseStatus: jest.fn(),
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('✓ 已购买')).toBeInTheDocument();
    });
  });

  describe('课程暂停销售测试', () => {
    it('应该显示暂停销售信息', () => {
      const inactiveCourse = { ...mockCourse, isActive: false };
      
      mockUseAccount.mockReturnValue({
        address: '0x9876543210987654321098765432109876543210',
      } as any);

      render(<CourseCard course={inactiveCourse} />);

      expect(screen.getByText('暂停销售')).toBeInTheDocument();
    });
  });

  describe('授权流程测试', () => {
    beforeEach(() => {
      mockUseAccount.mockReturnValue({
        address: '0x9876543210987654321098765432109876543210',
      } as any);

      mockUseHasUserPurchasedCourse.mockReturnValue({
        hasPurchased: false,
        refetchPurchaseStatus: jest.fn(),
      } as any);
    });

    it('应该显示Approve按钮当需要授权时', () => {
      mockUseTokenAllowance.mockReturnValue({
        allowance: BigInt('0'), // 授权额度不足
        refetchAllowance: jest.fn(),
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('Approve')).toBeInTheDocument();
      expect(screen.getByText('需要先授权才能购买')).toBeInTheDocument();
    });

    it('应该调用approve函数当点击Approve按钮', () => {
      const mockApprove = jest.fn();
      
      mockUseTokenAllowance.mockReturnValue({
        allowance: BigInt('0'),
        refetchAllowance: jest.fn(),
      } as any);

      mockUseYDTokenContract.mockReturnValue({
        approve: mockApprove,
        isPending: false,
        isConfirming: false,
        isConfirmed: false,
      } as any);

      render(<CourseCard course={mockCourse} />);

      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      expect(mockApprove).toHaveBeenCalledWith('0xcontract123', mockCourse.price);
    });

    it('应该显示loading状态当授权进行中', () => {
      mockUseTokenAllowance.mockReturnValue({
        allowance: BigInt('0'),
        refetchAllowance: jest.fn(),
      } as any);

      mockUseYDTokenContract.mockReturnValue({
        approve: jest.fn(),
        isPending: true,
        isConfirming: false,
        isConfirmed: false,
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('Approving...')).toBeInTheDocument();
    });

    it('应该显示确认状态', () => {
      mockUseTokenAllowance.mockReturnValue({
        allowance: BigInt('0'),
        refetchAllowance: jest.fn(),
      } as any);

      mockUseYDTokenContract.mockReturnValue({
        approve: jest.fn(),
        isPending: false,
        isConfirming: true,
        isConfirmed: false,
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('确认中...')).toBeInTheDocument();
    });

    it('应该显示已确认状态', () => {
      mockUseTokenAllowance.mockReturnValue({
        allowance: BigInt('0'),
        refetchAllowance: jest.fn(),
      } as any);

      mockUseYDTokenContract.mockReturnValue({
        approve: jest.fn(),
        isPending: false,
        isConfirming: false,
        isConfirmed: true,
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('Approved!')).toBeInTheDocument();
    });
  });

  describe('购买流程测试', () => {
    beforeEach(() => {
      mockUseAccount.mockReturnValue({
        address: '0x9876543210987654321098765432109876543210',
      } as any);

      mockUseHasUserPurchasedCourse.mockReturnValue({
        hasPurchased: false,
        refetchPurchaseStatus: jest.fn(),
      } as any);

      // 设置足够的授权额度
      mockUseTokenAllowance.mockReturnValue({
        allowance: BigInt('2000000000000000000'), // 2 ETH worth
        refetchAllowance: jest.fn(),
      } as any);
    });

    it('应该显示购买按钮当已授权且未购买', () => {
      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('购买课程')).toBeInTheDocument();
    });

    it('应该调用purchaseCourse函数当点击购买按钮', () => {
      const mockPurchaseCourse = jest.fn();
      
      mockUseCourseManagerContract.mockReturnValue({
        purchaseCourse: mockPurchaseCourse,
        isPending: false,
        isConfirming: false,
        isConfirmed: false,
      } as any);

      render(<CourseCard course={mockCourse} />);

      const purchaseButton = screen.getByText('购买课程');
      fireEvent.click(purchaseButton);

      expect(mockPurchaseCourse).toHaveBeenCalledWith(mockCourse.courseId);
    });

    it('应该显示购买loading状态', () => {
      mockUseCourseManagerContract.mockReturnValue({
        purchaseCourse: jest.fn(),
        isPending: true,
        isConfirming: false,
        isConfirmed: false,
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('购买中...')).toBeInTheDocument();
    });

    it('应该显示购买确认状态', () => {
      mockUseCourseManagerContract.mockReturnValue({
        purchaseCourse: jest.fn(),
        isPending: false,
        isConfirming: true,
        isConfirmed: false,
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('确认购买中...')).toBeInTheDocument();
    });

    it('应该显示购买成功状态', () => {
      mockUseCourseManagerContract.mockReturnValue({
        purchaseCourse: jest.fn(),
        isPending: false,
        isConfirming: false,
        isConfirmed: true,
      } as any);

      render(<CourseCard course={mockCourse} />);

      expect(screen.getByText('购买成功!')).toBeInTheDocument();
    });
  });

  describe('按钮禁用状态测试', () => {
    beforeEach(() => {
      mockUseAccount.mockReturnValue({
        address: '0x9876543210987654321098765432109876543210',
      } as any);

      mockUseHasUserPurchasedCourse.mockReturnValue({
        hasPurchased: false,
        refetchPurchaseStatus: jest.fn(),
      } as any);
    });

    it('Approve按钮应该在pending时被禁用', () => {
      mockUseTokenAllowance.mockReturnValue({
        allowance: BigInt('0'),
        refetchAllowance: jest.fn(),
      } as any);

      mockUseYDTokenContract.mockReturnValue({
        approve: jest.fn(),
        isPending: true,
        isConfirming: false,
        isConfirmed: false,
      } as any);

      render(<CourseCard course={mockCourse} />);

      const approveButton = screen.getByText('Approving...');
      expect(approveButton).toBeDisabled();
    });

    it('购买按钮应该在pending时被禁用', () => {
      mockUseTokenAllowance.mockReturnValue({
        allowance: BigInt('2000000000000000000'),
        refetchAllowance: jest.fn(),
      } as any);

      mockUseCourseManagerContract.mockReturnValue({
        purchaseCourse: jest.fn(),
        isPending: true,
        isConfirming: false,
        isConfirmed: false,
      } as any);

      render(<CourseCard course={mockCourse} />);

      const purchaseButton = screen.getByText('购买中...');
      expect(purchaseButton).toBeDisabled();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理创建者购买自己的课程', () => {
      mockUseAccount.mockReturnValue({
        address: mockCourse.creator,
      } as any);

      const mockApprove = jest.fn();
      const mockPurchaseCourse = jest.fn();

      mockUseYDTokenContract.mockReturnValue({
        approve: mockApprove,
        isPending: false,
        isConfirming: false,
        isConfirmed: false,
      } as any);

      mockUseCourseManagerContract.mockReturnValue({
        purchaseCourse: mockPurchaseCourse,
        isPending: false,
        isConfirming: false,
        isConfirmed: false,
      } as any);

      render(<CourseCard course={mockCourse} />);

      // 创建者不应该能够购买自己的课程
      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
      expect(screen.queryByText('购买课程')).not.toBeInTheDocument();
      expect(screen.getByText('👑 我的课程')).toBeInTheDocument();
    });

    it('应该处理已购买用户', () => {
      mockUseAccount.mockReturnValue({
        address: '0x9876543210987654321098765432109876543210',
      } as any);

      mockUseHasUserPurchasedCourse.mockReturnValue({
        hasPurchased: true,
        refetchPurchaseStatus: jest.fn(),
      } as any);

      const mockApprove = jest.fn();
      const mockPurchaseCourse = jest.fn();

      render(<CourseCard course={mockCourse} />);

      // 已购买用户不应该看到购买相关按钮
      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
      expect(screen.queryByText('购买课程')).not.toBeInTheDocument();
      expect(screen.getByText('✓ 已购买')).toBeInTheDocument();
    });

    it('应该处理价格为0的课程', () => {
      const freeCourse = { ...mockCourse, price: BigInt('0') };
      
      mockFormatEther.mockReturnValue('0.0');

      render(<CourseCard course={freeCourse} />);

      expect(screen.getByText('0.0 YD')).toBeInTheDocument();
    });

    it('应该处理非常长的课程标题和描述', () => {
      const longCourse = {
        ...mockCourse,
        title: '这是一个非常长的课程标题'.repeat(10),
        description: '这是一个非常长的课程描述'.repeat(20),
      };

      render(<CourseCard course={longCourse} />);

      expect(screen.getByText(longCourse.title)).toBeInTheDocument();
      expect(screen.getByText(longCourse.description)).toBeInTheDocument();
    });
  });
});