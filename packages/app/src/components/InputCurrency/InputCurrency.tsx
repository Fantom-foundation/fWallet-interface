import { Input } from "../index";
import React from "react";

const InputCurrency: React.FC<any> = ({
  value,
  max,
  handleValue,
  handleError,
  token,
  disabled,
}) => {
  const handleChange = (value: string) => {
    handleError(null);

    // Filter out invalid Numbers but allow zero's
    if (value && !Number(value)) {
      if (value === "0") handleValue("0");
      if (value.length === 2 && value === "0.") handleValue("0.");
      if (value.length > 2 && value.substr(0, 2) === "0.") {
        if (
          value[value.length - 1] === "0" ||
          Number(value[value.length - 1])
        ) {
          return handleValue(value);
        }

        handleValue(value.slice(0, -1));
      }

      return;
    }

    if (parseFloat(value) > max) {
      handleError("Insufficient funds");
    }

    if (
      value?.split(".").length &&
      value?.split(".")[1]?.length > token.decimals
    ) {
      handleError(
        `Exceeded max of ${token.decimals} decimals for ${token.symbol}`
      );
    }
    handleValue(value);
  };

  const formatValue = (value: number) => {
    const stringValue = value.toString();
    const hasDecimals = stringValue.includes(".");
    const splitValue = stringValue.split(".");
    let result = "";
    // @ts-ignore
    const doFormat = (value: string) => {
      if (value.length > 3) {
        const take = value.slice(-3);
        result = result ? `${take},${result}` : take;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return doFormat(value.substr(0, value.length - 3));
      }
      result = result
        ? `${value},${result}${
            splitValue[1] ? `.${splitValue[1]}` : hasDecimals ? "." : ""
          }`
        : `${splitValue[0]}${
            splitValue[1] ? `.${splitValue[1]}` : hasDecimals ? "." : ""
          }`;
      return;
    };
    doFormat(splitValue[0]);

    return result;
  };

  const deformatValue = (value: string) => {
    return value.replaceAll(",", "");
  };

  return (
    <Input
      disabled={disabled}
      type="text"
      value={formatValue(value)}
      onChange={(event) => handleChange(deformatValue(event.target.value))}
      placeholder={disabled ? "" : "Enter an amount"}
    />
  );
};

export default InputCurrency;
