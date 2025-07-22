import { Outlet } from 'react-router';
import Navbar from './pages/Navbar';
import Footer from './pages/Footer';

function App() {
  return (
    <div className='min-h-screen flex flex-col px-3'>
      <Navbar />
      <div className='flex-1 w-full mx-auto'>
        <Outlet />
      </div>
      <Footer/>
    </div>
  );
}

export default App;
