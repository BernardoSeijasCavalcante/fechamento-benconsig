import React from 'react';

const TooltipInfo = ({ text }) => {
  return (
    <span className="info-tooltip" title={text}>
      ?
    </span>
  );
};

export default TooltipInfo;