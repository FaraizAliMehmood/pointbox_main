import { NavBar } from '@/components/common/NavBar';
import { Footer } from '@/components/common/Footer';
import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <>
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
