import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { useCourseData, useCourse } from '../hooks/useContracts';
import { useMemo } from 'react';

const CreatorCourseItem = ({
  courseId,
  userAddress,
}: {
  courseId: string;
  userAddress: string | undefined;
}) => {
  const course = useCourse(courseId);

  // 如果课程数据还没加载完成
  if (!course) {
    return (
      <div className="table-row loading">
        <div>加载中...</div>
      </div>
    );
  }

  // 只显示当前用户创建的课程
  if (!userAddress || course.creator.toLowerCase() !== userAddress.toLowerCase()) {
    return null;
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="table-row">
      <div className="course-id">{course.courseId}</div>
      <div className="course-title">{course.title}</div>
      <div className="course-price">{formatEther(course.price)} YD</div>
      <div className={`course-status ${course.isActive ? 'active' : 'inactive'}`}>
        {course.isActive ? '销售中' : '已暂停'}
      </div>
      <div className="course-date">{formatDate(course.createdAt)}</div>
    </div>
  );
};

export const CreatorCourseList = () => {
  const { address } = useAccount();
  const { allCourseIds } = useCourseData();

  // 过滤出当前用户创建的课程（只显示courseId，具体数据在子组件中获取）
  const creatorCourseIds = useMemo(() => {
    return allCourseIds; // 暂时返回所有ID，让子组件自己判断是否显示
  }, [allCourseIds]);

  if (!address) {
    return (
      <div className="creator-courses">
        <h3>我的课程</h3>
        <p>请先连接钱包查看您创建的课程</p>
      </div>
    );
  }

  return (
    <div className="creator-courses">
      <h3>我的课程</h3>
      <div className="courses-table">
        <div className="table-header">
          <div>课程ID</div>
          <div>标题</div>
          <div>价格</div>
          <div>状态</div>
          <div>创建时间</div>
        </div>
        {creatorCourseIds.map(courseId => (
          <CreatorCourseItem key={courseId} courseId={courseId} userAddress={address} />
        ))}
      </div>
    </div>
  );
};
