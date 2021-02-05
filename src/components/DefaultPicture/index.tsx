import React, { useEffect, useState } from 'react';
import styles from './index.styl';

interface Iprops {
  importPic: (
    meta: {
      url: string,
      name: string,
      type: string,
      size: number
    }
  ) => void
  svgTitle: string[],
  pngTitle: string[],
  svgPath: NodeRequire[];
  pngPath: string[];
}

export interface IexportMeta {
  url: string;
  name: string;
  size: number;
  type: string;
  originUrl: string;
}

const DefaultPicture = (props: Iprops) => {
  const [svgs, setSVG] = useState<null | JSX.Element[]>(null);
  const [pngs, setPNG] = useState<null | JSX.Element[]>(null);

  const importPic = (val: NodeRequire | string, type: string) => {
    const meta: IexportMeta = {
      url: String(val),
      name: '',
      size: 0,
      type,
      originUrl: String(val)
    }
    props.importPic(meta)
  }

  useEffect(() => {
    const svgDOM = props.svgTitle.map((title: string, index: number) => {
      return (
        <section key={index} title={title}>
          <div
            onClick={() => importPic(props.svgPath[index], 'svg')}
            dangerouslySetInnerHTML={{ __html: String(props.svgPath[index]) }}
            title={title} />
        </section>
      )
    })
    setSVG([...svgDOM])
  }, [props.svgPath])

  useEffect(() => {
    const pngDOM = props.pngTitle.map((title: string, index: number) => {
      return (
        <section
          key={index}
          title={title}>
          <div>
            <img title={title} onClick={() => importPic(props.pngPath[index], 'png')}
              style={{ width: '78px', height: '76px' }}
              src={require(`../../images/defaultpng/${index + 1}.png`)}
              alt='' />
          </div>
        </section>
      )
    })
    setPNG([...pngDOM])
  }, [props.pngPath])

  return (
    <div className={styles.defaultPictureContainer}>
      <div className={styles.defaultPicture}>
        {svgs}
        {pngs}
      </div>
    </div>
  )
}
export default DefaultPicture