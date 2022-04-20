import React, { useContext, useState } from "react";
import { ThemeContext } from "styled-components";
import useWalletProvider from "../../hooks/useWalletProvider";
import { isSameAddress, isValidAddress } from "../../utils/wallet";
import Column from "../Column";
import Row from "../Row";
import { Input, Typo2 } from "../index";
import walletSymbol from "../../assets/img/symbols/wallet.svg";
import Spacer from "../Spacer";
import AddressBalance from "../AddressBalance";
import InputError from "../InputError";
import { fns } from "fns-helper";

const InputAddress: React.FC<any> = ({
  token,
  setReceiverAddress,
  initial,
}) => {
  const { color } = useContext(ThemeContext);
  const { walletContext } = useWalletProvider();
  const [value, setValue] = useState(initial || "");
  const [error, setError] = useState(null);
  const [validAddress, setValidAddress] = useState(null);
  const onHandleBlur = (value: string) => {
    if (!value.length) {
      return;
    }
    if (!isValidAddress(value)) {
      setError("Invalid address");
    }
  };
  const onHandleChange = (value: string) => {
    setError(null);
    setValidAddress(null);
    setReceiverAddress(null);
    setValue(value);
    fns.functions.isOwnedByMapping(value).then(res => {
      if (res[0]) {
        fns.functions.getOwnerOfName(value).then(ress => {
          setValue(ress[0]);
        });
      }
    });
    if ((value.length === 42 && !isValidAddress(value)) || value.length > 42) {
      return setError("Invalid address");
    }
    if (
      value.length === 42 &&
      isSameAddress(value, walletContext.activeWallet.address)
    ) {
      return setError("Receiver address is same as sender address");
    }
    if (value.length === 42 && isValidAddress(value)) {
      setValidAddress(value);
      setReceiverAddress(value);
    }
  };

  return (
    <Column>
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2 style={{ color: color.greys.grey() }}>To</Typo2>
        {validAddress && (
          <Row>
            <img alt="" src={walletSymbol} />
            <Spacer size="xs" />
            {validAddress ? (
              <AddressBalance address={validAddress} token={token} />
            ) : (
              <Typo2 style={{ color: color.greys.grey() }}>
                {`0 ${token.symbol}`}
              </Typo2>
            )}
          </Row>
        )}
      </Row>
      <Spacer size="xs" />
      <Row
        style={{
          backgroundColor: "#202F49",
          borderRadius: "8px",
          height: "64px",
          alignItems: "center",
        }}
      >
        <Spacer />
        <Input
          type="text"
          value={value}
          onChange={(event) => {
            onHandleChange(event.target.value);
          }}
          onBlur={(event) => onHandleBlur(event.target.value)}
          placeholder="Input a Fantom Opera address"
        />
      </Row>
      <Spacer size="xs" />
      {error ? <InputError error={error} /> : <Spacer size="lg" />}
    </Column>
  );
};

export default InputAddress;
