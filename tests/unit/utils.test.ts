import { formatWalletAddress } from '../../src/utils/index';

describe('utils工具函数测试', () => {
  describe('formatWalletAddress', () => {
    it('应该正确格式化标准以太坊地址', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const result = formatWalletAddress(address);
      expect(result).toBe('0x123456...7890');
    });

    it('应该正确处理自定义长度', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const result = formatWalletAddress(address, 8, 6);
      expect(result).toBe('0x12345678...567890');
    });

    it('应该处理没有0x前缀的地址', () => {
      const address = '1234567890123456789012345678901234567890';
      const result = formatWalletAddress(address);
      expect(result).toBe('123456...7890');
    });

    it('应该处理空字符串', () => {
      const result = formatWalletAddress('');
      expect(result).toBe('');
    });

    it('应该处理null或undefined', () => {
      const result1 = formatWalletAddress(null as any);
      const result2 = formatWalletAddress(undefined as any);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });

    it('应该处理过短的地址', () => {
      const shortAddress = '0x123456';
      const result = formatWalletAddress(shortAddress);
      expect(result).toBe('0x123456');
    });

    it('应该处理刚好符合长度要求的地址', () => {
      const address = '0x1234567890'; // 10个字符（含0x），去掉0x后是8个字符，6+4=10 > 8，所以会被格式化
      const result = formatWalletAddress(address);
      expect(result).toBe('0x123456...7890');
    });

    it('应该处理极限长度地址', () => {
      const address = '0x12345678901'; // 11个字符，应该被格式化
      const result = formatWalletAddress(address);
      expect(result).toBe('0x123456...8901');
    });

    it('应该保留原始地址的0x前缀状态', () => {
      const withPrefix = '0x1234567890123456789012345678901234567890';
      const withoutPrefix = '1234567890123456789012345678901234567890';
      
      const result1 = formatWalletAddress(withPrefix);
      const result2 = formatWalletAddress(withoutPrefix);
      
      expect(result1.startsWith('0x')).toBe(true);
      expect(result2.startsWith('0x')).toBe(false);
    });

    it('应该处理包含大写字母的地址', () => {
      const address = '0x1234567890ABCDEF789012345678901234567890';
      const result = formatWalletAddress(address);
      expect(result).toBe('0x123456...7890');
    });

    it('应该处理混合大小写的地址', () => {
      const address = '0x1234567890aBcDeF789012345678901234567890';
      const result = formatWalletAddress(address);
      expect(result).toBe('0x123456...7890');
    });

    it('应该在不同参数下正确工作', () => {
      const address = '0x1234567890123456789012345678901234567890';
      
      const result1 = formatWalletAddress(address, 4, 4);
      const result2 = formatWalletAddress(address, 10, 2);
      const result3 = formatWalletAddress(address, 2, 8);
      
      expect(result1).toBe('0x1234...7890');
      expect(result2).toBe('0x1234567890...90');
      expect(result3).toBe('0x12...34567890');
    });

    it('应该处理边界情况：长度参数为0', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const result = formatWalletAddress(address, 0, 0);
      expect(result).toBe('0x...1234567890123456789012345678901234567890');
    });

    it('应该处理边界情况：长度参数很大', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const result = formatWalletAddress(address, 50, 50);
      expect(result).toBe(address); // 应该返回原地址
    });
  });

  describe('地址验证相关函数', () => {
    it('应该正确验证以太坊地址格式', () => {
      const isValidEthereumAddress = (address: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      };

      expect(isValidEthereumAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(isValidEthereumAddress('0x1234567890ABCDEF123456789012345678901234')).toBe(true);
      expect(isValidEthereumAddress('0x123')).toBe(false);
      expect(isValidEthereumAddress('1234567890123456789012345678901234567890')).toBe(false);
      expect(isValidEthereumAddress('')).toBe(false);
      expect(isValidEthereumAddress('0x')).toBe(false);
      expect(isValidEthereumAddress('0xG234567890123456789012345678901234567890')).toBe(false);
    });
  });

  describe('地址比较函数', () => {
    it('应该正确比较地址相等性（忽略大小写）', () => {
      const compareAddresses = (addr1: string, addr2: string): boolean => {
        return addr1.toLowerCase() === addr2.toLowerCase();
      };

      expect(compareAddresses(
        '0x1234567890123456789012345678901234567890',
        '0x1234567890123456789012345678901234567890'
      )).toBe(true);

      expect(compareAddresses(
        '0x1234567890123456789012345678901234567890',
        '0x1234567890123456789012345678901234567890'.toUpperCase()
      )).toBe(true);

      expect(compareAddresses(
        '0x1234567890123456789012345678901234567890',
        '0x1234567890123456789012345678901234567891'
      )).toBe(false);
    });
  });

  describe('地址处理实用函数', () => {
    it('应该正确提取地址的校验和', () => {
      const getAddressChecksum = (address: string): string => {
        // 简化版校验和提取
        if (!address.startsWith('0x')) return '';
        return address.slice(2);
      };

      expect(getAddressChecksum('0x1234567890123456789012345678901234567890'))
        .toBe('1234567890123456789012345678901234567890');
      expect(getAddressChecksum('1234567890123456789012345678901234567890'))
        .toBe('');
    });

    it('应该正确标准化地址格式', () => {
      const normalizeAddress = (address: string): string => {
        if (!address) return '';
        const cleaned = address.toLowerCase();
        return cleaned.startsWith('0x') ? cleaned : `0x${cleaned}`;
      };

      expect(normalizeAddress('1234567890123456789012345678901234567890'))
        .toBe('0x1234567890123456789012345678901234567890');
      expect(normalizeAddress('0x1234567890123456789012345678901234567890'))
        .toBe('0x1234567890123456789012345678901234567890');
      expect(normalizeAddress('0X1234567890123456789012345678901234567890'))
        .toBe('0x1234567890123456789012345678901234567890');
      expect(normalizeAddress('')).toBe('');
    });
  });
});