import { toWebRequest } from 'h3'

export function getWebRequest(event) {
   return event.web?.request || event.node?.req?.request || toWebRequest(event)
}
