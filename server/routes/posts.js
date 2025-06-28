const express = require("express");
const router = express.Router();
const { auth } = require("../utils/index");
const Post = require("../models/Post");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Profile = require("../models/Profile");
/*
 1. POST /posts
 2. GET /posts
 3. GET /posts/:id
 4. PUT /posts/:id
 5. DELETE /posts/:id
 6. PUT /posts/like/:id
 7. PUT /posts/unlike/:id
 8. POST /posts/comment/:id
 9. DELETE /posts/comment/:id/:comment_id
*/

router.post(
  "/",
  auth,
  check("text", "Text is required").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save(); //save the post to the database
      res.json(post); //send the post to the client
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error", err.message);
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); //sort the posts by date in descending order
    res.json(posts); //send the posts to the client
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error", err.message);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //find the post by id req.params.id is the id of the post that is passed in the url
    if (!post) {
      return res.status(404).json({ msg: "Post not found !" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error,", err.message);
  }
});

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //find the post by id req.params.id is the id of the post that is passed in the url

    if (!post) {
      return res.status(404).json({ msg: "Post not found !" });
    }
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      //some is a method that checks if the user id is in the likes array
      return res.status(400).json({ msg: "Post already liked !" });
    }
    post.likes.unshift({ user: req.user.id }); //add the user id to the likes array
    await post.save(); //save the post to the database
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error,", err.message);
  }

  router.put("/unlike/:id", auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.status(404).json({ msg: "Post not found !" });
      }
      if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
        return res.status(400).json({ msg: "Post not liked !" });
      }
      post.likes = post.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
      await post.save();
      res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error,", err.message);
    }
  });
});

router.post(
  "/comment/:id",
  auth,
  check("text", "Text is required").notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id,
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error" + err.message);
    }
  }
);

router.delete(
  "/comment/:id/:comment_id",
  auth,

  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      const comment = post.comments.find((comment) => {
        return comment.id === req.params.comment_id;
      });

      if (!comment) {
        return res.status(404).json({ msg: "Comment does not exist !" });
      }

      if (comment.user.toString() !== req.user.id) {
        //to avoid delete others' comments
        return res.status(401).json({ msg: "User is not authorized !" });
      }

      post.comments = post.comments.filter((comment) => {
        return comment.id !== req.params.comment_id;
      });

      await post.save();
      return res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .send("Server Error for deleting the comment !" + err.message);
    }
  }
);

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found!" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User is NOT authorized to remove this post!" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ msg: "Post has been removed!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: " + err.message);
  }
});

module.exports = router;
