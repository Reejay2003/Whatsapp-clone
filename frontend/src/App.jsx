import Navbar from "./components/Navbar"
import HomePage from "./pages/HomePage"
import SignUpPage from "./pages/SignUpPage"
import LoginPage from "./pages/LoginPage"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"
import {Routes,Route} from "react-router-dom"
import {useAuthStore} from "./store/useAuthStore"
import React, { useEffect } from 'react'


console.log("hey");

const App = () => {
  // const {authUser,checkAuth, isCheckingAuth} = useAuthStore();
  // useEffect(()=>{
  //   checkAuth();
  // },[checkAuth]);
  // console.log({authUser});
  
  // if(!authUser && isCheckingAuth){return(
  //     <div className="flex items-center justify-center h-screen">
  //       <span class="loading loading-spinner loading-lg"></span>
  //     </div>    
  // )}
  
  return (
    <div className=''>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App