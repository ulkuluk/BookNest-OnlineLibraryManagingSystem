import{BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BookDetailPage from './components/BookDetailPage';
import LoginPage from './components/LoginPage';
import ReservationPage from './components/ReservationPage';
import ReservationAdminPage from './components/ReservationAdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='book-detail/:id' element={<BookDetailPage/>}/>
        <Route path='login' element={<LoginPage/>}/>
        <Route path='reservation' element={<ReservationPage/>}/>
        <Route path='reservation-admin' element={<ReservationAdminPage/>}/>
      </Routes> 
    </BrowserRouter>
  );
}

export default App;
