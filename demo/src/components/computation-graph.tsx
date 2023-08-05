import React from 'react'
import { CSSProperties } from 'react'
import { Graphviz } from 'graphviz-react'
import {
  Badge,
  COLOR as BADGE_COLOR,
  HIERARCHY as BADGE_HIERARCHY,
} from 'baseui/badge'

import { Value } from '../../../micrograd/engine'
import { valToDot } from '../utils/graph'
import { Block } from 'baseui/block'

type ComputationGraphProps = {
  value: Value
}

export function ComputationGraph(props: ComputationGraphProps) {
  const { value } = props

  const containerRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState<number>(500)
  const [height] = React.useState<number>(500)

  React.useEffect(() => {
    if (!containerRef.current) return
    if (containerRef.current.clientWidth === width) return
    setWidth(containerRef.current.clientWidth)
    const resizer = () => {
      setWidth(containerRef?.current?.clientWidth || 500)
    }
    addEventListener('resize', resizer)
    return () => {
      removeEventListener('resize', resizer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (value === undefined) return

  const containerStyles: CSSProperties = {
    lineHeight: 0,
    display: 'flex',
    overflow: 'scroll',
    borderWidth: '1px',
    borderColor: '#ccc',
    borderStyle: 'dashed',
    flex: 1,
  }

  return (
    <>
      <Block marginBottom="10px">
        <Badge
          color={BADGE_COLOR.primary}
          hierarchy={BADGE_HIERARCHY.secondary}
          content={<>Computation Graph</>}
        />
      </Block>
      <div style={containerStyles} ref={containerRef}>
        <Graphviz
          dot={valToDot(value)}
          options={{ fit: true, zoom: true, scale: 1, width, height }}
        />
      </div>
    </>
  )
}
