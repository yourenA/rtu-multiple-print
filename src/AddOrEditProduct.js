/**
 * Created by Administrator on 2017/3/21.
 */
import React, {Component} from 'react';
import {Form, Input,  Radio, Select,Upload,Button ,Icon,TreeSelect } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
class AddPoliciesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
    };
  }
  componentDidMount() {
  }
  render() {
    const formItemLayoutWithLabel = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 7},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 15},
      }
    };

    const {getFieldDecorator} = this.props.form;
    const data=this.props.data
    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <FormItem
            label={'名称'}
            {...formItemLayoutWithLabel}
          >
            {getFieldDecorator('name', {
              initialValue: this.props.editRecord ? this.props.editRecord.name:'',
              rules: [{required: true, message:"名称不能为空"}],
            })(
              <Input  />
            )}
          </FormItem>
          <FormItem
              label={'产品码'}
              {...formItemLayoutWithLabel}
          >
            {getFieldDecorator('code', {
              initialValue: this.props.editRecord ? this.props.editRecord.code:'',
              rules: [{required: true, message:"产品码不能为空"}],
            })(
                <Input  />
            )}
          </FormItem>

          <FormItem
            {...formItemLayoutWithLabel}
            label={(
              <span>
              备注
            </span>
            )}
          >
            {getFieldDecorator('remark', {
              initialValue: this.props.editRecord ? this.props.editRecord.remark : '',
            })(
              <Input />
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

const AddPoliciesFormWrap = Form.create()(AddPoliciesForm);
export default AddPoliciesFormWrap;
