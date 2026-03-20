const express = require('express')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

// In-memory games store
let games = []

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' })
})

// Get all saved games
app.get('/api/games', (req, res) => {
  res.json(games)
})

// Add a game
app.post('/api/games', async (req, res) => {
  const { universeId, robloxLink, discordLink } = req.body
  if (!universeId) return res.status(400).json({ error: 'universeId required' })

  // Check if already exists
  if (games.find(g => g.universeId === universeId)) {
    return res.status(400).json({ error: 'Game already added' })
  }

  try {
    const gameRes = await axios.get(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
    const game = gameRes.data.data[0]
    games.push({
      universeId,
      name: game.name,
      robloxLink: robloxLink || `https://www.roblox.com/games/${game.rootPlaceId}`,
      discordLink: discordLink || ''
    })
    res.json({ success: true, name: game.name })
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch game from Roblox' })
  }
})

// Remove a game
app.delete('/api/games/:universeId', (req, res) => {
  const { universeId } = req.params
  const before = games.length
  games = games.filter(g => g.universeId !== universeId)
  if (games.length === before) return res.status(404).json({ error: 'Game not found' })
  res.json({ success: true })
})

// Get game stats
app.get('/api/game/:universeId', async (req, res) => {
  try {
    const { universeId } = req.params
    const response = await axios.get(`https://games.roblox.com/v1/games?universeIds=${universeId}`)
    const game = response.data.data[0]
    res.json({
      name: game.name,
      description: game.description,
      visits: game.visits,
      ccu: game.playing,
      likes: game.likeCount,
      dislikes: game.dislikeCount,
      favorites: game.favoritedCount,
      thumbnail: `https://www.roblox.com/games/${game.rootPlaceId}`
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game data' })
  }
})

// Get thumbnail
app.get('/api/thumbnail/:universeId', async (req, res) => {
  try {
    const { universeId } = req.params
    const response = await axios.get(
      `https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${universeId}&size=768x432&format=Png&isCircular=false`
    )
    const url = response.data.data[0]?.thumbnails[0]?.imageUrl || null
    res.json({ url })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch thumbnail' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
