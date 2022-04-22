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
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";
// @ts-ignore
import { abis } from "@f-wallet/contracts";

const contract = new Contract(
  addresses[250]["rave"],
  abis.rave,
  new JsonRpcProvider("https://rpc.ftm.tools")
);

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
  const onHandleChange = async (value: string) => {
    setError(null);
    setValidAddress(null);
    setReceiverAddress(null);
    setValue(value);
    let isOwned;
    contract.functions.isOwnedByMapping(value.toUpperCase()).then(res => {
      if (res[0]) {
        isOwned = true;
        contract.functions.getOwnerOfName(value.toUpperCase()).then(result => {
          setValue(result[0]);
        });
      } else {
        isOwned = false;
      }
    });
    if (((value.length === 42 && !isValidAddress(value)) || value.length > 42) && !isOwned) {
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
