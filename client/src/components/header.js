import React, { Component } from "react";
import { Nav, Navbar, NavItem } from "reactstrap";

class Header extends Component {
  render() {
    return (
      <Nav className="header-primary mb-2">
        <Navbar className="header-title">
          <NavItem>
            <h1>Booklub</h1>
          </NavItem>
          <NavItem>
            <h6>Search Books</h6>
          </NavItem>
          <NavItem>
            <h6>Find friends</h6>
          </NavItem>
          <NavItem>
            <h6>Login or Signup</h6>
          </NavItem>
        </Navbar>
      </Nav>
    );
  }
}

export default Header;
