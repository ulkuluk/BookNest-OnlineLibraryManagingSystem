import{BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BookDetailPage from './components/BookDetailPage';
import LoginPage from './components/LoginPage';
import ReservationPage from './components/ReservationPage';
import ReservationAdminPage from './components/ReservationAdminPage';
import RegistrationPage from './components/RegistrationPage';
import ReviewPage from './components/ReviewPage';
import AddBookPage from './components/AddBookPage';
import EditBookPage from './components/EditBookPage';
import UserInfoPage from './components/UserInfoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Dashboard/>}/>
        <Route path='book-detail/:id' element={<BookDetailPage/>}/>
        <Route path='login' element={<LoginPage/>}/>
        <Route path='reservation' element={<ReservationPage/>}/>
        <Route path='reservation-admin' element={<ReservationAdminPage/>}/>
        <Route path='/registration' element={<RegistrationPage/>}/>
        <Route path='/review/:isbn' element={<ReviewPage/>}/>
        <Route path='/add-book' element={<AddBookPage/>}/>
        <Route path='/edit-book/:id' element={<EditBookPage/>}/>
        <Route path='/user-info' element={<UserInfoPage/>}/>
      </Routes> 
    </BrowserRouter>
  );
}

export default App;
