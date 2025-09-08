describe('核心功能测试', () => {
  describe('地址工具函数', () => {
    it('应该正确格式化以太坊地址', () => {
      const formatAddress = (address: string): string => {
        if (!address || address.length < 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      };

      expect(formatAddress('0x1234567890123456789012345678901234567890'))
        .toBe('0x1234...7890');
      expect(formatAddress('0x123')).toBe('0x123');
      expect(formatAddress('')).toBe('');
    });

    it('应该验证地址格式', () => {
      const isValidAddress = (address: string): boolean => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      };

      expect(isValidAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(isValidAddress('0x123')).toBe(false);
      expect(isValidAddress('invalid')).toBe(false);
      expect(isValidAddress('')).toBe(false);
    });
  });

  describe('代币计算功能', () => {
    it('应该正确计算代币兑换数量', () => {
      const calculateTokenAmount = (ethAmount: number, rate: number): number => {
        return ethAmount * rate;
      };

      expect(calculateTokenAmount(1, 4000)).toBe(4000);
      expect(calculateTokenAmount(0.5, 4000)).toBe(2000);
      expect(calculateTokenAmount(0, 4000)).toBe(0);
    });

    it('应该正确计算ETH数量', () => {
      const calculateEthAmount = (tokenAmount: number, rate: number): number => {
        return tokenAmount / rate;
      };

      expect(calculateEthAmount(4000, 4000)).toBe(1);
      expect(calculateEthAmount(2000, 4000)).toBe(0.5);
      expect(calculateEthAmount(0, 4000)).toBe(0);
    });

    it('应该处理BigInt计算', () => {
      const addBigInt = (a: bigint, b: bigint): bigint => a + b;
      const subtractBigInt = (a: bigint, b: bigint): bigint => a - b;
      const multiplyBigInt = (a: bigint, b: bigint): bigint => a * b;

      expect(addBigInt(100n, 200n)).toBe(300n);
      expect(subtractBigInt(500n, 200n)).toBe(300n);
      expect(multiplyBigInt(100n, 4n)).toBe(400n);
    });
  });

  describe('Web3状态管理', () => {
    it('应该管理钱包连接状态', () => {
      interface WalletState {
        isConnected: boolean;
        address: string | null;
        chainId: number | null;
      }

      const createWalletState = (): WalletState => ({
        isConnected: false,
        address: null,
        chainId: null,
      });

      const connectWallet = (
        state: WalletState, 
        address: string, 
        chainId: number
      ): WalletState => ({
        ...state,
        isConnected: true,
        address,
        chainId,
      });

      const disconnectWallet = (state: WalletState): WalletState => ({
        ...state,
        isConnected: false,
        address: null,
        chainId: null,
      });

      let walletState = createWalletState();
      expect(walletState.isConnected).toBe(false);

      walletState = connectWallet(walletState, '0x123...abc', 1);
      expect(walletState.isConnected).toBe(true);
      expect(walletState.address).toBe('0x123...abc');
      expect(walletState.chainId).toBe(1);

      walletState = disconnectWallet(walletState);
      expect(walletState.isConnected).toBe(false);
      expect(walletState.address).toBe(null);
    });

    it('应该管理交易状态', () => {
      type TransactionStatus = 'idle' | 'pending' | 'confirmed' | 'failed';

      interface Transaction {
        hash: string | null;
        status: TransactionStatus;
        error: string | null;
      }

      const createTransaction = (): Transaction => ({
        hash: null,
        status: 'idle',
        error: null,
      });

      const startTransaction = (tx: Transaction, hash: string): Transaction => ({
        ...tx,
        hash,
        status: 'pending',
        error: null,
      });

      const confirmTransaction = (tx: Transaction): Transaction => ({
        ...tx,
        status: 'confirmed',
      });

      const failTransaction = (tx: Transaction, error: string): Transaction => ({
        ...tx,
        status: 'failed',
        error,
      });

      let tx = createTransaction();
      expect(tx.status).toBe('idle');

      tx = startTransaction(tx, '0xabc123');
      expect(tx.status).toBe('pending');
      expect(tx.hash).toBe('0xabc123');

      tx = confirmTransaction(tx);
      expect(tx.status).toBe('confirmed');

      // 测试失败情况
      tx = createTransaction();
      tx = startTransaction(tx, '0xdef456');
      tx = failTransaction(tx, 'Gas limit exceeded');
      expect(tx.status).toBe('failed');
      expect(tx.error).toBe('Gas limit exceeded');
    });
  });

  describe('课程数据处理', () => {
    interface Course {
      courseId: bigint;
      title: string;
      description: string;
      price: bigint;
      creator: string;
      isActive: boolean;
    }

    it('应该创建课程对象', () => {
      const createCourse = (
        courseId: bigint,
        title: string,
        description: string,
        price: bigint,
        creator: string
      ): Course => ({
        courseId,
        title,
        description,
        price,
        creator,
        isActive: true,
      });

      const course = createCourse(
        1n,
        'Web3开发入门',
        '学习区块链开发',
        100n * 10n**18n,
        '0x123...abc'
      );

      expect(course.courseId).toBe(1n);
      expect(course.title).toBe('Web3开发入门');
      expect(course.price).toBe(100000000000000000000n);
      expect(course.isActive).toBe(true);
    });

    it('应该过滤活跃课程', () => {
      const courses: Course[] = [
        {
          courseId: 1n,
          title: '课程1',
          description: '描述1',
          price: 100n,
          creator: '0x123',
          isActive: true,
        },
        {
          courseId: 2n,
          title: '课程2',
          description: '描述2',
          price: 200n,
          creator: '0x456',
          isActive: false,
        },
        {
          courseId: 3n,
          title: '课程3',
          description: '描述3',
          price: 300n,
          creator: '0x789',
          isActive: true,
        },
      ];

      const getActiveCourses = (courses: Course[]): Course[] => {
        return courses.filter(course => course.isActive);
      };

      const activeCourses = getActiveCourses(courses);
      expect(activeCourses).toHaveLength(2);
      expect(activeCourses[0].courseId).toBe(1n);
      expect(activeCourses[1].courseId).toBe(3n);
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', () => {
      const handleNetworkError = (error: Error): string => {
        if (error.message.includes('network')) {
          return '网络连接错误，请检查网络设置';
        }
        if (error.message.includes('timeout')) {
          return '请求超时，请重试';
        }
        return '未知错误';
      };

      expect(handleNetworkError(new Error('network connection failed')))
        .toBe('网络连接错误，请检查网络设置');
      expect(handleNetworkError(new Error('request timeout')))
        .toBe('请求超时，请重试');
      expect(handleNetworkError(new Error('something else')))
        .toBe('未知错误');
    });

    it('应该处理合约调用错误', () => {
      const handleContractError = (error: any): string => {
        if (error.reason) {
          return `合约错误: ${error.reason}`;
        }
        if (error.code === 4001) {
          return '用户拒绝了交易';
        }
        if (error.code === -32603) {
          return '交易执行失败';
        }
        return '合约调用失败';
      };

      expect(handleContractError({ reason: 'insufficient funds' }))
        .toBe('合约错误: insufficient funds');
      expect(handleContractError({ code: 4001 }))
        .toBe('用户拒绝了交易');
      expect(handleContractError({ code: -32603 }))
        .toBe('交易执行失败');
      expect(handleContractError({}))
        .toBe('合约调用失败');
    });
  });

  describe('数据验证', () => {
    it('应该验证表单输入', () => {
      const validateCourseForm = (data: {
        title: string;
        description: string;
        price: string;
      }): string[] => {
        const errors: string[] = [];
        
        if (!data.title.trim()) {
          errors.push('课程标题不能为空');
        }
        
        if (data.title.length > 100) {
          errors.push('课程标题不能超过100个字符');
        }
        
        if (!data.description.trim()) {
          errors.push('课程描述不能为空');
        }
        
        const price = parseFloat(data.price);
        if (isNaN(price) || price <= 0) {
          errors.push('课程价格必须大于0');
        }
        
        return errors;
      };

      // 有效数据
      expect(validateCourseForm({
        title: '有效课程',
        description: '有效描述',
        price: '10'
      })).toEqual([]);

      // 无效数据
      const errors = validateCourseForm({
        title: '',
        description: '',
        price: '-1'
      });
      expect(errors).toContain('课程标题不能为空');
      expect(errors).toContain('课程描述不能为空');
      expect(errors).toContain('课程价格必须大于0');
    });
  });
});