import { SetterOrUpdater } from "recoil";


export function isLoggedIn(){
  return false;
}

export function login(email: string, setUserEmail: SetterOrUpdater<string>){

  setUserEmail(email);
  localStorage.setItem('user-email', email);

}

export function authorize(){

}

export function logout(){

}

