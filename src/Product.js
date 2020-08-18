import React, {PureComponent, Fragment} from 'react';
import './print.css';
import config from './config.js'
import {converErrorCodeToMsg} from './utils.js'
import axios from 'axios'
import {Table, Modal, Tag, Card} from 'antd';
import { Layout, Icon, Button } from 'antd';
import AddOrEditForm from './AddOrEditProduct'
const {ipcRenderer} = window.electron;
const { Header, Content, Footer } = Layout;
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
    handleAdd=()=>{
        const formValues = this.AddForm.props.form.getFieldsValue();
        console.log('formValues', formValues);
        if(formValues.code.split('.').length!==3){
            ipcRenderer.send('open-dialog', {
                type: "error",
                title: "Error",
                message: '产品码格式错误'
            });
            return false
        }
        const that = this;
        axios(`${config.prefix}/api/product_code`, {
            method: 'POST',
            data:{
                ...formValues
            }
        })
            .then(response => {
                console.log('response', response)
                if(response.status===200){
                    ipcRenderer.send('open-dialog', {
                        type: "info",
                        title: "Success",
                        message: '添加成功'
                    });
                    that.setState({
                        addModal:false
                    })
                    that.fetch()
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
        if(formValues.code.split('.').length!==3){
            ipcRenderer.send('open-dialog', {
                type: "error",
                title: "Error",
                message: '产品码格式错误'
            });
            return false
        }
        const that = this;
        axios(`${config.prefix}/api/product_code/${this.state.editRecord.id}`, {
            method: 'PUT',
            data:{
                ...formValues
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
                    that.fetch()
                }
            })
            .catch((error) => {
                console.log(error);
                converErrorCodeToMsg(error)
            });
    }
    render() {
        const columns = [{
            title: '序号',
            key: 'id',
            width:80,
            dataIndex:'id',
            render: (value,row,index) => <Fragment>
                {index+1}
            </Fragment>
        },{
            title: '名称',
            key: 'name',
            dataIndex:'name'
            },
            {
                title: '产品码',
                key: 'code',
                dataIndex:'code'
            }, {
                title: '备注',
                key: 'remark',
                dataIndex:'remark'
            }, {
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
            },]
        return (
            <div>
                <Header>
                    <div><Icon style={{color:'#fff',fontSize:'24px',marginRight:'10px',
                        position:'relative',top:'5px',cursor:'pointer'}} onClick={()=>{
                        this.props.history.replace('/')
                    }} type="arrow-left" /></div><h3>产品码管理</h3>
                </Header>

                <div className={'table-box'}>
                    <Card type="inner" title={'产品码管理'}>
                    <Button size={'large'} type={'primary'}  block  style={{marginBottom:'10px'}}
                    onClick={()=>{
                        this.setState({
                            addModal:true
                        })
                    }}>添加产品码</Button>
                    <Table pagination={false} loading={this.state.loading} bordered columns={columns} rowKey={'id'} dataSource={this.state.data}/>
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

export default App;
