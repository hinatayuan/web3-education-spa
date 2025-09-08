import { useMemo } from 'react';
import { useCourseData, useCourse } from '../hooks/useContracts';
import { CourseCard } from './CourseCard';

interface CourseListProps {
  searchTerm?: string;
  sortBy?: string;
}

const FilteredCourseItem = ({ courseId, searchTerm }: { courseId: string; searchTerm: string }) => {
  const course = useCourse(courseId);

  if (!course) {
    return (
      <div className="course-card-loading">
        <p>加载中...</p>
      </div>
    );
  }

  // 应用搜索过滤
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(searchLower) ||
      course.description.toLowerCase().includes(searchLower);

    if (!matchesSearch) {
      return null;
    }
  }

  return <CourseCard course={course} />;
};

export const CourseList = ({ searchTerm = '', sortBy = 'newest' }: CourseListProps) => {
  const { allCourseIds } = useCourseData();

  // 简单的课程ID排序（基于ID字符串排序，实际应用中可能需要更复杂的逻辑）
  const sortedCourseIds = useMemo(() => {
    if (!allCourseIds.length) return [];

    const ids = [...allCourseIds];

    switch (sortBy) {
      case 'newest':
        return ids.reverse(); // 假设ID越大越新
      case 'popular':
        return ids; // 保持原序（可以后续添加流行度逻辑）
      case 'price-low':
      case 'price-high':
        return ids; // 价格排序需要课程数据，暂时保持原序
      default:
        return ids;
    }
  }, [allCourseIds, sortBy]);

  if (!sortedCourseIds.length) {
    return (
      <div className="course-list-empty">
        <p>暂无课程，敬请期待...</p>
      </div>
    );
  }

  const visibleCourses = sortedCourseIds
    .map(courseId => (
      <FilteredCourseItem key={courseId} courseId={courseId} searchTerm={searchTerm} />
    ))
    .filter(Boolean);

  if (visibleCourses.length === 0 && searchTerm) {
    return (
      <div className="course-list-empty">
        <p>未找到匹配的课程，请尝试其他搜索关键词...</p>
      </div>
    );
  }

  return (
    <div className="course-list">
      <div className="courses-grid">{visibleCourses}</div>
    </div>
  );
};
