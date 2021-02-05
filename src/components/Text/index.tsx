
import React, { useMemo, useState } from 'react';
import { Button, Radio, Input } from 'antd';
import _find from 'lodash/find';
import _findIndex from 'lodash/findIndex';
import { useTranslation } from 'react-i18next';
import styles from './index.styl';
import { buryevent } from '../../lib/ganalysis/ganalysis';
import { useLocation } from 'react-router'
import { usePublish } from '../../lib/hooks/usePubSub'
interface Iprops {
  text: any[],
}

const Text = (props: Iprops) => {
  const { t } = useTranslation();
  const [inputTextType, updateInputTextType] = useState(0);
  const [inputText, setInputText] = useState('');
  const publish = usePublish();
  const location = useLocation();
  const insertText = () => {
    const meta = {
      text: inputText,
      x: 0,
      y: 0,
      scale: 1,
      active: false,
      textType: inputTextType
    };
    publish('insertText', meta)
    buryevent('btn_add_text', {
      'event_category': location.pathname.substring(1),
      'event_label': inputTextType === 0 ? 'outline' : 'fill'
    })
    setInputText('')
    updateInputTextType(0)
  }

  const inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const { text } = props;

    const activeIndex = _findIndex(text, (o) => (o.active));
    if (activeIndex >= 0) {
      text[activeIndex].text = val;
      publish('changeText', text[activeIndex])
      buryevent('change_text',
        {
          'event_category': location.pathname,
          'event_label': inputTextType === 0 ? 'outline' : 'fill'
        })
    }
    setInputText(val)
  }

  const changeTextType = (e: any) => {
    const { text } = props;
    const activeIndex = _findIndex(text, (o) => (o.active));
    if (activeIndex >= 0) {
      text[activeIndex].textType = e.target.value;
      publish('changeText', text[activeIndex])
      buryevent('btn_change_text_type',
        {
          'event_category': location.pathname,
          'event_label': inputTextType === 0 ? 'outline' : 'fill'
        })
    }
    updateInputTextType(e.target.value)
  }

  const activeTxt = useMemo(() => {
    return _find(props.text, (o) => (o.active))
  }, [props.text])


  return (
    <div className={styles.textContent} >
      <div>
        <Input
          type="text" value={activeTxt ? activeTxt.text : inputText} onChange={inputChange}
        />
        <Button type="primary" onClick={insertText}>{t('Add Text')}</Button>
      </div>
      <div>
        <Radio.Group
          onChange={changeTextType}
          value={activeTxt ? activeTxt.textType : inputTextType}
          style={{ marginTop: '8px', paddingLeft: '10px' }}>
          <Radio value={0} style={{ marginRight: '20px' }}>{t('Outline')}</Radio>
          <Radio value={1}>{t('Fill')}</Radio>
        </Radio.Group>
      </div>
    </div>
  )
}

export default Text