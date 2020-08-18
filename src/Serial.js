import React, {PureComponent, Fragment} from 'react';
import './print.css';
import config from './config.js'
import {converErrorCodeToMsg} from './utils.js'
import axios from 'axios'
import {Table, Modal, Form, Card,Input,Select,Pagination,BackTop} from 'antd';
import { Layout, Icon, Button } from 'antd';
import AddOrEditForm from './AddMulSerial'
import find from 'lodash/find'
import sortBy from 'lodash/sortBy'
const FormItem = Form.Item;
const Option = Select.Option;
const {ipcRenderer} = window.electron;
const { Header, Content, Footer } = Layout;
class App extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selectedRowKeys:[],
            data: [],
            codeData:[],
            meta: {
                pagination:{
                    page: 1,
                    per_page:30,
                }
            },
            page: 1,
            per_page:30,
            loading: true,
            editRecord:{},
            productCodeId:'',
            number:''
        };
    }
    onSelectChange = selectedRowKeys => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    };
    componentDidMount() {
        this.fetchCode()
        this.fetch({
            page:this.state.page,
            per_page:this.state.per_page,
            productCodeId:this.state.productCodeId,
            number:this.state.number,

        })
    }
    fetchCode=()=>{
        const that=this;
        axios(`${config.prefix}/api/product_code`, {
            method: 'GET'
        })
            .then(response => {
                console.log('response', response)
                if(response.status===200){
                    that.setState({
                        codeData:response.data.rows,
                    })
                }
            })
            .catch((error) => {
                console.log(error)

            });
    }
    fetch=(values)=>{
        this.setState({
            loading:true
        })
        const that=this;
        axios(`${config.prefix}/api/serial_number`, {
            method: 'GET',
            params:{
                ...values
            }
        })
            .then(response => {
                console.log('response', response)
                if(response.status===200){
                    that.setState({
                        data:response.data.rows,
                        meta:response.data.meta,
                        loading:false,
                        selectedRowKeys:[],
                        ...values
                    })
                }
            })
            .catch((error) => {
                console.log(error)

            });
    }
    handleAdd=()=>{
        const values = this.AddForm.props.form.getFieldsValue();
        console.log('values', values);
        const that=this;
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
        axios(`${config.prefix}/api/serial_number`, {
            method: 'POST',
            data:{
                productCodeId:values.product_code,
                numbers:this.itemarray(values.start_number,values.end_number),
            }
        })
            .then(response => {
                console.log('response', response)
                if(response.status===200){
                    that.setState({
                        addModal:false
                    })
                    ipcRenderer.send('open-dialog', {
                        type: "info",
                        title: "Success",
                        message: '添加成功'
                    });
                    that.fetch({
                        page:this.state.page,
                        per_page:this.state.per_page,
                        productCodeId:this.state.productCodeId,
                        number:this.state.number,
                    })
                }
            })
            .catch((error) => {
                console.log(error);
                converErrorCodeToMsg(error)
            });
    }
    handleEdit=()=>{
        const formValues = this.EditForm.props.form.getFieldsValue();
        console.log('formValues', formValues);
        const that = this;
        axios(`${config.prefix}/api/serial_number/${this.state.editRecord.id}`, {
            method: 'PUT',
            data:{
                ...formValues,
                productCodeId:formValues.product_code
            }
        })
            .then(response => {
                console.log('response', response)
                if(response.status===200){
                    ipcRenderer.send('open-dialog', {
                        type: "info",
                        title: "Success",
                        message: '修改成功'
                    });
                    that.setState({
                        editModal:false
                    })
                    that.fetch({
                        page:this.state.page,
                        per_page:this.state.per_page,
                        productCodeId:this.state.productCodeId,
                        number:this.state.number,
                    })
                }
            })
            .catch((error) => {
                console.log(error);
                converErrorCodeToMsg(error)
            });
    }
    renderForm() {
        return this.renderSimpleForm()
    }

    renderSimpleForm() {
        const {
            form: { getFieldDecorator },
        } = this.props;
        return (
            <Form layout="inline" className="search-form">
                <FormItem label="序列号">
                    {getFieldDecorator('number', {
                        initialValue: '',
                    })(<Input/>)}
                </FormItem>
                <FormItem label="产品码">
                    {getFieldDecorator('productCodeId', {
                        initialValue: '',
                    })(<Select style={{width:'180px'}} allowClear>
                        {
                            this.state.codeData.map(function (item,index) {
                                return <Option key={index} value={item.id}>{item.name} ({item.code})</Option>
                            })
                        }
                    </Select>)}
                </FormItem>
                <FormItem>
                    <Button
                        type="primary"
                        icon='search'
                        onClick={() => {
                            const { form } = this.props;
                            form.validateFields((err, fieldsValue) => {
                                if (err) return;

                                this.fetch({
                                    page: 1,
                                    per_page: this.state.per_page,
                                    ...fieldsValue,
                                });

                            });
                        }}
                    >
                        查询
                    </Button>
                    <Button style={{ marginLeft: 8 }} icon='redo' onClick={this.handleFormReset}>
                        重置
                    </Button>
                    <Button style={{ marginLeft: 8 }} icon='plus' onClick={()=>{
                        this.setState({
                            addModal:true
                        })
                    }}>
                        批量添加序列号
                    </Button>
                </FormItem>
            </Form>
        );
    }
    handleFormReset = () => {
        const { form } = this.props;
        form.resetFields();
        this.fetch({
            number:'',
            productCodeId:'',
            page: 1,
            per_page: 30,
        });
    };
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
    print=()=>{
        if(this.state.selectedRowKeys.length===0){
            ipcRenderer.send('open-dialog', {
                type: "error",
                title: "Error",
                message: '请先选择需要打印的序列号'
            });
            return false
        }

        let arr=[];
        let numberArr=[];
        for(let i=0;i<this.state.selectedRowKeys.length;i++){
            const findObj=find(this.state.data,(o)=>o.id===this.state.selectedRowKeys[i]);
            arr.push(findObj)
        }
        const  sortArr=sortBy(arr,['number']);
        console.log('arr',arr)
        console.log('sortArr',sortArr)
        for(let i=0;i<sortArr.length;i++){
            numberArr.push(sortArr[i].number)
        }

        let firstCode=arr[0].product_code?arr[0].product_code.id:'';
        for(let i=0;i<sortArr.length;i++){
            if(sortArr[i].product_code.id!==firstCode){
                ipcRenderer.send('open-dialog', {
                    type: "error",
                    title: "Error",
                    message: '请确保当前打印序列号的产品码相同'
                });
                return false
            }

        }

        ipcRenderer.send('openSNModal',firstCode,numberArr);
    }
    render() {
        const { meta, selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const columns = [{
            title: '序号',
            key: 'id',
            width:80,
            dataIndex:'id',
            render: (value,row,index) => <Fragment>
                {index+1}
            </Fragment>
        },{
            title: '序列号',
            key: 'number',
            dataIndex:'number'
            },
            {
                title: '产品码',
                key: 'code',
                dataIndex:'code',
                render:(value,row,idnex)=>{
                    return row.product_code?row.product_code.name+" ("+row.product_code.code+")":''
                }
            },  {
                title: '操作',
                key:'operate',
                width:'20%',
                render: (value,row) => <Fragment>
                    <Button
                        type="primary"
                        size="small"
                        icon="edit"
                        onClick={(e) => {
                            this.setState({
                                editRecord: row,
                                editModal: true,
                            });
                        }
                        }
                    >编辑
                    </Button>

                </Fragment>,
            },];
        const paginationProps = {
            pageSizeOptions:[30,50,100,300,500],
            showSizeChanger: true,
            showTotal: (total, range)  => {
                return <span>
          当前显示 <span className="pagination-black">{range[0]}</span> 到 <span className="pagination-black">{range[1]}</span> 条 , 共 <span  className="pagination-black">{total}</span> 条
        </span>
            },
            pageSize: meta.pagination.per_page,
            total:meta.pagination.total,
            current: meta.pagination.current_page,
            onChange: (page, pageSize)=> {
                this.fetch({
                    page:page,
                    productCodeId:this.state.productCodeId,
                    number:this.state.number,
                    per_page: pageSize});
            },
            onShowSizeChange: (page, pageSize)=> {
                this.fetch({
                    page:1,
                    productCodeId:this.state.productCodeId,
                    number:this.state.number,
                    per_page: pageSize})
            },
        };
        return (
            <div>
                <Header>
                    <div><Icon style={{color:'#fff',fontSize:'24px',marginRight:'10px',
                        position:'relative',top:'5px',cursor:'pointer'}} onClick={()=>{
                        this.props.history.replace('/')
                    }} type="arrow-left" /></div><h3>序列号管理</h3>
                </Header>

                <div className={'table-box'}>
                    <Card type="inner" title={'序列号管理'}>
                        <div>
                            {this.renderForm()}
                        </div>
                        <div style={{marginBottom:'10px'}}>
                            已选 {this.state.selectedRowKeys.length} 个序列号
                            <Button onClick={this.print } icon={'printer'} type={'primary'} style={{marginLeft:'10px'}}>批量打印序列号</Button>
                        </div>
                    <Table
                        rowSelection={rowSelection}
                        pagination={false} loading={this.state.loading} bordered columns={columns} rowKey={'id'} dataSource={this.state.data}/>
                        <Pagination style={{marginTop:'10px'}} {...paginationProps} />
                    </Card>
                    </div>
                <BackTop />
                <Modal
                    title={'批量添加产品码'}
                    visible={this.state.addModal}
                    centered
                    onOk={this.handleAdd}
                    className="addModal"
                    onCancel={() => {
                        this.setState({ addModal: false });
                    }}

                >
                    <AddOrEditForm  codeData={this.state.codeData} wrappedComponentRef={(inst) => this.AddForm = inst} ></AddOrEditForm>
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
                    <AddOrEditForm codeData={this.state.codeData} editRecord={this.state.editRecord} wrappedComponentRef={(inst) => this.EditForm = inst} ></AddOrEditForm>
                </Modal>
            </div>

        );
    }
}

const AddPoliciesFormWrap = Form.create()(App);
export default AddPoliciesFormWrap;
