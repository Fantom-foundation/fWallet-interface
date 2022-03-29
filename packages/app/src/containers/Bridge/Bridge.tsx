import React, { useContext, useEffect, useState } from "react";
import Row from "../../components/Row";
import {
  Button,
  Container,
  ContentBox,
  OverlayButton,
  Typo1,
  Typo2,
  Typo3,
} from "../../components";
import Column from "../../components/Column";
import styled, { ThemeContext } from "styled-components";
import multichainImg from "../../assets/img/icons/multichain.svg";
import Spacer from "../../components/Spacer";
import SwapImg from "../../assets/img/symbols/Swap.svg";
import {
  chainToNetworkInfoMap,
  supportedChainsForBridge,
  transactionStatusMapping,
} from "../../utils/bridge";
import DropDownButton from "../../components/DropDownButton";
import useBridgeApi from "../../hooks/useBridgeApi";
import useWalletProvider from "../../hooks/useWalletProvider";
import useMultiChain from "../../hooks/useMultiChain";
import { Wallet } from "@ethersproject/wallet";
import InputError from "../../components/InputError";
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import InputTextBox from "../../components/InputText/InputTextBox";
import ModalContent from "../../components/ModalContent";
import Scrollbar from "../../components/Scrollbar";
import TokenBalance from "../../components/TokenBalance";
import useModal from "../../hooks/useModal";
import TokenSelectModal from "../../components/TokenSelectModal/TokenSelectModal";
import InputCurrency from "../../components/InputCurrency";
import InputCurrencyBox from "../../components/InputCurrency/InputCurrencyBox";
import { AddressZero } from "@ethersproject/constants";
import { unitToWei, weiToUnit } from "../../utils/conversion";
import { formatAddress, loadERC20Contract } from "../../utils/wallet";
import { Token, ETHER } from "@pancakeswap/sdk";
import useBridge from "../../hooks/useBridge";
import useSendTransaction from "../../hooks/useSendTransaction";
import useFantomERC20 from "../../hooks/useFantomERC20";
import { BigNumber } from "@ethersproject/bignumber";
import useTransaction from "../../hooks/useTransaction";

const ChainSelect: React.FC<any> = ({ selectChain, chains }) => {
  const { color } = useContext(ThemeContext);
  return (
    <ContentBox
      style={{
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: color.primary.black(),
        borderRadius: "8px",
        padding: "1rem",
      }}
    >
      <Column style={{ gap: "1rem" }}>
        {chains.map((chainId: number) => {
          return (
            <OverlayButton
              key={`select-${chainId}`}
              onClick={() => {
                selectChain(chainId);
              }}
            >
              <Row style={{ gap: "1rem", alignItems: "center" }}>
                <img
                  style={{ height: "30px", width: "30px" }}
                  src={chainToNetworkInfoMap[chainId].image}
                />
                <Typo2 style={{ fontWeight: "bold" }}>
                  {chainToNetworkInfoMap[chainId].name}
                </Typo2>
              </Row>
            </OverlayButton>
          );
        })}
      </Column>
    </ContentBox>
  );
};

const ChainSelector: React.FC<any> = ({
  text,
  chains,
  selected,
  selectChain,
}) => {
  const { color } = useContext(ThemeContext);
  return (
    <Column style={{ width: "100%" }}>
      <Typo2 style={{ color: "#84888d" }}>{text}</Typo2>
      <Spacer size="xs" />
      <DropDownButton
        width="100%"
        DropDown={() => ChainSelect({ selectChain, chains })}
        dropdownTop={65}
      >
        {/*<OverlayButton style={{ padding: 0 }}>*/}
        <ContentBox
          style={{
            boxSizing: "border-box",
            width: "100%",
            backgroundColor: color.primary.black(),
            padding: "1rem",
          }}
        >
          <Row style={{ gap: "1rem", alignItems: "center" }}>
            <img
              style={{ height: "30px", width: "30px" }}
              src={chainToNetworkInfoMap[selected].image}
            />
            <Typo2 style={{ fontWeight: "bold" }}>
              {chainToNetworkInfoMap[selected].name}
            </Typo2>
          </Row>
        </ContentBox>
        {/*</OverlayButton>*/}
      </DropDownButton>
    </Column>
  );
};

const ChainSelection: React.FC<any> = ({
  setTokenList,
  connectToChain,
  bridgeToChain,
}) => {
  const { walletContext } = useWalletProvider();
  const [fromChain, setFromChain] = useState(250);
  const [toChain, setToChain] = useState(1);
  const { getBridgeTokens } = useBridgeApi();
  const { forceSwap } = useMultiChain();

  useEffect(() => {
    connectToChain(fromChain);
  }, [fromChain]);

  useEffect(() => {
    bridgeToChain(toChain);
  }, [toChain]);

  useEffect(() => {
    setTokenList(null);
    getBridgeTokens(toChain, fromChain).then((result) => setTokenList(result));
  }, [fromChain, toChain]);

  const handleSetFromChain = (chainId: number) => {
    if (chainId !== 250) {
      setToChain(250);
    }
    if (chainId === toChain) {
      setToChain(chainId === 250 ? 1 : 250);
    }
    setFromChain(chainId);
  };

  const handleSetToChain = (chainId: number) => {
    if (chainId !== 250) {
      setFromChain(250);
    }
    if (chainId === fromChain) {
      setFromChain(chainId === 250 ? 1 : 250);
    }
    setToChain(chainId);
  };

  const handleSwap = () => {
    const fromChainOld = fromChain;
    const toChainOld = toChain;

    setFromChain(toChainOld);
    setToChain(fromChainOld);
  };
  return (
    <Column>
      <ChainSelector
        text="From Chain"
        selected={fromChain}
        selectChain={handleSetFromChain}
        chains={supportedChainsForBridge.filter(
          (chainId) => chainId !== fromChain
        )}
      />
      {walletContext.activeWallet.chainId !== fromChain && (
        <>
          <Spacer size="xs" />
          <OverlayButton
            style={{ textAlign: "start" }}
            onClick={() => forceSwap(fromChain)}
          >
            <InputError
              error={"Please switch your web3 wallet to use the above chain"}
              fontSize="18px"
            />
          </OverlayButton>
        </>
      )}
      <Spacer size="lg" />
      <Row style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ height: "1px", width: "100%" }} />
        <OverlayButton style={{ padding: 0 }} onClick={handleSwap}>
          <Row
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: "64px",
              width: "64px",
              border: "1px solid #67748B",
              borderRadius: "50%",
            }}
          >
            <img alt="swap" style={{ height: "20px" }} src={SwapImg} />
          </Row>
        </OverlayButton>
        <div style={{ height: "1px", width: "100%" }} />
      </Row>
      <Spacer size="lg" />
      <ChainSelector
        text="To Chain"
        selected={toChain}
        selectChain={handleSetToChain}
        chains={supportedChainsForBridge.filter(
          (chainId) => chainId !== toChain
        )}
      />
      <Spacer />
    </Column>
  );
};

const TokenSelector: React.FC<any> = ({ tokens, selected, selectToken }) => {
  const { color } = useContext(ThemeContext);
  const [onPresentSelectTokenModal] = useModal(
    <BridgeTokenSelectModal tokens={tokens} selectToken={selectToken} />,
    "bridge-token-select-modal"
  );

  return (
    <Column style={{ width: "100%", flex: 1 }}>
      <OverlayButton
        style={{ padding: 0 }}
        disabled={!tokens || !tokens.length}
        onClick={() => tokens && tokens.length && onPresentSelectTokenModal()}
      >
        <ContentBox
          style={{
            boxSizing: "border-box",
            width: "100%",
            backgroundColor: color.primary.black(),
            padding: "1rem",
            height: "64px",
          }}
        >
          <Row style={{ gap: "1rem", alignItems: "center" }}>
            {selected ? (
              <>
                <img
                  style={{ height: "30px", width: "30px" }}
                  src={selected.logoUrl}
                />
                <Typo2 style={{ fontWeight: "bold" }}>{selected.symbol}</Typo2>
              </>
            ) : tokens && tokens.length ? (
              <Typo1>Select token </Typo1>
            ) : (
              <Typo1>Loading tokens... </Typo1>
            )}
          </Row>
        </ContentBox>
      </OverlayButton>
    </Column>
  );
};

const BridgeTokenSelectModal: React.FC<any> = ({
  tokens,
  selectToken,
  onDismiss,
}) => {
  const { color } = useContext(ThemeContext);
  return (
    <Modal
      style={{ padding: "20px 24px", maxHeight: "80vh" }}
      onDismiss={onDismiss}
    >
      <ModalTitle text="Select token" />
      <Spacer />
      <ModalContent style={{ padding: "16px 0px" }}>
        <Column>
          <Row
            style={{
              justifyContent: "space-between",
              padding: "0 1rem .5rem 1rem",
            }}
          >
            <Typo3
              style={{
                textAlign: "left",
                width: "8rem",
                color: color.greys.grey(),
              }}
            >
              TOKEN NAME
            </Typo3>
            <Typo3
              style={{
                textAlign: "right",
                width: "8rem",
                color: color.greys.grey(),
              }}
            >
              BALANCE
            </Typo3>
          </Row>
          <Scrollbar style={{ height: "60vh" }}>
            <Column>
              {tokens &&
                tokens.map((token: any) => {
                  return (
                    <StyledOverlayButton
                      key={"token-select-" + token.name}
                      onClick={() => {
                        selectToken(token);
                        onDismiss();
                      }}
                      style={{ padding: ".8rem" }}
                    >
                      <Row style={{ gap: "1rem", alignItems: "center" }}>
                        <img
                          style={{ height: "30px", width: "30px" }}
                          src={token.logoUrl}
                        />
                        <Typo2 style={{ fontWeight: "bold" }}>
                          {token.symbol}
                        </Typo2>
                      </Row>
                      {/*<TokenBalance token={asset} imageSize="24px" />*/}
                    </StyledOverlayButton>
                  );
                })}
            </Column>
          </Scrollbar>
        </Column>
      </ModalContent>
    </Modal>
  );
};

const BridgeTokenList: React.FC<any> = ({
  tokenList,
  fromChain,
  toChain,
  setSelectedToken,
  amount,
  setAmount,
  inputError,
  isBridgeTxCompleted,
}) => {
  const { walletContext } = useWalletProvider();
  const { DEFAULT_PROVIDERS } = useMultiChain();
  const [token, setToken] = useState(null);
  const [fromTokenBalance, setFromTokenBalance] = useState(null);
  const [toTokenBalance, setToTokenBalance] = useState(null);

  const getBalance = async (address: string, provider: any, to = false) => {
    if (address === AddressZero || !address) {
      const nativeBalance = await provider.getBalance(
        walletContext.activeWallet.address
      );

      if (to) setToTokenBalance(nativeBalance);
      if (!to) setFromTokenBalance(nativeBalance);

      return nativeBalance;
    }

    const contract = await loadERC20Contract(address, provider);
    const tokenBalance = await contract.balanceOf(
      walletContext.activeWallet.address
    );

    if (to) setToTokenBalance(tokenBalance);
    if (!to) setFromTokenBalance(tokenBalance);

    return tokenBalance;
  };

  useEffect(() => {
    if (tokenList && tokenList.length) {
      return setToken(tokenList[0]);
    }
  }, [tokenList]);

  useEffect(() => {
    setSelectedToken(token);
    setFromTokenBalance(null);
    setToTokenBalance(null);
    setAmount("");

    if (token) {
      const fromBalancePromise = getBalance(
        token.isNative === "true" ? AddressZero : token.ContractAddress,
        DEFAULT_PROVIDERS[fromChain]
      );
      const toBalancePromise = getBalance(
        token.isNativeTo === "true" ? AddressZero : token.ContractAddressTo,
        DEFAULT_PROVIDERS[toChain],
        true
      );

      Promise.all([fromBalancePromise, toBalancePromise]).then(
        ([fromBalance, toBalance]) =>
          setSelectedToken({
            ...token,
            balance: fromBalance,
            balanceTo: toBalance,
          })
      );
      return;
    }
  }, [token, walletContext.activeWallet.address, isBridgeTxCompleted]);

  return (
    <Column>
      <Row style={{ gap: "1rem" }}>
        <Typo2 style={{ flex: 1, color: "#84888d" }}>{"Token to Bridge"}</Typo2>
        <Row style={{ flex: 2, paddingLeft: "1rem" }}>
          {inputError ? (
            <InputError error={inputError} fontSize="18px" />
          ) : (
            <Spacer />
          )}
        </Row>
      </Row>
      <Spacer size="xs" />
      <Row style={{ gap: "1rem" }}>
        <TokenSelector
          tokens={tokenList}
          selected={token}
          selectToken={setToken}
        />
        <div style={{ flex: 2 }}>
          <InputCurrencyBox
            disabled={!token}
            value={amount}
            setValue={setAmount}
            max={
              token && fromTokenBalance
                ? weiToUnit(fromTokenBalance, token?.Decimals)
                : 0
            }
            variant="new"
          />
        </div>
      </Row>
      <Spacer />
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2 style={{ color: "#84888d" }}>
          Balance on {chainToNetworkInfoMap[fromChain].name}
        </Typo2>
        <Row>
          <Typo2>
            {token && fromTokenBalance
              ? weiToUnit(fromTokenBalance, token.Decimals)
              : "-"}
          </Typo2>
          <Spacer />
        </Row>
      </Row>
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2 style={{ color: "#84888d" }}>
          Balance on {chainToNetworkInfoMap[toChain].name}
        </Typo2>
        <Row>
          <Typo2>
            {token && toTokenBalance
              ? weiToUnit(toTokenBalance, token.DecimalsTo)
              : "-"}
          </Typo2>
          <Spacer />
        </Row>
      </Row>
    </Column>
  );
};

const Bridge: React.FC<any> = () => {
  const { walletContext } = useWalletProvider();
  const { color } = useContext(ThemeContext);
  const { setToChain: connectToChain } = useMultiChain();
  const { bridgeStableMethod, bridgeNativeMethod, bridgeMethod } = useBridge();
  const { getTransactionStatus } = useBridgeApi();
  const { transaction } = useTransaction();
  const { approve, getAllowance } = useFantomERC20();
  const [tokenList, setTokenList] = useState(null);
  const [fromChain, setFromChain] = useState(250);
  const [toChain, setToChain] = useState(1);
  const [selectedToken, setSelectedToken] = useState(null);
  const [isApproved, setIsApproved] = useState(true);
  const [amount, setAmount] = useState(null);
  const [inputError, setInputError] = useState(null);
  const [bridgeTxHash, setBridgeTxHash] = useState(
    window.localStorage.getItem("BridgeTxHash")
  );
  const [bridgeStatus, setBridgeStatus] = useState(0);

  const {
    router,
    needApprove,
    ContractAddress,
    symbol,
    Decimals,
    fromChainId,
    balance,
    MinimumSwap,
    MaximumSwap,
    type,
    toChainId,
    isNativeTo,
  } = selectedToken || {};

  const validateAmount = (amount: string) => {
    if (selectedToken) {
      if (balance && BigNumber.from(unitToWei(amount, Decimals)).gt(balance)) {
        return setInputError("Insufficient funds");
      }
      if (parseInt(amount) < parseInt(MinimumSwap)) {
        return setInputError("Below minimum amount");
      }
      if (parseInt(amount) > parseInt(MaximumSwap)) {
        return setInputError("Above maximum amount");
      }
      return setInputError(null);
    }
  };

  const handleSetAmount = (value: string) => {
    validateAmount(value);
    setAmount(value);
  };

  useEffect(() => {
    validateAmount(amount);
  }, [selectedToken]);

  const isBridgeTxPending =
    transaction[bridgeTxHash] && transaction[bridgeTxHash].status === "pending";
  const isBridgeTxCompleted =
    transaction[bridgeTxHash] &&
    transaction[bridgeTxHash].status === "completed";

  const {
    sendTx: handleApproveToken,
    isPending: isApprovePending,
    isCompleted: isApproveCompleted,
  } = useSendTransaction(() =>
    approve(selectedToken.ContractAddress, selectedToken.router)
  );

  const handleBridgeAction = async () => {
    const isStableType =
      type === "anySwapOutUnderlying" ||
      type === "anySwapOut(address,address,uint256,uint256)" ||
      type === "anySwapOutNative(address,address,uint256)";
    const isNative = symbol !== "FTM" && !ContractAddress;

    let tx;
    if (isNative) {
      tx = await bridgeNativeMethod(
        selectedToken,
        unitToWei(amount, Decimals).toString()
      );
    } else if (isStableType) {
      tx = await bridgeStableMethod(
        selectedToken,
        unitToWei(amount, Decimals).toString()
      );
    } else {
      tx = await bridgeMethod(
        selectedToken,
        unitToWei(amount, Decimals).toString()
      );
    }

    if (tx) {
      window.localStorage.setItem("BridgeTxHash", tx);
      setBridgeTxHash(tx);
      // TODO announce is not a public api endpoint
      // announceTransaction(tx, fromChainId, toChainId);
    }
  };

  const resetTransactionStatus = () => {
    window.localStorage.removeItem("BridgeTxHash");
    setBridgeTxHash(null);
  };

  useEffect(() => {
    connectToChain(fromChain);
  }, [fromChain]);

  useEffect(() => {
    if (walletContext.activeWallet.chainId !== fromChain) {
      return;
    }
    if (selectedToken?.needApprove === "true" && amount) {
      getAllowance(selectedToken.ContractAddress, selectedToken.router).then(
        (allowance) => {
          if (
            allowance.gte(
              amount
                ? BigNumber.from(unitToWei(amount, selectedToken.decimals))
                : selectedToken.balance
            )
          )
            return setIsApproved(true);
          return setIsApproved(false);
        }
      );
    }
    return setIsApproved(true);
  }, [selectedToken, isApproveCompleted, walletContext.activeWallet.chainId]);

  useEffect(() => {
    let interval: any;
    if (bridgeTxHash && !interval) {
      const fetchStatus = () =>
        getTransactionStatus(bridgeTxHash)
          .then((response) => {
            if (!response?.data?.info) {
              return;
            }
            return setBridgeStatus(response.data.info.status);
          })
          .catch((err) => console.error(err));

      interval = setInterval(() => fetchStatus(), 10000);
    }
    if (!bridgeTxHash) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [bridgeTxHash]);

  console.log(selectedToken);

  return (
    <>
      {bridgeTxHash && (
        <ContentBox
          style={{
            backgroundColor: "gray",
            position: "fixed",
            right: "2rem",
            top: "8rem",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <Column style={{}}>
            <Typo2 style={{ fontWeight: "bold" }}>Bridge transaction</Typo2>
            <Spacer size="xs" />
            <Typo2>
              {"Hash: "}
              <a
                href={`https://anyswap.net/explorer/tx?params=${bridgeTxHash}`}
                target="_blank"
              >
                {formatAddress(bridgeTxHash)}
              </a>
            </Typo2>
            {bridgeStatus > 0 && (
              <Typo2>
                {transactionStatusMapping[bridgeStatus] || "Unknown"}
              </Typo2>
            )}
            <Spacer size="sm" />
            <OverlayButton
              style={{ padding: 0 }}
              onClick={() => resetTransactionStatus()}
            >
              <Typo2 style={{ fontWeight: "bold" }}>Close</Typo2>
            </OverlayButton>
          </Column>
        </ContentBox>
      )}
      <Row style={{ width: "100%", justifyContent: "center" }}>
        <ContentBox style={{ width: "600px" }}>
          <Column style={{ width: "100%" }}>
            <Row style={{ justifyContent: "space-between" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                Bridge
              </div>
              <div
                style={{
                  borderRadius: "34px",
                  backgroundColor: color.primary.black(),
                }}
              >
                <Row style={{ justifyContent: "space-between", gap: "1rem" }}>
                  <Typo3
                    style={{ color: "#67748B", padding: ".5rem 0 .5rem 1rem" }}
                  >
                    Powered by multichain
                  </Typo3>
                  <img src={multichainImg} />
                </Row>
              </div>
            </Row>
            <Spacer />
            {walletContext.activeWallet.providerType === "hardware" ? (
              <Typo1>
                Hardware wallet is unsupported. Use any of the other wallet
                types to use the bridge.
              </Typo1>
            ) : (
              <>
                <ChainSelection
                  setTokenList={setTokenList}
                  connectToChain={setFromChain}
                  bridgeToChain={setToChain}
                />
                <Spacer />
                <Divider />
                <Spacer size="lg" />
                <BridgeTokenList
                  tokenList={tokenList}
                  setSelectedToken={setSelectedToken}
                  fromChain={fromChain}
                  toChain={toChain}
                  amount={amount}
                  setAmount={handleSetAmount}
                  inputError={inputError}
                  isBridgeTxCompleted={isBridgeTxCompleted}
                />
                <Spacer />
                <Divider />
                <Spacer size="lg" />
                <ContentBox
                  style={{
                    backgroundColor: color.primary.black(),
                    padding: "1.5rem",
                  }}
                >
                  <Column style={{ width: "100%", gap: ".5rem" }}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Typo2 style={{ color: "#84888d" }}>
                        Current Bridgeable Range
                      </Typo2>
                      <Typo2>
                        {selectedToken
                          ? `${selectedToken.MinimumSwap} - ${selectedToken.MaximumSwap} ${selectedToken.symbol}`
                          : "-"}
                      </Typo2>
                    </Row>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Typo2 style={{ color: "#84888d" }}>
                        Max bridge amount
                      </Typo2>
                      <Typo2>
                        {selectedToken
                          ? `${selectedToken.MaximumSwap} ${selectedToken.symbol}`
                          : "-"}
                      </Typo2>
                    </Row>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Typo2 style={{ color: "#84888d" }}>
                        Min Bridge amount
                      </Typo2>
                      <Typo2>
                        {selectedToken
                          ? `${selectedToken.MinimumSwap} ${selectedToken.symbol}`
                          : "-"}
                      </Typo2>
                    </Row>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Typo2 style={{ color: "#84888d" }}>Minimum fee</Typo2>
                      <Typo2>
                        {selectedToken
                          ? `${selectedToken.MinimumSwapFee} ${selectedToken.symbol}`
                          : "-"}
                      </Typo2>
                    </Row>
                  </Column>
                </ContentBox>
                <Spacer />
                <Typo3>
                  {selectedToken
                    ? `* Amounts greater than ${selectedToken.BigValueThreshold} ${selectedToken.symbol} could
                  take up to 12 hours`
                    : ""}
                </Typo3>
                <Spacer />
                {isApproved ? (
                  <Button
                    disabled={
                      inputError ||
                      !amount ||
                      walletContext.activeWallet.chainId !== fromChain
                    }
                    variant="primary"
                    onClick={handleBridgeAction}
                  >
                    {isBridgeTxPending
                      ? "Broadcasting transaction"
                      : "Bridge Token"}
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleApproveToken}>
                    {isApprovePending
                      ? "Approving"
                      : isApproveCompleted
                      ? "Approve successful"
                      : "Approve Token"}
                  </Button>
                )}
              </>
            )}
          </Column>
        </ContentBox>
      </Row>
      <Spacer />
    </>
  );
};

const Divider: React.FC<any> = ({ padding = "2rem" }) => {
  return (
    <div
      style={{
        width: `calc(100% + ${padding} + ${padding})`,
        marginLeft: `-${padding}`,
        height: "1px",
        backgroundColor: "#232F46",
      }}
    />
  );
};

const StyledOverlayButton = styled(OverlayButton)`
  :hover {
    background-color: ${(props) => props.theme.color.primary.semiWhite(0.1)};
  }
`;

export default Bridge;
