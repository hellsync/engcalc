import logo from './logo.svg';
import ValueInputControlRow from './ValueInputControl.js';
import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { Button, Slider, Card, Elevation, FormGroup, NumericInput, InputGroup } from '@blueprintjs/core'
var mathjs = require("mathjs");

const QuantityType = {
  UNITLESS: "unitless",
  LENGTH: "length",
  RESISTANCE: "resistance",
};

const Unit = {
  METER: {name: "meter", abbreviation: "m", type: QuantityType.LENGTH, isSI: true},
  INCH: {name: "inch", abbreviation: "in", type: QuantityType.LENGTH, isSI: false, toSI: 25.4/1000},
  THOUSANDTH_OF_AN_INCH: {name: "mil", abbreviation: "mil", type: QuantityType.LENGTH, isSI: false, toSI: 25.4/1000000},
  OHM: {name: "ohm", abbreviation: "ohm", type: QuantityType.RESISTANCE, isSI: true},
};

const SIPrefix = {
  YOTTA: { symbol: "Y", exponent: 24 },       // 1 Yotta (Y) = 10^24
  ZETTA: { symbol: "Z", exponent: 21 },       // 1 Zetta (Z) = 10^21
  EXA: { symbol: "E", exponent: 18 },         // 1 Exa (E) = 10^18
  PETA: { symbol: "P", exponent: 15 },        // 1 Peta (P) = 10^15
  TERA: { symbol: "T", exponent: 12 },        // 1 Tera (T) = 10^12
  GIGA: { symbol: "G", exponent: 9 },         // 1 Giga (G) = 10^9
  MEGA: { symbol: "M", exponent: 6 },         // 1 Mega (M) = 10^6
  KILO: { symbol: "k", exponent: 3 },         // 1 Kilo (k) = 10^3
  HECTO: { symbol: "h", exponent: 2 },        // 1 Hecto (h) = 10^2
  DECA: { symbol: "da", exponent: 1 },        // 1 Deca (da) = 10^1
  DECI: { symbol: "d", exponent: -1 },        // 1 Deci (d) = 10^-1
  CENTI: { symbol: "c", exponent: -2 },       // 1 Centi (c) = 10^-2
  MILLI: { symbol: "m", exponent: -3 },       // 1 Milli (m) = 10^-3
  MICRO: { symbol: "μ", exponent: -6 },       // 1 Micro (μ) = 10^-6
  NANO: { symbol: "n", exponent: -9 },        // 1 Nano (n) = 10^-9
  PICO: { symbol: "p", exponent: -12 },       // 1 Pico (p) = 10^-12
  FEMTO: { symbol: "f", exponent: -15 },      // 1 Femto (f) = 10^-15
  ATTO: { symbol: "a", exponent: -18 },       // 1 Atto (a) = 10^-18
  ZEPTO: { symbol: "z", exponent: -21 },      // 1 Zepto (z) = 10^-21
  YOCTO: { symbol: "y", exponent: -24 },      // 1 Yocto (y) = 10^-24
};


function Calculator() {
  const [result, setResult] = useState(0);
  const variables = {impedance: {name: "impedance", latex: "Z_0", unit: Unit.OHM},
                     dialectric: {name: "dialectric", latex: "\\varepsilon_r", unit: Unit.UNITLESS},
                     height: {name: "height", latex: "h", unit: Unit.UNITLESS}};
  const equations_def = {"x": "x = y + z",
                         "y": "y = x - z"};
  var equations = {};
  for (const [key, val] of Object.entries(equations_def)) {
    equations[key] = mathjs.parse(val);
  }

  return (
    <div>
      <Card className='ValIn' elevation={2}>
        <table><tbody>
          {Object.values(variables).map((variable) => (
            <ValueInputControlRow variable={variable} />
          ))}
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
