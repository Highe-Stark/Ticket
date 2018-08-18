import {Component} from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import pink from "@material-ui/core/colors/pink";
import IconButton from "@material-ui/core/IconButton";
import CommentTextOutline from "mdi-material-ui/CommentTextOutline";

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    post: {
        maxWidth : '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
        margin: 'auto auto',
        overflow: 'hidden',
    },
    selectButton: {
        margin: theme.spacing.unit,
    },
    grid: {
        display: 'flex',
        flexGrow: 1,
        margin: theme.spacing.unit,
        padding: theme.spacing.unit,
    },
    container: {
        alignContent: 'center',
        flexGrow: 1,
        justifyContent: 'center',
    },
    imgGrid: {
        flexGrow: 1,
        margin: theme.spacing.unit,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexGrow: 1,
        margin: theme.spacing.unit,
    },
    inline: {
        display: 'inline-block',
    },
    textField: {
        margin: `0 ${theme.spacing.unit}px`,
        width: 60,
    },
    action: {
        display: 'block',
        margin: theme.spacing.unit,
        justifyContent: 'center',
    },
    buttonIcon: {
        margin: `0 ${theme.spacing.unit}px`,
        padding: `0 ${theme.spacing.unit}px`,
    },
    loading: {
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
    },
    loadingBar: {
        flexGrow: 1,
        width: 'inherit',
    },
    commentRoot: {
        display: 'block',
        padding: 0,
        'label + &': {
            marginTop : theme.spacing.unit * 3,
        },
    },
    commentInput : {
        borderRadius: 4,
        backgroundColor: theme.palette.common.white,
        border: '1px solid #ced4da',
        fontSize: 16,
        padding: '10px 12px',
        width: 'calc(100% - 48px),',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&:focus': {
            borderColor: '#80bdff',
            boxShadow: '0 0 0 0.2rem rgba(0, 123,255, .25)',
        },
    },
    commentFormLabel: {
        fontSize: 18,
    },
    commentButtonWrapper: {
        display: 'block',
        width: 'inherit',
        // justifyContent: 'right',
        margin: `0 ${theme.spacing.unit}px`,
    },
    commentButton : {
        display: 'block',
        float: 'right',
    },
    wrapper: {
        display: 'block',
        flexGrow: 1,
    },
    bottomBorder: {
        borderBottom: '1px solid rgba(225,225,225,0.36)',
    },
    headline: {
        color: pink[300],

    },
    opacity: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    }
});

function createCommentData(id, ownerId, ownername, content, createDate) {
    return {id, ownerId, ownername, content, createDate};
}

class UserComment extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rowsPerPage: 9,
            page: 0,
            comments:[],
        };
    }

    componentDidMount() {
        this.fetchCommentToTicket(1);
    }



    fetchCommentToTicket = (pagenumber) =>{
        let storage = window.localStorage;
        let user = JSON.parse(storage.getItem("user"));
        if (user === null)
        {
            alert("请登录");
            this.props.history.push({
                pathname: '/signin',
            });
            return;
        }
        console.log("fetch comment by user id"+user.token);
        let s = `token=${user.token}&pagenumber=${pagenumber}`;
        console.log("http://pipipan.cn:30010/Comment/QueryByUserid?"+s);
        fetch("http://pipipan.cn:30010/Comment/QueryByUserid",{
            method:'POST',
            body:s,
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            credentials: "include"
        })
            .then(response => {
                if (response.status !== 200) throw Error("Error !" + response);
                return response.json();
            })
            .then(data =>{
                console.log(data);
                if(data.totalElements === 0){
                    this.setState({
                        comments : []
                    })
                }
                else{
                    let content = data.content;
                    let tmpArray = [];
                    for(let i = 0 ; i < content.length ; i++){
                        tmpArray.push(createCommentData(content[i].id,content[i].owenerId,content[i].ownername,content[i].content,content[i].createTime))
                    }
                    this.setState({
                        comments : tmpArray
                    });
                    console.log(this.state.comments)
                }
            });
    };

    viewCommentAndReply = (id) => {
        console.log("View Comment and Replay of Comment/Reply id= " + id);
        this.props.history.push({
            pathname: '/comments',
            search: `?id=${id}`,
        })
    };

    render() {
        const {classes} = this.props;
        const {rowsPerPage, page} = this.state;

        const Comment = (
            <div>


                <Grid container spacing={24}>
                    <Grid item xs={12} style={{textAlign: 'center', marginTop: '2%'}}>
                        <Typography className={classes.headline}
                                    style={{fontSize: "200%", fontWeight: "normal", marginBottom: '3%'}}>
                            我的评论
                        </Typography>
                    </Grid>
                </Grid>
                {this.state.comments.length===0?(<div><h3>暂无评论</h3></div>):this.state.comments.map(s => (
                    <Grid key={s.id} item xs={12} md={8} className={classes.grid}>
                        <Grid item xs={2} md={2} className={classes.bottomBorder}>
                            <Typography variant='subheading' component='h3' className={classes.inline}>{s.ownername}</Typography>
                            <br/>
                            <Typography variant='caption' className={classes.inline}>{s.createDate}</Typography>
                        </Grid>
                        <Grid item xs={10} md={10} className={classes.bottomBorder}>
                            <div>
                                <div>
                                    <Typography variant='body1' component='p'>{s.content}</Typography>
                                </div>
                                <div className={classes.commentButtonWrapper}>
                                    <IconButton aria-label="ViewCommentAndReply" className={classes.commentButton} onClick={() => this.viewCommentAndReply(s.id)}>
                                        <CommentTextOutline/>
                                    </IconButton>
                                </div>
                            </div>
                        </Grid>
                    </Grid>
                ))}
            </div>
        );
        return (<div>{Comment}</div>)
    }

}

UserComment.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserComment);