import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProfile } from '@components/UserProfile';

// Mock wagmi hooks
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
}));

// Mock useUserData hook
jest.mock('@hooks/useUserData', () => ({
  useUserData: jest.fn(),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('UserProfile Component', () => {
  const mockUseAccount = require('wagmi').useAccount;
  const mockUseUserData = require('@hooks/useUserData').useUserData;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when wallet is not connected', () => {
    it('should show connect wallet message', () => {
      mockUseAccount.mockReturnValue({ address: null });
      mockUseUserData.mockReturnValue({
        userData: null,
        isVerified: false,
        updateUserName: jest.fn(),
        isSigningMessage: false,
        signError: null,
      });

      render(<UserProfile />);

      expect(screen.getByText('用户信息')).toBeInTheDocument();
      expect(screen.getByText('请先连接钱包查看个人信息')).toBeInTheDocument();
    });
  });

  describe('when wallet is connected but not verified', () => {
    it('should show verification message', () => {
      mockUseAccount.mockReturnValue({ 
        address: '0x1234567890123456789012345678901234567890' 
      });
      mockUseUserData.mockReturnValue({
        userData: null,
        isVerified: false,
        updateUserName: jest.fn(),
        isSigningMessage: false,
        signError: null,
      });

      render(<UserProfile />);

      expect(screen.getByText('登录验证中')).toBeInTheDocument();
      expect(screen.getByText('请在MetaMask中完成签名以验证您的身份...')).toBeInTheDocument();
    });

    it('should show sign error when present', () => {
      mockUseAccount.mockReturnValue({ 
        address: '0x1234567890123456789012345678901234567890' 
      });
      mockUseUserData.mockReturnValue({
        userData: null,
        isVerified: false,
        updateUserName: jest.fn(),
        isSigningMessage: false,
        signError: new Error('用户拒绝签名'),
      });

      render(<UserProfile />);

      expect(screen.getByText('签名失败: 用户拒绝签名')).toBeInTheDocument();
    });
  });

  describe('when wallet is connected and verified', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    const mockUserData = { name: 'Test User' };

    beforeEach(() => {
      mockUseAccount.mockReturnValue({ address: mockAddress });
    });

    it('should display user profile with address and name', () => {
      mockUseUserData.mockReturnValue({
        userData: mockUserData,
        isVerified: true,
        updateUserName: jest.fn(),
        isSigningMessage: false,
        signError: null,
      });

      render(<UserProfile />);

      expect(screen.getByText('个人信息')).toBeInTheDocument();
      expect(screen.getByText('钱包地址:')).toBeInTheDocument();
      expect(screen.getByText('姓名:')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should show "未设置" when user has no name', () => {
      mockUseUserData.mockReturnValue({
        userData: { name: '' },
        isVerified: true,
        updateUserName: jest.fn(),
        isSigningMessage: false,
        signError: null,
      });

      render(<UserProfile />);

      expect(screen.getByText('未设置')).toBeInTheDocument();
    });

    it('should toggle address display format when clicked', () => {
      mockUseUserData.mockReturnValue({
        userData: mockUserData,
        isVerified: true,
        updateUserName: jest.fn(),
        isSigningMessage: false,
        signError: null,
      });

      render(<UserProfile />);

      const addressElement = screen.getByText('0x1234...567890');
      fireEvent.click(addressElement);

      expect(screen.getByText(mockAddress)).toBeInTheDocument();
    });

    it('should copy address to clipboard when copy button is clicked', async () => {
      mockUseUserData.mockReturnValue({
        userData: mockUserData,
        isVerified: true,
        updateUserName: jest.fn(),
        isSigningMessage: false,
        signError: null,
      });

      render(<UserProfile />);

      const copyButton = screen.getByTitle('复制地址');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockAddress);
      });
    });

    it('should handle copy failure gracefully', async () => {
      (navigator.clipboard.writeText as any).mockRejectedValue(new Error('Copy failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockUseUserData.mockReturnValue({
        userData: mockUserData,
        isVerified: true,
        updateUserName: jest.fn(),
        isSigningMessage: false,
        signError: null,
      });

      render(<UserProfile />);

      const copyButton = screen.getByTitle('复制地址');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('复制失败:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should enter edit mode when edit button is clicked', () => {
      mockUseUserData.mockReturnValue({
        userData: mockUserData,
        isVerified: true,
        updateUserName: jest.fn(),
        isSigningMessage: false,
        signError: null,
      });

      render(<UserProfile />);

      const editButton = screen.getByText('编辑');
      fireEvent.click(editButton);

      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByText('保存')).toBeInTheDocument();
      expect(screen.getByText('取消')).toBeInTheDocument();
    });

    it('should update name when save button is clicked', async () => {
      const mockUpdateUserName = jest.fn().mockResolvedValue(true);
      
      mockUseUserData.mockReturnValue({
        userData: mockUserData,
        isVerified: true,
        updateUserName: mockUpdateUserName,
        isSigningMessage: false,
        signError: null,
      });

      render(<UserProfile />);

      const editButton = screen.getByText('编辑');
      fireEvent.click(editButton);

      const nameInput = screen.getByDisplayValue('Test User');
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateUserName).toHaveBeenCalledWith('New Name');
      });
    });
  });
});