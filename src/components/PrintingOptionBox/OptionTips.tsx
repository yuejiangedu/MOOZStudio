import React from 'react'
import styles from './index.styl'
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { tips } from './tips';
interface Iprops {
  positionInfos: { show: boolean, label: string, top: string, right: string }
}
const OptionTips = (props: Iprops) => {
  const { t } = useTranslation();

  const showFluencesItems = (data: any) => {
    const tsx: JSX.Element[] = [];
    data.map((item: string, index: number) => {
      tsx.push(
        <li key={index}>{t(item)}</li>
      )
    })
    return tsx;
  }

  const component = (tips: any) => {
    let temcurrentShowItem = tips.filter((item: any) => {
      return item.label === props.positionInfos.label;
    })
    if (temcurrentShowItem.length !== 0) {
      temcurrentShowItem = temcurrentShowItem[0];
    } else {
      return
    }
    return (
      <section
        className={classNames(styles.helperTips, { [styles.hide]: !(props.positionInfos.show) })}
        style={{ top: props.positionInfos.top, right: props.positionInfos.right }}
      >
        <div >
          <div className={styles.title}>{t(temcurrentShowItem.label)}</div>
          <div className={styles.introduction}>{t(temcurrentShowItem.introduction)}</div>
        </div>
        {
          temcurrentShowItem.influencesItems &&
          <div>
            <div className={styles.title}>{t('Affects')}</div>
            <ul>
              {showFluencesItems(temcurrentShowItem.influencesItems)}
            </ul>
          </div>
        }
        {
          temcurrentShowItem.affectedProjects &&
          <div>
            <div className={styles.title}>{t('AffectedBy')}</div>
            <ul>
              {showFluencesItems(temcurrentShowItem.affectedProjects)}
            </ul>
          </div>
        }
      </section>
    )
  }

  return (
    <div>
      { component(tips)}
    </div>
  )
}
export default OptionTips