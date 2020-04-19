import React from 'react';
import { connectField, filterDOMProps} from 'uniforms';
import Text from 'antd/lib/typography/Text';

const Error: React.FC = ({ children, error, errorMessage, ...props }: any): JSX.Element =>
  !error ? (
    <small>&nbsp;</small>
  ) : (
    <div {...filterDOMProps(props)}>
      {children ? (
        children
      ) : (
        <small>
          <Text type='danger'>
            {errorMessage}
          </Text>
        </small>
      )}
    </div>
  );

Error.defaultProps = {
  style: { margin: '-8px 0px 8px 0px' }
};


export default connectField(Error, { initialValue: false });
