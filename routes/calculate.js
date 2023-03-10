const router = require('express').Router();
//const pool = require("../../database");
const Item = require('../schema/price');
const dotenv = require('dotenv');
dotenv.config();
const waf = JSON.parse(process.env.waf);

router.get('/p/:p', (req, res) => { 
	var limit =5;
	const page = req.params.p;
        //var page = parseInt(req.query.p);
	var skip = (page - 1) * limit;
    Item.find().skip(skip).limit(limit).exec((error, items) => {
        if (error) {
            res.status(400).send(error);
        } else {
            //let items_obj =  { test : items };
            let response = {
                "test": items
            }
           console.log(response);
            res.send(response).status(200);
        }
    });
});

router.post('/', async (req, res) => {
    try {
        // Get the array of item IDs from the request body
        const itemIds = req.body.id;

        // Find all items that match the given IDs
        const items = await Item.find({ id: { $in: itemIds } });

        // Send the total price in the response
        res.send(items);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post('/cal', async (req, res) => {
    try {
        // Get the array of item IDs from the request body
        const itemIds = req.body.id;

        // Find all items that match the given IDs
        const items = await Item.find({ id: { $in: itemIds } });

        // Calculate the total price
        let totalPrice = 0;
        items.forEach(item => {
            totalPrice += item.price;
        });

        // Send the total price in the response
        res.send({ totalPrice });
    } catch (err) {
        res.status(400).send(err);
    }
});


router.post('/create', async (req, res) => {

    //validate using joi(schema)
    //const {error} = validation.val_user.validate(req.body);
    //res.send(error.details);
    //res.send(error.details[0].message);
    //if(error) return res.status(400).send(error.details[0].message);
    const ids = req.body.id;
    try {
    const id = await Item.find({id: ids});

    if ((id.length > 0) && waf) {
        res.status(406).send('id already exits so try with another id');
        return;
    }
} catch (err) {
    res.status(500).send(err);
    return;
}
    try{
        const new_query=new Item(
            {
                id      :req.body.id,
                name    :req.body.name,
                image   :req.body.image,
                price   :req.body.price
            });
        

            let savequery = await new_query.save();
            res.send("product saved successfully");
            
        }catch(err)
        {
            res.status(406).send( err );
        }
});

router.post('/bulkCreate', async (req, res) => {
    try {

        const items = req.body;
        await Item.insertMany(items);
        res.send("Records inserted successfully.");
    } catch (err) {
        res.status(400).send(err);
    }
});



module.exports = router;
