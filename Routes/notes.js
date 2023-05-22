import express from "express";
const router = express.Router();
import { body, validationResult } from "express-validator";
import Note from "../models/Note.js";
import fetchUser from "../middlewares/fetchUser.js";

router.get("/fetchallnotes", fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.id });
        res.json({ notes });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
});

router.post(
    "/addnote",
    fetchUser,
    [
        body("title", "Enter a valid title").isLength({ min: 3 }),
        body("description", "Enter a valid description").isLength({ min: 5 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { title, description, tag } = req.body;
            const note = new Note({ title, description, tag, user: req.id });
            const savedNote = await note.save();

            res.json({ savedNote });
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Some error occured");
        }
    }
);

router.put("/updatenote/:id", fetchUser, async (req, res) => {
    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send("Not found!");

    if (note.user.toString() !== req.id)
        return res.status(401).send("Not allowed");

    note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
    );
    res.json({ note });
});

router.delete("/deletenote/:id", fetchUser, async (req, res) => {
    try {
        let note = await Note.findById(req.params.id);
        if (!note) return res.status(404).send("Not found!");

        if (note.user.toString() !== req.id)
            return res.status(401).send("Not allowed");

        note = await Note.findByIdAndDelete(req.params.id);
        res.send("Successfully deleted the note");
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
});

export default router;
