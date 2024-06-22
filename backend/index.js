const mongoose = require("mongoose");
const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const { error } = require("console");
const { type } = require("os");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname,"uploads")));

const uri = "mongodb+srv://MongoDb:1@reacteticaretdb.hn2xiwa.mongodb.net/ReactETicaretDb";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Database bağlantısı başarılı"))
    .catch(err => console.error("Database bağlantı hatası:", err));

// User Collection
const userSchema = new mongoose.Schema({
    _id: String,
    name: String,
    email: String,
    password: String,
    isAdmin:Boolean
});
const User = mongoose.model("User", userSchema);

// Product Collection
const productSchema = new mongoose.Schema({
    _id: String,
    name: String,
    stock: Number,
    price: Number,
    imageUrl: String,
    categoryName:String
});
const Product = mongoose.model("Product", productSchema);

// Basket Collection
const basketSchema = new mongoose.Schema({
    _id: String,
    productId: String,
    userId: String,
    quentity:{type:Number,default:1}
});
const Basket = mongoose.model("Basket", basketSchema);

// Order Collection
const orderSchema = new mongoose.Schema({
    _id: String,
    productId: String,
    userId: String,
    quentity:{type:Number,default:1}
});
const Order = mongoose.model("Order", orderSchema);

// Token
const secretKey = "Gizli anahtarım Gizli anahtarım Gizli anahtarım";
const options = {
    expiresIn: "1h"
};

// Register
app.post("/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = new User({
            _id: uuidv4(),
            name: name,
            email: email,
            password: password,
            isAdmin:false
        });

        await user.save();
        const payload = {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin:user.isAdmin
            }
        };
        const token = jwt.sign(payload, secretKey, options);
        res.json({ user: payload.user, token: token });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, password: password });

        if (!user) {
            return res.status(400).json({ message: "Mail adresi ya da şifre yanlış!" });
        }

        const payload = {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin:user.isAdmin
            }
        };
        const token = jwt.sign(payload, secretKey, options);
        res.json({ user: payload.user, token: token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
});

//Product List
app.get("/products",async(req,res)=>{
    try{
        const products=await Product.find({}).sort({name:1});
        res.json(products);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

//Dosya kayıt işlemi
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads/")
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+"-"+file.originalname)
    }
});

const upload=multer({storage:storage});

//Add Product
app.post("/products/add",upload.single("image"), async(req,res)=>{
    try{
        const{name,categoryName,stock,price}=req.body;
        const product=new Product({
            _id:uuidv4(),
            name:name,
            stock:stock,
            price:price,
            categoryName:categoryName,
            imageUrl:req.file.path
        });

        await product.save();
        res.json({message:"Ürün kaydı başarılı bir şekilde tamamlandı"});
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

//Remove Product
app.delete("/products/remove/:_id", async(req,res)=>{
    try{
        const{_id}=req.params;
        console.log("Silinen id:"+_id);
        await Product.findByIdAndDelete(_id);
        res.json({message:"Silme işlemi başarıyla gerçekleşti"});
    }catch (error){
        res.status(500).json({message:error.message});
    }
});

//Sepete ürün ekleme işlemi
app.post("/baskets/add",upload.single("image"), async(req,res)=>{
    try{
        const{productId,userId}=req.body;
        let basketItem= await Basket.findOne({userId,productId});
        if(basketItem){
            basketItem.quentity +=1;
            await basketItem.save();
        }else{
            basketItem =new Basket({
            _id:uuidv4(),
            userId:userId,
            productId:productId,
            quentity:1
        });
        await basketItem.save();
    }
        let product=await Product.findById(productId);
        product.stock=product.stock-1;
        await Product.findByIdAndUpdate(productId,product);

        res.json({message:"Ürün sepete başarılı bir şekilde eklendi"});
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

//Sepetteki ürünler
app.post("/baskets/getAll", async(req, res)=>{
    try {
        const{userId}=req.body;
        const baskets= await Basket.aggregate([
            {
                $match:{userId:userId}
            },
            {
                $lookup:{
                    from:"products",
                    localField:"productId",
                    foreignField:"_id",
                    as: "products"
                }
            }
        ]);

        res.json(baskets);
    } catch(error){
        res.status(500).json({message: error.message});
    }
});

//Sepettekü ürünü Silme
app.post("/baskets/remove",async(req,res)=>{
    try{
        const{_id}=req.body;
        const basket=await Basket.findById(_id);
        if(basket.quentity>1){
            basket.quentity -=1;
            await basket.save();
        }else{
            await Basket.findByIdAndDelete(_id);
        }
        const product=await Product.findById(basket.productId);
        product.stock+=1;
        await Product.findByIdAndUpdate(product._id,product);
        
        res.json({message:"Silme işlemi başarılı"});
    }catch{
        res.status(500).json({message:error.message});
    }
})

//Sipariş oluşturma
app.post("/orders/add",async(req,res)=>{
    try{
        const{userId}=req.body;
        const baskets=await Basket.find({userId:userId});
        if(!baskets|| baskets.length===0)
            {
                throw new Error("Sepet boş");
            }
        for(const basket of baskets){
            let order=new Order({
                _id:uuidv4(),
                productId:basket.productId,
                userId:userId,
                quentity:basket.quentity
            });
            await order.save();
            await Basket.findByIdAndDelete(basket._id);
        }
        res.status(200).json({message:"Sepet boşaltıldı"});
    }catch(error){
        console.log("error creating order:", error);
        res.status(500).json({message:error.message});
    }
})


//Sipariş Listesi
app.post("/orders",async(req,res)=>{
    try{
        const {userId}=req.body;
        const orders=await Order.aggregate([
            {
                $match:{userId:userId}
            },
            {
                $lookup:{
                    from:"products",
                    localField:"productId",
                    foreignField:"_id",
                    as:"products"
                }
            }
        ]);
        res.json(orders);
    }catch(error){
        res.status(500).json({message:error.message});
    }
})

const port = 5000;
app.listen(port, () => {
    console.log(`Uygulama http://localhost:${port} üzerinden ayakta!`);
});
















































// const mongoose=require("mongoose");
// const express=require("express");
// const app=express();
// const {v4:uuidv4, stringify}=require("uuid");
// const multer=require("multer");
// const cors=require("cors");
// const jwt=require("jsonwebtoken")


// app.use(cors());
// app.use(express.json());

// const uri="mongodb+srv://MongoDb:1@reacteticaretdb.hn2xiwa.mongodb.net/?retryWrites=true&w=majority&appName=ReactETicaretDb"
// mongoose.connect(uri).then(res=>{
//     console.log("Database bağlantısı başarılı");
// }).catch(err=>{
//     console.log(err.message)
// });

// //User Collection
// const userSchema=new mongoose.Schema({
//     _id:String,
//     name:String,
//     email:String,
//     password:String
// });

// const User=mongoose.model("User",userSchema);
// //User Collection
// //Product Collection
// const productSchema= new mongoose.Schema({
//     _id:String,
//     name:String,
//     stock:Number,
//     price:Number,
//     imageUrl:String
// });
// const Product = mongoose.model("Product",productSchema);
// //Product Collection
// //Basket Collection
// const basketSchema= new mongoose.Schema({
//     _id:String,
//     productId:String,
//     userId:String,
//     count:Number,
//     price:Number
// });
// const Basket = mongoose.model("Basket",basketSchema);
// //Basket Collection
// //Order Collection
// const orderSchema= new mongoose.Schema({
//     _id:String,
//     productId:String,
//     userId:String,
//     count:Number,
//     price:Number
// });
// const Order = mongoose.model("Order",orderSchema);
// //Order Collection

// //Token
// const secretKey="Gizli anahtarım Gizli anahtarım Gizli anahtarım";
// const options={
//     expiresIn:"1h"
// };
// //Token

// //register
// app.post("/auth/register",async (req, res)=>{
//     try{
//         const{name,email,password}=req.body;
//         let user= new User({
//             _id:uuidv4(),
//             name:name,
//             email:email,
//             password:password
//         });

//         await user.save();
//         const payload={
//             user:user
//         }
//         const token=jwt.sign(payload,secretKey,payload);
//         res.json({user:user,token:token})
//     }catch(error){
//         res.status(500).json({error:error.message})
//     }
// })

// //Login
// app.post("auth/login",async(req,res)=>{
//     try{
//         const{email,password}=req.body;
//         const users=await User.find({email:email,password:password});
//         if(users.length==0){
//             res.status(500).json({message:"Mail adresi ya da şifre yanlış!"});
//         }else{
//             const payload={
//                 user:users[0]
//             } 
//             const token=jwt.sign(payload,secretKey,options);
//             res.json({user:users[0],token:token})
//         }
//     }catch(error){

//     }
// });
// const port=5000;
// app.listen(5000,()=>{
//     console.log("Uygulama http://localhost:" + port + " üzerinden ayakta!");

// })