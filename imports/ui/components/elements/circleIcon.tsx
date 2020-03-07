import React from 'react'
import { rainbowStop, getIntFromName } from '/imports/ui/lib/colorHelper';
import { shortSym } from '/imports/ui/lib/tokenHelpers'
import './circleIconStyles.scss'

export enum Sizes { sm = "sm", md = "md", lg = "lg"} // TODO: Add enum support
type Props = { shortSymbol: string, size: Sizes }

const CircleIcon: React.FC<Props>= (props): JSX.Element => {
  const sym = props.shortSymbol
  const gradientColors = () => {
    const numbers = getIntFromName(sym);
    const start = rainbowStop(numbers[0]);
    const stop = rainbowStop(numbers[1]);
    return 'linear-gradient(45deg,'+ start +', ' + stop +')'
  }
  const hasImg = () => {
    // TODO: Add generic support for more tokens
    if (shortSym(sym) === "RUNE") { return true }
    return false
  }
  const imgSize = () => {
    // this needs to by synced with styles
    switch (props.size) {
      case 'sm':
        return "36px"
      case 'md':
        return "48px"
      case 'lg':
        return "58px"
      default:
        break;
    }
    return ""
  }
  const circleStyle = {
    backgroundImage: gradientColors(),
  }
  return (
    <div>
    {hasImg() ? (
      <img src="/img/RUNE-ICON.svg" width={imgSize()} />
    ) : (
      <div className={"circle-icon-" + props.size + " rounded-circle d-flex align-items-center text-white"} style={circleStyle}>
        <div className="text-center w-100">{props.shortSymbol}</div>
      </div>
    )}
    </div>

  )
}
export default CircleIcon