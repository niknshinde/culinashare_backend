const express = require("express");
const Users = require("../models/Users");
const fetchuser = require("../middleware/fetchuser");

const router = express.Router();

// user contain routes related user like user
//  i)langauge changing 
//  ii)getting profile

router.put('/updateLanguage', fetchuser, async(req, res) => {
    const { language } = req.body;
  
   
  
    // Finding user and update language 
    let user = await Users.findById(req.user.id);
  
    if(!user){
      res.status(500).send("User not found");
    }
  
    try {
      let doc = await Users.findById(req.user.id);
      doc.currentLanguage = language; 
      let updatedDoc = await doc.save();
      res.status(200).json(updatedDoc);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  });



  router.get("/getUserProfile" , fetchuser , async(req,res)=>{
    try{
        //finding user and sending response 
      let doc = await Users.findById(req.user.id);
      res.status(200).json(doc);

      
    }catch(err){

        //handling error so website not crash 
      res.status(500).json({ error: err });

    }
});
module.exports = router;

