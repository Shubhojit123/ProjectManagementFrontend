import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginSignup from '../component/LoginSignup'
import { Button, Checkbox, Form, Input } from 'antd';
import UserPrivate from '../component/UserPrivate';
import UserDashboard from '../src/UserDashboard';
import ManagerPrivate from '../component/ManagerPrivate';
import ManagerDashboard from '../src/ManagerDashboard';
import AdminPrivate from '../component/AdminPrivate';
import AdminDashboard from '../src/AdminDashboard';
import Default from '../Layout/Default';
import AUthPrivate from '../component/AUthPrivate';
import ProfileView from '../AdminComponent/Component/ProfileView';

function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginSignup/>} />

        <Route path='/user' element={<UserPrivate/>}>
          <Route path='dashboard' element={<UserDashboard/>}/>
        </Route>

        <Route path='/manager' element={<ManagerPrivate/>}>
          <Route path='dashboard' element={<ManagerDashboard/>}/>
        </Route>

        <Route path='/admin' element={<AdminPrivate/>}>
          <Route path='dashboard' element={<AdminDashboard/>}/>
        </Route>

        <Route path='/auth' element = {<AUthPrivate/>}>
          <Route path='profile/:id' element = {<ProfileView/>}/>
        </Route>

        <Route path='*' element={<Default/>} />
      </Routes>
    </BrowserRouter>
  )
}


export default App