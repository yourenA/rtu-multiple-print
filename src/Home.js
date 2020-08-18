import React, {PureComponent, Fragment} from 'react';
import stats from './067-stats.png';
import lottery from './130-lottery.png';
import print from './print.png'
import logo from './logo.png';
import './App.css';
import Drawer from "@material-ui/core/Drawer";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from '@material-ui/icons/Settings';
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
const {ipcRenderer} = window.electron;
class App extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            setting:{
                version:'',
                url:''
            }
        };
    }

    componentDidMount() {
        console.log('ipcRenderer',ipcRenderer)
        console.log('componentDidMount in home');
        let setting=localStorage.getItem('setting');
        if(setting){
            this.setState({
                setting:JSON.parse(setting)
            },function () {
                ipcRenderer.send('setSetting',this.state.setting);
            })

        }else{
            const originData={
                "limit_max": 850,
                "limit_min": 800,
                "average_max": 820,
                "average_min": 810,
                "pre_interval": 2,
                "nor_interval": 30,
                "nor_duration": 120
            }
            localStorage.setItem('setting',JSON.stringify(originData))
            this.setState({
                setting:originData
            },function () {
                ipcRenderer.send('setSetting',this.state.setting);
            })
        }
        const that=this;
        ipcRenderer.send('getVersion');
        ipcRenderer.on('getVersionFromMain',(event, version) => {
            console.log('version', version)
            that.setState({
                version:version
            })
        });

        let defaultPath=localStorage.getItem('defaultPath');
        if(defaultPath){
            this.setState({
                url:defaultPath
            })
            ipcRenderer.send('getDefaultPath',defaultPath);
        }else{
            // ipcRenderer.send('getURL');
        }
        // ipcRenderer.on('getExePathFromMain', function (event, exePath) {
        //     console.log('exePath', exePath);
        //     that.setState({
        //         url:exePath
        //     })
        // });
        ipcRenderer.on('changeURLFromMain', function (event, path) {
            console.log('path', path);
            that.setState({
                url:path,
            })
            localStorage.setItem('defaultPath',path);
            ipcRenderer.send('getDefaultPath',path);
            ipcRenderer.send('open-dialog', {
                type: "info",
                title: "Success",
                message: '更改自动导出目录成功'
            });
        });

    }
    render() {
        return (
            <div>
                <div className="App">
                    <div className="project-name">
                        广州辂轺-RTU工具-V{this.state.version}
                    </div>
                    <header className="App-header">
                        <div className='item' onClick={() => {
                            this.props.history.replace("/product");
                        }}>
                            <img src={lottery} className="App-logo" alt="logo"/>
                            <p>
                                产品码管理
                            </p>

                        </div>
                        <div className='item'
                             onClick={() => {
                                 this.props.history.replace("/serial");
                             }}>
                            <img src={stats} className="App-logo" alt="logo"/>

                            <p>
                                序列号管理
                            </p>

                        </div>
                        <div className='item'
                             onClick={() => {
                                 this.props.history.replace("/formal");
                             }}>
                            <img src={print} className="App-logo" alt="logo"/>
                            <p>
                                正式测试
                            </p>

                        </div>
                        <div className='item'
                             onClick={() => {
                                 this.props.history.replace("/formal");
                             }}>
                            <img src={stats} className="App-logo" alt="logo"/>
                            <p>
                                正式测试
                            </p>

                        </div>
                    </header>
                </div>
            </div>

        );
    }
}

export default App;
