import { Button, Upload, Row } from 'antd';
// import { removeFileItem } from '/node_modules/antd/lib/upload/utils';
import { connectField, filterDOMProps } from 'uniforms';
import React, { useState, useEffect } from 'react';
import { BaseField } from 'uniforms';
import { wrapField } from 'uniforms-antd'
// import wrapField from './wrapField';

const UploadKeystoreField = (
  { inputRef, value, ...props }: any,
  {
    uniforms: {
      error,
      state: { disabled },
    },
  },
) => {
  const [file, setFile] = useState()
  useEffect(() => {
    console.log("mounted UploadKeystoreField")
  },[])
  const handleChange = (info: any) => {
    console.log(info)
    if (info.file.status === 'uploading') {
      console.log('uploading file....');
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      console.log("ok we figured it out finally")
      let fileList = [...info.fileList];
      // 1. Limit the number of uploaded files
      // Only to show one recent uploaded files, and old ones will be replaced by the new
      fileList = fileList.slice(-1);
      // 2. Read from response and show file link
      fileList = fileList.map(file => {
        if (file.response) {
          // Component will show file.url as link
          file.url = file.response.url;
        }
        return file;
      });
      setFile(fileList[0]);
      // message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      // message.error(`${info.file.name} file upload failed.`);
    }
  }
  return (
    wrapField(props,
      // <Row className="ant-form-item ant-form-item-has-feedback">

        <Upload multiple={false} showUploadList={false}
          // onChange={handleChange}
        id={props.id}
        name={props.name}
        // onChange={({file}) => props.onChange({file:file})}
        onChange={handleChange}
        // placeholder={props.placeholder}
        ref={props.inputRef}
        // value={props.value}
        {...filterDOMProps(props)}
        >
          <Button
            // disabled={!!(error || disabled)}
            htmlType="button"
            // ref={inputRef}
            // type="primary"
            type={props.type}
            size={props.size}
            // {...props}
          >
            {/* {props.value} */}
            Tests
          </Button>
        </Upload>

      // </Row>



    )

  )
};

UploadKeystoreField.contextTypes = BaseField.contextTypes;
UploadKeystoreField.defaultProps = { value: 'Select File' , type: 'primary'};

export default connectField(UploadKeystoreField);


