"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const router = (0, express_1.Router)();
router.get("/", user_1.root),
    router.post("/signup", user_1.signup);
router.post("/login", user_1.login);
