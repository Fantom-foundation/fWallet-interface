import React, { useContext, useEffect } from "react";
import {
  getAccountDelegations,
  getAccountDelegationSummary,
  getValidators,
} from "../../utils/delegation";
import {
  hexToUnit,
  toFormattedBalance,
  weiToUnit,
} from "../../utils/conversion";
import StatPair from "../../components/StatPair";
import { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";
import Row from "../../components/Row";
import { DelegationNameInfo } from "../../components/DelegationBalance/DelegationBalance";
import {
  Button,
  ContentBox,
  Heading1,
  OverlayButton,
  Typo1,
  Typo2,
  Typo3,
} from "../../components";
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import ModalContent from "../../components/ModalContent";
import Spacer from "../../components/Spacer";
import useModal from "../../hooks/useModal";
import Column from "../../components/Column";
import { FantomApiMethods } from "../../hooks/useFantomApi";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import useSendTransaction from "../../hooks/useSendTransaction";
import useSendBatchTransactions from "../../hooks/useSendBatchTransactions";
import { BigNumber } from "@ethersproject/bignumber";
import Loader from "../../components/Loader";

const RewardsContent: React.FC<any> = ({ totalPendingRewards }) => {
  const rewardsFTM =
    totalPendingRewards && toFormattedBalance(weiToUnit(totalPendingRewards));
  return (
    <StatPair
      title="Pending rewards"
      value1={rewardsFTM[0]}
      value2={rewardsFTM[1]}
      suffix="FTM"
      spacer="xs"
      titleColor="#19E1FF"
    />
  );
};

const ClaimDelegationRewardRow: React.FC<any> = ({
  activeDelegation,
  claimTx,
  compoundTx,
}) => {
  const { color } = useContext(ThemeContext);
  const { txSFCContractMethod } = useFantomContract();
  const pendingReward = hexToUnit(
    activeDelegation.delegation.pendingRewards.amount
  );
  const formattedPendingReward = toFormattedBalance(
    hexToUnit(activeDelegation.delegation.pendingRewards.amount)
  );

  const {
    sendTx: handleClaimReward,
    isPending,
    isCompleted,
  } = useSendTransaction(() =>
    txSFCContractMethod(SFC_TX_METHODS.CLAIM_REWARDS, [
      activeDelegation.delegation.toStakerId,
    ])
  );

  const {
    sendTx: handleCompoundReward,
    isPending: isCompoundPending,
    isCompleted: isCompoundCompleted,
  } = useSendTransaction(() =>
    txSFCContractMethod(SFC_TX_METHODS.RESTAKE_REWARDS, [
      activeDelegation.delegation.toStakerId,
    ])
  );

  const isClaiming = isPending || claimTx?.status === "pending";
  const isClaimed = isCompleted || claimTx?.status === "completed";
  const isCompounding = isCompoundPending || compoundTx?.status === "pending";
  const isCompounded =
    isCompoundCompleted || compoundTx?.status === "completed";

  return (
    <Row style={{ textAlign: "left", height: "3rem", padding: ".5rem 0" }}>
      <Row style={{ width: "100%" }}>
        <Row style={{ alignItems: "center" }}>
          <DelegationNameInfo
            delegationInfo={activeDelegation.delegationInfo.stakerInfo}
            imageSize={32}
            id={activeDelegation.delegation.toStakerId}
            dropNameAtMediaSize="sm"
          />
        </Row>
        <Row style={{ alignItems: "center", marginLeft: "auto" }}>
          <Typo1 style={{ fontWeight: "bold" }}>
            {isClaimed
              ? "0.00"
              : `${formattedPendingReward[0]}${formattedPendingReward[1]}`}{" "}
            FTM
          </Typo1>
          <Spacer responsive />
        </Row>
      </Row>
      <Row
        style={{
          marginLeft: "auto",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "1rem",
        }}
      >
        <OverlayButton
          disabled={isCompounded || isCompounding || pendingReward < 0.01}
          onClick={() => handleCompoundReward()}
        >
          <Typo1
            style={{
              fontWeight: "bold",
              color:
                isCompounded || pendingReward < 0.01
                  ? color.primary.cyan(0.5)
                  : color.primary.cyan(),
            }}
          >
            {isCompounded
              ? "Compounded"
              : isCompounding
              ? "Compounding..."
              : "Compound"}
          </Typo1>
        </OverlayButton>
        <Typo1>|</Typo1>
        <OverlayButton
          disabled={isClaimed || isClaiming || pendingReward < 0.01}
          onClick={() => handleClaimReward()}
        >
          <Typo1
            style={{
              fontWeight: "bold",
              color:
                isClaimed || pendingReward < 0.01
                  ? color.primary.cyan(0.5)
                  : color.primary.cyan(),
            }}
          >
            {isClaimed ? "Claimed" : isClaiming ? "Claiming..." : "Claim"}
          </Typo1>
        </OverlayButton>
      </Row>
    </Row>
  );
};

const ClaimRewardsModal: React.FC<any> = ({ onDismiss }) => {
  const { color } = useContext(ThemeContext);
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();
  const activeAddress = walletContext.activeWallet.address
    ? walletContext.activeWallet.address.toLowerCase()
    : null;

  const delegationsResponse = apiData[FantomApiMethods.getDelegations];
  const accountDelegationsResponse = apiData[
    FantomApiMethods.getDelegationsForAccount
  ].get(activeAddress);

  const accountDelegations = getAccountDelegations(
    accountDelegationsResponse?.data
  );
  const delegations = getValidators(delegationsResponse.data);
  const activeDelegations = !(delegations && accountDelegations)
    ? []
    : accountDelegations.map((accountDelegation: any) => ({
        ...accountDelegation,
        delegationInfo: delegations.find((delegation) => {
          return delegation.id === accountDelegation.delegation.toStakerId;
        }),
      }));
  const activeDelegationWithPendingRewards = activeDelegations.filter(
    (delegation) =>
      hexToUnit(delegation.delegation.pendingRewards.amount) > 0.0099
  );

  const { txSFCContractMethod } = useFantomContract();

  const claimAllBatch = activeDelegationWithPendingRewards.map(
    (activeDelegation) => {
      return [
        activeDelegation.delegation.toStakerId,
        () =>
          txSFCContractMethod(SFC_TX_METHODS.CLAIM_REWARDS, [
            activeDelegation.delegation.toStakerId,
          ]),
      ];
    }
  );

  const compoundAllBatch = activeDelegationWithPendingRewards.map(
    (activeDelegation) => {
      return [
        activeDelegation.delegation.toStakerId,
        () =>
          txSFCContractMethod(SFC_TX_METHODS.RESTAKE_REWARDS, [
            activeDelegation.delegation.toStakerId,
          ]),
      ];
    }
  );

  // TODO remove -> just for testing batching
  // const { sendTokens } = useFantomERC20();
  // const testBatch = activeDelegations.map((activeDelegation) => {
  //   return [
  //     activeDelegation.delegation.toStakerId,
  //     () =>
  //       sendTokens(
  //         "0x866510264b9e950a7fd2c0f12f6cd63891aab436",
  //         "0xDbA4392F0fC03B4FFF1b42861ad733FcfA812da7",
  //         "1000000000000000000"
  //       ),
  //   ];
  // });

  const {
    sendBatch: handleClaimAllRewards,
    hashes: txHashesClaim,
    txs: txsClaim,
    pendingTxs: pendingClaimTxs,
    successfulTxs: successfulClaimTxs,
    failedTxs: failedClaimTxs,
    reset: resetClaimTxs,
  } = useSendBatchTransactions(claimAllBatch);

  const {
    sendBatch: handleCompoundAllRewards,
    hashes: txHashesCompound,
    txs: txsCompound,
    pendingTxs: pendingCompoundTxs,
    successfulTxs: successfulCompoundTxs,
    failedTxs: failedCompoundTxs,
    reset: resetCompoundTxs,
  } = useSendBatchTransactions(compoundAllBatch);

  useEffect(() => {
    resetClaimTxs();
    resetCompoundTxs();
  }, [walletContext.activeWallet.address]);

  return (
    <Modal onDismiss={onDismiss}>
      <ModalTitle text="Claim Rewards" />
      <ModalContent>
        <Row
          style={{
            textAlign: "left",
            width: "80%",
            justifyContent: "space-between",
          }}
        >
          <Typo3
            style={{
              color: color.greys.grey(),
            }}
          >
            Validator
          </Typo3>
          <Typo3 style={{ color: color.greys.grey() }}>Pending rewards</Typo3>
        </Row>
        <Spacer size="sm" />
        {activeDelegations.map((delegation, index) => {
          const isLastRow = delegations.length === index + 1;
          return (
            <div
              key={`claim-rewards-row-${delegation.delegation.toStakerId}`}
              style={{
                borderBottom: !isLastRow && "2px solid #202F49",
              }}
            >
              <ClaimDelegationRewardRow
                activeDelegation={delegation}
                claimTx={txHashesClaim[delegation.delegation.toStakerId]}
                compoundTx={txHashesCompound[delegation.delegation.toStakerId]}
              />
            </div>
          );
        })}
      </ModalContent>
      <Spacer />
      <Row style={{ width: "100%", gap: "1rem" }}>
        <Button
          disabled={
            !activeDelegationWithPendingRewards.length ||
            pendingCompoundTxs.length > 0 ||
            successfulCompoundTxs.length > 0 ||
            failedCompoundTxs.length > 0
          }
          onClick={() => handleCompoundAllRewards()}
          style={{ width: "105%" }}
          variant="primary"
        >
          {txsCompound.length ? (
            <Column>
              {pendingCompoundTxs.length
                ? `Pending: ${pendingCompoundTxs.length} / ${
                    txsCompound.length
                  } ${successfulCompoundTxs.length ? " - " : ""}`
                : ""}{" "}
              {successfulCompoundTxs.length
                ? `Completed: ${successfulCompoundTxs.length} / ${
                    txsCompound.length
                  } ${failedCompoundTxs.length ? " - " : ""}`
                : ""}
              {failedCompoundTxs.length
                ? `Failed: ${failedCompoundTxs.length} / ${txsCompound.length}`
                : ""}
            </Column>
          ) : (
            "Compound all"
          )}
        </Button>
        <Button
          disabled={
            !activeDelegationWithPendingRewards.length ||
            pendingClaimTxs.length > 0 ||
            successfulClaimTxs.length > 0 ||
            failedClaimTxs.length > 0
          }
          onClick={() => handleClaimAllRewards()}
          style={{ width: "105%" }}
          variant="primary"
        >
          {txsClaim.length ? (
            <Column>
              {pendingClaimTxs.length
                ? `Pending: ${pendingClaimTxs.length} / ${txsClaim.length} ${
                    successfulClaimTxs.length ? " - " : ""
                  }`
                : ""}{" "}
              {successfulClaimTxs.length
                ? `Completed: ${successfulClaimTxs.length} / ${
                    txsClaim.length
                  } ${failedClaimTxs.length ? " - " : ""}`
                : ""}
              {failedClaimTxs.length
                ? `Failed: ${failedClaimTxs.length} / ${txsClaim.length}`
                : ""}
            </Column>
          ) : (
            "Claim all"
          )}
        </Button>
      </Row>
    </Modal>
  );
};

const Rewards: React.FC<any> = ({ loading, accountDelegations }) => {
  const totalDelegated =
    accountDelegations?.data &&
    getAccountDelegationSummary(accountDelegations.data);

  const [onPresentClaimRewardsModal] = useModal(
    <ClaimRewardsModal />,
    "staking-claim-rewards-modal"
  );
  return (
    <ContentBox style={{ flex: 1 }}>
      <Column style={{ width: "100%" }}>
        <Heading1>Rewards</Heading1>
        <Spacer />
        <Typo2 style={{ color: "#B7BECB" }}>
          Claim your rewards or compound them to maximize your returns.
        </Typo2>
        <Spacer />
        <Column style={{ marginTop: "auto", width: "100%" }}>
          {loading ? (
            <Loader />
          ) : (
            <RewardsContent
              totalPendingRewards={totalDelegated?.totalPendingRewards}
            />
          )}
          <Spacer />
          <Button
            disabled={totalDelegated?.totalPendingRewards.lte(
              BigNumber.from(0)
            )}
            variant="primary"
            onClick={() => onPresentClaimRewardsModal()}
          >
            Claim rewards
          </Button>
        </Column>
      </Column>
    </ContentBox>
  );
};

export default Rewards;
