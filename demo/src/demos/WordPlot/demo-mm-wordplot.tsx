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



const drawGrid = (
  context: CanvasRenderingContext2D, 
  bigramMap: Map<string, number>
) => {
  const gridCellWidth = context.canvas.width / 28;
  const gridCellHeight = context.canvas.height / 28;
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 28; j++) {
      context.fillStyle = 'rgba(0, 0, 255, 0.5)'
      context.fillRect(j * gridCellWidth, i * gridCellHeight, gridCellWidth, gridCellHeight)
      context.font = '14px Arial'
      context.textAlign = 'center'
      context.fillStyle = 'black'
      context.fillText(`${letters[i]}${letters[j]}`, j * gridCellWidth + 10, gridCellHeight / 2 + (i * gridCellHeight));
      const occurr = bigramMap.get(`${letters[i]}${letters[j]}`);
      const text = occurr === undefined ? '' : occurr.toString();
      console.log(text);
      context.fillText(
        text,
        j * gridCellWidth + 10, 
        gridCellHeight + (i * gridCellHeight)
      );
    }
  }
}




const Canvas2DInit = async (canvas: HTMLCanvasElement, pageState: {active: boolean}, wordsPerFrame: number) => {
  if (!pageState.active) {
    return;
  }
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  

  let words: string[] 
  {
    await fetch('/names.txt').then((res) => {
      return res.text()
    }).then((data) => {
      words = data.split('\n')
    })
  };

  let wordIndex = 0;
  const bigramMap = new Map<string, number>();
  const runoff = words.length % wordsPerFrame;
  const preRunoffIterations = Math.floor(words.length / wordsPerFrame);

  let currentIteration = 0;

  async function frame() {
    const start = currentIteration * wordsPerFrame;
    const end = currentIteration + 1 > preRunoffIterations ? (currentIteration + 1) * wordsPerFrame : start + runoff;
    for (let i = start; i < end; i++) {
      const word = words[i];
      for (let i = 0; i < word.length - 2; i++) {
        const ch1: string = word[i];
        const ch2: string = word[i + 1];
        const currentGet = bigramMap.get(ch1 + ch2);
        bigramMap.set(ch1 + ch2, currentGet === undefined ? 0 : currentGet + 1);
      }
    }
    console.log(bigramMap)
    drawGrid(context, bigramMap);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export const DemoMMWordPlot = () => {

  const [showProbs, setShowProbs] = React.useState<boolean>(false);
  const [test, setTest] = React.useState<number>(0);
  const words = React.useRef<string[]>([]);
  
  const bigramMap = React.useRef<Map<string, number>>(new Map());
  const [testState, setTestState] = React.useState(0);


  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);


  React.useEffect(() => {
    const canvas = canvasRef.current;
    const pageState = {active: true};
    try {
      Canvas2DInit(canvas, pageState);
    } catch (err) {
      console.log(err);
    }
    return () => {
      pageState.active = false;
    }
  }, []);

  React.useEffect(() => {
    console.log(words.current)
    if (words.current.length !== 0) {
      for (const word of words.current) {
        for (let i = 0; i < word.length - 2; i++) {
          const ch1: string = word[i];
          const ch2: string = word[i + 1];
          const currentGet = bigramMap.current.get(ch1 + ch2);
          bigramMap.current.set(ch1 + ch2, currentGet === undefined ? 0 : currentGet + 1);
        }
      }
      console.log(bigramMap);
    }
  }, [words])

  React.useEffect(() => {
    console.log(bigramMap);

  }, [bigramMap])


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

      <ParagraphMedium>{bigramMap.current.get('ab')}</ParagraphMedium>

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
        <Block position='relative' width="100%" overflow='auto'>
          <canvas id="wordplot_canvas" width={28 * 28 * 2} height={1000} ref={canvasRef}></canvas>
        </Block>
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