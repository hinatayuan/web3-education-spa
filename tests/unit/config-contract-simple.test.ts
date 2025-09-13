import * as contractConfig from '../../src/config/contract';

describe('合约配置基础测试', () => {
  describe('合约地址配置', () => {
    it('应该导出CourseManager合约地址', () => {
      expect(contractConfig.COURSE_MANAGER_CONTRACT_ADDRESS).toBeDefined();
      expect(typeof contractConfig.COURSE_MANAGER_CONTRACT_ADDRESS).toBe('string');
    });

    it('应该导出YDToken合约地址', () => {
      expect(contractConfig.YDToken_CONTRACT_ADDRESS).toBeDefined();
      expect(typeof contractConfig.YDToken_CONTRACT_ADDRESS).toBe('string');
    });

    it('应该导出StakingSystem合约地址', () => {
      expect(contractConfig.STAKING_SYSTEM_CONTRACT_ADDRESS).toBeDefined();
      expect(typeof contractConfig.STAKING_SYSTEM_CONTRACT_ADDRESS).toBe('string');
    });

    it('合约地址应该是有效的以太坊地址格式', () => {
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      
      expect(contractConfig.COURSE_MANAGER_CONTRACT_ADDRESS).toMatch(ethAddressRegex);
      expect(contractConfig.YDToken_CONTRACT_ADDRESS).toMatch(ethAddressRegex);
      expect(contractConfig.STAKING_SYSTEM_CONTRACT_ADDRESS).toMatch(ethAddressRegex);
    });

    it('合约地址应该不为空', () => {
      expect(contractConfig.COURSE_MANAGER_CONTRACT_ADDRESS).not.toBe('');
      expect(contractConfig.YDToken_CONTRACT_ADDRESS).not.toBe('');
      expect(contractConfig.STAKING_SYSTEM_CONTRACT_ADDRESS).not.toBe('');
    });

    it('合约地址应该是唯一的', () => {
      const addresses = [
        contractConfig.COURSE_MANAGER_CONTRACT_ADDRESS,
        contractConfig.YDToken_CONTRACT_ADDRESS,
        contractConfig.STAKING_SYSTEM_CONTRACT_ADDRESS,
      ];

      const uniqueAddresses = new Set(addresses.map(addr => addr.toLowerCase()));
      expect(uniqueAddresses.size).toBe(addresses.length);
    });
  });

  describe('合约ABI配置', () => {
    it('应该导出CourseManagerABI', () => {
      expect(contractConfig.COURSE_MANAGER_ABI).toBeDefined();
      expect(Array.isArray(contractConfig.COURSE_MANAGER_ABI)).toBe(true);
      expect(contractConfig.COURSE_MANAGER_ABI.length).toBeGreaterThan(0);
    });

    it('应该导出YDTokenABI', () => {
      expect(contractConfig.YDToken_ABI).toBeDefined();
      expect(Array.isArray(contractConfig.YDToken_ABI)).toBe(true);
      expect(contractConfig.YDToken_ABI.length).toBeGreaterThan(0);
    });

    it('应该导出StakingSystemABI', () => {
      expect(contractConfig.STAKING_SYSTEM_ABI).toBeDefined();
      expect(Array.isArray(contractConfig.STAKING_SYSTEM_ABI)).toBe(true);
      expect(contractConfig.STAKING_SYSTEM_ABI.length).toBeGreaterThan(0);
    });

    it('ABI应该包含函数和事件', () => {
      const courseManagerItems = contractConfig.COURSE_MANAGER_ABI;
      const tokenItems = contractConfig.YDToken_ABI;
      const stakingItems = contractConfig.STAKING_SYSTEM_ABI;

      // 检查是否有函数定义
      const hasFunction = (items: any[]) => 
        items.some(item => item.type === 'function');

      expect(hasFunction(courseManagerItems)).toBe(true);
      expect(hasFunction(tokenItems)).toBe(true);
      expect(hasFunction(stakingItems)).toBe(true);
    });

    it('ABI应该有正确的结构', () => {
      const checkABIStructure = (abi: any[]) => {
        return abi.every(item => {
          return (
            typeof item === 'object' &&
            item !== null &&
            typeof item.type === 'string'
          );
        });
      };

      expect(checkABIStructure(contractConfig.COURSE_MANAGER_ABI)).toBe(true);
      expect(checkABIStructure(contractConfig.YDToken_ABI)).toBe(true);
      expect(checkABIStructure(contractConfig.STAKING_SYSTEM_ABI)).toBe(true);
    });
  });

  describe('配置完整性测试', () => {
    it('应该导出所有必需的配置项', () => {
      const requiredExports = [
        'COURSE_MANAGER_CONTRACT_ADDRESS',
        'YDToken_CONTRACT_ADDRESS',
        'STAKING_SYSTEM_CONTRACT_ADDRESS',
        'COURSE_MANAGER_ABI',
        'YDToken_ABI',
        'STAKING_SYSTEM_ABI',
      ];

      requiredExports.forEach(exportName => {
        expect(contractConfig).toHaveProperty(exportName);
        expect(contractConfig[exportName as keyof typeof contractConfig]).toBeDefined();
      });
    });

    it('地址应该是字符串类型', () => {
      expect(typeof contractConfig.COURSE_MANAGER_CONTRACT_ADDRESS).toBe('string');
      expect(typeof contractConfig.YDToken_CONTRACT_ADDRESS).toBe('string');
      expect(typeof contractConfig.STAKING_SYSTEM_CONTRACT_ADDRESS).toBe('string');
    });
  });

  describe('网络配置测试', () => {
    it('应该使用正确的合约地址', () => {
      const addresses = [
        contractConfig.COURSE_MANAGER_CONTRACT_ADDRESS,
        contractConfig.YDToken_CONTRACT_ADDRESS,
        contractConfig.STAKING_SYSTEM_CONTRACT_ADDRESS,
      ];

      addresses.forEach(address => {
        expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(address).not.toBe('0x0000000000000000000000000000000000000000');
      });
    });
  });
});