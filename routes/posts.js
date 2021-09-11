const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
// create a post

router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost); 
    } catch (err) {
        return res.status(500).json(err);
    }
});
// update a post

router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); 
        if(post.userId === req.body.userId) {
            try {
                // console.log(req.params.id);
                await Post.findByIdAndUpdate(req.params.id, {$set: req.body});
                res.status(200).json("post updated successfully"); 
            } catch (err) {
                return res.status(500).json(err);
            }
        } else {
            return res.status(403).json("You can only update your post");
        }
    } catch (err) {
        return res.status(500).json(err); 
    }
});

// delete a post

router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id); 
        if(post.userId === req.body.userId) {
            try {
                // console.log(req.params.id);
                await Post.findByIdAndDelete(req.params.id);
                res.status(200).json("post deleted successfully"); 
            } catch (err) {
                return res.status(500).json(err);
            }
        } else {
            return res.status(403).json("You can only delete your own post");
        }
    } catch (err) {
        return res.status(500).json(err); 
    }
});

// like a post

router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)) {
            console.log("here");
            await post.updateOne({$push : {likes : req.body.userId}});
            res.status(200).json("Liked the post successfully");
        } else {
            await post.updateOne({$pull : {likes : req.body.userId}});
            res.status(200).json("disliked the post successfully");
        }
    } catch (err) {
        return res.status(500).json(err);
    }
});
// get a post

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
})
// get timeline posts

router.get("/timeline/all", async (req, res) => {
    // let postArray = [];
    console.log(req.body.userId);
    try {
        const currentUser = await User.findById(req.body.userId);
        const userPost = await Post.find({userId: currentUser._id});
        const friendsPosts = await Promise.all(
            currentUser.following.map( friendId => {
                return Post.find({userId: friendId});
            })
        );
        res.status(200).json(userPost.concat(...friendsPosts));
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;