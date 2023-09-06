import { ParagraphMedium } from "baseui/typography"
import { H2 } from "../../components/h2";

import { Block } from 'baseui/block'
import { FormControl } from 'baseui/form-control'
import { Input } from 'baseui/input'
import { StyledLink } from 'baseui/link'

import { CodeLinks } from '../../components/code-links'
import { CaptionBlock } from '../../components/CaptionBlock'
import React from "react";
import styles from './wordplot.module.scss'
import names from './names.txt'
import { createBindGroupDescriptor } from "./bindGroup";
import WordPlotComputeWGSL from './wordplot.compute.wgsl';

const letters = [
  '',
  '.', 'a', 'b', 'c',
  'd', 'e', 'f', 'g',
  'h', 'i', 'j', 'k',
  'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's',
  't', 'u', 'v', 'w',
  'x', 'y', 'z'
];

const bluesScale: number[][] = [
  [247, 251, 255], //0.0
  [227, 238, 248], //0.1
  [207, 225, 242], //0.2
  [182, 212, 233], //0.3
  [147, 196, 222], //0.4
  [106, 173, 213], //0.5
  [74, 151, 201],  //0.6
  [45, 125, 187],  //0.7
  [23, 100, 171],  //0.8
  [8, 73, 145],    //0.9
  [8, 48, 107]     //1.0
];

export const DemoMMWordPlot = () => {

  const [showProbs, setShowProbs] = React.useState<boolean>(false);
  const [test, setTest] = React.useState<number>(0);
  const 

  React.useEffect(() => {
    const adapter = await navigator.gpu.requestAdapter().catch(() => console.log('Adapter not found'));
    const device = await adapter.requestDevice().catch(() => console.log('Device not found'));
    if (device) {
      fetch('/names.txt').then((res) => {
        return res.text()
      }).then((data) => {
        const charCodes = new Uint32Array([
          ...data.split('\n').join('.').split('').map(char => char.charCodeAt(0))
        ]);

        const input = device.createBuffer({
          size: Uint32Array.BYTES_PER_ELEMENT * charCodes.length,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        device.queue.writeBuffer(input, 0, charCodes);

        const output = device.createBuffer({
          size: Uint32Array.BYTES_PER_ELEMENT * 27 * 27,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        })

        const stagingBuffer = device.createBuffer({
          size: Uint32Array.BYTES_PER_ELEMENT * 27 * 27,
          usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });

        const uniformsBuffer = device.createBuffer({
          size: Uint32Array.BYTES_PER_ELEMENT * 1,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        const bgDescript = createBindGroupDescriptor(
          [0, 1, 2],
          [GPUShaderStage.COMPUTE, GPUShaderStage.COMPUTE, GPUShaderStage.COMPUTE],
          ['buffer', 'buffer', 'buffer'],
          [{ type: 'read-only-storage' }, { type: 'storage' }, { type: 'uniform' }],
          [
            [
              { buffer: input },
              { buffer: output },
              { buffer: uniformsBuffer },
            ],
          ],
          'WordPlot',
          device
        );

        const pipeline = device.createComputePipeline({
          layout: device.createPipelineLayout({
            bindGroupLayouts: [bgDescript.bindGroupLayout],
          }),
          compute: {
            module: device.createShaderModule({
              code: WordPlotComputeWGSL,
            }),
            entryPoint: 'computeMain',
          },
        });

        
        
    }


    fetch('/names.txt').then((res) => {
      return res.text()
    }).then((data) => {
      const words = data.split('\n')
      for (const word in words) {
        let chs = ['.', ...word.split(''), '.'];
        for (let i = 0; i < chs.length - 2)
        
      }
    })
  }, []);

  return (
    <>
      <ParagraphMedium>
        This demo illustrates the training process of the{' '}
        <StyledLink href="https://en.wikipedia.org/wiki/Multilayer_perceptron">
          Multilayer perceptron
        </StyledLink>{' '}
        (MLP) which consists of the forward pass, loss calculation, backward
        pass, and adjusting the neurons weights.
      </ParagraphMedium>

      <ParagraphMedium>
        This is a simplified example where we're only dealing with the training
        data and, basically, overfitting the network. However, it allows us to
        test if the backpropagation implementation works correctly. After
        several epoch of training you may see that the network predictions get
        pretty close to the prediction from the training set.
      </ParagraphMedium>

      <H2>Code Context</H2>
      <CodeLinks
        links={[
          {
            url: 'https://github.com/trekhleb/micrograd-ts/blob/main/micrograd/nn.ts',
            name: 'micrograd-ts/micrograd/nn.ts',
          },
          {
            url: 'https://github.com/trekhleb/micrograd-ts/blob/main/demo/src/demos/demo-mlp-training.tsx',
            name: 'micrograd-ts/demo/src/demos/demo-mlp-training.tsx',
          },
        ]}
      />

    <H2>{`Word Plot ${showProbs ? '(Probabilities)' : '(Occurrences)'}`}</H2>
      <Block>
        <Block className={styles.wordplot_grid}>
          {letters.map((l1, idx) => {
            return letters.map((l2, idx) => {
              return (
                <div 
                  style={{
                    backgroundColor: `rgba(${bluesScale[test][0]}, ${bluesScale[test][1]}, ${bluesScale[test][2]}, 255)`,
                    color: test > 6 ? 'white' : 'black',
                  }}
                  className={styles.wordplot_grid__item}
                >
                  <div style={{
                    width: "50%", height: "50%",
                    backgroundColor: `rgba(${bluesScale[test][0]}, ${bluesScale[test][1]}, ${bluesScale[test][2]}, 255)`,
                  }}>{l1}{l2}</div>
                  <div style={{
                    width: "50%", height: "50%",
                    backgroundColor: `rgba(${bluesScale[test][0]}, ${bluesScale[test][1]}, ${bluesScale[test][2]}, 255)`,
                  }}>0.2</div>
                </div>
              );
            })
          })}
        </Block>
        <button onClick={() => setTest(test + 1)}></button>
      </Block>

      <H2>Training Parameters</H2>
      <Block>
        <Block display="flex" flexDirection={['column', 'column', 'row']}>
          <Block display="flex" flexDirection={'column'} flex="1" marginRight={['0px', '0px', '10px']}>
            <FormControl
              label={() => 'Epochs'}
              caption={<CaptionBlock text={'Network training iterations'}/>}
            >
              <Input
                type="number"
                min={0}
                maxLength={4}
                value={2}
              />
            </FormControl>
          </Block>
        </Block>
      </Block>
    </>
  );
}