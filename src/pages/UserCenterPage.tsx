import { UserProfile } from '../components/UserProfile';
import { PurchasedCoursesList } from '../components/PurchasedCoursesList';

export const UserCenterPage = () => {
  return (
    <div className="user-center-page">
      <main className="main-content">
        <section className="profile-section">
          <UserProfile />
        </section>

        <section className="purchased-courses-section">
          <PurchasedCoursesList />
        </section>
      </main>
    </div>
  );
};
