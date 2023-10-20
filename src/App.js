import logo from './logo.svg';
import ValueInputControlRow from './ValueInputControl.js';
import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { Button, Slider, Card, Elevation, FormGroup, NumericInput, InputGroup } from '@blueprintjs/core'
import { csc, e } from 'mathjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
var mathjs = require("mathjs");


const QuantityType = {
  UNITLESS: "unitless",
  LENGTH: "length",
  RESISTANCE: "resistance",
};

const BaseUnits = {
  METER: {name: "meter", abbreviation: "m", type: QuantityType.LENGTH, isSI: true, toSI: 1.0},
  INCH: {name: "inch", abbreviation: "in", type: QuantityType.LENGTH, isSI: false, toSI: 25.4/1000},
  THOUSANDTH_OF_AN_INCH: {name: "mil", abbreviation: "mil", type: QuantityType.LENGTH, isSI: false, toSI: 25.4/1000000},
  OHM: {name: "ohm", abbreviation: "ohm", type: QuantityType.RESISTANCE, isSI: true, toSI: 1.0},
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
  MICRO: { symbol: "u", exponent: -6 },       // 1 Micro (μ) = 10^-6
  NANO: { symbol: "n", exponent: -9 },        // 1 Nano (n) = 10^-9
  PICO: { symbol: "p", exponent: -12 },       // 1 Pico (p) = 10^-12
  FEMTO: { symbol: "f", exponent: -15 },      // 1 Femto (f) = 10^-15
  ATTO: { symbol: "a", exponent: -18 },       // 1 Atto (a) = 10^-18
  ZEPTO: { symbol: "z", exponent: -21 },      // 1 Zepto (z) = 10^-21
  YOCTO: { symbol: "y", exponent: -24 },      // 1 Yocto (y) = 10^-24
};

const _unitLookup = {"": {base: null, prefix: null}};
for (const key in BaseUnits) {
  const baseUnit = BaseUnits[key];
  _unitLookup[baseUnit.abbreviation] = {base: baseUnit, prefix: null};
  if (baseUnit.isSI) {
    for (const prefix_key in SIPrefix) {
      const prefix = SIPrefix[prefix_key];
      _unitLookup[prefix.symbol + baseUnit.abbreviation] = {base: baseUnit, prefix: prefix};
    }
  }
}

function unitFromString(s) {
  return _unitLookup[s];
}

function stringFromUnit(unit) {
  if (unit.prefix === null) {
    return unit.base.abbreviation;
  } else {
    return unit.prefix.symbol + unit.base.abbreviation;
  }
}

function unitStringArrayFromQuantityType(quantityType) {
  const arr = [];
  if (quantityType === QuantityType.UNITLESS) {
    arr.push("");
  } else {
    for (const key in BaseUnits) {
      const baseUnit = BaseUnits[key];
      if (quantityType === baseUnit.type) {
        // the base unit
        arr.push(baseUnit.abbreviation);
        if (baseUnit.isSI) {
          // add units with prefixes
          for (const prefix_key in SIPrefix) {
            arr.push(stringFromUnit({prefix: SIPrefix[prefix_key], base: baseUnit}))
          }
        }
      }
    }
  }
  return arr;
}

class PhysicalQuantity {
  constructor(value, unitString) {
    this.value = value;
    this.unit = unitFromString(unitString);
  }
}

function getSIValue(value, unitString) {
  if (unitString === "") {
    return value;
  }
  const unit = unitFromString(unitString);
  if (unit.prefix === null) {
    return value * unit.base.toSI;
  } else {
    return value * unit.base.toSI * (10 ** unit.prefix.exponent);
  }
}

function addUnits(SIvalue, unitString) {
  var value = null;
  if (unitString === "") {
    console.log("emp")
    value = SIvalue;
  } else {
    const unit = unitFromString(unitString);
    if (unit.prefix === null) {
      value = SIvalue / unit.base.toSI;
    } else {
      value = SIvalue / (unit.base.toSI * (10 ** unit.prefix.exponent));
    }
  }
  return {value: value, unitString: unitString};
}

class CalcVariable {
  constructor(name, key, latex, quantityType, defaultUnitString) {
    this.name = name;
    this.key = key;
    this.latex = latex;
    this.quantityType = quantityType;
    this.allowableUnits = unitStringArrayFromQuantityType(quantityType);
    this.defaultUnitString = defaultUnitString;
  }
}

function LineChart() {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Sample Data',
        data: [10, 20, 30, 40, 50],
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Months',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Values',
        },
      },
    },
  };

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  );
};

function Calculator() {
  const [result, setResult] = useState("?");
  const calculatorVariables = [
    new CalcVariable("impedance", "Z", "Z_0", QuantityType.RESISTANCE, "ohm"),
    new CalcVariable("dialectric", "eps", "\\varepsilon_r", QuantityType.UNITLESS, ""),
    new CalcVariable("height", "h", "h", QuantityType.LENGTH, "mm")
  ];
  const initialChildVariables = {};
  for (const cv of calculatorVariables) {
    initialChildVariables[cv.key] = {
      value: null,
      unitString: null
    };
  }
  const [childVariables, setChildVariables] = useState(initialChildVariables);

  const equations_def = {"Z": "Z = eps + h",
                         "eps": "eps = Z - h",
                         "h": "h = Z - eps"};
  const equations = {};

  for (const [key, val] of Object.entries(equations_def)) {
    equations[key] = mathjs.parse(val).compile();
  }

  const updateChildQuantity = (key, physicalQuantity) => {
    const newChildVariables = {...childVariables}; // a copy
    newChildVariables[key] = physicalQuantity;
    setChildVariables(newChildVariables);

  };

  const tryCalculating = () => {
    console.log("tryCalculating()");
    const unknowns = {};
    const knowns = {};
    for (const key in childVariables) {
      if (childVariables[key] === null || childVariables[key].value === null) {
        unknowns[key] = childVariables[key];
      } else {
        knowns[key] = childVariables[key];
      }
    }
    const n_variables = calculatorVariables.length;
    if (Object.keys(unknowns).length === 1) {
      console.log("one unknown :)");
      const unknown_key = Object.keys(unknowns)[0];
      const equation_scope = {};
      for (const key in knowns) {
        equation_scope[key] = getSIValue(knowns[key].value, knowns[key].unitString);
      }
      const SIresult = equations[unknown_key].evaluate(equation_scope); //mutates equation_scope!
      console.log(calculatorVariables.find(cv => cv.key === unknown_key).defaultUnitString)
      const defaultUnitString = calculatorVariables.find(cv => cv.key === unknown_key).defaultUnitString;
      const physicalQuantity = addUnits(SIresult, defaultUnitString);
      console.log(physicalQuantity);
      setResult(`${physicalQuantity.value} ${physicalQuantity.unitString}`);
    } else {
      console.log(`n_unknowns = ${Object.keys(unknowns).length} :(`);
      setResult("?");
    }
  };
  
  useEffect(() => {
    tryCalculating();
  }, [childVariables]);

  return (
    <div>
      <Card className='ValIn' elevation={2}>
        <table><tbody>
          {calculatorVariables.map((variable, index) => (
            <ValueInputControlRow
              key={variable.key}
              name={variable.name}
              latex={variable.latex}
              allowableUnits={variable.allowableUnits}
              onSuccessfulParse={(physicalQuantity) => updateChildQuantity(variable.key, physicalQuantity)}
            />
          ))}
        </tbody></table>
        <p>Result: {result}</p>
        <LineChart />
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

export default App;
