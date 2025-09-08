describe('基础测试', () => {
  it('应该能够运行基本测试', () => {
    expect(true).toBe(true);
  });

  it('应该能够处理数字计算', () => {
    expect(1 + 1).toBe(2);
  });

  it('应该能够处理字符串操作', () => {
    const address = '0x1234567890123456789012345678901234567890';
    const formatted = `${address.slice(0, 6)}...${address.slice(-4)}`;
    expect(formatted).toBe('0x1234...7890');
  });

  it('应该能够处理BigInt', () => {
    const a = 100n;
    const b = 200n;
    expect(a + b).toBe(300n);
  });

  it('应该能够处理对象', () => {
    const course = {
      id: 1,
      title: 'Test Course',
      price: 1000n
    };
    
    expect(course.id).toBe(1);
    expect(course.title).toBe('Test Course');
    expect(course.price).toBe(1000n);
  });

  it('应该能够处理数组', () => {
    const courses = ['Course 1', 'Course 2', 'Course 3'];
    expect(courses).toHaveLength(3);
    expect(courses[0]).toBe('Course 1');
  });

  it('应该能够处理异步操作', async () => {
    const promise = Promise.resolve('success');
    const result = await promise;
    expect(result).toBe('success');
  });

  it('应该能够Mock函数', () => {
    const mockFn = jest.fn();
    mockFn('test');
    expect(mockFn).toHaveBeenCalledWith('test');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应该能够处理错误', () => {
    const throwError = () => {
      throw new Error('Test error');
    };
    
    expect(throwError).toThrow('Test error');
  });

  it('应该能够处理条件逻辑', () => {
    const isConnected = false;
    const needsApproval = true;
    
    if (isConnected && needsApproval) {
      expect(true).toBe(false); // 不应该执行
    } else {
      expect(true).toBe(true); // 应该执行
    }
  });
});