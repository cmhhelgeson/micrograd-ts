import React from 'react'
import { Tabs, Tab, ORIENTATION } from 'baseui/tabs-motion'
import { useLocation, useNavigate } from 'react-router-dom'

import { H1 } from './h1'
import { DemoMLP } from '../demos/demo-mlp'
import { DemoNeuron } from '../demos/demo-neuron'
import { DemoValue } from '../demos/demo-value'
import { DemoMLPTraining } from '../demos/MLPTraining/demo-mlp-training'
import { DemoMMWordPlot } from '../demos/WordPlot/demo-mm-wordplot'

enum TabKey {
  Value = 'value',
  Neuron = 'neuron',
  MLP = 'mlp',
  Training = 'training',
  WordPlot = 'wordplot'
}

type TabConfig = { title: string; content: React.ReactNode }

const TabsMap: Map<TabKey, TabConfig> = new Map([
  [TabKey.Value, { title: 'Value', content: <DemoValue /> }],
  [TabKey.Neuron, { title: 'Neuron', content: <DemoNeuron /> }],
  [TabKey.MLP, { title: 'MLP', content: <DemoMLP /> }],
  [TabKey.Training, { title: 'MLP Training', content: <DemoMLPTraining /> }],
  [TabKey.WordPlot, { title: 'WordPlot', content: <DemoMMWordPlot />}],
])

export function Demos() {
  const location = useLocation()
  const navigate = useNavigate()

  const defaultTabKey: React.Key = location.hash
    ? location.hash.replace('#', '')
    : TabKey.Training

  const [activeKey, setActiveKey] = React.useState<React.Key>(defaultTabKey)

  const tabs = Array.from(TabsMap.entries()).map(
    ([tabKey, tabConfig]: [TabKey, TabConfig]) => (
      <Tab title={tabConfig.title} key={tabKey}>
        <H1>{tabConfig.title}</H1>
        {tabConfig.content}
      </Tab>
    )
  )

  const onTabSelect = (tabKey: TabKey) => {
    setActiveKey(tabKey)
    navigate(`#${tabKey}`)
  }

  return (
    <Tabs
      activeKey={activeKey}
      onChange={({ activeKey }) => onTabSelect(activeKey as TabKey)}
      orientation={ORIENTATION.horizontal}
      activateOnFocus
    >
      {tabs}
    </Tabs>
  )
}
