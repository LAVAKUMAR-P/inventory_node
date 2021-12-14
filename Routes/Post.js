import express  from "express";
import { Addproduct, Addtocart, Allusers, Cartproducts, Checkout, Editproduct, Getproducts, Getproductsbyid, INC_DEC_PRODUCT, makeadmin, NonReturn, removeadmin, Removecartproduct, Removeproduct, Return, Returned } from "../Controllers/Admin.js";
import { Registeruser ,Login, Forgetpassword, Resetpassword} from "../Controllers/User.js";
import admincheck from "../Middleware/admincheck.js";
import authenticate from "../Middleware/check.js";


const router=express.Router();


router.post("/register",Registeruser);
router.post("/login",Login);
router.post("/addproduct",[authenticate],[admincheck],Addproduct);
router.post("/checkout",[authenticate],[admincheck],Checkout);
router.post("/makeadmin",[authenticate],[admincheck],makeadmin);
router.post("/removeadmin",[authenticate],[admincheck],removeadmin);
router.get("/getproducts",[authenticate],[admincheck],Getproducts);
router.get("/getallusers",[authenticate],[admincheck],Allusers);
router.get("/returnproducts",[authenticate],[admincheck],Return);
router.get("/noneedtoReturn",[authenticate],[admincheck],NonReturn);
router.put("/return",[authenticate],[admincheck],Returned);
router.get("/cartproducts",[authenticate],[admincheck],Cartproducts);
router.post("/addtocart",[authenticate],[admincheck],Addtocart);
router.delete("/removecart/:id",[authenticate],[admincheck],Removecartproduct);
router.get("/getproductbyid/:id",[authenticate],[admincheck],Getproductsbyid);
router.delete("/removeproduct/:id",[authenticate],[admincheck],Removeproduct);
router.put("/editproduct/:id",[authenticate],[admincheck],Editproduct);
router.put("/cartincrementdecrement",[authenticate],[admincheck],INC_DEC_PRODUCT);
router.post("/forgetpassword",Forgetpassword);
router.post('/reset/:userId/:token',Resetpassword);

export default router;