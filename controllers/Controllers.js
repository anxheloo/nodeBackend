const Product = require("../models/Products")

module.exports = {
    createProduct: async(req,res)=>{

        try{
            const newProduct =new Product(req.body);
            await newProduct.save();
            res.status(200).json("product created successfully")
        }catch(error){
            console.error("Error creating product: ", error)
            res.status(500).json("failed to create the product")
        }
    },

    getAllProduct: async(req,res)=>{

        try{
            const products = await Product.find().sort({createdAt: -1})
            res.status(200).json(products)
        }catch(error){
            res.status(500).json("failed to get products")
        }
    },

    getProduct: async(req,res)=>{
        try{
            const product = await Product.findById(req.params.id) 
            res.status(200).json(product)
        }catch(error){
            res.status(500).json("failed to get the product")
        }
    },

    searchProduct: async(req,res)=>{
        try{
            const result = await Product.aggregate(
                [
                    {
                      $search: {
                        index: "ecommerce",
                        text: {
                          query: req.params.key,
                          path: {
                            wildcard: "*"
                          }
                        }
                      }
                    }
                  ]
            )

            res.status(200).json(result)
        }catch(error){
            res.status(500).json("failed to get the products")
        } 
    }
}