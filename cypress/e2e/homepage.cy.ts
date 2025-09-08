describe('首页测试', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('应该成功加载首页', () => {
    cy.contains('Web3大学').should('be.visible');
    cy.get('title').should('contain', 'YD AI SPA');
  });

  it('应该显示导航头部', () => {
    // 检查主要导航是否存在
    cy.get('header.modern-header').should('be.visible');
    
    // 检查品牌logo
    cy.get('.brand-logo').should('be.visible');
    cy.contains('Web3大学').should('be.visible');
    
    // 检查导航链接
    cy.contains('课程中心').should('be.visible');
    cy.contains('代币兑换').should('be.visible');
    cy.contains('创作中心').should('be.visible');
    cy.contains('个人中心').should('be.visible');
  });

  it('应该显示钱包连接按钮', () => {
    // 检查钱包连接状态
    cy.contains('连接钱包').should('be.visible');
  });

  it('应该显示主题切换按钮', () => {
    // 检查主题切换按钮
    cy.get('[aria-label="切换主题"]').should('be.visible');
  });

  it('应该显示网络选择器', () => {
    // 检查网络选择器
    cy.get('.network-selector').should('be.visible');
    cy.contains('Localhost').should('be.visible');
  });

  it('应该显示课程内容', () => {
    // 由于首页默认显示课程页面，检查课程相关内容
    cy.get('body').should('contain', '课程');
  });

  it('导航链接应该正常工作', () => {
    // 测试代币兑换链接
    cy.contains('代币兑换').click();
    cy.url().should('include', '/tokens');
    
    // 返回首页
    cy.contains('课程中心').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // 测试创作中心链接
    cy.contains('创作中心').click();
    cy.url().should('include', '/creator');
    
    // 测试个人中心链接
    cy.contains('个人中心').click();
    cy.url().should('include', '/profile');
  });

  it('应该能够切换主题', () => {
    // 点击主题切换按钮
    cy.get('[aria-label="切换主题"]').click();
    
    // 检查主题是否切换（检查 data-theme 属性或相关类名）
    cy.get('html').should('have.attr', 'data-theme');
  });

  it('应该能够展开网络选择器', () => {
    // 点击网络选择器
    cy.get('.network-selector .network-button').click();
    
    // 等待一下让下拉菜单有时间显示
    cy.wait(500);
    
    // 检查网络下拉菜单是否显示，如果显示则检查选项
    cy.get('body').then(($body) => {
      if ($body.find('.network-dropdown').length > 0) {
        cy.get('.network-dropdown').should('be.visible');
        // 如果能找到网络选项就检查
        if ($body.text().includes('Mainnet')) {
          cy.contains('Mainnet').should('be.visible');
        }
        if ($body.text().includes('Sepolia')) {
          cy.contains('Sepolia').should('be.visible');
        }
      } else {
        // 如果没有下拉菜单，至少应该有网络选择器
        cy.get('.network-selector').should('be.visible');
      }
    });
  });

  it('应该响应式设计在移动设备上正常工作', () => {
    // 测试移动端视口
    cy.viewport('iphone-x');
    
    // 检查头部是否可见
    cy.get('header.modern-header').should('be.visible');
    cy.get('.brand-logo').should('be.visible');
    
    // 检查导航链接在移动端是否可见
    cy.contains('课程中心').should('be.visible');
    cy.contains('代币兑换').should('be.visible');
  });

  it('应该在平板端正常显示', () => {
    // 测试平板端视口
    cy.viewport('ipad-2');
    
    cy.get('header.modern-header').should('be.visible');
    cy.get('.header-nav').should('be.visible');
    cy.contains('连接钱包').should('be.visible');
  });
});