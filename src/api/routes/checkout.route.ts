import express, { Request, Response } from "express";
import CheckoutFacadeFactory from "../../modules/checkout/factory/checkout.factory";

export const checkoutRoutes = express.Router();

checkoutRoutes.post("/", async (req: Request, res: Response) => {
  const facade = CheckoutFacadeFactory.create();
  
  try {
    const input = {
      clientId: req.body.clientId,
      products: req.body.products.map((p: any) => ({
        productId: p.productId,
      })),
    };
    
    const result = await facade.placeOrder(input);
    
    res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});
