import React from "react";
import { Jumbotron, Button } from "reactstrap";

export function Home() {
  return (
    <div>
      <h4 className="text-center">An online book gathering!</h4>
      <Jumbotron className="home-landing">
        <Button color="primary">Get Started</Button>
      </Jumbotron>
    </div>
  );
}
