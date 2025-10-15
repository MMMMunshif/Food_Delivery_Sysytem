import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Dishes from "./pages/Dishes";
import OrderPage from "./pages/OrderPage";
import MyOrders from "./pages/MyOrders";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import ChangePassword from "./pages/ChangePassword";
import AdminDashboard from "./pages/AdminDashboard";
import ChefDashboard from "./pages/Dashboard";
import Feedback from "./pages/Feedback";
import OrdersList from "./pages/OrdersList";
import ChefFeedback from "./pages/ChefFeedback";
import Home from "./pages/Home";
import CommunityDashboard from "./pages/CommunityDashboard";
import Contact from "./pages/Contact";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/community-dashboard" element={<CommunityDashboard />} />
         <Route path="/contact" element={ <Contact /> } />

       

        {/* ✅ Protected Routes */}
        <Route
          path="/dashboard" element={ <ProtectedRoute>  <Dashboard />  </ProtectedRoute>  } />
          
        <Route path="/dishes" element={ <ProtectedRoute>  <Dishes /> </ProtectedRoute>  }  />

        <Route path="/order/:id" element={ <ProtectedRoute>  <OrderPage /> </ProtectedRoute>   } />

        <Route  path="/my-orders" element={  <ProtectedRoute> <MyOrders /> </ProtectedRoute>   } />

        <Route  path="/delivery-dashboard"  element={   <ProtectedRoute>    <DeliveryDashboard />  </ProtectedRoute>  }  />

        <Route path="/customer-dashboard"   element={ <ProtectedRoute> <CustomerDashboard /> </ProtectedRoute>  } />
        
        <Route  path="/change-password"  element={ <ProtectedRoute>   <ChangePassword />     </ProtectedRoute>    }   />
         
        <Route path="/admin" element={ <ProtectedRoute> <AdminDashboard /> </ProtectedRoute> } />

        <Route  path="/chef-dashboard"  element={ <ProtectedRoute> <ChefDashboard /> </ProtectedRoute> } />

        <Route  path="/orders" element={ <ProtectedRoute> <OrdersList /></ProtectedRoute>  } />

        <Route path="/chef/feedback" element={ <ProtectedRoute> <ChefFeedback />  </ProtectedRoute>   }/>

      </Routes>
      
    </Router>
  );
}

export default App;
