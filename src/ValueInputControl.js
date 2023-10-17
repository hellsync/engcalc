import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { InputGroup } from "@blueprintjs/core";
import katex from 'katex';

function KaTeXComponent({texExpression}) {
  const containerRef = useRef();
  useEffect(() => {
    katex.render(texExpression, containerRef.current,
                  {displayMode: false,
                   throwOnError: false});
    }, [texExpression]
  );

  return <div className="katex-container" ref={containerRef} />
}

//https://github.com/palantir/blueprint/blob/develop/packages/docs-app/src/examples/core-examples/numericInputExtendedExample.tsx

const parseInput = (inputString, allowableUnits) => {
  if (inputString.trim() === "") {
    return {value: null, unitString: null};
  }

  // Regular expression to match a floating-point number followed by units
  const regex = /^([\d.]+)\s*([a-zA-Z]*)$/;

  // Try to match the input string against the regex
  const match = inputString.match(regex);

  if (!match) {
    // If there is no match, return an error message
    return {
      error: "Invalid input format. Please provide a number followed by units.",
    };
  }

  // Extract the numeric value and units from the match
  const numericValue = parseFloat(match[1]);
  const enteredUnits = match[2];

  if (!allowableUnits.includes(enteredUnits)) {
    return {
      error: `Units "${enteredUnits}" are not allowed.`,
    };
  }

  // Return the numeric value and units if everything is valid
  return {
    value: numericValue,
    unitString: enteredUnits || "",
  };
};

function ValueInputControlRow(props) {

  const handleBlur = (event) => {
    handleConfirm(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleConfirm(event.target.value);
    }
  };

  const handleValueChange = (value) => {
    //TODO
    //setState({value}); 
  };

  const handleConfirm = (value) => {
    const parsed = parseInput(value, props.allowableUnits);
    if (!parsed.error) {
      props.onSuccessfulParse(parsed);
    } else {
      console.log(parsed.error);
      console.log(props.allowableUnits);
    }
  };

  return (
    <tr>
      <td><KaTeXComponent texExpression={props.latex + "="}/></td>
      <td>
        <InputGroup inputClassName="bp5-monospace-text"
                    key={"valin"+props.name}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onValueChange={handleValueChange}
                    placeholder=""/>
      </td>
      <td>dfasdf</td>
    </tr>
  )
}

export default ValueInputControlRow;