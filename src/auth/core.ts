import { SetterOrUpdater } from "recoil";

export function isLoggedIn(){
  return localStorage.getItem('user-token')
    && localStorage.getItem('user-email')
    && localStorage.getItem('user-name');
}

export function login(email: string, setUserEmail: SetterOrUpdater<string>){

  setUserEmail(email);
  localStorage.setItem('user-email', email);

}

export function authorize(
    token: string,
    setUserToken: SetterOrUpdater<string>,
    name: string,
    setUserName: SetterOrUpdater<string>){

  setUserToken(token);
  localStorage.setItem('user-token', token);

  setUserName(name);
  localStorage.setItem('user-name', name);

}

export function logout(){

}

