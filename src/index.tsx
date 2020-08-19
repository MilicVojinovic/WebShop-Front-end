import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'jquery/dist/jquery.js';
import 'popper.js/dist/popper.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import { MainMenu, MainMenuItem } from './components/MainMenu/MainMenu';
import HomePage from './components/HomePage/HomePage';
import { HashRouter, Route } from 'react-router-dom';
import Switch from 'react-bootstrap/esm/Switch';
import ContactPage from './components/ContactPage/ContactPage';
import { UserLoginPage } from './components/UserLoginPage/UserLoginPage';
import CategoryPage from './components/CategoryPage/CategoryPage';



const menuItems = [
  new MainMenuItem("Home", "/"),
  new MainMenuItem("Contact", "/contact/"),
  new MainMenuItem("Log in", "/user/login/"),

  new MainMenuItem("Cat 1 ", "/category/:1"),
  new MainMenuItem("Cat 7", "/category/:7"),
  new MainMenuItem("Cat 21", "/category/:21"),
];

// The purpose of the function render is to display the specified HTML code inside the specified HTML element
ReactDOM.render(
  //specified HTML code
  <React.StrictMode>
    <MainMenu items={menuItems}></MainMenu>

    <HashRouter>

      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/user/login" component={UserLoginPage} />
        <Route path="/category/:cId" component={CategoryPage} />
      </Switch>

    </HashRouter>
  </React.StrictMode>,

  //specified HTML element
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
