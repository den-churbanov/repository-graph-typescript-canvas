type CommitType = {
    hash: string,
    text: string | null,
    time: string | number,
    previous: Array<string>
}

type TagType = {
    commit: string,
    tag: string
}

type DataType = {
    commits: Array<CommitType>,
    tags: Array<TagType>
}

type GraphReturnType = {
    init: () => void,
    destroy?: () => void
}

type CommitInfoType = {
    hash: string,
    tmstp: number,
    text: string | null,
    tag: string,
}

type xDataType = {
    [key: string]: number
}

type ToolTipDataType = {
    date: string,
    items: CommitInfoType[]
}

type BranchCommitType = {
    [key: string]: Array<string>
}

type TipType = {
    show: (tip: ToolTipType, data: { date: string, items: CommitInfoType[] }) => void,
    hide: () => void
}

type ToolTipType = { top: number, left: number }

type MouseType = { x: number, tooltip: ToolTipType }

type OptionsType = {
    color: string
}

type CoordsType = { x: number, y: number }
