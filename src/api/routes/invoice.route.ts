import express, { Request, Response } from "express";
import InvoiceFacadeFactory from "../../modules/invoice/factory/invoice.facade.factory";

export const invoiceRoutes = express.Router();

invoiceRoutes.get("/:id", async (req: Request, res: Response) => {
  const facade = InvoiceFacadeFactory.create();
  
  try {
    const input = { id: req.params.id };
    const result = await facade.find(input);
    
    res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});
