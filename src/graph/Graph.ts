import '../styles.scss'
import './types'
import {getGraphData} from '../data'
import {Branch} from './components/Branch'
import Tooltip from './components/Tooltip'
import {
    css,
    computeXRatio,
    computeYRatio,
    getData,
    setYForBranches
} from './utils'
import {
    drawBranches,
    drawCommitPoints,
    clear,
    xAxis,
} from './view'

const WIDTH: number = 800
const HEIGHT: number = 200
const PADDING: number = 40
const DPI_WIDTH: number = WIDTH * 2
const DPI_HEIGHT: number = HEIGHT * 2
const VIEW_HEIGHT: number = DPI_HEIGHT - 2 * PADDING
const VIEW_WIDTH: number = DPI_WIDTH
const CIRCLE_RADIUS: number = 8

export function Graph(root: string, optionsContainer: string, data: DataType): GraphReturnType {
    let rootElement: HTMLElement = document.getElementById(root)!
    let raf: number
    if (!rootElement) return {
        init: () => {
            console.log(`Root element id = ${root} not found`)
        }
    }
    const canvas: HTMLElement = rootElement.querySelector('canvas[data-el="main"]')!
    if (!canvas) return {
        init: () => {
            console.log(`canvas[data-el="main"] not found`)
        }
    }
    const ttEl: HTMLElement = rootElement.querySelector('[data-el="tooltip"]')!
    if (!ttEl) return {
        init: () => {
            console.log(`div[data-el="tooltip"] not found`)
        }
    }
    const tip = Tooltip(ttEl)

    rootElement = document.getElementById(optionsContainer)!
    const textArea: HTMLElement = rootElement.querySelector('textarea[data-el="input-area"]')!
    const button: HTMLElement = rootElement.querySelector('button[data-el="button"]')!

    css(canvas, {
        width: WIDTH + 'px',
        height: HEIGHT + 'px'
    })
    canvas.width = DPI_WIDTH
    canvas.height = DPI_HEIGHT
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')

    const proxy = new Proxy({
        mouse: {
            x: 0,
            tooltip: {
                top: 0,
                left: 0
            }
        }
    }, {
        set(...args) {
            const result = Reflect.set(...args)
            raf = requestAnimationFrame(paint)
            return result
        }
    })

    canvas.addEventListener('mousemove', mouseMoveHandler)
    canvas.addEventListener('mouseleave', mouseLeaveHandler)
    button.addEventListener('click', buttonClickHandler)
    textArea.addEventListener('input', textAreaInputHandler)

    function mouseMoveHandler({clientX, clientY}: { clientX: number, clientY: number }) {
        const {left, top} = canvas.getBoundingClientRect()
        proxy.mouse = {
            x: (clientX - left) * 2,
            tooltip: {
                left: clientX - left,
                top: clientY - top
            }
        }
    }

    function mouseLeaveHandler() {
        proxy.mouse = null !
        tip.hide()
    }

    function textAreaInputHandler() {
        if (textArea.value.length > 0) {
            button.disabled = false
        } else if (textArea.value.length === 0 && !button.disabled) {
            button.disabled = true
        }
    }

    function buttonClickHandler() {
        const data = getGraphData(textArea.value)
        computeData(data)
    }

    //computing
    let xData: xDataType,
        branches: Array<Branch>,
        commitsInfo: CommitInfoType[],
        yRatio: number,
        xRatio: number,
        xPoints: xDataType
    computeData(data)

    function computeData(data: DataType) {
        [xData, branches, commitsInfo] = getData(data)
        yRatio = computeYRatio(VIEW_HEIGHT, branches.length)
        xRatio = computeXRatio(VIEW_WIDTH, Object.keys(xData).length)
        setYForBranches(yRatio, DPI_HEIGHT, PADDING, branches)
        xPoints = {}
        Object.keys(xData).map((key, idx) => {
            xPoints[key] = PADDING + idx * xRatio
        })
        paint()
    }

    function paint() {
        clear(ctx, DPI_WIDTH, DPI_HEIGHT)
        xAxis(ctx, Object.values(xData), PADDING, DPI_HEIGHT, DPI_WIDTH, xRatio, tip, proxy.mouse, commitsInfo)
        drawBranches(ctx, branches, xPoints)
        drawCommitPoints(ctx, branches, xPoints, CIRCLE_RADIUS)
    }

    return {
        init(): void {
            paint()
        },
        destroy(): void {
            cancelAnimationFrame(raf)
            canvas.removeEventListener('mousemove', mouseMoveHandler)
            canvas.removeEventListener('mouseleave', mouseLeaveHandler)
            button.removeEventListener('click', buttonClickHandler)
        }
    }
}