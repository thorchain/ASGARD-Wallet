// import Button from 'antd/lib/button';
import React, { useMemo } from 'react';
import { BaseField } from 'uniforms';
import { LoadingOutlined } from '@ant-design/icons'

const SubmitFieldBranded = (
  { inputRef, value, ...props }: any,
  {
    uniforms: {
      error,
      state: { disabled },
    },
  },
) => {
  const trueValue = useMemo(() =>{
    return (
      !(props.loading) ? (
        <span>{value}</span>
      ) : (
        <span>
          <LoadingOutlined />
          <span>{value}</span>
        </span>
      )
    )
  },[props])
  const classes = ():string => {
    let sz = ''
    switch (props.size) {
      case 'large':
        sz = 'ant-btn-lg'
        break;
      case 'small':
        sz = 'ant-btn-sm'
        break;
    
      default:
        break;
    }
    return 'ant-btn ant-btn-primary ant-btn-brand ' + sz
  }
  return (
    <button
      disabled={!!(error || disabled || props.loading)}
      type="submit"
      ref={inputRef}
      className={classes()}
      {...props}
    >
      {trueValue}
    </button>
  )
};

SubmitFieldBranded.contextTypes = BaseField.contextTypes;
SubmitFieldBranded.defaultProps = { value: 'Submit' };

export default SubmitFieldBranded;
