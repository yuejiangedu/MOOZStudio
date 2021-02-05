import React from 'react'
import styles from './index.styl'
interface Iprops {
  title: string,
  content: string,
}
const HelperTips = (props: Iprops) => {
  return (
    <div>
      <span
        className={styles.titleSpan}
      >
        <div style={{ color: '#1782e5', display: 'inline-block' }}>?</div>
        <div className={styles.infos}>
          <section>{props.title}</section>
          <div style={{ width: '100%', borderTop: '0.5px solid rgba(0,0,0,0.06)', float: 'left', marginTop: '1px', marginBottom: '6px' }} />
          <section>{props.content}</section>
        </div>
      </span>
    </div>
  )
}
export default HelperTips