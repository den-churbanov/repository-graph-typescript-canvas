import {getGraphData} from './data'
import {Graph} from './graph/Graph'

const graphExample = Graph('graph','options', getGraphData())

graphExample.init()