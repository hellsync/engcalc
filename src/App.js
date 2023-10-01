import logo from './logo.svg';
import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { Button, Slider, Card, Elevation, FormGroup, NumericInput, InputGroup } from '@blueprintjs/core'
import katex from 'katex';
var mathjs = require("mathjs");

function valueEntryRow(variable) {
  const KaTeXComponent = ({texExpression}) => {
    const containerRef = useRef();
    const isInitialRender = useRef(true); // Flag to track initial render

    useEffect(() => {
      if (isInitialRender.current) {
        isInitialRender.current = false; // Set the flag to false after the initial render
        return;
      }
      katex.render(texExpression, containerRef.current,
        {displayMode: false,
        throwOnError: false,
        //output: 'html'
      });
    }, [texExpression]);

    return <div className="katex-container" ref={containerRef} />
  }
  const parseValueExpression = () => {
    
  };
  return (
    <tr>
      <td>
        <KaTeXComponent texExpression={"c = \\pm\\sqrt{a^2 + b^2}"}/>
      </td>
      <td>
        <div>
          <InputGroup inputClassName="bp5-monospace-text" key={"valin"+variable} onChange={parseValueExpression} />
        </div>
      </td>
      <td>
        asdf
      </td>
    </tr>
  )
}

function Calculator() {
  // Define a state variable to store the result
  const [result, setResult] = useState(0);
  const variables = ["xii", "y", "z"];
  const equations_def = {"x": "x = y + z",
                         "y": "y = x - z"};
  var equations = {}  
  for (const [key, val] of Object.entries(equations_def)) {
    equations[key] = mathjs.parse(val);
  }
  // Perform your calculation and update the result when needed
  const performCalculation = () => {
    // Replace this with your actual calculation logic
    const newResult = 42; // Replace with your calculation
    setResult(newResult);
  };

  return (
    <div>
      <Card className='ValIn' elevation={2}>
        <table><tbody>
        {variables.map((variable, ii) => 
          valueEntryRow(variable))}
        </tbody></table>
        <p>Result: {result}</p>
      </Card>
    </div>
  );
}


function App() {
  return (
    <div className="App">
      <header>EngCalc</header>
      <Button intent="primary" text="Primary Button" />
      <Calculator />
    </div>
  );
}

function handleValueChange(newValue) {
  console.log(`New value: ${newValue}`);
  // You can update the state or perform other actions here
}

export default App;
