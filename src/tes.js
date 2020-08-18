import React,{Component} from 'react';
import {BrowserRouter as Router,Route,Switch,Link} from 'react-router-dom';

class  Home2 extends  Component{
    render() {
        return <h1>Home</h1>
    }
}
class  User extends  Component{
    render() {
        return <h1>User</h1>
    }

}
class  UserHH extends  Component{
    render() {
        return <h1>UserHH</h1>
    }
}
class  App extends  Component{
    render() {
        return(
            <Router>
                <Switch>
                    <Route exact path={'/'} component={Home2}/>
                    <Route exact path={'/users'} component={User}/>
                    <Route exact path={'/users/hh'} component={UserHH}/>
                </Switch>
            </Router>
        )
    }
}

export  default  App