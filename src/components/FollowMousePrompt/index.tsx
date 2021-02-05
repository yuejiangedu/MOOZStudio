import React, { useEffect, useState } from "react"
import styles from './index.styl'
interface Iprops {
  text: string,
  display: boolean
}


const FollowMousePrompt = (props: Iprops) => {
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  const updatePosition = (event: MouseEvent) => {
    setLeft(event.clientX)
    setTop(event.clientY)
  }

  useEffect(() => {
    window.addEventListener('mousemove', updatePosition)
    return () => {
      window.removeEventListener('mousemove', updatePosition)
    }
  }, [props.display])

  return (
    <div
      style={{
        left,
        top,
        display: props.display ? 'block' : 'none'
      }}
      className={styles.container}>
      {props.text}
    </div>
  )
}

export default FollowMousePrompt