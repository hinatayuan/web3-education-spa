import { renderHook, act } from '@testing-library/react';
import { useUserData } from '../../src/hooks/useUserData';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useSignMessage: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Import wagmi mocks after mocking
import { useAccount, useSignMessage } from 'wagmi';

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;
const mockUseSignMessage = useSignMessage as jest.MockedFunction<typeof useSignMessage>;

describe('useUserData Hook测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Default mocks
    mockUseAccount.mockReturnValue({
      address: undefined,
    } as any);
    
    mockUseSignMessage.mockReturnValue({
      signMessage: jest.fn(),
      signMessageAsync: jest.fn(),
      data: undefined,
      error: null,
      isPending: false,
    } as any);
  });

  describe('初始状态测试', () => {
    it('应该返回初始状态', () => {
      const { result } = renderHook(() => useUserData());

      expect(result.current.userData).toBe(null);
      expect(result.current.isVerified).toBe(false);
      expect(result.current.isSigningMessage).toBe(false);
      expect(result.current.signError).toBe(null);
    });

    it('应该在没有地址时返回空状态', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
      } as any);

      const { result } = renderHook(() => useUserData());

      expect(result.current.userData).toBe(null);
      expect(result.current.isVerified).toBe(false);
    });
  });

  describe('地址连接测试', () => {
    it('应该在地址变化时触发自动登录验证', () => {
      const mockSignMessage = jest.fn();
      
      mockUseAccount.mockReturnValue({
        address: '0x1234567890123456789012345678901234567890',
      } as any);
      
      mockUseSignMessage.mockReturnValue({
        signMessage: mockSignMessage,
        signMessageAsync: jest.fn(),
        data: undefined,
        error: null,
        isPending: false,
      } as any);

      renderHook(() => useUserData());

      expect(mockSignMessage).toHaveBeenCalledWith({
        message: expect.stringContaining('登录验证 - Web3大学'),
      });
    });

    it('应该从localStorage加载已存在的用户数据', () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const userData = {
        address: testAddress.toLowerCase(),
        name: '测试用户',
        purchasedCourses: ['course1', 'course2'],
      };

      localStorageMock.setItem('web3_university_users', JSON.stringify({
        [testAddress.toLowerCase()]: userData,
      }));

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      const { result } = renderHook(() => useUserData());

      expect(result.current.userData).toEqual(userData);
      expect(result.current.isVerified).toBe(true);
    });
  });

  describe('签名处理测试', () => {
    it('应该在签名成功后创建新用户数据', () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const mockSignature = '0xsignature';

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      mockUseSignMessage.mockReturnValue({
        signMessage: jest.fn(),
        signMessageAsync: jest.fn(),
        data: mockSignature,
        error: null,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useUserData());

      expect(result.current.userData).toEqual({
        address: testAddress.toLowerCase(),
        name: '新用户',
        purchasedCourses: [],
      });
      expect(result.current.isVerified).toBe(true);
    });

    it('应该处理localStorage解析错误', () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      
      localStorageMock.setItem('web3_university_users', 'invalid json');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      renderHook(() => useUserData());

      expect(consoleSpy).toHaveBeenCalledWith('解析用户数据失败:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('用户名更新测试', () => {
    it('应该成功更新用户名', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const userData = {
        address: testAddress.toLowerCase(),
        name: '旧用户名',
        purchasedCourses: [],
      };

      localStorageMock.setItem('web3_university_users', JSON.stringify({
        [testAddress.toLowerCase()]: userData,
      }));

      const mockSignMessageAsync = jest.fn().mockResolvedValue('0xsignature');

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      mockUseSignMessage.mockReturnValue({
        signMessage: jest.fn(),
        signMessageAsync: mockSignMessageAsync,
        data: undefined,
        error: null,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useUserData());

      const success = await act(async () => {
        return await result.current.updateUserName('新用户名');
      });

      expect(success).toBe(true);
      expect(result.current.userData?.name).toBe('新用户名');
      expect(mockSignMessageAsync).toHaveBeenCalledWith({
        message: expect.stringContaining('修改用户名 - Web3大学'),
      });
    });

    it('应该在未验证时拒绝更新用户名', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      const { result } = renderHook(() => useUserData());

      const success = await act(async () => {
        return await result.current.updateUserName('新用户名');
      });

      expect(success).toBe(false);
    });

    it('应该处理签名失败', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const userData = {
        address: testAddress.toLowerCase(),
        name: '旧用户名',
        purchasedCourses: [],
      };

      localStorageMock.setItem('web3_university_users', JSON.stringify({
        [testAddress.toLowerCase()]: userData,
      }));

      const mockSignMessageAsync = jest.fn().mockRejectedValue(new Error('签名失败'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      mockUseSignMessage.mockReturnValue({
        signMessage: jest.fn(),
        signMessageAsync: mockSignMessageAsync,
        data: undefined,
        error: null,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useUserData());

      const success = await act(async () => {
        return await result.current.updateUserName('新用户名');
      });

      expect(success).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('更新姓名失败:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('课程购买测试', () => {
    it('应该成功添加购买的课程', () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const userData = {
        address: testAddress.toLowerCase(),
        name: '测试用户',
        purchasedCourses: ['course1'],
      };

      localStorageMock.setItem('web3_university_users', JSON.stringify({
        [testAddress.toLowerCase()]: userData,
      }));

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      const { result } = renderHook(() => useUserData());

      act(() => {
        result.current.addPurchasedCourse('course2');
      });

      expect(result.current.userData?.purchasedCourses).toEqual(['course1', 'course2']);
    });

    it('应该避免重复添加相同的课程', () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const userData = {
        address: testAddress.toLowerCase(),
        name: '测试用户',
        purchasedCourses: ['course1'],
      };

      localStorageMock.setItem('web3_university_users', JSON.stringify({
        [testAddress.toLowerCase()]: userData,
      }));

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      const { result } = renderHook(() => useUserData());

      act(() => {
        result.current.addPurchasedCourse('course1');
      });

      expect(result.current.userData?.purchasedCourses).toEqual(['course1']);
    });

    it('应该在没有用户数据时忽略添加课程', () => {
      const testAddress = '0x1234567890123456789012345678901234567890';

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      const { result } = renderHook(() => useUserData());

      act(() => {
        result.current.addPurchasedCourse('course1');
      });

      expect(result.current.userData).toBe(null);
    });

    it('应该在没有地址时忽略添加课程', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
      } as any);

      const { result } = renderHook(() => useUserData());

      act(() => {
        result.current.addPurchasedCourse('course1');
      });

      expect(result.current.userData).toBe(null);
    });
  });

  describe('verifyAndCreateUser方法测试', () => {
    it('应该调用签名验证', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const mockSignMessage = jest.fn();

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      mockUseSignMessage.mockReturnValue({
        signMessage: mockSignMessage,
        signMessageAsync: jest.fn(),
        data: undefined,
        error: null,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useUserData());

      await act(async () => {
        await result.current.verifyAndCreateUser('测试用户');
      });

      expect(mockSignMessage).toHaveBeenCalledWith({
        message: expect.stringContaining('验证身份 - Web3大学'),
      });
    });

    it('应该在没有地址时直接返回', async () => {
      const mockSignMessage = jest.fn();

      mockUseAccount.mockReturnValue({
        address: undefined,
      } as any);

      mockUseSignMessage.mockReturnValue({
        signMessage: mockSignMessage,
        signMessageAsync: jest.fn(),
        data: undefined,
        error: null,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useUserData());

      await act(async () => {
        await result.current.verifyAndCreateUser('测试用户');
      });

      expect(mockSignMessage).not.toHaveBeenCalled();
    });

    it('应该处理签名错误', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const mockSignMessage = jest.fn().mockRejectedValue(new Error('签名失败'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      mockUseSignMessage.mockReturnValue({
        signMessage: mockSignMessage,
        signMessageAsync: jest.fn(),
        data: undefined,
        error: null,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useUserData());

      await act(async () => {
        await result.current.verifyAndCreateUser('测试用户');
      });

      expect(consoleSpy).toHaveBeenCalledWith('签名失败:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('自动登录验证错误处理', () => {
    it('应该处理自动登录验证失败', async () => {
      const testAddress = '0x1234567890123456789012345678901234567890';
      const mockSignMessage = jest.fn().mockRejectedValue(new Error('登录失败'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockUseAccount.mockReturnValue({
        address: testAddress,
      } as any);

      mockUseSignMessage.mockReturnValue({
        signMessage: mockSignMessage,
        signMessageAsync: jest.fn(),
        data: undefined,
        error: null,
        isPending: false,
      } as any);

      renderHook(() => useUserData());

      // 等待异步操作完成
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleSpy).toHaveBeenCalledWith('登录验证失败:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('状态传递测试', () => {
    it('应该正确传递isPending状态', () => {
      mockUseSignMessage.mockReturnValue({
        signMessage: jest.fn(),
        signMessageAsync: jest.fn(),
        data: undefined,
        error: null,
        isPending: true,
      } as any);

      const { result } = renderHook(() => useUserData());

      expect(result.current.isSigningMessage).toBe(true);
    });

    it('应该正确传递错误状态', () => {
      const testError = new Error('测试错误');
      
      mockUseSignMessage.mockReturnValue({
        signMessage: jest.fn(),
        signMessageAsync: jest.fn(),
        data: undefined,
        error: testError,
        isPending: false,
      } as any);

      const { result } = renderHook(() => useUserData());

      expect(result.current.signError).toBe(testError);
    });
  });
});