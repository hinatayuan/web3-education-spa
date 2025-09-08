import { CourseCreationForm } from '../components/CourseCreationForm';
import { CreatorCourseList } from '../components/CreatorCourseList';
import { StakingSystem } from '../components/StakingSystem';

export const CreatorPlatformPage = () => {
  return (
    <div className="creator-platform-page">
      <main className="main-content">
        <section className="creator-courses-section">
          <CreatorCourseList />
        </section>

        <section className="course-creation-section">
          <CourseCreationForm />
        </section>

        <section className="staking-section">
          <StakingSystem />
        </section>
      </main>
    </div>
  );
};
