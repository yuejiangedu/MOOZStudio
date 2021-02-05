import React, { useEffect, useState } from 'react'
import { Icon } from 'antd';
import styles from './index.styl'
interface Iprops {
  title: JSX.Element | string,
  content: JSX.Element | string,
  changeDisplay?: () => void,
  suffix?: JSX.Element | null
}
const DropDownContainer = (props: Iprops) => {
  const [icon, setIcon] = useState('down')
  const [display, setDisplay] = useState(true)

  const changeDisplay = () => {
    setIcon(!display ? 'down' : 'up')
    setDisplay(!display)
  }

  return (
    <div className={styles.dropDownContainer}>
      <header>
        <section>
          {props.title}
          {props.suffix}
        </section>
        <Icon type={icon} onClick={changeDisplay} />
      </header>
      <section style={{ display: display ? 'block' : 'none' }}>
        {props.content}
      </section>
    </div>
  )
}
export default DropDownContainer