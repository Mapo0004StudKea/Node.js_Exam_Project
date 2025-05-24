import { Router } from "express";

const meRouter = Router();

meRouter.get("/me", (req, res) => {
  if (req.session.user) {
    res.send({ data: req.session.user });
  } else {
    res.status(401).send({ error: "Access denied" });
  }
});

export default meRouter;