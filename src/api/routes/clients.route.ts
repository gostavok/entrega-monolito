import express, { Request, Response } from "express";
import ClientAdmFacadeFactory from "../../modules/client-adm/factory/client-adm.facade.factory";
import Address from "../../modules/@shared/domain/value-object/address";

export const clientRoutes = express.Router();

clientRoutes.post("/", async (req: Request, res: Response) => {
  const facade = ClientAdmFacadeFactory.create();
  
  try {
    const address = new Address(
      req.body.address.street,
      req.body.address.number,
      req.body.address.complement,
      req.body.address.city,
      req.body.address.state,
      req.body.address.zipCode
    );
    
    const input = {
      name: req.body.name,
      email: req.body.email,
      document: req.body.document,
      address: address,
    };
    
    await facade.add(input);
    
    res.status(201).send();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: errorMessage });
  }
});
