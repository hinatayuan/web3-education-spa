import Loading from '@components/common/Loading';
import PageNotFoundView from '@components/common/PageNotFoundView';
import MainLayout from '@layouts/Layout';
import { CoursesPage } from '@pages/CoursesPage';
import { TokensPage } from '@pages/TokensPage';
import { CreatorPlatformPage } from '@pages/CreatorPlatformPage';
import { UserCenterPage } from '@pages/UserCenterPage';
import { Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
const Layout = () => (
  <Suspense fallback={<Loading />}>
    <MainLayout />
  </Suspense>
);

//懒加载

const Routes: RouteObject[] = [];

const mainRoutes = {
  path: '/',
  element: <Layout />,
  children: [
    { path: '*', element: <PageNotFoundView /> },
    { path: '/', element: <CoursesPage /> },
    { path: '/tokens', element: <TokensPage /> },
    { path: '/creator', element: <CreatorPlatformPage /> },
    { path: '/profile', element: <UserCenterPage /> },
    { path: '404', element: <PageNotFoundView /> },
  ],
};

Routes.push(mainRoutes);

export default Routes;
