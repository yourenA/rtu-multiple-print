/**
 * Created by Administrator on 2017/3/21.
 */
import React, {Component,Fragment} from 'react';
import {Form, Input,  Radio, Select,Upload,Button ,Icon,Alert } from 'antd';
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
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 7},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 14},
      }
    };

    const {getFieldDecorator} = this.props.form;
    const data=this.props.data
    return (
      <div>
        <Alert message="如果序列号已经存在，新序列号的产品码会覆盖旧产品码" type="error" />
        <Form onSubmit={this.handleSubmit}>
          <Form.Item style={{marginTop:"15px"}}  label={'产品码'}  {...formItemLayout}
          >
            {getFieldDecorator(`product_code`, {
              initialValue:this.props.editRecord?this.props.editRecord.productCodeId:'',
              rules: [{
                required: true,
                message: '开始序列号不能为空'
              }],
            })(<Select>
              {this.props.codeData.map(function (item,index) {
                return <Option key={index} value={item.id}>{item.name} ({item.code})</Option>

              })}
            </Select>)}
          </Form.Item>
          {
            !this.props.editRecord&&<Fragment>
              <Form.Item   label={'开始序列号'}  {...formItemLayout}
              >
                {getFieldDecorator(`start_number`, {
                  rules: [{
                    required: true,
                    message: '开始序列号不能为空'
                  }],
                })(
                    <Input style={{width:'100%'}}/>
                )}
              </Form.Item>
              <Form.Item   label={'结束序列号'}  {...formItemLayout}
              >
                {getFieldDecorator(`end_number`, {
                  rules: [{
                    required: true,
                    message: '结束序列号不能为空'
                  }],
                })(
                    <Input style={{width:'100%'}}/>
                )}
              </Form.Item>
            </Fragment>
          }
          {
            this.props.editRecord&&<Fragment>
              <Form.Item   label={'开始序列号'}  {...formItemLayout}
              >
                {getFieldDecorator(`number`, {
                  initialValue: this.props.editRecord.number,
                  rules: [{
                    required: true,
                    message: '序列号不能为空'
                  }],
                })(
                    <Input style={{width:'100%'}}/>
                )}
              </Form.Item>
            </Fragment>
          }

        </Form>
      </div>
    );
  }
}

const AddPoliciesFormWrap = Form.create()(AddPoliciesForm);
export default AddPoliciesFormWrap;
