import {Branch} from './components/Branch'
import './types'

export function css(el: HTMLElement, styles = {}): void {
    Object.assign(el.style, styles)
}

export function toDate(timestamp: number, withDay?: boolean, withTime?: boolean) {
    const shortMonths: Array<string> = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ]
    const shortDays: Array<string> = [
        'Sun',
        'Mon',
        'Tue',
        'Web',
        'Thu',
        'Fri',
        'Sat'
    ]
    const date = new Date(timestamp)
    if (withDay) {
        return `${shortDays[date.getDay()]}, 
        ${shortMonths[date.getMonth()]} ${date.getDate()}`
    }
    if (withTime) {
        return `${shortMonths[date.getMonth()]}
                 ${date.getDate()} 
                 ${date.getHours()}
                 :${date.getMinutes() === 0 ? '00' : date.getMinutes()}`
    }
    return `${shortMonths[date.getMonth()]} ${date.getDate()}`
}

export function computeYRatio(height: number, branchCount: number) {
    return height / branchCount
}

export function computeXRatio(width: number, length: number) {
    return width / length - 2
}

export function getXYByHash(branches: Array<Branch>, hash: string): [string, number] {
    for (const branch of branches) {
        const y = branch.y
        for (const key in branch.commits) {
            if (branch.commits[key].includes(hash)) {
                return [key, y]
            }
        }
    }
    return ['', 0]
}

export function getYByHash(branches: Array<Branch>, hash: string): number {
    for (const branch of branches) {
        const y = branch.y
        if (branch.commits[hash]) {
            return y
        }
    }
    return 0
}

export function isOver(mouse: MouseType, x: number, length: number, dWidth: number) {
    if (!mouse) return false
    const width = dWidth / length
    return Math.abs(x - mouse.x) < width / 3
}

export function getData(data: DataType): [xDataType, Array<Branch>, CommitInfoType[]] {
    const commitsInfo: CommitInfoType[] = []
    const xData: xDataType = {}

    data.commits = data.commits.sort((prev, next): number => {
        return new Date(prev.time).getTime() < new Date(next.time).getTime() ? -1 : 1
    })
    data.commits.map(commit => {
        xData[commit.hash] = new Date(commit.time).getTime()
    })
    const branches: Array<Branch> = []
    for (const commit of data.commits) {
        pushCommitInfo(commitsInfo, commit, data)
        if (branches.length === 0) {
            branches.push(new Branch())
            pushCommitToBranch(branches[0], commit)
            continue
        }
        if (commit.previous.length === 1 || commit.previous.length === 2) {
            const hash: string = commit.previous[0]
            let pushed: boolean = false
            for (const branch of branches) {
                const keys = Object.keys(branch.commits)
                if (keys[keys.length - 1] === hash) {
                    pushCommitToBranch(branch, commit)
                    pushed = true
                    break
                }
            }
            if (!pushed) {
                branches.push(new Branch())
                pushCommitToBranch(branches[branches.length - 1], commit)
            }
        }
    }
    return [xData, branches, commitsInfo]
}

export function setYForBranches(yRatio: number, DPI_HEIGHT: number, PADDING: number, branches: Array<Branch>) {
    const length = branches.length
    for (const key in branches) {
        if (+key === 0) {
            branches[key].y = Math.round(length / 2)
            continue
        }
        const commits = branches[key].commits
        const keys = Object.keys(commits)
        const previewHash = commits[keys[0]][0]
        branches[key].y = findYForBranch(previewHash, branches)
    }
    for (const key in branches) {
        branches[key].y = Math.floor(DPI_HEIGHT - PADDING - branches[key].y * yRatio)
    }
}

function findYForBranch(previewHash: string, branches: Array<Branch>): number {
    let iteration = 1
    let findMin = false
    let findMax = false
    for (const parent of branches) {
        let minY = parent.y, maxY = parent.y

        if (parent.commits[previewHash]) {
            while (minY >= 0 && maxY < branches.length) {
                minY = parent.y - iteration
                maxY = parent.y + iteration
                findMax = findMin = false
                for (const branch of branches) {
                    if (branch.y === minY) findMin = true
                    if (branch.y === maxY) findMax = true
                }
                if (!findMin) return minY
                if (!findMax) return maxY
                iteration++
            }
        }
    }
    return 0
}

function pushCommitToBranch(branch: Branch, commit: CommitType) {
    branch.commits[commit.hash] = commit.previous
}

function pushCommitInfo(commitInfo: CommitInfoType[], commit: CommitType, data: DataType) {
    let tag: string = ''
    for (const tagEl of data.tags) {
        if (tagEl.commit === commit.hash) {
            tag = tagEl.tag
            break
        }
    }
    commitInfo.push({
        tmstp: new Date(commit.time).getTime(),
        hash: commit.hash,
        text: commit.text,
        tag
    })
}

// const json = {
//     "commits": [{"hash": "1", "text": "initial commit", "time": "2021-01-01T15:45:07Z", "previous": []}, {
//         "hash": "2",
//         "text": "commit 2",
//         "time": "2021-01-02T23:59:00Z",
//         "previous": ["1"]
//     }, {"hash": "3", "text": "commit 3", "time": "2021-01-05T11:11:11Z", "previous": ["1"]}, {
//         "hash": "4",
//         "text": "commit 4",
//         "time": "2021-01-06T11:11:11Z",
//         "previous": ["2", "3"]
//     }, {"hash": "5", "text": "commit 5", "time": "2021-01-07T11:11:11Z", "previous": ["4"]}, {
//         "hash": "6",
//         "text": "commit 6",
//         "time": "2021-01-07T11:18:11Z",
//         "previous": ["5"]
//     }, {"hash": "7", "text": "commit 7", "time": "2021-01-09T11:11:11Z", "previous": ["5"]}, {
//         "hash": "8",
//         "text": "commit 8",
//         "time": "2021-01-09T11:18:11Z",
//         "previous": ["6"]
//     }, {"hash": "9", "text": "commit 9", "time": "2021-01-09T12:25:11Z", "previous": ["7"]}, {
//         "hash": "10",
//         "text": "commit 10",
//         "time": "2021-01-09T12:45:11Z",
//         "previous": ["9"]
//     }, {"hash": "11", "text": "commit 11", "time": "2021-01-09T13:45:11Z", "previous": ["9"]}, {
//         "hash": "12",
//         "text": "commit 12",
//         "time": "2021-01-09T14:45:11Z",
//         "previous": ["10"]
//     }, {"hash": "13", "text": "commit 13", "time": "2021-01-09T14:55:11Z", "previous": ["11"]}, {
//         "hash": "14",
//         "text": "commit 14",
//         "time": "2021-01-09T15:55:11Z",
//         "previous": ["12", "13"]
//     }, {"hash": "15", "text": "commit 15", "time": "2021-01-09T16:10:11Z", "previous": ["8"]}, {
//         "hash": "16",
//         "text": "commit 16",
//         "time": "2021-01-10T10:00:00Z",
//         "previous": ["15", "14"]
//     }, {"hash": "17", "text": "commit 17", "time": "2021-01-10T12:15:11Z", "previous": ["16"]}, {
//         "hash": "18",
//         "text": "commit 18",
//         "time": "2021-01-10T13:15:11Z",
//         "previous": ["17"]
//     }, {"hash": "19", "text": "commit 19", "time": "2021-01-10T14:25:11Z", "previous": ["18"]},
//     , {"hash": "22", "text": "commit 22", "time": "2021-01-11T10:27:11Z", "previous": ["19"]},
//         {
//         "hash": "23",
//         "text": "commit 23",
//         "time": "2021-01-11T12:27:11Z",
//         "previous": ["22"]
//     }, {"hash": "24", "text": "commit 24", "time": "2021-01-11T15:20:00Z", "previous": ["23"]}],
//     "tags": [{"commit": "3", "tag": "branch/a"}, {"commit": "4", "tag": "rel/1x0"}, {
//         "commit": "7",
//         "tag": "branch/b"
//     }, {"commit": "11", "tag": "branch/c"}, {"commit": "14", "tag": "merge/c/b"}, {
//         "commit": "16",
//         "tag": "merge/b/a"
//     }, {"commit": "20", "tag": "branch/e"}, {
//         "commit": "22",
//         "tag": "merge/a/e"
//     }]
// }
