import {css} from '../utils'
import '../types'

const template = (data: ToolTipDataType) => `
    <div class = "tooltip-title">${data.date}</div>
    <ul class="tooltip-list">
        ${data.items.map(item => `
        <li class = "tooltip-list-item">
            <div class="text">${item.text}</div>
            <div class="hash">Hash: ${item.hash}</div>
            ${item.tag.length > 0 ? `<div class="tag">Tag: ${item.tag}</div>` : ''}
        </li>   
     `).join('\n')}
    </ul>
`

export default function Tooltip(el: HTMLElement) {
    const clear = () => el.innerHTML = ''

    return {
        show({left, top}: { left: number, top: number }, data: ToolTipDataType) {
            clear()
            const {height, width} = el.getBoundingClientRect()
            css(el, {
                display: 'block',
                top: (top - height) + 'px',
                left: (left + width / 2) + 'px'
            })
            el.insertAdjacentHTML('afterbegin', template(data))
        },
        hide() {
            css(el, {display: 'none'})
        }
    }
}