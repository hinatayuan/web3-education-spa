import { useCourseData } from '../hooks/useContracts';

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  description: string;
}

export const StatsSection = () => {
  const { allCourseIds } = useCourseData();

  // 模拟数据 - 在实际项目中这些数据可能来自后端API
  const stats: StatItem[] = [
    {
      label: '活跃学员',
      value: '2,580+',
      icon: '👥',
      description: '来自全球的Web3学习者',
    },
    {
      label: '精品课程',
      value: allCourseIds.length || 12,
      icon: '📚',
      description: '由行业专家精心设计',
    },
    {
      label: '完课率',
      value: '94%',
      icon: '🎯',
      description: '学员平均完课率',
    },
    {
      label: '就业率',
      value: '87%',
      icon: '💼',
      description: '学员成功就业比例',
    },
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        <div className="stats-header">
          <h2>用数据说话</h2>
          <p>专业的Web3教育平台，值得信赖的学习选择</p>
        </div>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
