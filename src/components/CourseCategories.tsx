import React from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  courseCount: number;
  color: string;
}

interface CourseCategoriesProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
}

export const CourseCategories = ({
  onCategorySelect,
  selectedCategory = 'all',
}: CourseCategoriesProps) => {
  // 课程分类数据
  const categories: Category[] = [
    {
      id: 'all',
      name: '全部课程',
      icon: '📋',
      description: '浏览所有可用课程',
      courseCount: 24,
      color: '#6366f1',
    },
    {
      id: 'blockchain-basics',
      name: '区块链基础',
      icon: '🔗',
      description: '从零开始学习区块链技术',
      courseCount: 8,
      color: '#10b981',
    },
    {
      id: 'smart-contracts',
      name: '智能合约',
      icon: '🤖',
      description: 'Solidity开发与部署',
      courseCount: 6,
      color: '#f59e0b',
    },
    {
      id: 'defi',
      name: 'DeFi应用',
      icon: '💰',
      description: '去中心化金融协议',
      courseCount: 5,
      color: '#ec4899',
    },
    {
      id: 'nft',
      name: 'NFT开发',
      icon: '🎨',
      description: '数字资产与收藏品',
      courseCount: 3,
      color: '#8b5cf6',
    },
    {
      id: 'trading',
      name: '量化交易',
      icon: '📈',
      description: 'Web3交易策略与工具',
      courseCount: 2,
      color: '#06b6d4',
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  return (
    <section className="course-categories">
      <div className="categories-container">
        <div className="categories-header">
          <h2>课程分类</h2>
          <p>选择您感兴趣的领域，开始Web3学习之旅</p>
        </div>

        <div className="categories-grid">
          {categories.map(category => (
            <div
              key={category.id}
              className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
              style={{ '--category-color': category.color } as React.CSSProperties}
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-content">
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-meta">
                  <span className="course-count">{category.courseCount} 门课程</span>
                </div>
              </div>
              <div className="category-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
