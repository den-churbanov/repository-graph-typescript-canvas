import {isOver, toDate, getYByHash, getXYByHash} from "./utils";
import {Branch} from "./components/Branch";

export function xAxis(ctx: CanvasRenderingContext2D,
                      xData: Array<number>,
                      PADDING: number,
                      DPI_HEIGHT: number,
                      DPI_WIDTH: number,
                      xRatio: number,
                      tip: TipType,
                      mouse: MouseType,
                      commitsInfo: CommitInfoType[]
) {
    const colsCount = 6
    const step = Math.round(xData.length / colsCount)
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.strokeStyle = '#9c9c9c'
    ctx.font = 'normal 24px Helvetica,sans-serif'
    ctx.fillStyle = '#50575a'

    for (let i = 0; i < xData.length; i++) {
        const x = PADDING + i * xRatio
        if (i % step === 0) {
            const text = toDate(xData[i])
            ctx.fillText(text, x, DPI_HEIGHT - 10)
        }

        if (isOver(mouse, x, xData.length, DPI_WIDTH)) {
            ctx.save()
            ctx.moveTo(x, PADDING / 2)
            ctx.lineTo(x, DPI_HEIGHT - PADDING)
            ctx.restore()
            tip.show(mouse.tooltip, {
                date: toDate(xData[i], false, true),
                items: commitsInfo.filter(info => info.tmstp === xData[i])
            })
        }
    }
    ctx.stroke()
    ctx.closePath()
}

export function drawCommitPoints(ctx: CanvasRenderingContext2D, branches: Array<Branch>, xPoints: xDataType, CIRCLE_RADIUS: number) {
    branches.map(branch => {
        let y = branch.y
        let color = branch.color
        for (const key in branch.commits) {
            const x = xPoints[key]
            circle(ctx, {x, y}, CIRCLE_RADIUS, color)
        }
    })
}

export function drawBranches(ctx: CanvasRenderingContext2D, branches: Array<Branch>, xPoints: xDataType) {
    let coords: Array<[number, number]> = []
    branches.map(branch => {
        let y = branch.y
        coords = []
        for (const key in branch.commits) {
            if (coords.length === 0 && branch.commits[key].length === 1) {
                const prevPointHash = branch.commits[key][0]
                const x = xPoints[prevPointHash]
                const y = getYByHash(branches, prevPointHash)
                coords.push([x, y])
            }
            const x = xPoints[key]
            coords.push([x, y])
        }
        const commitsKeys = Object.keys(branch.commits)
        const lastCommit = commitsKeys[commitsKeys.length - 1]
        const [key, yLast] = getXYByHash(branches, lastCommit)
        const x = xPoints[key]
        coords.push([x, yLast])
        line(ctx, coords, {color: branch.color})
    })
}

export function clear(ctx: CanvasRenderingContext2D, DPI_WIDTH: number, DPI_HEIGHT: number): void {
    ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT)
}

function line(ctx: CanvasRenderingContext2D, coords: Array<[number, number]>, {color}: OptionsType) {
    ctx.beginPath()
    ctx.lineWidth = 4
    ctx.strokeStyle = color
    for (const [x, y] of coords) {
        ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.closePath()
}

function circle(ctx: CanvasRenderingContext2D, {x, y}: CoordsType, radius: number, color: string) {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.fillStyle = '#fff'
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.closePath()
}
