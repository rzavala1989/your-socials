import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from './AuthContext'
import Geolocation from 'react-native-geolocation-service'
import _ from 'lodash'

export const PostContext = React.createContext()
export const PostProvider = props => {
  // state
  const [feeds, setFeeds] = useState(null)
  const [posts, setPosts] = useState({})
  const [profiles, setProfiles] = useState(null)
  // context
  const auth = useContext(AuthContext)

  useEffect(() => {
    if (auth.user && auth.user.uid) {
      fetchFeeds()
      fetchProfile(auth.user.uid)
    }
  }, [auth])

  async function fetchHome() {
    try {
      const res = await auth.get('/home')
      console.log(res)
      const homePosts = await res.json()
      for (let post of homePosts) {
        posts[post._id] = post
      }
      setPosts({ ...posts })
      console.log(JSON.stringify(homePosts, null, 2))
      return homePosts
    } catch (err) {
      console.log('Error:fetchHome', err)
      return null
    }
  }

  // FEEDS fetch -> create
  async function fetchFeeds() {
    try {
      const res = await auth.get('/feed')
      if (res.ok) {
        const data = await res.json()
        const newFeeds = {}
        for (const feed of data) {
          newFeeds[feed._id] = feed
        }
        setFeeds(newFeeds)
        return data
      }
    } catch (err) {
      console.log('Error::PostContext::fetchFeed', err)
      return null
    }
  }

  async function fetchFeed(feedId) {
    try {
      const res = await auth.get(`/feed/${feedId}`)
      if (res.ok) {
        const data = await res.json()
        const newPosts = {}
        for (let post of data.posts) {
          newPosts[post._id] = post
        }
        if (posts) {
          setPosts({ ...posts, ...newPosts })
        } else {
          setPosts({ ...newPosts })
        }
        return data
      } else {
        console.log(
          'Error::PostContext::fetchFeed\nError fetching feed from server'
        )
        return null
      }
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async function createFeed(feed) {
    try {
      Geolocation.getCurrentPosition(
        async pos => {
          const { audience, title, description } = feed
          const location = {
            latitude: pos.coords.latitude + (Math.random() - 0.5) * 0.05,
            longitude: pos.coords.longitude + (Math.random() - 0.5) * 0.05
          }
          const res = await auth.get('/feed', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, audience, location })
          })
          if (res.ok) {
            const createdFeed = await res.json()
            setFeeds({ [createdFeed._id]: createdFeed, ...feeds })
            return createdFeed
          } else {
            console.log(
              'Error creating feed. Server responded with status code',
              res
            )
            return null
          }
        },
        err => {
          console.log('Geolocation error in createFeed', err)
          return null
        }
      )
    } catch (err) {
      console.log('Error::PostContext::createFeed', err)
      return null
    }
  }

  // Returns cached post fetching as default
  async function getPosts(feedId, postId) {
    try {
      if (!posts) return await fetchPosts(feedId, postId)
      const post = posts[postId]
      if (!post) {
        return await fetchPosts(feedId, postId)
      } else {
        const out = {}
        for (let commentId of post.comments) {
          const comment = posts[commentId]
          if (!comment) {
            return await fetchPosts(feedId, postId)
          } else {
            out[comment._id] = comment
          }
          return { post, comments: out }
        }
      }
    } catch (err) {
      console.log('Error:getPosts', err)
      return null
    }
  }

  async function fetchPosts(feedId, postId) {
    try {
      const res = await auth.get(`/feed/${feedId}/${postId}`)
      if (res.ok) {
        const data = await res.json()
        posts[data.post._id] = data.post
        if (data.comments && data.comments.length > 0)
          for (let post of data.comments) {
            posts[post._id] = post
          }
        setPosts(posts)
        return data
      } else {
        console.log(
          'Error::PostContext::fetchPosts\nError fetching post from server',
          res
        )
        return null
      }
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async function createPost(feedId, body, postId) {
    try {
      const url = postId ? `/feed/${feedId}/${postId}` : `/feed/${feedId}`
      const res = await auth.get(url, {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        const data = await res.json()
        if (!postId) {
          feeds[data.feed._id] = data.feed
          posts[data.post._id] = data.post
          setFeeds({ ...feeds })
          setPosts({ ...posts })
        } else {
          posts[data.post._id] = data.post
          posts[data.parent._id] = data.parent
          setPosts({ ...posts })
        }
        console.log('createPost:', JSON.stringify(data, null, 2))
        return data
      } else {
        console.log('Error creating post.', res)
        return null
      }
    } catch (err) {
      console.log(err)
      return null
    }
  }

  // Like a post
  async function setLikePost(id, like) {
    try {
      const res = await auth.get(`/posts/${id}/likes`, {
        method: 'post',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ like })
      })
      if (res.ok) {
        const data = await res.json()
        setPosts({ ...posts, [id]: data })
        return data
      } else {
        console.log('error posting like to server', res)
      }
    } catch (err) {
      console.log(err)
    }
  }

  // Profiles
  async function getProfile(id) {
    try {
      if (!profiles[id]) {
        try {
          const profile = await fetchProfile(id)
          return profile
        } catch (err) {
          return profiles[id]
        }
      } else {
        return profiles[id]
      }
    } catch (err) {
      console.log('Error::PostContext::getProfile', err)
      return null
    }
  }

  async function fetchProfile(id) {
    try {
      const res = await auth.get(`/profile/${id}`)
      const data = await res.json()
      console.log('fetchProfile:', JSON.stringify(data, null, 2))
      if (data.posts) {
        for (let post of data.posts) {
          posts[post._id] = post
        }
        setPosts({ ...posts })
        setProfiles({ ...profiles, [id]: data })
      }
      return data
    } catch (err) {
      console.log('Error::PostContext::fetchProfile', err)
      return null
    }
  }

  return (
    <PostContext.Provider
      value={{
        fetchHome,
        // feeds
        feeds,
        fetchFeeds,
        fetchFeed,
        createFeed,
        // posts
        posts,
        fetchPosts,
        getPosts,
        createPost,
        setLikePost,
        // profile
        profiles,
        fetchProfile,
        getProfile,
        setProfiles
      }}
    >
      {props.children}
    </PostContext.Provider>
  )
}

export const PostConsumer = PostContext.Consumer
