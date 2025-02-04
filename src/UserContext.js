import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [leaveData, setLeaveData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${process.env.REACT_APP_API_URL}profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error('Error fetching user data', error);
      });
      axios.get(`${process.env.REACT_APP_API_URL}leave-history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => {
        setLeaveData(response.data);
      })
      .catch(error => {
        console.error('Error fetching leave history', error);
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ userData, setUserData, leaveData, setLeaveData }}>
      {children}
    </UserContext.Provider>
  );
};
