import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import CartPage from '../pages/CartPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import AdminPage from '../pages/AdminPage';
import Header from '../components/layout/Header';
import MyOrdersPage from '../pages/MyOrdersPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import ProfilePage from '../pages/ProfilePage';
import Category from '../pages/Category';
import CategoryList from '../pages/CategoryList';
import CheckoutPage from '../pages/CheckoutPage';
import InventoryImportPage from '../pages/InventoryImportPage';
import InventoryDashboard from '../pages/InventoryDashboard';
import StockHistoryPage from '../pages/StockHistoryPage';
import OrderFulfillment from '../pages/OrderFulfillment';
//import Footer from '../components/layout/Footer';

const AboutPage = () => <h1>Giới thiệu</h1>;
const ContactPage = () => <h1>Liên hệ</h1>;

const AppRouter = () => {
  return (
    <Router>
      <Header />
      <main style={{ padding: '0px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/san-pham/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={<AdminPage />} /> 
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/don-hang/:id" element={<OrderDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/category" element={<Category />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/category/:category" element={<CategoryList />} />
          <Route path="/nhap-kho" element={<InventoryImportPage />} />
          <Route path="/quan-ly-kho" element={<InventoryDashboard />} />
          <Route path="/nhat-ky-kho" element={<StockHistoryPage />} />
          <Route path="/xuat-kho" element={<OrderFulfillment />} />
        </Routes>
        {/* <Footer /> */}
      </main>
      
    </Router>
  );
};

export default AppRouter;