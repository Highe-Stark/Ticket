import React, {Component} from 'react';
import '../css/Sliders.css';
import SlidersItem from './SlidersItem';
import SlidersDots from './SlidersDots';


export default class Sliders extends Component {
    constructor(props) {
        super(props);
        this.state = {index: 0};
    }

    componentDidMount() {
        this.setState({speed: this.props.speed});
        if (this.props.autoPlay) {
            this.go();
        }
    }

    go = () => {
        this.timer = setInterval(() => {
            this.turn(1)
        }, this.props.delay * 1000)
    };

    turn = (step) => {
        let index = this.state.index;
        // console.log(index);
        if (index === this.props.images.length && step === 1) {
            index = 0;
            this.set(0, index, 0);
        }
        else if (index === -1 && step === -1) {
            index = this.props.images.length - 1;
            this.set(0, index, 0);
        }
        else
            this.set(this.props.speed, index, step);
    };

    set = (speed, index, step) => {
        this.setState({speed: speed});
        this.setState({index: index + step});
    };

    componentDidUpdate(prevProps, prevState) {
        // slide by arrow. from maxLength to 1
        if (this.state.index === 0 && prevState.index === this.props.images.length) {
            setTimeout(() => {
                this.setState({
                    speed: this.props.speed,
                    index: 1
                })
            }, 0);
            return
        }
        // slide by arrow, from 0 to maxLenth - 1
        if (prevState.index === -1 && this.state.index === this.props.images.length - 1) {
            setTimeout(() => {
                this.setState({
                    speed: this.props.speed,
                    index: this.props.images.length - 2
                })
            }, 0)
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    detail() {
        window.location.href = `/detail/${this.props.images[(this.state.index+1)%this.props.images.length].id}`;
    }

    render() {
        let styleLeft = {
            width: 100 + '%',
            left: (this.state.index + 1) * -100 + '%',
            transitionDuration: this.state.speed + 's'
        };
        let styleMiddle = {
            width: 100 + '%',
            left: (this.state.index + 2) * -100 + '%',
            transitionDuration: this.state.speed + 's'
        };
        let styleRight = {
            width: 100 + '%',
            left: (this.state.index + 3) * -100 + '%',
            transitionDuration: this.state.speed + 's'
        };
        return (
            <div className="huge">
                <div className="small">
                    <div
                        className="wrapper-left"
                        onMouseOver={() => clearInterval(this.timer)}
                        onMouseOut={this.go}
                        onClick={() => {
                            this.turn(-1)
                        }}
                    >
                        <SlidersItem
                            images={this.props.images}
                            speed={this.props.speed}
                            style={styleLeft}
                        />
                    </div>
                    <div
                        className="wrapper-middle"
                        onMouseOver={() => clearInterval(this.timer)}
                        onMouseOut={this.go}
                    >
                        <div
                            onClick={() => {
                                this.detail()
                            }}
                        >
                            <SlidersItem
                                images={this.props.images}
                                speed={this.props.speed}
                                style={styleMiddle}
                            />
                        </div>
                        <SlidersDots
                            images={this.props.images}
                            turn={this.turn}
                            index={(this.state.index + this.props.images.length) % this.props.images.length}
                        />
                    </div>
                    <div
                        className="wrapper-right"
                        onMouseOver={() => clearInterval(this.timer)}
                        onMouseOut={this.go}
                        onClick={() => {
                            this.turn(1)
                        }}
                    >
                        <SlidersItem
                            images={this.props.images}
                            speed={this.props.speed}
                            style={styleRight}
                        />
                    </div>
                </div>
            </div>
        )
    }
};