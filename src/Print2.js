import React, {PureComponent, Fragment} from 'react';
import './print.css';
import JsBarcode from 'jsbarcode'
class App extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            sn:this.getUrlParms('sn'),
            pc1:this.getUrlParms('pc1'),
            pc2:this.getUrlParms('pc2'),
            pc3:this.getUrlParms('pc3'),
        };
    }
    getUrlParms=(name)=> {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = this.props.location.search.substr(1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return '';
    }
    componentDidMount() {
        console.log('this.props',this.props)
        JsBarcode(this.barcode,this.state.sn, {
            format: "CODE128",
            displayValue: false,
            width: 1.1,
            height: 20,
            margin: 0,
        });
        setTimeout(function () {
            window.print()
        },30)
    }

    render() {
        return (
            <div className={'custom-print'}>
                <p>智能RTU</p>
                <p>产品码:{this.state.pc1}.{this.state.pc2}.{this.state.pc3}</p>
                <p>序列号:{this.state.sn}</p>
                <svg   ref={(ref) => {
                    this.barcode = ref;
                }}></svg>
            </div>

        );
    }
}

export default App;
