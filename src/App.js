import logo from './logo.svg';
import {ValueInputControlRow, KaTeXComponent} from './ValueInputControl.js';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Button, Slider, Card, Elevation, FormGroup, NumericInput, InputGroup } from '@blueprintjs/core'
import { csc, e } from 'mathjs';
import Plot from 'react-plotly.js';
var mathjs = require("mathjs");


const QuantityType = {
  UNITLESS: "unitless",
  LENGTH: "length",
  RESISTANCE: "resistance",
  CAPACITANCE: "capacitance",
  INDUCTANCE: "inductance",
  FREQUENCY: "frequency"
};

const BaseUnits = {
  METER: {name: "meter", abbreviation: "m", type: QuantityType.LENGTH, isSI: true, toSI: 1.0},
  INCH: {name: "inch", abbreviation: "in", type: QuantityType.LENGTH, isSI: false, toSI: 25.4/1000},
  THOUSANDTH_OF_AN_INCH: {name: "mil", abbreviation: "mil", type: QuantityType.LENGTH, isSI: false, toSI: 25.4/1000000},
  OHM: {name: "ohm", abbreviation: "ohm", type: QuantityType.RESISTANCE, isSI: true, toSI: 1.0},
  FARAD: {name: "farad", abbreviation: "F", type: QuantityType.CAPACITANCE, isSI: true, toSI: 1.0},
  HENRY: {name: "henry", abbreviation: "H", type: QuantityType.INDUCTANCE, isSI: true, toSI: 1.0},
  HERTZ: {name: "hertz", abbreviation: "Hz", type: QuantityType.FREQUENCY, isSI: true, toSI: 1.0},
  
};

const SIPrefix = {
  NONE: { symbol: "", exponent: 0},
  YOTTA: { symbol: "Y", exponent: 24, usage: "uncommon" },       // 1 Yotta (Y) = 10^24
  ZETTA: { symbol: "Z", exponent: 21, usage: "uncommon" },       // 1 Zetta (Z) = 10^21
  EXA: { symbol: "E", exponent: 18, usage: "uncommon" },         // 1 Exa (E) = 10^18
  PETA: { symbol: "P", exponent: 15 },        // 1 Peta (P) = 10^15
  TERA: { symbol: "T", exponent: 12 },        // 1 Tera (T) = 10^12
  GIGA: { symbol: "G", exponent: 9 },         // 1 Giga (G) = 10^9
  MEGA: { symbol: "M", exponent: 6 },         // 1 Mega (M) = 10^6
  KILO: { symbol: "k", exponent: 3 },         // 1 Kilo (k) = 10^3
  HECTO: { symbol: "h", exponent: 2, usage: "uncommon" },        // 1 Hecto (h) = 10^2
  DECA: { symbol: "da", exponent: 1, usage: "uncommon" },        // 1 Deca (da) = 10^1
  DECI: { symbol: "d", exponent: -1, usage: "uncommon" },        // 1 Deci (d) = 10^-1
  CENTI: { symbol: "c", exponent: -2, usage: "uncommon" },       // 1 Centi (c) = 10^-2
  MILLI: { symbol: "m", exponent: -3 },       // 1 Milli (m) = 10^-3
  MICRO: { symbol: "u", exponent: -6 },       // 1 Micro (μ) = 10^-6
  NANO: { symbol: "n", exponent: -9 },        // 1 Nano (n) = 10^-9
  PICO: { symbol: "p", exponent: -12 },       // 1 Pico (p) = 10^-12
  FEMTO: { symbol: "f", exponent: -15 },      // 1 Femto (f) = 10^-15
  ATTO: { symbol: "a", exponent: -18, usage: "uncommon" },       // 1 Atto (a) = 10^-18
  ZEPTO: { symbol: "z", exponent: -21, usage: "uncommon" },      // 1 Zepto (z) = 10^-21
  YOCTO: { symbol: "y", exponent: -24, usage: "uncommon" },      // 1 Yocto (y) = 10^-24
};

//generate a lookup of all combinations of base units and prefixes
const _unitLookup = {"": {base: null, prefix: null}};
for (const key in BaseUnits) {
  const baseUnit = BaseUnits[key];
  //_unitLookup[baseUnit.abbreviation] = {base: baseUnit, prefix: null};
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
  if (unit.prefix === null || unit.prefix === SIPrefix.NONE) {
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
        if (baseUnit.isSI) {
          // add units with prefixes (includes the no-prefix case)
          for (const prefix_key in SIPrefix) {
            arr.push(stringFromUnit({prefix: SIPrefix[prefix_key], base: baseUnit}))
          }
        } else {
          // just the base unit
          arr.push(baseUnit.abbreviation);
        }
      }
    }
  }
  return arr;
}

function getSIValue(value, unitString) {
  if (unitString === "") {
    return value;
  }
  const unit = unitFromString(unitString);
  if (unit.prefix === SIPrefix.None || unit.prefix === null) {
    return value * unit.base.toSI;
  } else {
    return value * unit.base.toSI * (10 ** unit.prefix.exponent);
  }
}

function autoRangeSIPrefix(quantity, allowUncommon=false) {
  const SIvalue = getSIValue(quantity.value, quantity.unitString)
  const baseUnit = unitFromString(quantity.unitString).base
  const candidateQuantities = Object.values(SIPrefix)
                                .filter(prefix => allowUncommon || prefix.usage !== "uncommon")
                                .map(prefix => makeQuantity(SIvalue, prefix.symbol + baseUnit.abbreviation))
                                .sort((a, b) => a.value - b.value);
  // find the smallest quantity with a value bigger than 1.0
  // OR if there's none bigger than 1.0, find the largest
  if (candidateQuantities.some(q => q.value >= 1.0)) {
    return candidateQuantities.filter(q => q.value >= 1.0)
                              .reduce((prev, curr) => curr.value < prev.value ? curr : prev); //min
  } else {
    return candidateQuantities.reduce((prev, curr) => curr.value > prev.value ? curr : prev); //max
  }
}

function makeQuantity(SIvalue, unitString) {
  var value = null;
  if (unitString === "") {
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
  constructor(name, key, latex, quantityType, defaultUnitString, minValue, maxValue, initialValue=null, cannedValues=[]) {
    this.name = name;
    this.key = key;
    this.latex = latex;
    this.quantityType = quantityType;
    this.allowableUnits = unitStringArrayFromQuantityType(quantityType);
    this.defaultUnitString = defaultUnitString;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.initialValue = initialValue;
    this.cannedValues = cannedValues;
  }
}

function linspace(start, end, num) {
  const step = (end - start) / (num - 1);
  return Array.from({ length: num }, (_, i) => start + i * step);
}

function SolutionPlot(props) {
  const data = [
    {
      x: props.xValues,
      y: props.yValues,
      mode: 'lines',
      name: 'Data Points',
    },
  ];

  // Define the layout for the chart
  const layout = {
    //title: 'Simple Scatter Plot',
    xaxis: {title: props.xTitle,
            ticksuffix: props.xUnits},
    yaxis: {type: "log",
            ticksuffix: props.yUnits,
            title: props.yTitle},
  };

  return (
    <Plot
      data={data}
      layout={layout}
      style={{ width: '100%', height: '400px' }}
    />
  );
};

function Calculator(props) {
  const [plotData, setPlotData] = useState({});
  const [simpleResultVariableLatex, setSimpleResultVariableLatex] = useState(null);
  const [simpleResultQuantity, setSimpleResultQuantity] = useState({value: null, unitString: null});
  const [resultType, setResultType] = useState(null);
  const calculatorVariables = props.variables || [];
  const equations_def = props.equations || [];

  const initialChildVariables = {};
  for (const cv of calculatorVariables) {
    initialChildVariables[cv.key] = {
      value: null,
      unitString: null
    };
  }
  const [childVariables, setChildVariables] = useState(initialChildVariables);

  // parse equations_def
  const equations = {};
  for (const [key, val] of Object.entries(equations_def)) {
    equations[key] = mathjs.parse(val).compile();
  }

  const computeAndSetPlotData = (xVar, yVar, equation, equationScope) => {
    const xValuesSI = linspace(xVar.minValue, xVar.maxValue, 100);
    const xValues = [];
    const yValues = [];
    const equationScopeCopy = {...equationScope};
    for (const xValueSI of xValuesSI) {
      equationScopeCopy[xVar.key] = xValueSI;
      const yValueSI = equation.evaluate(equationScopeCopy);
      const xValue = makeQuantity(xValueSI, xVar.defaultUnitString).value;
      const yValue = makeQuantity(yValueSI, yVar.defaultUnitString).value;
      yValues.push(yValue);
      xValues.push(xValue);
    }
    
    setPlotData(
      {key: xVar.defaultUnitString + yVar.defaultUnitString,
      xValues: xValues,
      yValues: yValues,
      xUnits: xVar.defaultUnitString,
      yUnits: yVar.defaultUnitString,
      xTitle: xVar.name + ", " + xVar.key,
      yTitle: yVar.name + ", " + yVar.key}
    );
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
        unknowns[key] = null;
      } else {
        knowns[key] = getSIValue(childVariables[key].value, childVariables[key].unitString);
      }
    }
    const n_unknowns = Object.keys(unknowns).length;
    switch(n_unknowns) {
      case 1:
        console.log("one unknown :)");
        const unknownKey = Object.keys(unknowns)[0];
        const unknownVariable = calculatorVariables.find(cv => cv.key === unknownKey);
        const SIresult = equations[unknownKey].evaluate({...knowns});

        const resultUnitString = unknownVariable.defaultUnitString;
        const resultQuantity = autoRangeSIPrefix(makeQuantity(SIresult, resultUnitString));
        console.log(resultQuantity);

        
        setSimpleResultQuantity(resultQuantity);
        setSimpleResultVariableLatex(unknownVariable.latex)
        setResultType("simple");
        break;
      
      case 2:
        console.log("two unknowns :)");
        const xVarKey = Object.keys(unknowns)[0];
        const yVarKey = Object.keys(unknowns)[1];
        computeAndSetPlotData(
          calculatorVariables.find(cv => cv.key === xVarKey),
          calculatorVariables.find(cv => cv.key === yVarKey),
          equations[yVarKey],
          {...knowns}
        );
        setResultType("plot");
        break;

      default:
        console.log(`n_unknowns = ${Object.keys(unknowns).length} :(`);
        setResultType(null);
    }
  };
  
  useEffect(() => {
    tryCalculating();
  }, [childVariables]);

  return (
    <div>
      <Card className='card-content' elevation={2}>
        <div className="inputs-and-image">
          <table><tbody>
            {calculatorVariables.map((variable, index) => (
              <ValueInputControlRow
                key={variable.key}
                name={variable.name}
                latex={variable.latex}
                allowableUnits={variable.allowableUnits}
                initialValue={variable.initialValue}
                cannedValues={variable.cannedValues}
                onSuccessfulParse={(physicalQuantity) => updateChildQuantity(variable.key, physicalQuantity)}
              />
            ))}
          </tbody></table>
          <img src={props.imageUrl} alt={props.imageAlt} className="calculator-image" />
        </div>
        <div>
        {resultType === "simple" ?
          <p>
            <KaTeXComponent
              texExpression={
                simpleResultVariableLatex + " = " + 
                simpleResultQuantity.value.toPrecision(4) + " " +
                simpleResultQuantity.unitString}
            />
          </p>
        :
          null
        }
        {resultType === "plot" ? (
          <SolutionPlot
            key={plotData.key}
            xTitle={plotData.xTitle}
            yTitle={plotData.yTitle}
            xValues={plotData.xValues}
            yValues={plotData.yValues}
            xUnits={plotData.xUnits}
            yUnits={plotData.yUnits}
          />
        ) : null}
        </div>
      </Card>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <header>EngCalc</header>
      <Calculator
        name="single"
        imageUrl={"/single.png"}
        imageAlt={"Microstrip"}
        variables={[
          new CalcVariable("impedance", "Z", "Z_0", QuantityType.RESISTANCE, "ohm", 0, 300),
          new CalcVariable("dialectric", "eps", "\\varepsilon_r", QuantityType.UNITLESS, "", 0, 10),
          new CalcVariable("height", "h", "h", QuantityType.LENGTH, "mm", 0.0001, 0.005),
          new CalcVariable("width", "w", "w", QuantityType.LENGTH, "mm", 0.0001, 0.01),
          new CalcVariable("thickness", "t", "t", QuantityType.LENGTH, "um", 0, 100e-6, "38um", ["18um", "38um"]) ]}
        equations={{
          "Z": "Z = 87*ln(5.98*h/(0.8*w + t)) / (sqrt(eps + 1.41))",
          "eps": "eps = -(3 * (47 * Z^2 - 252300 * (log((299 h)/(50*t + 40*w)))^2))/(100*Z^2)",
          "h": "h = ((0.8*w + t)/5.98) * exp(Z * sqrt(eps + 1.41) / 87)",
          "w": "-(1/40) * exp(-(1/870) * Z * sqrt(141 + 100 * eps)) (-299 * h + 50 * exp((1/870) * Z * sqrt(141 + 100 * eps)) * t)",
          "t": "-(1/50) * exp(-(1/870) * Z * sqrt(141 + 100 * eps)) (-299 * h + 40 * exp((1/870) * Z * sqrt(141 + 100 * eps)) * w)"}}
      />
      <Calculator
        name="capacitor-reactance"
        imageUrl={""}
        imageAlt={"Capacitor Reactance"}
        variables={[
          new CalcVariable("reactance", "X_C", "X_C", QuantityType.RESISTANCE, "ohm", 0, 1e6),
          new CalcVariable("capacitance", "C", "C", QuantityType.CAPACITANCE, "F", 0, 1e-3),
          new CalcVariable("frequency", "f", "f", QuantityType.FREQUENCY, "Hz", 0, ) ]}
        equations={{
          "X_C": "X_C = 1/ (2 * 3.1415 * f * C)",
          "C": "C = 1/ (2 * 3.1415 * f * X_C)",
          "f": "C = 1/ (2 * 3.1415 * C * X_C)",
        }}
      />
      <Calculator
        name="inductor-reactance"
        imageUrl={""}
        imageAlt={"Inductor Reactance"}
        variables={[
          new CalcVariable("reactance", "X_L", "X_L", QuantityType.RESISTANCE, "ohm", 0, 1e6),
          new CalcVariable("inductance", "L", "L", QuantityType.INDUCTANCE, "H", 0, 1e-3),
          new CalcVariable("frequency", "f", "f", QuantityType.FREQUENCY, "Hz", 0, ) ]}
        equations={{
          "X_L": "X_L = 2 * 3.1415 * f * L",
          "L": "L = X_L / (2 * 3.1415 * f)",
          "f": "f = X_L / (2 * 3.1415 * L)",
        }}
      />
      <Calculator
        name="lc-resonance"
        imageUrl={""}
        imageAlt={"LC Resonance"}
        variables={[
          new CalcVariable("capacitance", "C", "C", QuantityType.CAPACITANCE, "F", 0, 1e-3),
          new CalcVariable("inductance", "L", "L", QuantityType.INDUCTANCE, "H", 0, 1e-3),
          new CalcVariable("frequency", "f", "f", QuantityType.FREQUENCY, "Hz", 0, ) ]}
        equations={{
          "C": "C = 1 / (4 * (3.1415 ^ 2) * (f ^ 2) * L)",
          "L": "C = 1 / (4 * (3.1415 ^ 2) * (f ^ 2) * C)",
          "f": "f = 1 / (2 * 3.1415 * sqrt(L * C))",
        }}
      />
    </div>
  );
}

// function App() {
//   return (
//     <div>asdf</div>
//   );
// }

export default App;
