import React, { Component } from "react";
import Header from "./header";
import { Home } from "./home";
import { Footer } from "./footer";

class Main extends Component {
  render() {
    return (
      <div>
        <Header />
        <Home />
        <Footer />
      </div>
    );
  }
}

export default Main;
