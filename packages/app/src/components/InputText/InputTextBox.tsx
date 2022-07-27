import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import Column from "../Column";
import Row from "../Row";
import { Input, TextArea, Typo2 } from "../index";
import Spacer from "../Spacer";
import InputError from "../InputError";

const InputTextBox: React.FC<any> = ({
  title,
  text,
  setText,
  placeholder,
  maxLength = 120,
  error = null,
  setError,
  valueName = "value",
  textArea = false,
  style = {},
  alignText = "unset",
  password = false,
  disabled = false,
  small = false,
  pre = null,
}) => {
  const { color } = useContext(ThemeContext);
  const [internalError, setInternalError] = useState(error);

  const onHandleChange = (value: string) => {
    if (!maxLength || value.length <= maxLength) {
      setText(value);
    }
  };

  useEffect(() => {
    if (setError) {
      setError(null);
    }
    setInternalError(null);
    return () => setInternalError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    if (error) {
      return setInternalError(error);
    }
  }, [error]);

  return (
    <Column style={{ ...style }}>
      {title && (
        <Row style={{ justifyContent: "space-between" }}>
          <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
            {title}
          </Typo2>
        </Row>
      )}
      <Spacer size="xs" />
      {textArea ? (
        <Row
          style={{
            backgroundColor: "#202F49",
            borderRadius: "8px",
            height: "200px",
            alignItems: "center",
            paddingLeft: ".9rem",
          }}
        >
          <TextArea
            value={text}
            onInput={(event) => {
              // @ts-ignore
              onHandleChange(event.target.value);
            }}
            onBlur={() =>
              text.length === 0 &&
              setInternalError(`Please enter a ${valueName}`)
            }
            placeholder={placeholder}
          />
        </Row>
      ) : (
        <Row
          style={{
            backgroundColor: "#202F49",
            borderRadius: "8px",
            height: small ? "48px" : "64px",
            alignItems: "center",
          }}
        >
          {pre && (
            <>
              <Spacer size="sm" />
              <Typo2 style={{ fontWeight: !disabled ? "bold" : "normal" }}>
                {pre}
              </Typo2>
            </>
          )}
          <Spacer size="sm" />
          <Input
            fontSize={small && "16px"}
            fontWeight={small && "bold"}
            disabled={disabled}
            style={{ width: "100%", textAlign: alignText }}
            type={password ? "password" : "text"}
            value={text}
            onChange={(event) => {
              onHandleChange(event.target.value);
            }}
            onBlur={() =>
              text.length === 0 &&
              setInternalError(`Please enter a ${valueName}`)
            }
            onKeyDown={(event) => {
              if ((event.charCode || event.keyCode) === 13) {
                event.preventDefault();
              }
            }}
            placeholder={placeholder}
          />
        </Row>
      )}
      {!small && (
        <>
          <Spacer size="xs" />
          <Row
            style={{
              justifyContent: "space-between",
              color: color.greys.darkGrey(),
            }}
          >
            {internalError ? (
              <InputError fontSize="18px" error={internalError} />
            ) : (
              <Spacer size="lg" />
            )}
            {maxLength && (
              <Typo2>
                {text.length}/{maxLength}
              </Typo2>
            )}
          </Row>
        </>
      )}
    </Column>
  );
};

export default InputTextBox;
