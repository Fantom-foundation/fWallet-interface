import React from "react";
import Slider, { createSliderWithTooltip } from "rc-slider";
import "rc-slider/assets/index.css";
import styled from "styled-components";

const SliderWithTooltip = createSliderWithTooltip(Slider);

const SliderWithMarks: React.FC<any> = ({
  value,
  setValue,
  min = 0,
  max,
  steps,
  disabled = false,
  markPoints = [0, 25, 50, 75, 100],
  markLabels = null,
  color = "#1969FF",
  secondaryColor = "white",
  railColor = "#0A162E",
  tooltip = false,
  tooltipColor,
  tooltipTextColor,
}) => {
  const markStyle = (value: number, mark: number) => {
    return {
      color: value < mark ? secondaryColor : color,
      fontWeight: "bold",
      fontSize: "16px",
      paddingTop: "5px",
    };
  };

  const marks = markPoints.reduce(
    (accumulator: any, current: number, index: number) => {
      return {
        ...accumulator,
        [parseFloat(max) * (current === 0 ? current : current / 100)]: {
          style: markStyle(value, (parseFloat(max) * current) / 100),
          label: markLabels ? markLabels[index] : `${current}%`,
        },
      };
    },
    {}
  );

  return (
    <StyledSlider>
      {tooltip ? (
        <StyledSliderTooltip
          tooltipColor={tooltipColor || "white"}
          tooltipTextColor={tooltipTextColor || color}
        >
          <SliderWithTooltip
            tipProps={{
              prefixCls: "rc-slider-tooltip",
              placement: "bottom",
              visible: true,
            }}
            tipFormatter={(value) => `${value}%`}
            disabled={disabled}
            onChange={(val) => setValue(val)}
            value={value}
            min={min}
            max={max}
            step={steps}
            marks={marks}
            trackStyle={{ backgroundColor: color, height: 7 }}
            handleStyle={{
              borderColor: color,
              height: 20,
              width: 20,
              marginLeft: 0,
              marginTop: -7,
              backgroundColor: color,
            }}
            railStyle={{ backgroundColor: railColor, height: 7 }}
            dotStyle={{ backgroundColor: "transparent", border: "none" }}
          />
        </StyledSliderTooltip>
      ) : (
        <Slider
          disabled={disabled}
          onChange={(val) => setValue(val)}
          value={value}
          min={min}
          max={max}
          step={steps}
          marks={marks}
          trackStyle={{ backgroundColor: color, height: 7 }}
          handleStyle={{
            borderColor: color,
            height: 20,
            width: 20,
            marginLeft: 0,
            marginTop: -7,
            backgroundColor: color,
          }}
          railStyle={{ backgroundColor: railColor, height: 7 }}
          dotStyle={{ backgroundColor: "transparent", border: "none" }}
        />
      )}
    </StyledSlider>
  );
};

export const StyledSlider = styled.div`
  margin: 0 0.5rem;
  .rc-slider-disabled {
    background-color: transparent !important;
  }
`;

export const StyledSliderTooltip = styled.div<{
  tooltipColor: string;
  tooltipTextColor: string;
}>`
  .rc-slider-tooltip-inner {
    margin-top: 0.3rem;
    font-size: 16px;
    font-weight: bold;
    color: ${(props) => props.tooltipTextColor};
    padding: 0.25rem 0.5rem;
    background-color: ${(props) => props.tooltipColor};
  }
  .rc-slider-tooltip-arrow {
    margin-top: -0.3rem;
    left: 50%;
    margin-left: -6px;
    border-width: 0 6px 8px;
    border-bottom-color: ${(props) => props.tooltipColor};
  }
`;

export default SliderWithMarks;