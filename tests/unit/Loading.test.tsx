import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loading from '../../src/components/common/Loading';

afterEach(cleanup);

describe('Loading组件测试', () => {
  it('应该正确渲染Loading组件', () => {
    render(<Loading />);
    
    // 检查是否有旋转动画元素
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    
    // 检查是否有默认的文本颜色类
    expect(spinner).toHaveClass('text-blue-600');
    
    // 检查是否有默认的尺寸类
    expect(spinner).toHaveClass('w-8', 'h-8');
  });

  it('应该正确渲染Loading组件的DOM结构', () => {
    render(<Loading />);
    
    // 检查外层容器
    const container = document.querySelector('.flex.flex-col.items-center.justify-center.gap-3');
    expect(container).toBeInTheDocument();
    
    // 检查旋转元素
    const spinner = document.querySelector('.animate-spin.rounded-full.border-4.border-t-transparent');
    expect(spinner).toBeInTheDocument();
    
    // 检查文本元素
    const text = document.querySelector('.text-gray-600');
    expect(text).toBeInTheDocument();
    expect(text).toHaveTextContent('Loading...');
  });

  it('应该能够多次渲染而不出错', () => {
    const { unmount } = render(<Loading />);
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    
    unmount();
    
    // 重新渲染新的实例
    render(<Loading />);
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});