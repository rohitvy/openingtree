import request from 'request'
import { parse }  from '../PGNParser'
import {getTimeControlsArray, getTimeframeSteps, getSelectedTimeFrameData, isOpponentEloInSelectedRange} from '../util'
import * as Constants from '../Constants'
import {trackEvent} from '../Analytics'
import BaseUrlIterator from './BaseUrlIterator'

export default class PGNUrlIterator {

    constructor(url, lowerCasePlayerNames, playerColor, advancedFilters, ready, showError) {
        let playerColorHeaderName = playerColor === Constants.PLAYER_COLOR_WHITE? 'White': 'Black'
        new BaseUrlIterator(url, true, 
            (responseCode)=>{
                if (responseCode !== 200) {
                    showError('could not load url')
                }
            }, (error)=> {
                showError('could not connect to url')
                ready([], false)
            }, (pgnStringArray) => {
                let parsedPGNs = pgnStringArray.map((pgnString)=> {
                    try {

                        return parse(pgnString)[0]
                    } catch (e) {
                        console.log("failed to parse pgn", pgnString)
                        console.log(e)
                        trackEvent(Constants.EVENT_CATEGORY_ERROR, "parseFailedPGNUrl")
                        return null
                    }
                })
    
                let continueProcessing = ready(parsedPGNs.filter((game)=>{
                    if(!game) {
                        return false
                    }
                    if(!lowerCasePlayerNames.includes(game.headers[playerColorHeaderName].toLowerCase())) {
                        return false
                    }
                    return true
                }), true)
                return continueProcessing
            }, ()=>{
                ready([], false)
            })
    }

}
