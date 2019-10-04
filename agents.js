const rp = require('request-promise-native')
const URL='https://helloomarket.com/api/agent.php'
const options = {url: URL, method:'get', json: true}
const _self = module.exports = {
  agents: async () => {
    try {
      // TODO : Not implemented
      throw new Error(JSON.stringify({
        reason: 'Method not yet implemented'
      }))
    } catch (error) {
      throw error
    }
  },
  find_agent: async (agent_id) => {
    try {
      // options.url=[URL,`?agent_id=${agent_id}`].join('')
      options.qs={
        agent_id: agent_id
      }
      let agent = await rp(options)
      return agent
      return agent
    } catch (error) {
      throw error
    }
  }

}