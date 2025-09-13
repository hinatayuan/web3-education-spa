import type { Course, UserData, TokenExchangeProps, EthereumProvider, EthereumError } from '../../src/types';

describe('类型定义和接口测试', () => {
  describe('Course接口测试', () => {
    it('应该定义正确的Course接口结构', () => {
      const validCourse: Course = {
        courseId: 'course-123',
        title: 'Web3开发入门',
        description: '学习区块链和智能合约开发的基础知识',
        price: BigInt('1000000000000000000'), // 1 ETH in wei
        creator: '0x1234567890123456789012345678901234567890',
        isActive: true,
        createdAt: BigInt('1634567890')
      };

      expect(validCourse.courseId).toBe('course-123');
      expect(validCourse.title).toBe('Web3开发入门');
      expect(validCourse.description).toBe('学习区块链和智能合约开发的基础知识');
      expect(validCourse.price).toBe(BigInt('1000000000000000000'));
      expect(validCourse.creator).toBe('0x1234567890123456789012345678901234567890');
      expect(validCourse.isActive).toBe(true);
      expect(validCourse.createdAt).toBe(BigInt('1634567890'));
    });

    it('应该正确处理Course的不同属性类型', () => {
      const course: Course = {
        courseId: '1',
        title: 'Test',
        description: 'Test Description',
        price: BigInt('0'),
        creator: '0x0000000000000000000000000000000000000000',
        isActive: false,
        createdAt: BigInt('0')
      };

      expect(typeof course.courseId).toBe('string');
      expect(typeof course.title).toBe('string');
      expect(typeof course.description).toBe('string');
      expect(typeof course.price).toBe('bigint');
      expect(typeof course.creator).toBe('string');
      expect(typeof course.isActive).toBe('boolean');
      expect(typeof course.createdAt).toBe('bigint');
    });

    it('应该支持Course的所有必需属性', () => {
      const courseKeys = ['courseId', 'title', 'description', 'price', 'creator', 'isActive', 'createdAt'];
      const course: Course = {
        courseId: 'test',
        title: 'test',
        description: 'test',
        price: BigInt('1'),
        creator: 'test',
        isActive: true,
        createdAt: BigInt('1')
      };

      courseKeys.forEach(key => {
        expect(course).toHaveProperty(key);
      });
    });
  });

  describe('UserData接口测试', () => {
    it('应该定义正确的UserData接口结构', () => {
      const validUserData: UserData = {
        address: '0x1234567890123456789012345678901234567890',
        name: '张三',
        purchasedCourses: ['course1', 'course2', 'course3']
      };

      expect(validUserData.address).toBe('0x1234567890123456789012345678901234567890');
      expect(validUserData.name).toBe('张三');
      expect(validUserData.purchasedCourses).toEqual(['course1', 'course2', 'course3']);
      expect(Array.isArray(validUserData.purchasedCourses)).toBe(true);
    });

    it('应该支持空的购买课程列表', () => {
      const userData: UserData = {
        address: '0x1234567890123456789012345678901234567890',
        name: '新用户',
        purchasedCourses: []
      };

      expect(userData.purchasedCourses).toEqual([]);
      expect(userData.purchasedCourses.length).toBe(0);
    });

    it('应该正确处理UserData的属性类型', () => {
      const userData: UserData = {
        address: '0x123',
        name: 'test',
        purchasedCourses: ['1', '2']
      };

      expect(typeof userData.address).toBe('string');
      expect(typeof userData.name).toBe('string');
      expect(Array.isArray(userData.purchasedCourses)).toBe(true);
      expect(userData.purchasedCourses.every(course => typeof course === 'string')).toBe(true);
    });

    it('应该支持UserData的所有必需属性', () => {
      const userDataKeys = ['address', 'name', 'purchasedCourses'];
      const userData: UserData = {
        address: 'test',
        name: 'test',
        purchasedCourses: []
      };

      userDataKeys.forEach(key => {
        expect(userData).toHaveProperty(key);
      });
    });
  });

  describe('TokenExchangeProps接口测试', () => {
    it('应该定义正确的TokenExchangeProps接口结构', () => {
      const exchangeProps: TokenExchangeProps = {
        ethAmount: '1.5',
        tokenAmount: '6000'
      };

      expect(exchangeProps.ethAmount).toBe('1.5');
      expect(exchangeProps.tokenAmount).toBe('6000');
      expect(typeof exchangeProps.ethAmount).toBe('string');
      expect(typeof exchangeProps.tokenAmount).toBe('string');
    });

    it('应该支持零值和小数值', () => {
      const exchangeProps: TokenExchangeProps = {
        ethAmount: '0',
        tokenAmount: '0.001'
      };

      expect(exchangeProps.ethAmount).toBe('0');
      expect(exchangeProps.tokenAmount).toBe('0.001');
    });

    it('应该支持TokenExchangeProps的所有必需属性', () => {
      const exchangeKeys = ['ethAmount', 'tokenAmount'];
      const exchangeProps: TokenExchangeProps = {
        ethAmount: '1',
        tokenAmount: '1000'
      };

      exchangeKeys.forEach(key => {
        expect(exchangeProps).toHaveProperty(key);
      });
    });
  });

  describe('EthereumProvider接口测试', () => {
    it('应该定义正确的EthereumProvider接口结构', () => {
      const mockProvider: EthereumProvider = {
        request: async (args) => {
          if (args.method === 'eth_accounts') {
            return ['0x1234567890123456789012345678901234567890'];
          }
          return null;
        },
        on: (event, callback) => {
          if (event === 'accountsChanged') {
            setTimeout(() => callback(['0x9876543210987654321098765432109876543210']), 100);
          }
        }
      };

      expect(typeof mockProvider.request).toBe('function');
      expect(typeof mockProvider.on).toBe('function');
    });

    it('应该正确处理request方法', async () => {
      const mockProvider: EthereumProvider = {
        request: async (args) => {
          switch (args.method) {
            case 'eth_accounts':
              return ['0x123'];
            case 'eth_chainId':
              return '0x1';
            default:
              return null;
          }
        },
        on: jest.fn()
      };

      const accounts = await mockProvider.request({ method: 'eth_accounts' });
      const chainId = await mockProvider.request({ method: 'eth_chainId' });

      expect(accounts).toEqual(['0x123']);
      expect(chainId).toBe('0x1');
    });

    it('应该支持可选的removeListener方法', () => {
      const providerWithRemoveListener: EthereumProvider = {
        request: async () => null,
        on: jest.fn(),
        removeListener: jest.fn()
      };

      const providerWithoutRemoveListener: EthereumProvider = {
        request: async () => null,
        on: jest.fn()
      };

      expect(providerWithRemoveListener.removeListener).toBeDefined();
      expect(providerWithoutRemoveListener.removeListener).toBeUndefined();
    });
  });

  describe('EthereumError接口测试', () => {
    it('应该扩展Error并包含可选的code属性', () => {
      const ethError: EthereumError = new Error('User rejected the request') as EthereumError;
      ethError.code = 4001;

      expect(ethError instanceof Error).toBe(true);
      expect(ethError.message).toBe('User rejected the request');
      expect(ethError.code).toBe(4001);
    });

    it('应该支持没有code的错误', () => {
      const ethError: EthereumError = new Error('Network error') as EthereumError;

      expect(ethError instanceof Error).toBe(true);
      expect(ethError.message).toBe('Network error');
      expect(ethError.code).toBeUndefined();
    });

    it('应该支持常见的以太坊错误代码', () => {
      const errors: EthereumError[] = [
        Object.assign(new Error('User rejected'), { code: 4001 }),
        Object.assign(new Error('Unauthorized'), { code: 4100 }),
        Object.assign(new Error('Method not supported'), { code: 4200 }),
        Object.assign(new Error('Disconnected'), { code: 4900 }),
        Object.assign(new Error('Chain disconnected'), { code: 4901 })
      ];

      expect(errors[0].code).toBe(4001); // User rejected
      expect(errors[1].code).toBe(4100); // Unauthorized
      expect(errors[2].code).toBe(4200); // Method not supported
      expect(errors[3].code).toBe(4900); // Disconnected
      expect(errors[4].code).toBe(4901); // Chain disconnected
    });
  });

  describe('类型兼容性和约束测试', () => {
    it('应该正确处理Course和UserData之间的关系', () => {
      const course: Course = {
        courseId: 'course-123',
        title: 'Test Course',
        description: 'Test Description',
        price: BigInt('1000000000000000000'),
        creator: '0x1234567890123456789012345678901234567890',
        isActive: true,
        createdAt: BigInt('1634567890')
      };

      const userData: UserData = {
        address: '0x9876543210987654321098765432109876543210',
        name: '购买者',
        purchasedCourses: [course.courseId] // 应该能引用课程ID
      };

      expect(userData.purchasedCourses).toContain(course.courseId);
    });

    it('应该正确处理BigInt类型的计算', () => {
      const course: Course = {
        courseId: '1',
        title: 'Test',
        description: 'Test',
        price: BigInt('1000000000000000000'), // 1 ETH
        creator: '0x123',
        isActive: true,
        createdAt: BigInt('1634567890')
      };

      // BigInt计算测试
      const doublePrice = course.price * BigInt('2');
      const halfPrice = course.price / BigInt('2');

      expect(doublePrice).toBe(BigInt('2000000000000000000'));
      expect(halfPrice).toBe(BigInt('500000000000000000'));
    });

    it('应该正确处理地址格式验证', () => {
      const isValidAddress = (address: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      };

      const validCourse: Course = {
        courseId: '1',
        title: 'Test',
        description: 'Test',
        price: BigInt('1'),
        creator: '0x1234567890123456789012345678901234567890',
        isActive: true,
        createdAt: BigInt('1')
      };

      const validUserData: UserData = {
        address: '0x9876543210987654321098765432109876543210',
        name: 'Test',
        purchasedCourses: []
      };

      expect(isValidAddress(validCourse.creator)).toBe(true);
      expect(isValidAddress(validUserData.address)).toBe(true);
    });

    it('应该正确处理TokenExchangeProps的数值转换', () => {
      const exchangeProps: TokenExchangeProps = {
        ethAmount: '1.5',
        tokenAmount: '6000'
      };

      const ethAsNumber = parseFloat(exchangeProps.ethAmount);
      const tokenAsNumber = parseFloat(exchangeProps.tokenAmount);

      expect(ethAsNumber).toBe(1.5);
      expect(tokenAsNumber).toBe(6000);
      expect(typeof ethAsNumber).toBe('number');
      expect(typeof tokenAsNumber).toBe('number');
    });
  });

  describe('类型守卫函数测试', () => {
    it('应该正确识别Course类型', () => {
      const isCourse = (obj: any): obj is Course => {
        return obj &&
          typeof obj.courseId === 'string' &&
          typeof obj.title === 'string' &&
          typeof obj.description === 'string' &&
          typeof obj.price === 'bigint' &&
          typeof obj.creator === 'string' &&
          typeof obj.isActive === 'boolean' &&
          typeof obj.createdAt === 'bigint';
      };

      const validCourse = {
        courseId: '1',
        title: 'Test',
        description: 'Test',
        price: BigInt('1'),
        creator: '0x123',
        isActive: true,
        createdAt: BigInt('1')
      };

      const invalidCourse = {
        courseId: '1',
        title: 'Test',
        description: 'Test',
        price: '1', // 错误类型
        creator: '0x123',
        isActive: true,
        createdAt: BigInt('1')
      };

      expect(isCourse(validCourse)).toBe(true);
      expect(isCourse(invalidCourse)).toBe(false);
    });

    it('应该正确识别UserData类型', () => {
      const isUserData = (obj: any): obj is UserData => {
        return obj &&
          typeof obj.address === 'string' &&
          typeof obj.name === 'string' &&
          Array.isArray(obj.purchasedCourses) &&
          obj.purchasedCourses.every((course: any) => typeof course === 'string');
      };

      const validUserData = {
        address: '0x123',
        name: 'Test',
        purchasedCourses: ['course1', 'course2']
      };

      const invalidUserData = {
        address: '0x123',
        name: 'Test',
        purchasedCourses: [1, 2] // 错误类型
      };

      expect(isUserData(validUserData)).toBe(true);
      expect(isUserData(invalidUserData)).toBe(false);
    });
  });
});