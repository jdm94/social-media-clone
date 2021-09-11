const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require('bcrypt');

// Update
router.put("/:id", async (req, res) => {
   if(req.body.userId === req.params.id || req.body.isAdmin) {
        if(req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch(err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {$set: req.body});
            res.status(200).json("User updated successfully");
        } catch(err) {
            return res.status(500).json(err);
        }
   } else {
       return res.status(403).json("You can update only your account");
   }
});

// Delete 
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin) {
         
         try {
             const user = await User.findByIdAndDelete(req.params.id);
             res.status(200).json("User deleted successfully");
         } catch(err) {
             return res.status(500).json(err);
         }
    } else {
        return res.status(403).json("You can delete only your account");
    }
 });

// Get a user

router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const {password, updatedAt, ...others} = user._doc;
        return res.status(200).json(others);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// Follow a user

router.put("/:id/follow", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const currentUser = await User.findById(req.body.userId);
            const userToBeFollowed = await User.findById(req.params.id);
            if(!userToBeFollowed.followers.includes(req.body.userId)) {
                await currentUser.updateOne({$push : {following: req.params.id}});
                await userToBeFollowed.updateOne({$push : {followers: req.body.userId}});
                res.status(200).json("User has been followed");
            } else {
                return res.status(403).json("You already follows this user");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You cannot follow yourself");
    }
});

// Unfollow 

router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const currentUser = await User.findById(req.body.userId);
            const userToBeFollowed = await User.findById(req.params.id);
            if(userToBeFollowed.followers.includes(req.body.userId)) {
                await currentUser.updateOne({$pull : {following: req.params.id}});
                await userToBeFollowed.updateOne({$pull : {followers: req.body.userId}});
                res.status(200).json("User has been unfollowed");
            } else {
                return res.status(403).json("You do not follow this user");
            }
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You cannot unfollow yourself");
    }
})


module.exports = router;