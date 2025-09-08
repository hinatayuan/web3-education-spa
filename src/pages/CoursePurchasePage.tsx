import { TokenExchange } from '../components/TokenExchange';
import { CourseList } from '../components/CourseList';

export const CoursePurchasePage = () => {
  return (
    <div className="course-purchase-page">
      <main className="main-content">
        <section className="token-section">
          <TokenExchange />
        </section>

        <section className="courses-section">
          <CourseList />
        </section>
      </main>
    </div>
  );
};
