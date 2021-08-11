import {
  AccountDelegation,
  Delegation,
  delegationDaysLockedLeft,
  generateWithdrawalRequestId,
  getAccountDelegations,
  getDelegations,
  nodeUptime,
} from "../../utils/delegations";
import React, { useContext, useEffect, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";
import useTransaction from "../../hooks/useTransaction";
import {
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
  unitToWei,
} from "../../utils/conversion";
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import Column from "../../components/Column";
import Row from "../../components/Row";
import {
  Button,
  ContentBox,
  Heading1,
  Heading3,
  Typo1,
  Typo2,
} from "../../components";
import Spacer from "../../components/Spacer";
import useModal from "../../hooks/useModal";
import StatPair from "../../components/StatPair";
import { formatDate } from "../../utils/common";
import DelegationBalance, {
  DelegationNameInfo,
} from "../../components/DelegationBalance/DelegationBalance";
import SliderWithMarks from "../../components/Slider";

export interface ActiveDelegation {
  delegation: AccountDelegation;
  delegationInfo: Delegation;
}

const UndelegateModal: React.FC<any> = ({
  onDismiss,
  stakerId,
  delegatedAmount,
}) => {
  const { color } = useContext(ThemeContext);
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const [undelegateAmount, setUndelegateAmount] = useState(0);
  const formattedDelegatedAmount = toFormattedBalance(delegatedAmount);

  const [txHash, setTxHash] = useState(null);
  const tx = transaction[txHash];
  const isPending = tx && tx.status === "pending";
  const isCompleted = tx && tx.status === "completed";

  const handleSetMax = () => {
    setUndelegateAmount(delegatedAmount);
  };
  const handleUnstake = async () => {
    const wrId = generateWithdrawalRequestId().toString();
    const hash = await txSFCContractMethod(SFC_TX_METHODS.UNDELEGATE, [
      stakerId,
      wrId,
      unitToWei(undelegateAmount.toString()),
    ]);
    setTxHash(hash);
  };

  useEffect(() => {
    if (isCompleted) {
      setTimeout(() => {
        onDismiss();
      }, 1000);
    }
  }, [tx]);

  return (
    <Modal style={{ padding: "2rem 6rem" }} onDismiss={onDismiss}>
      <ModalTitle text="How much FTM would you like to unstake?" />
      <Column style={{ width: "100%", alignItems: "center" }}>
        <Row>
          <Typo1 style={{ color: color.greys.grey() }}>
            Staking position size:{" "}
          </Typo1>
          <Spacer size="xs" />
          <Typo1 style={{ fontWeight: "bold" }}>
            {" "}
            {`${formattedDelegatedAmount[0]}${formattedDelegatedAmount[1]}`} FTM
          </Typo1>
        </Row>
        <Spacer size="xl" />
        <Row
          style={{
            width: "100%",
            backgroundColor: color.primary.black(),
            borderRadius: "8px",
          }}
        >
          <Row
            style={{
              padding: "2rem",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heading1 style={{ color: color.white }}>
              {parseFloat(undelegateAmount.toFixed(2)).toString()} FTM
            </Heading1>
            <Spacer />
            <Button
              fontSize="14px"
              color={color.greys.grey()}
              padding="8px"
              variant="tertiary"
              onClick={handleSetMax}
            >
              MAX
            </Button>
          </Row>
        </Row>
        <Spacer size="xl" />
        <div style={{ width: "98%" }}>
          <SliderWithMarks
            value={undelegateAmount}
            setValue={setUndelegateAmount}
            max={parseFloat(delegatedAmount.toString())}
            steps={0.1}
          />
          <Spacer size="xxl" />
          <Spacer size="xxl" />
          <Button
            disabled={isPending || isCompleted || undelegateAmount < 0.01}
            style={{ padding: "1rem", width: "100%" }}
            variant="primary"
            onClick={handleUnstake}
          >
            {isCompleted ? "Success" : isPending ? "Unstaking..." : "Unstake"}
          </Button>
          <Spacer size="sm" />
          <Typo1 style={{ textAlign: "center", color: color.greys.grey() }}>
            *as a security measure, unstaking takes 7 days.
          </Typo1>
          <Spacer size="xl" />
        </div>
      </Column>
    </Modal>
  );
};

const ManageDelegationModal: React.FC<any> = ({
  onDismiss,
  stakerId,
  setActiveStakerId,
  activeDelegations,
}) => {
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const selectedDelegation = activeDelegations.find(
    (activeDelegation: any) =>
      activeDelegation.delegation.toStakerId === stakerId
  );
  const delegatedAmount = hexToUnit(
    selectedDelegation.delegation.amountDelegated
  );
  const lockedAmount = hexToUnit(selectedDelegation.delegation.lockedAmount);
  const pendingRewards = hexToUnit(
    selectedDelegation.delegation.pendingRewards.amount
  );
  const daysLocked = delegationDaysLockedLeft(selectedDelegation.delegation);
  const delegationDate = new Date(
    formatHexToInt(selectedDelegation.delegation.createdTime) * 1000
  );
  const unlockDate = new Date(
    formatHexToInt(selectedDelegation.delegation.lockedUntil) * 1000
  );
  const formattedDelegatedAmount = toFormattedBalance(delegatedAmount);
  const formattedPendingRewards = toFormattedBalance(pendingRewards);
  const formattedLockedAmount = toFormattedBalance(lockedAmount);

  const uptime = nodeUptime(selectedDelegation.delegationInfo);
  const selfStaked = hexToUnit(selectedDelegation.delegationInfo.stake);
  const totalStaked = hexToUnit(selectedDelegation.delegationInfo.totalStake);
  const delegations = formatHexToInt(
    selectedDelegation.delegationInfo.delegations.totalCount
  );
  const freeSpace = hexToUnit(selectedDelegation.delegationInfo.delegatedLimit);
  const freeSpacePercentage =
    100 -
    freeSpace /
      hexToUnit(selectedDelegation.delegationInfo.totalDelegatedLimit);
  const formattedSelfStaked = toFormattedBalance(selfStaked);
  const formattedTotalStaked = toFormattedBalance(totalStaked);
  const formattedFreeSpace = toFormattedBalance(freeSpace);

  useEffect(() => {
    return () => setActiveStakerId(null);
  }, []);

  const [txHash, setTxHash] = useState({} as any);
  const claimRewardTx = transaction[txHash["claimRewardTx"]];
  const isClaiming = claimRewardTx && claimRewardTx.status === "pending";
  const claimed = claimRewardTx && claimRewardTx.status === "completed";

  const handleClaimReward = async () => {
    try {
      const hash = await txSFCContractMethod(SFC_TX_METHODS.CLAIM_REWARDS, [
        selectedDelegation.delegation.toStakerId,
      ]);
      setTxHash({ ...txHash, claimRewardTx: hash });
    } catch (error) {
      console.error(error);
    }
  };

  const [onPresentUndelegateModal] = useModal(
    <UndelegateModal
      stakerId={selectedDelegation.delegation.toStakerId}
      delegatedAmount={delegatedAmount}
    />,
    "undelegate-modal"
  );

  return (
    <Modal onDismiss={onDismiss}>
      <ModalTitle text="Delegation details" />
      <ContentBox
        style={{
          width: "92%",
          border: "1px solid #707B8F",
          borderRadius: "8px",
        }}
      >
        <Column>
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <StatPair
              title="Delegation amount"
              value1={formattedDelegatedAmount[0]}
              value2={formattedDelegatedAmount[1]}
              suffix="FTM"
            />

            <Spacer size="xxl" />
            <StatPair
              title="Locked amount"
              value1={formattedLockedAmount[0]}
              value2={formattedLockedAmount[1]}
              suffix="FTM"
              width="12rem"
            />
            <Spacer size="xxl" />

            <StatPair
              title="Pending rewards"
              value1={formattedPendingRewards[0]}
              value2={formattedPendingRewards[1]}
              suffix="FTM"
            />
          </Row>
          <Spacer />
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <StatPair
              title="Unlocks in"
              value1={daysLocked > 0 ? `${daysLocked} days` : "-"}
              value2={daysLocked > 0 && `(${formatDate(unlockDate)})`}
            />
            <Spacer size="xxl" />
            <StatPair
              title="Delegation date"
              value2={formatDate(delegationDate)}
              width="12rem"
            />
          </Row>
        </Column>
      </ContentBox>
      <Spacer />
      <ContentBox
        style={{
          width: "92%",
          border: "1px solid #707B8F",
          borderRadius: "8px",
          backgroundColor: "#09172E",
        }}
      >
        <Column style={{ width: "100%" }}>
          <DelegationNameInfo
            delegationInfo={selectedDelegation.delegationInfo}
          />
          <Spacer />
          <Row
            style={{
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <StatPair
              title="Node ID"
              value1={parseInt(selectedDelegation.delegation.toStakerId)}
              width="12rem"
            />
            <StatPair title="Uptime" value1={`${uptime}%`} width="12rem" />
            <StatPair title="Delegators" value1={delegations} width="12rem" />
          </Row>
          <Spacer />
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <StatPair
              title="Total staked"
              value1={formattedTotalStaked[0]}
              width="12rem"
            />
            <StatPair
              title="Self staked"
              value1={formattedSelfStaked[0]}
              width="12rem"
            />
            <StatPair
              title="Free space"
              value1={formattedFreeSpace[0]}
              value2={`(${freeSpacePercentage.toFixed(0)}%)`}
              width="12rem"
            />
          </Row>
        </Column>
      </ContentBox>
      <Spacer size="xl" />
      <Row style={{ width: "100%" }}>
        <Button
          onClick={() => onPresentUndelegateModal()}
          style={{ flex: 1, backgroundColor: "red" }}
          variant="primary"
        >
          Undelegate
        </Button>
        <Spacer />
        <Button
          disabled={claimed || isClaiming || pendingRewards < 0.01}
          onClick={() => handleClaimReward()}
          style={{ flex: 1 }}
          variant="primary"
        >
          {claimed ? "Claimed" : isClaiming ? "Claiming..." : "Claim rewards"}
        </Button>
      </Row>
      <Spacer />
    </Modal>
  );
};

const ActiveDelegationsContent: React.FC<any> = ({
  accountDelegationsData,
  delegationsData,
}) => {
  const { color } = useContext(ThemeContext);
  const [activeStakerId, setActiveStakerId] = useState(null);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  const delegations = getDelegations(delegationsData);
  const activeDelegations = accountDelegations.map(
    (accountDelegation: any) => ({
      ...accountDelegation,
      delegationInfo: delegations.find((delegation) => {
        return delegation.id === accountDelegation.delegation.toStakerId;
      }),
    })
  );

  const [onPresentManageDelegationModal] = useModal(
    <ManageDelegationModal
      stakerId={activeStakerId}
      setActiveStakerId={setActiveStakerId}
      activeDelegations={activeDelegations}
    />,
    "manage-delegation-modal"
  );
  useEffect(() => {
    if (activeStakerId) {
      onPresentManageDelegationModal();
    }
  }, [activeStakerId]);

  return (
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          Validator
        </Typo2>
        <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          Balance
        </Typo2>
      </Row>
      <Spacer size="lg" />
      {activeDelegations.length ? (
        activeDelegations.map((delegation: ActiveDelegation) => {
          return (
            <StyledActiveDelegationRow
              onClick={() => {
                setActiveStakerId(delegation.delegation.toStakerId);
              }}
              key={delegation.delegation.toStakerId}
            >
              <DelegationBalance activeDelegation={delegation} />
            </StyledActiveDelegationRow>
          );
        })
      ) : (
        <Heading3>No active delegations</Heading3>
      )}
    </div>
  );
};
const StyledActiveDelegationRow = styled.div`
  padding: 1rem 2rem;
  margin: 0 -2rem;
  cursor: pointer;
  :hover {
    background-color: ${(props) => props.theme.color.primary.semiWhite(0.1)};
    cursor: pointer;
  }
`;

const ActiveDelegations: React.FC<any> = ({
  loading,
  accountDelegations,
  delegations,
}) => {
  return (
    <ContentBox>
      <Column style={{ width: "100%" }}>
        <Heading1>Active Delegations</Heading1>
        <Spacer />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ActiveDelegationsContent
            accountDelegationsData={accountDelegations.data}
            delegationsData={delegations.data}
          />
        )}
        <Spacer />
      </Column>
    </ContentBox>
  );
};

export default ActiveDelegations;