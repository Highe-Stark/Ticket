import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import pink from '@material-ui/core/colors/pink';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = ()=>({
    headline:{
        color: pink[300],
    }
});

let id = 0;
function createData(title, number, eachPrice) {
  id += 1;
  return { id, title, number, eachPrice};
}

class PayConfirm extends Component{
    DeleteBatchInCart = "http://pipipan.cn:30007/Cart/DeleteBatchInCart";
    constructor(props){
        super(props);
        this.state = {
            order:{},
            data:[]
        };
    }

    calcuTotal=()=>{
        let totalPrice = 0;
        this.state.data.forEach(element => {
            totalPrice += element.number * element.eachPrice;
        });
        return totalPrice
    }

    fetchOrder = ()=>{
        let storage = window.localStorage;
        let orderid = storage.getItem("orderid");
        if(orderid == null || orderid.length ===0)
            return;
        let user = JSON.parse(storage.getItem("user"));
        let token = user === null ? '' : user.token;
        let s = `token=${token}&orderid=${orderid}`;
        fetch('http://pipipan.cn:30011/Order/QueryByOrderid',{
            method:'POST',
            body:s,
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            credentials: "include"
        })
            .then(response => {
                    let errornum = response.headers.get('errornum');
                    if (errornum === '0') {
                        if (response.status !== 200) throw Error("Error !" + response);
                        return response.text();
                    }
                    else if (errornum === '1') {
                        alert("尚未登录！");
                    }
                    else if (errornum === '2') {
                        alert("身份不对应！");
                    }
                    else if (errornum === '3') {
                        alert("账户被冻结！");
                    }
                    this.props.history.push('/signin');
                }
            )
            // .then(response => {
            //     if (response.status !== 200) throw Error("Error !" + response);
            //     return response.text();
            // })
            .then(text =>{
                text = JSON.parse(text);
                console.log(text);
                this.setState({
                    order:text,
                    items:text.items
                })
                this.createItems();
            });
    };

    createItems = ()=>{
        let Items = this.state.items;
        console.log(Items);
        for(var i = 0;i<Items.length;i++){
            var eachItem = Items[i];
            var tmpArray = this.state.data;
            tmpArray.push(createData(eachItem.title,eachItem.number,eachItem.price))
            console.log("the tmparray")
            console.log(tmpArray)
            this.setState({
                data:tmpArray,
            })
        }
    }

    componentWillMount(){
        this.fetchOrder();
    }

    routeToAfterPay=()=>{
        console.log("in ger header")
        this.props.history.push({
            pathname:'/afterpay'
        })
    }

    buy=()=>{
        let storage = window.localStorage;
        let user = JSON.parse(storage.getItem("user"));
        let token = user === null ? '' : user.token;
        let type = storage.getItem("orderType")
        if(storage.getItem("orderid")==null||storage.getItem("orderid").length===0)
            return;

        let orderid = parseInt(storage.getItem("orderid"),0);
        if(type === 'orderInCart') {
            let cartProducts = JSON.parse(storage.getItem("cartProducts"));
            let batchEntryId = [];

            cartProducts.map(product => {
                batchEntryId.push(product.id);
                return null;
            });
            let s = `token=${token}&orderid=${orderid}`;
            console.log(token)
            fetch('http://pipipan.cn:30011/Order/Buy', {
                method: 'POST',
                body: s,
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded',
                }),
                credentials: "include",
            })
                .then(response => {
                        let errornum = response.headers.get('errornum');
                        if (errornum === '0') {
                            if (response.status !== 200) throw Error("Error !" + response);
                            return response.text();
                        }
                        else if (errornum === '1') {
                            alert("尚未登录！");
                        }
                        else if (errornum === '2') {
                            alert("身份不对应！");
                        }
                        else if (errornum === '3') {
                            alert("账户被冻结！");
                        }
                        this.props.history.push('/signin');
                    }
                )
                // .then(response => {
                //     if (response.status !== 200) throw Error("Error !" + response);
                //     return response.text();
                // })
                .then(text => {
                    text = JSON.parse(text);
                    console.log(text);
                    storage.setItem("message", text.message);
                    if (text.message === 'success')
                        storage.setItem("Inventory shortage", text["Inventory shortage"].toString());

                    console.log("the batchentry " + batchEntryId);
                    fetch(`http://pipipan.cn:30007/Cart/DeleteBatchInCart?token=${token}&batchentryid=${batchEntryId}`)
                        .then(response => response.headers)
                        .then(headers => {
                            let errornum = headers.get('errornum');
                            console.log("the error num " + errornum);
                            if (errornum === '0') {
                                this.routeToAfterPay();
                                return;
                            }
                            else if (errornum === '1') {
                                alert("尚未登录！");
                            }
                            else if (errornum === '2') {
                                alert("身份不对应！");
                            }
                            else if (errornum === '3') {
                                alert("账户被冻结！");
                            }
                            else {
                                alert('nigenbenmeiyouerrornum')
                            }
                            this.props.history.push('/signin');
                        })
                        .catch(e => console.log(e));
                })
        }
        else{
            let s = `token=${token}&orderid=${orderid}`;
            console.log(token)
            fetch('http://pipipan.cn:30011/Order/Buy', {
                method: 'POST',
                body: s,
                headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded',
                }),
                credentials: "include",
            })
                .then(response => {
                        let errornum = response.headers.get('errornum');
                        if (errornum === '0') {
                            if (response.status !== 200) throw Error("Error !" + response);
                            return response.text();
                        }
                        else if (errornum === '1') {
                            alert("尚未登录！");
                        }
                        else if (errornum === '2') {
                            alert("身份不对应！");
                        }
                        else if (errornum === '3') {
                            alert("账户被冻结！");
                        }
                        this.props.history.push('/signin');
                    }
                )
                .then(text => {
                    text = JSON.parse(text);
                    console.log(text);
                    storage.setItem("message", text.message);
                    if (text.message === 'success')
                        storage.setItem("Inventory shortage", text["Inventory shortage"].toString());
                    this.routeToAfterPay();
                })
        }
    }

    render(){
        const { classes } = this.props;

        const orderPayForm = (
            <div>
                <Card>
                    <CardContent>
                        <Grid container spacing={24}>
                            <Grid item xs={2} style={{textAlign:'right',marginTop:"2%"}}>
                                <Typography>
                                    订单编号
                                </Typography>
                            </Grid>
                            <Grid item xs={2} style={{textAlign:'left',marginTop:"2%"}}>
                                <Typography>
                                    {this.state.order.id}
                                </Typography>
                            </Grid>
                            <Grid item xs={2} style={{textAlign:'right',marginTop:"2%"}}>
                                <Typography>
                                    收货人
                                </Typography>
                            </Grid>
                            <Grid item xs={2} style={{textAlign:'left',marginTop:"2%"}}>
                                <Typography>
                                    {this.state.order.receiver}
                                </Typography>
                            </Grid>
                            <Grid item xs={2} style={{textAlign:'right',marginTop:"2%"}}>
                                <Typography>
                                    手机号码
                                </Typography>
                            </Grid>
                            <Grid item xs={2} style={{textAlign:'left',marginTop:"2%"}}>
                                <Typography>
                                    {this.state.order.phone}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider style={{marginTop:"1.5%"}}/>
                        <Grid container spacing={24}>
                            <Grid item xs={2} style={{textAlign:'right',marginTop:"1.5%"}}>
                                <Typography>
                                    收获地址
                                </Typography>
                            </Grid>
                            <Grid item xs={10} style={{textAlign:'left',marginTop:"1.5%"}}>
                                <Typography>
                                    {this.state.order.address}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider style={{marginTop:"1.5%"}}/>
                        <Typography className={classes.headline} style={{ fontSize: "125%",marginTop:"2%",marginLeft:"6%"}}>
                            订单票品
                        </Typography>
                        <Paper className={classes.root} style = {{marginTop:"2%"}}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style ={{textAlign:'center'}}>商品名称</TableCell>
                                        <TableCell style ={{textAlign:'center'}} numeric>数量</TableCell>
                                        <TableCell style ={{textAlign:'center'}} numeric>单价</TableCell>
                                        <TableCell style ={{textAlign:'center'}} numeric>合计</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.data.map(n => {
                                        return (
                                            <TableRow key={n.id}>
                                                <TableCell component="th" scope="row" style ={{textAlign:'center'}}>
                                                    {n.title}
                                                </TableCell>
                                                <TableCell style ={{textAlign:'center'}} numeric>{n.number}</TableCell>
                                                <TableCell style ={{textAlign:'center'}} numeric>{'¥'+n.eachPrice}</TableCell>
                                                <TableCell style ={{textAlign:'center'}} numeric>{'¥'+n.number * n.eachPrice}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Paper>
                        <Divider style={{marginTop:"1.5%"}}/>
                        <Grid container spacing={24}>
                            {/* <Grid item xs={1} style={{marginTop:"1.5%"}}></Grid> */}
                            <Grid item xs={3} style={{textAlign:'right',marginTop:"1.5%"}}>
                                <Typography className={classes.headline} style={{ fontSize: "125%", marginTop: "2%", marginLeft: "6%" }}>
                                    总费用
                                </Typography>
                            </Grid>
                            <Grid item xs={4} style={{textAlign:'left',marginTop:"1.5%"}}>
                                    <Typography  style={{ fontSize: "125%", marginTop: "2%"}}>
                                        {'¥'+this.calcuTotal()}
                                    </Typography>
                            </Grid>
                            <Grid item xs={2} style={{marginTop:"1.5%"}}/>
                            <Grid item xs={3} style={{marginTop:"1.5%"}}>
                                <Button variant="contained" style={{marginRight:'3%',color:"#FFFFFF",borderBottom:'100%',backgroundColor:"#FF6699"}} onClick={this.buy}>
                                    支付
                                </Button>
                            </Grid>
                        </Grid>
                        
                    </CardContent>
                </Card>
            </div>
        );
        return(
            <div>
                {orderPayForm}
            </div>
        )
    }
}

PayConfirm.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(PayConfirm));