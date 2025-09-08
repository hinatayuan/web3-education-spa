import { useState } from 'react';
import { CourseList } from '../components/CourseList';
import { useCourseData } from '../hooks/useContracts';

export const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { allCourseIds } = useCourseData();

  const sortOptions = [
    { value: 'newest', label: '最新课程' },
    { value: 'popular', label: '最受欢迎' },
    { value: 'price-low', label: '价格从低到高' },
    { value: 'price-high', label: '价格从高到低' },
  ];

  return (
    <div className="courses-page">
      <div className="page-container">
        {/* 课程搜索和排序栏 */}
        <div className="courses-filter-bar">
          <div className="search-container">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="搜索课程..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="sort-container">
            <label htmlFor="sort-select" className="sort-label">
              排序：
            </label>
            <div className="sort-select-wrapper">
              <select
                id="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="sort-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg className="sort-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 课程列表区域 */}
        <div className="courses-content">
          <div className="courses-header">
            <h2>所有课程 ({allCourseIds.length})</h2>
            {searchTerm && <p className="search-results">搜索结果: "{searchTerm}"</p>}
          </div>

          <CourseList searchTerm={searchTerm} sortBy={sortBy} />

          {/* 如果没有课程 */}
          {allCourseIds.length === 0 && (
            <div className="no-courses">
              <div className="no-courses-icon">📚</div>
              <h3>暂无课程</h3>
              <p>课程正在准备中，敬请期待...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
