import '../types'

export class Branch {
    public color: string
    readonly _commits: BranchCommitType
    private _y: number

    constructor() {
        this._y = -1
        this._commits = {}
        this.color = Branch.getRandomColor()
    }

    static getRandomColor(): string {
        return '#' + this.getColorSp() + this.getColorSp() + this.getColorSp()
    }

    static getColorSp(): string {
        let sp: string | number = Math.floor(Math.random() * (256))
        sp = sp.toString(16)
        if (sp.length === 1) sp = '0' + sp
        return sp
    }

    get commits() {
        return this._commits
    }

    set y(value: number) {
        this._y = value
    }

    get y() {
        return this._y
    }
}