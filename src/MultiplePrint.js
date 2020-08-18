import React, {PureComponent, Fragment} from 'react';
import './print.css';
import config from './config.js'
import {converErrorCodeToMsg} from './utils.js'
import axios from 'axios'
import {Form, Modal, Card} from 'antd';
import { Layout, Icon, Button ,Input,Select} from 'antd';
import AddOrEditForm from './AddOrEditProduct'
const {ipcRenderer} = window.electron;
const { Header, Content, Footer } = Layout;
const {confirm} =Modal
const { Option } = Select;
class App extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            meta: {},
            page: 1,
            loading: true,
            editRecord:{}
        };
    }

    componentDidMount() {
        this.fetch()
    }
    fetch=()=>{
        this.setState({
            loading:true
        })
        const that=this;
        axios(`${config.prefix}/api/product_code`, {
            method: 'GET'
        })
            .then(response => {
                console.log('response', response)
                if(response.status===200){
                    that.setState({
                        data:response.data.rows,
                        loading:false
                    })
                }
            })
            .catch((error) => {
                console.log(error)

            });
    }
    handleSubmit=()=>{
        const values=this.props.form.getFieldsValue();
        console.log(values)
        if(!values.start_number||!values.end_number||!values.product_code){
            ipcRenderer.send('open-dialog', {
                type: "error",
                title: "Error",
                message: '所有信息必填'
            });
            return false
        }
        if(Number(values.start_number) > Number(values.end_number)){
            console.log('开始序列号大于等于结束序列号')
            ipcRenderer.send('open-dialog', {
                type: "error",
                title: "Error",
                message: '开始值不能大于结束值'
            });
            return false
        }
        console.log(this.itemarray(values.start_number,values.end_number))
        const that=this;
        confirm({
            title: '确定要批量打印序列号？',
            content: '',
            centered:true,
            onOk() {
                console.log('OK');
                that.save(values.product_code,that.itemarray(values.start_number,values.end_number))
            },
            onCancel() {
                console.log('Cancel');

            },
        });
    }
    save=(productCodeId,numbers)=>{
        const that = this;
        axios(`${config.prefix}/api/serial_number`, {
            method: 'POST',
            data:{
                productCodeId:productCodeId,
                numbers:numbers
            }
        })
            .then(response => {
                console.log('response', response)
                ipcRenderer.send('openSNModal',productCodeId,numbers);

            })
            .catch((error) => {
                console.log(error);
                converErrorCodeToMsg(error)
            });
    }
    itemarray=(a,b)=>{
        let arry=[];
        let start=Number(a);
        let end=Number(b);
        for(let i=start;i<=end;i++){
            arry.push(this.paddingZero(i,10));
        }
        return arry;
    }
    paddingZero=(num, length) =>{
        for(let len = (num + "").length; len < length; len = num.length) {
            num = "0" + num;
        }
        return num;
    }
    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
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
        return (
            <div>
                <Header>
                    <div><Icon style={{color:'#fff',fontSize:'24px',marginRight:'10px',
                        position:'relative',top:'5px',cursor:'pointer'}} onClick={()=>{
                        this.props.history.replace('/')
                    }} type="arrow-left" /></div><h3>序列号批量打印</h3>
                </Header>


                    <div className={'table-box'}>
                        <Card type="inner" title={'序列号批量打印'}>
                            <Form>
                                <Form.Item style={{marginTop:"15px"}}  label={'产品码'}  {...formItemLayout}
                                >
                                    {getFieldDecorator(`product_code`, {
                                        rules: [{
                                            required: true,
                                            message: '产品码不能为空'
                                        }],
                                    })(<Select>
                                        {this.state.data.map(function (item,index) {
                                            return <Option key={index} value={item.id}>{item.name} ({item.code})</Option>

                                        })}
                                    </Select>)}
                                </Form.Item>
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
                                <Form.Item>
                                    <div style={{textAlign: 'center'}}>
                                        <Button type={'primary'} onClick={()=>{
                                            this.handleSubmit()

                                        }}
                                                style={{marginLeft: '24px',width:'200px'}}>
                                            打印
                                        </Button>
                                    </div>
                                </Form.Item>
                            </Form>

                        </Card>
                </div>


                <Modal
                    title={'添加产品码'}
                    visible={this.state.addModal}
                    centered
                    onOk={this.handleAdd}
                    className="addModal"
                    onCancel={() => {
                        this.setState({ addModal: false });
                    }}

                >
                    <AddOrEditForm   wrappedComponentRef={(inst) => this.AddForm = inst} ></AddOrEditForm>
                </Modal>
                <Modal
                    title={'修改产品码'}
                    visible={this.state.editModal}
                    centered
                    destroyOnClose
                    onOk={this.handleEdit}
                    className="addModal"
                    onCancel={() => {
                        this.setState({ editModal: false });
                    }}

                >
                    <AddOrEditForm  editRecord={this.state.editRecord} wrappedComponentRef={(inst) => this.EditForm = inst} ></AddOrEditForm>
                </Modal>
            </div>

        );
    }
}

export default Form.create()(App);
