import React, {PureComponent, Fragment} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import './App.css';
import Home from './Home.js';
import Product from './Product';
import MultiplePrint from './MultiplePrint';
import Print from './Print.js';
import Serial from './Serial';
import 'antd/dist/antd.css';
// import {
//     Switch,
//     Route, BrowserRouter as Router,
// } from "react-router-dom";
import { Router,  Switch,
    Route, } from 'react-router-dom';
import createHistory from 'history/createHashHistory';
const history = createHistory();

const {ipcRenderer} = window.electron;

class App extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            updateDialog: false,
            updateMsg: '',
            canClose: false
        };
    }

    componentDidMount() {
        const that = this
        console.log('componentDidMount in app')
        ipcRenderer.on('updateMessage', function (event, msg) {
            that.setState({
                updateDialog: true,
                updateMsg: msg.message,
                canClose: msg.type === 'error' || msg.type === 'success'
            })
            console.log('updateMessage', msg.message);  // Prints "whoooooooh!"
        });
    }

    render() {
        return (
            <div>
                <Router  history={history}>
                    <Switch>
                        <Route exact path={'/'} component={Home}/>
                        <Route exact path={'/product'} component={Product}/>
                        <Route exact path={'/serial'} component={Serial}/>
                        <Route exact path={'/multiple_print'} component={MultiplePrint}/>
                        <Route exact path={'/print'} component={Print}/>
                    </Switch>
                </Router>
                <Dialog
                    open={this.state.updateDialog}
                    onClose={() => {
                        if (this.state.canClose) {
                            this.setState({
                                updateDialog: false
                            })
                        }
                    }}
                >
                    <DialogContent style={{paddingTop: '8px'}}>
                            <span>
                                {this.state.updateMsg}
                            </span>
                    </DialogContent>

                </Dialog>
            </div>

        );
    }
}

export default App;
