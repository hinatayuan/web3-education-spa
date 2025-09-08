describe('导航测试', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('应该能够导航到代币页面', () => {
    // 导航到代币页面
    cy.contains('代币兑换').click();
    cy.url().should('include', '/tokens');
    
    // 检查页面内容
    cy.get('body').should('contain', '代币兑换');
  });

  it('应该能够导航到创作者平台', () => {
    // 导航到创作者平台
    cy.contains('创作中心').click();
    cy.url().should('include', '/creator');
    
    // 检查页面内容
    cy.get('body').should('contain', '创作');
  });

  it('应该能够导航到个人中心', () => {
    // 查找并点击个人中心链接
    cy.contains('个人中心').click();
    cy.url().should('include', '/profile');
    
    // 检查页面内容
    cy.get('body').should('contain', '个人');
  });

  it('应该能够返回课程中心', () => {
    // 先导航到其他页面
    cy.contains('代币兑换').click();
    cy.url().should('include', '/tokens');
    
    // 返回课程中心（首页）
    cy.contains('课程中心').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('应该显示404页面当访问不存在的路由', () => {
    // 访问不存在的路由
    cy.visit('/nonexistent-page', { failOnStatusCode: false });
    
    // 检查404页面元素
    cy.contains('404').should('be.visible');
    cy.contains('页面未找到').should('be.visible');
    cy.contains('抱歉，您请求的页面不存在或已被移除').should('be.visible');
    
    // 检查返回按钮
    cy.contains('返回上页').should('be.visible');
    cy.contains('返回首页').should('be.visible');
  });

  it('404页面的返回按钮应该正常工作', () => {
    // 先访问一个正常页面
    cy.visit('/tokens');
    
    // 然后访问404页面
    cy.visit('/nonexistent-page', { failOnStatusCode: false });
    
    // 点击返回上页按钮
    cy.contains('返回上页').click();
    
    // 应该返回到上一页
    cy.url().should('include', '/tokens');
  });

  it('404页面的返回首页链接应该正常工作', () => {
    cy.visit('/nonexistent-page', { failOnStatusCode: false });
    
    // 点击返回首页链接
    cy.contains('返回首页').click();
    
    // 应该返回到首页
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('应该在所有页面保持导航一致性', () => {
    const pages = ['/tokens', '/creator', '/profile'];
    
    pages.forEach(page => {
      cy.visit(page);
      
      // 检查导航头部是否存在
      cy.get('header.modern-header').should('be.visible');
      
      // 检查主要导航链接
      cy.contains('课程中心').should('be.visible');
      cy.contains('代币兑换').should('be.visible');
      cy.contains('创作中心').should('be.visible');
      cy.contains('个人中心').should('be.visible');
      
      // 检查品牌logo
      cy.get('.brand-logo').should('be.visible');
      cy.contains('Web3大学').should('be.visible');
    });
  });

  it('浏览器前进后退按钮应该正常工作', () => {
    // 导航到代币页面
    cy.contains('代币兑换').click();
    cy.url().should('include', '/tokens');
    
    // 导航到创作中心
    cy.contains('创作中心').click();
    cy.url().should('include', '/creator');
    
    // 使用浏览器后退按钮
    cy.go('back');
    cy.url().should('include', '/tokens');
    
    // 使用浏览器前进按钮
    cy.go('forward');
    cy.url().should('include', '/creator');
  });

  it('导航链接应该有正确的激活状态', () => {
    // 检查首页激活状态
    cy.get('a[href="/"]').should('have.class', 'active');
    
    // 导航到代币页面
    cy.contains('代币兑换').click();
    cy.get('a[href="/tokens"]').should('have.class', 'active');
    
    // 导航到创作中心
    cy.contains('创作中心').click();
    cy.get('a[href="/creator"]').should('have.class', 'active');
    
    // 导航到个人中心
    cy.contains('个人中心').click();
    cy.get('a[href="/profile"]').should('have.class', 'active');
  });

  it('品牌logo点击应该返回首页', () => {
    // 先导航到其他页面
    cy.contains('代币兑换').click();
    cy.url().should('include', '/tokens');
    
    // 点击品牌logo
    cy.get('.brand-logo-link').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});