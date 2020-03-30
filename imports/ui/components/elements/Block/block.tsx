import React from 'react';
import './styles'

/* 
 * This Component borrows the API from 'react-blocks' npm package,
 * an older React-class based package.
 * Other flex alignment pacakges are focued on grid layouts
 * or are not generalized well.
 * This is a simplified functional component to provide
 * basic 'in-place' simple alignments for flex boxes/grid, in
 * order provide easy overrides, and avoid pollution of
 * inline styles, for easier future component based styling.
 * 
 * Documentation
 * https://gitlab.com/thorchain/asgard-wallet/-/wikis/docs/custom-components/block
 * 
 */

const prefix = " ant-block-"

function _resolveLayoutGeneral(props:any) {
  let newClasses = ' ant-block';
  if(props.block){
    newClasses += prefix + 'block'
  }
  if(props.hidden){
    newClasses += prefix + 'hidden'
  }
  if(props.invisible){
    newClasses += prefix + 'invisible'
  }

  return newClasses
}

function _resolveLayoutPosition(props:any) {
  let newClasses = ''
  if(props.relative){
    newClasses += prefix + 'relative'
  }
  if(props.absolute){
    newClasses += prefix + 'absolute'
  }

  return newClasses
};

function _resolveLayoutFlex(props:any) {
  let newClasses = '';
  if(props.layout){
    newClasses +=  prefix + 'layout-'
    if(props.vertical){
      props.reverse ?
      newClasses += 'vertical-reverse' :
      newClasses += 'vertical';
    } else {
      props.reverse ?
      newClasses += 'horizontal-reverse' :
      newClasses += 'horizontal';
    }
  }
  if(props.inline){
    newClasses += prefix + 'layout-inline-horizontal';
  }
  if (props.flex && !props.layout ) {
    newClasses += prefix + 'flex-auto'
  } else if (!props.layout) {
    newClasses += prefix + 'flex-none'
  }

  return newClasses;
};


function _resolveLayoutAlign(props:any) {
  let newClasses = ''
  if(props.start) {
    newClasses += prefix + 'align-start';
  } else if(props.center) {
    newClasses += prefix + 'align-center';
  } else if(props.baseline) {
    newClasses += prefix + 'align-baseline';
  } else if(props.end) {
    newClasses += prefix + 'align-end';
  } else if(props.centered){
    // Special Case 'centered' supported
    newClasses = ''.concat( _resolveLayoutFlex({layout:true}), prefix + 'align-center', prefix + 'justify-center');
  } else {
    newClasses += prefix + 'align-stretch';
  }

  return newClasses;
};

function _resolveLayoutSelf(props:any) {
  let newClasses = ''
  if(props.selfStart) {
    newClasses += prefix + 'self-align-start';
  }
  if(props.selfCenter) {
    newClasses += prefix + 'self-align-center';
  }
  if(props.selfEnd) {
    newClasses += prefix + 'self-align-end';
  }
  if(props.selfStretch){
    newClasses += prefix + 'self-align-stretch';
  }

  return newClasses;
};

function _resolveLayoutJustify(props:any) {
  let newClasses = ''
  if(props.justifyStart) {
    newClasses += prefix + 'justify-start';
  }
  if(props.justifyCenter) {
    newClasses += prefix + 'justify-center';
  }
  if(props.justifyEnd) {
    newClasses += prefix + 'justify-end';
  }
  if(props.justifyStretch) {
    newClasses += prefix + 'justify-stretch';
  }
  if(props.justifyBetween) {
    newClasses += prefix + 'justify-between';
  }
  if(props.justifyAround) {
    newClasses += prefix + 'justify-around';
  }

  return newClasses;
};


function _resolveLayoutClasses(props:any) {
  return ''.concat(
    _resolveLayoutGeneral(props),
    _resolveLayoutPosition(props),
    _resolveLayoutFlex(props),
    _resolveLayoutAlign(props),
    _resolveLayoutSelf(props),
    _resolveLayoutJustify(props)
  )
}

const Block: React.FC<BlockPropTypes> = (props): JSX.Element => {
  const newClasses = _resolveLayoutClasses(props)
  let classes
  props.className ? classes = props.className + newClasses : classes = newClasses;
  return <div className={classes} style={props.style}>{props.children}</div> 
};


// Some reference...
interface BlockPropTypes {
  el?: string,
  block?: boolean,
  hidden?: boolean,
  invisible?: boolean,
  relative?: boolean,
  absolute?: boolean,
  layout?: boolean,
  inline?: boolean,
  flex?: boolean,
  vertical?: boolean,
  horizontal?: boolean,
  reverse?: boolean,
  start?: boolean,
  center?: boolean,
  baseline?: boolean,
  end?: boolean,
  stretch?: boolean,
  centered?: boolean,
  selfStart?: boolean,
  selfCenter?: boolean,
  selfEnd?: boolean,
  selfStretch?: boolean,
  justifyStart?: boolean,
  justifyCenter?: boolean,
  justifyEnd?: boolean,
  justifyBetween?: boolean,
  justifyAround?: boolean,
  style?: object,
  className?: string,
  onClick?: Function
};

export default Block;
