import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import styles from './index.styl';

interface Iprops {
  printTime: number;
  setPrintTime: (sec: number) => void;
  progress: number;
  show: boolean;
  pause: boolean;
  t: (str: string) => string;
}
interface State {
  [name: string]: number;
}

class OnlinePrintTimer extends Component<Iprops> {
  state: State = {
    hour: 0,
    min: 0,
    sec: 0
  }

  timer: any;


  componentDidUpdate(pre: any) {
    if ((this.props.show !== pre.show)) {
      if (this.props.show) {
        this.startTimeWait();
      } else {
        this.initState();
      }
    }

    if ((this.props.pause !== pre.pause)) {
      if (this.props.pause) {
        clearInterval(this.timer);
      } else {
        this.startTimeWait();
      }
    }
  }

  initState = () => {
    clearInterval(this.timer);
    this.setState({
      hour: 0,
      min: 0,
      sec: 0
    });
  }

  startTimeWait = () => {
    this.timer = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime = () => {
    let { hour, min, sec } = this.state;
    const { printTime, setPrintTime } = this.props;
    sec++;
    if (sec > 59) {
      min++; sec = 0;
    }
    if (min > 59) {
      hour++; min = 0;
    }
    this.setState({
      hour,
      min,
      sec
    });
    printTime && setPrintTime(printTime - 1);
  }

  formatterTime = () => {
    const { hour, min, sec } = this.state;
    return {
      hour: hour < 10 ? ('0' + hour) : hour,
      min: min < 10 ? ('0' + min) : min,
      sec: sec < 10 ? ('0' + sec) : sec,
    };
  }

  formatSeconds = (sec: number) => {
    let theTime = sec;
    let theTime1 = 0;// 分
    let theTime2 = 0;// 小时
    if (theTime > 60) {
      theTime1 = Math.trunc(theTime / 60);
      theTime = Math.trunc(theTime % 60);
      if (theTime1 > 60) {
        theTime2 = Math.trunc(theTime1 / 60);
        theTime1 = Math.trunc(theTime1 % 60);
        if (theTime2 > 24) {
          theTime2 = Math.trunc(theTime2 % 24);
        }
      }
    }
    const hour = theTime2 < 10 ? ('0' + theTime2) : theTime2;
    const min = theTime1 < 10 ? ('0' + theTime1) : theTime1;
    const second = theTime < 10 ? ('0' + theTime) : theTime;
    const result = `${hour} h ${min} m ${second} s`;
    return result;
  }

  render() {
    const time = this.formatterTime();
    const reMainTimeStr = this.formatSeconds(this.props.printTime);
    const { t } = this.props;
    return (this.props.show ? (
      <div className={styles.statisticConstainer}>
        <section className={styles.elapsedTime}>
          <label>{t('Print Progress')}</label>
          {`${this.props.progress}%`}
        </section>
        <section className={styles.elapsedTime}>
          <label>{t('Elapsed Time')}</label>
          {`${time.hour} h ${time.min} m ${time.sec} s`}
        </section>
        {/* <section className={styles.elapsedTime}>
          <label>{t('Remaining Time')}</label>
          {`${reMainTimeStr}`}
        </section> */}
      </div>
    ) : null
    );
  }
}
export default withTranslation()(OnlinePrintTimer);
