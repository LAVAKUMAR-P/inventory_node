import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongodb from "mongodb";
import dotenv from "dotenv";
import sendEmail from "../Utils/Email.js";
import crypto from 'crypto';
const mongoClient = mongodb.MongoClient;
dotenv.config();
const URL =process.env.CONNECTION_URL ;
/*Register Employee*/

export const Registeruser = async (req, res) => {
    req.body.admin = false;
    try {
      //connect db
      let client = await mongoClient.connect(URL);
      //select db
      let db = client.db("inventory");
      let check = await db.collection("users").findOne({ emyid: req.body.emyid });
  
      if (!check) {
        //Hash password
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
  
        req.body.password = hash;
        //post db
        let data = await db.collection("users").insertOne(req.body);
        //close db
        await client.close();
        res.json({
          message: "user registered",
        });
      } else {
        // console.log("mail id already used");
        res.status(409).json({
          message: "Emp ID already Registered",
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        message: "Registeration failed",
      });
    }
  };

  /*Login Employee*/

export const Login = async (req, res) => {
  
    try {
       
      let client = await mongoClient.connect(URL);
     
      let db = client.db("inventory");
      // console.log(req.body.email);
      let user = await db.collection("users").findOne({ emyid: req.body.emyid });
      console.log(user);
      if (user) {
          
        let matchPassword = bcrypt.compareSync(req.body.password, user.password);
  
        if (matchPassword) {
          let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
          // console.log(user.Admin);
          res.json({
            message: true,
            token,
            unconditional: user.admin,
            username:user.Name
          });
        } else {
          res.status(401).json({
            message: "Username/Password is incorrect",
          });
        }
      } else {
        res.status(401).json({
          message: "Username/Password is incorrect",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(404).json({
        message: "Internal server error",
      });
    }
  };

  /*Forget password */

export const Forgetpassword = async (req, res) => {
 
  try {
    let client = await mongoClient.connect(URL);
    let db = client.db("inventory");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({ email: req.body.email });
      if (!user)
          return res.status(400).send("user with given email doesn't exist");
         
            let token = await db.collection("token").find({ email: req.body.email }).toArray();
          
      if (token.length===0) {
        // console.log("if runned");
        let index=await db.collection("token").createIndex( { "createdAt": 1 }, { expireAfterSeconds: 300 } )
        let token = await db.collection("token").insertOne({
        "createdAt": new Date(),
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
        email: req.body.email
        });
        token = await db.collection("token").find({ email: req.body.email }).toArray();
        // console.log(token);
        const link = `${process.env.BASE_URL}/resetpassword/${user._id}/${token[0].token}`;
        await sendEmail(user.email, "Password reset",`your rest password link : ${link}` );
      //  console.log(link);
       await client.close();
      res.status(200).send("password reset link sent to your email account"); 
      }
     else{
      res.status(404).json({
        message: "Internal server error",
      });
      await client.close();
     }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
    await client.close();
  }
};

/*Reset password */
export const Resetpassword = async (req, res) => {
 
  try {
    let client = await mongoClient.connect(URL);
    let db = client.db("inventory");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({_id:mongodb.ObjectId(req.params.userId)});
      if (!user)
          return res.status(400).send("invalid link or expired");
         
            let token = await db.collection("token").find({   userId: user._id,
              token: req.params.token,
            }).toArray();
            // console.log(token);
          
      if (token.length===1) {

        let salt = bcrypt.genSaltSync(10);
       let hash = bcrypt.hashSync(req.body.password, salt);
       req.body.password = hash;
       let data = await db.collection("users").findOneAndUpdate({_id:mongodb.ObjectId(req.params.userId)},{$set:{password:req.body.password}})
        let Delete=await db.collection("token").findOneAndDelete({   userId: user._id,
          token: req.params.token,
        })

        await client.close();
        return res.status(200).send("Reset sucessfull");
      }
     else if(token.length===0){
      await client.close();
      return res.status(406).send("Invalid link or expired");
     }
     else{
      res.status(404).json({
        message: "Internal server error",
      });
      await client.close();
     }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
    await client.close();
  }
};