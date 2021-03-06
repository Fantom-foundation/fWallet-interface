import React from "react";
import { mediaExact, OverlayButton } from "../index";
import CrossSymbol from "../../assets/img/symbols/Close.svg";
import styled from "styled-components";

const ModalClose: React.FC<any> = ({ onDismiss }) => {
  return (
    <StyledPosition style={{ position: "absolute" }}>
      <OverlayButton onClick={() => onDismiss()}>
        <StyledCloseImg alt="close" src={CrossSymbol} />
      </OverlayButton>
    </StyledPosition>
  );
};

const StyledPosition = styled.div`
  ${mediaExact.xs(`right: 1.5rem; top: 1.5rem;`)}
  ${mediaExact.sm(`right: 1.5rem; top: 1.7rem;`)}
  ${mediaExact.md(`right: 1.7rem; top: 1.9rem;`)}
  ${mediaExact.lg(`right: 1.7rem; top: 1.9rem;`)}
`;

const StyledCloseImg = styled.img`
  ${mediaExact.xs(`width: .8rem; height: .8rem;`)}
  ${mediaExact.sm(`width: .9rem; height: .9rem;`)}
  ${mediaExact.md(`width: 1rem; height: 1rem;`)}
  ${mediaExact.lg(`width: 1.1rem; height: 1.1rem;`)}
`;

export default ModalClose;
