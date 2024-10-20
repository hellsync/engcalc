import React, { useState, useRef, useEffect } from "react";
import { InputGroup, Button } from "@blueprintjs/core";
import katex from 'katex';
import { map } from "mathjs";

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


function ValueInputControlRow(props) {
  const [intent, setIntent] = useState("none");
  const [value, setValue] = useState(props.initialValue || "");

  // force a parse if this has a default value
  useEffect(() => {
    if (props.initialValue) {
      handleConfirm({ value: props.initialValue });
    }
  }, [props.initialValue]);

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

  const handleBlur = (event) => {
    handleConfirm(event.target);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleConfirm(event.target);
    }
  };

  const handleValueChange = (value) => {
    setValue(value);
  };

  const handleConfirm = (target) => {
    const parsed = parseInput(target.value, props.allowableUnits);
    if (!parsed.error) {
      setIntent("none");
      props.onSuccessfulParse(parsed);
    } else {
      setIntent("warning");
      console.log(parsed.error);
      console.log(props.allowableUnits);
    }
  };

  return (
    <tr>
      <td><KaTeXComponent texExpression={props.latex + "="}/></td>
      <td>
        <InputGroup
          inputClassName="bp5-monospace-text"
          value={value}
          key={"valin"+props.name}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onValueChange={handleValueChange}
          intent={intent}
          rightElement={
            props.cannedValues.map((val) => (
              <Button
                key={val}
                text={val}
                onClick={() => {
                  setValue(val);
                  handleConfirm({value: val})
                }} />
            ))
          }
          placeholder=""
        />
      </td>
      <td></td>
    </tr>
  )
}

export {ValueInputControlRow, KaTeXComponent};