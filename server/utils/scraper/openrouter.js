export async function openRouter({
   apiKey,
   model = 'nvidia/nemotron-3-super-120b-a12b:free',
   system,
   prompt,
   temperature = 0.2
}) {
   const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',

      headers: {
         'Authorization': `Bearer ${apiKey}`,
         'Content-Type': 'application/json'
      },

      body: JSON.stringify({
         model,
         messages: [{
            role: 'system',
            content: system
         }, {
            role: 'user',
            content: prompt
         }],
         temperature
      })
   })

   const data = await response.json()

   if (!response.ok) {
      throw new Error(
         data?.error?.message ||
         `OpenRouter request failed: ${response.status}`
      )
   }

   const message =
      data?.choices?.[0]?.message?.content?.trim()

   if (!message)
      throw new Error('OpenRouter returned an empty response')

   return message
}