import React, { useRef, useEffect } from "react";
import { InputGroup } from "@blueprintjs/core";
import katex from 'katex';


/* class Unit {
  constructor(name, abbreviation, isSI = false) {
    this.name = name;
    this.abbreviation = abbreviation;
    this.isSI = isSI;
  }
} */

const NUMBER_ABBREVIATION_REGEX = /((\.\d+)|(\d+(\.\d+)?))(k|m|b)\b/gi;
const SCIENTIFIC_NOTATION_REGEX = /((\.\d+)|(\d+(\.\d+)?))(e\d+)\b/gi;

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

function ValueInputControlRow({variable}) {
  console.log(variable);
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
      let result = value;
      //result = expandScientificNotationTerms(result);
      //TODO result = expandNumberAbbreviationTerms(result);
      //result = evaluateSimpleMathExpression(result);
      //result = nanStringToEmptyString(result);
      //TODO setState({ value: result });

      // the user could have typed a different expression that evaluates to
      // the same value. force the update to ensure a render triggers even if
      // this is the case.
      //TODO forceUpdate();
  };

  const expandScientificNotationTerms = (value) => {
    // leave empty strings empty
    if (!value) {
        return value;
    }
    return value.replace(SCIENTIFIC_NOTATION_REGEX, expandScientificNotationNumber);
  };

/*   const expandNumberAbbreviationTerms = (value) => {
    // leave empty strings empty
    if (!value) {
        return value;
    }
    return value.replace(NUMBER_ABBREVIATION_REGEX, expandAbbreviatedNumber);
  }; */

/*   const expandAbbreviatedNumber = (value) => {
    if (!value) {
        return value;
    }

    const num = +value.substring(0, value.length - 1);
    const lastChar = value.charAt(value.length - 1).toLowerCase();

    let result;

    if (lastChar === NumberAbbreviation.THOUSAND) {
        result = num * 1e3;
    } else if (lastChar === NumberAbbreviation.MILLION) {
        result = num * 1e6;
    } else if (lastChar === NumberAbbreviation.BILLION) {
        result = num * 1e9;
    }

    const isValid = result != null && !isNaN(result);

    if (isValid) {
        //result = roundValue(result);
    }

    return isValid ? result.toString() : "";
  }; */

  const expandScientificNotationNumber = (value) => {
    if (!value) {
        return value;
    }
    return (+value).toString();
  };

  return (
    <tr>
      <td><KaTeXComponent texExpression={variable.latex + "="}/></td>
      <td>
        <InputGroup inputClassName="bp5-monospace-text"
                    key={"valin"+variable.name}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onValueChange={handleValueChange}
                    placeholder="Enter a number or expression..."/>
      </td>
      <td>dfasdf</td>
    </tr>
  )
}

export default ValueInputControlRow;