import React from 'react';
import { connectField, filterDOMProps} from 'uniforms';
import Text from 'antd/lib/typography/Text';

const Error = ({ children, error, errorMessage, ...props }: any) =>
  !error ? (
    <>&nbsp;</>
  ) : (
    <div {...filterDOMProps(props)}>
      {children ? (
        children
      ) : (
        <>
          <Text type='danger'>
            {errorMessage}
          </Text>
        </>
      )}
    </div>
  );

Error.defaultProps = {
  style: { margin: '-8px 0px 8px 0px' }
};


export default connectField(Error, { initialValue: false });
