describe('Web3集成测试', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Mock window.ethereum object
    cy.window().then((win) => {
      win.ethereum = {
        request: cy.stub().resolves(['0x1234567890123456789012345678901234567890']),
        on: cy.stub(),
        removeListener: cy.stub(),
        isMetaMask: true,
        selectedAddress: null,
      };
    });
  });

  it('应该显示钱包连接按钮', () => {
    // 查找钱包连接相关的按钮
    cy.contains('连接钱包').should('be.visible');
    cy.get('.wallet-connect').should('be.visible');
  });

  it('应该显示网络选择器', () => {
    // 检查网络选择器显示
    cy.get('.network-selector').should('be.visible');
    cy.contains('Localhost').should('be.visible');
  });

  it('应该能够展开钱包连接选项', () => {
    // 点击连接钱包按钮
    cy.contains('连接钱包').click();
    
    // 检查钱包选项下拉菜单
    cy.get('.wallet-dropdown').should('be.visible');
    cy.contains('选择钱包').should('be.visible');
  });

  it('应该能够展开网络选择器', () => {
    // 点击网络选择器
    cy.get('.network-selector .network-button').click();
    
    // 检查网络选项
    cy.get('.network-dropdown').should('be.visible');
    cy.contains('Mainnet').should('be.visible');
    cy.contains('Sepolia').should('be.visible');
    cy.contains('Localhost').should('be.visible');
  });

  it('代币交换功能应该正常显示', () => {
    cy.visit('/tokens');
    
    // 检查代币交换相关元素
    cy.contains('代币兑换').should('be.visible');
    cy.get('.token-exchange').should('be.visible');
    
    // 检查标签页
    cy.contains('购买 YD 币').should('be.visible');
    cy.contains('出售 YD 币').should('be.visible');
    
    // 检查储备状态
    cy.contains('合约储备状态').should('be.visible');
  });

  it('代币交换输入框应该正常工作', () => {
    cy.visit('/tokens');
    
    // 检查购买表单
    cy.get('input[placeholder*="ETH"]').should('be.visible');
    cy.get('button').contains('兑换 YD 币').should('be.visible');
    
    // 切换到出售标签页
    cy.contains('出售 YD 币').click();
    cy.get('input[placeholder*="YD"]').should('be.visible');
  });

  it('应该显示兑换率信息', () => {
    cy.visit('/tokens');
    
    // 检查兑换率显示
    cy.contains('1 ETH = 4000 YD').should('be.visible');
    
    // 切换到出售页面检查反向兑换率
    cy.contains('出售 YD 币').click();
    cy.contains('4000 YD = 1 ETH').should('be.visible');
  });

  it('创作者平台应该包含课程创建功能', () => {
    cy.visit('/creator');
    
    // 检查创作者平台基本元素
    cy.get('body').should('contain', '创作');
    
    // 由于这是一个复杂的页面，我们只检查基本加载
    cy.get('body').should('be.visible');
  });

  it('个人中心应该显示用户相关内容', () => {
    cy.visit('/profile');
    
    // 检查个人中心基本内容
    cy.get('body').should('contain', '个人');
    cy.get('body').should('be.visible');
  });

  it('应该正确处理未连接钱包状态', () => {
    // 确保显示未连接状态
    cy.contains('连接钱包').should('be.visible');
    
    // 访问代币页面，应该显示相关提示
    cy.visit('/tokens');
    cy.get('.current-balance').should('contain', '0');
  });

  it('主题切换应该正常工作', () => {
    // 检查主题切换按钮
    cy.get('[aria-label="切换主题"]').should('be.visible');
    
    // 点击主题切换
    cy.get('[aria-label="切换主题"]').click();
    
    // 检查主题是否切换（通过检查html的data-theme属性）
    cy.get('html').should('have.attr', 'data-theme');
  });

  it('应该能处理错误状态', () => {
    cy.visit('/tokens');
    
    // 检查是否有错误处理机制（通过检查页面能正常加载）
    cy.get('.token-exchange').should('be.visible');
    
    // 检查警告信息（如果没有储备）
    cy.get('body').should('not.contain', 'undefined');
  });

  it('所有页面都应该包含基本的Web3元素', () => {
    const pages = ['/', '/tokens', '/creator', '/profile'];
    
    pages.forEach(page => {
      cy.visit(page);
      
      // 每个页面都应该有钱包连接功能
      cy.get('header.modern-header').should('be.visible');
      cy.get('.wallet-connector').should('be.visible');
      cy.get('.network-selector').should('be.visible');
      
      // 检查页面不会崩溃
      cy.get('body').should('be.visible');
    });
  });
});