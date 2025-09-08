import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useUserPurchasedCourses, useCourse } from '../hooks/useContracts';

const PurchasedCourseItem = ({ courseId }: { courseId: string }) => {
  const course = useCourse(courseId);

  if (!course) {
    return (
      <div className="course-item loading">
        <p>加载中...</p>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="course-item">
      <div className="course-header">
        <h4>{course.title}</h4>
        <span className="course-price">{formatEther(course.price)} YD</span>
      </div>

      <div className="course-body">
        <p className="course-description">{course.description}</p>
        <div className="course-meta">
          <span className="creator">
            创建者: {course.creator.slice(0, 6)}...{course.creator.slice(-4)}
          </span>
          <span className="date">创建时间: {formatDate(course.createdAt)}</span>
        </div>
      </div>

      <div className="course-actions">
        <button className="access-btn">✓ 已购买 - 可访问</button>
      </div>
    </div>
  );
};

export const PurchasedCoursesList = () => {
  const { address } = useAccount();
  const { purchasedCourses } = useUserPurchasedCourses(address || '');

  if (!address) {
    return (
      <div className="purchased-courses">
        <h3>我购买的课程</h3>
        <p>请先连接钱包查看已购买的课程</p>
      </div>
    );
  }

  if (!purchasedCourses.length) {
    return (
      <div className="purchased-courses">
        <h3>我购买的课程</h3>
        <p>您还没有购买任何课程</p>
      </div>
    );
  }

  return (
    <div className="purchased-courses">
      <h3>我购买的课程 ({purchasedCourses.length})</h3>
      <div className="courses-list">
        {purchasedCourses.map(courseId => (
          <PurchasedCourseItem key={courseId} courseId={courseId} />
        ))}
      </div>
    </div>
  );
};
