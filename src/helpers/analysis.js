import { knexInstance } from '../db'
import uuid from 'uuid/v4'

let state = {
  pubsub: null,
  currentCable: null,
  currentReport: null
}

async function setCable (cable) {
  state.currentCable = cable
}

async function setReport (report) {
  state.currentReport = report
}

async function setPubSub (pubsub) {
  state.pubsub = pubsub
}

async function createAnalysis (cable) {
  let { positionStart, positionEnd, reportId, cableId, imagePath } = cable
  if (!reportId) {
    reportId = state.currentReport.id
  }
  if (!cableId) {
    cableId = state.currentCable.id
  }
  try {
    let insertObj = {
      id: uuid(),
      position_start: positionStart,
      position_end: positionEnd,
      report_id: reportId,
      cable_id: cableId
    }
    let path = cable.image_path || imagePath
    if (path) {
      insertObj.image_path = path
    }
    let analysisId = await knexInstance('analysis')
      .returning('id')
      .insert(insertObj)
    state.pubsub.publish('analysisWasCreated', { analysisWasCreated: insertObj })
    return analysisId[0]
  } catch (err) {
    throw new Error(err.message)
  }
}

export {
  state,
  setCable,
  setReport,
  setPubSub,
  createAnalysis
}
