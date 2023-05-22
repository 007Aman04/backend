import jwt from "jsonwebtoken";

const fetchUser = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        res.status(401).send("Please authenticate using a valid token");
    }

    try {
        const data = jwt.verify(token, "secretkey");
        req.id = data.id;
        next();
    } catch (error) {
        res.status(500).send("Internal error occured");
    }
};

export default fetchUser;
