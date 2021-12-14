import mongodb from "mongodb";
import dotenv from "dotenv";
const mongoClient = mongodb.MongoClient;
dotenv.config();
const URL = process.env.CONNECTION_URL;


/*product register */

export const Addproduct = async (req, res) => {
  try {
    //connect db
    let client = await mongoClient.connect(URL);
    //select db
    let db = client.db("inventory");
    let check = await db
      .collection("products")
      .findOne({ proid: req.body.proid });

    if (!check) {
      //post db
      let data = await db.collection("products").insertOne(req.body);
      //close db
      await client.close();
      res.json({
        message: "Product added",
      });
    } else {
      // console.log("mail id already used");
      res.status(409).json({
        message: "proId ID already Registered",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      message: "product adding process failed",
    });
  }
};

/*Remove products */
export const Removeproduct = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db
      .collection("products")
      .findOneAndDelete({ _id: mongodb.ObjectId(req.params.id) });

    //close the connection
    client.close();

    res.status(200).json({
      message: "sucess",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*Get all cart products*/
export const Getproducts = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db.collection("products").find().toArray();

    //close the connection
    client.close();

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*Get all cart products by id*/
export const Getproductsbyid = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    //close the connection
    client.close();

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*Inc and dec cart product */
export const INC_DEC_PRODUCT = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.body.proid) });
    let cart = await db
      .collection("cart")
      .findOne({ _id: mongodb.ObjectId(req.body.id) });

    if (req.body.work === "INC" && data && cart) {
      cart.count = cart.count + 1;
      if (cart.count <= data.quentity) {
        let update = await db
          .collection("cart")
          .findOneAndUpdate(
            { _id: mongodb.ObjectId(req.body.id) },
            { $set: cart }
          );
        res.status(200).json({
          message: "prodct edited",
        });
      } else {
        res.status(501).json({
          message: "prodct can't added",
        });
      }
    } else if (req.body.work === "DEC" && data && cart) {
      cart.count = cart.count - 1;
      if (cart.count <= data.quentity && cart.count >= 1) {
        let update = await db
          .collection("cart")
          .findOneAndUpdate(
            { _id: mongodb.ObjectId(req.body.id) },
            { $set: cart }
          );
        res.status(200).json({
          message: "prodct edited",
        });
      } else {
        res.status(501).json({
          message: "prodct can't decreased",
        });
      }
    } else {
      res.status(500).json({
        message: "something went wrong",
      });
    }
    //close the connection
    client.close();

    // res.status(200).json(data.address);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*EDIT PRODUCT */
export const Editproduct = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action

    let data = await db
      .collection("products")
      .findOneAndUpdate(
        { _id: mongodb.ObjectId(req.params.id) },
        {
          $set: {
            Name: req.body.Name,
            proid: req.body.proid,
            return: req.body.return,
            type: req.body.type,
            quentity: req.body.quentity,
            userid: req.body.userid,
          },
        }
      );

    //close the connection
    client.close();
    res.status(200).json({
      message: "prodct edited",
    });
    // res.status(200).json(data.address);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};
/*Get all product*/
export const Cartproducts = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db.collection("cart").find().toArray();

    //close the connection
    client.close();

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*Add to stage*/
export const Addtocart = async (req, res) => {
  try {
    // connect the database

    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select the collection and perform the action
    let data = await db
      .collection("cart")
      .find({ productid: mongodb.ObjectId(req.body.values) })
      .toArray();

    if (data.length === 0) {
      let product = await db
        .collection("products")
        .findOne({ _id: mongodb.ObjectId(req.body.values) });

      if (product.quentity >= 1) {
        product.count = 1;
        product.approvedPerson = req.body.userid;
        product.productid = product._id;
        delete product["_id"];
        let putdata = await db.collection("cart").insertOne(product);

        res.status(200).json({
          message: "Product Added",
        });
      } else {
        res.status(405).json({
          message: "Product not available",
        });
      }
      //close the connection
      await client.close();
    } else {
      res.status(405).json({
        message: "Product Can only remove or increase from cart",
      });

      await client.close();
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "something went wrong",
    });
  }
};

/*Remove cart product*/

export const Removecartproduct = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db
      .collection("cart")
      .findOneAndDelete({ productid: mongodb.ObjectId(req.params.id) });

    //close the connection
    client.close();

    res.status(200).json({
      message: "sucess",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*Check out*/
export const Checkout = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db.collection("cart").find().toArray();

    if (data.length > 0) {
      for await (const cart of data) {
        if (cart.return) {
          let order = await db
            .collection("return")
            .insertOne({
              Name: cart.Name,
              emyid: req.body.emyid,
              empname: req.body.Name,
              department: req.body.department,
              proid: cart.proid,
              return: cart.return,
              count: cart.count,
              approvedPerson: cart.approvedPerson,
              date: new Date().toLocaleDateString(),
              productid: cart.productid,
            });
          let find = await db
            .collection("products")
            .findOne({ _id: mongodb.ObjectId(cart.productid) });
          find.quentity = find.quentity - cart.count;
          let update = await db
            .collection("products")
            .findOneAndUpdate(
              { _id: mongodb.ObjectId(cart.productid) },
              { $set: { quentity: find.quentity } }
            );
        } else if (!cart.return) {
          let order = await db
            .collection("notreturn")
            .insertOne({
              Name: cart.Name,
              emyid: req.body.emyid,
              empname: req.body.Name,
              department: req.body.department,
              proid: cart.proid,
              return: cart.return,
              count: cart.count,
              approvedPerson: cart.approvedPerson,
              date: new Date().toLocaleDateString(),
              productid: cart.productid,
            });
          let find = await db
            .collection("products")
            .findOne({ _id: mongodb.ObjectId(cart.productid) });
          find.quentity = find.quentity - cart.count;
          let update = await db
            .collection("products")
            .findOneAndUpdate(
              { _id: mongodb.ObjectId(cart.productid) },
              { $set: { quentity: find.quentity } }
            );
        }
      }
      await db.collection("cart").deleteMany();

      res.status(200).json({
        message: "product added",
      });
      await client.close();
    } else {
      res.status(501).json({
        message: "something went wrong",
      });
    }
    //close the connection
    await client.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*not retured product*/
export const Return = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db.collection("return").find().toArray();

    res.status(200).json(data);
    //close the connection
    await client.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*no need to return product*/
export const NonReturn = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db.collection("notreturn").find().toArray();

    res.status(200).json(data);
    //close the connection
    await client.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*Returned */
export const Returned = async (req, res) => {
  console.log(req.body);
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db
      .collection("return")
      .findOne({ _id: mongodb.ObjectId(req.body.id) });
    let product = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.body.productid) });

    if (data && product) {
      product.quentity = product.quentity + data.count;
      let update = await db
        .collection("products")
        .findOneAndUpdate(
          { _id: mongodb.ObjectId(req.body.productid) },
          { $set: { quentity: product.quentity } }
        );

    let Delete=await db.collection("return").findOneAndDelete({ _id: mongodb.ObjectId(req.body.id) })

      res.status(200).json({
        message: "product REMOVED",
      });
      await client.close();
    } else {
      res.status(501).json({
        message: "something went wrong",
      });
    }
    //close the connection
    await client.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};


/*Make admin */
export const makeadmin=async(req,res)=>{
  try {
    // connect the database

let client = await mongoClient.connect(URL);

//select the db
let db = client.db("inventory");
console.log(req.body);
//select the collection and perform the action
let data = await db
    .collection("users")
    .findOne({ emyid: req.body.emyid })

if(data){
data.admin=true
let post = await db.collection("users").findOneAndUpdate({ emyid: req.body.emyid },{$set: data})
res.status(200).json({
  message: "User access changed",
 });
}else{
res.status(404).json({
  message: "something went wrong"
})
}



//close the connection
await client.close();


} catch (error) {
    console.log(error);
    res.status(404).json({
       message: "something went wrong"
   })
    //close the connection
await client.close();
}
}

/*Remove admin */

export const removeadmin=async(req,res)=>{
  try {
      // connect the database

 let client = await mongoClient.connect(URL);

 //select the db
 let db = client.db("inventory");
console.log(req.body);
 //select the collection and perform the action
 let data = await db
      .collection("users")
      .findOne({ emyid: req.body.emyid })
 console.log(data);
if(data){
  data.admin=false
  let post = await db.collection("users").findOneAndUpdate({ emyid: req.body.emyid },{$set: data})
  res.status(200).json({
    message: "User access changed",
  });
}else{
  res.status(404).json({
    message: "something went wrong"
})
}

 //close the connection
 await client.close();


  } catch (error) {
      console.log(error);
      res.status(404).json({
         message: "something went wrong"
     })
      //close the connection
 await client.close();
  }
}

/*GET ALL USERS */
export const Allusers = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("inventory");

    //select connect action and perform action
    let data = await db.collection("users").find().toArray();

    res.status(200).json(data);
    //close the connection
    await client.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

