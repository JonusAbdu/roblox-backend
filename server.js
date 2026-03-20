const express = require('express')
const axios = require('axios')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())


// Route to get game thumbnail
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


// Test route - just to make sure server works
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' })
})

// Route to get Roblox game stats by Universe ID
app.get('/api/game/:universeId', async (req, res) => {
  try {
    const { universeId } = req.params

    // Fetch game info from Roblox API
    const response = await axios.get(
      `https://games.roblox.com/v1/games?universeIds=${universeId}`
    )

    const game = response.data.data[0]

    // Send back only what we need
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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
// ```

// Hit **Ctrl + S** to save.

// ---

// ## Step 6 — Run the Server

// Go back to CMD and type:
// ```
// node server.js
// ```

// You should see:
// ```
// Server running on http://localhost:3000