import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from './core';

export default function RestrictedRoute(props: { page: React.ReactNode }) {

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      if(!isLoggedIn()) {
        navigate('/login');
      }
    });
  }, []);

  if(isLoggedIn()){
    return (<>{props.page}</>);
  } else {
    return (<></>);
  }

}