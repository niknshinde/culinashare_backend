const express = require("express");
const Users = require("../models/Users");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Jwt_SECRET = 'NIKHILSHInde$23214'
const router = express.Router();


//i need to delete below /createuser section 





  router.post(
    "/createuser",
    [
      body("username", "Enter a valid username").isLength({ min: 3 }),
      body("email", "Enter a valid email").isEmail(),
      body("password", "Password must be at least 5 characters").isLength({
        min: 5,
      }),
    
    ],
    async (req, res) => {
      const result = validationResult(req);
  
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      } else {
        try {
          const existingUser = await Users.findOne({ email: req.body.email });
  
          if (existingUser) {
            return res.status(400).json({
              error: "A user with this email already exists",
            });
          } else {
            const { username, email, password } = req.body;
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);


            const createdUser = new Users({
                username: username,
                email: email,
                password: passwordHash,
                bookmarks: [], // Initialize as empty array
                createdRecipes: [] // Initialize as empty array
            });
  
            const savedUser = await createdUser.save();
            console.log("User saved successfully:", savedUser);
  
            const data = {
              user: {
                id: createdUser.id
              },
            };
            const authToken = jwt.sign(data, Jwt_SECRET);
  
            res.json(authToken);
          }
        } catch (error) {
          console.error("Error saving user:", error);
          res.status(500).json({ error: "Server Error" });
        }
      }
    }
  );



//login route

router.post("/login", [

    body("email", "Enter a valid email").isEmail(),
    body("password", "password can't we blank").exists(),

  ], (req,res)=>{
   const result2 = validationResult(req);
    if (!result2.isEmpty()) {
        return res.send({ errors: result2.array() });
      } else {
        

        (async () => {
     
            const {email,password} = req.body;
            let success = false;
        
            try {
                //checking is user with give email is present in database if 
                //i) find user in with given email in database
                let user = await Users.findOne({email});


                //ii)if user not exist then 
                if(!user){
                  success = false;
                    return res.status(400).json({error:"please try to login using right credentials"})
                }

                //ones user is present in database check it password matches with password provide by user during login 

                const passwordCompare = await bcrypt.compare(password,user.password)

                //if password is wrong
                if(!passwordCompare){
                  success = false;
                    return res.status(400).json({error:"please try to login using right credentials"})

                }
                
                //if password is right then we send user authentication

                const data = {
                    user:{
                        id : user.id,

                    }
                }

                let role = user.role;
                const authtoken = jwt.sign(data , Jwt_SECRET);
                success = true;
                res.json({success,authtoken ,role })
    



            } catch (error) {
                console.error("Error during login user:", error);
                res.status(500).json({ error: "Internal server error" }); 
            }
        })();
  } }
  )

  


module.exports = router;
